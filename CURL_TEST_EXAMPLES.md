# Partner API - cURL Test Examples

The mock Partner API server runs on **http://localhost:3005**

## Start the Mock Server

```bash
cd saas-user
node mock-partner-api-server.js
```

The server will start on port 3005 by default.

---

## 1. Partner Signup

```bash
curl -X POST http://localhost:3005/api/partner/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@partner.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "Partner",
    "company_name": "Test Company Ltd",
    "phone": "+254712345678",
    "business_number": "C.123456",
    "contact_info": {
      "address": "123 Test Street",
      "city": "Nairobi",
      "country": "Kenya",
      "website": "https://testcompany.com"
    }
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Registration successful"
}
```

---

## 2. Partner Login

```bash
curl -X POST http://localhost:3005/api/partner/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@partner.com",
    "password": "password123"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "partner": {
    "id": "id-...",
    "email": "test@partner.com",
    "first_name": "Test",
    "last_name": "Partner",
    "company_name": "Test Company Ltd",
    ...
  },
  "token": "token-..."
}
```

**Save the token for subsequent requests:**
```bash
TOKEN=$(curl -s -X POST http://localhost:3005/api/partner/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@partner.com","password":"password123"}' \
  | jq -r '.token')
```

---

## 3. Get Current Partner

```bash
curl -X GET http://localhost:3005/api/partner/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 4. Create Product

```bash
curl -X POST http://localhost:3005/api/partner/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cloud Storage Pro",
    "description": "Enterprise cloud storage solution",
    "category": "Storage",
    "subscription_plans": [
      {
        "name": "Basic",
        "price": 1000,
        "currency": "KES",
        "features": ["10GB storage", "Email support"]
      },
      {
        "name": "Pro",
        "price": 5000,
        "currency": "KES",
        "features": ["100GB storage", "Priority support", "API access"]
      }
    ]
  }'
```

---

## 5. Get All Products

```bash
curl -X GET http://localhost:3005/api/partner/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 6. Get Product by ID

```bash
curl -X GET http://localhost:3005/api/partner/products/PRODUCT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 7. Update Product

```bash
curl -X PUT http://localhost:3005/api/partner/products/PRODUCT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product Name",
    "description": "Updated description"
  }'
```

---

## 8. Delete Product

```bash
curl -X DELETE http://localhost:3005/api/partner/products/PRODUCT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 9. Get Analytics Summary

```bash
curl -X GET http://localhost:3005/api/partner/analytics/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "total_products": 5,
  "total_views": 1234,
  "total_subscriptions": 89,
  "total_revenue": 450000,
  "currency": "KES"
}
```

---

## 10. Logout

```bash
curl -X POST http://localhost:3005/api/partner/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Complete Test Flow Example

```bash
# 1. Signup
curl -X POST http://localhost:3005/api/partner/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"newpartner@test.com","password":"pass123","first_name":"John","last_name":"Doe","company_name":"Test Co","phone":"+254700000000","business_number":"C.999999"}'

# 2. Login and save token
TOKEN=$(curl -s -X POST http://localhost:3005/api/partner/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newpartner@test.com","password":"pass123"}' \
  | jq -r '.token')

# 3. Get profile
curl -X GET http://localhost:3005/api/partner/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Create product
curl -X POST http://localhost:3005/api/partner/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Product","description":"Test product","subscription_plans":[{"name":"Plan 1","price":1000,"currency":"KES","features":["Feature 1"]}]}'

# 5. Get all products
curl -X GET http://localhost:3005/api/partner/products \
  -H "Authorization: Bearer $TOKEN"

# 6. Get analytics
curl -X GET http://localhost:3005/api/partner/analytics/summary \
  -H "Authorization: Bearer $TOKEN"

# 7. Logout
curl -X POST http://localhost:3005/api/partner/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## Health Check

```bash
curl http://localhost:3005/api/partner/health
```

---

## Debug Stats

```bash
curl http://localhost:3005/api/partner/stats
```

---

## Notes

- All endpoints require authentication except `/signup` and `/login`
- Use the `token` from login response in `Authorization: Bearer {token}` header
- The mock server stores data in memory (resets on restart)
- For production, replace `localhost:3005` with your actual API base URL






