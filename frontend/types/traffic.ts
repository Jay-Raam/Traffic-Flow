export type CongestionLevel = "low" | "medium" | "high";

export interface TrafficDatum {
  area: string;
  vehicles: number;
  avg_speed_kmph: number;
  congestion_level: CongestionLevel;
  density_score: number;
  timestamp: string;
}

export interface TrafficResponse {
  data: TrafficDatum[];
  generated_at: string;
}

export interface HistoryPoint {
  timestamp: string;
  area: string;
  vehicles: number;
  avg_speed_kmph: number;
  congestion_level: CongestionLevel;
}

export interface HistoryResponse {
  points: HistoryPoint[];
}

export interface SignalTiming {
  green: number;
  yellow: number;
  red: number;
}

export interface AreaSuggestion {
  area: string;
  congestion_level: CongestionLevel;
  prediction: CongestionLevel;
  signal_timing: SignalTiming;
}

export interface OptimizeResponse {
  generated_at: string;
  ai_summary: string;
  tools_used: string[];
  suggestions: AreaSuggestion[];
}

export interface RouteRequest {
  source: string;
  destination: string;
}

export interface RouteLocation {
  name: string;
  lat: number;
  lng: number;
}

export interface RouteCoordinate {
  lat: number;
  lng: number;
}

export interface RouteResult {
  from_location: RouteLocation;
  to_location: RouteLocation;
  traffic_level: "low" | "medium" | "high";
  estimated_time_minutes: number;
  distance_km: number;
  best_route: {
    summary: string;
    coordinates: RouteCoordinate[];
  };
  alerts: string[];
}
