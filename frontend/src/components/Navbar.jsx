import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onSearchChange, searchTerm }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCity, setSelectedCity] = useState('Downtown Metro');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-cinema-dark cinema-glass sticky-top py-3 border-bottom border-secondary border-opacity-25">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="fs-3 text-gold">🎬</span>
          <div className="d-flex flex-column">
            <span className="brand-font fw-bold fs-4 text-white tracking-wider">
              THE <span className="text-gold">IMOVIES</span>
            </span>
            <span className="text-muted" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
              PREMIUM CINEMA EXPERIENCES
            </span>
          </div>
        </Link>

        {/* City Selector Pill */}
        <div className="dropdown d-none d-md-block ms-3">
          <button
            className="btn btn-sm btn-outline-secondary dropdown-toggle rounded-pill px-3 py-1 text-light border-opacity-50"
            type="button"
            data-bs-toggle="dropdown"
          >
            <i className="bi bi-geo-alt-fill text-gold me-1"></i> {selectedCity}
          </button>
          <ul className="dropdown-menu dropdown-menu-dark bg-cinema-card shadow">
            {['Downtown Metro', 'Westside Hub', 'Cyber City', 'Film City Plaza'].map((city) => (
              <li key={city}>
                <button
                  className={`dropdown-item ${selectedCity === city ? 'active text-gold' : ''}`}
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Toggler */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links & Controls */}
        <div className="collapse navbar-collapse" id="navContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3">
            <li className="nav-item">
              <Link
                className={`nav-link fw-semibold ${location.pathname === '/' ? 'text-gold active' : 'text-light'}`}
                to="/"
              >
                Now Showing
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link fw-semibold text-light"
                to="/?tab=upcoming"
              >
                Upcoming Movies
              </Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link
                  className={`nav-link fw-semibold ${location.pathname === '/my-bookings' ? 'text-gold active' : 'text-light'}`}
                  to="/my-bookings"
                >
                  <i className="bi bi-ticket-perforated me-1"></i> My Bookings
                </Link>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <Link
                  className={`nav-link fw-semibold ${location.pathname === '/admin' ? 'text-gold active' : 'text-warning'}`}
                  to="/admin"
                >
                  <i className="bi bi-shield-lock-fill me-1"></i> Admin Console
                </Link>
              </li>
            )}
          </ul>

          {/* Search Bar */}
          {location.pathname === '/' && (
            <div className="me-lg-3 my-2 my-lg-0" style={{ maxWidth: '240px' }}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-dark border-secondary text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-light"
                  placeholder="Search movies..."
                  value={searchTerm || ''}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* User Auth Buttons */}
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-sm btn-outline-light dropdown-toggle rounded-pill px-3 py-2 d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <span
                    className="rounded-circle bg-warning text-dark fw-bold d-inline-flex align-items-center justify-content-center"
                    style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span>{user.name}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark bg-cinema-card shadow border-secondary">
                  <li className="px-3 py-1 text-muted small">
                    Signed in as <br /><strong className="text-light">{user.email}</strong>
                  </li>
                  <li><hr className="dropdown-divider border-secondary" /></li>
                  <li>
                    <Link className="dropdown-item" to="/my-bookings">
                      <i className="bi bi-ticket-detailed me-2 text-gold"></i> My Tickets
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link className="dropdown-item" to="/admin">
                        <i className="bi bi-speedometer2 me-2 text-warning"></i> Admin Panel
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider border-secondary" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Log Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-sm btn-outline-gold rounded-pill px-3">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-sm btn-gold rounded-pill px-3">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
