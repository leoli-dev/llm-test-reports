# MLTF versus MLX-VLM: 128K long multimodal-task comparison

[English](engine-tests-2026-10-19-mltf-comparison-report.md) | [简体中文](engine-tests-2026-10-19-mltf-comparison-report_CN.md)

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

Date: 2026-10-19 (America/Toronto). Four independent fresh processes run VLM1 → MLTF1 → MLTF2 → VLM2. Each long request is followed by a short-image recovery probe, then its test service stops. Only one test backend is loaded at a time.

Requests reuse bytes from the existing sampled VLM workload: 126,976 processed input tokens including images + 4,096 output budget = 131,072. Settings: temperature=1, top_p=0.95, top_k=20, thinking off. Two different images/long tasks are each run once per backend, without EOS suppression or selectively retaining successful repetitions. Each fresh-process main request verifies cache matched tokens=0.

**Numerical paths differ: MLTF 0.1.2 q8c weights / INT8 KV versus MLX-VLM 0.7.8 affine 8bit weights / BF16 KV. This is not a same-precision experiment. Complete runtime paths are compared, so differences cannot be attributed solely to a kernel or KV format.**

MLTF uses an isolated environment and port 8083, 128K, a 96 GiB Metal budget, one active request and disabled SSD cache. Target reuses the current 8bit source; draft pinned revisions differ but original-weight SHA256 is identical. Vision assets follow the official packaged template, with actual image encoding and recognition independently checked. MLTF prefill uses W8A8 and verify W8A16 / split2-rounded; answer quality cannot be assumed equal to VLM. Installation/assets: setup-notes.md (historical local file; not published with this report), model-verification.json (historical local file; not published with this report), draft-source-comparison.json (historical local file; not published with this report). The production launcher and qwen/pi/hermes retain existing VLM configurations.

Across the two tasks, common-client mean body delivery is MLTF 58.06 tok/s versus VLM 16.47 tok/s, approximately 3.53 times. Mean main-request duration decreases from 554.02 to 362.67 seconds, a 34.5% reduction. Mean first-output wait is MLTF 292.01 seconds versus VLM 303.95 seconds. These means describe n=2 here, not long-term stability or same-precision quality gains.

Hardware snapshot (2026-10-19T17:10:02-04:00): Apple M5 Max, 128.00 GiB, 18 logical CPUs. Original OS/power/thermal details are in hardware.json (historical local file; not published with this report); each run separately stores thermal-before/after.

## Completion and common-client performance

Long-decode pass means only request completion, input-budget verification, cold cache and at least 2,048 output tokens for mechanical coverage. Image recognition and recovery probes are separate. Generated Python code is not executed, so functional correctness is not established.

| Run | Backend / task | Input / output | Long decode / full 4096 | Image / recovery | TTFT seconds | Total request seconds | First-to-last body span seconds | Body delivery tok/s | Output / total seconds tok/s | Finish |
| --- | --- | ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| vlm-1 | mlx-vlm / 128k | 126976 / 4096 | Pass / Pass | Pass / Pass | 274.28 | 542.40 | 268.12 | 15.28 | 7.55 | length |
| mltf-1 | mltf / 128k | 126976 / 4096 | Pass / Pass | Pass / Pass | 295.59 | 369.08 | 73.49 | 55.74 | 11.10 | length |
| mltf-2 | mltf / 128k-repeat | 126976 / 4096 | Pass / Pass | Pass / Pass | 288.43 | 356.26 | 67.82 | 60.39 | 11.50 | length |
| vlm-2 | mlx-vlm / 128k-repeat | 126976 / 4096 | Pass / Pass | Pass / Pass | 333.63 | 565.64 | 232.01 | 17.65 | 7.24 | length |

Client TTFT runs from sending HTTP to the first nonempty body content; total duration runs to SSE completion. Both include frontend, template, image and initial-inference overhead, providing common definitions for comparison. Body delivery uniformly divides all completion tokens by first-to-last nonempty-body span, including tokens delivered in the first block; it slightly exceeds a decode rate strictly excluding that block. SSE delivers speculative batches, so that span is not per-token latency.

