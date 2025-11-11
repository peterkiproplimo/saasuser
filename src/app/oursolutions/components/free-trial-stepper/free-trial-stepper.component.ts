import { Component, OnInit, signal, inject, DestroyRef, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlansApiService, Plan } from '../../../customer/pages/subscribe/services/plans-api.service';
import { AuthService } from '../../../auth/services/auth.service';
import { RegisterRequest } from '../../../auth/models/requests/register-request';
import { Functions, passwordMatchValidator } from '../../../shared/functions/functions';
import { ReactiveInputComponent } from '../../../shared/components/form/reactive-input/reactive-input.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-free-trial-stepper',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        RouterLink,
        ReactiveInputComponent,
        ProgressSpinnerModule,
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './free-trial-stepper.component.html',
    styleUrls: ['./free-trial-stepper.component.scss']
})
export class FreeTrialStepperComponent implements OnInit {
    @Input() solutionData: any = null;
    @Output() close = new EventEmitter<void>();

    private router = inject(Router);
    private destroyRef = inject(DestroyRef);
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);
    private functions = new Functions();

    plansApiService = inject(PlansApiService);

    // Stepper state
    currentStep = signal(1);

    // Form data
    selectedPlan: Plan | null = null;
    subdomainName = '';

    // Signup form
    signupForm = new FormGroup({
        company_name: new FormControl('', [Validators.required]),
        first_name: new FormControl('', [Validators.required]),
        last_name: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        phone: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
        confirm_password: new FormControl('', [Validators.required]),
    }, { validators: passwordMatchValidator() });

    // Loading states
    signupLoading = signal(false);
    trialCreationLoading = signal(false);

    // Error states
    signupError = signal<string | null>(null);
    trialCreationError = signal<string | null>(null);

    // Trial response data
    trialResponse = signal<any>(null);

    // API data signals
    plans = this.plansApiService.plans;
    isLoadingPlans = this.plansApiService.isLoading;
    plansError = this.plansApiService.error;

    base_url = environment.BASE_URL;

    ngOnInit() {
        // Load plans for the selected solution
        if (this.solutionData?.name) {
            this.plansApiService.loadPlans(this.solutionData.name);
        }
    }

    selectPlan(plan: Plan) {
        this.selectedPlan = plan;
    }

    onImageError(event: any): void {
        event.target.style.display = 'none';
    }

    goToNextStep() {
        if (this.canProceed()) {
            // If moving from step 2 to step 3, validate domain
            if (this.currentStep() === 2) {
                this.currentStep.update(step => step + 1);
            }
            // If moving from step 3 to step 4, submit signup and create trial
            else if (this.currentStep() === 3) {
                this.submitSignupAndCreateTrial();
            } else {
                this.currentStep.update(step => step + 1);
            }
        }
    }

    goToPreviousStep() {
        if (this.currentStep() > 1) {
            this.currentStep.update(step => step - 1);
        }
    }

    canProceed(): boolean {
        switch (this.currentStep()) {
            case 1:
                return this.selectedPlan !== null;
            case 2:
                return this.subdomainName.length >= 3 && this.subdomainName.length <= 20;
            case 3:
                return this.signupForm.valid;
            default:
                return false;
        }
    }

    submitSignupAndCreateTrial() {
        this.signupForm.markAllAsTouched();
        if (this.signupForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Please fill all required fields correctly.',
                life: 5000
            });
            return;
        }

        // Clear previous errors
        this.signupError.set(null);
        this.trialCreationError.set(null);
        this.signupLoading.set(true);

        const registerRequest: RegisterRequest = {
            email: this.signupForm.value.email!,
            password: this.signupForm.value.password!,
            first_name: this.signupForm.value.first_name!,
            last_name: this.signupForm.value.last_name!,
            organization: this.signupForm.value.company_name!,
            confirm_password: this.signupForm.value.confirm_password!
        };

        // First, register the user
        this.authService.register(registerRequest)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    // After successful registration, create the free trial
                    this.createFreeTrial();
                },
                error: (error) => {
                    this.signupLoading.set(false);
                    const errorMessage = this.extractErrorMessage(error, 'Registration failed');
                    this.signupError.set(errorMessage);

                    // Also show toast notification
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Registration Error',
                        detail: errorMessage,
                        life: 7000
                    });
                }
            });
    }

    createFreeTrial() {
        // Clear previous errors
        this.trialCreationError.set(null);
        this.trialCreationLoading.set(true);

        // API expects: { plan, email, subdomain }
        const trialRequest = {
            plan: this.selectedPlan?.plan_name || '',
            email: this.signupForm.value.email!,
            subdomain: this.subdomainName
        };

        this.http
            .post(`${this.base_url}.subscription.create_free_trial_subscription`, trialRequest)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: any) => {
                    this.trialCreationLoading.set(false);
                    this.signupLoading.set(false);

                    // Parse response - API returns { message: { ... } }
                    if (response?.message) {
                        // Store the response data for display in success step
                        this.trialResponse.set(response.message);

                        // Clear any errors on success
                        this.signupError.set(null);
                        this.trialCreationError.set(null);

                        // Show success toast
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: response.message.message || 'Free trial subscription created successfully.',
                            life: 5000
                        });

                        // Move to success step
                        this.currentStep.update(step => step + 1);
                    } else {
                        // Unexpected response format
                        this.trialCreationError.set('Unexpected response format from server');
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Unexpected response format from server',
                            life: 7000
                        });
                    }
                },
                error: (error) => {
                    this.trialCreationLoading.set(false);
                    this.signupLoading.set(false);
                    const errorMessage = this.extractErrorMessage(error, 'Failed to create free trial');
                    this.trialCreationError.set(errorMessage);

                    // Also show toast notification
                    this.handleApiError(error, 'Failed to create free trial');
                }
            });
    }

    private extractErrorMessage(error: any, defaultMessage: string): string {
        let errorMessage = defaultMessage;
        let errorCode = error?.status || 'Unknown';

        // Check for API not found errors
        if (error?.error?.exception?.includes('ValidationError') ||
            error?.error?.exception?.includes('No module named')) {
            errorCode = 417;
            errorMessage = 'Error 417: API not found. Check on frappe logs.';
        } else if (error?.status === 417) {
            errorCode = 417;
            errorMessage = 'Error 417: API not found.';
        }
        // Try to extract detailed error message
        else if (error?.error?.message) {
            errorMessage = `Error ${errorCode}: ${error.error.message}`;
        } else if (error?.error?.exc) {
            // Try to extract from exception traceback
            const excMatch = error.error.exc.match(/ValidationError: (.+?)\\n/);
            if (excMatch) {
                errorMessage = `Error ${errorCode}: ${excMatch[1]}`;
            } else {
                errorMessage = `Error ${errorCode}: ${defaultMessage}`;
            }
        } else if (error?.error?.exception) {
            errorMessage = `Error ${errorCode}: ${error.error.exception}`;
        } else if (error?.message) {
            errorMessage = `Error ${errorCode}: ${error.message}`;
        } else {
            errorMessage = `Error ${errorCode}: ${defaultMessage}`;
        }

        return errorMessage;
    }

    private handleApiError(error: any, defaultMessage: string): void {
        const errorMessage = this.extractErrorMessage(error, defaultMessage);
        const errorCode = error?.status || 'Unknown';

        this.messageService.add({
            severity: 'error',
            summary: `Error ${errorCode}`,
            detail: errorMessage,
            life: 7000
        });
    }

    navigateToLogin() {
        this.router.navigate(['/auth/login']);
    }

    closeStepper() {
        this.close.emit();
    }
}

