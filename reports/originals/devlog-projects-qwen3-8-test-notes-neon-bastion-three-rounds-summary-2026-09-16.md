---
type: Note
title: "Neon Bastion Three-Round Test Cross-Sectional Summary — 8bit Seven Rounds / ds-v4-flash-vision / MTPLX 4bit"
status: current
description: "A cross-sectional comparison of three complete test rounds of the same 3D FPS under three different models/deployments: scale and mechanical metrics, human playtest results, an explanation of the inverse relationship between user subjective ranking and mechanical metrics, and the biggest finding that \"human involvement is more effective at completing tasks than detailed prompts\" and its mechanism that \"the upper limit of automated acceptance equals task specification coverage.\""
tags: [neon-bastion, qwen3.8-27b, mlx-dspark, mtplx, ds-v4, cross-round-comparison, benchmark, human-evaluation, methodology]
timestamp: 2026-09-16T03:30:00Z
---

# Neon Bastion Three-Round Test Cross-Sectional Summary

[English](devlog-projects-qwen3-8-test-notes-neon-bastion-three-rounds-summary-2026-09-16.md) | [简体中文](devlog-projects-qwen3-8-test-notes-neon-bastion-three-rounds-summary-2026-09-16_CN.md)

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

> This page is a cross-round synthesis. For details on individual rounds, see:
> [Seven-Round Summary (8bit)](devlog-projects-qwen3-8-test-notes-neon-bastion-final-summary-2026-09-04.md) ·
> [55-task rerun (MTPLX 4bit)](devlog-projects-qwen3-8-test-notes-neon-bastion-55task-rerun-2026-09-07.md) ·
> [ds-v4-flash-vision run](devlog-projects-qwen3-8-test-notes-neon-bastion-ds-v4-flash-vision-run-2026-09-08.md) ·
> backlog (historical local files, not published with this report) (BENCH-01 / QA-15 / AI-04 / OPS-* / PLAY-* entries).

## One-Sentence Conclusion

**The biggest finding from this test: human involvement is more effective at completing tasks than detailed prompts.**
The 8bit round (89-line coarse task specification + deep user participation, where the user themselves was the human playtest loop) had the best subjective experience across the three rounds; the ds-v4 / mtplx rounds (3,289 lines × 56 fine-grained cards + automated acceptance, with humans concentrated in the final playtest) had the highest mechanical metrics and the lowest subjective experience, with all decisive defects uncovered by that final human playtest.

Mechanism (QA-15): Fine-grained cards + automated acceptance optimize for "tests turning green," not for "playing correctly"; the upper limit of automated acceptance equals task specification coverage, and the gap does not converge as test density increases.

## Three-Round Setup

