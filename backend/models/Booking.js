const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
    },
    seats: [
      {
        seatNumber: { type: String, required: true },
        tier: { type: String, default: 'Standard' }, // Standard, Premium, VIP
        price: { type: Number, required: true },
      },
    ],
    showDate: {
      type: String,
      required: true,
    },
    showTime: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      default: '2D',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    convenienceFee: {
      type: Number,
      default: 30,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    promoCode: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Debit Card', 'UPI / QR', 'Net Banking'],
      default: 'UPI / QR',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
      default: 'Paid',
    },
    bookingStatus: {
      type: String,
      enum: ['Confirmed', 'Cancelled'],
      default: 'Confirmed',
    },
    ticketQrData: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
