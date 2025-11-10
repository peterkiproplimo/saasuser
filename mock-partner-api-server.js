/**
 * Mock Partner API Server
 * 
 * This is a standalone Express server that simulates the Partner API endpoints.
 * Run this server to test the API with curl or other HTTP clients.
 * 
 * Usage:
 *   node mock-partner-api-server.js
 * 
 * Server runs on: http://localhost:3001/api/partner
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a database)
const storage = {
  partners: [],
  products: [],
  tokens: new Map() // token -> partner_id
};

// Helper functions
function generateId() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) + '-' + Math.random().toString(36).slice(2);
}

function generateToken() {
  return 'token-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}

function getPartnerFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  const partnerId = storage.tokens.get(token);
  if (!partnerId) return null;
  return storage.partners.find(p => p.id === partnerId);
}

// ==================== AUTHENTICATION ENDPOINTS ====================

// POST /api/partner/signup
app.post('/api/partner/signup', (req, res) => {
  const { email, password, first_name, last_name, company_name, phone, business_number, logo, contact_info } = req.body;

  // Validation
  if (!email || !password || !first_name || !last_name || !company_name || !phone || !business_number) {
    return res.status(400).json({
      status: 400,
      error: { message: 'Missing required fields' }
    });
  }

  // Check if email already exists
  if (storage.partners.some(p => p.email === email)) {
    return res.status(409).json({
      status: 409,
      error: { message: 'Email already registered' }
    });
  }

  // Create new partner
  const now = new Date().toISOString();
  const partner = {
    id: generateId(),
    email,
    password, // In production, hash this!
    first_name,
    last_name,
    company_name,
    phone,
    business_number,
    logo: logo || undefined,
    contact_info: contact_info || {},
    created_at: now,
    updated_at: now
  };

  storage.partners.push(partner);

  res.status(200).json({
    success: true,
    message: 'Registration successful'
  });
});

// POST /api/partner/login
app.post('/api/partner/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 400,
      error: { message: 'Email and password are required' }
    });
  }

  const partner = storage.partners.find(p => p.email === email && p.password === password);

  if (!partner) {
    return res.status(401).json({
      status: 401,
      error: { message: 'Invalid email or password' }
    });
  }

  const token = generateToken();
  storage.tokens.set(token, partner.id);

  // Remove password from response
  const { password: _, ...partnerResponse } = partner;

  res.status(200).json({
    success: true,
    partner: partnerResponse,
    token
  });
});

// POST /api/partner/logout
app.post('/api/partner/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    storage.tokens.delete(token);
  }

  res.status(200).json({
    success: true
  });
});

// GET /api/partner/me
app.get('/api/partner/me', (req, res) => {
  const partner = getPartnerFromToken(req);

  if (!partner) {
    return res.status(401).json({
      status: 401,
      error: { message: 'Not authenticated' }
    });
  }

  const { password: _, ...partnerResponse } = partner;

  res.status(200).json({
    partner: partnerResponse
  });
});

// ==================== PRODUCT ENDPOINTS ====================

// GET /api/partner/products
app.get('/api/partner/products', (req, res) => {
  const partner = getPartnerFromToken(req);

  if (!partner) {
    return res.status(401).json({
      status: 401,
      error: { message: 'Not authenticated' }
    });
  }

  const products = storage.products.filter(p => p.partner_id === partner.id);
  res.status(200).json(products);
});

// GET /api/partner/products/:id
app.get('/api/partner/products/:id', (req, res) => {
  const partner = getPartnerFromToken(req);

  if (!partner) {
    return res.status(401).json({
      status: 401,
      error: { message: 'Not authenticated' }
    });
  }

  const product = storage.products.find(p => p.id === req.params.id && p.partner_id === partner.id);

  if (!product) {
    return res.status(404).json({
      status: 404,
      error: { message: 'Product not found' }
    });
  }

  res.status(200).json(product);
});

// POST /api/partner/products
app.post('/api/partner/products', (req, res) => {
  const partner = getPartnerFromToken(req);

  if (!partner) {
    return res.status(401).json({
      status: 401,
      error: { message: 'Not authenticated' }
    });
  }

  const { name, description, category, logo, subscription_plans } = req.body;

  if (!name || !description) {
    return res.status(400).json({
      status: 400,
      error: { message: 'Name and description are required' }
    });
  }

  const now = new Date().toISOString();
  const product = {
    id: generateId(),
    partner_id: partner.id,
    name,
    description,
    category: category || undefined,
    logo: logo || undefined,
    subscription_plans: (subscription_plans || []).map(plan => ({
      id: generateId(),
      name: plan.name,
      price: Number(plan.price || 0),
      currency: plan.currency || 'KES',
      features: Array.isArray(plan.features) ? plan.features : []
    })),
    created_at: now,
    updated_at: now
  };

  storage.products.push(product);

  res.status(201).json(product);
});

// PUT /api/partner/products/:id
app.put('/api/partner/products/:id', (req, res) => {
  const partner = getPartnerFromToken(req);

  if (!partner) {
    return res.status(401).json({
      status: 401,
      error: { message: 'Not authenticated' }
    });
  }

  const productIndex = storage.products.findIndex(p => p.id === req.params.id && p.partner_id === partner.id);

  if (productIndex === -1) {
    return res.status(404).json({
      status: 404,
      error: { message: 'Product not found' }
    });
  }

  const updated = {
    ...storage.products[productIndex],
    ...req.body,
    id: storage.products[productIndex].id, // Prevent ID change
    partner_id: storage.products[productIndex].partner_id, // Prevent ownership change
    updated_at: new Date().toISOString()
  };

  // Update subscription plans if provided
  if (req.body.subscription_plans) {
    updated.subscription_plans = req.body.subscription_plans.map(plan => ({
      id: plan.id || generateId(),
      name: plan.name,
      price: Number(plan.price || 0),
      currency: plan.currency || 'KES',
      features: Array.isArray(plan.features) ? plan.features : []
    }));
  }

  storage.products[productIndex] = updated;

  res.status(200).json(updated);
});

// DELETE /api/partner/products/:id
app.delete('/api/partner/products/:id', (req, res) => {
  const partner = getPartnerFromToken(req);

  if (!partner) {
    return res.status(401).json({
      status: 401,
      error: { message: 'Not authenticated' }
    });
  }

  const productIndex = storage.products.findIndex(p => p.id === req.params.id && p.partner_id === partner.id);

  if (productIndex === -1) {
    return res.status(404).json({
      status: 404,
      error: { message: 'Product not found' }
    });
  }

  storage.products.splice(productIndex, 1);

  res.status(200).json({
    success: true
  });
});

// ==================== ANALYTICS ENDPOINTS ====================

// GET /api/partner/analytics/summary
app.get('/api/partner/analytics/summary', (req, res) => {
  const partner = getPartnerFromToken(req);

  if (!partner) {
    return res.status(401).json({
      status: 401,
      error: { message: 'Not authenticated' }
    });
  }

  const products = storage.products.filter(p => p.partner_id === partner.id);
  const total_products = products.length;

  // Calculate dummy metrics (in production, calculate from real data)
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

  res.status(200).json({
    total_products,
    total_views,
    total_subscriptions,
    total_revenue,
    currency: 'KES'
  });
});

// ==================== UTILITY ENDPOINTS ====================

// GET /api/partner/health - Health check
app.get('/api/partner/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Partner API Mock Server is running',
    timestamp: new Date().toISOString()
  });
});

// GET /api/partner/stats - Debug endpoint (shows storage stats)
app.get('/api/partner/stats', (req, res) => {
  res.status(200).json({
    partners: storage.partners.length,
    products: storage.products.length,
    active_tokens: storage.tokens.size
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Partner API Mock Server running on http://localhost:${PORT}`);
  console.log(`📝 API Base URL: http://localhost:${PORT}/api/partner\n`);
  console.log('Available endpoints:');
  console.log('  POST   /api/partner/signup');
  console.log('  POST   /api/partner/login');
  console.log('  POST   /api/partner/logout');
  console.log('  GET    /api/partner/me');
  console.log('  GET    /api/partner/products');
  console.log('  GET    /api/partner/products/:id');
  console.log('  POST   /api/partner/products');
  console.log('  PUT    /api/partner/products/:id');
  console.log('  DELETE /api/partner/products/:id');
  console.log('  GET    /api/partner/analytics/summary');
  console.log('  GET    /api/partner/health');
  console.log('  GET    /api/partner/stats\n');
});

