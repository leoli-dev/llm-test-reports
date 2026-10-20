---
type: Note
title: "Neon Bastion 55-task rerun — A01–D05 progress with measured time/token/tps"
status: current
description: "Rerun Neon Bastion from scratch using 55 finely decomposed task specifications; measured per-task duration, token count, and mtplx inference speed for the first 16 tasks (A01–D05); includes the quantitative conclusion that \"wall-clock time ≈ output tokens / decode rate\"."
tags: [neon-bastion, mtplx, pi, benchmark, throughput, task-decomposition]
timestamp: 2026-09-07T22:40:00Z
---

# Neon Bastion 55-task rerun — A01–D05

[English](devlog-projects-qwen3-8-test-notes-neon-bastion-55task-rerun-2026-09-07.md) | [简体中文](devlog-projects-qwen3-8-test-notes-neon-bastion-55task-rerun-2026-09-07_CN.md)

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

The first seven rounds of Neon Bastion (see [Seven-Round Summary](devlog-projects-qwen3-8-test-notes-neon-bastion-final-summary-2026-09-04.md)) used coarse-grained task specifications.
This round splits the same specification into **55 self-contained task briefs** (`~/Code/qwen3.8-tests/test-prompts/neon-bastion/`, with `INDEX.md`),
reruns from scratch in a **completely empty directory**, to verify whether OPS-09 (historical local files, not published with this report) "one self-contained small task at a time" still holds at a finer granularity.

- Deployment: MTPLX `mtplx-qwen38-27b-optimized-speed`, 131K context, medium
- Executor: pi v0.85.1, running in the `qwen3.8-test-pi` tab (pane 2) of the zellij `main` session
- Working directory: `~/Code/qwen3.8-tests/mtplx-27B-optimized-speed-with-pi-neon-bastion`
- Orchestration: This session feeds directly via `zellij action write-chars -p 2`, clearing context with `/new` each round,
  sampling every 12s / determining idle after 5 consecutive no-spinner instances
- **Progress this round: 16/55 (A01–D05), user actively stopped before E01**

## Delivery Facts

16 commits, 46 files, **+11,666 / −2**. Final state `npm run build` exit code 0, **unit tests 265 (15 files)**, E2E 6 (2 files).
The number of unit tests and build exit code were **independently re-run and verified** by this session at the end of the paragraph (four checkpoints at A04/B04/C03/D05), not merely relying on pi's self-report;
the 6/6 for E2E are only pi's self-report, not independently re-run.

## Per-Task Duration and Tokens

Time is **commit-to-commit**, including approximately 1 minutes of idle detection delay and `/new`+ feeding intervals, which is 1–2 minutes higher than pure model time.
Tokens are single readings captured from the pi status bar after each round's TASK-DONE (`/new` resets each round, so this is the session usage for that task),
**not authoritative billing figures**.

| Task | Completed | Duration | ↑ | ↓ | R | CH | Final ctx |
|---|---|---|---|---|---|---|---|
| A01 Project Brief | 12:14:34 | ~5m34s | 6.3k | 2.2k | 34k | 99.0% | 6.5% |
| A02 Scaffolding and Build Gate | 12:20:25 | 5m51s | 8.9k | 12k | 396k | 98.7% | 17.1% |
| A03 Types and CONFIG | 12:30:32 | 10m07s | 9.3k | 23k | 356k | 99.4% | 26.4% |
| A04 Seeded RNG | 12:39:53 | 9m21s | 14k | 19k | 779k | 99.7% | 26.5% |
| B01 Map Data Model | 13:00:28 | 20m35s | 24k | 42k | 1.2M | 99.7% | 47.0% |
| B02 Geometric Queries | 13:19:23 | 18m55s | 40k | 33k | 634k | 99.5% | 43.2% |
| B03 Navigation Graph | 13:56:37 | 37m14s | 85k | 29k | 2.1M | 99.8% | 64.6% |
| B04 Four-Layout Seed Generation | 14:30:51 | 34m14s | 72k | 56k | 1.9M | 99.4% | 70.7% |
| C01 Collision Movement | 15:28:24 | **57m33s** | 188k | 53k | 3.6M | 99.8% | 47.7% |
| C02 Four-Directional Self-Consistent Input | 15:46:17 | 17m53s | 35k | 36k | 1.5M | 99.8% | 55.1% |
| C03 First-Person Camera | 16:15:12 | 28m55s | 56k | 54k | 2.4M | 99.9% | 63.8% |
| D01 Weapon Spread | 16:22:42 | 7m30s | 25k | 15k | 655k | 100.0% | 28.0% |
| D02 Ballistic Projectiles | 16:45:21 | 22m39s | 31k | 51k | 1.5M | 100.0% | 60.1% |
| D03 Hit Detection | 17:04:44 | 19m23s | 36k | 37k | 1.7M | 99.0% | 51.8% |
| D04 Firing Pipeline and Scoring | 17:48:49 | 44m05s | 151k | 79k | 4.9M | **6.0%** | 26.8% |
| D05 Match Orchestration | 18:36:27 | 47m38s | 143k | 62k | 2.1M | 97.7% | 51.2% |

Total wall-clock **6h27m** (12:09 → 18:36), median **~20m**, cumulative ↑ ~925k, ↓ **~603k**.
Paragraph totals: A section 31m, B section 1h51m, C section 1h44m, D section 2h21m.

**D04's CH is only 6.0%**, and final context dropped to 26.8% —— almost certainly triggered auto-compact midway,
its ↑151k / R4.9M is on a different scale than other rows. It is also exactly the only task that self-checked and found two real bugs.

## ★ mtplx Inference Speed Measurement

mtplx exposes **per-request** metrics at `http://127.0.0.1:8001/metrics` (`recent` is a rolling window of 32 entries, with unique `request_id`),
which can be sampled programmatically without reading the Dashboard. This session wrote `tps_collect.py` to deduplicate by `request_id` and write to JSONL.

44 samples (covering the D05 period), bucketed by context:

| context | n | decode mean | median | min | max | end-to-end mean |
|---|---|---|---|---|---|---|
| 0–20K | 4 | **56.1** | 60.3 | 47.1 | 61.6 | 17.6 |
| 20–40K | 6 | 38.5 | 39.1 | 34.2 | 45.6 | 17.4 |
| 40–60K | 4 | 38.2 | 37.4 | 34.7 | 43.5 | 9.3 |
| 60–80K | 11 | 35.2 | 34.5 | 26.9 | 42.3 | 27.1 |
| 80–100K | 2 | 29.6 | 30.6 | 28.6 | 30.6 | 29.5 |
| 100–120K | 17 | **27.5** | 25.5 | 19.1 | 43.7 | 23.4 |

**decode decays monotonically and cleanly with context: 56 → 28 tok/s, roughly a 30% drop per context doubling.**
The end-to-end column is noisy because TTFT accounts for a high proportion in short responses (the 9.3 in the 40–60K bucket is dragged down by prefill for 138-token short responses).

Machine state during the same period: cached 24.3M tok all RAM hits, memory 79.8/128 GB (62%),
prefill mean 485 tok/s peak 841, MTP acceptance rate D1 91.4% / D2 60.5% / D3 51.6% (mean P=68.1%),
lifetime 26M tok, all-time max 84.3 tps.

### ⚠️ Dashboard main dial label and value mismatch

The 84mm large dial in the screenshot displays **18.6, labeled "tps decode"**, but it is exactly equal to `latest.request_tok_s = 18.6215`;
**at the same moment `latest.decode_tok_s` is 23.63**. The "5-MIN MIN/MAX 22.5/28.6" below is the actual decode.
That is, the main dial displays the end-to-end rate including prefill wait but labels it as decode.
The "usually 13–32 tok/s" given by the user from memory corresponds to this end-to-end metric; pure decode is higher.

### ★ Wall-clock time ≈ output tokens ÷ decode rate

↓ Cumulative ~603k tokens ÷ 6h27m = **average 26 tok/s**, which almost coincides with the measured high-context segment decode **27.5 tok/s**.
Implication: **these 6.5 hours were almost entirely decoding time**; tool execution, prefill, and orchestration intervals combined account for a very small proportion
——CH is generally 99%+ making prefill basically free (24.3M cached tok all RAM hits).

**Based on this, capacity estimation can be made**: `预计耗时 ≈ 预计输出 token ÷ 25`. The remaining 39 tasks, if calculated at the observed
average ~38k ↓/task, will require approximately **1.48M tokens ≈ 16.5 hours**.

> ⚠️ This estimate has only 16 samples, and the nature of tasks in the E–M segment (AI / UI / Art / Audio) differs from A–D (pure logic);
> historically, the median duration of art tasks is 2.4 times that of logic tasks (see [Seven-Round Summary](devlog-projects-qwen3-8-test-notes-neon-bastion-final-summary-2026-09-04.md)),
> so 16.5h should be considered a **lower bound**.

