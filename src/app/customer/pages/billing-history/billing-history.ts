import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { InvoicesService } from '../invoices/services/invoices';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Calendar } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// 📌 import jsPDF & autoTable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-billing-history',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    CommonModule,
    Paginator,
    Dialog,
    FormsModule,
    Calendar,
  ],
  templateUrl: './billing-history.html',
  styleUrl: './billing-history.scss',
})
export class BillingHistory implements OnInit {
  invoices_service = inject(InvoicesService);
  private sanitizer = inject(DomSanitizer);

  // pagination + filters
  search_text = signal<string>('');
  pageNum = this.invoices_service.page;
  pageSize = this.invoices_service.page_size;
  start_date = this.invoices_service.start_date;
  end_date = this.invoices_service.end_date;
  referenceNo = this.invoices_service.referenceNo;
  creditAmount = this.invoices_service.creditAmount;
  first = signal<number>(0);

  // ledger data signals
  ledger = this.invoices_service.ledger_resource.value;
  is_loading = this.invoices_service.ledger_resource.isLoading;
  is_error = this.invoices_service.ledger_resource.error;
  totalRecords = computed(() => this.ledger().pagination?.total_records ?? 0);

  ngOnInit() {
    // Trigger API calls on component mount (like useEffect)
    this.invoices_service.refreshInvoices();
    this.invoices_service.refreshLedger();
  }

  // paginator handler
  onPageChange(event: PaginatorState) {
    this.first.set(event.first ?? 0);
    this.pageSize.set(event.rows ?? 5);
    this.pageNum.set((event.page ?? 0) + 1);
  }

  // dialog state
  voucherDialogVisible = false;
  selectedVoucher: any = null;

  openVoucherDialog(entry: any) {
    this.selectedVoucher = {
      voucher_type: entry.voucher_type,
      voucher_no: entry.voucher_no,
      posting_date: entry.posting_date,
      debit: entry.debit,
      credit: entry.credit,
      balance: entry.balance,
      remarks: entry.remarks,
      account: entry.account,
      against: entry.against,
    };
    this.voucherDialogVisible = true;
  }

  // Determine if transaction is paid (credit > 0) or unpaid (debit > 0)
  isPaidTransaction(entry: any): boolean {
    return entry.credit && entry.credit > 0;
  }

