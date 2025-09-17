import { Component, inject } from '@angular/core';
import { Menu } from "primeng/menu";
import { Ripple } from "primeng/ripple";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/responses/login-response';
import { CartService } from '../../pages/cart/services/cart-service';

@Component({
  selector: 'app-customer-navbar',
  imports: [
    Menu,
    Ripple,
    RouterLink
  ],
  templateUrl: './customer-navbar.html',
  styleUrl: './customer-navbar.scss'
})
export class CustomerNavbar {
  isDarkMode = false;
  private auth_service = inject(AuthService);
  private cart_service = inject(CartService);
  storedUser: User = JSON.parse(localStorage.getItem('user')!);
  loggedIn = this.auth_service.loggedIn();
  private router = inject(Router)

  total_items = this.cart_service.totalItems;

  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('dark');
    this.isDarkMode = element?.classList.contains('dark') ?? false;
  }

  logout() {
    this.auth_service.sign_out();
  }

}
