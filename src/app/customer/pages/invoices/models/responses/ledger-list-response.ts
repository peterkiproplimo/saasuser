import {Pagination} from '../../../../../shared/models/pagination';

export type LedgerListResponse = {
  status?:     number;
  message?:    string;
  data?:       LedgerEntry[];
  pagination?: Pagination;
  filters?:    Filters;
}

export type LedgerEntry = {
  name?:         string;
  posting_date?: Date;
  voucher_type?: string;
  voucher_no?:   string;
  debit?:        number;
  credit?:       number;
  balance?:      number;
  account?:      string;
  against?:      string;
  remarks?:      string;
}

export type Filters = {
  start_date?: Date;
  end_date?:   Date;
}
