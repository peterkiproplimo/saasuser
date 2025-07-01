import {Component, inject} from '@angular/core';
import {SolutionsService} from '../../services/solutions-service';
import {PlanCard} from '../plan-card/plan-card';
import {ProgressSpinner} from 'primeng/progressspinner';

@Component({
  selector: 'app-solution-detail',
  imports: [
    PlanCard,
    ProgressSpinner
  ],
  templateUrl: './solution-detail.html',
  styleUrl: './solution-detail.scss'
})
export class SolutionDetail {

  solutions_service = inject(SolutionsService);
  selected_solution = this.solutions_service.selected_solution;

  plans = this.solutions_service.plans_resource.value;
  is_loading = this.solutions_service.plans_resource.isLoading;


}
