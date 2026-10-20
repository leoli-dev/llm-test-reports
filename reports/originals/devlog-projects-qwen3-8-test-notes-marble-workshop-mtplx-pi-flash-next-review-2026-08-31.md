---
type: Note
title: Marble Workshop — MTPLX/Pi Flash Next independent acceptance and code review
status: current
description: Independent review of the MTPLX + Pi qwen3.8-flash-next-optimized-speed Marble Workshop delivery; its interaction, presentation, build and 10 checks pass, but surrogate tray scoring means it does not fully satisfy the real-physics result requirement.
tags: [qwen3.8, flash-next, mtplx, pi, threejs, cannon-es, code-review, frontend]
timestamp: 2026-08-31T20:57:57Z
---

# Marble Workshop — MTPLX/Pi Flash Next independent acceptance and code review

## Scope and evidence handling

The user-provided task specification is the acceptance authority. The reviewed delivery is `$HOME/Code/qwen3.8-tests/marble-workshop-flash-with-pi`, served at `http://127.0.0.1:5188/`. The supplied MTPLX dashboard and terminal screenshots are context only, not implementation evidence. Their self-reported 4/4 physics and 6/6 Playwright results were independently rerun against the checkout.

The benchmark configuration, as reported by the user, is MTPLX + Pi, `qwen 3.8 flash next optimized speed`, a 196K context window, and roughly six hours elapsed. The dashboard screenshot shows 197K capacity and 17M lifetime tokens, while the terminal screenshot shows 76.8% context occupancy; those are shared dashboard/session observations, not a reproducible per-task throughput measurement.

## Canonical benchmark task (verbatim)

```text
制作一个 3D “Marble Workshop”：

- 用户点击“投放”后，从顶部落下一颗弹珠；弹珠会经过斜坡、环、风扇和弹簧板，最终落入不同颜色的收集槽。
- 使用真实物理碰撞；用户可拖动障碍物、暂停/继续、重置场景。
- 右侧面板实时显示：已投放数量、各颜色得分、当前 FPS。
- 每种收集槽触发不同的视觉反馈；不能依赖预录视频或 GIF。
- 页面首次打开要有 10 秒自动演示。
- 给出至少 3 个自动化验证：投放、暂停、重置。
```

## Fixed 100-point acceptance rubric

This rubric follows the fixed-score, P1-gated approach used for the earlier Orbital Garden review, adapted only to this task. Awarded points require direct verification; source inspection corroborates browser/physics evidence but does not replace it.

| ID | Dimension | Max | Point standard |
|---|---|---:|---|
| R1 | Physics machine and route integrity | 30 | 10: Three.js + real Cannon rigid bodies; 10: a user drop is physically routed through the named machine elements; 10: a score is awarded only after entry into the actual coloured-bin volume. |
| R2 | Direct operation and live HUD | 25 | 5 each: drop, obstacle drag, pause/resume, reset, and live dropped/colour-score/FPS display. |
| R3 | Feedback and 10-second first-run demo | 15 | 10: visibly distinct per-bin procedural feedback with no video/GIF; 5: fresh page self-demonstrates for 10 seconds then releases control. |
| R4 | Automated verification | 15 | 5: at least the requested drop/pause/reset checks; 5: headless physics regressions; 3: independent production build; 2: independent live-browser confirmation. |
| R5 | Code quality and review readiness | 15 | 5: scene/physics/UI separation; 4: deterministic/reproducible test assets; 3: credible rendering-performance controls; 3: no unaddressed P1 or misleading user contract. |
|  | **Total** | **100** |  |

**Decision rule:** `Pass` needs at least 85/100, every R1--R3 core behaviour, and zero P1 findings. `Request Changes` applies to 70--84 or any score containing a P1. `Fail` is below 70 or misses the interaction/HUD core.

## Result

