export interface AuditLogEntry {
  auditId: number;
  tableName: string;
  recordKey: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  oldValues: string | null;
  newValues: string | null;
  changedAt: string;
}

export interface AirlineAirspace {
  snapshotDate: string;
  icaoCode: string;
  airlineName: string;
  activeAircraftCount: number;
  avgVelocityMs: number;
}

export interface CountryAirspace {
  snapshotDate: string;
  originCountry: string;
  activeAircraftCount: number;
  avgVelocityMs: number;
}

export interface AircraftModel {
  modelId: number;
  manufacturer: string;
  headquarters: string;
  modelName: string;
  aircraftClass: string;
  maxSpeedKnots: number;
  maxRangeNm: number;
  passengerCapacity: number | null;
  priceMillionsUsd: number | null;
  costPerSeatMillionsUsd: number | null;
}

export interface CreateCommercialPayload {
  modelId: number;
  passengerCapacity: number | null;
  priceMillionsUsd: number | null;
}

export interface UpdateCommercialPayload {
  passengerCapacity: number | null;
  priceMillionsUsd: number | null;
}

export type TabOption = 'airlines' | 'countries' | 'aircraft';

export interface LiveFlight {
  icao24: string;
  callsign: string;
  originCountry: string;
  latitude: number | null;
  longitude: number | null;
  baroAltitudeMeters: number | null;
  velocityMs: number | null;
  trueTrackDegrees: number;
}