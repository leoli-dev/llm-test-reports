---
type: Note
title: "Neon Bastion — Round 3 verification (score withheld pending playtest)"
status: current
description: "Third-pass verification of Neon Bastion — every Round 2 fix independently confirmed, but a human playthrough then exposed that AI fire bypasses the event bus entirely (no tracer, flash, spark or sound for 7 of 8 units) and that the player gets no damage-taken feedback at all."
tags: [qwen3.8, mlx-dspark, dflash2, pi, threejs, code-review, fps, benchmark, playtest, methodology]
timestamp: 2026-09-02T10:45:00Z
---

> **This page is Round 3.** See [Round 1](devlog-projects-qwen3-8-test-notes-neon-bastion-round-1-review-2026-09-01.md) and [Round 2](devlog-projects-qwen3-8-test-notes-neon-bastion-round-2-review-2026-09-02.md) for the previous two rounds.

# Neon Bastion — Round 3 Verification (Scoring Deferred to Manual Play)

[English](devlog-projects-qwen3-8-test-notes-neon-bastion-round-3-review-2026-09-02.md) | [简体中文](devlog-projects-qwen3-8-test-notes-neon-bastion-round-3-review-2026-09-02_CN.md)

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

Reviewed commit: `ad6545d "Fix round-2 review findings (4 P1, 2 P2) + sprint feedback"`, baseline `1badf4c`. 13 files changed, +402/−76, working tree clean.

## No Score Given This Round — This Is Deliberate

The methodological conclusion from Round 2 was: **static code review + headless test reruns + screenshot inspection, even combined, still cannot verify "playability"**. The three issues of inverted A/D controls, invisible tracers, and fabricated control instructions had passed two rounds of review despite 33 unit tests + 6 E2E tests all passing and 5 screenshots being present.

If this round were to assign a score based on the same set of evidence, it would immediately contradict the conclusion just recorded. Therefore, this page only answers the verifiable question of "whether each finding from Round 2 has been fixed," and **the final score is reserved for after the user manually plays the game**. See the end of the document for the playtest checklist.

## Independent Verification

