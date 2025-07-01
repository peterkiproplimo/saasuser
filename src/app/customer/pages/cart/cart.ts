import {Component, inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import {CartService} from './services/cart-service';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputNumberModule, DecimalPipe]
})
export class Cart {
  cartService = inject(CartService); // Inject the CartService

  updateQuantity(id: string, quantity: number) {
    this.cartService.updateQuantity(id, quantity);
  }

  checkout() {
    // Implement checkout logic (e.g., navigate to checkout page)
    console.log('Proceed to checkout:', this.cartService.getCartItems());
  }
}
