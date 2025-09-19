import {Pagination} from '../../../../../shared/models/pagination';

export type invoiceListResponse = {
  status?:     number;
  message?:    string;
  data?:       Invoice[];
  pagination?: Pagination;
}

export type Invoice = {
  name?:               string;
  posting_date?:       Date;
  due_date?:           Date;
  grand_total?:        number;
  outstanding_amount?: number;
  currency?:           string;
  status?:             string;
  type?:               string;
  // Customer fields for preview
  customer_name?:      string;
  customer_organization?: string;
  customer_email?:     string;
  customer_phone?:     string;
}
