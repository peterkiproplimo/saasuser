import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SolutionsApiService, Solution } from '../../services/solutions-api.service';
import { PlansApiService, Plan } from '../../services/plans-api.service';
import { SubscriptionCreationService, CreateSubscriptionRequest } from '../../services/subscription-creation.service';
import { InvoicesService } from '../../../invoices/services/invoices';
import { PaymentRequest } from '../../../invoices/models/requests/payment_request';
import { PaymentResponse } from '../../../invoices/models/responses/payment_response';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

interface SolutionCard {
    name: string;
    description: string;
    icon: string;
}

@Component({
    selector: 'app-stepper-form',
    standalone: true,
    imports: [
        FormsModule,
        CommonModule,
        HttpClientModule,
        DialogModule,
        ButtonModule,
        ProgressSpinnerModule
    ],
    providers: [MessageService],
    templateUrl: './stepper-form.html',
    styleUrls: ['./stepper-form.scss']
})
export class StepperFormComponent implements OnInit {
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);
    private sanitizer = inject(DomSanitizer);
    private invoicesService = inject(InvoicesService);

    solutionsApiService = inject(SolutionsApiService);
    plansApiService = inject(PlansApiService);
    subscriptionCreationService = inject(SubscriptionCreationService);

    // Stepper state
    currentStep = signal(1);

    // Form data
    selectedSolution: Solution | null = null;
    selectedPlan: Plan | null = null;
    subdomainName = '';
    paymentAmount = 1;

    // Payment dialog states
    paymentLoading = signal(false);
    iframeDialog = signal(false);
    errorDialog = signal(false);
    errorMessage = signal('');
    paymentIframeUrl = signal<SafeResourceUrl | null>(null);

    // Subscription creation states
    subscriptionLoading = signal(false);
    subscriptionError = signal<string | null>(null);
    createdSubscription = signal<any>(null);

    // API data signals
    solutions = this.solutionsApiService.solutions;
    plans = this.plansApiService.plans;
    isLoadingSolutions = this.solutionsApiService.isLoading;
    isLoadingPlans = this.plansApiService.isLoading;
    solutionsError = this.solutionsApiService.error;
    plansError = this.plansApiService.error;

    // Solution card mapping for icons
    solutionIcons: { [key: string]: string } = {
        'Techsavanna PMS': 'pi-building',
        'Techsavanna Pos': 'pi-shopping-cart',
        'TechSavanna HRM': 'pi-users'
    };

    constructor() {
        // No form initialization needed
    }

    ngOnInit() {
        // Initialize with default values
        this.paymentAmount = 1;

        // Load solutions from API
        this.solutionsApiService.loadSolutions();
    }

    selectSolution(solution: Solution) {
        this.selectedSolution = solution;

        // Load plans for the selected solution
        this.plansApiService.loadPlans(solution.app_name);
    }

    selectPlan(plan: Plan) {
        this.selectedPlan = plan;
        this.paymentAmount = plan.cost;
    }

    getSolutionIcon(solutionName: string): string {
        return this.solutionIcons[solutionName] || 'pi-cog';
    }

    onImageError(event: any): void {
        // Hide the image and show fallback icon
        event.target.style.display = 'none';
    }

    goToNextStep() {
        if (this.canProceed()) {
            // If moving from step 3 to step 4, create the subscription first
            if (this.currentStep() === 3) {
                this.createSubscription();
            } else {
                this.currentStep.update(step => step + 1);
            }
        }
    }

    createSubscription() {
        if (!this.selectedPlan || !this.subdomainName) {
            this.subscriptionError.set('Missing plan or subdomain information');
            return;
        }

        this.subscriptionLoading.set(true);
        this.subscriptionError.set(null);

        const request: CreateSubscriptionRequest = {
            plan: this.selectedPlan.plan_name,
            subdomain: this.subdomainName
        };

        console.log('📤 Creating subscription:', request);

        this.subscriptionCreationService.createSubscription(request)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    console.log('✅ Subscription created:', response);
                    this.createdSubscription.set(response.data);
                    this.subscriptionLoading.set(false);

                    // Move to next step after successful subscription creation
                    this.currentStep.update(step => step + 1);
                },
                error: (err) => {
                    console.error('❌ Subscription creation error:', err);
                    this.subscriptionError.set(
                        err?.error?.message || err?.message || 'Failed to create subscription'
                    );
                    this.subscriptionLoading.set(false);
                }
            });
    }

    goToPreviousStep() {
        if (this.currentStep() > 1) {
            this.currentStep.update(step => step - 1);
        }
    }

    canProceed(): boolean {
        switch (this.currentStep()) {
            case 1:
                return this.selectedSolution !== null;
            case 2:
                return this.selectedPlan !== null;
            case 3:
                return this.subdomainName.length >= 3 && this.subdomainName.length <= 20;
            case 4:
                return this.paymentAmount > 0;
            default:
                return false;
        }
    }

    processPayment() {
        if (this.canProceed()) {
            // Process payment directly without dialog
            this.payInvoice();
        }
    }

    payInvoice() {
        this.paymentLoading.set(true);

        // Use the created subscription data directly
        const subscription = this.createdSubscription();
        const invoiceName = subscription?.invoice?.name || `SUB-${this.selectedSolution?.app_name?.replace(/\s+/g, '-')}-${this.selectedPlan?.plan_name?.replace(/\s+/g, '-')}-${Date.now()}`;

        // Extract email from party field (format: "Name - email@domain.com")
        const partyEmail = subscription?.party?.split(' - ')[1] || 'customer@techsavanna.technology';

        const paymentRequest: PaymentRequest = {
            invoice_name: invoiceName,
            payment_amount: subscription?.invoice?.grand_total || this.paymentAmount,
            payment_mode: 'PesaPal',
            customer_email: partyEmail,
            customer_phone: '', // Empty phone as requested
            domain: subscription?.custom_subdomain || this.subdomainName + (this.selectedPlan?.application?.subdomain || '-pms.techsavanna.technology')
        };

        console.log('📤 Sending payment request:', paymentRequest);

        this.invoicesService
            .pay_invoice(paymentRequest)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res: PaymentResponse) => {
                    console.log('✅ Payment processed:', res);

                    // Handle payment success - redirect to iframe
                    if (res.data?.payment_url) {
                        console.log('🔗 Payment URL found:', res.data.payment_url);
                        this.paymentIframeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(res.data.payment_url));
                        this.iframeDialog.set(true);
                    } else {
                        console.log('⚠️ No payment URL found in response:', res);
                        this.errorMessage.set(res?.message || 'Payment request failed');
                        this.errorDialog.set(true);
                    }
                },
                error: (err) => {
                    console.error('❌ Payment error:', err);
                    this.errorMessage.set(
                        err?.error?.message || err?.message || 'Payment request failed'
                    );
                    this.errorDialog.set(true);
                },
                complete: () => this.paymentLoading.set(false),
            });
    }


    hideErrorDialog() {
        this.errorDialog.set(false);
    }

    hideIframeDialog() {
        this.iframeDialog.set(false);
        // Navigate to success page or dashboard after successful payment
        this.router.navigate(['/customer/dashboard']);
    }
}
