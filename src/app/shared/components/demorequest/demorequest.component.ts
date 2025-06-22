import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-demorequest',
  imports: [
    RouterLink
  ],
  templateUrl: './demorequest.component.html',
  styleUrl: './demorequest.component.scss'
})
export class FooterComponent {

  currentYear: number = new Date().getFullYear();

}