  // Generate beautiful printable receipt for paid transactions
  generateReceipt(entry: any) {
    // Get customer profile from localStorage
    const customerProfile = JSON.parse(localStorage.getItem('user') || '{}');

    const postingDate = new Date(entry.posting_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const postingTime = new Date(entry.posting_date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt - ${entry.voucher_no}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1f2937; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          
          /* Company Header */
          .company-header { background: #f8fafc; padding: 15px; text-align: center; border-bottom: 1px solid #2563eb; }
          .company-name { font-size: 18px; font-weight: 700; color: #2563eb; margin-bottom: 4px; }
          .receipt-title { font-size: 14px; font-weight: 600; color: #1d4ed8; margin-bottom: 6px; }
          .company-tagline { font-size: 10px; color: #6b7280; margin-bottom: 6px; }
          .company-address { font-size: 9px; color: #4b5563; line-height: 1.2; }
          
          /* Receipt Details */
          .receipt-details { background: white; padding: 12px; }
          .receipt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
          .receipt-number { font-size: 14px; font-weight: 600; color: #1f2937; }
          .receipt-date { font-size: 10px; color: #6b7280; }
          
          /* Payment Info */
          .payment-section { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 10px; border-radius: 6px; margin-bottom: 12px; position: relative; overflow: hidden; }
          .payment-section::before { content: '✓'; position: absolute; top: -3px; right: -3px; font-size: 30px; opacity: 0.1; font-weight: bold; }
          .payment-title { font-size: 12px; font-weight: 600; margin-bottom: 6px; }
          .payment-amount { font-size: 18px; font-weight: 700; margin-bottom: 4px; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
          .payment-status { font-size: 10px; opacity: 0.9; }
          
          /* Transaction Details */
          .transaction-details { background: #f8fafc; padding: 10px; border-radius: 4px; margin-bottom: 12px; }
          .detail-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #4b5563; font-size: 10px; }
          .detail-value { font-weight: 500; color: #1f2937; font-size: 10px; }
          
          /* Customer Info */
          .customer-section { background: white; padding: 10px; border: 1px solid #e5e7eb; border-radius: 4px; margin-bottom: 12px; }
          .customer-title { font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 6px; }
          .customer-info { font-size: 10px; color: #4b5563; line-height: 1.2; }
          
          /* Footer */
          .footer { background: #1f2937; color: white; padding: 10px; text-align: center; }
          .footer-title { font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #3b82f6; }
          .footer-text { font-size: 8px; opacity: 0.8; margin-bottom: 2px; }
          .footer-logo { width: 30px; height: 30px; background: #3b82f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; font-weight: bold; font-size: 14px; }
          
          /* Print Styles */
          @media print { 
            body { background: white; }
            .container { box-shadow: none; }
            .company-header { background: #f8fafc !important; -webkit-print-color-adjust: exact; }
            .payment-section { background: #10b981 !important; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Company Header -->
          <div class="company-header">
            <div class="company-name">Techsavanna Company Limited</div>
            <div class="receipt-title">PAYMENT RECEIPT</div>
            <div class="company-tagline">ERPs Billing Platform</div>
            <div class="company-address">
              Reliance Centre - 2nd Floor, Left Wing<br>
              Westlands Woodvale Grove, Nairobi, Kenya<br>
              Phone: 0719535899 | Email: admin@techsavanna.technology
            </div>
          </div>

          <!-- Receipt Details -->
          <div class="receipt-details">
            <div class="receipt-header">
              <div>
                <div class="receipt-number">Receipt #${entry.voucher_no}</div>
                <div class="receipt-date">Generated on ${postingDate} at ${postingTime}</div>
              </div>
            </div>

            <!-- Payment Confirmation -->
            <div class="payment-section">
              <div class="payment-title">Payment Received Successfully</div>
              <div class="payment-amount">KES ${entry.credit.toFixed(2)}</div>
              <div class="payment-status">Transaction completed on ${postingDate}</div>
            </div>

            <!-- Transaction Details -->
            <div class="transaction-details">
              <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">${entry.voucher_no}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">${postingDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Time:</span>
                <span class="detail-value">${postingTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Account:</span>
                <span class="detail-value">${entry.account || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Against:</span>
                <span class="detail-value">${entry.against || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Running Balance:</span>
                <span class="detail-value">KES ${entry.balance.toFixed(2)}</span>
              </div>
              ${entry.remarks ? `
              <div class="detail-row">
                <span class="detail-label">Remarks:</span>
                <span class="detail-value">${entry.remarks}</span>
              </div>
              ` : ''}
            </div>

            <!-- Customer Info -->
            <div class="customer-section">
              <div class="customer-title">Customer Information</div>
              <div class="customer-info">
                <strong>${customerProfile.name || (customerProfile.first_name + ' ' + customerProfile.last_name).trim() || 'Not available'}</strong><br>
                Email: ${customerProfile.email || 'Not available'}<br>
                Phone: ${customerProfile.phone || 'Not available'}
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-title">Techsavanna</div>
            <div class="footer-text">Thank you for your payment!</div>
            <div class="footer-text">This is a computer generated receipt.</div>
            <div class="footer-text">For support, contact: admin@techsavanna.technology</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create hidden iframe for direct printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-1000px';
    iframe.style.left = '-1000px';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Wait for content to load then print
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    }
  }

  // Generate professional invoice matching invoices page format
  generateInvoice(entry: any) {
    // Get customer profile from localStorage
    const customerProfile = JSON.parse(localStorage.getItem('user') || '{}');

    const postingDate = new Date(entry.posting_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const dueDate = new Date(entry.posting_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const statusColor = entry.status === 'Paid' ? '#10b981' : entry.status === 'Unpaid' ? '#ef4444' : '#f59e0b';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${entry.voucher_no}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1f2937; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          
          /* Company Header */
          .company-header { background: #f8fafc; padding: 30px; text-align: center; border-bottom: 3px solid #2563eb; }
          .company-name { font-size: 28px; font-weight: 700; color: #2563eb; margin-bottom: 8px; }
          .invoice-title { font-size: 18px; font-weight: 600; color: #1d4ed8; margin-bottom: 15px; }
          .company-tagline { font-size: 14px; color: #6b7280; margin-bottom: 15px; }
          .company-address { font-size: 13px; color: #4b5563; line-height: 1.5; }
          
          /* Billing Section */
          .billing-section { display: flex; justify-content: space-between; padding: 30px; background: white; }
          .billing-from, .billing-to { flex: 1; }
          .billing-to { text-align: right; }
          .billing-title { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 15px; }
          .billing-info { font-size: 14px; color: #4b5563; line-height: 1.6; }
          
          /* Invoice Details */
          .invoice-details { background: #f8fafc; padding: 25px; margin: 0 30px; border-radius: 8px; }
          .invoice-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .invoice-row:last-child { border-bottom: none; }
          .invoice-label { font-weight: 600; color: #4b5563; }
          .invoice-value { font-weight: 500; color: #1f2937; }
          .status-badge { background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          
          /* Items Table */
          .table { width: 100%; border-collapse: collapse; margin: 30px; background: white; border: 1px solid #e5e7eb; }
          .table th { background: #3b82f6; color: white; padding: 12px 15px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; }
          .table th:last-child { text-align: right; }
          .table td { padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1f2937; }
          .table td:last-child { text-align: right; font-weight: 600; }
          
          /* Totals */
          .totals { margin: 0 30px 30px 30px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 8px 0; }
          .total-label { font-weight: 600; color: #6b7280; font-size: 14px; }
          .total-value { font-weight: 600; color: #1f2937; font-size: 14px; }
          .grand-total { border-top: 2px solid #3b82f6; padding-top: 12px; margin-top: 12px; }
          .grand-total .total-label { font-size: 16px; color: #1f2937; }
          .grand-total .total-value { font-size: 18px; color: #3b82f6; font-weight: 700; }
          
          /* Payment Info */
          .payment-info { margin: 0 30px 30px 30px; padding: 20px; background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 8px; }
          .payment-title { color: #1f2937; margin-bottom: 8px; font-size: 16px; font-weight: 600; }
          .payment-text { font-size: 14px; color: #6b7280; line-height: 1.6; }
          
          /* Footer */
          .footer { background: #1f2937; color: white; padding: 25px; text-align: center; }
          .footer-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #3b82f6; }
          .footer-text { font-size: 12px; opacity: 0.8; margin-bottom: 5px; }
          .footer-logo { width: 30px; height: 30px; background: #3b82f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; font-weight: bold; font-size: 14px; }
          
          /* Print Styles */
          @media print { 
            body { background: white; }
            .container { box-shadow: none; }
            .company-header { background: #f8fafc !important; -webkit-print-color-adjust: exact; }
            .table th { background: #3b82f6 !important; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Company Header -->
          <div class="company-header">
            <div class="company-name">Techsavanna Company Limited</div>
            <div class="invoice-title">INVOICE</div>
            <div class="company-tagline">ERPs Billing Platform</div>
            <div class="company-address">
              Reliance Centre - 2nd Floor, Left Wing<br>
              Westlands Woodvale Grove, Nairobi, Kenya<br>
              Phone: 0719535899 | Email: admin@techsavanna.technology
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
                Email: admin@techsavanna.technology
              </div>
            </div>
            <div class="billing-to">
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
              <span class="invoice-value">${entry.voucher_no}</span>
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
                <span class="status-badge">${entry.status || 'Unpaid'}</span>
              </span>
            </div>
          </div>

          <!-- Items Table -->
          <table class="table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Amount (KES)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Service</td>
                <td>${entry.debit.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Totals -->
          <div class="totals">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">${entry.debit.toFixed(2)} KES</span>
            </div>
            <div class="total-row grand-total">
              <span class="total-label">Total Amount:</span>
              <span class="total-value">${entry.debit.toFixed(2)} KES</span>
            </div>
            <div class="total-row">
              <span class="total-label">Outstanding Amount:</span>
              <span class="total-value" style="color: #ef4444; font-weight: 700;">${entry.debit.toFixed(2)} KES</span>
            </div>
          </div>

          <!-- Payment Instructions -->
          <div class="payment-info">
            <div class="payment-title">Payment Instructions</div>
            <div class="payment-text">
              Please make payment using the available payment methods in your dashboard.<br>
              For assistance with payment, contact our support team at admin@techsavanna.technology
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-title">Techsavanna</div>
            <div class="footer-text">Thank you for your business!</div>
            <div class="footer-text">This is a computer generated invoice.</div>
            <div class="footer-text">For support, contact: admin@techsavanna.technology</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create hidden iframe for direct printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-1000px';
    iframe.style.left = '-1000px';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Wait for content to load then print
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    }
  }

  closeVoucherDialog() {
    this.voucherDialogVisible = false;
    this.selectedVoucher = null;
  }

  // Get preview content for dialog (same as print content)
  getPreviewContent(entry: any): SafeHtml {
    if (this.isPaidTransaction(entry)) {
      return this.sanitizer.bypassSecurityTrustHtml(this.getReceiptHtmlContent(entry));
    } else {
      return this.sanitizer.bypassSecurityTrustHtml(this.getInvoiceHtmlContent(entry));
    }
  }

  // Extract receipt HTML content for preview
  private getReceiptHtmlContent(entry: any): string {
    // Get customer profile from localStorage
    const customerProfile = JSON.parse(localStorage.getItem('user') || '{}');

    const postingDate = new Date(entry.posting_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const postingTime = new Date(entry.posting_date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div style="max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
        <!-- Company Header -->
        <div style="background: #f8fafc; padding: 15px; text-align: center; border-bottom: 1px solid #2563eb;">
          <div style="font-size: 18px; font-weight: 700; color: #2563eb; margin-bottom: 4px;">Techsavanna Company Limited</div>
          <div style="font-size: 14px; font-weight: 600; color: #1d4ed8; margin-bottom: 6px;">PAYMENT RECEIPT</div>
          <div style="font-size: 10px; color: #6b7280; margin-bottom: 6px;">ERPs Billing Platform</div>
          <div style="font-size: 9px; color: #4b5563; line-height: 1.2;">
            Reliance Centre - 2nd Floor, Left Wing<br>
            Westlands Woodvale Grove, Nairobi, Kenya<br>
            Phone: 0719535899 | Email: admin@techsavanna.technology
          </div>
        </div>

        <!-- Receipt Details -->
        <div style="background: white; padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">
            <div>
              <div style="font-size: 14px; font-weight: 600; color: #1f2937;">Receipt #${entry.voucher_no}</div>
              <div style="font-size: 10px; color: #6b7280;">Generated on ${postingDate} at ${postingTime}</div>
            </div>
          </div>

          <!-- Payment Confirmation -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 10px; border-radius: 6px; margin-bottom: 12px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -3px; right: -3px; font-size: 30px; opacity: 0.1; font-weight: bold;">✓</div>
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px;">Payment Received Successfully</div>
            <div style="font-size: 18px; font-weight: 700; margin-bottom: 4px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">KES ${entry.credit.toFixed(2)}</div>
            <div style="font-size: 10px; opacity: 0.9;">Transaction completed on ${postingDate}</div>
          </div>

          <!-- Transaction Details -->
          <div style="background: #f8fafc; padding: 10px; border-radius: 4px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="font-weight: 600; color: #4b5563; font-size: 10px;">Transaction ID:</span>
              <span style="font-weight: 500; color: #1f2937; font-size: 10px;">${entry.voucher_no}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="font-weight: 600; color: #4b5563; font-size: 10px;">Payment Date:</span>
              <span style="font-weight: 500; color: #1f2937; font-size: 10px;">${postingDate}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="font-weight: 600; color: #4b5563; font-size: 10px;">Payment Time:</span>
              <span style="font-weight: 500; color: #1f2937; font-size: 10px;">${postingTime}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="font-weight: 600; color: #4b5563; font-size: 10px;">Account:</span>
              <span style="font-weight: 500; color: #1f2937; font-size: 10px;">${entry.account || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="font-weight: 600; color: #4b5563; font-size: 10px;">Against:</span>
              <span style="font-weight: 500; color: #1f2937; font-size: 10px;">${entry.against || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="font-weight: 600; color: #4b5563; font-size: 10px;">Running Balance:</span>
              <span style="font-weight: 500; color: #1f2937; font-size: 10px;">KES ${entry.balance.toFixed(2)}</span>
            </div>
            ${entry.remarks ? `
            <div style="display: flex; justify-content: space-between; padding: 4px 0;">
              <span style="font-weight: 600; color: #4b5563; font-size: 10px;">Remarks:</span>
              <span style="font-weight: 500; color: #1f2937; font-size: 10px;">${entry.remarks}</span>
            </div>
            ` : ''}
          </div>

          <!-- Customer Info -->
          <div style="background: white; padding: 10px; border: 1px solid #e5e7eb; border-radius: 4px; margin-bottom: 12px;">
            <div style="font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 6px;">Customer Information</div>
            <div style="font-size: 10px; color: #4b5563; line-height: 1.2;">
              <strong>${customerProfile.name || (customerProfile.first_name + ' ' + customerProfile.last_name).trim() || 'Not available'}</strong><br>
              Email: ${customerProfile.email || 'Not available'}<br>
              Phone: ${customerProfile.phone || 'Not available'}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #1f2937; color: white; padding: 10px; text-align: center;">
          <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #3b82f6;">Techsavanna</div>
          <div style="font-size: 8px; opacity: 0.8; margin-bottom: 2px;">Thank you for your payment!</div>
          <div style="font-size: 8px; opacity: 0.8; margin-bottom: 2px;">This is a computer generated receipt.</div>
          <div style="font-size: 8px; opacity: 0.8;">For support, contact: admin@techsavanna.technology</div>
        </div>
      </div>
    `;
  }

  // Extract invoice HTML content for preview
  private getInvoiceHtmlContent(entry: any): string {
    // Get customer profile from localStorage
    const customerProfile = JSON.parse(localStorage.getItem('user') || '{}');

    const postingDate = new Date(entry.posting_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const dueDate = new Date(entry.posting_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const statusColor = entry.status === 'Paid' ? '#10b981' : entry.status === 'Unpaid' ? '#ef4444' : '#f59e0b';

    return `
      <div style="max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
        <!-- Company Header -->
        <div style="background: #f8fafc; padding: 15px; text-align: center; border-bottom: 1px solid #2563eb;">
          <div style="font-size: 18px; font-weight: 700; color: #2563eb; margin-bottom: 4px;">Techsavanna Company Limited</div>
          <div style="font-size: 14px; font-weight: 600; color: #1d4ed8; margin-bottom: 6px;">INVOICE</div>
          <div style="font-size: 10px; color: #6b7280; margin-bottom: 6px;">ERPs Billing Platform</div>
          <div style="font-size: 9px; color: #4b5563; line-height: 1.2;">
            Reliance Centre - 2nd Floor, Left Wing<br>
            Westlands Woodvale Grove, Nairobi, Kenya<br>
            Phone: 0719535899 | Email: admin@techsavanna.technology
          </div>
        </div>

        <!-- Billing From/To -->
        <div style="display: flex; justify-content: space-between; padding: 15px; background: white;">
          <div style="flex: 1;">
            <div style="font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">Billing From</div>
            <div style="font-size: 10px; color: #4b5563; line-height: 1.3;">
              <strong>Techsavanna Company Limited</strong><br>
              Reliance Centre - 2nd Floor, Left Wing<br>
              Westlands Woodvale Grove<br>
              Nairobi, Kenya<br>
              Phone: 0719535899<br>
              Email: admin@techsavanna.technology
            </div>
          </div>
          <div style="flex: 1; text-align: right;">
            <div style="font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">Billing To</div>
            <div style="font-size: 10px; color: #4b5563; line-height: 1.3;">
              <strong>${customerProfile.name || (customerProfile.first_name + ' ' + customerProfile.last_name).trim() || 'Not available'}</strong><br>
              Email: ${customerProfile.email || 'Not available'}<br>
              Phone: ${customerProfile.phone || 'Not available'}
            </div>
          </div>
        </div>

        <!-- Invoice Details -->
        <div style="background: #f8fafc; padding: 10px; margin: 0 15px; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="font-weight: 600; color: #4b5563; font-size: 10px;">Invoice Number:</span>
            <span style="font-weight: 500; color: #1f2937; font-size: 10px;">${entry.voucher_no}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="font-weight: 600; color: #4b5563; font-size: 10px;">Posting Date:</span>
            <span style="font-weight: 500; color: #1f2937; font-size: 10px;">${postingDate}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="font-weight: 600; color: #4b5563; font-size: 10px;">Due Date:</span>
            <span style="font-weight: 500; color: #1f2937; font-size: 10px;">${dueDate}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0;">
            <span style="font-weight: 600; color: #4b5563; font-size: 10px;">Status:</span>
            <span style="font-weight: 500; color: #1f2937;">
              <span style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 8px; font-weight: 600;">${entry.status || 'Unpaid'}</span>
            </span>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin: 15px; background: white; border: 1px solid #e5e7eb;">
          <thead>
            <tr style="background: #3b82f6; color: white;">
              <th style="padding: 6px 8px; text-align: left; font-weight: 600; font-size: 10px; text-transform: uppercase;">Service</th>
              <th style="padding: 6px 8px; text-align: right; font-weight: 600; font-size: 10px; text-transform: uppercase;">Amount (KES)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; color: #1f2937;">Service</td>
              <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; color: #1f2937; text-align: right; font-weight: 600;">${entry.debit.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <!-- Totals -->
        <div style="margin: 0 15px 15px 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding: 4px 0;">
            <span style="font-weight: 600; color: #6b7280; font-size: 10px;">Subtotal:</span>
            <span style="font-weight: 600; color: #1f2937; font-size: 10px;">${entry.debit.toFixed(2)} KES</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding: 4px 0; border-top: 1px solid #3b82f6; padding-top: 6px; margin-top: 6px;">
            <span style="font-weight: 600; color: #1f2937; font-size: 12px;">Total Amount:</span>
            <span style="font-weight: 700; color: #3b82f6; font-size: 14px;">${entry.debit.toFixed(2)} KES</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding: 4px 0;">
            <span style="font-weight: 600; color: #6b7280; font-size: 10px;">Outstanding Amount:</span>
            <span style="font-weight: 700; color: #ef4444; font-size: 10px;">${entry.debit.toFixed(2)} KES</span>
          </div>
        </div>

        <!-- Payment Instructions -->
        <div style="margin: 0 15px 15px 15px; padding: 10px; background: #f8fafc; border-left: 2px solid #3b82f6; border-radius: 4px;">
          <div style="color: #1f2937; margin-bottom: 4px; font-size: 12px; font-weight: 600;">Payment Instructions</div>
          <div style="font-size: 10px; color: #6b7280; line-height: 1.3;">
            Please make payment using the available payment methods in your dashboard.<br>
            For assistance with payment, contact our support team at admin@techsavanna.technology
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #1f2937; color: white; padding: 10px; text-align: center;">
          <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #3b82f6;">Techsavanna</div>
          <div style="font-size: 8px; opacity: 0.8; margin-bottom: 2px;">Thank you for your business!</div>
          <div style="font-size: 8px; opacity: 0.8; margin-bottom: 2px;">This is a computer generated invoice.</div>
          <div style="font-size: 8px; opacity: 0.8;">For support, contact: admin@techsavanna.technology</div>
        </div>
      </div>
    `;
  }

  // 📌 Export table to PDF
  // 📌 Export table to PDF
  exportToPdf() {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);

    // Define table headers
    const head = [
      [
        'Posting Date',
        'Reference',
        'Reference No',
        'Debit',
        'Credit',
        'Balance',
        'Remarks',
      ],
    ];

    // Extract rows from ledger
    const body =
      this.ledger().data?.map((entry) => [
        new Date(entry.posting_date ?? '').toLocaleDateString(),
        entry.voucher_type ?? '',
        entry.voucher_no ?? '',
        entry.debit?.toFixed(2) ?? '0.00',
        entry.credit?.toFixed(2) ?? '0.00',
        entry.balance?.toFixed(2) ?? '0.00',
        entry.remarks ?? '',
      ]) ?? [];

    // 📌 This is what was missing
    autoTable(doc, {
      head,
      body,
      startY: 25,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        halign: 'center', // horizontal alignment ('left' | 'right' | 'center')
        valign: 'middle', // vertical alignment
        lineColor: [44, 62, 80], // border color
        lineWidth: 0.1, // border width
      },
      headStyles: {
        fillColor: [8, 76, 156], // blue header background
        textColor: [255, 255, 255], // white header text
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // zebra striping
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 25 }, // Posting Date column
        1: { halign: 'left', cellWidth: 25 }, // Reference
        2: { halign: 'center', cellWidth: 30 }, // Reference No
        3: { halign: 'right', cellWidth: 20 }, // Debit
        4: { halign: 'right', cellWidth: 20 }, // Credit
        5: { halign: 'right', cellWidth: 20 }, // Balance
        6: { halign: 'left', cellWidth: 40 }, // Remarks
      },
    });

    // Save PDF
    doc.save('billing-history.pdf');
  }

  // Filter methods
  onSearchChange() {
    this.first.set(0);
    this.pageNum.set(1);
    this.invoices_service.refreshLedger();
  }

  onDateChange() {
    this.first.set(0);
    this.pageNum.set(1);
    this.invoices_service.refreshLedger();
  }

  onReferenceChange() {
    this.first.set(0);
    this.pageNum.set(1);
    this.invoices_service.refreshLedger();
  }

  onCreditAmountChange() {
    this.first.set(0);
    this.pageNum.set(1);
    this.invoices_service.refreshLedger();
  }

  // stub
  pay_invoice() { }
}
