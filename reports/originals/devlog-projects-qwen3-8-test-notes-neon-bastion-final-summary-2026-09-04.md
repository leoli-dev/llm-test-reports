---
type: Note
title: "Neon Bastion Seven-Round Summary — Can Qwen3.8-27B-8bit Build a Slightly Complex Game"
status: current
description: "Comprehensive conclusions across seven rounds: complete statistics of 31 commits / 9766 lines / 30 hours, the model's two capability boundaries (root cause identification does not converge, and images are invisible in this deployment), the archiving of four types of issues, and a cost comparison converted based on the official Qwen Max pricing list."
tags: [neon-bastion, qwen3.8-27b, mlx-dspark, dflash2, pi, agent-evaluation, methodology, benchmark]
timestamp: 2026-09-04T03:10:00Z
---

# Neon Bastion Seven-Round Summary

[English](devlog-projects-qwen3-8-test-notes-neon-bastion-final-summary-2026-09-04.md) | [简体中文](devlog-projects-qwen3-8-test-notes-neon-bastion-final-summary-2026-09-04_CN.md)

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

> **This page is a cross-round synthesis and does not repeat the details of each round.** See the per-round evidence in
> [R1](devlog-projects-qwen3-8-test-notes-neon-bastion-round-1-review-2026-09-01.md) ·
> [R2](devlog-projects-qwen3-8-test-notes-neon-bastion-round-2-review-2026-09-02.md) ·
> [R3](devlog-projects-qwen3-8-test-notes-neon-bastion-round-3-review-2026-09-02.md) ·
> [R4](devlog-projects-qwen3-8-test-notes-neon-bastion-round-4-review-2026-09-02.md) ·
> [R5](devlog-projects-qwen3-8-test-notes-neon-bastion-round-5-review-2026-09-03.md) ·
> [R6](devlog-projects-qwen3-8-test-notes-neon-bastion-round-6-review-2026-09-03.md) ·
> [R7](devlog-projects-qwen3-8-test-notes-neon-bastion-round-7-review-2026-09-04.md).
>
> Shareable version of the same content: <https://claude.ai/code/artifact/dda938e4-1ac8-4155-bf38-6012d6c748d0>

## Conclusion

The user's positioning for this test was: **"What I want is to test whether qwen3.8-27B-8bit can actually build a slightly complex game."**

**The answer is yes. But how far it can go depends on whether the acceptance criteria can be written as a number that it can read itself.**

For things that can be written as numbers (brightness lower bounds, seam contrast, termination, invariants, pixel variance), it works fast and correctly, and even proactively adds negative controls. For things that cannot be written as numbers (whether it looks like a leaf, whether the gun is held in the hand, how large the view model should be), everything it delivers requires a human to look at the image to judge—and in this round, it cannot even see the images.

**Over seven rounds, the reviewer changed their own methodology seven times, and the model changed the code thirty-one times. The difficulty of writing clear acceptance criteria exceeded the difficulty of getting the model to write the implementation.**

## Delivery Statistics (Independently tallied by the reviewer; agent self-reports not adopted)

| Dimension | Value | Source |
|---|---|---|
| Commits | **31** (`545c546` → `31bb8d3`) | git log |
| Code Changes | 62 files, **+9,766 / −882** | `git diff --shortstat` |
| Source Code Size | `src/` 8,157 lines TS, `tests/` 4,839 lines | `wc -l` |
| Unit Tests | 31 → **149** (19 files) | vitest |
| E2E Scenarios | 5 → **26** | playwright |
| pi Net Working Time | **30.0 hours** (35 sessions) | Session jsonl creation/modification times |
| Model Requests | **1,688** | Session jsonl `usage` |
| Tokens | Missed input 4,092,218 · Cache read 93,428,863 · **Output 1,805,870** | Same as above |
| Thinking Volume | **3,777,115 characters** | Session jsonl `thinking` part |
| Tool Calls | **1,836** (bash 927 / edit 421 / read 403 / write 85) | Same as above |
| Tool Failure Rate | **3.4%** (62 / 1,836) | `isError` count |

Server-side (`/metrics`): mean accept_len **3.17**, draft acceptance rate **55.9%**, `auto_cap.p` 0.759 / cap 4, decode **19.1 tok/s**, prefix cache reuse rate **94.6%**, MLX allocator peak **72.1 GB** / active 57.0 GB.

