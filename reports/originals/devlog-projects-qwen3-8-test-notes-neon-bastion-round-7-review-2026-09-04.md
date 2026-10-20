---
title: "Neon Bastion Round 7 Review — R6 Delivery Retrospective and the \"Probe Window\" Failure Class"
date: 2026-09-04
project: qwen3.8-test
tags: [neon-bastion, review, qwen3.8-27b, pi, verification]
---

# Round 7 Review

[English](devlog-projects-qwen3-8-test-notes-neon-bastion-round-7-review-2026-09-04.md) | [简体中文](devlog-projects-qwen3-8-test-notes-neon-bastion-round-7-review-2026-09-04_CN.md)

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

Subject: 11 tasks from Round 6 (R6), all implemented by pi + Qwen3.8-27B-8bit (mlx-dspark local deployment).
Reviewer: Claude (this session). Independent verification: Another Claude session (worktree @ port 4273).

## 1. Delivery Results

| # | ID | commit | unit | e2e | pi duration | Intervention |
|---|---|---|---|---|---|---|
| 1 | FX-04 | `f00480d` | 106 | 16 | 57m | None |
| 2 | FX-05 | `e9ae7be`+`b27db27` | 113 | 17 | 52m | None |
| 3 | ART-08 | `d19665e` | 113 | 18 | 30m | None |
| 4 | ART-09 | `9af3569` | 121 | 18 | 22m | None |
| 5 | ART-10 | `c2aa1ef` | 125 | 19 | 50m | None |
| 6 | ART-11 | `1b48440` | 125 | 20 | 42m | None |
| 7 | ART-12 | `b851b93` | 125 | 24 | 92m | None (Reviewer discovered ART-16 regression) |
| 8 | ART-13 | `163a788` | 125 | 25 | 110m | None (Reviewer discovered ART-17) |
| 9 | AUD-03 | `6472431` | 136 | 25 | 19m | None |
| 10 | UI-03 | `d660b4d` | 136 | 26 | 6m | None |
| 11 | ART-15+16 | `31bb8d3` | 149 | 26 | 3h26m | **Yes, see §4** |

11/11 delivered, 10 with zero intervention. Final state: `tsc` 0 errors · 149 unit tests · 26 e2e · build passed · workspace clean.

## 2. Most Important Finding This Round: The "Probe Window" Failure Class

Before R6, a class of problems was known: **Regional statistics can catch "presence/absence" but not "resemblance"** (ART-07 / ART-14 / ART-15 / ART-17).
R6 exposed a **second form** of this class, much more subtle than the first—the probe window itself fails.

### 2.1 Threshold Margin Swallows 12x Degradation (ART-16)

ART-12's glass texture packed all appearance into texture RGBA; narrow side samples were almost entirely dark borders, rendering as a pure blackboard.
Original canvas `darkFrac`: **0.008 → 0.096 (12x)**.
All five assertions in ART-06 **passed as usual**, because the margin of `darkFrac ≤ 0.15` just barely accommodated 0.096.

### 2.2 Moving Object Drifts into Fixed Sampling Window (ART-13, New Finding This Round)

Discovered by the independent verifier, confirmed by the reviewer's recalculation.

ART-13's ground detail assertion samples `getImageData(100, 100, 120, 30)`, applied to a 320×180 thumbnail,
corresponding to full resolution **x 400–880, y 400–520**. After Task 11 enlarged the first-person weapon, its bounding box is
**x 660–1169, y 288–719**—**covering approximately 46% of the sampling window in the x-direction**.

Result:

```
ART-13 GROUND PATCH STD   5.72  →  62.26     （断言要求 >= 5.5）
采样窗内暗像素占比(L<60)   0.000 →  0.220
```

**An 11x "significant improvement in ground detail" was actually a near-black gun barrel outline cutting across the sampling frame.**
This assertion now passes even if the ground texture is deleted entirely.

### 2.3 Induction

> **A screen-space rectangle is only a valid probe under the premise that "nothing else can enter," and nothing in the test suite guarantees this premise.**

Commonality of these two forms: The assertion remains green, the numbers still move, but the numbers have decoupled from what they claim to measure.
More dangerous than "assertions too loose," because it disguises itself as improvement.

## 3. Build Integrity Failure Class — One Pattern, Three Instances

The induction framework was proposed by the independent verifier; the reviewer supplemented the mechanism explanation. The three instances are listed in increasing order of subtlety:

