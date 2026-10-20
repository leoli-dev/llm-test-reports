---
type: Note
title: "Neon Bastion ds-v4-flash-vision run — A–G progress (35/55)"
status: current
description: "Re-ran Neon Bastion using the same 55-task specification under the ds-v4-flash-vision-with-dsh deployment; A01–G08 (35/55) completed, and the game has reached a playable closed loop of \"runnable, playable, killable, restartable, spectatable + complete HUD/minimap/settlement\"."
tags: [neon-bastion, ds-v4, deepseek, benchmark, task-decomposition]
timestamp: 2026-09-08T09:40:00Z
---

# Neon Bastion ds-v4-flash-vision run — A01–A03

[English](devlog-projects-qwen3-8-test-notes-neon-bastion-ds-v4-flash-vision-run-2026-09-08.md) | [简体中文](devlog-projects-qwen3-8-test-notes-neon-bastion-ds-v4-flash-vision-run-2026-09-08_CN.md)

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Mac client / local comparison; cloud hardware was not recorded |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | See original report; current snapshot does not fill missing historical configuration |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | Not recorded in the surviving test evidence; current OS is not substituted |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

Under the **same set of 55 task specifications** (`~/Code/qwen3.8-tests/test-prompts/neon-bastion/` + `INDEX.md`),
redeploy `ds-v4-flash-vision` from scratch to rerun Neon Bastion, verifying whether the task specifications and methodology hold equally for another model.

- Deployment: DeepSeek `ds-v4-flash-vision` (executed directly as an agent in this session, no external feeding script required)
- Working directory: `~/Code/qwen3.8-tests/ds-v4-flash-vision-with-dsh-neon-bastion`
- **Current progress: 3/55 (A01–A03), user paused as planned after A03 completion, preparing to disconnect**

## Delivery Facts

**2026-09-08 Continuation: Sections A–D (16/55) all completed.** 16 commits (`880ae2a` A01 → `4f831ca` D05). Final state `npm run build` exit code 0,
**Unit tests 265 (15 files)**, E2E 3 (placeholder page). Both `npm test` and `npm run test:e2e` are green.

Delivered modules (all pure logic layer, no three.js / DOM / AudioContext):
- A: util / types / CONFIG / rng (xorshift32+fmix32 with injectable seed, `hashSeed` salt isolation, Math.random forbidden)
- B: mapData (single source of truth for map) → geometry (AABB/ground height/slab ray, glass dual-mode `ignoreGlass`) → navmesh (distance+LOS edge construction + deterministic Dijkstra) → generateMap (four layouts + seed pure function, connectivity-based map swap)
- C: movement (axis-separated collision/gravity/jump/maxStep stepping) → playerInput (four-directional self-consistent input, `r=f×up`) → render/camera (FOV/bob/recoil/hit impact/reduced-motion, pure math, read-only Unit)
- D: weapon (cooldown/semi-auto/spread pure function) → bullet (object pool + swept line segment CCD to prevent tunneling) → hitscan (wall priority/head-body hitboxes/glass visible but unhit/ally damage immunity/HP≥0) → fire (single firing entry point + scoring invariant + event bus killfeed≤5) → match (8-unit orchestration, fixed tick, freeze, pure data snapshot)

Dependency versions: three ^0.185.1, vite ^8.2.2, vitest ^5.0.0, @playwright/test ^1.63.0, typescript ^7.0.2.

Initial environment issue: npm global cache contained root-owned temporary files (`~/.npm/_cacache/tmp`), `npm install` reported EPERM;
switched to project-local `--cache .npm-cache` to avoid it (toolchain environment issues should not pollute the delivery).

