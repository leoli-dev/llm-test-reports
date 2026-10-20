---
type: Note
title: "Neon Bastion — Round 5 review: can Qwen3.8-27B-8bit independently complete a moderately complex game"
status: current
description: "Verification after all ten Round 4 tasks were delivered, with complete task-duration/thinking/intervention statistics and evidence for one self-contained task at a time with measurable acceptance."
tags: [neon-bastion, qwen3.8-27b, mlx-dspark, pi, code-review, agent-evaluation]
timestamp: 2026-09-03T07:00:00Z
---

# Neon Bastion — Round 5 review

[English](devlog-projects-qwen3-8-test-notes-neon-bastion-round-5-review-2026-09-03.md) | [简体中文](devlog-projects-qwen3-8-test-notes-neon-bastion-round-5-review-2026-09-03_CN.md)

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

## The question this round answers

The user explicitly wants to test **whether qwen3.8-27B-8bit can actually build a slightly complex game**. Review therefore covers code and **behavior across long engineering chains**: how far the model proceeds alone, where it stalls, how often people intervene, and whether intervention addresses reasoning limits or mechanical mistakes.

All ten Round 4 tasks are delivered. The reviewer independently verifies each commit, always running `npm run build` before E2E; see the verification-chain gap below.

## Delivery results

| # | ID | Commit | Unit tests | E2E | pi duration | Reviewer intervention |
|---|---|---|---:|---:|---:|---|
| 1 | MAP-01 | `66847e5` | 53/53 | 8/8 | 12m | None |
| 2 | MAP-02 | `3ea1946` | 56/56 | 8/8 | 11m | None |
| 3 | MAP-03 | `33efc5d` | 58/58 | 8/8 | 10m | None |
| 4 | MAP-04 | `a98eac9` | 68/68 | 8/8 | 40m | None |
| 5 | AI-01 | `fa4f479` | 73/73 | 8/8 | **2h56m** | **Root cause supplied** |
| 6 | UX-12 | `9cd9a65` | 86/86 | 9/9 | 22m | None |
| 7 | ART-05 | `9eebf65` | 86/86 | 10/10 | 22m | None |
| 8 | ART-06 | `29f1ca8` | 86/86 | 11/11 | 27m | None |
| 9 | AUD-01 | `bdf0d68` | 94/94 | 12/12 | 13m | None |
| 10 | AUD-02 | `c501abf` | 106/106 | 13/13 | 17m | None |
| 11 | ART-07 | `97d8264` | 106/106 | 15/15 | 30m | None; extra close-out task issued after reviewer image inspection |

**Totals:** 36 files, **+3164 / −218**; unit tests 53 → **106**, E2E 8 → **13**; pi net work **5h50m**, approximately **379K output tokens** and **789K thinking characters**.

**Ten of eleven tasks need no intervention.** Task 5 is the only intervention and takes nearly half the total time, 2h56m.

## Conclusion: capable, with clear boundaries

### What it handles well independently

**Local engineering tasks with explicit acceptance criteria are completed quickly and correctly**, often beyond the requirement:

- Task 1 asks for wall materials; it additionally uses solid ID and golden-ratio hash hue perturbation to give hedge walls different greens.
- Task 2 only asks it not to fire when a shot cannot land; it additionally builds `clearShotMove()` to seek a firing position when the target is visible but blocked.
- Task 3 removes `'cover'` from `kind` but **keeps `'platform'|'ramp'` mechanics and explains why**: random layouts may need them. Compared with deleting `hitKick`/`shotKick` as dead constants in Round 3, it now distinguishes absent instances from dispensable mechanics.
- Task 9 separates triggers into WebAudio-independent `footstep.ts`, handling spawn frames being mistaken for landings.

**Review feedback becomes regression tests**, consistently since Round 2. Task 6 E2E checks both directions: an enemy behind yields 0 red pixels, while turning toward it yields 32 with exact color `255,61,99`, stronger than task 1's one-way check. Task 7 adds `fastForwardSky()` to avoid headless rAF throttling, **making uncertainty deterministic rather than weakening assertions**.

### Where it cannot escape independently

Task 5, strategic AI personalities, is the only runaway task: **2 hours 56 minutes, half the total duration and 369K thinking characters**, versus 420K across the other nine tasks.

The failure is not inability to code. It is **circling through attribution hypotheses in a coupled dynamic system**: why did the unit fire only 2 shots? FOV, reactUntil, target switching, HP thresholds—all plausible, without efficiently narrowing a 300-second simulation.

The reviewer runs the same scene in an **independent copy**, prints per-tick state and supplies root causes for three failures:

- Two pinned failures are **test-setup problems**: tests assume continuous firing, while flankers disengage after one shot. Pin doctrine to rusher in tests, **without weakening flankers**.
- Seed 99 is a **real deadlock**, with evidence: red unit 6 never moves from t=130 to t=299, fires 0 shots, and `path` changes from `1/1` to `0/0`, an empty-path livelock.

