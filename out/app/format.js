// Small helpers for showing API values.

/** Text made safe to put inside HTML. */
export function esc(value) {
  return String(value ?? '').replace(/[&<>\"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** A dollar amount ('1000.00' or 0.5) as '$1,000' or '$0.50'. */
export function money(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(n) ? 0 : 2 });
}

/** A deadline as a date in UTC. */
export function date(iso) {
  const d = new Date(iso);
  return Number.isNaN(d) ? '—' : `${d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC`;
}

/** Milliseconds until a deadline, as '2d 4h left', '35m left', or 'ended'. */
export function timeLeft(iso, now = Date.now()) {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return 'ended';
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

/** A judge win-rate in micro units (956066) as '95.6%'. */
export function pct(micro) {
  const n = Number(micro);
  return Number.isFinite(n) ? `${(n / 10000).toFixed(1)}%` : '—';
}

/** 'F6chzXKErAHKA5zK9KW3FLR9EePTC5dqmJr4p73Qv3xx' -> 'F6ch…v3xx'. */
export function trunc(addr, head = 4, tail = 4) {
  const s = String(addr ?? '');
  return s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;
}
