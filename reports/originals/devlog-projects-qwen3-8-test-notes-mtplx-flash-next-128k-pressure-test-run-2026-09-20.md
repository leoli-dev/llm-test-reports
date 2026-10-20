---
type: Note
title: "MTPLX Flash-Next 128K Stress Test Execution Record"
status: current
description: "Records cold prefill first round and subsequent near-128K natural soak; first round structured requests halted due to HTTP 507 safety stop, supplementary test completed 3 tasks, lasting 13.5 minutes, BENCH-06 remaining matrix still incomplete."
tags: [qwen3.8, flash-next, mtplx, benchmark, performance, memory]
timestamp: 2026-09-20T08:42:42Z
---

# MTPLX Flash-Next 128K Stress Test Execution Record

[English](devlog-projects-qwen3-8-test-notes-mtplx-flash-next-128k-pressure-test-run-2026-09-20.md) | [简体中文](devlog-projects-qwen3-8-test-notes-mtplx-flash-next-128k-pressure-test-run-2026-09-20_CN.md)

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

## Conclusion

2026-09-20 (Asia/Shanghai) initiated first round per test plan. Pi/MTPLX fixed configuration matched, pre- and post-execution snapshots consistent; continuous collection of /metrics and machine state successful. A total of 20 requests recorded: 2 rounds of warm-up, 15 rounds of cold prefill, 1 structured decodes with actual output, and 2 MTPLX rejected requests.

As actual prompt tokens for cold prefill increased from 8,400 to 120,402, median prefill decreased from 1,411.4 to 704.9 tok/s (approx. 50.1% decrease); median TTFT increased from 6.04s to 171.36s. Cached ratio for all 15 cold samples was 0. See table below and run report for complete per-tier data.

| Nominal Input | Actual Prompt Tokens | Prefill Median (tok/s) | TTFT Median (s) |
|---:|---:|---:|---:|
| 8K | 8,400 | 1,411.4 | 6.04 |
| 32K | 32,401 | 1,048.4 | 31.13 |
| 64K | 64,401 | 855.8 | 75.85 |
| 96K | 96,401 | 770.2 | 125.68 |
| 120K | 120,402 | 704.9 | 171.36 |

Short marker responses for cold prefill requests had only 180–267 completion tokens; their decode median decreased from 103.24 at 8.4K to 86.43 tok/s at 120.4K (approx. 16.3% decrease). This is a context-dependent shallow observation and cannot be treated as the sustained long decode decay curve required by the plan.

## Stop Reason and Data Boundary

The first 8.4K structured output returned 8,192 completion tokens, 63.85 decode tok/s, with finish reason length, outputting only to D0473 (target 512 lines), thus the sample was marked incomplete. Subsequently, two requests were rejected by MTPLX with HTTP 507 memory_refusal: runtime reported estimated need of 96.2 GiB, exceeding 96.0 GiB engine limit by 0.2 GiB. Pi did not return marker, test aborted per stop condition; no further high-load requests were sent.

System sampled 96 times: memory free percentage was 19%–94%, Swap was 4,453.5–4,517.5 MiB, MTPLX RSS approx. 32.0–42.0 million KiB; no service PID change or sustained Swap growth observed. Rejection originated from MTPLX internal memory budget, not collector misconfiguration. No cache clearing, service restart, or quantization configuration change was performed.

Planned 64K/112K sustained decode, structured vs natural comparison, 112K cache A/B, and 45–60 minute soak were not executed; BENCH-06 still in progress. Before resumption, need to confirm memory headroom has recovered; if choosing to change KV/runtime configuration, a separate configuration batch should be opened, cannot be merged with this batch.

## Execution Deviations and Corrections

Two rounds of 64 line warm-up used 1,251 and 1,321 completion tokens respectively. First version harness did not use this result for calibration, formal structured requests still required 512 lines, causing first output to hit 8,192 limit. Calibrating by warm-up token count, subsequent normal probes should be approx. 192 lines. Harness corrected to auto-calibrate before formal matrix, and immediately stop upon first MTPLX 507 memory refusal; this stopped run will not be retried.

