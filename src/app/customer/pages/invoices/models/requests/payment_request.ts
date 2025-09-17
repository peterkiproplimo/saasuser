export interface PaymentRequest {
  invoice_name: string;
  payment_amount: number;
  payment_mode: string;
  customer_email: string;
  customer_phone: string;
  domain?: string;
}
