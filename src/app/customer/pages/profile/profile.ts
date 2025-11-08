import { Component, OnInit, signal, inject } from '@angular/core';
import { User } from '../../../auth/models/responses/login-response';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    CommonModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    DividerModule,
    BadgeModule,
    ProgressBarModule,
    DialogModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private http = inject(HttpClient);
  private destroy = inject(DestroyRef);
  private base_url = environment.BASE_URL;

  user: User = JSON.parse(localStorage.getItem('user')!);
  customerProfile: any = null;

  // UI State
  isEditing = signal(false);
  isLoading = signal(false);
  isLoadingProfile = signal(false);
  showEditDialog = signal(false);
  apiNotFound = signal(false);

  // Account stats (only populated from API)
  accountStats = signal<any>(null);

  // Form for editing profile
  profileForm: FormGroup;

  constructor(private fb: FormBuilder, private messageService: MessageService) {
    this.profileForm = this.fb.group({
      firstName: [this.user.first_name || '', [Validators.required, Validators.minLength(2)]],
      lastName: [this.user.last_name || '', [Validators.required, Validators.minLength(2)]],
      email: [this.user.email || '', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]],
      company: [''],
      bio: ['']
    });
  }

  ngOnInit() {
    // Fetch customer profile from API
    this.fetchCustomerProfile();
  }

  /* ------------------------- API calls -------------------------- */
  fetchCustomerProfile(): void {
    this.isLoadingProfile.set(true);

    this.http
      .get(`${this.base_url}.api.profile.get_customer_profile`)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response: any) => {
          this.customerProfile = response?.data || response;
          this.apiNotFound.set(false);

          // Update user data if available
          if (this.customerProfile) {
            if (this.customerProfile.first_name) {
              this.user.first_name = this.customerProfile.first_name;
            }
            if (this.customerProfile.last_name) {
              this.user.last_name = this.customerProfile.last_name;
            }
            if (this.customerProfile.email) {
              this.user.email = this.customerProfile.email;
            }
            if (this.customerProfile.name) {
              this.user.name = this.customerProfile.name;
            }

            // Update form with fetched data
            this.profileForm.patchValue({
              firstName: this.customerProfile.first_name || this.user.first_name || '',
              lastName: this.customerProfile.last_name || this.user.last_name || '',
              email: this.customerProfile.email || this.user.email || '',
              phone: this.customerProfile.phone || '',
              company: this.customerProfile.company || '',
              bio: this.customerProfile.bio || ''
            });

            // Update account stats only if available from API
            if (this.customerProfile.account_stats) {
              this.accountStats.set(this.customerProfile.account_stats);
            }
          }

          this.isLoadingProfile.set(false);
        },
        error: (error) => {
          this.isLoadingProfile.set(false);
          this.handleApiError(error, 'Failed to load customer profile');
        },
      });
  }

  /* ------------------------- error handling -------------------------- */
  private handleApiError(error: any, defaultMessage: string): void {
    let errorMessage = defaultMessage;
    let errorCode = error?.status || 'Unknown';

    // Check if it's a ValidationError (API not implemented)
    if (error?.error?.exception?.includes('ValidationError') ||
      error?.error?.exception?.includes('No module named')) {
      errorCode = 417;
      this.apiNotFound.set(true);
      this.accountStats.set(null);
      // Show toast notification
      this.messageService.add({
        severity: 'error',
        summary: `Error ${errorCode}`,
        detail: 'Error 417: API not found. Check on frappe logs.',
        life: 7000
      });
      return;
    } else if (error?.status === 417) {
      errorCode = 417;
      this.apiNotFound.set(true);
      this.accountStats.set(null);
      errorMessage = 'Error 417: API not found.';
    } else if (error?.error?.message) {
      errorMessage = `Error ${errorCode}: ${error.error.message}`;
    } else if (error?.error?.exc) {
      // Try to extract a meaningful error message
      const excMatch = error.error.exc.match(/ValidationError: (.+?)\\n/);
      if (excMatch) {
        errorMessage = `Error ${errorCode}: ${excMatch[1]}`;
      } else {
        errorMessage = `Error ${errorCode}: ${defaultMessage}`;
      }
    } else {
      errorMessage = `Error ${errorCode}: ${defaultMessage}`;
    }

    this.messageService.add({
      severity: 'error',
      summary: `Error ${errorCode}`,
      detail: errorMessage,
      life: 7000
    });
  }

  // Profile actions
  editProfile() {
    this.showEditDialog.set(true);
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.isLoading.set(true);
      // Simulate API call
      setTimeout(() => {
        this.isLoading.set(false);
        this.showEditDialog.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Profile updated successfully!'
        });
      }, 1500);
    }
  }

  cancelEdit() {
    this.showEditDialog.set(false);
    this.profileForm.reset({
      firstName: this.user.first_name || '',
      lastName: this.user.last_name || '',
      email: this.user.email || '',
      phone: '',
      company: '',
      bio: ''
    });
  }

  changePassword() {
    this.messageService.add({
      severity: 'info',
      summary: 'Feature Coming Soon',
      detail: 'Password change functionality will be available soon!'
    });
  }

  updateNotificationSettings() {
    this.messageService.add({
      severity: 'info',
      summary: 'Feature Coming Soon',
      detail: 'Notification settings will be available soon!'
    });
  }

  exportData() {
    this.messageService.add({
      severity: 'info',
      summary: 'Feature Coming Soon',
      detail: 'Data export functionality will be available soon!'
    });
  }

  // Helper methods
  getInitials(): string {
    const first = this.user.first_name?.charAt(0) || '';
    const last = this.user.last_name?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  getAccountCompletion(): number {
    let completed = 0;
    const total = 6;

    if (this.user.first_name) completed++;
    if (this.user.last_name) completed++;
    if (this.user.email) completed++;
    if (this.profileForm.get('phone')?.value) completed++;
    if (this.profileForm.get('company')?.value) completed++;
    if (this.profileForm.get('bio')?.value) completed++;

    return Math.round((completed / total) * 100);
  }

  // Getter for account stats (for template)
  get accountStatsData() {
    return this.accountStats();
  }

  // Check if API data is available
  hasAccountStats(): boolean {
    return this.accountStats() !== null && !this.apiNotFound();
  }

}