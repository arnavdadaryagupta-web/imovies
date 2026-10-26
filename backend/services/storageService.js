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

// Showtimes
const getShowtimesForMovie = async (movieId, date) => {
  if (isMongoReady()) {
    let query = { movie: movieId };
    if (date) query.date = date;
    return await Showtime.find(query).populate('theater').populate('movie');
  }
  const db = await readJSONDb();
  let list = db.showtimes.filter((s) => s.movie.toString() === movieId.toString());
  if (date) {
    list = list.filter((s) => s.date === date);
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
  const s = db.showtimes.find((s) => s._id.toString() === id.toString());
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
