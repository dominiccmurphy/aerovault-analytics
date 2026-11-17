import type {
  AirlineAirspace,
  CountryAirspace,
  AircraftModel,
} from '../types/aviation';

interface AnalyticsPageProps {
  airlines: AirlineAirspace[];
  countries: CountryAirspace[];
  aircraftModels: AircraftModel[];
  loading: boolean;
}

export function AnalyticsPage({
  airlines,
  countries,
  aircraftModels,
  loading,
}: AnalyticsPageProps) {
  if (loading) {
    return <div className="empty-state">Loading visual telemetry...</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>Visual Airspace Analytics</h2>
      <p style={{ color: '#94a3b8' }}>
        Data synced and ready: {airlines.length} airlines, {countries.length} countries, and{' '}
        {aircraftModels.length} aircraft models.
      </p>
    </div>
  );
}