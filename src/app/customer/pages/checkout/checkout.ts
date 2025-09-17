import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../cart/services/cart-service';
import { DecimalPipe } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { Functions } from '../../../shared/functions/functions';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  imports: [ReactiveFormsModule, DecimalPipe, DropdownModule, ProgressSpinner],
  providers: [MessageService],
  styleUrls: ['./checkout.scss'], // optional – can remove if you stay inlined
})
export class Checkout implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);
  loading = signal<boolean>(false);

  cartItems = this.cartService.getCartItems();
  totalCost = this.cartService.totalCost();

  private functions = new Functions();

  ngOnInit(): void {
    if (!this.cartItems.length) this.router.navigate(['/customer/cart']);
  }

  placeOrder(): void {
    let input = this.cartService.getCartItems();

    const output = {
      plans: input.map((item) => ({
        plan: item.plan,
        qty: item.qty,
      })),
    };
    this.loading.set(true);
    this.cartService.place_order(output).subscribe({
      next: (response: any) => {
        this.loading.set(false);
        this.functions.show_toast(
          'Order Placement Successful',
          'success',
          response.message?.message!
        );
        this.cartService.clearCart();
        this.router.navigate(['/customer/thank-you']);
      },
      error: (error: any) => {
        this.loading.set(false);
        this.functions.show_toast(
          'Order Placement Failed',
          'error',
          error.error?.message
        );
      },
    });
  }
}
