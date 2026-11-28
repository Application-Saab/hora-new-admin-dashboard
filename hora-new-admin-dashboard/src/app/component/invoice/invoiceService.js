const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const UPLOADS = process.env.NEXT_PUBLIC_UPLOADS_URL || `${API}/uploads`;

async function parse(res, fallback) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || fallback);
  return json.data;
}

// { invoice, image } for one order
export async function fetchInvoice(orderId, signal) {
  const res = await fetch(`${API}/invoices/order/${orderId}`, { signal, cache: 'no-store' });
  return parse(res, 'Could not load the invoice.');
}

// All saved invoices (search by customer name, order id or invoice no)
export async function listInvoices(q = '', signal) {
  const res = await fetch(`${API}/invoices?q=${encodeURIComponent(q)}`, { signal, cache: 'no-store' });
  return parse(res, 'Could not load invoices.');
}
export const fetchInvoices = listInvoices;

// Create the invoice record (no image yet). The image is attached later by saveInvoiceImage.
export async function createInvoice(orderId) {
  const res = await fetch(`${API}/invoices/order/${orderId}/image`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  return parse(res, 'Could not create the invoice.');
}

// Upload the captured PNG. Server stores it as uploads/invoice-images/invoice-<orderId>.png
export async function saveInvoiceImage(orderId, blob) {
  const form = new FormData();
  form.append('file', blob, `invoice-${orderId}.png`);
  // do NOT set Content-Type: the browser adds the multipart boundary itself
  const res = await fetch(`${API}/invoices/order/${orderId}/image`, { method: 'PUT', body: form });
  return parse(res, 'Could not save the image.');
}

// image = "invoice-images/invoice-50236.png?v=123"
export const imageUrl = image => `${UPLOADS}/${image}`;