import { Component } from '@angular/core';
import {SolutionList} from './components/solution-list/solution-list';

@Component({
  selector: 'app-subscribe',
  imports: [
    SolutionList
  ],
  templateUrl: './subscribe.html',
  styleUrl: './subscribe.scss'
})
export class Subscribe {

}
