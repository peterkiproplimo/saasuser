import {Component, DestroyRef, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {ReactiveInputComponent} from '../../../shared/components/form/reactive-input/reactive-input.component';
import {AuthService} from '../../services/auth.service';
import {LoginRequest} from '../../models/requests/login-request';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ProgressSpinner} from 'primeng/progressspinner';
import {Functions} from '../../../shared/functions/functions';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, ReactiveInputComponent, ProgressSpinner, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loading: boolean = false;

  private router = inject(Router);
  private auth_service = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  functions = new Functions();

  login_form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    }
  )

  login() {
    this.login_form?.markAllAsTouched();
    if (this.login_form?.invalid) return;
    this.loading = true;
      let login_request : LoginRequest = {
        email: this.login_form.value.email!,
        password: this.login_form.value.password!
      }
    this.auth_service.login(login_request).pipe(
      takeUntilDestroyed(this.destroyRef)
    )
      .subscribe({
          next: data => {
            this.loading = false;
            this.router.navigate(["/customer"]);
          },
          error: error => {
            this.loading = false;
            this.functions.show_toast("Login Failed", 'error', error.error.message);
          },
          complete: () => {
          }
        }
      )
  }

}
