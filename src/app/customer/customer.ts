import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { Menu } from 'primeng/menu';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { User } from '../auth/models/responses/login-response';
import { AuthService } from '../auth/services/auth.service';
import { InvoicesService } from './pages/invoices/services/invoices';
import { SubscriptionService } from '../subscriptions/subscription.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

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
export class Customer implements OnInit, OnDestroy {
  isMenuOpen = false;
  drawerVisible = false;
  sidebarCollapsed = false;
  isDarkMode = signal(false);
  private auth_service = inject(AuthService);
  private invoices_service = inject(InvoicesService);
  private subscription_service = inject(SubscriptionService);

  storedUser: User = JSON.parse(localStorage.getItem('user')!);
  loggedIn = this.auth_service.loggedIn();

  // Active state tracking
  activeRoute = signal('/customer');
  private routerSubscription: Subscription | undefined;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Track route changes to update active state
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.activeRoute.set(event.url);
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

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

  // Helper methods to check if a route is active
  isDashboardActive(): boolean {
    const currentRoute = this.activeRoute();
    return currentRoute === '/customer' || currentRoute === '/customer/';
  }

  isSubscriptionsActive(): boolean {
    return this.activeRoute().includes('/customer/subscriptions');
  }

  isInvoicesActive(): boolean {
    return this.activeRoute().includes('/customer/invoices');
  }

  isBillingActive(): boolean {
    return this.activeRoute().includes('/customer/billing');
  }

  isProfileActive(): boolean {
    return this.activeRoute().includes('/customer/profile');
  }

  isTicketsActive(): boolean {
    return this.activeRoute().includes('/customer/tickets');
  }

  isFAQsActive(): boolean {
    return this.activeRoute().includes('/customer/faq');
  }

  isSubscribeActive(): boolean {
    return this.activeRoute().includes('/customer/subscribe');
  }

  // Helper method to get button classes based on active state
  getButtonClasses(isActive: boolean): string {
    if (isActive) {
      return 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-3';
    } else {
      return 'w-full text-left hover:bg-white/10 py-2 px-3 rounded-lg transition-colors duration-200 flex items-center space-x-3 text-white';
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
