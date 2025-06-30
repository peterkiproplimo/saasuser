import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SubscriptionResponse } from './subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly url = `${environment.BASE_URL}/subscriptions`;

  constructor(private http: HttpClient) {}

  /**
   * GET /subscriptions?page=1&page_size=20
   */
  getAll(page = 1, pageSize = 20): Observable<SubscriptionResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('page_size', pageSize);
    return this.http.get<SubscriptionResponse>(this.url, { params });
  }
}
