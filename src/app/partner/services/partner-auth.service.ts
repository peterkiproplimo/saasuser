import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Partner } from '../models/partner.model';
import { Observable, map, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PartnerAuthService {
  private router = inject(Router);
  private readonly CURRENT_PARTNER_KEY = 'current_partner';
  private readonly PARTNER_TOKEN_KEY = 'partner_token';
  private http = inject(HttpClient);

  constructor() {}

  /**
   * Register a new partner
   */
  register(partnerData: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>('/api/partner/signup', partnerData);
  }

  /**
   * Login partner
   */
  login(email: string, password: string): Observable<{ success: boolean; partner: Partner; token: string }> {
    return this.http.post<{ success: boolean; partner: Partner; token: string }>('/api/partner/login', { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.CURRENT_PARTNER_KEY, JSON.stringify(res.partner));
        localStorage.setItem(this.PARTNER_TOKEN_KEY, res.token);
      })
    );
  }

  /**
   * Get current logged in partner
   */
  getCurrentPartner(): Partner | null {
    const partnerStr = localStorage.getItem(this.CURRENT_PARTNER_KEY);
    return partnerStr ? JSON.parse(partnerStr) : null;
  }

  /**
   * Check if partner is logged in
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.PARTNER_TOKEN_KEY);
  }

  /**
   * Check if email already exists
   */
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.post<{ exists: boolean }>('/api/partner/check-email', { email }).pipe(
      map(res => res.exists)
    );
  }

  /**
   * Request password reset
   */
  forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>('/api/partner/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>('/api/partner/reset-password', { token, newPassword });
  }

  /**
   * Logout partner
   */
  logout(): void {
    this.http.post('/api/partner/logout', {}).subscribe({
      next: () => {
        localStorage.removeItem(this.CURRENT_PARTNER_KEY);
        localStorage.removeItem(this.PARTNER_TOKEN_KEY);
        this.router.navigate(['/partner/login']);
      },
      error: () => {
        // Fallback local cleanup even if mock call fails
        localStorage.removeItem(this.CURRENT_PARTNER_KEY);
        localStorage.removeItem(this.PARTNER_TOKEN_KEY);
        this.router.navigate(['/partner/login']);
      }
    });
  }
}



