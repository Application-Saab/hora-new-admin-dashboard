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
import ArrowIcon from '@/assets/arrow.svg';
const arrowSrc = ArrowIcon?.src ?? ArrowIcon;

export default function InvoiceDetail({ orderId }) {
  const sheetRef = useRef(null);
  const autoSaved = useRef(false);
  const [data, setData] = useState(null);
  const [regenerate, setRegenerate] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(true);

  const showSaved = Boolean(data?.image) && !regenerate;
  const showSheet = Boolean(data?.invoice) && !showSaved;

  const load = useCallback(async signal => {
    setBusy(true);
    setError('');
    try {
      setData(await fetchInvoice(orderId, signal));
      setRegenerate(false);
      setBusy(false);
    } catch (e) {
      if (isAbort(e)) return;
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
      await saveInvoiceImage(orderId, await captureAsBlob(sheetRef.current));
      await load();
      setNotice(`Invoice for order #${orderId} saved.`);
    }, 'Could not save the image.');
  };

  const downloadImage = () =>
    run(async () => {
      const blob = showSaved ? await fetchSavedBlob() : await captureAsBlob(sheetRef.current);
      downloadBlob(blob, `invoice-${orderId}.png`);
    }, 'Download failed.');

  const savePdf = () =>
    run(async () => {
      const dataUrl = showSaved
        ? await blobToDataUrl(await fetchSavedBlob())
        : await captureAsDataUrl(sheetRef.current);
      await downloadPdf(dataUrl, `invoice-${orderId}.pdf`);
    }, 'Could not create the PDF.');

  useEffect(() => {
    if (!data?.invoice || data.image) return;
    const t = setTimeout(() => {
      if (autoSaved.current) return;
      autoSaved.current = true;
      saveImage();
    }, 400);
    return () => clearTimeout(t);
  }, [data]);

  return (
    <div className="hinv">
      <div className="bar noprint">
        <Link className="back" href={BASE} aria-label="Back to all invoices">
          <img className="back-img" src={arrowSrc} alt="" />
        </Link>
        <h2>Order #{orderId}</h2>
        <span className="spacer" />

        {data && (
          <>
            {showSheet && (
              <button type="button" className="btn" disabled={busy} onClick={saveImage}>
                {busy ? 'Please wait...' : 'Save invoice image'}
              </button>
            )}
            {(showSaved || showSheet) && (
              <>
                <button type="button" className="btn ghost" disabled={busy} onClick={downloadImage}>Download image</button>
                <button type="button" className="btn ghost" disabled={busy} onClick={savePdf}>Download PDF</button>
                <button type="button" className="btn ghost" onClick={() => window.print()}>Print</button>
              </>
            )}
            {showSaved && (
              <button type="button" className="btn ghost" onClick={() => setRegenerate(true)}>Regenerate</button>
            )}
            {showSheet && data.image && (
              <button type="button" className="btn ghost" disabled={busy} onClick={() => setRegenerate(false)}>Cancel</button>
            )}
          </>
        )}
      </div>

      {busy && !data && <p className="note noprint">Loading...</p>}
      {error && <p className="err noprint" role="alert">{error}</p>}
      {notice && !error && <p className="note noprint" role="status">{notice}</p>}
      {data && !data.invoice && !data.image && !busy && (
        <p className="err noprint" role="alert">Invoice data was not returned by the server.</p>
      )}

      {showSaved && (
        <img
          className="himg"
          src={imageUrl(data.image)}
          alt={`Invoice ${orderId}`}
          onError={() => {
            setNotice('');
            setError('The invoice is saved, but its image cannot be loaded (check the uploads URL). Showing the live invoice instead.');
            setRegenerate(true);
          }}
        />
      )}

      {showSheet && (
        <div ref={sheetRef}>
          <InvoiceSheet inv={data.invoice} />
        </div>
      )}
    </div>
  );
}
