import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { delay, Observable, of, throwError } from 'rxjs';

// Generate unique ID (no external dependency)
function generateId(): string {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) + '-' + Math.random().toString(36).slice(2);
}

type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  currency: 'KES' | 'USD';
  features: string[];
};

type PartnerProduct = {
  id: string;
  partner_id: string;
  name: string;
  description: string;
  category?: string;
  logo?: string;
  subscription_plans: SubscriptionPlan[];
  created_at: string;
  updated_at: string;
};

type Partner = {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company_name: string;
  phone: string;
  business_number: string;
  logo?: string;
  contact_info?: {
    address?: string;
    city?: string;
    country?: string;
    website?: string;
  };
  created_at: string;
  updated_at: string;
};

const delayMs = 350;

function jsonOk<T>(body: T, status = 200): Observable<HttpEvent<T>> {
  return of(new HttpResponse({ status, body })).pipe(delay(delayMs));
}
function jsonError<T>(status: number, message: string): Observable<HttpEvent<T>> {
  return throwError(() => ({ status, error: { message } }));
}

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) as T : fallback;
}
function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const partnerApiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const { url, method, body } = req;
  if (!url.startsWith('/api/partner')) {
    return next(req);
  }

  // Storage keys
  const PARTNERS = 'partners';
  const CURRENT = 'current_partner';
  const TOKEN = 'partner_token';
  const PRODUCTS = 'partner_products';

  // Auth helpers
  const getCurrent = (): Partner | null => {
    const raw = localStorage.getItem(CURRENT);
    return raw ? JSON.parse(raw) as Partner : null;
  };

  // Routes
  // POST /api/partner/signup
  if (url.endsWith('/api/partner/signup') && method === 'POST') {
    const partners = read<Partner[]>(PARTNERS, []);
    const exists = partners.some(p => p.email === (body as any).email);
    if (exists) return jsonError(409, 'Email already registered');
    const now = new Date().toISOString();
    const partner: Partner = {
      id: generateId(),
      created_at: now,
      updated_at: now,
      ...(body as any)
    };
    partners.push(partner);
    write(PARTNERS, partners);
    return jsonOk({ success: true, message: 'Registered' });
  }

  // POST /api/partner/login
  if (url.endsWith('/api/partner/login') && method === 'POST') {
    const partners = read<Partner[]>(PARTNERS, []);
    const { email, password } = body as any;
    const partner = partners.find(p => p.email === email && p.password === password);
    if (!partner) return jsonError(401, 'Invalid email or password');
    const token = generateId();
    write(CURRENT, partner);
    localStorage.setItem(TOKEN, token);
    return jsonOk({ success: true, partner, token });
  }

  // POST /api/partner/logout
  if (url.endsWith('/api/partner/logout') && method === 'POST') {
    localStorage.removeItem(CURRENT);
    localStorage.removeItem(TOKEN);
    return jsonOk({ success: true });
  }

  // GET /api/partner/me
  if (url.endsWith('/api/partner/me') && method === 'GET') {
    const me = getCurrent();
    if (!me) return jsonError(401, 'Not authenticated');
    return jsonOk({ partner: me });
  }

  // POST /api/partner/check-email
  if (url.endsWith('/api/partner/check-email') && method === 'POST') {
    const partners = read<Partner[]>(PARTNERS, []);
    const { email } = body as any;
    const exists = partners.some(p => p.email === email);
    return jsonOk({ exists });
  }

  // POST /api/partner/forgot-password
  if (url.endsWith('/api/partner/forgot-password') && method === 'POST') {
    const partners = read<Partner[]>(PARTNERS, []);
    const { email } = body as any;
    const partner = partners.find(p => p.email === email);
    if (!partner) {
      // Don't reveal if email exists for security
      return jsonOk({ success: true, message: 'If the email exists, reset instructions have been sent.' });
    }
    // In production, send email with reset token
    return jsonOk({ success: true, message: 'Password reset instructions have been sent to your email.' });
  }

  // POST /api/partner/reset-password
  if (url.endsWith('/api/partner/reset-password') && method === 'POST') {
    const { token, newPassword } = body as any;
    // In production, validate token and update password
    const partners = read<Partner[]>(PARTNERS, []);
    // Mock: accept any token for demo
    return jsonOk({ success: true, message: 'Password has been reset successfully.' });
  }

  // Products CRUD
  if (url.endsWith('/api/partner/products') && method === 'GET') {
    const me = getCurrent();
    if (!me) return jsonError(401, 'Not authenticated');
    const products = read<PartnerProduct[]>(PRODUCTS, []).filter(p => p.partner_id === me.id);
    return jsonOk(products);
  }

  if (url.endsWith('/api/partner/products') && method === 'POST') {
    const me = getCurrent();
    if (!me) return jsonError(401, 'Not authenticated');
    const now = new Date().toISOString();
    const products = read<PartnerProduct[]>(PRODUCTS, []);
    const product: PartnerProduct = {
      id: generateId(),
      partner_id: me.id,
      created_at: now,
      updated_at: now,
      name: (body as any).name,
      description: (body as any).description,
      category: (body as any).category,
      logo: (body as any).logo,
      subscription_plans: ((body as any).subscription_plans || []).map((pl: any) => ({
        id: generateId(),
        name: pl.name,
        price: Number(pl.price || 0),
        currency: (pl.currency || 'KES'),
        features: Array.isArray(pl.features) ? pl.features : []
      }))
    };
    products.push(product);
    write(PRODUCTS, products);
    return jsonOk(product, 201);
  }

  const productIdMatch = url.match(/\/api\/partner\/products\/([^\/]+)$/);
  if (productIdMatch) {
    const id = productIdMatch[1];
    const me = getCurrent();
    if (!me) return jsonError(401, 'Not authenticated');
    const products = read<PartnerProduct[]>(PRODUCTS, []);
    const idx = products.findIndex(p => p.id === id && p.partner_id === me.id);
    if (idx === -1) return jsonError(404, 'Product not found');

    if (method === 'GET') {
      return jsonOk(products[idx]);
    }
    if (method === 'PUT') {
      const now = new Date().toISOString();
      const updated = {
        ...products[idx],
        ...(body as any),
        updated_at: now
      };
      products[idx] = updated;
      write(PRODUCTS, products);
      return jsonOk(updated);
    }
    if (method === 'DELETE') {
      products.splice(idx, 1);
      write(PRODUCTS, products);
      return jsonOk({ success: true });
    }
  }

  // GET /api/partner/clients
  if (url.endsWith('/api/partner/clients') && method === 'GET') {
    const me = getCurrent();
    if (!me) return jsonError(401, 'Not authenticated');
    // Mock client data
    const mockClients = [
      {
        id: generateId(),
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Corp',
        subscription_plan: 'Pro Plan',
        product_name: 'Cloud Storage Pro',
        status: 'active',
        subscription_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        monthly_revenue: 5000,
        currency: 'KES'
      },
      {
        id: generateId(),
        name: 'Jane Smith',
        email: 'jane@example.com',
        company: 'Tech Solutions',
        subscription_plan: 'Enterprise',
        product_name: 'Cloud Storage Pro',
        status: 'active',
        subscription_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        monthly_revenue: 15000,
        currency: 'KES'
      },
      {
        id: generateId(),
        name: 'Bob Johnson',
        email: 'bob@example.com',
        company: 'Startup Inc',
        subscription_plan: 'Basic',
        product_name: 'Cloud Storage Pro',
        status: 'trial',
        subscription_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        monthly_revenue: 0,
        currency: 'KES'
      }
    ];
    return jsonOk(mockClients);
  }

  // Analytics
  if (url.endsWith('/api/partner/analytics/summary') && method === 'GET') {
    const me = getCurrent();
    if (!me) return jsonError(401, 'Not authenticated');
    const products = read<PartnerProduct[]>(PRODUCTS, []).filter(p => p.partner_id === me.id);
    const total_products = products.length;
    // Calculate dummy metrics for demo
    const total_views = products.reduce((sum, p) => sum + Math.floor(Math.random() * 1000) + 100, 0);
    const total_subscriptions = products.reduce((sum, p) => {
      return sum + p.subscription_plans.reduce((planSum, plan) => planSum + Math.floor(Math.random() * 50) + 5, 0);
    }, 0);
    const total_revenue = products.reduce((sum, p) => {
      return sum + p.subscription_plans.reduce((planSum, plan) => {
        const subscriptions = Math.floor(Math.random() * 50) + 5;
        return planSum + (plan.price * subscriptions);
      }, 0);
    }, 0);
    return jsonOk({
      total_products,
      total_views,
      total_subscriptions,
      total_revenue,
      currency: 'KES'
    });
  }

  return next(req);
};

