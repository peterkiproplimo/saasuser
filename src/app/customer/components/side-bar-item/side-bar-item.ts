import { Component, input } from '@angular/core';

@Component({
  selector: 'app-side-bar-item',
  imports: [],
  templateUrl: './side-bar-item.html',
  styleUrl: './side-bar-item.scss'
})
export class SideBarItem {

  item = input<string>();
  icon = input<string>();
  isActive = input<boolean>(false);

}
