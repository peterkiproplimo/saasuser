// cart.service.ts
import { Injectable, computed, signal, inject } from '@angular/core';
import { CartItem } from '../models/cart-iten';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {

  private http = inject(HttpClient);
  base_url = environment.BASE_URL;

  /** Source signal */
  private readonly _items = signal<CartItem[]>([]);

  /** Read‑only projection for components */
  readonly getCartItems = this._items.asReadonly();

  /** Derived totals */
  readonly totalItems = computed(() =>
    this._items().reduce((sum, i) => sum + i.qty!, 0)
  );
  readonly totalCost = computed(() =>
    this._items().reduce((sum, i) => sum + i.qty! * i.cost!, 0)
  );

  /** Add one unit (or first unit) of a plan */
  addToCart(item: CartItem): void {
    this._items.update(list => {
      const found = list.find(i => i.plan === item["plan"]);
      if (found) {
        // bump existing qty
        return list.map(i =>
          i.plan === item["plan"] ? { ...i, qty: i.qty! + 1 } : i
        );
      }
      // first time this plan is added
      return [...list, { ...item, qty: 1 }];
    });
  }

  /** Set an exact quantity for a plan (≤0 ⇒ remove) */
  updateQuantity(plan: string, qty: number): void {
    if (qty < 1) {
      this.removeFromCart(plan);
      return;
    }
    this._items.update(list =>
      list.map(i => (i.plan === plan ? { ...i, qty } : i))
    );
  }

  /** Remove a plan entirely */
  removeFromCart(plan: string): void {
    this._items.update(list => list.filter(i => i.plan !== plan));
  }

  /** Empty the whole cart */
  clearCart(): void {
    this._items.set([]);
  }


  place_order(plans: any): Observable<any> {
    return this.http.post<any>(`${this.base_url}.subscription.create_subscription`, plans);
  }

}
