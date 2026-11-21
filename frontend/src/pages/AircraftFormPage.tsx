import { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import type { AircraftModel, CreateCommercialPayload, UpdateCommercialPayload } from '../types/aviation';

interface AircraftFormPageProps {
  items: AircraftModel[];
  onSaved: (savedItem: AircraftModel) => void;
}

export function AircraftFormPage({ items, onSaved }: AircraftFormPageProps) {
  // 1. If URL is /manage/edit/5, id is "5". If /manage/new, id is undefined.
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isEditMode = pathname.includes('/edit/');

  const modelId = Number(id);

  const aircraft = items.find((m) => m.modelId === modelId);

  const [passengerCapacity, setPassengerCapacity] = useState('');
  const [priceMillionsUsd, setPriceMillionsUsd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (aircraft && isEditMode) {
      setPassengerCapacity(aircraft.passengerCapacity != null ? String(aircraft.passengerCapacity) : '');
      setPriceMillionsUsd(aircraft.priceMillionsUsd != null ? String(aircraft.priceMillionsUsd) : '');
    }
  }, [aircraft, isEditMode]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const parsedSeats = passengerCapacity === '' ? null : Number(passengerCapacity);
    const parsedPrice = priceMillionsUsd === '' ? null : Number(priceMillionsUsd);

    if (parsedSeats === null && parsedPrice === null) {
      setError('Please enter at least a passenger capacity or a unit price.');
      setSubmitting(false);
      return;
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const url = isEditMode ? `${baseUrl}/aircraftcommercial/${id}` : `${baseUrl}/aircraftcommercial`;
    const method = isEditMode ? 'PUT' : 'POST';

    const payload: CreateCommercialPayload | UpdateCommercialPayload = isEditMode
      ? { passengerCapacity: parsedSeats, priceMillionsUsd: parsedPrice }
      : { modelId, passengerCapacity: parsedSeats, priceMillionsUsd: parsedPrice };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Save failed (HTTP ${response.status})`);
      }

      const savedRecord: AircraftModel = await response.json();
      onSaved(savedRecord);
      navigate('/manage');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save commercial specs.');
    } finally {
      setSubmitting(false);
    }
  };

  // Guard against direct URL refresh while App.tsx is still loading items
  if (isEditMode && items.length === 0) {
    return <div className="empty-state">Loading record details...</div>;
  }

  if (!aircraft) {
    return (
      <div className="empty-state">
        <p style={{ marginBottom: '1rem' }}>Aircraft model #{id} not found.</p>
        <Link to="/manage" className="nav-link">← Back to Manage Fleet</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/manage" className="nav-link">
          ← Back to List
        </Link>
      </div>

      <div className="kpi-card">
        <span className="badge">{aircraft.aircraftClass}</span>
        <h2 style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
          {isEditMode ? 'Edit Commercial Specs' : 'Add Commercial Specs'}
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
          {aircraft.manufacturer} <strong>{aircraft.modelName}</strong> &bull; Max Range:{' '}
          {aircraft.maxRangeNm.toLocaleString()} nm
        </p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label className="kpi-label" style={{ display: 'block' }}>Passenger Capacity (Seats)</label>
            <input
              type="number"
              min="0"
              step="1"
              className="search-input"
              style={{ width: '100%' }}
              placeholder="e.g. 180 (leave blank for cargo/unknown)"
              value={passengerCapacity}
              onChange={(e) => setPassengerCapacity(e.target.value)}
            />
          </div>

          <div>
            <label className="kpi-label" style={{ display: 'block' }}>Price ($M)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="search-input"
              style={{ width: '100%' }}
              placeholder="e.g. 115.50"
              value={priceMillionsUsd}
              onChange={(e) => setPriceMillionsUsd(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="tab-btn active" disabled={submitting}>
              {submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Commercial Specs'}
            </button>
            <Link to="/manage" className="page-btn" style={{ textDecoration: 'none' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}