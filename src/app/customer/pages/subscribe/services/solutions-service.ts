import {inject, Injectable, signal} from '@angular/core';
import {environment} from '../../../../../environments/environment';
import {HttpClient, httpResource} from '@angular/common/http';
import {invoiceListResponse} from '../../invoices/models/responses/invoice-list-response';

@Injectable({
  providedIn: 'root'
})
export class SolutionsService {

  base_url = environment.BASE_URL;

  page = signal(1);
  page_size = signal(5);

  solutions_resource = httpResource<any>(
    () => `${this.base_url}.subscription.list_saas_application?page=${this.page()}&page_size=${this.page_size()}`,
    {defaultValue: {}}
  );
}