## Model Performance

**Quality is clearly better than the same period in previous rounds.** Each task consciously executed the **negative control** required by A01 (break the property under test → confirm assertion turns red → restore),
and recorded each item in the commit message, accumulating 50+ groups. This directly addresses OPS-12 (historical local file, not published with this report)
"green tests may be unrelated to the code under test"——this round's A02 wrote `reuseExistingServer: false` + `E2E_PORT` port isolation into the scaffold,
which is the direct effect of the task specification solidifying historical pitfalls into acceptance criteria.

### D04 Self-identified two real bugs (not covered by any assertion)

1. **`fireFrom` does not normalize `aim.dir`**: when the caller passes a raw vector, the pitch angle is amplified by distance, causing all long-range shots to drop and miss
   ⇒ **An entire AI-vs-AI match will never end**.
2. **Mutual destruction race condition**: when the last remaining units of both sides fall in the same flight window, the "winner" may have zero survivors.
   Changed to adjudicate by deterministic settlement order (the first to be completely wiped out loses) + state freeze after the endgame.

Both are issues that **would only be exposed by running a full match simulation**, indicating that the requirement "write a unit test for a complete AI-vs-AI match" itself is effective.

### B01 Proactively declared internal specification conflict

The task specification simultaneously requires "coordinates exactly matching" and "all pairwise lines between the 16 blue and red spawn points are blocked".
pi pointed out that with fixed coordinates, the lines in the same column at x=±3 do not pass through any solid (the central pillar only covers x=0), making the two geometrically incompatible;
chose to keep the coordinates, downgraded the assertion to a spawn-zone level proof, and stated the reason in the test comments.
**This is a defect in the task specification itself, not a model failure**——what is worth noting is that it chose to declare it rather than silently change the values.

## Currently Unplayable

The logic layer is already quite complete (265 unit tests, with ballistics/hit detection/scoring/event bus/endgame adjudication all in place, capable of running a full AI-vs-AI simulation match),
but **the presentation layer and input layer are almost entirely unwired**. In the browser, clicking Deploy only yields a `0x05070d` background color + a camera that can be panned with WASD:

- `src/app.ts` has not created a single `Mesh`, and `scene.add()` has never been called — walls exist only as collision boxes, so you will collide with invisible walls
- A grep across the entire repository finds no `requestPointerLock` / `mousemove` — C02's `applyLook` is written and tested but not connected to browser events
- `app.ts` does not reference `fireFrom`; only `testHooks`'s `fireShot` can trigger it
- No enemies (Section E not started), no HUD (Section G), no death spectating and settlement (F03/G05)

This aligns with the roadmap in `INDEX.md`: critical path A→B→C→D→E→F, **F03 is the moment when it becomes "runnable, playable, killable, and restartable"**.
It is still 7 tasks in Section E + 3 tasks in Section F = 10 tasks away from being playable.

## Reproduction Steps

```
# 投喂（pane 2 = pi）
zellij action write-chars -p 2 -- "/new"; zellij action write -p 2 13
zellij action write-chars -p 2 -- "先读全局约定 @../test-prompts/neon-bastion/neon-bastion-A01-task.md ，然后阅读并完整完成 @../test-prompts/neon-bastion/neon-bastion-<ID>-task.md 中的任务。..."
zellij action write -p 2 13

# 空闲判定：12s 采样，连续 5 次 dump-screen 无 Working/spinner
# 速度采样：GET http://127.0.0.1:8001/metrics -> recent[] 按 request_id 去重
```

As suggested in `INDEX.md`, the model does not remember global conventions after `/new`, so A01 and the current task are fed **together** in each round.

## Next Steps

Continue from **E01** (7 AI tasks in Section E). Restart `tps_collect.py` before resuming to obtain per-request speed data;
timestamps have been added to `feed.sh` / `done.sh`, so time and tokens are measured directly from Section E onward, eliminating the need for post-hoc reconstruction.

---

# Resume 2026-09-10 — Segment E (E01–E06), 22/55

Resumed on 09-10 after the pause on 2026-09-07. **Paused again before E07 at user's request** ("I've been working all day today").

## Two pitfalls encountered upon resumption

**1. The environment had completely changed, with no indication whatsoever.** Upon resumption, the mtplx service was not running (no listener on `:8001`, no mtplx/mlx processes),
and pi had exited (only the shell prompt remained in the `qwen3.8-test-pi` tab). The user manually restarted both.

**2. ★ Zellij pane numbers are not stable identifiers—feeding was directed into the orchestrator's own input box.**
In the previous round, pi=pane 2, orchestrator=pane 1; after the restart, **the two were swapped** (orchestrator=2, pi=1).
`feed.sh` still had `PANE=2` hardcoded, so the instruction "First read global conventions @A01…" was directly typed into Claude Code's input box,
returning to the orchestrator itself in the form of a user message. **There were no errors**—the write succeeded, it just went to the wrong place.
Fix: Before each resumption, use `zellij action dump-layout` + per-number `dump-screen -p N` to re-probe,
do not reuse pane numbers from the previous round. This has been merged into OPS-22 (historical local file, not published with this report).

## Segment E Task-by-Task

| Task | Completed | Duration | ↑ | ↓ | R | CH |
|---|---|---|---|---|---|---|
| E01 Perception | 07:12:04 | 15m45s | 41k | 30k | 1.5M | 98.6% |
| E02 State Machine | 09:30:04 | **2h17m53s** | 548k | 196k | 8.9M | 99.9% |
| E03 Doctrine | 10:33:24 | 1h03m12s | 182k | 91k | 4.8M | 100% |
| E04 Firing Decision | 11:36:44 | 1h03m12s | 177k | 59k | 2.3M | 4.9% |
| E05 Anti-Stall | 15:02:03 | **3h25m12s** | 539k | 195k | 11M | 98.9% |
| E06 Anti-Deadlock | 19:40:19 | **4h38m08s** | 878k | 369k | 11M | 99.6% |

Segment E total wall-clock **12h44m**, output **940k tokens**, median **1h40m**.
Final state: 22 commits, 54 files, **+15,963/−2**, unit tests **363** (21 files), E2E 6, `npm run build` exit code 0.
After each task completion, the orchestrator independently re-ran build + unit tests for verification, rather than merely trusting self-reports.

### ★ Segment E overturned the duration model of Segments A–D

| Segment | Tasks | Median Duration | Total |
|---|---|---|---|
| A–D (Pure Logic) | 16 | **20m** | 6h27m |
| E (AI) | 6 | **1h40m** | 12h44m |

**The duration of the six AI tasks is twice the sum of the previous sixteen tasks.** The median duration differs by a factor of 5.
The estimation formula from the original PERF-01 (historical local file, not published with this report) was also inaccurate for Segment E:
940k ÷ 12h44m = **20.5 tok/s**, lower than the 26 for Segments A–D; the formula predicted 10h27m, actual was 12h44m, **underestimated by 22%**.
The discrepancy comes from three overheads not covered by the formula: re-prefill after auto-compact, round-trips for two manual interventions,
and idle spinning when the turn ends but the task is not complete. **Correction: `预计耗时 ≈ 输出 token ÷ 20`, and this only holds for tasks without stalling.**

Segment E tps measurements (634 per-request samples, far more than the 44 on 09-07):

| context | n | decode median |
|---|---|---|
| 0–20K | 33 | 47.1 |
| 20–40K | 41 | 30.7 |
| 40–60K | 161 | 30.2 |
| 60–80K | 156 | 29.7 |
| 80–100K | 124 | 26.3 |
| 100–120K | 119 | 25.5 |

The decay curve is consistent with the 44 samples from 09-07 (**47 → 25 tok/s**), and the conclusion remains unchanged after expanding the sample size by 14 times.

## ★ Two stalls: Different forms, different criteria

Two stalls requiring manual intervention occurred in Segment E; **externally both manifested as "no progress for a long time," but their nature was completely opposite**.
Distinguishing criterion: **Look at what it is reading**.

### Stall 1: Tool calls degenerated into plain text (E05)

pi was to write a python heredoc to modify `constants.ts`, but **the entire segment was output as plain text, generating no tool calls**,
then the turn ended normally. The trigger was consistent with the archived
bug page (historical local file, not published with this report): long composite shell commands.

**This exposed a flaw in the orchestrator's own criteria**: The original `wait.sh` only checked for "no spinner on screen,"
which could only determine **turn end**, not **task completion**—it nearly recorded this stall as "E05 complete."
**Fix (implemented)**: The completion criterion was changed to a hard criterion—after idle, **HEAD must advance** or **TASK-DONE must appear on screen**,
otherwise exit 2 reports a stall. E05 finally passed with `DONE (HEAD 50793d3 -> 85512a4)`.
New OPS-24 added (historical local file, not published with this report).

### Stall 2: Design stuck → Tool stuck (E06, two interventions)