| | Round 1 | Round 2 | Round 3 |
|---|---|---|---|
| Codename | **8bit Seven Rounds** | **ds-v4** | **mtplx 4bit** |
| Model / Deployment | Qwen3.8-27B-8bit + mlx-dspark (DFlash2) | `ds-v4-flash-vision` (cloud low-spec, reference baseline) | Qwen3.8-27B 4bit (MTPLX optimized-speed) |
| Executor | pi + reviewer per-round human audit | Cloud agent (dsh) | pi + zellij automated orchestration |
| Task Specification | `test-prompts/3d-team-arena.md`, **89 lines single document** | `test-prompts/neon-bastion/`, **56 cards / 3,289 lines** | Same as Round 2 (same set of 55 task specifications) |
| Repo | `~/Code/qwen3.8-tests/mlx-dspark-27B-8bit-with-pi-3d-team-arena` | `~/Code/qwen3.8-tests/ds-v4-flash-vision-with-dsh-neon-bastion` | `~/Code/qwen3.8-tests/mtplx-27B-optimized-speed-with-pi-neon-bastion` |
| Time | 2026-09-01 → 09-04 | Starting 2026-09-08 (55/55 completed) | 2026-09-07 → 09-15 |
| User Participation | **Deep participation, playing and debugging simultaneously (user themselves was the human playtest loop)** | Normal | Normal (M02 mandatory human playtest executed by user) |
| Visual Capability | **None** (mlx-dspark deployment silently dropped images, OPS-11, deployment-side limitation) | Yes | **Yes** (VIS-03 measured prompt_tokens 141 vs OPS-11's 17) |

## Round 1 · 8bit Seven Rounds (2026-09-01 → 09-04)

Coarse-grained task specification, seven rounds of human audit iteration by the reviewer (R1–R7), with independent re-verification + human playtest for each round.

**Deliverables**: 34 commits, 67 files, +10,056/−886 (final repo state; at the time of the Seven-Round Summary cutoff it was 31 commits/+9,766), src 8,157 lines, unit tests 31→149, E2E 5→26.
pi net work **30.0 hours**, 1,688 requests, 1.81 million output tokens (181 × 10,000), 1,836 tool calls (failure rate 3.4%).
Server-side: decode ~19 tok/s, accept_len 3.17, draft acceptance rate 55.9%, prefix cache reuse 94.6%, MLX peak 72.1 GB.

**Process Highlights**:
- Scoring trajectory **77 (R1 blind review) → 87 (R2 blind review) → 74 (human playtest correction)**, R3–R7 scoring deferred (PLAY-01).
- Missed by R1 blind review: A/D translation reversed, tracers invisible, README fabricated 6 non-existent operations—all discovered by human playtest/detailed inspection.
- Of twenty-two tasks, only two stalled (AI-01 176m, R7 wrap-up 206m); the commonality was not difficulty but **requiring the model to find the root cause itself**; after handing over the root cause, it converged in 30 minutes and also dug up deeper defects (silent projectile expiration breaking invariants).
- R6 was all art tasks: 5 visual defects **all discovered by humans looking at screenshots, pi found none**—mlx-dspark silently dropped images (OPS-11).
- Median time for logic tasks 22m vs art tasks 52m, a 2.4x difference.
- Cost conversion ~¥226 (Qwen Max pricing); "¥226 for 30 hours"—saving money is real, saving time is the opposite.

**Two capability boundaries** (initially thought to be specific to this round, later verified in the next two rounds to be universal):
1. **Root cause localization does not converge**—in multi-factor coupled systems, it continues to consume resources without converging.
2. **It cannot see images**—initially attributed to deployment, the MTPLX round confirmed it was indeed deployment-side, not the model.

## Round 2 · ds-v4-flash-vision (Starting 2026-09-08)

Re-ran the same set of 55-card task specifications from scratch to verify whether the task specifications and methodology hold for another model; cloud low-spec model used as reference baseline.

**Deliverables (55/55 all completed)**: 55 commits, 147 files, +33,809/−5, src 13,401 lines, **unit tests 550 (43 files), E2E 122 (30 specs), `test:suite` 5 rounds × 108 all green**, 8 screenshots.

**Process Highlights**:
- Each task consciously performed negative controls and left traces in the repo; E segment 40-seed termination scan all passed.
- L03 delivered negative control general inspection + probe exclusivity and threshold margin audit (`docs/NEGATIVE-CONTROLS.md` / `PROBE-AUDIT.md` + re-runnable scripts).
- **M02 human playtest uncovered 2 defects that were all green in automation, fixed on the spot**:
  - Settlement page Play Again unclickable—Pointer Lock never released (OPS-37);
  - First-person weapon still hanging after camera leaves player—render loop only updates in that state (OPS-38).
- Also stepped into the task specification's own pitfall: I04 calibrated at 6.17% near the lower bound of the interval, ×1.5 amplification resulted in 13.9% still within the interval—the **negative control required by the task specification would never turn red** (OPS-24, task specification writing defect, not model error).

## Round 3 · MTPLX 4bit (2026-09-07 → 09-15)

Same set of 55-card task specifications, zellij automated orchestration (each task `/new` + feeding + independent acceptance), the round with the longest machine time and densest observation.

**Deliverables (55/55 all completed)**: 55 commits, 191 files, +47,803/−8, src 16,224 lines, **793 unit tests + 202 E2E + 9 negative controls** (total test lines 29,185 / 120 files, final repo state; BENCH-01 recorded 26,721/108 as the wrap-up segment cutoff value). Independent re-verification: full E2E × 3 rounds, each 202/202. Cumulative approx. **70 hours**, average 76 min/task (fastest K03 20 min, slowest E06 278 min).

**Quantitative Outputs**:
- Wall clock ≈ output tokens ÷ decode rate, coefficient varies with task nature: A–D (pure logic) 26 / E (AI) 20.5 / F–G (shell+UI) 22.8, empirical range **22–26 tok/s, AI category takes the lower limit** (PERF-01).
- Decode decay curve with context 55 → 26 tok/s, unchanged after **three re-verifications of 1,333 per-request samples**.
- Dashboard main dial labeled "tps decode" is actually end-to-end `request_tok_s` (OPS-20)—citing speed must specify the metric.

**Model-Side Conclusions**:
- **AI-04 lacks cost awareness** (conclusion about the model itself, not a deployment issue): three instances of the same form—H03 manually calculated ACES/sRGB transcendental functions, I04 used 12,150 combinations to brute-force enumerate an analytically solvable quantity (round-trip overhead underestimated by 25x), I04 again manually derived projection geometry to verify empirical fitting. **Engineering judgment was correct every time, only the estimation of "how long this path will take and whether it is worth it" was bad.** Intervention cost one sentence, benefit two to three hours (AI-05: J03 converged in 1h40m after one hint, compared to I04's 4h19m + two interventions).
- **QA-13 The boundary of self-audit is not in capability, but in whether it questions its own prior decisions**: "Is my assertion true (not tautological)" was done well (L03 mechanized negative controls, tautological assertions can now be automatically captured); "Is my assertion correct (should it be this one)" was not done—already having the numbers 58.9% vs 50%, it only lacked looking back to ask "why was this pole moved down from 75% initially." What was missing was not information, but the motivation to question itself.
- **QA-12 Overtaking Round 2**: I04 autonomously calibrated to ≈9.1%, ×1.5 resulted in 20.5% out of bounds, negative control truly turned red and entered the repo as a permanent test—**orchestration side gave no hints**. Same card, Round 2 fell into the OPS-24 false green trap, Round 3 avoided it.
- OPS-12 "Green tests unrelated to tested code" series was self-checked by the model multiple times in this round (aiFire false green, build failure silently swallowed), historically the first four instances were all discovered by humans.

**Human Playtest (09-15): All four defects discovered by the user, 995 assertions caught none, and none were "model wrote wrong code":**

| # | Defect | Failure Level |
|---|---|---|
| 1 | AI only fires two shots and stops engaging (PLAY-06) | **Criterion chose the wrong quantity**—measured "match will end" instead of "AI will fight"; occasionally firing two shots within 300 logic seconds was enough to eliminate 4 people, so the criterion was green |
| 2 | Hitting teammates has bleeding effects but no health deduction (PLAY-07) | **No cross-check between two path layers**—FX layer accepted via `hit` event, damage settlement rejected via team check |
| 3 | No falling on kill, turns gray in place (PLAY-08) | **Test wrote current state as specification**—i01 pixel probe asserted corpse is "corpse gray," no falling is not a regression, but the current state welded in by the assertion |
| 4 | UI mixes Chinese and English (PLAY-09) | **Task specification never defined**—56 cards had no rule for UI language, no spec → no assertion → won't turn red |

(Also PLAY-05 menu title running state blocks view, captured in that round's screenshots, logged but not fixed, as it was not in any card's acceptance criteria.)

## Cross-Sectional Comparison

### Mechanical Metrics (Repo Measured, 2026-09-16 Re-verified)

| | 8bit Seven Rounds | ds-v4 | mtplx 4bit |
|---|---:|---:|---:|
| Commits | 34 | 55 | 55 |
| Files | 67 | 147 | 191 |
| Net Lines Added | +10,056/−886 | +33,809/−5 | +47,803/−8 |
| src Lines | 8,157 | 13,401 | **16,224** |
| Test Lines | 4,839 | 16,204 | **29,185** |
| Test Files | 20 | 76 | 120 |
| Final Tests (unit/E2E) | 149 / 26 | 550 / 122 | 793 / 202 (+9 negative controls) |
| Task Specification | 89 lines × 1 | 3,289 lines × 56 | 3,289 lines × 56 |

### Human Playtest (Common adjudication method for all three rounds)

| | 8bit Seven Rounds | ds-v4 | mtplx 4bit |
|---|---|---|---|
| Decisive defects found by playtest | A/D translation reversed, tracers invisible, AI firing silent, etc. (multiple rounds from R2) | 2 (Pointer Lock, hanging weapon), **fixed** | 4 (AI not engaging, friendly fire/falling, UI language, title blocking view), logged not fixed |
| Did automation catch them | None found by automation | None found by automation | None found by 995 assertions |

**This is the fourth round of evidence for that sentence in the M02 card: all decisive defects were discovered by human playtest, none were discovered by automated evidence.**

### User Subjective Ranking vs Mechanical Metrics

**User Ranking: 8bit > ds-flash > mtplx 4bit—completely inverse to mechanical metrics.**

Two confounding factors pointed out by the user themselves (later proven to have the strongest explanatory power, BENCH-01):
1. The 8bit round used an **89-line single task specification** (next two rounds 3,289 lines × 56 cards), output scale is not comparable—**spec quantity differs by 37x, test output differs by 5.5x, the three rounds did not do the same job, wall clock time was never measuring the model**.
2. In the 8bit round, the **user deeply participated, playing and debugging simultaneously**—the user themselves was the human playtest loop; the next two rounds removed this human loop.

The contradiction of "faster tok/s yet slower" is thus resolved: the mtplx round had higher output per unit time (decode 22–26 vs 8bit's ~19), but was required to do much more, and lacked the user's real-time correction loop.

**These two "confounding factors" are actually not noise to be excluded, but the independent variables of this comparison themselves—they are precisely the biggest finding of this test: human involvement is more effective at completing tasks than detailed prompts (QA-16).** The budget for the 8bit round was "coarse spec + human in the loop throughout"; the budget for the ds-v4 / mtplx rounds was "fine spec + automation to the end + final human playtest." The result was inverse: the round with coarse spec and fine human loop had the best subjective experience; the round with fine spec and coarse human loop had all decisive defects appearing in that final playtest (and the mtplx round only logged them, didn't fix them).

### Cross-Round Consistent Patterns

1. **Model self-check capability strengthened round by round**: OPS-12 series first four instances discovered by humans → mtplx round multiple model self-checks (aiFire false green, build failure false green, OPS-29 sixth instance self-traced the chain of TS6133 swallowing builds).
2. **The gap in negative control discipline manifests at "implicit constraints"**: ds-v4 round I04 stepped into the implicit lower bound trap of task specification interval + amplified negative control (OPS-24), mtplx round same card autonomously avoided it and left a permanent test (QA-12)—but that was the "is the assertion true" level; the "is the assertion correct" level failed in both rounds (QA-13 / PLAY-08).
3. **"Can see" ≠ "Judges correctly"**: 8bit round had no vision, R6 relied on humans as eyes; mtplx round vision loop closed, four types of visual self-checks fully done, human playtest still caught all four defects in one go—**vision loop reduces missed detections of "screen rendered wrong," but reduces missed detections of "plays wrong" by zero** (PLAY-03, Tide Isle also has isomorphic evidence).
4. **Root cause localization is the only place it cannot get out** (8bit round conclusion) reappeared in transformed form in the mtplx round: not AI root cause, but calibration/solving type judgments of "what method to use, how long to take" (AI-04)—**give the method in one sentence, benefit two to three hours**.

## Methodology Precipitation for This Project

1. **Budget Allocation: Human Involvement > Detailed Prompts (Biggest finding of this test, QA-16).** The same human effort spent on "human in the loop" (per-round review, playtest, giving method hints immediately upon seeing signs—AI-05 one sentence saves two to three hours; OPS-45 user discovered stoppages before orchestration side three times) is more effective than spending it on "writing specs as fine-grained cards." **Caveat**: n=1 per configuration, and the task specification authors, executors, and user participation methods were different across the three rounds, so causality is strong inference not controlled conclusion; the actionable conclusion is **human loop should be moved forward, be high-frequency, and enter the process, fine-grained cards cannot replace human acceptance**.
2. **Upper limit of automated acceptance = task specification coverage.** 56 cards, 3,289 lines of specs, 995 assertions still missed "AI must be able to fight," "people must fall when dead," "UI uses one language"—because they are too obvious, so obvious that no one would write them into the acceptance checklist. When writing cards, specifically ask: **which behaviors are "too obvious to write"?**
3. **Human playtest is a mandatory step after each batch of tasks, cannot be replaced by automation** (PLAY-02/03/15 four rounds isomorphic).
4. **Final verification must include "compare screenshots/real machine, write visible defects into an honest list"**—the mtplx round M01 honest list opening "A–L segments are all completed, so this section is short" is a counter-example (QA-14): the evidence base is task cards and green tests, not the rendered product, and the screenshots are in the directory it generated itself.
5. **Performance metrics must be solidified**: decode vs end-to-end (OPS-20), wall clock ≈ output ÷ rate and coefficient varies with task nature (PERF-01), after changing deployment, run a smoke test on the vision link first (VIS-03, failure is silent).
6. **Lack of cost awareness (AI-04) is a stable conclusion at the model layer**, countermeasures have been solidified into the "Intervene immediately upon seeing these" section of `neon-bastion-55task-run/README.md`: manual calculation of transcendental functions / grid of tens of thousands of points / reverse-engineering empirical constants → immediately give alternative method and require wrap-up.

## Open Items

- The four defects in the mtplx round are **logged but not fixed** (user instruction: log first, do not modify): PLAY-06～09. If fixing, note that PLAY-08 requires changing the assertion itself in i01 (taking the current state out of the spec).
- 8bit and the next two rounds cannot be directly compared horizontally—if doing "same task specification three-model comparison," need to run the same set of 56 cards on three deployments and retain the human playtest loop; currently only the Round 2/Round 3 pair is strictly the same question.
- Related backlog entries: BENCH-01 (historical local file, not published with this report), QA-15 (historical local file, not published with this report), PLAY-06～09 (historical local file, not published with this report), OPS-37/38 (historical local file, not published with this report), AI-04/05 (historical local file, not published with this report).
