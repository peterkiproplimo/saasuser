import {Component, inject, input} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {Plan} from '../../models/responses/list-plan-response';
import {CartService} from '../../../cart/services/cart-service';

@Component({
  selector: 'app-plan-card',
  imports: [
    DecimalPipe
  ],
  templateUrl: './plan-card.html',
  styleUrl: './plan-card.scss'
})
export class PlanCard {

  plan = input<Plan>()
  cart_service = inject(CartService);

  add_to_cart(plan: Plan) {

    const cartItem = {
      plan: plan.name,
      cost: plan.cost,
      qty: 1,
      currency: plan.currency
    };

    this.cart_service.addToCart(cartItem);
  }

}
