# Partner API Documentation

This document describes the API endpoints consumed by the Partner module in the SaaS application. The frontend currently uses a mock HTTP interceptor (`partner-api.interceptor.ts`) that simulates these endpoints. The backend team should implement these endpoints to match the specifications below.

## Base URL

All partner API endpoints are prefixed with `/api/partner`

## Authentication

Most endpoints require authentication. The frontend stores the partner token in `localStorage` under the key `partner_token` and includes it in the `Authorization` header as `Bearer {token}`.

**Note:** The current mock implementation uses localStorage for session management. The backend should implement proper JWT or session-based authentication.

---

## Authentication Endpoints

### 1. Partner Signup

Register a new partner account.

**Endpoint:** `POST /api/partner/signup`

**Request Body:**
```json
{
  "email": "string (required, unique)",
  "password": "string (required, min 6 characters)",
  "first_name": "string (required)",
  "last_name": "string (required)",
  "company_name": "string (required)",
  "phone": "string (required)",
  "business_number": "string (required)",
  "logo": "string (optional, base64 or URL)",
  "contact_info": {
    "address": "string (optional)",
    "city": "string (optional)",
    "country": "string (optional, default: 'Kenya')",
    "website": "string (optional, URL)"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Registration successful"
}
```

**Error Responses:**
- `409 Conflict`: Email already registered
  ```json
  {
    "status": 409,
    "error": {
      "message": "Email already registered"
    }
  }
  ```

**Frontend Usage:**
```typescript
// File: partner-auth.service.ts
register(partnerData: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Observable<{ success: boolean; message: string }> {
  return this.http.post<{ success: boolean; message: string }>('/api/partner/signup', partnerData);
}
```

---

### 2. Partner Login

Authenticate a partner and receive a session token.

**Endpoint:** `POST /api/partner/login`

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "partner": {
    "id": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "company_name": "string",
    "phone": "string",
    "business_number": "string",
    "logo": "string (optional)",
    "contact_info": {
      "address": "string (optional)",
      "city": "string (optional)",
      "country": "string (optional)",
      "website": "string (optional)"
    },
    "created_at": "ISO 8601 datetime string",
    "updated_at": "ISO 8601 datetime string"
  },
  "token": "string (JWT or session token)"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
  ```json
  {
    "status": 401,
    "error": {
      "message": "Invalid email or password"
    }
  }
  ```

**Frontend Usage:**
```typescript
// File: partner-auth.service.ts
login(email: string, password: string): Observable<{ success: boolean; partner: Partner; token: string }> {
  return this.http.post<{ success: boolean; partner: Partner; token: string }>('/api/partner/login', { email, password }).pipe(
    tap(res => {
      localStorage.setItem('current_partner', JSON.stringify(res.partner));
      localStorage.setItem('partner_token', res.token);
    })
  );
}
```

---

### 3. Partner Logout

Logout the current partner and invalidate the session.

**Endpoint:** `POST /api/partner/logout`

**Headers:**
- `Authorization: Bearer {token}` (required)

**Success Response (200):**
```json
{
  "success": true
}
```

**Frontend Usage:**
```typescript
// File: partner-auth.service.ts
logout(): void {
  this.http.post('/api/partner/logout', {}).subscribe({
    next: () => {
      localStorage.removeItem('current_partner');
      localStorage.removeItem('partner_token');
      this.router.navigate(['/partner/login']);
    }
  });
}
```

---

### 4. Get Current Partner

Get the authenticated partner's profile information.

**Endpoint:** `GET /api/partner/me`

**Headers:**
- `Authorization: Bearer {token}` (required)

