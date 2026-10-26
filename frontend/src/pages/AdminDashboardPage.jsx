import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  // Form states for adding movie
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    synopsis: '',
    posterUrl: '',
    bannerUrl: '',
    trailerUrl: '',
    genre: 'Action, Sci-Fi',
    duration: 150,
    language: 'English',
    rating: 8.5,
    ageRating: 'UA 16+',
    director: '',
    ticketPriceBase: 250,
    isNowShowing: true,
  });

  // Form states for scheduling showtime
  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '',
    theaterId: '',
    screenNumber: 1,
    date: new Date().toISOString().split('T')[0],
    startTime: '07:30 PM',
    format: 'IMAX 3D',
    basePrice: 280,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, moviesData, theatersData] = await Promise.all([
        api.getAdminStats(),
        api.getMovies(),
        api.getTheaters(),
      ]);
      setStats(statsData);
      setMovies(moviesData);
      setTheaters(theatersData);

      if (moviesData.length > 0 && !showtimeForm.movieId) {
        setShowtimeForm((prev) => ({ ...prev, movieId: moviesData[0]._id }));
      }
      if (theatersData.length > 0 && !showtimeForm.theaterId) {
        setShowtimeForm((prev) => ({ ...prev, theaterId: theatersData[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login?redirect=/admin');
      return;
    }
    loadData();
  }, [isAdmin, navigate]);

  const handleAddMovie = async (e) => {
    e.preventDefault();
    setAlertMsg({ type: '', text: '' });
    try {
      const payload = {
        ...movieForm,
        genre: movieForm.genre.split(',').map((g) => g.trim()),
        language: movieForm.language.split(',').map((l) => l.trim()),
        duration: Number(movieForm.duration),
        rating: Number(movieForm.rating),
        ticketPriceBase: Number(movieForm.ticketPriceBase),
      };
      await api.createMovie(payload);
      setAlertMsg({ type: 'success', text: `Movie "${movieForm.title}" added to catalogue!` });
      setMovieForm({
        title: '',
        description: '',
        synopsis: '',
        posterUrl: '',
        bannerUrl: '',
        trailerUrl: '',
        genre: 'Action, Sci-Fi',
        duration: 150,
        language: 'English',
        rating: 8.5,
        ageRating: 'UA 16+',
        director: '',
        ticketPriceBase: 250,
        isNowShowing: true,
      });
      loadData();
    } catch (err) {
      setAlertMsg({ type: 'danger', text: err.message || 'Failed to add movie' });
    }
  };

  const handleScheduleShowtime = async (e) => {
    e.preventDefault();
    setAlertMsg({ type: '', text: '' });
    try {
      await api.createShowtime({
        movie: showtimeForm.movieId,
        theater: showtimeForm.theaterId,
        screenNumber: Number(showtimeForm.screenNumber),
        date: showtimeForm.date,
        startTime: showtimeForm.startTime,
        format: showtimeForm.format,
        basePrice: Number(showtimeForm.basePrice),
      });
      setAlertMsg({ type: 'success', text: 'New showtime scheduled successfully!' });
      loadData();
    } catch (err) {
      setAlertMsg({ type: 'danger', text: err.message || 'Failed to schedule showtime' });
    }
  };

  const handleDeleteMovie = async (movieId, movieTitle) => {
    if (!window.confirm(`Delete movie "${movieTitle}"? This cannot be undone.`)) return;
    try {
      await api.deleteMovie(movieId);
      setAlertMsg({ type: 'success', text: `Movie "${movieTitle}" removed.` });
      loadData();
    } catch (err) {
      setAlertMsg({ type: 'danger', text: err.message || 'Failed to delete' });
    }
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3 text-muted">Loading Admin Control Center...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <div className="badge bg-warning text-dark fw-bold mb-2">ADMINISTRATION</div>
          <h2 className="fw-bold text-white mb-1">
            <i className="bi bi-speedometer2 text-gold me-2"></i> Cinema Operations Portal
          </h2>
          <p className="text-muted small mb-0">
            Real-time box office analytics, movie catalogue control, and hall schedule management.
          </p>
        </div>

        <button className="btn btn-outline-gold rounded-pill px-4" onClick={loadData}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh Data
        </button>
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show mb-4`} role="alert">
          <i className="bi bi-info-circle-fill me-2"></i> {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Metrics Cards */}
      {stats && (
        <div className="row g-4 mb-5">
          <div className="col-sm-6 col-lg-3">
            <div className="p-4 rounded-4 bg-cinema-card border border-secondary border-opacity-25 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small">Total Box Office</span>
                <span className="badge bg-success bg-opacity-25 text-success p-2">
                  <i className="bi bi-currency-rupee fs-6"></i>
                </span>
              </div>
              <h3 className="fw-bold text-white mb-0">₹{stats.totalRevenue.toLocaleString()}</h3>
              <div className="text-success small mt-2">
                <i className="bi bi-graph-up-arrow me-1"></i> Revenue collected
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="p-4 rounded-4 bg-cinema-card border border-secondary border-opacity-25 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small">Tickets Sold</span>
                <span className="badge bg-warning bg-opacity-25 text-warning p-2">
                  <i className="bi bi-ticket-perforated-fill fs-6"></i>
                </span>
              </div>
              <h3 className="fw-bold text-white mb-0">{stats.totalTicketsSold}</h3>
              <div className="text-muted small mt-2">Across all theaters</div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="p-4 rounded-4 bg-cinema-card border border-secondary border-opacity-25 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small">Active Movies</span>
                <span className="badge bg-info bg-opacity-25 text-info p-2">
                  <i className="bi bi-film fs-6"></i>
                </span>
              </div>
              <h3 className="fw-bold text-white mb-0">{stats.totalMovies}</h3>
              <div className="text-muted small mt-2">In current catalogue</div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="p-4 rounded-4 bg-cinema-card border border-secondary border-opacity-25 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small">Registered Patrons</span>
                <span className="badge bg-primary bg-opacity-25 text-primary p-2">
                  <i className="bi bi-people-fill fs-6"></i>
                </span>
              </div>
              <h3 className="fw-bold text-white mb-0">{stats.totalUsers}</h3>
              <div className="text-muted small mt-2">Active accounts</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-pills gap-2 mb-4 pb-2 border-bottom border-secondary border-opacity-25">
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'overview' ? 'btn-gold text-dark' : 'text-light bg-dark bg-opacity-50'}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-journal-text me-2"></i> Recent Bookings
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'movies' ? 'btn-gold text-dark' : 'text-light bg-dark bg-opacity-50'}`}
            onClick={() => setActiveTab('movies')}
          >
            <i className="bi bi-collection-play me-2"></i> Manage Movies
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'add-movie' ? 'btn-gold text-dark' : 'text-light bg-dark bg-opacity-50'}`}
            onClick={() => setActiveTab('add-movie')}
          >
            <i className="bi bi-plus-circle me-2"></i> Add Movie
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'schedule' ? 'btn-gold text-dark' : 'text-light bg-dark bg-opacity-50'}`}
            onClick={() => setActiveTab('schedule')}
          >
            <i className="bi bi-clock-history me-2"></i> Schedule Showtime
          </button>
        </li>
      </ul>

      {/* Tab 1: Recent Bookings Overview */}
      {activeTab === 'overview' && stats && (
        <div className="bg-cinema-card rounded-4 p-4 border border-secondary border-opacity-25 shadow-sm">
          <h5 className="fw-bold text-white mb-3">
            <i className="bi bi-receipt-cutoff text-gold me-2"></i> Live Box Office Transactions
          </h5>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead className="table-secondary bg-opacity-10 text-muted small">
                <tr>
                  <th>Booking ID</th>
                  <th>Movie</th>
                  <th>Customer</th>
                  <th>Date & Time</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings && stats.recentBookings.length > 0 ? (
                  stats.recentBookings.map((b) => (
                    <tr key={b._id}>
                      <td className="font-monospace text-gold fw-semibold">{b.bookingId}</td>
                      <td className="fw-bold text-white">{b.movie ? b.movie.title : 'Movie'}</td>
                      <td>
                        <div className="text-white small">{b.user ? b.user.name : 'Patron'}</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>{b.user ? b.user.email : ''}</div>
                      </td>
                      <td className="small text-muted">{b.showDate} {b.showTime}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {(b.seats || []).map((s) => (
                            <span key={s.seatNumber} className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                              {s.seatNumber}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="fw-bold text-white">₹{b.finalAmount}</td>
                      <td>
                        <span
                          className={`badge ${b.bookingStatus === 'Confirmed' ? 'bg-success bg-opacity-25 text-success' : 'bg-danger bg-opacity-25 text-danger'}`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Movies */}
      {activeTab === 'movies' && (
        <div className="bg-cinema-card rounded-4 p-4 border border-secondary border-opacity-25 shadow-sm">
          <h5 className="fw-bold text-white mb-3">
            <i className="bi bi-film text-gold me-2"></i> Current Movie Catalogue ({movies.length})
          </h5>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead className="table-secondary bg-opacity-10 text-muted small">
                <tr>
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Genre</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Base Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        className="rounded-2 object-fit-cover shadow-sm"
                        style={{ width: '45px', height: '60px' }}
                      />
                    </td>
                    <td className="fw-bold text-white">{m.title}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {(m.genre || []).map((g) => (
                          <span key={g} className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="small text-muted">{m.duration} mins</td>
                    <td>
                      <span className={`badge ${m.isNowShowing ? 'bg-success' : 'bg-secondary'}`}>
                        {m.isNowShowing ? 'Now Showing' : 'Upcoming'}
                      </span>
                    </td>
                    <td className="text-gold fw-bold">₹{m.ticketPriceBase}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteMovie(m._id, m.title)}
                        title="Delete Movie"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Add Movie Form */}
      {activeTab === 'add-movie' && (
        <div className="bg-cinema-card rounded-4 p-4 border border-secondary border-opacity-25 shadow-sm">
          <h5 className="fw-bold text-white mb-4">
            <i className="bi bi-plus-circle text-gold me-2"></i> Add New Cinema Release
          </h5>
          <form onSubmit={handleAddMovie}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted small">Movie Title</label>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-light"
                  placeholder="e.g. Inception 2"
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label text-muted small">Duration (Minutes)</label>
                <input
                  type="number"
                  className="form-control bg-dark border-secondary text-light"
                  value={movieForm.duration}
                  onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label text-muted small">Base Ticket Price (₹)</label>
                <input
                  type="number"
                  className="form-control bg-dark border-secondary text-light"
                  value={movieForm.ticketPriceBase}
                  onChange={(e) => setMovieForm({ ...movieForm, ticketPriceBase: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small">Genres (comma separated)</label>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-light"
                  placeholder="Action, Sci-Fi, Thriller"
                  value={movieForm.genre}
                  onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small">Languages (comma separated)</label>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-light"
                  placeholder="English, Hindi"
                  value={movieForm.language}
                  onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small">Poster Image URL</label>
                <input
                  type="url"
                  className="form-control bg-dark border-secondary text-light"
                  placeholder="https://images.unsplash.com/..."
                  value={movieForm.posterUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small">Backdrop Banner URL (Optional)</label>
                <input
                  type="url"
                  className="form-control bg-dark border-secondary text-light"
                  placeholder="https://images.unsplash.com/..."
                  value={movieForm.bannerUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, bannerUrl: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small">YouTube Trailer Embed URL</label>
                <input
                  type="url"
                  className="form-control bg-dark border-secondary text-light"
                  placeholder="https://www.youtube.com/embed/..."
                  value={movieForm.trailerUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label text-muted small">Age Rating</label>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-light"
                  value={movieForm.ageRating}
                  onChange={(e) => setMovieForm({ ...movieForm, ageRating: e.target.value })}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label text-muted small">Director</label>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-light"
                  value={movieForm.director}
                  onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label text-muted small">Short Description</label>
                <textarea
                  className="form-control bg-dark border-secondary text-light"
                  rows="2"
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="col-12">
                <label className="form-label text-muted small">Detailed Synopsis</label>
                <textarea
                  className="form-control bg-dark border-secondary text-light"
                  rows="3"
                  value={movieForm.synopsis}
                  onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" className="btn btn-gold rounded-pill px-4 py-2 fw-bold">
                <i className="bi bi-cloud-arrow-up-fill me-1"></i> Save Movie to System
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Schedule Showtime */}
      {activeTab === 'schedule' && (
        <div className="bg-cinema-card rounded-4 p-4 border border-secondary border-opacity-25 shadow-sm">
          <h5 className="fw-bold text-white mb-4">
            <i className="bi bi-calendar-plus text-gold me-2"></i> Schedule New Theater Showtime
          </h5>
          <form onSubmit={handleScheduleShowtime}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted small">Select Movie</label>
                <select
                  className="form-select bg-dark border-secondary text-light"
                  value={showtimeForm.movieId}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })}
                  required
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small">Select Cinema Venue</label>
                <select
                  className="form-select bg-dark border-secondary text-light"
                  value={showtimeForm.theaterId}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, theaterId: e.target.value })}
                  required
                >
                  {theaters.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label text-muted small">Show Date</label>
                <input
                  type="date"
                  className="form-control bg-dark border-secondary text-light"
                  value={showtimeForm.date}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, date: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label text-muted small">Start Time</label>
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-light"
                  placeholder="e.g. 07:15 PM"
                  value={showtimeForm.startTime}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, startTime: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label text-muted small">Experience Format</label>
                <select
                  className="form-select bg-dark border-secondary text-light"
                  value={showtimeForm.format}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, format: e.target.value })}
                >
                  <option value="IMAX 3D">IMAX 3D</option>
                  <option value="4DX">4DX Motion</option>
                  <option value="2D Dolby Atmos">2D Dolby Atmos</option>
                  <option value="3D">Standard 3D</option>
                  <option value="2D">Standard 2D</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small">Auditorium / Screen</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-control bg-dark border-secondary text-light"
                  value={showtimeForm.screenNumber}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, screenNumber: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted small">Standard Base Price (₹)</label>
                <input
                  type="number"
                  className="form-control bg-dark border-secondary text-light"
                  value={showtimeForm.basePrice}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, totalPrice: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" className="btn btn-gold rounded-pill px-4 py-2 fw-bold">
                <i className="bi bi-calendar-check me-1"></i> Confirm Showtime Schedule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
