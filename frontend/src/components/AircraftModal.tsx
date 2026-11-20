import { useEffect } from 'react';
import type { AircraftModel } from '../types/aviation';

interface AircraftModalProps {
  aircraft: AircraftModel;
  onClose: () => void;
}

export function AircraftModal({ aircraft, onClose }: AircraftModalProps) {

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Start listening when the modal mounts
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function: stop listening when the modal unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    /* Clicking the dark backdrop closes the modal */
    <div className="modal-backdrop" onClick={onClose}>
      {/* stopPropagation() prevents clicks INSIDE the card from closing it */}
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge">{aircraft.aircraftClass}</span>
            <h2 className="modal-title">{aircraft.modelName}</h2>
            <p className="modal-subtitle">
              {aircraft.manufacturer} &bull; {aircraft.headquarters}
            </p>
          </div>

          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="spec-grid">
          <div className="spec-item">
            <div className="spec-label">Max Cruise Speed</div>
            <div className="spec-value">{aircraft.maxSpeedKnots} knots</div>
          </div>

          <div className="spec-item">
            <div className="spec-label">Max Range</div>
            <div className="spec-value">{aircraft.maxRangeNm.toLocaleString()} nm</div>
          </div>

          <div className="spec-item">
            <div className="spec-label">Passenger Capacity</div>
            <div className="spec-value">
              {aircraft.passengerCapacity != null
                ? `${aircraft.passengerCapacity} seats`
                : 'Unknown'}
            </div>
          </div>

          <div className="spec-item">
            <div className="spec-label">Unit List Price</div>
            <div className="spec-value">${aircraft.priceMillionsUsd?.toFixed(1)}M</div>
          </div>

          <div className="spec-item" style={{ gridColumn: '1 / -1' }}>
            <div className="spec-label">Cost Per Seat</div>
            <div className="spec-value">
              {aircraft.costPerSeatMillionsUsd != null
                ? `$${aircraft.costPerSeatMillionsUsd.toFixed(3)}M / seat`
                : 'Unknown'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}