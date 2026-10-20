---
type: Note
title: "Neon Bastion — Round 4 review: gameplay/scene redesign and ten-task decomposition"
status: current
description: "Human play feedback after five Round 3 specifications were delivered, translated into ten executable tasks covering glass semantics, deterministic random maps, strategic AI personalities and measurable minimum brightness."
tags: [neon-bastion, qwen3.8-27b, mlx-dspark, pi, code-review, game-design]
timestamp: 2026-09-02T23:40:00Z
---

# Neon Bastion — Round 4 review

[English](devlog-projects-qwen3-8-test-notes-neon-bastion-round-4-review-2026-09-02.md) | [简体中文](devlog-projects-qwen3-8-test-notes-neon-bastion-round-4-review-2026-09-02_CN.md)

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

## Purpose of this round

All five authoritative Round 3 specifications (FX-02, FX-03, GAME-01/02/03, GAME-04) are delivered, with all five commits independently verified:

| Commit | Content | Verification |
|---|---|---|
| `b2737b6` | AI firing joins the shared event bus | 40/40 unit tests, 6/6 E2E |
| `2a0ef04` | Player hit feedback + firing recoil | 48/48, 7/7 |
| `82f5dd4` | Unified 1 shot/second + player semi-auto | 50/50, 7/7 |
| `2ecb605` | Reloading and ammunition completely removed | 49/49, 7/7 |
| `328dae6` | Bullets become dodgeable flying projectiles (60 u/s) | 53/53, 7/7 |

The user judges the basic functionality largely sound. **This round redesigns gameplay and the scene rather than reviewing defects.** Requirements come directly from human play feedback and override conflicting parts of `test-prompts/3d-team-arena.md`.

Scoring remains deferred (PLAY-01 is still open), for the same reason as Round 3, now stronger: the requirements concern enjoyment and appearance, which static review/headless assertions cannot answer by definition.

## The one hard measurement: the image is genuinely too dark

The user reports excessive darkness for the third time. Earlier ART-03/ART-04 advice was qualitative, first undercorrecting and then overcorrecting. **I never supplied a measurable acceptance floor.** This round measures before specifying.

Probe: fixed seed 20260212, player at `(0, 20)` facing the central platform, frame 8, 320×180 sample, `L = 0.2126R + 0.7152G + 0.0722B`.

```
meanLuma  21.4 / 255
darkFrac  0.748          (L < 32 的像素占比)
直方图    [0.748, 0.249, 0.002, 0, 0, 0, 0, 0]     每桶宽 32
```

**No pixel in the entire image exceeds L=96.** This is more than a dark style: the whole image sits in the lowest two bins. Repeated exposure/material changes in ART-03/ART-04 never leave that range, pointing beyond fine parameter tuning to the scene's lack of a main light and bright background: night, near-black flat sky and near-black ground keep everything at the bottom.

The user's blue-sky/white-cloud/yellow-sand direction replaces the two largest dark areas and directly addresses this. Brightness is therefore specified through measurable acceptance conditions rather than adjectives.

## Requirement translation and design judgments

Six user requests become ten tasks. Three engineering judgments are recorded below.

### 1. Glass means visible through, but not shootable through — affecting AI

Original request: glass walls should let the player see the other side while blocking bullets.

Current `losClear()` (`src/game/map/geometry.ts`) and `raycastMap()` share the same solids and test. Glass requires **separating sight from ballistics**: sight ignores glass, projectiles do not.

This immediately has a second-order consequence: `aiPerception.canSee()` returns true, AI engages and fires, but glass blocks the shots. **AI can shoot endlessly at a visible enemy through glass.** At 1 shot/second this can prevent a match from ending, failing the 3-seed termination regression.

MAP-02 must therefore both separate sight/ballistics **and** check ballistic clearance before `doShoot`. Both are mandatory and must be stated in the task rather than left for the model to infer.

### 2. Random maps must be deterministic randomness controlled by seed

Original request: randomized map structure, possibly from a finite set, with fully randomized wall structure.

