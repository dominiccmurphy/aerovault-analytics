import type { CountryAirspace } from '../types/aviation';
import { formatDate } from '../utils/formatters';
import { useSortableData } from '../utils/useSortableData';
import { Pagination } from './Pagination';
import { usePagination } from '../utils/usePagination';

interface CountriesTableProps {
  countries: CountryAirspace[];
}

export function CountriesTable({ countries }: CountriesTableProps) {
  const { sortedItems, requestSort, getSortArrow } = useSortableData(
    countries,
    'activeAircraftCount'
  );

  // Slice the sorted list into pages of 10
  const {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage,
    totalItems,
    itemsPerPage,
  } = usePagination(sortedItems, 10);

  if (countries.length === 0) {
    return <div className="empty-state">No matching countries found.</div>;
  }

  return (
    <>
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
        {paginatedItems.map((country) => (
          <tr key={`${country.originCountry}-${country.snapshotDate}`}>
            <td><strong>{country.originCountry}</strong></td>
            <td>{country.activeAircraftCount.toLocaleString()}</td>
            <td>{country.avgVelocityMs.toFixed(1)} m/s</td>
            <td>{formatDate(country.snapshotDate)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
}