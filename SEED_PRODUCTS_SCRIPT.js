/**
 * Browser Console Script to Seed Partner Products
 * 
 * Instructions:
 * 1. Log in to your partner account at /partner/dashboard
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. The products will be automatically added to your account
 */

(function() {
  // Product data extracted from PARTNER_PRODUCTS.md
  const productsData = [
    {
      name: "TechSavanna HRM",
      description: "TechSavanna HRM is a comprehensive human resource management system designed to streamline employee management, payroll processing, attendance tracking, and performance evaluation. Perfect for businesses of all sizes looking to automate their HR operations and improve workforce productivity.",
      subscription_plans: [
        {
          name: "Starter Plan",
          price: 5000,
          currency: "KES",
          features: [
            "Up to 25 employees",
            "Basic payroll processing",
            "Attendance tracking",
            "Employee self-service portal",
            "Email support"
          ]
        },
        {
          name: "Professional Plan",
          price: 12000,
          currency: "KES",
          features: [
            "Up to 100 employees",
            "Advanced payroll with tax calculations",
            "Performance management",
            "Leave management",
            "Custom reports",
            "Priority email support",
            "Mobile app access"
          ]
        },
        {
          name: "Enterprise Plan",
          price: 25000,
          currency: "KES",
          features: [
            "Unlimited employees",
            "Full payroll suite with compliance",
            "Advanced analytics and reporting",
            "Custom integrations",
            "Dedicated account manager",
            "24/7 phone support",
            "API access",
            "White-label options"
          ]
        }
      ]
    },
    {
      name: "CloudSync Pro",
      description: "CloudSync Pro is a secure cloud storage and file synchronization solution that enables teams to collaborate seamlessly. With enterprise-grade security, real-time sync, and advanced sharing controls, it's the perfect solution for businesses that need reliable file management.",
      subscription_plans: [
        {
          name: "Basic Plan",
          price: 3500,
          currency: "KES",
          features: [
            "100GB storage per user",
            "File sharing and collaboration",
            "Basic version history",
            "Mobile apps",
            "Standard security",
            "Email support"
          ]
        },
        {
          name: "Business Plan",
          price: 8500,
          currency: "KES",
          features: [
            "1TB storage per user",
            "Advanced sharing controls",
            "Extended version history (30 days)",
            "Team collaboration tools",
            "Advanced security features",
            "Priority support",
            "Admin dashboard"
          ]
        },
        {
          name: "Enterprise Plan",
          price: 18000,
          currency: "KES",
          features: [
            "Unlimited storage",
            "Advanced admin controls",
            "Unlimited version history",
            "Advanced analytics",
            "SSO integration",
            "Custom branding",
            "24/7 support",
            "SLA guarantee",
            "Compliance certifications"
          ]
        }
      ]
    },
    {
      name: "InvoiceMaster",
      description: "InvoiceMaster is an intelligent invoicing and accounting software that helps small businesses and freelancers manage their finances effortlessly. Create professional invoices, track expenses, manage clients, and get paid faster with automated payment reminders.",
      subscription_plans: [
        {
          name: "Solo Plan",
          price: 2500,
          currency: "KES",
          features: [
            "Unlimited invoices",
            "Basic expense tracking",
            "Client management",
            "Payment reminders",
            "Basic reporting",
            "Mobile app",
            "Email support"
          ]
        },
        {
          name: "Team Plan",
          price: 6500,
          currency: "KES",
          features: [
            "Multi-user access (up to 5 users)",
            "Advanced expense tracking",
            "Recurring invoices",
            "Payment gateway integration",
            "Advanced reporting",
            "Tax calculations",
            "Priority support",
            "Custom branding"
          ]
        },
        {
          name: "Business Plan",
          price: 15000,
          currency: "KES",
          features: [
            "Unlimited users",
            "Full accounting suite",
            "Inventory management",
            "Multi-currency support",
            "Advanced tax compliance",
            "Custom integrations",
            "API access",
            "Dedicated support",
            "Training sessions"
          ]
        }
      ]
    },
    {
      name: "ProjectFlow",
      description: "ProjectFlow is a powerful project management and team collaboration platform that helps teams plan, execute, and deliver projects on time. With intuitive kanban boards, Gantt charts, time tracking, and team communication tools, it's everything you need to manage projects effectively.",
      subscription_plans: [
        {
          name: "Starter Plan",
          price: 4500,
          currency: "KES",
          features: [
            "Up to 10 team members",
            "Unlimited projects",
            "Kanban boards",
            "Basic Gantt charts",
            "Task management",
            "File attachments",
            "Mobile apps",
            "Email support"
          ]
        },
        {
          name: "Professional Plan",
          price: 10000,
          currency: "KES",
          features: [
            "Up to 50 team members",
            "Advanced Gantt charts",
            "Time tracking",
            "Resource management",
            "Custom workflows",
            "Advanced reporting",
            "Integrations (Slack, Jira, etc.)",
            "Priority support",
            "Custom fields"
          ]
        },
        {
          name: "Enterprise Plan",
          price: 22000,
          currency: "KES",
          features: [
            "Unlimited team members",
            "Portfolio management",
            "Advanced analytics",
            "Custom integrations",
            "SSO",
            "Advanced security",
            "White-label options",
            "Dedicated success manager",
            "24/7 support",
            "SLA"
          ]
        }
      ]
    },
    {
      name: "CustomerConnect CRM",
      description: "CustomerConnect CRM is a comprehensive customer relationship management system designed to help sales teams manage leads, track deals, and nurture customer relationships. With automation, analytics, and seamless integrations, boost your sales productivity and close more deals.",
      subscription_plans: [
        {
          name: "Essential Plan",
          price: 5500,
          currency: "KES",
          features: [
            "Up to 1,000 contacts",
            "Lead management",
            "Deal pipeline",
            "Basic email integration",
            "Contact activity tracking",
            "Mobile app",
            "Email support",
            "Basic reporting"
          ]
        },
        {
          name: "Professional Plan",
          price: 13500,
          currency: "KES",
          features: [
            "Up to 10,000 contacts",
            "Advanced sales automation",
            "Email marketing campaigns",
            "Advanced reporting and analytics",
            "Custom fields and workflows",
            "Integrations (Gmail, Outlook, etc.)",
            "Phone support",
            "Team collaboration tools"
          ]
        },
        {
          name: "Enterprise Plan",
          price: 28000,
          currency: "KES",
          features: [
            "Unlimited contacts",
            "Advanced automation and AI insights",
            "Multi-channel marketing",
            "Advanced analytics and forecasting",
            "Custom integrations and API",
            "SSO and advanced security",
            "Dedicated account manager",
            "24/7 priority support",
            "Custom training",
            "SLA guarantee"
          ]
        }
      ]
    }
  ];

  // Get current partner from localStorage
  const currentPartner = JSON.parse(localStorage.getItem('current_partner') || 'null');
  
  if (!currentPartner || !currentPartner.id) {
    console.error('❌ Error: No partner logged in. Please log in first at /partner/login');
    return;
  }

  console.log('✅ Partner found:', currentPartner.company_name || currentPartner.first_name);
  console.log('📦 Seeding', productsData.length, 'products...');

  // Get existing products
  const existingProducts = JSON.parse(localStorage.getItem('partner_products') || '[]');
  
  // Generate new products
  const newProducts = productsData.map((productData, index) => {
    const productId = `product_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    return {
      id: productId,
      partner_id: currentPartner.id,
      name: productData.name,
      description: productData.description,
      subscription_plans: productData.subscription_plans.map((plan, planIndex) => ({
        id: `plan_${Date.now()}_${index}_${planIndex}_${Math.random().toString(36).substr(2, 9)}`,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        features: plan.features || []
      })),
      created_at: now,
      updated_at: now
    };
  });

  // Add to existing products
  const allProducts = [...existingProducts, ...newProducts];
  localStorage.setItem('partner_products', JSON.stringify(allProducts));

  console.log('✅ Successfully seeded', newProducts.length, 'products!');
  console.log('📋 Products added:');
  newProducts.forEach((product, index) => {
    console.log(`   ${index + 1}. ${product.name} (${product.subscription_plans.length} plans)`);
  });
  console.log('\n🔄 Please refresh the products page to see your new products!');
})();

