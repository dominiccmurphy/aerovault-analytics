import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import {
  type AirlineAirspace,
  type CountryAirspace,
  type AircraftModel,
} from './types/aviation';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AirlineDetailPage } from './pages/AirlineDetailPage';
import { ManageAircraftPage } from './pages/ManageAircraftPage';
import { AircraftFormPage } from './pages/AircraftFormPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { LiveMapPage } from './pages/LiveMapPage';

function App() {
  
  // 1. State variables go first
  const [airlines, setAirlines] = useState<AirlineAirspace[]>([]);
  const [countries, setCountries] = useState<CountryAirspace[]>([]);
  const [aircraftModels, setAircraftModels] = useState<AircraftModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleCommercialSaved = (updatedModel: AircraftModel) => {
    setAircraftModels((prev) =>
      prev.map((item) => (item.modelId === updatedModel.modelId ? updatedModel : item))
    );
  };

  const handleAircraftDeleted = (modelId: number) => {
    setAircraftModels((prev) =>
      prev.map((item) =>
        item.modelId === modelId
          ? {
              ...item,
              passengerCapacity: null,
              priceMillionsUsd: null,
              costPerSeatMillionsUsd: null,
            }
          : item
      )
    );
  };

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  

  return (
    <BrowserRouter>
      <div className="dashboard-container">
        <header className="top-header">
          <h1 className="brand-title">AeroVault Analytics</h1>

          {/* Horizontal Menu Buttons */}
          <nav className="nav-links">
            <NavLink to="/" end className="nav-link">
              Operations Table
            </NavLink>
            <NavLink to="/analytics" className="nav-link">
              Visual Analytics
            </NavLink>
            <NavLink to="/manage" className="nav-link">
              Manage Fleet
            </NavLink>
            <NavLink to="/audit" className="nav-link">
              Audit Log
            </NavLink>
            <NavLink to="/radar" className="nav-link">
              Live Radar
            </NavLink>
          </nav>

          <span className="status-pill">
            {loading ? '● Syncing Feed...' : '● Live Airspace Feed'}
          </span>
        </header>

        {error && <div className="error-banner">{error}</div>}

        {/* SPA Route Switcher */}
        <Routes>
          <Route path="/audit" element={<AuditLogPage />} />
          <Route
            path="/"
            element={
              <DashboardPage
                airlines={airlines}
                countries={countries}
                aircraftModels={aircraftModels}
                loading={loading}
              />
            }
          />
          <Route
            path="/analytics"
            element={
              <AnalyticsPage
                airlines={airlines}
                countries={countries}
                aircraftModels={aircraftModels}
                loading={loading}
              />
            }
          />
          <Route
            path="/airlines/:icaoCode"
            element={<AirlineDetailPage />}
          />

          <Route
            path="/manage"
            element={
              <ManageAircraftPage
                aircraftModels={aircraftModels}
                loading={loading}
                onAircraftDeleted={handleAircraftDeleted}
              />
            }
          />

          {/* CREATE mode: id from useParams() will be undefined */}
          <Route
            path="/manage/new/:id"
            element={<AircraftFormPage items={aircraftModels} onSaved={handleCommercialSaved} />}
          />

          {/* EDIT mode: id from useParams() will be the record's ID string */}
          <Route
            path="/manage/edit/:id"
            element={<AircraftFormPage items={aircraftModels} onSaved={handleCommercialSaved} />}
          />
          <Route path="/radar" element={<LiveMapPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
