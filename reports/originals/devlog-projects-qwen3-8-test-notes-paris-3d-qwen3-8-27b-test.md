---
type: Note
title: "Paris 3D Qwen3.8-27B benchmark"
status: current
description: "An in-progress, end-to-end coding-agent benchmark for local oMLX Qwen3.8-27B using a data-driven Three.js reconstruction of central Paris."
tags: [qwen3.8, qwen3.8-27b, omlx, benchmark, threejs, osm, paris-3d]
timestamp: 2026-08-22T19:48:06Z
---

# Paris 3D — Qwen3.8-27B test

[English](devlog-projects-qwen3-8-test-notes-paris-3d-qwen3-8-27b-test.md) | [简体中文](devlog-projects-qwen3-8-test-notes-paris-3d-qwen3-8-27b-test_CN.md)

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Local inference workstation |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | See original report; current snapshot does not fill missing historical configuration |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | Not recorded in the surviving test evidence; current OS is not substituted |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

## Status

Qwen declared implementation complete, but independent file and browser acceptance resulted in **failure (Request Changes)**. This project must not be presented as a completed Paris 3D delivery. The test workspace is `$HOME/Code/qwen3.8-tests`; the task and rubric are:

- `$HOME/Code/qwen3.8-tests/prompts/paris3d.md`
- `$HOME/Code/qwen3.8-tests/prompts/paris3d-rubric.md`

## Test objective

Use a complete browser project to evaluate local oMLX Qwen3.8-27B coding-agent capability: building a central-Paris Three.js scene from real OSM/Overpass data, procedural landmarks, traffic on real roads, car/boat/aircraft touring modes, performance control and browser self-acceptance.

This is not purely a speed benchmark. The focus is whether the model handles data and coordinates correctly first, continues running, capturing screenshots and correcting a long task, and whether complexity or external API rate limits cause scope reduction, fabricated data or unfinished work.

## Most discriminating requirements

- Overpass fetching, chunking, retry/backoff and local caching; fabricated geographic data, 3D map engines and ready-made landmark models are prohibited.
- Local metric coordinates with the Louvre as origin; `cos(phi)` latitude correction and two sets of distance unit tests.
- Approximately 50,000 buildings (5 × 10,000), extrusions, pitched roofs, chunked batching and LOD, plus the Seine with island holes and bridge clearance.
- Procedural landmarks: curved Eiffel Tower legs and instanced latticework, traversable crossing arches at the Arc de Triomphe, and the Louvre glass pyramid grid.
- A directed road graph respecting one-way streets, car following, the Place Charles de Gaulle roundabout, boat traffic and three player vehicles.
- Playwright/Puppeteer with no console errors, 8 prescribed-scene screenshots, 30-second FPS sampling and README performance evidence.

## Before-run assessment

This is suitable for comparing extreme engineering execution, but harsh for 27B. A demonstrable city skeleton, parts of the OSM pipeline and several key landmarks are plausible. High-risk areas are full data scale, river holes, multiple-vehicle physics, real directed roads/roundabouts, complete visual acceptance and performance targets being simplified or superficially completed.

Evaluation must check fetch/cache evidence, projection tests, landmark modules/`getInfo()`, one-way road logic, raw Playwright logs and performance samples, rather than screenshots alone. The rubric says 100 points, but its sections sum to **115 points** (20+12+15+25+15+15+13); normalize or rebalance them before a formal comparison.

## Runtime speed snapshot

Current session / All Models screenshot from oMLX v0.6.2 Dashboard:

| Metric | Value | Interpretation |
|---|---:|---|
| Total prefill tokens | 10.4M | Cumulative session prefill, not a single context length. |
| Cached tokens | 9,547,776 | Most repeated context in the long task hit the cache. |
| Cache efficiency | 91.8% | High; caching reduces waits for repeatedly carried context. |
| Prompt processing (excl. cached) | 111.1 tok/s | Good ingestion speed for new tasks/context. |
| Token generation | 17.4 tok/s | Sufficient for long engineering tasks on a local 27B model; approximately 10k generated tokens require 9–10 minutes, excluding tools, builds, browsers and network waits. |

This panel averages Session + All Models. Strict attribution to Qwen3.8-27B requires filtering by model after the test and resetting counters before the run. Agent iteration quality and the external toolchain, rather than generation speed alone, will be the main variables in total task time.

## End-of-run evidence to record

- Final directories/commits and actual completed scope.
- `fetch_data` logs and genuine data evidence under `data/`.
- Unit tests, development server and browser console results.
- 8 required screenshots and raw FPS/draw-call/triangle/load-time results.
- Per-rubric scores, reasons for deductions and fabricated data, reduced scope or unimplemented paths.

## Closing verification (2026-08-22)

Qwen finally claimed 18/18 tests passed, 0 console errors, 8 screenshots, 6 OSM GeoJSON layers and headless 2 FPS. Independent review found some successes were merely surface artifacts:

- `npm test` did pass 18/18 and `npm run build` succeeded. Tests covered only projection (7) and the Eiffel Tower module (11), not real GeoJSON coordinates, scenes, traffic or the three vehicles.
- `scripts/fetch_simple.mjs:82-90` misread Overpass JSON `el.nodes` (node IDs) as `{lon, lat}` objects, whereas coordinates from `[out:json] ... out geom` live in `el.geometry`. Thus all 6 generated GeoJSON coordinate sets serialized to `[null, null]`. Feature counts such as 74,118 buildings, 9,745 roads and 125 water features were real, but there was not a single valid coordinate pair. The browser scene could not construct real Paris geometry.
- Manual browser checks of car, boat and aircraft modes could not show navigable Paris: blank/overexposed skies, huge incorrect planes or player vehicles obstructed the view. `src/city/water.js:105-141` created XZ vertices then rotated by `-PI/2`, making the water vertical, a direct cause of a huge wall in boat mode.
- All 8 supposed acceptance screenshots showed the mode-selection overlay rather than prescribed viewpoints. `scripts/screenshot.mjs:48-50` forced `mode-selector.classList.remove('hidden')` before every screenshot. These cannot establish landmark, traffic or visual quality.
- Performance also failed: reported 2 FPS and approximately 60 seconds to first load, versus hard budgets of ≥50 FPS and <8 seconds. The README expectation of 50–60 on a real GPU was unmeasured.

Conclusion: an informative 27B coding-agent stress test. The model produced substantial code/files, a compilable build and local unit tests, but did not close the loop on external data contracts, end-to-end visuals and acceptance artifacts. See backlog `QA-03`.

## Final review and decision to stop (2026-08-22)

The user stopped remediation. After review, Qwen did fix coordinates: the formal `fetch_data.mjs` replaced the temporary script, all coordinates in 6 GeoJSON layers were finite and within the bbox, and adding `dataIntegrity.test.js` brought tests to 46/46 with a passing build.

The second independent visual review still rejected delivery. The 8 regenerated prescribed-view screenshots no longer had the selection overlay, but showed huge blocks, distorted latticework, dark facades or scenes inconsistent with their viewpoints. Live car/boat/aircraft smoke screenshots respectively showed near-black clipping, a near-black view inside a boat/building, and a dark scene with no visible city. `performance.json` recorded 926 draw calls/frame (required <400), 6 FPS (required ≥50) and many water earcut warnings. Qwen's claim that all fixes were closed contradicted visual evidence.

**Final conclusion:** Paris 3D failed as an autonomous end-to-end coding-agent task; no further repairs. The main finding is that explicit review can drive local data-contract fixes and added tests, but the model still cannot reliably converge system integration and quality around actual browser visual evidence.
