import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PartnerUserService, PartnerUser } from '../../services/partner-user.service';
import { Functions } from '../../../shared/functions/functions';

@Component({
  selector: 'app-partner-users',
  imports: [
    CommonModule,
    FormsModule,
    ProgressSpinner,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './partner-users.component.html',
  styleUrl: './partner-users.component.scss'
})
export class PartnerUsersComponent implements OnInit {
  private userService = inject(PartnerUserService);
  router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private functions = new Functions();

  users = signal<PartnerUser[]>([]);
  loading = signal(true);
  searchQuery = signal('');

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.users();
    }
    return this.users().filter(user =>
      user.email.toLowerCase().includes(query) ||
      user.first_name.toLowerCase().includes(query) ||
      user.last_name.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      (user.phone && user.phone.toLowerCase().includes(query))
    );
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.functions.show_toast('Error', 'error', 'Failed to load users.');
        this.loading.set(false);
      }
    });
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
  }

  editUser(user: PartnerUser) {
    this.router.navigate(['/partner/users/edit', user.id]);
  }

  deleteUser(user: PartnerUser) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${user.first_name} ${user.last_name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.functions.show_toast('Success', 'success', 'User deleted successfully.');
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.functions.show_toast('Error', 'error', 'Failed to delete user.');
          }
        });
      }
    });
  }

  getStatusSeverity(enabled: boolean): string {
    return enabled ? 'success' : 'danger';
  }

  navigateToCreate() {
    this.router.navigate(['/partner/users/create']);
  }
}

