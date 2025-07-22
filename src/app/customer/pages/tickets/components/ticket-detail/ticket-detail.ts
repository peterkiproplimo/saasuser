import {Component, DestroyRef, inject, signal} from '@angular/core';
import {DatePipe, NgClass} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {TicketService} from '../../services/ticket-service';
import {ProgressSpinner} from 'primeng/progressspinner';
import {Dialog} from 'primeng/dialog';
import {FormControl, FormGroup, FormsModule, Validators} from '@angular/forms';
import {Functions} from '../../../../../shared/functions/functions';
import {
  ReactiveTextAreaComponent
} from '../../../../../shared/components/form/reactive-text-area/reactive-text-area.component';
import {MessageService} from 'primeng/api';
import {ReactiveInputComponent} from '../../../../../shared/components/form/reactive-input/reactive-input.component';
import {FileUpload} from 'primeng/fileupload';

@Component({
  selector: 'app-ticket-detail',
  imports: [
    DatePipe,
    RouterLink,
    ProgressSpinner,
    Dialog,
    FormsModule,
    ReactiveTextAreaComponent,
    ReactiveInputComponent,
    FileUpload,
    NgClass
  ],
  providers: [MessageService],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss'
})
export class TicketDetail {

  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private functions = new Functions();
  selectedFiles: File[] = [];
  uploading = false;

  ticket_service = inject(TicketService);
  ticket_id = this.route.snapshot.paramMap.get('id') ?? '';

  constructor() {
    if (this.ticket_id) {
      this.ticket_service.id.set(Number(this.ticket_id));
      this.ticket_form.patchValue({ ticket_id: this.ticket_id });
    }
  }


  ticket_dialog = signal(false);
  loading = signal<boolean>(false);
  ticket = this.ticket_service.ticket_by_id_resource.value;
  comments = this.ticket_service.comment_resource.value;
  ticket_is_loading = this.ticket_service.ticket_by_id_resource.isLoading;
  comments_is_loading = this.ticket_service.comment_resource.isLoading;

  ticket_form = new FormGroup({
    ticket_id : new FormControl('', [Validators.required]),
    comment_text: new FormControl('', [Validators.required]),
    })

  hideDialog() {
    this.ticket_form.reset({ ticket_id: this.ticket_id });
    this.ticket_dialog.set(false);
    this.ticket_form.reset();
    this.ticket_form.markAsUntouched();
  }

  open_dialog() {
    this.ticket_form.reset({ ticket_id: this.ticket_id });
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

    let ticket_id = this.ticket_form.get('ticket_id')?.value;
    let comment_text = this.ticket_form.get('comment_text')?.value;

    formData.append('ticket_id', ticket_id!);
    formData.append('comment_text', comment_text!);

    for (const file of this.selectedFiles) {
      formData.append('files', file);
    }


    this.ticket_service.create_comment(formData).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.ticket_dialog.set(false);
        this.ticket_form.reset();
        this.ticket_form.markAsUntouched();
        this.ticket_form.reset({ ticket_id: this.ticket_id });
        this.selectedFiles = [];

        this.ticket_service.comment_resource.reload();
        this.ticket_service.ticket_by_id_resource.reload();

        this.functions.show_toast("Comment Addition Successful", 'success', response.message?.message!);
      },
      error: (error) => {
        this.loading.set(false);
        this.functions.show_toast("Comment Addition Failed", 'error',error.error?.message);
      }
    });

  }


}
