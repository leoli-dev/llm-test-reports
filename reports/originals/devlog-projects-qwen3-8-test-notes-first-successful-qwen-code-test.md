---
type: Note
title: "First successful Qwen Code test on local Qwen3.8"
status: current
description: "First end-to-end successful coding-agent task using local oMLX Qwen3.8-27B and Qwen Code."
tags: [qwen3.8, omlx, qwen-code, benchmark, arcology]
timestamp: 2026-08-21T23:36:00Z
---

# First successful Qwen Code test

[English](devlog-projects-qwen3-8-test-notes-first-successful-qwen-code-test.md) | [简体中文](devlog-projects-qwen3-8-test-notes-first-successful-qwen-code-test_CN.md)

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

First successful end-to-end coding task: Create `arcology-control-room` in the current test root directory, implementing a directly openable **Arcology 2049 / Future City Energy Dispatch Center**. The deliverable is pure HTML/CSS/vanilla JS, with no dependencies on npm, frameworks, external images, or APIs.

Code location: `$HOME/Downloads/qwen3.8_test/arcology-control-room`.

## Fixed evaluation prompt

Subsequent agent / profile cross-comparisons must reuse this exact prompt; do not substitute a compressed version:

> Create a subfolder `arcology-control-room` in the current folder and complete a pure front-end project that can be opened and run directly: **Arcology 2049 / Future City Energy Dispatch Center**.
>
> Technical constraints:
>
> - Use only HTML, CSS, and vanilla JavaScript; do not use npm, frameworks, external images, or APIs.
> - Inline SVG, Canvas, and the Web Audio API may be used.
> - Split files into `index.html`, `style.css`, and `app.js`; the code must be complete and runnable.
> - Do not write lengthy explanations. Implement first, then self-check browser console errors and interactions.
>
> Visual goals:
>
> - A dark, high-end control room interface; do not make it a generic dashboard.
> - Center: a zoomable, draggable isometric future city SVG map containing 6 energy zones, building clusters, roads, rail transit lines, and energy pipelines.
> - The city must have continuous animations: vehicles moving along roads, rail trains looping, random flickering of building window lights, energy flow moving through pipelines, and a subtle rain/fog/particle background.
> - Left side: zone list and real-time energy overview; right side: alert stream, weather, and a dynamic line chart; bottom: timeline and dispatch console.
> - Include a brief loading / boot sequence animation on startup.
>
> Interaction requirements:
>
> 1. Clicking a map zone or an item in the left-side zone list focuses and highlights that zone on the map and updates the right-side detail panel.
> 2. The map supports wheel zoom, drag panning, and a Reset View button.
> 3. Top bar has a “LIVE / SIMULATION” toggle:
>    - LIVE: data automatically fluctuates every 1–2 seconds; charts and energy pipelines change accordingly.
>    - SIMULATION: pauses automatic changes; the user can drag the bottom timeline to simulate the next 24 hours.
> 4. Each zone has an energy status: normal / warning / critical. Alerts are generated randomly but reasonably; clicking an alert locates the corresponding zone.
> 5. Include an “Emergency Load Shed” button: it opens a confirmation modal; upon confirmation, a random zone enters a power-restriction state, city lights visibly dim, alerts increase, and the state can be restored via “Restore Grid”.
> 6. Add subtle button click sounds and alert sounds; enable audio only after the first user interaction.
> 7. Data refreshes, zone switching, and opening modals must have natural transition animations.
> 8. Responsive: desktop-first; on narrow screens, left and right panels can be collapsed, and the map remains usable.
>
> Acceptance criteria:
>
> - Opening `index.html` runs the project.
> - No placeholder text, unimplemented buttons, or console errors.
> - All simulated data is generated in JS.
> - Finally, provide a brief report on which files were implemented and which interactions were actually tested.

## Runtime setup

