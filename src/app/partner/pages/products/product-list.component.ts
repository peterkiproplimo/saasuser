import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PartnerProductService } from '../../services/partner-product.service';
import { PartnerProduct, SubscriptionPlan } from '../../models/partner.model';
import { Functions } from '../../../shared/functions/functions';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    RouterLink,
    ProgressSpinner,
    DialogModule,
    ButtonModule,
    CardModule,
    TagModule,
    BadgeModule,
    DividerModule,
    ConfirmDialogModule,
    TooltipModule,
    ToastModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  private productService = inject(PartnerProductService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private functions = new Functions();

  products = signal<PartnerProduct[]>([]);
  loading = signal(true);
  selectedProduct = signal<PartnerProduct | null>(null);
  plansDialogVisible = false;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.functions.show_toast('Error', 'error', 'Failed to load products.');
      }
    });
  }

  viewPlans(product: PartnerProduct) {
    this.selectedProduct.set(product);
    this.plansDialogVisible = true;
  }

  closePlansDialog() {
    this.plansDialogVisible = false;
    this.selectedProduct.set(null);
  }

  deleteProduct(id: string, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this product?',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.productService.deleteProduct(id).subscribe({
          next: () => {
            this.functions.show_toast('Success', 'success', 'Product deleted successfully.');
            this.loadProducts();
          },
          error: () => {
            this.functions.show_toast('Error', 'error', 'Failed to delete product.');
          }
        });
      }
    });
  }

  editProduct(id: string) {
    this.router.navigate(['/partner/products/edit', id]);
  }

  formatCurrency(amount: number, currency: string = 'KES'): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  getPlanBadgeSeverity(index: number): 'success' | 'info' | 'warning' | 'danger' {
    const severities: ('success' | 'info' | 'warning' | 'danger')[] = ['success', 'info', 'warning', 'danger'];
    return severities[index % severities.length];
  }

  getTotalPlans(): number {
    return this.selectedProduct()?.subscription_plans.length || 0;
  }

  getStartingPrice(): string {
    const product = this.selectedProduct();
    if (!product || product.subscription_plans.length === 0) return '0.00';
    const minPrice = this.getMinPrice(product.subscription_plans);
    return this.formatPrice(minPrice, product.subscription_plans[0].currency);
  }

  getHighestPrice(): string {
    const product = this.selectedProduct();
    if (!product || product.subscription_plans.length === 0) return '0.00';
    const maxPrice = this.getMaxPrice(product.subscription_plans);
    return this.formatPrice(maxPrice, product.subscription_plans[0].currency);
  }

  getTotalFeatures(): number {
    return this.selectedProduct()?.subscription_plans.reduce((sum, p) => sum + (p.features?.length || 0), 0) || 0;
  }

  getMinPrice(plans: any[]): number {
    return plans.reduce((min, p) => p.price < min ? p.price : min, plans[0]?.price || 0);
  }

  getMaxPrice(plans: any[]): number {
    return plans.reduce((max, p) => p.price > max ? p.price : max, plans[0]?.price || 0);
  }

  // Convert KES to USD with current exchange rate + $1.25
  // Exchange rate: 1 USD = 135 KES (update this with real-time rate if needed)
  private readonly USD_EXCHANGE_RATE = 135;
  private readonly USD_MARKUP = 1.25;

  convertToUSD(kesAmount: number): number {
    const usdAmount = kesAmount / this.USD_EXCHANGE_RATE;
    return usdAmount + this.USD_MARKUP; // Add $1.25 as requested
  }

  formatPrice(price: number, currency: string): string {
    if (currency === 'KES') {
      // Show price without currency symbol (since it's shown at top)
      return new Intl.NumberFormat('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    } else if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(price);
    } else {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
      }).format(price);
    }
  }

  formatPriceWithUSD(price: number, currency: string): string {
    if (currency === 'KES') {
      const formattedKES = this.formatPrice(price, currency);
      const usdPrice = this.convertToUSD(price);
      return `${formattedKES} (≈ $${usdPrice.toFixed(2)} USD)`;
    }
    return this.formatPrice(price, currency);
  }
}