**With the root cause, it converges within 30 minutes**, then independently finds three deeper defects: the stagnation handler retriggers every tick and permanently drags engaged units into patrol (**the actual reason pinned tests fire only 2 shots; the reviewer's attribution was only half right**); target jitter resets reaction delay; and silent projectile expiration violates every-bullet-settles, present since `328dae6` but previously untested through impact counts.

**Capability boundary:** explicit local goals and decidable acceptance support independent completion. Multi-factor **root-cause localization** can consume resources without convergence. Supplying the cause restores strong execution and can lead to deeper discoveries.

## Methodology: three conclusions tested this round

### 1. Subjective requirements need measurement definitions first

At the third darkness complaint, the reviewer measures first: `meanLuma 21.4/255`, `darkFrac 0.748`, **no pixel above L=96**.

ART-03/ART-04 used adjectives—brighten and reduce warmth. The model followed both but failed, once too dark and once too warm. **Neither side knew what sufficiently bright meant.**

This round defines five numerical criteria and requires tests; the first implementation meets them:

| Metric | Bound | Measured |
|---|---|---|
| meanLuma | ≥ 90 | 159.0 |
| darkFrac | ≤ 0.15 | 0.008 |
| Nonempty histogram bins | ≥ 4/8 | 7/8 |
| mean(R) − mean(B) | ≤ 40 | −7.0 |
| Distinguishable team color: red-team pixels | > 40 | 2259 |

`mean(R) − mean(B) ≤ 40` is a **reverse constraint** against repeating ART-04. A lower bound alone encourages whitening every material; forbidden directions must also be specified.

**Global metrics have blind spots:** original canvas inspection finds two **local** defects, a near-black `0x0e1013` night-style boundary wall making a dark horizon band and rectangular sand-texture seams. All five metrics still pass because they aggregate the whole image. Logged as ART-07: **global metrics prevent systemic problems, not local inconsistency**.

Extra task 11 (`97d8264`) repairs both. **pi independently adds negative controls**: boundary-wall meanLuma is 78.7, reverting near-black gives 2.0 with 3 consecutive stable failures; seam discontinuity is 0.91 after repair and correctly fails at 2.42 without wrapping redraw. **This is what MAP-01's glass test lacked, and pi now does it unprompted.**

### 2. Randomization silently thins previously sufficient deterministic regressions

MAP-04 adds 4 layouts with independently randomized wall materials, sharply reducing coverage of the existing 3-seed termination regression. pi's 3 seeds pass; the reviewer scans 40 and finds **seed 27 permanent livelock**.

The cause is a second-order consequence left by the reviewer in MAP-02. `retreat` exits through `!seen && lostTime>searchTime → patrol` or `seen && !lowHp → engage`; `seen && lowHp` has no exit. Glass keeps `seen` true, no healing keeps `lowHp` true, and MAP-02 ballistic checks **correctly** prevent shooting, producing stable deadlock. Before glass, visibility implied mutual fire and eventual death.

**The reviewer predicted wasted shots through glass but missed the unreachable state-machine exit.** Splitting a predicate requires checking state machines that assume two conditions are equivalent, beyond direct call sites.

After repair, seeds 41..160 yield 119/120 passes; **seed 74 still stalls**, BUG-02, outside the agreed seed 1..40 range. Personality also lengthens games: median **20.2 s → 37.4 s**, p90 134 s.

### 3. Green tests do not establish that the right property was tested

Three examples:

- **Verification-chain gap:** `playwright.config.ts` uses `webServer.command` = `npm run preview` = `vite preview`, **serving `dist/` without building**. Standalone `npx playwright test` checks old output. The reviewer thereafter runs `npm run build` first; pi independently encounters the same issue in task 8, identifying initial darkFrac 0.175 as a false alarm.
- **Missing negative control:** task 1 only checks more than 40 red pixels behind glass, potentially fooled by a red point light (`0xff3d63`). Symmetry-based A/B gives 149 red pixels through glass versus **0 through hedge**, confirming transparency. This control is still absent from the repository.
- **Unchecked invariant:** silent projectile expiration, with no event beyond range, violates every-bullet-settles from `328dae6` until task 5 counts impact events.

## Unanswered questions

**Scoring remains deferred, PLAY-01.** Round 4 asks about enjoyment/appearance, but evidence remains static review, headless assertions and pixel statistics. The following three original items lack real-play confirmation, with a fourth added:

1. Whether AI tracers, muzzle flashes and gunshots actually appear, FX-02.
2. Whether hit-red-flash and incoming-direction arcs are readable, FX-03.
3. Whether projectiles are visible and dodgeable, GAME-04; the reviewer's Playwright attempt to capture a flying tracer **fails**.
4. New: whether flank/rush personalities are **perceptible** and doubled match duration feels more interesting or merely slower.

Item 4 is particularly important. AI-01 has the most time/complexity (`aiController.ts` +360 lines), but its value depends on perceiving flanking. Tests show flanker nodes farther from teammate centroid, not that this is evident on screen.

## Appendix: environment and speed

Server: mlx-dspark 0.18.0 + Qwen3.8-27B-8bit, M5 Max, 40 GPU cores, measured bandwidth 461.9 GB/s, 137 GB unified memory, DFlash2 speculative decoding.

A slowdown, 21 → 11 tok/s, is **initially misattributed to longer context**. Retesting finds nearly unchanged round speed, 5.59 → 5.55 rounds/second; acceptance length, 1.96 → 3.79 tokens/round, explains the difference. `auto_cap`'s `p` recovers from 0.601 to 0.865 and draft depth expands from 2 to 4. **Acceptance is content-dependent, not context-dependent: monitor `accept_len` and `auto_cap.p`, not context percentage.** `predicted_rates` assumes constant time per round and is systematically optimistic, predicting 40.9 tok/s versus measured 21; it is not a benchmark.
