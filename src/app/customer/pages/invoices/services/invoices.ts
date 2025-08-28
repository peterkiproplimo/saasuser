import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { invoiceListResponse } from '../models/responses/invoice-list-response';
import { LedgerListResponse } from '../models/responses/ledger-list-response';
import { DatePipe } from '@angular/common';
import { debounceSignal } from '../../../../shared/functions/functions';
import { Observable } from 'rxjs';
import { PaymentResponse } from '../models/responses/payment_response';
import { PaymentRequest } from '../models/requests/payment_request';

@Injectable({
  providedIn: 'root',
})
export class InvoicesService {
  base_url = environment.BASE_URL;

  constructor(private datePipe: DatePipe, private http: HttpClient) {}

  page = signal(1);
  page_size = signal(5);

  start_date = signal<Date | null>(null);
  end_date = signal<Date | null>(null);
  referenceNo = signal<Date | null>(null);
  creditAmount = signal<Date | null>(null);

  id = signal<string>('');

  status = signal('');
  search = signal('');
  debounced_search = debounceSignal<string>(this.search, 500);

  invoices_resource = httpResource<invoiceListResponse>(
    () => {
      const params = new URLSearchParams();
      params.set('page', this.page().toString());
      params.set('page_size', this.page_size().toString());
      params.set('status', this.status());
      params.set('search', this.debounced_search()!);

      const start = this.start_date();
      if (start) {
        params.set(
          'start_date',
          this.datePipe.transform(start, 'yyyy-MM-dd') || ''
        );
      }

      const end = this.end_date();
      if (end) {
        params.set(
          'end_date',
          this.datePipe.transform(end, 'yyyy-MM-dd') || ''
        );
      }

      return `${this.base_url}.invoices.get_invoices?${params.toString()}`;
    },
    { defaultValue: {} }
  );

  ledger_resource = httpResource<LedgerListResponse>(
    () => {
      const params = new URLSearchParams();

      params.set('page', this.page().toString());
      params.set('page_size', this.page_size().toString());

      const start = this.start_date();
      if (start) {
        params.set(
          'start_date',
          this.datePipe.transform(start, 'yyyy-MM-dd') || ''
        );
      }

      const end = this.end_date();
      if (end) {
        params.set(
          'end_date',
          this.datePipe.transform(end, 'yyyy-MM-dd') || ''
        );
      }

      return `${
        this.base_url
      }.invoices.get_customer_ledger?${params.toString()}`;
    },
    { defaultValue: {} }
  );

  invoice_by_id_resource = httpResource<any>(
    () => {
      if (!this.id()) {
        return '';
      }
      return `${
        this.base_url
      }.invoices.get_invoice_by_id?invoice_id=${this.id()}`;
    },
    { defaultValue: {} }
  );

  pay_invoice(invoice: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(
      `${this.base_url}.invoices.pay_invoice`,
      invoice
    );
  }
}
