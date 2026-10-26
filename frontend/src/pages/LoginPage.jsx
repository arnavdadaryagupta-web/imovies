import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, loginAsUser, loginAsAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickUser = async () => {
    try {
      await loginAsUser();
      navigate(redirect);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleQuickAdmin = async () => {
    try {
      await loginAsAdmin();
      navigate('/admin');
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '75vh' }}>
      <div className="card bg-cinema-card border-secondary border-opacity-25 rounded-4 shadow-lg p-4 p-md-5" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="text-center mb-4">
          <span className="fs-1 text-gold">🎬</span>
          <h3 className="fw-bold text-white mt-2 mb-1 brand-font">
            Sign In to <span className="text-gold">IMovies</span>
          </h3>
          <p className="text-muted small">Access your movie tickets and personalized bookings</p>
        </div>

        {localError && (
          <div className="alert alert-danger py-2 small mb-3" role="alert">
            <i className="bi bi-exclamation-circle-fill me-1"></i> {localError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted small">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-muted">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control bg-dark border-secondary text-light"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-muted small">Password</label>
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
              'Sign In'
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="p-3 bg-dark bg-opacity-50 rounded-3 border border-secondary border-opacity-25 my-3 text-center">
          <div className="text-muted small fw-semibold mb-2">⚡ 1-Click Demo Login:</div>
          <div className="d-flex gap-2 justify-content-center">
            <button
              type="button"
              className="btn btn-sm btn-outline-warning rounded-pill flex-grow-1"
              onClick={handleQuickUser}
            >
              <i className="bi bi-person me-1"></i> Demo User
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-info rounded-pill flex-grow-1"
              onClick={handleQuickAdmin}
            >
              <i className="bi bi-shield-lock me-1"></i> Demo Admin
            </button>
          </div>
        </div>

        <div className="text-center text-muted small mt-2">
          Don't have an account?{' '}
          <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-gold text-decoration-none fw-semibold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
