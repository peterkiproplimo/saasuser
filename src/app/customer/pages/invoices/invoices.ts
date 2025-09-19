import { Component, computed, DestroyRef, inject, signal, OnInit } from '@angular/core';
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
export class Invoices implements OnInit {
  invoices_service = inject(InvoicesService);
  private destroyRef = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);

  payment_loading = signal<boolean>(false);
  payment_dialog = signal(false);
  iframe_dialog = signal(false);
  // IMPORTANT: use SafeResourceUrl for iframe src
  payment_iframe_url = signal<SafeResourceUrl | null>(null);

  // Invoice preview dialog
  invoice_preview_dialog = signal(false);
  selected_invoice_for_preview = signal<Invoice | null>(null);

  start_date = this.invoices_service.start_date;
  end_date = this.invoices_service.end_date;
  invoiceRowLoading = signal<Record<string, boolean>>({});
  selected_invoice = signal<Invoice | null>(null);
  error_dialog = signal(false);
  error_message = signal('');

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

  functions = new Functions();

  payment_form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
    amount: new FormControl('', [Validators.required, Validators.min(1)]),
  });

  ngOnInit() {
    // Trigger API calls on component mount (like useEffect)
    this.invoices_service.refreshInvoices();
  }

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
      invoice_name: this.selected_invoice()?.name ?? '',
      payment_amount: Number(this.payment_form.value.amount!),

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
            // Success → iframe dialog
            this.payment_iframe_url.set(
              this.sanitizer.bypassSecurityTrustResourceUrl(url)
            );
            this.iframe_dialog.set(true);
            this.payment_dialog.set(false);
          } else {
            // Any other "success" response without payment_url → show in error dialog
            this.error_message.set(res?.message || 'Payment request failed');
            this.error_dialog.set(true);
          }
        },
        error: (err) => {
          // API error response (like 409)
          this.error_message.set(
            err?.error?.message || 'Payment request failed'
          );
          this.error_dialog.set(true);
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
    this.invoiceRowLoading.set({
      ...this.invoiceRowLoading(),
      [invoice.name]: false,
    });

    const pdfContent = this.generateInvoicePDF(invoice);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  generateInvoicePDF(invoice: any): string {
    // Get customer profile from localStorage
    const customerProfile = JSON.parse(localStorage.getItem('user') || '{}');

    const currentDate = this.getCurrentDate();
    const postingDate = invoice.posting_date ? this.formatDate(invoice.posting_date) : 'N/A';
    const dueDate = invoice.due_date ? this.formatDate(invoice.due_date) : 'N/A';

    const statusColors: Record<string, string> = {
      'paid': '#10b981',
      'unpaid': '#ef4444',
      'partially paid': '#f59e0b',
      'overdue': '#f97316',
      'cancelled': '#6b7280',
    };

    const status = invoice.status?.toLowerCase() || 'unpaid';
    const statusColor = statusColors[status] || '#ef4444';

    const itemsHtml = (invoice.items || [])
      .map((item: any) => `
        <tr>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px;">${item.item_name || 'Service'}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px; text-align: right;">${item.rate?.toFixed(2) || '0.00'}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px; text-align: right;">${((item.rate || 0) * (item.qty || 1)).toFixed(2)}</td>
        </tr>
      `)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${invoice.name}</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; color: #1f2937; line-height: 1.3; font-size: 12px; }
          .container { max-width: 800px; margin: 0 auto; padding: 15px; background: white; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #3b82f6; }
          .title { font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 2px; }
          .subtitle { font-size: 12px; color: #6b7280; }
          .company { text-align: right; }
          .company-logo { width: 35px; height: 35px; background: #3b82f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px auto; color: white; font-weight: bold; font-size: 14px; }
          .company-name { font-size: 14px; font-weight: 700; color: #1f2937; margin-bottom: 2px; }
          .company-tagline { font-size: 10px; color: #3b82f6; font-weight: 600; margin-bottom: 3px; }
          .company-address { color: #6b7280; font-size: 9px; line-height: 1.2; }
          .billing-section { display: flex; justify-content: space-between; margin-bottom: 15px; }
          .billing-from, .billing-to { width: 48%; }
          .billing-title { font-size: 11px; font-weight: 700; color: #3b82f6; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
          .billing-info { font-size: 10px; color: #1f2937; line-height: 1.3; }
          .invoice-details { margin-bottom: 15px; }
          .invoice-row { display: flex; justify-content: space-between; margin-bottom: 3px; padding: 2px 0; }
          .invoice-label { font-weight: 600; color: #6b7280; font-size: 10px; }
          .invoice-value { color: #1f2937; font-weight: 500; font-size: 10px; }
          .status-badge { display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 9px; font-weight: 600; text-transform: uppercase; color: white; background: ${statusColor}; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 10px; background: white; border: 1px solid #e5e7eb; }
          .table th { background: #3b82f6; color: white; padding: 6px 8px; text-align: left; font-weight: 600; font-size: 10px; text-transform: uppercase; }
          .table th:last-child, .table th:nth-child(2), .table th:nth-child(3) { text-align: right; }
          .table td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; color: #1f2937; }
          .table td:last-child, .table td:nth-child(2), .table td:nth-child(3) { text-align: right; }
          .totals { margin-top: 10px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; padding: 2px 0; }
          .total-label { font-weight: 600; color: #6b7280; font-size: 10px; }
          .total-value { font-weight: 600; color: #1f2937; font-size: 10px; }
          .grand-total { border-top: 1px solid #3b82f6; padding-top: 4px; margin-top: 4px; }
          .grand-total .total-label { font-size: 11px; color: #1f2937; }
          .grand-total .total-value { font-size: 12px; color: #3b82f6; font-weight: 700; }
          .payment-info { margin-top: 10px; padding: 8px; background: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 3px; }
          .payment-title { color: #1f2937; margin-bottom: 4px; font-size: 10px; font-weight: 600; }
          .payment-text { font-size: 9px; color: #6b7280; line-height: 1.2; }
          .footer { background: #1f2937; color: white; padding: 8px; text-align: center; margin-top: 15px; }
          .footer-title { font-size: 11px; font-weight: 700; margin-bottom: 3px; color: #3b82f6; }
          .footer-logo { width: 25px; height: 25px; background: #3b82f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin: 0 auto 3px auto; color: white; font-weight: bold; font-size: 12px; }
          .footer-text { font-size: 8px; opacity: 0.8; margin: 1px 0; }
          @media print { body { margin: 0; padding: 0; } .container { padding: 15px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div>
              <div class="title">INVOICE</div>
              <div class="subtitle">Techsavanna ERPs Billing Platform</div>
            </div>
            <div class="company">
              <div class="company-logo">TS</div>
              <div class="company-name">Techsavanna</div>
              <div class="company-tagline">ERPs Billing Platform</div>
              <div class="company-address">
                Reliance Centre - 2nd Floor, Left Wing<br>
                Westlands Woodvale Grove, Nairobi, Kenya<br>
                Phone: 0719535899
              </div>
            </div>
          </div>

          <!-- Billing From/To -->
          <div class="billing-section">
            <div class="billing-from">
              <div class="billing-title">Billing From</div>
              <div class="billing-info">
                <strong>Techsavanna Company Limited</strong><br>
                Reliance Centre - 2nd Floor, Left Wing<br>
                Westlands Woodvale Grove<br>
                Nairobi, Kenya<br>
                Phone: 0719535899<br>
                Email: admin&#64;techsavanna.technology
              </div>
            </div>
            <div class="billing-to" style="text-align: right;">
              <div class="billing-title">Billing To</div>
              <div class="billing-info">
                <strong>${customerProfile.name || (customerProfile.first_name + ' ' + customerProfile.last_name).trim() || 'Not available'}</strong><br>
                Email: ${customerProfile.email || 'Not available'}<br>
                Phone: ${customerProfile.phone || 'Not available'}
              </div>
            </div>
          </div>

          <!-- Invoice Details -->
          <div class="invoice-details">
            <div class="invoice-row">
              <span class="invoice-label">Invoice Number:</span>
              <span class="invoice-value">${invoice.name}</span>
            </div>
            <div class="invoice-row">
              <span class="invoice-label">Posting Date:</span>
              <span class="invoice-value">${postingDate}</span>
            </div>
            <div class="invoice-row">
              <span class="invoice-label">Due Date:</span>
              <span class="invoice-value">${dueDate}</span>
            </div>
            <div class="invoice-row">
              <span class="invoice-label">Status:</span>
              <span class="invoice-value">
                <span class="status-badge">${invoice.status || 'Unpaid'}</span>
              </span>
            </div>
          </div>

          <!-- Items Table -->
          <table class="table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Rate (${invoice.currency || 'KES'})</th>
                <th>Amount (${invoice.currency || 'KES'})</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || '<tr><td colspan="3" style="padding: 6px 8px; text-align: center; color: #6b7280; font-style: italic; font-size: 10px;">No items available</td></tr>'}
            </tbody>
          </table>

          <!-- Totals -->
          <div class="totals">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">${(invoice.grand_total || 0).toFixed(2)} ${invoice.currency || 'KES'}</span>
            </div>
            <div class="total-row grand-total">
              <span class="total-label">Total Amount:</span>
              <span class="total-value">${(invoice.grand_total || 0).toFixed(2)} ${invoice.currency || 'KES'}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Outstanding Amount:</span>
              <span class="total-value" style="color: #ef4444; font-weight: 700;">${(invoice.outstanding_amount || 0).toFixed(2)} ${invoice.currency || 'KES'}</span>
            </div>
          </div>

          <!-- Payment Instructions -->
          <div class="payment-info">
            <div class="payment-title">Payment Instructions</div>
            <div class="payment-text">
              Transfer the amount to the business account below. <br>
              <strong>MPESA:</strong> Business no. 220222 | Account No. 47796595
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-title">Techsavanna ERPs Billing Platform</div>
            <div class="footer-logo">TS</div>
            <div class="footer-text">Your trusted partner in enterprise resource planning and billing solutions</div>
            <div class="footer-text">Support: support&#64;Techsavanna.com | Website: www.Techsavanna.com</div>
            <div class="footer-text">Report generated on ${currentDate}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  open_invoice_preview(invoice: Invoice) {
    // Get customer profile from localStorage and add to invoice data
    const customerProfile = JSON.parse(localStorage.getItem('user') || '{}');
    const invoiceWithCustomer = {
      ...invoice,
      customer_name: customerProfile.name || `${customerProfile.first_name || ''} ${customerProfile.last_name || ''}`.trim() || 'Not available',
      customer_organization: customerProfile.company || 'Not available',
      customer_email: customerProfile.email || 'Not available',
      customer_phone: customerProfile.phone || 'Not available'
    };

    this.selected_invoice_for_preview.set(invoiceWithCustomer);
    this.invoice_preview_dialog.set(true);
  }

  close_invoice_preview() {
    this.invoice_preview_dialog.set(false);
    this.selected_invoice_for_preview.set(null);
  }

  print_invoice() {
    if (!this.selected_invoice_for_preview()) return;

    const pdfContent = this.generateInvoicePDF(this.selected_invoice_for_preview()!);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  download_invoice_from_preview() {
    if (!this.selected_invoice_for_preview()) return;

    const pdfContent = this.generateInvoicePDF(this.selected_invoice_for_preview()!);
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${this.selected_invoice_for_preview()!.name}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  handle_invoice_download(invoiceName: string) {
    this.invoiceRowLoading.set({
      ...this.invoiceRowLoading(),
      [invoiceName]: true,
    });

    // Find the invoice from the current list instead of making an API call
    const invoices = this.invoices().data || [];
    const invoice = invoices.find(inv => inv.name === invoiceName);

    if (invoice) {
      // Use the invoice data we already have
      setTimeout(() => {
        this.open_invoice_preview(invoice);
        this.invoiceRowLoading.set({
          ...this.invoiceRowLoading(),
          [invoiceName]: false,
        });
      }, 100); // Small delay to show loading state
    } else {
      // If invoice not found in current list, show error
      this.invoiceRowLoading.set({
        ...this.invoiceRowLoading(),
        [invoiceName]: false,
      });
      console.error('Invoice not found:', invoiceName);
    }
  }
}
