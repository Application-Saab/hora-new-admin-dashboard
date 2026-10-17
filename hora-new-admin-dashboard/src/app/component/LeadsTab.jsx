'use client';
import { useMemo, useState } from 'react';
import { hourLabel } from '@/lib/metrics';
import {
  date,
  int,
  OUTCOME,
  pct,
  talk,
  wait,
  RULES,
} from '../../lib/format';
import { Card, HBars, Kpi, StatusChip } from './ui';

export function LeadsTab({
  dash,
  periodPhrase,
  onOpenLead,
}) {
  const v = dash.leadsView;
  const k = v.kpis;

  return (
    <>
      <div className="kpis">
        <Kpi
          label="Leads generated"
          value={int(k.generated)}
          note={periodPhrase}
        />

        <Kpi
          label="Not called yet"
          value={int(k.notCalled)}
          note={
            k.generated
              ? `${ pct(k.notCalled / k.generated) } of leads`
              : ''
          }
          alert={k.notCalled > 0}
          tip={
            'Not called yet\nLeads with no outgoing call since they arrived'
          }
        />

        <Kpi
          label="Time to first call"
          value={wait(k.medianFirstCall)}
          note="median, lead arrival → first dial"
          tip={
            'Time to first call\nHalf the leads were called faster than this'
          }
        />

        <Kpi
          label="Contact rate"
          value={pct(k.contactRate)}
          note="leads we spoke to at least once"
        />

        <Kpi
          label="Attempts to connect"
          value={
            k.attemptsToConnect === undefined
              ? '–'
              : k.attemptsToConnect.toFixed(1)
          }
          note="avg dials before first conversation"
        />

        <Kpi
          label="Need follow-up now"
          value={int(k.needsAction)}
          note={`${ int(k.critical) } urgent`}
          alert={k.critical > 0}
          tip={
            'Need follow-up now\nLeads marked Urgent, Stuck or Due in the queue below'
          }
        />
      </div>

      <div className="grid">
        <Card
          span={5}
          title="Lead funnel"
          sub={`Leads generated ${ periodPhrase }, whole call history`}
        >
          <Funnel funnel={v.funnel} />
        </Card>

        <Card
          span={7}
          title="Best time to reach leads"
          sub="Share of outgoing calls answered, by hour of day"
        >
          <HourlyChart
            hourly={v.hourly}
            best={v.bestHour}
          />
        </Card>

        <Card
          span={5}
          title="Speed to first call"
          sub="Time from lead arrival to the first dial"
        >
          <Speed speed={v.speed} />
        </Card>

        <Card
          span={7}
          title="By lead source"
          sub="Which channels get called quickly and convert. Click a row to filter."
        >
          <SourceTable
            rows={v.sources}
          />
        </Card>
      </div>

      <LeadQueue
        rows={v.rows}
        onOpen={onOpenLead}
      />
    </>
  );
}

function Funnel({ funnel }) {
  const top = funnel[0].count;
  const lost = funnel[1].count - funnel[2].count;

  return (
    <>
      <HBars
        items={funnel.map((f, i) => {
          const prev = i
            ? funnel[i - 1].count
            : undefined;

          return {
            label: f.label,
            value: f.count,
            display: (
              <>
                {int(f.count)}{' '}
                <small>
                  {top ? pct(f.count / top) : ''}
                </small>
              </>
            ),
            tip: `${ f.label } \n${
    int(
        f.count
    )
} leads · ${
    pct(
        top ? f.count / top : undefined
    )
} of generated${
    prev !== undefined
        ? `\n${pct(
            prev ? f.count / prev : undefined
        )} of previous step`
        : ''
} `,
          };
        })}
      />

      {top > 0 && (
        <p className="takeaway">
          <strong>{int(lost)} leads</strong> were called but
          never answered. They are in the queue below as{' '}
          <em>Stuck</em> or <em>Due</em>.
        </p>
      )}
    </>
  );
}

