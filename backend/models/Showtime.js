const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: true,
    },
    screenNumber: {
      type: Number,
      default: 1,
    },
    date: {
      type: String, // format YYYY-MM-DD
      required: true,
    },
    startTime: {
      type: String, // e.g. "10:30 AM", "02:15 PM"
      required: true,
    },
    format: {
      type: String, // "2D", "3D", "IMAX 3D", "4DX"
      default: '2D',
    },
    language: {
      type: String,
      default: 'English',
    },
    basePrice: {
      type: Number,
      default: 250,
    },
    // Track occupied / booked seats
    reservedSeats: {
      type: [String], // Array of seat codes e.g. ["A1", "A2", "D4"]
      default: [],
    },
    totalSeats: {
      type: Number,
      default: 80,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for available seat count
showtimeSchema.virtual('availableSeats').get(function () {
  return this.totalSeats - (this.reservedSeats ? this.reservedSeats.length : 0);
});

showtimeSchema.set('toJSON', { virtuals: true });
showtimeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Showtime', showtimeSchema);
