const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { getSeedData } = require('../data/seedData');

// Mongoose Models
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

const DB_FILE = path.join(__dirname, '..', 'data', 'local_db.json');

// Ensure data folder exists
const ensureDataFolder = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Check if Mongoose is ready
const isMongoReady = () => mongoose.connection.readyState === 1;

// Read JSON DB
const readJSONDb = async () => {
  ensureDataFolder();
  if (!fs.existsSync(DB_FILE)) {
    const seed = await getSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    const seed = await getSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
};

// Write JSON DB
const writeJSONDb = (data) => {
  ensureDataFolder();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// Auto seed MongoDB if connected and empty
const autoSeedMongoIfEmpty = async () => {
  if (!isMongoReady()) return;
  try {
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('[Storage] Empty MongoDB detected. Seeding initial cinema data...');
      const seed = await getSeedData();
      await User.insertMany(seed.users);
      await Movie.insertMany(seed.movies);
      await Theater.insertMany(seed.theaters);
      await Showtime.insertMany(seed.showtimes);
      await Booking.insertMany(seed.bookings);
      console.log('[Storage] MongoDB seeded successfully!');
    }
  } catch (err) {
    console.warn('[Storage] MongoDB auto-seed check notice:', err.message);
  }
};

// Users
const findUserByEmail = async (email) => {
  if (isMongoReady()) {
    return await User.findOne({ email: email.toLowerCase() });
  }
  const db = await readJSONDb();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
};

const findUserById = async (id) => {
  if (isMongoReady()) {
    return await User.findById(id).select('-password');
  }
  const db = await readJSONDb();
  const u = db.users.find((u) => u._id.toString() === id.toString());
  if (!u) return null;
  const { password, ...safeUser } = u;
  return safeUser;
};

const createUser = async (userData) => {
  if (isMongoReady()) {
    const user = new User(userData);
    return await user.save();
  }
  const db = await readJSONDb();
  const newUser = {
    _id: 'usr_' + Date.now() + Math.random().toString(36).substring(2, 6),
    ...userData,
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  writeJSONDb(db);
  return newUser;
};

// Movies
const getAllMovies = async (filter = {}) => {
  if (isMongoReady()) {
    let query = {};
    if (filter.genre) query.genre = filter.genre;
    if (filter.language) query.language = filter.language;
    if (filter.isNowShowing !== undefined) query.isNowShowing = filter.isNowShowing;
    if (filter.isUpcoming !== undefined) query.isUpcoming = filter.isUpcoming;
    if (filter.search) {
      query.title = { $regex: filter.search, $options: 'i' };
    }
    return await Movie.find(query).sort({ releaseDate: -1 });
  }
  const db = await readJSONDb();
  let list = db.movies || [];
  if (filter.genre) {
    list = list.filter((m) => m.genre && m.genre.includes(filter.genre));
  }
  if (filter.language) {
    list = list.filter((m) => m.language && m.language.includes(filter.language));
  }
  if (filter.isNowShowing !== undefined) {
    list = list.filter((m) => m.isNowShowing === filter.isNowShowing);
  }
  if (filter.isUpcoming !== undefined) {
    list = list.filter((m) => m.isUpcoming === filter.isUpcoming);
  }
  if (filter.search) {
    const s = filter.search.toLowerCase();
    list = list.filter((m) => m.title.toLowerCase().includes(s) || (m.genre && m.genre.some((g) => g.toLowerCase().includes(s))));
  }
  return list;
};

const getMovieById = async (id) => {
  if (isMongoReady()) {
    return await Movie.findById(id);
  }
  const db = await readJSONDb();
  return db.movies.find((m) => m._id.toString() === id.toString()) || null;
};

const createMovie = async (movieData) => {
  if (isMongoReady()) {
    const movie = new Movie(movieData);
    return await movie.save();
  }
  const db = await readJSONDb();
  const newMovie = {
    _id: 'mov_' + Date.now(),
    ...movieData,
    createdAt: new Date().toISOString(),
  };
  db.movies.push(newMovie);
  writeJSONDb(db);
  return newMovie;
};

const updateMovie = async (id, movieData) => {
  if (isMongoReady()) {
    return await Movie.findByIdAndUpdate(id, movieData, { new: true });
  }
  const db = await readJSONDb();
  const idx = db.movies.findIndex((m) => m._id.toString() === id.toString());
  if (idx === -1) return null;
  db.movies[idx] = { ...db.movies[idx], ...movieData, updatedAt: new Date().toISOString() };
  writeJSONDb(db);
  return db.movies[idx];
};

const deleteMovie = async (id) => {
  if (isMongoReady()) {
    return await Movie.findByIdAndDelete(id);
  }
  const db = await readJSONDb();
  const idx = db.movies.findIndex((m) => m._id.toString() === id.toString());
  if (idx === -1) return null;
  const deleted = db.movies.splice(idx, 1)[0];
  writeJSONDb(db);
  return deleted;
};

// Theaters
const getAllTheaters = async () => {
  if (isMongoReady()) {
    return await Theater.find({});
  }
  const db = await readJSONDb();
  return db.theaters || [];
};

const getTheaterById = async (id) => {
  if (isMongoReady()) {
    return await Theater.findById(id);
  }
  const db = await readJSONDb();
  return db.theaters.find((t) => t._id.toString() === id.toString()) || null;
};

const createTheater = async (theaterData) => {
  if (isMongoReady()) {
    const theater = new Theater(theaterData);
    return await theater.save();
  }
  const db = await readJSONDb();
  const newTheater = {
    _id: 'th_' + Date.now(),
    ...theaterData,
    createdAt: new Date().toISOString(),
  };
  db.theaters.push(newTheater);
  writeJSONDb(db);
  return newTheater;
};

// Ensure showtimes exist for any active movie and date
const ensureShowtimesForMovieDate = (db, movieId, date) => {
  const movie = db.movies.find((m) => m._id.toString() === movieId.toString());
  if (!movie || movie.isUpcoming) return [];

  const theaters = db.theaters || [];
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

  const generated = [];
  const cleanDate = date.replace(/[^0-9]/g, '');
  const cleanMovie = movieId.toString().slice(-4);

  templates.forEach((tpl, idx) => {
    const theater = theaters[tpl.theaterIndex % theaters.length];
    const newId = `st_${cleanMovie}_${theater._id.toString().slice(-4)}_${cleanDate}_${idx + 1}`;
    let existing = db.showtimes.find((s) => s._id === newId);
    if (!existing) {
      existing = {
        _id: newId,
        movie: movie._id,
        theater: theater._id,
        screenNumber: tpl.screenNumber,
        date: date,
        startTime: tpl.startTime,
        format: tpl.format,
        language: Array.isArray(movie.language) ? movie.language[0] : 'English',
        basePrice: basePrice + tpl.priceOffset,
        reservedSeats: ['D4', 'D5'],
        totalSeats: 80,
        createdAt: new Date().toISOString(),
      };
      db.showtimes.push(existing);
    }
    generated.push(existing);
  });

  writeJSONDb(db);
  return generated;
};

// Showtimes
const getShowtimesForMovie = async (movieId, date) => {
  if (isMongoReady()) {
    let query = { movie: movieId };
    if (date) query.date = date;
    let list = await Showtime.find(query).populate('theater').populate('movie');
    if (list.length === 0 && date) {
      const movie = await Movie.findById(movieId);
      if (movie && !movie.isUpcoming) {
        const theaters = await Theater.find();
        if (theaters.length > 0) {
          const templates = [
            { theaterIndex: 0, screenNumber: 1, startTime: '10:30 AM', format: 'IMAX 3D', priceOffset: 30 },
            { theaterIndex: 0, screenNumber: 1, startTime: '02:45 PM', format: 'IMAX 3D', priceOffset: 50 },
            { theaterIndex: 0, screenNumber: 1, startTime: '07:15 PM', format: 'IMAX 3D', priceOffset: 70 },
            { theaterIndex: 1, screenNumber: 1, startTime: '11:15 AM', format: '4DX', priceOffset: 60 },
            { theaterIndex: 1, screenNumber: 1, startTime: '04:00 PM', format: '4DX', priceOffset: 80 },
            { theaterIndex: 1, screenNumber: 2, startTime: '08:30 PM', format: '3D Dolby', priceOffset: 40 },
          ];
          for (const tpl of templates) {
            const th = theaters[tpl.theaterIndex % theaters.length];
            await Showtime.create({
              movie: movie._id,
              theater: th._id,
              screenNumber: tpl.screenNumber,
              date: date,
              startTime: tpl.startTime,
              format: tpl.format,
              language: Array.isArray(movie.language) ? movie.language[0] : 'English',
              basePrice: (movie.ticketPriceBase || 250) + tpl.priceOffset,
              reservedSeats: ['D4', 'D5'],
              totalSeats: 80,
            });
          }
          list = await Showtime.find(query).populate('theater').populate('movie');
        }
      }
    }
    return list;
  }

  const db = await readJSONDb();
  let list = db.showtimes.filter((s) => s.movie.toString() === movieId.toString());
  if (date) {
    list = list.filter((s) => s.date === date);
    if (list.length === 0) {
      list = ensureShowtimesForMovieDate(db, movieId, date);
    }
  }
  return list.map((s) => ({
    ...s,
    availableSeats: (s.totalSeats || 80) - (s.reservedSeats ? s.reservedSeats.length : 0),
    movie: db.movies.find((m) => m._id.toString() === s.movie.toString()),
    theater: db.theaters.find((t) => t._id.toString() === s.theater.toString()),
  }));
};

const getShowtimeById = async (id) => {
  if (isMongoReady()) {
    return await Showtime.findById(id).populate('theater').populate('movie');
  }
  const db = await readJSONDb();
  let s = db.showtimes.find((item) => item._id.toString() === id.toString());
  if (!s && id.startsWith('st_')) {
    const parts = id.split('_');
    if (parts.length >= 5) {
      const cleanDate = parts[3];
      if (cleanDate.length === 8) {
        const formattedDate = `${cleanDate.slice(0, 4)}-${cleanDate.slice(4, 6)}-${cleanDate.slice(6, 8)}`;
        const matchingMovie = db.movies.find((m) => m._id.toString().slice(-4) === parts[1]);
        if (matchingMovie) {
          ensureShowtimesForMovieDate(db, matchingMovie._id, formattedDate);
          s = db.showtimes.find((item) => item._id.toString() === id.toString());
        }
      }
    }
  }
  if (!s) return null;
  return {
    ...s,
    availableSeats: (s.totalSeats || 80) - (s.reservedSeats ? s.reservedSeats.length : 0),
    movie: db.movies.find((m) => m._id.toString() === s.movie.toString()),
    theater: db.theaters.find((t) => t._id.toString() === s.theater.toString()),
  };
};

const createShowtime = async (showtimeData) => {
  if (isMongoReady()) {
    const showtime = new Showtime(showtimeData);
    return await showtime.save();
  }
  const db = await readJSONDb();
  const newShowtime = {
    _id: 'st_' + Date.now(),
    reservedSeats: [],
    totalSeats: 80,
    ...showtimeData,
    createdAt: new Date().toISOString(),
  };
  db.showtimes.push(newShowtime);
  writeJSONDb(db);
  return newShowtime;
};

const reserveSeatsInShowtime = async (showtimeId, seatsToReserve) => {
  if (isMongoReady()) {
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) throw new Error('Showtime not found');
    
    // Check if any seat is already booked
    const conflict = seatsToReserve.some((seat) => showtime.reservedSeats.includes(seat));
    if (conflict) {
      throw new Error('One or more selected seats are already reserved. Please choose different seats.');
    }
    
    showtime.reservedSeats.push(...seatsToReserve);
    await showtime.save();
    return showtime;
  }
  
  const db = await readJSONDb();
  const s = db.showtimes.find((st) => st._id.toString() === showtimeId.toString());
  if (!s) throw new Error('Showtime not found');
  
  s.reservedSeats = s.reservedSeats || [];
  const conflict = seatsToReserve.some((seat) => s.reservedSeats.includes(seat));
  if (conflict) {
    throw new Error('One or more selected seats are already reserved. Please choose different seats.');
  }
  
  s.reservedSeats.push(...seatsToReserve);
  writeJSONDb(db);
  return s;
};

const releaseSeatsInShowtime = async (showtimeId, seatsToRelease) => {
  if (isMongoReady()) {
    const showtime = await Showtime.findById(showtimeId);
    if (showtime) {
      showtime.reservedSeats = showtime.reservedSeats.filter((seat) => !seatsToRelease.includes(seat));
      await showtime.save();
    }
    return;
  }
  const db = await readJSONDb();
  const s = db.showtimes.find((st) => st._id.toString() === showtimeId.toString());
  if (s && s.reservedSeats) {
    s.reservedSeats = s.reservedSeats.filter((seat) => !seatsToRelease.includes(seat));
    writeJSONDb(db);
  }
};

// Bookings
const createBooking = async (bookingData) => {
  if (isMongoReady()) {
    const booking = new Booking(bookingData);
    return await booking.save();
  }
  const db = await readJSONDb();
  const newBooking = {
    _id: 'bkg_' + Date.now(),
    ...bookingData,
    createdAt: new Date().toISOString(),
  };
  db.bookings.push(newBooking);
  writeJSONDb(db);
  return newBooking;
};

const getBookingsByUser = async (userId) => {
  if (isMongoReady()) {
    return await Booking.find({ user: userId })
      .populate('movie')
      .populate('theater')
      .populate('showtime')
      .sort({ createdAt: -1 });
  }
  const db = await readJSONDb();
  const userBookings = db.bookings.filter((b) => b.user.toString() === userId.toString());
  return userBookings
    .map((b) => ({
      ...b,
      movie: db.movies.find((m) => m._id.toString() === b.movie.toString()),
      theater: db.theaters.find((t) => t._id.toString() === b.theater.toString()),
      showtime: db.showtimes.find((s) => s._id.toString() === b.showtime.toString()),
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const getBookingById = async (id) => {
  if (isMongoReady()) {
    return await Booking.findById(id).populate('movie').populate('theater').populate('showtime').populate('user', '-password');
  }
  const db = await readJSONDb();
  const b = db.bookings.find((item) => item._id.toString() === id.toString() || item.bookingId === id);
  if (!b) return null;
  return {
    ...b,
    movie: db.movies.find((m) => m._id.toString() === b.movie.toString()),
    theater: db.theaters.find((t) => t._id.toString() === b.theater.toString()),
    showtime: db.showtimes.find((s) => s._id.toString() === b.showtime.toString()),
    user: db.users.find((u) => u._id.toString() === b.user.toString()),
  };
};

const cancelBooking = async (bookingId, userId) => {
  let booking;
  let showtimeId;
  let seatsToRelease = [];

  if (isMongoReady()) {
    booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) throw new Error('Booking not found or unauthorized');
    if (booking.bookingStatus === 'Cancelled') throw new Error('Booking is already cancelled');

    booking.bookingStatus = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();
    showtimeId = booking.showtime;
    seatsToRelease = booking.seats.map((s) => s.seatNumber);
    await releaseSeatsInShowtime(showtimeId, seatsToRelease);
    return booking;
  }

  const db = await readJSONDb();
  booking = db.bookings.find((b) => b._id.toString() === bookingId.toString() && b.user.toString() === userId.toString());
  if (!booking) throw new Error('Booking not found or unauthorized');
  if (booking.bookingStatus === 'Cancelled') throw new Error('Booking is already cancelled');

  booking.bookingStatus = 'Cancelled';
  booking.paymentStatus = 'Refunded';
  showtimeId = booking.showtime;
  seatsToRelease = booking.seats.map((s) => s.seatNumber);
  writeJSONDb(db);
  await releaseSeatsInShowtime(showtimeId, seatsToRelease);
  return booking;
};

// Admin metrics
const getAdminStats = async () => {
  if (isMongoReady()) {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMovies = await Movie.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.find({ bookingStatus: 'Confirmed' });
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
    const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + (b.seats ? b.seats.length : 0), 0);
    const recentBookings = await Booking.find()
      .populate('movie', 'title')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);
    return {
      totalUsers,
      totalMovies,
      totalBookings,
      totalRevenue,
      totalTicketsSold,
      recentBookings,
    };
  }

  const db = await readJSONDb();
  const totalUsers = (db.users || []).filter((u) => u.role === 'user').length;
  const totalMovies = (db.movies || []).length;
  const bookings = db.bookings || [];
  const confirmed = bookings.filter((b) => b.bookingStatus === 'Confirmed');
  const totalRevenue = confirmed.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
  const totalTicketsSold = confirmed.reduce((sum, b) => sum + (b.seats ? b.seats.length : 0), 0);
  const recentBookings = [...bookings].reverse().slice(0, 6).map((b) => ({
    ...b,
    movie: db.movies.find((m) => m._id.toString() === b.movie.toString()),
    user: db.users.find((u) => u._id.toString() === b.user.toString()),
  }));

  return {
    totalUsers,
    totalMovies,
    totalBookings: bookings.length,
    totalRevenue,
    totalTicketsSold,
    recentBookings,
  };
};

module.exports = {
  autoSeedMongoIfEmpty,
  findUserByEmail,
  findUserById,
  createUser,
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getAllTheaters,
  getTheaterById,
  createTheater,
  getShowtimesForMovie,
  getShowtimeById,
  createShowtime,
  reserveSeatsInShowtime,
  releaseSeatsInShowtime,
  createBooking,
  getBookingsByUser,
  getBookingById,
  cancelBooking,
  getAdminStats,
};