| | Manifestation | What was actually tested |
|---|---|---|
| R5 | Forgot `npm run build` before running E2E | The previous build |
| R6 (Today) | Two agents shared `dist/` and port 4173 | The other's build |
| R6 Task 11 | `npm run build` failed but no one checked the exit code | A build that no longer exists |

**Mechanism**: A stale but valid `dist/` is indistinguishable from a fresh build at the HTTP level,
so **no matter how many assertions are added within the suite, this class cannot be caught**.

**Common Enabling Condition**: `reuseExistingServer: true` in `playwright.config.ts:40` is set on fixed port 4173.
The common practice `reuseExistingServer: !process.env.CI` is exactly the opposite here—it chooses to reuse precisely in the "local, multi-runner" scenario where reuse is dangerous.

**Fix**: Make the build exit code a hard gate; independent port for each runner (or `reuseExistingServer: false`).

Two specific consequences of Instance 2, both verified:
- Verifier's test 10 (ART-05) failed deterministically 4 times in a row (frozen=38155, numerically identical),
  all falling within pi's task-10 build window (19:04:59–19:10:39); 7 consecutive passes after pi was idle.
  Deterministic rather than random is the characteristic of "a specific erroneous build being served stably for a period."
- Reviewer had one instance of 18/26 failures, initially attributed to "own port not released," actually caused by the verifier running the suite on the same port during the same time period.

## 4. Task 11: The Only Intervention This Round

**pi's mistake was operational, not judgmental.**

It needed "temporarily revert to old code → run → revert back" for negative control. The target directory for the restoration step `cp` was written incorrectly,
placing the fixed `testHooks.ts` in `src/render/` instead of `src/`. The consequences chained:

1. `./app`, `./game/types` in `src/render/testHooks.ts` could not be resolved → `tsc` and `npm run build` **continuously failed**
2. The real `src/testHooks.ts` remained at the HEAD version restored by `git checkout`
3. Every subsequent `npx playwright test` served the **unupdated dist**
4. Both sides of the A/B test were the same binary; the "floor dark area" it observed was a pure phantom

It spent about 1 hour continuously troubleshooting, with the direction becoming increasingly granular (moving teammates away to compare brightness grids),
but **the direction was wrong from the first step**. It only converged after the reviewer provided a precise hint at 3h26m.

**The root cause is not that the model is not smart enough, but that the process lacks an assertion**:
For operations like "temporarily break then fix," one must first `tsc` to confirm the working tree is clean after each step before proceeding.
This round's task specification required negative control, but did not require verifying tree integrity at each switching point of the negative control.

It is worth noting that **the same root cause occurred twice on the reviewer's side** (Ctrl-C server restart didn't take effect, prompt sent to wrong panel):
**Assuming terminal operations took effect without verifying**. The only difference is that the reviewer was pointed out on the spot, while pi had to hit the wall for three hours on its own.

## 5. Delivery Quality of Task 11

pi's commit message **proactively and accurately listed three items it failed to achieve**, which is of high quality:

> - Pixel-level negative control not run
> - Mid-task A/B `darkFrac`/bbox numbers **invalid** (due to silent build failure)
> - Tightened `darkFrac` threshold, narrow side assertion, view model bounding box assertion **none implemented**

All three are true. In knowing it could not obtain valid data, it chose "implement code + unit tests, honestly mark gaps,"
rather than patching a threshold based on invalid data—this is the correct judgment.

### Item-by-item Acceptance

| Item | Conclusion | Evidence |
|---|---|---|
| **ART-16** Glass Blackboard | **Fixed, and thoroughly** | After removing weapon in level view, `darkFrac` = **0.0036**, better than pre-regression baseline 0.008; glass is now a transparent vertical frame grid |
| **ART-15(1)** Third-person Gun Holding | **Fixed** | `weapon_hand.test.ts` 12 items including negative control (old chest anchor failed); side view screenshot confirms gun is at hand height, not in front of neck |
| **ART-15(2)** View Model Too Large | **Not met, and regressed** | See below |

### ART-15(2) Measured

Using `viewModelVisible(true/false)` differential to find bounding box (1280×720):

```
bbox            x 660–1169, y 288–719
面积占比        23.9%      要求 6–18%      ✗
顶边位置        40.0% H    要求 < 40% H    ✗（恰好压线）
左边界          51.6% W    要求 > 45% W    ✓
准星区块 diff   0                          ✓
```

