---
type: Note
title: "MTPLX Qwen3.8 27B Optimized Quality Stress Test Execution Record"
status: current
description: "Recorded Qwen3.8 27B Optimized Quality cold prefill and subsequent near-128K natural soak using the Flash-Next 128K method; the soak completed 3 tasks, lasting 30.6 minutes, with complete system sampling but CPU/GPU/thermal pressure telemetry covering only the final segment."
tags: [qwen3.8, optimized-quality, mtplx, benchmark, performance, prefill, decode, memory]
timestamp: 2026-09-20T08:42:42Z
---

# MTPLX Qwen3.8 27B Optimized Quality Stress Test

[English](devlog-projects-qwen3-8-test-notes-mtplx-qwen38-27b-quality-pressure-test-run-2026-09-20.md) | [简体中文](devlog-projects-qwen3-8-test-notes-mtplx-qwen38-27b-quality-pressure-test-run-2026-09-20_CN.md)

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

## Conclusions

On 2026-09-20, the second model batch was executed on MTPLX for `Qwen 3.8 27B Optimized Quality` (8-bit dynamic quant) using the Flash-Next 128K stress test method. Two rounds of warm-up and 8K–120K cold prefill (3 runs per tier) were completed, totaling 18 requests; all 15 cold prefill samples passed marker validation and had `cached_tokens=0`.

As the actual prompt median increased from 8,406 to 120,408 tokens, the cold prefill median decreased from 465.9 to 305.9 tok/s (endpoint drop of 34.3%); TTFT increased from 18.19s to 395.88s (approximately 21.8 times). This is the curve of context length on cold prefill, not a sustained decode decay curve.

The decode median for short marker responses was 39.79→36.48 tok/s at the 8K–120K endpoints (endpoint change -8.3%), but each run had only 470–904 completion tokens, and the values were not monotonic across tiers; this serves only as a shallow context observation and cannot replace approximately 4K structured/natural long decode or soak time series.

The first structured decode probe was rejected by MTPLX HTTP 507 before prefill: 8,405 prompt tokens (all uncached), engine estimated 96.6 GiB, exceeding the 96.0 GiB memory budget by 0.6 GiB, with completion of 0. No retry was performed per the planned stop condition, so the 64K/112K long decode, natural control, cache A/B, and 45–60 minute soak were not executed. The conclusion for this batch is **partially completed**, and a complete decode decay curve or stable soak results cannot be claimed.

## Configuration and Method

- MTPLX Desktop OpenAI-compatible endpoint: `http://127.0.0.1:8001/v1`; runtime model id: `mtplx-qwen38-27b-optimized-quality`.
- The model UI displays 8-bit dynamic quant; the service advertises a context of 262,144. To maintain the same test contract as the original plan, Pi independently registered using 131,072 context and 8,192 max output.
- `reasoning_effort=medium`, MTP generation/head enabled, profile Auto, KV quantization off, `allow_swap=false`, MTP cohorts off; Pi tools/skills/extensions/context files were disabled and `--no-session` was used. Pre- and post-configuration snapshots matched.
- An isolated Pi agent directory was used; no global Pi model/settings were modified. The formal cold group used three unique corpora per tier, with short marker responses used to measure prefill and incidentally obtain short decode samples; 2 warm-up runs were completed before execution.

| Nominal Input | Actual Prompt Median | Prefill Median (tok/s) | TTFT Median (s) | Short Answer Decode Median (tok/s) | Marker |
|---:|---:|---:|---:|---:|---:|
| 8K | 8,406 | 465.9 | 18.19 | 39.79 | 3/3 |
| 32K | 32,407 | 422.2 | 76.98 | 43.81 | 3/3 |
| 64K | 64,407 | 337.9 | 191.09 | 35.28 | 3/3 |
| 96K | 96,407 | 326.1 | 295.94 | 31.73 | 3/3 |
| 120K | 120,408 | 305.9 | 395.88 | 36.48 | 3/3 |

