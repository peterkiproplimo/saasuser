import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {LoginRequest} from '../models/login-request';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {LoginResponse} from '../models/login-response';
import {RefreshTokenResponse} from '../models/refresh-token-response';
import {RefreshTokenRequest} from '../models/refresh-token-request';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  base_url = environment.BASE_URL
  http = inject(HttpClient);
  router = inject(Router);

  login(login_request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base_url}moe.apis.accounts.login`, login_request).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token!);
        localStorage.setItem('refresh_token', response.refresh_token!);
      })
    );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.sign_out();
      return throwError(() => new Error('No refresh token available'));
    }

    let refresh_token_request : RefreshTokenRequest = {
      refresh_token: refreshToken
    }

    return this.http.post<RefreshTokenResponse>(
      `${this.base_url}moe.apis.accounts.refresh_access_token`,
      refresh_token_request).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token!);
        localStorage.setItem('refresh_token', response.refresh_token!);
      })
    );
  }

  sign_out() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/auth/login']);
  }

}
