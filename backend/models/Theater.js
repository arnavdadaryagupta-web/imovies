const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    facilities: {
      type: [String],
      default: ['Dolby Atmos', '4K Laser Projection', 'Recliner Seats', 'Gourmet Food'],
    },
    screens: [
      {
        screenNumber: { type: Number, required: true },
        screenName: { type: String, default: 'Audi 1' },
        totalSeats: { type: Number, default: 80 },
        rows: { type: Number, default: 8 }, // A to H
        cols: { type: Number, default: 10 }, // 1 to 10
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Theater', theaterSchema);
