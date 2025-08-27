export function getHtmlContent(report: any) {
  // Get customer profile from localStorage
  const customerProfile = JSON.parse(localStorage.getItem('user') || '{}');

  const statusColors: Record<string, string> = {
    paid: 'bg-green-600',
    unpaid: 'bg-red-600',
    'partially paid': 'bg-yellow-500',
    overdue: 'bg-orange-600',
    cancelled: 'bg-gray-500',
    all: 'bg-blue-600',
  };

  const status = report.status?.toLowerCase() || 'all';
  const ribbonColorClass = statusColors[status] || 'bg-blue-600';

  const postingDate = report.posting_date
    ? new Date(report.posting_date).toDateString()
    : 'N/A';
  const dueDate = report.due_date
    ? new Date(report.due_date).toDateString()
    : 'N/A';

  const itemsHtml = (report.items || [])
    .map(
      (item: any) => `
    <tr>
      <td class="border px-3 py-2">${item.item_name}</td>
      <td class="border px-3 py-2">N/A</td>
      <td class="border px-3 py-2">N/A</td>
      <td class="border px-3 py-2 text-right">${item.rate.toLocaleString()} ${
        report.currency
      }</td>
      <td class="border px-3 py-2 text-right">${(
        item.rate * item.qty
      ).toLocaleString()} ${report.currency}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${report.type || 'Invoice'}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>
    .new-page { page-break-before: always; }
    tr { page-break-inside: avoid; }
    .section { page-break-inside: avoid; margin-bottom: 1rem; }
  </style>
</head>

<body class="bg-gray-100 text-gray-900">
  <div class="max-w-3xl mx-auto px-8 py-6 rounded shadow">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <img src="https://techsavanna.co.ke/wp-content/themes/techsavanna/assets/images/logo-dark.svg" alt="Techsavanna Logo" class="h-12 mb-2"/>
      <div class="relative w-40 h-32">
        <div class="absolute -right-12 w-48 h-10 text-white text-md font-bold text-center transform rotate-45 flex items-center justify-center ${ribbonColorClass}">
          ${report.status?.toUpperCase() ?? ''}
        </div>
      </div>
    </div>

    <!-- Payment Info -->
    <div class="mb-6 text-sm">
      <p class="mb-1">Transfer the amount to the business account below. Please include Invoice number on your payment.</p>
     <p class="font-semibold">
  MPESA 
</p>
<p class="text-sm text-gray-600">
  Enter Business no. <strong>220222</strong><br />
  Enter Account No. as <strong>47796595</strong>
</p>

    
    </div>

    <!-- Recipient Info -->
    <div class="flex justify-between text-sm mb-6">
      <div>
        <p class="font-bold">RECIPIENT</p>
        <p>${customerProfile.customer || customerProfile.name}</p>
        <p>${customerProfile.organization}</p>
        <p>Email: ${customerProfile.email}</p>
      </div>
      <div class="text-right">
        <p class="font-bold">${report.type || 'INVOICE'} #${report.name}</p>
     
      </div>
    </div>

    <!-- Items -->
    <table class="w-full text-sm mb-6 border border-gray-200">
      <thead class="bg-gray-300">
        <tr>
          <th class="border px-3 py-2 text-left">Service</th>
          <th class="border px-3 py-2 text-right">Rate</th>
          <th class="border px-3 py-2 text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="mb-6 text-sm">
      <div class="flex justify-between">
        <span>SUBTOTAL</span>
        <span>${report.grand_total.toLocaleString()} ${report.currency}</span>
      </div>
      <div class="flex justify-between font-bold text-lg mt-2">
        <span>TOTAL</span>
        <span class="text-blue-600">${report.grand_total.toLocaleString()} ${
    report.currency
  }</span>
      </div>
    </div>

    <div class="text-right text-red-600 font-bold text-lg mb-6">
      BALANCE: ${report.outstanding_amount.toLocaleString()} ${report.currency}
    </div>

    <!-- VAT Note -->
    <div class="text-sm mb-4">
      <p class="font-bold">VAT Provision Notice</p>
      <p>Please note: All services are subject to applicable VAT regulations under VAT No. ${
        report.vat_no
      }.</p>
    </div>

    <!-- Footer -->
    <div class="text-sm">
      <p class="font-bold mb-1">HOW TO CONFIRM PAYMENT FOR BANK TRANSFERS</p>
      <ul class="list-disc pl-6 space-y-1">
        <li>TECHSAVANNA will automatically allocate payments to your account once it reflects on TECHSAVANNA's bank account.</li>
        <li>Use your account holder's email address as reference.</li>
        <li>You can use the Invoice Number to allocate the payment to a certain invoice.</li>
        <li>Please do not send Proof of Payments unless requested.</li>
      </ul>
    </div>

    <div class="mt-6 text-sm text-gray-600 pt-4 flex justify-between section">
      <div>
        <p>Techsavanna Company Limited</p>
        <p>Woodvale Grove, Westlands</p>
      </div>
      <div class="text-right">
        <p>sales@techsavanna.technology</p>
        <p>+254 700 000000</p>
        <p>Registered in KE: K15002000</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
