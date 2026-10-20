---
type: Note
title: "Neon Bastion — Round 2 review and human-playthrough correction"
status: current
description: "Second independent review of Neon Bastion after the agent applied the full design review (87/100 scored blind), corrected to 74/100 once a human playthrough exposed inverted strafe, invisible tracers and a fabricated controls table that all survived 33 unit tests and 6 E2E."
tags: [qwen3.8, mlx-dspark, dflash2, pi, threejs, typescript, code-review, fps, benchmark, playtest, methodology]
timestamp: 2026-09-02T07:40:00Z
---

> **This page is Round 2.** For the Round 1 review, Round 1 findings, and the UI/color design review section, see [Round 1](devlog-projects-qwen3-8-test-notes-neon-bastion-round-1-review-2026-09-01.md).

# Round 2 — Independent Re-review (2026-09-02)

[English](devlog-projects-qwen3-8-test-notes-neon-bastion-round-2-review-2026-09-02.md) | [简体中文](devlog-projects-qwen3-8-test-notes-neon-bastion-round-2-review-2026-09-02_CN.md)

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

Reviewed commit: `1badf4c "Apply design review: P1 blockers + P2 items + UI/color pass"`, baseline `545c546 "baseline: pre-review delivery (77/100 Request Changes)"`, working tree clean. 17 files changed, 1,315 insertions(+), 478 deletions(-). All figures in this round were independently re-run by the reviewer; agent self-reports were not accepted.

## Results

**Verdict: Request Changes — 87/100 (8.7/10)**, an improvement of 10 points over Round 1's 77/100.

All four P1s and all P2s from Round 1 have been genuinely fixed, and the quality of the fixes exceeded expectations—E2E tests were rewritten according to the specification rather than just renamed, and the color values match the design review section item by item. The sole reason for the Request Changes verdict is the discovery of a **P1 previously masked by overlapping text**: the text in all overlays (start/pause/results) actually renders as pure black Times, making it unreadable against the near-black background, and the existing E2E tests are structurally unable to catch this.

| Rubric | R1 | R2 | Change Description |
|---|---:|---:|---|
| R1 — Map & Collision | 14/15 | 14/15 | Unchanged. |
| R2 — Combat & Hits | 18/20 | **19/20** | Hitmarker + damage numbers + golden hit flash implemented (visible in `02-combat-hit.png`). |
| R3 — AI & Navigation | 16/20 | **18/20** | `alert` state completed; debug panel exposes state/target/last known position; added 3-seed full-match termination regression. Still lacks item-by-item conversion tests. |
| R4 — HUD/Spectate/Results/Accessibility | 9/15 | **11/15** | Director mode F2, reduced-motion, no-WebGL fallback, and debug panel all completed (+4), but overlay text is unreadable (−2). |
| R5 — Visuals & Audio | 8/10 | **9/10** | Color layering, ACES, warm sodium lights, and blueprint minimap all implemented. |
| R6 — Verification Evidence | 6/10 | **8/10** | E2E aligned with the 6 scenarios in the specification, stable across 3 consecutive runs; deductions noted under "Render assertions are weak proxies". |
| R7 — Code Quality | 7/10 | **8/10** | `ENV` tokenization, removal of dead constants, honest README; deduction for overlay scope defect. |
| **Total** | **77** | **87** | **Request Changes; P1 is UI-02.** |

## Independent Verification

| Check | Result | Evidence |
|---|---|---|
| `tsc --noEmit` | Pass | exit 0. |
| `npm run build` | Pass with warning | Still has >500 kB single chunk warning, documented in README as a known trade-off. |
| Unit Tests | Pass | 33/33 (4 files), 2 more AI tests than R1's 31. |
| Playwright E2E | Pass | 6/6, **3 consecutive rounds** all green at 7.0–7.7 s, no flakes observed. |
| Screenshots | 5 images | Added `06-fallback.png`; `02-combat-hit.png` renamed and includes hitmarker. |

## Disposition of Round 1 Carry-over Items

