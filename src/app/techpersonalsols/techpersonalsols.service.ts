import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SubscriptionResponse } from './techpersonalsols.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
    url = environment.BASE_URL;

  page = signal(1);
  pageSize = signal(20);

  http = inject(HttpClient);

    subscription_resource = httpResource<SubscriptionResponse>(
        () => `${this.url}.subscription.list_subscriptions?page=${this.page()}&page_size=${this.pageSize()}`,
        {defaultValue: { } }
    );


}
