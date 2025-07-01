import {Component, input} from '@angular/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-side-bar-item',
  imports: [
    NgClass
  ],
  templateUrl: './side-bar-item.html',
  styleUrl: './side-bar-item.scss'
})
export class SideBarItem {

  item = input<string>();
  icon = input<string>();

}
