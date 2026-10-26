const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const { connectDB } = require('./config/db');
const storage = require('./services/storageService');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'The IMovies API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize server & database
const startServer = async () => {
  await connectDB();
  await storage.autoSeedMongoIfEmpty();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🎬 The IMovies Server is running on port ${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
};

startServer();
