import { useEffect, useState } from 'react';
import './App.css';
import {
  type AirlineAirspace,
  type CountryAirspace,
  type AircraftModel,
  type TabOption,
} from './types/aviation';
import { KpiGrid } from './components/KpiGrid';
import { AirlinesTable } from './components/AirlinesTable';
import { CountriesTable } from './components/CountriesTable';
import { AircraftTable } from './components/AircraftTable';
import { AircraftModal } from './components/AircraftModal';

function App() {
  
  // 1. State variables go first
  const [airlines, setAirlines] = useState<AirlineAirspace[]>([]);
  const [countries, setCountries] = useState<CountryAirspace[]>([]);
  const [aircraftModels, setAircraftModels] = useState<AircraftModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabOption>('airlines');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftModel | null>(null);

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

  const query = searchQuery.toLowerCase();

  const filteredAirlines = airlines.filter(
    (a) =>
      a.airlineName.toLowerCase().includes(query) ||
      a.icaoCode.toLowerCase().includes(query)
  );

  const filteredCountries = countries.filter((c) =>
    c.originCountry.toLowerCase().includes(query)
  );

  const filteredAircraft = aircraftModels.filter(
    (m) =>
      m.modelName.toLowerCase().includes(query) ||
      m.manufacturer.toLowerCase().includes(query) ||
      m.aircraftClass.toLowerCase().includes(query)
  );

  return (
    <div className="dashboard-container">
      <header className="top-header">
        <h1 className="brand-title">AeroVault Analytics</h1>
        <span className="status-pill">
          {loading ? '● Syncing Feed...' : '● Live Airspace Feed'}
        </span>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <KpiGrid
        loading={loading}
        totalAirborne={totalAirborne}
        airlinesCount={airlines.length}
        countriesCount={countries.length}
        avgFleetSpeed={avgFleetSpeed}
      />

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

      <section className="table-card">
        {loading ? (
          <div className="empty-state">Loading airspace telemetry...</div>
        ) : (
          <>
            {activeTab === 'airlines' && (
              <AirlinesTable airlines={filteredAirlines} />
            )}
            {activeTab === 'countries' && (
              <CountriesTable countries={filteredCountries} />
            )}
            {activeTab === 'aircraft' && (
              <AircraftTable models={filteredAircraft} onSelectAircraft={setSelectedAircraft} />
            )}
          </>
        )}
      </section>

      {selectedAircraft && (
        <AircraftModal
          aircraft={selectedAircraft}
          onClose={() => setSelectedAircraft(null)}
        />
      )}
    </div>
  );
}

export default App
