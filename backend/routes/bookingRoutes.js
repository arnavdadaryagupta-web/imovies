const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  validatePromo,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/promo', validatePromo);
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
