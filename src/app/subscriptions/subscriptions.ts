import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { FormsModule } from '@angular/forms';
import {
  NgIf,
  NgFor,
  NgClass,
  DecimalPipe,
} from '@angular/common';

import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';

import { SubscriptionService } from './subscription.service';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  templateUrl: './subscriptions.html',
  styleUrls: ['./subscriptions.scss'],
  imports: [
    NgIf,
    NgFor,
    NgClass,
    FormsModule,
    DecimalPipe,
    CommonModule,
    DialogModule,
    PaginatorModule,
    InputTextModule,
    ButtonModule,
    BadgeModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionsComponent implements OnInit, OnDestroy {
  subscription_service = inject(SubscriptionService);
  private router = inject(Router);

  // Make Math available in template
  Math = Math;

  list = this.subscription_service.subscription_resource.value;
  is_loading = this.subscription_service.subscription_resource.isLoading;
  is_error = () => {
    const statusCode = this.subscription_service.subscription_resource.statusCode();
    return statusCode && statusCode !== 200 ? statusCode : null;
  };

  showDialog = false;
  showDetailsDialog = false;
  selectedSubscription: any = null;
  search_text = '';

  loading = false;
  error: string | null = null;

  form = {
    party: '',
    plan: '',
    qty: 1,
  };

  private routerSub: Subscription | undefined;
  private searchSubject = new Subject<string>();

  // Pagination state
  page = 0;
  pageSize = 10;
  total = 0;

  ngOnInit(): void {
    this.fetchSubscriptions();

    // Set up debounced search
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.page = 0; // Reset to first page whenever searching
        this.fetchSubscriptions();
      });

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.fetchSubscriptions();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.searchSubject.complete();
  }

  fetchSubscriptions(): void {
    this.subscription_service.page.set(this.page + 1); // API expects 1-based index
    this.subscription_service.pageSize.set(this.pageSize);
    this.subscription_service.searchTerm.set(this.search_text);

    this.subscription_service.refreshSubscriptions(); // Use the new refresh method
  }
  onSearch(): void {
    this.searchSubject.next(this.search_text);
  }

  onPageChange(event: any): void {
    this.page = Math.floor(event.first / event.rows);
    this.pageSize = event.rows;
    this.fetchSubscriptions();
  }

  totalRecords(): number {
    // Use pagination.total_records from the API response
    const data = this.subscription_service.subscription_resource.value();
    return data?.pagination?.total_records || 0;
  }

  // Pagination methods
  onPageSizeChange(): void {
    this.page = 0; // Reset to first page when changing page size
    this.fetchSubscriptions();
  }

  goToFirstPage(): void {
    this.page = 0;
    this.fetchSubscriptions();
  }

  goToPreviousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.fetchSubscriptions();
    }
  }

  goToNextPage(): void {
    const totalPages = Math.ceil(this.totalRecords() / this.pageSize);
    if (this.page < totalPages - 1) {
      this.page++;
      this.fetchSubscriptions();
    }
  }

  goToLastPage(): void {
    const totalPages = Math.ceil(this.totalRecords() / this.pageSize);
    this.page = totalPages - 1;
    this.fetchSubscriptions();
  }

  goToPage(pageNumber: number): void {
    this.page = pageNumber;
    this.fetchSubscriptions();
  }

  getVisiblePages(): number[] {
    const totalPages = Math.ceil(this.totalRecords() / this.pageSize);
    const currentPage = this.page + 1;
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  createSubscription(): void {
    this.showDialog = false;
    this.subscription_service.refreshSubscriptions();
  }

  // Details dialog methods
  openDetailsDialog(subscription: any): void {
    this.selectedSubscription = subscription;
    this.showDetailsDialog = true;
  }

  closeDetailsDialog(): void {
    this.showDetailsDialog = false;
    this.selectedSubscription = null;
  }


  downloadPDF(): void {
    if (this.selectedSubscription) {
      // Generate PDF content
      const pdfContent = this.generatePDFContent();

      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(pdfContent);
        printWindow.document.close();

        // Wait for content to load, then trigger print
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  }

  generatePDFContent(): string {
    if (!this.selectedSubscription) return '';

    const currentDate = this.getCurrentDate();

    // Calculate totals from actual data
    let subtotal = 0;
    const plansTable = this.selectedSubscription.plans && this.selectedSubscription.plans.length > 0
      ? this.selectedSubscription.plans.map((plan: any) => {
        const amount = plan.qty * plan.cost;
        subtotal += amount;
        return `
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px;">${plan.plan}</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; text-align: right;">${plan.cost.toFixed(2)} ${plan.currency}</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; text-align: right;">${plan.qty}</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; text-align: right; font-weight: 600;">${amount.toFixed(2)} ${plan.currency}</td>
            </tr>
          `;
      }).join('')
      : '<tr><td colspan="4" style="padding: 8px 12px; text-align: center; color: #6b7280; font-style: italic; font-size: 12px;">No plan details available</td></tr>';

    // Get latest invoice data
    const latestInvoice = this.selectedSubscription.latest_invoice;
    const grandTotal = latestInvoice ? latestInvoice.grand_total : subtotal;
    const currency = latestInvoice ? latestInvoice.currency : (this.selectedSubscription.plans && this.selectedSubscription.plans.length > 0 ? this.selectedSubscription.plans[0].currency : 'KES');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Subscription Report - ${this.selectedSubscription.name}</title>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: white;
            color: #1f2937;
            line-height: 1.5;
            font-size: 14px;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #3b82f6;
          }
          
          .title {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 4px;
          }
          
          .subtitle {
            font-size: 14px;
            color: #6b7280;
          }
          
          .company {
            text-align: right;
          }
          
          .company-logo {
            width: 50px;
            height: 50px;
            margin-bottom: 8px;
          }
          
          .company-name {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 2px;
          }
          
          .company-tagline {
            font-size: 12px;
            color: #3b82f6;
            font-weight: 600;
            margin-bottom: 4px;
          }
          
          .company-address {
            color: #6b7280;
            font-size: 10px;
            line-height: 1.3;
          }
          
          .info-section {
            margin-bottom: 15px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            padding: 4px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          
          .info-row:last-child {
            border-bottom: none;
          }
          
          .info-label {
            font-weight: 600;
            color: #6b7280;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          
          .info-value {
            color: #1f2937;
            font-weight: 500;
            font-size: 12px;
          }
          
          .status {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          
          .status-past-due {
            background: #fef2f2;
            color: #dc2626;
          }
          
          .status-active {
            background: #dcfce7;
            color: #166534;
          }
          
          .status-unpaid {
            background: #fef3c7;
            color: #d97706;
          }
          
          .separator {
            height: 1px;
            background: #3b82f6;
            margin: 15px 0;
          }
          
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            background: white;
            border: 1px solid #e5e7eb;
          }
          
          .table th {
            background: #3b82f6;
            color: white;
            padding: 8px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          
          .table th:last-child,
          .table th:nth-child(2),
          .table th:nth-child(3) {
            text-align: right;
          }
          
          .table td {
            padding: 8px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 12px;
            color: #1f2937;
          }
          
          .table td:last-child,
          .table td:nth-child(2),
          .table td:nth-child(3) {
            text-align: right;
          }
          
          .table tr:nth-child(even) {
            background: #f9fafb;
          }
          
          .footer {
            background: #1f2937;
            color: white;
            padding: 12px;
            text-align: center;
            margin-top: 20px;
          }
          
          .footer-title {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 4px;
            color: #3b82f6;
          }
          
          .footer-text {
            font-size: 10px;
            opacity: 0.8;
            margin: 1px 0;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 0;
            }
            .container {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div>
              <div class="title">Subscription Report</div>
              <div class="subtitle">TechSavanna ERPs Billing Platform</div>
            </div>
            <div class="company">
              <img src="/images/tech-savanna-logo.svg" alt="TechSavanna Logo" class="company-logo" />
              <div class="company-name">TechSavanna</div>
              <div class="company-tagline">ERPs Billing Platform</div>
              <div class="company-address">
                Reliance Centre - 2nd Floor, Left Wing<br>
                Westlands Woodvale Grove, Nairobi, Kenya<br>
                Phone: 0700106077
              </div>
            </div>
          </div>

          <!-- Subscription Information -->
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Subscriber</span>
              <span class="info-value">${this.selectedSubscription.party || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Subscription ID</span>
              <span class="info-value">${this.selectedSubscription.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status</span>
              <span class="info-value">
                <span class="status status-${this.selectedSubscription.status?.toLowerCase().replace(' ', '-') || 'unknown'}">${this.selectedSubscription.status || 'N/A'}</span>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Invoice Period</span>
              <span class="info-value">${this.formatDate(this.selectedSubscription.current_invoice_start)} - ${this.formatDate(this.selectedSubscription.current_invoice_end)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Created</span>
              <span class="info-value">${this.formatDate(this.selectedSubscription.creation)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Report Generated</span>
              <span class="info-value">${currentDate}</span>
            </div>
          </div>

          <!-- Separator -->
          <div class="separator"></div>

          <!-- Plans Table -->
          <table class="table">
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Rate</th>
                <th>Quantity</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${plansTable}
            </tbody>
          </table>

          <!-- Invoice Information -->
          ${latestInvoice ? `
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Invoice Number</span>
              <span class="info-value">${latestInvoice.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Amount</span>
              <span class="info-value">${grandTotal.toFixed(2)} ${currency}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Invoice Status</span>
              <span class="info-value">
                <span class="status status-${latestInvoice.status?.toLowerCase() || 'unknown'}">${latestInvoice.status}</span>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Posting Date</span>
              <span class="info-value">${this.formatDate(latestInvoice.posting_date)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Prorate Factor</span>
              <span class="info-value">${latestInvoice.prorate_factor}</span>
            </div>
          </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            <div class="footer-title">TechSavanna ERPs Billing Platform</div>
            <div style="margin: 8px 0;">
              <div style="width: 40px; height: 40px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto 4px auto; color: white; font-weight: bold; font-size: 16px;">
                TS
              </div>
            </div>
            <div class="footer-text">Your trusted partner in enterprise resource planning and billing solutions</div>
            <div class="footer-text">Support: support&#64;techsavanna.com | Website: www.techsavanna.com</div>
            <div class="footer-text">Report generated on ${currentDate}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  printPDF(): void {
    if (this.selectedSubscription) {
      // Generate PDF content using the same method as downloadPDF
      const pdfContent = this.generatePDFContent();

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(pdfContent);
        printWindow.document.close();

        // Wait for content to load, then trigger print
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  }

  // Utility methods for formatting
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateDuration(startDate: string, endDate: string): string {
    if (!startDate || !endDate) return 'N/A';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  }

  getCurrentDate(): string {
    return this.formatDate(new Date().toISOString());
  }

  getDueDate(): string {
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    return this.formatDate(dueDate.toISOString());
  }

  getPDFPreviewContent(): string {
    if (!this.selectedSubscription) {
      return '<div class="text-center text-gray-500 p-8">No subscription selected</div>';
    }

    const currentDate = this.getCurrentDate();
    const plansTable = this.selectedSubscription.plans && this.selectedSubscription.plans.length > 0
      ? this.selectedSubscription.plans.map((plan: any) => `
          <tr class="border-b border-gray-200">
            <td class="px-4 py-2 text-gray-900">${plan.plan}</td>
            <td class="px-4 py-2 text-gray-900">${plan.qty}</td>
            <td class="px-4 py-2 text-gray-900">${plan.cost.toFixed(2)}</td>
            <td class="px-4 py-2 text-gray-900">${plan.currency}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="4" class="px-4 py-2 text-center text-gray-600">No plan details available</td></tr>';

    const invoiceInfo = this.selectedSubscription.latest_invoice ? `
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Latest Invoice</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-600">Invoice Number:</span>
            <p class="text-gray-900 font-mono">${this.selectedSubscription.latest_invoice.name}</p>
          </div>
          <div>
            <span class="font-medium text-gray-600">Total Amount:</span>
            <p class="text-gray-900 font-semibold">${this.selectedSubscription.latest_invoice.grand_total.toFixed(2)} ${this.selectedSubscription.latest_invoice.currency}</p>
          </div>
          <div>
            <span class="font-medium text-gray-600">Status:</span>
            <p class="text-gray-900">${this.selectedSubscription.latest_invoice.status}</p>
          </div>
          <div>
            <span class="font-medium text-gray-600">Posting Date:</span>
            <p class="text-gray-900">${this.formatDate(this.selectedSubscription.latest_invoice.posting_date)}</p>
          </div>
        </div>
      </div>
    ` : '';

    return `
      <!-- PDF Header -->
      <div class="text-center mb-8 border-b-2 border-gray-200 pb-6">
        <div class="flex items-center justify-center mb-4">
          <div class="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
            <i class="pi pi-building text-white text-2xl"></i>
          </div>
          <div class="text-left">
            <h1 class="text-2xl font-bold text-gray-900">TechSavanna</h1>
            <p class="text-sm text-gray-600">Billing Platform</p>
          </div>
        </div>
        <h2 class="text-xl font-semibold text-gray-800">Subscription Report</h2>
        <p class="text-sm text-gray-600">Generated on ${currentDate}</p>
      </div>

      <!-- Subscription Details -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Subscription Information</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-600">Subscription ID:</span>
            <p class="text-gray-900 font-mono">${this.selectedSubscription.name}</p>
          </div>
          <div>
            <span class="font-medium text-gray-600">Status:</span>
            <p class="text-gray-900">${this.selectedSubscription.status}</p>
          </div>
          <div>
            <span class="font-medium text-gray-600">Party:</span>
            <p class="text-gray-900">${this.selectedSubscription.party}</p>
          </div>
          <div>
            <span class="font-medium text-gray-600">Creation Date:</span>
            <p class="text-gray-900">${this.formatDate(this.selectedSubscription.creation)}</p>
          </div>
        </div>
      </div>

      <!-- Plan Details -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Plan Details</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left font-medium text-gray-600">Plan Name</th>
                <th class="px-4 py-2 text-left font-medium text-gray-600">Quantity</th>
                <th class="px-4 py-2 text-left font-medium text-gray-600">Cost</th>
                <th class="px-4 py-2 text-left font-medium text-gray-600">Currency</th>
              </tr>
            </thead>
            <tbody>
              ${plansTable}
            </tbody>
          </table>
        </div>
      </div>

      ${invoiceInfo}

      <!-- Invoice Period -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Invoice Period</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-600">Start Date:</span>
            <p class="text-gray-900">${this.formatDate(this.selectedSubscription.current_invoice_start)}</p>
          </div>
          <div>
            <span class="font-medium text-gray-600">End Date:</span>
            <p class="text-gray-900">${this.formatDate(this.selectedSubscription.current_invoice_end)}</p>
          </div>
          <div>
            <span class="font-medium text-gray-600">Duration:</span>
            <p class="text-gray-900">${this.calculateDuration(this.selectedSubscription.current_invoice_start, this.selectedSubscription.current_invoice_end)}</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>This report was generated by TechSavanna Billing Platform</p>
        <p>For support, contact us at support@techsavanna.com</p>
      </div>
    `;
  }

  statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'unpaid':
        return 'warn';
      case 'cancelled':
        return 'danger';
      default:
        return 'info';
    }
  }
}
