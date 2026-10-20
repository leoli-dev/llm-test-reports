---
type: Note
title: "Comparative Evaluation of Cloud Jev and Local Laya"
status: current
description: "Based on the same 72 questions and similar stress tests, this report compares the quality, latency, context, concurrency, reliability, and deployment boundaries of Cloud Jev and local laya-mlx."
tags: [Jev, laya, comparison, benchmark, local-model, cloud-model]
timestamp: 2026-09-21T05:42:26Z
---

# Comparative Evaluation of Cloud Jev and Local Laya

[English](devlog-projects-jev-tests-notes-jev-vs-local-laya-comparison-2026-09-21.md) | [简体中文](devlog-projects-jev-tests-notes-jev-vs-local-laya-comparison-2026-09-21_CN.md)

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

**Comparison Targets:**

- Cloud Jev: `127.0.0.1:4001` proxy → Vercel → `typesafe-ai/jev`
- Local Laya: `127.0.0.1:4002` → `aac6fef/laya-multilingual-mlx`, Apple M5 Max GPU FP16

**Core Fairness:** Both models use exactly the same 72 states, questions, criteria, and human labels. Latency, context, and concurrency tests use identical or corresponding payload shapes; due to cloud rate limiting for Jev, load sample counts and backoff strategies are annotated separately, and not all numbers should be treated as microbenchmarks in the same environment.

## One-Sentence Conclusion

**Choose Jev for quality priority; choose local Laya for speed, privacy, offline capability, and cost control priority; however, with the current implementation, neither is qualified for high-concurrency scenarios if deployed directly.** Jev leads by 40.3 percentage points on the same 72 questions and comprehensively wins in semantic robustness; Laya is more than two orders of magnitude faster, fully local, and bit-for-bit deterministic for the same input.

## 1. Overview

| Dimension | Cloud Jev | Local Laya | Winner |
|---|---|---|---|
| Overall Accuracy on 72 Questions | **91.7%** | 51.4% | Jev |
| High-Difficulty Accuracy | **75.0%** | 41.7% | Jev |
| noul / choice / score | **100 / 91.7 / 83.3%** | 58.3 / 58.3 / 37.5% | Jev |
| Equivalent Rewriting | **5/5; p 0.95–0.97** | 4/5; p 0.378–0.951 | Jev |
| Full Permutation of Choice Order | **24/24** | 15/24 | Jev |
| ~1K state, 1 questions P50 | 1,403 ms | **13.22 ms** | Laya, ~106× faster |
| ~1K state, 32 questions P50 | 1,591 ms | **250.05 ms** | Laya, ~6.4× faster |
| Max Observed Successful Input | **25,272 tokens**, but more 503 for long inputs | 1024 tokens, strictly reliable boundary | Jev capacity; Laya predictability |
| Repeated Complete JSON | 30 times 21 types | **60 times 1 types** | Laya |
| Burst Concurrency | Affected by 429/reset after C4 | Reset cliff after C6 | Both need fixing |
| Data Boundary | State sent to cloud | **Fully local** | Laya |
| Offline Capability | None | **Yes** | Laya |

## 2. Accuracy on Same 72 Questions

### 2.1 By Difficulty

| Difficulty | Cloud Jev | Local Laya | Difference |
|---|---:|---:|---:|
| Low | **24/24 (100%)** | 14/24 (58.3%) | +41.7 pp |
| Medium | **24/24 (100%)** | 13/24 (54.2%) | +45.8 pp |
| High | **18/24 (75.0%)** | 10/24 (41.7%) | +33.3 pp |
| **Overall** | **66/72 (91.7%)** | **37/72 (51.4%)** | **+40.3 pp** |

Jev's errors are concentrated in two types of high-difficulty questions: mechanical "first match" rules and severity scoring for short-term all-user interruptions in history. Laya's error scope is broader, including basic negation, current state, exception quantifiers, option position bias, and mid-range collapse in score.

### 2.2 By Question Type

| Question Type | Cloud Jev | Local Laya | Difference |
|---|---:|---:|---:|
| noul | **24/24 (100%)** | 14/24 (58.3%) | +41.7 pp |
| choice | **22/24 (91.7%)** | 14/24 (58.3%) | +33.4 pp |
| score | **20/24 (83.3%)** | 9/24 (37.5%) | +45.8 pp |

