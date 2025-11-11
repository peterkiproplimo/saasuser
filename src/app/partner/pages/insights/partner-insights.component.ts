import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ChartModule } from 'primeng/chart';
import { PartnerProductService } from '../../services/partner-product.service';
import { PartnerInsights } from '../../models/partner.model';

@Component({
  selector: 'app-partner-insights',
  imports: [
    CommonModule,
    DecimalPipe,
    ProgressSpinner,
    ChartModule
  ],
  templateUrl: './partner-insights.component.html',
  styleUrl: './partner-insights.component.scss'
})
export class PartnerInsightsComponent implements OnInit {
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
  viewsChartData: any;
  productChartData: any;
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
          label: 'Revenue (KES)',
          data: [12000, 15000, 18000, 14000, 22000, 25000, 28000, 30000, 27000, 32000, data.total_revenue, data.total_revenue * 1.1],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    // Views Chart
    this.viewsChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Total Views',
          data: [450, 520, 580, 550, 650, 720, 780, 850, 820, 900, data.total_views, data.total_views + 100],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    // Product Distribution Chart
    this.productChartData = {
      labels: ['Product 1', 'Product 2', 'Product 3', 'Product 4', 'Product 5'],
      datasets: [
        {
          label: 'Subscriptions',
          data: [25, 18, 15, 12, 8],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            '#3B82F6',
            '#10B981',
            '#8B5CF6',
            '#F59E0B',
            '#EF4444'
          ],
          borderWidth: 2
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

