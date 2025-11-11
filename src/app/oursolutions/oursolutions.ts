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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FreeTrialStepperComponent } from './components/free-trial-stepper/free-trial-stepper.component';

@Component({
  selector: 'app-oursolutions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProgressSpinnerModule,
    DialogModule,
    ReactiveFormsModule,
    ToastModule,
    FreeTrialStepperComponent,
  ],
  providers: [MessageService],
  templateUrl: './oursolutions.html',
  styleUrls: ['./oursolutions.scss'],
})
export class OursolutionsComponent implements OnInit {
  // ▶ injections
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private cd = inject(ChangeDetectorRef);
  private destroy = inject(DestroyRef);
  private messageService = inject(MessageService);

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
  captchaLoading = false;

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
  showTrialStepper = false; // Show free trial stepper instead of dialog

  openRequestTrial(): void {
    console.log('Opening free trial stepper...', this.solutionData);
    this.showTrialStepper = true;
    this.cd.detectChanges();
  }

  closeRequestTrial(): void {
    this.showTrialStepper = false;
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
    this.captchaLoading = true;
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
          this.captchaLoading = false;
          this.cd.detectChanges();
        },
        error: (error) => {
          this.captchaLoading = false;
          this.messageService.add({
            severity: 'warn',
            summary: 'CAPTCHA Error',
            detail: 'Could not load CAPTCHA. Please try again.',
            life: 3000
          });
          // Retry loading CAPTCHA after 2 seconds
          setTimeout(() => {
            this.fetchCaptcha();
          }, 2000);
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
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill all required fields.',
        life: 5000
      });
      return;
    }

    if (!this.demoForm.captcha_answer) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please answer the CAPTCHA.',
        life: 5000
      });
      return;
    }

    // Combine demo_date and demo_time into single datetime string
    // Format: "YYYY-MM-DD HH:MM:SS"
    const combinedDateTime = this.combineDateTime(
      this.demoForm.demo_date,
      this.demoForm.demo_time
    );

    if (!combinedDateTime) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please select both date and time for the demo.',
        life: 5000
      });
      return;
    }

    // Map demo_type: "Online Demo" -> "Online", "Onsite Demo" -> "Onsite"
    const demoType = this.demoForm.demo_type === 'Online Demo'
      ? 'Online'
      : this.demoForm.demo_type === 'Onsite Demo'
        ? 'Onsite'
        : this.demoForm.demo_type;

    // Prepare request payload matching API specification
    const demoRequest = {
      customer_name: this.demoForm.customer_name.trim(),
      email: this.demoForm.email.trim(),
      phone: this.demoForm.phone.trim(),
      application_name: this.demoForm.application_name.trim(),
      demo_type: demoType,
      demo_date: combinedDateTime,
      status: this.demoForm.status || 'Open',
      notes: this.demoForm.notes?.trim() || '',
      captcha_answer: this.demoForm.captcha_answer.trim(),
      token: this.demoForm.token
    };

    // send API request
    this.http
      .post(`${this.base_url}.demo.create_demo_booking`, demoRequest)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (response: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response?.message?.message || 'Demo request sent successfully! Our team will contact you soon.',
            life: 5000
          });
          this.closeRequestDemo(); // reset + close
        },
        error: (error) => {
          this.handleApiError(error, 'Failed to submit demo request');
        },
      });
  }

  /**
   * Combine date and time into "YYYY-MM-DD HH:MM:SS" format
   */
  private combineDateTime(date: string, time: string): string | null {
    if (!date || !time) {
      return null;
    }

    // date is in format "YYYY-MM-DD", time is in format "HH:MM"
    // Combine to "YYYY-MM-DD HH:MM:SS"
    return `${date} ${time}:00`;
  }

  /* ------------------------- error handling -------------------------- */
  private handleApiError(error: any, defaultMessage: string): void {
    let errorMessage = defaultMessage;
    let errorCode = error?.status || 'Unknown';

    // Check if it's a ValidationError (API not implemented)
    if (error?.error?.exception?.includes('ValidationError') ||
      error?.error?.exception?.includes('No module named')) {
      errorCode = 417;
      errorMessage = 'Error 417: API not found. Check on frappe logs.';
    } else if (error?.status === 417) {
      errorCode = 417;
      errorMessage = 'Error 417: API not found.';
    } else if (error?.error?.message) {
      errorMessage = `Error ${errorCode}: ${error.error.message}`;
    } else if (error?.error?.exc) {
      // Try to extract a meaningful error message
      const excMatch = error.error.exc.match(/ValidationError: (.+?)\\n/);
      if (excMatch) {
        errorMessage = `Error ${errorCode}: ${excMatch[1]}`;
      } else {
        errorMessage = `Error ${errorCode}: ${defaultMessage}`;
      }
    } else {
      errorMessage = `Error ${errorCode}: ${defaultMessage}`;
    }

    this.messageService.add({
      severity: 'error',
      summary: `Error ${errorCode}`,
      detail: errorMessage,
      life: 7000
    });
  }

  /* ------------------------- utils -------------------------- */
  get imageUrl(): string | null {
    return this.solutionData?.app_logo
      ? `https://saas.Techsavanna.technology${this.solutionData.app_logo}`
      : null;
  }
}
