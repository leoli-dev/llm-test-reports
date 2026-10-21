# Splash vs MLTF: PERF-06 128K vision performance replay

[English](2026-10-21-splash-vs-mltf-perf06-replay.md) | [简体中文](2026-10-21-splash-vs-mltf-perf06-replay_CN.md)

Test date: 2026-10-21, America/Toronto. New experiment PERF-09; historical PERF-06 remains unchanged.

## Question and observed result

Replay the exact PERF-06 long vision requests on Splash and MLTF, using fresh processes and the same client timing definitions. This measures complete engine paths, not an isolated kernel or general model quality.

| Metric (mean of two tasks) | Splash | MLTF | Splash / MLTF |
|---|---|---|---|
| Client TTFT (s) | 493.50 | 630.92 | 0.78 |
| Complete request (s) | 633.02 | 777.38 | 0.81 |
| Content delivery (tok/s) | 29.36 | 27.97 | 1.05 |
| Output / complete time (tok/s) | 6.53 | 5.27 | 1.24 |

In this replay, Splash mean complete-request time is 18.57% lower and mean content delivery is 4.98% higher. Most of the observed time difference is before first content; this is not a multi-fold decode gain.

Baseline reproducibility warning: fresh MLTF mean content delivery is 27.97 tok/s, versus 58.06 tok/s in PERF-06. The cause of this cross-date difference was not isolated. Main ratios use only the fresh ABBA comparison and must not be presented as a general improvement over the historical installation.

Each backend has n=2, on two different tasks. Means and ratios describe this run only; no confidence interval, sustained-load claim or quality equivalence follows. Completion lengths and failures are shown below rather than filtered out.

## Hardware, system and fixed conditions

| Item | Recorded configuration |
|---|---|
| Inference location | Local; both engines on the same Mac |
| Hardware | MacBook Pro / Apple M5 Max / 18 CPU cores / 40 GPU cores / 128 GiB unified memory (137438953472 bytes) |
| Test-time OS | ProductName:		macOS; ProductVersion:		27.0.1; BuildVersion:		26A434;  / arm64 |
| Evidence capture timestamp (Unix) | 1792583312.070633 |
| Power | Now drawing from 'AC Power';  -InternalBattery-0 (id omitted)	80%; AC attached; not charging present: true;  |
| Target source | mlx-community/Qwen3.8-27B-8bit @ 815b83c0df8ffd1d1b5244cf75fd6ef14fca9ef9 |
| Splash engine | 1.4.0 @ 1482f6bbc2abf12375332725302019594150b6cb; native Metal; MLX affine8 group64 input |
| Splash build toolchain | Xcode 27.1 (27A9275); Metal 4.0 build target; shader-validation environment flags absent |
| MLTF engine | my-little-trie-forge 0.1.2; packed q8c; reference source checkout 873d5574d903f5c1685e286c9cd59b79475a49f6; installed binary hashes retained |
| Draft | incoai/Qwen3.8-27B-DFlash2 @ 015e795645c74b1a0eeef3b570031fb62e769bc5; original BF16 safetensors SHA256 67fc76d68dc5a9415511a4f394ef744d67510cd20e93b37cc2cc7d28e4bab65c |
| Context and sampling | 131072 context; 126976 input including image; 4096 output budget; T=1, top_p=.95, top_k=20; thinking OFF |
| Memory and KV | 96 GiB Metal cap; INT8 KV; Splash FP32 recurrent states; SSD prefix cache OFF |
| Concurrency and cache | One submitted generation at a time; one fresh server process per main request; matched tokens checked; filesystem cache not purged |

All checkpoint files were downloaded and SHA-256 checked before testing. The original target revision matches MLTF provenance. The draft revision differs from the older packed manifest, but the raw draft weights have the same SHA-256. MLTF packed weights and Splash affine8 loading, vision preparation, execution and sampling paths can still differ numerically. Same target source and INT8 KV do not establish bit-identical execution.

Splash retains its default ANE selection; startup/calibration is outside timed HTTP requests and its actual plan is retained in status/log evidence. MLTF keeps its existing runtime path. Splash automatic admission capacity may differ from MLTF maximum concurrency=1; the workload itself is serial.

| Run | Launch to ready snapshot s | ANE state | ANE share | Minimum rows for ANE |
|---|---|---|---|---|
| splash-1 | 96.38 | split | 0.24 | 2012 |
| mltf-1 | 14.07 | N/A | N/A | N/A |
| mltf-2 | 11.12 | N/A | N/A | N/A |
| splash-2 | 16.07 | split | 0.24 | 2012 |

