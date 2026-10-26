import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';

export default function HomePage({ searchTerm = '' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'now-showing';

  const [activeTab, setActiveTab] = useState(activeTabParam);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trailerData, setTrailerData] = useState({ open: false, url: '', title: '' });

  const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'History', 'Crime', 'Biography'];

  useEffect(() => {
    setActiveTab(activeTabParam);
  }, [activeTabParam]);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const filters = {
          status: activeTab === 'upcoming' ? 'upcoming' : 'now-showing',
          genre: selectedGenre,
          search: searchTerm,
        };
        const data = await api.getMovies(filters);
        setMovies(data);
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [activeTab, selectedGenre, searchTerm]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleOpenTrailer = (url, title) => {
    setTrailerData({ open: true, url, title });
  };

  const handleCloseTrailer = () => {
    setTrailerData({ open: false, url: '', title: '' });
  };

  return (
    <div>
      {/* Hero Carousel */}
      <div id="heroCinemaCarousel" className="carousel slide carousel-fade mb-5" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#heroCinemaCarousel" data-bs-slide-to="0" className="active"></button>
          <button type="button" data-bs-target="#heroCinemaCarousel" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#heroCinemaCarousel" data-bs-slide-to="2"></button>
        </div>

        <div className="carousel-inner" style={{ maxHeight: '500px' }}>
          {/* Slide 1: Dune 2 */}
          <div className="carousel-item active position-relative">
            <div
              style={{
                height: '480px',
                backgroundImage: `linear-gradient(to right, rgba(9,12,16,0.95) 20%, rgba(9,12,16,0.4) 60%, rgba(9,12,16,0.9) 100%), url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="container h-100 d-flex align-items-center">
                <div className="col-lg-6 col-md-8">
                  <span className="badge badge-format mb-2 px-3 py-1 text-uppercase">
                    Now in IMAX 3D & 4DX
                  </span>
                  <h1 className="display-4 fw-extrabold text-white brand-font mb-2">
                    DUNE: PART TWO
                  </h1>
                  <p className="text-light text-opacity-75 lead fs-6 mb-3">
                    Experience Denis Villeneuve's cinematic masterpiece on our giant laser screens with ground-shaking Dolby Atmos audio.
                  </p>
                  <div className="d-flex gap-3">
                    <button
                      className="btn btn-gold rounded-pill px-4 py-2"
                      onClick={() => handleTabChange('now-showing')}
                    >
                      <i className="bi bi-ticket-perforated-fill me-2"></i> Book Tickets
                    </button>
                    <button
                      className="btn btn-outline-light rounded-pill px-4 py-2"
                      onClick={() => handleOpenTrailer('https://www.youtube.com/embed/Way9Dexny3w', 'Dune: Part Two')}
                    >
                      <i className="bi bi-play-circle me-2 text-warning"></i> Watch Trailer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2: Oppenheimer */}
          <div className="carousel-item position-relative">
            <div
              style={{
                height: '480px',
                backgroundImage: `linear-gradient(to right, rgba(9,12,16,0.95) 20%, rgba(9,12,16,0.4) 60%, rgba(9,12,16,0.9) 100%), url('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="container h-100 d-flex align-items-center">
                <div className="col-lg-6 col-md-8">
                  <span className="badge badge-rating mb-2 px-3 py-1">
                    <i className="bi bi-award-fill me-1"></i> 7x ACADEMY AWARD WINNER
                  </span>
                  <h1 className="display-4 fw-extrabold text-white brand-font mb-2">
                    OPPENHEIMER
                  </h1>
                  <p className="text-light text-opacity-75 lead fs-6 mb-3">
                    Directed by Christopher Nolan. A pulse-pounding look into the mind behind the Manhattan Project.
                  </p>
                  <div className="d-flex gap-3">
                    <button
                      className="btn btn-gold rounded-pill px-4 py-2"
                      onClick={() => handleTabChange('now-showing')}
                    >
                      <i className="bi bi-ticket-perforated-fill me-2"></i> Book Tickets
                    </button>
                    <button
                      className="btn btn-outline-light rounded-pill px-4 py-2"
                      onClick={() => handleOpenTrailer('https://www.youtube.com/embed/uYPbbksJxIg', 'Oppenheimer')}
                    >
                      <i className="bi bi-play-circle me-2 text-warning"></i> Watch Trailer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 3: Avatar 3 */}
          <div className="carousel-item position-relative">
            <div
              style={{
                height: '480px',
                backgroundImage: `linear-gradient(to right, rgba(9,12,16,0.95) 20%, rgba(9,12,16,0.4) 60%, rgba(9,12,16,0.9) 100%), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="container h-100 d-flex align-items-center">
                <div className="col-lg-6 col-md-8">
                  <span className="badge bg-danger bg-opacity-75 mb-2 px-3 py-1 text-uppercase">
                    Upcoming Blockbuster
                  </span>
                  <h1 className="display-4 fw-extrabold text-white brand-font mb-2">
                    AVATAR: FIRE & ASH
                  </h1>
                  <p className="text-light text-opacity-75 lead fs-6 mb-3">
                    Return to Pandora and discover the volcanic regions and ruthless new clans in James Cameron's breathtaking visual spectacle.
                  </p>
                  <div className="d-flex gap-3">
                    <button
                      className="btn btn-gold rounded-pill px-4 py-2"
                      onClick={() => handleTabChange('upcoming')}
                    >
                      <i className="bi bi-bell-fill me-2"></i> Explore Releases
                    </button>
                    <button
                      className="btn btn-outline-light rounded-pill px-4 py-2"
                      onClick={() => handleOpenTrailer('https://www.youtube.com/embed/d9MyW72ELq0', 'Avatar: Fire and Ash')}
                    >
                      <i className="bi bi-play-circle me-2 text-warning"></i> Watch Teaser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button className="carousel-control-prev" type="button" data-bs-target="#heroCinemaCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCinemaCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      {/* Main Container */}
      <div className="container">
        {/* Navigation Tabs & Filter Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
          {/* Status Tabs */}
          <ul className="nav nav-pills gap-2">
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 py-2 fw-bold ${activeTab === 'now-showing' ? 'btn-gold text-dark' : 'text-light bg-dark bg-opacity-50'}`}
                onClick={() => handleTabChange('now-showing')}
              >
                <i className="bi bi-play-btn-fill me-2"></i> Now Showing
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 py-2 fw-bold ${activeTab === 'upcoming' ? 'btn-gold text-dark' : 'text-light bg-dark bg-opacity-50'}`}
                onClick={() => handleTabChange('upcoming')}
              >
                <i className="bi bi-calendar-event me-2"></i> Coming Soon
              </button>
            </li>
          </ul>

          {/* Genre Filters */}
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="text-muted small me-1">
              <i className="bi bi-funnel"></i> Genre:
            </span>
            {genres.map((g) => (
              <button
                key={g}
                className={`btn btn-sm rounded-pill px-3 py-1 ${selectedGenre === g ? 'btn-outline-gold active' : 'btn-outline-secondary text-light border-opacity-25'}`}
                onClick={() => setSelectedGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Search Notice */}
        {searchTerm && (
          <div className="mb-3 text-muted small">
            Showing search results for <strong className="text-gold">"{searchTerm}"</strong>
          </div>
        )}

        {/* Movie Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
            <p className="mt-3 text-muted">Loading cinema catalogue...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-5 bg-cinema-card rounded-4 border border-secondary border-opacity-25">
            <i className="bi bi-film fs-1 text-muted"></i>
            <h5 className="mt-3 text-white">No Movies Found</h5>
            <p className="text-muted small">Try selecting another genre or clearing the search query.</p>
            <button
              className="btn btn-sm btn-outline-gold rounded-pill px-3"
              onClick={() => {
                setSelectedGenre('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {movies.map((movie) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onOpenTrailer={handleOpenTrailer}
              />
            ))}
          </div>
        )}

        {/* Cinema Experience Pillars */}
        <div className="row g-4 mt-5 pt-4">
          <div className="col-12 text-center mb-2">
            <span className="text-gold text-uppercase fw-bold small letter-spacing">
              The IMovies Standard
            </span>
            <h3 className="fw-bold text-white mt-1">Why Choose The IMovies?</h3>
          </div>

          <div className="col-md-3 col-6 text-center">
            <div className="p-4 rounded-4 bg-cinema-card border border-secondary border-opacity-25 h-100">
              <i className="bi bi-badge-4k text-warning fs-1"></i>
              <h6 className="fw-bold text-white mt-3 mb-1">4K Laser Clarity</h6>
              <p className="small text-muted mb-0">Ultra-crisp contrast and radiant RGB laser brightness.</p>
            </div>
          </div>

          <div className="col-md-3 col-6 text-center">
            <div className="p-4 rounded-4 bg-cinema-card border border-secondary border-opacity-25 h-100">
              <i className="bi bi-speaker text-warning fs-1"></i>
              <h6 className="fw-bold text-white mt-3 mb-1">Dolby Atmos Audio</h6>
              <p className="small text-muted mb-0">Immersive multidimensional acoustic spatial soundscapes.</p>
            </div>
          </div>

          <div className="col-md-3 col-6 text-center">
            <div className="p-4 rounded-4 bg-cinema-card border border-secondary border-opacity-25 h-100">
              <i className="bi bi-ticket-perforated text-warning fs-1"></i>
              <h6 className="fw-bold text-white mt-3 mb-1">Instant QR Tickets</h6>
              <p className="small text-muted mb-0">Skip the ticket box office with frictionless mobile scan entry.</p>
            </div>
          </div>

          <div className="col-md-3 col-6 text-center">
            <div className="p-4 rounded-4 bg-cinema-card border border-secondary border-opacity-25 h-100">
              <i className="bi bi-shield-lock text-warning fs-1"></i>
              <h6 className="fw-bold text-white mt-3 mb-1">Live Seat Locking</h6>
              <p className="small text-muted mb-0">Zero double-bookings with real-time atomic reservation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {trailerData.open && (
        <TrailerModal
          trailerUrl={trailerData.url}
          movieTitle={trailerData.title}
          onClose={handleCloseTrailer}
        />
      )}
    </div>
  );
}
