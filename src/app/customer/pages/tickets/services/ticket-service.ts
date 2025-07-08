import {inject, Injectable, signal} from '@angular/core';
import {environment} from '../../../../../environments/environment';
import {HttpClient, httpResource} from '@angular/common/http';
import {invoiceListResponse} from '../../invoices/models/responses/invoice-list-response';
import {TicketListResponse} from '../models/responses/ticket-list-response';
import {TicketResponse} from '../models/responses/ticket-response';
import {CommentListResponse} from '../models/responses/comment-list-resonse';
import {Observable} from 'rxjs';
import {CreateTicketResponse} from '../models/responses/create-ticket-response';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  base_url = environment.BASE_URL;
  http = inject(HttpClient);

  page = signal(1);
  page_size = signal(5);
  id = signal(0);


  create_ticket (ticket: FormData) : Observable<CreateTicketResponse> {
    return this.http.post<CreateTicketResponse>(`${this.base_url}.ticket.add_hd_ticket_comment`, ticket);
  }

  ticket_resource = httpResource<TicketListResponse>(
    ()=> `${this.base_url}.ticket.get_all_hd_tickets`,
    {defaultValue: {}}
  )

  ticket_by_id_resource = httpResource<TicketResponse>(
    ()=> `${this.base_url}.ticket.get_hd_ticket?ticket_id=${this.id()}`,
    {defaultValue: {}}
  )

  comment_resource = httpResource<CommentListResponse>(
    ()=> `${this.base_url}.ticket.get_hd_ticket_comments?ticket_id=${this.id()}`,
    {defaultValue: {}}
  )

}
