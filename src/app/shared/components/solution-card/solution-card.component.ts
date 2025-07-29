import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-solution-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solution-card.component.html',
  styleUrls: ['./solution-card.component.scss'],
})
export class SolutionCardComponent {
  @Input() solution: any;
}