**Success Response (200):**
```json
{
  "partner": {
    "id": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "company_name": "string",
    "phone": "string",
    "business_number": "string",
    "logo": "string (optional)",
    "contact_info": {
      "address": "string (optional)",
      "city": "string (optional)",
      "country": "string (optional)",
      "website": "string (optional)"
    },
    "created_at": "ISO 8601 datetime string",
    "updated_at": "ISO 8601 datetime string"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
  ```json
  {
    "status": 401,
    "error": {
      "message": "Not authenticated"
    }
  }
  ```

---

### 5. Check Email Exists

Check if an email address is already registered. Used for real-time email validation during signup.

**Endpoint:** `POST /api/partner/check-email`

**Request Body:**
```json
{
  "email": "string (required, valid email format)"
}
```

**Success Response (200):**
```json
{
  "exists": "boolean (true if email is already registered, false otherwise)"
}
```

**Frontend Usage:**
```typescript
// File: partner-auth.service.ts
checkEmailExists(email: string): Observable<boolean> {
  return this.http.post<{ exists: boolean }>('/api/partner/check-email', { email }).pipe(
    map(res => res.exists)
  );
}
```

**Used In:**
- Partner Signup Form (`partner-signup.component.ts`) - Async validator for email field

---

### 6. Forgot Password

Request password reset instructions. The backend should send a password reset email with a token.

**Endpoint:** `POST /api/partner/forgot-password`

**Request Body:**
```json
{
  "email": "string (required, valid email format)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, reset instructions have been sent."
}
```

**Note:** For security reasons, always return the same success message regardless of whether the email exists. This prevents email enumeration attacks.

**Frontend Usage:**
```typescript
// File: partner-auth.service.ts
forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
  return this.http.post<{ success: boolean; message: string }>('/api/partner/forgot-password', { email });
}
```

**Used In:**
- Partner Forgot Password Component (`partner-forgot-password.component.ts`)

---

### 7. Reset Password

Reset password using a token received via email.

**Endpoint:** `POST /api/partner/reset-password`

**Request Body:**
```json
{
  "token": "string (required, password reset token from email)",
  "newPassword": "string (required, min 6 characters)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully."
}
```

**Error Responses:**
- `400 Bad Request`: Invalid or expired token
  ```json
  {
    "status": 400,
    "error": {
      "message": "Invalid or expired reset token"
    }
  }
  ```

**Frontend Usage:**
```typescript
// File: partner-auth.service.ts
resetPassword(token: string, newPassword: string): Observable<{ success: boolean; message: string }> {
  return this.http.post<{ success: boolean; message: string }>('/api/partner/reset-password', { token, newPassword });
}
```

**Backend Implementation Notes:**
- Validate the reset token (check expiration, single-use, etc.)
- Hash the new password before storing
- Invalidate the token after successful reset
- Consider rate limiting to prevent abuse

---

## Product Management Endpoints

### 8. Get All Products

Get all products for the authenticated partner.

**Endpoint:** `GET /api/partner/products`

**Headers:**
- `Authorization: Bearer {token}` (required)

**Success Response (200):**
```json
[
  {
    "id": "string",
    "partner_id": "string",
    "name": "string",
    "description": "string",
    "category": "string (optional)",
    "logo": "string (optional, base64 or URL)",
    "subscription_plans": [
      {
        "id": "string",
        "name": "string",
        "price": "number",
        "currency": "KES | USD",
        "features": ["string"]
      }
    ],
    "created_at": "ISO 8601 datetime string",
    "updated_at": "ISO 8601 datetime string"
  }
]
```

**Frontend Usage:**
```typescript
// File: partner-product.service.ts
getProducts(): Observable<PartnerProduct[]> {
  return this.http.get<PartnerProduct[]>('/api/partner/products');
}
```

---

### 9. Get Product by ID

Get a specific product by its ID.

**Endpoint:** `GET /api/partner/products/{id}`

**Headers:**
- `Authorization: Bearer {token}` (required)

**Path Parameters:**
- `id` (string, required): Product ID

**Success Response (200):**
```json
{
  "id": "string",
  "partner_id": "string",
  "name": "string",
  "description": "string",
  "category": "string (optional)",
  "logo": "string (optional)",
  "subscription_plans": [
    {
      "id": "string",
      "name": "string",
      "price": "number",
      "currency": "KES | USD",
      "features": ["string"]
    }
  ],
  "created_at": "ISO 8601 datetime string",
  "updated_at": "ISO 8601 datetime string"
}
```

**Error Responses:**
- `404 Not Found`: Product not found
  ```json
  {
    "status": 404,
    "error": {
      "message": "Product not found"
    }
  }
  ```
- `401 Unauthorized`: Not authenticated

**Frontend Usage:**
```typescript
// File: partner-product.service.ts
getProductById(id: string): Observable<PartnerProduct | null> {
  return this.http.get<PartnerProduct>(`/api/partner/products/${id}`);
}
```

---

### 10. Create Product

Create a new product for the authenticated partner.

**Endpoint:** `POST /api/partner/products`

**Headers:**
- `Authorization: Bearer {token}` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (required)",
  "category": "string (optional)",
  "logo": "string (optional, base64 or URL)",
  "subscription_plans": [
    {
      "name": "string (required)",
      "price": "number (required, >= 0)",
      "currency": "KES | USD (required)",
      "features": ["string"] (optional)
    }
  ]
}
```

