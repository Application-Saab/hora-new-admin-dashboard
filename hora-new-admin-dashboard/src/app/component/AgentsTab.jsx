'use client';

/** Agents tab: KPIs, scorecard with flags, talk time by agent, when-agents-call heatmap. */

import { useMemo, useState } from 'react';
import { DAY, hourLabel } from '@/lib/metrics';
import {
  int,
  minutesClock,
  pct,
  shortDate,
  talk,
  wait,
} from '../../lib/format';
import { Card, HBars, Kpi, Spark, StatusChip } from './ui';
import { LeadQueue } from './LeadsTab';

export function AgentsTab({ dash, periodPhrase, onOpenAgent, onOpenLead }) {
  const v = dash.agentsView;
  const k = v.kpis;
  const lk = dash.leadsView.kpis;

  return (
    <>
      <div className="kpis">
        <Kpi
          label="Agents calling"
          value={int(k.activeAgents)}
          note={periodPhrase}
        />

        <Kpi
          label="Calls made"
          value={int(k.calls)}
          note={`${ int(k.leadsCalled) } different leads`}
        />

        <Kpi
          label="Talk time"
          value={talk(k.talkSeconds)}
          note={`avg ${ talk(k.avgCallSeconds) } per connected call`}
        />

        <Kpi
          label="Answer rate"
          value={pct(k.connectRate)}
          note="outgoing calls that connected"
        />

        <Kpi
          label="Time to first call"
          value={wait(k.medianFirstCall)}
          note="median for new leads"
        />

        <Kpi
          label="Follow-ups due"
          value={int(lk.needsAction)}
          note={`${ int(lk.critical) } urgent`}
          alert={lk.critical > 0}
        />
      </div>

      <Scorecard dash={dash} onOpen={onOpenAgent} />

      <LeadQueue
        rows={dash.leadsView.rows}
        onOpen={onOpenLead}
      />

      <div className="grid">
        <Card
          span={5}
          title="Talk time by agent"
          sub={`Connected minutes ${ periodPhrase } `}
        >
          <TalkChart rows={v.rows} />
        </Card>

        <Card
          span={7}
          title="When agents call"
          sub="Outgoing calls by hour of day"
        >
          <Heatmap rows={v.rows} />
        </Card>
      </div>
    </>
  );
}

const SORTS = {
  name: (r) => r.agent.name.toLowerCase(),
  assigned: (r) => r.assigned,
  coverage: (r) => r.coverage ?? -1,
  leadsCalled: (r) => r.leadsCalled,
  calls: (r) => r.calls,
  connect: (r) => r.connectRate ?? -1,
  talk: (r) => r.talkSeconds,
  avg: (r) => r.avgCallSeconds || 0,
  first: (r) => r.medianFirstCall ?? Infinity,
  due: (r) => r.followUpsDue,
  missed: (r) => r.missedNotReturned,
  converted: (r) => r.conversionRate ?? -1,
  perDay: (r) => r.callsPerDay || 0,
  start: (r) => r.typicalStart ?? Infinity,
  app: (r) => r.appShare ?? -1,
};

const ASCENDING_FIRST = new Set(['name', 'first', 'start']);