**Verdict: Request Changes — 84/100 (8.4/10).** This is a polished and well-structured interactive 3D application: it has a live Cannon world, excellent in-page controls, strong procedural feedback, a working 10-second demo, and unusually useful tests. But the result/score layer silently converts several kinds of failed physics outcome into a coloured-bin score. That is a P1 against the explicit requirement that a marble *ultimately falls into* a collection bin using real collisions.

| Rubric | Score | Why |
|---|---:|---|
| R1 | 21/30 | Three/Cannon and the main authored route are real. All 24 sampled lanes eventually received a bin result, but 3 were watchdog `settle` outcomes and the code can score a loose or stranded marble via `nearestBin` rather than physical bin entry. |
| R2 | 25/25 | Independent Chromium checks verified scene/HUD boot, drop/score, a genuinely frozen pause, resume, reset, and obstacle placement/drag. The live page also exposes the required counters and controls. |
| R3 | 13/15 | Five bin-specific geometry/particle reactions are implemented without media assets and the fresh page displayed `AUTO DEMO` with a 9.3-second countdown. The demo's hard-coded x values are outside the real spout range, so it does not demonstrate the same full top-of-machine route as a manual drop. |
| R4 | 14/15 | Production build, 4 headless physics tests, and 6 browser tests pass. Tests cover the three asked-for operations and more, but treat `settle` as a valid score and do not assert that demo drops use the launcher lane. |
| R5 | 11/15 | Physics is cleanly isolated from Three, automated probes are practical, and high/low quality rendering is credible. P1 route/score integrity, no lint command, three console warnings, and a UI claim for unsupported Q/E rotation reduce review readiness. |
| **Total** | **84/100** | **Request Changes because MW-01 is P1.** |

## Independent verification — 2026-08-31

| Check | Result | Evidence |
|---|---|---|
| Production build | Pass | `npm run build` exited 0: 29 transformed modules; output JS 720.24 kB / 189.88 kB gzip. |
| Physics suite | Pass, with qualification | `npm run test:physics` passed 4/4: 24/24 lane resolution, 20-marble crowd drain in 12.7 s, deterministic replay, and no reset body leak. `scripts/trace.mjs` separately reported 20/24 lanes rode the track and three `settle` outcomes. |
| Browser suite | Pass | `npm run test:e2e` exited 0: 6 Chromium checks in 47.7 s (boot/HUD, drop/score, pause/resume, reset, obstacle drag, camera/time scale). |
| Live page / art direction | Pass | User-supplied Chrome tab rendered a glass-contained, lit physical workshop, rails, hoops, collector field, bright bin reactions and restrained control panel--not a video, GIF, or generic dashboard substitute. |
| Fresh automatic demo | Pass, caveat | Reload showed `AUTO DEMO`, countdown `9.3s`, `DROP #1 x=-1.20`, orbit camera and a live in-play marble. The scheduled 0.2--9.9 s script establishes the intended 10-second tour. |
| Required controls and HUD | Pass | Live DOM exposed 投放, 暂停, 重置, time/camera controls, obstacle palette, dropped, in-play, total score, FPS, and five per-colour counters. |
| Console cleanliness | Needs cleanup | No blocking exception; Chrome logged two `UnrealBloomPass` sigma clipping warnings and one deprecated `PCFSoftShadowMap` warning on a fresh load. |

## Code review

### P1 — failed physical routes are converted into genuine-looking bin scores

Only the initial `binAt(pos)` branch (`src/sim/world.js:239-244`) proves that the marble entered a real bin volume. The later loose-tray branch maps any untracked marble below y=3.4, after it has travelled sufficiently far, to either a synthetic y=1.6 bin test **or the nearest bin** (`src/sim/world.js:263-272`). The final watchdog maps slow, long-travel, or 14-second marbles directly to `nearestBin` (`src/sim/world.js:284-289`). `src/game.js:287-315` deliberately treats both `collect` and `settle` identically for score, HUD, toast, tray light and celebration.

