import {computed, Injectable, signal} from '@angular/core';
import {CartItem} from '../models/cart-iten';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartItems = signal<CartItem[]>([]);

  totalItems = computed(() => this.cartItems().reduce((sum, item) => sum + item.qty!, 0));
  totalCost = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.cost! * item.qty!, 0)
  );

  getCartItems = this.cartItems.asReadonly();

  addToCart(item: Omit<CartItem, 'quantity'>) {
    this.cartItems.update(items => {
      const existingItem = items.find(i => i.plan === item.plan);
      if (existingItem) {
        // Update quantity if item exists
        return items.map(i =>
          i.plan === item.plan ? { ...i, quantity: (i.qty || 0) + 1 } : i
        );
      }
      // Add new item with quantity 1
      return [...items, { ...item, quantity: 1 }];
    });
  }

  updateQuantity(id: string, quantity: number) {
    if (quantity < 1) {
      this.removeFromCart(id);
      return;
    }
    this.cartItems.update(items =>
      items.map(item =>
        item.plan === id ? { ...item, quantity } : item
      )
    );
  }

  removeFromCart(id: string) {
    this.cartItems.update(items => items.filter(item => item.plan !== id));
  }
  clearCart() {
    this.cartItems.set([]);
  }

}
