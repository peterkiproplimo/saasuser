import {
  Component,
  inject,
  OnInit,
  DestroyRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-oursolutions',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './oursolutions.html',
  styleUrls: ['./oursolutions.scss'],
})
export class OursolutionsComponent implements OnInit {
  // ✅ Inject services
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private destroy = inject(DestroyRef);
  private cd = inject(ChangeDetectorRef);

  // ✅ State vars
  base_url = environment.BASE_URL;
  solutionData: any = null;
  isLoading = true;
  hasError = false;

  ngOnInit(): void {
    // ✅ Prefer snapshot to avoid delay
    const id = this.route.snapshot.paramMap.get('id');
    console.log('📦 Route param (app name):', id);

    if (!id) return;
    this.fetchSolutionData(id);
  }

  fetchSolutionData(id: string): void {
    this.isLoading = true;
    this.hasError = false;

    const query = new HttpParams().set('app_id', id);
    this.http
      .get<{ data: any }>(
        `${this.base_url}.subscription.get_saas_application_by_id`,
        { params: query }
      )
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (res) => {
          this.solutionData = res.data;
          this.isLoading = false;
          console.log('✅ Loaded from API:', this.solutionData);
          this.cd.detectChanges(); // Ensure immediate view update
        },
        error: (err) => {
          console.error('❌ Failed to fetch:', err);
          this.isLoading = false;
          this.hasError = true;
          this.cd.detectChanges();
        },
      });
  }

  get imageUrl(): string | null {
    return this.solutionData?.app_logo
      ? `https://saas.techsavanna.technology${this.solutionData.app_logo}`
      : null;
  }
}
