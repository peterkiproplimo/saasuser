import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaasService {
  private apiUrl = `${environment.BASE_URL}.subscription.list_saas_application`;

  constructor(private http: HttpClient) {}

  getSaasApplications(
    page: number = 1,
    pageSize: number = 20
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}?page=${page}&page_size=${pageSize}`
    );
  }
}
