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
}

export interface Pagination {
  page: number;
  page_size: number;
  total_pages: number;
  total_records: number;
}

export interface SubscriptionResponse {
  status?: number;
  message?: string;
  total: number;
  data?: Subscription[];
  pagination?: Pagination;
}
