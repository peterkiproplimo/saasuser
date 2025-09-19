import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RefreshTokenResponse } from '../models/responses/refresh-token-response';
import { RefreshTokenRequest } from '../models/requests/refresh-token-request';

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private tokenExpirationSubject = new BehaviorSubject<boolean>(false);
    public tokenExpired$ = this.tokenExpirationSubject.asObservable();

  private http = inject(HttpClient);
  private router = inject(Router);
  private base_url = environment.BASE_URL;

  constructor() {
    // Don't initialize in constructor to avoid circular dependencies
  }

    /**
     * Start monitoring token expiration
     */
    private startTokenExpirationTimer(): void {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) return;

        try {
            // Decode JWT token to get expiration time
            const tokenPayload = this.decodeJWT(accessToken);
            if (tokenPayload && tokenPayload.exp) {
                const expirationTime = tokenPayload.exp * 1000; // Convert to milliseconds
                const currentTime = Date.now();
                const timeUntilExpiry = expirationTime - currentTime;

                if (timeUntilExpiry > 0) {
                    // Set timer to refresh token 5 minutes before expiration
                    const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 0);

                    timer(refreshTime).subscribe(() => {
                        this.refreshTokenBeforeExpiry();
                    });

                    // Set timer to logout when token actually expires
                    timer(timeUntilExpiry).subscribe(() => {
                        this.handleTokenExpiration();
                    });
                } else {
                    // Token is already expired
                    this.handleTokenExpiration();
                }
            }
        } catch (error) {
            console.error('Error parsing token:', error);
            this.handleTokenExpiration();
        }
    }

    /**
     * Decode JWT token payload
     */
    private decodeJWT(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    }

  /**
   * Refresh token before it expires
   */
  private refreshTokenBeforeExpiry(): void {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.handleTokenExpiration();
      return;
    }

    const refresh_token_request: RefreshTokenRequest = {
      refresh_token: refreshToken
    };

    this.http.post<RefreshTokenResponse>(
      `${this.base_url}.accounts.refresh_access_token`,
      refresh_token_request
    ).subscribe({
      next: (response) => {
        console.log('Token refreshed successfully');
        localStorage.setItem('access_token', response.access_token!);
        localStorage.setItem('refresh_token', response.refresh_token!);
        // Restart the timer with the new token
        this.startTokenExpirationTimer();
      },
      error: (error) => {
        console.error('Token refresh failed:', error);
        this.handleTokenExpiration();
      }
    });
  }

  /**
   * Handle token expiration
   */
  private handleTokenExpiration(): void {
    console.log('Token expired, logging out user');
    this.tokenExpirationSubject.next(true);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }

    /**
     * Check if token is expired
     */
    public isTokenExpired(): boolean {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) return true;

        try {
            const tokenPayload = this.decodeJWT(accessToken);
            if (tokenPayload && tokenPayload.exp) {
                const expirationTime = tokenPayload.exp * 1000;
                return Date.now() >= expirationTime;
            }
        } catch (error) {
            console.error('Error checking token expiration:', error);
        }
        return true;
    }

    /**
     * Check if refresh token is expired
     */
    public isRefreshTokenExpired(): boolean {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) return true;

        try {
            const tokenPayload = this.decodeJWT(refreshToken);
            if (tokenPayload && tokenPayload.exp) {
                const expirationTime = tokenPayload.exp * 1000;
                return Date.now() >= expirationTime;
            }
        } catch (error) {
            console.error('Error checking refresh token expiration:', error);
        }
        return true;
    }

    /**
     * Start monitoring when user logs in
     */
    public startTokenMonitoring(): void {
        this.startTokenExpirationTimer();
    }

    /**
     * Stop monitoring when user logs out
     */
    public stopTokenMonitoring(): void {
        // Timer will automatically complete, no need to manually stop
    }
}
