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
import { PartnerRoleService, PartnerRole } from '../../services/partner-role.service';
import { Functions } from '../../../shared/functions/functions';

@Component({
  selector: 'app-partner-roles',
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
  templateUrl: './partner-roles.component.html',
  styleUrl: './partner-roles.component.scss'
})
export class PartnerRolesComponent implements OnInit {
  private roleService = inject(PartnerRoleService);
  router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private functions = new Functions();

  roles = signal<PartnerRole[]>([]);
  loading = signal(true);
  searchQuery = signal('');

  filteredRoles = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.roles();
    }
    return this.roles().filter(role =>
      role.role_name.toLowerCase().includes(query) ||
      (role.description && role.description.toLowerCase().includes(query))
    );
  });

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.loading.set(true);
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.functions.show_toast('Error', 'error', 'Failed to load roles.');
        this.loading.set(false);
      }
    });
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
  }

  editRole(role: PartnerRole) {
    this.router.navigate(['/partner/roles/edit', role.id]);
  }

  deleteRole(role: PartnerRole) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the role "${role.role_name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.roleService.deleteRole(role.id).subscribe({
          next: () => {
            this.functions.show_toast('Success', 'success', 'Role deleted successfully.');
            this.loadRoles();
          },
          error: (error) => {
            console.error('Error deleting role:', error);
            this.functions.show_toast('Error', 'error', 'Failed to delete role.');
          }
        });
      }
    });
  }

  setupDefaults() {
    this.confirmationService.confirm({
      message: 'This will set up default roles and permissions. Continue?',
      header: 'Setup Defaults',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.roleService.setupDefaultRolesAndPermissions().subscribe({
          next: () => {
            this.functions.show_toast('Success', 'success', 'Default roles and permissions set up successfully.');
            this.loadRoles();
          },
          error: (error) => {
            console.error('Error setting up defaults:', error);
            this.functions.show_toast('Error', 'error', 'Failed to set up default roles and permissions.');
          }
        });
      }
    });
  }

  navigateToCreate() {
    this.router.navigate(['/partner/roles/create']);
  }

  getPermissionCount(role: PartnerRole): number {
    return role.permissions?.filter(p => p.allowed).length || 0;
  }
}

