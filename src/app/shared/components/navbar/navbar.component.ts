import {Component, inject} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {Router, RouterLink} from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import {Menu} from 'primeng/menu';
import {User} from '../../../auth/models/responses/login-response';
import {AuthService} from '../../../auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [
    ButtonModule, BadgeModule, RippleModule, AvatarModule, RouterLink, Menu
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent{

  items: MenuItem[] | undefined;

  private router = inject(Router)
  private auth_service = inject(AuthService);

  isDarkMode = false;
  isMenuOpen = false;
  storedUser :User = JSON.parse(localStorage.getItem('user')!);
  loggedIn = this.auth_service.loggedIn();

  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('dark');
    this.isDarkMode = element?.classList.contains('dark') ?? false;
  }

  logout() {
    this.auth_service.sign_out();
  }
  signup() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/signup']);
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
