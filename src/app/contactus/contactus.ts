import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-contactus',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, ReactiveFormsModule],
  templateUrl: './contactus.html',
  styleUrls: ['./contactus.scss']
})
export class ContactUsComponent implements OnInit {
  center: google.maps.LatLngLiteral = { lat: -1.2678, lng: 36.8050 };
  zoom = 15;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPosition: google.maps.LatLngLiteral = this.center;

  form!: FormGroup;
  captchaQuestion = '';
  captchaToken = '';

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      persona_name: [''],
      email: [''],
      phone_number: [''],
      subject: [''],
      message: [''],
      captcha_answer: ['']
    });

    this.getCaptcha();
  }

  getCaptcha(): void {
    this.http.get<any>('https://saas.techsavanna.technology/api/method/saas.apis.contact_us.generate_captcha')
      .subscribe((res) => {
        this.captchaQuestion = res.question;
        this.captchaToken = res.token;
      });
  }

  submitForm(): void {
    if (this.form.invalid) return;

    const payload = {
      ...this.form.value,
      token: this.captchaToken
    };

    this.http.post('https://saas.techsavanna.technology/api/method/saas.apis.contact_us.create_contact_us', payload)
      .subscribe({
        next: () => {
          alert('Message sent successfully!');
          this.form.reset();
          this.getCaptcha(); // refresh captcha
        },
        error: (err) => {
          console.error(err);
          alert('Failed to send message.');
        }
      });
  }
}
