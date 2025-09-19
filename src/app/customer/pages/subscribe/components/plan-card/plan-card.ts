import { Component, Input, inject, signal, DestroyRef } from '@angular/core'; // ✅ DestroyRef is here
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { Plan } from '../../models/responses/list-plan-response';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'; // ✅ Only this from rxjs-interop
import { Router } from '@angular/router';
import { CartService } from '../../../cart/services/cart-service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { InvoicesService } from '../../../invoices/services/invoices';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

export interface PaymentRequest {
  invoice_name: string;
  payment_amount: number;
  payment_mode: string;
  customer_email: string;
  customer_phone: string;
  domain?: string;
}

@Component({
  selector: 'app-plan-card',
  templateUrl: './plan-card.html',
  styleUrls: ['./plan-card.scss'],
  imports: [
    DialogModule,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    DecimalPipe,
    CommonModule,
  ],
  providers: [MessageService],
})
export class PlanCard {
  private destroyRef = inject(DestroyRef);
  @Input() plan!: Plan;

  // Signals
  loading = signal(false);
  domainDialogOpen = signal(false);
  paymentVisible = false;
  paymentLoading = signal(false);
  private http = inject(HttpClient);
  base_url = environment.BASE_URL;
  subscriptionData: any = null;

  // Extra signals for iframe + error dialogs
  payment_iframe_url = signal<SafeResourceUrl | null>(null);
  iframe_dialog = signal(false);
  error_message = signal('');
  error_dialog = signal(false);

  domainName = '';
  selectedDomain = '';
  invoiceNumber = '';

  paymentForm!: FormGroup;

  // ✅ Inject services
  private cartService = inject(CartService);
  private router = inject(Router);
  private invoices_service = inject(InvoicesService);
  private sanitizer = inject(DomSanitizer);
  private fb = inject(FormBuilder);

  constructor() {
    this.paymentForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
    });
  }

  subscribe() {
    if (!this.plan) return;

    // Clear any previous errors
    this.error_dialog.set(false);

    // Just open the domain dialog, do not call API yet
    this.invoiceNumber = `INV-${Math.floor(Math.random() * 1000000)}`;
    this.domainDialogOpen.set(true);
  }

  // Call API here after domain is entered
  submitDomain() {
    if (!this.domainName || !this.plan) return;

    this.loading.set(true);

    // Clean domain name - remove any existing suffixes and ensure it's just the subdomain
    let cleanDomain = this.domainName.trim().toLowerCase();

    // Remove common domain suffixes if user accidentally included them
    cleanDomain = cleanDomain.replace(/\.(com|org|net|Techsavanna\.technology)$/i, '');

    // Remove any special characters except hyphens and ensure it's valid
    cleanDomain = cleanDomain.replace(/[^a-z0-9-]/g, '');

    // Ensure it doesn't start or end with hyphen
    cleanDomain = cleanDomain.replace(/^-+|-+$/g, '');

    const payload = {
      plan: this.plan.name, // only the plan name
      subdomain: cleanDomain,
    };

    this.http
      .post(`${this.base_url}.subscription.create_subscription`, payload)
      .subscribe({
        next: (res: any) => {
          console.log('✅ Subscription created:', res);

          // Store subscription response
          this.subscriptionData = res.data;

          this.selectedDomain = this.subscriptionData.custom_subdomain;
          this.invoiceNumber = this.subscriptionData.invoice.name;

          // Prefill payment form with amount from invoice
          this.paymentForm.patchValue({
            amount: this.subscriptionData.invoice.grand_total,
          });

          // Open payment modal
          this.domainDialogOpen.set(false);
          this.paymentVisible = true;
        },
        error: (err) => {
          console.error('❌ Subscription error:', err);
          this.error_message.set(
            err?.error?.message || err?.message || 'Failed to create subscription. Please try again.'
          );
          this.error_dialog.set(true);
        },
        complete: () => this.loading.set(false),
      });
  }

  hidePaymentForm() {
    this.paymentForm.reset();
    this.paymentVisible = false;
    this.error_dialog.set(false);
  }

  onSubmit() {
    console.log('✅ Submitting payment form:', this.paymentForm.value);

    this.paymentForm.markAllAsTouched();
    if (this.paymentForm.invalid) {
      console.warn('⚠️ Form is invalid');
      return;
    }

    if (!this.selectedDomain) {
      console.warn('⚠️ No domain selected!');
      return;
    }

    this.payInvoice(this.selectedDomain);
  }

  payInvoice(domain: string) {
    this.paymentLoading.set(true);

    const paymentRequest: PaymentRequest = {
      invoice_name: this.invoiceNumber,
      payment_amount: Number(this.paymentForm.value.amount),
      payment_mode: 'PesaPal',
      customer_email: this.subscriptionData?.party?.split(' - ')[1] || '',
      customer_phone: '', // You may want to add phone field back or get it from subscription data
      domain,
    };

    console.log('📤 Sending payment request:', paymentRequest);

    this.invoices_service
      .pay_invoice(paymentRequest)
      .pipe(takeUntilDestroyed(this.destroyRef)) // ✅ only once
      .subscribe({
        next: (res: any) => {
          console.log('✅ Payment processed:', res);

          // Handle payment success - redirect to iframe or success page
          if (res.data?.payment_url) {
            console.log('🔗 Payment URL found:', res.data.payment_url);
            this.payment_iframe_url.set(this.sanitizer.bypassSecurityTrustResourceUrl(res.data.payment_url));
            this.iframe_dialog.set(true);
            this.paymentVisible = false;
          } else if (res.payment_url) {
            console.log('🔗 Payment URL found (root level):', res.payment_url);
            this.payment_iframe_url.set(this.sanitizer.bypassSecurityTrustResourceUrl(res.payment_url));
            this.iframe_dialog.set(true);
            this.paymentVisible = false;
          } else {
            console.log('⚠️ No payment URL found in response:', res);
            // Still close the payment form and show iframe dialog
            this.iframe_dialog.set(true);
            this.paymentVisible = false;
          }
        },

        error: (err) => {
          console.error('❌ Payment error:', err);
          this.error_message.set(
            err?.error?.message || err?.message || 'Payment request failed'
          );
          this.error_dialog.set(true);
        },
        complete: () => this.paymentLoading.set(false),
      });
  }
}
