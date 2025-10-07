import { Component, inject, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { Menu } from 'primeng/menu';
import { RouterOutlet } from '@angular/router';
import { User } from '../auth/models/responses/login-response';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { InvoicesService } from './pages/invoices/services/invoices';
import { SubscriptionService } from '../subscriptions/subscription.service';

@Component({
  selector: 'app-customer',
  imports: [
    Button,
    Drawer,
    Menu,
    RouterOutlet,
  ],
  templateUrl: './customer.html',
  styleUrl: './customer.scss',
})
export class Customer {
  isMenuOpen = false;
  drawerVisible = false;
  sidebarCollapsed = false;
  isDarkMode = signal(false);
  private auth_service = inject(AuthService);
  private invoices_service = inject(InvoicesService);
  private subscription_service = inject(SubscriptionService);

  storedUser: User = JSON.parse(localStorage.getItem('user')!);
  loggedIn = this.auth_service.loggedIn();

  constructor(private router: Router) { }

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

  // Navigation methods - components will handle their own data refresh on mount
  navigateToDashboard() {
    this.router.navigate(['/customer']);
    this.close_drawer();
  }

  navigateToSubscriptions() {
    this.router.navigate(['/customer/subscriptions']);
    this.close_drawer();
  }

  navigateToInvoices() {
    this.router.navigate(['/customer/invoices']);
    this.close_drawer();
  }

  navigateToBilling() {
    this.router.navigate(['/customer/billing']);
    this.close_drawer();
  }

  navigateToProfile() {
    this.router.navigate(['/customer/profile']);
    this.close_drawer();
  }

  navigateToFAQs() {
    this.router.navigate(['/customer/faq']);
    this.close_drawer();
  }

  navigateToTickets() {
    this.router.navigate(['/customer/tickets']);
    this.close_drawer();
  }

  navigateToSubscribe() {
    this.router.navigate(['/customer/subscribe']);
    this.close_drawer();
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleDarkMode() {
    this.isDarkMode.set(!this.isDarkMode());
    // Toggle dark mode on document
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  logout() {
    this.auth_service.sign_out();
  }
}
