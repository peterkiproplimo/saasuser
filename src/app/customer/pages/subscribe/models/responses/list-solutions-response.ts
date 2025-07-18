import {Pagination} from '../../../../../shared/models/pagination';

export type ListSolutionsResponse = {
  status?:     number;
  message?:    string;
  data?:       Solution[];
  pagination?: Pagination;
}

export type Solution = {
  name?:     string;
  app_name?: string;
  app_code?: string;
  app_logo?: string;
  description?: string;
  short_description?: string;
  features?: string[];
  creation?: Date;
  modified?: Date;
  owner?:    string;
}
