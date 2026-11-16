import { useState, useEffect } from 'react'
import './App.css'

interface AirlineAirspace {
  snapshotDate: string;
  icaoCode: string;
  airlineName: string;
  activeAircraftCount: number;
  avgVelocityMs: number;
}

interface CountryAirspace {
  snapshotDate: string;
  originCountry: string;
  activeAircraftCount: number;
  avgVelocityMs: number;
}

interface AircraftModel {
  modelId: number;
  manufacturer: string;
  headquarters: string;
  modelName: string;
  aircraftClass: string;
  maxSpeedKnots: number;
  maxRangeNm: number;
  passengerCapacity: number;
  priceMillionsUsd: number;
  costPerSeatMillionsUsd: number;
}

type TabOption = 'airlines' | 'countries' | 'aircraft';


function App() {
  
  // 1. State variables go first
  const [airlines, setAirlines] = useState<AirlineAirspace[]>([]);
  const [countries, setCountries] = useState<CountryAirspace[]>([]);
  const [aircraftModels, setAircraftModels] = useState<AircraftModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabOption>('airlines');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const baseUrl = 'http://localhost:5000/api';

    Promise.all([
      fetch(`${baseUrl}/airspace/airlines`).then((res) => res.json()),
      fetch(`${baseUrl}/airspace/countries`).then((res) => res.json()),
      fetch(`${baseUrl}/aircraft`).then((res) => res.json()),
    ])
      .then(([airlinesData, countriesData, aircraftData]) => {
        setAirlines(airlinesData);
        setCountries(countriesData);
        setAircraftModels(aircraftData);
        setLoading(false);
      })
      .catch((err) => {
        setError(`Failed to load airspace data: ${err.message}`);
        setLoading(false);
      });
  }, []);

  const totalAirborne = countries.reduce((sum, item) => sum + item.activeAircraftCount, 0);

  const avgFleetSpeed = airlines.length > 0 ? 
                        ( airlines.reduce((sum, item) => sum + item.avgVelocityMs, 0) / airlines.length).toFixed(1)
                        : '0';

  const handleTabChange = (tab: TabOption) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  return (
    <div className="dashboard-container">
      <header className="top-header">
        <h1 className="brand-title">AeroVault Analytics</h1>
        <span className="status-pill">
          {loading ? '● Syncing Feed...' : '● Live Airspace Feed'}
        </span>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {/* 3. The 4 KPI Cards */}
      <section className="kpi-grid">
        <div className="kpi-card kpi-accent-green">
          <div className="kpi-label">Active Aircraft Airborne</div>
          <div className="kpi-value">
            {loading ? '...' : totalAirborne.toLocaleString()}
          </div>
        </div>

        <div className="kpi-card kpi-accent-blue">
          <div className="kpi-label">Tracked Airlines</div>
          <div className="kpi-value">
            {loading ? '...' : airlines.length}
          </div>
        </div>

        <div className="kpi-card kpi-accent-blue">
          <div className="kpi-label">Origin Countries</div>
          <div className="kpi-value">
            {loading ? '...' : countries.length}
          </div>
        </div>

        <div className="kpi-card kpi-accent-amber">
          <div className="kpi-label">Avg Airline Velocity</div>
          <div className="kpi-value">
            {loading ? '...' : `${avgFleetSpeed} m/s`}
          </div>
        </div>
      </section>

      <section className="toolbar-row">
        <div className="tab-group">
          <button
            className={`tab-btn ${activeTab === 'airlines' ? 'active' : ''}`}
            onClick={() => handleTabChange('airlines')}
          >
            Airlines ({airlines.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'countries' ? 'active' : ''}`}
            onClick={() => handleTabChange('countries')}
          >
            Countries ({countries.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'aircraft' ? 'active' : ''}`}
            onClick={() => handleTabChange('aircraft')}
          >
            Aircraft Catalog ({aircraftModels.length})
          </button>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </section>

      <p style={{ color: '#94a3b8' }}>
        Currently viewing: <strong>{activeTab}</strong> | Search filter: "{searchQuery}"
      </p>
    </div>
  );
}

export default App
