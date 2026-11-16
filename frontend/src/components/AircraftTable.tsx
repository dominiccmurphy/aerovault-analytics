import type { AircraftModel } from '../types/aviation';

interface AircraftTableProps {
  models: AircraftModel[];
}

export function AircraftTable({ models }: AircraftTableProps) {
  if (models.length === 0) {
    return <div className="empty-state">No matching aircraft models found.</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Manufacturer</th>
          <th>Model</th>
          <th>Class</th>
          <th>Max Speed</th>
          <th>Range</th>
          <th>Seats</th>
          <th>Price ($M)</th>
        </tr>
      </thead>
      <tbody>
        {models.map((model) => (
          <tr key={model.modelId}>
            <td>{model.manufacturer}</td>
            <td><strong>{model.modelName}</strong></td>
            <td>
              <span className="badge">{model.aircraftClass}</span>
            </td>
            <td>{model.maxSpeedKnots} kts</td>
            <td>{model.maxRangeNm.toLocaleString()} nm</td>
            <td>{model.passengerCapacity}</td>
            <td>${model.priceMillionsUsd.toFixed(1)}M</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}