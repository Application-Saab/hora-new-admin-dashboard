import { BASE_URL, GET_INVOICE_LIST, GET_INVOICE_BY_ORDER } from '@/utils/apiconstant';

const UPLOAD_URL = `${BASE_URL}/api/image_upload`;
const UPLOADS_PATH = '/api/uploads';

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

export const listInvoices = (q = '', signal) =>
  request(`${BASE_URL}${GET_INVOICE_LIST}?q=${encodeURIComponent(q)}`, {
    signal,
    fallback: 'Could not load invoices.',
  });

export const fetchInvoice = (orderId, signal) =>
  request(orderUrl(orderId), { signal, fallback: 'Could not load this invoice.' });

export const createInvoice = orderId =>
  request(`${orderUrl(orderId)}/image`, {
    method: 'PUT',
    json: {},
    fallback: 'Could not create the invoice.',
  });

export const imageUrl = file => {
  if (!file) return '';
  if (/^(https?:|data:|blob:)/.test(file)) return file; 
  const name = String(file).replace(/^\/+/, '').replace(/^(api\/)?uploads\//, ''); 
  return `${BASE_URL}${UPLOADS_PATH}/${name}`;
};

const fileNameFrom = uploaded =>
  typeof uploaded === 'string'
    ? uploaded
    : uploaded?.filename ?? uploaded?.fileName ?? uploaded?.file ?? uploaded?.path ?? uploaded?.url;

export async function saveInvoiceImage(orderId, blob) {
  const form = new FormData();
  form.append('file', blob, `invoice-${orderId}-${Date.now()}.png`);

  const uploaded = await request(UPLOAD_URL, { method: 'POST', body: form, fallback: 'Image upload failed.' })
    .catch(e => { throw new Error(`Step 1 (upload) failed: ${e.message}`); });

  const image = fileNameFrom(uploaded);
  if (!image) throw new Error('Step 1 (upload) returned no file name.');

  return request(`${orderUrl(orderId)}/image`, {
    method: 'PUT',
    json: { image },
    fallback: 'Could not save the image.',
  }).catch(e => { throw new Error(`Step 2 (save to order) failed: ${e.message}`); });
}
