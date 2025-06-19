import {Component, DestroyRef, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ReactiveInputComponent} from '../../../shared/components/form/reactive-input/reactive-input.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component'; 
import {AuthService} from '../../services/auth.service';
// import {LoginRequest} from '../../models/signup-request';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MessageService} from 'primeng/api';
import {Toast} from 'primeng/toast';
import {ProgressSpinner} from 'primeng/progressspinner';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, FormsModule, ReactiveInputComponent, Toast, ProgressSpinner, NavbarComponent, ],
  providers: [MessageService],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  loading: boolean = false;

  private router = inject(Router);
  message_service = inject(MessageService);
  private auth_service = inject(AuthService);
  private destroyRef = inject(DestroyRef);

signup_form = new FormGroup({
  company_name: new FormControl('', [Validators.required]),
  full_name: new FormControl('', [Validators.required]),
  email: new FormControl('', [Validators.required, Validators.email]),
  phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]),
  password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  confirm_password: new FormControl('', [Validators.required]),
});


  signup() {
    this.signup_form?.markAllAsTouched();
    if (this.signup_form?.invalid) return;
     console.log(this.signup_form.value);

  }

  showError(message:string) {
    this.message_service.add({ severity: 'error', summary: 'Authentication Error', detail: message });
  }

}
