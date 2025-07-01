import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, httpResource} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';
import {invoiceListResponse} from '../models/responses/invoice-list-response';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {
  base_url = environment.BASE_URL;

  page = signal(1);
  page_size = signal(5);

  invoices_resource = httpResource<invoiceListResponse>(
    ()=> `${this.base_url}.invoices.get_all_invoices?page=${this.page()}&page_size=${this.page_size()}`,
    {defaultValue: {}}
  )

}