| ID | Status | Re-review Evidence |
|---|---|---|
| FE-20 no-WebGL fallback | **Fixed** | `probeWebGL()` + `?nogl=1` (`src/app.ts`); `06-fallback.png` shows bilingual (Chinese/English) instructions, real-time 2D blueprint map, score, and full control table, not a white screen. |
| QA-08 E2E Scenarios | **Fixed** | 6 scenarios rewritten per specification: ① W forward + assertion blocked by pillar (`z>14.5` no wall clipping) ② Body 20 / Headshot 50 / Score +1 / hitmarker / leaderboard text / zero damage behind wall ③ Death prevents firing → spectate → Q/E switch → free camera ④ Freeze + 8-line results + full reset on restart ⑤ Fixed seed termination + `totalScore == hitScore + 3*kills` global invariant ⑥ fallback. |
| DOC-01 README | **Fixed** | All-✅ compliance table removed, replaced with Status + What's implemented + **Known limitations** (four items: headless pointer lock, rAF throttling, bundle, AI strength). |
| UX-11 Results Overlap | **Fixed (Structural)** | `.nb-root.nb-results` hides msg/board/killfeed/team/bottom/spectate/cross; E2E asserts `.nb-msg` and killfeed are invisible. But see UI-02 below. |
| FE-21 Director Mode | Implemented | F2, `src/app.ts` + `hud.ts`. |
| A11Y-04 reduced-motion | Implemented | CSS + JS, covering `app.ts`/`hud.ts`/`renderer.ts`. |
| UX-10 Debug Panel | Implemented | `01-arena.png` shows FPS/P/FX/survivor count/AI state distribution, as well as per-unit state + target + last known coordinates. |
| FE-22 Hit Feedback | Implemented | `02-combat-hit.png` golden hitmarker. |
| FE-23 alert State | Implemented | Added `alert` to `AIStateName`; added unit test "enters alert when it hears a threat it cannot see", and incidentally fixed a permanent stalemate on the central high ground. |
| CLEAN-01 Dead Constants | Fixed | `fovDeg` removed from `constants.ts`. |
| ART-01 / ART-02 / UI-01 | Implemented | Values match the design review section exactly: `ENV` = boundary `0x0e1013` / wall `0x1a1d22` / ramp `0x2a2f36` / platform `0x333a44` / cover `0x3a4048`; team colors `0x18e0ff` vs `0xff3d63`; ACES + exposure 1.15 + SRGBColorSpace; `HemisphereLight(0x2a3550, 0x241c14)`; `0xffb45a` sodium lights; `Fog(38, 95)`; HP hierarchy and segmented health bars, blueprint minimap all implemented. |

## New Findings

### P1 · UI-02 — Overlay text renders as pure black Times, actually unreadable

`.nb-screen` is attached to the constructor's `container` (i.e., `#app`), making it a **sibling node** of `.nb-root` rather than a child (`src/render/hud.ts:184` vs `:250`). All design tokens are defined on `.nb-root` (`--cyan/--red/--gold/--ink/--data` along with `color` and `font-family`). Therefore, the overlays inherit neither color nor font, and cannot resolve any `var()`.

Reading computed styles from the running preview using Playwright, actual measurements:

```
.nb-root   --cyan = #18e0ff
.nb-screen --cyan = (未定义)        parentElement.className = ""
.nb-res-title  "BLUE WINS"  color = rgb(0,0,0)    font = Times
.nb-sub        "Victory"    color = rgb(0,0,0)    font = Times
.nb-row .sc    "0 / 0"      color = rgb(0,0,0)    font = Times
.nb-row.me .nm "Vega"       color = rgb(255,255,255)   ← 显式设色，唯一可读
.nb-cta        "PLAY AGAIN" color = rgb(234,252,255)   ← 显式设色，可读
```

The `title.style.color = 'var(--cyan)'` in `hud.ts:312` fails because the variable is out of scope, falling back to inherited black; `screenshots/04-results.png` matches this computed style exactly—only Vega and PLAY AGAIN are readable, the rest are lost in the background.

**This defect existed in the baseline** (`545c546` also used `container.appendChild(this.screenEl)`), masked by overlapping text in Round 1. However, this round **significantly worsened** it after migrating colors and fonts to CSS variables: none of this round's typography and color work reaches any overlay, with the start/pause/results screens all using the browser's default serif font.

The fix requires only one line: change `container.appendChild(this.screenEl)` to `this.root.appendChild(this.screenEl)` (`.nb-screen` has `pointer-events:auto` built-in, allowing input to be re-enabled), or lift the token block to the `#app` / `:root` scope.

**Why tests don't catch it**: Playwright's `toHaveText` and `toBeVisible` pass equally for black text on a black background. This is the same class of failure as Round 1—command exit 0 does not mean the interface is usable.

