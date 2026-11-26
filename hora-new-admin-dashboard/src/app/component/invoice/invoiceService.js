import {
  BASE_URL, GET_INVOICE_LIST, GET_INVOICE_BY_ID,
  CREATE_INVOICE, UPDATE_INVOICE, DELETE_INVOICE
} from '@/utils/apiconstant';

async function call(path, method = 'GET', body) {
  const r = await fetch(BASE_URL + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (localStorage.getItem('token') || '') // apne project ke hisaab se badlo
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.message || d.error || 'Request fail ho gayi');
  return d.data ?? d;
}

// Components '/api/invoices...' style URL dete hain, yahan real endpoints pe map hota hai
export async function api(url, opt = {}) {
  const method = (opt.method || 'GET').toUpperCase();
  const u = new URL(url, 'http://x');
  const id = u.pathname.split('/').filter(Boolean)[2];
  if (method === 'GET' && !id) return call(GET_INVOICE_LIST + '?q=' + encodeURIComponent(u.searchParams.get('q') || ''));
  if (method === 'GET') return call(GET_INVOICE_BY_ID + '/' + id);
  if (method === 'DELETE') return call(DELETE_INVOICE + '/' + id, 'DELETE');
  if (method === 'PUT') return call(UPDATE_INVOICE + '/' + id, 'PUT', opt.body);
  return call(CREATE_INVOICE, 'POST', opt.body);
}