// contactus.model.ts
export interface CaptchaResponse {
  status: number;
  message: string;
  question: string;
  token: string;
}

export interface ContactUsPayload {
  persona_name: string;
  email: string;
  phone_number: string;
  subject: string;
  message: string;
  captcha_answer: string;
  token: string;
}

export interface ContactUsSuccessResponse {
  status: number;
  message: string;
}
