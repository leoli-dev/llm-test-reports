# Qwen3.8-27B vision + DFlash2 stepped stability measurements

[English](engine-tests-2026-10-19-vision-stability-report.md) | [简体中文](engine-tests-2026-10-19-vision-stability-report_CN.md)

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Local inference workstation |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | See original report; current snapshot does not fill missing historical configuration |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | macOS 27.0.1 (26A434) |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

Date: 2026-10-19 (America/Toronto). mlx-vlm 0.7.8 is launched through the actual `start-server.sh`, a different service implementation from the earlier mlx-dspark text-only benchmark.

All 5/5 phase results are obtained, with long-decode functional checks passing 5/5 and short-image recovery probes passing 5/5. All five phases complete without the pressure, paging, long-interval or functional flags listed below.

2 original 128K greedy failures remain: the original task produces 771 tokens with repetitive degeneration; the direct-test variant produces 414 tokens and ends at an incomplete statement. Neither provides sustained-output coverage. The final follow-up uses recommended sampling, without establishing that greedy-quality problems are repaired.

These multi-session steps provide functional/resource samples, not long-term production stability, confidence intervals or a no-stall guarantee. warn/critical, swap growth and long output gaps are reported separately from functional passes.

## Workload and pass conditions

Complete evidence spans 3 process sessions; the main table uses 2: initial supplies 32K/64K/96K, sampled supplies 128K/128K-repeat, and continuation's direct test remains a failed sample. The five main entries are not one uninterrupted same-process 32K→128K test. Prefixes differ. Synthetic images are 840×280 with 234 processed image tokens; metadata determines actual colors, and continuations may reuse the session's color template. APC is off, terminal timings verify `cache_n=0`. Each stage reserves 4096 output tokens; remaining budget is exact input including image/chat template, with `enable_thinking=false`. KV precision and allocator cache limit are unchanged.

initial/continuation use greedy `temperature=0`. The final sampled session restores the original SQLite queue / DAG / test-code task with checkpoint-recommended `temperature=1.0, top_p=0.95, top_k=20`. Actual parameters remain in the table/exact request JSON; sampling changes only this request, not production defaults. There is no EOS suppression, forced minimum output or fixed-length diagnostic workload. Task/sampling/process restarts change conditions, so cross-session rates cannot be attributed solely to context length, and sampled long-output coverage does not resolve the original greedy-quality issue. At least 2048 tokens are required for long decode. The runner checks HTTP/SSE completion, nonempty output, token budget, DFlash involvement and service health. Functional pass here means request/long-output coverage, not correctness of all tasks or generated code. Colors/recovery are separate; 4096-token-truncated code does not establish complete code quality. Cold prefixes do not imply cleared OS file cache or reloaded weights.

| Stage | Session / PID | Total budget | Processed input | Actual output | Cache | DFlash rounds / accepted | Long decode | Color order | Recovery |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 32k | initial / 83742 | 32,768 | 28,672 | 4,096 | 0 | 939 / 3157 | Pass | Pass | Pass |
| 64k | initial / 83742 | 65,536 | 61,440 | 4,096 | 0 | 987 / 3109 | Pass | Pass | Pass |
| 96k | initial / 83742 | 98,304 | 94,208 | 4,096 | 0 | 1045 / 3051 | Pass | Pass | Pass |
| 128k | sampled / 89735 | 131,072 | 126,976 | 4,096 | 0 | 1074 / 3022 | Pass | Pass | Pass |
| 128k-repeat | sampled / 89735 | 131,072 | 126,976 | 4,096 | 0 | 1226 / 2869 | Pass | Pass | Pass |

## Retained original 128K failures

Both greedy 128K requests finish SSE normally but stop early: the original degenerates repetitively, and the direct-test variant ends at an incomplete statement. Neither reaches 2048-token long-decode coverage, making them generation-quality/coverage failures. The service is healthy; runner assertion exits and subsequent deliberate shutdown are not service crashes. Later sessions adjust prompts and then sampling after restoring the original task; these changes do not erase failed samples.

| Original sample | Session / PID | Output tokens / finish | Service health | Pressure counts | Request Δswap GiB | Long coverage |
| --- | --- | --- | --- | --- | ---: | --- |
| 128k-original | initial / 83742 | 771 / stop | healthy | normal × 377 | 0.00 | Fail |
| 128k-direct-greedy | continuation / 88258 | 414 / stop | healthy | normal × 326 | -0.01 | Fail |

