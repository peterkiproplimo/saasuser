import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-solution-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solution-card.component.html',
  styleUrls: ['./solution-card.component.scss'],
})
export class SolutionCardComponent {
  @Input() solution: any;
  private router = inject(Router);

  goToSolution(app: any) {
    // Use app.name or app.id for navigation
    const solutionId = app.name || app.id || app.app_name;
    if (solutionId) {
      this.router.navigate(['/solutions', solutionId], {
        state: { solutionData: app },
      });
    }
  }
}
