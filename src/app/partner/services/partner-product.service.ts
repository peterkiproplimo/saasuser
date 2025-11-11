import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PartnerProduct, SubscriptionPlan } from '../models/partner.model';
import { PartnerAuthService } from './partner-auth.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PartnerProductService {
  private http = inject(HttpClient);

  constructor(private partnerAuth: PartnerAuthService) {}

  /**
   * Get all products for current partner
   */
  getProducts(): Observable<PartnerProduct[]> {
    return this.http.get<PartnerProduct[]>('/api/partner/products');
  }

  /**
   * Get product by ID
   */
  getProductById(id: string): Observable<PartnerProduct | null> {
    return this.http.get<PartnerProduct>(`/api/partner/products/${id}`);
  }

  /**
   * Create new product
   */
  createProduct(productData: Omit<PartnerProduct, 'id' | 'partner_id' | 'created_at' | 'updated_at'>): Observable<PartnerProduct> {
    return this.http.post<PartnerProduct>('/api/partner/products', productData);
  }

  /**
   * Update product
   */
  updateProduct(id: string, productData: Partial<PartnerProduct>): Observable<PartnerProduct> {
    return this.http.put<PartnerProduct>(`/api/partner/products/${id}`, productData);
  }

  /**
   * Delete product
   */
  deleteProduct(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`/api/partner/products/${id}`);
  }

  /**
   * Get insights for current partner
   */
  getInsights(): Observable<{
    total_products: number;
    total_views: number;
    total_subscriptions: number;
    total_revenue: number;
    currency: string;
  }> {
    return this.http.get<{
      total_products: number;
      total_views: number;
      total_subscriptions: number;
      total_revenue: number;
      currency: string;
    }>('/api/partner/analytics/summary');
  }

  /**
   * Seed multiple products at once (for testing/demo purposes)
   */
  seedProducts(productsData: Array<{
    name: string;
    description: string;
    logo?: string;
    subscription_plans: Array<{
      name: string;
      price: number;
      currency: string;
      features?: string[];
    }>;
  }>): Observable<PartnerProduct[]> {
    // For mock API, call create endpoint in a loop
    const creations = productsData.map(p => this.createProduct(p as any));
    // The caller can subscribe to each or we could combineLatest—keeping simple for now.
    return this.http.get<PartnerProduct[]>('/api/partner/products');
  }
}

