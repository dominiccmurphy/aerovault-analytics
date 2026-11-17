import { useState } from 'react';
import type {
  AirlineAirspace,
  CountryAirspace,
  AircraftModel,
  TabOption,
} from '../types/aviation';
import { KpiGrid } from '../components/KpiGrid';
import { AirlinesTable } from '../components/AirlinesTable';
import { CountriesTable } from '../components/CountriesTable';
import { AircraftTable } from '../components/AircraftTable';
import { AircraftModal } from '../components/AircraftModal';

interface DashboardPageProps {
  airlines: AirlineAirspace[];
  countries: CountryAirspace[];
  aircraftModels: AircraftModel[];
  loading: boolean;
}

export function DashboardPage({
  airlines,
  countries,
  aircraftModels,
  loading,
}: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<TabOption>('airlines');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftModel | null>(null);

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
    <>
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
    </>
  );
}