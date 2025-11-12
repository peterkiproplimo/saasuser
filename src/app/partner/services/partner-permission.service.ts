import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Permission } from './partner-role.service';

export interface CreatePermissionRequest {
  permission_name: string;
  permission_key: string;
  description?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PartnerPermissionService {
  private http = inject(HttpClient);
  private readonly apiBase = environment.PARTNER_API_BASE;

  /**
   * Get all permissions
   */
  getPermissions(): Observable<Permission[]> {
    return this.http.get<{
      status: number;
      message: string;
      data: Permission[];
    }>(`${this.apiBase}.get_partner_permissions`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Create new permission
   */
  createPermission(permissionData: CreatePermissionRequest): Observable<Permission> {
    return this.http.post<{
      status: number;
      message: string;
      data: Permission | Permission[];
    }>(`${this.apiBase}.create_partner_permission`, permissionData).pipe(
      map(response => {
        if (Array.isArray(response.data)) {
          return response.data[0];
        }
        return response.data;
      })
    );
  }
}

