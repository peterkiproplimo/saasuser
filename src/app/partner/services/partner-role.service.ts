import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Permission {
  id?: string;
  permission_name: string;
  permission_key: string;
  description?: string;
  category?: string;
  allowed?: boolean;
}

export interface RolePermission {
  permission_key: string;
  allowed: boolean;
}

export interface PartnerRole {
  id: string;
  role_name: string;
  description?: string;
  is_default: boolean;
  permissions?: RolePermission[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoleRequest {
  role_name: string;
  description?: string;
  is_default?: boolean;
  permissions?: RolePermission[];
}

export interface UpdateRoleRequest {
  role_name?: string;
  description?: string;
  permissions?: RolePermission[];
}

@Injectable({
  providedIn: 'root'
})
export class PartnerRoleService {
  private http = inject(HttpClient);
  private readonly apiBase = environment.PARTNER_API_BASE;

  /**
   * Setup default roles and permissions
   */
  setupDefaultRolesAndPermissions(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{
      status: number;
      message: string;
      success?: boolean;
    }>(`${this.apiBase}.setup_default_roles_permissions`, {}).pipe(
      map(response => ({
        success: response.success || response.status === 200,
        message: response.message
      }))
    );
  }

  /**
   * Get all roles
   */
  getRoles(): Observable<PartnerRole[]> {
    return this.http.get<{
      status: number;
      message: string;
      data: PartnerRole[];
    }>(`${this.apiBase}.get_partner_roles`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Create new role
   */
  createRole(roleData: CreateRoleRequest): Observable<PartnerRole> {
    return this.http.post<{
      status: number;
      message: string;
      data: PartnerRole | PartnerRole[];
    }>(`${this.apiBase}.create_partner_role`, roleData).pipe(
      map(response => {
        if (Array.isArray(response.data)) {
          return response.data[0];
        }
        return response.data;
      })
    );
  }

  /**
   * Update role
   */
  updateRole(id: string, roleData: UpdateRoleRequest): Observable<PartnerRole> {
    const params = new HttpParams().set('role_id', id);
    return this.http.put<{
      status: number;
      message: string;
      data: PartnerRole;
    }>(`${this.apiBase}.update_partner_role`, roleData, { params }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete role
   */
  deleteRole(id: string): Observable<{ success: boolean }> {
    const params = new HttpParams().set('role_id', id);
    return this.http.delete<{
      status: number;
      message: string;
      success: boolean;
    }>(`${this.apiBase}.delete_partner_role`, { params }).pipe(
      map(response => ({ success: response.success || response.status === 200 }))
    );
  }
}

