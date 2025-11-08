# How to Seed 5 Sample Products to Your Partner Account

## Quick Steps

1. **Log in to your partner account**
   - Go to `/partner/login`
   - Enter your partner credentials

2. **Open Browser Console**
   - Press `F12` or right-click → Inspect → Console tab
   - Or press `Ctrl+Shift+J` (Windows/Linux) or `Cmd+Option+J` (Mac)

3. **Copy and Paste the Script**
   - Open the file `SEED_PRODUCTS_SCRIPT.js`
   - Copy the entire content
   - Paste it into the browser console
   - Press Enter

4. **Verify Products**
   - You should see success messages in the console
   - Navigate to `/partner/products` or refresh the page
   - You should see 5 new products:
     - TechSavanna HRM
     - CloudSync Pro
     - InvoiceMaster
     - ProjectFlow
     - CustomerConnect CRM

## Products Included

Each product comes with 3 subscription plans (Starter/Basic, Professional/Business, Enterprise) with different features and pricing.

## Troubleshooting

- **Error: "No partner logged in"**
  - Make sure you're logged in at `/partner/login`
  - Check that you can see the partner dashboard

- **Products not showing**
  - Refresh the products page
  - Check browser console for any errors
  - Verify localStorage has the data: `localStorage.getItem('partner_products')`

- **Want to remove seeded products?**
  - Run in console: `localStorage.removeItem('partner_products')`
  - Then refresh the page

## Alternative: Use the MD File

If you prefer to manually create products:
1. Open `PARTNER_PRODUCTS.md`
2. Copy the product information
3. Use the "Create Product" button in the partner dashboard
4. Fill in the details from the MD file

