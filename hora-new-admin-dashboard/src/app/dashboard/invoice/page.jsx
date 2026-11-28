'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { listInvoices, createInvoice } from '@/app/component/invoice/invoiceService';
import { viewUrl, money, dLong } from '@/app/component/invoice/utils';
import '@/app/component/invoice/invoice-common.css';
import '@/app/component/invoice/invoice-list.css';

function useDebounced(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function InvoiceList() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [list, setList] = useState(null); // null = loading
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [newId, setNewId] = useState('');
  const [creating, setCreating] = useState(false);

  const search = useDebounced(query.trim());

  // Search as you type; the previous request is aborted so old results never overwrite new ones.
  useEffect(() => {
    const controller = new AbortController();
    listInvoices(search, controller.signal)
      .then(rows => { setList(rows); setError(''); })
      .catch(e => {
        if (e.name === 'AbortError') return;
        setError(e.message);
        setList([]);
      });
    return () => controller.abort();
  }, [search]);

  async function createNew(e) {
    e.preventDefault();
    const id = newId.trim();
    if (!/^\d+$/.test(id)) return setError('Enter a valid order ID (numbers only).');
    setError('');

    // An order has one invoice, so an existing one would be opened (and replaced on save).
    try {
      const rows = await listInvoices(id);
      const exists = rows.some(r => String(r.orderId) === id);
      if (exists && !window.confirm(`An invoice for order #${id} already exists. Open the existing one?`)) return;
    } catch { /* if the check fails, continue and let the detail page load it */ }

    // Save to the database right now, then open the invoice.
    setCreating(true);
    try {
      await createInvoice(id);
      router.push(viewUrl(id));
    } catch (err) {
      setError(err.message);
      setCreating(false);
    }
  }

  return (
    <div className="hinv">
      <div className="bar">
        <h2>Invoices</h2>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by order ID, customer name or invoice no"
          aria-label="Search invoices"
        />
        <button type="button" className="btn" onClick={() => setAdding(a => !a)}>+ New invoice</button>
      </div>

      {adding && (
        <form className="bar" onSubmit={createNew}>
          <input
            autoFocus
            value={newId}
            onChange={e => setNewId(e.target.value)}
            placeholder="Enter order ID (e.g. 47953)"
            inputMode="numeric"
            aria-label="Order ID"
          />
          <button type="submit" className="btn" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button>
        </form>
      )}

      {error && <p className="err" role="alert">{error}</p>}

      <div className="bar listcard">
        <div className="tw">
          <table className="hlist">
            <thead>
              <tr>
                <th>Invoice No</th><th>Order ID</th><th>Customer</th><th>Date</th><th className="r">Total</th><th />
              </tr>
            </thead>
            <tbody>
              {list === null && <tr><td colSpan="6">Loading...</td></tr>}
              {list?.length === 0 && (
                <tr>
                  <td colSpan="6">
                    {search ? 'No invoices found.' : 'No invoices yet. Click “New invoice” and enter an order ID.'}
                  </td>
                </tr>
              )}
              {list?.map(i => (
                <tr key={i.orderId} onClick={() => router.push(viewUrl(i.orderId))}>
                  <td>{i.invoiceNo}</td>
                  <td>{i.orderId}</td>
                  <td>{i.customerName}</td>
                  <td>{dLong(i.invoiceDate || i.createdAt)}</td>
                  <td className="r">{money(i.total)}</td>
                  <td className="r">
                    <Link href={viewUrl(i.orderId)} onClick={e => e.stopPropagation()}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}