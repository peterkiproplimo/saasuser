import { Component, inject, computed, OnInit } from '@angular/core';
import { InvoicesService } from '../invoices/services/invoices';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SubscriptionService } from '../../../subscriptions/subscription.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    ProgressSpinner,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  invoices_service = inject(InvoicesService);
  subscription_service = inject(SubscriptionService);

  constructor() {
    this.invoices_service.status.set("Unpaid");
  }

  ngOnInit() {
    // Trigger API calls on component mount (like useEffect)
    this.invoices_service.refreshInvoices();
    this.invoices_service.refreshLedger();
    this.subscription_service.refreshSubscriptions();
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

  // Filtered subscription data based on invoice payment status
  activeSubscriptions = computed(() => this.subscriptionsData().filter(sub => sub.latest_invoice?.status === 'Paid'));
  inactiveSubscriptions = computed(() => this.subscriptionsData().filter(sub => sub.latest_invoice?.status === 'Unpaid'));
  activeSubscriptionsCount = computed(() => this.activeSubscriptions().length);
  inactiveSubscriptionsCount = computed(() => this.inactiveSubscriptions().length);

  getTotalOutstanding(): number {
    const invoicesData = this.invoices()?.data;
    if (!invoicesData || !Array.isArray(invoicesData)) return 0;
    return invoicesData.reduce((total, invoice) => {
      return total + (invoice.outstanding_amount || 0);
    }, 0);
  }

  copyToClipboard(text: string): void {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        // You could add a toast notification here
        console.log('Copied to clipboard:', text);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  }

  visitSubscription(subscription: any): void {
    let url = '';

    // Check if there's a custom subdomain
    if (subscription.custom_subdomain) {
      // Ensure the URL has a protocol
      if (subscription.custom_subdomain.startsWith('http://') || subscription.custom_subdomain.startsWith('https://')) {
        url = subscription.custom_subdomain;
      } else {
        url = `https://${subscription.custom_subdomain}`;
      }
    } else {
      // Fallback to a default URL or show a message
      console.warn('No domain/URL available for this subscription');
      alert('No domain/URL available for this subscription. Please contact support.');
      return;
    }

    // Open the URL in a new tab
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to open URL:', error);
      alert('Failed to open the subscription URL. Please try again.');
    }
  }
}
