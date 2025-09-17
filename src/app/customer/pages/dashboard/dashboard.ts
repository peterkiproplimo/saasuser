import { Component, inject, computed } from '@angular/core';
import { InvoicesService } from '../invoices/services/invoices';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { SubscriptionService } from '../../../subscriptions/subscription.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    ProgressSpinner,
    CurrencyPipe,
    DatePipe,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  invoices_service = inject(InvoicesService);
  subscription_service = inject(SubscriptionService);

  constructor() {
    this.invoices_service.status.set("Unpaid");
  }

  invoices = this.invoices_service.invoices_resource.value;
  invoices_loading = this.invoices_service.invoices_resource.isLoading;

  subscriptions = this.subscription_service.subscription_resource.value;
  subscriptions_loading = this.subscription_service.subscription_resource.isLoading;

  ledger = this.invoices_service.ledger_resource.value;
  ledger_loading = this.invoices_service.ledger_resource.isLoading;

  // Computed properties for safe data access
  subscriptionsData = computed(() => this.subscriptions()?.data || []);
  invoicesData = computed(() => this.invoices()?.data || []);
  ledgerData = computed(() => this.ledger()?.data || []);

  getTotalOutstanding(): number {
    const invoicesData = this.invoices()?.data;
    if (!invoicesData || !Array.isArray(invoicesData)) return 0;
    return invoicesData.reduce((total, invoice) => {
      return total + (invoice.outstanding_amount || 0);
    }, 0);
  }
}
