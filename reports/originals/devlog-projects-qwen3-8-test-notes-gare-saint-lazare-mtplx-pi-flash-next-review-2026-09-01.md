---
type: Note
title: "Gare Saint-Lazare — MTPLX/Pi Flash Next independent acceptance and code review"
status: current
description: "Independent review of the Gare Saint-Lazare React/R3F delivery; simulation and tests are strong, but steam exit dissipation is a P1 requirement failure."
tags: [qwen3.8, flash-next, mtplx, pi, react, threejs, r3f, code-review, frontend]
timestamp: 2026-09-01T01:58:16Z
---

# Gare Saint-Lazare — MTPLX/Pi Flash Next independent acceptance and code review

[English](devlog-projects-qwen3-8-test-notes-gare-saint-lazare-mtplx-pi-flash-next-review-2026-09-01.md) | [简体中文](devlog-projects-qwen3-8-test-notes-gare-saint-lazare-mtplx-pi-flash-next-review-2026-09-01_CN.md)

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

## Scope and evidence handling

The acceptance authority is `test-prompts/3d-gare-saint-lazare.md` (historical local file, not released with this report). The reviewed delivery is `$HOME/Code/qwen3.8-tests/gare-saint-lazare-flash-with-pi`; it is not a Git repository, so this review is of the working tree rather than a commit diff.

The user-provided terminal/dashboard screenshots are context only, not completion proof. The browser-tab reference could no longer be claimed, so verification instead used the checked source, a fresh production preview, the committed Playwright screenshots, and independent local Playwright probes. The Orbital Garden review supplied the comparison contract: R1–R7 / 100 points, and any P1 finding blocks acceptance.

## Run configuration and performance context

| Field | Recorded value | Provenance |
|---|---|---|
| MTPLX | `2.10.1` | User statement, 2026-09-01. |
| Model | [`Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed`](https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed) | User-provided model URL. |
| Agent | Pi | User statement. |
| Context capacity | 196K tokens | User statement. |
| Long-task decode observation | approximately **40 tok/s** stable after the final long task | User statement; a session-level observation, not a controlled benchmark. |

The final value must not be compared directly with another model/profile's dashboard or task run. It does not establish cold/warm cache state, prompt/completion tokens, TTFT, wall-clock duration, tool rounds, hardware contention, or request isolation. It is retained as useful session context for a later controlled replay.

### Vision-input diagnosis

The upstream `Qwen/Qwen3.8-Flash-Next` is multimodal: its model card labels it Image-Text-to-Text, describes a causal language model with vision encoder, and gives image-input examples. The MTPLX quantization card also says that the vision tower remains in the weights. Therefore Pi's statement that it "cannot read images" describes the active agent/runtime path, not the underlying model's architecture.

The active Pi `models.json` registers `mtplx-flash-next-optimized-speed` with `input: ["text"]` (`$HOME/.pi/agent/models.json:26-29`). Pi consequently treats it as text-only and will not forward attached image content. Pi's own VLM guidance says an OpenAI-compatible model must declare `input: ["text", "image"]`; otherwise image content may be dropped. Changing that declaration alone is insufficient: the selected MTPLX server/API path must also accept multimodal chat content and invoke the vision processor. Verify the full path with a one-image prompt and server-side request inspection before relying on visual self-review.

