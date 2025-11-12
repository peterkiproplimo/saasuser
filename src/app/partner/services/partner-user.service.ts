import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PartnerUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePartnerUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
}

export interface UpdatePartnerUserRequest {
  role?: string;
  enabled?: boolean;
  first_name?: string;
  last_name?: string;
  phone?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PartnerUserService {
  private http = inject(HttpClient);
  private readonly apiBase = environment.PARTNER_API_BASE;

  /**
   * Get all partner users
   */
  getUsers(): Observable<PartnerUser[]> {
    return this.http.get<{
      status: number;
      message: string;
      data: PartnerUser[];
    }>(`${this.apiBase}.get_partner_users`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<PartnerUser> {
    const params = new HttpParams().set('user_id', id);
    return this.http.get<{
      status: number;
      message: string;
      data: PartnerUser | PartnerUser[];
    }>(`${this.apiBase}.get_partner_user_by_id`, { params }).pipe(
      map(response => {
        if (Array.isArray(response.data)) {
          return response.data[0];
        }
        return response.data;
      })
    );
  }

  /**
   * Create new partner user
   */
  createUser(userData: CreatePartnerUserRequest): Observable<PartnerUser> {
    return this.http.post<{
      status: number;
      message: string;
      data: PartnerUser | PartnerUser[];
    }>(`${this.apiBase}.create_partner_user`, userData).pipe(
      map(response => {
        if (Array.isArray(response.data)) {
          return response.data[0];
        }
        return response.data;
      })
    );
  }

  /**
   * Update partner user
   */
  updateUser(id: string, userData: UpdatePartnerUserRequest): Observable<PartnerUser> {
    const params = new HttpParams().set('user_id', id);
    return this.http.put<{
      status: number;
      message: string;
      data: PartnerUser;
    }>(`${this.apiBase}.update_partner_user`, userData, { params }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete partner user
   */
  deleteUser(id: string): Observable<{ success: boolean }> {
    const params = new HttpParams().set('user_id', id);
    return this.http.delete<{
      status: number;
      message: string;
      success: boolean;
    }>(`${this.apiBase}.delete_partner_user`, { params }).pipe(
      map(response => ({ success: response.success || response.status === 200 }))
    );
  }
}