Original result (historical local file; not published with this report), output body (historical local file; not published with this report) and SSE (historical local file; not published with this report) remain. Highest repeated nonempty-line counts: `[["in-memory, in-memory, in-memory, in-memory, in-memory, in-memory,", 10], ["import base64", 9], ["import hashlib", 6]]`; final line is summary.json `output_last_line`.

Original result (historical local file; not published with this report), output body (historical local file; not published with this report) and SSE (historical local file; not published with this report) remain. Highest repeated nonempty-line counts: `[["Purple circle, yellow triangle, blue rectangle.", 1], ["def test_001_enqueue_idempotempotent(self):", 1], ["self.assertEqual(self.clock.now(), 0)", 1]]`; final line is summary.json `output_last_line`.

| Session | Stage | Sampling parameters from request | Task variant |
| --- | --- | --- | --- |
| initial | 32k | `{"temperature": 0}` | Original task or task stated in session manifest |
| initial | 64k | `{"temperature": 0}` | Original task or task stated in session manifest |
| initial | 96k | `{"temperature": 0}` | Original task or task stated in session manifest |
| sampled | 128k | `{"temperature": 1.0, "top_p": 0.95, "top_k": 20}` | original_code_task_recommended_sampling |
| sampled | 128k-repeat | `{"temperature": 1.0, "top_p": 0.95, "top_k": 20}` | original_code_task_recommended_sampling |
| initial | 128k-original | `{"temperature": 0}` | Original task or task stated in session manifest |
| continuation | 128k-direct-greedy | `{"temperature": 0}` | direct_numbered_unittest_methods |

## Prefill, decode and output gaps

The main table uses complete main-request `metrics_after.latest` metrics. Terminal SSE usage/timings remain in summary JSON.

| Stage | Prefill seconds / tok/s | Decode seconds / tok/s | API / client TTFT seconds | First / last 64 tok/s | Last / first ratio | Longest body gap seconds | >2s / >5s count |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 32k | 37.95 / 755.48 | 94.25 / 43.46 | 38.32 / 38.33 | 35.00 / 35.63 | 1.02 | 0.437 | 0 / 0 |
| 64k | 105.56 / 582.06 | 134.44 / 30.47 | 105.85 / 105.86 | 20.62 / 31.24 | 1.52 | 0.807 | 0 / 0 |
| 96k | 202.50 / 465.22 | 182.73 / 22.42 | 203.14 / 203.14 | 12.89 / 24.18 | 1.88 | 1.334 | 0 / 0 |
| 128k | 306.45 / 414.34 | 228.26 / 17.94 | 307.14 / 307.14 | 10.17 / 20.66 | 2.03 | 1.962 | 0 / 0 |
| 128k-repeat | 349.05 / 363.78 | 254.63 / 16.09 | 349.78 / 349.78 | 9.25 / 15.07 | 1.63 | 1.955 | 0 / 0 |

Gaps use client receipt times for body-bearing SSE chunks and exclude valid prefill waits. DFlash can commit tokens in batches, with networking/text decoding aggregating chunks. These are body-delivery gaps rather than exact single-token latency. First/last 64-token rates come from service metrics; a ratio below 0.70 is only an observation flag. Content, acceptance and load affect rates, so this is not a direct failure judgment.

## Prefill-progress stability

server.log is parsed by main-request ID to exclude recovery probes. Block rate is Δprocessed tokens / Δlog time. The first block starts at Prefill started and includes initial vision/scheduling overhead. Last progress commonly reports prompt−1; Prefill completed independently verifies the total, with the final 1-token tail excluded from block rates.

| Stage | Blocks | First-block wait seconds | Median / maximum block gap seconds | First / last block tok/s | Monotonic processed | Last progress / completed | Reached prompt−1 / final match | >30s without progress |
| --- | ---: | ---: | ---: | ---: | --- | ---: | --- | ---: |
| 32k | 14 | 2.475 | 2.724 / 3.465 | 827.47 / 590.76 | Pass | 28671 / 28672 | Pass / Pass | 0 |
| 64k | 30 | 2.352 | 3.511 / 4.727 | 870.75 / 433.04 | Pass | 61439 / 61440 | Pass / Pass | 0 |
| 96k | 46 | 2.695 | 4.351 / 6.458 | 759.93 / 316.97 | Pass | 94207 / 94208 | Pass / Pass | 0 |
| 128k | 62 | 2.497 | 4.658 / 8.350 | 820.18 / 245.15 | Pass | 126975 / 126976 | Pass / Pass | 0 |
| 128k-repeat | 62 | 3.029 | 5.585 / 8.483 | 676.13 / 241.31 | Pass | 126975 / 126976 | Pass / Pass | 0 |

