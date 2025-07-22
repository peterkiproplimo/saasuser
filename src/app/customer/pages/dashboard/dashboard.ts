import {Component, inject} from '@angular/core';
import {InvoicesService} from '../invoices/services/invoices';
import {ProgressSpinner} from 'primeng/progressspinner';
import {CurrencyPipe, DatePipe, DecimalPipe} from '@angular/common';
import {SubscriptionService} from '../../../subscriptions/subscription.service';
import {EmptyStateComponent} from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    ProgressSpinner,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    EmptyStateComponent
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

}
