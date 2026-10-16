
/** Display formatting (Indian number grouping, 12-hour clock). */
import { DAY, HOUR, MIN } from './metrics';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const int = (n) => (n === undefined ? '–' : Math.round(n).toLocaleString('en-IN'));
export const pct = (r) => (r === undefined ? '–' : `${Math.round(r * 100)}%`);

export function clock(t) {
  const d = new Date(t);
  return `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
}

export function minutesClock(m) {
  if (m === undefined) return '–';
  const h = Math.floor(m / 60);
  const mm = Math.round(m % 60);
  return `${h % 12 || 12}:${String(mm).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export function date(t) {
  if (t === undefined) return '–';
  const d = new Date(t);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(t);
  day.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - day.getTime()) / DAY);
  const label = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday'
    : `${d.getDate()} ${MONTHS[d.getMonth()]}${d.getFullYear() !== today.getFullYear() ? ` ${d.getFullYear()}` : ''}`;
  return `${label}, ${clock(t)}`;
}

export function shortDate(t) {
  const d = new Date(t);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Talk time: "2 h 05 m", "4 m 12 s", "45 s". */
export function talk(s) {
  if (s === undefined) return '–';
  s = Math.round(s);
  if (s >= 3600) return `${Math.floor(s / 3600)} h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')} m`;
  if (s >= 60) return `${Math.floor(s / 60)} m ${String(s % 60).padStart(2, '0')} s`;
  return `${s} s`;
}

/** Waiting time: "12 min", "3.5 h", "2.1 days". */
export function wait(ms) {
  if (ms === undefined) return '–';
  if (ms < HOUR) return `${Math.max(0, Math.round(ms / MIN))} min`;
  if (ms < DAY) return `${(ms / HOUR).toFixed(ms < 10 * HOUR ? 1 : 0)} h`;
  return `${(ms / DAY).toFixed(1)} days`;
}

export const OUTCOME = {
  connected: 'Connected',
  not_connected: 'No answer',
  missed: 'Missed (incoming)',
  rejected: 'Rejected',
};

export const LEVEL_LABEL = {
  critical: 'Urgent',
  serious: 'Stuck',
  warning: 'Due',
  ok: 'On track',
  closed: 'Closed',
};

export const PERIODS = [
  { key: 'today', label: 'Today', phrase: 'today' },
  { key: '7d', label: '7 days', phrase: 'in the last 7 days' },
  { key: '30d', label: '30 days', phrase: 'in the last 30 days' },
  { key: '90d', label: '90 days', phrase: 'in the last 90 days' },
  { key: 'all', label: 'All', phrase: 'all time' },
];

export function periodRange(p, now) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const s = start.getTime();

  switch (p) {
    case 'today': return { from: s, to: now };
    case '7d': return { from: s - 6 * DAY, to: now };
    case '30d': return { from: s - 29 * DAY, to: now };
    case '90d': return { from: s - 89 * DAY, to: now };
    default: return { from: undefined, to: undefined }; // 'all'
  }
}
/** Rules for next actions and flags, from NEXT_PUBLIC_* env (see .env.example). */
export const RULES = {
  meaningfulSeconds: Number(process.env.NEXT_PUBLIC_MEANINGFUL_SECONDS) || 120,
  followUpHours: Number(process.env.NEXT_PUBLIC_FOLLOW_UP_HOURS) || 48,
  retryAfterHours: Number(process.env.NEXT_PUBLIC_RETRY_AFTER_HOURS) || 4,
  maxBlindAttempts: Number(process.env.NEXT_PUBLIC_MAX_BLIND_ATTEMPTS) || 3,
  minCallsForBestHour: 5,
};

export const REFRESH_MINUTES = process.env.NEXT_PUBLIC_REFRESH_MINUTES === undefined
  ? 5
  : Number(process.env.NEXT_PUBLIC_REFRESH_MINUTES) || 0;
