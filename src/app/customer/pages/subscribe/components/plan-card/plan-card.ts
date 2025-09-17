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
import { MessageService } from 'primeng/api';
import { Plan } from '../../models/responses/list-plan-response';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'; // ✅ Only this from rxjs-interop
import { ReactiveInputComponent } from '../../../../../shared/components/form/reactive-input/reactive-input.component';
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
    ReactiveFormsModule,
    FormsModule,
    ReactiveInputComponent,
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
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      amount: [null, [Validators.required, Validators.min(1)]],
    });
  }

  subscribe() {
    if (!this.plan || !this.domainName) return;

    this.loading.set(true);
    this.invoiceNumber = `INV-${Math.floor(Math.random() * 1000000)}`;
    this.selectedDomain = `${this.domainName}.techsavanna.technology`;

    const payload = {
      plan: this.plan, // send the selected plan object
      subdomain: this.domainName, // just the subdomain part
      invoice: this.invoiceNumber,
    };

    this.http.post(`${this.base_url}/orders`, payload).subscribe({
      next: (res) => {
        console.log('Order placed:', res);
        this.domainDialogOpen.set(false);
        this.paymentVisible = true; // show payment form
      },
      error: (err) => {
        console.error('Error placing order:', err);
        alert('Failed to place order. Please try again.');
      },
      complete: () => this.loading.set(false),
    });
  }

  submitDomain() {
    if (!this.domainName) return;

    this.selectedDomain = `${this.domainName.trim().toLowerCase()}-${
      this.plan.name
    }.techsavanna.technology`;
    this.domainDialogOpen.set(false);

    // Prefill amount with plan cost
    this.paymentForm.patchValue({ amount: this.plan.cost });

    // Show payment form
    this.paymentVisible = true;
  }

  hidePaymentForm() {
    this.paymentForm.reset();
    this.paymentVisible = false;
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
      invoice_name: 'ACC-SINV-2025-00023',
      payment_amount: Number(this.paymentForm.value.amount),
      payment_mode: 'PesaPal',
      customer_email: this.paymentForm.value.email,
      customer_phone: this.paymentForm.value.phone,
      domain,
    };

    console.log('📤 Sending payment request:', paymentRequest);

    this.invoices_service
      .pay_invoice(paymentRequest)
      .pipe(takeUntilDestroyed(this.destroyRef)) // ✅ only once
      .subscribe({
        next: (res) => {
          const url = res?.data?.payment_url;
          if (url) {
            this.payment_iframe_url.set(
              this.sanitizer.bypassSecurityTrustResourceUrl(url)
            );
            this.iframe_dialog.set(true);
            this.paymentVisible = false;
          } else {
            this.error_message.set(res?.message || 'Payment request failed');
            this.error_dialog.set(true);
          }
        },
        error: (err) => {
          this.error_message.set(
            err?.error?.message || 'Payment request failed'
          );
          this.error_dialog.set(true);
        },
        complete: () => this.paymentLoading.set(false),
      });
  }
}
