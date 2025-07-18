import {Pagination} from '../../../../../shared/models/pagination';

export type ListPlanResponse = {
  status?:     number;
  message?:    string;
  data?:       Plan[];
  pagination?: Pagination;
  filters?:    Filters;
}

export type Plan = {
  name?:                   string;
  plan_name?:              string;
  billing_interval?:       string;
  billing_interval_count?: number;
  cost?:                   number;
  currency?:               string;
  item?:                   string;
  type?:                   string;
  application?:            Application;
  features?:                any[];
}

export type Application = {
  name?:        string;
  description?: null;
}

export type Filters = {
  application?: string;
}

