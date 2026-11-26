'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/app/component/invoice/invoiceService';
import { BASE, money, fdate } from '@/app/component/invoice/utils';
import './invoice.css';

export default function InvoiceList() {
  const [list, setList] = useState(null);
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');

  async function load(search) {
    try {
      const r = await api('/api/invoices?q=' + encodeURIComponent(search));
      setList(Array.isArray(r) ? r : r.docs || r.invoices || r.items || []);
      setMsg('');
    } catch (e) { setMsg(e.message); setList([]); }
  }

  useEffect(() => {
    const t = setTimeout(() => load(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  async function remove(id) {
    if (!confirm('Ye invoice hamesha ke liye delete ho jayega. Pakka?')) return;
    try { await api('/api/invoices/' + id, { method: 'DELETE' }); load(q); }
    catch (e) { setMsg(e.message); }
  }

  return (
    <div className="inv">
      <div className="topbar">
        <h1 className="ph">Invoices</h1>
        <Link className="btn" href={`${BASE}/new`}>+ New invoice</Link>
      </div>
      <div className="paper">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by invoice number or client name" aria-label="Search invoices" />
        <div className="tw" style={{ marginTop: 14 }}>
          <table className="items list">
            <thead><tr><th>Invoice No</th><th>Client</th><th>Date</th><th>Status</th><th className="r">Total</th><th></th></tr></thead>
            <tbody>
              {list === null && <tr><td colSpan="6">Loading...</td></tr>}
              {list && list.length === 0 && <tr><td colSpan="6">No invoices yet. Click “New invoice” to create one.</td></tr>}
              {list && list.map(i => {
                const id = i._id || i.id;
                return (
                  <tr key={id}>
                    <td>{i.invoiceNo}</td>
                    <td>{i.billedTo && i.billedTo.name}</td>
                    <td>{fdate(i.invoiceDate)}</td>
                    <td><span className={'status ' + i.status}>{i.status}</span></td>
                    <td className="r">{money(i.grandTotal, i.currency)}</td>
                    <td className="r acts">
                      <Link href={`${BASE}/${id}`}>View</Link>
                      <Link href={`${BASE}/${id}/edit`}>Edit</Link>
                      <button className="linkbtn" onClick={() => remove(id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="msg" role="alert">{msg}</p>
      </div>
    </div>
  );
}