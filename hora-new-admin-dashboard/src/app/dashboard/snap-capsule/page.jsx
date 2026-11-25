"use client";
import React, { useEffect, useState } from "react";
import "./snapcapsule.css";
import { getUsers } from "../../../utils/snapCapsuleApi";

// Snap Capsule page: each website visitor with their email (if they logged
// in) and the Event Capsules they created. Data comes from the Snap Capsule
// backend (GET /api/admin/users), using the admin panel's own login.

const PAGE_SIZE = 20;

const formatEventDate = (iso) =>
  iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) : "—";

export default function SnapCapsulePage() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getUsers({ page, limit: PAGE_SIZE })
      .then((data) => !cancelled && setResult(data))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page]);

  const pages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <div className="sc-page">
      <header className="sc-header">
        <div>
          <h2>Snap Capsule</h2>
          <p className="sc-muted">Website visitors, their email and the Event Capsules they created</p>
        </div>
      </header>

      <section className="sc-card">
        {error ? <p className="sc-error">{error}</p> : null}
        <div className="sc-table-wrap" aria-busy={loading}>
          <table className="sc-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Visitor ID</th>
                <th>Email</th>
                <th>Event Name</th>
                <th>Event Date</th>
                <th>Web Link</th>
                <th>Short Code</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((user, i) => {
                const n = (page - 1) * PAGE_SIZE + i + 1;
                const capsules = user.capsules && user.capsules.length ? user.capsules : [null];
                // One row per capsule; a visitor without capsules gets one row.
                return capsules.map((c, j) => (
                  <tr key={`${user.visitorId}-${c ? c.folderId : "none"}`}>
                    {j === 0 ? (
                      <>
                        <td rowSpan={capsules.length}>{n}</td>
                        <td rowSpan={capsules.length}>
                          <span className="sc-nowrap" title={user.visitorId}>
                            <code>{user.visitorId}</code> <CopyButton text={user.visitorId} label="Copy visitor ID" />
                          </span>
                        </td>
                        <td rowSpan={capsules.length}>{user.email || <span className="sc-muted">Not logged in</span>}</td>
                      </>
                    ) : null}
                    {c ? (
                      <>
                        <td className="sc-strong">{c.eventName}</td>
                        <td>{formatEventDate(c.eventDate)}</td>
                        <td>
                          <a href={c.webLink} target="_blank" rel="noopener noreferrer">Open</a> <CopyButton text={c.webLink} label="Copy link" />
                        </td>
                        <td><code>{c.shortCode || "—"}</code></td>
                      </>
                    ) : (
                      <td colSpan={4} className="sc-muted">No capsule yet</td>
                    )}
                  </tr>
                ));
              })}
            </tbody>
          </table>
          {!loading && !error && !result.items.length ? <p className="sc-empty">No visitors yet.</p> : null}
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
