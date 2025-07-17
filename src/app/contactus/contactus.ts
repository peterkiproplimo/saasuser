import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { ContactUsService } from './contactus.service';
import { ContactUsPayload } from './contactus.model';
import { ContactFeedbackDialogComponent } from './contact-feedback-dialog.component';

@Component({
  selector: 'app-contactus',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsModule,
    ReactiveFormsModule,
    ContactFeedbackDialogComponent,
  ],
  templateUrl: './contactus.html',
  styleUrls: ['./contactus.scss'],
})
export class ContactUsComponent implements OnInit {
  form!: FormGroup;
  captchaQuestion = '';
  captchaToken = '';

  showDialog = false;
  dialogMessage = '';
  dialogSuccess = false;
  isSubmitted = false;

  center: google.maps.LatLngLiteral = { lat: -1.2678, lng: 36.805 };
  zoom = 15;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPosition: google.maps.LatLngLiteral = this.center;

  constructor(
    private fb: FormBuilder,
    private contactUsService: ContactUsService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      persona_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', Validators.required],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      captcha_answer: ['', Validators.required],
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
        this.dialogSuccess = false;
        this.dialogMessage = 'Failed to load CAPTCHA. Please try again.';
        this.showDialog = true;
      },
    });
  }

  submitForm(): void {
    this.isSubmitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: ContactUsPayload = {
      ...this.form.value,
      token: this.captchaToken,
    };

    this.contactUsService.sendMessage(payload).subscribe({
      next: () => {
        this.dialogSuccess = true;
        this.dialogMessage = '✅ Your message was sent successfully!';
        this.showDialog = true;
        this.form.reset();
        this.getCaptcha();
      },
      error: () => {
        this.dialogSuccess = false;
        this.dialogMessage =
          'Failed to send message. Check CAPTCHA or try again.';
        this.showDialog = true;
      },
    });
  }
}
