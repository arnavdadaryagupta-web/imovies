const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(getMovies)
  .post(protect, adminOnly, createMovie);

router.route('/:id')
  .get(getMovieById)
  .put(protect, adminOnly, updateMovie)
  .delete(protect, adminOnly, deleteMovie);

module.exports = router;
