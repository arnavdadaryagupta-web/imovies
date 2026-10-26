const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    synopsis: {
      type: String,
      default: '',
    },
    posterUrl: {
      type: String,
      required: true,
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    genre: {
      type: [String],
      required: true,
      default: [],
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    language: {
      type: [String],
      required: true,
      default: ['English'],
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    rating: {
      type: Number,
      default: 8.5,
    },
    ageRating: {
      type: String,
      default: 'UA 16+',
    },
    director: {
      type: String,
      default: '',
    },
    cast: [
      {
        name: { type: String, required: true },
        role: { type: String, default: 'Actor' },
        image: { type: String, default: '' },
      },
    ],
    isNowShowing: {
      type: Boolean,
      default: true,
    },
    isUpcoming: {
      type: Boolean,
      default: false,
    },
    ticketPriceBase: {
      type: Number,
      default: 200,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Movie', movieSchema);
