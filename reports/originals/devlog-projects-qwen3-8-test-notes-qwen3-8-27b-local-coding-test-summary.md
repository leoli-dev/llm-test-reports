---
type: Note
title: "Qwen3.8-27B local coding-agent test summary"
status: current
description: "Full synthesis of all local oMLX/MTPLX Qwen3.8-27B coding-agent test campaigns on the M5 Max, covering per-test outcomes, cross-test failure patterns, and evidence-weighted operating conclusions."
tags: [qwen3.8, omlx, mtplx, qwen-code, pi, quantization, context, benchmark, summary]
timestamp: 2026-08-24T16:30:00Z
---

# Qwen3.8-27B Local Coding-Agent Test Summary (Full)

[English](devlog-projects-qwen3-8-test-notes-qwen3-8-27b-local-coding-test-summary.md) | [简体中文](devlog-projects-qwen3-8-test-notes-qwen3-8-27b-local-coding-test-summary_CN.md)

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

This page synthesizes all test notes from 2026-08-21 to 2026-08-24: 4 end-to-end coding campaigns (Arcology, Paris 3D, LLM bandwidth showcase, Frog Choir), 2 performance observation scopes, and 2 unresolved bugs. It serves as both a per-test result archive and the sole summary of cross-cutting failure modes and workflow conclusions.

## 0. Conclusions (Current Default Workflow)

For complex local coding-agent tasks on M5 Max / 128GB unified memory, the most robust default combination currently is:

> **8-bit Qwen3.8-27B + Qwen Code + thinking off + one subagent per narrow task + new session per phase + build/test/E2E + independent review acceptance.**

This is an engineering choice supported by real task evidence, not a strict controlled-variable ranking of models, quantizations, or agents. Strict comparisons are reserved for BENCH-02/03 (historical local files, not published with this report).

## 1. Result Archive of the Four End-to-End Campaigns

| Campaign | Date | Model/Quantization | Agent | Result | Key Evidence |
|---|---|---|---|---|---|
| **Arcology 2049** (Pure frontend control room) | 08-21 | AWQ-5.0bpw via oMLX | Qwen Code 0.21.15, YOLO | **Success (B+)**: One-round delivery + one-round review fix closed loop; subsequent visual QA fell into a 3-hour verification loop and was cancelled | [First test record](devlog-projects-qwen3-8-test-notes-first-successful-qwen-code-test.md); [Round 1/2 review](devlog-projects-qwen3-8-test-notes-arcology-control-room-round-1-review.md); Legacy UX-02 narrow-screen overflow (historical local file, not published with this report) |
| **Paris 3D** (Real OSM data Three.js city) | 08-22 | 27B via oMLX | Qwen Code | **Failed closure**: Claimed 18/18 tests passed, but Overpass parsing treated node IDs as coordinates, resulting in all 6 layers of GeoJSON being `[null,null]`; 8 "acceptance screenshots" were actually forced-display mode selection masks; after data repair, visuals were still not navigable, 926 draw calls / 6 FPS (budget <400 / ≥50) | [Paris 3D benchmark](devlog-projects-qwen3-8-test-notes-paris-3d-qwen3-8-27b-test.md) |
| **LLM bandwidth showcase** (Educational site) | 08-23 | **oQ4e-mtp (4-bit)** via oMLX RC | Qwen Code | **Delivered but failed acceptance closure**: Site fully usable, but first-round independent review found 3 P1 correctness defects (Canvas not starting, offload faked speed, invalid slider); after three rounds of fixes, animation/ARIA/M3 Ultra all passed, but final remaining M5 Max 404 source marked `confirmed` DATA-01 (historical local file, not published with this report) | [Delivery test](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-oq4e-mtp-test.md); [Round 1](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-1-review.md) / [2](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-2-review.md) / [3](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-3-review.md) |
| **Frog Choir** (Camera + Gesture + Web Audio) | 08-23/24 | **INT8 weights + INT8 MTP + q8 KV** via MTPLX `optimized-quality` | Pi (initial run) → Qwen Code (rectification) | **Basically successful, 1 P1 remaining**: Pi initial run interrupted by explicit MTPLX cancel (unattributed); Pi subsequently claimed completion but Round 1 found 4 core defects (camera black screen, continuous humming, handedness, calibration invalid); after Qwen Code task-based rectification, Round 2 restored main pipeline, build + 35/35 unit + 11/11 E2E; only real-device handedness mapping FE-07 remaining (historical local file, not published with this report) | [test note](devlog-projects-qwen3-8-test-notes-mtplx-pi-frog-choir-test.md); [Round 1](devlog-projects-qwen3-8-test-notes-frog-choir-round-1-review.md) / [Round 2](devlog-projects-qwen3-8-test-notes-frog-choir-round-2-review.md); cancel investigation (historical local file, not published with this report) |