### P2 · QA-10 — "Arena rendered" assertion is a weak proxy

E2E scenario 1 proves the 3D scene is not blank by "CDP screenshot byte count > 20000" (agent self-reported calibration as "blank ≈ 4KB, real ≈ 100KB"). But `01-arena.png` is 87,928 bytes, passing the assertion, while **the 3D scene in the image is entirely black**, with bytes coming almost entirely from the new HUD (blueprint minimap, debug panel, leaderboard). This calibration has become invalid as the HUD becomes richer.

Additionally, this image does not meet the specification's requirement for the first screenshot to show the "start central area"—the player spawns facing a dark corner. It is recommended to change the assertion to pixel variance or non-background pixel ratio within the WebGL canvas area, and to take the screenshot from a camera position facing the central high ground.

## Evaluation

The quality of fixes in this round is significantly higher than the credibility of Round 1's self-assessment. E2E was **rewritten per specification** rather than just renamed to pass: the `totalScore == hitScore + 3*kills` global invariant in scenario 5, and the 3-seed termination regression, both exceed the literal requirements of the specification; the completion of the `alert` state also incidentally fixed a real AI stalemate. The README changing from "15 lines all ✅" to an honest document with Known limitations is the most commendable shift in this round.

The failure mode recorded in Round 1—"accepting against self-written tests rather than against the specification"—has clearly converged in this round. However, UI-02 indicates that another boundary has not been crossed: **the agent still only verifies what can be asserted, not what is actually presented on the screen**. In its own saved `04-results.png`, the title is black.

---

# Round 2 Correction — Manual Playthrough Review (2026-09-02)

After personally playing a match, the user reported 6 issues. **All are true, and I failed to detect any of them in either Round 1 or Round 2.** The cause is a structural gap in the review methodology: both rounds only performed static code review, headless test re-runs, and screenshot inspection, while the **manual actual playthrough** required by item 2 of the "Final Acceptance" section in the prompt was never executed by any party—the agent cannot play, and the reviewer did not play either.

**Corrected Score: 74/100 (7.4/10), still Request Changes.**

It should be noted that this does not mean the Round 2 fixes made the product worse. All Round 2 fixes were genuine. The scores of 77 (R1) and 87 (R2) were both given based on the same body of evidence that could not reach actual gameplay; the defects listed below persisted throughout both rounds. If R1 had been playable at the time, its score would also have been lower.

| Rubric | R2 (Blind) | Correction | Reason |
|---|---:|---:|---|
| R1 — Map & Collision | 14/15 | 14/15 | Unaffected. |
| R2 — Combat & Hit | 19/20 | **14/20** | A/D strafing direction inverted; tracers invisible; no muzzle flash; no sparks when hitting walls. |
| R3 — AI & Navigation | 18/20 | 18/20 | Unaffected. |
| R4 — HUD/Spectate/Results/Accessibility | 11/15 | **10/15** | UI-02 unresolved, compounded by controls documentation not matching implementation. |
| R5 — Visuals & Audio | 9/10 | **6/10** | In-game visuals too dark to read; combat feedback nearly nonexistent. |
| R6 — Verification Evidence | 8/10 | **6/10** | 33 unit tests + 6 E2E tests all green, yet missed inverted strafing and invisible tracers—the test suite is structurally blind to "playability". |
| R7 — Code Quality | 8/10 | **6/10** | README fabricated 6 non-existent controls, which is more severe than R1's "omissions". |
| **Total** | **87** | **74** | **Request Changes; P1 are CTRL-01, FX-01, DOC-02.** |

## New Findings

### P1 · CTRL-01 — A/D Strafe Direction Inverted

The forward vector in `src/game/match.ts:150-153` is `(sin θ, cos θ)`, and the camera uses the same convention (`src/render/renderer.ts:381-383`). In Three.js right-handed Y-up, the screen right should be `f × up = (-cos θ, sin θ)`; the code writes `(cos θ, -sin θ)`, which is exactly its negative, so A moves right and D moves left.

Fix: `rx = -Math.cos(p.yaw); rz = Math.sin(p.yaw);`

**Why tests did not catch this**: E2E scenario 1 only asserts W forward (`z1 < z0 - 1`), and never tests A/D; none of the 33 unit tests contain any strafe direction assertions. It is recommended to add a pure logic unit test: "When yaw=0, pressing D should increase x."

### P1 · FX-01 — Combat Visual Feedback Actually Invisible

