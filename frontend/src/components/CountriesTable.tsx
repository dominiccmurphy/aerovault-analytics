import type { CountryAirspace } from '../types/aviation';
import { formatDate } from '../utils/formatters';
import { useSortableData } from '../utils/useSortableData';

interface CountriesTableProps {
  countries: CountryAirspace[];
}

export function CountriesTable({ countries }: CountriesTableProps) {
  const { sortedItems, requestSort, getSortArrow } = useSortableData(
    countries,
    'activeAircraftCount'
  );

  if (countries.length === 0) {
    return <div className="empty-state">No matching countries found.</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th className="sortable-th" onClick={() => requestSort('originCountry')}>
            Origin Country{getSortArrow('originCountry')}
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
        {sortedItems.map((country) => (
          <tr key={`${country.originCountry}-${country.snapshotDate}`}>
            <td><strong>{country.originCountry}</strong></td>
            <td>{country.activeAircraftCount.toLocaleString()}</td>
            <td>{country.avgVelocityMs.toFixed(1)} m/s</td>
            <td>{formatDate(country.snapshotDate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}