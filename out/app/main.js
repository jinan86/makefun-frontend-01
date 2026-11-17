// A make.fun frontend: board, bounty, leaderboard, odds, rankings, profiles
// and docs on hash routes. window.__shotReady is false while a page loads and
// true once its data is on screen, so a screenshot script knows when to capture.
import { get, getBounties, getBounty, getLeaderboard, getMarket, getProfile, getRankings } from './api.js';
import { board, bounty, docs, errorBox, leaderboard, odds, profile, rankings } from './views.js';

const app = document.getElementById('app');
const searchInput = document.getElementById('q');
const searchForm = document.getElementById('search');

function route() {
  const [path, query] = location.hash.slice(1).split('?');
  const params = new URLSearchParams(query ?? '');
  const parts = (path || '/').split('/').filter(Boolean);
  return { parts, params };
}

function refreshBoardData(fresh) {
  if (route().parts.length === 0) render(true);
}

async function render(keepScroll = false) {
  window.__shotReady = false;
  const { parts, params } = route();
  const y = window.scrollY;
  try {
    if (parts.length === 0) {
      const q = params.get('q') ?? searchInput.value ?? '';
      searchInput.value = q;
      const data = await getBounties();
      app.innerHTML = board(data, q, params.get('sort') || 'pot');
    } else if (parts[0] === 'bounty' && parts[1] && parts[2] === 'leaderboard') {
      const data = await getLeaderboard(parts[1]);
      app.innerHTML = leaderboard(data, parts[1]);
    } else if (parts[0] === 'bounty' && parts[1]) {
      const [b, market] = await Promise.all([
        getBounty(parts[1]),
        getMarket(parts[1]).catch(() => null),
      ]);
      document.title = `${b.title} | make.fun lite`;
      app.innerHTML = bounty(b, market);
    } else if (parts[0] === 'odds') {
      const slug = params.get('bounty') || 'makefun-frontend-01';
      const [market, bounties] = await Promise.all([getMarket(slug), getBounties()]);
      app.innerHTML = odds(market, slug, bounties.items);
    } else if (parts[0] === 'rankings') {
      app.innerHTML = rankings(await getRankings(50));
    } else if (parts[0] === 'profile' && parts[1]) {
      const p = await getProfile(decodeURIComponent(parts[1]));
      document.title = `@${p.handle} | make.fun lite`;
      app.innerHTML = profile(p);
    } else if (parts[0] === 'docs') {
      app.innerHTML = docs();
    } else {
      app.innerHTML = '<h1>Not found</h1><p><a href="#/">Back to the board</a></p>';
    }
    if (parts.length === 0) document.title = 'make.fun bounties';
  } catch (err) {
    app.innerHTML = errorBox(err);
  }
  const h1 = app.querySelector('h1');
  if (h1 && !keepScroll) h1.focus({ preventScroll: true });
  // Hide a profile picture that fails to load (no inline on* handlers: the
  // finalist review disqualifies code in an on* attribute).
  app.querySelectorAll('.profile-head img').forEach((img) => {
    img.addEventListener('error', () => { img.style.display = 'none'; }, { once: true });
  });
  window.scrollTo(0, keepScroll ? y : 0);
  window.__shotReady = true;
}

// Live countdowns tick in place every 30 s, without a refetch.
setInterval(() => {
  const now = Date.now();
  document.querySelectorAll('[data-deadline]').forEach((el) => {
    const ms = new Date(el.dataset.deadline).getTime() - now;
    el.textContent = ms <= 0 ? 'ended' : (() => {
      const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000);
      return d > 0 ? `${d}d ${h}h left` : h > 0 ? `${h}h ${m}m left` : `${m}m left`;
    })();
  });
}, 30_000);

// Search: '@handle' jumps to a profile, anything else filters the board.
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (q.startsWith('@')) location.hash = `#/profile/${encodeURIComponent(q.slice(1))}`;
  else location.hash = `#/?q=${encodeURIComponent(q)}`;
});
searchInput.addEventListener('input', () => {
  const { parts } = route();
  if (parts.length === 0) render(true);
});
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) { e.preventDefault(); searchInput.focus(); }
  if (e.key === 'Escape' && document.activeElement === searchInput) { searchInput.value = ''; searchInput.blur(); location.hash = '#/'; }
});
app.addEventListener('click', (e) => {
  if (e.target.closest('[data-retry]')) render();
});

window.addEventListener('hashchange', () => render());
render();