Readiness intervals include startup polling and are separate from HTTP request timings. ANE utilization and power were not independently measured. A blank ANE field on MLTF is not evidence of an identical ANE execution path.

## Exact replay procedure and audit

The original PERF-06 runner, CPU-only request validator, macOS telemetry collector, vision-answer validator, summary formulas and plot layouts were reused. Backend launch commands and installed paths were adapted; private authentication is runtime-only. Native readiness timeout was extended to 900 s for startup/calibration only. The ABBA order substitutes Splash for the original mlx-vlm side: Splash A → MLTF A → MLTF B → Splash B.

Each fresh process runs CPU-only template/token-count checks, then one unchanged long request, then the original short image recovery probe, and is stopped. Two different synthetic SQLite queue / DAG / test-code tasks and different three-shape images are used. The 128k-repeat label is the second original fixture, not a warm-cache replay. The user selected the MLX 8bit checkpoint and requested this replay. Supervisor edits are limited to benchmark adapters and report tooling; prompts and model outputs are not edited. No generated code is executed. No trimming, filler adjustment, EOS suppression or retries to select successful output are used.

| Run | Request SHA-256 | Expanded input | Expanded token IDs SHA-256 | Matched cache tokens |
|---|---|---|---|---|
| splash-1 | 052763e089b1f87de8e721832e9ee918ac56503473efc2a1136d3cd8062da790 | 126976 | 4a282b941080c009a313edb954c5478efe2bb43537f399e63a9d5bddea8b0107 | 0 |
| mltf-1 | 052763e089b1f87de8e721832e9ee918ac56503473efc2a1136d3cd8062da790 | 126976 | 4a282b941080c009a313edb954c5478efe2bb43537f399e63a9d5bddea8b0107 | 0 |
| mltf-2 | 2055ef57041a7afa551928d99fe9b7047ae5ee070a38e87f8727671bde35d45c | 126976 | 65e7b7f5f4dec5064245f5a34231ac95cfa6ba7457921d021aa77f0603fec203 | 0 |
| splash-2 | 2055ef57041a7afa551928d99fe9b7047ae5ee070a38e87f8727671bde35d45c | 126976 | 65e7b7f5f4dec5064245f5a34231ac95cfa6ba7457921d021aa77f0603fec203 | 0 |

The two request hashes are byte-identical to PERF-06. Each image expands to 234 tokens. Original request enable_thinking=false is paired with server default reasoning none; the validator checks the actual thinking-OFF assistant suffix. Template changes or token-count differences must be retained as deviations, not hidden by editing the workload.

## Completion and common client performance

| Run / task | Input / output | Long decode / full 4096 | Vision / recovery | TTFT s | Total s | Content span s | tok/s | Finish |
|---|---|---|---|---|---|---|---|---|
| splash-1 / 128k | 126976 / 4096 | pass / pass | pass / pass | 434.69 | 574.97 | 140.28 | 29.20 | length |
| mltf-1 / 128k | 126976 / 4096 | pass / pass | pass / pass | 619.32 | 764.82 | 145.50 | 28.15 | length |
| mltf-2 / 128k-repeat | 126976 / 4096 | pass / pass | pass / pass | 642.51 | 789.95 | 147.43 | 27.78 | length |
| splash-2 / 128k-repeat | 126976 / 4096 | pass / pass | pass / pass | 552.32 | 691.06 | 138.74 | 29.52 | length |

TTFT runs from HTTP submission to the first nonempty content chunk; total time ends at SSE completion. Content delivery rate is all completion tokens divided by first-to-last nonempty content span, including tokens already in the first chunk. Speculative blocks contain multiple tokens, so this is not exact token-to-token latency. Mechanical long-decode coverage requires at least 2048 output tokens and the other request/cache/health checks; it does not prove generated-code correctness.

## Backend timings and speculation