| Backend | Samples / long-decode passes | Mean TTFT [range] seconds | Mean total duration [range] seconds | Mean output / total seconds [range] tok/s |
| --- | ---: | ---: | ---: | ---: |
| mltf | 2 / 2 | 292.01 [288.43, 295.59] | 362.67 [356.26, 369.08] | 11.30 [11.10, 11.50] |
| mlx-vlm | 2 / 2 | 303.95 [274.28, 333.63] | 554.02 [542.40, 565.64] | 7.40 [7.24, 7.55] |

Each backend has n=2, with sample means/ranges only and no statistical confidence. Request SHA256 pairing follows; identical API settings do not guarantee identical outputs across stochastic sampling/numerical paths.

- 128k: identical request SHA256=True; MLTF/VLM TTFT ratio=1.078, total-duration ratio=0.680, output/total-seconds ratio=1.470.
- 128k-repeat: identical request SHA256=True; MLTF/VLM TTFT ratio=0.865, total-duration ratio=0.630, output/total-seconds ratio=1.588.

## Backend timing (different definitions retained separately)

| Run | prompt seconds | prompt tok/s | decode seconds | decode tok/s | cache matched |
| --- | ---: | ---: | ---: | ---: | ---: |
| vlm-1 | 273.50 | 464.26 | 268.12 | 15.28 | 0 |
| mltf-1 | 295.46 | 429.75 | 73.49 | 55.72 | 0 |
| mltf-2 | 288.30 | 440.43 | 67.82 | 60.31 | 0 |
| vlm-2 | 332.02 | 382.44 | 232.01 | 17.65 | 0 |

VLM uses main-request `/metrics.latest.prompt_eval_time_s`, `prefill_tok_s`, `decode_elapsed_s` and `decode_tok_s`. MLTF terminal `prompt_ms` spans native start to the first speculative output block, including initial generation. Its decode runs from first native output to completion, excluding the first speculative block from throughput's numerator. These prompt-rate columns do not directly establish pure prefill acceleration. MLTF `/status.metrics` is cumulative and does not replace main-request timing. Original terminal timings/metrics remain in summary.json and result JSON.

MLTF separately records cumulative native batch/command wall timing (`/status.metrics`, distinct from lifecycle timing):

| Run | prefill input / wall seconds / tok/s | decode output / wall seconds / tok/s |
| --- | ---: | ---: |
| mltf-1 | 126976 / 294.39 / 431.32 | 4096 / 73.22 / 55.94 |
| mltf-2 | 126976 / 288.01 / 440.88 | 4096 / 67.58 / 60.61 |

These command metrics are process-cumulative; snapshots are taken after the main request and before recovery probes. Pre-request counts in summary.json must be verified zero before treating them as single-request statistics. They exclude the same HTTP/queue overhead and cannot form a pure-GPU-prefill ratio with VLM prompt timing.

## Memory definitions and resources by phase

**Lower MLTF libproc RSS/footprint cannot establish a total-RAM-saving percentage versus VLM. Native OS counts differ substantially from Metal allocator/global GPU-driver counts. File mappings, model backing pages and Metal allocations have different attribution; OS process values do not represent full model GPU residency. Memory conclusions must consider all columns and retain their definition differences. Global driver counts also include the desktop/other processes and cannot all be assigned to this service.**

| Run: main-request peak GiB | engine RSS / footprint | MLX active / free-cache | MLTF allocation current | Global GPU in-use / allocated |
| --- | ---: | ---: | ---: | ---: |
| vlm-1 | 32.18 / 71.40 | 50.01 / 24.26 | Unavailable | 73.30 / 82.34 |
| mltf-1 | 0.99 / 6.35 | Unavailable / Unavailable | 34.86 | 32.75 / 46.29 |
| mltf-2 | 0.99 / 6.34 | Unavailable / Unavailable | 34.86 | 32.80 / 46.44 |
| vlm-2 | 24.15 / 72.07 | 50.01 / 24.94 | Unavailable | 73.59 / 82.95 |

Each column takes its own peak within the request, not necessarily simultaneous. Unified-memory counters overlap and must not be summed or treated as independent VRAM. MLTF memory_actual current tracks allocation, while VLM active/cache uses MLX allocator definitions; these are not interchangeable.

