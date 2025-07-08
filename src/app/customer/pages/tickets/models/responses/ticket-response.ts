export type TicketResponse = {
  status?:  number;
  message?: string;
  data?:    Ticket;
}

export type Ticket = {
  id?:               number;
  name?:             number;
  subject?:          string;
  description?:      string;
  priority?:         string;
  ticket_type?:      string;
  status?:           string;
  owner?:            string;
  creation?:         Date;
  modified?:         Date;
  image_url?:        null;
  attachments?:      any[];
  attachment_count?: number;
}
