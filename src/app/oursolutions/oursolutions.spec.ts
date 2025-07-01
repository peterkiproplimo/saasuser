import { Component, inject, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SolutionService } from '../shared/components/navbar/services/navbar.service';

@Component({
  selector: 'app-oursolutions',
  templateUrl: './oursolutions.html',
  styleUrls: ['./oursolutions.scss'],
})
export class OursolutionsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private subSvc = inject(SolutionService);

  solutionData: any = null;
  solutionId: string = '';

  ngOnInit(): void {
    this.solutionId = this.route.snapshot.paramMap.get('id')!;
    
    const navigation = this.router.getCurrentNavigation();
    const stateData = navigation?.extras?.state as { solutionData: any };
    if (stateData?.solutionData) {
      this.solutionData = stateData.solutionData;
      console.log('✅ Got data from router state:', this.solutionData);
    } else {
      // Fallback to service
      const data = this.subSvc.subscription_resource.value()?.data ?? [];
      this.solutionData = data.find(sol => {
        const slug = sol.name?.toLowerCase().replace(/\s+/g, '-');
        return slug === this.solutionId;
      });
      console.log('🔁 Fallback matched data:', this.solutionData);
    }
  }
}