## Task Duration: Logic Tasks vs. Art Tasks

With the same model, the same workflow, and the same person breaking down tasks, the median duration differs by **2.4 times**.

| Round | Task Nature | Median Duration | Total | Stalled Tasks |
|---|---|---:|---:|---|
| R4 | Logic and Gameplay (11 items) | **22m** | 6.3h | AI-01 176m |
| R6 | Art and Presentation (11 items) | **52m** | 11.4h | Closing ART-15/16 206m |

**The two abnormally long tasks were the only two stalls among all twenty-two tasks; their commonality was not difficulty, but the requirement that "the model itself must figure out why this is happening."** The remaining twenty tasks were all "do a specific, clearly defined task according to verifiable acceptance criteria," with a median duration of 27 minutes.

## Capability Boundaries

### Boundary 1 · Root Cause Localization Does Not Converge (Model Intrinsic)

The two stalls exhibited identical patterns; **neither was a case of "inability to write code."** In the AI-01 instance, it repeatedly switched hypotheses regarding "why this unit only fired 2 shots"—FOV? Reaction delay? Target switching? Health threshold?—each was plausible, but it could not efficiently narrow down the scope from the 300-second simulation, burning through 176 minutes and 369,000 thinking characters (36.9 × 10,000; the other nine tasks totaled 420,000, or 42 × 10,000).

The intervention method was to run the same scenario in an **independent copy**, printing state tick-by-tick, and directly providing the root cause to it. **After receiving the root cause, it converged in 30 minutes and independently uncovered three deeper defects** (one of which was silent bullet expiration breaking the "every bullet must be settled" invariant, which has existed since `328dae6`).

> **Given clear local goals and verifiable acceptance criteria, it can complete them independently; once it needs to perform root cause localization in a multi-factor coupled system, it will continue to consume resources without converging. However, once the root cause is provided, its execution capability remains strong, and it can even trace the thread to discover deeper issues.**

### Boundary 2 · It Cannot See Images (Caused by this deployment, not model capability)

All eleven tasks in R6 were art tasks; **all five visual defects were discovered by humans looking at screenshots, and pi did not detect any** (ART-07 / ART-14 / ART-15 / ART-16 / ART-17). The root cause is detailed in [mlx-dspark cannot provide visual input for Qwen3.8-27B](devlog-projects-qwen3-8-test-notes-mlx-dspark-vision-unavailable-2026-09-03.md) (OPS-11).

The only thing pi could do was "write pixel statistics assertions and then read that number," so its acceptance criteria were all regional statistics—**such assertions can prove that changes took effect, but cannot prove that it looks correct**.

**The first five rounds were all logic tasks; the model was in a text closed-loop, able to see the results itself, and performed excellently; in the sixth round, the closed-loop was broken, and someone had to serve as the eyes.** The difference lies not in reasoning ability, but in the fact that in this round, it could not receive feedback.

## Archiving of Four Types of Issues

### A · mlx-dspark Infrastructure

