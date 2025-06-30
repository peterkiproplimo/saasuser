import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

import { Subscription, SubscriptionResponse } from './subscription.model';
import { SubscriptionService } from './subscription.service';

// PrimeNG modules
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

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
    ButtonModule
  ]
})
export class SubscriptionsComponent implements OnInit {
  list: Subscription[] = [];
  loading = false;
  error = '';

  showDialog = false;
  form = {
    party: '',
    plan: '',
    qty: 1
  };

  constructor(private svc: SubscriptionService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';
    this.svc.getAll(1)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: SubscriptionResponse) => (this.list = res.data),
        error: () => (this.error = 'Could not load subscriptions')
      });
  }

  statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'Active': return 'success';
      case 'Unpaid': return 'warn';
      case 'Cancelled': return 'danger';
      default: return 'info';
    }
  }

  createSubscription(): void {
    // Replace with actual API logic
    console.log('Creating subscription with:', this.form);
    this.showDialog = false;
  }
}
