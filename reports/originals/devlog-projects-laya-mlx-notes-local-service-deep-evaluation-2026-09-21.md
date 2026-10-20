---
type: Note
title: "Laya Local Service In-Depth Evaluation"
status: current
description: "Empirical testing of concurrency, latency, context, accuracy, and reliability for the laya-multilingual MLX local HTTP service."
tags: [laya, mlx, benchmark, latency, concurrency, context, accuracy, reliability]
timestamp: 2026-09-21T04:52:20Z
---

# Laya Local Service In-Depth Evaluation

[English](devlog-projects-laya-mlx-notes-local-service-deep-evaluation-2026-09-21.md) | [简体中文](devlog-projects-laya-mlx-notes-local-service-deep-evaluation-2026-09-21_CN.md)

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Local inference workstation |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | Apple M5 Max / 128 GB / Python 3.12.13 |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | Darwin 27.0.0; macOS product version not recorded |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

**Test Time:** 2026-09-21 (Asia/Shanghai)  
**Subject Under Test:** `http://127.0.0.1:4002/v1/systemone`  
**Model:** `aac6fef/laya-multilingual-mlx`, GPU FP16, max context 1024 tokens  
**Hardware:** Apple M5 Max, 128 GB unified memory, Darwin 27.0.0, Python 3.12.13  
**Scope Statement:** This is a direct request evaluation of the local `laya-mlx` HTTP service. **It did not go through Pi or pi-laya, and Pi's tools or skills were not tested.**

## Conclusion Summary

The strengths of this service are **fast short requests, deterministic output values, and explicit rejection of out-of-bounds inputs**; the weaknesses are **a hard cliff in the concurrent connection architecture, and insufficient general judgment quality and semantic robustness**.

| Dimension | Conclusion | Key Evidence |
|---|---|---|
| Single Request Latency | Excellent | Short state, 1 noul questions P50 **4.08 ms**, P95 **4.33 ms** |
| Low Concurrency Throughput | Good | At concurrency 4, 160/160 succeeded, approx. **269 req/s**; latency grows nearly linearly with queuing |
| High Concurrency Reliability | Failed | Concurrency 5, 6 stable; concurrency 7 succeeded only **7/64 (10.9%)** in all three rounds, with reset/broken pipe occurrences |
| Context | Reliable boundary, small capacity | All three question types can precisely use **1024 tokens**; adding 1 more test units results in 422; usable state length is affected by question prefixes |
| Judgment Accuracy | Insufficient | 72 manually synthesized set **37/72 (51.4%)**; Low/Medium/High are 58.3% / 54.2% / 41.7% |
| Question Type Capability | Score is clearly weakest | noul 58.3%, choice 58.3%, score **37.5%** |
| Numerical Determinism | Excellent | Replaying the same 3 question payload 60 times, 60/60 succeeded, answer JSON had only 1 variants |
| Semantic Reliability | Poor | Equivalent rephrasing label consistency rate 80%, probability span 0.378–0.951; choice option full permutation only 62.5% correct |
| Confidence Credibility | Poor | Accuracy for samples with confidence ≥0.9 is still only **58.1%** |

**Overall Assessment:** It can be viewed as a low-latency "small discriminator," but it should not be treated as a general reasoning model. If the task involves a fixed schema, narrow domain, can be calibrated with an independent labeled set, and errors are reviewable, it has engineering value; if the task involves negation, temporal ordering, exceptions, multi-step rules, or high-risk decisions, it should not be used directly at present. The service also should not handle concurrent traffic without queuing/rate limiting.

## 1. Test Methodology

### 1.1 Request Path and Warmup

- All tests directly called the loopback HTTP endpoint; no proxy, agent, or tool layer was involved.
- 10 warmup runs were executed before the main tests, keeping model weights resident.
- End-to-end latency was measured from client request dispatch to full JSON return; the `local_metadata.inference_ms` returned by the service was separately observed as pure service inference.
- High-concurrency tests used independent client requests with synchronized start to observe burst connection capability; this is stricter than uniform arrival.
- The main test batch took approximately 12.46 seconds; concurrency boundaries, retries, random context latency, and cache weight startup were re-tested separately.

### 1.2 Accuracy Samples

The accuracy set contains 72 manually labeled synthetic cases:

- 3 output types: `noul` (Yes/No), `choice` (mainly four-choice), `score` (five levels).
- 3 difficulty levels: Low, Medium, High.
- Each "Question Type × Difficulty" unit has 8 questions, totaling 9 units.
- 46 English questions, 26 Chinese questions.
- High difficulty covers negation, exceptions, sequential states, conflicting evidence, and multi-step rules.