## 2. Cross-Cutting Failure Modes (Each has evidence from ≥2 campaigns)

### 2.1 "Tests Passed" Does Not Equal "Acceptance Passed" — Model Systematically Uses Test Counts as Completion Evidence

- Paris 3D: 18/18 unit tests passed, but tests only covered projection and Eiffel Tower modules, masking that all coordinates were null; screenshot script forcibly removed masks, making 8 "acceptance images" appear to exist.
- Frog Choir Round 1: 25 unit + 10 E2E all green, but E2E only went through demo slider path, never mocked camera or asserted audio; real-device authorization resulted in black screen.
- Frog Choir Round 2 also found **circular testing**: handedness unit test asserted the same swap logic as production code, so 35/35 passing coexisted with real-device opposite behavior.

**Countermeasure:** Acceptance must be executed by independent review, and test requirements must be written into the prompt (mock boundaries, what to assert, which step for manual acceptance); new test prompts have been designed accordingly.

### 2.2 External Data Contracts Are the Biggest Disaster Zone

- Paris 3D: `el.nodes` (ID array) was treated as `{lon,lat}`, correct coordinates were in `el.geometry` — a field-name-level contract misreading destroyed the entire data pipeline.
- Bandwidth showcase: All three rounds of review stumbled on data factual accuracy — 404 URL marked `confirmed`, M3 Ultra fields contradicted its own note (512/816 vs 256/819), finally still refused to switch to usable Apple Support page.

**Countermeasure:** Avoid having 27B bear "online fact verification" type acceptance; when external data is needed, put contract samples (real JSON fragments) directly into the prompt, or use programmatically verifiable deterministic data.

### 2.3 Precise Review-Driven Local Fixes Are Reliable; Autonomous End-to-End Quality Convergence Is Not

- Success side: Arcology FE-01/02/UX-01, bandwidth Round-1 three P1s, Frog Choir FE-05/06/08 + QA-04 — for any defect where review provided accurate file:line number and acceptance conditions, fixes were implemented in one go and remained non-regressive.
- Failure side: Paris 3D after fixing data contract, 46/46 tests, visuals were still huge blocks/dark clipping/wrong camera position; bandwidth's Canvas description card occlusion required review to explicitly state "refactor to Canvas+DOM separation" to resolve. Model cannot spontaneously converge with "real browser visual evidence" as the goal.

**Countermeasure:** Treat "human/independent review provides precise findings → model fixes" as the standard loop, rather than expecting one-shot delivery; this is exactly why subagent task-based rectification worked in Frog Choir Round 2.

### 2.4 Lack of Budget Constraints Leads to Verification Loops

- Arcology visual QA continuation had no product code changes for about 3 hours, repeatedly rebuilding Chrome profile, correcting test's own errors, cancelled by user for loss-cutting (QA-01 cancelled).

**Countermeasure:** Set clear budgets (count/time/output format) for verification tasks, or split into one-time narrow subagents.

### 2.5 Prompt Difficulty Sweet Spot Is Now Clear

- **Sweet Spot (Success)**: Multi-subsystem pure frontend engineering (hardware API + audio/video + animation + state), acceptance can be mechanized + small amount of manual — Arcology, Frog Choir.
- **Slightly Difficult but Controllable (Fragile)**: Educational/content-type tasks involving factual data — bandwidth showcase.
- **Out of Scope (Failure)**: Large-scale real external data + 3D performance budget + autonomous visual acceptance — Paris 3D.

On 2026-08-24, 5 fixed prompts were added according to the sweet spot (`test-prompts/`: `firefly-whistle`, `marble-machine`, `lantern-cards`, `pixel-darkroom`, `slide-lantern`), each pressing a different capability axis (self-implemented DSP, deterministic simulation+undo, date injection+SM-2, Web Worker+byte-level determinism, self-implemented parser+dual-window synchronization), for use in the stability series after BENCH-03.

## 3. Quantization: 8-bit Is the Priority Choice for Current Complex Coding

- MTPLX `optimized-quality` is INT8 weights, INT8 MTP head, q8 paged KV — **not 4-bit**; Frog Choir main pipeline rectification success occurred on this configuration.
- oQ4e-mtp (4-bit) did indeed independently complete the entire bandwidth showcase site, so one cannot conclude "4-bit cannot do complex work"; but its first round had 3 P1 correctness defects, and multiple rounds of fixes still exposed data and interaction issues — in multi-round self-check/error-correction type tasks, the quality margin of low-bit appears smaller.

**Working Conclusion:** 8-bit is used for work requiring reliable reasoning, tool calling, and multi-round fixes; 4-bit is used for exploration or tasks that can bear review costs. Strict gap still requires same-prompt same-agent independent session comparison (BENCH-02/03).

## 4. Agent: Qwen Code Default, Pi as Control, Subagent Is Necessary Means

