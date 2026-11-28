'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { fetchInvoice, saveInvoiceImage, imageUrl } from './invoiceService';
import {
  blobToDataUrl,
  captureAsBlob,
  captureAsDataUrl,
  downloadBlob,
  downloadPdf,
} from './exportInvoice';
import InvoiceSheet from './InvoiceSheet';
import { BASE } from './utils';
import './invoice-common.css';
import './invoice-detail.css';

const isAbort = e => e?.name === 'AbortError';

// One order's invoice: shows the saved image if there is one,
// otherwise the live sheet with a "Save invoice image" button.
export default function InvoiceDetail({ orderId }) {
  const sheetRef = useRef(null);
  const autoSaved = useRef(false); // auto-save runs once per order
  const [data, setData] = useState(null);          // { invoice, image }
  const [regenerate, setRegenerate] = useState(false); // true = show the sheet instead of the saved image
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(true);

  const showSaved = Boolean(data?.image) && !regenerate;

  const load = useCallback(async signal => {
    setBusy(true);
    setError('');
    try {
      setData(await fetchInvoice(orderId, signal));
      setRegenerate(false);
      setBusy(false);
    } catch (e) {
      if (isAbort(e)) return; // a newer request took over
      setError(e.message);
      setData(null);
      setBusy(false);
    }
  }, [orderId]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // Shared busy/error handling for every action button.
  const run = async (task, fallback) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await task();
    } catch (e) {
      setError(e.message || fallback);
    } finally {
      setBusy(false);
    }
  };

  const fetchSavedBlob = async () => {
    const res = await fetch(imageUrl(data.image), { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not read the saved image.');
    return res.blob();
  };

  const saveImage = () => {
    if (data?.image && !window.confirm(`Order #${orderId} already has a saved invoice image. Replace it?`)) return;
    return run(async () => {
      await saveInvoiceImage(orderId, await captureAsBlob(sheetRef.current), data.invoice);
      await load(); // now the saved image is shown
      setNotice(`Invoice for order #${orderId} saved.`);
    }, 'Could not save the image.');
  };

  // Saves a PNG straight to the user's device (saved image if present, else the live sheet).
  const downloadImage = () =>
    run(async () => {
      const blob = showSaved ? await fetchSavedBlob() : await captureAsBlob(sheetRef.current);
      downloadBlob(blob, `invoice-${orderId}.png`);
    }, 'Download failed.');

  // Uses the saved image if available, otherwise captures the live sheet.
  const savePdf = () =>
    run(async () => {
      const dataUrl = showSaved
        ? await blobToDataUrl(await fetchSavedBlob())
        : await captureAsDataUrl(sheetRef.current);
      await downloadPdf(dataUrl, `invoice-${orderId}.pdf`);
    }, 'Could not create the PDF.');

  // New invoice (nothing saved yet): save data + image to the database automatically.
  // If it fails, the error is shown and the "Save invoice image" button still works as a retry.
  useEffect(() => {
    if (!data?.invoice || data.image) return;
    const t = setTimeout(() => {
      if (autoSaved.current) return;
      autoSaved.current = true;
      saveImage();
    }, 400); // let the sheet (logo, fonts) finish rendering before capturing
    return () => clearTimeout(t);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="hinv">
      <div className="bar noprint">
        <Link className="back" href={BASE}>← All invoices</Link>
        <h2>Order #{orderId}</h2>
        <span className="spacer" />

        {data && showSaved && (
          <>
            <button type="button" className="btn ghost" disabled={busy} onClick={downloadImage}>Download image</button>
            <button type="button" className="btn ghost" disabled={busy} onClick={savePdf}>Download PDF</button>
            <button type="button" className="btn ghost" onClick={() => window.print()}>Print</button>
            <button type="button" className="btn ghost" onClick={() => setRegenerate(true)}>Regenerate</button>
          </>
        )}

        {data?.invoice && !showSaved && (
          <>
            <button type="button" className="btn" disabled={busy} onClick={saveImage}>
              {busy ? 'Please wait...' : 'Save invoice image'}
            </button>
            <button type="button" className="btn ghost" disabled={busy} onClick={downloadImage}>Download image</button>
            <button type="button" className="btn ghost" disabled={busy} onClick={savePdf}>Download PDF</button>
            {data.image && (
              <button type="button" className="btn ghost" disabled={busy} onClick={() => setRegenerate(false)}>Cancel</button>
            )}
          </>
        )}
      </div>

      {busy && !data && <p className="note noprint">Loading...</p>}
      {error && <p className="err noprint" role="alert">{error}</p>}
      {notice && !error && <p className="note noprint" role="status">{notice}</p>}

      {showSaved && (
        <img
          className="himg"
          src={imageUrl(data.image)}
          alt={`Invoice ${orderId}`}
          onError={() => {
            setNotice('');
            setError('The invoice is saved, but its image cannot be loaded from the server (check the uploads URL). Showing the live invoice instead.');
            setRegenerate(true);
          }}
        />
      )}
      {data && !showSaved && !data.invoice && !busy && (
        <p className="err noprint" role="alert">Invoice data was not returned by the server.</p>
      )}
      {data?.invoice && !showSaved && (
        <div ref={sheetRef}>
          <InvoiceSheet inv={data.invoice} />
        </div>
      )}
    </div>
  );
}