**Success Response (201):**
```json
{
  "id": "string (generated)",
  "partner_id": "string (from authenticated partner)",
  "name": "string",
  "description": "string",
  "category": "string (optional)",
  "logo": "string (optional)",
  "subscription_plans": [
    {
      "id": "string (generated)",
      "name": "string",
      "price": "number",
      "currency": "KES | USD",
      "features": ["string"]
    }
  ],
  "created_at": "ISO 8601 datetime string",
  "updated_at": "ISO 8601 datetime string"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `400 Bad Request`: Validation errors

**Frontend Usage:**
```typescript
// File: partner-product.service.ts
createProduct(productData: Omit<PartnerProduct, 'id' | 'partner_id' | 'created_at' | 'updated_at'>): Observable<PartnerProduct> {
  return this.http.post<PartnerProduct>('/api/partner/products', productData);
}
```

---

### 11. Update Product

Update an existing product. Only the product owner can update their products.

**Endpoint:** `PUT /api/partner/products/{id}`

**Headers:**
- `Authorization: Bearer {token}` (required)
- `Content-Type: application/json`

**Path Parameters:**
- `id` (string, required): Product ID

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "category": "string (optional)",
  "logo": "string (optional)",
  "subscription_plans": [
    {
      "id": "string (required for existing plans, omit for new plans)",
      "name": "string (required)",
      "price": "number (required, >= 0)",
      "currency": "KES | USD (required)",
      "features": ["string"] (optional)
    }
  ]
}
```

