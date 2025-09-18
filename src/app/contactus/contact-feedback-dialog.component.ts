import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-contact-feedback-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [closable]="false"
      [style]="{ width: '25vw' }"
    >
      <div class="flex flex-col items-center space-y-4 text-center">
        <div
          [ngClass]="{
            'bg-blue-100 text-blue-600': success,
            'bg-red-100 text-red-600': !success
          }"
          class="rounded-full p-3"
        >
          <i *ngIf="success" class="pi pi-check-circle text-2xl"></i>
          <i *ngIf="!success" class="pi pi-times-circle text-2xl"></i>
        </div>

        <h2
          class="text-xl font-bold"
          [ngClass]="success ? 'text-blue-700' : 'text-red-700'"
        >
          {{ success ? 'Success' : 'Error' }}
        </h2>

        <p class="text-gray-600 px-4">
          {{ message }}
        </p>

        <button
          pButton
          label="OK"
          class="p-button-sm"
          (click)="closeDialog()"
        ></button>
      </div>
    </p-dialog>
  `,
})
export class ContactFeedbackDialogComponent {
  @Input() visible = false;
  @Input() success = false;
  @Input() message = '';
  @Output() visibleChange = new EventEmitter<boolean>();

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}
