import {Component, computed, inject, signal} from '@angular/core';
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

  search_text = signal<string>('');
  start_date = this.invoices_service.start_date;
  end_date = this.invoices_service.end_date;


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

  onPageChange(event: PaginatorState) {
    this.first.set(event.first ?? 0);
    this.pageSize.set(event.rows ?? 5);
    this.pageNum.set((event.page ?? 0) + 1);
  }

  pay_invoice(invoice: Invoice) {

  }


}
