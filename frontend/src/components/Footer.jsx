import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-secondary pt-5 pb-4 mt-5 border-top border-secondary border-opacity-25" style={{ backgroundColor: '#06080d' }}>
      <div className="container">
        <div className="row g-4 justify-content-between">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="fs-3 text-gold">🎬</span>
              <span className="brand-font fw-bold fs-4 text-white">
                THE <span className="text-gold">IMOVIES</span>
              </span>
            </div>
            <p className="small text-muted mb-3">
              Next-generation cinema ticketing ecosystem. Experience real-time seat reservation, IMAX 3D, 4DX Dolby Atmos audio, and seamless paperless digital ticketing.
            </p>
            <div className="d-flex gap-2">
              <span className="badge bg-cinema-card border border-secondary text-light py-2 px-3">
                <i className="bi bi-shield-check text-success me-1"></i> 100% Secure Checkout
              </span>
              <span className="badge bg-cinema-card border border-secondary text-light py-2 px-3">
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Instant E-Tickets
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold mb-3">Explore</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/" className="text-muted text-decoration-none hover-gold">Now Showing</Link></li>
              <li><Link to="/?tab=upcoming" className="text-muted text-decoration-none hover-gold">Upcoming Releases</Link></li>
              <li><Link to="/my-bookings" className="text-muted text-decoration-none hover-gold">Ticket History</Link></li>
              <li><Link to="/admin" className="text-muted text-decoration-none hover-gold">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold mb-3">Experiences</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-muted">
              <li><i className="bi bi-film me-1 text-gold"></i> IMAX 3D Laser</li>
              <li><i className="bi bi-speaker-fill me-1 text-gold"></i> Dolby Atmos 7.1</li>
              <li><i className="bi bi-cup-hot-fill me-1 text-gold"></i> VIP Dine-In Recliners</li>
              <li><i className="bi bi-wind me-1 text-gold"></i> 4DX Dynamic Motion</li>
            </ul>
          </div>

          {/* Promo code callout */}
          <div className="col-lg-3 col-md-6">
            <div className="p-3 rounded-3 bg-cinema-card border border-warning border-opacity-25">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-ticket-perforated-fill text-warning fs-5"></i>
                <h6 className="text-white mb-0 fw-bold">Exclusive Cinema Offers</h6>
              </div>
              <p className="small text-muted mb-2">
                Use promo code <span className="badge bg-warning text-dark fw-bold">MOVIEPASS</span> at checkout to get 15% instant discount!
              </p>
              <div className="small text-secondary">
                Or use <span className="text-gold fw-bold">IMOVIES50</span> for flat ₹50 off.
              </div>
            </div>
          </div>
        </div>

        <hr className="border-secondary border-opacity-25 my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-muted">
          <div>
            © {new Date().getFullYear()} The IMovies Platform. Built with Express.js, MongoDB & React.js.
          </div>
          <div className="d-flex gap-3">
            <span>Client-Server Architecture</span>
            <span>•</span>
            <span>JWT Secured</span>
            <span>•</span>
            <span>Real-time Seat Locking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
