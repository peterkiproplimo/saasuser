import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { InvoicesService } from '../invoices/services/invoices';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { DatePipe, DecimalPipe } from '@angular/common';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ProgressSpinner } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Calendar } from 'primeng/calendar';
import { CommonModule } from '@angular/common';

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
export class BillingHistory implements OnInit {
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
    };
    this.voucherDialogVisible = true;
  }

  closeVoucherDialog() {
    this.voucherDialogVisible = false;
    this.selectedVoucher = null;
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

  // stub
  pay_invoice() { }
}
