# CLOUD-03 evidence

[English](README.md) | [简体中文](README_CN.md)

This is selected evidence for the 2026-11-20 artifact review, not a new model-generation run. Candidate source stays at the pinned public repositories. `generation-provenance.json` distinguishes original-builder statements, inspected task messages and unknowns. Independent notes retain source language; their historical claims are qualified by final report and consensus.

The ZIP includes this directory, report figures, all original Codex observer JPEGs and Claude raw JPEG/JSON captures (contact-sheet collages excluded). The separate public manifest records hashes. Snapshots taken in flight, wrong-selector results and failed observer runs are intentionally preserved and labeled; they are not candidate failures.

Reproduction in a new scratch directory:

```sh
export SCRATCH_ROOT="$PWD"
git clone https://github.com/leoli-dev/snowglobe-park.git
git -C snowglobe-park checkout 2eee3d5c4110dde4a351b758975f480594875684
git clone https://github.com/leoli-dev/noel-globe.git
git -C noel-globe checkout 239e9bba12bb20a01513e7a9189d422905ed1232
(cd snowglobe-park && npm ci --ignore-scripts && npm run build)
(cd noel-globe && npm ci --ignore-scripts && npm run build)
npm install --no-save --ignore-scripts playwright-core@1.65.1
python3 -m http.server 8462 --bind 127.0.0.1
```

Use another terminal at the scratch root; copy the ZIP's `evidence/` there and ensure `claude-shots/` exists. Scripts import `playwright-core`. `BROWSER_PATH` defaults to the macOS Thorium executable; select Thorium on other platforms. `BASE_URL` defaults to `http://127.0.0.1:8462`. Never substitute Google Chrome.

- `scripts/evaluate.mjs`: first functional flow, photos/downloads/persistence/mobile. Its published count selector is corrected; raw `functional.json` retains original 0/0, with corrected 60/82 in `corrections.json`.
- `scripts/correct-and-probe.mjs`: settled views, corrected counts, keyboard, fresh portrait photo download, offline and disabled-WebGL startup.
- `scripts/stress.mjs`: live GL counts across weather/time and resize. It does not measure memory bytes or unlimited photo capture.
- `scripts/focus-probe.mjs`: final Snowglobe LinaBell pose. The original output filename contains `obstructed`, but the settled frame actually disproves the suspected obstruction; report figure has a neutral filename.
- `scripts/joint-probes.mjs`: label wheel/canvas control and settled Noël focus defects.
- `scripts/performance.mjs`: complete synthetic full-canvas ABBA×2. Close other browser tests first. `observer-performance-*` files are excluded attempts, not samples in the final table.
- `scripts/live-smoke.mjs`: public Pages startup/weather smoke. `live-http.json` separately records HTML hashes.
- `scripts/claude/`: original scenario, label, focus/show rechecks; run main with `node evidence/scripts/claude/run.mjs sg` or `noel`, optional `mobile`. Original screenshots have no generated visual edits. Canvas-only captures are original screenshot clips. No contact sheet is used as original evidence.

Publication transformations: local scratch/dependency paths are portable variables or `<scratch>`; ANSI log coloring and the battery identifier are omitted; exact bytes/hashes of figures, prompt text and numerical measurements are preserved. `source-hashes.json` records original observer scripts/reviews and exported figure hashes. Do not publish the full private message-history file. No credentials, private services, node_modules, model weights or caches are bundled.
