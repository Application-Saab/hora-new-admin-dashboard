"use client";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "./snapcapsule.css";
import { getCapsules, getStats, getVisitors } from "../../../utils/snapCapsuleApi";

// Snap Capsule page: who visited the website and which Event Capsules they
// created. Data comes from the Snap Capsule backend (/api/admin/*), using
// the admin panel's own login (no separate sign-in).

const PAGE_SIZE = 20;
const EXPORT_LIMIT = 2000;

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

const formatEventDate = (iso) =>
  iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) : "—";

const shortId = (id) => (id ? `${id.slice(0, 8)}…` : "—");

function sourceOf(visitor) {
  if (visitor.utm && visitor.utm.source) return visitor.utm.source;
  if (!visitor.referrer) return "Direct";
  try {
    return new URL(visitor.referrer).hostname.replace(/^www\./, "");
  } catch {
    return visitor.referrer;
  }
}

export default function SnapCapsulePage() {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("capsules");

  useEffect(() => {
    getStats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="sc-page">
      <header className="sc-header">
        <div>
          <h2>Snap Capsule</h2>
          <p className="sc-muted">Website visitors and the Event Capsules they created</p>
        </div>
      </header>

      <section className="sc-stats" aria-label="Summary">
        <Stat label="Visitors" value={stats && stats.visitors} hint={stats && `${stats.newVisitors24h} new in 24h`} />
        <Stat label="Logged-in visitors" value={stats && stats.signedInVisitors} hint={stats && `${stats.logins24h} logins in 24h`} />
        <Stat label="Event Capsules" value={stats && stats.capsules} hint={stats && `${stats.capsules24h} created in 24h`} />
        <Stat label="Active in 24h" value={stats && stats.activeVisitors24h} hint="visitors" />
      </section>

      <div className="sc-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "capsules"} className={tab === "capsules" ? "active" : ""} onClick={() => setTab("capsules")}>
          Event Capsules
        </button>
        <button type="button" role="tab" aria-selected={tab === "visitors"} className={tab === "visitors" ? "active" : ""} onClick={() => setTab("visitors")}>
          Visitors
        </button>
      </div>

      {tab === "capsules" ? <CapsulesTable /> : <VisitorsTable />}
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="sc-card sc-stat">
      <span className="sc-muted">{label}</span>
      <strong>{value ?? "—"}</strong>
      <span className="sc-muted sc-small">{hint || ""}</span>
    </div>
  );
}

// Search box, date range, paging and data loading shared by both tables.
function useTable(load, extra = {}) {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const extraKey = JSON.stringify(extra);

  // Search after the user stops typing for a moment.
  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const params = { search: appliedSearch, from, to, ...extra };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    load({ ...params, page, limit: PAGE_SIZE })
      .then((data) => !cancelled && setResult(data))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearch, from, to, page, extraKey]);

  // Every matching row (up to EXPORT_LIMIT), for the Excel download.
  async function loadAll() {
    const rows = [];
    for (let p = 1; rows.length < EXPORT_LIMIT; p += 1) {
      const data = await load({ ...params, page: p, limit: 100 });
      rows.push(...data.items);
      if (rows.length >= data.total || !data.items.length) break;
    }
    return rows;
  }

  const filters = (
    <>
      <input className="sc-input" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" aria-label="Search" />
      <label className="sc-date">
        From
        <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
      </label>
      <label className="sc-date">
        To
        <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
      </label>
    </>
  );

  return { result, loading, error, page, setPage, filters, loadAll, setSearch };
}

