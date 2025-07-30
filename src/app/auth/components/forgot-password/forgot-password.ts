import { Component, DestroyRef, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Functions } from '../../../shared/functions/functions';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ReactiveInputComponent } from '../../../shared/components/form/reactive-input/reactive-input.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [
    FormsModule,
    ProgressSpinner,
    ReactiveInputComponent,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  loading: boolean = false;
  private auth_service = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  functions = new Functions();

  forgot_form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  forgot_password() {
    this.forgot_form?.markAllAsTouched();
    if (this.forgot_form?.invalid) return;

    this.loading = true;

    let forgot_password_request = {
      email: this.forgot_form.value.email!,
    };

    this.auth_service
      .forgot_password(forgot_password_request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.loading = false;
          this.functions.show_toast(
            'Password Reset Successful',
            'success',
            data.message!
          );
        },
        error: (error) => {
          this.loading = false;
          this.functions.show_toast(
            'Failed to send password reset link',
            'error',
            error.error.message
          );
        },
        complete: () => {},
      });
  }
}
