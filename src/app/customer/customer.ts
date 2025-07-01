import {Component, inject} from '@angular/core';
import {Button} from 'primeng/button';
import {Drawer} from 'primeng/drawer';
import {SideBarItem} from './components/side-bar-item/side-bar-item';
import {RouterLink, RouterOutlet} from '@angular/router';
import {CustomerNavbar} from './components/customer-navbar/customer-navbar';
import {User} from '../auth/models/responses/login-response';
import {AuthService} from '../auth/services/auth.service';

@Component({
  selector: 'app-customer',
  imports: [
    Button,
    Drawer,
    SideBarItem,
    RouterLink,
    RouterOutlet,
    CustomerNavbar
  ],
  templateUrl: './customer.html',
  styleUrl: './customer.scss'
})
export class Customer {

  isMenuOpen = false;
  drawerVisible = false;
  private auth_service = inject(AuthService);

  storedUser :User = JSON.parse(localStorage.getItem('user')!)
  loggedIn = this.auth_service.loggedIn();

  toggleDrawer() {
    this.drawerVisible = !this.drawerVisible;
  }

  close_drawer(){
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


}
