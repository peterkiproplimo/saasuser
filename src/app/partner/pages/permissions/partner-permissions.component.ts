import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { PartnerPermissionService } from '../../services/partner-permission.service';
import { Permission } from '../../services/partner-role.service';
import { Functions } from '../../../shared/functions/functions';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-partner-permissions',
  imports: [
    CommonModule,
    FormsModule,
    ProgressSpinner,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './partner-permissions.component.html',
  styleUrl: './partner-permissions.component.scss'
})
export class PartnerPermissionsComponent implements OnInit {
  private permissionService = inject(PartnerPermissionService);
  private functions = new Functions();

  permissions = signal<Permission[]>([]);
  loading = signal(true);
  searchQuery = signal('');

  filteredPermissions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.permissions();
    }
    return this.permissions().filter(permission =>
      permission.permission_name.toLowerCase().includes(query) ||
      permission.permission_key.toLowerCase().includes(query) ||
      (permission.description && permission.description.toLowerCase().includes(query)) ||
      (permission.category && permission.category.toLowerCase().includes(query))
    );
  });

  ngOnInit() {
    this.loadPermissions();
  }

  loadPermissions() {
    this.loading.set(true);
    this.permissionService.getPermissions().subscribe({
      next: (permissions) => {
        this.permissions.set(permissions);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.functions.show_toast('Error', 'error', 'Failed to load permissions.');
        this.loading.set(false);
      }
    });
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
  }
}