| Field | Value |
|---|---|
| Model | `True2456/Qwen3.8-27B-AWQ-5.0bpw`, used via oMLX local OpenAI-compatible endpoint |
| oMLX profile | `Qwen3.8-27B-AWQ-5.0bpw:coding-reason`: 131,072 context / 32,768 output / thinking low |
| Agent tool | `@qwen-code/qwen-code` v0.21.15 |
| Agent mode | YOLO / auto approval |
| Machine | MacBook Pro M5 Max, 128 GB unified memory |

## What the agent shipped

- `index.html`: boot sequence, three-column control room layout, map HUD, mode switching, timeline, console, and confirmation modal.
- `style.css`: dark high-density control room visuals, responsive sidebar, animations, and state styles.
- `app.js`: procedural SVG isometric city, vehicle/train/window light/pipeline/rain-fog animations, LIVE/SIM simulation, zone and alert interactions, zoom and drag, Emergency Load Shed/Restore, and Web Audio.

After generation, the agent independently ran JS parsing and headless Chrome/CDP console checks, and fixed two runtime issues related to the FX canvas backing-store and pointer-capture; its report is 0 console errors/warnings.

## Performance observation

This is a quality and stability test, and should not be used as a stable throughput benchmark: The Reason first-round output is recorded as approximately 19,827 completion tokens (of which 16,334 are reasoning tokens), with a single request taking approximately 980 seconds, and approximately 20 tok/s under long-context conditions; the post-generation decode during the shorter file-writing phase is approximately 28.5 tok/s. The `low` thinking in the cause profile is not a hard token limit.

### Long-running-session slowdown

In the same Qwen Code session that continued visual QA after Round 2, the oMLX v0.6.2 Dashboard screenshot provided by the user recorded: cumulative prefill **3,074,861 tokens**, of which **2,760,704** were cached, with a cache efficiency of **89.8%**; uncached prefill was **355.4 tok/s**, and average token generation dropped to only **18.1 tok/s**. This is approximately 36% lower than the roughly 28.5 tok/s observed during the initial short file-writing phase, and also slightly lower than the approximately 20 tok/s observed during the initial long-request phase.

This figure indicates that the **end-to-end generation experience is indeed slowing down** after sustained multi-round coding / review / CDP QA; however, the Dashboard’s “Total Prefill Tokens” represents the cumulative total across multiple requests and should not be misinterpreted as a single 307 ten-thousand-token context, nor should it be used in isolation to determine model or hardware degradation. High cache hit rates imply that prefill for repeated contexts has been effectively reused; the primary observation target for the continued slowdown is the decode / reasoning workload in long sessions. The next cross-comparison test should use a new session, fixed prompts, and a fixed profile to separately record the tok/s for the first request and the Nth-round request.

### QA continuation: cancelled, not a code regression

The user continued for approximately 3 hours in this round before canceling the task. Inspection of the actual files confirmed that the modification times for `index.html`, `style.css`, and `app.js` all remained at the times of the Round 2 fixes, with **no new product code changes**. Qwen's subsequent work primarily involved building/rerunning Chrome CDP QA: it left 14 desktop, interaction, Load Shed, and narrow-screen screenshots (in the temporary directory `/tmp/arcology-qa`), and repeatedly corrected errors in the tests themselves—including incorrect element IDs, misreading CSS properties, and invalid assertions caused by clicking an already selected region.

This indicates that the issue was not the model "making the code worse with each fix," but rather the agent falling into a **verification loop** due to the lack of a clear testing budget: repeatedly rebuilding the Chrome profile, recapturing screenshots, and continuing to reason about uncertain pointer clicks. The only actual new finding was horizontal overflow at the 1000px narrow screen, which was recorded as UX-02 (a historical local file, not published with this report); the user's cancellation was a reasonable stop-loss.

## Quality verdict

Round 2 verdict: **B+ implementation review**. Static parsing passed; map hit correctness, initial alert copy, and keyboard/modal accessibility issues have all been closed; the generated agent's CDP functional verification also supports these conclusions. Independent desktop / narrow-screen visual acceptance is still being executed by Qwen, and it is not treated as a final production-quality delivery until completed. See [Round 1 findings / Round 2 verification](devlog-projects-qwen3-8-test-notes-arcology-control-room-round-1-review.md) for details.
