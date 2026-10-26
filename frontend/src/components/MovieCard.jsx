import React from 'react';
import { Link } from 'react-router-dom';

export default function MovieCard({ movie, onOpenTrailer }) {
  const formatDuration = (mins) => {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    return `${hours}h ${m}m`;
  };

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
      <div className="card movie-card h-100 shadow-sm">
        {/* Poster Container */}
        <div className="position-relative overflow-hidden">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="card-img-top poster-img w-100"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {/* Rating Pill */}
          <div className="position-absolute top-0 start-0 m-2">
            <span className="badge badge-rating px-2 py-1 shadow d-flex align-items-center gap-1">
              <i className="bi bi-star-fill text-warning"></i>
              <span>{movie.rating ? movie.rating.toFixed(1) : '8.5'}</span>
            </span>
          </div>

          {/* Age Rating Pill */}
          <div className="position-absolute top-0 end-0 m-2">
            <span className="badge bg-dark bg-opacity-75 border border-secondary text-light px-2 py-1 shadow">
              {movie.ageRating || 'UA'}
            </span>
          </div>

          {/* Quick Trailer Button Overlay */}
          {movie.trailerUrl && (
            <button
              onClick={() => onOpenTrailer(movie.trailerUrl, movie.title)}
              className="btn btn-sm btn-dark bg-opacity-75 border-0 position-absolute bottom-0 end-0 m-2 rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: '38px', height: '38px' }}
              title="Watch Trailer"
            >
              <i className="bi bi-play-fill fs-5 text-warning"></i>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="card-body d-flex flex-column justify-content-between p-3">
          <div>
            <h6 className="card-title fw-bold text-white mb-1 text-truncate" title={movie.title}>
              {movie.title}
            </h6>
            
            <div className="d-flex align-items-center gap-2 text-muted small mb-2">
              <span><i className="bi bi-clock me-1"></i>{formatDuration(movie.duration)}</span>
              <span>•</span>
              <span className="text-truncate" style={{ maxWidth: '120px' }}>
                {Array.isArray(movie.language) ? movie.language.join(', ') : movie.language}
              </span>
            </div>

            {/* Genres */}
            <div className="d-flex flex-wrap gap-1 mb-3">
              {(movie.genre || []).slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25"
                  style={{ fontSize: '0.7rem' }}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div>
            <Link
              to={`/movie/${movie._id}`}
              className="btn btn-gold w-100 btn-sm rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
            >
              <i className="bi bi-ticket-perforated-fill"></i>
              <span>{movie.isUpcoming ? 'View Details' : 'Book Tickets'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
