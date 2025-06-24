import {Component, input} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-icon',
  imports: [
    NgClass
  ],
  templateUrl: './icon.html',
  styleUrl: './icon.scss'
})
export class Icon {
  icon = input<string>();
}
