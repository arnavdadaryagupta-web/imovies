import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatMatrix from '../components/SeatMatrix';
import TicketModal from '../components/TicketModal';

export default function BookingPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [showtime, setShowtime] = useState(null);
  const [seatMatrix, setSeatMatrix] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Promo code & payment state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR');
  const [processing, setProcessing] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Confirmed booking modal state
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    const fetchShowtime = async () => {
      setLoading(true);
      try {
        const data = await api.getShowtimeDetails(showtimeId);
        setShowtime(data.showtime);
        setSeatMatrix(data.seatMatrix);
      } catch (err) {
        console.error('Error fetching showtime details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShowtime();
  }, [showtimeId]);

  const handleToggleSeat = (seat) => {
    const exists = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        alert('You can select a maximum of 8 seats per reservation.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Pricing calculations
  const subtotal = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
  const convenienceFee = selectedSeats.length > 0 ? 30 : 0;

  let discount = 0;
  if (appliedPromo) {
    discount = appliedPromo.discount;
  }

  const grandTotal = Math.max(0, subtotal + convenienceFee - discount);

  // Apply promo
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    if (!promoCode.trim()) return;

    if (subtotal === 0) {
      setPromoError('Please select seats first to apply coupon');
      return;
    }

    try {
      const res = await api.validatePromo(promoCode, subtotal);
      setAppliedPromo({
        code: promoCode.toUpperCase(),
        discount: res.discount,
      });
      setPromoSuccess(`Applied: ₹${res.discount} discount saved!`);
    } catch (err) {
      setPromoError(err.message || 'Invalid promo code');
      setAppliedPromo(null);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoSuccess('');
    setPromoError('');
  };

  // Submit Booking
  const handleBookTickets = async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (selectedSeats.length === 0) {
      setBookingError('Please choose at least 1 seat to proceed.');
      return;
    }

    setProcessing(true);
    setBookingError('');

    try {
      const payload = {
        movieId: showtime.movie ? showtime.movie._id : null,
        theaterId: showtime.theater ? showtime.theater._id : null,
        showtimeId: showtime._id,
        seats: selectedSeats.map((s) => ({
          seatNumber: s.seatNumber,
          tier: s.tier,
          price: s.price,
        })),
        promoCode: appliedPromo ? appliedPromo.code : '',
        paymentMethod,
      };

      const res = await api.createBooking(payload);
      setConfirmedBooking(res.booking);
    } catch (err) {
      setBookingError(err.message || 'Booking failed. Some seats may have been reserved by someone else.');
      // Refresh seat matrix
      try {
        const data = await api.getShowtimeDetails(showtimeId);
        setSeatMatrix(data.seatMatrix);
      } catch (e) {
        // ignore
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3 text-muted">Loading theater seat matrix...</p>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="container text-center py-5">
        <h4 className="text-white">Showtime Not Found</h4>
        <Link to="/" className="btn btn-gold rounded-pill mt-3 px-4">
          Back to Movies
        </Link>
      </div>
    );
  }

  const movie = showtime.movie || {};
  const theater = showtime.theater || {};

  return (
    <div className="container py-4">
      {/* Header breadcrumb & info */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link to={`/movie/${movie._id}`} className="text-muted text-decoration-none small hover-gold">
              <i className="bi bi-arrow-left me-1"></i> {movie.title}
            </Link>
            <span className="text-muted">•</span>
            <span className="badge badge-format">{showtime.format}</span>
          </div>
          <h3 className="fw-bold text-white mb-0">
            {movie.title} — Seat Reservation
          </h3>
          <span className="text-muted small">
            {theater.name} • {showtime.date} at <strong className="text-gold">{showtime.startTime}</strong>
          </span>
        </div>

        {/* Selected count pill */}
        <div>
          <span className="badge bg-cinema-card border border-warning text-gold px-3 py-2 fs-6">
            <i className="bi bi-person-check-fill me-2"></i>
            {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected
          </span>
        </div>
      </div>

      {bookingError && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <div>{bookingError}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Visual Theater Layout */}
        <div className="col-lg-8">
          <SeatMatrix
            seatMatrix={seatMatrix}
            selectedSeats={selectedSeats}
            onToggleSeat={handleToggleSeat}
          />
        </div>

        {/* Right Column: Order Summary & Checkout */}
        <div className="col-lg-4">
          <div className="bg-cinema-card p-4 rounded-4 border border-secondary border-opacity-25 shadow-sm sticky-top" style={{ top: '90px' }}>
            <h5 className="fw-bold text-white mb-3 pb-2 border-bottom border-secondary border-opacity-25">
              <i className="bi bi-receipt text-gold me-2"></i> Booking Summary
            </h5>

            {/* Movie preview snippet */}
            <div className="d-flex gap-3 align-items-center mb-3">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="rounded-3 shadow-sm object-fit-cover"
                style={{ width: '55px', height: '75px' }}
              />
              <div>
                <h6 className="text-white fw-bold mb-1 text-truncate" style={{ maxWidth: '200px' }}>
                  {movie.title}
                </h6>
                <div className="text-muted small">{showtime.format} • {movie.language ? movie.language.join(', ') : 'English'}</div>
                <div className="text-gold small fw-semibold">{theater.name}</div>
              </div>
            </div>

            {/* Selected seats badges */}
            <div className="mb-3">
              <span className="text-muted small d-block mb-1">Seats:</span>
              {selectedSeats.length === 0 ? (
                <div className="text-secondary small italic">Click on available seats on the map to select</div>
              ) : (
                <div className="d-flex flex-wrap gap-1">
                  {selectedSeats.map((s) => (
                    <span
                      key={s.seatNumber}
                      className="badge bg-warning text-dark fw-bold px-2 py-1 d-flex align-items-center gap-1"
                    >
                      <span>{s.seatNumber} ({s.tier})</span>
                      <button
                        type="button"
                        className="btn-close btn-close-white"
                        style={{ fontSize: '0.5rem' }}
                        onClick={() => handleToggleSeat(s)}
                      ></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-secondary border-opacity-25" />

            {/* Price breakdown */}
            <div className="d-flex justify-content-between small text-muted mb-2">
              <span>Tickets Subtotal</span>
              <span className="text-white">₹{subtotal}</span>
            </div>
            <div className="d-flex justify-content-between small text-muted mb-2">
              <span>Convenience & Booking Fee</span>
              <span className="text-white">₹{convenienceFee}</span>
            </div>

            {appliedPromo && (
              <div className="d-flex justify-content-between small text-success mb-2">
                <span>
                  Promo Discount ({appliedPromo.code})
                  <button
                    className="btn btn-link text-danger p-0 ms-1 text-decoration-none small"
                    onClick={handleRemovePromo}
                    style={{ fontSize: '0.7rem' }}
                  >
                    [Remove]
                  </button>
                </span>
                <span>- ₹{appliedPromo.discount}</span>
              </div>
            )}

            <div className="d-flex justify-content-between fw-bold fs-5 text-white my-3 pt-2 border-top border-secondary border-opacity-25">
              <span>Total Payable</span>
              <span className="text-gold">₹{grandTotal}</span>
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="mb-3">
              <div className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-light text-uppercase font-monospace"
                  placeholder="Coupon (e.g. MOVIEPASS)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={!!appliedPromo}
                />
                <button
                  className="btn btn-outline-gold"
                  type="submit"
                  disabled={!!appliedPromo || !promoCode}
                >
                  Apply
                </button>
              </div>
              {promoSuccess && <div className="text-success small mt-1">{promoSuccess}</div>}
              {promoError && <div className="text-danger small mt-1">{promoError}</div>}
            </form>

            {/* Payment Method selector */}
            <div className="mb-4">
              <label className="form-label text-muted small mb-2">Select Payment Method</label>
              <div className="d-flex flex-column gap-2">
                {['UPI / QR', 'Credit Card', 'Debit Card', 'Net Banking'].map((method) => (
                  <label
                    key={method}
                    className={`p-2 rounded-3 border d-flex align-items-center gap-2 small cursor-pointer ${paymentMethod === method ? 'border-warning bg-dark' : 'border-secondary border-opacity-25'}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-check-input my-0"
                    />
                    <span className="text-light">{method}</span>
                    {method === 'UPI / QR' && (
                      <span className="badge bg-success ms-auto" style={{ fontSize: '0.65rem' }}>
                        Fastest
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              className="btn btn-gold w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
              disabled={selectedSeats.length === 0 || processing}
              onClick={handleBookTickets}
            >
              {processing ? (
                <>
                  <div className="spinner-border spinner-border-sm text-dark" role="status"></div>
                  <span>Processing Reservation...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check fs-5"></i>
                  <span>Pay ₹{grandTotal} & Confirm</span>
                </>
              )}
            </button>

            {!user && (
              <div className="text-center text-muted small mt-2">
                You will be prompted to sign in to confirm this reservation.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmed Ticket Modal */}
      {confirmedBooking && (
        <TicketModal
          booking={confirmedBooking}
          onClose={() => {
            setConfirmedBooking(null);
            navigate('/my-bookings');
          }}
        />
      )}
    </div>
  );
}
