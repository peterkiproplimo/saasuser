export interface Welcome {
  status?: number;
  message?: string;
  data?: Datum[];
  pagination?: Pagination;
}

export interface Datum {
  name?: string;
  id: string;
  app_name?: string;
  app_code?: string;
  app_logo?: string;
  describe?: string;
  features?: string[];
  creation?: Date;
  modified?: Date;
  owner?: string;
}

export interface Pagination {
  page?: number;
  page_size?: number;
  total_records?: number;
  total_pages?: number;
}
export interface WelcomeResponse {
  status?: number;
  message?: string;
  data?: Datum[];
  pagination?: Pagination;
}
