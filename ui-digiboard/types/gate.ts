export interface Gate {
  id: number;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface GatePagination {
  current_page: number;
  data: Gate[];
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

export interface GateFormData {
  code: string;
}