Over 30 seconds is an observation threshold here, not a deadlock diagnosis. Logs have millisecond resolution; block gaps and body-chunk gaps differ. Complete per-block deltas/line numbers remain in summary.json.

## Decode-interval throughput stability

For the same main request, generated_tokens and elapsed from `Decode progress/completed` determine Δtokens / Δelapsed, **without using the log's rate field**. Logs usually record every 64 tokens. The first point is an anchor, without assuming generated-token count at elapsed=0; final intervals shorter than 64 are retained separately.

| Stage | Valid intervals (64-token intervals) | Median / minimum / maximum tok/s | First / last interval tok/s | Longest interval seconds | Monotonic token / elapsed |
| --- | ---: | ---: | ---: | ---: | --- |
| 32k | 63（63） | 44.82 / 33.60 / 53.92 | 52.98 / 36.20 | 1.905 | Pass / Pass |
| 64k | 63（63） | 31.62 / 21.53 / 38.60 | 27.81 / 31.75 | 2.973 | Pass / Pass |
| 96k | 63（63） | 23.22 / 18.13 / 27.20 | 20.16 / 24.56 | 3.531 | Pass / Pass |
| 128k | 63（63） | 18.54 / 14.97 / 23.29 | 16.21 / 20.99 | 4.276 | Pass / Pass |
| 128k-repeat | 63（63） | 16.74 / 11.99 / 20.90 | 13.23 / 14.48 | 5.337 | Pass / Pass |

These are average rates over continuous-output intervals, smoothing within-interval DFlash batches rather than measuring per-token latency. They also differ from client body-chunk gaps. Millisecond log elapsed introduces rounding; complete points/deltas/invalid intervals remain in summary.json.

## CPU / GPU by phase

| Stage | Phase | Samples | Process CPU mean / peak % | System CPU mean / peak % | Global GPU busy mean / peak % |
| --- | --- | ---: | ---: | ---: | ---: |
| 32k | prefill | 38 | 4.66 / 39.41 | 4.52 / 9.01 | 99.82 / 100.00 |
| 32k | decode | 93 | 33.90 / 59.77 | 9.24 / 52.14 | 93.60 / 98.00 |
| 64k | prefill | 105 | 3.92 / 28.50 | 3.93 / 8.05 | 99.87 / 100.00 |
| 64k | decode | 134 | 24.90 / 35.67 | 5.79 / 14.69 | 97.03 / 99.00 |
| 96k | prefill | 202 | 3.97 / 57.67 | 3.85 / 9.54 | 99.94 / 100.00 |
| 96k | decode | 181 | 21.74 / 58.38 | 6.62 / 45.87 | 97.92 / 99.00 |
| 128k | prefill | 305 | 3.88 / 68.88 | 4.00 / 11.25 | 99.97 / 100.00 |
| 128k | decode | 226 | 18.38 / 40.45 | 5.25 / 12.18 | 98.57 / 100.00 |
| 128k-repeat | prefill | 347 | 3.54 / 70.67 | 3.72 / 9.49 | 99.97 / 100.00 |
| 128k-repeat | decode | 253 | 18.26 / 34.57 | 5.79 / 25.07 | 98.38 / 99.00 |

Process CPU 100% means one logical core, with approximately 1800% theoretical total over this machine's 18 logical cores. System CPU 100% means all cores busy. GPU is global IOAccelerator `Device Utilization %`, including WindowServer/other apps rather than exclusive service use.

## Memory by phase (GiB)

| Stage | Phase | RSS peak | Footprint peak | MLX active peak | MLX free-cache peak | MLX cumulative peak | Global GPU allocated / used peak |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 32k | prefill | 31.61 | 39.72 | 36.64 | 2.48 | 37.18 | 49.45 / 40.55 |
| 32k | decode | 31.48 | 41.69 | 36.09 | 5.91 | 37.18 | 51.27 / 42.39 |
| 64k | prefill | 31.81 | 45.78 | 41.17 | 4.08 | 41.31 | 55.56 / 46.81 |
| 64k | decode | 31.51 | 52.42 | 40.58 | 12.21 | 42.30 | 62.00 / 53.10 |
| 96k | prefill | 32.03 | 51.36 | 45.11 | 6.02 | 45.61 | 61.00 / 52.41 |
| 96k | decode | 31.57 | 61.59 | 44.48 | 18.02 | 48.05 | 70.97 / 62.16 |
| 128k | prefill | 32.17 | 57.77 | 48.93 | 7.96 | 49.37 | 67.54 / 58.68 |
| 128k | decode | 31.57 | 71.40 | 50.01 | 24.26 | 53.51 | 80.97 / 72.08 |
| 128k-repeat | prefill | 32.27 | 57.68 | 48.96 | 7.71 | 53.51 | 67.22 / 58.64 |
| 128k-repeat | decode | 31.65 | 72.35 | 50.21 | 24.51 | 53.80 | 81.75 / 72.95 |

