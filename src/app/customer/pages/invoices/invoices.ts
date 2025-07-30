import {Component, computed, effect, inject, Signal, signal} from '@angular/core';
import {InvoicesService} from './services/invoices';
import {Paginator, PaginatorState} from 'primeng/paginator';
import {ProgressSpinner} from 'primeng/progressspinner';
import {Button} from 'primeng/button';
import {EmptyStateComponent} from '../../../shared/components/empty-state/empty-state.component';
import {Invoice} from './models/responses/invoice-list-response';
import {DatePipe, DecimalPipe, NgClass} from '@angular/common';
import { SelectButton } from 'primeng/selectbutton';
import {FormsModule} from '@angular/forms';
import {Calendar} from 'primeng/calendar';
import {DropdownModule} from 'primeng/dropdown';
import {PdfService} from './services/pdf-service';
import {getHtmlContent} from './pdf-templates/invoice-pdf';

@Component({
  selector: 'app-invoices',
  imports: [
    Paginator,
    ProgressSpinner,
    Button,
    EmptyStateComponent,
    DatePipe,
    DecimalPipe,
    NgClass,
    SelectButton,
    FormsModule,
    Calendar,
    DropdownModule
  ],
  templateUrl: './invoices.html',
  styleUrl: './invoices.scss'
})
export class Invoices {

  invoices_service = inject(InvoicesService);
  pdf_service = inject(PdfService);
  pdf_loading = signal(false);

  search_text = signal<string>('');
  start_date = this.invoices_service.start_date;
  end_date = this.invoices_service.end_date;

  selected_invoice_id = signal<string | null>(null);

  invoiceRowLoading = signal<Record<string, boolean>>({});



  status_options: any[] = [
    { label: 'Paid', value: 'Paid' },
    { label: 'Unpaid', value: 'Unpaid' },
    { label: 'All', value: '' },
    { label: 'Partially Paid', value: 'Partially Paid' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Cancelled', value: 'cancelled' }

  ];

  pageNum = this.invoices_service.page;
  pageSize = this.invoices_service.page_size;
  status = this.invoices_service.status;
  first = signal<number>(0);

  invoices = this.invoices_service.invoices_resource.value;
  is_loading = this.invoices_service.invoices_resource.isLoading;
  is_error = this.invoices_service.invoices_resource.error;
  totalRecords = computed(() => this.invoices().pagination?.total_records ?? 0);

  invoice = this.invoices_service.invoice_by_id_resource.value;
  invoice_loading = this.invoices_service.invoice_by_id_resource.isLoading;

  onPageChange(event: PaginatorState) {
    this.first.set(event.first ?? 0);
    this.pageSize.set(event.rows ?? 5);
    this.pageNum.set((event.page ?? 0) + 1);
  }

  isRowLoading(invoiceName: string): boolean {
    return this.invoiceRowLoading()[invoiceName];
  }

  pay_invoice(invoice: Invoice) {
  }

  download_invoice(invoice: any) {

    console.log(invoice)

    this.pdf_service.generatePdf(getHtmlContent(invoice)).subscribe({
      next: (pdfBlob) => {

        this.invoiceRowLoading.set({
          ...this.invoiceRowLoading(),
          [invoice.name]: false
        });


        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Invoice-'+invoice.name+'.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        this.invoiceRowLoading.set({
          ...this.invoiceRowLoading(),
          [invoice.name]: false
        });
      },
      complete: () => {
        this.invoiceRowLoading.set({
          ...this.invoiceRowLoading(),
          [invoice.name]: false
        });
      }
    });
  }

  handle_invoice_download(invoiceName: string) {
    // Set this row to loading
    this.invoiceRowLoading.set({
      ...this.invoiceRowLoading(),
      [invoiceName]: true
    });

    this.invoices_service.id.set(invoiceName);

      const checkInterval = setInterval(() => {
        const invoice = this.invoices_service.invoice_by_id_resource.value();

        if (!this.invoice_loading() && invoice && invoice.data) {
          clearInterval(checkInterval);
          this.download_invoice(invoice.data);
        }
      }, 200);

  }

}
