import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { Menu } from 'primeng/menu';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PartnerAuthService } from './services/partner-auth.service';
import { Partner } from './models/partner.model';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-partner',
  imports: [
    CommonModule,
    Button,
    Drawer,
    Menu,
    RouterOutlet,
  ],
  templateUrl: './partner.component.html',
  styleUrl: './partner.component.scss',
})
export class PartnerComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  drawerVisible = false;
  sidebarCollapsed = false;
  isDarkMode = signal(false);
  private partnerAuth = inject(PartnerAuthService);

  storedPartner: Partner | null = this.partnerAuth.getCurrentPartner();
  loggedIn = this.partnerAuth.isLoggedIn();

  // Active state tracking
  activeRoute = signal('/partner');
  private routerSubscription: Subscription | undefined;
  router = inject(Router);

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

  toggleDarkMode() {
    const html = document.documentElement;
    html.classList.toggle('dark');
    this.isDarkMode.set(html.classList.contains('dark'));
  }

  logout() {
    this.partnerAuth.logout();
  }

  // Helper methods to check if a route is active
  isDashboardActive(): boolean {
    const currentRoute = this.activeRoute();
    return currentRoute === '/partner' || currentRoute === '/partner/' || currentRoute === '/partner/dashboard';
  }

  isProductsActive(): boolean {
    return this.activeRoute().includes('/partner/products');
  }

  isInsightsActive(): boolean {
    return this.activeRoute().includes('/partner/insights');
  }

  getButtonClasses(isActive: boolean): string {
    const baseClasses = 'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left';
    if (isActive) {
      return `${baseClasses} bg-white/20 text-white font-semibold shadow-lg`;
    }
    return `${baseClasses} text-blue-100 hover:bg-white/10 hover:text-white`;
  }

  navigateToDashboard() {
    this.router.navigate(['/partner/dashboard']);
  }

  navigateToProducts() {
    this.router.navigate(['/partner/products']);
  }

  navigateToInsights() {
    this.router.navigate(['/partner/insights']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}


