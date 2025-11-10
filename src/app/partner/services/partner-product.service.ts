import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PartnerProduct, SubscriptionPlan } from '../models/partner.model';
import { PartnerAuthService } from './partner-auth.service';

@Injectable({
  providedIn: 'root'
})
export class PartnerProductService {
  private readonly STORAGE_KEY = 'partner_products';

  constructor(private partnerAuth: PartnerAuthService) {
    // Initialize storage if it doesn't exist
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  /**
   * Get all products for current partner
   */
  getProducts(): Observable<PartnerProduct[]> {
    const partner = this.partnerAuth.getCurrentPartner();
    if (!partner) {
      return of([]);
    }

    const products = this.getAllProducts();
    const partnerProducts = products.filter(p => p.partner_id === partner.id);
    return of(partnerProducts).pipe(delay(300));
  }

  /**
   * Get product by ID
   */
  getProductById(id: string): Observable<PartnerProduct | null> {
    const products = this.getAllProducts();
    const product = products.find(p => p.id === id);
    return of(product || null).pipe(delay(300));
  }

  /**
   * Create new product
   */
  createProduct(productData: Omit<PartnerProduct, 'id' | 'partner_id' | 'created_at' | 'updated_at'>): Observable<PartnerProduct> {
    const partner = this.partnerAuth.getCurrentPartner();
    if (!partner) {
      throw new Error('Partner not logged in');
    }

    const newProduct: PartnerProduct = {
      ...productData,
      id: this.generateId(),
      partner_id: partner.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const products = this.getAllProducts();
    products.push(newProduct);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));

    return of(newProduct).pipe(delay(500));
  }

  /**
   * Update product
   */
  updateProduct(id: string, productData: Partial<PartnerProduct>): Observable<PartnerProduct> {
    const products = this.getAllProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Product not found');
    }

    const partner = this.partnerAuth.getCurrentPartner();
    if (products[index].partner_id !== partner?.id) {
      throw new Error('Unauthorized');
    }

    products[index] = {
      ...products[index],
      ...productData,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
    return of(products[index]).pipe(delay(500));
  }

  /**
   * Delete product
   */
  deleteProduct(id: string): Observable<{ success: boolean }> {
    const products = this.getAllProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Product not found');
    }

    const partner = this.partnerAuth.getCurrentPartner();
    if (products[index].partner_id !== partner?.id) {
      throw new Error('Unauthorized');
    }

    products.splice(index, 1);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
    return of({ success: true }).pipe(delay(300));
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
    const partner = this.partnerAuth.getCurrentPartner();
    if (!partner) {
      return of({
        total_products: 0,
        total_views: 0,
        total_subscriptions: 0,
        total_revenue: 0,
        currency: 'KES'
      });
    }

    const products = this.getAllProducts().filter(p => p.partner_id === partner.id);
    
    // Calculate dummy insights
    const total_products = products.length;
    const total_views = products.reduce((sum, p) => sum + Math.floor(Math.random() * 1000) + 100, 0);
    const total_subscriptions = products.reduce((sum, p) => {
      return sum + p.subscription_plans.reduce((planSum, plan) => planSum + Math.floor(Math.random() * 50) + 5, 0);
    }, 0);
    const total_revenue = products.reduce((sum, p) => {
      return sum + p.subscription_plans.reduce((planSum, plan) => {
        const subscriptions = Math.floor(Math.random() * 50) + 5;
        return planSum + (plan.price * subscriptions);
      }, 0);
    }, 0);

    return of({
      total_products,
      total_views,
      total_subscriptions,
      total_revenue,
      currency: 'KES'
    }).pipe(delay(300));
  }

  /**
   * Get all products (internal)
   */
  private getAllProducts(): PartnerProduct[] {
    const productsStr = localStorage.getItem(this.STORAGE_KEY);
    return productsStr ? JSON.parse(productsStr) : [];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'product_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
    const partner = this.partnerAuth.getCurrentPartner();
    if (!partner) {
      throw new Error('Partner not logged in');
    }

    const products = this.getAllProducts();
    const newProducts: PartnerProduct[] = productsData.map(productData => {
      const newProduct: PartnerProduct = {
        ...productData,
        id: this.generateId(),
        partner_id: partner.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subscription_plans: productData.subscription_plans.map(plan => ({
          id: 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          features: plan.features || []
        }))
      };
      products.push(newProduct);
      return newProduct;
    });

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
    return of(newProducts).pipe(delay(500));
  }
}

