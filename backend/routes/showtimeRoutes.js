const express = require('express');
const router = express.Router();
const {
  getShowtimesForMovie,
  getShowtimeById,
  createShowtime,
  getTheaters,
} = require('../controllers/showtimeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/theaters', getTheaters);
router.get('/movie/:movieId', getShowtimesForMovie);
router.get('/:id', getShowtimeById);
router.post('/', protect, adminOnly, createShowtime);

module.exports = router;
