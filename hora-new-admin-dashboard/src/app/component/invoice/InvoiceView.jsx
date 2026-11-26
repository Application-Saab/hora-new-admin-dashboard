'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from './invoiceService';
import { BASE, money, fdate, words } from './utils';
import './InvoiceForm.css';

function Box({ h, p = {} }) {
  return (
    <div className="pb">
      <h3>{h}</h3>
      <b>{p.name}</b>
      {p.address && <div>{p.address}</div>}
      {p.gstin && <div>GSTIN: {p.gstin}</div>}
      {p.phone && <div>Phone: {p.phone}</div>}
    </div>
  );
}

export default function InvoiceView({ id }) {
  const [i, setI] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/api/invoices/' + id).then(setI).catch(e => setErr(e.message));
  }, [id]);

  const c = i && i.currency;

  return (
    <div className="inv">
      <div className="topbar noprint">
        <Link href={BASE}>← All invoices</Link>
        <div>
          <Link className="btn ghost" href={`${BASE}/${id}/edit`}>Edit</Link>
          <button className="btn" onClick={() => window.print()}>Print / Save as PDF</button>
        </div>
      </div>

      <div className="paper sheet">
        {err && <p className="msg">{err}</p>}
        {!i && !err && <p>Loading...</p>}
        {i && (
          <>
            <div className="head">
              <div>
                <h2 className="vtitle">{i.title}</h2>
                <table className="meta2"><tbody>
                  <tr><td>Invoice No</td><td><b>{i.invoiceNo}</b></td></tr>
                  <tr><td>Invoice Date</td><td>{fdate(i.invoiceDate)}</td></tr>
                  {i.dueDate && <tr><td>Due Date</td><td>{fdate(i.dueDate)}</td></tr>}
                  {i.poNumber && <tr><td>PO Number</td><td>{i.poNumber}</td></tr>}
                </tbody></table>
              </div>
              {i.logo && <img className="logo" alt="Logo" src={i.logo} />}
            </div>

            <div className="two"><Box h="Billed by" p={i.billedBy} /><Box h="Billed to" p={i.billedTo} /></div>

            <div className="tw">
              <table className="items">
                <thead><tr><th>#</th><th>Item</th><th>HSN/SAC</th><th className="r">GST</th><th className="r">Qty</th><th className="r">Rate</th><th className="r">Amount</th><th className="r">CGST</th><th className="r">SGST</th><th className="r">Total</th></tr></thead>
                <tbody>
                  {i.items.map((x, n) => (
                    <tr key={n}>
                      <td>{n + 1}</td>
                      <td>{x.name}{x.description && <div className="sub">{x.description}</div>}</td>
                      <td>{x.hsn}</td>
                      <td className="r">{x.gstRate}%</td><td className="r">{x.qty}</td>
                      <td className="r">{money(x.rate, c)}</td><td className="r">{money(x.amount, c)}</td>
                      <td className="r">{money(x.cgst, c)}</td><td className="r">{money(x.sgst, c)}</td>
                      <td className="r"><b>{money(x.total, c)}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lower">
              <div className="left">
                {i.bank && <div className="pb"><h3>Bank details</h3><div className="pre">{i.bank}</div></div>}
                {i.upi && <div className="pb"><h3>UPI</h3>{i.upi}</div>}
              </div>
              <div className="sum">
                <div><span>Amount</span><b>{money(i.subtotal, c)}</b></div>
                <div><span>CGST</span><span>{money(i.cgstTotal, c)}</span></div>
                <div><span>SGST</span><span>{money(i.sgstTotal, c)}</span></div>
                {i.discount > 0 && <div><span>Discount</span><span>- {money(i.discount, c)}</span></div>}
                <div className="grand"><span>Total</span><b>{money(i.grandTotal, c)}</b></div>
                <p className="words">Total (in words): {words(i.grandTotal)} only</p>
              </div>
            </div>

            {i.signature && <div className="sign"><img alt="Signature" src={i.signature} /><div className="sub">Authorised signatory</div></div>}
            {i.notes && <div className="pb gap"><h3>Notes</h3><div className="pre">{i.notes}</div></div>}
            {i.terms && <div className="pb gap"><h3>Terms &amp; conditions</h3><div className="pre">{i.terms}</div></div>}
          </>
        )}
      </div>
    </div>
  );
}