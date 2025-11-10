export interface Partner {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  first_name: string;
  last_name: string;
  company_name: string;
  phone: string;
  logo?: string; // Base64 or URL
  business_number: string; // KYC document - Business number in Kenya
  contact_info?: {
    address?: string;
    city?: string;
    country?: string;
    website?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PartnerProduct {
  id: string;
  partner_id: string;
  name: string;
  description: string;
  logo?: string; // Base64 or URL
  subscription_plans: SubscriptionPlan[];
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features?: string[];
}

export interface PartnerInsights {
  total_products: number;
  total_views: number;
  total_subscriptions: number;
  total_revenue: number;
  currency: string;
}




