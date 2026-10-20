---
type: Note
title: "Neon Bastion — Round 6 review: ten tasks from playable to game-like"
status: current
description: "New requirements after human play confirms AI-01's intent: humanoid characters/walking, first-/third-person weapons, textures, thicker trails, blood/sparks, BGM and favicon; THREE.Line width root cause and hitbox consistency constraints."
tags: [neon-bastion, qwen3.8-27b, mlx-dspark, pi, code-review, game-art]
timestamp: 2026-09-03T12:00:00Z
---

# Neon Bastion — Round 6 review

[English](devlog-projects-qwen3-8-test-notes-neon-bastion-round-6-review-2026-09-03.md) | [简体中文](devlog-projects-qwen3-8-test-notes-neon-bastion-round-6-review-2026-09-03_CN.md)

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

## Starting point: AI-01 passes the one acceptance check that cannot be automated

Round 5 leaves four items with only event/pixel evidence requiring real play. AI-01 is the most expensive and least amenable to automated proof:

> AI-01 takes the most time and most complex changes (`aiController.ts` +360 lines), but its value depends entirely on players perceiving flanking. Unit tests establish that flanker nodes are farther from teammate centroid, not that the behavior is evident on screen.

The user's play feedback: **AI is much smarter; it sometimes sticks in corners, but feels more human, takes cover and ambushes—excellent.**

Taking cover and ambushing is precisely flanker doctrine's intent; feeling more human is personality differentiation's intent. **Acceptance is established**, supporting the 2h56m investment and root-cause intervention. A new defect remains: occasional corner sticking, BUG-03, in the same area as AI-01's out-of-bounds stagnation handler and evidently not fully eliminated.

All requirements this round come from that playthrough, shifting from whether it is playable to whether it feels like a game.

## Root cause: thicker trajectories require more than parameter tuning

The user reports trajectories remain too thin, small and hard to see.

Current tracers/projectile trails use `THREE.Line` + `LineBasicMaterial` (`renderer.ts:573`, `:591`). **WebGL ignores `linewidth` on nearly all platforms and rasterizes at 1 pixel**, a documented Three.js platform limitation rather than this project's implementation bug.

**Increasing `linewidth`, extending `bulletTrail` or raising opacity cannot add a pixel of width.** Replace geometry with cylinders aligned to trajectories or camera-facing billboard quad strips. State this explicitly, or the model will likely tune parameters and repeatedly try again when no difference appears, as Round 4 AI-01 consumed nearly 3 hours.

This resembles Round 4 brightness: **repeatedly reported symptoms often originate outside parameter tuning.** Brightness required a measurement definition to uncover the cause; line width is a known platform limitation that documentation can confirm.

## Cross-round constraint: visuals must remain aligned with hitboxes

The user requests humanoids with heads, torsos, arms, legs and walking. Current characters are two boxes: `BoxGeometry(0.8, 1.0, 0.8)` body + `BoxGeometry(0.44, 0.4, 0.44)` head (`renderer.ts:545-547`).

Hit detection uses different geometry (`units/units.ts`):

```
body AABB   0.84 × 0.84 × 1.42   (从脚起)
head sphere 中心 y=1.6，半径 0.27  (即 y 1.33..1.87)
eyeHeight   1.62
```

**Current boxes already differ from hitboxes**: body height 1.0 versus AABB height 1.42, hidden by flat blocks. With recognizable humanoid outlines, players aim at visible arms, legs and shoulders. If those lie outside hitboxes, apparently successful hits cause no damage, which is worse than crude boxes.

Every character task therefore requires **torso/head to fill and fit the hitboxes; limbs may exist but must not extend noticeably beyond the AABB**. If human proportions require different geometry, update `CONFIG` hitbox dimensions and corresponding unit tests together. **Visual-only changes are prohibited.**

## Task decomposition

Ten tasks in `~/Code/qwen3.8-tests/neon-bastion-tasks-r6/task-{1..10}.md`, delivered and committed independently in dependency order.

| # | ID | Task | Dependencies |
|---|---|---|---|
| 1 | FX-04 | Replace `THREE.Line` with visible-width trajectory geometry | — |
| 2 | FX-05 | Blood on character hits; sparks on wall/ground hits | — |
| 3 | ART-08 | Humanoid head/torso/arms/legs aligned with hitboxes | — |
| 4 | ART-09 | Walking: limbs step with movement | 3 |
| 5 | ART-10 | Third-person held weapon, raised when firing | 3 |
| 6 | ART-11 | First-person weapon model in lower-right view | 5 |
| 7 | ART-12 | Wall textures: leafy hedge clusters and reflective glass details | — |
| 8 | ART-13 | Refine sky/ground textures and more visible clouds | — |
| 9 | AUD-03 | Fast, tense combat BGM | — |
| 10 | UI-03 | favicon | — |

**Why trajectories and blood come first:** these are additive, dependency-free changes with immediately visible effects. Humanoids alter screenshot baselines/pixel assertions; putting them later isolates verification of the first two tasks.

**Why first-person weapons follow third-person:** both can reuse the same weapon-geometry constructor. Third-person implementation first exposes the model to external-view screenshot checks before reuse in the view model.

## Acceptance baseline

Continue Round 4's independent per-task acceptance: `npx tsc --noEmit`, `npx vitest run` and `npx playwright test` must all pass before committing. **Run `npm run build` before E2E**: `playwright.config.ts` uses `vite preview` as `webServer`, serving `dist/` without building, otherwise tests can all pass against old output.

Cross-task invariants:

- Four hit rules: wall priority, head/body hitboxes, no friendly damage, one score per shot.
- Full-match termination regression for seed 1..40.
- Same seed → same map → same match result.
- ART-06's five brightness criteria—`meanLuma ≥ 90`, `darkFrac ≤ 0.15`, at least 4 nonempty histogram bins, `mean(R)−mean(B) ≤ 40` and distinguishable team colors—**must not be relaxed**.
- Zero external assets: all textures generated procedurally through Canvas/shaders; no image/model/audio files loaded.

## Methodology continuation

Round 4's missing-acceptance-condition lesson is refined here: **thin trajectories are reported only once, but the cause is again outside parameters.** Brightness is continuous and needs a measurement definition to judge sufficiency; line width is a binary platform capability.

**Refined rule:** when feedback says an effect is insufficiently visible or not X enough, first establish whether the property is **adjustable on the current technical path**. If not, as with WebGL line width, replace the implementation path rather than defining an unusable acceptance test. If adjustable, establish measurable criteria. **Feasibility comes before acceptance criteria.**