E06 was the **only task in the specification explicitly stating "the previous delivery did not resolve it"** (original text: "In the final delivery of this project,
'AI occasionally gets stuck in corners' has not been completely eliminated"), with acceptance requiring a seed 1..40 corner-stuck scan of 0.

**First intervention (at 3h25m, design stuck)**: pi repeatedly re-derived the geometric direction of the same corner.
Its own debug trace had already calculated the root cause, but it did not break out of the "tangential slide-out" framework. The orchestrator read two things from its trace:
(a) **There is a static dead zone between episodes**—the episode ends at t=6.0, the next trigger waits until t=9.0,
with `v=0` explicitly written in between; these 3 seconds were directly fed into the "continuous 5s displacement <0.3m" scan;
(b) **slideSign is blind alternation rather than probing**—after flipping, it selected the corner quadrant it had calculated as "completely blocked."
**Key insight: Tangential slide-out is unsolvable in corners** (two faces meet here, and both tangential candidates may be blocked simultaneously),
the only way out of a corner is to **back up one step first**.

**Second intervention (at 4h01m, tool stuck)**: Design was finalized, `types.ts` was written to disk,
but edit calls to `aiController.ts` continued to fail—pi was struggling with the exact match of `oldText` for a **documentation comment**
("Two pieces of text look the same but don't match," the difference being whitespace/newlines), and self-reported
"the earlier edit call was atomic (all-or-nothing), so nothing was applied."
**This was pure toolchain waste, waiting would not self-heal.** Intervention content: Don't modify the comment first (not part of acceptance),
directly implement functional changes, and when editing fails, use short and unique anchors or whole-function replacement.

> **General Rule**: External manifestation is the same "stagnation," but **re-deriving geometry = design stuck (may self-heal, E05 converged autonomously)**;
> **repeatedly grepping for original text = tool stuck (will not self-heal, must intervene)**.
> Before intervening, re-collect the current state according to OPS-16 (historical local file, not published with this report), do not make judgments based on old evidence.

## ★ Two chain reactions discovered by E06 itself

pi did two things beyond requirements in E06, **both were unforeseen by the orchestrator**:

1. **Pure 90° tangential probing broke E05**: After rotating the unit 90°, the target exited the 50° frustum → fell back to search and oscillated →
   zero kills for the entire game. Changed to "try 30° first, then 90°/back up if that fails," maintaining target visibility in common cases while still allowing escape from corners.
2. **The 2 m no-kill test for `aiFire` was originally a false green**: Before E06, close-range units were stuck (0 shots),
   the test "passed" because they **could not move at all**; after the fix, they back away and legally fire at ≥3 m.
   pi changed the assertion to the true contract—decision distance for every shot ≥ `minFireDist` (measured first shot 3.12 m).

Item 2 is another instance of OPS-12 (historical local file, not published with this report) "Green tests may be unrelated to the code under test,"
**and it was the first time in this project discovered by the model itself** (historically, all four instances were discovered by humans or reviewers).
The anti-stall in E05 also provided similar decidable evidence: seed 27 (Twin Mazes) originally had a 300 s zero-kill stalemate
→ after adding the gate, it ended in 140 s with 6 kills, stably converging to 125–137 s across multiple seeds.

## Still not playable

Segment E only completed the AI logic; **the presentation layer and input layer are still not wired up** (`app.ts` has no `Mesh`/`scene.add()`,
no `requestPointerLock`, does not reference `fireFrom`). Still **E07 + 3 tasks in Segment F** away from the critical path of `INDEX.md` F03
("can run, can shoot, can die, can restart").

## Next Steps

Resume from **E07** (the last in Segment E: seed 1..40 scan). Mandatory before resumption:
1. Confirm mtplx `:8001` is online, pi is started;
2. **Re-probe pane numbers** and update `PANE` in `feed.sh`/`wait.sh`/`done.sh`;
3. Start `tps_collect.py`.

**33 tasks remaining** (E07 · F×3 · G×8 · H×5 · I×4 · J×3 · K×4 · L×3 · M×2).
Extrapolating from the Segment E median of 1h40m gives approximately **35–55 hours**, but F–M are shell/UI/art/audio, different in nature from AI,
so the uncertainty in this range is high—the only reliable conclusion is that the **"16.5 hours" recorded on 09-07 has been falsified, and the underestimation is significant**.

---

# Resumed 2026-09-12 — E07 + F Section + G01–G06, 32/55

Resumed on 09-12 after the 09-10 pause. **Paused again before G07 at user request.**
Completed **10 tasks** today (E07, F01–F03, G01–G06), wall-clock **8h41m**, output **713k token**, median **49m**.

Final state: **32 commits, 85 files, +24,079/−2, 469 unit tests (33 files), 49 E2E, `npm run build` exit code 0**.
After each task completion, the orchestrator independently re-ran build + unit tests for verification.

## Stepped on "environment not guaranteed to persist" again upon resumption

The mtplx service was not running again (no listener on `:8001`), pi was alive but had no backend. **The panel number did not change this time** (pi=1),
but still followed OPS-22 (historical local file, not published with this report) to re-probe before proceeding.
The orchestrator restarted the service itself: `mtplx serve --model Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed
--port 8001 --context-window 131072 --max-tokens 32768`, without manually specifying the profile (letting it auto-resolve based on the model,
to avoid deviating from the previous performance baseline), and verified via `/v1/models` per OPS-13 (historical local file, not published with this report) that
the server-side ctx matched pi's `models.json` before feeding input.

### ★ New Failure: mtplx background persistence task starves foreground stream (OPS-27)

The service started by the orchestrator encountered `mtplx_stream_stall_break` on the first feed of E07:

```
owner_frozen_s: 300.2   deadline_s: 300.0   streamed_tokens: 0
active_kind: "idle_persistence"   active_batch_key: "ssd.cold_enqueue"
active_run_s: 300.28   foreground_pending: 1
```

A **SSD session-cache cold write task occupied the scheduler owner thread for a full 300 seconds**,
pi's foreground request queued behind it never started streaming output (`streamed_tokens: 0`), and the server-side 300 s watchdog cut the stream.
**The pi side suffered a secondary failure**: after the stream was cut, it did not clean up session state, continued to believe the session was in flight, and rejected all new input
(`already in flight`), with counters frozen, no timeout and no self-healing, **requiring manual Esc press to unlock**.

Frequency: 1 occurrence in this service session, **0 occurrences** in `~/.mtplx/logs/request-log-8001.jsonl` history
— possibly related to the orchestrator's startup parameters (user's usual startup method did not reproduce it). Workaround: `--ssd-session-cache off`.

**Action**: User took over and restarted the service; orchestrator pressed Esc to unlock pi → `/new` → **discarded all of E07's half-finished work
(`e07Sweep.test.ts` + `aiController.ts` changes), rolled back to E06's clean committed state and re-fed**.
Reason: The other 31 tasks all started from a clean state; continuing with residuals would make time and token data incomparable
— this is a performance comparison project, and comparability takes precedence over saved rewrite time. After re-feeding, E07 passed in one go using only **14m02s**.

## Per-Task

| Task | Duration | ↓ | Notes |
|---|---|---|---|
| E07 Termination Scan | 14m02s | 23k | Passed in one go after re-feed |
| F01 App Shell | 32m32s | 57k | E2E 6→10 |
| F02 Renderer Skeleton | 37m24s | 59k | **First time there was actually something in the scene** |
| F03 Death Spectating | 1h26m29s | 127k | **End of critical path**, E2E →15 |
| G01 HUD Basics | 56m44s | 90k | E2E →22 |
| G02 Leaderboard | 37m06s | 54k | E2E →30 |
| G03 Minimap | 1h38m34s | 117k | Longest of the day |
| G04 Hit Feedback | 1h11m56s | 83k | E2E →37 |
| G05 Settlement and Restart | 38m42s | 49k | E2E →43 |
| G06 Director/Debug Mode | 42m29s | 54k | One auto-compact during this |

**F–G section median 49m, between A–D (20m) and E (1h40m).**
713k ÷ 8h41m = **22.8 tok/s**, consistent with the corrected ÷20 coefficient in PERF-01 (historical local file, not published with this report)
(E section 20.5, A–D section 26). **The three sections combined yield an empirical range: 22–26 tok/s, with AI-type tasks taking the lower bound.**

Cumulative tps samples **1333 entries**, decay curve re-verified for the third time with no change: **55 → 26 tok/s** (0–20K → 100–120K).

## ★ Real-machine acceptance caught a defect missed by all tests (PLAY-05)

After F03 landed, the orchestrator **did not just look at tests**, but actually started `vite preview` + Playwright to run a game:
After fast-forwarding 10 seconds, 6 out of 8 players were alive, HP `[100,0,30,100,100,100,80,0]`, combat logic was running for real.
**But the screenshot showed: `state` was already `running`, yet the menu title H1 "Neon Bastion" was still drawn in the center of the screen**
(rect 480,344,320×33). The Deploy button correctly disappeared, and the PAUSED / VICTORY / ELIMINATED panels were all correctly hidden
— **only the title was missed**. At that time, 397 unit tests + 15 E2E were all green, with no coverage for this.

