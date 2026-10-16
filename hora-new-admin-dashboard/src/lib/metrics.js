
/**
 * Lead & agent metrics for the dashboard. Pure functions (no React, no DOM).
 * All times are ms since epoch; hours and days use the viewer's local time zone.
 * Input is the reporting API's JSON (GET /reports/dashboard).
 */

export const MIN = 60 * 1000;
export const HOUR = 60 * MIN;
export const DAY = 24 * HOUR;

export const DEFAULT_RULES = {
  meaningfulSeconds: 120,
  followUpHours: 48,
  retryAfterHours: 4,
  maxBlindAttempts: 3,
  minCallsForBestHour: 5,
};

const CLOSED_RE = /convert|won|closed|lost|not.?interested|junk|invalid|dnd|spam|duplicate|booked|sale/i;
const CONVERTED_RE = /convert|won|booked|sale|closed.?won/i;

// ---- Parsing (same field names the app accepts from API 2) ----------------

function str(v) {
  if (v === null || v === undefined || typeof v === 'object') return undefined;
  const s = String(v).trim();
  return s === '' ? undefined : s;
}

function pick(o, keys) {
  for (const k of keys) {
    const s = str(o[k]);
    if (s !== undefined) return s;
  }
  return undefined;
}

function obj(v) {
  return v && typeof v === 'object' && !Array.isArray(v) ? v : undefined;
}

function firstDefined(o, keys) {
  for (const k of keys) {
    if (o[k] !== undefined) return o[k];
  }
  return undefined;
}

/** ISO string, "2026-10-13 12:30:00", or epoch seconds/ms -> ms. */
export function parseTime(v) {
  if (typeof v === 'number' && isFinite(v)) {
    return v < 1e12 ? v * 1000 : v;
  }

  if (typeof v === 'string' && v.trim()) {
    const s = v.trim();
    if (/^\d+(\.\d+)?$/.test(s)) return parseTime(Number(s));

    const t = Date.parse(
      s.includes('T') || !s.includes(' ') ? s : s.replace(' ', 'T')
    );

    return isNaN(t) ? undefined : t;
  }

  return undefined;
}

function parseCall(c, i, lead) {
  const startedAt = parseTime(
    firstDefined(c, [
      'started_at',
      'call_time',
      'called_at',
      'start_time',
      'call_date',
      'date',
      'created_at',
    ])
  );

  if (startedAt === undefined) return null;

  const duration = Math.max(
    0,
    Math.round(
      Number(firstDefined(c, ['duration_seconds', 'duration', 'call_duration'])) || 0
    )
  );

  const rawStatus = (pick(c, ['status', 'call_status']) || '').toLowerCase();
  const rawDir = (pick(c, ['direction', 'call_type', 'type']) || '').toLowerCase();

  let direction = 'outgoing';

  if (/in/.test(rawDir) && !/out/.test(rawDir)) direction = 'incoming';
  if (rawDir === 'missed' || rawStatus === 'missed') direction = 'incoming';
  if (rawDir === 'rejected' && !rawStatus) direction = 'incoming';

  let outcome;

  if (rawStatus === 'missed' || rawDir === 'missed') {
    outcome = 'missed';
  } else if (rawStatus === 'rejected' || rawDir === 'rejected') {
    outcome = 'rejected';
  } else if (/^(connected|answered|completed|success)/.test(rawStatus)) {
    outcome = 'connected';
  } else if (rawStatus) {
    outcome =
      duration > 0 && !/no.?answer|busy|fail|not.?connect/.test(rawStatus)
        ? 'connected'
        : 'not_connected';
  } else {
    outcome = duration > 0 ? 'connected' : 'not_connected';
  }

  const agentObj = obj(c.agent);

  return {
    id: pick(c, ['id', 'call_id', 'client_call_id']) || `${lead.id}-${startedAt}-${i}`,
    leadId: lead.id,
    startedAt,
    duration: outcome === 'connected' ? duration : 0,
    direction,
    outcome,
    connected: outcome === 'connected',
    missedIncoming:
      direction === 'incoming' && (outcome === 'missed' || outcome === 'rejected'),
    agentId:
      pick(c, ['agent_id', 'called_by_id']) ||
      (agentObj && str(agentObj.id)),
    agentName:
      pick(c, ['agent_name', 'called_by']) ||
      (agentObj && str(agentObj.name)) ||
      str(c.agent),
    placedFromApp:
      typeof c.placed_from_app === 'boolean' ? c.placed_from_app : undefined,
  };
}

