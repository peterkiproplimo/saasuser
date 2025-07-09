import {Component, inject, input} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {Plan} from '../../models/responses/list-plan-response';
import {CartService} from '../../../cart/services/cart-service';
import {Functions} from '../../../../../shared/functions/functions';
import {MessageService} from 'primeng/api';
import {Toast} from 'primeng/toast';

@Component({
  selector: 'app-plan-card',
  imports: [
    DecimalPipe,
    Toast
  ],
  providers: [MessageService],
  templateUrl: './plan-card.html',
  styleUrl: './plan-card.scss'
})
export class PlanCard {

  plan = input<Plan>()
  cart_service = inject(CartService);
  private functions = new Functions();

  add_to_cart(plan: Plan) {

    const cartItem = {
      plan: plan.name,
      cost: plan.cost,
      qty: 1,
      currency: plan.currency
    };

    this.cart_service.addToCart(cartItem);

    this.functions.show_toast('Added to Cart Successfully',
      'success',
      `Plan ${plan.name} has been added to your cart.`);

  }

}
