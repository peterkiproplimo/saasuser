import {Component, DestroyRef, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ReactiveInputComponent} from '../../../shared/components/form/reactive-input/reactive-input.component';
import {AuthService} from '../../services/auth.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ProgressSpinner} from 'primeng/progressspinner';
import {RegisterRequest} from '../../models/requests/register-request';
import {Functions, passwordMatchValidator} from '../../../shared/functions/functions';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule,
    FormsModule,
    ReactiveInputComponent,
    ProgressSpinner
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  loading: boolean = false;

  private router = inject(Router);
  private auth_service = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private functions = new Functions();

signup_form = new FormGroup({
  company_name: new FormControl('', [Validators.required]),
  first_name: new FormControl('', [Validators.required]),
  last_name: new FormControl('', [Validators.required]),
  email: new FormControl('', [Validators.required, Validators.email]),
  phone: new FormControl('', [Validators.required]),
  password: new FormControl('', [Validators.required]),
  confirm_password: new FormControl('', [Validators.required]),
}, { validators: passwordMatchValidator() });


  signup() {
    this.signup_form?.markAllAsTouched();
    if (this.signup_form?.invalid) return;

    this.loading = true;
    let register_request : RegisterRequest = {
      email: this.signup_form.value.email!,
      password: this.signup_form.value.password!,
      first_name: this.signup_form.value.first_name!,
      last_name: this.signup_form.value.last_name!,
      organization: this.signup_form.value.company_name!,
      confirm_password: this.signup_form.value.confirm_password!
    }

    this.auth_service.register(register_request).pipe(
      takeUntilDestroyed(this.destroyRef)
    )
      .subscribe({
          next: data => {
            this.loading = false;
            this.functions.show_toast('Signup Successful', 'success', 'You have successfully registered. Please log in to continue.');
            this.router.navigate(["/auth/login"]);
          },
          error: error => {
            this.loading = false;
            this.functions.show_toast('Signup Error', 'error', error.error.message || 'An error occurred during registration.');
          },
          complete: () => {
          }
        }
      )
  }

}
