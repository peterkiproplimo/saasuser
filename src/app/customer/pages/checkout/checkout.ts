import { Component, OnInit, inject } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {CartService} from '../cart/services/cart-service';
import {DecimalPipe} from '@angular/common';
import {InputText} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {Checkbox} from 'primeng/checkbox';
import {ButtonDirective} from 'primeng/button';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    InputText,
    DropdownModule,
    Checkbox,
    ButtonDirective,
    RouterLink
  ],
  styleUrls: ['./checkout.scss']     // optional – can remove if you stay inlined
})
export class Checkout implements OnInit {

  private cartService = inject(CartService);
  private router      = inject(Router);

  cartItems = this.cartService.getCartItems();   // snapshot is fine here
  totalCost = this.cartService.totalCost();      // snapshot – updates already handled earlier

  /** Reactive‑form group for billing / payment */
  checkoutForm = new FormGroup({
    fullName:     new FormControl('', [Validators.required]),
    email:         new FormControl('', [Validators.required, Validators.email]),
    phone:         new FormControl('', [Validators.required]),
    payMethod:    new FormControl( 'MPESA', [Validators.required]),
    acceptTerms:   new FormControl(false, [Validators.requiredTrue])
  });

  ngOnInit(): void {
    // If someone tries to hit /checkout with an empty cart, send them back.
    if (!this.cartItems.length) this.router.navigate(['/customer/cart']);
  }

  /** Confirm button */
  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    // ❷ Clear cart & redirect
    this.cartService.clearCart();
    this.router.navigate(['/customer/thank-you'], { state: { order: true } });
  }
}
