import {Pagination} from '../../../../../shared/models/pagination';

export type TicketListResponse = {
  status?:     number;
  message?:    string;
  data?:       Ticket[];
  pagination?: Pagination;
}

export type Ticket = {
  name?:             number;
  subject?:          string;
  description?:      string;
  priority?:         string;
  ticket_type?:      string;
  owner?:            string;
  creation?:         Date;
  status?:           string;
  attachments?:      any[];
  attachment_count?: number;
  image_url?:        null;
}

