---
type: Note
title: "Neon Bastion — mlx-dspark/Qwen3.8-27B-8bit + Pi independent acceptance and code review"
status: current
description: "Independent review of the Neon Bastion 4v4 browser FPS from the local mlx-dspark DFlash2 stack — core simulation and unit tests are excellent, three spec features are absent, the E2E suite misses the mandated scenarios, plus a concrete UI and palette direction for the presentation layer."
tags: [qwen3.8, mlx-dspark, dflash2, pi, threejs, typescript, code-review, fps, benchmark, design, color, hud]
timestamp: 2026-09-01T21:34:00Z
---

# Neon Bastion — mlx-dspark/Qwen3.8-27B-8bit + Pi independent acceptance and code review

[English](devlog-projects-qwen3-8-test-notes-neon-bastion-mlx-dspark-pi-review-2026-09-01.md) | [简体中文](devlog-projects-qwen3-8-test-notes-neon-bastion-mlx-dspark-pi-review-2026-09-01_CN.md)

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

The acceptance authority is `test-prompts/3d-team-arena.md` (a historical local file, not distributed with this report) (11,907 bytes — the most detailed prompt in this test set). The reviewed delivery is `$HOME/Code/qwen3.8-tests/mlx-dspark-27B-8bit-with-pi-3d-team-arena`; it is not a Git repository, so this is a working-tree review.

The agent's own closing claim ("complete and fully green") is **not** treated as proof. Every build/test number below was re-run independently by the reviewer against the checked-out tree.

## Run configuration and performance context

| Field | Recorded value | Provenance |
|---|---|---|
| Server | `mlx-dspark 0.18.0`, PID 44895 | `/health` |
| Model | `mlx-community/Qwen3.8-27B-8bit` | `/v1/models` |
| Speculative decoding | DFlash 2 (`incoai/Qwen3.8-27B-DFlash2`) | `/health`; drafter `config.json` `conv_kernel_size: 2` |
| Context window | 131,072 | `--context-window 131072` |
| Output cap | 16,384 → **32,768** mid-session | See "Output-cap incident" below |
| Agent | Pi 0.84.4, thinking `low` | `~/.pi/agent/models.json` |
| Session duration | approximately 5 hours | Pi session `01a05d98-e82c-7cb1-9cc0-319ed9c37cb0` |
| Requests / tokens | 201 requests · 13,928,046 in · 297,247 out | `/metrics` |
| Tool calls | 196 (bash 89 · edit 49 · write 39 · read 19), 4 failures (2.0%) | Pi session log |
| Context compactions | 3 (at 115,643 / 120,613 / 115,113 tokens) | Pi session log |
| Mean decode | 21.7 → 19.8 tok/s over the session | `/metrics` `mean_decode_tokens_per_sec` |
| Mean accept length | 3.15 | `/metrics` |
| Prefix-cache reuse | 94.6% (13,169,005 of 13,928,046 input tokens) | `/metrics` |
| Peak MLX allocator | 69.0 GB (active 42–52 GB) | `/metrics` `memory.peak_bytes` |

This is a session-level observation, not a controlled benchmark: cold/warm cache state, per-request TTFT and hardware contention are not isolated. It does, however, satisfy the real-workload part of BENCH-05.

### Speed behaviour observed (useful for later replays)

- Decode rate is governed by `ms/round`, which rises monotonically with context: 81 ms at a fresh start → 133 ms → 185 ms before compaction. Measured slope ≈ **5.5 ms per 1,000 generated tokens**; extrapolating that slope to a 10,880-token generation predicted 158 ms/round against 137–158 ms observed.
- `tok/s` alone is a misleading health signal: it also swings with draft acceptance, which is content-dependent (91% while writing code, 28% while writing prose) and moves independently of `ms/round`.
- **Compaction is not purely a cost — it is the only operation that lowers `ms/round`** (185 → 133, i.e. 12–22 → 23–28 tok/s). Running a larger context window to avoid compaction would trade a one-off pause for a permanently slower regime.
- Raising `--context-window` to the model's native 262,144 was considered and rejected: `/machine` puts the plain-decode ceiling at 17.0 tok/s at zero context, 12.9 at 131K and ≈10.4 at 262K.

