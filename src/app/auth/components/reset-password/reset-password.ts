import {Component, DestroyRef} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProgressSpinner} from 'primeng/progressspinner';
import {ReactiveInputComponent} from '../../../shared/components/form/reactive-input/reactive-input.component';
import {Functions, passwordMatchValidator} from '../../../shared/functions/functions';
import {AuthService} from '../../services/auth.service';
import {ResetPasswordRequest} from '../../models/requests/reset-password-request';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-reset-password',
  imports: [
    FormsModule,
    ProgressSpinner,
    ReactiveInputComponent,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword {
  token!: string;
  loading = false;
  functions = new Functions();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private destroyRef: DestroyRef,
              private auth_service: AuthService) {
    this.token = this.route.snapshot.paramMap.get('token')!;
  }

  reset_form = new FormGroup({
      password: new FormControl('', [Validators.required]),
      confirm_password: new FormControl('', [Validators.required]),
    }, { validators: passwordMatchValidator() })

  reset_password() {
    this.reset_form?.markAllAsTouched();
    if (this.reset_form?.invalid) return;

    this.loading = true;
    let reset_password_request :ResetPasswordRequest = {
      token: this.token,
      new_password: this.reset_form.value.password!,
      confirm_password: this.reset_form.value.confirm_password!
    };

    this.auth_service.reset_password(reset_password_request).pipe(
      takeUntilDestroyed(this.destroyRef)
    )
      .subscribe({
      next: data => {
        this.loading = false;
        this.functions.show_toast("Password Reset Successful", 'success',data.message!);
        this.router.navigate(['/auth/login']);
      },
      error: error => {
        this.loading = false;
        this.functions.show_toast("Password Reset Failed", 'error', error.error.message);
      },
      complete: () => {}
    });

  }



}