This is observable in the project's own `scripts/trace.mjs`: 3 of 24 lane results are `settle`, yet the suite reports every marble as collected. The physics regression codifies the loophole by accepting `/^(collect|settle)/` in `scripts/physics-drain.test.mjs:131-132`. A stranded or escaped-in-the-tray marble must remain visibly unresolved (or be returned through real physical geometry), not be assigned points based on proximity. Change the automatic recovery to a physical return chute/teleporter visibly marked as such, or report it as a failure with no score; then make the default lane and crowd tests require a sensor `collect` event only. Tracked as MW-01（历史本机文件，未随本报告发布）.

### P2 — the first-run demo drops outside the manual launcher lane

Manual drops use `course.spawn.xRange`, which is `[-11.3, -9.9]` (`src/game.js:115-126`, `src/sim/course.js:342`). Every scheduled demo drop instead supplies x from -1.5 to 1.4 (`src/demo.js:9-23`). The live fresh-page evidence confirms `DROP #1 x=-1.20`. These balls still begin at the top y coordinate but bypass the actual spout/intake corridor, so the demo does not reliably demonstrate the required slope/hoop/fan/spring sequence. Generate demo x values from the documented spawn range and add a test that each demo drop registers the `run` and `finale` route pieces before it can score. Tracked as MW-02（历史本机文件，未随本报告发布）.

### P2 — advertised Q/E obstacle rotation has no handler

The HUD says `Q/E 旋转` (`src/ui/hud.js`, rendered in the live DOM), but the complete keyboard dispatcher in `src/main.js:219-246` has no `q` or `e` case and `world.js` exposes no obstacle-rotation operation. Either implement safe rotation (including collider and visual quaternion updates) or remove the instruction. Tracked as MW-03（历史本机文件，未随本报告发布）.

### P2 — fresh page logs avoidable Three warnings

`PCFSoftShadowMap` at `src/view/scene.js:22-23` is deprecated by the installed Three version. `UnrealBloomPass` at `src/view/scene.js:94-99` emits two sigma-sample clipping warnings with its current parameters. Neither blocks the task, but a clean verification baseline matters for a visual benchmark. Use the non-deprecated shadow-map choice and tune/cap the bloom kernel for the installed Three release. Tracked as MW-04（历史本机文件，未随本报告发布）.

### P2 — no static lint gate

`package.json` has build, physics, browser and combined verify scripts, but no `lint` script or linter dependency. The source is readable and modular, but reproducible review should include at least a configured static lint command. Tracked as MW-05（历史本机文件，未随本报告发布）.

## Positive findings

- The architecture is unusually reviewable for a compact visual task: `src/sim` is independent of Three, `src/game.js` owns orchestration, `src/view` owns meshes/FX, and `src/ui/hud.js` owns DOM.
- The 120 Hz fixed-step simulation, explicit marble/body cleanup, deterministic replay test, 20-marble crowd test, and pointer-picking probe make regressions concrete rather than visual guesswork.
- Five collector reactions are genuinely distinct and procedural (e.g. crimson shock/flame, azure shards, gold beam/coins, amber dust, violet implosion) in `src/view/fx.js`; no prerecorded media is used.
- The user-facing experience is coherent: right-side score/status panel, physical glass machine, contained glow and pause/reset/drag affordances read well together. High/low quality controls (DPR, AA, shadows, composer and particle count) are appropriate to the rendering load.

## Recommended close-out

1. Resolve MW-01 first and make score evidence distinguish real sensor collection from any visible recovery mechanic; re-run the 24-lane and crowd suites with `settle` forbidden.
2. Put demo balls back in the actual spout range and verify their route-piece coverage (MW-02).
3. Correct the Q/E contract, remove the Three warnings, and add `npm run lint`.
4. Re-run `npm run verify`, then repeat a fresh-page demo and direct UI drop/pause/reset check. A clean MW-01 remediation would move the product into passing range.