Sources: [upstream Qwen model card](https://huggingface.co/Qwen/Qwen3.8-Flash-Next), [MTPLX quantization card](https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed), [Pi VLM configuration guidance](https://github.com/earendil-works/pi/issues/2687).

## Result

**Verdict: Request Changes — 78/100 (7.8/10).**

The core diorama is materially implemented: a constrained 3/4 R3F scene, two track lanes, modern and steam consists, a deterministic train/pedestrian simulation, programmatic audio, weather, debug information, and director mode. The P1 is specific and reproducible: residual steam is destroyed with the departing train instead of dispersing after it leaves the sandbox. Responsive, motion-preference, and end-user interaction evidence also need work.

| Rubric | Score | Why |
|---|---:|---|
| R1 — scene and spatial construction | 14/15 | R3F, bounded diorama, two track trenches, canopy, clock, station structure and skyline are present without external models. |
| R2 — train, pedestrian, direct interaction | 18/20 | State machine, precise docking, passenger coupling, train information and weather controls are implemented; browser proof does not physically click a train or clock. |
| R3 — audiovisual and dynamic presentation | 9/15 | Three weather states, rain and procedural audio exist, but exit steam and broadcast degradation fall short. |
| R4 — resilience and accessibility | 13/20 | Forced no-WebGL case is informative and canvas-free; reduced motion is partial and 390×844 HUD panels overlap. |
| R5 — art direction | 8/10 | Clear miniature-station composition, but daylight remains comparatively low-poly/toy-like and wet/cinematic material response is restrained. |
| R6 — verification evidence | 9/10 | lint/build, 8 unit tests, 7 E2E tests and four requested screenshot states exist; missing targeted regressions reduce confidence. |
| R7 — code quality and review readiness | 7/10 | Focused sim/render/UI boundaries and pooling are strong, but a P1 plus the listed P2s prevent release readiness. |
| **Total** | **78/100** | **Request Changes; FE-18 is P1.** |

## Independent verification — 2026-09-01

| Check | Result | Evidence |
|---|---|---|
| Lint | Pass | `npm run lint` exited 0. |
| Production build | Pass with warning | `npm run build` exited 0; Vite emitted 1,012.87 kB JS / 283.63 kB gzip and the standard >500 kB chunk warning. |
| Simulation tests | Pass | Vitest 8/8 passed, including 15-minute same-track non-overlap, precise docking, natural boundaries, crowd curve and deadlock checks. |
| Browser E2E | Pass | Playwright 7/7 passed in 28.9 seconds: boot, docked modern train, steam, rain/night, info card, director mode and audio enable. |
| Visual states | Pass | `e2e/screenshots/01-boot.png`, `02-docked.png`, `03-steam.png`, and `04-rain.png` visibly show the required initial, modern, steam and rain states. |
| 390×844 responsive probe | P2 failure | No horizontal document overflow, but `.plaque` is x=20/w=353.6 and `.toolbar` is x=0/w=370 at the same y=18; bottom debug and sound panels overlap. |
| Forced 320×568 no-WebGL | Pass | Overriding WebGL contexts produced 0 canvases, readable explanatory text and no document overflow. |

## Findings

### P1 — steam residue is destroyed at the sandbox boundary instead of gradually dissipating

`SteamPlume` is a child of `SteamTrain`. Its particles have individual lifetimes, but are held in the train's local coordinate system. `Simulation.step()` removes the train immediately when its tail clears the far boundary, and `SceneContent` then removes `TrainView`; the entire plume therefore disappears with the train. This misses the explicit requirement that steam gradually dissipate after departure.

Move residual particles into a scene-level, world-coordinate pool or retain a detached emitter after train cleanup until its live particles expire. Add a regression that samples particles after `EXITED` and proves a decreasing, nonzero count before full fade-out.

Evidence: `gare-saint-lazare-flash-with-pi/src/render/Trains.tsx:99-160,315`; `src/render/Scene.tsx:191-203`; `src/sim/simulation.ts:182-183`.

### P2 — broadcast falls back to a jingle, not an announcement

`announce()` invokes speech only if a French browser voice is already available. Without one it plays a short chime; that is not a French-style arrival announcement. Its `_gain` argument is also unused, so synthesized speech does not follow the stated distance mixing.

Always issue an utterance with `lang='fr-FR'` even without a matching voice, or provide a true synthesized speech-like fallback; map distance to the available volume control.

Evidence: `gare-saint-lazare-flash-with-pi/src/audio/AudioEngine.ts:201-224`.

### P2 — reduced-motion implementation is only partial and documentation overclaims

The preference suppresses rain and pedestrian bobbing, but simulation speed, trains and steam remain fully animated. README says the simulation becomes slow, which has no corresponding implementation. Either add a reduced time-scale/pause for nonessential effects or revise the documentation to describe the actual behavior.

Evidence: `gare-saint-lazare-flash-with-pi/src/App.tsx:41-47,74-77`; `src/render/Scene.tsx:204`; `src/render/Passengers.tsx:79-80`; `README.md:89-90`.

### P2 — mobile HUD components overlap

The desktop-only absolute layout allows the top controls to cover the plaque, and the debug and audio controls to overlap at 390×844. Add a mobile media query that stacks or collapses the controls, and cover the layout in browser regression.

Evidence: `gare-saint-lazare-flash-with-pi/src/styles.css:54-85,108-150,200-208`; fresh 390×844 Playwright probe recorded above.

### P2 — E2E bypasses two requested direct interactions and misses fallback/motion coverage

The train-card test calls `window.__gare.select()` rather than clicking projected canvas geometry; weather testing clicks the toolbar rather than the physical clock. The suite has no mobile, forced no-WebGL, reduced-motion, exit-smoke, or audio-event assertions.

Evidence: `gare-saint-lazare-flash-with-pi/e2e/diorama.spec.ts:81-106`.

## Positive findings

- `sim/` is framework-free and directly tested; rendering reads simulation state rather than owning game logic.
- Lane occupancy and long-running tests provide credible protection against train overlap and abrupt boundary spawning.
- Passenger flow is state-coupled rather than random wandering, with queueing, boarding, alighting and cooldown states.
- Passenger, wheel and static-detail rendering use instancing; steam uses a fixed 170-slot pool rather than unbounded allocation.
- HUD exposes cycle, train count, platform occupancy and FPS, while director mode removes all UI.

## Recommended close-out

1. Resolve FE-18 first, then add a visual/behavioral post-exit smoke regression.
2. Implement a reliable announcement fallback and align it with distance/volume behavior.
3. Correct reduced-motion semantics and responsive HUD layout.
4. Expand E2E to direct canvas train/clock clicks, 390×844, forced no-WebGL, reduced motion, and exit-smoke persistence.
5. Re-run the full verification matrix before reconsidering acceptance.
