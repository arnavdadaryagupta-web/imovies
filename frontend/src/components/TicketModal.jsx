import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';

export default function TicketModal({ booking, onClose }) {
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#ef4444', '#38bdf8', '#ffffff'],
      });
    } catch (e) {
      // ignore
    }

    // Render QR Code onto canvas
    if (booking && qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        booking.ticketQrData || `IMOVIES-TICKET-${booking.bookingId}`,
        {
          width: 140,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR code error:', error);
        }
      );
    }
  }, [booking]);

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const movieTitle = booking.movie ? booking.movie.title : 'Movie Ticket';
  const theaterName = booking.theater ? booking.theater.name : 'IMovies Cinema';

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1070 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-transparent border-0 shadow-lg">
          {/* Cinema Ticket Stub Card */}
          <div className="ticket-stub p-4 text-white shadow-lg border border-warning border-opacity-50">
            {/* Header Badge */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <span className="fs-4 text-gold">🎬</span>
                <span className="brand-font fw-bold fs-5">
                  THE <span className="text-gold">IMOVIES</span>
                </span>
              </div>
              <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-1">
                <i className="bi bi-check-circle-fill me-1"></i> CONFIRMED
              </span>
            </div>

            {/* Movie Title & Format */}
            <h4 className="fw-bold mb-1 text-gold">{movieTitle}</h4>
            <div className="text-muted small mb-3">
              <i className="bi bi-geo-alt-fill text-danger me-1"></i>
              {theaterName}
            </div>

            <hr className="border-secondary border-opacity-25" />

            {/* Details Grid */}
            <div className="row g-2 small mb-3">
              <div className="col-6">
                <span className="text-muted d-block">Booking ID:</span>
                <strong className="text-white font-monospace">{booking.bookingId}</strong>
              </div>
              <div className="col-6">
                <span className="text-muted d-block">Experience:</span>
                <span className="badge badge-format">{booking.format || 'IMAX 3D'}</span>
              </div>
              <div className="col-6">
                <span className="text-muted d-block">Date:</span>
                <strong className="text-white">{booking.showDate}</strong>
              </div>
              <div className="col-6">
                <span className="text-muted d-block">Showtime:</span>
                <strong className="text-white">{booking.showTime}</strong>
              </div>
              <div className="col-12">
                <span className="text-muted d-block">Reserved Seats:</span>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {(booking.seats || []).map((s) => (
                    <span key={s.seatNumber} className="badge bg-warning text-dark fw-bold px-2 py-1">
                      {s.seatNumber} ({s.tier})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-secondary border-opacity-25" />

            {/* Bottom Section: QR Code & Price */}
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small d-block">Total Amount Paid</span>
                <h3 className="fw-bold text-white mb-0">₹{booking.finalAmount}</h3>
                <span className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                  {booking.paymentMethod} • Paid
                </span>
              </div>

              {/* Scannable QR Code */}
              <div className="p-2 bg-white rounded-3 shadow-sm text-center">
                <canvas ref={qrCanvasRef} style={{ width: '110px', height: '110px', display: 'block' }}></canvas>
                <div className="text-dark fw-bold" style={{ fontSize: '0.6rem' }}>
                  SCAN AT GATE
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-2 mt-4">
              <button
                type="button"
                className="btn btn-sm btn-outline-light flex-grow-1 py-2"
                onClick={handlePrint}
              >
                <i className="bi bi-printer me-1"></i> Print Ticket
              </button>
              <button
                type="button"
                className="btn btn-sm btn-gold flex-grow-1 py-2"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
