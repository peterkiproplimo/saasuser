import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  subscription_plan: string;
  product_name: string;
  status: 'active' | 'inactive' | 'trial';
  subscription_date: string;
  monthly_revenue: number;
  currency: string;
}

interface ApiClient {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_company: string;
  subscription_plan: string;
  product_name: string;
  status: 'active' | 'inactive' | 'trial';
  subscription_date: string;
  monthly_price: number;
  currency: string;
}

@Component({
  selector: 'app-partner-clients',
  imports: [
    CommonModule,
    FormsModule,
    ProgressSpinner,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './partner-clients.component.html',
  styleUrl: './partner-clients.component.scss'
})
export class PartnerClientsComponent implements OnInit {
  private http = inject(HttpClient);
  private readonly apiBase = environment.PARTNER_API_BASE;
  
  clients = signal<Client[]>([]);
  loading = signal(true);
  searchQuery = signal('');
  statusFilter = signal<string>('all'); // 'all', 'active', 'trial', 'inactive'

  // Computed metrics
  activeCount = computed(() => this.clients().filter(c => c.status === 'active').length);
  trialCount = computed(() => this.clients().filter(c => c.status === 'trial').length);
  inactiveCount = computed(() => this.clients().filter(c => c.status === 'inactive').length);
  totalClients = computed(() => this.clients().length);
  totalMonthlyRevenue = computed(() => {
    return this.clients().reduce((sum, client) => sum + (client.monthly_revenue || 0), 0);
  });

  // Filtered clients based on search and status filter
  filteredClients = computed(() => {
    let filtered = this.clients();
    
    // Apply status filter
    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(c => c.status === this.statusFilter());
    }
    
    // Apply search filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.company.toLowerCase().includes(query) ||
        client.product_name.toLowerCase().includes(query) ||
        client.subscription_plan.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  });

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.loading.set(true);
    this.http.get<{
      status: number;
      message: string;
      data: ApiClient[];
    }>(`${this.apiBase}.get_clients`).pipe(
      map(response => {
        // Extract data array and map API fields to component interface
        return (response.data || []).map(apiClient => ({
          id: apiClient.id,
          name: apiClient.client_name,
          email: apiClient.client_email,
          company: apiClient.client_company,
          subscription_plan: apiClient.subscription_plan,
          product_name: apiClient.product_name,
          status: apiClient.status,
          subscription_date: apiClient.subscription_date,
          monthly_revenue: apiClient.monthly_price || 0,
          currency: apiClient.currency || 'KES'
        } as Client));
      })
    ).subscribe({
      next: (clients) => {
        console.log('Clients loaded:', clients);
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.loading.set(false);
      }
    });
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'trial': return 'warning';
      case 'inactive': return 'danger';
      default: return 'info';
    }
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency || 'KES'
    }).format(amount);
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
  }

  onStatusFilterChange(status: string) {
    this.statusFilter.set(status);
  }

  onCardClick(status: string) {
    // Toggle: if clicking the same status, show all; otherwise filter by that status
    if (this.statusFilter() === status) {
      this.statusFilter.set('all');
    } else {
      this.statusFilter.set(status);
    }
  }

  clearFilters() {
    this.searchQuery.set('');
    this.statusFilter.set('all');
  }
}


