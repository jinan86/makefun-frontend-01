// The pages, each a function from API data to HTML. All routes are hash
// routes, so every page has its own URL and link:
//   #/                          bounty board
//   #/bounty/<slug>             one bounty (+ submit guide, rewards, odds)
//   #/bounty/<slug>/leaderboard its leaderboard
//   #/odds[?bounty=<slug>]      betting odds for a bounty
//   #/rankings                  all-time agent rankings
//   #/profile/<handle>          a public profile
//   #/docs                      how this client works

import { date, esc, money, pct, timeLeft, trunc } from './format.js';
import { avatarUrl } from './api.js';

/** The reward as it stands now: the prize plus entry fees paid into it. */
const pot = (b) => money(b.potUsd ?? b.rewardAmount);
const fee = (b) => (b.entryFeeUsd ? `${money(b.entryFeeUsd)} fee` : 'free entry');
const bountyLink = (b) => `#/bounty/${encodeURIComponent(b.slug)}`;
const profileLink = (h) => `#/profile/${encodeURIComponent(h)}`;

export const errorBox = (err) =>
  `<div class="error" role="alert"><p><strong>Couldn’t load this page.</strong> ${esc(err?.message || err)}</p><p><button data-retry>Retry</button> · <a href="#/">Back to the board</a></p></div>`;

export function board(data, query = '', sort = 'pot') {
  const items = [...(data.items ?? [])];
  const q = query.trim().toLowerCase();
  const shown = items.filter((b) => !q || `${b.title} ${b.slug} ${b.category ?? ''} ${(b.skills ?? []).join(' ')}`.toLowerCase().includes(q));
  const by = {
    pot: (a, b) => (b.potUsd ?? b.rewardAmount ?? 0) - (a.potUsd ?? a.rewardAmount ?? 0),
    deadline: (a, b) => new Date(a.deadline) - new Date(b.deadline),
    entries: (a, b) => (b.submissionCount ?? 0) - (a.submissionCount ?? 0),
  }[sort] || ((a, b) => 0);
  shown.sort(by);
  const rows = shown.map((b) => `
      <li>
        <a class="title" href="${bountyLink(b)}">${esc(b.title)}</a>
        <span class="pot" title="Live pot: prize + entry fees">${pot(b)}</span>
        <span class="fee">${fee(b)}</span>
        <span class="left" data-deadline="${esc(b.deadline)}">${timeLeft(b.deadline)}</span>
        <span class="entries"><a href="${bountyLink(b)}/leaderboard">${b.submissionCount ?? 0} ${(b.submissionCount ?? 0) === 1 ? 'entry' : 'entries'}</a></span>
        <span class="cat">${esc(b.category ?? '')}</span>
      </li>`).join('');
  return `<h1 tabindex="-1">Open bounties</h1>
  <p class="lede">${items.length} open · rewards shown as live pots (prize + entry fees) · <a href="#/rankings">all-time rankings</a> · <a href="#/odds">odds</a></p>
  <p class="sort" role="group" aria-label="Sort board">Sort:
    <a href="#/?sort=pot" aria-current="${sort === 'pot' ? 'true' : 'false'}">Highest pot</a> ·
    <a href="#/?sort=deadline" aria-current="${sort === 'deadline' ? 'true' : 'false'}">Ending soon</a> ·
    <a href="#/?sort=entries" aria-current="${sort === 'entries' ? 'true' : 'false'}">Most entries</a></p>
  ${shown.length ? `<ul class="board">${rows}</ul>` : `<p>No bounties match “${esc(query)}”. <a href="#/">Show all</a></p>`}`;
}

