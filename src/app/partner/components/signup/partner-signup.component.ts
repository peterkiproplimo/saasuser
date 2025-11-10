import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReactiveInputComponent } from '../../../shared/components/form/reactive-input/reactive-input.component';
import { PartnerAuthService } from '../../services/partner-auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Functions, passwordMatchValidator } from '../../../shared/functions/functions';

@Component({
  selector: 'app-partner-signup',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ReactiveInputComponent,
    ProgressSpinner,
    RouterLink
  ],
  templateUrl: './partner-signup.component.html',
  styleUrl: './partner-signup.component.scss'
})
export class PartnerSignupComponent {
  loading: boolean = false;
  logoPreview: string | null = null;
  logoFile: File | null = null;

  // Ordered field cascade for progressive disclosure UX
  // Each next field appears once the previous becomes valid/filled.
  private isFieldReady(controlName: string): boolean {
    const control = this.signup_form.get(controlName);
    if (!control) return false;
    const value = control.value;
    const hasContent = value !== null && value !== undefined && String(value).trim().length > 0;
    return control.valid && hasContent;
  }

  // Expose helpers for template readability
  isCompanyNameReady() { return this.isFieldReady('company_name'); }
  isBusinessNumberReady() { return this.isFieldReady('business_number'); }
  isFirstNameReady() { return this.isFieldReady('first_name'); }
  isLastNameReady() { return this.isFieldReady('last_name'); }
  isEmailReady() { return this.isFieldReady('email'); }
  isPhoneReady() { return this.isFieldReady('phone'); }
  isAddressReady() { return this.isFieldReady('address'); }
  isCityReady() { return this.isFieldReady('city'); }
  isCountryReady() { return this.isFieldReady('country'); }
  isPasswordReady() { return this.isFieldReady('password'); }

  private router = inject(Router);
  private partnerAuth = inject(PartnerAuthService);
  private destroyRef = inject(DestroyRef);
  private functions = new Functions();

  constructor() {
    console.log('PartnerSignupComponent initialized');
    // If already logged in, show message but allow access to signup page
    if (this.partnerAuth.isLoggedIn()) {
      const currentPartner = this.partnerAuth.getCurrentPartner();
      this.functions.show_toast(
        'Already Logged In',
        'info',
        `You are logged in as ${currentPartner?.first_name} ${currentPartner?.last_name}. Log out to create a new partner account.`
      );
    }
  }

  signup_form = new FormGroup({
    company_name: new FormControl('', [Validators.required]),
    first_name: new FormControl('', [Validators.required]),
    last_name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
    business_number: new FormControl('', [Validators.required]), // KYC - Business number in Kenya
    address: new FormControl(''),
    city: new FormControl(''),
    country: new FormControl('Kenya', [Validators.required]),
    website: new FormControl(''),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirm_password: new FormControl('', [Validators.required]),
  }, { validators: passwordMatchValidator() });

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.logoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(this.logoFile);
    }
  }

  signup() {
    this.signup_form?.markAllAsTouched();
    if (this.signup_form?.invalid) return;

    this.loading = true;

    const partnerData = {
      email: this.signup_form.value.email!,
      password: this.signup_form.value.password!,
      first_name: this.signup_form.value.first_name!,
      last_name: this.signup_form.value.last_name!,
      company_name: this.signup_form.value.company_name!,
      phone: this.signup_form.value.phone!,
      business_number: this.signup_form.value.business_number!,
      logo: this.logoPreview || undefined,
      contact_info: {
        address: this.signup_form.value.address || undefined,
        city: this.signup_form.value.city || undefined,
        country: this.signup_form.value.country || 'Kenya',
        website: this.signup_form.value.website || undefined,
      }
    };

    this.partnerAuth.register(partnerData).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.loading = false;
        this.functions.show_toast('Signup Successful', 'success', 'You have successfully registered as a partner. Please log in to continue.');
        this.router.navigate(['/partner/login']);
      },
      error: (error) => {
        this.loading = false;
        this.functions.show_toast('Signup Error', 'error', error.error?.message || 'An error occurred during registration.');
      }
    });
  }
}

