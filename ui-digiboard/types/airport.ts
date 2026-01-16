export interface Airport {
  id: number;
  name: string;
  code: string;
  city: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface AirportPagination {
  current_page: number;
  data: Airport[];
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

export interface AirportFormData {
  name: string;
  code: string;
  city: string;
  country: string;
}