> **A misjudgment by the orchestrator itself, worth noting**: The first detection used `getComputedStyle` to check visibility element by element,
> concluding that "PAUSED/VICTORY were also exposed" — **wrong**. When the parent element is `display:none`, the child element's
> computed display remains its own value. Switching to `checkVisibility()` (accounting for ancestors) yielded the accurate conclusion above.
> **General rule: To determine "is it really drawn on the screen," only APIs that account for ancestors or screenshots can be used, not the element's own computed style.**

This is another instance of PLAY-03 (historical local file, not published with this report)'s "visual closed-loop cannot reduce missed detections of 'plays wrong',"
but **this time it was caught in the task's own round by automated real-machine screenshots**, not waiting until the manual playtesting phase.
The defect was not fixed — it was not in any task's acceptance criteria, so per user instruction, the task list continued, and it was recorded.

## Two self-check findings on the model side (G03)

pi proactively noted two debugging findings in G03's commit message:

1. **`vite preview` serves `dist/`, so after modifying `src`, a rebuild is mandatory, otherwise E2E runs on the old build**
   — it self-reported this as "the main cause of E2E getting stuck." **This is exactly the fifth instance of OPS-12 (historical local file, not published with this report),
   and the second time the model itself hit and recorded it** (the first was the `aiFire` false green on 09-10).
   A02 scaffolding already has build gates + port isolation, but it cannot prevent scenarios where preview is run manually.
2. **Player spawn point is only 3 m from the boundary wall**: Tests wanted to teleport units to 4 m directly behind, which would land in the boundary wall's footprint,
   placing them on top of the wall (y=4), causing line of sight to fly over the wall top and resulting in geometric degeneration. Changing to 2 m solved it. This is a real constraint of the map data.

## Notable acceptance design (G04)

G04 used **"absence of feedback" as a detector for "event bus being bypassed"**: ran a real full-AI match with seed 4,
asserting that AI firing must trigger hit flash and hit effects. If someone bypassed `fireFrom` to directly modify HP, there would be no feedback on screen,
and this assertion would fail — **adding a runtime safety net to D04's "single firing entry" source code scan**.

## Next Steps

Resume from **G07** (fallback). Remaining **23**: G07–G08 · H×5 · I×4 · J×3 · K×4 · L×3 · M×2.
Extrapolating from the F–G section median of 49m, approximately **19–23 hours**, but **the 5 art tasks in H section are the biggest variable** —
historically, art tasks take 2.4 times as long as logic tasks.

**Visual capability: Under MTPLX deployment, Qwen3.8-27B can see images, and the visual closed-loop is working.**
OPS-11 (historical local file, not published with this report) (model cannot see images, and it is silently dropped) is a **deployment-specific defect of mlx-dspark, not a model capability issue**;
[Tide Isle R1](devlog-projects-qwen3-8-test-notes-tide-isle-mtplx-optspeed-r1-2026-09-05.md) has been verified on MTPLX —
in task-1, it caught a fatal rendering defect (top face y/z swap causing the entire island to become a "grid basket") that no assertion could test, by reading back its own screenshots.
This round's A–G sections were all logic and DOM UI, with no image reading used, **so there is no empirical evidence for the Neon Bastion side in this round yet**.

> **Perform a visual smoke test before entering H section upon resumption** (one request is sufficient):
> Create a small image with distinct features (e.g., solid color background + one off-center color block), send it via `/v1/chat/completions` as a base64 data URI,
> and check if the response can state the color and position. **Reason**: OPS-11 was a **silent failure** — the model replied "No image was provided",
> `prompt_tokens: 17`, with no error. **Capability existing does not mean the link is working this time**, and the five tasks in H section all rely on it to read back screenshots for self-check,
> so if the link is broken, it will only be discovered by humans after the five tasks.

---

# Resumed Run 2026-09-13 — G07–G08 + H01–H03, 38/55

Today's net output was 5 tasks (G07 G08 H01 H02 H03), with a wall-clock duration of 08:33–16:10 totaling **7h37m**,
of which **1h47m was pure idle time caused by a bug in our monitoring** (see below). Code delta: 23 files +3254/−64,
tests 469→**519 unit** / 49→**70 E2E**. Each task was independently verified by me running `build + vitest + playwright`,
without relying on the model's self-reported status.

## Per-Task

| task | Wall-clock | ↑ / ↓ | Result | Notes |
|---|---|---|---|---|
| G07 reduced-motion + no-WebGL fallback | 83 min | 156k / 52k | 482 unit / 53 e2e | 4 tool call failures; finished in 33 min after handoff-style `/new` |
| G08 favicon / theme-color | 11 min | 22k / 17k | 482 / 58 | Zero stalls |
| H01 Sky cloud bands and fog | 104 min | — | 490 / 63 | 3 nudges exhausted; finished in 10 min after handoff reset |
| H02 Sand three-layer procedural texture | 47 min | 152k / 72k | 503 / 67 | Zero stalls |
| H03 Wall brightness ladder | 97 min | 320k / 151k | 519 / 70 | Zero stalls, but a large number of tokens were spent on manual calculations (see below) |

## ★ Today's Biggest Lesson: The Observation Channel Itself Is Unreliable (Three Failures on Our Side)

None of the three were the model's fault; rather, **the signals I used to judge the model's state were contaminated**,
and in all three cases, the appearance was "everything looks normal":

### 1. Completion Criteria Contaminated by Our Own Prompt

The prompt included "Reply **TASK-DONE** upon completion." This string remained on the screen and was hit by the completion criteria grep,
causing G07 to be judged as complete 120 seconds after starting. It had not triggered previously only because the model's output was long enough to push the prompt out of the window.
→ Changed to require `TASK-DONE` to be **on its own line** (the one in the prompt has a period and is not on its own line).

### 2. `zellij dump-screen` Returned Frozen Frames

For 5 consecutive minutes, the md5 was identical, and the content was stuck at "preparing to read renderer.ts",
while during the same period, mtplx received a new request every 25s, and the prompt grew from 46k to 62k. **The screen channel cannot be relied upon alone.**
→ Activity detection changed to a three-way union: new mtplx `request_id` / screen md5 change / spinner present.

### 3. ★ The Word `Working` Hit the Spinner Regex → 1h47m Idle

The pi completion summary contained the sentence `Working tree is clean (git status is empty).`,
and `Working` hit the regex for the detection spinner → every polling round judged "still working" → the silent counter never accumulated →
**the completion criteria never triggered**. pi submitted completion at 11:56:43, and the driver process idled healthily until 13:43 when I was asked about it and discovered it.
→ Only recognize braille spinner characters `[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]` and `esc to interrupt`,
**do not match common English words like `Working`/`Thinking` that appear in the body text**.

**The model also fell into an isomorphic pitfall once** (H01, see below): a build failure was silently swallowed, and tests ran on old artifacts, remaining green.
Humans and models stumble on the same type of trap—**"no error" does not equal "normal"**.
For any signal used to judge state, one must first ask, "What does it look like when it fails?"

## ★ Tool Call Failures: Two Hypotheses Successively Falsified

### Original Hypothesis "Command Complexity" — Falsified

The 9/05 bug documentation attributed it to long compound shell commands. The command for today's fourth instance was
**single-line, single-command, no chaining, no pipes**, and was issued only after the model **explicitly reasoned and confirmed**
the discipline of "one at a time, no chaining, single-line." Complexity cannot explain it.

### Subsequent Hypothesis "Context Length" — Also Falsified

The `prompt_tokens` for the four stalls fell in the 70k–88k range. After a handoff reset, the failures disappeared, leading to the initial belief that
"tool call reliability starts to collapse at ~60% of the window." **This was overturned by the same data**:
After the reset, 41 of the 71 requests for G07 ran at 80k–108710 (higher than the stall range),
with an increment of **0** for `unclosed_tool_call`.
Reasoning flaw: Only observed "no more stalls after reset," without verifying that the context actually reached an equivalent or higher level after the reset.

### Confirmed: The Fault Is Not on the pi Side

`unclosed_tool_call` is **a count from the mtplx parser itself**—the fault existed before the token stream reached pi.
pi receiving plain text and ending the turn based on it is correct behavior; its defect lies only in being **silent**, with an appearance indistinguishable from normal completion.
The mtplx service stack vs. model weights still cannot be separated: truncation has been ruled out
(failed request `completion_tokens` values were scattered numbers like 80/91/106/126, while `request_max_tokens` = 32768).

### New Instrument: Per-Request Attribution

