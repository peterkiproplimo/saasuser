import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { PartnerProductService } from '../../services/partner-product.service';
import { PartnerInsights } from '../../models/partner.model';

@Component({
  selector: 'app-partner-dashboard',
  imports: [
    CommonModule,
    DecimalPipe,
    ProgressSpinner,
    RouterLink
  ],
  templateUrl: './partner-dashboard.component.html',
  styleUrl: './partner-dashboard.component.scss'
})
export class PartnerDashboardComponent implements OnInit {
  private productService = inject(PartnerProductService);
  
  insights = signal<PartnerInsights>({
    total_products: 0,
    total_views: 0,
    total_subscriptions: 0,
    total_revenue: 0,
    currency: 'KES'
  });
  
  loading = signal(true);

  ngOnInit() {
    this.loadInsights();
  }

  loadInsights() {
    this.loading.set(true);
    this.productService.getInsights().subscribe({
      next: (data) => {
        this.insights.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  }
}