function downloadExcel(rows, sheetName, fileName) {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, sheetName);
  XLSX.writeFile(book, `${fileName}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function CapsulesTable() {
  const table = useTable(getCapsules);
  const [exporting, setExporting] = useState(false);

  async function exportRows() {
    setExporting(true);
    try {
      const rows = await table.loadAll();
      downloadExcel(
        rows.map((c) => ({
          Email: c.email || "",
          Name: c.name || "",
          "Visitor ID": c.visitorId || "",
          "Event Name": c.eventName,
          "Event Date": c.eventDate || "",
          "Web Link": c.webLink,
          "Short Code": c.shortCode || "",
          Status: c.status || "",
          Created: c.createdAt ? new Date(c.createdAt).toLocaleString("en-IN") : "",
        })),
        "Event Capsules",
        "snap-capsule-event-capsules"
      );
    } catch (e) {
      alert(e.message); // eslint-disable-line no-alert
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="sc-card">
      <div className="sc-toolbar">
        {table.filters}
        <button type="button" className="sc-button sc-button-green" onClick={exportRows} disabled={exporting || !table.result.total}>
          {exporting ? "Preparing…" : "Download Excel"}
        </button>
      </div>
      <p className="sc-muted sc-small">Search by email, event name, short code or visitor ID. Dates filter by when the capsule was created.</p>
      <TableState table={table}>
        <table className="sc-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Visitor ID</th>
              <th>Event Name</th>
              <th>Event Date</th>
              <th>Web Link</th>
              <th>Short Code</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {table.result.items.map((c, i) => (
              <tr key={c.folderId}>
                <td>{(table.page - 1) * PAGE_SIZE + i + 1}</td>
                <td>{c.email || <span className="sc-muted">—</span>}</td>
                <td><VisitorId id={c.visitorId} onSearch={table.setSearch} /></td>
                <td className="sc-strong">{c.eventName}</td>
                <td>{formatEventDate(c.eventDate)}</td>
                <td>
                  <a href={c.webLink} target="_blank" rel="noopener noreferrer">Open</a>{" "}
                  <CopyButton text={c.webLink} label="Copy link" />
                </td>
                <td><code>{c.shortCode || "—"}</code></td>
                <td><span className={`sc-badge sc-badge-${c.status || "none"}`}>{c.status || "—"}</span></td>
                <td>{formatDateTime(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableState>
    </section>
  );
}

function VisitorsTable() {
  const [signedIn, setSignedIn] = useState("");
  const table = useTable(getVisitors, { signedIn });
  const [exporting, setExporting] = useState(false);

  async function exportRows() {
    setExporting(true);
    try {
      const rows = await table.loadAll();
      downloadExcel(
        rows.map((v) => ({
          "Visitor ID": v.visitorId,
          Email: v.email || "",
          "Event Capsules": (v.capsules || []).map((c) => `${c.eventName} (${c.eventDate || ""})`).join("; "),
          "Web Links": (v.capsules || []).map((c) => c.webLink).join("; "),
          Visits: v.visitCount,
          "First Seen": v.firstSeenAt ? new Date(v.firstSeenAt).toLocaleString("en-IN") : "",
          "Last Seen": v.lastSeenAt ? new Date(v.lastSeenAt).toLocaleString("en-IN") : "",
          Source: sourceOf(v),
          "Landing Page": v.landingPage || "",
          Device: v.deviceType || "",
          Language: v.locale || "",
          "Login Method": v.loginMethod || "",
        })),
        "Visitors",
        "snap-capsule-visitors"
      );
    } catch (e) {
      alert(e.message); // eslint-disable-line no-alert
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="sc-card">
      <div className="sc-toolbar">
        {table.filters}
        <select className="sc-input sc-select" value={signedIn} onChange={(e) => { setSignedIn(e.target.value); table.setPage(1); }} aria-label="Logged in">
          <option value="">All visitors</option>
          <option value="true">Logged in</option>
          <option value="false">Not logged in</option>
        </select>
        <button type="button" className="sc-button sc-button-green" onClick={exportRows} disabled={exporting || !table.result.total}>
          {exporting ? "Preparing…" : "Download Excel"}
        </button>
      </div>
      <p className="sc-muted sc-small">Search by email or visitor ID. Dates filter by last visit.</p>
      <TableState table={table}>
        <table className="sc-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Visitor ID</th>
              <th>Email</th>
              <th>Event Capsules</th>
              <th>Visits</th>
              <th>First Seen</th>
              <th>Last Seen</th>
              <th>Source</th>
              <th>Landing Page</th>
              <th>Device</th>
            </tr>
          </thead>
          <tbody>
            {table.result.items.map((v, i) => (
              <tr key={v.visitorId}>
                <td>{(table.page - 1) * PAGE_SIZE + i + 1}</td>
                <td><VisitorId id={v.visitorId} /></td>
                <td>{v.email || <span className="sc-muted">Not logged in</span>}</td>
                <td>
                  {v.capsules && v.capsules.length ? (
                    <ul className="sc-capsule-list">
                      {v.capsules.map((c) => (
                        <li key={c.folderId}>
                          <a href={c.webLink} target="_blank" rel="noopener noreferrer">{c.eventName}</a>{" "}
                          <span className="sc-muted">{formatEventDate(c.eventDate)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="sc-muted">—</span>
                  )}
                </td>
                <td>{v.visitCount}</td>
                <td>{formatDateTime(v.firstSeenAt)}</td>
                <td>{formatDateTime(v.lastSeenAt)}</td>
                <td>{sourceOf(v)}</td>
                <td><code>{v.landingPage || "—"}</code></td>
                <td>{v.deviceType || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableState>
    </section>
  );
}

function TableState({ table, children }) {
  const { result, loading, error, page, setPage } = table;
  const pages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  return (
    <>
      {error ? <p className="sc-error">{error}</p> : null}
      <div className="sc-table-wrap" aria-busy={loading}>
        {children}
        {!loading && !error && !result.items.length ? <p className="sc-empty">No data yet.</p> : null}
        {loading ? <p className="sc-empty">Loading…</p> : null}
      </div>
      <div className="sc-pager">
        <span className="sc-muted">{result.total} total</span>
        <button type="button" className="sc-button sc-button-light" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
          ‹ Previous
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button type="button" className="sc-button sc-button-light" disabled={page >= pages || loading} onClick={() => setPage(page + 1)}>
          Next ›
        </button>
      </div>
    </>
  );
}

function VisitorId({ id, onSearch }) {
  if (!id) return <span className="sc-muted">—</span>;
  return (
    <span className="sc-nowrap" title={id}>
      {onSearch ? (
        <button type="button" className="sc-link" onClick={() => onSearch(id)} title="Show this visitor's capsules">
          <code>{shortId(id)}</code>
        </button>
      ) : (
        <code>{shortId(id)}</code>
      )}{" "}
      <CopyButton text={id} label="Copy visitor ID" />
    </span>
  );
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="sc-copy"
      aria-label={label}
      title={label}
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