Jev can already reliably handle negation, temporal logic, and medium-complexity routing in this round; Laya cannot yet serve as a general semantic judge. In particular, the score difference is 45.8 percentage points, indicating that Laya's low latency cannot mask task mismatch.

### 2.3 Language and Confidence

| Metric | Cloud Jev | Local Laya |
|---|---:|---:|
| English Accuracy | **93.5%** | 52.2% |
| Chinese Accuracy | **88.5%** | 50.0% |
| Confidence ≥0.9 Coverage | **93.1%** | 43.1% |
| Accuracy with Confidence ≥0.9 | **94.0%** | 58.1% |

Jev's probabilities are more discriminative on this set of samples; Laya has too many high-confidence errors, so reliable refusal cannot be constructed using confidence thresholds at this stage. Even so, Jev also has high-confidence error cases, and domain calibration is still required when involving high-risk business.

## 3. Latency and Batching

### 3.1 Same Short to Near-1K State

| `alpha` units | Jev P50 | Laya P50 | Laya ~Faster |
|---:|---:|---:|---:|
| 50 | 2,466 ms | 4.13 ms | 597× |
| 250 | 1,742 ms | 5.72 ms | 305× |
| 500 | 1,598 ms | 7.48 ms | 214× |
| 750 | 1,624 ms | 10.10 ms | 161× |
| 950 | 1,970 ms | 11.50 ms | 171× |
| 990 | 1,656 ms | 11.59 ms | 143× |

Jev's provider attempt P50 is approximately 121–157 ms, but end-to-end P50 is 1.6–2.5 seconds, with most time spent on network, gateway, and scheduling. Laya executes directly on the local machine, with a clear context growth curve and no cloud long tail.

### 3.2 Same ~900-unit State, Increasing Question Count

| Question Count | Jev P50 | Laya P50 | Laya ~Faster |
|---:|---:|---:|---:|
| 1 | 1,403 ms | 13.22 ms | 106× |
| 8 | 1,499 ms | 60.31 ms | 24.9× |
| 32 | 1,591 ms | 250.05 ms | 6.4× |

Laya's question execution grows nearly linearly; Jev's network fixed cost dominates, with only about 188 ms increase from 1 to 32 questions. **If choosing Jev, batching is the decisive optimization; if immediate per-question judgment for each event is required, Laya's latency advantage is huge.**

## 4. Context

### Local Laya

- The health endpoint explicitly reports 1024 tokens.
- noul, choice, and score are all verified to be usable up to exactly 1024; adding one more test unit results in HTTP 422.
- No silent truncation; errors are explicit; capacity is small but behavior is predictable.

### Cloud Jev

- The largest successful sample was 25,272 input tokens, with capacity at least approximately 24.7× larger than Laya.
- However, above 8K, a large number of non-monotonic 503 occurred; the highest test tier with three consecutive full successes was only 4,272 tokens.
- 26K–32K units were all 0/3 in this round; there were no explicit token-limit errors, so the official hard limit cannot be asserted.

If a task must carry long evidence, Jev has more potential; if a task requires strict, pre-computable token boundaries, Laya's current contract is clearer. Jev's "maximum success" should not be treated as a production SLA.

## 5. Concurrency and Service Reliability

### 5.1 Laya

- Concurrency 1/2/4: 160/160 succeeded, with peak throughput of approximately 269 req/s.
- Concurrency 5/6: 64/64 in all three consecutive rounds.
- Concurrency 7: only 7/64 in all three consecutive rounds; the root cause is single-threaded `HTTPServer` and a small listen backlog.

### 5.2 Jev

- Single-question synchronous bursts: C1 3/3, C2 6/6, C4 12/12.
- C8 6/24, primarily 429; C16 4/48, C32 6/96, with superimposed connection resets.
- Controlled full-accuracy batches can obtain 72/72 answers via backoff, but one sustained first round yielded only 49/72, with the remaining 23 instances being 429.

