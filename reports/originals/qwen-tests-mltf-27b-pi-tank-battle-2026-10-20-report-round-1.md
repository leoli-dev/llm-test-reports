# Local Qwen3.8-27B-MLTF-q8c × pi: 3D Tank Battle Supervised Experiment Report

[English](qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-1.md) | [简体中文](qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-1_CN.md)

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

Experiment date: 2026-10-20 (America/Toronto). pi development start: 2026-10-20 00:38:17 EDT; completion: 2026-10-20 01:24:15 EDT. From issuing the initial prompt to pi completion, approximately **46.0 minutes**.

## Conclusion

This configuration completed a 3D tank battle prototype that is actually playable in a browser. The game implementation, fixes, test scripts, and self-evaluation were all written by the local model via pi; the supervisor did not modify the game source code. The supervisor issued a total of **3 text prompts**: one to correct the browser acceptance environment, and two to point out actual gameplay or state defects. Therefore, this demonstrates "completion under limited supervision" and cannot be recorded as a fully unsupervised one-shot success.

Under this continuous engineering load, the engine completed **66 generation requests**, with a cumulative output of **82,551 tokens**; native decode weighted throughput was approximately **46.2 token/s**, and native prefill was approximately **474.1 token/s**. Request failures, cancellations, Metal failures, capacity failures, and engine restarts for this increment were all **0**. However, memory pressure was warning multiple times, with **3074 internal reservation rejections and 60 state cache evictions** recorded; system-wide swap increased from approximately 5.6 to 11.4 GiB; zero request failures should not be interpreted as an absence of memory pressure.

The model's main weaknesses are debugging and verification judgment: coordinate space and asynchronous state defects required supervisory prompts; some tests printed PASS without valid assertions. It also demonstrated effective self-checking capabilities: it autonomously corrected the issue of missing enemy refresh in the victory test, and discovered a title error caused by duplicate DOM IDs through screenshots.

## 1. Deliverables and Invocation Method

