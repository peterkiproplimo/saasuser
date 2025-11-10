import { PartnerProduct, SubscriptionPlan } from '../models/partner.model';

/**
 * Seed products for a partner
 * This can be called from browser console or from a component
 */
export function seedPartnerProducts(partnerId: string, productsData: any[]): PartnerProduct[] {
  const products: PartnerProduct[] = productsData.map((data, index) => {
    const product: PartnerProduct = {
      id: `product_${Date.now()}_${index}`,
      partner_id: partnerId,
      name: data.name || `Product ${index + 1}`,
      description: data.description || '',
      logo: data.logo || undefined,
      subscription_plans: (data.subscription_plans || []).map((plan: any, planIndex: number) => ({
        id: `plan_${Date.now()}_${index}_${planIndex}`,
        name: plan.name || `Plan ${planIndex + 1}`,
        price: parseFloat(plan.price) || 0,
        currency: plan.currency || 'KES',
        features: Array.isArray(plan.features) ? plan.features : (plan.features ? [plan.features] : [])
      })) as SubscriptionPlan[],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return product;
  });

  return products;
}

/**
 * Save products to localStorage
 */
export function saveProductsToStorage(products: PartnerProduct[]): void {
  const existingProducts = JSON.parse(localStorage.getItem('partner_products') || '[]');
  const allProducts = [...existingProducts, ...products];
  localStorage.setItem('partner_products', JSON.stringify(allProducts));
}

/**
 * Parse markdown-like content and extract product information
 * Expected format:
 * # Product Name
 * Description here...
 * 
 * ## Plans
 * - Plan Name: Price (Currency)
 *   Features: feature1, feature2, feature3
 */
export function parseProductsFromMarkdown(content: string): any[] {
  const products: any[] = [];
  const sections = content.split(/#{1,2}\s+/).filter(s => s.trim());
  
  let currentProduct: any = null;
  
  for (const section of sections) {
    const lines = section.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) continue;
    
    const firstLine = lines[0];
    
    // Check if it's a product name (usually first line after #)
    if (!currentProduct || firstLine.match(/^[A-Z]/)) {
      if (currentProduct) {
        products.push(currentProduct);
      }
      currentProduct = {
        name: firstLine,
        description: '',
        subscription_plans: []
      };
      
      // Get description (lines after name until we hit Plans section)
      const descLines: string[] = [];
      let inDescription = true;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes('plan') || lines[i].startsWith('-')) {
          inDescription = false;
          break;
        }
        descLines.push(lines[i]);
      }
      currentProduct.description = descLines.join(' ').trim();
    }
    
    // Parse plans
    if (firstLine.toLowerCase().includes('plan') || lines.some(l => l.startsWith('-'))) {
      for (const line of lines) {
        if (line.startsWith('-')) {
          const planMatch = line.match(/^-\s*(.+?):\s*([\d,]+\.?\d*)\s*\(?(\w+)?\)?/);
          if (planMatch) {
            const planName = planMatch[1].trim();
            const price = parseFloat(planMatch[2].replace(/,/g, ''));
            const currency = planMatch[3] || 'KES';
            
            // Look for features in next lines
            const features: string[] = [];
            const lineIndex = lines.indexOf(line);
            for (let i = lineIndex + 1; i < lines.length; i++) {
              if (lines[i].startsWith('-') && !lines[i].includes(':')) break;
              if (lines[i].toLowerCase().includes('feature')) {
                const featureMatch = lines[i].match(/features?:\s*(.+)/i);
                if (featureMatch) {
                  features.push(...featureMatch[1].split(',').map(f => f.trim()));
                  break;
                }
              }
            }
            
            currentProduct.subscription_plans.push({
              name: planName,
              price: price,
              currency: currency,
              features: features
            });
          }
        }
      }
    }
  }
  
  if (currentProduct) {
    products.push(currentProduct);
  }
  
  return products;
}



