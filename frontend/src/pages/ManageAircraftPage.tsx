import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { AircraftModel } from '../types/aviation';
import { useSortableData } from '../utils/useSortableData';
import { usePagination } from '../utils/usePagination';
import { TablePagination } from '../components/TablePagination';

interface ManageAircraftPageProps {
  aircraftModels: AircraftModel[];
  loading: boolean;
  onAircraftDeleted: (deletedModelId: number) => void;
}

export function ManageAircraftPage({
  aircraftModels,
  loading,
  onAircraftDeleted,
}: ManageAircraftPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 1. Live search filter
  const query = searchQuery.toLowerCase();
  const filteredModels = aircraftModels.filter(
    (m) =>
      m.modelName.toLowerCase().includes(query) ||
      m.manufacturer.toLowerCase().includes(query) ||
      m.aircraftClass.toLowerCase().includes(query)
  );

  // 2. Reuse your existing sorting & pagination hooks!
  const { sortedItems, requestSort, getSortArrow } = useSortableData(
    filteredModels,
    'modelName',
    'asc'
  );

  const {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage,
    totalItems,
    itemsPerPage,
  } = usePagination(sortedItems, 10);

  // 3. Delete handler calling your C# DELETE /api/aircraft/{modelId} endpoint
  const handleDelete = async (model: AircraftModel) => {
    const confirmed = window.confirm(
      `Delete ${model.manufacturer} ${model.modelName}? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(model.modelId);
    setDeleteError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/aircraftcommercial/${model.modelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete record (HTTP ${response.status})`);
      }

      // Sync master state in App.tsx immediately
      onAircraftDeleted(model.modelId);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Top Toolbar: Search on left, "+ Add Aircraft" button on right */}
      <section className="toolbar-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search manufacturer, model, or class..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Link
          to="/manage/new"
          className="tab-btn active"
          style={{ textDecoration: 'none' }}
        >
          + Add Aircraft Model
        </Link>
      </section>

      {deleteError && <div className="error-banner">{deleteError}</div>}

      <section className="table-card">
        {loading ? (
          <div className="empty-state">Loading aircraft catalog...</div>
        ) : paginatedItems.length === 0 ? (
          <div className="empty-state">No aircraft models match your search.</div>
        ) : (
          <>
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
                  <th className="sortable-th" onClick={() => requestSort('passengerCapacity')}>
                    Seats{getSortArrow('passengerCapacity')}
                  </th>
                  <th className="sortable-th" onClick={() => requestSort('priceMillionsUsd')}>
                    Price ($M){getSortArrow('priceMillionsUsd')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((model) => (
                  <tr key={model.modelId}>
                    <td>{model.manufacturer}</td>
                    <td><strong>{model.modelName}</strong></td>
                    <td>
                      <span className="badge">{model.aircraftClass}</span>
                    </td>
                    <td>{model.passengerCapacity ?? '-'}</td>
                    <td>
                      {model.priceMillionsUsd != null
                        ? `$${model.priceMillionsUsd.toFixed(1)}M`
                        : '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(model.priceMillionsUsd == null && model.passengerCapacity == null) && (
                          <Link
                            to={`/manage/new/${model.modelId}`}
                            className="tab-btn active"
                            style={{ textDecoration: 'none' }}
                          >
                            + Add Commercial Specs
                          </Link>
                        )}

                        {(model.priceMillionsUsd != null || model.passengerCapacity != null) && (
                          <>
                          <Link
                            to={`/manage/edit/${model.modelId}`}
                            className="page-btn"
                            style={{ textDecoration: 'none' }}
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="delete-btn"
                            disabled={deletingId === model.modelId}
                            onClick={() => handleDelete(model)}
                          >
                            {deletingId === model.modelId ? 'Deleting...' : 'Delete'}
                          </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>
    </div>
  );
}