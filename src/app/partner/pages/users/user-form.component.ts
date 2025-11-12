import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { PartnerUserService, CreatePartnerUserRequest, UpdatePartnerUserRequest } from '../../services/partner-user.service';
import { PartnerRoleService } from '../../services/partner-role.service';
import { Functions } from '../../../shared/functions/functions';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProgressSpinner,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(PartnerUserService);
  private roleService = inject(PartnerRoleService);
  private functions = new Functions();

  userForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  userId = signal<string | null>(null);
  roles = signal<string[]>([]);
  formInitialized = false;

  ngOnInit() {
    this.loadRoles();
    this.initForm();
    
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode.set(true);
        this.userId.set(id);
        this.loadUser(id);
      }
    });
  }

  initForm() {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode() ? [] : [Validators.required, Validators.minLength(6)]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      role: ['', [Validators.required]],
      phone: [''],
      enabled: [true]
    });
    this.formInitialized = true;
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles.map(r => r.role_name));
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  loadUser(id: string) {
    this.loading.set(true);
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        if (user) {
          this.userForm.patchValue({
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            phone: user.phone || '',
            enabled: user.enabled
          });
          // Remove password requirement in edit mode if not provided
          this.userForm.get('password')?.clearValidators();
          this.userForm.get('password')?.updateValueAndValidity();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.functions.show_toast('Error', 'error', 'Failed to load user.');
        this.loading.set(false);
        this.router.navigate(['/partner/users']);
      }
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.functions.show_toast('Validation Error', 'error', 'Please fill all required fields.');
      return;
    }

    this.loading.set(true);
    const formValue = this.userForm.value;

    if (this.isEditMode() && this.userId()) {
      const updateData: UpdatePartnerUserRequest = {
        first_name: formValue.first_name,
        last_name: formValue.last_name,
        role: formValue.role,
        phone: formValue.phone || undefined,
        enabled: formValue.enabled
      };
      if (formValue.password) {
        updateData.password = formValue.password;
      }

      this.userService.updateUser(this.userId()!, updateData).subscribe({
        next: () => {
          this.loading.set(false);
          this.functions.show_toast('Success', 'success', 'User updated successfully.');
          this.router.navigate(['/partner/users']);
        },
        error: (error) => {
          this.loading.set(false);
          console.error('Update error:', error);
          this.functions.show_toast('Error', 'error', error?.error?.message || 'Failed to update user.');
        }
      });
    } else {
      const createData: CreatePartnerUserRequest = {
        email: formValue.email,
        password: formValue.password,
        first_name: formValue.first_name,
        last_name: formValue.last_name,
        role: formValue.role,
        phone: formValue.phone || undefined
      };

      this.userService.createUser(createData).subscribe({
        next: () => {
          this.loading.set(false);
          this.functions.show_toast('Success', 'success', 'User created successfully.');
          this.router.navigate(['/partner/users']);
        },
        error: (error) => {
          this.loading.set(false);
          console.error('Create error:', error);
          this.functions.show_toast('Error', 'error', error?.error?.message || 'Failed to create user.');
        }
      });
    }
  }
}

