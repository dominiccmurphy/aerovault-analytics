import type { AirlineAirspace } from '../types/aviation';
import { formatDate } from '../utils/formatters';

interface AirlinesTableProps {
  airlines: AirlineAirspace[];
}

export function AirlinesTable({ airlines }: AirlinesTableProps) {
  if (airlines.length === 0) {
    return <div className="empty-state">No matching airlines found.</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>ICAO</th>
          <th>Airline</th>
          <th>Active Aircraft</th>
          <th>Avg Velocity (m/s)</th>
          <th>Snapshot Date</th>
        </tr>
      </thead>
      <tbody>
        {airlines.map((airline) => (
          <tr key={`${airline.icaoCode}-${airline.snapshotDate}`}>
            <td>
              <span className="badge">{airline.icaoCode}</span>
            </td>
            <td><strong>{airline.airlineName}</strong></td>
            <td>{airline.activeAircraftCount.toLocaleString()}</td>
            <td>{airline.avgVelocityMs.toFixed(1)} m/s</td>
            <td>{formatDate(airline.snapshotDate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}