| Check | Result | Evidence |
|---|---|---|
| `tsc --noEmit` | Pass | exit 0. |
| `npm run build` | Pass with warning | Still has >500 kB chunk warning, documented in README as a known trade-off. |
| Unit Tests | Pass | **38/38 (5 files)**, an increase of 5 movement tests compared to R2. |
| Playwright E2E | Pass | 6/6, **3 consecutive rounds** all green at 7.4 s. |
| Computed Style Probe | Pass | Independently rerun by the reviewer (not the agent's built-in assertions), see below. |

## Disposition of Round 2 Carry-over Items

| ID | Status | Independent Re-verification Evidence |
|---|---|---|
| **UI-02** (P1 Overlay Black Text) | **Fixed** | `hud.ts:255` changed to `this.root.appendChild(this.screenEl)`. Reviewer probe measurement: parent of `.nb-screen` is `nb-root nb-results`, `--cyan` resolves to `#18e0ff`; `.nb-res-title` color `rgb(24,224,255)` (originally `rgb(0,0,0)`), `.nb-sub` `rgb(230,238,251)`, `.nb-row .sc` font `ui-monospace`. **Times has completely disappeared.** |
| **CTRL-01** (P1 Inverted A/D) | **Fixed** | `match.ts:152-155` changed to `rx = -Math.cos(p.yaw); rz = Math.sin(p.yaw);`, with derivation comments added. Added 5 new tests in `tests/unit/movement.test.ts`: D moves right in 4 orientations, A is the mirror of D, no forward/backward drift for D/A. |
| **FX-01** (P1 Combat Feedback Invisible) | **Fixed** | Tracer start point moved to muzzle (`app.ts:249-253`, 0.55 m forward / 0.12 m below eye); `spawnMuzzleFlash` implemented (`renderer.ts:315`, pooled); `res.kind === 'wall'` now also triggers sparks (cool color, distinguished from warm color of hit units); `tracerLife` 0.09→0.18 s and connected to CONFIG (originally a dead constant); three dead constants `maxParticles`/`hitKick`/`shotKick` removed. `02-combat-hit.png` shows visible tracer line, gold hitmarker, sparks, debug panel `FX 5`. |
| **DOC-02** (P1 README Fabricated Controls) | **Fixed** | Controls table matches `applyKey()` item by item (Space=Jump, Q/E=Spectate, Left Click=Shoot), and added a line **"Not yet implemented (honest list): crouch, melee, weapon switching, Tab leaderboard hold, `P` pause, `M` mute"** — explicitly listing unimplemented items, which is exactly the honesty required by the prompt. |
| **QA-10** (P2 Rendering Assertion is Weak Proxy) | **Fixed** | Byte count proxy replaced by **reading actual pixels from WebGL canvas** (`brightFrac` / `std` / `maxLuma`, sampling 6 frames to take the best), camera fixed facing the central platform. A completely black screen will now cause the test to fail. |
| **ART-03** (P2 Actual Game Too Dark) | **Fixed but Overdone** | exposure 1.15→1.5, wall `#1A1D22`→`#23272E`, added `AmbientLight(0x3a4a6a, 0.25)`, sodium lights 4 @150→6 @220. The screen is indeed brighter, but see ART-04 below. |
| **FEEL-01** (P2 Sprint No Feedback) | Implemented | FOV 78°→85° smooth transition + head bob, disabled under reduced-motion, and written into the Controls table. Perceptibility pending manual confirmation. |

## A Point Worth Noting: The Agent Internalized Review Comments into Regression Tests

The two newly added assertions directly target the failure mechanisms from the previous round, with comments stating *"toHaveText/toBeVisible pass for black-on-black, so assert computed style"*:

- Both start screen and results screen assert **computed color and font-family** (`rgb(232,244,255)` / `rgb(24,224,255)` + `system-ui`)
- Scene rendering assertion changed to **canvas pixel statistics** instead of PNG byte count

This is the highest quality part of this round: it did not just fix the bug, but added tests that "can detect this type of bug."

## New Findings

### P2 · ART-04 — Excessive Warm Lighting, Contradicting the Prompt's "Dark Gray Concrete" Direction

`01-arena.png` and `02-combat-hit.png` show the ground as distinctly orange-brown, with warm light dominating the entire screen; while the wall `#23272E` remains dark, creating a fragmented contrast of "bright orange ground + near-black walls." The "Visual, Sound, and Performance" section of the prompt requires "dark gray concrete, blue/red team light strips, **small amount** of warm industrial lighting" — the current warm light is not a small amount.

The root cause is that four brightening changes were stacked simultaneously: exposure ×1.30, wall brightness ×1.4, added ambient light, total sodium light power ×2.2 (4×150 → 6×220). **This suggestion was given by the reviewer and did not specify that each item should be verified individually**, so the responsibility lies with the reviewer.

Suggested rollback direction (adjust one item at a time and check the image): first return sodium lights to 4 @180, lower exposure to 1.3, keep AmbientLight and wall brightening; if still dark, prioritize brightening the wall rather than adding warm light.

## Manual Play Checklist (Prerequisite for Scoring)

Please manually play and confirm the following seven items; any failure should be recorded as a new finding:

1. **A/D Direction** — Does pressing D move right (this is the direct acceptance of CTRL-01).
2. **Ballistic Visibility** — Can you see muzzle flash and tracer line when firing; are there sparks when hitting walls.
3. **Sound Effects** — Are there sounds for firing, hitting, killing, and reloading. *The silence reported in Round 2 could not be reproduced in static review, no changes were made this round, manual confirmation is needed.*
4. **Results Screen** — Is the title readable in cyan, is the leaderboard text clear (UI-02 acceptance).
5. **Screen Brightness** — Is it still too dark, or has it become excessively orange (ART-04 acceptance).
6. **Sprint** — Can you feel the FOV transition and camera shake when holding Shift.
7. **Shooting Feel** — Does full-auto still feel wrong. *Note: The prompt says "assault rifle", changing to semi-auto is a requirement change, user decision is needed.*

---

## Manual Playtest Results (2026-09-02, User Actual Test)

The user played through the checklist above and reported: **Only the player's own projectiles have hit effects and sound; all AI character shots have no feedback whatsoever; when the player dies, they do not know how they died; there is no indication when taking damage, and when hit, they do not know what happened.**

Upon review, **all points are factual**, and the root cause is one architectural defect plus one functional gap.

### P1 · FX-02 — AI shooting completely bypasses the event bus, resulting in no presentation

`src/game/ai/aiController.ts:213` directly calls `fireWeapon(...)`:

```ts
fireWeapon({ units: ctx.units, solids: ctx.solids, shooter: unit, aim, now, seed: ctx.seed });
```

While all presentation-layer events are emitted by `Match.emitShot()` (`src/game/match.ts:228-249`)—the player's firing path goes through it, **the AI's does not**. The consequences correspond item-by-item to the user's observations:

| Presentation | Player Firing | AI Firing |
|---|---|---|
| `{type:'shot'}` event | ✅ | ❌ Never emitted |
| Tracer line / Muzzle flash | ✅ | ❌ |
| Hit sparks (units and walls) | ✅ | ❌ |
| Gunshot sound (with distance attenuation) | ✅ | ❌ |
| `{type:'hit'}` event | ✅ | ❌ |
| Kill feed | ✅ Complete (including headshot marker) | ⚠️ Relies only on reaper fallback |

The damage itself is effective—`fireWeapon` directly modifies `target.hp` internally, so the player loses health and dies, but the entire process is completely silent visually and audibly. This is exactly "not knowing how they died."

The reason the kill feed still has content is that `match.ts:204-223` has a reaper fallback: it scans for units with `hp<=0` and adds a record using `causeId`. However, this path degrades information—`headshot` is always `false`, and if the killer cannot be retrieved, it writes `'???'`.

Fix direction: Make AI firing also go through the unified path of `Match` (move the call to `fireWeapon` into `Match` and call `emitShot` afterwards, or have `aiController` return the `FireResult` to `Match` via a callback). After the fix, AI tracers, muzzle flashes, sparks, and gunshots will automatically all work, because the `onEvent` in `app.ts` does not distinguish shooter identity—it only checks `e.shooterId === 0` at the hitmarker/damage number location.

**Why three rounds of review and all tests failed to detect this**: Unit tests directly call `fireWeapon` to verify damage and scoring, inherently bypassing the event layer; E2E drives player shooting via `__teamArenaTest.shoot()`, which follows the player path; none of the 6 E2E scenarios assert that "presentation events should be generated when AI fires." **Tests covered "AI deals damage," but never covered "AI firing is visible."**

### P1 · FX-03 — No feedback for the player when hit, and related specification constants were deleted in Round 3

Two layers of issues:

1. **`app.ts` never handles `'hit'` events.** Its `onEvent` only branches on `'shot'`/`'kill'`/`'reload'`/`'end'` (`src/app.ts:243,270,278,280`). Even if the AI went through the event bus, when the player is hit, there would still be no screen red flash, damage direction indicator, pain sound effect, or camera impact—**none of these are implemented**.

2. **Round 3 deleted two specification constants as dead constants** (`git show ad6545d -- src/game/constants.ts`):

   ```
   -  hitKick: 0.06,  // camera kick on being hit
   -  shotKick: 0.02, // camera kick per shot (recoil pitch)
   ```

   They were "dead" because **the functionality was never implemented**, not because they were redundant. The "Arena and Camera" section of the problem statement explicitly requires: "First-person camera should have slight movement bobbing, **hit camera impact**, and **muzzle recoil**." Review confirmed that there is indeed no recoil implementation in the code (`applyLook` only handles mouse input). Deleting the constants erased the last clues to these two unimplemented specifications.

   > ⚠️ Responsibility Note: In Round 1, the reviewer pointed out that `fovDeg` was a dead constant (this item was indeed a redundant alias for an implemented value). In Round 3, the agent generalized this to `hitKick`/`shotKick`. The reviewer at the time did not distinguish between "redundant alias" and "placeholder constant for unimplemented functionality," so there is inducing responsibility here; however, the judgment responsibility for deleting specification tracking clues instead of implementing the functionality lies with the agent.

Fix direction: Implement hit feedback (direction indicator + short red vignette + `hitKick` camera impact + pain sound effect) and firing recoil (`shotKick` accumulates pitch lift and smoothly falls back), and restore these two constants.

### Impact on the Conclusions of the First Three Rounds

FX-02 is the **most severe single defect** in this project to date—it renders 7/8 of the characters in 4v4 completely silent and invisible in combat, directly destroying the core requirements of the "Hit Feedback" and "Readability" sections of the problem statement, and also explains the "lack of hit feel" that the user repeatedly expressed from the first playtest.

It also confirms the same methodology for the third time: Round 1 "Acceptance against self-written tests" → Round 2 "Only verifying what is assertable" → Round 3 "Tests covered causality, never covered presentation." The decisive defects in all three rounds were discovered by **manual playtesting**, none by automated evidence.

The other items in the PLAY-01 checklist (A/D direction, settlement readability, brightness, Sprint feel, presence of sound effects) were not individually negated in this feedback, but because FX-02 causes all AI-related presentation to be missing, the original conclusion for item 3 "Sound Effects" needs to be retested after FX-02 is fixed.

---

## Gameplay Redesign Specification (2026-09-02 User Ruling · Takes Precedence Over Original Prompt)

> **Execution Split**: This section and FX-02 / FX-03 have been split into 5 self-contained tasks in dependency order, stored in
> `~/Code/qwen3.8-tests/neon-bastion-followup-tasks.md`, for feeding to Pi one by one.
> The order is FX-02 → FX-03 → Fire Rate + Semi-Auto → Remove Reload → Projectile System, with each task being 16–28 lines.
> Reason for splitting: Feeding the full text of this page (178 lines) at once previously caused the model to generate 32,768 tokens of thinking with zero body text, hitting the `max_tokens` limit and being truncated
> (pi session usage: `stop=length`, `output=32768`, thinking 118,179 characters, text 0 characters).
> This file is a derived execution artifact of this section; **this section is the authoritative specification**; if there is a conflict, modify this section and regenerate the split.

> **Ruling: This section takes precedence over `test-prompts/3d-team-arena.md`.** After actual playtesting, the user decided to prioritize gameplay experience; wherever there is a conflict with the original prompt, this section shall prevail, and the implementer does not need to refer back to the original prompt. The "Automatic Rifle + Magazine + R to Reload" and "Shooting uses hitscan" parts of the original prompt are **void**.
>
> This section is a specification for the implementer (Pi), not a review opinion.

### Goal

Change firefights from "instantly resolved sprays" to "rhythmic, readable, and dodgeable exchanges." The core consists of three things: **reduce fire rate**, **remove ammo management**, and **give bullets a flight time**.

### R1 · Unify Fire Rate to 1 Round Per Second

| Item | Current Value | Target |
|---|---|---|
| `CONFIG.fireInterval` (Player) | `0.085` (11.7 rounds/sec) | **`1.0`** |
| `CONFIG.ai.fireInterval` | `0.2` (5 rounds/sec) | **`1.0`** |

Player and AI use the same fire rate; neither side has a fire rate advantage anymore.

**Required Consequential Handling**: The burst concept of `CONFIG.ai.burstMin: 3` / `burstMax: 6` becomes invalid at 1 round/sec—a single burst would last 3–6 seconds. The burst state machine in `aiController` needs to be simplified to "fire one shot when the timer expires," while retaining the original reaction delay and hit accuracy jitter.

### R2 · Completely Remove Reload and Ammo

Delete `magSize` / `reserveMax` / `reloadTime`, the `R` key binding, empty magazine lock, reload sound effects, and the HUD's ammo and `nb-reload` display. Fire rate throttling is the only firing restriction; no character will ever "run out of ammo."

The ammo area in the bottom-right of the HUD can be removed directly, or changed to display a "next shot ready" cooldown indicator (the latter is more helpful for reading the 1 round/sec rhythm and is recommended).

### R3 · Change Player to Semi-Auto: One Click, One Shot

Currently, `mousedown` sets `fire = true`, and it is only cleared on `mouseup`, so holding down results in continuous fire. Change to **edge-triggered**: a single `mousedown` produces only one firing intent; holding down does not repeat; to fire again, the button must be released and pressed again, and it is still subject to the 1 round/sec throttling constraint of R1.

The AI side does not need a "click" concept; it can simply fire according to the R1 throttling.

### R4 · Change Bullets to Dodgeable Flying Projectiles

**This item is confirmed to use a true projectile system.** The user requires "being able to see bullets coming and dodge them," whereas hitscan completes the hit determination at the instant of firing, meaning there is no dodgeable flight time—merely making tracers "look like they are flying" cannot meet this goal.

The code originally did not have a concept of projectile speed (no `bulletSpeed`/`projectile` in the entire repo, and `tracerLife` is just the tracer display duration), so "current 50%" has no corresponding current value. **Recommended starting value `bulletSpeed: 60` (units/sec), tuning range 45–80.** Derivation: The arena is approximately 64 units wide, with typical engagement distances of 10–30 units; at 60 units/sec, the flight time is 0.17 s (10 units) to 0.5 s (30 units)—mid-to-long range allows for reactive dodging, while close range remains difficult to dodge, fitting the "threatening but readable" feel. The README already refers to the weapon as a pulse rifle, and slow energy projectiles are consistent with this naming.

**Implementation Key Points (affecting whether existing validations can be preserved)**:

1. **Per-frame advancement + continuous collision**, do not use discrete detection of "whether a point is inside a wall." For each logical tick, call the existing `resolveShot`-style ray detection once for the line segment traversed by the projectile, **fully reusing the hit determination logic**—this way, the four invariants of "wall priority," "head/body hitboxes," "friendly fire immunity," and "single shot scores only once" and their corresponding unit tests can be preserved as-is, with only the timing of determination changing from "instant of firing" to "when the projectile arrives."
2. **Projectile object pool**, set limits on lifetime and maximum survival count to avoid accumulation (existing `sparks`/`tracers` already have a pooling paradigm that can be directly reused).
3. **Hits are settled only when the projectile arrives**: damage, scoring, `kill` events, and hitmarkers are all delayed until that moment; the shooter may have died during the projectile's flight—need to decide whether to still score in this case (recommend **still scoring**, as the implementation is simpler and more intuitive).
4. **AI needs lead aiming**: `aiController` currently fires at the target's current position, which will almost never hit moving targets once flight time is introduced. Need to perform first-order lead calculation based on `目标位置 + 目标速度 × 预估飞行时间`, and retain the existing hit accuracy jitter as a difficulty adjustment.
5. **Tracers follow the projectile**: The tracer line segment should be drawn at the projectile's current position (short trail), rather than drawing the complete trajectory at the instant of firing. This also gives the AI trajectory after the FX-02 fix true readability—players can see from which direction the bullet is coming.

### Relationship with FX-02 / FX-03

This change **must be made after or simultaneously with the FX-02 fix**. If FX-02 (AI firing bypassing the event bus) is not fixed, AI projectiles will also not produce any visual effects, making the goal of "seeing bullets coming" impossible—7/8 of the characters will still be silent and invisible. Similarly for FX-03 (zero feedback on being hit): at a rhythm of 1 round/sec, every hit is critical, and the lack of hit feedback will make the new combat rhythm harder to read.

**Recommended Implementation Order**: FX-02 → FX-03 → R1/R2/R3 → R4.

### Implementation Impact Scope

Removing reload affects **13 files** (repo-wide `mag|reload` hits):

- Logic: `combat/weapon.ts` (magazine and reload lock in `registerShot`), `combat/hitscan.ts`, `units/units.ts`, `match.ts`, `ai/aiController.ts`, `types.ts`
- Presentation: `render/hud.ts` (ammo and `nb-reload`), `render/renderer.ts`, `game/audio.ts` (`reload()`), `app.ts` (`R` key, `audio.empty()`)
- Tests: The `'empty magazine cannot fire; reload blocks firing then refills'` in `tests/unit/hitscan.test.ts` needs to be deleted; the magazine decrement assertion in E2E scenario 2 needs to be rewritten; state fields in `testHooks.ts`
- Documentation: Remove `R` from the Controls table in the README, update "What's implemented" accordingly, and explain the new shooting model

### Balance and Acceptance

`ai.accuracy: 0.62` and `reactTime: 0.26` were tuned at 5 rounds/sec; after reducing the fire rate to 1/5, damage per unit time also drops to approximately 1/5, matches will be significantly longer, and stalemates where neither side can kill the other for a long time may occur (a similar issue was encountered when fixing the `alert` state in Round 2). After the changes, it is **mandatory** to use the existing "3 seed full-match termination regression" in `tests/unit/ai.test.ts` to verify that the match can still end within a finite logical time; if not, prioritize increasing `ai.accuracy` rather than reverting the fire rate.

New recommended tests: Projectile flight time is proportional to distance, projectiles do not pass through walls (continuous collision), shooter death during flight still settles normally, player holding the mouse produces only one shot.
