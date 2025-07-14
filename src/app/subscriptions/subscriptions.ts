import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from './subscription.service';

// PrimeNG modules
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.html',
  styleUrls: ['./subscriptions.scss'],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    BadgeModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    RouterLink,
  ],
})
export class SubscriptionsComponent {
  loading = false;
  error = '';

  showDialog = false;
  form = {
    party: '',
    plan: '',
    qty: 1,
  };

  subscription_service = inject(SubscriptionService);

  list = this.subscription_service.subscription_resource.value;
  is_loading = this.subscription_service.subscription_resource.isLoading;
  is_error = this.subscription_service.subscription_resource.statusCode;

  statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Unpaid':
        return 'warn';
      case 'Cancelled':
        return 'danger';
      default:
        return 'info';
    }
  }

  createSubscription(): void {
    this.showDialog = false;
  }
}