**Success Response (200):**
```json
{
  "id": "string",
  "partner_id": "string",
  "name": "string",
  "description": "string",
  "category": "string (optional)",
  "logo": "string (optional)",
  "subscription_plans": [
    {
      "id": "string",
      "name": "string",
      "price": "number",
      "currency": "KES | USD",
      "features": ["string"]
    }
  ],
  "created_at": "ISO 8601 datetime string",
  "updated_at": "ISO 8601 datetime string (updated)"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Product not found
- `403 Forbidden`: Partner does not own this product
- `400 Bad Request`: Validation errors

**Frontend Usage:**
```typescript
// File: partner-product.service.ts
updateProduct(id: string, productData: Partial<PartnerProduct>): Observable<PartnerProduct> {
  return this.http.put<PartnerProduct>(`/api/partner/products/${id}`, productData);
}
```

---

### 12. Delete Product

Delete a product. Only the product owner can delete their products.

**Endpoint:** `DELETE /api/partner/products/{id}`

**Headers:**
- `Authorization: Bearer {token}` (required)

**Path Parameters:**
- `id` (string, required): Product ID

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Product not found
- `403 Forbidden`: Partner does not own this product

**Frontend Usage:**
```typescript
// File: partner-product.service.ts
deleteProduct(id: string): Observable<{ success: boolean }> {
  return this.http.delete<{ success: boolean }>(`/api/partner/products/${id}`);
}
```

---

## Client Management Endpoints

### 13. Get Clients

Get all clients/subscribers for the authenticated partner's products.

**Endpoint:** `GET /api/partner/clients`

**Headers:**
- `Authorization: Bearer {token}` (required)

**Success Response (200):**
```json
[
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "company": "string",
    "subscription_plan": "string",
    "product_name": "string",
    "status": "active | inactive | trial",
    "subscription_date": "ISO 8601 datetime string",
    "monthly_revenue": "number",
    "currency": "KES | USD"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated

**Frontend Usage:**
```typescript
// File: partner-product.service.ts
getClients(): Observable<PartnerClient[]> {
  return this.http.get<PartnerClient[]>('/api/partner/clients');
}
```

**Used In:**
- Partner Clients Component (`partner-clients.component.ts`)

**Backend Implementation Notes:**
- Aggregate client data from subscriptions across all partner's products
- Include subscription status, dates, and revenue information
- Filter by authenticated partner's products only

---

## Analytics Endpoints

### 14. Get Analytics Summary

Get analytics summary for the authenticated partner's products.

**Endpoint:** `GET /api/partner/analytics/summary`

**Headers:**
- `Authorization: Bearer {token}` (required)

**Success Response (200):**
```json
{
  "total_products": "number",
  "total_views": "number",
  "total_subscriptions": "number",
  "total_revenue": "number",
  "currency": "KES"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated

**Frontend Usage:**
```typescript
// File: partner-product.service.ts
getInsights(): Observable<{
  total_products: number;
  total_views: number;
  total_subscriptions: number;
  total_revenue: number;
  currency: string;
}> {
  return this.http.get<{
    total_products: number;
    total_views: number;
    total_subscriptions: number;
    total_revenue: number;
    currency: string;
  }>('/api/partner/analytics/summary');
}
```

**Used In:**
- Partner Dashboard (`partner-dashboard.component.ts`)
- Partner Insights (`partner-insights.component.ts`)

---

## Data Models

### Partner Model
```typescript
interface Partner {
  id: string;
  email: string;
  password: string; // Should be hashed in backend
  first_name: string;
  last_name: string;
  company_name: string;
  phone: string;
  business_number: string;
  logo?: string; // Base64 or URL
  contact_info?: {
    address?: string;
    city?: string;
    country?: string;
    website?: string;
  };
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}
```

### PartnerProduct Model
```typescript
interface PartnerProduct {
  id: string;
  partner_id: string;
  name: string;
  description: string;
  category?: string;
  logo?: string; // Base64 or URL
  subscription_plans: SubscriptionPlan[];
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}
```

### SubscriptionPlan Model
```typescript
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: 'KES' | 'USD';
  features?: string[];
}
```

### PartnerInsights Model
```typescript
interface PartnerInsights {
  total_products: number;
  total_views: number;
  total_subscriptions: number;
  total_revenue: number;
  currency: string;
}
```

### PartnerClient Model
```typescript
interface PartnerClient {
  id: string;
  name: string;
  email: string;
  company: string;
  subscription_plan: string;
  product_name: string;
  status: 'active' | 'inactive' | 'trial';
  subscription_date: string; // ISO 8601 datetime
  monthly_revenue: number;
  currency: 'KES' | 'USD';
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "status": "number (HTTP status code)",
  "error": {
    "message": "string (human-readable error message)"
  }
}
```

Common HTTP Status Codes:
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation errors or malformed request
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)

---

## Frontend Implementation Notes

1. **HTTP Client**: The frontend uses Angular's `HttpClient` service for all API calls.

2. **Interceptor**: Currently, a mock interceptor (`partner-api.interceptor.ts`) simulates these endpoints using localStorage. The backend should replace this with real API endpoints.

3. **Authentication**: The frontend stores the partner token in `localStorage` and expects it to be included in the `Authorization` header. The backend should validate this token on protected endpoints.

4. **Error Handling**: The frontend handles errors using RxJS operators and displays toast notifications to users.

5. **Type Safety**: All API calls are typed using TypeScript interfaces matching the models above.

---

## Testing

To test the API endpoints:

1. **Signup**: Create a new partner account
2. **Login**: Authenticate and receive a token
3. **Create Product**: Add a product with subscription plans
4. **Get Products**: Retrieve all products for the partner
5. **Update Product**: Modify an existing product
6. **Get Analytics**: View partner analytics summary
7. **Delete Product**: Remove a product
8. **Logout**: End the session

---

## Backend Implementation Checklist

### Authentication & Security
- [ ] Implement JWT or session-based authentication
- [ ] Create partner signup endpoint with email uniqueness validation
- [ ] Create partner login endpoint with password verification
- [ ] Implement email existence check endpoint (for real-time validation)
- [ ] Implement forgot password endpoint with email sending
- [ ] Implement reset password endpoint with token validation
- [ ] Implement token validation middleware for protected routes
- [ ] Implement proper password hashing (bcrypt, argon2, etc.)
- [ ] Add rate limiting for authentication endpoints
- [ ] Implement password reset token expiration and single-use logic

### Product Management
- [ ] Create product CRUD endpoints with ownership validation
- [ ] Implement subscription plan management within products
- [ ] Add validation for product data and subscription plans

### Client Management
- [ ] Implement client listing endpoint
- [ ] Aggregate subscription data across partner's products
- [ ] Calculate monthly revenue per client

### Analytics
- [ ] Implement analytics calculation logic
- [ ] Calculate total products, views, subscriptions, and revenue
- [ ] Aggregate data from subscriptions and product views

### General
- [ ] Add proper error handling and status codes
- [ ] Implement request validation and sanitization
- [ ] Set up CORS for frontend domain
- [ ] Implement file upload for partner/product logos
- [ ] Add database schema for:
  - [ ] Partners table
  - [ ] Products table
  - [ ] Subscription plans table
  - [ ] Clients/subscriptions table
  - [ ] Password reset tokens table
- [ ] Add logging and monitoring
- [ ] Implement email service for password reset

---

## Questions or Issues?

If you have questions about the API specification or need clarification on any endpoint, please refer to:
- Frontend service files: `partner-auth.service.ts`, `partner-product.service.ts`
- Mock interceptor: `partner-api.interceptor.ts`
- Component usage: `partner-dashboard.component.ts`, `partner-insights.component.ts`, `product-list.component.ts`, `product-form.component.ts`





