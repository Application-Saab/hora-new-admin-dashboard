"use client";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "./snapCapsuleTracking.css";
import { getUsers } from "../../../utils/snapCapsuleApi";

// SnapCapsule Tracking: each website visitor with their email (if they logged
// in) and the Event Capsules they created. Data comes from the Snap Capsule
// backend's one admin API (GET /api/admin/users), using the admin panel's
// own login.

const PAGE_SIZE = 20;
const EXPORT_LIMIT = 2000;

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

const formatEventDate = (iso) =>
  iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) : "—";

const shortId = (id) => (id ? `${id.slice(0, 8)}…` : "—");

// One row per capsule; a visitor without capsules gets one row. When the
// search matched an event name or short code (not the visitor's email or
// ID), only the matching capsules are shown.
function toRows(users, search = "") {
  const term = search.trim().toLowerCase();
  return users.flatMap((user) => {
    let capsules = user.capsules || [];
    const visitorMatch = !term || user.visitorId === search.trim() || (user.email || "").includes(term);
    if (!visitorMatch) {
      capsules = capsules.filter((c) => (c.eventName || "").toLowerCase().includes(term) || c.shortCode === search.trim());
    }
    return capsules.length ? capsules.map((capsule) => ({ user, capsule })) : [{ user, capsule: null }];
  });
}

export default function SnapCapsulePage() {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], total: 0, summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  // Search once the user stops typing for a moment.
  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getUsers({ page, limit: PAGE_SIZE, search: appliedSearch, from, to })
      .then((data) => !cancelled && setResult(data))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, appliedSearch, from, to]);

  async function downloadExcel() {
    setExporting(true);
    try {
      const users = [];
      for (let p = 1; users.length < EXPORT_LIMIT; p += 1) {
        const data = await getUsers({ page: p, limit: 100, search: appliedSearch, from, to });
        users.push(...data.items);
        if (users.length >= data.total || !data.items.length) break;
      }
      const rows = toRows(users, appliedSearch).map(({ user, capsule }) => ({
        Email: user.email || "",
        "Visitor ID": user.visitorId,
        "Event Name": capsule ? capsule.eventName : "",
        "Event Date": capsule ? capsule.eventDate || "" : "",
        "Web Link": capsule ? capsule.webLink : "",
        "Short Code": capsule ? capsule.shortCode || "" : "",
        Status: capsule ? capsule.status || "" : "",
        Created: capsule && capsule.createdAt ? new Date(capsule.createdAt).toLocaleString("en-IN") : "",
      }));
      const sheet = XLSX.utils.json_to_sheet(rows);
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, sheet, "Snap Capsule");
      XLSX.writeFile(book, `snap-capsule-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (e) {
      alert(e.message); // eslint-disable-line no-alert
    } finally {
      setExporting(false);
    }
  }

  const s = result.summary;
  const rows = toRows(result.items, appliedSearch);
  const pages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <div className="sc-page">
      <header className="sc-header">
        <div>
          <h2>SnapCapsule Tracking</h2>
          <p className="sc-muted">Website visitors and the Event Capsules they created</p>
        </div>
      </header>

      <section className="sc-stats" aria-label="Summary">
        <Stat label="Visitors" value={s && s.visitors} hint={s && `${s.newVisitors24h} new in 24h`} />
        <Stat label="Logged-in visitors" value={s && s.loggedInVisitors} hint="with email" />
        <Stat label="Event Capsules" value={s && s.capsules} hint={s && `${s.capsules24h} created in 24h`} />
        <Stat label="Active in 24h" value={s && s.activeVisitors24h} hint="visitors" />
      </section>

      <section className="sc-card">
        <div className="sc-toolbar">
          <input className="sc-input" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" aria-label="Search" />
          <label className="sc-date">
            From
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
          </label>
          <label className="sc-date">
            To
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
          </label>
          <button type="button" className="sc-button sc-button-green" onClick={downloadExcel} disabled={exporting || !result.total}>
            {exporting ? "Preparing…" : "Download Excel"}
          </button>
        </div>
        <p className="sc-muted sc-small">Search by email, event name, short code or visitor ID. Dates filter by the visitor&apos;s last visit.</p>

        {error ? <p className="sc-error">{error}</p> : null}
        <div className="sc-table-wrap" aria-busy={loading}>
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
              {rows.map(({ user, capsule }, i) => (
                <tr key={`${user.visitorId}-${capsule ? capsule.folderId : "none"}`}>
                  <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td>{user.email || <span className="sc-muted">Not logged in</span>}</td>
                  <td>
                    <span className="sc-nowrap" title={user.visitorId}>
                      <button type="button" className="sc-link" onClick={() => setSearch(user.visitorId)} title="Show only this visitor">
                        <code>{shortId(user.visitorId)}</code>
                      </button>{" "}
                      <CopyButton text={user.visitorId} label="Copy visitor ID" />
                    </span>
                  </td>
                  {capsule ? (
                    <>
                      <td className="sc-strong">{capsule.eventName}</td>
                      <td>{formatEventDate(capsule.eventDate)}</td>
                      <td>
                        <a href={capsule.webLink} target="_blank" rel="noopener noreferrer">Open</a>{" "}
                        <CopyButton text={capsule.webLink} label="Copy link" />
                      </td>
                      <td><code>{capsule.shortCode || "—"}</code></td>
                      <td><span className={`sc-badge sc-badge-${capsule.status || "none"}`}>{capsule.status || "—"}</span></td>
                      <td>{formatDateTime(capsule.createdAt)}</td>
                    </>
                  ) : (
                    <td colSpan={6} className="sc-muted">No capsule yet</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !error && !rows.length ? <p className="sc-empty">No data yet.</p> : null}
          {loading ? <p className="sc-empty">Loading…</p> : null}
        </div>

        <div className="sc-pager">
          <span className="sc-muted">{result.total} visitors</span>
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
      </section>
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
