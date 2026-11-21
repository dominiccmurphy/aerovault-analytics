import { useEffect, useState } from 'react';
import type {
  LiveFlight,
} from '../types/aviation';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface LiveMapPageProps {
}

export function LiveMapPage({
}: LiveMapPageProps) {
  const [flights, setFlights] = useState<LiveFlight[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'live' | 'error'>('connecting');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

 useEffect(() => {
    const params = new URLSearchParams();
    params.set('lamin', String(56.5));
    params.set('lomin', String(-6.0));
    params.set('lamax', String(59.0));
    params.set('lomax', String(-2.0));

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const eventSource = new EventSource(`${baseUrl}/liveradar/stream?${params.toString()}`);

    eventSource.onmessage = (event) => { 
      const parsed = JSON.parse(event.data);
      
      setFlights(parsed);
      setConnectionStatus('live');
      setLastUpdated(new Date());
    }


    eventSource.onerror = () => {
      // Browser automatically retries on transient errors;
      // avoid logging noisy errors if cleanup already closed it
      if (eventSource.readyState === EventSource.CLOSED) return;
    };

    return () => { eventSource.close(); }
   }, []);
   
  return (
    <>
    <p>{connectionStatus} - {lastUpdated?.toLocaleTimeString()}</p>
      <MapContainer
        center={[57.4778, -4.2247]}
        zoom={8}
        style={{ height: '600px', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Map over flights and render a <Marker key={flight.icao24} ...> */}
        {flights
        .filter((x) => x.latitude != null && x.longitude != null)
        .map((x) => {
          const angle = (x.trueTrackDegrees ?? 0) - 90;

          return (
            <Marker key={x.icao24} 
              position={[x.latitude!, x.longitude!]} 
              icon={L.divIcon({ className: '', html: `<div style="transform: rotate(${angle}deg); color: #facc15; text-shadow: 0 0 3px rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; font-size: 25px;">✈</div>`, iconSize:[30,30], iconAnchor: [15, 15], })}
            />
          )
        })}
      </MapContainer>
    </>
  );
}