function parseLead(j) {
  const phone =
    pick(j, ['phone', 'mobile', 'phone_number', 'mobile_number', 'contact']) || '';

  const id = pick(j, ['id', 'lead_id', '_id']) || phone;
  const assigned = obj(j.assigned_agent) || obj(j.assigned_to) || obj(j.agent);

  const lead = {
    id,
    name: pick(j, ['name', 'customer_name', 'full_name', 'lead_name']) || 'Unknown',
    phone,
    status: pick(j, ['status', 'stage', 'lead_status']) || '',
    source: pick(j, ['source', 'lead_source', 'channel']) || 'Unknown',
    createdAt: parseTime(
      firstDefined(j, [
        'created_at',
        'generated_at',
        'lead_created_at',
        'received_at',
        'createdAt',
      ])
    ),
    assignedAgentId:
      pick(j, ['assigned_agent_id']) ||
      (assigned && str(assigned.id)) ||
      pick(j, ['agent_id']),
    assignedAgentName:
      pick(j, ['assigned_agent_name', 'assigned_agent', 'assigned_to', 'agent_name']) ||
      (assigned && str(assigned.name)),
    calls: [],
  };

  const rawCalls =
    [j.call_logs, j.calls, j.call_history, j.history].find(Array.isArray) || [];

  const seen = new Set();

  lead.calls = rawCalls
    .map((c, i) => (obj(c) ? parseCall(c, i, lead) : null))
    .filter(c => c !== null)
    .sort((a, b) => a.startedAt - b.startedAt)
    .filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });

  return lead;
}

/** Accepts {leads, agents}, {data}, or a bare array of leads. */
export function normalizeData(raw) {
  const r = raw;

  const list =
    (Array.isArray(r)
      ? r
      : (r && (r.leads || r.data || r.results)) || []);

  const leads = list
    .filter(x => obj(x))
    .map(x => parseLead(x));
    // .filter(l => l.phone || l.calls.length);

  const agents = new Map();
  const byName = new Map();

  const addAgent = (id, name, phone) => {
    if (!id && !name) return null;

    const key =
      id ||
      (name && byName.get(name.toLowerCase())) ||
      `name:${name.toLowerCase()}`;

    let a = agents.get(key);

    if (!a) {
      a = { key, id, name: name || id || key, phone };
      agents.set(key, a);
    }

    if (!a.name || a.name === a.id) a.name = name || a.name;
    if (name) byName.set(name.toLowerCase(), key);

    return key;
  };

  const rawAgents =
    r && !Array.isArray(r) && Array.isArray(r.agents) ? r.agents : [];

  for (const a of rawAgents) {
    const o = obj(a);

    if (o) {
      addAgent(
        pick(o, ['id', 'agent_id']),
        pick(o, ['name', 'agent_name']),
        pick(o, ['phone'])
      );
    }
  }

  for (const l of leads) {
    l.agentKey = addAgent(l.assignedAgentId, l.assignedAgentName);

    if (l.agentKey && !l.assignedAgentName) {
      l.assignedAgentName = agents.get(l.agentKey).name;
    }

    for (const c of l.calls) {
      c.agentKey = addAgent(c.agentId, c.agentName);

      if (c.agentKey && !c.agentName) {
        c.agentName = agents.get(c.agentKey).name;
      }
    }
  }

  const agentList = [...agents.values()].sort((a, b) =>
    String(a.name).localeCompare(String(b.name))
  );

  return { leads, agents: agentList };
}

// ---- Helpers ------------------------------------------------------------------

export function median(xs) {
  if (!xs.length) return undefined;

  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);

  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const sum = xs => xs.reduce((a, b) => a + b, 0);
const ratio = (a, b) => (b > 0 ? a / b : undefined);
const defined = x => x !== undefined;

