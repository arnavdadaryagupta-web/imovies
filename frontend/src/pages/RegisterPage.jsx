import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    try {
      await register(name, email, password, phone);
      navigate(redirect);
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card bg-cinema-card border-secondary border-opacity-25 rounded-4 shadow-lg p-4 p-md-5" style={{ maxWidth: '460px', width: '100%' }}>
        <div className="text-center mb-4">
          <span className="fs-1 text-gold">🎬</span>
          <h3 className="fw-bold text-white mt-2 mb-1 brand-font">
            Create an Account
          </h3>
          <p className="text-muted small">Join The IMovies for exclusive tickets & perks</p>
        </div>

        {localError && (
          <div className="alert alert-danger py-2 small mb-3" role="alert">
            <i className="bi bi-exclamation-circle-fill me-1"></i> {localError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted small">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-muted">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark border-secondary text-light"
                placeholder="e.g. Bruce Wayne"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-muted small">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-muted">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control bg-dark border-secondary text-light"
                placeholder="bruce@wayne.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-muted small">Phone Number (Optional)</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-muted">
                <i className="bi bi-phone"></i>
              </span>
              <input
                type="tel"
                className="form-control bg-dark border-secondary text-light"
                placeholder="+1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-muted small">Password (min 6 characters)</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-muted">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className="form-control bg-dark border-secondary text-light"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-gold w-100 py-2 rounded-pill fw-bold mb-3 shadow-sm"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center text-muted small mt-2">
          Already have an account?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-gold text-decoration-none fw-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
