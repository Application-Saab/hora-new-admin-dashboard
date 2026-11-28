'use client';
import { useState } from 'react';
import LogoImage from '@/assets/logo.svg';
import { money, dLong, dShort } from './utils';
import './invoice-sheet.css';

// Works whether the svg import gives a URL string or a Next static-image object.
const logoSrc = LogoImage?.src ?? LogoImage;

function Party({ title, p = {} }) {
  return (
    <div className="hbox">
      <h3>{title}</h3>
      <b>{p.name}</b>
      {p.address && <div>{p.address}</div>}
      {p.email && <div><b>Email:</b> {p.email}</div>}
      {p.phone && <div><b>Phone:</b> {p.phone}</div>}
    </div>
  );
}

const Row = ({ k, v }) => (v ? <div className="prow"><b>{k}:</b> {v}</div> : null);

export default function InvoiceSheet({ inv }) {
  const [noSign, setNoSign] = useState(false);
  const p = inv.product || {};
  const included = p.included || [];
  const terms = inv.terms || [];

  return (
    <div className="hsheet">
      <div className="hhead">
        <div>
          <h1 className="htitle">HORA- <span>Invoice</span></h1>
          <table className="hmeta">
            <tbody>
              <tr><td>Invoice No #</td><td><b>{inv.invoiceNo}</b></td></tr>
              <tr><td>Invoice Date</td><td>{dLong(inv.invoiceDate)}</td></tr>
              <tr><td>Business Registration no.</td><td>{inv.businessRegNo}</td></tr>
              <tr><td>PAN No</td><td>{inv.pan}</td></tr>
            </tbody>
          </table>
        </div>
        {/* Plain <img> on purpose: html-to-image captures it reliably (next/image lazy-loads) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hlogo" src={logoSrc} alt="Hora" />
      </div>

      <div className="hparties">
        <Party title="Billed By" p={inv.billedBy} />
        <Party title="Billed To" p={inv.billedTo} />
      </div>

      <table className="hitems">
        <thead>
          <tr>
            <th>ITEMS</th>
            <th>Order ID</th>
            <th className="r">ADVANCE AMOUNT</th>
            <th className="r">REMAINING BALANCE</th>
            <th className="r">TOTAL AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          <tr className="main">
            <td>1.&nbsp; {inv.itemTitle}</td>
            <td>{inv.orderId}</td>
            <td className="r">{money(inv.advance)}</td>
            <td className="r">{money(inv.remaining)}</td>
            <td className="r"><b>{money(inv.total)}</b></td>
          </tr>
          <tr className="detail">
            <td colSpan="5">
              <Row k="Product Name" v={p.name} />
              <Row k="Order Date" v={dShort(p.date)} />
              <Row k="Order City" v={p.city} />
              <Row k="Order Address" v={p.address} />
              <Row k="Order Time" v={p.time} />
              <Row k="Order Comments" v={p.comments} />
              {included.length > 0 && (
                <div className="pinc">
                  <div>Order Included:</div>
                  <ul>{included.map((x, i) => <li key={i}>{x}</li>)}</ul>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="hfoot">
        <div className="htotal"><span>Total (INR)</span><b>{money(inv.total)}</b></div>

        <div className="hsign">
          {!noSign && <img src="/signature.png" alt="Signature" onError={() => setNoSign(true)} />}
          <div>Authorised Signatory</div>
        </div>

        {terms.length > 0 && (
          <div className="hterms">
            <h4>Terms and Conditions</h4>
            <ol>{terms.map((t, i) => <li key={i}>{t}</li>)}</ol>
          </div>
        )}
      </div>
    </div>
  );
}