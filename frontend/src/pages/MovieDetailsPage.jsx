import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import TrailerModal from '../components/TrailerModal';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  // Generate 3 date options (Today, Tomorrow, Day After)
  const todayObj = new Date();
  const tomorrowObj = new Date(Date.now() + 86400000);
  const dayAfterObj = new Date(Date.now() + 172800000);

  const formatDateStr = (d) => d.toISOString().split('T')[0];
  const formatLabel = (d, isToday, isTomorrow) => {
    if (isToday) return { day: 'TODAY', date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) };
    if (isTomorrow) return { day: 'TOMORROW', date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) };
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    };
  };

  const dateOptions = [
    { value: formatDateStr(todayObj), ...formatLabel(todayObj, true, false) },
    { value: formatDateStr(tomorrowObj), ...formatLabel(tomorrowObj, false, true) },
    { value: formatDateStr(dayAfterObj), ...formatLabel(dayAfterObj, false, false) },
  ];

  const [selectedDate, setSelectedDate] = useState(dateOptions[0].value);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const movieData = await api.getMovieById(id);
        setMovie(movieData);

        const showtimeData = await api.getShowtimesForMovie(id, selectedDate);
        setShowtimes(showtimeData);
      } catch (err) {
        console.error('Failed to load movie details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, selectedDate]);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3 text-muted">Loading cinematic experience...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container text-center py-5">
        <h4 className="text-white">Movie Not Found</h4>
        <Link to="/" className="btn btn-gold rounded-pill mt-3 px-4">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  // Group showtimes by theater
  const showtimesByTheater = showtimes.reduce((acc, st) => {
    const thId = st.theater ? st.theater._id : 'unknown';
    if (!acc[thId]) {
      acc[thId] = {
        theater: st.theater,
        shows: [],
      };
    }
    acc[thId].shows.push(st);
    return acc;
  }, {});

  return (
    <div>
      {/* Movie Banner Backdrop */}
      <div
        className="position-relative py-5"
        style={{
          minHeight: '440px',
          backgroundImage: `linear-gradient(to bottom, rgba(9, 12, 16, 0.75) 0%, rgba(9, 12, 16, 0.96) 100%), url(${movie.bannerUrl || movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container position-relative z-1">
          <div className="row g-4 align-items-center">
            {/* Poster */}
            <div className="col-md-4 col-lg-3 text-center text-md-start">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="img-fluid rounded-4 shadow-lg border border-secondary border-opacity-50"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
            </div>

            {/* Movie Info */}
            <div className="col-md-8 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge badge-rating px-3 py-1">
                  <i className="bi bi-star-fill text-warning me-1"></i>
                  {movie.rating ? movie.rating.toFixed(1) : '8.5'} / 10
                </span>
                <span className="badge bg-dark border border-secondary text-light px-3 py-1">
                  {movie.ageRating}
                </span>
                <span className="badge badge-format px-3 py-1">
                  {movie.duration} MINS ({Math.floor(movie.duration / 60)}h {movie.duration % 60}m)
                </span>
              </div>

              <h1 className="display-5 fw-bold text-white brand-font mb-2">
                {movie.title}
              </h1>

              <div className="d-flex flex-wrap gap-2 text-muted mb-3 small">
                <span>Director: <strong className="text-white">{movie.director || 'Cinematic Team'}</strong></span>
                <span>•</span>
                <span>Languages: <strong className="text-white">{movie.language.join(', ')}</strong></span>
                <span>•</span>
                <span>Release: <strong className="text-white">{new Date(movie.releaseDate).toLocaleDateString()}</strong></span>
              </div>

              {/* Genre Pills */}
              <div className="d-flex flex-wrap gap-2 mb-4">
                {movie.genre.map((g) => (
                  <span key={g} className="badge bg-secondary bg-opacity-25 border border-secondary px-3 py-2 text-light">
                    {g}
                  </span>
                ))}
              </div>

              <p className="lead text-light text-opacity-80 fs-6 mb-4" style={{ maxWidth: '780px' }}>
                {movie.synopsis || movie.description}
              </p>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap gap-3">
                {movie.trailerUrl && (
                  <button
                    className="btn btn-outline-light rounded-pill px-4 py-2"
                    onClick={() => setShowTrailer(true)}
                  >
                    <i className="bi bi-play-circle-fill text-warning me-2 fs-5 align-middle"></i>
                    Watch Trailer
                  </button>
                )}
                {movie.isNowShowing && (
                  <a href="#showtimes-section" className="btn btn-gold rounded-pill px-4 py-2">
                    <i className="bi bi-ticket-perforated-fill me-2 align-middle"></i>
                    Select Showtime
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {/* Cast Section */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="mb-5">
            <h5 className="fw-bold text-white mb-3">
              <i className="bi bi-people-fill text-gold me-2"></i> Star Cast
            </h5>
            <div className="row g-3">
              {movie.cast.map((c) => (
                <div key={c.name} className="col-6 col-sm-4 col-md-3 col-lg-2">
                  <div className="p-3 bg-cinema-card rounded-4 border border-secondary border-opacity-25 text-center h-100">
                    <img
                      src={c.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt={c.name}
                      className="rounded-circle mb-2 object-fit-cover shadow"
                      style={{ width: '65px', height: '65px' }}
                    />
                    <h6 className="text-white small fw-bold mb-0 text-truncate">{c.name}</h6>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>{c.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Showtimes & Theaters Section */}
        <div id="showtimes-section" className="pt-3">
          {movie.isUpcoming ? (
            <div className="p-5 text-center bg-cinema-card rounded-4 border border-warning border-opacity-25 shadow-sm">
              <div className="fs-1 text-gold mb-3">🎬</div>
              <h4 className="text-white fw-bold mb-2">Upcoming Release — Advance Bookings Open Soon!</h4>
              <p className="text-muted mb-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
                This film is scheduled for theatrical release on <strong className="text-white">{new Date(movie.releaseDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>. Advance seat booking across all multiplexes will open 5 days prior to premiere.
              </p>
              {movie.trailerUrl && (
                <button
                  className="btn btn-gold rounded-pill px-4 py-2"
                  onClick={() => setShowTrailer(true)}
                >
                  <i className="bi bi-play-circle-fill me-2 fs-5 align-middle"></i>
                  Watch Official Trailer
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                  <h4 className="fw-bold text-white mb-1">
                    <i className="bi bi-calendar2-week text-gold me-2"></i> Select Showtime & Theater
                  </h4>
                  <p className="text-muted small mb-0">Choose your preferred screening time and seat format</p>
                </div>

                {/* Date Selector Tabs */}
                <div className="d-flex gap-2">
                  {dateOptions.map((d) => (
                    <button
                      key={d.value}
                      className={`btn rounded-3 px-3 py-2 text-center border ${selectedDate === d.value ? 'btn-gold border-warning' : 'bg-cinema-card text-light border-secondary border-opacity-50'}`}
                      onClick={() => setSelectedDate(d.value)}
                    >
                      <div className="small fw-bold">{d.day}</div>
                      <div style={{ fontSize: '0.75rem' }}>{d.date}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Showtimes Listing */}
              {Object.keys(showtimesByTheater).length === 0 ? (
                <div className="text-center py-5 bg-cinema-card rounded-4 border border-secondary border-opacity-25">
                  <i className="bi bi-calendar-x fs-1 text-muted"></i>
                  <h5 className="mt-3 text-white">No Showtimes Available For This Date</h5>
                  <p className="text-muted small">Try selecting another date or check back later.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {Object.values(showtimesByTheater).map(({ theater, shows }) => (
                    <div
                      key={theater ? theater._id : Math.random()}
                      className="p-4 rounded-4 bg-cinema-card border border-secondary border-opacity-25 shadow-sm"
                    >
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
                        <div>
                          <h5 className="text-white fw-bold mb-1">
                            <i className="bi bi-building text-gold me-2"></i>
                            {theater ? theater.name : 'IMovies Cineplex'}
                          </h5>
                          <span className="text-muted small">
                            <i className="bi bi-geo-alt me-1 text-danger"></i>
                            {theater ? theater.address : 'Central Mall'}
                          </span>
                        </div>

                        {/* Facilities badges */}
                        {theater && theater.facilities && (
                          <div className="d-flex flex-wrap gap-1">
                            {theater.facilities.map((f) => (
                              <span
                                key={f}
                                className="badge bg-dark text-secondary border border-secondary border-opacity-25"
                                style={{ fontSize: '0.68rem' }}
                              >
                                <i className="bi bi-check2 text-success me-1"></i> {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Showtime Slots */}
                      <div className="d-flex flex-wrap gap-3">
                        {shows.map((show) => {
                          const avail = show.availableSeats !== undefined ? show.availableSeats : 70;
                          const isAlmostFull = avail < 15;
                          return (
                            <button
                              key={show._id}
                              className="btn btn-outline-secondary text-light p-3 rounded-3 text-start position-relative hover-lift border-secondary border-opacity-50"
                              style={{ minWidth: '150px' }}
                              onClick={() => navigate(`/booking/${show._id}`)}
                            >
                              <div className="fw-bold fs-6 text-white mb-1">
                                {show.startTime}
                              </div>
                              <div className="badge badge-format mb-1">
                                {show.format}
                              </div>
                              <div className="small text-muted d-flex justify-content-between gap-2 mt-1">
                                <span>₹{show.basePrice || 250}</span>
                                <span className={isAlmostFull ? 'text-danger' : 'text-success'}>
                                  {avail} left
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <TrailerModal
          trailerUrl={movie.trailerUrl}
          movieTitle={movie.title}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
}
