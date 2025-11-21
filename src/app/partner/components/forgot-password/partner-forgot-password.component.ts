import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReactiveInputComponent } from '../../../shared/components/form/reactive-input/reactive-input.component';
import { PartnerAuthService } from '../../services/partner-auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Functions } from '../../../shared/functions/functions';

@Component({
  selector: 'app-partner-forgot-password',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ReactiveInputComponent,
    ProgressSpinner,
    RouterLink
  ],
  templateUrl: './partner-forgot-password.component.html',
  styleUrl: './partner-forgot-password.component.scss'
})
export class PartnerForgotPasswordComponent {
  loading: boolean = false;
  emailSent: boolean = false;

  private router = inject(Router);
  private partnerAuth = inject(PartnerAuthService);
  private destroyRef = inject(DestroyRef);
  private functions = new Functions();

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  submitRequest() {
    this.forgotPasswordForm?.markAllAsTouched();
    if (this.forgotPasswordForm?.invalid) return;

    this.loading = true;
    const email = this.forgotPasswordForm.value.email!;

    this.partnerAuth.forgotPassword(email).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.loading = false;
        this.emailSent = true;
        this.functions.show_toast('Email Sent', 'success', 'Password reset instructions have been sent to your email.');
      },
      error: (error) => {
        this.loading = false;
        this.functions.show_toast('Error', 'error', error.error?.message || 'Failed to send reset email.');
      }
    });
  }
}













