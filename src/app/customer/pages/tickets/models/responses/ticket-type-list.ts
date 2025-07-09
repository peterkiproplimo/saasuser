export type TicketTypeResponse = {
  status?:       number;
  message?:      string;
  ticket_types?: TicketType[];
}

export type TicketType = {
  name?:        string;
  description?: null;
}