This is a diagnostic set targeting weaknesses, not a statistical sample from a real production distribution. Therefore, it is sufficient to reveal failure modes but cannot provide the model's final accuracy on a specific business; an independent, sufficient, and manually reviewed domain holdout set is still required before deployment.

## 2. Latency and Throughput

### 2.1 Short Request Concurrency

A single request contains a short state and 1 noul questions; each tier has 160 requests.

| Concurrent Clients | Success/Total | Success Rate | Successful Throughput | P50 | P95 | P99 |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 160/160 | 100% | 233.5 req/s | 4.08 ms | 4.33 ms | 4.44 ms |
| 2 | 160/160 | 100% | 267.7 req/s | 7.38 ms | 7.54 ms | 7.69 ms |
| 4 | 160/160 | 100% | 269.0 req/s | 14.77 ms | 14.97 ms | 15.11 ms |
| 8 | 8/160 | 5.0% | — | 17.69 ms* | 23.04 ms* | 23.08 ms* |
| 16 | 5/160 | 3.1% | — | 39.02 ms* | 45.64 ms* | 46.18 ms* |
| 32 | 8/160 | 5.0% | — | 17.86 ms* | 23.23 ms* | 23.26 ms* |

\* Percentiles for failed tiers only count a small number of successful requests and do not represent overall service latency; failed requests were mainly connection reset, broken pipe, and local socket errors.

At concurrency 1, 2, and 4, throughput capped at approx. 269 req/s, while P50 grew roughly by 1×, 2×, and 4×. This indicates that core inference is serial; adding clients did not increase model execution parallelism, only queuing.

After changing to 8 questions per request and 96 requests per tier, the conclusion remained the same: concurrency 1/2/4 all had 96/96 successes, with P50 of 5.60/10.48/20.99 ms respectively; concurrency 8/16/32 all only had 7/96 successes. This rules out the accidental phenomenon of "occurring only in single-question payloads."

### 2.2 Concurrency Cliff Localization

To locate the boundary, concurrency 5–8 was repeated for 3 rounds, with 64 short requests per round:

| Concurrent Clients | Three-Round Success Status | Typical P50 | Judgment |
|---:|---|---:|---|
| 5 | 64/64, 64/64, 64/64 | 18.0–19.8 ms | Stable |
| 6 | 64/64, 64/64, 64/64 | 21.4–21.5 ms | Stable |
| 7 | 7/64, 7/64, 7/64 | 15.5–15.7 ms* | Stable reproduction of cliff |
| 8 | 6/64, 7/64, 7/64 | 13.9–15.8 ms* | Massive connection failures |

The root cause aligns highly with the implementation: `local_server.py:5,91` uses single-threaded Python `HTTPServer`, and comments explicitly state that GPU inference is serial on the main thread. The default listen backlog is small; when 7 connections rush in synchronously, connections not yet accepted are rejected or reset by the kernel. This is not the model slowing down, but **the HTTP access layer dropping requests before the model starts processing**.

After client retries up to 6 times with 5 ms exponential backoff: concurrency 8 had 98/100 successes, concurrency 16 had 90/100, concurrency 32 had 75/100; P99 rose to 70.2, 130.4, and 180.7 ms respectively. Retries can only mitigate, not replace, server-side bounded queues and overload responses.

### 2.3 Long State and Batch Questions

Randomly interleaved execution of single noul requests at 50 times/tier to avoid warmup bias caused by length ordering:

| `alpha` state units | P50 End-to-End | P95 End-to-End | P50 Inference |
|---:|---:|---:|---:|
| 50 | 4.13 ms | 10.49 ms | 3.67 ms |
| 250 | 5.72 ms | 26.31 ms | 5.13 ms |
| 500 | 7.48 ms | 8.09 ms | 6.80 ms |
| 750 | 10.10 ms | 10.69 ms | 9.23 ms |
| 950 | 11.50 ms | 12.04 ms | 10.56 ms |
| 990 | 11.59 ms | 12.18 ms | 10.64 ms |

The 50 and 250 unit tiers showed minor system jitter, so P95 was not monotonic; the median grew smoothly with input length. At approx. 900 units of near-full context:

| Questions per Request | Success | P50 | P95 | P50 Inference |
|---:|---:|---:|---:|---:|
| 1 | 30/30 | 13.22 ms | 14.02 ms | 12.30 ms |
| 8 | 30/30 | 60.31 ms | 62.71 ms | 59.31 ms |
| 32 | 30/30 | 250.05 ms | 260.07 ms | 248.57 ms |

Question count expansion was nearly linear; 32 questions once showed a P99 outlier of approx. 482 ms. The service contract allows 1–64 questions: 64 short questions returned 200, approx. 29.07 ms; 65 questions correctly returned 422.

### 2.4 Startup Time

