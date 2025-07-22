import {Component, computed, inject, signal} from '@angular/core';
import {TicketService} from './services/ticket-service';
import {Paginator, PaginatorState} from 'primeng/paginator';
import {EmptyStateComponent} from '../../../shared/components/empty-state/empty-state.component';
import {ProgressSpinner} from 'primeng/progressspinner';
import {RouterLink} from '@angular/router';
import {ButtonDirective} from 'primeng/button';
import {FormControl, FormGroup, FormsModule, Validators} from '@angular/forms';
import {Dialog} from 'primeng/dialog';
import {FileUpload} from 'primeng/fileupload';
import {ReactiveInputComponent} from '../../../shared/components/form/reactive-input/reactive-input.component';
import {
  ReactiveTextAreaComponent
} from '../../../shared/components/form/reactive-text-area/reactive-text-area.component';
import {ReactiveSelectComponent} from '../../../shared/components/form/reactive-select/reactive-select.component';
import {MessageService} from 'primeng/api';
import {Functions} from '../../../shared/functions/functions';
import {DatePipe} from '@angular/common';
import {Calendar} from 'primeng/calendar';

@Component({
  selector: 'app-tickets',
  imports: [
    EmptyStateComponent,
    Paginator,
    ProgressSpinner,
    RouterLink,
    ButtonDirective,
    Dialog,
    FileUpload,
    FormsModule,
    ReactiveInputComponent,
    ReactiveTextAreaComponent,
    ReactiveSelectComponent,
    DatePipe,
    Calendar,
  ],
  providers: [MessageService],
  templateUrl: './tickets.html',
  styleUrl: './tickets.scss'
})
export class Tickets {

  search_text = signal<string>('');
  start_date = signal<Date | null>(null);
  end_date = signal<Date | null>(null);

  ticker_service = inject(TicketService);
  tickets = this.ticker_service.ticket_resource.value;
  private functions = new Functions();

  ticket_types = this.ticker_service.ticket_type_resource.value;

  pageNum = this.ticker_service.page;
  pageSize = this.ticker_service.page_size;
  is_loading = this.ticker_service.ticket_resource.isLoading;
  first = signal<number>(0);
  totalRecords = computed(() => this.tickets().pagination?.total_records ?? 0);

  ticket_dialog = signal(false);
  loading = signal<boolean>(false);
  selectedFiles: File[] = [];

  priorities = [
    { name: 'Low'},
    { name: 'Medium'},
    { name: 'High'},
    { name: 'Urgent'}
  ];

  ticket_form = new FormGroup({
    ticket_type: new FormControl('', [Validators.required]),
    priority: new FormControl('', [Validators.required]),
    subject : new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
  })

  onPageChange(event: PaginatorState) {
    this.first.set(event.first ?? 0);
    this.pageSize.set(event.rows ?? 5);
    this.pageNum.set((event.page ?? 0) + 1);

  }

  hideDialog() {
    this.ticket_form.reset();
    this.ticket_dialog.set(false);
    this.ticket_form.reset();
    this.ticket_form.markAsUntouched();
  }

  open_dialog() {
    this.ticket_dialog.set(true);
  }

  onFileUpload(event: any) {
    this.selectedFiles = event.files;
  }

  save_ticket() {
    this.ticket_form?.markAllAsTouched();
    if (this.ticket_form?.invalid) return;

    this.loading.set(true);

    const formData = new FormData();

    let ticket_type = this.ticket_form.get('ticket_type')?.value;
    let priority = this.ticket_form.get('priority')?.value;
    let subject = this.ticket_form.get('subject')?.value;
    let description = this.ticket_form.get('description')?.value;
    formData.append('ticket_type', ticket_type!);
    formData.append('priority', priority!);
    formData.append('subject', subject!);
    formData.append('description', description!);
    for (const file of this.selectedFiles) {
      formData.append('files', file);
    }
    this.ticker_service.create_ticket(formData).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.ticket_dialog.set(false);
        this.ticket_form.reset();
        this.ticket_form.markAsUntouched();
        this.selectedFiles = [];
        this.ticker_service.ticket_resource.reload();
        this.functions.show_toast("Ticket Raised Successfully", 'success', response.message?.message!);
      },
      error: (error) => {
        this.loading.set(false);
        this.functions.show_toast("Comment Addition Successful", 'error', error.message?.message!);
      }
    });

  }

}
