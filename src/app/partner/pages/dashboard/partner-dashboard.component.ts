import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ChartModule } from 'primeng/chart';
import { PartnerProductService } from '../../services/partner-product.service';
import { PartnerInsights } from '../../models/partner.model';

@Component({
  selector: 'app-partner-dashboard',
  imports: [
    CommonModule,
    DecimalPipe,
    ProgressSpinner,
    RouterLink,
    ChartModule
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
  revenueChartData: any;
  subscriptionChartData: any;
  chartOptions: any;

  ngOnInit() {
    this.loadInsights();
  }

  loadInsights() {
    this.loading.set(true);
    this.productService.getInsights().subscribe({
      next: (data) => {
        this.insights.set(data);
        this.initCharts(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  initCharts(data: PartnerInsights) {
    // Revenue Chart
    this.revenueChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Revenue',
          data: [12000, 15000, 18000, 14000, 22000, 25000, 28000, 30000, 27000, 32000, data.total_revenue, data.total_revenue * 1.1],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    // Subscription Chart
    this.subscriptionChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Subscriptions',
          data: [45, 52, 58, 55, 65, 72, 78, 85, 82, 90, data.total_subscriptions, data.total_subscriptions + 10],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  }
}