const dayKey = t => {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export function startOfDay(t) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const minutesOfDay = t => {
  const d = new Date(t);
  return d.getHours() * 60 + d.getMinutes();
};

function bestHourFromCalls(calls, rules) {
  const by = new Map();

  for (const c of calls) {
    if (c.direction !== 'outgoing') continue;

    const h = new Date(c.startedAt).getHours();
    const b = by.get(h) || { attempts: 0, connected: 0 };

    b.attempts++;
    if (c.connected) b.connected++;

    by.set(h, b);
  }

  let best;

  for (const [hour, b] of [...by.entries()].sort((x, y) => x[0] - y[0])) {
    if (b.attempts < rules.minCallsForBestHour) continue;

    const rate = b.connected / b.attempts;

    if (!best || rate > best.rate) {
      best = { hour, rate, attempts: b.attempts };
    }
  }

  return best;
}

export function hourLabel(h) {
  const s = x => {
    const hh = x % 24;
    return `${hh % 12 || 12} ${hh < 12 ? 'AM' : 'PM'}`;
  };

  return `${s(h)}–${s(h + 1)}`;
}

export function ago(ms) {
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / MIN))} min`;
  if (ms < 2 * DAY) return `${Math.round(ms / HOUR)} h`;
  return `${Math.round(ms / DAY)} days`;
}

// ---- Per-lead follow-up state ---------------------------------------------------

export function leadSummary(lead, now, rules, bestHour) {
  const calls = lead.calls.filter(c => c.startedAt <= now);
  const outgoing = calls.filter(c => c.direction === 'outgoing');
  const connected = calls.filter(c => c.connected);
  const meaningful = connected.filter(c => c.duration >= rules.meaningfulSeconds);

  // First call made after the lead arrived (older calls to the same number don't count).
  const firstCall = outgoing.filter(
    c => lead.createdAt === undefined || c.startedAt >= lead.createdAt - MIN
  )[0];

  const firstConnect = connected[0];
  const lastCall = calls[calls.length - 1];
  const lastOutgoing = outgoing[outgoing.length - 1];
  const lastContact = connected[connected.length - 1];

  const missedPending = calls.filter(
    c =>
      c.missedIncoming &&
      (!lastOutgoing || c.startedAt > lastOutgoing.startedAt) &&
      (!lastContact || c.startedAt > lastContact.startedAt)
  );

  const s = {
    lead,
    attempts: outgoing.length,
    connectedCalls: connected.length,
    meaningfulCalls: meaningful.length,
    talkSeconds: sum(connected.map(c => c.duration)),
    firstCallAt: firstCall?.startedAt,
    timeToFirstCall:
      firstCall && lead.createdAt !== undefined
        ? Math.max(0, firstCall.startedAt - lead.createdAt)
        : undefined,
    timeToConnect:
      firstConnect && lead.createdAt !== undefined
        ? Math.max(0, firstConnect.startedAt - lead.createdAt)
        : undefined,
    attemptsBeforeConnect: firstConnect
      ? outgoing.filter(c => c.startedAt <= firstConnect.startedAt).length
      : undefined,
    lastCall,
    lastContactAt: lastContact?.startedAt,
    missedPending: missedPending.length,
    closed: CLOSED_RE.test(lead.status),
    converted: CONVERTED_RE.test(lead.status),
    ageMs: lead.createdAt !== undefined ? now - lead.createdAt : undefined,
  };

  // Next action, most urgent first.
  let level;
  let action;

  if (s.closed) {
    level = 'closed';
    action = lead.status || 'Closed';
  } else if (missedPending.length) {
    level = 'critical';
    action = `Call back: missed call ${ago(now - missedPending[missedPending.length - 1].startedAt)} ago`;
  } else if (s.attempts === 0) {
    level = 'critical';
    action =
      s.ageMs !== undefined
        ? `Make first call (waiting ${ago(s.ageMs)})`
        : 'Make first call';
  } else if (!s.connectedCalls) {
    const since = now - lastOutgoing.startedAt;

    if (s.attempts >= rules.maxBlindAttempts) {
      level = 'serious';
      action = `Not reachable after ${s.attempts} tries: ${bestHour ? `try ${hourLabel(bestHour.hour)} or ` : ''
        }send a WhatsApp message`;
    } else if (since >= rules.retryAfterHours * HOUR) {
      level = 'warning';
      action = `Retry call (attempt ${s.attempts + 1})${bestHour ? `, best ${hourLabel(bestHour.hour)}` : ''
        }`;
    } else {
      level = 'ok';
      action = `Retry after ${ago(rules.retryAfterHours * HOUR - since)}`;
    }
  } else {
    const quiet = now - s.lastContactAt;

    if (quiet >= rules.followUpHours * HOUR) {
      level = 'warning';
      action = `Follow up: last spoke ${ago(quiet)} ago`;
    } else if (!s.meaningfulCalls && quiet >= 24 * HOUR) {
      level = 'warning';
      action = `Calls so far under ${Math.round(rules.meaningfulSeconds / 60)} min: have a full conversation`;
    } else {
      level = 'ok';
      action = `In touch (spoke ${ago(quiet)} ago)`;
    }
  }

  const rank = { critical: 0, serious: 1, warning: 2, ok: 3, closed: 4 }[level];

  return { ...s, level, action, rank };
}

// ---- Dashboard ------------------------------------------------------------------

const SPEED_BUCKETS = [
  { key: 'lt5', label: 'Under 5 min', max: 5 * MIN },
  { key: 'lt30', label: '5–30 min', max: 30 * MIN },
  { key: 'lt2h', label: '30 min–2 h', max: 2 * HOUR },
  { key: 'lt24h', label: '2–24 h', max: 24 * HOUR },
  { key: 'gt24h', label: 'Over 1 day', max: Infinity },
];

export function computeDashboard(data, opts = {}) {
  const rules = { ...DEFAULT_RULES, ...stripUndefined(opts) };
  const now = opts.now ?? Date.now();
  const from = opts.from ?? -Infinity;
  const to = opts.to ?? now;

  const inRange = t => t !== undefined && t >= from && t <= to;

  const allCalls = [];

  for (const l of data.leads) {
    for (const c of l.calls) {
      if (c.startedAt <= now) allCalls.push(c);
    }
  }

  const scopeLeads = data.leads.filter(
    l => !opts.source || l.source === opts.source
  );

  const scopeIds = new Set(scopeLeads.map(l => l.id));

  const rangeCalls = allCalls.filter(
    c => inRange(c.startedAt) && scopeIds.has(c.leadId)
  );

  const bestHourAll = bestHourFromCalls(rangeCalls, rules);

  // Leads without a created date are kept: they can't be dated.
  const periodLeads = scopeLeads;

  const summaries = periodLeads
    .filter(l => !opts.agentKey || l.agentKey === opts.agentKey)
    .map(l => leadSummary(l, now, rules, bestHourAll));

  // ---- Leads view
  const called = summaries.filter(s => s.attempts > 0);
  const contacted = summaries.filter(s => s.connectedCalls > 0);
  const meaningful = summaries.filter(s => s.meaningfulCalls > 0);
  const ttf = called.map(s => s.timeToFirstCall).filter(defined);
  const needsAction = summaries.filter(s => s.rank <= 2);

  const speed = SPEED_BUCKETS.map(b => ({
    key: b.key,
    label: b.label,
    count: 0,
  }));

  for (const t of ttf) {
    const i = SPEED_BUCKETS.findIndex(b => t < b.max);
    if (i >= 0) speed[i].count++;
  }

  speed.push({
    key: 'never',
    label: 'Not called yet',
    count: summaries.length - called.length,
  });

  const callsForLeadsView = opts.agentKey
    ? rangeCalls.filter(c => c.agentKey === opts.agentKey)
    : rangeCalls;

  const hourly = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    attempts: 0,
    connected: 0,
  }));

  for (const c of callsForLeadsView) {
    if (c.direction !== 'outgoing') continue;

    const b = hourly[new Date(c.startedAt).getHours()];
    b.attempts++;
    if (c.connected) b.connected++;
  }

  for (const b of hourly) b.rate = ratio(b.connected, b.attempts);

  const bestHour = bestHourFromCalls(callsForLeadsView, rules);

  const sources = new Map();

  for (const s of summaries) {
    const k = s.lead.source;

    const x = sources.get(k) || {
      source: k,
      leads: 0,
      called: 0,
      contacted: 0,
      converted: 0,
      ttf: [],
    };

    x.leads++;
    if (s.attempts) x.called++;
    if (s.connectedCalls) x.contacted++;
    if (s.converted) x.converted++;
    if (s.timeToFirstCall !== undefined) x.ttf.push(s.timeToFirstCall);

    sources.set(k, x);
  }

  const sourceRows = [...sources.values()]
    .map(x => ({
      source: x.source,
      leads: x.leads,
      calledRate: ratio(x.called, x.leads),
      contactRate: ratio(x.contacted, x.leads),
      converted: x.converted,
      medianFirstCall: median(x.ttf),
    }))
    .sort((a, b) => b.leads - a.leads);

  const abc = contacted
    .map(s => s.attemptsBeforeConnect)
    .filter(defined);

  const leadsView = {
    kpis: {
      generated: summaries.length,
      notCalled: summaries.length - called.length,
      medianFirstCall: median(ttf),
      contactRate: ratio(contacted.length, summaries.length),
      attemptsToConnect: abc.length ? sum(abc) / abc.length : undefined,
      needsAction: needsAction.length,
      critical: summaries.filter(s => s.level === 'critical').length,
      converted: summaries.filter(s => s.converted).length,
    },

    funnel: [
      { key: 'generated', label: 'Leads generated', count: summaries.length },
      { key: 'called', label: 'Called at least once', count: called.length },
      { key: 'contacted', label: 'Connected', count: contacted.length },
      {
        key: 'meaningful',
        label: `Talked ${Math.round(rules.meaningfulSeconds / 60)}+ min`,
        count: meaningful.length,
      },
    ],

    speed,
    hourly,
    bestHour,
    sources: sourceRows,

    rows: [...summaries].sort(
      (a, b) => a.rank - b.rank || (b.ageMs || 0) - (a.ageMs || 0)
    ),
  };

  // ---- Agents view
  const agentsScope = opts.agentKey
    ? data.agents.filter(a => a.key === opts.agentKey)
    : data.agents;

  const periodSummaries = periodLeads.map(
    l => leadSummary(l, now, rules, bestHourAll)
  );

  const sparkDays = 14;
  const sparkStart = startOfDay(Math.min(to, now)) - (sparkDays - 1) * DAY;

  const agentRows = agentsScope
    .map(a => {
      const mine = rangeCalls.filter(c => c.agentKey === a.key);
      const out = mine.filter(c => c.direction === 'outgoing');
      const conn = mine.filter(c => c.connected);
      const outConn = out.filter(c => c.connected);

      const assigned = periodSummaries.filter(s => s.lead.agentKey === a.key);
      const assignedCalled = assigned.filter(s => s.attempts > 0);

      const days = new Map();

      for (const c of mine) {
        const k = dayKey(c.startedAt);
        const d = days.get(k) || {
          first: c.startedAt,
          last: c.startedAt,
        };

        d.first = Math.min(d.first, c.startedAt);
        d.last = Math.max(d.last, c.startedAt);
        days.set(k, d);
      }

      const dayList = [...days.values()];
      const spark = new Array(sparkDays).fill(0);

      for (const c of out) {
        const idx = Math.round(
          (startOfDay(c.startedAt) - sparkStart) / DAY
        );

        if (idx >= 0 && idx < sparkDays) spark[idx]++;
      }

      const hours = new Array(24).fill(0);

      for (const c of out) {
        hours[new Date(c.startedAt).getHours()]++;
      }

      const appKnown = out.filter(c => c.placedFromApp !== undefined);
      const talk = sum(conn.map(c => c.duration));
      const converted = assigned.filter(s => s.converted).length;

      return {
        agent: a,
        assigned: assigned.length,
        assignedCalled: assignedCalled.length,
        coverage: ratio(assignedCalled.length, assigned.length),
        leadsCalled: new Set(out.map(c => c.leadId)).size,
        calls: out.length,
        connected: outConn.length,
        connectRate: ratio(outConn.length, out.length),
        talkSeconds: talk,
        avgCallSeconds: conn.length ? talk / conn.length : undefined,
        meaningfulCalls: conn.filter(
          c => c.duration >= rules.meaningfulSeconds
        ).length,
        medianFirstCall: median(
          assigned.map(s => s.timeToFirstCall).filter(defined)
        ),
        notCalled: assigned.length - assignedCalled.length,
        followUpsDue: assigned.filter(s => s.rank <= 2).length,
        missedNotReturned: assigned.filter(
          s => s.missedPending > 0 && !s.closed
        ).length,
        converted,
        conversionRate: ratio(converted, assigned.length),
        activeDays: dayList.length,
        callsPerDay: dayList.length ? out.length / dayList.length : undefined,
        typicalStart: median(dayList.map(d => minutesOfDay(d.first))),
        typicalEnd: median(dayList.map(d => minutesOfDay(d.last))),
        appShare: ratio(
          appKnown.filter(c => c.placedFromApp).length,
          appKnown.length
        ),
        spark,
        hours,
        dueLeads: assigned
          .filter(s => s.rank <= 2)
          .sort((x, y) => x.rank - y.rank),
        flags: [],
      };
    })
    .filter(r => r.calls || r.assigned || r.talkSeconds);

  // Flags compare each agent with the team (needs 2+ agents to mean anything).
  const teamConnect = median(agentRows.map(r => r.connectRate).filter(defined));
  const teamFirst = median(agentRows.map(r => r.medianFirstCall).filter(defined));
  const teamDue = median(
    agentRows.map(r => ratio(r.followUpsDue, r.assigned)).filter(defined)
  );
  const teamCoverage = median(agentRows.map(r => r.coverage).filter(defined));

  for (const r of agentRows) {
    const f = [];

    if (agentRows.length > 1) {
      if (
        r.medianFirstCall !== undefined &&
        teamFirst !== undefined &&
        r.medianFirstCall > Math.max(30 * MIN, 2 * teamFirst)
      ) {
        f.push({ level: 'serious', text: 'Slow first call' });
      }

      if (
        r.connectRate !== undefined &&
        teamConnect !== undefined &&
        r.calls >= 10 &&
        r.connectRate < 0.75 * teamConnect
      ) {
        f.push({ level: 'warning', text: 'Low connect rate' });
      }

      if (
        r.coverage !== undefined &&
        teamCoverage !== undefined &&
        r.assigned >= 5 &&
        r.coverage < teamCoverage - 0.08
      ) {
        f.push({ level: 'warning', text: 'Leads left uncalled' });
      }
    }

    if (r.missedNotReturned > 0) {
      f.push({
        level: 'critical',
        text: `${r.missedNotReturned} missed not returned`,
      });
    }

    const dueShare = ratio(r.followUpsDue, r.assigned);

    if (
      agentRows.length > 1 &&
      dueShare !== undefined &&
      teamDue !== undefined &&
      r.followUpsDue >= 5 &&
      dueShare > 1.4 * teamDue
    ) {
      f.push({ level: 'warning', text: 'Behind on follow-ups' });
    }

    r.flags = f;
  }

  agentRows.sort(
    (a, b) => b.talkSeconds - a.talkSeconds || b.calls - a.calls
  );

  const tOut = rangeCalls.filter(
    c => c.direction === 'outgoing' &&
      (!opts.agentKey || c.agentKey === opts.agentKey)
  );

  const tConn = rangeCalls.filter(
    c => c.connected &&
      (!opts.agentKey || c.agentKey === opts.agentKey)
  );

  const agentsView = {
    kpis: {
      activeAgents: agentRows.filter(r => r.calls > 0).length,
      calls: tOut.length,
      leadsCalled: new Set(tOut.map(c => c.leadId)).size,
      talkSeconds: sum(tConn.map(c => c.duration)),
      connectRate: ratio(tOut.filter(c => c.connected).length, tOut.length),
      medianFirstCall: leadsView.kpis.medianFirstCall,
      avgCallSeconds: tConn.length
        ? sum(tConn.map(c => c.duration)) / tConn.length
        : undefined,
    },
    rows: agentRows,
    sparkStart,
    sparkDays,
    hasConversions: data.leads.some(l => CONVERTED_RE.test(l.status)),
    hasAppFlag: rangeCalls.some(c => c.placedFromApp !== undefined),
  };

  return {
    rules,
    now,
    from,
    to,
    leadsView,
    agentsView,
    sources: [...new Set(data.leads.map(l => l.source))].sort(),
    agents: data.agents,
    hasCreatedDates: data.leads.some(l => l.createdAt !== undefined),
  };
}

function stripUndefined(o) {
  const out = {};

  for (const [k, v] of Object.entries(o)) {
    if (v !== undefined) out[k] = v;
  }

  return out;
}

