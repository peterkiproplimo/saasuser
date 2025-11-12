import { Injectable, signal } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { httpResource } from '@angular/common/http';
import { ListSolutionsResponse, Solution } from '../models/responses/list-solutions-response';
import { ListPlanResponse } from '../models/responses/list-plan-response';

@Injectable({
  providedIn: 'root'
})
export class SolutionsService {

  base_url = environment.BASE_URL;

  page = signal(1);
  page_size = signal(5);

  // Cache busting parameter to force fresh requests
  refresh_timestamp = signal(Date.now());

  solutions_resource = httpResource<ListSolutionsResponse>(
    () => `${this.base_url}.subscription.list_saas_application?page=${this.page()}&page_size=${this.page_size()}&_t=${this.refresh_timestamp()}`,
    { defaultValue: {} }
  );

  selected_solution = signal<String>('');

  plans_resource = httpResource<ListPlanResponse>(
    () => `${this.base_url}.subscription.list_plans?application=${this.selected_solution()}&page=${this.page()}&page_size=${this.page_size()}&_t=${this.refresh_timestamp()}`,
    { defaultValue: {} }
  );

  // Method to refresh solutions data
  refreshSolutions() {
    this.refresh_timestamp.set(Date.now()); // Update timestamp to force fresh request
  }

  // Method to refresh plans data
  refreshPlans() {
    this.refresh_timestamp.set(Date.now()); // Update timestamp to force fresh request
  }

}