The failure layers differ for the two: Laya is a local access architecture, and after fixing the queue, its stable serial inference throughput can be utilized; Jev is simultaneously constrained by local proxy backlog, network, gateway queuing, and upstream rate limits. Jev's client must treat 429 as a normal control signal, rather than an exceptional edge case.

## 6. Determinism and Semantic Robustness

| Test | Cloud Jev | Local Laya |
|---|---|---|
| Identical payload replay | 30 runs yielded 21 distinct complete JSONs | 60 runs yielded only 1 distinct JSON |
| Label stability | 20 retests showed identical argmax labels; risk score 0.27–0.34 | Labels and values are bit-for-bit identical |
| Batch vs. single question | paid/stage identical; risk values differ | All three questions identical |
| 5 equivalent phrasings | 5/5 same label, p 0.95–0.97 | 4/5, p 0.378–0.951 |
| Choice 24 orderings | 24/24 correct, p=1 | 15/24 correct, p 0.268–0.667 |

Jev's values exhibit slight randomness, but semantics are stable; Laya's values are fully deterministic, but semantics are sensitive to phrasing and position. For decision systems, the latter is typically more dangerous than minor probability fluctuations.

## 7. Privacy, Dependencies, and Cost Boundaries

| Question | Cloud Jev | Local Laya |
|---|---|---|
| Does data leave the machine? | Yes, state/questions sent to Vercel/TypeSafe | No |
| Depends on network/API key? | Yes | No |
| Offline operation | Not possible | Possible |
| Marginal call cost | Cloud billing/quota semantics apply; response cost in this round was 0, with separate marketCost telemetry | No per-request cloud billing; consumes local compute/power |
| Service version control | `typesafe-ai/jev` resolved in cloud, official version cannot be pinned | Local model and code can be pinned |

In this round's formal quality and performance results for Jev, the total `marketCost` telemetry for successful responses was approximately $0.0129; this excludes exploratory calls and is not an actual billing commitment. Laya's cost is primarily the resident ~614 MiB FP16 weights and local unified memory/energy consumption.

## 8. Selection Recommendations

### High judgment quality required immediately

Choose **Jev**, but must:

- Merge questions for the same state;
- Establish a bounded queue, limiting concurrency to verified capacity;
- Apply capped backoff for 429/502/503/504;
- Configure explicit degradation for timeouts, rate limiting, and sensitive data;
- Perform domain calibration for scores and high-risk business error cases.

### Must be local, offline, extremely low latency, or raw text cannot leave the machine

Can continue investing in **Laya**, but currently only suitable for narrow-domain classification validated on real holdout sets. Do not let it directly handle open-ended negations, exceptions, multi-step rules, or high-risk judgments just because 4–12 ms is fast.

### High-throughput production service

**Do not directly deploy either of the current bare services.**

- Laya: threaded acceptor + bounded queue + single GPU worker + batch aggregation + explicit 429/503.
- Jev proxy: increase/manage listen backlog, global concurrency semaphore, token bucket, Retry-After, jitter backoff, circuit breaking, and batching.

### Not recommended hybrid approach

Do not currently use Laya to pre-filter samples that "do not require calling Jev": 51.4%'s general accuracy may silently drop critical judgments in the pre-stage. A safer hybrid approach is to first use deterministic business rules to narrow down questions, and only send batches that are allowed to leave the machine and truly require semantic judgment to Jev; Laya should only be added to bypass or shadow after independent evaluation in the target domain meets standards.

## 9. Conclusion Boundaries

- 72 questions are a manual diagnostic set, not a final benchmark for any real business distribution.
- Jev and Laya have different model scales, training sets, and service locations; this report compares two end-to-end services that users can actually call, not pure model architectures.
- Jev's concurrent batches occurred after context stress testing, so 429 is affected by traffic windows; this is an end-to-end capacity fact, but not equivalent to maximum model compute.
- Laya's AG News 94.53% comes from training on related samples and cannot cover out-of-distribution inference in this round; the same 72 questions are uniformly used here as the primary quality comparison.

See the Cloud Jev Deep Evaluation (historical local file, not published with this report) and [Local Laya Deep Evaluation](devlog-projects-laya-mlx-notes-local-service-deep-evaluation-2026-09-21.md) for individual evidence.