### Output-cap incident (process finding)

`--max-tokens-cap` was lowered 32,768 → 16,384 mid-session to bound a runaway thinking chain (one request reached 10,880 tokens with no visible output). It then **truncated a legitimate long answer**: `prompt_tokens 6,932` / `completion_tokens 16,384` with context only 17.8% used, and Pi reported "Response was truncated before completion". The cap was restored to 32,768.

Lesson recorded for future runs: the output cap must be sized to the longest *legitimate* output, not to the worst tolerable wait. Truncation discards the entire generation (~14 minutes here); a long wait at least yields a usable result.

## Result

**Verdict: Request Changes — 77/100 (7.7/10).**

The hard parts are right. Hitscan wall-priority, head/body hitboxes, single-score-per-bullet, friendly-fire exclusion, seeded spread, fair AI perception and a connected nav graph are all correctly implemented and covered by an unusually good unit-test suite that maps almost one-to-one onto the prompt's own test list. The deductions are for scope, not for correctness: three explicitly required features are absent, the debug panel is a stub, the Playwright suite does not implement the five scenarios the prompt mandated, and the README's compliance table presents the delivery as fully conformant by omitting what is missing.

| Rubric | Score | Why |
|---|---:|---|
| R1 — arena, map data, collision | 14/15 | `mapData.ts` is a genuine single source; unit tests prove ≥12 cover solids, walkable spawns, a connected nav graph with no wall-crossing links, two west/east routes to centre, ramps to the platform, and no spawn-to-spawn line of sight. |
| R2 — combat, hitscan, scoring | 18/20 | Wall-priority resolved before target selection, head sphere + body AABB with nearest-part choice, 20/50 damage, HP floor, friendly fire excluded at selection time, `+1` hit / `+3` kill guarded by `hp<=0 && alive`. No visual hitmarker or damage numbers (audio cue + target flash only). |
| R3 — AI, perception, navigation | 16/20 | Perception is genuinely fair (100° cone via `fovHalfDeg: 50`, range limit, eye→torso LOS raycast; hearing is separate and cannot target). But 7 of the 8 required states exist — no distinct `alert` state — and AI state/target/last-known-position are not inspectable anywhere. |
| R4 — HUD, spectate, results, accessibility | 8/15 | HUD, leaderboard, killfeed, spectator cycling, free-cam fallback and full restart reset are implemented and tested. **Director mode, reduced-motion and the no-WebGL fallback are entirely absent**, and the debug panel shows only FPS. |
| R5 — visual and audio | 8/10 | Procedural low-poly geometry, WebAudio synthesis gated behind the first gesture, particle pooling, tracers and muzzle flash are present; art direction judged only from the four committed screenshots. |
| R6 — verification evidence | 6/10 | 31/31 unit tests and 4 screenshots are strong, but the E2E suite implements different, weaker scenarios than the five the prompt mandated. |
| R7 — code quality and review readiness | 7/10 | Clean pure-logic/render separation, intent-bearing comments, typed modules. Offset by the README compliance table, a dead `fovDeg` constant beside `fovHalfDeg`, and an unaddressed 561 kB single chunk. |
| **Total** | **77/100** | **Request Changes; FE-20, QA-08, DOC-01 and UX-11 are P1.** |

## Independent verification — 2026-09-01

| Check | Result | Evidence |
|---|---|---|
| Production build | Pass with warning | `npm run build` exited 0; 561.34 kB JS / 146.34 kB gzip, standard >500 kB chunk warning. |
| Unit tests | Pass | `npx vitest run` → 31/31 across 4 files in 227 ms. |
| E2E | Pass | `npx playwright test` → 5/5 in 5.5 s (headless Chromium + WebGL). |
| Screenshots | Present | `screenshots/01-arena.png`, `02-combat.png`, `03-spectator.png`, `04-results.png`. |
| Codebase size | 4,111 lines TypeScript | 20 source files + 5 test files. |

## Findings

### P1 — blocks acceptance

