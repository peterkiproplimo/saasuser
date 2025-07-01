import {Component, input} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Solution} from '../../models/responses/list-solutions-response';

@Component({
  selector: 'app-solution-card',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './solution-card.html',
  styleUrl: './solution-card.scss'
})
export class SolutionCard {

  solution = input<Solution>();

}
