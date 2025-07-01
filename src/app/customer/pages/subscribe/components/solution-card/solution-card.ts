import {Component, input} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Solution} from '../../models/responses/list-solutions-response';
import {Card} from 'primeng/card';

@Component({
  selector: 'app-solution-card',
  imports: [
    NgOptimizedImage,
    Card
  ],
  templateUrl: './solution-card.html',
  styleUrl: './solution-card.scss'
})
export class SolutionCard {

  solution = input<Solution>();
  root_url = "https://saas.techsavanna.technology";

  get imageUrl(): string {
    return this.root_url+this.solution()?.app_logo!;
  }

}
