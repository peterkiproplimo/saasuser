import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PartnerProduct, SubscriptionPlan } from '../models/partner.model';
import { PartnerAuthService } from './partner-auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PartnerProductService {
  private http = inject(HttpClient);
  private readonly apiBase = environment.PARTNER_API_BASE;

  constructor(private partnerAuth: PartnerAuthService) {}

  /**
   * Get all products for current partner
   */
  getProducts(): Observable<PartnerProduct[]> {
    return this.http.get<{
      status: number;
      message: string;
      data: PartnerProduct[];
    }>(`${this.apiBase}.get_partner_products`).pipe(
      map(response => {
        // Extract products from data array
        return response.data || [];
      })
    );
  }

  /**
   * Get product by ID
   */
  getProductById(id: string): Observable<PartnerProduct> {
    const params = new HttpParams().set('product_id', id);
    return this.http.get<{
      status: number;
      message: string;
      data: PartnerProduct | PartnerProduct[];
    }>(`${this.apiBase}.get_partner_product_by_id`, { params }).pipe(
      map(response => {
        // Handle both array and single object responses
        if (Array.isArray(response.data)) {
          return response.data[0];
        }
        return response.data;
      })
    );
  }

  /**
   * Create new product
   */
  createProduct(productData: Omit<PartnerProduct, 'id' | 'partner_id' | 'created_at' | 'updated_at'>): Observable<PartnerProduct> {
    return this.http.post<{
      status: number;
      message: string;
      data: PartnerProduct[];
    }>(`${this.apiBase}.create_partner_product`, productData).pipe(
      map(response => {
        // Extract the created product from data array (should be first item)
        if (response.data && response.data.length > 0) {
          return response.data[0];
        }
        throw new Error('Product creation response missing data');
      })
    );
  }

  /**
   * Update product
   */
  updateProduct(id: string, productData: Partial<PartnerProduct>): Observable<PartnerProduct> {
    const params = new HttpParams().set('product_id', id);
    console.log('Updating product:', { id, productData: { ...productData, logo: productData.logo ? `${productData.logo.substring(0, 50)}...` : 'null' } });
    return this.http.put<{
      status: number;
      message: string;
      data: PartnerProduct | PartnerProduct[];
    }>(`${this.apiBase}.update_partner_product`, productData, { params }).pipe(
      map(response => {
        console.log('Update response:', response);
        // Handle both array and single object responses
        if (Array.isArray(response.data)) {
          return response.data[0];
        }
        return response.data;
      })
    );
  }

  /**
   * Delete product
   */
  deleteProduct(id: string): Observable<{ success: boolean }> {
    const params = new HttpParams().set('product_id', id);
    return this.http.delete<{ success: boolean }>(`${this.apiBase}.delete_partner_product`, { params });
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
      status: number;
      message: string;
      data: Array<{
        total_products: number;
        total_views: number;
        total_subscriptions: number;
        total_revenue: number;
        currency: string;
      }>;
    }>(`${this.apiBase}.get_partner_analytics_summary`).pipe(
      map(response => {
        // Extract the first item from the data array, or use defaults if empty
        const insights = response.data && response.data.length > 0 
          ? response.data[0] 
          : {
              total_products: 0,
              total_views: 0,
              total_subscriptions: 0,
              total_revenue: 0,
              currency: 'KES'
            };
        
        // Ensure all values are numbers (handle string conversions)
        return {
          total_products: Number(insights.total_products) || 0,
          total_views: Number(insights.total_views) || 0,
          total_subscriptions: Number(insights.total_subscriptions) || 0,
          total_revenue: Number(insights.total_revenue) || 0,
          currency: insights.currency || 'KES'
        };
      })
    );
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
    // Create products sequentially to avoid race conditions
    const creations = productsData.map(p => this.createProduct(p as any));
    // Return the list of products after creation
    return this.getProducts();
  }
}

