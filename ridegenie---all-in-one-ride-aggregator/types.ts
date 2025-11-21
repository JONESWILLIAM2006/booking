export type TransportMode = 'cab' | 'auto' | 'bike';

export type Provider = 'uber' | 'ola' | 'rapido';

export interface RideOption {
  provider: Provider;
  price: number;
  currency: string;
  eta: string; // e.g., "4 mins"
  tripDuration: string; // e.g., "25 mins"
  surgeMultiplier: number; // 1.0 is normal
  description?: string; // e.g., "Uber Go", "Ola Auto"
}

export interface ComparisonResult {
  estimates: RideOption[];
  analysis: string; // AI summary of the best option
}

export interface LocationState {
  pickup: string;
  dropoff: string;
}