Two identical processes were started on temporary ports; time from spawn to `/health` ready was **1.867 seconds** and **1.510 seconds** respectively. This is the startup time after weights are cached locally, excluding the initial download. Temporary processes were stopped by PID, and the original 4002 service subsequently still passed health checks.

## 3. Context Length Support

`/health` reports `max_context_tokens: 1024`. The service budgets state tokens together with the formatted prefix of each question; it does not silently truncate state. Binary search yielded:

| Question Type | Max Acceptable `alpha` Units | Actual Input Tokens of Accepted Request | First Rejected Unit | Rejection Behavior |
|---|---:|---:|---:|---|
| Short noul | 992 | 1024 | 993 | HTTP 422 |
| 4-item choice | 996 | 1024 | 997 | HTTP 422 |
| 5-level score | 983 | 1024 | 984 | HTTP 422 |

The error body was `State exceeds model context after question formatting; shorten the input`. All three question types proved that the 1024 boundary is truly usable, and out-of-bounds is an explicit failure; however, "how much state can be written" is not a fixed number, because questions, options, and instructions occupy different tokens. Callers should budget in advance and cannot just trim by character count.

## 4. Judgment Accuracy

### 4.1 By Difficulty

| Difficulty | Correct/Total | Accuracy | Average Probability of Correct Label |
|---|---:|---:|---:|
| Low | 14/24 | 58.3% | 0.598 |
| Medium | 13/24 | 54.2% | 0.525 |
| High | 10/24 | 41.7% | 0.410 |
| **Overall** | **37/72** | **51.4%** | **0.511** |

Performance declined as difficulty increased, especially high-difficulty choice only had 2/8. Low difficulty also only had 58.3%, indicating that the problem is not just "insufficient reasoning depth," but basic negation and score mapping are also unstable.

### 4.2 By Question Type and Difficulty

| Question Type | Low | Medium | High | Overall |
|---|---:|---:|---:|---:|
| noul | 75.0% | 37.5% | 62.5% | 14/24 (58.3%) |
| choice | 75.0% | 75.0% | 25.0% | 14/24 (58.3%) |
| score | 25.0% | 50.0% | 37.5% | 9/24 (37.5%) |

Score is the most obvious weakness: outputs tend to collapse to the middle range, and even cases with semantically obvious low or high risk are misclassified. Choice performs adequately on simple classification, but exhibits strong first-option/surface-word bias as the number of rules increases.

English is 24/46 (52.2%), Chinese is 13/26 (50.0%). The closeness of the two does not imply language equivalence, as the sample size is small and questions were not translated pair-by-pair; this round can only state that no massive Chinese-English gap was observed.

### 4.3 Typical Failures

- **Negation oversight:** `No files were deleted.` was judged as "deleted" with high confidence; `备份尚未完成。` was judged as "completed" with high confidence.
- **Current state overwritten by early events:** The primary node failed but the replica had taken over and was serving traffic, yet it was still judged as "currently unavailable."
- **Exception quantifier failure:** "Every request passed except one health probe" was judged as "all requests passed."
- **Rule/order bias:** High-difficulty choice questions show a clear preference for the first option `alpha`.
- **Score mid-range collapse:** Even for evidence corresponding to extremely low/high scores, intermediate scores 1 are often output.

## 5. Reliability and Calibration

### 5.1 Numerical Determinism and Batch Consistency

- Repeating the same 3 question payload 60 times: 60/60 successful, with identical answer JSON.
- Requesting the same noul, choice, and score individually versus in the same batch yields item-by-item identical results.

Therefore, under the same input and same batch shape, the service exhibits good numerical determinism; this is consistent with the repository's existing MLX/upstream parity results. However, "repeatedly getting the same answer" does not equal "the answer is correct."

### 5.2 Sensitivity to Equivalent Rewrites

For the same fact "first payment failed, retry succeeded," using 5 semantically equivalent English phrasings: 4/5 output yes, with a label agreement rate of 80%; `p(yes)` ranges from **0.3782** to **0.9505**. One phrasing crosses the 0.5 decision boundary, with a probability amplitude reaching 0.5723.

This means the service is suitable for fixed templates, not for allowing end-users to freely phrase queries and directly treating probabilities as confidence.

### 5.3 Choice Option Order Sensitivity

Permuting the options of the same 4 select 1 question in all 24 permutations, the correct answer `billing` was only hit in **15/24 (62.5%)**; the model also output `sales` and `other`. The range of `p(billing)` is **0.2682–0.6670**. Without changing the semantics, merely changing the option order is sufficient to change the label.

This is a serious decision reliability issue. If choice is used in production, at least stable sorting, position randomization evaluation, or multi-permutation voting should be performed; a more fundamental solution is to retrain/calibrate with target domain data.