Common phases use client clocks: request → first nonempty body includes prefill, images and initial output; first body → completion is body delivery. Request start is preferentially reconstructed as first-body Unix time minus client monotonic TTFT, avoiding pre-request health/metrics snapshots; fallback methods are retained in summary.json. These are not strict GPU-kernel phase boundaries. One-second sampling may miss brief peaks. CPU 100%=one logical core (18 here); system CPU 100%=all cores; GPU busy is global.

| Run / phase | Samples | engine CPU mean / peak % | tree CPU mean / peak % | system CPU mean / peak % | Global GPU mean / peak % | engine RSS / footprint peak GiB | Global GPU alloc / in-use peak GiB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| vlm-1 / Before first body | 274 | 5.07 / 115.65 | 5.07 / 115.65 | 7.27 / 36.10 | 99.65 / 100.00 | 32.18 / 58.25 | 68.74 / 59.57 |
| vlm-1 / Body delivery | 267 | 22.87 / 47.08 | 22.87 / 47.08 | 16.03 / 70.97 | 97.78 / 99.00 | 31.57 / 71.40 | 82.34 / 73.30 |
| mltf-1 / Before first body | 295 | 0.35 / 21.04 | 0.91 / 50.98 | 3.61 / 10.08 | 99.47 / 100.00 | 0.99 / 6.34 | 46.18 / 32.75 |
| mltf-1 / Body delivery | 73 | 0.86 / 0.98 | 1.53 / 1.84 | 4.15 / 13.75 | 98.95 / 99.00 | 0.99 / 6.35 | 46.29 / 31.73 |
| mltf-2 / Before first body | 287 | 0.35 / 26.46 | 0.89 / 29.72 | 3.71 / 20.03 | 99.47 / 100.00 | 0.99 / 6.19 | 46.25 / 32.01 |
| mltf-2 / Body delivery | 68 | 0.89 / 2.24 | 1.54 / 2.76 | 4.06 / 11.70 | 98.91 / 99.00 | 0.99 / 6.34 | 46.44 / 32.80 |
| vlm-2 / Before first body | 332 | 4.23 / 99.12 | 4.23 / 99.12 | 4.75 / 66.33 | 99.50 / 100.00 | 24.15 / 57.76 | 68.26 / 58.89 |
| vlm-2 / Body delivery | 230 | 20.11 / 44.13 | 20.11 / 44.13 | 5.23 / 13.34 | 98.06 / 99.00 | 23.55 / 72.07 | 82.95 / 73.59 |

MLTF engine is the native splash subprocess, with Python HTTP frontend separate; VLM uses the service process itself. RSS, physical footprint, allocator and global driver memory overlap within unified memory: **do not sum them or treat them as separate VRAM**. Process-tree RSS/footprint sums can also double-count shared pages.

| Run | engine PID / frontend PID | Frontend footprint peak GiB | Summed tree-footprint peak GiB | MLX active / free-cache / cumulative peak GiB | MLTF allocation current / cumulative peak GiB |
| --- | --- | ---: | ---: | ---: | ---: |
| vlm-1 | [30691] / [] | Unavailable | 71.40 | 50.01 / 24.26 / 53.51 | Unavailable / Unavailable |
| mltf-1 | [33626] / [33618] | 0.64 | 6.75 | Unavailable / Unavailable / Unavailable | 34.86 / 34.86 |
| mltf-2 | [35543] / [35536] | 0.65 | 6.74 | Unavailable / Unavailable / Unavailable | 34.86 / 34.86 |
| vlm-2 | [37330] / [] | Unavailable | 72.07 | 50.01 / 24.94 / 53.51 | Unavailable / Unavailable |

MLX free-cache is reusable allocator cache; peak is process-cumulative without manual reset. MLTF memory_actual takes the greater of tracked dense+sparse resident and cached Metal allocation; its peak is also cumulative and is not MLX active/cache. Empty entries mean the backend does not provide that measurement. VLM allocator samples join by the same PID within the last 1.5 seconds; MLTF polls `/status` at 1Hz, separately counting cached/stale status.

## Delivery intervals, pressure and interpretation limits