| Run | Prompt s | Prompt tok/s | Decode s | Decode tok/s | Drafted / accepted / image encodes |
|---|---|---|---|---|---|
| splash-1 | 434.60 | 292.17 | 140.28 | 29.19 | {'drafted_tokens': 5097, 'accepted_draft_tokens': 3367, 'images_encodes': 1, 'transport_restarts': 0} |
| mltf-1 | 619.18 | 205.07 | 145.50 | 28.12 | {'drafted_tokens': 5383, 'accepted_draft_tokens': 3327, 'images_encodes': 1, 'transport_restarts': 0} |
| mltf-2 | 642.35 | 197.67 | 147.43 | 27.76 | {'drafted_tokens': 5362, 'accepted_draft_tokens': 3330, 'images_encodes': 1, 'transport_restarts': 0} |
| splash-2 | 552.21 | 229.94 | 138.74 | 29.52 | {'drafted_tokens': 4818, 'accepted_draft_tokens': 3407, 'images_encodes': 1, 'transport_restarts': 0} |

Native prompt_ms is start-to-first-native-emission and includes the first speculative output work. Native elapsed decode excludes the first emitted block from its token numerator. Command-level prefill/decode wall counters in status have another scope. Client timing remains the common comparison; these rates are not isolated GPU-kernel timings. Cumulative status counters are saved before the recovery probe and their before/after values are retained.

| Run | Before: prefill / decode tokens | Prefill tokens | Command prefill s | Command prefill tok/s | Decode tokens | Command decode s | Command decode tok/s |
|---|---|---|---|---|---|---|---|
| splash-1 | 0 / 0 | 126976 | 433.86 | 292.67 | 4096 | 139.98 | 29.26 |
| mltf-1 | 0 / 0 | 126976 | 618.88 | 205.17 | 4096 | 145.10 | 28.23 |
| mltf-2 | 0 / 0 | 126976 | 642.03 | 197.77 | 4096 | 146.90 | 27.88 |
| splash-2 | 0 / 0 | 126976 | 551.86 | 230.09 | 4096 | 138.50 | 29.57 |

These status counters are read before recovery; zero pre-request counters support isolating the main request. Command elapsed time is not interchangeable with HTTP TTFT or native start-to-first-emission.

## Memory and per-phase resources

1 Hz telemetry resolves the native splash child separately from the Python frontend on both backends. CPU 100% means one logical core; system CPU and GPU busy are whole-machine counters. RSS, footprint, runtime allocator and global GPU-driver memory overlap in unified memory: never add them or call their difference total RAM savings. Process-tree sums can double-count shared pages. Startup samples and request samples are kept separate; 1 Hz may miss short peaks.

| Run / phase | Samples | Engine CPU mean / max % | Tree CPU mean / max % | System CPU mean / max % | Global GPU mean / max % | Engine RSS / footprint peak GiB | Runtime allocation peak GiB | Global GPU in-use / allocated peak GiB |
|---|---|---|---|---|---|---|---|---|
| splash-1 / before_first_content | 431 | 0.29 / 1.74 | 0.46 / 20.44 | 31.03 / 37.36 | 99.85 / 100.00 | 3.59 / 35.35 | 34.44 | 36.25 / 38.57 |
| splash-1 / content_delivery | 139 | 0.45 / 0.56 | 0.71 / 0.90 | 31.48 / 39.09 | 99.00 / 99.00 | 3.72 / 35.46 | 34.57 | 36.29 / 38.67 |
| mltf-1 / before_first_content | 615 | 0.18 / 18.75 | 0.61 / 50.51 | 31.33 / 41.01 | 99.85 / 100.00 | 0.99 / 6.19 | 34.73 | 31.08 / 38.81 |
| mltf-1 / content_delivery | 145 | 0.65 / 2.15 | 1.17 / 2.56 | 31.81 / 49.92 | 98.99 / 99.00 | 0.99 / 6.34 | 34.86 | 32.05 / 38.94 |
| mltf-2 / before_first_content | 640 | 0.32 / 104.69 | 0.83 / 105.69 | 31.23 / 43.63 | 99.67 / 100.00 | 0.99 / 6.34 | 34.86 | 32.08 / 38.78 |
| mltf-2 / content_delivery | 146 | 0.81 / 1.16 | 1.67 / 2.58 | 34.87 / 47.39 | 98.93 / 99.00 | 0.99 / 6.34 | 34.86 | 30.90 / 38.82 |
| splash-2 / before_first_content | 548 | 0.26 / 2.19 | 0.46 / 34.01 | 35.34 / 44.33 | 99.89 / 100.00 | 3.59 / 35.35 | 34.44 | 36.18 / 38.45 |
| splash-2 / content_delivery | 138 | 0.38 / 0.55 | 0.65 / 0.86 | 34.87 / 39.73 | 98.98 / 99.00 | 3.72 / 35.46 | 34.57 | 36.32 / 38.57 |

