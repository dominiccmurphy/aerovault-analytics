interface KpiGridProps {
  loading: boolean;
  totalAirborne: number;
  airlinesCount: number;
  countriesCount: number;
  avgFleetSpeed: string;
}

export function KpiGrid({
  loading,
  totalAirborne,
  airlinesCount,
  countriesCount,
  avgFleetSpeed,
}: KpiGridProps) {
  return (
    <section className="kpi-grid">
      <div className="kpi-card kpi-accent-green">
        <div className="kpi-label">Active Aircraft Airborne</div>
        <div className="kpi-value">
          {loading ? '...' : totalAirborne.toLocaleString()}
        </div>
      </div>

      <div className="kpi-card kpi-accent-blue">
        <div className="kpi-label">Tracked Airlines</div>
        <div className="kpi-value">{loading ? '...' : airlinesCount}</div>
      </div>

      <div className="kpi-card kpi-accent-blue">
        <div className="kpi-label">Origin Countries</div>
        <div className="kpi-value">{loading ? '...' : countriesCount}</div>
      </div>

      <div className="kpi-card kpi-accent-amber">
        <div className="kpi-label">Avg Airline Velocity</div>
        <div className="kpi-value">{loading ? '...' : `${avgFleetSpeed} m/s`}</div>
      </div>
    </section>
  );
}