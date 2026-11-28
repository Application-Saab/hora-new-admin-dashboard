import { BASE_URL, GET_INVOICE_LIST, GET_INVOICE_BY_ORDER } from '@/utils/apiconstant';

// Keep the same token key/format the rest of the app uses.
const authHeader = () => ({
  Authorization: 'Bearer ' + (typeof window === 'undefined' ? '' : localStorage.getItem('token') || ''),
});

async function request(url, { fallback, json, ...options } = {}) {
  const headers = { ...authHeader(), ...(json ? { 'Content-Type': 'application/json' } : {}) };
  const res = await fetch(url, { ...options, headers, ...(json ? { body: JSON.stringify(json) } : {}) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || fallback);
  return body.data ?? body;
}

const orderUrl = orderId => `${BASE_URL}${GET_INVOICE_BY_ORDER}/${encodeURIComponent(orderId)}`;

// Saved invoices (with search). Pass an AbortSignal to cancel stale requests.
export const listInvoices = (q = '', signal) =>
  request(`${BASE_URL}${GET_INVOICE_LIST}?q=${encodeURIComponent(q)}`, {
    signal,
    fallback: 'Could not load invoices.',
  });

// -> { invoice, image }   (image = saved file name, or '')
export const fetchInvoice = (orderId, signal) =>
  request(orderUrl(orderId), { signal, fallback: 'Could not load this invoice.' });

// Where the backend serves uploaded files. If images 404, this is the line to change
// (use the same path your other pages use to show uploaded images).
const UPLOADS_PATH = '/api/uploads';

// Called when the user clicks "Create": builds the invoice for this order and saves it
// to the database right away (the image is attached later, when the invoice opens).
export async function createInvoice(orderId) {
  const data = await fetchInvoice(orderId);
  if (data.image) return data; // already saved earlier, nothing to create
  await request(`${orderUrl(orderId)}/image`, {
    method: 'PUT',
    json: { orderId, invoice: data.invoice }, // backend must upsert this (image can be empty)
    fallback: 'Could not create the invoice.',
  });
  return data;
}

export const imageUrl = file => {
  if (!file) return '';
  if (/^(https?:|data:|blob:)/.test(file)) return file; // backend already sent a full URL
  const name = String(file).replace(/^\/+/, '').replace(/^(api\/)?uploads\//, ''); // tolerate "uploads/x.png"
  return `${BASE_URL}${UPLOADS_PATH}/${name}`;
};

// 1) upload the image to the server
// 2) save the invoice data AND the image file name together in the database (one request)
export async function saveInvoiceImage(orderId, blob, invoice) {
  const form = new FormData();
  form.append('file', blob, `invoice-${orderId}-${Date.now()}.png`);

  const uploaded = await request(`${BASE_URL}/api/image_upload`, {
    method: 'POST',
    body: form,
    fallback: 'Image upload failed.',
  }).catch(e => { throw new Error(`Step 1 (upload) failed: ${e.message}`); });
  console.debug('[invoice] upload response:', uploaded);
  // The backend may return the file name directly or inside an object.
  const file = typeof uploaded === 'string'
    ? uploaded
    : uploaded?.filename ?? uploaded?.fileName ?? uploaded?.file ?? uploaded?.path ?? uploaded?.url;
  if (!file) throw new Error('Step 1 (upload) returned no file name. Check the console for the response.');

  const saved = await request(`${orderUrl(orderId)}/image`, {
    method: 'PUT',
    json: { orderId, image: file, invoice }, // the backend must upsert this into the DB
    fallback: 'Could not save the image.',
  }).catch(e => { throw new Error(`Step 2 (save to order) failed: ${e.message}`); });
  console.debug('[invoice] save response:', saved);
  return saved;
}