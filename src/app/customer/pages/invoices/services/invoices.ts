import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, httpResource} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';
import {invoiceListResponse} from '../models/responses/invoice-list-response';
import {LedgerListResponse} from '../models/responses/ledger-list-response';
import {DatePipe} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {
  base_url = environment.BASE_URL;

  constructor(private datePipe : DatePipe) {}

  page = signal(1);
  page_size = signal(5);

  start_date = signal<Date | null>(null);
  end_date = signal<Date | null>(null);

  status = signal('');

  invoices_resource = httpResource<invoiceListResponse>(
    ()=> `${this.base_url}.invoices.get_invoices?page=${this.page()}&page_size=${this.page_size()}&status=${this.status()}`,
    {defaultValue: {}}
  )

  // ledger_resource = httpResource<LedgerListResponse>(
  //   () => {
  //     const formattedStartDate = this.start_date()
  //       ? this.datePipe.transform(this.start_date(), 'yyyy-MM-dd')
  //       : '';
  //     const formattedEndDate = this.end_date()
  //       ? this.datePipe.transform(this.end_date(), 'yyyy-MM-dd')
  //       : '';
  //     return `${this.base_url}.invoices.get_customer_ledger?get_customer_ledger?
  //     &page=${this.page()}
  //     &start_date=${formattedStartDate}
  //     &end_date=${formattedEndDate}
  //     &page_size=${this.page_size()}`;
  //   },
  //   { defaultValue: {} }
  // );

  ledger_resource = httpResource<LedgerListResponse>(
    () => {
      const params = new URLSearchParams();

      params.set('page', this.page().toString());
      params.set('page_size', this.page_size().toString());

      const start = this.start_date();
      if (start) {
        params.set('start_date', this.datePipe.transform(start, 'yyyy-MM-dd') || '');
      }

      const end = this.end_date();
      if (end) {
        params.set('end_date', this.datePipe.transform(end, 'yyyy-MM-dd') || '');
      }

      return `${this.base_url}.invoices.get_customer_ledger?${params.toString()}`;
    },
    { defaultValue: {} }
  );


}
