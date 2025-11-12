import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReactiveInputComponent } from '../../../shared/components/form/reactive-input/reactive-input.component';
import { PartnerAuthService } from '../../services/partner-auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Functions } from '../../../shared/functions/functions';

@Component({
  selector: 'app-partner-login',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ReactiveInputComponent,
    ProgressSpinner,
    RouterLink,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './partner-login.component.html',
  styleUrl: './partner-login.component.scss'
})
export class PartnerLoginComponent {
  loading: boolean = false;

  private router = inject(Router);
  private partnerAuth = inject(PartnerAuthService);
  private destroyRef = inject(DestroyRef);
  private functions = new Functions();

  login_form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  login() {
    this.login_form?.markAllAsTouched();
    if (this.login_form?.invalid) return;

    this.loading = true;
    const email = this.login_form.value.email!;
    const password = this.login_form.value.password!;

    this.partnerAuth.login(email, password).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        console.log('Login component - response received:', response);
        // Small delay to ensure localStorage is set (tap runs synchronously, but just to be safe)
        setTimeout(() => {
          this.loading = false;
          // Verify login was successful before navigating
          const isLoggedIn = this.partnerAuth.isLoggedIn();
          const partner = this.partnerAuth.getCurrentPartner();
          console.log('Login check - isLoggedIn:', isLoggedIn, 'partner:', partner);
          
          if (isLoggedIn && partner) {
            this.router.navigate(['/partner/dashboard']).catch(err => {
              console.error('Navigation error:', err);
              this.functions.show_toast('Login Successful', 'success', 'Redirecting to dashboard...');
            });
          } else {
            console.error('Login failed - session not saved. isLoggedIn:', isLoggedIn, 'partner:', partner);
            this.functions.show_toast('Login Failed', 'error', 'Failed to save login session. Please try again.');
          }
        }, 100);
      },
      error: (error) => {
        this.loading = false;
        console.error('Login error - Full error object:', error);
        console.error('Login error - Status:', error.status);
        console.error('Login error - Error body:', error.error);
        console.error('Login error - Error message:', error.message);
        
        // Extract error message from different possible structures
        let errorMessage = 'Invalid email or password.';
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.error?.message) {
            errorMessage = error.error.error.message;
          } else if (error.error.exc_type) {
            errorMessage = error.error.exc || error.error.message || 'An error occurred';
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        console.error('Login error - Final error message:', errorMessage);
        this.functions.show_toast('Login Failed', 'error', errorMessage);
      }
    });
  }
}







