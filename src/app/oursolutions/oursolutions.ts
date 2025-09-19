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
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-oursolutions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProgressSpinnerModule,
    DialogModule,
    ReactiveFormsModule,
  ],
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
  submitted = false;
  feature = '';

  // ▶ CAPTCHA
  captchaQuestion = '';

  // ▶ demo form payload
  demoForm = this.getEmptyForm();

  /** Utility: create a fresh demo form */
  private getEmptyForm() {
    return {
      customer_name: '',
      email: '',
      phone: '',
      application_name: '',
      demo_type: '',
      demo_date: '',
      demo_time: '',
      status: 'Open',
      notes: '',
      captcha_answer: '',
      token: '',
    };
  }

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

  // ▶ state
  showTrialDialog = false; // 👈 add this

  // ▶ trial form payload
  trialForm = {
    customer_name: '',
    email: '',
    phone: '',
    company: '',
    application_name: '',
    status: 'Pending',
    notes: '',
  };

  openRequestTrial(): void {
    this.trialForm = {
      ...this.trialForm,
      application_name: this.solutionData?.name || '',
    };
    this.showTrialDialog = true;
  }

  closeRequestTrial(): void {
    this.showTrialDialog = false;
  }

  submitTrialRequest(): void {
    this.http
      .post(`${this.base_url}.trial.create_trial_request`, this.trialForm)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          alert('✅ Free Trial request sent!');
          this.closeRequestTrial();
        },
        error: () => {
          alert('❌ Failed to submit free trial request.');
        },
      });
  }

  /* --------------------------- API calls -------------------------- */
  fetchSolutionData(id: string) {
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
  fetchCaptcha() {
    this.captchaQuestion = '';
    this.demoForm.captcha_answer = '';
    this.demoForm.token = '';

    this.http
      .get<{ status: number; question: string; token: string }>(
        `${this.base_url}.demo.generate_captcha`
      )
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

  /* ------------------------- dialog handlers -------------------------- */
  openRequestDemo(): void {
    this.demoForm = this.getEmptyForm();
    this.demoForm.application_name = this.solutionData?.name || '';
    this.showRequestDialog = true;
    this.fetchCaptcha();
  }

  closeRequestDemo(): void {
    this.showRequestDialog = false;
    this.submitted = false;
    this.demoForm = this.getEmptyForm();
  }

  clearDateTimeSelection(): void {
    this.demoForm.demo_date = '';
    this.demoForm.demo_time = '';
  }

  /* ------------------------- form submit -------------------------- */
  submitDemoRequest(): void {
    this.submitted = true;

    // validate required fields
    const requiredFields = [
      'customer_name',
      'email',
      'phone',
      'application_name',
      'demo_type',
      'demo_date',
      'demo_time',
      'captcha_answer',
    ];
    const missing = requiredFields.filter(
      (key) => !(this.demoForm[key as keyof typeof this.demoForm] || '').trim()
    );
    if (missing.length) {
      alert('Please fill all required fields.');
      return;
    }

    if (!this.demoForm.captcha_answer) {
      alert('Please answer the CAPTCHA.');
      return;
    }

    // send API request
    this.http
      .post(`${this.base_url}.demo.create_demo_booking`, this.demoForm)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          alert('✅ Demo request sent!');
          this.closeRequestDemo(); // reset + close
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
