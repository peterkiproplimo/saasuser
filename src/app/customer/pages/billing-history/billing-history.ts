import { Component, computed, inject, signal } from '@angular/core';
import { InvoicesService } from '../invoices/services/invoices';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Button } from 'primeng/button';
import { DatePipe, DecimalPipe } from '@angular/common';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ProgressSpinner } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Calendar } from 'primeng/calendar';

// 📌 import jsPDF & autoTable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-billing-history',
  standalone: true,
  imports: [
    Button,
    DatePipe,
    DecimalPipe,
    EmptyStateComponent,
    Paginator,
    ProgressSpinner,
    Dialog,
    FormsModule,
    Calendar,
  ],
  templateUrl: './billing-history.html',
  styleUrl: './billing-history.scss',
})
export class BillingHistory {
  invoices_service = inject(InvoicesService);

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
    this.selectedVoucher = { ...entry };
    this.voucherDialogVisible = true;
  }

  closeVoucherDialog() {
    this.voucherDialogVisible = false;
    this.selectedVoucher = null;
  }

  // 📌 Export table to PDF
  exportToPdf() {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Billing History', 14, 15);

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

    doc.save('billing-history.pdf');
  }

  // stub
  pay_invoice() {}
}
