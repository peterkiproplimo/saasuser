import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { InvoicesService } from './services/invoices';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Button } from 'primeng/button';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { Invoice } from './models/responses/invoice-list-response';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Calendar } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { PdfService } from './services/pdf-service';
import { getHtmlContent } from './pdf-templates/invoice-pdf';
import { PaymentRequest } from './models/requests/payment_request';
import { Dialog } from 'primeng/dialog';
import { ReactiveInputComponent } from '../../../shared/components/form/reactive-input/reactive-input.component';
import { MessageService } from 'primeng/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Functions } from '../../../shared/functions/functions';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
    FormsModule,
    Calendar,
    DropdownModule,
    Dialog,
    ReactiveInputComponent,
    ReactiveFormsModule,
  ],
  providers: [MessageService],
  templateUrl: './invoices.html',
  styleUrl: './invoices.scss',
})
export class Invoices {
  invoices_service = inject(InvoicesService);
  pdf_service = inject(PdfService);
  private destroyRef = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);

  payment_loading = signal<boolean>(false);
  payment_dialog = signal(false);
  iframe_dialog = signal(false);
  // IMPORTANT: use SafeResourceUrl for iframe src
  payment_iframe_url = signal<SafeResourceUrl | null>(null);

  start_date = this.invoices_service.start_date;
  end_date = this.invoices_service.end_date;
  invoiceRowLoading = signal<Record<string, boolean>>({});
  selected_invoice = signal<Invoice | null>(null);

  status_options: any[] = [
    { label: 'Paid', value: 'Paid' },
    { label: 'Unpaid', value: 'Unpaid' },
    { label: 'All', value: '' },
    { label: 'Partially Paid', value: 'Partially Paid' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  pageNum = this.invoices_service.page;
  pageSize = this.invoices_service.page_size;
  status = this.invoices_service.status;
  search_text = this.invoices_service.search;
  first = signal<number>(0);

  invoices = this.invoices_service.invoices_resource.value;
  is_loading = this.invoices_service.invoices_resource.isLoading;
  totalRecords = computed(() => this.invoices().pagination?.total_records ?? 0);

  invoice = this.invoices_service.invoice_by_id_resource.value;
  invoice_loading = this.invoices_service.invoice_by_id_resource.isLoading;
  functions = new Functions();

  payment_form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
    amount: new FormControl('', [Validators.required, Validators.min(1)]),
  });

  onPageChange(event: PaginatorState) {
    this.first.set(event.first ?? 0);
    this.pageSize.set(event.rows ?? 5);
    this.pageNum.set((event.page ?? 0) + 1);
  }

  isRowLoading(invoiceName: string): boolean {
    return this.invoiceRowLoading()[invoiceName];
  }

  open_invoice_dialog(invoice: Invoice) {
    this.payment_dialog.set(true);
    this.selected_invoice.set(invoice);
    this.payment_form.patchValue({
      amount: this.selected_invoice()?.outstanding_amount?.toString(),
    });
  }

  pay_invoice() {
    this.payment_form.markAllAsTouched();
    if (this.payment_form.invalid) return;
    this.payment_loading.set(true);

    const payment_request: PaymentRequest = {
      invoice_name: this.selected_invoice()?.name,
      payment_amount: this.payment_form.value.amount!,
      payment_mode: 'PesaPal',
      customer_email: this.payment_form.value.email!,
      customer_phone: this.payment_form.value.phone!,
    };

    this.invoices_service
      .pay_invoice(payment_request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const url = res?.data?.payment_url;
          if (url) {
            // sanitize for iframe src
            this.payment_iframe_url.set(
              this.sanitizer.bypassSecurityTrustResourceUrl(url)
            );
            this.iframe_dialog.set(true);
          }
          this.payment_loading.set(false);
          this.payment_dialog.set(false);
          this.functions.show_toast(
            'Payment Request Successful',
            'success',
            'You have initiated a payment.'
          );
        },
        error: (err) => {
          this.payment_loading.set(false);
          this.functions.show_toast(
            'Payment Failed',
            'error',
            err?.error?.message ?? 'Payment request failed'
          );
        },
        complete: () => this.payment_loading.set(false),
      });
  }

  hideDialog() {
    this.payment_form.reset();
    this.payment_dialog.set(false);
    this.payment_form.markAsUntouched();
  }

  hideIframeDialog() {
    this.iframe_dialog.set(false);
    this.payment_iframe_url.set(null);
  }

  download_invoice(invoice: any) {
    this.pdf_service.generatePdf(getHtmlContent(invoice)).subscribe({
      next: (pdfBlob) => {
        this.invoiceRowLoading.set({
          ...this.invoiceRowLoading(),
          [invoice.name]: false,
        });
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Invoice-' + invoice.name + '.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: () =>
        this.invoiceRowLoading.set({
          ...this.invoiceRowLoading(),
          [invoice.name]: false,
        }),
      complete: () =>
        this.invoiceRowLoading.set({
          ...this.invoiceRowLoading(),
          [invoice.name]: false,
        }),
    });
  }

  handle_invoice_download(invoiceName: string) {
    this.invoiceRowLoading.set({
      ...this.invoiceRowLoading(),
      [invoiceName]: true,
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