export function Scorecard({ dash, onOpen }) {
  const v = dash.agentsView;

  const [sort, setSort] = useState({
    key: 'talk',
    dir: -1,
  });

  const rows = useMemo(() => {
    const f = SORTS[sort.key] || SORTS.talk;

    return [...v.rows].sort((a, b) => {
      const x = f(a);
      const y = f(b);

      return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
    });
  }, [v.rows, sort]);

  const sparkTip = `Calls per day, ${
    shortDate(
        v.sparkStart
    )
} – ${ shortDate(v.sparkStart + (v.sparkDays - 1) * DAY) } `;

  const Th = ({ k, label, className = '', tip }) => {
    const on = sort.key === k;

    return (
      <th
        className={`sortable ${ className } `}
        data-tip={tip}
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
              : {
                  key: k,
                  dir: ASCENDING_FIRST.has(k) ? 1 : -1,
                }
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
      title="Agent scorecard"
      sub="Click an agent for their daily activity and pending follow-ups. Flags compare each agent with the team median."
    >
      {!rows.length ? (
        <div className="empty">
          No agent activity in this period
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <Th
                  k="name"
                  label="Agent"
                  className="sticky-col"
                />

                <Th
                  k="assigned"
                  label="Leads assigned"
                  className="r"
                  tip={'Leads assigned\nNew leads assigned in the period'}
                />

                <Th
                  k="coverage"
                  label="Called"
                  className="r"
                  tip={'Called\nShare of assigned leads called at least once'}
                />

                <Th
                  k="leadsCalled"
                  label="Leads called"
                  className="r"
                  tip={'Leads called\nDifferent leads this agent dialled in the period'}
                />

                <Th k="calls" label="Calls" className="r" />

                <Th
                  k="connect"
                  label="Answer rate"
                  className="r"
                  tip={'Answer rate\nOutgoing calls that connected'}
                />

                <Th
                  k="talk"
                  label="Talk time"
                  className="r"
                />

                <Th
                  k="avg"
                  label="Avg call"
                  className="r"
                  tip={'Avg call\nAverage length of a connected call'}
                />

                <Th
                  k="first"
                  label="First call"
                  className="r"
                  tip={
                    "First call\nMedian time from lead arrival to first dial, for this agent's leads"
                  }
                />

                <Th
                  k="due"
                  label="Follow-ups due"
                  className="r"
                  tip={'Follow-ups due\nAssigned leads marked Urgent, Stuck or Due'}
                />

                <Th
                  k="missed"
                  label="Missed not returned"
                  className="r"
                  tip={
                    'Missed not returned\nLeads whose incoming call was missed and not called back'
                  }
                />

                {v.hasConversions && (
                  <Th
                    k="converted"
                    label="Converted"
                    className="r"
                    tip={
                      'Converted\nAssigned leads with status Converted'
                    }
                  />
                )}

                <Th
                  k="perDay"
                  label="Calls / day"
                  className="r"
                  tip={
                    'Calls / day\nCalls per day the agent was active'
                  }
                />

                <Th
                  k="start"
                  label="Usual hours"
                  tip={
                    'Usual hours\nMedian time of first and last call each working day'
                  }
                />

                {v.hasAppFlag && (
                  <Th
                    k="app"
                    label="Via app"
                    className="r"
                    tip={
                      'Via app\nCalls started from the app instead of the phone dialer'
                    }
                  />
                )}

                <th data-tip={sparkTip}>Last 14 days</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.agent.key}
                  onClick={() => onOpen(r.agent.key)}
                >
                  <td className="sticky-col">
                    <div className="cell-main">
                      {r.agent.name}
                    </div>

                    {r.flags.length ? (
                      <div className="flags">
                        {r.flags.map((f) => (
                          <StatusChip
                            key={f.text}
                            level={f.level}
                            text={f.text}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="cell-sub">
                        No issues
                      </div>
                    )}
                  </td>

                  <td className="r num">
                    {int(r.assigned)}
                  </td>

                  <td className="r num">
                    {pct(r.coverage)}
                    <div className="cell-sub">
                      {int(r.assignedCalled)} of{' '}
                      {int(r.assigned)}
                    </div>
                  </td>

                  <td className="r num">
                    {int(r.leadsCalled)}
                  </td>

                  <td className="r num">
                    {int(r.calls)}
                  </td>

                  <td className="r num">
                    {pct(r.connectRate)}
                    <div className="cell-sub">
                      {int(r.connected)} answered
                    </div>
                  </td>

                  <td className="r num">
                    {talk(r.talkSeconds)}
                  </td>

                  <td className="r num">
                    {talk(r.avgCallSeconds)}
                  </td>

                  <td className="r num">
                    {wait(r.medianFirstCall)}

                    {r.notCalled > 0 && (
                      <div className="cell-sub">
                        {int(r.notCalled)} not called
                      </div>
                    )}
                  </td>

                  <td className="r num">
                    {int(r.followUpsDue)}
                  </td>

                  <td className="r num">
                    {int(r.missedNotReturned)}
                  </td>

                  {v.hasConversions && (
                    <td className="r num">
                      {int(r.converted)}
                      <div className="cell-sub">
                        {pct(r.conversionRate)}
                      </div>
                    </td>
                  )}

                  <td className="r num">
                    {r.callsPerDay === undefined
                      ? '–'
                      : r.callsPerDay.toFixed(1)}

                    <div className="cell-sub">
                      {int(r.activeDays)} days active
                    </div>
                  </td>

                  <td className="num">
                    {minutesClock(r.typicalStart)}
                    <div className="cell-sub">
                      to {minutesClock(r.typicalEnd)}
                    </div>
                  </td>

                  {v.hasAppFlag && (
                    <td className="r num">
                      {pct(r.appShare)}
                    </td>
                  )}

                  <td>
                    <Spark
                      values={r.spark}
                      tip={sparkTip}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function TalkChart({ rows }) {
  const list = [...rows].sort(
    (a, b) => b.talkSeconds - a.talkSeconds
  );

  if (!list.length) {
    return (
      <div className="empty">
        No calls in this period
      </div>
    );
  }

  const total = list.reduce(
    (s, r) => s + r.talkSeconds,
    0
  );

  return (
    <HBars
      items={list.map((r) => ({
        label: r.agent.name,
        value: r.talkSeconds,
        display: (
          <>
            {talk(r.talkSeconds)}{' '}
            <small>
              {pct(
                total
                  ? r.talkSeconds / total
                  : undefined
              )}
            </small>
          </>
        ),
        tip: `${ r.agent.name } \n${
    talk(
        r.talkSeconds
    )
} talk time\n${
    int(
        r.connected
    )
} answered of ${
    int(
        r.calls
    )
} calls\navg ${
    talk(
        r.avgCallSeconds
    )
} per call`,
      }))}
    />
  );
}

function Heatmap({ rows }) {
  if (!rows.length) {
    return (
      <div className="empty">
        No calls in this period
      </div>
    );
  }

  let lo = 8;
  let hi = 21;

  for (const r of rows) {
    r.hours.forEach((n, h) => {
      if (n) {
        lo = Math.min(lo, h);
        hi = Math.max(hi, h);
      }
    });
  }

  const hours = Array.from(
    { length: hi - lo + 1 },
    (_, i) => lo + i
  );

  const max = Math.max(
    1,
    ...rows.flatMap((r) =>
      hours.map((h) => r.hours[h])
    )
  );

  const steps = 6;

  return (
    <>
      <div
        className="table-scroll"
        style={{ border: 0 }}
      >
        <table className="heat">
          <thead>
            <tr>
              <th />

              {hours.map((h) => (
                <th key={h}>
                  {(h % 12) || 12}
                  {h < 12 ? 'a' : 'p'}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.agent.key}>
                <th className="agent-name">
                  {r.agent.name}
                </th>

                {hours.map((h) => {
                  const n = r.hours[h];

                  const step = n
                    ? Math.max(
                        1,
                        Math.ceil((n / max) * steps)
                      )
                    : 0;

                  return (
                    <td
                      key={h}
                      style={{
                        background: `var(--seq-${step})`,
                      }}
                      className={
                        step >= 4
                          ? 'light-text'
                          : 'dark-text'
                      }
                      data-tip={`${ r.agent.name } \n${
    hourLabel(
        h
    )
}: ${ n } calls`}
                    >
                      {n && step >= 3 ? n : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="scale">
        <span
          style={{
            background: 'var(--seq-0)',
            border: '1px solid var(--line)',
          }}
        />
        0

        {Array.from({ length: steps }, (_, i) => (
          <span
            key={i}
            style={{
              background: `var(--seq - ${ i + 1 })`,
            }}
          />
        ))}

        {int(max)} calls
      </div>
    </>
  );
}
