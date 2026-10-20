---
type: Note
title: "LLM bandwidth showcase — Round 1 review"
status: current
description: "Independent first-round review found three P1 correctness issues in the oQ4e-mtp delivery: a blank Canvas animation, invalid offload speed figures, and a no-op context control."
tags: [qwen3.8, oq4e, mtp, review, frontend, canvas, correctness]
timestamp: 2026-08-23T01:32:10Z
---

# LLM bandwidth showcase — Round 1 review

[English](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-1-review.md) | [简体中文](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-1-review_CN.md)

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

## Verdict

**Request Changes.** The separation of the page's static structure, data, and copy is well done, and both the JS syntax and local page loading pass; however, three P1 issues render the core pedagogical conclusions unreliable or lacking in functionality.

## Findings

### FE-03 — Canvas animation initially loads as blank (P1)

Independent browser inspection `http://localhost:8000/`: The Canvas has the correct CSS/bitmap dimensions (1066×380 CSS px, 2132×760 backing store), but the animation area contains no drawn content.

The root cause is that `animation.js:22` initializes `state.running` to `true`, while during initialization `animation.js:481` calls `api.start()`; `start()` in `animation.js:459-462` only creates `requestAnimationFrame` when `!state.running`. Consequently, the initial page load never starts `loop()`, nor does it call `draw()`.

Fix: Initialize to `running: false`, or have `start()` start the loop when no RAF is queued. After the fix, verification in a real browser is required: the first screen must show drawing, pause/resume must work correctly, and `prefers-reduced-motion` must still display only static frames.

### FE-04 — Local bandwidth tok/s displayed despite insufficient capacity (P1)

`calc.js:36-41` calculates the ideal/educational tok/s for local memory bandwidth regardless of whether `fits` is true or false, and `app.js:153-164` and `app.js:238-240` continue to display the value as a verdict card and horizontal speed bar. For example, with RTX 4090 + 70B FP16, the UI simultaneously states "does not fit" and provides a seemingly valid tok/s.

This contradicts the constraint in the page and README that "offload does not calculate precise speed." When capacity is insufficient, "N/A" should be displayed, and this speed should be excluded from the chart's maximum value and sorting; the offload warning and explanation may be retained, but the local bandwidth formula cannot be used as its operating speed.

### UX-03 — Context length slider has no effect on any model (P1)

`app.js:123-127` only updates `state.ctx` and triggers a redraw; `calc.js:101` merely returns `ctxTokens` as-is, without participating in capacity determination, KV cache illustration, conclusions, or animation. When a user changes 256→128k, only the control text changes.

Two options for the fix direction: either remove the control and leave the KV cache explanation in "Don't Misunderstand"; or add a KV cache budget explicitly labeled as an educational estimate, so that it affects available memory, capacity conclusions, and explainable text.

## What passed

- `data.js`, `calc.js`, `animation.js`, and `app.js` all pass `node --check`.
- Local page loading does not depend on external runtime resources; external URLs serve only as data source links for user clicks.
- The rendering of links for the `source` field of the data uses `rel="noopener"`.

