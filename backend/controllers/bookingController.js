const storage = require('../services/storageService');

// Promo code list
const PROMO_CODES = {
  MOVIEPASS: { type: 'percentage', value: 15, maxDiscount: 150 },
  IMOVIES50: { type: 'flat', value: 50 },
  BLOCKBUSTER: { type: 'percentage', value: 20, maxDiscount: 200 },
};

// @desc    Create a new movie ticket booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const {
      movieId,
      theaterId,
      showtimeId,
      seats, // Array of { seatNumber, tier, price }
      promoCode,
      paymentMethod,
    } = req.body;

    if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one seat to book' });
    }

    const showtime = await storage.getShowtimeById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }

    // Check & Reserve seats atomically
    const seatCodes = seats.map((s) => s.seatNumber);
    try {
      await storage.reserveSeatsInShowtime(showtimeId, seatCodes);
    } catch (err) {
      return res.status(409).json({ success: false, message: err.message });
    }

    // Pricing calculation
    const baseTotal = seats.reduce((sum, s) => sum + (s.price || 0), 0);
    const convenienceFee = 30; // standard fee
    let discountAmount = 0;

    if (promoCode && PROMO_CODES[promoCode.toUpperCase()]) {
      const promo = PROMO_CODES[promoCode.toUpperCase()];
      if (promo.type === 'percentage') {
        const calculated = (baseTotal * promo.value) / 100;
        discountAmount = Math.min(calculated, promo.maxDiscount);
      } else if (promo.type === 'flat') {
        discountAmount = Math.min(promo.value, baseTotal);
      }
    }

    const finalAmount = Math.max(0, baseTotal + convenienceFee - discountAmount);

    // Generate unique booking confirmation ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `IMV-${new Date().getFullYear()}-${randomSuffix}`;
    const qrData = `${bookingId}|${showtime.movie ? showtime.movie.title : 'Movie'}|${showtime.date} ${showtime.startTime}|Seats:${seatCodes.join(',')}|Amt:${finalAmount}`;

    const newBooking = await storage.createBooking({
      bookingId,
      user: req.user._id,
      movie: movieId || (showtime.movie ? showtime.movie._id : null),
      theater: theaterId || (showtime.theater ? showtime.theater._id : null),
      showtime: showtimeId,
      seats,
      showDate: showtime.date,
      showTime: showtime.startTime,
      format: showtime.format || '2D',
      totalAmount: baseTotal,
      convenienceFee,
      discountAmount,
      finalAmount,
      promoCode: promoCode ? promoCode.toUpperCase() : '',
      paymentMethod: paymentMethod || 'UPI / QR',
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
      ticketQrData: qrData,
    });

    const populatedBooking = await storage.getBookingById(newBooking._id);

    res.status(201).json({
      success: true,
      message: 'Tickets booked successfully! Enjoy your movie experience.',
      booking: populatedBooking || newBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings of logged in user
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await storage.getBookingsByUser(req.user._id);
    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await storage.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check ownership or admin
    const ownerId = booking.user._id ? booking.user._id.toString() : booking.user.toString();
    if (ownerId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking & release seats
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const updated = await storage.cancelBooking(req.params.id, req.user._id);
    res.json({
      success: true,
      message: 'Booking cancelled successfully. Refund initiated to original payment method.',
      booking: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate promo code
// @route   POST /api/bookings/promo
// @access  Public
const validatePromo = (req, res) => {
  const { code, amount = 0 } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Please enter a promo code' });
  }

  const promo = PROMO_CODES[code.toUpperCase()];
  if (!promo) {
    return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
  }

  let discount = 0;
  if (promo.type === 'percentage') {
    discount = Math.min((amount * promo.value) / 100, promo.maxDiscount);
  } else {
    discount = Math.min(promo.value, amount);
  }

  res.json({
    success: true,
    message: `Promo code ${code.toUpperCase()} applied!`,
    discount: Math.round(discount),
  });
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  validatePromo,
};