| Run | Maximum SSE interval seconds / >2s / >5s | Request pressure normal / warn / critical | Request swap Δ GiB | Post-recovery swap Δ GiB | Telemetry-error counts | native stale / callback failures |
| --- | ---: | --- | ---: | ---: | --- | ---: |
| vlm-1 | 2.70 / 1 / 0 | 541 / 0 / 0 | -0.02 | -0.02 | {} | 0 / 0 |
| mltf-1 | 0.12 / 0 / 0 | 368 / 0 / 0 | 0.00 | 0.00 | {} | 1 / 0 |
| mltf-2 | 0.11 / 0 / 0 | 355 / 0 / 0 | 0.00 | 0.00 | {} | 0 / 0 |
| vlm-2 | 2.05 / 1 / 0 | 562 / 0 / 0 | -0.02 | -0.02 | {} | 0 / 0 |

SSE intervals measure pauses between body blocks. DFlash/MLTF speculative blocks can contain multiple tokens and are not exact per-token latency. Swap is system-wide and changes need not be entirely caused by the service. Baseline is the nearest sample before request start; end is the nearest before completion; post-recovery uses that process's last sample. Exact offsets are in summary.json. Startup/request errors remain separate, and native status_stale does not automatically mean a process crash.

- **vlm-1**: body SSE has a >2s delivery interval. Request errors: [].
- **mltf-1**: native status includes a cached snapshot during the request. Request errors: [].
  Main-request native counter changes: image encodes=1, memory denied reservations=0, transport restarts=0, requests failed=0; final ready=True, Metal healthy=True.
  Native speculative/image counter check: {'drafted_tokens': 5327, 'accepted_draft_tokens': 3335, 'images_encodes': 1, 'transport_restarts': 0}.
- **mltf-2**: this sample triggers no resource/delivery alerts, but remains single-workload evidence. Request errors: [].
  Main-request native counter changes: image encodes=1, memory denied reservations=0, transport restarts=0, requests failed=0; final ready=True, Metal healthy=True.
  Native speculative/image counter check: {'drafted_tokens': 4977, 'accepted_draft_tokens': 3385, 'images_encodes': 1, 'transport_restarts': 0}.
- **vlm-2**: body SSE has a >2s delivery interval. Request errors: [].

Long-output coverage failures, pressure warnings, swap increases or telemetry gaps require interpretation against original records. A surviving service does not replace output-quality/recovery checks. Service returncode=-15 commonly comes from deliberate test SIGTERM and alone does not establish a crash.

## Raw evidence

Test plan (historical local file; not published with this report) · Run manifest (historical local file; not published with this report) · Machine snapshot (historical local file; not published with this report) · Summary JSON (historical local file; not published with this report) · Summary CSV (historical local file; not published with this report) · Per-second CSV (historical local file; not published with this report)

- vlm-1：result (historical local file; not published with this report) · resources (historical local file; not published with this report) · allocator (historical local file; not published with this report) · request (historical local file; not published with this report) · stream (historical local file; not published with this report) · output (historical local file; not published with this report) · server_log (historical local file; not published with this report) · server_exit (historical local file; not published with this report)
- mltf-1：result (historical local file; not published with this report) · resources (historical local file; not published with this report) · request (historical local file; not published with this report) · stream (historical local file; not published with this report) · output (historical local file; not published with this report) · server_log (historical local file; not published with this report) · server_exit (historical local file; not published with this report)
- mltf-2：result (historical local file; not published with this report) · resources (historical local file; not published with this report) · request (historical local file; not published with this report) · stream (historical local file; not published with this report) · output (historical local file; not published with this report) · server_log (historical local file; not published with this report) · server_exit (historical local file; not published with this report)
- vlm-2：result (historical local file; not published with this report) · resources (historical local file; not published with this report) · allocator (historical local file; not published with this report) · request (historical local file; not published with this report) · stream (historical local file; not published with this report) · output (historical local file; not published with this report) · server_log (historical local file; not published with this report) · server_exit (historical local file; not published with this report)

Existing sampled VLM data is historical support only: [earlier stability report](engine-tests-2026-10-19-vision-stability-report.md). Main tables use this round's four fresh processes, without mixing historical successes into their means.

![Common-client performance](../../assets/figures/c62883453874-comparison-performance.png)

![Per-second resource curves](../../assets/figures/10e7105a3dff-comparison-resources.png)

![Body-delivery interval curves](../../assets/figures/c4eedf45df1d-comparison-delivery.png)

Cleanup state: cleanup-status.json (historical local file; not published with this report).