GiB=2³⁰ bytes. Apple silicon uses unified memory: RSS, footprint, MLX and GPU-driver statistics overlap and **must not be summed**, and GPU values are not separate VRAM. MLX active is active allocation; cache is free allocator buffers retained for reuse; peak is the high-water mark since process start or framework reset, not memory newly added in a phase. Detected allocator-peak decrease/reset events: 0 (summary.json; this collector does not reset peak).

## Pressure, swap and post-phase reclamation

Each stage's baseline is the nearest system sample before prefill; request-end uses the last request sample; post-recovery uses the stage's last sample before the next phase. These approximate one-second samples are not synchronized instantaneous values; exact offsets remain in JSON. Existing swap totals and per-phase changes are separate.

| Stage | Prefill / decode / recovery-idle pressure counts | Baseline / request-end / post-recovery swap GiB | Request / post-recovery Δswap GiB | Post-recovery MLX active / cache GiB |
| --- | --- | ---: | ---: | ---: |
| 32k | normal × 38 / normal × 93 / normal × 3 | 8.75 / 8.74 / 8.74 | -0.02 / -0.02 | 31.37 / 0.00 |
| 64k | normal × 105 / normal × 134 / normal × 3 | 8.74 / 8.72 / 8.72 | -0.02 / -0.02 | 31.38 / 0.20 |
| 96k | normal × 202 / normal × 181 / normal × 3 | 8.72 / 8.71 / 8.71 | -0.01 / -0.01 | 31.38 / 0.20 |
| 128k | normal × 305 / normal × 226 / normal × 4 | 8.66 / 8.63 / 8.63 | -0.03 / -0.03 | 31.37 / 0.01 |
| 128k-repeat | normal × 347 / normal × 253 / normal × 3 | 8.63 / 8.60 / 8.60 | -0.03 / -0.03 | 31.38 / 0.20 |

**32k**: none of the listed observation flags triggered.

**64k**: none of the listed observation flags triggered.

**96k**: none of the listed observation flags triggered.

**128k**: none of the listed observation flags triggered.

**128k-repeat**: none of the listed observation flags triggered.

128K-repeat observes accumulation/recovery only between two 128K requests in the continuation process, not cross-PID memory growth against the initial session. One repeat and short recovery intervals do not establish absence of leaks; post-recovery cache growth can also be allocator retention.

## Vision and recovery evidence

Automatic `vision_correct` checks only the three colors' order in the long answer's first line. `recovery_correct` checks only that all three colors occur in the short probe, without verifying order. Neither is a complete vision-quality score; shapes/other descriptions require manual review against images/raw answers.

| Stage | Expected colors (left → right) | Long-answer first line | Recovery answer |
| --- | --- | --- | --- |
| 32k | blue, orange, green | blue circle, orange triangle, green rectangle. | A blue circle, an orange triangle, and a green rectangle. |
| 64k | red, purple, yellow | red circle, purple triangle, yellow rectangle. | A red circle, a purple triangle, and a yellow rectangle. |
| 96k | green, blue, red | green circle, blue triangle, red rectangle. | A green circle, a blue triangle, and a red rectangle. |
| 128k | purple, yellow, blue | purple circle, yellow triangle, and blue rectangle. | A purple circle, a yellow triangle, and a blue rectangle. |
| 128k-repeat | orange, green, purple | an orange circle, a green triangle, and a purple rectangle. | An orange circle, a green triangle, and a purple rectangle. |

A separate shape/color-pairing check is in supplementary vision verification (historical local file; not published with this report), with original conclusions retained in summary.json `vision_validation`. It remains separate from the runner's color checks.

## Collection method and integrity

An external collector samples libproc CPU/RSS/footprint, host CPU ticks, IOAccelerator GPU, system pressure and swap each second. In-process service sampling only reads `mx.get_active_memory/get_cache_memory/get_peak_memory` once per second. Nearest allocator samples are matched by session/PID/time within 1.5 seconds; baselines also require the same session/PID. Means use valid-sample arithmetic averages; peaks are sampled maxima and may miss brief spikes. Missing values stay empty rather than being filled with 0.