The `trace request` receipt from mtplx has **333 fields** (including `finish_stop_origin`, MTP per-layer acceptance rate,
sampling parameters, cache recovery details), but **no field records the tool parsing result for that request**—
`unclosed_tool_call` exists only in global cumulative counters and cannot be attributed to specific requests.

Workaround: `parse_watch.py` polls counters every 3s; if any item increases, it saves a snapshot of the `recent` tail to disk.
Request intervals are ~15s, so 3s polling is sufficient to pin down uniqueness. **All 4 instances today were locked in**:

| Time | Counter | rid | prompt | completion | success_delta |
|---|---|---|---|---|---|
| 10:49:55 | fallback + **malformed** | `2faeefa3` | 100011 | 5611 | **0** |
| 11:22:12 | unclosed + fallback | `99eedc3e` | 79032 | 836 | **0** |
| 11:37:21 | unclosed + fallback | `e3e68cf5` | 101196 | 602 | **0** |
| 11:41:05 | unclosed + fallback | `d121bccd` | 102302 | 975 | **0** |

All `success_delta` were 0 —— these requests **produced zero successful tool calls**, the entire response was invalidated,
it was not "three calls succeeded and one failed." Also, `malformed_tool_call` appeared for the first time (the format itself was wrong),
indicating that the fault has at least three subtypes.

One **unsubstantiated** clue is kept as a memo: a failed request's `finish_stop_origin = bonus`
(bonus token from MTP speculative decoding) seemed to point to an error in the closing token;
but after pulling all 152 requests from today for comparison, the four stalls were distributed across **five** stop sources: `primary` / `context_copy` /
`accepted_draft` / `residual_correction` / `bonus`, with no clustering. **Single-sample clues are unreliable.**

### Conclusion: Do Not File an Issue with mtplx for Now

Without a minimal reproduction, and with both root cause hypotheses self-falsified, asserting a root cause now would only waste the maintainer's time.
The gap that is truly clearly bounded, low-cost, and explicitly within mtplx's responsibility is the **lack of per-request tool parsing results**;
we will revisit this after `parse_watch.py` accumulates a dozen or so samples and performs a 333-field comparison with the success group.

## ★ Model-Side Highlights

### H01: Negative Control Did Not Turn Red, Model Found the Root Cause Itself (OPS-29 Sixth Instance)

After changing `setReducedMotion(reduce)` to always be `false`, E2E test #5 **remained green**.
The model did not let it go and traced the root cause: the naive mutation caused parameter `reduce` to be unused →
**TS6133 triggered `noUnusedParameters` → `npm run build` exit 1 → `vite preview` continued to serve the old `dist/`**
→ tests kept running on clean code.
Switched to a type-legal equivalent mutation `false && reduce`, and verified dist content using a sentinel that survived minification,
test #5 turned red as expected (pixel diff 450152 ≫ threshold 5000). The lesson has been solidified into the spec header comment.

**This is the sixth time this project has hit "E2E runs on dist, not source code," and this form was the most subtle:
the build failure was silently swallowed, manifesting as passing tests.** A false green that would lead one to believe the negative control was effective, when in fact nothing was verified.

### H03: Predicted Cross-Task Regression Analytically Before Starting

H03 required a brightness ladder for **rendered pixels** (sand 193 > boundary 145 > spawn room 118 > hedge 107),
while the constants in the code are albedo, with
`线性化 → ×半球光辐照度 → ACES 色调映射 → 回 sRGB → L8(BT.601)` in between.
ACES is non-linear, so a ladder arranged on albedo may not hold after rendering.
The model back-solved for light intensity S, ran the full pipeline for each color, and calculated that at S=3.2, the sand would be compressed to (243,240,227)≈L240,
**overexposed to near-white**, and further predicted this might break the existing sand color E2E assertions in H02.
**Predicted a cross-task regression before writing any code**, and did not take the "boost exposure to save the scene" shortcut explicitly forbidden by the H03 card.

### ⚠️ But the Cost Was Pure Manual Calculation

The above four-digit transcendental function operations were **all manually calculated in the reasoning stream** (ACES rational approximation, `^0.4167` gamma,
sRGB 8-bit round-trip), with at least two instances where it discovered its own calculation errors and went back to re-derive
("the discrepancy was from the arithmetic mistakes back then", "I confused them earlier").
This work would take ten lines of script and one second to produce a result. H03 took 97 minutes, ↓151k tokens, a significant portion of which was spent on this.
**Next time, for similar numerical solving, directly require it to use a script**—this is an efficiency issue, not about doing the design for it.

## Inference Speed (391 Requests Today)

| context | Samples | decode median | mean | prefill median |
|---|---|---|---|---|
| 0–20k | 35 | **55.6** | 55.6 | 680 |
| 20–40k | 90 | **35.6** | 37.2 | 320 |
| 40–60k | 75 | **33.9** | 34.2 | 290 |
| 60–80k | 61 | **29.9** | 32.2 | 233 |
| 80–100k | 80 | **29.3** | 29.9 | 224 |
| 100–140k | 50 | **28.7** | 29.1 | 201 |

Overall median **32.5 tok/s**; today's cumulative output **388,545** completion tokens.

The shape is consistent with previous days (55 → 29), but **the decay is earlier and steeper**: it drops to 35.6 at 20k, then flattens out,
**it is not a linear decline**, but closer to "before 20k is the sweet spot, after which it enters a plateau".
The "13–32 tok/s" in user perception corresponds to the mislabeled `request_tok_s` gauge on the dashboard (see OPS-20),
the measured pure decode range is **29–56**.

## Recovery Method (Resuming Tonight)

```bash
# 1. 确认 mtplx 在线（由用户自行启动，勿代劳）
curl -s http://127.0.0.1:8001/metrics | head -c 80

# 2. 重新探测 pane id（OPS-22：重启后不保证不变）
zellij action dump-screen --pane-id 1 | tail -3   # 应看到 pi 状态栏

# 3. 起采集器
cd ~/Code/qwen3.8-tests/neon-bastion-55task-run
nohup python3 tps_collect.py >> tps_collect.out 2>&1 &
nohup python3 parse_watch.py >> parse_watch.out 2>&1 &

# 4. 逐个跑；脚本自动喂→监控→自动捞失速→独立验收→记账
./run_task.sh H04        # 退出码 0 完成 / 2 需交接式 /new / 3 验收红 / 1 超时
./status.sh              # 随时看进度
```

Stall handling: `run_task.sh` automatically nudges up to 3 times; if exhausted, back off by 2,
then write `<TASK>-HANDOFF.md` (completed parts + remaining steps + target file anchor line numbers + operational discipline),
clear with `/new` and resume with `--resume`. Both G07 and H01 were rescued this way, finishing in 33 / 10 minutes respectively after reset.

## Remaining 17

H04 H05 · I01–I04 · J01–J03 · K01–K04 · L01–L03 · M01 M02

At today's actual rate of **71 minutes/task** (including wall-hits and rescues), an estimated **15–22 hours of machine time** remain.
Section I (humanoid characters / walking animations / weapon holding / FPS view models) is the heaviest;
Section J connects to the FX object pool, where the `fxPools` probe reserved in G06 is powered on;
L03 "Verification Integrity Audit" requires a retrospective review of all negative controls and threshold margins—
Given the false positives identified in today's H01, this task is highly likely to uncover past issues and may significantly exceed the time limit.

## Still Unfixed

**PLAY-05**: The menu H1 "Neon Bastion" is still rendered in the `running` state (rect 480,344,320×33).
It is not included in the acceptance checklist of any card; per the "do not perform subsequent tasks prematurely" policy, it is left as is.

---

# Resumed 2026-09-13 Night → 09-14 — H04–H05 + I01–I04, 43/55

Overnight segment 23:58–10:48 (10.8 h), net output 6 tasks.
Tests 519→**615 unit** / 70→**93 E2E**, each task independently re-run by the orchestrator for build + vitest + playwright.
**All scenes and characters in place**: daytime sky/sand/four types of walls/hedges/glass + humanoid units/gait/third-person weapon holding/first-person view model.

## Per-Task

| task | Wall-clock | Result | Notes |
|---|---|---|---|
| H04 Hedge leaf cluster texture | 149 min | 535 unit / 71 e2e | Zero stalls |
| H05 Glass (window frame + reflection) | 71 min | 552 / 78 | Zero stalls; opacity 0.3, upheld B02's ≤0.5 transparency assertion |
| I01 Humanoid fit hitbox | 59 min | 563 / 83 | Zero stalls; 6 primitives + team marker + ground ring |
| I02 Walking gait | 33 min | 580 / 83 | Zero stalls; phase only in rendering layer, not in Unit/snapshot |
| I03 Third-person weapon holding | 69 min | 594 / 86 | Zero stalls; weapon excluded from hitbox bounding box |
| **I04 First-person view model** | **259 min** | 615 / 93 | **Two human interventions**, see below |

