import type { CountryAirspace } from '../types/aviation';
import { formatDate } from '../utils/formatters';

interface CountriesTableProps {
  countries: CountryAirspace[];
}

export function CountriesTable({ countries }: CountriesTableProps) {
  if (countries.length === 0) {
    return <div className="empty-state">No matching countries found.</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Origin Country</th>
          <th>Active Aircraft</th>
          <th>Avg Velocity (m/s)</th>
          <th>Snapshot Date</th>
        </tr>
      </thead>
      <tbody>
        {countries.map((country) => (
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