import { Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { SideBarItem } from './components/side-bar-item/side-bar-item';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CustomerNavbar } from './components/customer-navbar/customer-navbar';
import { User } from '../auth/models/responses/login-response';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer',
  imports: [
    Button,
    Drawer,
    SideBarItem,
    RouterLink,
    RouterOutlet,
    CustomerNavbar,
    RouterLinkActive,
  ],
  templateUrl: './customer.html',
  styleUrl: './customer.scss',
})
export class Customer {
  isMenuOpen = false;
  drawerVisible = false;
  private auth_service = inject(AuthService);

  storedUser: User = JSON.parse(localStorage.getItem('user')!);
  loggedIn = this.auth_service.loggedIn();

  constructor(private router: Router) {}

  toggleDrawer() {
    this.drawerVisible = !this.drawerVisible;
  }

  close_drawer() {
    this.drawerVisible = false;
  }

  getTimeOfDay(): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return 'Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Afternoon';
    } else {
      return 'Evening';
    }
  }

  reloadSubscriptions() {
    if (this.router.url === '/customer/subscriptions') {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/customer/subscriptions']);
      });
    } else {
      this.router.navigate(['/customer/subscriptions']);
    }
  }
}
