import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SolutionService } from '../shared/components/navbar/services/navbar.service';

@Component({
  selector: 'app-oursolutions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oursolutions.html',
  styleUrls: ['./oursolutions.scss'],
})
export class OursolutionsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private subSvc = inject(SolutionService);

  solutionData: any = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id')!;

      // Check router state for passed data
      const navigation = this.router.getCurrentNavigation();
      const stateData = navigation?.extras?.state as { solutionData: any };

      if (stateData?.solutionData) {
        this.solutionData = stateData.solutionData;
      } else {
        // fallback: find from service
        const allData = this.subSvc.subscription_resource.value()?.data ?? [];

        this.solutionData = allData.find(sol => {
          const slug = sol.name?.toLowerCase().replace(/\s+/g, '-');
          return slug === id;
        });
      }
    });
    
  }
  get imageUrl(): string | null {
  if (!this.solutionData?.app_logo) return null;
  return 'https://saas.techsavanna.technology' + this.solutionData.app_logo;
}

}
