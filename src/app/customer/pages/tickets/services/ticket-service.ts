import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, httpResource } from '@angular/common/http';
import { TicketListResponse } from '../models/responses/ticket-list-response';
import { TicketResponse } from '../models/responses/ticket-response';
import { CommentListResponse } from '../models/responses/comment-list-resonse';
import { Observable } from 'rxjs';
import { CreateCommentResponse } from '../models/responses/create-ticket-response';
import { TicketTypeResponse } from '../models/responses/ticket-type-list';
import { DatePipe } from '@angular/common';
import { debounceSignal } from '../../../../shared/functions/functions';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  base_url = environment.BASE_URL;
  http = inject(HttpClient);
  constructor(private datePipe: DatePipe) { }

  page = signal(1);
  page_size = signal(5);
  id = signal(0);

  start_date = signal<Date | null>(null);
  end_date = signal<Date | null>(null);
  search = signal('');
  debounced_search = debounceSignal<string>(this.search, 500);


  create_comment(comment: FormData): Observable<CreateCommentResponse> {
    return this.http.post<CreateCommentResponse>(`${this.base_url}.ticket.add_hd_ticket_comment`, comment);
  }

  create_ticket(ticket: FormData): Observable<CreateCommentResponse> {
    return this.http.post<CreateCommentResponse>(`${this.base_url}.ticket.create_hd_ticket`, ticket);
  }

  ticket_type_resource = httpResource<TicketTypeResponse>(
    () => `${this.base_url}.ticket.get_hd_ticket_types`,
    { defaultValue: {} }
  )

  ticket_resource = httpResource<TicketListResponse>(
    () => {

      const params = new URLSearchParams();

      params.set('page', this.page().toString());
      params.set('page_size', this.page_size().toString());
      params.set('search', this.debounced_search()!);

      const start = this.start_date();
      if (start) {
        params.set('start_date', this.datePipe.transform(start, 'yyyy-MM-dd') || '');
      }

      const end = this.end_date();
      if (end) {
        params.set('end_date', this.datePipe.transform(end, 'yyyy-MM-dd') || '');
      }

      return `${this.base_url}.ticket.get_all_hd_tickets?${params.toString()}`
    },
    { defaultValue: {} }
  )

  ticket_by_id_resource = httpResource<TicketResponse>(
    () => `${this.base_url}.ticket.get_hd_ticket?ticket_id=${this.id()}`,
    { defaultValue: {} }
  )

  comment_resource = httpResource<CommentListResponse>(
    () => `${this.base_url}.ticket.get_hd_ticket_comments?ticket_id=${this.id()}`,
    { defaultValue: {} }
  )

}