**H04–I03 five consecutive zero stalls**: 1149 tool calls, `unclosed_tool_call` stayed at 6 throughout,
`parse_watch.py` recorded no events. Compared to the 09-13 daytime state of stalling every ten-plus minutes, the difference is significant,
but **no conclusion is drawn from this** — the previous day already suffered the loss of "correlation looks strong, but falls apart when zoomed in."

## ★ I04: Model Lacks Cost Awareness (Most Important Observation of the Day)

I04 took **4h19m**, which is **3.7 times** the median of the same segment (69 min), and only converged after two human interventions.
The out-of-control process was divided into three stages:

1. **Brute-force enumeration**: Turned the **monotonic, approximately quadratic, analytically solvable** one-dimensional problem of "screen area vs. scaling"
   into a browser round-trip grid search of 12,150 combinations. Self-estimated "12,096 × 4 ms ≈ 48 seconds",
   actual single round took over 21 minutes — **Playwright inter-process round-trip overhead underestimated by 25 times**. Ran three consecutive rounds
   (first round discovered its own coverage formula missed dividing by sample points, second round changed stride, third round adjusted threshold).
2. **Intervention 1** (09:55, after 3h26m run): Pointed out the method was wrong, suggested fixing other parameters and solving for scaling via one-dimensional fitting.
   Message entered pi queue, it was then blocked on a 30 min timeout grid command, and only read it about 13 minutes later.
   After reading, it **fully adopted** the suggestion: deleted two temporary specs, changed to "3 candidates × 3 scales → fit cov=k·scale^p → solve for target".
3. **Intervention 2** (10:30, after driver hit 4h hard limit and exited): It started **manually deriving projection geometry** again,
   trying to explain the difference between measured px/m≈300 and theoretical ≈990 — **using analytical derivation to verify an empirical fit**,
   while the entire meaning of the fit is precisely that there is no need to back-calculate constants. Required to immediately stop that derivation line, use measured values to set thresholds and annotate margins, and wrap up directly.
   **Committed 50 minutes later.**

