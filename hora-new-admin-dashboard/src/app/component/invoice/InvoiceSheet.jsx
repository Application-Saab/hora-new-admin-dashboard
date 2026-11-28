'use client';
import LogoImage from '@/assets/logo.svg';
import SignatureImage from '@/assets/SimranSignature.png';
import { money, dLong, dShort } from './utils';
import './invoice-sheet.css';
const logoSrc = LogoImage?.src ?? LogoImage;
const signatureSrc = SignatureImage?.src ?? SignatureImage;
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

// HTML string / array / objects ({name}, {title}) -> clean list of plain-text lines
const htmlToList = (v) => {
  const arr = Array.isArray(v) ? v : v ? [v] : [];
  return arr
    .map((s) => (s && typeof s === 'object' ? s.name ?? s.title ?? '' : s))
    .flatMap((s) =>
      String(s)
        .replace(/<\/(div|p|li)>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .split('\n')
    )
    .map((s) => s.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(Boolean);
};

export default function InvoiceSheet({ inv }) {
  const p = inv.product || {};

  const included = htmlToList(p.inclusion ?? p.inclusions ?? p.included ?? inv.inclusion);
  const addOns = htmlToList(p.addOns ?? inv.addOns);
  // comments: array of lines (new server) or a single string (old data)
  const comments = Array.isArray(p.comments) ? p.comments : p.comments ? [p.comments] : [];
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
              {comments.length === 1 && <Row k="Order Comments" v={comments[0]} />}
              {comments.length > 1 && (
                <div className="pinc">
                  <div><b>Order Comments:</b></div>
                  {p.commentsOrdered
                    ? <ol>{comments.map((x, i) => <li key={i}>{x}</li>)}</ol>
                    : comments.map((x, i) => <div key={i}>{x}</div>)}
                </div>
              )}
              {addOns.length > 0 && (
                <div className="pinc">
                  <div><b>Add-ons:</b></div>
                  <ul>{addOns.map((x, i) => <li key={i}>{x}</li>)}</ul>
                </div>
              )}
              {included.length > 0 && (
                <div className="pinc">
                  <div><b>Order Included:</b></div>
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
          <img className="hsign-img" src={signatureSrc} alt="Signature" />
          <div className="hsign-label">Authorised Signatory</div>
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