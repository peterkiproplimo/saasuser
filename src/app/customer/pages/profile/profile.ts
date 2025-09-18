import { Component, OnInit, signal } from '@angular/core';
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

  user: User = JSON.parse(localStorage.getItem('user')!);

  // UI State
  isEditing = signal(false);
  isLoading = signal(false);
  showEditDialog = signal(false);

  // Mock data for demonstration
  accountStats = {
    totalSubscriptions: 3,
    activeSubscriptions: 2,
    totalInvoices: 15,
    paidInvoices: 12,
    accountAge: '2 years',
    lastActivity: '2 hours ago'
  };

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
    // Initialize any data needed
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

}