const storage = require('../services/storageService');

// @desc    Get all movies with optional filtering
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const { genre, language, status, search } = req.query;
    let filter = {};

    if (genre && genre !== 'All') filter.genre = genre;
    if (language && language !== 'All') filter.language = language;
    if (status === 'now-showing') filter.isNowShowing = true;
    if (status === 'upcoming') filter.isUpcoming = true;
    if (search) filter.search = search;

    const movies = await storage.getAllMovies(filter);
    res.json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movie = await storage.getMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const movie = await storage.createMovie(req.body);
    res.status(201).json({
      success: true,
      message: 'Movie added successfully',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    const updated = await storage.updateMovie(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({
      success: true,
      message: 'Movie updated successfully',
      movie: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const deleted = await storage.deleteMovie(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({
      success: true,
      message: 'Movie deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
