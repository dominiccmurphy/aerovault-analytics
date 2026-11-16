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
  passengerCapacity: number;
  priceMillionsUsd: number;
  costPerSeatMillionsUsd: number;
}

export type TabOption = 'airlines' | 'countries' | 'aircraft';