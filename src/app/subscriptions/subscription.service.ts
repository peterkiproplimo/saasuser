import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SubscriptionResponse } from './subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  url = environment.BASE_URL;

  page = signal(1);
  pageSize = signal(20);
  searchTerm = signal('');

  // Cache busting parameter to force fresh requests
  refresh_timestamp = signal(Date.now());

  http = inject(HttpClient);

  subscription_resource = httpResource<SubscriptionResponse>(
    () => {
      const searchParam = this.searchTerm() ? `&search=${encodeURIComponent(this.searchTerm())}` : '';
      return {
        method: 'GET',
        url: `${this.url
          }.subscription.list_subscriptions?page=${this.page()}&page_size=${this.pageSize()}&_t=${this.refresh_timestamp()}${searchParam}`,
      };
    },
    {
      defaultValue: {
        status: 200,
        message: 'No data',
        data: [],
        pagination: {
          page: 1,
          page_size: 10,
          total_pages: 0,
          total_records: 0
        },
        filters: {
          search: null,
          start_date: null,
          end_date: null
        }
      },
    }
  );

  refetch() {
    this.page.set(this.page()); // Force httpResource to rerun
  }

  // Method to refresh subscriptions data
  refreshSubscriptions() {
    this.refresh_timestamp.set(Date.now()); // Update timestamp to force fresh request
  }
}
