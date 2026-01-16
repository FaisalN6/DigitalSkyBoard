export interface Airline {
  id: number;
  name: string;
  code: string;
  logo: string | null;
  created_at: string;
  updated_at: string;
}

export interface AirlinePagination {
  current_page: number;
  data: Airline[];
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

export interface AirlineFormData {
  name: string;
  code: string;
  logo: File | null;
}
