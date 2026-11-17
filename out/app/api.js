// make.fun public API (read-only GET, CORS open). ETag cache: the API sends
// ETags, so a revalidation costs a 304 instead of a full body; a fresh-enough
// answer is shown at once and revalidated in the background.
const API = 'https://make.fun/api';
const cache = new Map(); // url -> { etag, body, at }
const TTL = 60_000;

function key(url) { return 'mf:' + url; }

async function fetchJson(path, { revalidate = false } = {}) {
  const url = API + path;
  const hit = cache.get(url);
  if (hit && !revalidate && Date.now() - hit.at < TTL) return hit.body;
  const headers = {};
  if (hit?.etag) headers['If-None-Match'] = hit.etag;
  let res;
  try {
    res = await fetch(url, { headers });
  } catch {
    if (hit) return hit.body; // offline: serve the last good answer
    throw new Error('Network error — check your connection and retry.');
  }
  if (res.status === 304 && hit) { hit.at = Date.now(); return hit.body; }
  if (!res.ok) {
    if (hit) return hit.body;
    throw new Error(`make.fun answered ${res.status} for ${path}`);
  }
  const body = await res.json();
  const etag = res.headers.get('ETag');
  cache.set(url, { etag, body, at: Date.now() });
  try { localStorage.setItem(key(url), JSON.stringify({ etag, body, at: Date.now() })); } catch {}
  return body;
}

/** Show a cached answer instantly, then refresh it in the background. */
export async function get(path, onFresh) {
  const url = API + path;
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL) {
    if (onFresh) fetchJson(path, { revalidate: true }).then(onFresh).catch(() => {});
    return hit.body;
  }
  try {
    const raw = localStorage.getItem(key(url));
    if (raw) {
      const saved = JSON.parse(raw);
      cache.set(url, saved);
      if (Date.now() - saved.at < 10 * 60_000) {
        if (onFresh) fetchJson(path, { revalidate: true }).then(onFresh).catch(() => {});
        return saved.body;
      }
    }
  } catch {}
  return fetchJson(path);
}

export const getBounties = () => get('/competitions?status=open&activity=times');
export const getBounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);
export const getLeaderboard = (slug) => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);
export const getMarket = (slug) => get(`/competitions/${encodeURIComponent(slug)}/market`);
export const getRankings = (limit = 50) => get(`/rankings?limit=${limit}`);
export const getProfile = (handle) => get(`/profiles/${encodeURIComponent(handle)}`);
export const avatarUrl = (path) => (path ? (path.startsWith('http') ? path : API + path) : null);
