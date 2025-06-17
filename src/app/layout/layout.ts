import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FooterComponent} from '../shared/components/footer/footer.component';
import {NavbarComponent} from '../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    FooterComponent,
    NavbarComponent
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {

}