- Qwen Code completed Arcology end-to-end delivery, and in Frog Choir Round 2 used task-based method to fix four core defects to all automatic verification passed.
- Pi + MTPLX initial run was explicitly interrupted by local `POST /v1/mtplx/cancel` at 30,798 prompt tokens / 165 completion tokens; caller has not attributed it to date (not Pi disconnection, control after two restarts did not reproduce, inconsistent with upstream #310/#311 signature). cancel-audit is in place waiting for recurrence. This adds an unattributed instability aspect to the Pi route.
- Main agent only retains splitting, dependencies, and acceptance; implementation/testing/audit each handed to narrow subagents with limited file scope.

## 5. Performance: Stable Decode for Complex Long Tasks Is About 18–20 tok/s, Panel Averages Are Not Interchangeable

All Dashboard numbers are runtime snapshots, but they form a consistent experience range across 4 configurations:

| Scenario | Observed Value | Correct Interpretation |
|---|---:|---|
| Arcology first-round long reasoning request (AWQ-5.0bpw) | ~20 tok/s; short file writing phase ~28.5 | Single request perspective |
| Arcology long session late stage | 18.1 tok/s | Long-term multi-turn interaction degradation ~36% |
| Paris 3D session (oMLX v0.6.2) | 17.4 tok/s generation, 91.8% cache | Session cumulative average |
| oMLX RC + oQ4e-mtp active long request | 18.6 tok/s (session average 42.4 cannot be treated as stable speed) | Short requests/cache raise session average |
| MTPLX 71K/131K context | 5-minute decode average 19.9 TPS (18.3–21.4) | Shared long cache runtime snapshot |

**Working Conclusion:** MTP/cache improves prefill, TTFT, and short-segment experience, but there is no evidence that it can raise the stable decode of 27B complex long tasks to another level. Optimization focus is reducing invalid tokens, tool retries, and repeated context.

## 6. Context: 131K Is the Hard Budget

- `context_length_exceeded` has occurred with prompt 155,651 tokens; long session decode dropped from ~28.5 to 18.1 tok/s.
- Automatic compression is only used to prevent overflow, not reliable memory. Write a short handoff and open a new session upon completing a phase; task splitting and subagent isolation are more reliable than compression.

## 7. Recommended Execution Template

1. New session only takes on one clear phase; thinking off.
2. Main agent decomposes into non-conflicting narrow tasks; one subagent per item, limiting target files, forbidden modification scope, and minimum verification command.
3. Main agent only does diff review, dependency ordering, and final `build → unit → E2E → 真机/可视验收`.
4. Any verification failure creates a new dedicated subagent according to the cause; do not stuff troubleshooting/implementation/review back into the same long context.
5. Save handoff and open new session immediately upon phase completion.
6. **Acceptance is always independent review**: Do not trust agent's completion claims and test counts; check data contracts, mock boundaries, and circular tests.

## 8. Evidence Boundaries and Follow-up Benchmarks

- Neither quantization nor agent has completed same-prompt, same-profile, independent session repeated comparison; this page does not constitute "8-bit or Qwen Code is objectively strongest".
- Panel's prefill, session average, instantaneous decode, and single-prompt time are not interchangeable; formal benchmark must record prompt/completion tokens, TTFT, stable decode, tool rounds, wall time, peak memory, and manual acceptance results per request.
- Open items see backlog (historical local file, not published with this report): BENCH-02 (oQ4e performance comparison), BENCH-03 (same-prompt Qwen Code/Pi Frog Choir comparison), FE-07 (real-device handedness), DATA-01, UX-02, cancel attribution.

## Related records

- [First Successful Qwen Code Test](devlog-projects-qwen3-8-test-notes-first-successful-qwen-code-test.md) · [Arcology Round 1/2 review](devlog-projects-qwen3-8-test-notes-arcology-control-room-round-1-review.md)
- [Paris 3D benchmark](devlog-projects-qwen3-8-test-notes-paris-3d-qwen3-8-27b-test.md)
- [oMLX RC + oQ4e-mtp Performance Observations](devlog-projects-qwen3-8-test-notes-omlx-rc-oq4e-mtp-performance-test.md) · [oQ4e-mtp Delivery Test](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-oq4e-mtp-test.md) · [bandwidth Round 1](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-1-review.md)/[2](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-2-review.md)/[3](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-3-review.md)
- [MTPLX + Pi Frog Choir Test](devlog-projects-qwen3-8-test-notes-mtplx-pi-frog-choir-test.md) · [Frog Choir Round 1](devlog-projects-qwen3-8-test-notes-frog-choir-round-1-review.md)/[Round 2](devlog-projects-qwen3-8-test-notes-frog-choir-round-2-review.md)
- Bugs: MTPLX explicit cancel (historical local file, not released with this report) · Arcology narrow overflow (historical local file, not released with this report)
