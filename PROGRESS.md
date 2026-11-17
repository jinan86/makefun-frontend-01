# PROGRESS — makefun-frontend-01

Owner: zee / Jinan @jinan86 (GitHub jinan86, Solana wallet linked, 0 entries).
Deadline: entries close 2026-11-17T12:30:00Z = 19:30 WIB. Started 11:41 WIB (~7h50m left).

## Requirements (fetched 2026-11-17 ~11:41 WIB)
- `GET /api/competitions/makefun-frontend-01/requirements` — status open, harness program/v1, strict transcripts.
- Prereqs: Node 22.18+ (this VM: Node v24.22.1 ✓, newer major counts), Git ✓, Claude Code or Codex (codex CLI present at /opt/hatch-image/bin/codex; claude CLI absent), desktop Chrome (absent — Chromium Headless Shell 131 installed via Playwright instead), Playwright MCP (NOT available to this subagent — no MCP tools; screenshots taken with playwright-core + headless shell instead).
- Deliverables: public GitHub repo (owner = account GitHub login jinan86), full 40-char commit SHA, recording_ids (sealed recordings — this session is a Muse subagent, NOT a recorded Claude Code/Codex session, so no valid recording exists), title (optional), entry_message + entry_signature (Ed25519, ≤10 min old), LICENSE (MIT ✓), main.ts at repo root ✓.
- Entry fee $0.50 USDC, paid once per account (10 paid so far); escrow $752.52 USDC; pot $750 total, 20 places, 1st $150.
- No local grade: RULES.txt — "There is no local grade of this competition: the server grades every entry." `grade-local` exists in the CLI but is for bot/practice kits; verification here = run main.ts → dossier.json + gate limits.
- Judge: AI judge compares dossiers pairwise from 3 screenshots + source outline; criteria in order: fully functioning, performance, speed (first-load bytes), ease of use. Finalist review opens top 5 in desktop Chrome on live data.
- Gate limits: app/ ≤993 files/dirs, ≤16 MiB; index.html ≤1 MiB; 3 screenshots ≤256 KiB each, long side ≤1280, short side ≥360; dossier ≤1.5 MiB, text ≤163,840 bytes.
- README must carry the 3 live make.fun badges (competition, rank, reward) with real owner/repo, no `{owner}` placeholders; GitHub About needs website on make.fun + topic `makefun`.

## Competition state (live API, 2026-11-17 ~11:45 WIB)
- 607 submissions; leaderboard has 351 judged entries. Rank 1: @superskie 95.6% win rate ("Clearboard"). (The brief's "@sagar-2 99.1%" does not match the live leaderboard — likely a market figure or stale.)
- Market: trading, 54 outcomes; "An unlisted entry" is favourite at 71.8¢ YES.
- Honest feasibility: with 607 entries and a 95.6% leader, a paid place (top 20) from a ~7h build is very unlikely; a solid, fully-functioning, tiny-first-load entry is the realistic best outcome.

## Built (this session)
- Repo root: `~/workspace/makefun/makefun-frontend-01/` — main.ts, serve.ts, LICENSE (MIT), vendor/makefun-frontend.ts (kit copy, unchanged), README.md, shots.json, app/, screenshots/.
- app/: index.html, main.js, api.js (ETag cache + stale-while-revalidate via localStorage), format.js, views.js, style.css. Routes: #/ board (sort pot/deadline/entries, live search, @handle jump), #/bounty/:slug (rewards, odds favourites, how-to-enter), #/bounty/:slug/leaderboard, #/odds, #/rankings, #/profile/:handle, #/docs. Only origin besides app itself: https://make.fun (API + avatar images via /api). No sign-in, no writes.
- Screenshots: taken with Playwright headless Chromium (installed this session) on live data at 1280×800, waiting for window.__shotReady. (Starter screenshots NOT reused.)

## Verification — to fill in after build
- [ ] `node serve.ts` serves app, all 7 routes render on live data
- [ ] 3 screenshots ≤256 KiB each
- [ ] `MAKEFUN_OUTPUT_DIR=out node main.ts` writes dossier.json; check Load totals + gate limits
- [ ] `node cli/makefun.mjs grade-local` attempted; expected: no local grade for this bounty (per RULES.txt)

## Blockers / NOT done (need zee / parent agent)
- Entry fee $0.50 USDC NOT paid — needs zee's approval. No money spent, nothing submitted.
- No GitHub repo exists yet (gh not logged in on this VM) — repo must be created under jinan86, pushed, About set (website https://make.fun/bounty/makefun-frontend-01, topic makefun), then submit before 19:30 WIB.
- No sealed recording: this build was done by a Muse subagent, not a recorded Claude Code/Codex session. Submit requires recording_ids from `node cli/makefun.mjs record ... -- claude/codex`; entries received from 2026-11-17 00:00 UTC are rejected without transcripts. A rebuild under a recorded session would be needed for a submittable entry.
- Playwright MCP prerequisite unmet (no MCP tools in this environment).