**Three instances of the same pattern** (including previous day's H03 manual calculation of ACES/sRGB transcendental functions):
**Engineering judgment was always correct** (should calibrate, should leave margin, should verify negative control),
only the **estimation of "how long this path will take, and whether it is worth it"** was bad.
This is more worthy of being a model capability conclusion than the tool call failure bug — the latter is a deployment layer issue, this one is inherent to the model itself.
→ AI-04 (historical local file, not published with this report)

## ★ But Delivery Quality Was One of the Best This Round: I04 Avoided the Previous Round's False Green Trap

The trap recorded in OPS-24 (historical local file, not published with this report): Card gave interval 6%–18%,
negative control was "×1.5 magnification turns assertion red" (area ×2.25), both **implicitly lower bound 18%/2.25 = 8%**.
Previous round (ds-v4) calibrated to **6.17%** close to the 6% lower bound, after magnification 13.9% was still within the interval,
**negative control would never turn red** — "negative control passed" itself was false.

This round: calibrated to **≈9.1%**, after ×1.5 measured **20.5% > 18%**, negative control truly turned red;
and this negative control **was committed to the repository as a resident test** (`tests/e2e/i04.spec.ts:216`),
comment explicitly states margin ≈2.5 percentage points. **Orchestrator side gave no hints throughout** — model achieved this autonomously.
→ QA-12 (historical local file, not published with this report)

(Orchestrator side intentionally did not hint: this is exactly what the benchmark should test — whether the model can discover on its own that "my negative control is spinning its wheels".)

## ★ Monitoring Make-up: Stall Detection ≠ Idle Detection

The driver script's stall criterion is "all three signals silent", completely blind to **continuously active but non-productive** dead loops
(E06 once idled for 4h38m because of this, I04 again). Added `loop_watch.sh`, with opposite criterion:
**mtplx has new requests (active) + workspace content unchanged for 20 min = idle suspicion**,
also includes 15 min silence and 150/210/270 min fixed-point long-run alerts.

Two false positives, two lessons:

- **Hash must cover untracked files**: First version of `treehash` used `git status --porcelain` + `git diff`,
  while **`git diff` does not include content of untracked files** → completely blind when pi edited untracked `calib-i04.spec.ts`.
  Changed to directly hashing mtime+size of all `.ts/.js/.html` in the workspace.
- **Silence threshold cannot be too tight**: Long calibration subprocesses can legitimately block for 30 min.
  Distinguishing criterion: Screen command line has `$` prefix and `Elapsed` counter is moving = truly executing,
  completely different from the stall pattern of "command becomes bare text, turn ends silently".

**This is the second consecutive day of the same type of problem**: The observation channel itself has blind spots, and when it fails, it manifests as "everything looks normal".
→ OPS-42 (historical local file, not published with this report)

## Cumulative

| | |
|---|---|
| Machine time | Approx. **47 hours** (5 work segments, spanning 09-07 → 09-14) |
| Completed | **43/55**, average 66 min/task |
| Scale | 43 commits · 615 unit (38 files) · 93 E2E |
| Fastest / Slowest | G08 11 min / E06 278 min (I04 259 min second) |

## Remaining 12

- **J×3 Effects** — Currently **not a single particle**. The "Particle Occupancy" row in G06 debug panel is still empty,
  I03 has anchored the muzzle flash to the end of the barrel, both interfaces are laid out waiting for power.
  J02 "Tracers must have real screen width" has a history: previous round measured rendering of **0 pixels** while all tests were green.
- **K×4 Audio** — Currently **completely silent**.
- **L×3 Audit** — L03 requires finding "always-true greens and untrustworthy reds",
  and **negative controls must be committed to the repository**, specifically covering eleven items.
  Judging by the false green found in 09-13 H01, this task will likely dig up old accounts, possibly significantly exceeding time limits.
- **M×2 Wrap-up** — **M02 includes non-omittable human playthrough acceptance** (13-item checklist).
  Reason written in the card: The three decisive defects of this project (movement direction left-right reversed, tracer lines completely invisible,
  AI firing completely silent) **were all discovered by human playthrough, none were discovered by automated evidence**.
  The automated part can be run by the orchestrator, **human playthrough must be operated by the user** — doing it on their behalf would make the item meaningless.

Estimated 12–18 hours of machine time.

---

# Closing Segment: J01 → M02 (2026-09-14 19:45 → 09-15 18:23, 12 tasks)

**55/55 all completed.** 55 commits, HEAD `503e921`, working tree clean.
793 unit tests · 202 E2E · 9 negative controls · build exit 0.
Independent re-verification: Full E2E ×3 rounds, each 202/202.

## Itemized

| task | commit | duration | notes |
|---|---|---|---|
| J01 FX pool + muzzle flash | 602bcfa | 122 min | Culling strategy implemented correctly (shortest remaining lifetime, not first spawned) |
| J02 Tracers | 61eca09 | 188 min | THREE.Line/linewidth prohibited, used directional cylinders |
| J03 Blood drops + sparks | 37816c3 | 100 min | **After one intervention, all thresholds calibrated via empirical measurement** |
| K01 Audio skeleton | 2cfa034 | 49 min | Gesture-gated, contextsCreated=0 before Deploy |
| K02 Footsteps | 9b6b7d0 | 55 min | Distance-driven rather than time-driven |
| K03 BGM math | 2b02d09 | 20 min | **Proactively performed 4 sets of negative controls and recorded the number of failures** |
| K04 BGM playback + mute | d1a1d2b | 43 min | |
| L01 Test hook contract | e4be64b | 109 min | 33-key manifest |
| L02 E2E orchestration + screenshots | 6f9e85e | 180 min | E2E 133→201; **completed but not committed, required manual prompt** |
| L03 Verification integrity audit | fd055a6 | 160 min | Mechanized negative controls (NEG-FAIL/RESTORE-FAIL) |
| M01 README + honest checklist | 2e6eafa | 48 min | Added readmeAudit.test.ts |
| M02 Final acceptance session E2E | 503e921 | 236 min | 1332 lines, 14 positive + 4 negative |

Cumulative approx. **70 hours / 55 tasks**, average 76 min/task. Fastest K03 20 min, slowest E06 278 min.

## Conclusion 1: The boundary of self-audit lies not in capability, but in whether one questions one's own prior decisions

L03's task was to "audit whether existing tests actually test anything." What it delivered was genuine:
10 re-runnable negative controls + harness (throws `NEG-FAIL` if it doesn't turn red after break),
`docs/PROBE-AUDIT.md` explicitly documents exclusivity assumptions and threshold margins for each probe.
**Tautological assertions are now mechanically captured, a level stronger than manual line-by-line checking.**

However, compared to the 5-item gap list I had pre-compiled (never prompted throughout), only 1.5 items were hit:

| Gap | Type | Result |
|---|---|---|
| I04 quadrant threshold 75%→50% accommodated implementation | Adjusting criteria to fit implementation | **Half-hit**: recorded `qRatio 58.9% vs 50%（1.2×）`, characterized as "anti-aliasing sensitive", did not trace back to original card text |
| K02 `toBe(0)`→`toBeLessThan(10)` | Criterion blunting | Missed (explicitly within card §3 scope) |
| Layer purity test non-recursive (15 .ts files not scanned) | Criterion blind spot | Missed |
| Test does not check AudioContext | Criterion blind spot | Missed |
| 5 defects exposed by screenshots have no assertion coverage | Coverage gap | Missed (outside card scope, not counted) |

**The dividing line is clear**:
- "Are my assertions true (non-tautological)" — inward, mechanizable, **done well**
- "Are my assertions correct (should it be this one)" — requires stepping out of tests back to spec, **not done**

The first point is particularly illustrative: it **already had that number** (58.9% vs 50%),
only missing the step of asking "why was this bar moved down from 75% initially". What was lacking was not information, but the motivation to question oneself.

## Conclusion 2: Green tests cannot stop visually obvious defects

At least 5 defects in the 8 screenshots (in repo `screenshots/`) produced by L02:

1. Menu main title "NEON BASTION" spans the center of the screen in running state (PLAY-05, long recorded)
2. Gun body slants from top-right to bottom-right — I04 card original text requires "bottom-right of screen" and "**not slanting across center**"
3. Scoreboard header rendered as `STATEK` (text overlap)
4. Bottom HUD `100` overlaps health bar segments, text below ammo bar is a blur
5. Teammate at spawn point facing camera blocks line of sight

**None of the 995 assertions (793+202) caught them**,
**M01's "honest checklist" listed none of them** — despite the card explicitly stating "list real trade-offs and known defects".

The opening of M01's section is the tell: "All segments A–L are completed, **so this section is short**".
It equated "all task cards done" with "few remaining defects".
The evidence base was task cards and green tests, not the rendered product — yet the screenshots were in its own generated directory.

This is the same blind spot as Conclusion 1, manifesting independently twice.

## Conclusion 3: AI-04 intervention cost is extremely low, benefit is hour-scale

J03 saw hand-calculated projection geometry estimated pixel thresholds (`360/1.5/tan(39°)=296.3 px/m`) within 20 minutes of start,
same form as H03/I04. Given a method hint ("run once first, calibrate thresholds from empirical data, annotate margins in comments"),
**converged in 1h40m**, all thresholds with empirical values and 2.8–3.9× margins, and included valid negative controls.

Compared to I04 similar work **4h19m + two interventions**. Two data points,
intervention cost one sentence, benefit two to three hours. Criteria and phrasing are in
the "Intervene immediately upon seeing these (AI-04)" section of `neon-bastion-55task-run/README.md`.

## Conclusion 4: mtplx crashed once, cause of death undetermined

Last flight telemetry at 09-14 18:22:10, detector alarm at 18:25:40, unavailable for about one hour (restarted by user).

Excluded: OOM (last 10 min active flat at 44.5 G, peak 77.6 G static, 128 G machine, swap not enabled) ·
jetsam (only event of the day at 13:30, unrelated) · hard crash (no python `.ips` that day) ·
hitting window limit (ctx 122,373 / 131,072 at death, and had stably exceeded 127,362 throughout).

Died mid-way through a **single generation of ~16,650 tokens over 10 consecutive minutes**,
with `repetition_stop_triggered=False` throughout. Cannot determine if this was the cause of death.
mtplx is hosted by **MTPLX.app (GUI)**, worker traceback belongs to app,
`~/.mtplx/logs` and `~/.mtplx/metrics` are truncated by construction at the moment of death,
app's `Diagnostics/` only records daemon startup events. **The only place that might have a traceback is the app's own log window.**

## Conclusion 5: Tool call failures occur in clusters (see bugs/mtplx-toolcall-degrades-to-text.md)

n=9, falling into 3 compact clusters, with long stretches of zero failures between clusters (longest 7.5 hours / 5 tasks).
Refuted "each call has independent equal probability". All five cumulative hypotheses were refuted by its own data,
only "server-side transient" and "task phase/call frequency" remain as candidates, and it is known what instrumentation is needed to separate them.
Final values for this round: `tool_parse_success 1469 / unclosed 6 / fallback 6 / malformed 0`.

## My own observation errors (7th, 8th)

**7th — "Completed but not committed" has no criterion coverage.** L02 stopped after writing the acceptance report, HEAD did not move.
Completion criterion is `HEAD != BASE && 静默`, never triggered; while silence + no failure count increment was judged as suspected tool failure.
**User discovered it before me** ("The neighbor finished, you didn't monitor?"). Added: silence + no count increment + uncommitted output in workspace
→ send **correct** prompt (to commit), independent quota.

**8th — Newly added criterion itself became a false positive source.** L03 in rounds 4 and 5 of 5-round stability verification during `sleep 300`,
was judged as "done but not committed" by the above new criterion, nearly causing it to skip verification. Correction sent and criterion added:
if screen shows `Elapsed NNNs` ticking timer, it is "executing", do not send commit prompt.

**Also: `loop_watch.sh` requires task id parameter, I started it empty-handed twice, it exited immediately,
and I listed it in the "monitoring stack" in my report** — root cause was only counting total process count (5), two of which were Monitor's own.
J01's two hours actually had no idle protection. From now on, verify process names one by one at each startup.

**Lesson**: I have been using indirect signals like "silence" to infer "state", and each blind spot patched may open a new one.
The truly stable signal is **the acceptance report on pi's own screen**. The driver should be changed to read that signal, rather than guessing process silence.

## Pending manual acceptance

M02's 13 manual playthroughs + 5 negative checks **must be completed by humans** (card explicitly states: the three decisive defects of this project
— inverted movement direction, invisible tracers, silent AI firing — were all discovered by manual playthrough, none by automated evidence).
`npm run build && npx vite preview --port 4173` → http://localhost:4173

**The most informative data point has not yet been generated**: whether this version, with test density several times that of the previous two rounds, also plays better.

---

# Manual Playthrough Acceptance Results (2026-09-15, User-Tested)

**This is the most informative segment of this benchmark round. All four defects were discovered through manual playtesting; the orchestrator's screenshot review only anticipated one of them (Item 4).**

## Original User Report

1. **AI is unintelligent** —— Compared to the 8bit and ds-flash versions, the NPCs in this version only fire two shots (whether at enemies or teammates),
   then get stuck in place or wander around randomly, refusing to attack.
2. **Friendly fire logic is broken** —— Hitting a teammate triggers a bleeding effect but does not deduct health (teammates should directly ignore attacks);
   killing an enemy **has no falling-down effect**, it just turns gray in place.
3. **UI mixes Chinese and English**, it is a mess.
4. **After starting, the `NEON BASTION` title is still there**, constantly blocking the view.

(The user explicitly requested: record first, do not modify.)

## Why 793 Unit Tests + 202 E2E Tests Failed to Catch Any of These

### Item 1: The Termination Criterion Can Be Satisfied by a Barely Functional AI

The termination condition for `checkEnd()` is **all 4 members of either side dying** (pure annihilation),
`e07Termination` scans seeds 1..40, asserting that "within 300 **logical** seconds, `state === 'ended'` is true and `winner` is non-empty".

300 logical seconds is 5 minutes of game time compressed by fastForward.
**An AI that occasionally fires two shots is sufficient to kill 4 people cumulatively within 5 minutes.** Therefore, the criterion passes (green).

The tests never measured: engagement rate, time to first contact, sustained suppression, or firing rate per unit time.
The M6 item in M02 (AI firing has sound and light) tests **existence**——"17 shots within 10.4 s after restart"——
while what the user observed was a **persistence** issue. Existence is green, but persistence was never defined.

**The criterion states that "the match will end," but the user wants "the AI will fight." These two are not equivalent, and the gap is visible to the naked eye.**

### Item 2: The Tests Treated Current Behavior as the Specification

The pixel probe assertion in `i01` asserts that corpses appear as "corpse gray":
`blueN ≤ 0.7×before && ≥30 && neutralN > 80` (see `docs/PROBE-AUDIT.md:36`).

**"Turning gray in place" was written as the pass condition.** The falling-down/death animation was never required,
so "no falling-down effect" is not a regression—it is the current state fixed by the assertion.

The L03 audit can prove that this assertion is **not tautological** (it turns red if the color is broken),
but it cannot prove that this assertion **should have asserted something else**. This is exactly the boundary noted in QA-13,
which now has consequences: a diligent assertion has welded a feel-defect into the specification.

Regarding friendly fire: the bleeding effect goes through the D04 `hit` event, while damage settlement goes through a separate team check,
and the two paths handle "same-team hit" inconsistently—the FX layer accepts it, while the damage layer rejects it.
No test cross-checks the conclusions of these two layers on the same event.

### Item 3: Mixed Chinese and English——No One Defined What Is Correct

None of the 56 cards specify the UI language. The HUD in the screenshots is entirely in English
(`BLUE 4 · 0` / `LIVE` / `NAME STATEK H SCORE` / `ALIVE` / `SCORE 0`),
while menus and prompts are in Chinese. **No specification → no assertion → it will not turn red.**
This is a coverage gap in the task document, not an execution error by the model.

### Item 4: PLAY-05, the Only One That Was Anticipated

The orchestrator had already flagged this during the L02 screenshot review (see QA-14 ①) and listed it as "known to be non-compliant" in the checklist delivered to the user.
It has been hanging in the backlog for a long time, **not on the acceptance checklist of any card**, so none of the 55 tasks would touch it.

## Summary: The Failure Levels of the Four Defects Are Different

| # | Defect | Where It Failed |
|---|---|---|
| 1 | AI does not engage | **Wrong metric chosen** (tested "will end" instead of "will fight") |
| 2a | Friendly fire bleeding does not deduct health | **No cross-check between two layers** |
| 2b | No falling-down on death | **Tests wrote current state as specification** |
| 3 | UI mixes Chinese and English | **Never defined in task document** |
| 4 | Title blocks view | **Never covered in task document** (known defect left in backlog for long) |

**None of them are "the model wrote the code wrong."** All four are issues with the verification system:
wrong metric, lack of cross-checking, treating current state as specification, and holes in the specification itself.

## Significance for the Three-Round Comparison

User's subjective ranking: **8bit > ds-flash > this round (mtplx 4bit)**,
while this round's mechanical metrics (code volume, number of tests, test density, layering discipline, negative control coverage) are **the highest of the three rounds**.

The two confounding factors noted previously still hold and are now clearer:
- The 8bit round used an **89-line single task document** (this round: 3,289 lines × 56 cards), so the output scale is not comparable;
- In the 8bit round, the user was **deeply involved, debugging while playing**——the user themselves was the manual playthrough loop.

**This round removed that loop, thereby exposing: the upper limit of automated acceptance is equal to the coverage of the task document.**
56 cards, 3,289 lines of specification, 995 assertions, still missed things like "AI must be able to fight," "people must fall down when they die,"
and "UI should use one language"——
because they are **too obvious**, so obvious that no one would think to write them into the acceptance checklist.

This is the strongest conclusion this benchmark round can offer:
**Fine-grained task cards + automated acceptance optimize for "tests turning green," not for "playing correctly."
The gap between the two does not converge as test density increases——this round's test density is several times that of the previous two rounds, yet the subjective experience is the lowest of the three rounds.**

---

# User Observation Summary (Full Duration, 2026-09-07 → 09-15)

> This section records only the **user's own** observations and judgments, kept separate from the orchestrator's inferences.
> The orchestrator's analysis is found in the preceding sections; any analysis included here is labeled as "Orchestrator Note".

## I. Cross-Sectional Judgment on the Three Benchmark Rounds

**User's subjective ranking: `8bit` > `ds-flash` > `本轮（mtplx 4bit）`.**

| Round | repo | Model/Deployment | Task Spec |
|---|---|---|---|
| 1 | `mlx-dspark-27B-8bit-with-pi-3d-team-arena` | mlx-dspark 27B **8bit** | `3d-team-arena.md`, **89 lines, single file** |
| 2 | `ds-v4-flash-vision-with-dsh-neon-bastion` | Cloud low-spec model (reference baseline) | neon-bastion 56 cards |
| 3 | `mtplx-27B-optimized-speed-with-pi-neon-bastion` | mtplx 27B **4bit** (current round) | neon-bastion 56 cards, **3,289 lines** |

### User's Verbatim Quotes and Self-Reported Confounders

- "The 8bit model produced very good results, and it didn't take as long as the current repo."
- "This repo uses 4bit, **token/s is faster, but it seems slower overall**."
- "ds-v4-flash-vision is another baseline; that one is **output from a cloud low-spec model used as a reference**."
- "I think the 8bit one had better results, **but since the 8bit test was the first time, the entire process was different from the last two rounds. I was deeply involved and debugging, which made it more artificially involved**."
- "**8bit has no vision; that is an mlx-dspark issue**" (The model in the 8bit round lacked vision capabilities, a deployment-side limitation).

**The user themselves identified two key confounders** (deep human involvement, different process), which were later proven to be the most explanatory variables.

### Orchestrator Note: Quantifying "Faster Yet Slower"

| repo | Commits | src lines | Test files | Test lines |
|---|---|---|---|---|
| 8bit / team-arena | 34 | 8,157 | 20 | 4,839 |
| ds-v4 / neon-bastion | 55 | 13,401 | 76 | 16,204 |
| **Current / neon-bastion** | **55** | **16,224** | **108** | **26,721** |

The specification size difference is **37x** (89 lines vs 3,289 lines), and the test output difference is **5.5x**.
**Wall-clock time was never measuring the model** — the three rounds did not perform the same work.
The contradiction of "faster tok/s yet slower" is resolved here: the current round had higher output per unit time, but was required to do much more work.

## II. Manual Playtesting Results (09-15, Four Items)

1. **AI is unintelligent** — Comparing the 8bit and ds-flash versions, the NPCs in this version only fire two shots
   (**regardless of whether at enemies or teammates**), then get stuck in place or wander around, refusing to attack.
2. **Friendly fire/death representation is chaotic** — Hitting a teammate produces a bleeding effect but does not reduce HP (teammates should ignore attacks);
   attacking an enemy to death **has no falling-down effect, only turning gray in place**.
3. **English and Chinese are mixed in the UI**, in a messy manner.
4. **After starting, the title of `NEON BASTION` remains, constantly blocking the view.**

User instruction: **Record first, do not modify.**
Analysis of the failure hierarchy is in the previous section and QA-15 / PLAY-06～09.

## III. User Detected Monitoring Failure Before the Orchestrator (Twice)

Both times, the user noticed that pi had stopped while the orchestrator was still waiting:

- **09-13** "The pi session stopped, what's going on? No updates for a long time."
  → Later determined to be `Working` hitting the spinner regex; the orchestrator waited idly for 1h47m (OPS-39).
- **09-13, slightly later** "Why didn't you continue? The pi session is already done."
- **09-15** "**The neighbor is done, you weren't monitoring?**"
  → L02 stopped after writing the acceptance report, HEAD did not move; "completed but not committed" was not covered by any criterion (OPS-44, 7th occurrence).

**The orchestrator's completion criteria relied on indirect signals such as HEAD advancement + process silence,
while the user used the direct signal of "the report on the screen." The direct signal won all three times.**

## IV. Operational Constraints Set by the User (Valid Throughout)

- **"Turn off the mtplx you started; I will start mtplx myself"** — mtplx must always be started by the user;
  the orchestrator must not launch it independently. After the 09-14 crash, this was executed accordingly: the orchestrator stopped the driver, reported, and waited for the user to restart (OPS-43).
- **"If it has difficulties, you need to intervene"** — Authorization to intervene when the model is blocked.
  This led to two method interventions in I04 and one in J03 (AI-04 / AI-05).
- **"You need to monitor closely to prevent it from getting stuck in a dead loop again"** — Based on this, the `loop_watch.sh` idle detector was built.
- **"Don't submit yet, let's continue observing"** (regarding whether to file an issue for mtplx) — No issue was filed; instead,
  `parse_watch.py` was built for per-request attribution, leading to a clustered conclusion after accumulating n=9.

## V. Other Observations by the User During the Process

- **"What is pi actually calculating? It looks very complex"** (09-13, during I04)
  → After verification by the orchestrator, it was confirmed to be a brute-force enumeration of 12,150 points for a monotonically analyzable quantity,
  with round-trip overhead underestimated by 25x and run for three consecutive rounds — directly contributing to the formation of the AI-04 conclusion.
- **"How many hours have you worked today? How much is left until completion?"** and other progress inquiries,
  which led to the habit of recording time/tokens per task (`timing.log`, `tps.jsonl`).

## VI. Contribution of User Observations to the Current Round's Conclusions

**For QA-15, the strongest conclusion, three of the four supporting points came from the user:**

1. Subjective ranking is **inverse** to mechanical metrics (user's manual test) ← User
2. Human involvement in the 8bit round was a key confounder ← **Pointed out by the user themselves**
3. Four defects including AI not engaging, no falling-down on death, etc. ← User
4. None of the 995 assertions caught it, and none were due to code errors ← Orchestrator verification

**The orchestrator independently predicted only the 4th defect (title blocking the view)**;
the other three (AI behavior, friendly fire/falling-down, UI language) were only exposed during interaction,
fully consistent with the judgment at the beginning of the M02 card:

> Empirical test of this project: The decisive defects in three different rounds — movement direction reversed left/right, tracers completely invisible,
> AI firing completely silent — **were all discovered by manual playtesting, none by automated evidence**.

**This round adds a fourth round of evidence to this statement.**
