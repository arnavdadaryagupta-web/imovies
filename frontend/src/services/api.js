const API_BASE = '/api';

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

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(name, email, password, phone) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password, phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: getHeaders(true),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data.user;
  },

  // Movies
  async getMovies(filters = {}) {
    const params = new URLSearchParams();
    if (filters.genre && filters.genre !== 'All') params.append('genre', filters.genre);
    if (filters.language && filters.language !== 'All') params.append('language', filters.language);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/movies?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch movies');
    return data.movies;
  },

  async getMovieById(id) {
    const res = await fetch(`${API_BASE}/movies/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Movie not found');
    return data.movie;
  },

  async createMovie(movieData) {
    const res = await fetch(`${API_BASE}/movies`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(movieData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add movie');
    return data;
  },

  async deleteMovie(id) {
    const res = await fetch(`${API_BASE}/movies/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete movie');
    return data;
  },

  // Showtimes & Theaters
  async getShowtimesForMovie(movieId, date) {
    const url = date
      ? `${API_BASE}/showtimes/movie/${movieId}?date=${date}`
      : `${API_BASE}/showtimes/movie/${movieId}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch showtimes');
    return data.showtimes;
  },

  async getShowtimeDetails(id) {
    const res = await fetch(`${API_BASE}/showtimes/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch showtime details');
    return data;
  },

  async createShowtime(showtimeData) {
    const res = await fetch(`${API_BASE}/showtimes`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(showtimeData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create showtime');
    return data;
  },

  async getTheaters() {
    const res = await fetch(`${API_BASE}/showtimes/theaters`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch theaters');
    return data.theaters;
  },

  // Bookings
  async createBooking(bookingPayload) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(bookingPayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to book tickets');
    return data;
  },

  async getMyBookings() {
    const res = await fetch(`${API_BASE}/bookings/my`, {
      headers: getHeaders(true),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch bookings');
    return data.bookings;
  },

  async cancelBooking(bookingId) {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: getHeaders(true),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to cancel booking');
    return data;
  },

  async validatePromo(code, amount) {
    const res = await fetch(`${API_BASE}/bookings/promo`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, amount }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid promo code');
    return data;
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders(true),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch admin stats');
    return data.stats;
  },
};
