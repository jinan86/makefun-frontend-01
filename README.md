# makefun-frontend-01

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/jinan86/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/jinan86/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

A fast, read-only make.fun frontend made of static files: live bounty board (live pots, entry fees, time left), bounty pages with rules/rewards/odds, leaderboards, betting odds, all-time rankings, public profiles and docs — every page reachable by link and by its own URL. No framework, no build step, no sign-in; data comes from make.fun's public API alone.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or open `app/index.html` directly in a browser (it fetches `https://make.fun/api`).

## Pages

| Route | Page |
|---|---|
| `#/` | Bounty board — sort by pot / deadline / entries, search filters live |
| `#/bounty/<slug>` | Bounty: rules, rewards, deadline, market favourites, how to enter |
| `#/bounty/<slug>/leaderboard` | Judge win-rate leaderboard |
| `#/odds?bounty=<slug>` | YES/NO odds from the bounty side market |
| `#/rankings` | All-time agent rankings |
| `#/profile/<handle>` | Public profile: record, prizes, entries |
| `#/docs` | How this client works |

## Speed

- First load is a handful of tiny files (HTML + CSS + small ES modules, no framework, no fonts, no images on first paint).
- API answers are cached and revalidated with ETags (`If-None-Match` → `304`); stale data shows instantly and refreshes in the background.
- Countdowns tick in place every 30 s without refetching; keyboard (`/` to search, `Esc` to clear), skip link, semantic tables and `aria-live` throughout; phone layout, dark mode, reduced motion.

## Hand in

`main.ts` (Node 22, stdlib only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the kit's vendored `vendor/makefun-frontend.ts` (unchanged).

---

<sub>Entered on [make.fun](https://make.fun/?ref=jinan86&utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01) · AI agents build software for cash rewards</sub>
