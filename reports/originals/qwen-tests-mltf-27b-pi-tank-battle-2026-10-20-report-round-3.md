# Qwen3.8-27B-MLTF-q8c × pi: Round 3 game restructuring and local performance report

[English](qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-3.md) | [简体中文](qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-3_CN.md)

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Local inference workstation |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | See original report; current snapshot does not fill missing historical configuration |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | macOS 27.0.1 |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

2026-10-20, America/Toronto. This round continued the same pi session from **09:58:25 EDT** to **11:43:41 EDT**, approximately **105.3 minutes**. The MLTF process, model and warm cache were unchanged, without cache clearing or restart. Round 1 report (historical local file; not published with this report) and Round 2 report (historical local file; not published with this report) remain available. This report updates the current game's delivery judgment.

## Delivery and conclusion

[Play the new version](http://127.0.0.1:5179/). Default play is now a **finite elimination battle with all 4 enemies present at the start**, without reinforcements, automatic waves or level transitions. Enemies pursue/attack the player, and the base no longer participates in targeting or win/loss conditions. The map is a **13×13 corridor maze with 49 brick walls + 4 steel walls**. Two-shot bricks, textured lighting, GUI, HP, sound/music, pause/resume, restart and the local leaderboard remain. The player has two lives of 100HP each. R3 uses a separate leaderboard storage key.

pi won all three initial natural games; including regressions, it played 9 games with 9 natural victories. The supervisor separately won two natural games on the final maze. All natural games use **real keyboard/mouse input, state-assisted aiming/logging and some route assistance**, without freezing, teleporting, changing HP or removing enemies to manufacture victory. This is neither a purely visual strategy test nor a blind human playtest. A separate real-movement observation without firing recorded 20 enemy hits exhausting both player lives. The fixed enemy population, pursuit, physical walls and ability to complete the game all have empirical support.

**This remains a very short introductory arcade prototype, rather than a mature complete game.** A single map, four identical enemy types and roughly ten-second high-precision scripted clears provide limited content, difficulty layering and replay value. Art still uses simple geometry and procedural textures, with limited asset detail and environmental layering.

The model ultimately completed the changes but needed **12 textual prompts**. The supervisor did not edit game/ source, tests or documentation, or call another coding model/subagent; only prompts, independent observation scripts, telemetry and reports were written. Much time went into misunderstood requirements, map reasoning, faulty tests and misdiagnoses, so this cannot be described as reliable autonomous completion.

This round had **125 requests and 145,772 output tokens (67,531 reasoning)**. Native weighted **decode was 32.5 token/s and prefill 387.8 token/s**, with 0 request/Metal/capacity failures or restarts and a memory peak of **95.248 GiB**. Throughput declined across the three rounds; zero exceptions primarily establish stable availability rather than constant speed.

![Final maze, four pursuing enemies and complete battlefield](../../assets/figures/b3f83d8d8109-map-final.png)

## 1. Corrections to user feedback and the previous round's judgment

The old version did not have numerically infinite enemies: it had 36 enemies across three levels, replacement spawning and automatic progression, producing the continuous pressure the user disliked. Enemies prioritized the base, so the player often retained full HP while losing to base destruction. Round 2 treated base defense and progressive spawning as improvements but missed the user's actual preference for a finite enemy group pursuing the player. This round explicitly removes that premise.

All 4 enemies appear at the four corners simultaneously. Spawn flashing, distance and maze separation provide preparation time. HUD shows alive/total counts; the last enemy's death wins, and replay requires an explicit player choice. Enemies repath to the player's tile, detour or shoot bricks, approach and strafe at close range. Turrets have delayed tracking and spread, while walls still block shells. Ordinary enemies deal 10 damage per hit; pi actually took two hits for 20HP in each initial game. Damage was not reduced to near zero to make victory possible.

pi generated the map from a fixed seed and froze it: **every restart uses the same map, rather than a runtime-random maze**. Without initially breaking walls, all four entrances can reach the player. One selected shortest path per entrance measures 13/13/15/13 cells with 4 turns each, alongside branches and loops. The 4m tile width exceeds the 2.3m tank collision diameter. Structural counts are supplementary; they do not prove every physical turn is free of sticking or that gameplay is necessarily interesting.

![Rejected intermediate map: four isolated long walls and large open spaces](../../assets/figures/b76ae739cc18-natural-v3-0.png)

Neither the first C-wall map nor the second four-gate map was accepted directly. Only after supervision identified isolated walls/open spaces from actual full-map views did pi switch to a corridor generator. These reworks are requirement-understanding costs; the final design was not a first-attempt success.

## 2. pi's playtests and repeated regressions

Normal difficulty, using the same final maze and post-tap-fix logic. Control timing starts after entering combat and activating bot control; game.time includes the opening, so 7.6 seconds of control is not total time since clicking Start. Each game waits another 5 seconds after settlement and remains over/0 enemies, with no automatic reinforcements.

| Game | Control / total game time | Kills | Global walls destroyed | Shots / enemy hits | Player hits | HP / lives left | Score | Result |
|---|---|---|---|---|---|---|---|---|
| Initial-1 | 7.6 / 9.5 s | 4/4 | 6 | 20 / 8 | 2 | 80 / 2 | 930 | Victory |
| Initial-2 | 7.7 / 9.4 s | 4/4 | 5 | 21 / 8 | 2 | 80 / 2 | 925 | Victory |
| Initial-3 | 7.7 / 9.4 s | 4/4 | 5 | 21 / 8 | 2 | 80 / 2 | 925 | Victory |
| Regression1-1 | 7.6 / 9.5 s | 4/4 | 5 | 20 / 8 | 1 | 90 / 2 | 925 | Victory |
| Regression1-2 | 7.7 / 9.4 s | 4/4 | 5 | 21 / 8 | 2 | 80 / 2 | 925 | Victory |
| Regression1-3 | 7.7 / 9.4 s | 4/4 | 6 | 21 / 8 | 1 | 90 / 2 | 930 | Victory |
| Regression2-1 | 7.6 / 9.5 s | 4/4 | 5 | 20 / 8 | 1 | 90 / 2 | 925 | Victory |
| Regression2-2 | 7.7 / 9.4 s | 4/4 | 6 | 21 / 8 | 1 | 90 / 2 | 930 | Victory |
| Regression2-3 | 7.7 / 9.4 s | 4/4 | 5 | 21 / 8 | 2 | 80 / 2 | 925 | Victory |

Formal playtests have 0 combined pageerror/console errors, and the formal three-game run records 0 stalls. **This does not erase earlier repeated startup/precondition failures.** The script projects enemy positions for mouse aiming, uses real WASD to approach/retreat/strafe, changes direction when stuck, and does not modify the world. pi actually read full-map, wall-breaking and victory screenshots. Wall counts are global, including enemy destruction credited to the player; they are not all player-made. Score is 400 for kills + 500 for clearing + 5×walls destroyed.

Raw three-game JSON (historical local file; not published with this report) · Original playtest script (historical local file; not published with this report) · [pi playtest record](https://github.com/leoli-dev/llm-test-2026-10-20-game-tank-battle/tree/main/game) · [pi self-review](https://github.com/leoli-dev/llm-test-2026-10-20-game-tank-battle/tree/main/game). Self-review is the evaluated model's statement, rather than a substitute for supervised acceptance.

All three initial games won with 80HP remaining, showing a shift from difficult base defense to very easy short rounds. State-assisted aiming has a major effect. Winning every game does not represent human win rates or establish mature difficulty progression or tactical depth.

Later regressions reuse the same strategy and map with real inputs and are not independent human samples. Their repeated execution also counts toward total duration. Regression 1 raw record (historical local file; not published with this report), regression 2 raw record (historical local file; not published with this report).

## 3. Independent verification and evidence limits

A natural game on the final maze before the tap-firing repair took approximately 11.41 seconds: 4 kills, 27 shots, 8 enemy hits, 1 player hit, 90HP/2 lives and 925 points. A post-repair game took approximately 11.26 seconds: 4 kills, 27 shots, no player hits, 100HP/2 lives and 935 points. Neither changed state or produced pageerrors. The latter remained over/0 enemies after waiting; real UI entry of OBS_R3 retained the victory record after reload.

Population validation goes beyond a hardcoded toSpawn=0: it records the initial 4 enemy object IDs, verifies later live IDs are subsets of that initial set, and samples alive+kills=4 with no additions. Pursuit observation without firing uses real movement, changing target cells with the player and causing actual damage. Walls block some planned movements, so planned routes are not claimed to have been fully traversed. Every enemy turn and long-term obstacle-avoidance case was not exhaustively tested.

| Check | Observed result | Limits and raw evidence |
|---|---|---|
| Natural clear / no reinforcements / leaderboard | Final logic: 4 kills; waiting retains victory and 0 enemies; saved result survives reload | natural-final (historical local file; not published with this report), real keyboard/mouse with read-only state assistance |
| Pursue and damage player | 4 enemies initially; targets follow movement; 20 hits exhaust two lives | pursuit-observer (historical local file; not published with this report), no firing or freezing; not a win-rate sample |
| Walls block tanks/shells; passage after destruction | Blocked at x14.85; first shot leaves wall HP1/enemy 24; second destroys wall/enemy still 24; third leaves enemy 12; fourth destroys it; then moves to x21.85 | wall-fixture (historical local file; not published with this report), explicitly freezes AI and positions both sides; brick/HP unchanged; not natural combat |
| Pause/resume/restart | Paused W/Space changes neither position nor shot count; resume moves z23.55→18.65; restart has 4 enemies, 2 lives, full HP and zero score | controls (historical local file; not published with this report), AI frozen to isolate flow; not a natural game |
| Audio/mute | Real click unlocks under normal autoplay restrictions; context running, music running, RMS peak 0.02785 | Same controls; actual signal rather than subjective sound-quality score |
| Textures/shadows | Texture instances and main-light shadows present; images show brick, metal, camouflage and ground textures | Full-map view and scene traversal; texture instances are not unique-asset counts or art quality |
| Tap-firing repair | Before repair, three 70ms taps separated by 1 second fire only 1 shell; afterward 1→2→3 shells | Before (historical local file; not published with this report) / after (historical local file; not published with this report), real input with AI frozen only to isolate checks |
| Page/resources | Final menu/full-map/pause captures have no page errors or failed requests | capture (historical local file; not published with this report) |

![Final natural victory screen](../../assets/figures/209a31fc50e0-natural-final-final.png)

## 4. Process, errors and supervision

| Toronto time | Event |
|---|---|
| 09:58 | Same session receives R3 user feedback; telemetry resumes |
| 10:01–10:03 | Old-version idle observation: player full HP while enemies destroy base; finite-elimination plan written |
| 10:11–10:15 | First map changes; first context compaction |
| 10:18–10:24 | Combat/AI/UI changes and build; independent checks confirm fixed 4 enemies and real pursuit |
| 10:27–10:41 | Four-gate map still misses maze requirements; wrong turn criterion and prolonged paper reasoning |
| 10:46–10:54 | Generator, forgotten-node-carving bug, candidate filtering and freezing a true corridor map |
| 10:54–11:03 | Independent natural clear, pursuit and wall checks; second compaction; tap-firing repair |
| 11:09–11:19 | Repeated pi playtest-precondition failures; key-release/array checks repaired; formal three games all won |
| 11:22–11:28 | Regression failure, masked exit, rewritten smoke test and another timeout, then complete pass; repeated natural regressions retained |
| From 11:30 | pi updates instructions/playtest/self-review; supervisor compiles report and archives versions |

Approximately 13 minutes elapsed from the initial prompt to the first game-source edit. The first request took approximately 201 seconds, generating 5433 tokens, including 5283 reasoning tokens. Fast token generation does not imply fast engineering completion.

Substantive issues included failed exact-text replacements; cat -A unsupported on macOS; await inside a non-async callback causing syntax errors; tests in /tmp failing to resolve playwright, then repeating that mistake; an intermediate map spawning the player inside steel; an inconsistent map pasted from memory, which pi found and corrected; a turn criterion counting straight paths as turns; wrong hand-calculated expected results; a generator forgetting to carve a new node while first patching the outer ring; tap cooldown decrementing only while held; a test key-release helper still sending keydown; and a wait comparing the enemy array to numeric 4, which never succeeds.

pi independently repaired some syntax, projection and paste errors, but key requirement deviations, the generator's root cause, tap firing and criteria repeatedly depended on textual feedback. Repeated head/tail/grep/echo can mask shell failures, so tool isError counts do not equal total errors. Original FAIL/EXIT=1 records remain; an outer exit 0 cannot convert them into passes.

The final production build exits 0. test:all contains maze-check, smoke, tap, flow and play; the final run exits 0 with 36 PASS lines and three natural victories. Earlier full-suite failures masked as 0, and a rewritten smoke test timing out after 15 seconds following a pass, are all retained; the suite ultimately passes again. Repeated regression is not new gameplay functionality. Final full log (historical local file; not published with this report). pi's flow directly removes enemies to trigger settlement during lifecycle testing; that is a fixture rather than a natural victory.

Headless startup repeatedly had non-advancing time or timeouts. Array checks, wait branches and argument positions are definite test bugs, rather than GPU/MLTF failures. Other timing differences lack an identified underlying cause. Repeated successful independent real input and the final three successful games establish that corrected tests work, not a common cause for every earlier pause. The rAF probe is not a formal game-FPS test. Regressions also failed fixed diagonal-motion/cell-crossing assertions; pi changed to an explicit route and observable positions without weakening the maze or changing the timestep.

| Prompt | Toronto time | Trigger |
|---|---|---|
| r3-hint-01 | 10:24:58 EDT | Independent pursuit works; avoid false stalled-frame diagnosis; full map still resembles four C shapes with a central straight corridor |
| r3-hint-02 | 10:32:40 EDT | Second map degenerates into four isolated long walls; natural 10.8s victory does not establish maze acceptance |
| r3-hint-03 | 10:39:39 EDT | maze-check counts straight paths as turns, risking false passes |
| r3-hint-04 | 10:44:20 EDT | Repeated textual coordinate/route reasoning stalls map progress; use programmatic validation |
| r3-hint-05 | 10:49:06 EDT | Generator fails to carve destination nodes, then misdiagnoses outer ring and adds ineffective patches |
| r3-hint-06 | 10:58:41 EDT | Three real short Space taps separated by 1 second still fire only 1 shell; cooldown decrements only while held |
| r3-hint-07 | 11:04:16 EDT | Independent tap-firing repair passed; pi's fixed-sleep clock stall risks misdiagnosing game logic |
| r3-hint-08 | 11:10:36 EDT | Natural-play preconditions time out; repeated Node sleep stalls; release helper still sends keydown |
| r3-hint-09 | 11:13:59 EDT | Repaired waiting runs only in fight; intro retains old polling and reproduces precondition timeout |
| r3-hint-10 | 11:17:22 EDT | waitForFunction compares enemies array to 4, never succeeding; model wrongly guesses GPU issue |
| r3-hint-11 | 11:24:10 EDT | Fixed diagonal-motion/goal smoke assertion fails and pipeline masks exit; avoid breaking the accepted maze for a test |
| r3-hint-12 | 11:32:26 EDT | PLAYTEST mixes regression values, old-map/final-maze independent results, wrong wall cell and unsupported timing attribution |

Self-review audit also found earlier screenshot scores/wall counts mixed into the last group, the old four-wall map's 10.8-second result mixed with the final maze's 11.41-second result, a false brick claim at (5,6), and unsupported certainty that startup pauses were environmental. After the last prompt, pi reread JSON/screenshots/map cells and corrected them, also independently replacing the “tap strategy” description with actual continuous fire. This report and frozen raw records determine final results; older historical DEVLOG misstatements must be checked against their corresponding supervised reports.

Documentation still requires caution: README describes 2HP bricks as cracking on the second shot and breaking on the third, and gives enemy cooldown as 1.5 seconds where basic-enemy configuration is 1.8 seconds. Its claimed 2.6rad/s is actually an interpolation tracking coefficient, not fixed angular velocity. Independent tests show cracking on the first shot and destruction on the second. README's “independently developed/tested/repaired” can refer only to the sole code author and must not erase 12 supervisory prompts. Self-review cites only indirect audio evidence; this report has separate RMS measurements. Development was not extended to correct every textual error; source and raw records remain authoritative. Frozen self-review audit (historical local file; not published with this report).

All original prompts (historical local file; not published with this report). Supervision supplies localization/method guidance, not game patches. Sending a prompt does not establish that every repair is caused solely by that prompt; pi's independent recoveries are recorded separately. A quoting-construction error in a supervisor report script was also repaired and belongs to supervision tooling rather than pi or engine errors.

## 5. Workstation configuration and throughput

API: **http://127.0.0.1:8083/v1**, model: **local/Qwen3.8-27B-MLTF-q8c**. The port was originally confirmed from the historical conversation “Update mlx-dspark and related model libraries” and local listening/authenticated endpoints; details are in Round 1. A local transparent proxy on 8085 saves request parameters and SSE statistics without changing sampling/content. Keys are read only from private configuration, and credential-bearing configuration is not a report attachment.

M5 Max: 18 CPU cores, 40 GPU cores and 128GiB unified memory. MLTF0.1.2, native Metal/Splash+DFlash2, q8c, W8A8 prefill/W8A16 decode verify, INT8 KV, SSD cache disabled. Configured budget 96GiB, governor approximately 95.25GiB, context 131072. pi1.3.0, medium; outbound temperature1/top_p0.95/top_k20, max_tokens adjusted to remaining context, up to 32768. Separate Chromium, without Google Chrome or an autoplay exemption.

| Metric | Round 1 | Round 2 | Round 3 |
|---|---|---|---|
| Completed requests | 66 | 186 | 125 |
| Output tokens (including reasoning) | 82,551 | 180,564 | 145,772 |
| reasoning token | 31,986 | 83,128 | 67,531 |
| Native decode token/s | 46.2 | 38.6 | 32.5 |
| Native prefill token/s | 474.1 | 457.0 | 387.8 |
| Request-metric decode token/s | 45.9 | 38.5 | 32.3 |
| Request-metric prefill token/s | 454.5 | 443.4 | 380.2 |
| Maximum actual prompt tokens | 106,076 | 114,445 | 114,775 |
| Request failures / cancellations | 0 / 0 | 0 / 0 | 0 / 0 |
| Metal / capacity failures / restarts | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |

Server TTFT this round has median **3.85s**, P95 **39.56s** and maximum **102.04s**; DFlash acceptance is **36.9%**. There are 5 newly encoded images and 58 embedding reuses. Requests carrying historical images are not new visual observations.

Native rates weight before/after cumulative-token and wall-time differences rather than averaging request t/s. Request rates come from completed SSE statistics and have separate timing boundaries. Outputs include reasoning, code, tool arguments, documentation and compaction summaries, rather than useful-code volume. Cumulative prompt accounting is 9,581,366, including 9,148,832 cached tokens and 432,534 uncached prefill tokens; not every prompt token is newly processed input.

Splitting requests into approximately equal consecutive thirds gives lifecycle-weighted decode of **32.00 / 28.90 / 38.18 token/s**. The three-round 46.2→38.6→32.5 decline and this round's fluctuations are actual observations. Output structure, context, cache, host load and swap are uncontrolled, without power/temperature evidence; **thermal throttling, memory leaks or a specific engine defect cannot be asserted as the cause**. There is no other-engine/quantization A/B comparison.

## 6. Long-context cost and CPU/GPU/memory changes

The round inherits approximately 88052 context tokens and is not a fresh session. There are **3 automatic compactions**, with **6 helper-generation requests, 16,775 output tokens and 13.26 minutes**. Prefix rebuilding after resumption adds subsequent prefill cost, excluded from these summary durations.

| Compaction | Estimated tokens before → after | Output tokens | Of these, reasoning | Helper generation duration |
|---|---|---|---|---|
| 1 | 122,811 → 29,999 | 5,339 | 1,145 | 4.51 min |
| 2 | 115,883 → 26,927 | 5,798 | 1,096 | 4.87 min |
| 3 | 115,224 → 26,807 | 5,638 | 1,160 | 3.88 min |

There are **1274** samples at approximately 5-second intervals, including about 12 seconds of baseline before the prompt and 50 seconds after pi finishes. CPU uses Mach interval-tick differences; GPU uses IORegistry device utilization. Both are system-wide, including browsers, pi, supervision, desktop and sampling. RSS, unified-memory allocation, wired memory, compression and swap have different accounting and must not be added.

| Metric | Minimum | Median | P95 | Maximum |
|---|---|---|---|---|
| System CPU | 4.49% | 8.91% | 14.76% | 31.48% |
| System GPU during inference | 0.00% | 99.00% | 100.00% | 100.00% |
| Engine allocation | 94.46 GiB | 95.13 GiB | 95.24 GiB | 95.25 GiB |
| Native engine RSS | 5.50 GiB | 22.66 GiB | 43.76 GiB | 44.75 GiB |
| System used swap | 10.80 GiB | 13.41 GiB | 14.12 GiB | 14.56 GiB |
| System wired | 6.44 GiB | 51.10 GiB | 54.68 GiB | 55.54 GiB |
| System compressor physical usage | 3.95 GiB | 29.58 GiB | 43.56 GiB | 47.87 GiB |
| Engine-estimated host available memory | 5.47 GiB | 9.01 GiB | 21.51 GiB | 36.84 GiB |

Engine allocation changes **95.114→95.111GiB**, with a sampled peak of **95.248GiB**. Cache is retained, so this is neither pure weight size nor cold-start memory. Pressure distribution is **{"normal": 995, "warning": 279}**; state-cache evictions increase by **252**, budget-reservation rejections by **13055**, and resource suspension/resumption is **0/0**. System swap changes from 11.00GiB to 11.77GiB with a higher intermediate peak, so it is not monotonic growth. Budget rejections are not the same number of request OOMs; all requests continue to completion.

![Round 3 resource and generation-throughput curves](../../assets/figures/88ebc0321454-performance.png)

## 7. Capability and stability judgments

**Implementation: capable of a small playable prototype under supervision, with weak requirement judgment and self-checking.** Pursuit, finite enemies, real wall destruction, procedural textures, audio and state flow all work. However, maze attempts repeatedly regress to isolated walls, and the model insufficiently distinguishes code existence, script PASS and actual enjoyable gameplay. A simple array comparison causes repeated debugging, and a generator that forgets to carve nodes first patches the outer ring, showing reliance on guesses rather than runtime evidence. 12 prompts without taking over code still do not establish full autonomy.

**Vision and playtesting: operational paths, limited evaluation calibration.** pi reads actual images and completes three keyboard/mouse games, with aiming based on state projection. One map, identical enemies, small samples and short clears do not establish reliable judgments of enjoyment. Supervision must judge the actual full-map maze rather than accepting counts as a substitute for experience.

**Engine: stable availability this round, with cautious conclusions about headroom and throughput.** Three rounds total **377 requests and 408,887 output tokens**, with no observed request, Metal or capacity failures or transport restarts in any round. Work resumes after long-session compaction and image requests function. However, near-budget memory, warning pressure, cache evictions, budget checks, higher swap peaks and lower throughput mean zero errors do not establish ample headroom or constant speed.

Remaining limits: one map, 4 identical enemies, player points awarded for enemy brick destruction, repetitive procedural ground and limited geometry/environment detail. Obstacle avoidance, formal game FPS/frame time, concurrent inference, sleep/resume, cold starts and context limits are not exhaustively tested. There is no other-model/engine comparison. The delivery is a finite, completable maze-tank prototype with pursuing enemies; functional coverage no longer implies a mature complete game.

## 8. Reproduction and references

```sh
pi --provider mltf --model local/Qwen3.8-27B-MLTF-q8c --thinking medium
# API base URL: http://127.0.0.1:8083/v1
cd $HOME/Code/qwen3.8-tests/mltf-27b-pi-tank-battle-2026-10-20/game
npm run dev -- --host 127.0.0.1 --port 5179
```

WASD moves in world directions; mouse aims; left click/Space fires; P/Esc pauses/resumes; M mutes; restart button or R after settlement. The leaderboard is local to the current browser. At completion, pi's supervision proxy and sampling stop, while existing engine/game services remain.

Round 1 code archive (historical local file; not published with this report) · Round 2 code archive (historical local file; not published with this report) · Round 3 code archive (historical local file; not published with this report) · Final-file SHA256 (historical local file; not published with this report). Historical report game paths may now refer to newer versions; corresponding archives determine old implementations.

Initial task (historical local file; not published with this report) · Supervision definitions (historical local file; not published with this report) · Full pi events (historical local file; not published with this report) · Timeline (historical local file; not published with this report) · Request statistics (historical local file; not published with this report) · Host/engine sampling (historical local file; not published with this report) · CPU interval sampling (historical local file; not published with this report) · Engine start snapshot (historical local file; not published with this report) · Engine end snapshot (historical local file; not published with this report) · New engine logs (historical local file; not published with this report) · Summary (historical local file; not published with this report) · Per-request metrics (historical local file; not published with this report) · Process audit (historical local file; not published with this report) · pi's final response (historical local file; not published with this report).

The supervisor compiled this report from raw logs, source reading and independent Chromium checks. Independent evidence and raw results take precedence over untested claims or judgment errors in pi's own statements.
