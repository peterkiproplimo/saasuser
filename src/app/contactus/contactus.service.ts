// contactus.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import {
  CaptchaResponse,
  ContactUsPayload,
  ContactUsSuccessResponse,
} from './contactus.model';

@Injectable({ providedIn: 'root' })
export class ContactUsService {
  private http = inject(HttpClient);
  private baseUrl = environment.BASE_URL;

  generateCaptcha(): Observable<CaptchaResponse> {
    return this.http.get<CaptchaResponse>(`${this.baseUrl}.contact_us.generate_captcha`);
  }

  sendMessage(payload: ContactUsPayload): Observable<ContactUsSuccessResponse> {
    return this.http.post<ContactUsSuccessResponse>(
      `${this.baseUrl}.contact_us.create_contact_us`,
      payload
    );
  }
}
