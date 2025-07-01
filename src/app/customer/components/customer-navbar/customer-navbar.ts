import {Component, inject} from '@angular/core';
import {Button} from "primeng/button";
import {Menu} from "primeng/menu";
import {Ripple} from "primeng/ripple";
import {Router} from "@angular/router";
import {AuthService} from '../../../auth/services/auth.service';
import {User} from '../../../auth/models/responses/login-response';

@Component({
  selector: 'app-customer-navbar',
    imports: [
        Button,
        Menu,
        Ripple
    ],
  templateUrl: './customer-navbar.html',
  styleUrl: './customer-navbar.scss'
})
export class CustomerNavbar {
  isDarkMode = false;
  private auth_service = inject(AuthService);
  storedUser :User = JSON.parse(localStorage.getItem('user')!);
  loggedIn = this.auth_service.loggedIn();
  private router = inject(Router)

  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('dark');
    this.isDarkMode = element?.classList.contains('dark') ?? false;
  }

  logout() {
    this.auth_service.sign_out();
  }

  profile() {
    this.router.navigate(['/member-profile']);
  }

}
