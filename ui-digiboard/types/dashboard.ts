export interface DashboardSummary {
  total_flights_today: number;
  total_airlines: number;
  total_gates: number;
  active_gates_today: number;
}

export interface FlightStatusCount {
  status: string;
  count: number;
}

export interface AirlineCount {
  airline: string;
  code: string;
  count: number;
}

export interface UpcomingDeparture {
  id: number;
  flight_number: string;
  airline: string;
  airline_code: string;
  destination: string;
  destination_code: string;
  gate: string;
  departure_time: string;
  status: string;
}

export interface GateUtilization {
  gate: string;
  flights: number;
}

export interface DashboardStatistics {
  summary: DashboardSummary;
  flights_by_status: FlightStatusCount[];
  flights_by_airline: AirlineCount[];
  upcoming_departures: UpcomingDeparture[];
  gate_utilization: GateUtilization[];
  recent_updates: any[]; // Adjust if you have a specific type for this
}

export interface TodayFlight {
  id: number;
  flight_number: string;
  airline: string;
  airline_code: string;
  destination: string;
  destination_city: string;
  destination_code: string;
  gate: string;
  departure_time: string;
  departure_date: string;
  status: string;
}

export interface TodayFlightsResponse {
  date: string;
  total: number;
  flights: TodayFlight[];
}