Visually, it indeed changed from "gray stone pillar" to a **recognizable gun** (barrel, receiver, grip), which is progress.
But it is larger, and rotated to an angle crossing the middle of the screen, with the muzzle crossing the screen center.
The side effect is that it is now near-black and appears in all views:

```
raw canvas darkFrac      任务11前 → 任务11后
  ground                  0.032  →  0.085
  up                      0.049  →  0.092
  level                   0.096  →  0.088   （仅因 ART-16 拿掉了其中约 73%，枪又加了回来）
```

**This directly confirms an error in the task specification** (see §6): Tightening the `darkFrac` threshold before shrinking the weapon
is setting a threshold on a moving target. Now, about **96%** of the dark pixels in the level view come from the view model.

## 6. Errors in the Task Specification Itself (Reviewer's)

`task-11.md` attributed **all** of ART-16's `darkFrac` to glass, and wrote "no need to re-investigate, fix directly."
After binning dark pixels by screen column, the actual composition is:

```
x    0– 160   34.1%   左侧黑板（玻璃）
x  160– 880    4.0%   场景本身
x  880–1120   21.9%   第一人称武器
x 1120–1280   39.3%   右侧黑板（玻璃）
```

Glass about 73%, **weapon about 22%**. The **target** of the attribution was correct, the **exclusivity** was wrong.
The phrase "no need to re-investigate" should not be written when evidence is incomplete—it deprived the implementer of the opportunity to discover the second source.

Also: pi's runtime probe reported "player facing +Z" with reversed sign. `match.ts:164` is `forward = (sinθ, cosθ)`,
Blue team spawn `yaw = π` → `(0, −1)`, player facing **−Z**. This correction **supports** the wall attribution
(z=17, z=14 are indeed in front of z=20), rather than overturning it.

## 7. Answer to the Research Question

> Can Qwen3.8-27B-8bit autonomously make a slightly complex game under this local deployment?

**Yes, but there is a clear capability boundary, and the position of the boundary is determined by the deployment, not the model.**

- **When the verification loop is text-based (logic, tests, refactoring, root cause identification, honest reporting of gaps): Performance is excellent.**
  First 10 tasks of R6 had zero intervention, unit tests grew from 106 to 149, commit messages proactively marked incomplete items.
- **When the verification loop requires eyes: Completely unable to close.**
  All visual defects this round (ART-07 / ART-14 / ART-15 / ART-16 / ART-17) **were not discovered by pi**,
  all were discovered by the reviewer looking at screenshots.

The reason is not capability, but **sensory deprivation**: see `notes/mlx-dspark-vision-unavailable-2026-09-03.md` (OPS-11).
Weights include a vision tower, but mlx-dspark silently discards image input in three places, measured `prompt_tokens: 17`.

**This boundary is a transferable conclusion**: Assigning art tasks to a blind agent,
it will faithfully make the measurable assertions you write green, while the gap between assertions and visual perception will all settle into technical debt.
R6's ART-13 assertion is an extreme sample of this process—**it now measures the gun, and it is green**.

## 8. Recommended Order for Round 8 (R7)

1. **ART-15(2)** Shrink view model to 6–18% bounding box (do first, the next two depend on its final size)
2. **ART-13 Assertion Fix** Sampling window must exclude view model area, or sample on frames with view model disabled;
   Include negative control: delete ground texture, assertion must fail
3. **ART-06 Threshold Tightening** + Narrow side specific assertion (re-measure baseline after 1 is completed)
4. **AI-02** 30 seconds no contact per unit → active exploration (User explicitly requested, detour vs detour deadlock)
5. **BUG-03** AI stuck in wall corner
6. **ART-17** Hedge texture (multi-scale noise + leaf light/dark sides; acceptance metrics must distinguish "structured texture" from "random scattering")
7. **BUG-02** seed 74 stagnation
8. **OPS-12 (New)** `reuseExistingServer` + build exit code hard gate

## 9. Remaining Unverified

- ART-15(1) holding fidelity only achieved "gun at hand height," no fine IK, no pixel-level acceptance
- BGM (AUD-03) **Neither reviewer nor pi can hear it**. Measurable constraints (BPM, loop length,
  `BGM_LEVEL` relative to SFX ratio) have all been checked and passed, musicality itself unverified
- Task 11's three sets of pixel-level negative controls are still outstanding
