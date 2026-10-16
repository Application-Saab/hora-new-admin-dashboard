'use client';

/** Side panels: one lead's full call timeline, one agent's activity and pending follow-ups. */

import { useEffect, useRef, useState } from 'react';
import { DAY, leadSummary } from '@/lib/metrics';
import {
  date,
  int,
  OUTCOME,
  pct,
  shortDate,
  talk,
  wait,
} from '../../lib/format';
import { StatusChip } from './ui';

function Shell({ title, sub, onClose, children }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <>
      <div className="scrim" onClick={onClose} />

      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="drawer-head">
          <div style={{ minWidth: 0 }}>
            <h3 id="drawer-title">{title}</h3>
            {sub}
          </div>

          <button
            ref={closeRef}
            className="close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="drawer-body">{children}</div>
      </aside>
    </>
  );
}

function Fact({ k, v, text }) {
  return (
    <div className="fact">
      <div className="k">{k}</div>
      <div className={`v${ text ? ' text' : '' } `}>{v}</div>
    </div>
  );
}

export function LeadDrawer({ id, dash, data, onClose }) {
  const [copied, setCopied] = useState(false);

  const lead = data.leads.find((l) => l.id === id);

  if (!lead) {
    return null;
  }

  const s =
    dash.leadsView.rows.find((r) => r.lead.id === id) ||
    leadSummary(
      lead,
      dash.now,
      dash.rules,
      dash.leadsView.bestHour
    );

  const events = lead.calls.map((c) => ({
    t: c.startedAt,
    call: c,
  }));

  if (lead.createdAt !== undefined) {
    events.push({
      t: lead.createdAt,
      created: true,
    });
  }

  events.sort((a, b) => a.t - b.t);

  const items = events
    .map((e, i) => ({
      ...e,
      gap: i ? e.t - events[i - 1].t : undefined,
    }))
    .reverse();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(lead.phone);
      setCopied(true);

      setTimeout(() => setCopied(false), 1500);
    } catch {
      const el = document.getElementById('lead-phone');

      if (el) {
        window.getSelection()?.selectAllChildren(el);
      }
    }
  };

  return (
    <Shell
      title={lead.name}
      onClose={onClose}
      sub={
        <>
          <div className="cell-sub">
            <span className="num" id="lead-phone">
              {lead.phone}
            </span>

            <button className="copy" onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="cell-sub">
            {lead.source} · {lead.status || 'No status'} · Agent:{' '}
            {lead.assignedAgentName || '–'}
          </div>
        </>
      }
    >
      <div className="action-box">
        <StatusChip level={s.level} />
        <div className="cell-main">{s.action}</div>
      </div>

      <div className="facts">
        <Fact
          k="Generated"
          v={date(lead.createdAt)}
          text
        />

        <Fact
          k="First call after"
          v={s.attempts ? wait(s.timeToFirstCall) : 'Not called'}
        />

        <Fact
          k="First answered after"
          v={wait(s.timeToConnect)}
        />

        <Fact
          k="Outgoing calls"
          v={int(s.attempts)}
        />

        <Fact
          k="Connected"
          v={int(s.connectedCalls)}
        />

        <Fact
          k="Total talk time"
          v={s.talkSeconds ? talk(s.talkSeconds) : '–'}
        />

        <Fact
          k="Last spoke"
          v={
            s.lastContactAt
              ? `${ wait(dash.now - s.lastContactAt) } ago`
              : 'Never'
          }
        />

        <Fact
          k="Missed calls pending"
          v={int(s.missedPending)}
        />

        <Fact
          k={`Calls ${
    Math.round(
        dash.rules.meaningfulSeconds / 60
    )
} + min`}
          v={int(s.meaningfulCalls)}
        />
      </div>

      <div>
        <h4 className="section-title">Call history</h4>

        {items.length ? (
          <ul className="timeline">
            {items.map((e) => {
              const gap =
                e.gap !== undefined ? (
                  <div className="tl-gap">
                    {wait(e.gap)} later
                  </div>
                ) : null;

              if (e.created) {
                return (
                  <li key="created">
                    <span className="tl-dot created" />

                    <div>
                      <div className="cell-main">
                        Lead arrived
                      </div>

                      <div className="cell-sub">
                        {lead.source}
                      </div>
                    </div>

                    <div className="r">
                      {date(e.t)}
                      {gap}
                    </div>
                  </li>
                );
              }

              const c = e.call;

              return (
                <li key={c.id}>
                  <span
                    className={`tl - dot ${
    c.connected
        ? 'connected'
        : c.missedIncoming
            ? 'missed'
            : ''
} `}
                  />

                  <div>
                    <div className="cell-main">
                      {c.direction === 'incoming'
                        ? 'Incoming'
                        : 'Outgoing'}{' '}
                      · {OUTCOME[c.outcome]}

                      {c.duration > 0 && (
                        <>
                          {' · '}
                          <span className="num">
                            {talk(c.duration)}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="cell-sub">
                      {c.agentName || 'Unknown agent'}

                      {c.placedFromApp === false &&
                      c.direction === 'outgoing'
                        ? ' · phone dialer'
                        : ''}
                    </div>
                  </div>

                  <div className="r num">
                    {date(e.t)}
                    {gap}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty">No calls yet</div>
        )}
      </div>
    </Shell>
  );
}

export function AgentDrawer({
  agentKey,
  dash,
  periodPhrase,
  onClose,
  onOpenLead,
}) {
  const v = dash.agentsView;

  const r = v.rows.find(
    (x) => x.agent.key === agentKey
  );

  if (!r) {
    return null;
  }

  const maxS = Math.max(1, ...r.spark);

  return (
    <Shell
      title={r.agent.name}
      onClose={onClose}
      sub={
        <>
          <div className="cell-sub">
            {r.agent.phone ? `${ r.agent.phone } · ` : ''}
            {periodPhrase}
          </div>

          {r.flags.length > 0 && (
            <div className="flags">
              {r.flags.map((f) => (
                <StatusChip
                  key={f.text}
                  level={f.level}
                  text={f.text}
                />
              ))}
            </div>
          )}
        </>
      }
    >
      <div className="facts">
        <Fact k="Calls" v={int(r.calls)} />

        <Fact
          k="Leads called"
          v={int(r.leadsCalled)}
        />

        <Fact
          k="Answer rate"
          v={pct(r.connectRate)}
        />

        <Fact
          k="Talk time"
          v={talk(r.talkSeconds)}
        />

        <Fact
          k="Avg call"
          v={talk(r.avgCallSeconds)}
        />

        <Fact
          k={`Calls ${
    Math.round(
        dash.rules.meaningfulSeconds / 60
    )
} + min`}
          v={int(r.meaningfulCalls)}
        />

        <Fact
          k="Leads assigned"
          v={int(r.assigned)}
        />

        <Fact
          k="Called"
          v={pct(r.coverage)}
        />

        <Fact
          k="First call"
          v={wait(r.medianFirstCall)}
        />

        <Fact
          k="Follow-ups due"
          v={int(r.followUpsDue)}
        />

        <Fact
          k="Missed not returned"
          v={int(r.missedNotReturned)}
        />

        {v.hasConversions ? (
          <Fact
            k="Converted"
            v={`${ int(r.converted) } (${
    pct(
        r.conversionRate
    )
})`}
          />
        ) : (
          <Fact
            k="Calls / day"
            v={
              r.callsPerDay === undefined
                ? '–'
                : r.callsPerDay.toFixed(1)
            }
          />
        )}
      </div>

      <div>
        <h4 className="section-title">
          Calls per day
        </h4>

        <div className="mini-bars">
          {r.spark.map((n, i) => (
            <div
              key={i}
              style={{
                height: `${
    (
        (n / maxS) *
        100
    ).toFixed(0)
}% `,
              }}
              data-tip={`${
    shortDate(
        v.sparkStart + i * DAY
    )
} \n${ n } calls`}
            />
          ))}
        </div>

        <div className="mini-axis">
          <span>{shortDate(v.sparkStart)}</span>

          <span>
            {shortDate(
              v.sparkStart + (v.sparkDays - 1) * DAY
            )}
          </span>
        </div>
      </div>

      <div>
        <h4 className="section-title">
          Pending follow-ups ({int(r.dueLeads.length)})
        </h4>

        {r.dueLeads.length ? (
          <div className="due-list">
            {r.dueLeads.slice(0, 30).map((s) => (
              <button
                key={s.lead.id}
                className="due-item"
                onClick={() => onOpenLead(s.lead.id)}
              >
                <StatusChip level={s.level} />

                <div style={{ minWidth: 0 }}>
                  <div className="cell-main">
                    {s.lead.name}
                  </div>

                  <div className="cell-sub">
                    {s.action}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty">
            Nothing pending
          </div>
        )}
      </div>
    </Shell>
  );
}
