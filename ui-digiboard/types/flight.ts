import type { Airline } from './airline';
import type { Airport } from './airport';
import type { Gate } from './gate';
import type { FlightStatus } from './flight-status';
import type { User } from './user';

export interface Flight {
  id: number;
  flight_number: string;
  departure_time: string;
  departure_date: string;
  airline_id: number;
  destination_airport_id: number;
  gate_id: number;
  status_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  // Relationships
  airline?: Airline;
  destination_airport?: Airport; // Renamed from relation name in controller if needed, but controller says 'destinationAirport'
  gate?: Gate;
  status?: FlightStatus;
  user?: User;
}

export interface FlightPagination {
  current_page: number;
  data: Flight[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface FlightFormData {
  flight_number: string;
  departure_time: string;
  departure_date: string;
  airline_id: number | '';
  destination_airport_id: number | '';
  gate_id: number | '';
  status_id: number | '';
}

export interface DigitalBoardFlight {
  id: number;
  flight_number: string;
  departure_time: string;
  status: {
    name: string;
    color: string;
  };
  gate: string;
  airline: {
    name: string;
    code: string;
    logo: string | null;
  };
  destination: {
    name: string;
    code: string;
    city: string;
  };
}

export interface FlightData {
  date: string;
  total_flights: number;
  flights: DigitalBoardFlight[];
}
