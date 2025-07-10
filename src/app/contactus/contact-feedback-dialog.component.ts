import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-contact-feedback-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="p-6 max-w-sm mx-auto">
      <div class="flex flex-col items-center space-y-4">
        <div
          [ngClass]="{
            'bg-green-100 text-green-600': data.success,
            'bg-red-100 text-red-600': !data.success
          }"
          class="rounded-full p-3"
        >
          <svg
            *ngIf="data.success"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M5 13l4 4L19 7" />
          </svg>
          <svg
            *ngIf="!data.success"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h2 class="text-xl font-bold" [ngClass]="data.success ? 'text-green-700' : 'text-red-700'">
          {{ data.success  }}
        </h2>

        <p class="text-gray-600 text-center px-4">
          {{ data.message }}
        </p>

        <button
          mat-button
          mat-dialog-close
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          OK
        </button>
      </div>
    </div>
  `
})
export class ContactFeedbackDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { success: boolean; message: string }
  ) {}
}