Negative controls (A01 Rule #6) executed per task: A02 type error → build non-0; A03 changed hpMax → CONFIG assertion red; A04 removed salt/injected Math.random → red;
B01 removed central pillar/changed id25 material → red; B02 deleted glass branch → dual-mode assertion red; B03 changed tie-break → determinism red; B04 bypassed connectivity map swap → SEVERED red;
C01 disabled axis fallback + radial correction → "not inside wall" red; C02 inverted r → four-directional self-consistency red; C03 depth freeze proved no Unit pollution; D01 removed shotIndex → each shot different red;
D02 swept segment collapsed to endpoint → thin wall tunneling red; D03 ignored wall priority → behind wall/glass red; D04 let AI skip shot event → core assertion red; D05 deleted freeze guard → freeze test red.

**2026-09-08 Continuation: Sections E–G (35/55) completed.** Cumulative 34 commits (`880ae2a` A01 → `6ddbe42` G08). Final state `npm run build` exit code 0,
**Unit tests 407 (28 files)**, **E2E 52 (13 specs)**, `npm run test:all` all green.

- **E (AI, E01–E07)**: Perception (frustum/visibility range/occlusion, glass does not block line of sight; audio does not provide identity) → state machine skeleton + navigation pathfinding follow (deterministic brain, shares `stepUnit` with player) → doctrine personality (seed pure function, exactly 2 flankers + 2 rushers per team) → firing decision (reaction delay, aim offset hit rate, `minFireDist`, **refuses to fire through glass**, via D04 single `fireFrom`) → anti-stall (four progressive gates + `retreatDwell` third exit + per-unit no-contact timer + Match hard time limit `warTime+150`) → anti-stuck (`handleStall` detection + corner tangential slide-out + engagement not interrupted) → termination full scan (seed 1..40, 300 logical seconds, per-tick three invariants, failure prints reproducible seed). **All 40 seeds terminate**.
- **F (Application Shell, F01–F03)**: `src/app.ts`'s `App` (pure logic: screen state machine, fixed 1/60 accumulator `acc += min(realDt, maxFrameDt 0.25)`, `fastForward`/`teleport`/`setSeed`/`playAgain`, single input entry point) + `mountApp` (DOM/rAF/Pointer Lock) + `src/testHooks.ts` (`window.__nb`, same `applyKey`/`applyLook` path as real input) → `src/render/scene.ts` generates geometry from `mapData.solids` (cached reuse by size; 8 units share capsule geometry + one material per team; `map/sceneGeometrySignature` proves scene comes from current map) → death spectating (`resolveSpectator` pure function, Q/E circular switching, `spectateCamera` third-person smooth follow / blue team wipeout falls back to free top-down 26m). **C03's camera E2E added in F01 per notes**.
- **G (Match UI, G01–G08)**: HUD (DOM overlay `.nb-root`, crosshair/segmented health bar/**cooldown is not ammo**/score/killfeed) → real-time leaderboard (reused component, player highlight, stable non-jittering by id for same score, DOM readback `totalScore === hitScore + 3×kills`) → minimap (**shared view does not see through**: `sharedViewCanSee` shown only if any surviving unit on own team sees it, last known position fades out 0.7s, glass does not block line of sight; independence of two view parameter sets for `ai.*` and `minimap.*` locked by tests) → hit/hit feedback (vignette + direction arc `damageBearing` + headshot/body hitmarker + floating 20/50, **subscribes only to D04 event bus**) → settlement layer and restart (reused leaderboard, hides all in-match chrome, restart leaves no residue) → director mode F2 + debug panel F3/`` ` `` → reduced-motion 与 no-WebGL fallback（`?nogl=1` 永不白屏、比赛照常；云在 reduced-motion 下"停运动不删元素"）→ favicon/theme-color/apple-touch-icon（内联 SVG data-URI，`#`→`%23`).

**New engineering habits added in Section G (reusable)**:
- **Negative controls must confirm build success before running E2E** — both instances of "control group all green" illusion in this round stemmed from `tsc --noEmit` failing due to unused local, leaving `dist/` as old build; `npm run build`'s exit code is a hard gate (same source as OPS-12).
- **Assertions should read "visible things"**: debug panel state assertions initially read `data-state` attributes, passing even with hardcoded display text; changed to read visible `<span>`'s textContent and added non-uniform assertion "5 is dead and not all rows identical" before truly bearing weight. Similarly, G02's invariant assertion was always true when "all scores are 0", so used `addScore` to create non-zero values before asserting.
- **Reusing components affects existing assertions**: after settlement layer reused `Scoreboard`, G02's "exactly 1 `.nb-scoreboard`" changed to "exactly 1 `.nb-root > .nb-scoreboard` (in-match)".

## Current Status

**Sections A–G all completed (35/55).** Critical path A→B→C→D→E→F long since established: logic layer can run full AI-vs-AI matches and **every match terminates**; application shell connects Match to browser (fixed tick / screen state / input / test hooks); renderer draws arena from mapData; death spectating, HUD, real-time leaderboard, minimap (shared view), hit/hit feedback, settlement and restart, director mode and debug panel, reduced-motion and no-WebGL fallback, favicon all in place. **The game is now a "playable minimal loop + complete UI"**, only missing art (H), humanoid and weapon holding (I), effects (J), audio (K), and evidence and delivery (L–M).

## Differences from Previous Round (qwen 55-task)

- Different deployment/model (this round uses `ds-v4-flash-vision`), no external orchestration script; executor is this agent.
- Upon resumption, context can be reconstructed via devlog Recall, no need to rely on previous `notes/neon-bastion-55task-rerun-2026-09-07.md`.

## Resumption Point

Start from **H01**. Task specifications located in `test-prompts/neon-bastion/`, in alphabetical order per `INDEX.md`.
Definition of done per task: `npm run build` exit code 0 + all new tests green + no regression in existing tests + separate commit + one negative control for each new assertion.
**Negative control process reminder**: first modify code → run `npm run build` and confirm `built in` (otherwise E2E tests old `dist/`) → run target test to confirm it turns red → revert → rebuild.
