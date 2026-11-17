import type { AirlineAirspace } from '../types/aviation';
import { formatDate } from '../utils/formatters';
import { useSortableData } from '../utils/useSortableData';

interface AirlinesTableProps {
  airlines: AirlineAirspace[];
}

export function AirlinesTable({ airlines }: AirlinesTableProps) {
  const { sortedItems, requestSort, getSortArrow } = useSortableData(
    airlines,
    'activeAircraftCount'
  );

  if (airlines.length === 0) {
    return <div className="empty-state">No matching airlines found.</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th className="sortable-th" onClick={() => requestSort('icaoCode')}>
            <span className="badge">ICAO</span>{getSortArrow('icaoCode')}
          </th>
          <th className="sortable-th" onClick={() => requestSort('airlineName')}>
            Airline{getSortArrow('airlineName')}
          </th>
          <th className="sortable-th" onClick={() => requestSort('activeAircraftCount')}>
            Active Aircraft{getSortArrow('activeAircraftCount')}
          </th>
          <th className="sortable-th" onClick={() => requestSort('avgVelocityMs')}>
            Avg Velocity (m/s){getSortArrow('avgVelocityMs')}
          </th>
          <th className="sortable-th" onClick={() => requestSort('snapshotDate')}>
            Snapshot Date{getSortArrow('snapshotDate')}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedItems.map((airline) => (
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