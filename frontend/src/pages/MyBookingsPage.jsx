import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TicketModal from '../components/TicketModal';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/my-bookings');
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await api.getMyBookings();
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket reservation? Your seats will be released.')) {
      return;
    }

    setCancellingId(bookingId);
    setMessage('');
    setError('');

    try {
      await api.cancelBooking(bookingId);
      setMessage('Ticket reservation cancelled successfully. Full refund initiated.');
      // Refresh list
      const data = await api.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3 text-muted">Retrieving your ticket bookings...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <h2 className="fw-bold text-white mb-1">
            <i className="bi bi-ticket-detailed text-gold me-2"></i> My Movie Tickets
          </h2>
          <p className="text-muted small mb-0">
            View your active bookings, display gate entry QR codes, or cancel reservations.
          </p>
        </div>

        <Link to="/" className="btn btn-outline-gold rounded-pill px-4">
          <i className="bi bi-plus-circle me-1"></i> Book More Movies
        </Link>
      </div>

      {message && (
        <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i> {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-5 bg-cinema-card rounded-4 border border-secondary border-opacity-25">
          <i className="bi bi-ticket-perforated fs-1 text-muted"></i>
          <h4 className="text-white mt-3">No Ticket Bookings Yet</h4>
          <p className="text-muted small">You haven't reserved any cinema tickets yet. Start exploring now!</p>
          <Link to="/" className="btn btn-gold rounded-pill px-4 mt-2">
            Browse Now Showing
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {bookings.map((b) => {
            const isCancelled = b.bookingStatus === 'Cancelled';
            const movie = b.movie || {};
            const theater = b.theater || {};

            return (
              <div key={b._id} className="col-lg-6">
                <div className="p-4 rounded-4 bg-cinema-card border border-secondary border-opacity-25 shadow-sm h-100 d-flex flex-column justify-content-between">
                  <div>
                    {/* Header info */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span className="text-muted small">Booking ID:</span>
                        <div className="fw-bold font-monospace text-gold">{b.bookingId}</div>
                      </div>
                      <span
                        className={`badge px-3 py-1 ${isCancelled ? 'bg-danger bg-opacity-25 text-danger border border-danger' : 'bg-success bg-opacity-25 text-success border border-success'}`}
                      >
                        {b.bookingStatus}
                      </span>
                    </div>

                    {/* Movie & Theater */}
                    <div className="d-flex gap-3 mb-3">
                      <img
                        src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'}
                        alt={movie.title}
                        className="rounded-3 object-fit-cover shadow-sm"
                        style={{ width: '70px', height: '95px' }}
                      />
                      <div>
                        <h5 className="fw-bold text-white mb-1">{movie.title || 'Cinema Ticket'}</h5>
                        <div className="text-muted small mb-1">
                          <i className="bi bi-geo-alt-fill text-danger me-1"></i> {theater.name || 'IMovies Multiplex'}
                        </div>
                        <div className="d-flex flex-wrap gap-2 text-muted small">
                          <span className="badge badge-format">{b.format || 'IMAX 3D'}</span>
                          <span><i className="bi bi-calendar3 me-1"></i>{b.showDate}</span>
                          <span><i className="bi bi-clock me-1"></i>{b.showTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Seats info */}
                    <div className="mb-3 p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">Reserved Seats:</span>
                        <span className="text-white small fw-bold">
                          {b.seats ? b.seats.length : 0} Tickets
                        </span>
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {(b.seats || []).map((s) => (
                          <span key={s.seatNumber} className="badge bg-warning text-dark fw-bold px-2 py-1">
                            {s.seatNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-25">
                    <div>
                      <span className="text-muted small d-block">Amount Paid</span>
                      <h4 className="fw-bold text-white mb-0">₹{b.finalAmount}</h4>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-light rounded-pill px-3"
                        onClick={() => setActiveTicket(b)}
                      >
                        <i className="bi bi-qr-code me-1"></i> View Ticket
                      </button>

                      {!isCancelled && (
                        <button
                          className="btn btn-sm btn-outline-danger rounded-pill px-3"
                          disabled={cancellingId === b._id}
                          onClick={() => handleCancelBooking(b._id)}
                        >
                          {cancellingId === b._id ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            'Cancel'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal popup */}
      {activeTicket && (
        <TicketModal
          booking={activeTicket}
          onClose={() => setActiveTicket(null)}
        />
      )}
    </div>
  );
}
