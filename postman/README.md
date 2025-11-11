# Partner API Postman Collection

This directory contains the Postman collection for testing the Partner API endpoints.

## Collection File

- `partner-api-collection.json` - Complete Partner API collection with all endpoints

## How to Import

### Option 1: Import via Postman UI

1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `partner-api-collection.json`
5. Click **Import**

### Option 2: Import via Drag & Drop

1. Open Postman
2. Drag and drop `partner-api-collection.json` into Postman window
3. Collection will be imported automatically

## Collection Structure

The collection is organized into the following folders:

### 1. Authentication
- **Check Email** - Verify if email is already registered
- **Partner Signup** - Register a new partner account
- **Partner Login** - Authenticate and get JWT token (auto-saves token to environment)
- **Get Partner Profile** - Get authenticated partner's profile
- **Partner Logout** - Logout and invalidate token
- **Forgot Password** - Request password reset
- **Reset Password** - Reset password with token

### 2. Products
- **Get All Partner Products** - List all products for authenticated partner
- **Get Product by ID** - Get specific product details (auto-saves product_id)
- **Create Partner Product** - Create a new product (auto-saves product_id)
- **Update Partner Product** - Update existing product
- **Delete Partner Product** - Delete a product

### 3. Clients
- **Get Clients** - Get all clients/subscribers for partner's products

### 4. Analytics
- **Get Partner Analytics Summary** - Get analytics and revenue summary

## Environment Variables

The collection uses the following variables (automatically set by test scripts):

- `base_url` - API base URL (default: `http://localhost:8078`)
- `auth_token` - JWT authentication token (auto-set after login)
- `product_id` - Product ID (auto-set after creating/getting a product)
- `partner_id` - Partner ID (auto-set after login)
- `partner_email` - Partner email (auto-set after signup)

## Setup Instructions

### 1. Create/Select Environment

1. In Postman, click **Environments** (left sidebar)
2. Create a new environment or select existing one
3. Add/update the `base_url` variable:
   - **Variable**: `base_url`
   - **Initial Value**: `http://localhost:8078`
   - **Current Value**: `http://localhost:8078` (or your API URL)

### 2. Test Authentication Flow

1. **Check Email** - Verify email availability
2. **Partner Signup** - Create a new account
3. **Partner Login** - Login and get token (token will be auto-saved)
4. **Get Partner Profile** - Verify authentication works

### 3. Test Product Management

1. **Create Partner Product** - Create a product (product_id auto-saved)
2. **Get All Partner Products** - List all products
3. **Get Product by ID** - Get specific product
4. **Update Partner Product** - Update the product
5. **Delete Partner Product** - Delete the product

### 4. Test Other Endpoints

1. **Get Clients** - View partner's clients
2. **Get Partner Analytics Summary** - View analytics data

## Auto-Saved Variables

The collection includes test scripts that automatically save values:

- After **Partner Login**: `auth_token` and `partner_id` are saved
- After **Partner Signup**: `partner_email` is saved
- After **Create Product** or **Get Product by ID**: `product_id` is saved

These variables are automatically used in subsequent requests.

## API Endpoints

All endpoints follow the Frappe API pattern:
```
{{base_url}}/api/method/saas.apis.partner.{endpoint_name}
```

## Authentication

Most endpoints require Bearer token authentication. The token is automatically included from the `auth_token` environment variable after login.

## Notes

- The collection uses Frappe API method calls (not REST endpoints)
- All authenticated endpoints use Bearer token authentication
- Test scripts automatically manage environment variables
- Default base URL is `http://localhost:8078` (update for your environment)

## Related Documentation

- See `../PARTNER_API_DOCUMENTATION.md` for detailed API documentation
- See `../PARTNER_PRODUCTS.md` for product-related information