| Run | Maximum SSE gap s / >2s / >5s | Pressure normal / warn / critical | Request swap delta GiB | Telemetry errors | Stale status / callback failures |
|---|---|---|---|---|---|
| splash-1 | 0.24 / 0 / 0 | 570 / 0 / 0 | 0.00 | {} | 0 / 0 |
| mltf-1 | 0.27 / 0 / 0 | 760 / 0 / 0 | 0.00 | {} | 0 / 0 |
| mltf-2 | 0.24 / 0 / 0 | 786 / 0 / 0 | 0.00 | {'native_status': 1} | 0 / 1 |
| splash-2 | 0.26 / 0 / 0 | 686 / 0 / 0 | -0.01 | {} | 0 / 0 |

| Run | Frontend footprint peak GiB | Tree footprint sum peak GiB | Native current / cumulative peak GiB | Swap delta after recovery GiB |
|---|---|---|---|---|
| splash-1 | 0.64 | 35.84 | 34.57 / 34.57 | 0.00 |
| mltf-1 | 0.64 | 6.72 | 34.86 / 34.86 | 0.00 |
| mltf-2 | 0.66 | 6.74 | 34.86 / 34.86 | 0.00 |
| splash-2 | 0.64 | 35.84 | 34.57 / 34.57 | -0.01 |

The original guard stops only the current test process group after 15 consecutive critical-pressure samples or native footprint above 115 GiB. Swap is system-wide; changes are not automatically attributable to this engine. Each peak is taken independently and need not occur at the same instant. SIGTERM at test cleanup is intentional, not evidence of a crash.

## Historical PERF-06 reference, kept separate

| Run / date | TTFT s | Total s | Content delivery tok/s |
|---|---|---|---|
| mltf-1 / 2026-10-19 | 295.59 | 369.08 | 55.74 |
| mltf-2 / 2026-10-19 | 288.43 | 356.26 | 60.39 |

These historical MLTF rows are not included in new means. They were measured on another date and are linked to the unchanged PERF-06 report. New ABBA rows are the primary comparison; a historical number is not a substitute for the rerun. [PERF-06](../experiments/perf-06.md)

## Failures, limitations and cleanup

- `splash-1`: errors = []; flags = []

- `mltf-1`: errors = []; flags = []

- `mltf-2`: errors = []; flags = ['Telemetry errors occurred during the request']

- `splash-2`: errors = []; flags = []

Evidence audit: 66 of 67 checks passed. The exception is one native /status telemetry timeout in MLTF task B. The sample timestamp is about 0.18 s after HTTP request start, while its raw phase is startup and collection took 2.08 s. The original time-based phase classification retains this boundary sample in the request interval. Native-status fields are unavailable for that sample; generation SSE, usage, visual/recovery answers and request timing are independently retained. The run was not repeated to obtain an all-green audit.

Performance and vision checks do not establish correctness of generated SQLite/DAG code, broad quality equivalence, long-session stability, concurrency throughput, tool-use quality or an ANE-only causal gain. Sampling is stochastic and speculative acceptance may differ with output content. Ambient temperature and independent GPU clock/power measurements were not recorded; historical performance changes are not assigned a single cause. No success-only rerun or hidden workload change is permitted. Test servers are stopped after each case; model files and independent environments are retained.

## Figures and downloadable evidence

![Common client performance](../../assets/figures/perf-09-performance.png)

![Per-second resources](../../assets/figures/perf-09-resources.png)

![Content delivery gaps](../../assets/figures/perf-09-delivery.png)

[Evidence bundle](../../assets/evidence/perf-09-evidence.zip) contains requests, shape images, SSE, outputs, results, summary JSON/CSV, per-second CSV and compressed raw telemetry, validation and thermal/status records, model file hashes and source harness adaptations. It contains no weights, virtual environments, runtime caches or authentication files.

Publication transformation: local home/runtime paths are generalized in metadata/logs and the battery identifier is omitted; request JSON and image bytes, output text, numeric measurements and hashes are preserved. Reproduction script paths are made configurable, and the original local source hashes are retained. Full personal sessions and unrelated process command lines were never collected.

Sources: [Splash pinned source](https://github.com/incoai/splash/tree/1482f6bbc2abf12375332725302019594150b6cb), [MLX target](https://huggingface.co/mlx-community/Qwen3.8-27B-8bit/tree/815b83c0df8ffd1d1b5244cf75fd6ef14fca9ef9).
