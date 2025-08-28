import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { FormsModule } from '@angular/forms';
import {
  NgIf,
  NgFor,
  NgClass,
  DecimalPipe,
  CurrencyPipe,
} from '@angular/common';

import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';

import { SubscriptionService } from './subscription.service';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  templateUrl: './subscriptions.html',
  styleUrls: ['./subscriptions.scss'],
  imports: [
    NgIf,
    NgFor,
    NgClass,
    FormsModule,
    DecimalPipe,
    CommonModule,
    CurrencyPipe,
    DialogModule,
    PaginatorModule,
    InputTextModule,
    ButtonModule,
    BadgeModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionsComponent implements OnInit, OnDestroy {
  private subscription_service = inject(SubscriptionService);
  private router = inject(Router);

  list = this.subscription_service.subscription_resource.value;
  is_loading = this.subscription_service.subscription_resource.isLoading;
  is_error = this.subscription_service.subscription_resource.statusCode;

  showDialog = false;
  search_text = '';

  loading = false;
  error: string | null = null;

  form = {
    party: '',
    plan: '',
    qty: 1,
  };

  private routerSub: Subscription | undefined;

  // Pagination state
  page = 0;
  pageSize = 10;
  total = 0;

  ngOnInit(): void {
    this.fetchSubscriptions();

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.fetchSubscriptions();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  fetchSubscriptions(): void {
    this.subscription_service.page.set(this.page + 1); // API expects 1-based index
    this.subscription_service.pageSize.set(this.pageSize);

    // Pass search term
    this.subscription_service.searchTerm?.set(this.search_text); // <-- depends on your service setup

    this.subscription_service.refetch();
  }
  onSearch(): void {
    this.page = 0; // Reset to first page whenever searching
    this.fetchSubscriptions();
  }

  onPageChange(event: any): void {
    this.page = event.page;
    this.pageSize = event.rows;
    this.fetchSubscriptions();
  }

  totalRecords(): number {
    // Update this logic based on API pagination metadata
    return this.subscription_service.subscription_resource.value()?.total || 0;
  }

  createSubscription(): void {
    this.showDialog = false;
    this.subscription_service.refetch();
  }

  statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'unpaid':
        return 'warn';
      case 'cancelled':
        return 'danger';
      default:
        return 'info';
    }
  }
}
