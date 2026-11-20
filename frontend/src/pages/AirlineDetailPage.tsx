import { Link, useParams } from 'react-router-dom';
import type {
  AirlineAirspace,
} from '../types/aviation';
import { useEffect, useState } from 'react';
import { formatDate } from '../utils/formatters';

interface AirlineDetailPageProps {
}

export function AirlineDetailPage({
}: AirlineDetailPageProps) {
  const { icaoCode } = useParams<{ icaoCode: string }>();
  
  const [airline, setAirline] = useState<AirlineAirspace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!icaoCode) return;

    setLoading(true);
    setError(null);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    fetch(`${baseUrl}/airspace/airlines/${icaoCode}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Airline "${icaoCode}" not found (HTTP ${res.status})`);
        }
        return res.json();
      })
      .then((data: AirlineAirspace) => {
        setAirline(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [icaoCode]);

  if (loading) {
    return <div className="empty-state">Loading telemetry for {icaoCode}...</div>;
  }

  if (error || !airline) {
    return (
      <div className="empty-state">
        <p style={{ color: '#fca5a5', marginBottom: '1rem' }}>
          {error || `No telemetry found for ${icaoCode}.`}
        </p>
        <Link to="/" className="nav-link">
          ← Back to Operations Table
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" className="nav-link">
          ← Back to Operations Table
        </Link>
      </div>

      <div className="kpi-card" style={{ marginBottom: '1.5rem' }}>
        <span className="badge">{airline.icaoCode}</span>
        <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>
          {airline.airlineName}
        </h2>
        <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>
          Snapshot Date: {formatDate(airline.snapshotDate)}
        </p>
      </div>

      <section className="kpi-grid">
        <div className="kpi-card kpi-accent-green">
          <div className="kpi-label">Active Aircraft Airborne</div>
          <div className="kpi-value">
            {airline.activeAircraftCount.toLocaleString()}
          </div>
        </div>

        <div className="kpi-card kpi-accent-amber">
          <div className="kpi-label">Average Cruise Velocity</div>
          <div className="kpi-value">
            {airline.avgVelocityMs.toFixed(1)} m/s
          </div>
        </div>
      </section>
    </div>
  );
}