The only structured sample with output had MTP depth of 3, accepted drafts of 4,366, rejected drafts of 248, per-depth acceptance counts [1533, 1502, 1331], average acceptance probabilities [0.971, 0.951, 0.843]. Single and truncated sample serves only as raw observation, not as overall conclusion.

Linear fit of cold prefill TTFT yielded approx. -11.9s fixed term and 685.5 tok/s slope equivalent rate; negative fixed term indicates this wide-interval data does not support interpreting fit intercept as true fixed overhead.

## Artifacts

- Run report (historical local file, not published with this report)
- Per-request curve data (historical local file, not published with this report)
- Short-answer decode curve (historical local file, not published with this report)
- [Cold prefill chart](../../assets/figures/31b23b6766cc-cold-prefill-throughput.svg)
- Raw MTPLX metrics (historical local file, not published with this report)
- Machine state sampling (historical local file, not published with this report)
- Harness located at $HOME/Code/qwen3.8-tests/mtplx-flash-next-pressure-2026-09-20/pressure_test.py.
- [MTPLX two-model full comparison report](devlog-projects-qwen3-8-test-notes-mtplx-model-comparison-report-2026-09-20.md)

## Follow-up Supplementary Test: Near-128K Multi-task Natural Soak (2026-09-20)

After first round halted due to HTTP 507 from structured probes, independent soak run `20260920T080135Z-193bc8` initiated per user request. Context window 131,072; 3 different tasks each used 120,402 prompt tokens, requesting max 8,192 output tokens. Formal rerun took 13 min 32 sec, configuration matched pre- and post-execution; marker/header treated as diagnostic item rather than continuous failure stop threshold, resource thresholds, HTTP 507, metric missing, timeout, and abnormal repetition/garbled text protection still effective.

| # | Task | Completion Tokens | Prefill tok/s | Decode tok/s | TTFT (s) | marker/header |
|---:|---|---:|---:|---:|---:|:---:|
| 1 | Data Integrity and Anomaly Audit | 8,166 | 921.331 | 55.383 | 131.097 | Pass |
| 2 | Latency Distribution and Cache/Sharding Attribution | 6,186 | 829.193 | 58.465 | 145.706 | Pass |
| 3 | Reliability Improvement and Verification Plan | 4,452 | 686.047 | 44.508 | 175.969 | Pass |

Prefill median for 3 requests was **829.193 tok/s**, decode median was **55.383 tok/s**. Prefill decreased **25.5%** from task 1→3; decode first rose to task 2, then fell to task 3, endpoint change **−19.6%**. This is endpoint comparison across three tasks, not equal-interval long-term decay curve.

System-state sampled 53 times throughout: available RAM min/avg **15.0% / 22.2%**; whole-machine RAM used estimated peak **108.80 GiB**; MTPLX RSS peak **42.66 GiB**; process CPU median/sampled peak **36.7% / 325.0%**; Swap **3,558.69→3,518.69 MiB**, no growth. powermetrics covered full soak (55 samples): CPU/GPU power consumption estimated mean **6.03 W / 20.86 W**, GPU HW active residency mean **95.1%**; thermal pressure **Heavy 49/55, Nominal 6/55**. System did not provide Celsius temperature field; Apple Silicon unified memory also cannot be split into independent GPU VRAM.

Previous Flash first-round soak `20260920T074916Z-28c2d9` stopped after approx. 9.1 minutes, two marker failures, not mixed into formal results. Formal rerun 3/3 marker/header checks passed.

Supplementary test evidence: Formal run report (historical local file, not published with this report) · Per-request records (historical local file, not published with this report) · Full-process system sampling (historical local file, not published with this report) · powermetrics raw telemetry (historical local file, not published with this report).
