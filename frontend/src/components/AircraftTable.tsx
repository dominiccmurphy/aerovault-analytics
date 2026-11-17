import type { AircraftModel } from '../types/aviation';
import { useSortableData } from '../utils/useSortableData';

interface AircraftTableProps {
  models: AircraftModel[];
}

export function AircraftTable({ models }: AircraftTableProps) {
  const { sortedItems, requestSort, getSortArrow } = useSortableData(
      models,
      'modelName'
    );

  if (models.length === 0) {
    return <div className="empty-state">No matching aircraft models found.</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th className="sortable-th" onClick={() => requestSort('manufacturer')}>
            Manufacturer{getSortArrow('manufacturer')}
          </th>
          <th className="sortable-th" onClick={() => requestSort('modelName')}>
            Model{getSortArrow('modelName')}
          </th>
          <th className="sortable-th" onClick={() => requestSort('aircraftClass')}>
            Class{getSortArrow('aircraftClass')}
          </th>
          <th className="sortable-th" onClick={() => requestSort('maxSpeedKnots')}>
            Max Speed (kts){getSortArrow('maxSpeedKnots')}
          </th>
          <th className="sortable-th" onClick={() => requestSort('maxRangeNm')}>
            Range (nm){getSortArrow('maxRangeNm')}
          </th>
          <th className="sortable-th" onClick={() => requestSort('passengerCapacity')}>
            Seats{getSortArrow('passengerCapacity')}
          </th>
          <th className="sortable-th" onClick={() => requestSort('priceMillionsUsd')}>
            Price ($M){getSortArrow('priceMillionsUsd')}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedItems.map((model) => (
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