Two 64-line warm-up runs generated 1,314–1,694 completion tokens respectively; based on this, calibration was performed to a structured output probe of 160 lines, approximately 3.8K tokens. This probe's input was 8,405 tokens and was rejected before prefill started; this was not due to output truncation, marker error, or Pi adaptation issues. The MTPLX service remained running, and no subsequent requests were made after the stop condition was triggered.

## Resource Observations and Boundaries

Device physical memory 128 GB; during sampling, the MTPLX PID did not change, with RSS approximately 30.7 GB; Swap was approximately 3.67–4.27 GiB, with no clear trend of sustained increase. The key limitation was the MTPLX engine's 96 GiB projected budget for this request, rather than Mac physical memory being exhausted. The test did not clear cache, restart the service, or change KV/Swap configuration.

If long decode is to be continued, it should be handled as a subsequent independent batch: first, the user decides whether to release more engine headroom or use the q8 KV configuration. Changing KV would alter the configuration contract and should not be mixed with the current no-KV-quantization batch.

## Artifacts

- Run report (historical local file, not published with this report)
- Per-request curve CSV (historical local file, not published with this report)
- Short answer decode CSV (historical local file, not published with this report)
- [Cold prefill curve SVG](../../assets/figures/9d2839259a0e-cold-prefill-throughput.svg)
- Raw MTPLX metrics (historical local file, not published with this report)
- Request records and response snapshots (historical local file, not published with this report)
- Machine state sampling (historical local file, not published with this report)

## Follow-up Supplementary Test: Near-128K Multi-task Natural Soak (2026-09-20)

Per user request, a separate soak run `20260920T071156Z-216b61` was initiated. Context window 131,072; 3 different tasks each used 120,410 prompt tokens, with a maximum requested output of 8,192 tokens. Continuous run for **30 min 38 sec**, with pre- and post-configuration matching.

| # | Task | Completion tokens | Prefill tok/s | Decode tok/s | TTFT (s) | marker/header |
|---:|---|---:|---:|---:|---:|:---:|
| 1 | Data integrity and anomaly audit | 8,192 | 404.182 | 28.638 | 298.404 | Passed |
| 2 | Latency distribution and cache/sharding attribution | 6,428 | 348.884 | 26.208 | 345.878 | Passed |
| 3 | Reliability improvements and validation plan | 8,192 | 332.588 | 27.860 | 362.575 | Failed |

The prefill median for the 3 requests was **348.884 tok/s**, and the decode median was **27.860 tok/s**. Prefill decreased by **17.7%** from task 1→3; decode decreased then increased, with an endpoint change of **−2.7%**. The marker/header validation for item 3 failed, but the request completed and rate metrics were valid; therefore, the correct/complete count was 2/3.

System-state sampling for the entire duration yielded 119 samples: available RAM minimum/average **27.0% / 44.6%**; estimated peak whole-machine RAM usage **93.44 GiB**; MTPLX RSS peak **35.99 GiB**; process CPU median/sampling peak **11.7% / 95.9%**; Swap **3,638.25→3,614.25 MiB**, no increase. CPU/GPU/thermal pressure powermetrics covered only the final segment of the stress test for **8 min 02 sec, 33 samples**: CPU/GPU power consumption estimated average **5.69 W / 19.64 W**, GPU HW active residency average **98.2%**, thermal pressure **Heavy 33/33**. Absolute Celsius temperature was not sampled; independent GPU VRAM was not visible (Apple Silicon unified memory).

Supplementary test evidence: Run report (historical local file, not published with this report) · Per-request records (historical local file, not published with this report) · Full-duration system sampling (historical local file, not published with this report) · powermetrics raw telemetry (historical local file, not published with this report) · [Two-model comparison report](devlog-projects-qwen3-8-test-notes-mtplx-model-comparison-report-2026-09-20.md).
