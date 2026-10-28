import { INITIAL_MOCK_DATA } from './mockData';

const isStaticHosting =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('netlify.app') ||
    window.location.protocol === 'file:');

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const DB_VERSION = 'v2_20261028_dynamic';

// Local storage client fallback store
const getClientStore = () => {
  try {
    const version = localStorage.getItem('imovies_db_version');
    const raw = localStorage.getItem('imovies_client_db');
    if (!raw || version !== DB_VERSION) {
      localStorage.setItem('imovies_db_version', DB_VERSION);
      localStorage.setItem('imovies_client_db', JSON.stringify(INITIAL_MOCK_DATA));
      return INITIAL_MOCK_DATA;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_DATA;
  }
};

const saveClientStore = (data) => {
  try {
    localStorage.setItem('imovies_client_db', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
};

const getHeaders = (tokenRequired = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (tokenRequired) {
    const user = JSON.parse(localStorage.getItem('imovies_user') || 'null');
    if (user && user.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
  }
  return headers;
};

// Ensure dynamic showtimes exist for any active movie and date
const generateClientShowtimesForMovieDate = (store, movie, date) => {
  const theaters = store.theaters || [];
  if (theaters.length === 0) return [];

  const basePrice = movie.ticketPriceBase || 250;
  const templates = [
    { theaterIndex: 0, screenNumber: 1, startTime: '10:30 AM', format: 'IMAX 3D', priceOffset: 30 },
    { theaterIndex: 0, screenNumber: 1, startTime: '02:45 PM', format: 'IMAX 3D', priceOffset: 50 },
    { theaterIndex: 0, screenNumber: 1, startTime: '07:15 PM', format: 'IMAX 3D', priceOffset: 70 },
    { theaterIndex: 1, screenNumber: 1, startTime: '11:15 AM', format: '4DX', priceOffset: 60 },
    { theaterIndex: 1, screenNumber: 1, startTime: '04:00 PM', format: '4DX', priceOffset: 80 },
    { theaterIndex: 1, screenNumber: 2, startTime: '08:30 PM', format: '3D Dolby', priceOffset: 40 },
    { theaterIndex: 2, screenNumber: 1, startTime: '01:00 PM', format: '2D Dolby Atmos', priceOffset: 20 },
    { theaterIndex: 2, screenNumber: 1, startTime: '06:15 PM', format: '2D Dolby Atmos', priceOffset: 50 },
    { theaterIndex: 2, screenNumber: 1, startTime: '09:45 PM', format: '2D Dolby Atmos', priceOffset: 40 },
  ];

  const cleanDate = date.replace(/[^0-9]/g, '');
  const cleanMovie = movie._id.toString().slice(-4);
  const generated = [];

  store.showtimes = store.showtimes || [];

  templates.forEach((tpl, idx) => {
    const theater = theaters[tpl.theaterIndex % theaters.length];
    const newId = `st_${cleanMovie}_${theater._id.toString().slice(-4)}_${cleanDate}_${idx + 1}`;
    let existing = store.showtimes.find((s) => s._id === newId);
    if (!existing) {
      existing = {
        _id: newId,
        movie: movie._id,
        theater: theater._id,
        screenNumber: tpl.screenNumber,
        date: date,
        startTime: tpl.startTime,
        format: tpl.format,
        basePrice: basePrice + tpl.priceOffset,
        reservedSeats: ['D4', 'D5'],
        totalSeats: 80,
      };
      store.showtimes.push(existing);
    }
    generated.push(existing);
  });

  saveClientStore(store);
  return generated;
};

// Promo code list
const PROMO_CODES = {
  MOVIEPASS: { type: 'percentage', value: 15, maxDiscount: 150 },
  IMOVIES50: { type: 'flat', value: 50 },
  BLOCKBUSTER: { type: 'percentage', value: 20, maxDiscount: 200 },
};

export const api = {
  // Auth
  async login(email, password) {
    if (!isStaticHosting) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, using client store fallback');
      }
    }

    // Client store fallback
    const store = getClientStore();
    const user = store.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const token = 'mock_jwt_token_' + Date.now();
    return {
      success: true,
      message: 'Login successful (Client Demo Mode)',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    };
  },

  async register(name, email, password, phone) {
    if (!isStaticHosting) {
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ name, email, password, phone }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, using client store fallback');
      }
    }

    const store = getClientStore();
    const existing = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('User already exists with this email');
    }
    const newUser = {
      _id: 'usr_' + Date.now(),
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'user',
    };
    store.users.push(newUser);
    saveClientStore(store);

    return {
      success: true,
      message: 'Registration successful!',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
      token: 'mock_jwt_token_' + Date.now(),
    };
  },

  async getProfile() {
    const user = JSON.parse(localStorage.getItem('imovies_user') || 'null');
    if (!user) throw new Error('Not authenticated');
    return user;
  },

  // Movies
  async getMovies(filters = {}) {
    if (!isStaticHosting) {
      try {
        const params = new URLSearchParams();
        if (filters.genre && filters.genre !== 'All') params.append('genre', filters.genre);
        if (filters.language && filters.language !== 'All') params.append('language', filters.language);
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);

        const res = await fetch(`${API_BASE}/movies?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          return data.movies;
        }
      } catch (e) {
        console.warn('Backend unavailable, using client store fallback');
      }
    }

    const store = getClientStore();
    let list = store.movies || [];
    if (filters.genre && filters.genre !== 'All') {
      list = list.filter((m) => m.genre && m.genre.includes(filters.genre));
    }
    if (filters.language && filters.language !== 'All') {
      list = list.filter((m) => m.language && m.language.includes(filters.language));
    }
    if (filters.status === 'now-showing') {
      list = list.filter((m) => m.isNowShowing);
    }
    if (filters.status === 'upcoming') {
      list = list.filter((m) => m.isUpcoming);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(s) ||
          (m.genre && m.genre.some((g) => g.toLowerCase().includes(s)))
      );
    }
    return list;
  },

  async getMovieById(id) {
    if (!isStaticHosting) {
      try {
        const res = await fetch(`${API_BASE}/movies/${id}`);
        if (res.ok) {
          const data = await res.json();
          return data.movie;
        }
      } catch (e) {
        console.warn('Backend unavailable, using client store fallback');
      }
    }

    const store = getClientStore();
    const movie = store.movies.find((m) => m._id.toString() === id.toString());
    if (!movie) throw new Error('Movie not found');
    return movie;
  },

  async createMovie(movieData) {
    if (!isStaticHosting) {
      try {
        const res = await fetch(`${API_BASE}/movies`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify(movieData),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, using client store fallback');
      }
    }

    const store = getClientStore();
    const newMovie = {
      _id: 'mov_' + Date.now(),
      ...movieData,
      createdAt: new Date().toISOString(),
    };
    store.movies.push(newMovie);
    saveClientStore(store);
    return { success: true, movie: newMovie };
  },

  async deleteMovie(id) {
    if (!isStaticHosting) {
      try {
        const res = await fetch(`${API_BASE}/movies/${id}`, {
          method: 'DELETE',
          headers: getHeaders(true),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, using client store fallback');
      }
    }

    const store = getClientStore();
    store.movies = store.movies.filter((m) => m._id.toString() !== id.toString());
    saveClientStore(store);
    return { success: true };
  },

  // Showtimes & Theaters
  async getShowtimesForMovie(movieId, date) {
    if (!isStaticHosting) {
      try {
        const url = date
          ? `${API_BASE}/showtimes/movie/${movieId}?date=${date}`
          : `${API_BASE}/showtimes/movie/${movieId}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          return data.showtimes;
        }
      } catch (e) {
        console.warn('Backend unavailable, using client store fallback');
      }
    }

    const store = getClientStore();
    let list = store.showtimes.filter((s) => s.movie.toString() === movieId.toString());
    if (date) {
      list = list.filter((s) => s.date === date);
      if (list.length === 0) {
        const movie = store.movies.find((m) => m._id.toString() === movieId.toString());
        if (movie && !movie.isUpcoming) {
          list = generateClientShowtimesForMovieDate(store, movie, date);
        }
      }
    }
    return list.map((s) => ({
      ...s,
      availableSeats: (s.totalSeats || 80) - (s.reservedSeats ? s.reservedSeats.length : 0),
      theater: store.theaters.find((t) => t._id.toString() === s.theater.toString()) || {
        name: 'IMovies Cinema',
        address: 'Downtown',
      },
    }));
  },

  async getShowtimeDetails(id) {
    if (!isStaticHosting) {
      try {
        const res = await fetch(`${API_BASE}/showtimes/${id}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, using client store fallback');
      }
    }

    const store = getClientStore();
    let showtime = store.showtimes.find((s) => s._id.toString() === id.toString());
    if (!showtime && id.startsWith('st_')) {
      const parts = id.split('_');
      if (parts.length >= 5) {
        const cleanDate = parts[3];
        if (cleanDate.length === 8) {
          const formattedDate = `${cleanDate.slice(0, 4)}-${cleanDate.slice(4, 6)}-${cleanDate.slice(6, 8)}`;
          const matchingMovie = store.movies.find((m) => m._id.toString().slice(-4) === parts[1]);
          if (matchingMovie) {
            generateClientShowtimesForMovieDate(store, matchingMovie, formattedDate);
            showtime = store.showtimes.find((s) => s._id.toString() === id.toString());
          }
        }
      }
    }
    if (!showtime) throw new Error('Showtime not found');

    const movie = store.movies.find((m) => m._id.toString() === showtime.movie.toString());
    const theater = store.theaters.find((t) => t._id.toString() === showtime.theater.toString());

    const basePrice = showtime.basePrice || 250;
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const seatMatrix = rows.map((row) => {
      let tier = 'Standard';
      let price = basePrice;
      if (row === 'A' || row === 'B') {
        tier = 'VIP';
        price = Math.round(basePrice * 1.5);
      } else if (row === 'C' || row === 'D' || row === 'E') {
        tier = 'Premium';
        price = Math.round(basePrice * 1.2);
      }

      const seats = cols.map((col) => {
        const seatId = `${row}${col}`;
        const isReserved = showtime.reservedSeats ? showtime.reservedSeats.includes(seatId) : false;
        return {
          seatNumber: seatId,
          row,
          col,
          tier,
          price,
          isReserved,
        };
      });

      return { row, tier, price, seats };
    });

    return {
      success: true,
      showtime: {
        ...showtime,
        movie,
        theater,
      },
      seatMatrix,
    };
  },

  async createShowtime(showtimeData) {
    if (!isStaticHosting) {
      try {
        const res = await fetch(`${API_BASE}/showtimes`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify(showtimeData),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, using client store fallback');
      }
    }

    const store = getClientStore();
    const newShowtime = {
      _id: 'st_' + Date.now(),
      reservedSeats: [],
      totalSeats: 80,
      ...showtimeData,
    };
    store.showtimes.push(newShowtime);
    saveClientStore(store);
    return { success: true, showtime: newShowtime };
  },

  async getTheaters() {
    if (!isStaticHosting) {
      try {
        const res = await fetch(`${API_BASE}/showtimes/theaters`);
        if (res.ok) {
          const data = await res.json();
          return data.theaters;
        }
      } catch (e) {
        console.warn('Backend unavailable, using client store fallback');
      }
    }

    const store = getClientStore();
    return store.theaters || [];
  },

  // Bookings
  async createBooking(payload) {
    if (!isStaticHosting) {
      try {
        const res = await fetch(`${API_BASE}/bookings`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify(payload),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, using client store fallback');
      }
    }

    const store = getClientStore();
    const user = JSON.parse(localStorage.getItem('imovies_user') || 'null');
    const showtime = store.showtimes.find((s) => s._id.toString() === payload.showtimeId.toString());
    if (!showtime) throw new Error('Showtime not found');

    const seatCodes = payload.seats.map((s) => s.seatNumber);
    showtime.reservedSeats = showtime.reservedSeats || [];
    showtime.reservedSeats.push(...seatCodes);

    const baseTotal = payload.seats.reduce((sum, s) => sum + (s.price || 0), 0);
    const convenienceFee = 30;
    let discountAmount = 0;

    if (payload.promoCode && PROMO_CODES[payload.promoCode.toUpperCase()]) {
      const promo = PROMO_CODES[payload.promoCode.toUpperCase()];
      if (promo.type === 'percentage') {
        discountAmount = Math.min((baseTotal * promo.value) / 100, promo.maxDiscount);
      } else {
        discountAmount = Math.min(promo.value, baseTotal);
      }
    }

    const finalAmount = Math.max(0, baseTotal + convenienceFee - discountAmount);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `IMV-${new Date().getFullYear()}-${randomSuffix}`;

    const movie = store.movies.find((m) => m._id.toString() === payload.movieId?.toString());
    const theater = store.theaters.find((t) => t._id.toString() === payload.theaterId?.toString());

    const newBooking = {
      _id: 'bkg_' + Date.now(),
      bookingId,
      user: user ? user._id : 'guest',
      movie: movie || { title: 'Movie' },
      theater: theater || { name: 'IMovies Cinema' },
      showtime: showtime._id,
      seats: payload.seats,
      showDate: showtime.date,
      showTime: showtime.startTime,
      format: showtime.format || '2D',
      totalAmount: baseTotal,
      convenienceFee,
      discountAmount,
      finalAmount,
      promoCode: payload.promoCode,
      paymentMethod: payload.paymentMethod || 'UPI / QR',
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
      ticketQrData: `${bookingId}|${movie ? movie.title : 'Movie'}|${showtime.date}|Seats:${seatCodes.join(',')}|Amt:${finalAmount}`,
      createdAt: new Date().toISOString(),
    };

    store.bookings = store.bookings || [];
    store.bookings.unshift(newBooking);
    saveClientStore(store);

    return {
      success: true,
      message: 'Tickets booked successfully! Enjoy the show.',
      booking: newBooking,
    };
  },

  async getMyBookings() {
    if (!isStaticHosting) {
      try {
        const res = await fetch(`${API_BASE}/bookings/my`, {
          headers: getHeaders(true),
        });
        if (res.ok) {
          const data = await res.json();
          return data.bookings;
        }
      } catch (e) {
        console.warn('Backend unavailable, using client store fallback');
      }
    }

    const store = getClientStore();
    const user = JSON.parse(localStorage.getItem('imovies_user') || 'null');
    if (!user) return [];

    const bookings = store.bookings || [];
    return bookings
      .filter((b) => b.user === user._id || b.user === 'guest' || user.role === 'admin')
      .map((b) => ({
        ...b,
        movie: typeof b.movie === 'object' ? b.movie : store.movies.find((m) => m._id.toString() === b.movie?.toString()),
        theater: typeof b.theater === 'object' ? b.theater : store.theaters.find((t) => t._id.toString() === b.theater?.toString()),
      }));
  },

  async cancelBooking(bookingId) {
    if (!isStaticHosting) {
      try {
        const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
          method: 'PUT',
          headers: getHeaders(true),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, using client store fallback');
      }
    }

    const store = getClientStore();
    const booking = (store.bookings || []).find((b) => b._id.toString() === bookingId.toString());
    if (booking) {
      booking.bookingStatus = 'Cancelled';
      booking.paymentStatus = 'Refunded';

      // Release seats
      const showtime = store.showtimes.find((s) => s._id.toString() === booking.showtime?.toString());
      if (showtime && showtime.reservedSeats && booking.seats) {
        const toRelease = booking.seats.map((s) => s.seatNumber);
        showtime.reservedSeats = showtime.reservedSeats.filter((seat) => !toRelease.includes(seat));
      }
      saveClientStore(store);
    }
    return { success: true };
  },

  async validatePromo(code, amount) {
    const promo = PROMO_CODES[code.toUpperCase()];
    if (!promo) {
      throw new Error('Invalid or expired coupon code');
    }

    let discount = 0;
    if (promo.type === 'percentage') {
      discount = Math.min((amount * promo.value) / 100, promo.maxDiscount);
    } else {
      discount = Math.min(promo.value, amount);
    }

    return {
      success: true,
      message: `Promo code ${code.toUpperCase()} applied!`,
      discount: Math.round(discount),
    };
  },

  async getAdminStats() {
    if (!isStaticHosting) {
      try {
        const res = await fetch(`${API_BASE}/admin/stats`, {
          headers: getHeaders(true),
        });
        if (res.ok) {
          const data = await res.json();
          return data.stats;
        }
      } catch (e) {
        console.warn('Backend unavailable, using client store fallback');
      }
    }

    const store = getClientStore();
    const bookings = store.bookings || [];
    const confirmed = bookings.filter((b) => b.bookingStatus === 'Confirmed');
    const totalRevenue = confirmed.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
    const totalTicketsSold = confirmed.reduce((sum, b) => sum + (b.seats ? b.seats.length : 0), 0);

    return {
      totalUsers: (store.users || []).length,
      totalMovies: (store.movies || []).length,
      totalBookings: bookings.length,
      totalRevenue,
      totalTicketsSold,
      recentBookings: bookings.slice(0, 6).map((b) => ({
        ...b,
        movie: typeof b.movie === 'object' ? b.movie : store.movies.find((m) => m._id === b.movie),
        user: store.users.find((u) => u._id === b.user) || { name: 'Patron', email: 'patron@example.com' },
      })),
    };
  },
};