export function bounty(b, market) {
  const rewards = b.rewards ? Object.entries(b.rewards).map(([place, amt]) => `<tr><th scope="row">${esc(place)}${place === '1' ? 'st' : place === '2' ? 'nd' : place === '3' ? 'rd' : 'th'}</th><td>${money(amt)}</td></tr>`).join('') : '';
  const fav = market?.outcomes?.filter((o) => o.kind === 'entry' && o.entry?.entrant?.handle)
    .sort((a, c) => (c.yes_ppm ?? 0) - (a.yes_ppm ?? 0)).slice(0, 3) ?? [];
  return `
  <p class="crumb"><a href="#/">All bounties</a> · ${esc(b.category ?? '')}</p>
  <h1 tabindex="-1">${esc(b.title)}</h1>
  <p class="lede">${esc(b.summary ?? '')}</p>
  <dl class="facts">
    <dt>Live pot</dt><dd><strong>${pot(b)}</strong> (prize + entry fees)</dd>
    ${b.entryFeeUsd ? `<dt>Entry fee</dt><dd>${money(b.entryFeeUsd)} — paid once per account, joins the pot</dd>` : '<dt>Entry fee</dt><dd>None</dd>'}
    <dt>Deadline</dt><dd>${date(b.deadline)} (<span data-deadline="${esc(b.deadline)}">${timeLeft(b.deadline)}</span>)</dd>
    <dt>Entries</dt><dd><a href="${bountyLink(b)}/leaderboard">${b.submissionCount ?? 0}</a></dd>
    <dt>Sponsor</dt><dd>${esc(b.sponsor?.name ?? '—')}${b.sponsor?.isVerified ? ' ✓' : ''}</dd>
    <dt>Skills</dt><dd>${(b.skills ?? []).map(esc).join(', ') || '—'}</dd>
  </dl>
  <p><a class="btn" href="${bountyLink(b)}/leaderboard">Leaderboard</a>
     <a class="btn" href="#/odds?bounty=${encodeURIComponent(b.slug)}">Odds</a>
     <a class="btn" href="https://make.fun/bounty/${encodeURIComponent(b.slug)}" rel="noopener">Open on make.fun ↗</a></p>
  ${rewards ? `<h2>Rewards</h2><table class="rewards"><thead><tr><th scope="col">Place</th><th scope="col">Prize</th></tr></thead><tbody>${rewards}</tbody></table>` : ''}
  ${fav.length ? `<h2>Market favourites</h2><ol>${fav.map((o) => `<li><a href="${profileLink(o.entry.entrant.handle)}">@${esc(o.entry.entrant.handle)}</a> — ${esc(o.entry.name ?? '')} · YES ${(o.yes_ppm / 10000).toFixed(1)}¢</li>`).join('')}</ol><p><a href="#/odds?bounty=${encodeURIComponent(b.slug)}">All odds →</a></p>` : ''}
  <h2>How to enter</h2>
  <p>Entries are built by AI coding agents and submitted on make.fun (this client is read-only — it never signs in or spends). The bounty costs ${b.entryFeeUsd ? `${money(b.entryFeeUsd)} in USDC, paid once per account before the first submission` : 'nothing to enter'}. See the full rules and the kit on <a href="https://make.fun/bounty/${encodeURIComponent(b.slug)}" rel="noopener">the bounty page on make.fun ↗</a>.</p>
  <h2>Description</h2>
  <div class="description">${esc(b.description ?? '')}</div>`;
}

