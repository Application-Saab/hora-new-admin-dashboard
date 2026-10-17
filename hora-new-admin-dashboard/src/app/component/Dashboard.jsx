'use client';

/**
 * Dashboard shell: header, tabs, filters, data loading, drawers.
 * Data comes from /data (this app's route), which calls GET {API_BASE_URL}/reports/dashboard.
 */

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { computeDashboard, normalizeData } from '@/lib/metrics';
import {
  clock,
  periodRange,
  PERIODS,
  REFRESH_MINUTES,
  RULES,
} from '../../lib/format';
import { LeadsTab } from './LeadsTab';
import { AgentsTab } from './AgentsTab';
import { AgentDrawer, LeadDrawer } from './Drawers';
import { TooltipLayer } from './ui';
import { BASE_URL } from '@/utils/apiconstant';

function stored(key, allowed, dflt) {
  try {
    const v = localStorage.getItem(key);
    return v && allowed.includes(v) ? v : dflt;
  } catch {
    return dflt;
  }
}

function store(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode: ignore
  }
}


export function Dashboard({ demo, userName }) {
  const [tab, setTab] = useState('leads');
  const [period, setPeriod] = useState('30d');
  const [agent, setAgent] = useState('');
  const [source, setSource] = useState('');
  const [raw, setRaw] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [loadedAt, setLoadedAt] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [now, setNow] = useState(() => Date.now());


  const ymd = (ms) => {
    const d = new Date(ms);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };


  const reqId = useRef(0);

  const load = useCallback(async (p) => {
    const id = ++reqId.current;
    setLoading(true);

    const range = periodRange(p, Date.now());

    const q = new URLSearchParams();
    if (range.from !== undefined) q.set('from', ymd(range.from));
    if (range.to !== undefined) q.set('to', ymd(range.to));

    try {
      const res = await fetch(
        `${BASE_URL}/api/leads/reports/dashboard?${q.toString()}`,
        { method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store' }
      );

      if (id !== reqId.current) return; // naya request aa chuka hai, ye purana ignore

      if (res.status === 401 || res.status === 403) {
        window.location.href = '/login';
        return;
      }

      const body = await res.json().catch(() => null);

      if (id !== reqId.current) return; // json padhne ke baad bhi check

      if (!res.ok) {
        throw new Error(
          body?.message || `The report could not be loaded (${res.status}).`
        );
      }

      setRaw(body);
      setOrigin('live');
      setLoadedAt(Date.now());
      setNow(Date.now());
      setError(null);
    } catch (e) {
      if (id !== reqId.current) return;
      setError(
        e.message === 'Failed to fetch'
          ? 'Could not reach the server. Check your connection.'
          : e.message
      );
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);


  // Remembered tab / period (per browser).
  useEffect(() => {
    const h = window.location.hash;

    setTab(
      h === '#agents'
        ? 'agents'
        : h === '#leads'
          ? 'leads'
          : stored('lcm-tab', ['leads', 'agents'], 'leads')
    );

    setPeriod(
      stored(
        'lcm-period',
        PERIODS.map((p) => p.key),
        '30d'
      )
    );
  }, []);



  useEffect(() => {
    if (origin !== 'file') {
      load(period);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, load]);

  useEffect(() => {
    if (!REFRESH_MINUTES || origin !== 'live') {
      return;
    }

    const t = setInterval(() => {
      if (!document.hidden) {
        load(period);
      }
    }, REFRESH_MINUTES * 60000);

    return () => clearInterval(t);
  }, [origin, period, load]);

  const data = useMemo(
    () => (raw ? normalizeData(raw) : null),
    [raw]
  );

  const dash = useMemo(() => {
    if (!data) {
      return null;
    }

    const r = periodRange(period, now);

    return computeDashboard(data, {
      ...RULES,
      now,
      from: r.from,
      to: r.to,
      agentKey: agent || undefined,
      source: source || undefined,
    });
  }, [data, period, now, agent, source]);

  const sources = useMemo(
    () =>
      data
        ? [...new Set(data.leads.map((l) => l.source))].sort()
        : [],
    [data]
  );

  // Sirf wahi agents jinki leads data me hain
  const agentOptions = useMemo(() => {
    if (!data) return [];

    const withLeads = new Set(
      data.leads.map((l) => l.agentKey).filter(Boolean)
    );

    return data.agents.filter((a) => withLeads.has(a.key));
  }, [data]);

  const periodPhrase =
    PERIODS.find((p) => p.key === period)?.phrase || '';

  const chooseTab = (t) => {
    setTab(t);
    store('lcm-tab', t);

    history.replaceState(
      null,
      '',
      t === 'agents' ? '#agents' : '#leads'
    );
  };

  const choosePeriod = (p) => {
    setPeriod(p);
    store('lcm-period', p);

    if (origin === 'file') {
      setNow(Date.now());
    }
  };

  const loadFile = (file) => {
    if (!file) {
      return;
    }

    file.text().then((text) => {
      try {
        setRaw(JSON.parse(text));
        setOrigin('file');
        setLoadedAt(Date.now());
        setNow(Date.now());
        setError(null);
      } catch {
        setError(
          'That file is not valid JSON in the reporting format.'
        );
      }
    });
  };

  const closeDrawer = useCallback(() => {
    setDrawer(null);
  }, []);

  const pillText =
    error && raw
      ? 'Data not updated'
      : origin === 'sample'
        ? 'Sample data'
        : origin === 'file'
          ? `From file · ${ clock(loadedAt) } `
          : origin === 'live'
            ? `Live · updated ${ clock(loadedAt) } `
            : 'Loading…';




  return (

    
    <>
      <header className="top">
        <div className="wrap">
          <div className="top-row">
            <div className="brand">
              <div className="brand-mark" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
                </svg>
              </div>

              <div>
                <h1>Lead Call Monitor</h1>
                <p>Calls from the Lead Dialer app</p>
              </div>
            </div>

            <div
              className="tabs"
              role="tablist"
              aria-label="Dashboard"
            >
              <button
                className="tab"
                role="tab"
                aria-selected={tab === 'leads'}
                onClick={() => chooseTab('leads')}
              >
                Leads
              </button>

              <button
                className="tab"
                role="tab"
                aria-selected={tab === 'agents'}
                onClick={() => chooseTab('agents')}
              >
                Agents
              </button>
            </div>

            <span
              className={`source-pill${error && raw ? ' error' : origin === 'sample' ? ' sample' : ''}`}
            >
              <span className="dot" />
              {pillText}
            </span>

            {!demo && (
              <form
                className="user-menu"
                action="/auth/logout"
                method="post"
              >
                <span>{userName}</span>
                <button className="link" type="submit">
                  Log out
                </button>
              </form>
            )}
          </div>

          <div className="filters">
            <div className="field">
              <label htmlFor="period-today">Period</label>

              <div
                className="periods"
                role="group"
                aria-label="Period"
              >
                {PERIODS.map((p) => (
                  <button
                    key={p.key}
                    id={`period - ${ p.key } `}
                    aria-pressed={p.key === period}
                    onClick={() => choosePeriod(p.key)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="f-agent">Agent</label>

              <select
                id="f-agent"
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
              >
                <option value="">All agents</option>

                {agentOptions.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="f-source">Lead source</label>

              <select
                id="f-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option value="">All sources</option>

                {sources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="spacer" />

            <label
              className="btn"
              htmlFor="f-file"
              title="Open a JSON export in the reporting format"
            >
              Load file
            </label>

            <input
              type="file"
              id="f-file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                loadFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />

            <button
              className="btn btn-primary"
              disabled={loading}
              onClick={() =>
                origin === 'file'
                  ? setNow(Date.now())
                  : load(period)
              }
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <div className="wrap">
        {error ? (
          <div className="banner error">
            {error}
            {raw ? ' Showing the last data loaded.' : ''}
          </div>
        ) : origin === 'sample' ? (
          <div className="banner">
            <span>
              You are looking at{' '}
              <strong>made-up sample data</strong>. To show real
              calls, set <code>API_BASE_URL</code> to the Node.js
              API (see README).
            </span>
          </div>
        ) : dash && !dash.hasCreatedDates ? (
          <div className="banner">
            Leads have no <code>created_at</code> date, so
            &quot;time to first call&quot; and lead age can&apos;t be
            measured.
          </div>
        ) : null}

        <main>
          {!dash ? (
            <section>
              <div className="empty">
                {error ? 'No data to show.' : 'Loading…'}
              </div>
            </section>
          ) : tab === 'leads' ? (
            <section aria-label="Leads">
                <LeadsTab
                  dash={dash}
                  periodPhrase={periodPhrase}
                  onOpenLead={(id) =>
                    setDrawer({ type: 'lead', id })
                  }
                />
            </section>
          ) : (
            <section aria-label="Agents">
              <AgentsTab
                dash={dash}
                periodPhrase={periodPhrase}
                onOpenAgent={(id) =>
                  setDrawer({ type: 'agent', id })
                }
                onOpenLead={(id) =>
                  setDrawer({ type: 'lead', id })
                }
              />
            </section>
          )}
        </main>
      </div>

      {dash && data && drawer?.type === 'lead' && (
        <LeadDrawer
          id={drawer.id}
          dash={dash}
          data={data}
          onClose={closeDrawer}
        />
      )}

      {dash && data && drawer?.type === 'agent' && (
        <AgentDrawer
          agentKey={drawer.id}
          dash={dash}
          periodPhrase={periodPhrase}
          onClose={closeDrawer}
          onOpenLead={(id) =>
            setDrawer({ type: 'lead', id })
          }
        />
      )}

      <TooltipLayer />
    </>
  );
}