### 5.4 Confidence Cannot Serve as a Safety Valve

| Confidence Threshold | Coverage | Accuracy within Threshold |
|---:|---:|---:|
| ≥0.6 | 86.1% | 56.5% |
| ≥0.8 | 68.1% | 59.2% |
| ≥0.9 | 43.1% | 58.1% |

Raising the threshold did not significantly improve accuracy; ≥0.9 is even slightly lower than ≥0.8. It is evident that these probabilities are poorly calibrated on this round's out-of-distribution inference set and cannot be used as a basis for automatic pass-through or high-risk decisions without domain calibration.

## 6. Relationship with Existing Repository Benchmarks

The existing results in repository `BENCHMARKS.md` provide two types of important but different evidence:

- On Apple M3 Max, the direct runtime benchmark for `laya-multilingual` MLX FP16 is: short input 1 questions P50/P95 7.39/7.79 ms, 10 questions 27.39/28.02 ms, 50 questions 127.56/142.77 ms; for full 1024 context, the P50 for 1/10 questions is 37.63/389.49 ms.
- Accuracy on 256 AG News samples is 94.53%, consistent with upstream 256/256; however, the documentation explicitly states that AG News appears in the upstream training mix, so this is closer to narrow-domain classification capability and port fidelity verification, and cannot be extrapolated to general reasoning accuracy.
- FP16 weights are 614 MiB; peak for 1 short questions is 687.6 MiB, peak for 10 full context questions is 1501.7 MiB.
- In the 63 question parity test on the real checkpoint, FP16 and upstream argmax matched in 63/63 cases, with a maximum calibrated probability error of 0.0012887; active memory growth over 100 repetitions was 0.

This round's HTTP results are consistent with the above "fast runtime, stable port numerics," while filling in the parts not answered by existing benchmarks: **service access layer fails under high concurrency, and the model is unreliable under out-of-distribution, multi-step, negation, and order changes.** The two sets of results do not contradict each other; they measure implementation fidelity/narrow-domain classification and more open semantic generalization, respectively.

## 7. Recommended Usage Boundaries

Considerable for use:

- Narrow-domain classification with fixed templates and fixed label schemas.
- Scenarios with a real business holdout set, quantifiable acceptance thresholds, and allowance for human review or rule-based fallback.
- Low-concurrency local pipelines, or scenarios where a single-consumer bounded queue already exists upstream.
- Treating model probabilities as one of the ranking features, rather than uncalibrated "confidence."

Not recommended for direct use:

- General judgments involving negation, exceptions, temporal conflicts, multi-step policy rules, etc.
- High-risk automatic decisions in safety, finance, healthcare, permissions, etc.
- User free-input prompts, especially scenarios where choice option order changes.
- Services where 7 or more connections may burst simultaneously and failure is not allowed.

## 8. Fix Priorities

1. **Fix concurrent access first:** Use a threaded acceptor to receive/validate requests, then hand them off to a separate bounded serial inference worker; return 429/503 and `Retry-After` when the queue is full. Do not allow multiple threads to enter MLX GPU inference simultaneously.
2. **Establish a real domain holdout set:** Weighted by language, question type, difficulty, and business loss; record confusion matrix, recall, Brier/ECE, and selective risk.
3. **Address semantic sensitivity:** Fix prompts; perform full-permutation consistency regression for choice; correct negation, exceptions, and score mid-range collapse.
4. **Then perform long-term stability:** 15–60 minute constant arrival rate and burst mixed soak, while recording queue wait, RSS/unified memory, MLX peak/cache memory, and system thermal pressure.

Open items have been registered in the backlog (historical local file, not released with this report).

## 9. Limitations and Reproducible Evidence

- This round is single-machine, single-model, single-precision, single test window; it does not represent other Macs or the first-time download experience.
- High concurrency is synchronous burst, not Poisson/constant arrival rate; it deliberately tests the worst-case access boundary.
- The accuracy set contains only 72 synthetic samples, sufficient to identify weaknesses but not a substitute for production domain benchmarks.
- This round did not perform long-term thermal stability, power consumption, temperature, or independent GPU unified-memory peak measurements.
- During testing, raw JSON was written to `/tmp/laya_service_eval_results.json` and `/tmp/laya_service_followup_results.json`; `/tmp` is non-persistent storage, and this report retains key summaries. Service implementation evidence is in `$HOME/Code/laya-mlx/local_server.py:1-95`, existing performance/fidelity evidence is in `$HOME/Code/laya-mlx/BENCHMARKS.md`.

After testing ended, the 4002 service with PID 19317 continued running, with `/health` returning `status: ok`, GPU, and 1024-token context.
