import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { WelcomeResponse } from '../models/navbar.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SolutionService {
  url = environment.BASE_URL;

  page = signal(1);
  pageSize = signal(20);

  http = inject(HttpClient);

  // Resource list loader (already present)
  subscription_resource = httpResource<WelcomeResponse>(
    () => `${this.url}.subscription.list_saas_application`,
    { defaultValue: {} }
  );

  // ✅ Add this:
  getSolutionById(id: string): Observable<any> {
    const fullUrl = `${this.url}.subscription.get_saas_application/${id}`;
    return this.http.get<any>(fullUrl);
  }
}
