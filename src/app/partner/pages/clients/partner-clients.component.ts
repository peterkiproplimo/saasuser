import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Component({
  selector: 'app-partner-clients',
  imports: [
    CommonModule,
    ProgressSpinner,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule
  ],
  templateUrl: './partner-clients.component.html',
  styleUrl: './partner-clients.component.scss'
})
export class PartnerClientsComponent implements OnInit {
  private http = inject(HttpClient);
  
  clients = signal<Client[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.loading.set(true);
    this.http.get<Client[]>('/api/partner/clients').subscribe({
      next: (data) => {
        this.clients.set(data);
        this.loading.set(false);
      },
      error: () => {
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
}


