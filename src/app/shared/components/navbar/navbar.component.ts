import {Component, inject} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {Router, RouterLink} from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-navbar',
  imports: [
    ButtonModule, Menu, BadgeModule, RippleModule, AvatarModule, RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent{

  items: MenuItem[] | undefined;

  private router = inject(Router)

  isDarkMode = false;
  isMenuOpen = false;

  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('dark');
    this.isDarkMode = element?.classList.contains('dark') ?? false;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  profile() {
    this.router.navigate(['/member-profile']);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  close_menu(){
    this.isMenuOpen = false;
  }

}
