import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { ContactUsService } from './contactus.service';
import { ContactUsPayload } from './contactus.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ContactFeedbackDialogComponent } from './contact-feedback-dialog.component';

@Component({
  selector: 'app-contactus',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsModule,
    ReactiveFormsModule,
    MatDialogModule,
    ContactFeedbackDialogComponent
  ],
  templateUrl: './contactus.html',
  styleUrls: ['./contactus.scss']
})
export class ContactUsComponent implements OnInit {
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private contactUsService = inject(ContactUsService);

  form!: FormGroup;
  captchaQuestion = '';
  captchaToken = '';

  center: google.maps.LatLngLiteral = { lat: -1.2678, lng: 36.8050 };
  zoom = 15;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPosition: google.maps.LatLngLiteral = this.center;

  ngOnInit(): void {
    this.form = this.fb.group({
      persona_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', Validators.required],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      captcha_answer: ['', Validators.required]
    });

    this.getCaptcha();
  }

  getCaptcha(): void {
    this.contactUsService.generateCaptcha().subscribe({
      next: (res) => {
        this.captchaQuestion = res.question;
        this.captchaToken = res.token;
      },
      error: () => {
        this.dialog.open(ContactFeedbackDialogComponent, {
          data: {
            success: false,
            message: 'Failed to load CAPTCHA. Please try again.'
          }
        });
      }
    });
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: ContactUsPayload = {
      ...this.form.value,
      token: this.captchaToken
    };

    this.contactUsService.sendMessage(payload).subscribe({
      next: () => {
        this.dialog.open(ContactFeedbackDialogComponent, {
          data: {
            success: true,
            message: '✅ Your message was sent successfully!'
          }
        });
        this.form.reset();
        this.getCaptcha();
      },
      error: (err) => {
        console.error('Submission failed:', err);
        this.dialog.open(ContactFeedbackDialogComponent, {
          data: {
            success: false,
            message: 'Failed to send message. Check CAPTCHA or try again.'
          }
        });
      }
    });
  }
}
