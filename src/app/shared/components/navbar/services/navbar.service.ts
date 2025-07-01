import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { WelcomeResponse } from '../models/navbar.model';

@Injectable({ providedIn: 'root' })
export class SolutionService {
    url = environment.BASE_URL;

  page = signal(1);
  pageSize = signal(20);

  http = inject(HttpClient);

    subscription_resource = httpResource<WelcomeResponse>(
        () => `${this.url}.subscription.list_saas_application`,
        {defaultValue: { } }
    );


}
