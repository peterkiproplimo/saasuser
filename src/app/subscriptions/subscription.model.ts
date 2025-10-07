export interface Plan {
  plan: string;
  qty: number;
  cost: number;
  currency: string;
}

export interface LatestInvoice {
  name: string;
  grand_total: number;
  prorate_factor: number;
  status: string;
  currency: string;
  posting_date: string;
}

export interface Subscription {
  name: string;
  status: string;
  total: number;
  party: string;
  current_invoice_start: string;
  current_invoice_end: string;
  plans: Plan[];
  latest_invoice: LatestInvoice;
  creation: string;
  custom_subdomain: string;
}

export interface Pagination {
  page: number;
  page_size: number;
  total_pages: number;
  total_records: number;
}

export interface SubscriptionResponse {
  status: number;
  message: string;
  data: Subscription[];
  pagination: Pagination;
  filters: {
    search: string | null;
    start_date: string | null;
    end_date: string | null;
  };
}
