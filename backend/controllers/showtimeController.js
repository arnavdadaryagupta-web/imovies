const storage = require('../services/storageService');

// @desc    Get showtimes for a specific movie & optional date
// @route   GET /api/showtimes/movie/:movieId
// @access  Public
const getShowtimesForMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { date } = req.query;
    const showtimes = await storage.getShowtimesForMovie(movieId, date);
    res.json({
      success: true,
      count: showtimes.length,
      showtimes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single showtime details including reserved seats & seat matrix
// @route   GET /api/showtimes/:id
// @access  Public
const getShowtimeById = async (req, res, next) => {
  try {
    const showtime = await storage.getShowtimeById(req.params.id);
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }

    // Standard Cinema layout:
    // Rows A, B: VIP Recliners (tier: 'VIP', priceMultiplier: 1.5)
    // Rows C, D, E: Premium (tier: 'Premium', priceMultiplier: 1.2)
    // Rows F, G, H: Standard (tier: 'Standard', priceMultiplier: 1.0)
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

      return {
        row,
        tier,
        price,
        seats,
      };
    });

    res.json({
      success: true,
      showtime,
      seatMatrix,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create showtime
// @route   POST /api/showtimes
// @access  Private/Admin
const createShowtime = async (req, res, next) => {
  try {
    const showtime = await storage.createShowtime(req.body);
    res.status(201).json({
      success: true,
      message: 'Showtime scheduled successfully',
      showtime,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all theaters
// @route   GET /api/theaters
// @access  Public
const getTheaters = async (req, res, next) => {
  try {
    const theaters = await storage.getAllTheaters();
    res.json({
      success: true,
      count: theaters.length,
      theaters,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShowtimesForMovie,
  getShowtimeById,
  createShowtime,
  getTheaters,
};
