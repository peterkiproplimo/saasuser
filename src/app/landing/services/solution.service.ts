import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';

export interface SaaSSolution {
  name: string;
  app_name: string;
  app_code: string;
  app_logo: string;
  short_description: string;
  features: string[];
}

@Injectable({
  providedIn: 'root',
})
export class SolutionService {
  private apiUrl = `${environment.BASE_URL}.subscription.list_saas_application?page=1&page_size=10`;

  constructor(private http: HttpClient) {}

  getSolutions(): Observable<SaaSSolution[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((res) => res.data) // transform the API response to extract `data`
    );
  }
}