Existing verification relies on determinism: 3-seed match termination, fixed-seed 1v1 head/body kills in `ai_fire_events`, and E2E hardcoded coordinates such as `t.teleport(4, -3, 21)` and central pillar `(0,0)`. **Refreshing maps with `Math.random()` invalidates or destabilizes these checks.**

Layout and every wall's material must be pure functions of `match seed`; the same seed must produce the same map. E2E/unit tests pin their own seeds. Maps vary across player matches while remaining reproducible for tests.

### 3. Minimap vision needs a new function instead of reusing `canSee`

Original request: a 45° arc to each side, shared teammate vision, and enemy minimap visibility only inside any friendly unit's sight.

`aiPerception.canSee()` begins with `if (target.team === observer.team) return false;`: it tests enemies rather than visibility alone. Shared vision needs a geometric visibility function without a team precondition; `canSee` should delegate to it.

Angle definitions also differ: `CONFIG.ai.fovHalfDeg` is the **AI-perception** half-angle (100° full cone), while the requested **minimap display** is ±45° (90° full cone). Keep these controls separate: AI perception is a balance parameter, whereas the minimap arc is presentation.

## Task decomposition

Ten tasks in `~/Code/qwen3.8-tests/neon-bastion-tasks-r4/task-{1..10}.md`, delivered and committed independently in dependency order.

| # | ID | Task | Dependencies |
|---|---|---|---|
| 1 | MAP-01 | `Solid.material` (`solid`/`hedge`/`glass`) data model + hedge/glass rendering | — |
| 2 | MAP-02 | Sight through glass / projectiles blocked + AI pre-fire ballistic check | 1 |
| 3 | MAP-03 | Remove half-height obstacles; make all full-height walls | 1 |
| 4 | MAP-04 | Finite random layouts (4 sets) + fully random wall materials, all seeded | 1,2,3 |
| 5 | AI-01 | Strategic personalities: flanking ambush / direct assault, randomly assigned to all NPCs | 4 |
| 6 | UX-12 | Minimap vision cone (±45°) + shared teammate sight | — |
| 7 | ART-05 | Blue sky + moving white clouds | — |
| 8 | ART-06 | Yellow sand + brighter overall scene, with measurable floor | 7 |
| 9 | AUD-01 | Sand footsteps | — |
| 10 | AUD-02 | Synthesized BGM, without external assets | — |

**Why separate ART-05 and ART-06:** ART-04 gave four brightness changes at once without requiring individual verification and produced an overly warm scene. Sky and ground dominate the image; independent delivery/measurement can temporarily look inconsistent, such as blue sky over black ground, but localizes failures immediately.

**Why AI-01 follows MAP-04:** flanking only has value when routes permit it. Implementing it after random layouts tests path choices across all four layouts rather than tuning one fixed map.

**AI-01 balance risk:** an unconstrained hit-and-run personality may never engage long enough to decide the match, failing the 3-seed termination regression. The task prioritizes personality parameters, including flankers' willingness to fight and disengagement cooldown, rather than removing the mechanism. If any of the four layouts fails termination, treat it as layout connectivity and fix the layout rather than AI.

## Acceptance baseline

Accept each task independently and commit only after `npx tsc --noEmit`, `npx vitest run` and `npx playwright test` all pass. Cross-task invariants:

- Four hit rules: wall priority, head/body hitboxes, no friendly damage, one score per shot.
- 3-seed full-match termination regression.
- Same seed → same map → same match result.
- `totalScore === hitScore + 3 × kills`.

## Methodology continuation

R1: agents verify only what they can express as assertions. R2: static review + headless tests + screenshots still do not establish playability. R3: tests cover causality, not presentation.

R4 adds: **when humans report the same issue for the third time, the gap is in acceptance conditions, not implementation.** The previous adjectives, brighten and reduce warmth, were followed but did not resolve the issue because neither side knew what sufficiently bright meant. This round establishes measurement before requirements. The lesson applies to subjective requirements delegated to agents.