| ID | Issue | Page |
|---|---|---|
| OPS-10 | Under long context, drafter KV cache offset runs ahead of the empty cache, causing a guaranteed crash (reported upstream #33) | Bug page (historical local file, not published with this report) |
| OPS-11 | In this deployment, the model has no vision, and it is **silently discarded** (three discard points, measured `prompt_tokens: 17`) | [note](devlog-projects-qwen3-8-test-notes-mlx-dspark-vision-unavailable-2026-09-03.md) |
| — | Output limit truncation: after lowering `--max-tokens-cap` to 16,384, it truncated legitimate long answers (context usage only 17.8%), discarding 14 minutes of generation | [R1](devlog-projects-qwen3-8-test-notes-neon-bastion-round-1-review-2026-09-01.md) |

**Lesson**: The output limit must be set based on the longest **legitimate** output, not based on the longest tolerable wait time—truncation discards all generation, whereas a long wait at least yields a result.

### B · Model Behavior

- **Root cause localization does not converge** (twice, totaling approximately 6 hours, accounting for 36% of total task time)—see Boundary 1
- **Feeding long specifications all at once hits the output limit**: Feeding a 178-line specification in its entirety → generated 32,768 tokens of thinking, **zero body text** (`stop=length`, thinking 118,179 characters, text 0 characters). Subsequently, all were split into self-contained tasks of 16–28 lines, and it has not recurred
- **README once fabricated six non-existent operations** (R2 DOC-02), which is more severe than R1's "omission of unimplemented items." After the R3 fix, it proactively added *"Not yet implemented (honest list)"*; **by the R7 wrap-up task, it had already learned to proactively mark commits as `(partial)` and explicitly list item by item what was not achieved**—this is the most obvious behavioral improvement across the seven rounds
- **R7 Operational Error**: During A/B comparison, it restored `testHooks.ts` to `src/render/` instead of `src/`, causing import resolution failure, `tsc`/`build` silently failed, and subsequent Playwright runs were all on old artifacts, meaning the two arms of the A/B test were actually the same binary. It honestly invalidated all intermediate numbers in its commit message

### C · Methodology (Reviewer's Own Mistakes)

| Round | Mistake | General Rule |
|---|---|---|
| R1 | Gave 77 points based on static review only | Agent only verifies against **its own written tests**, not against the problem statement |
| R2 | Blind review 87, revised down to 74 after manual playtesting | Static review + headless testing + screenshots, the combination of all three **still cannot verify playability** |
| R3 | Judged `hitKick`/`shotKick` as dead constants, inducing the model to delete specification clues | Tests covered **causality**, but never covered **presentation** |
| R4 | Gave the adjective "brighten" for two consecutive rounds, once insufficient and once excessive | When the same type of issue is fed back for the third time, **the problem lies in the lack of acceptance criteria** |
| R5 | When splitting line-of-sight/ballistics in MAP-02, left second-order consequences → seed 27 permanent livelock | When splitting existing judgments, one must check **state machines that depend on "these two things being equivalent"**, not just call sites |
| R6 | — | **First determine if the property is adjustable** (e.g., WebGL ignores `linewidth`), then define acceptance criteria |
| R7 | Attributed **all** of the ART-16 dark area to glass, and wrote "no need to re-investigate" | Measured binning: edge board 73% / view model 22%. The attribution error was in **exclusivity** rather than the target; and telling the implementer not to re-check was equivalent to depriving it of the opportunity to discover the second source |

**R4 was the most useful**: When the user said "the screen is too dark" for the third time, we measured before proposing (`meanLuma 21.4/255`, `darkFrac 0.748`, no pixel in the entire image exceeded L=96), and wrote the acceptance criteria as five numerical values to get it right in one go. Among them, `mean(R) − mean(B) ≤ 40` is a **reverse constraint** to prevent the recurrence of the previous round's "too warm" issue—providing only a lower bound would induce "whitening all materials."

**Another point**: Randomization automatically thins out deterministic regressions that were originally sufficient, **and no test will turn red to remind you**. pi's 3-seed run was all green, but the reviewer scanned 40 seeds and caught a permanent livelock at seed 27; after the fix, scanning 41..160, 119/120 passed (seed 74 still deadlocked, BUG-02).

### D · Process and Tools

**Four instances of the same failure mode—green tests may be unrelated to the code under test** (see OPS-12):

| # | Instance | Consequence |
|---|---|---|
| 1 | Forgot to run `npm run build` before running E2E | Tested the previous build's artifact |
| 2 | Two agents shared one `dist/` and one preview server | Tested the other party's artifact |
| 3 | `npm run build` failed but no one checked the return code | Tested an artifact that no longer exists |
| 4 | The zoomed-in view model drifted into the fixed screen-space sampling window (ART-18) | Assertions tested something else |

The root cause of the first three was the same configuration line: `playwright.config.ts`'s `webServer` was `vite preview` (**serving only `dist/`, not building**) plus `reuseExistingServer: true` with a fixed port 4173.

> **Key property: a stale but valid `dist/` is indistinguishable from a fresh one at the HTTP layer.** This type of problem **cannot be blocked by adding any number of assertions**—there is no signal within the suite to distinguish them. The fix consists of two engineering constraints: making the build return code a hard gate, and assigning an independent port to each runner. `reuseExistingServer: !process.env.CI` is the idiomatic way to write it, but here it is exactly the opposite.

**Two agents feeding the same pi session simultaneously**: R7 experienced a real race condition, with both sides' `/new` separated by 23 seconds, and the session that started first was flushed. It is worth noting **why focus validation could not prevent this**—both sending scripts first confirmed they were facing pi's pane, and each was correct, but it guarantees "I didn't hit the wrong window," not "no one else is hitting this window." **Cross-session exclusivity must use locks, not validation.** Note that `flock(1)` does not exist on macOS (it belongs to util-linux); an atomic `mkdir` + expiration check is required.

**Two operational errors by the reviewer themselves**, with the same root cause (assuming terminal operations took effect without verifying): After sending Ctrl-C to the server pane, assumed it would auto-restart (it was an interactive shell, and the service stopped for ten minutes); typed `/new` and the entire task prompt into their own pane. Afterwards, focus validation and read-back assertions were added to the sending scripts.

## Cost Comparison (Converted according to Qwen's official price list)

| Item | Usage | Qwen3.8-Max International Site | Qwen3.8-Max China Site |
|---|---:|---:|---:|
| Non-cached input | 4,092,218 | $8.18 | ¥49.11 |
| Cached hit read | 93,428,863 | $18.69 | ¥112.11 |
| Output (including thinking) | 1,805,870 | $10.84 | ¥65.01 |
| **Total (with cache discount)** | — | **$37.71** | **¥226.23** |
| Total (no cache hits at all) | — | $205.88 | ¥1,235.26 |

Unit prices: International site $2 / $6 per million tokens, cached hits at 10% of standard input price; China site ¥12 / ¥36, cached hits ¥1.2. **The 5.4x swing is entirely in the cache**—those 93.43 million "hits" (9,343 × 10,000) are reuse of mlx-dspark's **local** prefix cache (measured reuse rate 94.6%); Bailian's context cache has TTL and hit conditions, and cannot reach this level, so the real bill will likely fall between the two columns, leaning toward the side with cache.

**The significance of this number is not that ¥226 was saved.** Running locally for three days took **30 hours** of idle time, with electricity costs of less than 2 kWh, costing less than ¥2; saving money is real; but conversely, it is **¥226 for 30 hours**, and commercial API throughput is more than ten times the local 19 tok/s, so the same workload could be completed in about 3 hours. **If time has value, this account is reversed.** The value of the local solution lies in running through a long chain of 31 commits without quota limits, and the data does not leave the machine.

## Speed: tok/s is a deceptive health signal

This project observed a significant slowdown (21 → 11 tok/s), initially misattributed to longer context. Re-testing and decomposition proved that **round speed remained almost unchanged** (5.59 → 5.55 rounds/second), with all differences coming from acceptance length (1.96 → 3.79 tokens/round): `auto_cap.p` recovered from 0.601 to 0.865, and the controller relaxed the draft depth from 2 to 4.

**Acceptance rate is content-dependent, not context-dependent** (91% for coding, 28% for prose). **To monitor speed, look at `accept_len` and `auto_cap.p`, not the context percentage.** `predicted_rates` treats the time per round as a constant, which is systematically optimistic (predicted 40.9, measured 21), and cannot be used as a baseline.

A counter-intuitive point: **Context compression is not purely a cost; it is the only operation that can reduce `ms/round`** (185 → 133 ms, i.e., 12–22 → 23–28 tok/s). Opening a larger context window to avoid compression is trading a one-time pause for a permanently slower interval.

## If we did it again

1. **Establish measurable criteria in the first round**, do not wait until the third feedback. Before feeding any subjective requirements, ask first: how is success defined? If you cannot answer with a number, the task specification is not yet complete.
2. **Determine feasibility first, then define acceptance criteria.** The root cause of "ballistics being too thin" is that WebGL ignores `linewidth`—in the face of platform limitations, any acceptance criteria are meaningless.
3. **Write negative controls for each assertion and commit them to the repository.** The model does this on its own (it proactively did so for the R4 wrap-up task), but negative controls not written into the repository are equivalent to not being done—the A/B test for glass transparency (149 red pixels on the glass side / 0 on the foliage side) has still not been committed to the repository to this day.
4. **Turn build return codes into hard gates, and assign independent ports to each runner.** Three of the four instances of "green tests unrelated to the code under test" were caused by this.
5. **Connect the eyes.** Start a second small VL provider (4B–8B, approx. 5–10 GB) specifically to view screenshots; the key premise is that the visual path does not need to be fast. However, it cannot replace all judgment.
6. **Make manual playtesting a mandatory part of the process.** The decisive defects in the three rounds (inverted panning, invisible tracers, completely silent AI firing) were all discovered through manual playtesting, **none were discovered by automated evidence**.
