// Invoice folder alag jagah rakho to sirf yahi ek line badalna
export const BASE = '/dashboard/invoice';

export const money = (n, c = '₹') =>
  c + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fdate = d =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

export function words(n) {
  n = Math.round(n);
  if (!n) return 'Zero';
  const o = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const t = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const b = x => (x < 20 ? o[x] : t[Math.floor(x / 10)] + (x % 10 ? ' ' + o[x % 10] : ''));
  const h = x => (x > 99 ? o[Math.floor(x / 100)] + ' hundred' + (x % 100 ? ' ' : '') : '') + (x % 100 ? b(x % 100) : '');
  const s = [];
  [[1e7, 'crore'], [1e5, 'lakh'], [1e3, 'thousand']].forEach(([v, l]) => {
    if (n >= v) { s.push(h(Math.floor(n / v)) + ' ' + l); n %= v; }
  });
  if (n) s.push(h(n));
  const r = s.join(' ');
  return r.charAt(0).toUpperCase() + r.slice(1);
}

const r2 = n => Math.round((n + Number.EPSILON) * 100) / 100;

// CGST + SGST (same state). IGST chahiye to yahan jod sakte hain.
export function calcTotals(items = [], discount = 0) {
  let subtotal = 0, cgstTotal = 0, sgstTotal = 0;
  const out = items.map(i => {
    const qty = Math.max(0, +i.qty || 0), rate = Math.max(0, +i.rate || 0), g = Math.max(0, +i.gstRate || 0);
    const amount = r2(qty * rate), cgst = r2((amount * g) / 200);
    subtotal += amount; cgstTotal += cgst; sgstTotal += cgst;
    return { ...i, qty, rate, gstRate: g, amount, cgst, sgst: cgst, total: r2(amount + 2 * cgst) };
  });
  discount = Math.max(0, +discount || 0);
  return {
    items: out, discount,
    subtotal: r2(subtotal), cgstTotal: r2(cgstTotal), sgstTotal: r2(sgstTotal),
    grandTotal: Math.max(0, r2(subtotal + cgstTotal + sgstTotal - discount))
  };
}