function Speed({ speed }) {
  const called = speed
    .filter((b) => b.key !== 'never')
    .reduce((s, b) => s + b.count, 0);

  const fast = speed[0].count + speed[1].count;

  return (
    <>
      <HBars
        items={speed.map((b) => ({
          label: b.label,
          value: b.count,
          display: int(b.count),
          critical: b.key === 'never',
          tip: `${ b.label } \n${ int(b.count) } leads`,
        }))}
      />

      {called > 0 && (
        <p className="takeaway">
          <strong>{pct(fast / called)}</strong> of called
          leads got their first call within 30 minutes.
        </p>
      )}
    </>
  );
}

function HourlyChart({ hourly, best }) {
  const withCalls = hourly.filter(
    (h) => h.attempts > 0
  );

  if (!withCalls.length) {
    return (
      <div className="empty">
        No outgoing calls in this period
      </div>
    );
  }

  const lo = Math.min(8, withCalls[0].hour);
  const hi = Math.max(
    21,
    withCalls[withCalls.length - 1].hour
  );

  const list = hourly.slice(lo, hi + 1);

  const W = 640;
  const H = 220;
  const L = 34;
  const R = 8;
  const T = 22;
  const B = 30;

  const bw = (W - L - R) / list.length;
  const y = (r) => T + (1 - r) * (H - T - B);
  const minN = RULES.minCallsForBestHour;

  return (
    <>
      <div className="legend">
        <span>
          <i
            style={{
              background: 'var(--series-strong)',
            }}
          />
          Best hour
        </span>

        <span>
          <i
            style={{
              background: 'var(--series)',
            }}
          />
          Answer rate
        </span>

        <span>
          <i
            style={{
              background:
                'repeating-linear-gradient(45deg,var(--series) 0 2px,var(--series-soft) 2px 5px)',
            }}
          />
          Under {minN} calls
        </span>
      </div>

      <svg
        className="chart"
        viewBox={`0 0 ${ W } ${ H } `}
        role="img"
        aria-label="Answer rate by hour of day"
      >
        <defs>
          <pattern
            id="hatch"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect
              width="6"
              height="6"
              fill="var(--series-soft)"
            />

            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="var(--series)"
              strokeWidth="2"
            />
          </pattern>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line
              className="grid-line"
              x1={L}
              x2={W - R}
              y1={y(g)}
              y2={y(g)}
            />

            <text
              x={L - 6}
              y={y(g) + 4}
              textAnchor="end"
            >
              {Math.round(g * 100)}%
            </text>
          </g>
        ))}

        {list.map((h, i) => {
          const x = L + i * bw;
          const isBest = best?.hour === h.hour;
          const thin =
            h.attempts > 0 && h.attempts < minN;

          const top = y(h.rate || 0);
          const w = Math.max(2, bw - 4);

          const bh = Math.max(
            h.attempts ? 1.5 : 0,
            y(0) - top
          );

          const r = Math.min(4, w / 2, bh);

          const d = `M${ x + 2 },${
    y(
        0
    )
}V${ y(0) - bh + r } q0, -${ r } ${ r }, -${ r }H${
    x + 2 + w - r
}q${ r }, 0 ${ r },${ r }V${ y(0) } Z`;

          const tip = `${ hourLabel(h.hour) } \n${
    h.attempts
        ? `${pct(h.rate)} answered\n${int(
            h.connected
        )} of ${int(h.attempts)} calls${thin
            ? '\nFew calls: rate is rough'
            : ''
        }`
        : 'No calls'
} `;

          return (
            <g key={h.hour} data-tip={tip}>
              <rect
                className="hit"
                x={x}
                y={T}
                width={bw}
                height={H - T - B + 20}
              />

              {h.attempts > 0 && (
                <path
                  className={`col${
    isBest ? ' best' : ''
}${ thin ? ' thin' : '' } `}
                  d={d}
                />
              )}

              {isBest && (
                <text
                  className="label-strong"
                  x={x + bw / 2}
                  y={top - 6}
                  textAnchor="middle"
                >
                  {pct(h.rate)}
                </text>
              )}

              {(h.hour % 2 === 0 ||
                list.length <= 12) && (
                <text
                  x={x + bw / 2}
                  y={H - B + 16}
                  textAnchor="middle"
                >
                  {(h.hour % 12) || 12}
                  {h.hour < 12 ? 'a' : 'p'}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {best ? (
        <p className="takeaway">
          Leads pick up most at{' '}
          <strong>{hourLabel(best.hour)}</strong> (
          {pct(best.rate)} of {int(best.attempts)} calls).
          Schedule retries for unanswered leads around then.
        </p>
      ) : (
        <p className="takeaway">
          Not enough calls yet to name a best hour.
        </p>
      )}
    </>
  );
}

function SourceTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="empty">
        No leads in this period
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th className="r">Leads</th>
            <th className="r">Called</th>
            <th className="r">Contacted</th>
            <th className="r">First call</th>
            <th className="r">Converted</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((s) => (
            <tr
              key={s.source}
            >
              <td className="cell-main">
                {s.source}
              </td>

              <td className="r num">
                {int(s.leads)}
              </td>

              <td className="r num">
                {pct(s.calledRate)}
              </td>

              <td className="r num">
                {pct(s.contactRate)}
              </td>

              <td className="r num">
                {wait(s.medianFirstCall)}
              </td>

              <td className="r num">
                {int(s.converted)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Follow-up queue ----------------------------------------------------------

const FILTERS = [
  {
    key: 'action',
    label: 'Needs action',
    test: (s) => s.rank <= 2,
  },
  {
    key: 'never',
    label: 'Not called',
    test: (s) => s.attempts === 0 && !s.closed,
  },
  {
    key: 'missed',
    label: 'Missed calls',
    test: (s) => s.missedPending > 0 && !s.closed,
  },
  {
    key: 'open',
    label: 'All open',
    test: (s) => !s.closed,
  },
  {
    key: 'closed',
    label: 'Closed',
    test: (s) => s.closed,
  },
  {
    key: 'all',
    label: 'All',
    test: () => true,
  },
];

const SORTS = {
  priority: (s) => s.rank * 1e13 - (s.ageMs || 0),
  name: (s) => s.lead.name.toLowerCase(),
  source: (s) => s.lead.source.toLowerCase(),
  agent: (s) =>
    (s.lead.assignedAgentName || '').toLowerCase(),
  created: (s) => s.lead.createdAt || 0,
  first: (s) =>
    s.timeToFirstCall === undefined
      ? Infinity
      : s.timeToFirstCall,
  attempts: (s) => s.attempts,
  connected: (s) => s.connectedCalls,
  talk: (s) => s.talkSeconds,
  last: (s) =>
    s.lastCall ? s.lastCall.startedAt : 0,
};

export function LeadQueue({ rows, onOpen }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({
    key: 'created',
    dir: -1,
  });
  const [limit, setLimit] = useState(50);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map((f) => [
          f.key,
          rows.filter(f.test).length,
        ])
      ),
    [rows]
  );

  const list = useMemo(() => {
    const f =
      FILTERS.find((x) => x.key === filter) ||
      FILTERS[0];

    const q = search.trim().toLowerCase();
    const qd = q.replace(/\D/g, '');
    const key = SORTS[sort.key] || SORTS.priority;

    return rows
      .filter(f.test)
      .filter(
        (s) =>
          !q ||
          s.lead.name.toLowerCase().includes(q) ||
          (s.lead.assignedAgentName || '')
            .toLowerCase()
            .includes(q) ||
          (qd.length >= 3 &&
            s.lead.phone
              .replace(/\D/g, '')
              .includes(qd))
      )
      .sort((a, b) => {
        const x = key(a);
        const y = key(b);

        return (
          (x < y ? -1 : x > y ? 1 : 0) *
          sort.dir
        );
      });
  }, [rows, filter, search, sort]);

  const shown = list.slice(0, limit);

  const Th = ({ k, label, className = '' }) => {
    const on = sort.key === k;

    return (
      <th
        className={`sortable ${ className } `}
        aria-sort={
          on
            ? sort.dir > 0
              ? 'ascending'
              : 'descending'
            : 'none'
        }
        onClick={() =>
          setSort(
            on
              ? { key: k, dir: -sort.dir }
              : { key: k, dir: k === 'created' ? -1 : 1 }
          )
        }
      >
        {label}

        {on && (
          <span className="arrow">
            {sort.dir > 0 ? '▲' : '▼'}
          </span>
        )}
      </th>
    );
  };

  return (
    <Card
      span={12}
      title="Follow-up queue"
      sub="Most urgent first. Click a lead to see every call."
    >
      <div className="table-tools">
        <div
          className="chips"
          role="group"
          aria-label="Show"
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className="chip-btn"
              aria-pressed={f.key === filter}
              onClick={() => {
                setFilter(f.key);
                setLimit(50);
              }}
            >
              {f.label}
              <span className="count">
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>

        <input
          id="lead-search"
          className="input search"
          type="search"
          placeholder="Search lead, agent or number"
          aria-label="Search leads"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setLimit(50);
          }}
        />
      </div>

      {!shown.length ? (
        <div className="empty">No leads match</div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <Th
                  k="priority"
                  label="Next action"
                  className="sticky-col"
                />

                <Th k="name" label="Lead" />
                <Th k="source" label="Source" />
                <Th k="agent" label="Agent" />
                  <Th k="created" label="Created at" />

                <Th
                  k="first"
                  label="First call"
                  className="r"
                />

                <Th
                  k="attempts"
                  label="Calls"
                  className="r"
                />

                <Th
                  k="connected"
                  label="Connected"
                  className="r"
                />

                <Th
                  k="talk"
                  label="Talk time"
                  className="r"
                />

                <Th k="last" label="Last call" />
              </tr>
            </thead>

            <tbody>
              {shown.map((s) => {
                const l = s.lead;
                const last = s.lastCall;

                return (
                  <tr
                    key={l.id}
                    onClick={() => onOpen(l.id)}
                  >
                    <td className="sticky-col wrap-cell">
                      <StatusChip level={s.level} />

                      <div
                        className="cell-sub"
                        style={{ marginTop: 4 }}
                      >
                        {s.action}
                      </div>
                    </td>

                    <td>
                      <div className="cell-main">
                        {l.name}
                      </div>

                      <div className="cell-sub num">
                        {l.phone}
                      </div>
                    </td>

                    <td>
                      {l.source}
                      <div className="cell-sub">
                        {l.status}
                      </div>
                    </td>

                    <td>
                      {l.assignedAgentName || '–'}
                    </td>

                    <td>
                      {l.leadDate || '–'}

                      <div className="cell-sub">
                        {s.ageMs !== undefined
                          ? `${wait(s.ageMs)} ago`
                          : ''}
                      </div>
                    </td>

                    <td className="r num">
                      {s.attempts ? (
                        wait(s.timeToFirstCall)
                      ) : (
                        <span className="muted">
                          not yet
                        </span>
                      )}
                    </td>

                    <td className="r num">
                      {int(s.attempts)}
                    </td>

                    <td className="r num">
                      {int(s.connectedCalls)}
                    </td>

                    <td className="r num">
                      {s.talkSeconds
                        ? talk(s.talkSeconds)
                        : '–'}
                    </td>

                    <td>
                      {last ? (
                        <>
                          {date(last.startedAt)}

                          <div className="cell-sub">
                            {OUTCOME[last.outcome]}
                            {last.duration
                              ? ` · ${ talk(last.duration) } `
                              : ''}
                          </div>
                        </>
                      ) : (
                        <span className="muted">–</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {list.length > shown.length && (
        <div className="more">
          <button
            className="btn"
            onClick={() => setLimit(limit + 50)}
          >
            Show{' '}
            {Math.min(50, list.length - shown.length)} more
            ({int(shown.length)} of {int(list.length)} shown)
          </button>
        </div>
      )}
    </Card>
  );
}