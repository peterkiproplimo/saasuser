import {Component, inject, OnInit} from '@angular/core';
import {SolutionsService} from '../../services/solutions-service';
import {PlanCard} from '../plan-card/plan-card';
import {ProgressSpinner} from 'primeng/progressspinner';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-solution-detail',
  imports: [
    PlanCard,
    ProgressSpinner
  ],
  templateUrl: './solution-detail.html',
  styleUrl: './solution-detail.scss'
})
export class SolutionDetail implements OnInit {

  private route = inject(ActivatedRoute);
  solutions_service = inject(SolutionsService);
  selected_solution = this.solutions_service.selected_solution;
  solution_id = this.route.snapshot.paramMap.get('id') ?? '';

  constructor() {
    if (this.solution_id) {
      this.solutions_service.selected_solution.set(this.solution_id);
    }
  }

  plans = this.solutions_service.plans_resource.value;
  is_loading = this.solutions_service.plans_resource.isLoading;

  ngOnInit() {
    // Trigger API calls on component mount (like useEffect)
    this.solutions_service.refreshPlans();
  }

}