Three issues compound, and less than half of the "muzzle flash, tracer/bullet trail, wall impact sparks" required by the prompt were implemented:

1. **Tracer origin is the shooter's eye** (`src/app.ts:241` `eyeOf(shooter)`), which is the camera origin for the player. The projection of a line segment originating from the camera is a single point at the center of the screen, making it impossible to see in first-person view—others' tracers are visible, but one's own are never visible. It should originate from a muzzle offset.
2. **Tracer lifetime is 0.09 s** (`renderer.ts:272`), which is about 5 frames at 60 fps, at the edge of perception.
3. **Muzzle flash completely unimplemented**: `constants.ts:87` has `muzzleLife: 0.05`, but there is no usage anywhere in `src/`—another dead constant (same as R1's `fovDeg`).
4. **No sparks on wall impact**: `spawnHitSpark` is only called when `res.kind === 'unit'` (`app.ts:243`).

The audio call chain was verified to be complete (`audio.init()` is triggered by a real click on the start screen, master gain 0.5); static analysis cannot explain the user-reported silence, pending confirmation from the user-side console.

### P1 · DOC-02 — README Documents 6 Non-Existent Controls

| README | Actual |
|---|---|
| `Click` / `Space` Shoot | Space is **Jump**; shooting is left-click only |
| `C` Crouch | Does not exist |
| `1` / `2` Knife / Pulse rifle | Do not exist |
| `Q` Melee | Actually **Spectate Previous** |
| `Tab` Leaderboard | Does not exist |
| `P` Pause / `M` Mute | Do not exist |

Actual bindings are only: WASD/Arrow keys, Shift, Space, R, Q, E, F2, F3/`` ` ``；已实现的 `E` (Spectate Next) is conversely not documented.

This is more severe than Round 1's DOC-01: R1 was an **omission** of unimplemented items, while this round is **fabrication** of features. In the Round 2 review, I only checked the Known limitations section and did not compare the Controls table with `applyKey` item by item, which is a review oversight.

### P2 · ART-03 — In-Game Visuals Too Dark (Defect in the Design Suggestion Itself)

The wall `#1A1D22` suggested in the design review section has a luminance of only about 11%. At the time, it was assumed that sodium lights and high-platform self-emission would be sufficient to establish hierarchy, **but no lower bound for overall screen brightness was set**. In actual gameplay, the screen is difficult to read. Correction suggestion: `toneMappingExposure` 1.15 → 1.5; raise wall to `#23272E`; add `AmbientLight(0x3a4a6a, 0.25)` to ensure no pure black areas; increase sodium light intensity from 150 → 220 and increase count to 6.

### Non-Defect · Full-Auto Fire Rate Matches Prompt

User reported "clicking the mouse feels like a machine gun, empties in two or three seconds." `fireInterval: 0.085` (11.7 rounds/sec) × 30 rounds = 2.55 seconds, which matches the observation; however, Section 3 of the prompt explicitly requires "the player weapon is an automatic rifle," so full-auto is **compliant with specifications**. Changing to semi-auto (one shot per click) would be a requirement change rather than a fix, requiring user decision. Judgment: The real cause of the "wrong feel" is FX-01—full-auto without tracers, muzzle flash, or hit feedback is equivalent to spraying into the void.

### Non-Defect · Sprint Works but No Feedback

`sprintSpeed 8.4` vs `walkSpeed 5.4` (1.56×) does work, but there is no FOV push, no HUD indicator, and no audio change, making it imperceptible. This is a lack of feedback; it is suggested to add a smooth FOV push from 75° to 82° and slight camera shake.

## Methodological Conclusion (The Most Important Output of This Review)

The failure mode recorded in Round 1 was "agent accepts against its own written tests, not against the prompt"; Round 2 added "agent only verifies what is assertable, not what is actually rendered on the screen". This correction exposes a third layer, and this layer belongs to the **reviewer**:

> **Static review + headless tests + screenshot inspection, even combined, still cannot verify "playability".** Inverted strafing, invisible tracers, and fabricated controls documentation—these three items passed two rounds of review unscathed despite 33 unit tests and 6 E2E tests all being green and 5 screenshots being present.

Direct impact on subsequent benchmarks: **Any acceptance conclusion for interactive deliverables should be marked as "Incomplete" before manual playthrough, rather than giving a score.** It is recommended to introduce a mandatory manual acceptance step for such tasks, whose conclusion takes precedence over all automated evidence.
