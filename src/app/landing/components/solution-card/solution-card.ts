import { Component, input } from '@angular/core';
import { Icon } from '../../../shared/components/icon/icon';
import { Service } from '../../models/service';

@Component({
  selector: 'app-solution-card',
  imports: [Icon],
  templateUrl: './solution-card.html',
  styleUrl: './solution-card.scss',
})
export class SolutionCard {
  solution = input<Service>();
}
