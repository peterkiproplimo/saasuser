import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { PartnerRoleService, CreateRoleRequest, UpdateRoleRequest, RolePermission } from '../../services/partner-role.service';
import { PartnerPermissionService } from '../../services/partner-permission.service';
import { Permission } from '../../services/partner-role.service';
import { Functions } from '../../../shared/functions/functions';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-role-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProgressSpinner,
    CardModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.scss'
})
export class RoleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private roleService = inject(PartnerRoleService);
  private permissionService = inject(PartnerPermissionService);
  private functions = new Functions();

  roleForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  roleId = signal<string | null>(null);
  allPermissions = signal<Permission[]>([]);
  formInitialized = false;

  get permissionsFormArray(): FormArray {
    return this.roleForm.get('permissions') as FormArray;
  }


  initForm() {
    this.roleForm = this.fb.group({
      role_name: ['', [Validators.required]],
      description: [''],
      is_default: [false],
      permissions: this.fb.array([])
    });
    this.formInitialized = true;
  }

  loadPermissions() {
    this.permissionService.getPermissions().subscribe({
      next: (permissions) => {
        this.allPermissions.set(permissions);
        // Build permissions form array after permissions are loaded
        if (this.formInitialized) {
          this.buildPermissionsFormArray();
        }
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.functions.show_toast('Error', 'error', 'Failed to load permissions.');
      }
    });
  }

  ngOnInit() {
    this.initForm();
    this.loadPermissions();
    
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode.set(true);
        this.roleId.set(id);
        this.loadRole(id);
      } else {
        // For create mode, build permissions array after form is initialized
        setTimeout(() => {
          if (this.allPermissions().length > 0) {
            this.buildPermissionsFormArray();
          }
        }, 100);
      }
    });
  }

  buildPermissionsFormArray() {
    const permissionsArray = this.permissionsFormArray;
    permissionsArray.clear();
    
    // Wait for permissions to be loaded
    if (this.allPermissions().length === 0) {
      return;
    }
    
    this.allPermissions().forEach(permission => {
      permissionsArray.push(this.fb.group({
        permission_key: [permission.permission_key],
        allowed: [false]
      }));
    });
  }

  loadRole(id: string) {
    this.loading.set(true);
    // Wait for permissions to load before loading role
    if (this.allPermissions().length === 0) {
      const checkPermissions = setInterval(() => {
        if (this.allPermissions().length > 0) {
          clearInterval(checkPermissions);
          this.buildPermissionsFormArray();
          this.loadRoleData(id);
        }
      }, 100);
      setTimeout(() => clearInterval(checkPermissions), 5000); // Timeout after 5 seconds
    } else {
      this.buildPermissionsFormArray();
      this.loadRoleData(id);
    }
  }

  private loadRoleData(id: string) {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        const role = roles.find(r => r.id === id);
        if (role) {
          this.roleForm.patchValue({
            role_name: role.role_name,
            description: role.description || '',
            is_default: role.is_default
          });

          // Update permissions
          if (role.permissions && this.permissionsFormArray.length > 0) {
            this.permissionsFormArray.controls.forEach((control) => {
              const permKey = control.get('permission_key')?.value;
              const perm = role.permissions?.find(p => p.permission_key === permKey);
              if (perm && perm.allowed) {
                control.patchValue({ allowed: true });
              }
            });
          }
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading role:', error);
        this.functions.show_toast('Error', 'error', 'Failed to load role.');
        this.loading.set(false);
        this.router.navigate(['/partner/roles']);
      }
    });
  }

  onSubmit() {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      this.functions.show_toast('Validation Error', 'error', 'Please fill all required fields.');
      return;
    }

    this.loading.set(true);
    const formValue = this.roleForm.value;

    const permissions: RolePermission[] = formValue.permissions
      .filter((p: any) => p.allowed)
      .map((p: any) => ({
        permission_key: p.permission_key,
        allowed: true
      }));

    if (this.isEditMode() && this.roleId()) {
      const updateData: UpdateRoleRequest = {
        role_name: formValue.role_name,
        description: formValue.description || undefined,
        permissions: permissions
      };

      this.roleService.updateRole(this.roleId()!, updateData).subscribe({
        next: () => {
          this.loading.set(false);
          this.functions.show_toast('Success', 'success', 'Role updated successfully.');
          this.router.navigate(['/partner/roles']);
        },
        error: (error) => {
          this.loading.set(false);
          console.error('Update error:', error);
          this.functions.show_toast('Error', 'error', error?.error?.message || 'Failed to update role.');
        }
      });
    } else {
      const createData: CreateRoleRequest = {
        role_name: formValue.role_name,
        description: formValue.description || undefined,
        is_default: formValue.is_default || false,
        permissions: permissions
      };

      this.roleService.createRole(createData).subscribe({
        next: () => {
          this.loading.set(false);
          this.functions.show_toast('Success', 'success', 'Role created successfully.');
          this.router.navigate(['/partner/roles']);
        },
        error: (error) => {
          this.loading.set(false);
          console.error('Create error:', error);
          this.functions.show_toast('Error', 'error', error?.error?.message || 'Failed to create role.');
        }
      });
    }
  }

  getPermissionCategory(permissionKey: string): string {
    const parts = permissionKey.split('.');
    return parts[0] || 'Other';
  }

  getPermissionsByCategory(): { category: string; permissions: Permission[] }[] {
    const categories = new Map<string, Permission[]>();
    
    this.allPermissions().forEach(permission => {
      const category = permission.category || this.getPermissionCategory(permission.permission_key);
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(permission);
    });

    return Array.from(categories.entries()).map(([category, permissions]) => ({
      category,
      permissions
    }));
  }

  getPermissionControl(index: number): FormControl {
    return this.permissionsFormArray.at(index).get('allowed') as FormControl;
  }

  getPermissionControlForKey(permissionKey: string): FormControl | null {
    if (!this.roleForm || this.permissionsFormArray.length === 0) {
      return null;
    }
    const control = this.permissionsFormArray.controls.find(
      c => c.get('permission_key')?.value === permissionKey
    );
    return control ? (control.get('allowed') as FormControl) : null;
  }

  findPermissionIndex(permissionKey: string): number {
    return this.allPermissions().findIndex(p => p.permission_key === permissionKey);
  }
}

