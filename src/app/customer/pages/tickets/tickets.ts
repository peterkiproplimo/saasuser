import {Component, computed, inject, signal} from '@angular/core';
import {TicketService} from './services/ticket-service';
import {Paginator, PaginatorState} from 'primeng/paginator';
import {EmptyStateComponent} from '../../../shared/components/empty-state/empty-state.component';
import {ProgressSpinner} from 'primeng/progressspinner';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-tickets',
  imports: [
    EmptyStateComponent,
    Paginator,
    ProgressSpinner,
    RouterLink
  ],
  templateUrl: './tickets.html',
  styleUrl: './tickets.scss'
})
export class Tickets {

  ticker_service = inject(TicketService);
  tickets = this.ticker_service.ticket_resource.value;

  pageNum = this.ticker_service.page;
  pageSize = this.ticker_service.page_size;
  is_loading = this.ticker_service.ticket_resource.isLoading;
  first = signal<number>(0);
  totalRecords = computed(() => this.tickets().pagination?.total_records ?? 0);

  onPageChange(event: PaginatorState) {
    this.first.set(event.first ?? 0);
    this.pageSize.set(event.rows ?? 5);
    this.pageNum.set((event.page ?? 0) + 1);
  }

}