**FE-20 · No-WebGL fallback is absent.** The prompt requires a fallback that displays the match state, controls, and an unsupported-3D message, explicitly stating "must not result in a white screen or an error." No `WebGLRenderingContext` probe or fallback branch exists anywhere in `src/`.

**QA-08 · The Playwright suite does not implement the mandated scenarios.** Five tests exist and pass, but they are not the five specified:

| Prompt scenario | Delivered |
|---|---|
| 1 — pointer lock, WASD, mouse turn, assert player cannot pass a named wall | Replaced by a boot/HUD/pixel-diversity smoke test. **No movement or wall-collision assertion.** |
| 2 — unobstructed body+head hits, assert HP, hitmarker, score, leaderboard sync; then behind wall | Partially: a loose `damaged \|\| scored` OR assertion and a magazine decrement. No head/body distinction, no leaderboard sync. |
| 3 — death, cannot fire, spectate ally, **switch target**, free-cam fallback | Only death + `spectate.mode !== 'alive'` + banner text. Switching and fallback exist in unit tests, not E2E. |
| 4 — blue wins, freeze, results leaderboard, restart resets 8 units | Closest match; asserts winner, title and `alive && hp === 100`, but not score reset to 0. |
| 5 — seeded AI-vs-AI fast-forward: match terminates, no negative HP, no double scoring, no stuck state | **Missing entirely**; the slot is occupied by a wall-occlusion test (which is scenario 2's second half). |

**DOC-01 · README compliance table misrepresents completeness.** `README.md:203-220` presents 15 requirement rows, all `✅`, and simply omits director mode, reduced-motion and the no-WebGL fallback. The prompt's final acceptance item explicitly forbids presenting unimplemented work as done; a compliance table that silently drops the unmet rows is misleading by omission.


**UX-11 · Settlement screen text overlap (2026-09-01 supplement, from screenshot review).** `screenshots/04-results.png` shows `BLUE WINS` and `ENEMY DOWN` overlapping each other, with a semi-transparent `VICTORY` layered beneath them; the settlement leaderboard header is rendered as `PlayerK / S`, and the row text overlaps with the persistent background leaderboard, making it actually unreadable; the kill feed covers the area below the minimap. This defect exists in the acceptance screenshots submitted by the agent itself but was not detected by the agent, nor captured by any E2E assertion—E2E only asserted that the text of `.nb-res-title` equals `BLUE WINS`, without checking the layout. This also serves as empirical evidence for the deductions in R4 and R6.

### P2

- **FE-21 · Director mode not implemented.** No occurrence in `src/`.
- **A11Y-04 · reduced-motion not implemented.** No `prefers-reduced-motion` handling.
- **UX-10 · Debug panel is a stub.** Only `nb-fps` exists; the prompt requires live active units, active particles, alive counts and AI state distribution, plus inspectable AI state/target/last-known-position.
- **FE-22 · No visual hit feedback.** `hitmarker` appears only as an audio comment (`src/game/audio.ts:86`); there is no crosshair hitmarker element and no damage numbers. Target flash (`flashUntil`) is implemented.
- **FE-23 · AI state machine is 7 of 8 states.** `AIStateName` = `assemble | patrol | engage | retreat | search | cautious | dead` (`src/game/types.ts:135-142`); the required `警戒/alert` state is absent, and AI unit tests cover 5 behaviours rather than every transition.
- **QA-09 · Bundle warning unaddressed.** 561 kB single chunk; no code splitting or `chunkSizeWarningLimit` decision.
- **CLEAN-01 · Dead constant.** `CONFIG.ai.fovDeg: 100` sits beside the authoritative `fovHalfDeg: 50` (`src/game/constants.ts`) and is unused — an easy source of a future 200° FOV bug.

## What went right (worth keeping as a pattern)

- **Map data really is the single source.** Collision, raycast occlusion, nav graph and minimap all derive from `mapData.ts`, and the unit tests assert the derivations rather than the renderer.
- **Correctness invariants are enforced at the right layer.** `resolveShot` rejects same-team targets before distance comparison, and wall distance is compared against candidate distance so a wall between shooter and target always wins (`src/game/combat/hitscan.ts`).
- **Scoring cannot double-count.** One `fireWeapon` call consumes one round and awards at most one `+1` (and one `+3` behind an `alive` guard).
- **The unit suite is the strongest seen in this test set** — 31 tests covering nav connectivity, spawn LOS, spread determinism by seed and shot index, magazine/reload locking, scoring rules and spectator cycling.

## Improvement Directions: UI and Color Palette (2026-09-01 Design Review)

The following are specific remediation directions for the presentation layer. All changes are limited to rendering and the HUD, and do not touch the combat, AI, or map logic that has already passed testing.

### Global Rule

> **Saturation is reserved exclusively for "humans" and "hit feedback." The map uses only lightness, not hue.**

The eye captures any vibrant thing = there is a person there. The current build violates this rule: the Blue team `0x2f7bff` (hue 217°) and the walls `0x1c2438` (hue 220°) belong to the same hue family, differing only in lightness, **effectively camouflaging the Blue team into their own map**. The Red team is distinguishable, while the Blue team is not; this is not an aesthetic issue but a failure of target identification in a team shooter. The following items are all corollaries of this rule.

### 1. Environment: Remove Hue, Gain Lightness Contrast (Highest Priority)

The five building types are currently crammed into 8–17% lightness within the same blue hue; the lightness ratio between cover and walls is only 1.4:1.

| Usage | Current Value | Suggestion | Rationale |
|---|---|---|---|
| boundary | `0x11141e` | `#0E1013` | Darkest; boundaries should recede into the background |
| wall | `0x1c2438` | `#1A1D22` | Saturation 38% → 8%; remove the blue tint |
| **cover** | `0x262f45` | **`#3A4048`** | Brighten to 25%; cover is an object requiring instantaneous judgment and should be the brightest structure (ratio increased to 2.3:1) |
| ramp | `0x232c42` | `#2A2F36` | Mid-range; makes vertical routes distinguishable |
| platform | `0x2b3a5e` | `#333A44` + emissive `#16324f` @0.35 | The only structure allowed to have hue—it is the contested high ground |

Principle: Each category is approximately 1.5× brighter than the previous one. Evidence location: `src/render/renderer.ts:88-97`.

### 2. Team Colors: Rotate Blue Team to Cyan

```
BLUE  body 0x2f7bff → #18E0FF   head 0x9fd0ff → #B8F6FF   emissive #0A6E8C
RED   body 0xff2f5e → #FF3D63   head #FFC9D4
```

Cyan 190° versus Magenta-Red 348°, separated by 158°, with an environment of 210°/8% saturation; both teams are simultaneously distinguishable without one dominating the other. Evidence location: `src/render/renderer.ts:12-13`.

It is also recommended to add a **ground team-color ring** for each character (radius 0.5 m, additive blending, opacity 0.35). With low-poly models, characters are merely blocks, making silhouette recognition slow; the ground ring remains visible even when partially occluded by cover, which is precisely the "non-UI assist method for distinguishing factions" required by the specification.

### 3. Lighting: The Warm Industrial Lighting Required by the Specification Is Currently Completely Absent

- `HemisphereLight` ground color `0x0a0a12` (near black, equivalent to no bounce) → `#241C14` warm gray. Cold skylight + warm ground bounce is key to making concrete read as concrete rather than blue plastic.
- Add **4 sodium lamps** `#FFB45A`, intensity 70, distance 26, decay 2, y=5.5, placed at two maze corners and the entrances of two side corridors—this is the part required by the specification's "maze corners must have clear light/dark hierarchy" that is currently missing.
- `Fog(near 22, far 72)` → `near 38, far 95`. The arena is only about 64 units wide; fog starting at 22 m effectively blurs the engagement zone.
- **Tone mapping is currently not set**, which is the true reason the visuals appear as "grayish dark" rather than "layered dark." This is the single change with the highest yield:

```js
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;
```

Evidence location: `src/render/renderer.ts:57-58, 74-84`.

### 4. HUD Typography: Currently Using Default Font Stack

`'Segoe UI', system-ui, sans-serif` (`src/render/hud.ts:8`) is a Windows-priority stack that silently falls back to `system-ui` on this machine, equivalent to making no choice. The HUD has two distinct typography tasks:

- **Data** (HP/ammo/score/leaderboard) requires monospacing and no jitter: `ui-monospace, 'SF Mono', 'Cascadia Mono', monospace` + `font-variant-numeric: tabular-nums` (currently only two selectors have this; it should be applied to all numbers).
- **Announcements** (kill feed / SPECTATING / BLUE WINS) require a wide, authoritative voice. The specification prohibits external fonts, so no font files are introduced; instead, typography is used to establish tone: `text-transform: uppercase; letter-spacing: .18em; font-weight: 800`, paired with a 1px cyan rule line below—evoking the tone of military engraved signage, consistent with the "futuristic industrial arena" theme.

### 5. The Hierarchy of HP and Ammo is Inverted

Currently HP is 30px and ammo is 34px—ammo is larger than HP. In an FPS, "am I about to die" always takes precedence over "do I need to reload."

- HP number 30 → **46px**, weight 800; ammo 34 → **26px**, opacity 0.8.
- HP bar 240×14 → **320×6, segmented into 4 segments ×25 HP, 2px gap**. Segmented bars allow "counting boxes" in peripheral vision, while continuous bars require "estimating length"; the former is significantly faster.
- Colors should jump based on state rather than using a fixed gradient: >60% `#2FD08A`, 25–60% `#FFC93C`, <25% `#FF3D63` + 0.9 s pulse. Currently it is always the same green gradient, and the HP bar never alerts.

Evidence location: `src/render/hud.ts:11-14`.

### 6. Root Cause and Fix for Overlapping End Screens (Corresponds to P1 UX-11)

Three layers of absolute positioning fall into the same band: `.nb-msg` (`top:34%`, 40px), `.nb-res-title` (56px), and the unclosed persistent `.nb-board`.

1. When entering `results`, set `.nb-msg`, `.nb-board`, and `.nb-killfeed` to `hidden`—they are in-match chrome and should not survive to the end screen. This step alone resolves the overlapping text of `BLUE WINS / ENEMY DOWN / VICTORY`.
2. `.nb-board-lg .h { gap: 16px }`—the header is squeezed into `PlayerK / S` because `.h` uses `justify-content: space-between`, resulting in no minimum spacing between the two spans at 420px width.
3. Provide a true container for the end panel: `display:grid; gap:28px; place-items:center; padding:40px; max-width:560px`.

### 7. Hit Feedback Specifications (Corresponds to P2 FE-22)

- **Crosshair hitmarker**: 4 short lines at 45°, length 8px, width 2px, expanding from 4px to 9px from the center in 90 ms, then fading out in 120 ms. Body hit `#FFFFFF`, headshot `#FFC93C`. This is the most severely missing aspect of current game feel.
- **Damage numbers**: Project world coordinates of the hit point to the screen, float up 42px, fade out in 550 ms; body 18px, headshot 26px using `#FFC93C`.
- **Kill**: Crosshair scales up by 6% within 90 ms; kill feed lines slide in from `x:-12px`.

### 8. Signature Element: Turn the Minimap into a "Fortress Blueprint"

Background `#0A0D12`, structure lines 1px `#2A3A5A`, two spawn areas as 12% team-color filled wedges, surviving units as 3px solid dots, and eliminated units as hollow rings. All data is already in `mapData.ts`; this is a pure presentation-layer change. This is the only place where the name "Neon Bastion" can be truly fulfilled.

### 9. Remove One Accessory

Remove the three-segment rainbow gradient from `.nb-title` (`#5bb0ff → #c48bff → #ff6d8a`, `src/render/hud.ts:44`). The purple-pink gradient title is the most templated choice and introduces purple, a third color family that does not exist elsewhere in the game. Change to cyan-to-white, or flat fill `#E8F4FF` with a cyan rule line.

### If Only Three Things Are Done

Ordered by yield: **Add tone mapping** → **Brighten cover to `#3A4048`** → **Change Blue team to cyan `#18E0FF`**. The three items total approximately twenty lines of changes.
