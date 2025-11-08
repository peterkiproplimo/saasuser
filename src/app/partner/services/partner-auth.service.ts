import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Partner } from '../models/partner.model';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PartnerAuthService {
  private router = inject(Router);
  private readonly STORAGE_KEY = 'partners';
  private readonly CURRENT_PARTNER_KEY = 'current_partner';
  private readonly PARTNER_TOKEN_KEY = 'partner_token';

  constructor() {
    // Initialize storage if it doesn't exist
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  /**
   * Register a new partner
   */
  register(partnerData: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Observable<{ success: boolean; message: string }> {
    const partners = this.getAllPartners();
    
    // Check if email already exists
    if (partners.some(p => p.email === partnerData.email)) {
      return throwError(() => ({ error: { message: 'Email already registered' } }));
    }

    const newPartner: Partner = {
      ...partnerData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    partners.push(newPartner);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(partners));

    return of({ success: true, message: 'Registration successful' }).pipe(delay(500));
  }

  /**
   * Login partner
   */
  login(email: string, password: string): Observable<{ success: boolean; partner: Partner; token: string }> {
    const partners = this.getAllPartners();
    const partner = partners.find(p => p.email === email && p.password === password);

    if (!partner) {
      return throwError(() => ({ error: { message: 'Invalid email or password' } }));
    }

    const token = this.generateToken();
    localStorage.setItem(this.CURRENT_PARTNER_KEY, JSON.stringify(partner));
    localStorage.setItem(this.PARTNER_TOKEN_KEY, token);

    return of({ success: true, partner, token }).pipe(delay(500));
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
   * Logout partner
   */
  logout(): void {
    localStorage.removeItem(this.CURRENT_PARTNER_KEY);
    localStorage.removeItem(this.PARTNER_TOKEN_KEY);
    this.router.navigate(['/partner/login']);
  }

  /**
   * Get all partners (for internal use)
   */
  private getAllPartners(): Partner[] {
    const partnersStr = localStorage.getItem(this.STORAGE_KEY);
    return partnersStr ? JSON.parse(partnersStr) : [];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'partner_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate token
   */
  private generateToken(): string {
    return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

