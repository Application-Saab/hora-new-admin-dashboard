'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from './invoiceService';
import { BASE, money, calcTotals, words } from './utils';
import "./invoiceForm.css"

const party = () => ({ name: '', gstin: '', phone: '', address: '' });
const newItem = () => ({ name: '', description: '', hsn: '', gstRate: 18, qty: 1, rate: 0 });
const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const initial = () => ({
  title: 'Invoice', invoiceNo: '', poNumber: '', currency: '₹',
  invoiceDate: today(), dueDate: '',
  billedBy: party(), billedTo: party(), items: [newItem()],
  discount: 0, notes: '', terms: '', logo: '', signature: '', bank: '', upi: ''
});

function PartyCard({ title, hint, p, onChange }) {
  const f = (label, k, area) => (
    <label className="fld"><span>{label}</span>
      {area
        ? <textarea rows={2} value={p[k]} onChange={e => onChange(k, e.target.value)} />
        : <input value={p[k]} onChange={e => onChange(k, e.target.value)} />}
    </label>
  );
  return (
    <section className="box">
      <h3>{title} <small>{hint}</small></h3>
      {f('Name*', 'name')}{f('GSTIN', 'gstin')}{f('Phone', 'phone')}{f('Address', 'address', true)}
    </section>
  );
}

function ImageBox({ label, value, onPick, onClear }) {
  return (
    <label className="imgbox">
      {value ? <img src={value} alt={label} /> : <span>+ {label}<br /><small>PNG or JPEG, up to 500KB</small></span>}
      <input type="file" accept="image/png,image/jpeg" hidden onChange={e => onPick(e.target.files[0])} />
      {value && <button type="button" className="x" aria-label={`Remove ${label}`} onClick={e => { e.preventDefault(); onClear(); }}>×</button>}
    </label>
  );
}

