import {Component, computed, inject, signal} from '@angular/core';
import {SolutionsService} from '../../services/solutions-service';
import {SolutionCard} from '../solution-card/solution-card';

@Component({
  selector: 'app-solution-list',
  imports: [
    SolutionCard
  ],
  templateUrl: './solution-list.html',
  styleUrl: './solution-list.scss'
})
export class SolutionList {

  solutions_service = inject(SolutionsService);

  pageNum = this.solutions_service.page;
  pageSize = this.solutions_service.page_size;
  first = signal<number>(0);

  solutions = this.solutions_service.solutions_resource.value;
  is_loading = this.solutions_service.solutions_resource.isLoading;
  is_error = this.solutions_service.solutions_resource.error;
  totalRecords = computed(() => this.solutions().pagination?.total_records ?? 0);

}
