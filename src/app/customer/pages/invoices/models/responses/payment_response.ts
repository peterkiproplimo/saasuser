export type PaymentResponse = {
  status?:  number;
  message?: string;
  data?:    PaymentData;
}

export type PaymentData = {
  payment_type?:      string;
  payment_url?:       string;
  reference?:         string;
  order_tracking_id?: string;
  status?:            string;
}
