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

  // open dialog with voucher data
  openVoucherDialog(entry: any) {
    this.selectedVoucher = { ...entry }; // shallow copy keeps data fresh
    this.voucherDialogVisible = true;
  }

  // close dialog
  closeVoucherDialog() {
    this.voucherDialogVisible = false;
    this.selectedVoucher = null;
  }

  // stubbed out until you add logic
  pay_invoice() {}
}
