import {Component, DestroyRef, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ReactiveInputComponent} from '../../../shared/components/form/reactive-input/reactive-input.component';
import {AuthService} from '../../services/auth.service';
import {LoginRequest} from '../../models/login-request';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MessageService} from 'primeng/api';
import {Toast} from 'primeng/toast';
import {ProgressSpinner} from 'primeng/progressspinner';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, ReactiveInputComponent, Toast, ProgressSpinner],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loading: boolean = false;

  private router = inject(Router);
  message_service = inject(MessageService);
  private auth_service = inject(AuthService);
  private destroyRef = inject(DestroyRef);

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
            this.router.navigate(["/"]);
          },
          error: error => {
            this.loading = false;
            this.showError(error.error.message);
          },
          complete: () => {
          }
        }
      )
  }

  showError(message:string) {
    this.message_service.add({ severity: 'error', summary: 'Authentication Error', detail: message });
  }

}
