import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { AuthService } from '../../../auth/services/auth.service';
import { SolutionService } from '../navbar/services/navbar.service';

@Component({
  standalone: true,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [
    ButtonModule,
    CommonModule,
    BadgeModule,
    RippleModule,
    AvatarModule,
    Menu,
    RouterLink
  ]
})
export class NavbarComponent {
  // -------------------- UI STATE --------------------
  items: MenuItem[] | undefined;
  isDarkMode = false;
  isMenuOpen = false;

  // -------------------- AUTH -----------------------
  private auth = inject(AuthService);
  loggedIn = this.auth.loggedIn();
  storedUser = JSON.parse(localStorage.getItem('user')!);
  private router = inject(Router);

  // -------------------- THEME + MENU ---------------
  toggleDarkMode() {
    const html = document.documentElement;
    html.classList.toggle('dark');
    this.isDarkMode = html.classList.contains('dark');
  }
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  close_menu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.auth.sign_out();
  }
  slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-');
}

goToSolution(app: any) {
  const appSlug = app.name.toLowerCase().replace(/\s+/g, '-');
  this.router.navigate(['/solutions', this.slugify(app.name)], {
  state: { solutionData: app }
});
}




  // -------------------- API (Solutions) ------------
  private subSvc = inject(SolutionService);
  readonly responseSig = this.subSvc.subscription_resource.value;
  readonly solutions = computed(() => {
  const data = this.responseSig()?.data ?? [];
  console.log('💡 Solutions data in dropdown:', data); // <-- Add this
  return data;
});

  readonly is_loading = this.subSvc.subscription_resource.isLoading;
  readonly is_error   = this.subSvc.subscription_resource.statusCode;
}