export default function InvoiceForm({ id }) {
  const router = useRouter();
  const [d, setD] = useState(initial);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState({ discount: false, notes: false, terms: false, bank: false, upi: false, due: false });
  const tog = k => setShow(s => ({ ...s, [k]: !s[k] }));

  useEffect(() => {
    if (id) {
      api('/api/invoices/' + id).then(i => {
        setD({
          ...initial(), ...i,
          poNumber: i.poNumber || '',
          invoiceDate: (i.invoiceDate || '').slice(0, 10),
          dueDate: (i.dueDate || '').slice(0, 10),
          billedBy: { ...party(), ...i.billedBy }, billedTo: { ...party(), ...i.billedTo },
          items: (i.items || []).map(x => ({ ...newItem(), ...x })),
          notes: i.notes || '', terms: i.terms || '', logo: i.logo || '', signature: i.signature || '',
          bank: i.bank || '', upi: i.upi || ''
        });
        setShow({ discount: +i.discount > 0, notes: !!i.notes, terms: !!i.terms, bank: !!i.bank, upi: !!i.upi, due: !!i.dueDate });
      }).catch(e => setMsg(e.message));
    } else {
      try { // pichli baar ki aapki details bhar do
        const m = JSON.parse(localStorage.getItem('mine') || 'null');
        if (m) setD(x => ({ ...x, billedBy: { ...party(), ...m.by }, logo: m.logo || '', signature: m.sign || '', terms: m.terms || '', notes: m.notes || '', bank: m.bank || '', upi: m.upi || '' }));
      } catch {}
    }
  }, [id]);

  const set = (k, v) => setD(x => ({ ...x, [k]: v }));
  const setParty = which => (k, v) => setD(x => ({ ...x, [which]: { ...x[which], [k]: v } }));
  const setItem = (i, k, v) => setD(x => ({ ...x, items: x.items.map((it, n) => (n === i ? { ...it, [k]: v } : it)) }));
  const addItem = () => setD(x => ({ ...x, items: [...x.items, newItem()] }));
  const delItem = i => setD(x => (x.items.length > 1 ? { ...x, items: x.items.filter((_, n) => n !== i) } : x));

  function pickImg(key, file) {
    if (!file) return;
    if (file.size > 5e5) { setMsg('Image 500KB se chhoti honi chahiye'); return; }
    const r = new FileReader();
    r.onload = () => set(key, r.result);
    r.readAsDataURL(file);
  }

  async function save(status) {
    setMsg('');
    if (!d.invoiceDate || !d.billedBy.name.trim() || !d.billedTo.name.trim()) return setMsg('Date, aapka naam aur client ka naam zaroori hain');
    if (d.items.some(i => !i.name.trim())) return setMsg('Har line mein item ka naam likhna zaroori hai');
    setBusy(true);
    try {
      const body = {
        ...d, status, dueDate: d.dueDate || null, discount: +d.discount || 0,
        items: d.items.map(i => ({ ...i, gstRate: +i.gstRate, qty: +i.qty, rate: +i.rate }))
      };
      const inv = await api(id ? '/api/invoices/' + id : '/api/invoices', { method: id ? 'PUT' : 'POST', body });
      try { localStorage.setItem('mine', JSON.stringify({ by: d.billedBy, logo: d.logo, sign: d.signature, terms: d.terms, notes: d.notes, bank: d.bank, upi: d.upi })); } catch {}
      router.push(`${BASE}/${inv._id || inv.id}`);
    } catch (e) { setMsg(e.message); setBusy(false); }
  }

  const t = calcTotals(d.items, d.discount);
  const c = d.currency;

  return (
    <div className="inv">
      <div className="topbar">
        <Link href={BASE}>← All invoices</Link>
        <div>
          <button className="btn ghost" disabled={busy} onClick={() => save('draft')}>Save as draft</button>
          <button className="btn" disabled={busy} onClick={() => save('saved')}>Save &amp; continue</button>
        </div>
      </div>

      <div className="paper">
        <input className="title" aria-label="Document title" value={d.title} onChange={e => set('title', e.target.value)} />

        <div className="head">
          <div className="meta">
            <label className="fld inline"><span>Invoice No*</span>
              <input placeholder="Auto" value={d.invoiceNo} onChange={e => set('invoiceNo', e.target.value)} /></label>
            <label className="fld inline"><span>PO Number</span>
              <input value={d.poNumber} onChange={e => set('poNumber', e.target.value)} /></label>
            <label className="fld inline"><span>Invoice Date*</span>
              <input type="date" value={d.invoiceDate} onChange={e => set('invoiceDate', e.target.value)} /></label>
            {show.due || d.dueDate
              ? <label className="fld inline"><span>Due Date</span>
                  <input type="date" value={d.dueDate} onChange={e => set('dueDate', e.target.value)} /></label>
              : <button type="button" className="add" onClick={() => tog('due')}>+ Add due date</button>}
          </div>
          <ImageBox label="Add business logo" value={d.logo} onPick={f => pickImg('logo', f)} onClear={() => set('logo', '')} />
        </div>

        <div className="two">
          <PartyCard title="Billed by" hint="(your details)" p={d.billedBy} onChange={setParty('billedBy')} />
          <PartyCard title="Billed to" hint="(client's details)" p={d.billedTo} onChange={setParty('billedTo')} />
        </div>

        <div className="curr">
          <label className="fld inline"><span>Currency</span>
            <select value={c} onChange={e => set('currency', e.target.value)}>
              <option value="₹">Indian Rupee (INR, ₹)</option><option value="$">US Dollar ($)</option><option value="€">Euro (€)</option>
            </select></label>
        </div>

        <div className="tw">
          <table className="items">
            <thead><tr>
              <th>Item</th><th>HSN/SAC</th><th>GST %</th><th>Qty</th><th>Rate</th>
              <th className="r">Amount</th><th className="r">CGST</th><th className="r">SGST</th><th className="r">Total</th><th></th>
            </tr></thead>
            <tbody>
              {d.items.map((it, i) => (
                <tr key={i}>
                  <td>
                    <b className="no">{i + 1}.</b>
                    <input aria-label="Item name" placeholder="Item name" value={it.name} onChange={e => setItem(i, 'name', e.target.value)} />
                    <input className="desc" aria-label="Description" placeholder="Description (optional)" value={it.description} onChange={e => setItem(i, 'description', e.target.value)} />
                  </td>
                  <td><input className="w90" aria-label="HSN or SAC" value={it.hsn} onChange={e => setItem(i, 'hsn', e.target.value)} /></td>
                  <td>
                    <select aria-label="GST rate" value={it.gstRate} onChange={e => setItem(i, 'gstRate', e.target.value)}>
                      {[0, 5, 12, 18, 28].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </td>
                  <td><input className="w70" type="number" min="0" aria-label="Quantity" value={it.qty} onChange={e => setItem(i, 'qty', e.target.value)} /></td>
                  <td><input className="w100" type="number" min="0" aria-label="Rate" value={it.rate} onChange={e => setItem(i, 'rate', e.target.value)} /></td>
                  <td className="r">{money(t.items[i].amount, c)}</td>
                  <td className="r">{money(t.items[i].cgst, c)}</td>
                  <td className="r">{money(t.items[i].sgst, c)}</td>
                  <td className="r"><b>{money(t.items[i].total, c)}</b></td>
                  <td><button type="button" className="rm" aria-label="Remove line" onClick={() => delItem(i)}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="dash" onClick={addItem}>+ Add new line</button>

        <div className="lower">
          <div className="left">
            <section className="box soft">
              <h3>Bank account details</h3>
              {show.bank || d.bank
                ? <textarea rows={4} placeholder={'Account name, number, IFSC, bank'} value={d.bank} onChange={e => set('bank', e.target.value)} />
                : <><p>Add the account where clients should send payments.</p><button type="button" className="btn" onClick={() => tog('bank')}>+ Add bank account</button></>}
            </section>
            <section className="box soft">
              <h3>UPI details</h3>
              {show.upi || d.upi
                ? <input placeholder="name@bank" value={d.upi} onChange={e => set('upi', e.target.value)} />
                : <><p>Collect payments through Google Pay, PhonePe or Paytm.</p><button type="button" className="btn" onClick={() => tog('upi')}>+ Add UPI ID</button></>}
            </section>
          </div>

          <div className="sum">
            <div><span>Amount</span><b>{money(t.subtotal, c)}</b></div>
            <div><span>CGST</span><span>{money(t.cgstTotal, c)}</span></div>
            <div><span>SGST</span><span>{money(t.sgstTotal, c)}</span></div>
            {show.discount || +d.discount > 0
              ? <div><span>Discount</span>
                  <input className="w100" type="number" min="0" aria-label="Discount" value={d.discount} onChange={e => set('discount', e.target.value)} /></div>
              : <button type="button" className="add" onClick={() => tog('discount')}>+ Add discount</button>}
            <div className="grand"><span>Total ({c === '₹' ? 'INR' : c === '$' ? 'USD' : 'EUR'})</span><b>{money(t.grandTotal, c)}</b></div>
            <p className="words">Total (in words): {words(t.grandTotal)} only</p>
          </div>
        </div>

        <div className="extras">
          <ImageBox label="Add signature" value={d.signature} onPick={f => pickImg('signature', f)} onClear={() => set('signature', '')} />
          <button type="button" className="dash" onClick={() => tog('terms')}>+ Add terms &amp; conditions</button>
          <button type="button" className="dash" onClick={() => tog('notes')}>+ Add notes</button>
        </div>
        {(show.terms || d.terms) && <label className="fld"><span>Terms &amp; conditions</span><textarea rows={3} value={d.terms} onChange={e => set('terms', e.target.value)} /></label>}
        {(show.notes || d.notes) && <label className="fld"><span>Notes</span><textarea rows={3} value={d.notes} onChange={e => set('notes', e.target.value)} /></label>}

        <p className="msg" role="alert">{msg}</p>
      </div>
    </div>
  );
}