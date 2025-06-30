import { Component } from '@angular/core';

@Component({
  selector: 'app-demorequest',
  templateUrl: './demorequest.component.html',
  styleUrl: './demorequest.component.scss'
})
export class FooterComponent {

  currentYear: number = new Date().getFullYear();

}
