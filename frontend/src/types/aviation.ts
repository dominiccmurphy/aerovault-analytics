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
  priceMillionsUsd: number;
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