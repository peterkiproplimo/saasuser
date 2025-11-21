import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Partner } from '../models/partner.model';
import { Observable, map, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PartnerAuthService {
  private router = inject(Router);
  private readonly CURRENT_PARTNER_KEY = 'current_partner';
  private readonly PARTNER_TOKEN_KEY = 'partner_token';
  private http = inject(HttpClient);
  private readonly apiBase = environment.PARTNER_API_BASE;

  constructor() {}

  /**
   * Register a new partner
   */
  register(partnerData: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiBase}.partner_signup`, partnerData);
  }

  /**
   * Login partner
   */
  login(email: string, password: string): Observable<any> {
    const loginUrl = `${this.apiBase}.partner_login`;
    const requestBody = { email, password };
    
    console.log('Login request URL:', loginUrl);
    console.log('Login request body:', { email, password: '***' });
    console.log('Login - Full request body (for debugging):', JSON.stringify(requestBody));
    
    // Explicitly set headers to ensure Content-Type is application/json
    return this.http.post<any>(
      loginUrl, 
      requestBody, 
      { 
        observe: 'response',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).pipe(
      tap((httpResponse) => {
        console.log('Login - HTTP Status:', httpResponse.status);
        console.log('Login - Response body:', JSON.stringify(httpResponse.body, null, 2));
        
        // Check response body structure
        // Actual API response: { status: 200, message: "Login successful", data: { partner: {...}, access_token: "...", refresh_token: "...", role: "Admin", is_owner: true } }
        const body = httpResponse.body;
        
        if (!body) {
          console.error('Login - Response body is null or undefined');
          return;
        }
        
        // Extract partner - API returns it as body.data.partner (inside data object)
        let partner = body.data?.partner || body.partner || null;
        
        // Extract token - API returns it as body.data.access_token (inside data object, not at root!)
        // Also check for refresh_token if needed
        const token = body.data?.access_token || body.data?.token || body.token || null;
        
        console.log('Login - Extracted partner:', partner);
        console.log('Login - Partner keys:', partner ? Object.keys(partner) : []);
        console.log('Login - Extracted token:', token ? `Token present (${token.substring(0, 20)}...)` : 'Token missing');
        
        if (partner && token) {
          try {
            // Normalize partner object - ensure it has an 'id' field
            // Some APIs might return 'partner_id', 'user_id', or other variations
            if (!partner.id) {
              // Try to find alternative ID field names
              const alternativeIdFields = ['partner_id', 'user_id', '_id', 'uuid'];
              for (const field of alternativeIdFields) {
                if (partner[field]) {
                  partner = { ...partner, id: partner[field] };
                  console.log(`Login - Found ID in field '${field}': ${partner.id}`);
                  break;
                }
              }
            }
            
            // If still no ID, log warning but continue (some APIs might not require it)
            if (!partner.id) {
              console.warn('Login - Partner object missing id field, but continuing anyway:', partner);
              // Generate a temporary ID if needed
              partner = { ...partner, id: partner.email || `temp_${Date.now()}` };
            }
            
            localStorage.setItem(this.CURRENT_PARTNER_KEY, JSON.stringify(partner));
            localStorage.setItem(this.PARTNER_TOKEN_KEY, token);
            console.log('Login - Session saved successfully to localStorage');
            console.log('Login - isLoggedIn check:', this.isLoggedIn());
            console.log('Login - Saved partner:', this.getCurrentPartner());
          } catch (error) {
            console.error('Login - Error saving session to localStorage:', error);
            // Don't throw here - let error handler deal with it
          }
        } else {
          console.error('Login - Missing partner or token:', {
            hasPartner: !!partner,
            hasToken: !!token,
            partnerKeys: partner ? Object.keys(partner) : [],
            responseBodyKeys: body ? Object.keys(body) : [],
            fullResponse: JSON.stringify(body, null, 2)
          });
        }
      }),
      map((httpResponse) => {
        const body = httpResponse.body;
        // Return the response body, but ensure it has the expected structure
        if (httpResponse.status >= 200 && httpResponse.status < 300) {
          return body;
        } else {
          throw new Error(body?.message || body?.error?.message || 'Login failed');
        }
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
   * Get partner profile from API (refresh from server)
   */
  getProfile(): Observable<{ partner: Partner }> {
    return this.http.get<{ partner: Partner }>(`${this.apiBase}.partner_me`).pipe(
      tap(res => {
        if (res.partner) {
          localStorage.setItem(this.CURRENT_PARTNER_KEY, JSON.stringify(res.partner));
        }
      })
    );
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
    return this.http.post<{ exists: boolean }>(`${this.apiBase}.check_email`, { email }).pipe(
      map(res => res.exists)
    );
  }

  /**
   * Request password reset
   */
  forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiBase}.forgot_password`, { email });
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiBase}.reset_password`, { token, newPassword });
  }

  /**
   * Logout partner
   */
  logout(): void {
    const token = localStorage.getItem(this.PARTNER_TOKEN_KEY);
    if (token) {
      this.http.post(`${this.apiBase}.partner_logout`, {}).subscribe({
        next: () => {
          this.clearLocalStorage();
        },
        error: () => {
          // Fallback local cleanup even if API call fails
          this.clearLocalStorage();
        }
      });
    } else {
      this.clearLocalStorage();
    }
  }

  private clearLocalStorage(): void {
    localStorage.removeItem(this.CURRENT_PARTNER_KEY);
    localStorage.removeItem(this.PARTNER_TOKEN_KEY);
    this.router.navigate(['/partner/login']);
  }
}



