import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { AircraftModel, CreateCommercialPayload, UpdateCommercialPayload } from '../types/aviation';

interface AircraftFormPageProps {
  items: AircraftModel[];
  onSaved: (savedItem: AircraftModel) => void;
}

export function AircraftFormPage({ items, onSaved }: AircraftFormPageProps) {
  // 1. If URL is /manage/edit/5, id is "5". If /manage/new, id is undefined.
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id) && items.find((item) => item.modelId === Number(id) && (item.priceMillionsUsd != null || item.passengerCapacity != null));

  // Find the existing item when editing
  const existingItem = isEditMode
    ? items.find((item) => item.modelId === Number(id))
    : undefined;

  //const [name, setName] = useState('');
  const [passengerCapacityVal, setPassengerCapacityVal] = useState('');
  const [priceMillionsUsdVal, setPriceMillionsUsdVal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 2. Populate form fields once existingItem is available
  // (This also handles page refreshes on /manage/edit/:id once App.tsx finishes fetching!)
  useEffect(() => {
    if (existingItem) {
      //setName(existingItem.modelName);
      setPriceMillionsUsdVal(existingItem.priceMillionsUsd != null ? String(existingItem.priceMillionsUsd) : '');
      setPassengerCapacityVal(existingItem.passengerCapacity != null ? String(existingItem.passengerCapacity) : '');
    }
  }, [existingItem]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const baseUrl = 'http://localhost:5000/api';
    const url = isEditMode ? `${baseUrl}/aircraftcommercial/${id}` : `${baseUrl}/aircraftcommercial`;
    const method = isEditMode ? 'PUT' : 'POST';

    const payload : UpdateCommercialPayload | CreateCommercialPayload = isEditMode ? {
      passengerCapacity: passengerCapacityVal === '' ? null : Number(passengerCapacityVal),
      priceMillionsUsd: priceMillionsUsdVal === '' ? null: Number(priceMillionsUsdVal)
    } : {
      modelId: Number(id),
      passengerCapacity: passengerCapacityVal === '' ? null : Number(passengerCapacityVal),
      priceMillionsUsd: priceMillionsUsdVal === '' ? null: Number(priceMillionsUsdVal)
    } ;

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const savedRecord: AircraftModel = await response.json();
      onSaved(savedRecord); // Update master state in App.tsx
      navigate('/manage');   // Redirect back to the list page!
    }
    setSubmitting(false);
  };

  // Guard against direct URL refresh while App.tsx is still loading items
  if (isEditMode && items.length === 0) {
    return <div className="empty-state">Loading record details...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/manage" className="nav-link">
          ← Back to List
        </Link>
      </div>

      <div className="kpi-card">
        <h2 style={{ marginBottom: '1.25rem' }}>
          {isEditMode ? `Edit Commercial Record #${id}: ${existingItem?.manufacturer} ${existingItem?.modelName}` : 'Add Commercial Record'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label className="kpi-label" style={{ display: 'block' }}>Passenger Capacity</label>
            <input
              type="number"
              step="any"
              className="search-input"
              style={{ width: '100%' }}
              value={passengerCapacityVal}
              onChange={(e) => setPassengerCapacityVal(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="kpi-label" style={{ display: 'block' }}>Price ($M)</label>
            <input
              type="number"
              step="any"
              className="search-input"
              style={{ width: '100%' }}
              value={priceMillionsUsdVal}
              onChange={(e) => setPriceMillionsUsdVal(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="tab-btn active" disabled={submitting}>
              {submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Record'}
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