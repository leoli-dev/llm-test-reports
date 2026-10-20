---
type: Note
title: "LLM bandwidth showcase — oQ4e-mtp delivery test"
status: current
description: "Completed coding-agent delivery of a zero-dependency interactive teaching page about memory-bandwidth-limited LLM decode speed."
tags: [qwen3.8, oq4e, mtp, omlx-rc, frontend, benchmark, education]
timestamp: 2026-08-23T01:04:17Z
---

# LLM bandwidth showcase — oQ4e-mtp delivery test

[English](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-oq4e-mtp-test.md) | [简体中文](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-oq4e-mtp-test_CN.md)

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

## Result

`Qwen3.8-27B-oQ4e-mtp` completed a local, single-page, pure front-end educational site with zero runtime dependencies: `$HOME/Code/qwen3.8-tests/llm-bandwidth-showcase`. The page explains the upper limit of token generation during the decode phase by stating that “model weight loading is constrained by memory bandwidth,” and explicitly labels the calculations as theoretical educational estimates, not measured benchmarks.

## Delivered

- `index.html`, `style.css`: Chinese science-museum-style dark interface, 7 content areas, reduced-motion support.
- `data.js`: 5 devices, 6 models, 4 precision/quantization items; each hardware and model data entry includes source URL, title, retrieval date, and notes.
- `calc.js`: Weight size, capacity assessment, theoretical bandwidth upper limit, and educational estimation with efficiency coefficients, along with step-by-step derivation.
- `animation.js`: Data flow animation from Canvas memory → GPU → token; when capacity is insufficient, it switches to an explanation of offload narrow channels.
- `app.js` and `README.md`: Selection/recalculation/comparison/methods and maintenance instructions.

## Independent verification

- `node --check` has passed `data.js`, `calc.js`, `animation.js`, and `app.js`.
- Successfully loaded and captured screenshots using local `python3 -m http.server` and Playwright Chromium; requests included only the page's own HTML/CSS/JS, with no runtime `fetch` / XHR or third-party resource loading observed.
- Manual inspection of the screenshots confirmed that the above-the-fold layout, device cards, model selection, and precision selection rendered correctly, with a visual style consistent with the README description.

The generating agent also reported that DOM counts, interaction recalculations, and zero console errors all passed; these are self-test claims from the generation side and have not yet been individually re-run by this independent check.

## Data caution

The in-page source links and retrieval dates are complete, but this task did not involve online verification of the data item by item. In particular, the maximum unified memory and nominal bandwidth of Apple's successive chip generations must be re-verified against the page links before formal external use. The page and README explicitly state this limitation, and theoretical values are not presented as actual performance.

## Reuse

Local run: `cd $HOME/Code/qwen3.8-tests/llm-bandwidth-showcase && python3 -m http.server 8000`.

