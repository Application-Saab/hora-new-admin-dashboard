export const BASE = '/dashboard/invoice';

export const viewUrl = id => `${BASE}/view?order=${encodeURIComponent(id)}`;

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

export const money = n => inr.format(Number(n) || 0); 
export const dLong = fmtDate(longDate);               
export const dShort = fmtDate(shortDate);             
