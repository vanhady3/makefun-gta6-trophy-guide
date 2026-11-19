# Leonida Trophy Tracker — GTA 6 Trophy Guide

An offline checklist and guide for all **55 GTA 6 PS5 trophies** (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 27 visible, 28 hidden), built for the make.fun competition `gta6-trophy-guide-01`.

## What it does

- **Checklist** — tick trophies off as you earn them; progress saves in your browser (localStorage) and survives reloads.
- **Filters** — by kind (story / side / hidden / activities / heists / vehicles / platinum), by grade, by text search, and a hide-earned toggle.
- **Spoilers off by default** — story, side and hidden trophies show a placeholder until you turn spoilers on.
- **Detail pane** — click any trophy for its official description, grade, kind, guide notes, missable flag and sources.
- **Roadmap** — a path to platinum in about 200 hours, in play order, with chapter-save advice.
- **Missables** — the one truly missable trophy (and the one time-sensitive step) called out clearly.
- **Export / import** — download your progress as JSON and restore it later on any device.

## How to open it (offline)

No build step, no network, no install. Either:

1. Open `app/index.html` directly in a browser, or
2. Run the included static server and visit it:
   ```sh
   node serve.ts
   # then open http://localhost:8080/
   ```

To build the submission bundle:

```sh
node main.ts   # copies app/ and screenshots/ into out/ and writes out/dossier.json
```

## Sources

- **Official trophy list** — names, descriptions and grades as published on Exophase and PSNProfiles.
- **Guide notes** — written from the official descriptions plus GamesRadar+ and PowerPyx reporting on the trophy list (18 Nov 2026).
- **Confidence** — anything not yet confirmed in-game is marked in the app as *reported, not confirmed*, not presented as verified fact.

## Disclaimer

Unofficial fan-made tracker. Not affiliated with Rockstar Games or Take-Two Interactive. Contains no Rockstar artwork, logos or game assets.

## License

MIT — see `LICENSE`. Copyright 2026 vanhady3.