Resource prefill spans server.log `Prefill started` to the client's first body content; decode runs from first body to request completion. If log start is unavailable, recorded request start is the fallback. This boundary includes vision encoding, CPU preprocessing/queueing and some first-token overhead, unlike backend API prompt_eval_time. One-second samples and adjacent CPU differences can cross boundaries.

Resource JSONL parse errors: 0; allocator JSONL parse errors: 0; allocator collector_error events: 0.

| Stage | Resource samples | Unmatched allocator samples | Telemetry-error counts | Prefill-progress log entries |
| --- | ---: | ---: | --- | ---: |
| 32k | 135 | 0 | {} | 14 |
| 64k | 242 | 0 | {} | 30 |
| 96k | 386 | 0 | {} | 46 |
| 128k | 536 | 0 | {} | 62 |
| 128k-repeat | 603 | 0 | {} | 62 |

Hardware: Apple M5 Max, 18 logical CPUs, 40 GPU cores, 128 GiB unified memory; macOS `27.0.1`. Snapshot captured during `32K decode`; power source `AC Power`; raw `pmset powermode` is `0`, without interpreting an unverified enum. No thermal/performance warning or CPU power status is recorded in the snapshot; this does not prove no thermal limits throughout the run.

Versions: `mlx-dspark 0.20.3`, `mlx 0.32.4`, `mlx-metal 0.32.4`, `mlx-lm 0.32.2`, `mlx-vlm 0.7.8`, `transformers 5.20.1`.

Main service: canonical ID `mlx-community/Qwen3.8-27B-8bit`, listening at `127.0.0.1:8082`, default total context 131072, incoai DFlash2, APC disabled, single concurrency and prefill chunk 2048. `MLX_VLM_MEMORY_LOG` enables allocator recording only for this benchmark; routine launch adds no sampling.

## Raw materials

- Test plan (historical local file; not published with this report)、Runner (historical local file; not published with this report)、Main launch script (historical local file; not published with this report)、Allocator collector (historical local file; not published with this report)。
- Summary JSON (historical local file; not published with this report)、Stage-summary CSV (historical local file; not published with this report)、Combined per-second CSV (historical local file; not published with this report)。
- Hardware snapshot (historical local file; not published with this report)、Session/condition manifest (historical local file; not published with this report)。
- 32k：Result (historical local file; not published with this report)、Individual SSE events (historical local file; not published with this report)、Output body (historical local file; not published with this report)、Exact request (historical local file; not published with this report)、[Image](../../assets/figures/2270b0714f2d-32k-image.png)。
- 64k：Result (historical local file; not published with this report)、Individual SSE events (historical local file; not published with this report)、Output body (historical local file; not published with this report)、Exact request (historical local file; not published with this report)、[Image](../../assets/figures/c026c68a9e58-64k-image.png)。
- 96k：Result (historical local file; not published with this report)、Individual SSE events (historical local file; not published with this report)、Output body (historical local file; not published with this report)、Exact request (historical local file; not published with this report)、[Image](../../assets/figures/ddb29eb56b22-96k-image.png)。
- 128k：Result (historical local file; not published with this report)、Individual SSE events (historical local file; not published with this report)、Output body (historical local file; not published with this report)、Exact request (historical local file; not published with this report)、[Image](../../assets/figures/ac05834dea6f-128k-image.png)。
- 128k-repeat：Result (historical local file; not published with this report)、Individual SSE events (historical local file; not published with this report)、Output body (historical local file; not published with this report)、Exact request (historical local file; not published with this report)、[Image](../../assets/figures/f394c7645a01-128k-repeat-image.png)。
- Session initial：Resources (historical local file; not published with this report)、allocator (historical local file; not published with this report)、Service log (historical local file; not published with this report)、Service cleanup (historical local file; not published with this report)。
- Session continuation：Resources (historical local file; not published with this report)、allocator (historical local file; not published with this report)、Service log (historical local file; not published with this report)、Service cleanup (historical local file; not published with this report)。
- Session sampled：Resources (historical local file; not published with this report)、allocator (historical local file; not published with this report)、Service log (historical local file; not published with this report)、Service cleanup (historical local file; not published with this report)。
- Cleanup record：server-exit.json (historical local file; not published with this report)。
- Cleanup record：cleanup.json (historical local file; not published with this report)。

![Per-phase CPU, GPU and memory timelines](../../assets/figures/d18e75e3e56e-stability-resources.png)

![Per-phase prefill blocks and decode-interval throughput](../../assets/figures/daeab344b030-stability-speed.png)
