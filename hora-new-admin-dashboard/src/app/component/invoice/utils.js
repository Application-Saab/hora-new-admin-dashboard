// Base route of the invoice pages. Moving the folder? Change only this line.
export const BASE = '/dashboard/invoice';

// Static export has no dynamic [orderId] route, so the id goes in the query string.
export const viewUrl = id => `${BASE}/view?order=${encodeURIComponent(id)}`;

// Formatters are created once and reused (cheaper than toLocaleString on every call).
const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const longDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
const shortDate = new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

const fmtDate = formatter => d => {
  if (!d) return '';
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? '' : formatter.format(date);
};

export const money = n => inr.format(Number(n) || 0); // ₹1,234.00
export const dLong = fmtDate(longDate);               // Nov 02, 2026
export const dShort = fmtDate(shortDate);             // 11/15/2026