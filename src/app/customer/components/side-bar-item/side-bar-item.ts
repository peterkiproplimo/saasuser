import { Component, input, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-bar-item',
  imports: [],
  templateUrl: './side-bar-item.html',
  styleUrl: './side-bar-item.scss'
})
export class SideBarItem {
  private router = inject(Router);

  item = input<string>();
  icon = input<string>();
  isActive = input<boolean>(false);

  // Computed property to determine if this item is active based on current route
  isRouteActive = computed(() => {
    const currentUrl = this.router.url;
    const item = this.item();

    if (!item) return false;

    // Map item names to their corresponding routes
    const routeMap: { [key: string]: string } = {
      'Dashboard': '/customer',
      'Subscriptions': '/customer/subscriptions',
      'Purchase Service': '/customer/subscribe',
      'Invoices': '/customer/invoices',
      'Billing History': '/customer/billing',
      'Support Tickets': '/customer/tickets',
      'My Profile': '/customer/profile'
    };

    const expectedRoute = routeMap[item];
    if (!expectedRoute) return false;

    // For dashboard, check exact match
    if (item === 'Dashboard') {
      return currentUrl === expectedRoute;
    }

    // For other routes, check if current URL starts with the expected route
    return currentUrl.startsWith(expectedRoute);
  });
}