Game address: [http://127.0.0.1:5179](http://127.0.0.1:5179). Project directory: `$HOME/Code/qwen3.8-tests/mltf-27b-pi-tank-battle-2026-10-20/game`.

```sh
cd $HOME/Code/qwen3.8-tests/mltf-27b-pi-tank-battle-2026-10-20/game
npm install
npm run dev -- --host 127.0.0.1 --port 5179
```

Controls: W/S for forward/backward, A/D for turning, mouse for aiming, left click or spacebar to shoot, P/Esc to pause/resume, M to mute. The leaderboard is saved in the current browser's localStorage.

[Startup and operation instructions written by pi](https://github.com/leoli-dev/llm-test-2026-10-20-game-tank-battle/tree/main/game) · [pi self-evaluation](https://github.com/leoli-dev/llm-test-2026-10-20-game-tank-battle/tree/main/game) · pi final response (historical local file, not published with this report).

Actual local MLTF entry point and client commands:

```sh
# OpenAI-compatible API
# base URL: http://127.0.0.1:8083/v1
# model ID: local/Qwen3.8-27B-MLTF-q8c
pi --provider mltf --model local/Qwen3.8-27B-MLTF-q8c --thinking medium

~/local_llms/mltf/status.sh
```

Port and usage were located from the historical session "Update mlx-dspark and related model libraries" (`01a15498-540f-7061-ace8-14d634ac10db`), then cross-verified using the local README, pi configuration, listening ports, runtime parameters, and authenticated `/status`. Model authentication followed the existing local configuration; the report does not include authentication headers or keys.

## 2. Experimental Setup and Attribution Boundaries

| Item | Actual Setup |
|---|---|
| Host | Apple M5 Max; 18 CPU cores; 40 GPU cores; 128 GiB unified memory |
| System | Engine reported macOS 27.0.1 |
| Inference Engine | MLTF 0.1.2; Native Metal / Splash; DFlash2 |
| Quantization & Operators | q8c; prefill W8A8; decode/verify W8A16; INT8 KV |
| Context Limit | Service actual limit 131072 tokens |
| Memory Budget | Configured 96 GiB; runtime governor limit 95.25 GiB |
| Storage Cache | SSD cache not enabled; prefix and state caches enabled |
| pi | 1.3.0; RPC independent session; only built-in read/bash/edit/write; no other models or coding sub-agents invoked |
| Thinking & Sampling | medium; temperature=1.0; top_p=0.95; top_k=20; max_tokens limit 32768, later reduced to 20938 based on context remainder; confirmed by actual outbound requests |
| Browser | Independent Chromium; default autoplay restrictions after correction; supervisor tested the entire process using `/Applications/Chromium.app` |
| Game Technology | Three.js + Vite + Native JS + WebAudio + localStorage |

The initial directory was empty. The original task required a complete core loop, environment, enemies, health, GUI, sound effects, music, leaderboard, start/pause/resume/restart, as well as actual browser operation and screenshot self-checks. Supervision code and logs are located in `supervision/`, and the game is located in `game/`.

Before startup, there was already a running hot engine and a large amount of historical cache: engine allocation was **81.73 GiB**. No restart or cache clearing was performed. The native counts in this report use the increment from end minus start to avoid mixing in previous requests. The cumulative request increment and the number of proxy requests for this session can be cross-checked; this was not a cold start or pure empty cache test.

Only this pi's requests went through `127.0.0.1:8085` transparent local forwarding, ultimately still processed by the same model on 8083. The proxy records metadata and server-side statistics, without altering sampling or model content. The host sampled `/status`, CPU, GPU, process RSS, vm_stat, and swap every approximately 5 seconds. GPU and CPU are system-wide metrics, including the browser, supervision sampling, and other desktop applications; not all changes can be attributed to the model.

## 3. Game Acceptance Results

| Feature | Actual Evidence | Conclusion & Limitations |
|---|---|---|
| 3D Environment, Tanks & GUI | Chromium screenshots; ground, trees, crates, cover, lighting, friendly/enemy tanks, HUD, minimap | Usable, low-poly night battle prototype; art is simple and dark |
| Movement, Aiming, Shooting | Real keyboard/mouse input, position and firing count; direction re-test after turning | Usable; coordinate defects fixed by pi after supervisory prompt |
| Enemies, Damage, Kills | Supervisor natural combat test: 4 shots, 3 hits, 1 kill, 100 points, then naturally destroyed by enemy | Actual core combat established; enemy pathfinding and difficulty not systematically evaluated |
| Pause, Resume, Restart | Real UI; position/health unchanged during pause; reset on restart; wave clear boundary re-test | Basic and discovered boundaries passed; wave delay defect fixed after prompt |
| Sound Effects & Music | Clicked start under default browser policy; AudioContext=running; music timer running; main output RMS peak 0.0962 | Confirmed non-zero audio signal; no subjective listening evaluation performed |
| Death, Score Saving, Persistence | After natural death, UI saved OBSERVER score, retained after refresh, reset on new game | Passed supervisor test; local leaderboard, not online leaderboard |
| Five Waves & Victory | pi's corrected test actually achieved 40 kills, 7000 points, victory entered leaderboard; supervisor separately verified victory branch with deterministic fixtures | Assisted completion passed; freezing/positioning involved, not equivalent to natural completion at default difficulty |
| Title & Visual Check | pi read menu, battle, settlement, pause screenshots, autonomously discovered duplicate ID and fixed | Actual visual feedback loop present |
| Window Changes | 900-pixel wide window screenshot and continued operation | Desktop scaling usable; mobile touch not verified |
| Page Exceptions | Supervisor final natural play: pageerror=0, failed resources=0; final smoke console errors=0 | No errors seen in these specific tests, not a guarantee for all paths |

pi's main E2E final record was **28/28, console/page errors 0**, the script currently has 28 ok calls; additionally, there are wave boundary, enemy engagement, full spawn victory, and title tests. These PASS counts cannot be directly taken as coverage: some items have weak assertions, see Section 5 for details.

Supervisor natural play browser frame interval samples: median 16.70 ms, P95 16.70 ms, approximately 57.0 FPS. Samples from short-time headless Chromium, 1440×900, current simple scene, for operational status reference only.

![Actual battle screenshot](../../assets/figures/d9d2431645d8-battle-fired.png)

![Actual score retained after refresh](../../assets/figures/0e264497754d-leaderboard-reloaded.png)

## 4. Development Process and Supervisory Intervention

| Toronto Time | Milestone |
|---|---|
| 00:38:17 | Initial task issued; started from empty directory |
| 00:42:43 | First batch of menu and GUI files written to disk |
| Around 00:45 | Scene, tanks, procedural audio, leaderboard modules completed |
| 00:49:04 | Main game loop written to disk |
| 00:50 | Initial startup missing npm dev script; pi self-corrected and started service |
| 00:53–01:00 | First round of E2E and aiming diagnostics; fixed input/browser API errors, multiple kill verification failures |
| 01:02 | After directional prompt, pi corrected turret world/local rotation; E2E 27/27 |
| 01:03–01:05 | Read screenshots; added engagement and victory tests; supervisor reproduced wave clear pause/restart boundary issue |
| 01:06–01:08 | pi changed to in-game loop timing, boundary regression and supervisor re-test passed |
| 01:09–01:14 | Initial victory test only 5 kills; pi autonomously discovered spawn count issue and corrected, re-run achieved 40 kills/7000 points |
| From 01:15 | Screenshot self-check found pause/settlement title duplicate ID, autonomously fixed and verified |

Supervisory interventions were all text suggestions, no code patches:

| Count | Toronto Time | Reason |
|---|---|---|
| 1 | 00:53:32 | Test script selected cached executable with Chrome for Testing name, and disabled autoplay restrictions, unable to represent default browser audio acceptance. |
| 2 | 01:00:50 | Three rounds of kill verification failed; independent real key press reproduction showed turret world direction and trajectory differed by approximately 76 degrees after turning, pi still mainly adjusted test wait/target. |
| 3 | 01:05:21 | Independent boundary fixture + real UI reproduced stopping enemy spawn after wave clear pause, old delay callback polluting new game. |

The 1st intervention only constrained the verification environment. The 2nd provided the phenomenon of approximately 76° deviation between turret and trajectory after turning, suggesting to check local/world coordinate consistency. The 3rd provided reproduction of pause and restart after wave clear, suggesting to check pause semantics and lifecycle of delay tasks. Fix solutions, implementation, and new tests were all completed by pi. It cannot be determined from this experiment whether it would have eventually solved it on its own without prompts.

## 5. Errors and Model Behavior Analysis

| Issue | Actual Performance & Handling | Capability Judgment |
|---|---|---|
| Initial scene boundary construction confusion | pi discovered and simplified boundary wall geometry after writing | Has active read-back and correction capability |
| Missing startup script | npm run dev failed; successfully added scripts after self-correction | Can recover from routine engineering errors |
| Test tool details | Extremely short space events missed by game frame polling; lowercase escape not accepted by Playwright; launch cannot directly pass user-data-dir | Unstable with browser test API and input timing, but can correct based on errors |
| Browser/audio acceptance distortion | Initially used Chrome for Testing cache path and disabled autoplay restrictions; corrected after supervisory prompt | Insufficient initial adherence to preferences and acceptance criteria |
| Turret local/world coordinate mixing | Straight line could hit; direction differed by approximately 76° after turning approximately 76°; three rounds of kill verification failed, mainly adjusted wait and target | Key 3D debugging required supervisory direction; could fully fix player and enemy after prompt |
| Wave clear delay state defect | Swallowed progression callback after pause; old callback polluted new game | Insufficient consideration of cross-state asynchronous lifecycle; changed to loop timing and regression after prompt |
| Underestimated victory test scope | Initial auxiliary test zeroed toSpawn, called five waves complete with only 5 kills; subsequently autonomously corrected to full 40 kills | Self-review can correct errors, but initial test criteria easily too broad |
| Duplicate DOM ID | Pause and settlement shared over-title; autonomously discovered, fixed, and added title verification after screenshot check | Visual capability can support specific UI debugging, not just generating screenshots |
| Invalid PASS | One E2E turn/backward check directly asserted true; AI test recorded 0.0m movement still printed PASS with warning; some console/title failures did not directly determine process exit code | Test quality still needs review, PASS count insufficient to prove functional correctness |
| Random failure in final full regression | One round showed 26/28: actual enemy extra hit made hitsOnPlayer no longer equal to 1, HUD rounded value compared with original decimal health; pi autonomously changed to baseline increment and rounded value assertion then re-ran | Can fix common test uncertainty, but earlier pass does not guarantee stable reproduction |
| Shell return code masked | Multiple uses of node … piped to tail; tool layer could report exit=0, but body had FAIL or exception | Cannot rely solely on tool isError for failure statistics; this report manually verified output body |

No dead loop of continuously repeating the same command with zero progress was found. Longer reasoning occurred, as well as several rounds of aiming diagnostics deviating from the root cause; these two need to be separated: long reasoning still produced new content, while debugging stagnation was identified by repeated failures and incorrect assumptions.

The game structure is complete, module division is basically clear; core game.js still concentrates many responsibilities. The final visual is a war zone composed of simple geometry, UI style is consistent; there is no sufficient evidence of natural completion, long-term balance, enemy escape strategies, or subjective audio quality. Evaluated as a playable prototype that can be further developed, not yet sufficient as a formal game delivery without review.

The self-evaluation document generally listed limitations such as sound, assisted completion, and real death chain; the main script item count was mistakenly written as 29, pi later autonomously corrected it to the actual 28 items. The development log for the coordinate issue still does not fully mark the role of supervisory prompts. The engineering process and supervisory help are based on the timestamps and original records in this report.

## 6. Inference Performance

| Metric | Current Result |
|---|---|
| Completed HTTP generation requests | 66; status code distribution {"200": 66} |
| Total output tokens / reasoning tokens | 82,551 / 31,986 (38.7%) |
| Cumulative input tokens (including repeated context) | 4,202,375 |
| Cache hit input tokens / actual new prefill tokens | 4,095,232 / 107,143 |
| Input token cache ratio | 97.5% |
| Native prefill throughput | **474.1 token/s** |
| Native decode throughput | **46.2 token/s** |
| Request lifecycle decode weighted speed | 45.9 token/s |
| Single request decode median / P95 / range | 47.2 / 75.1 / 29.1–92.6 token/s |
| Request input processing interval weighted speed | 454.5 token/s |
| Server-side TTFT median / P95 / max | 2.76 / 14.34 / 19.42 seconds |
| Measured max single input context | 106,076 tokens; service limit 131072, no full 128K limit stress test performed this time |
| Cumulative HTTP request wait time | 35.3 minutes; entire pi work approximately 46.0 minutes |
| DFlash draft acceptance rate | 38.2%; accepted / drafted = 60,051 / 157,038 |
| Prefix lookup hit / miss | 65 / 1 |
| New image encoding / image embedding reuse | 8 / 0 |
| Requests carrying images | 26; historical images can be repeatedly carried in subsequent requests, not equal to unique screenshot count |

**Statistical Criteria.** Native throughput takes the current token increment from `/status.metrics`, divided by the corresponding cumulative native wall_ms increment; it is the engine work interval rate under serial execution load. Request lifecycle speed takes server-side `timings/metrics` for each request, weighted by total tokens divided by total interval duration, not arithmetic mean of tok/s. The server excludes the impact of the first speculative output block on the stream interval.

The numerator of `prompt_per_second` is the new tokens actually needing processing, excluding cached tokens; its timing includes work from execution start to first output, so it cannot be directly compared with pure large matrix prefill peak. TTFT uses server-side request_latency; proxy's first_delta_s may only correspond to SSE role/empty content events, this report did not treat it as first token latency.

The first current prefix miss request processed 2684 input tokens, server-side interval approximately 3.41 seconds, approximately 787 token/s; this only represents prefix miss on a hot engine, not cold start loading model from disk. In long engineering, most historical context reuses cache, effectively reducing input wait per round.

Grouped by request sequence, the first 22 requests' lifecycle decode weighted was approximately **50.4 token/s**, the last 22 requests approximately **40.2 token/s**. The latter group's input was approximately 83,470–106,076 tokens, overall approximately 20.1% slower than the former group. Context, output content, image history, and cache pressure all changed simultaneously; this decrease cannot be solely attributed to long context or thermal throttling.

The five longest requests:

| Request No. | Completion Time Toronto | Request Duration | Output Tokens | Reasoning Tokens | Decode token/s |
|---|---|---|---|---|---|
| 4 | 00:42:43 | 225.1 s | 10,998 | 6,850 | 49.0 |
| 11 | 00:49:04 | 202.9 s | 10,960 | 2,033 | 54.5 |
| 16 | 00:52:45 | 124.4 s | 5,076 | 2,014 | 41.2 |
| 41 | 01:04:56 | 107.5 s | 3,551 | 2,944 | 35.9 |
| 58 | 01:21:02 | 75.2 s | 2,023 | 88 | 29.3 |

Among them, an early round request used approximately 225 seconds to output 10998 tokens, including 6850 reasoning tokens, belonging to long planning plus file generation, finally executed tools normally. Long thinking itself cannot be judged as engine hang.

## 7. CPU, GPU, Memory Changes

A total of **562** host/engine samples were collected. Single-round sampling duration median was approximately 0.92 seconds; sampling program and browser generated additional overhead, no monitoring on/off control was performed. CPU tick interval sampling was added a few minutes after development started; the initial phase retained top raw data, cannot fabricate an early CPU baseline with the same criteria.

| Metric | Minimum | Median | P95 | Maximum |
|---|---|---|---|---|
| System GPU / inference-active samples | 0.0% | 99.0% | 100.0% | 100.0% |
| System CPU / interval tick differences | 3.3% | 4.8% | 11.2% | 18.8% |
| Engine allocated memory | 81.7 GiB | 94.4 GiB | 95.2 GiB | 95.2 GiB |
| Native engine process RSS | 9.1 GiB | 14.5 GiB | 27.3 GiB | 27.7 GiB |
| System wired memory / vm_stat | 6.8 GiB | 48.7 GiB | 49.9 GiB | 51.0 GiB |
| System physical compressor use / vm_stat | 21.5 GiB | 43.4 GiB | 46.3 GiB | 50.0 GiB |
| Engine-estimated host available memory | 7.0 GiB | 9.1 GiB | 36.9 GiB | 38.0 GiB |
| System used swap | 5.5 GiB | 10.7 GiB | 11.5 GiB | 11.5 GiB |

Engine allocation rose from **81.73 GiB** to **94.41 GiB**, a net change of **12.69 GiB**. The 5-second sampled peak was **95.21 GiB**; the engine reported a new peak of **95.248 GiB** during this run. State-cache accounting rose from 39.81 to 52.78 GiB, and KV resident backing from 11.30 to 11.93 GiB. There were **60** state-cache evictions, showing reclamation near the budget.

Memory-pressure sample counts: **normal=202, warning=360**. These count sampled points, not exact pressure residence time. Reservation denials increased by 3074; resource suspends/resumes increased by 0/0.

Internal reservation denials count MemoryGovernor budget checks, separately from HTTP request failures. They show constrained memory-growth requests. This run also observed cache eviction and completion of all requests; the 3074 denials must not be counted as that many OOMs. Pressure returned to normal in the final snapshot, while allocation and swap remained above their starting levels.

Allocation, process RSS, GPU-driver statistics, compressed memory and swap use different accounting systems. They cannot be added on a unified-memory machine. Engine allocation above 90 GiB does not mean weights alone occupy above 90 GiB: historical caches and growing state/KV are included. One experiment cannot establish or rule out a leak. This run observed reclamation within budget and continued request completion, with no observed OOM.

Power and temperature were not captured: powermetrics through passwordless sudo required a system password, and privileges were not elevated. No claims of low power, absence of thermal throttling or stable long-duration cooling follow.

![Resource and output-speed curves for this run](../../assets/figures/fad73423809e-performance.png)

## 8. Separate assessments of model and engine

**Model engineering capability: suitable for moderately scoped prototypes with supervision and independent acceptance.** It turns broad requirements into runnable modules, installs dependencies, recovers routine startup errors, writes real browser-input scripts and, after hints, fixes deeper 3D transformations and state-lifecycle problems. Independently discovering missing enemy spawns in the victory test and duplicate IDs through screenshots demonstrates actual self-checking. Weaknesses remain in root-cause localization efficiency, input/browser API details, and rigor of test assertions and acceptance claims.

**Vision: the path works and produced a concrete fix.** Evidence includes screenshot read calls, actual image-bearing requests and server image-encoding/reuse deltas. Screenshot inspection also found the final title defect. This does not comprehensively establish spatial understanding, aesthetic optimization or detection of all visual defects.

**Inference engine: passed this sustained workload, with effective cache reuse and budget reclamation.** Completed-request and failure counts cross-check; Metal remained healthy without transport recovery or restart. Throughput was usable with real tool/thinking/code/image context. The environment already had high resident allocation and recurring warning pressure; speed must be considered alongside remaining memory.

**Comparisons this run cannot answer.** No other model or engine was rerun with the same prompt, cache conditions and hardware load. This cannot establish superiority to oMLX, MTPLX, cloud models or other quantizations. Coverage also excludes concurrency, multi-hour sustained stress, service cold start, full 128K, system sleep recovery, engine-restart recovery, natural completion at every difficulty and long-term leaderboard data.

## 9. Review and original evidence

Supervisor scripts: supervisor.py (historical local file; not published with this report)、analyze.py (historical local file; not published with this report)、observer-smoke.mjs (historical local file; not published with this report)、observer-play.mjs (historical local file; not published with this report)、observer-aim.mjs (historical local file; not published with this report)、observer-boundary.mjs (historical local file; not published with this report)。All observer scripts are in the supervision directory; the final file manifest can verify the delivery version.

Natural-play evidence: play-results.json (historical local file; not published with this report)；Basic/audio evidence: smoke-results.json (historical local file; not published with this report)；Aiming defect before/after repair: aim-results-before-fix.json (historical local file; not published with this report) / aim-results.json (historical local file; not published with this report)；Wave-boundary defect before/after repair: boundary-results-before-fix.json (historical local file; not published with this report) / boundary-results.json (historical local file; not published with this report)。

- Original complete task prompt (historical local file; not published with this report)
- Times, reasons and original wording of the 3 supervisor interventions (historical local file; not published with this report)
- All RPC instructions sent to pi (historical local file; not published with this report)
- Timestamped development and tool timeline (historical local file; not published with this report)
- Complete original pi event stream (historical local file; not published with this report)
- HTTP request metadata, usage, timings and metrics (historical local file; not published with this report)
- Per-request performance table (historical local file; not published with this report)
- Raw engine/host data sampled every 5 seconds (historical local file; not published with this report)
- CPU time counters and interval utilization (historical local file; not published with this report)
- Engine baseline snapshot (historical local file; not published with this report)
- Engine final snapshot (historical local file; not published with this report)
- Engine logs added in this run (historical local file; not published with this report)
- Recomputable aggregate statistics (historical local file; not published with this report)
- Final game-file SHA-256 manifest (historical local file; not published with this report)
- Method and environment sources (historical local file; not published with this report)

The supervisor compiled this report from original counters, actual outputs, source reading and independent browser tests. Pi self-reports are saved separately; self-report, fixture verification and natural play evidence are explicitly distinguished.
