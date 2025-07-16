import {
  Component,
  inject,
  OnInit,
  DestroyRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-oursolutions',
  standalone: true,
  imports: [CommonModule, FormsModule, ProgressSpinnerModule, DialogModule],
  templateUrl: './oursolutions.html',
  styleUrls: ['./oursolutions.scss'],
})
export class OursolutionsComponent implements OnInit {
  // ▶ injections
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private cd = inject(ChangeDetectorRef);
  private destroy = inject(DestroyRef);

  // ▶ state
  base_url = environment.BASE_URL;
  solutionData: any = null;
  isLoading = true;
  hasError = false;
  showRequestDialog = false;

  // ▶ CAPTCHA
  captchaQuestion = '';

  // ▶ demo form payload
  demoForm = {
    customer_name: '',
    email: '',
    phone: '',
    application_name: '',
    demo_type: '',
    demo_date: '',
    status: 'Open',
    notes: '',
    captcha_answer: '',
    token: '', // set when we fetch CAPTCHA
  };

  /* --------------------------- lifecycle --------------------------- */
  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.fetchSolutionData(id);
        }
      });
  }

  /* --------------------------- API calls -------------------------- */
  private fetchSolutionData(id: string) {
    this.isLoading = true;
    this.http
      .get<{ data: any }>(
        `${this.base_url}.subscription.get_saas_application_by_id`,
        { params: new HttpParams().set('app_id', id) }
      )
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (res) => {
          this.solutionData = res.data;
          this.isLoading = false;
          this.cd.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.hasError = true;
          this.cd.detectChanges();
        },
      });
  }

  /** GET /demo.generate_captcha */
  private fetchCaptcha() {
    this.captchaQuestion = '';
    this.demoForm.captcha_answer = '';
    this.demoForm.token = '';

    this.http
      .get<{
        status: number;
        question: string;
        token: string;
      }>(`${this.base_url}.demo.generate_captcha`)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (res) => {
          this.captchaQuestion = res.question;
          this.demoForm.token = res.token;
          this.cd.detectChanges();
        },
        error: () => {
          alert('Could not load CAPTCHA. Please try again.');
          this.closeRequestDemo();
        },
      });
  }

  /* ----------------------- dialog helpers ------------------------- */
  openRequestDemo(): void {
    this.demoForm = {
      ...this.demoForm,
      application_name: this.solutionData?.name || '',
    };
    this.showRequestDialog = true;
    this.fetchCaptcha(); // 👈 fetch new CAPTCHA each open
  }

  closeRequestDemo(): void {
    this.showRequestDialog = false;
  }

  /* ------------------------- form submit -------------------------- */
  submitDemoRequest(): void {
    if (!this.demoForm.captcha_answer) {
      alert('Please answer the CAPTCHA.');
      return;
    }

    this.http
      .post(`${this.base_url}demo/submit_request`, this.demoForm)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          alert('✅ Demo request sent!');
          this.closeRequestDemo();
        },
        error: () => {
          alert('❌ Failed to submit demo request.');
        },
      });
  }

  /* ------------------------- utils -------------------------- */
  get imageUrl(): string | null {
    return this.solutionData?.app_logo
      ? `https://saas.techsavanna.technology${this.solutionData.app_logo}`
      : null;
  }
}
