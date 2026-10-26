import React from 'react';

export default function TrailerModal({ trailerUrl, movieTitle, onClose }) {
  if (!trailerUrl) return null;

  // Convert watch?v= to embed/ if needed
  let embedUrl = trailerUrl;
  if (embedUrl.includes('watch?v=')) {
    embedUrl = embedUrl.replace('watch?v=', 'embed/');
  }

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1060 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-cinema-card border-secondary shadow-lg">
          <div className="modal-header border-secondary border-opacity-25 py-2 px-3">
            <h6 className="modal-title text-light fw-bold">
              <i className="bi bi-play-circle text-gold me-2"></i>
              {movieTitle} — Official Trailer
            </h6>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-0">
            <div className="ratio ratio-16x9">
              <iframe
                src={`${embedUrl}?autoplay=1`}
                title={`${movieTitle} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