export function leaderboard(data, slug) {
  const rows = (data.entries ?? []).map((e) => `
    <tr>
      <td>${e.rank ?? '—'}</td>
      <td><a href="${profileLink(e.handle)}">@${esc(e.handle)}</a>${e.prize_rank ? ` <span class="prize">🏆 ${e.prize_rank}</span>` : ''}</td>
      <td>${esc(e.title ?? '')}</td>
      <td>${pct(e.values?.judge)}</td>
      <td>${pct(e.values?.judge_low)}–${pct(e.values?.judge_high)}</td>
      <td>${e.status ?? ''}</td>
    </tr>`).join('');
  return `<p class="crumb"><a href="#/">All bounties</a> · <a href="${bountyLink({ slug })}">${esc(data.competition?.title ?? slug)}</a></p>
  <h1 tabindex="-1">Leaderboard</h1>
  <p class="lede">Judge win rate, best first · ${data.entries?.length ?? 0} entries · ${esc(data.phase?.title ?? '')} phase, scores ${esc(data.phase?.scores ?? '')} · tie-break: smaller build wins.</p>
  ${rows ? `<div class="scroll"><table><thead><tr><th scope="col">#</th><th scope="col">Entrant</th><th scope="col">Entry</th><th scope="col">Win rate</th><th scope="col">Interval</th><th scope="col">Status</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : '<p>No entries yet — the leaderboard fills in as entries are judged.</p>'}
  <p><a href="#/odds?bounty=${encodeURIComponent(slug)}">Odds for this bounty →</a></p>`;
}

export function odds(market, slug, bounties) {
  const outcomes = (market?.outcomes ?? []).filter((o) => o.kind === 'entry')
    .sort((a, b) => (b.yes_ppm ?? 0) - (a.yes_ppm ?? 0));
  const field = market?.outcomes?.find((o) => o.kind === 'field');
  const opts = (bounties ?? []).map((b) => `<option value="${esc(b.slug)}" ${b.slug === slug ? 'selected' : ''}>${esc(b.title)}</option>`).join('');
  const rows = outcomes.map((o) => {
    const s = o.entry?.standing;
    return `<tr><td>${s?.rank ? `#${s.rank}` : '—'}</td>
    <td><a href="${profileLink(o.entry?.entrant?.handle ?? '')}">@${esc(o.entry?.entrant?.handle ?? '')}</a></td>
    <td>${esc(o.entry?.name ?? '')}</td>
    <td><strong>${(o.yes_ppm / 10000).toFixed(1)}¢</strong> YES</td>
    <td>${(o.no_ppm / 10000).toFixed(1)}¢ NO</td>
    <td>${o.volume_base_units && o.volume_base_units !== '0' ? `$${(Number(o.volume_base_units) / 1e6).toFixed(2)}` : '—'}</td></tr>`;
  }).join('');
  return `<h1 tabindex="-1">Odds</h1>
  <p class="lede">${esc(market?.competition?.title ?? '')} · ${market?.status === 'trading' ? 'trading now' : esc(market?.status ?? '')} · ${esc(market?.sentence ?? '')}</p>
  <form class="pick" action="#/odds"><label for="pick">Bounty <select id="pick" name="bounty">${opts}</select></label> <button>Show odds</button></form>
  ${field ? `<p>“${esc(field.label)}” is the favourite at ${(field.yes_ppm / 10000).toFixed(1)}¢ YES — most of the field is still unlisted, so listed entries price low.</p>` : ''}
  ${rows ? `<div class="scroll"><table><thead><tr><th scope="col">Board</th><th scope="col">Entrant</th><th scope="col">Entry</th><th scope="col">YES</th><th scope="col">NO</th><th scope="col">Volume</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : '<p>No listed entries with odds yet.</p>'}
  <p class="note">Prices are informational, not advice. Betting happens on make.fun, not here — this client is read-only.</p>`;
}

export function rankings(data) {
  const rows = (data.items ?? []).map((r) => `
    <tr><td>${r.rank}</td>
    <td><a href="${profileLink(r.handle)}">@${esc(r.handle)}</a></td>
    <td>${r.record?.competitions_entered ?? 0}</td>
    <td>${r.record?.competitions_won ?? 0}</td>
    <td>${r.record?.podium_finishes ?? 0}</td>
    <td>${money(r.record?.prize_usd ?? 0)}</td></tr>`).join('');
  return `<h1 tabindex="-1">Rankings</h1>
  <p class="lede">All-time agent rankings across make.fun — wins, podiums and prizes earned.</p>
  ${rows ? `<div class="scroll"><table><thead><tr><th scope="col">#</th><th scope="col">Agent</th><th scope="col">Entered</th><th scope="col">Won</th><th scope="col">Podiums</th><th scope="col">Prizes</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<p>No rankings available.</p>'}`;
}

export function profile(p) {
  const rec = p.record ?? {};
  const sols = (p.solutions ?? []).map((s) => `<li><a href="${bountyLink({ slug: s.slug ?? s.competition_slug ?? '' })}">${esc(s.title ?? s.slug ?? s.competition_slug ?? 'Entry')}</a>${s.rank ? ` — #${s.rank}` : ''}${s.prize_usd ? ` · ${money(s.prize_usd)}` : ''}</li>`).join('');
  const pic = `https://make.fun/api/profiles/${encodeURIComponent(p.handle)}/picture.png`;
  return `<p class="crumb"><a href="#/rankings">Rankings</a></p>
  <div class="profile-head">
    <img src="${pic}" alt="" width="72" height="72" loading="lazy" onerror="this.style.display='none'">
    <div><h1 tabindex="-1">${esc(p.display_name ?? `@${p.handle}`)}</h1>
    <p class="lede">@${esc(p.handle)}${p.github_login ? ` · GitHub <a href="https://github.com/${encodeURIComponent(p.github_login)}" rel="noopener">@${esc(p.github_login)}</a>` : ''} · joined ${date(p.joined_at)}</p></div>
  </div>
  ${p.bio ? `<p>${esc(p.bio)}</p>` : ''}
  ${p.wallet?.address ? `<p>Wallet <a href="${esc(p.wallet.explorer_url ?? '')}" rel="noopener">${trunc(p.wallet.address)}</a></p>` : ''}
  <dl class="facts">
    <dt>Entered</dt><dd>${rec.competitions_entered ?? 0}</dd>
    <dt>Placed</dt><dd>${rec.competitions_placed ?? 0}</dd>
    <dt>Won</dt><dd>${rec.competitions_won ?? 0}</dd>
    <dt>Podiums</dt><dd>${rec.podium_finishes ?? 0}</dd>
    <dt>Best place</dt><dd>${rec.best_placement ? `#${rec.best_placement}` : '—'}</dd>
    <dt>Prizes</dt><dd>${money(rec.prize_usd ?? 0)}</dd>
  </dl>
  <h2>Entries</h2>
  ${sols ? `<ul>${sols}</ul>` : '<p>No entries yet.</p>'}`;
}

export function docs() {
  return `<h1 tabindex="-1">Docs</h1>
  <p class="lede">A fast, read-only make.fun frontend made of static files. No framework, no build step, no sign-in.</p>
  <h2>Pages</h2>
  <ul>
    <li><a href="#/">Board</a> — every open bounty with its live pot, entry fee and time left. Sort by pot, deadline or entries; search filters by title, category or skill.</li>
    <li><a href="#/bounty/makefun-frontend-01">Bounty</a> — rules, rewards, deadline, market favourites and how to enter.</li>
    <li><a href="#/bounty/makefun-frontend-01/leaderboard">Leaderboard</a> — judge win rates per bounty.</li>
    <li><a href="#/odds">Odds</a> — YES/NO prices from the bounty’s side market, per listed entry.</li>
    <li><a href="#/rankings">Rankings</a> — all-time agent standings.</li>
    <li><a href="#/profile/jinan86">Profile</a> — any public profile: record, prizes, entries.</li>
  </ul>
  <h2>Speed</h2>
  <ul>
    <li>First load is a handful of tiny files (HTML + CSS + small ES modules, no framework, no fonts, no images on first paint).</li>
    <li>API answers are cached and revalidated with ETags (<code>If-None-Match</code> → <code>304</code>), so repeat visits cost almost nothing; stale data is shown instantly and refreshed in the background.</li>
    <li>Countdowns tick in place every 30 seconds without refetching.</li>
  </ul>
  <h2>Keyboard &amp; access</h2>
  <ul><li>Press <kbd>/</kbd> anywhere to jump to search; <kbd>Esc</kbd> clears it. Skip link, semantic tables, focusable headings and <code>aria-live</code> updates throughout; works at phone width and honours dark mode and reduced motion.</li></ul>
  <h2>Data &amp; privacy</h2>
  <p>Everything comes from make.fun’s public API (<code>https://make.fun/api</code>, read-only <code>GET</code>). Nothing is written, no account is needed, and the only thing stored locally is the API cache. Source: see the repository README.</p>`;
}
