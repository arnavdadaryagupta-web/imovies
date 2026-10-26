import React from 'react';

export default function SeatMatrix({ seatMatrix = [], selectedSeats = [], onToggleSeat }) {
  const isSelected = (seatNumber) => {
    return selectedSeats.some((s) => s.seatNumber === seatNumber);
  };

  return (
    <div className="seat-matrix-container p-4 bg-cinema-card rounded-4 border border-secondary border-opacity-25 shadow">
      {/* Screen Graphic */}
      <div className="cinema-screen-wrap mb-4">
        <div className="cinema-screen mx-auto" style={{ maxWidth: '650px' }}></div>
        <div className="cinema-screen-label text-center mt-2">
          <i className="bi bi-display me-2 text-warning"></i>
          ALL EYES THIS WAY • CINEMA SCREEN
        </div>
      </div>

      {/* Seating Grid */}
      <div className="d-flex flex-column align-items-center gap-2 overflow-auto py-2">
        {seatMatrix.map((tierGroup) => {
          const { row, tier, price, seats } = tierGroup;
          return (
            <div key={row} className="d-flex align-items-center gap-2">
              {/* Row Label */}
              <span
                className="text-muted fw-bold text-center"
                style={{ width: '24px', fontSize: '0.8rem' }}
              >
                {row}
              </span>

              {/* Seats in this row */}
              <div className="d-flex flex-wrap justify-content-center">
                {seats.map((seat, index) => {
                  const selected = isSelected(seat.seatNumber);
                  let stateClass = 'available-standard';
                  if (tier === 'VIP') stateClass = 'available-vip';
                  else if (tier === 'Premium') stateClass = 'available-premium';

                  if (seat.isReserved) stateClass = 'reserved';
                  else if (selected) stateClass = 'selected';

                  return (
                    <React.Fragment key={seat.seatNumber}>
                      {/* Cinema aisle gap between column 5 and 6 */}
                      {index === 5 && <div style={{ width: '24px' }}></div>}

                      <button
                        type="button"
                        className={`seat-btn ${stateClass}`}
                        disabled={seat.isReserved}
                        onClick={() => onToggleSeat(seat)}
                        title={`${seat.seatNumber} (${tier} - ₹${price}) ${seat.isReserved ? '[SOLD OUT]' : ''}`}
                      >
                        {seat.col}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Row Price badge */}
              <span
                className="badge bg-dark text-secondary border border-secondary border-opacity-25 d-none d-sm-inline-block"
                style={{ width: '68px', fontSize: '0.65rem' }}
              >
                ₹{price}
              </span>
            </div>
          );
        })}
      </div>

      <hr className="border-secondary border-opacity-25 my-4" />

      {/* Legend */}
      <div className="d-flex flex-wrap justify-content-center gap-4 text-muted small">
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn available-standard" style={{ width: '22px', height: '22px' }}></div>
          <span>Standard (₹250)</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn available-premium" style={{ width: '22px', height: '22px' }}></div>
          <span>Premium (₹300)</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn available-vip" style={{ width: '22px', height: '22px' }}></div>
          <span>VIP Recliner (₹375)</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn selected" style={{ width: '22px', height: '22px' }}></div>
          <span className="text-white fw-bold">Selected</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn reserved" style={{ width: '22px', height: '22px' }}></div>
          <span>Sold Out</span>
        </div>
      </div>
    </div>
  );
}
