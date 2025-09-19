import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginRequest } from '../models/requests/login-request';
import { Observable, tap, throwError } from 'rxjs';
import { LoginResponse } from '../models/responses/login-response';
import { RefreshTokenResponse } from '../models/responses/refresh-token-response';
import { RefreshTokenRequest } from '../models/requests/refresh-token-request';
import { Router } from '@angular/router';
import { RegisterRequest } from '../models/requests/register-request';
import { RegisterResponse } from '../models/responses/register-response';
import { ResetPasswordRequest } from '../models/requests/reset-password-request';
import { ResetPasswordResponse } from '../models/responses/reset-password-response';
import { ForgotPasswordRequest } from '../models/requests/forgot-password-request';
import { ForgotPasswordResponse } from '../models/responses/forgot-password-response';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  base_url = environment.BASE_URL
  http = inject(HttpClient);
  router = inject(Router);
  private tokenService = inject(TokenService);

  register(register_request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.base_url}.accounts.register`, register_request);
  }

  login(login_request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base_url}.accounts.login`, login_request).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token!);
        localStorage.setItem('refresh_token', response.refresh_token!);
        localStorage.setItem('user', JSON.stringify(response.user));
        // Start monitoring token expiration
        this.tokenService.startTokenMonitoring();
      })
    );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.sign_out();
      return throwError(() => new Error('No refresh token available'));
    }

    let refresh_token_request: RefreshTokenRequest = {
      refresh_token: refreshToken
    }

    return this.http.post<RefreshTokenResponse>(
      `${this.base_url}.accounts.refresh_access_token`,
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
    localStorage.removeItem('user');
    // Stop monitoring token expiration
    this.tokenService.stopTokenMonitoring();
    this.router.navigate(['/auth/login']);
  }

  loggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  reset_password(reset_password_request: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(
      `${this.base_url}.accounts.reset_password_with_token`,
      reset_password_request
    );

  }

  forgot_password(forgot_password_request: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.base_url}.accounts.forgot_password`, forgot_password_request)
  }

}
