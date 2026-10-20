# Qwen3.8-27B 128K / 256K long-context measurements

[English](engine-tests-2026-10-19-long-context-report.md) | [简体中文](engine-tests-2026-10-19-long-context-report_CN.md)

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

Test date: 2026-10-19 (America/Toronto). This report is generated from two completed run records.

128K completes normally. 256K also completes generation, but decode experiences memory pressure and substantial paging; request completion does not establish stable full-window operation. Default KV precision and existing cache settings are retained, without switching quantization or reducing snapshots to make the test finish.

## Configuration and test scope

During testing, the text service and corresponding Qwen3.8-27B entries in qwen CLI and pi use `262144` tokens (256K, the native total-context cap). Because 256K performs poorly here, the user subsequently requests text/vision services and related client defaults lowered to `131072` (128K). Original test configurations/results remain. YaRN is not enabled and RoPE is unchanged. The routine output cap remains `32768`; after reserving the full output allowance, the current input budget is `98304` tokens (96K, including system prompts, tools and conversation formatting).

Each length is run once. A fresh service process is started for each condition, followed by the first measured request after loading; response `cached_tokens=0` verifies a cold prefix cache. Cold here means no prompt/KV-prefix reuse, not a cleared macOS file cache or absence of startup kernel warmup.

The workload uses unique synthetic structured records, ending with the same Python shortest-path task: Dijkstra, path reconstruction, Bellman-Ford, type annotations and assertions. No user documents are used. Input bytes differ across lengths, but the coding task is the same. Settings are `temperature=0`, `enable_thinking=false`, output budget `512`, and another `8` tokens reserved for speculative-block headroom.

The `578262` sequence-length warning in console logs comes from tokenizer calls during offline source-corpus construction. Actual requests are trimmed to exact input lengths of `130552` / `261624` tokens and checked against server usage. The saved test program now truncates source tokenization to each total budget to prevent repeating that warning; the prefix token sequences used to construct actual requests are unchanged.

| Total context budget | Exact input tokens | Output budget | Speculative headroom | Actual output tokens | Cache-hit tokens | Check result |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 128K（131,072） | 130,552 | 512 | 8 | 512 | 0 | Pass |
| 256K（262,144） | 261,624 | 512 | 8 | 515 | 0 | Completed, with memory pressure |

Each condition has only one performance sample. Results describe this machine, workload and contemporaneous background activity, rather than a stable speedup, statistical confidence or real-task quality. The 512-token output creates a measurable decode phase; complete code is likely to reach the output cap.

## Prefill and decode

| Budget | Prefill seconds | Prefill tok/s | Decode seconds | Decode tok/s | TTFT seconds | Mean acceptance length per round | Draft acceptance rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 128K | 279.40 | 467.30 | 22.13 | 23.10 | 279.40 | 3.63 | 70.61% |
| 256K | 926.24 | 282.50 | 57.58 | 8.90 | 926.24 | 3.05 | 77.01% |

Rates and phase durations come from API `x_mlx_dspark`; draft acceptance comes from `/rounds` statistics in each fresh process. TTFT includes prefill and first-token generation.

## CPU / GPU by phase

| Budget | Phase | Samples | Process CPU mean / peak % | System CPU mean / peak % | GPU busy mean / peak % |
| --- | --- | ---: | ---: | ---: | ---: |
| 128K | prefill | 278 | 18.14 / 34.95 | 5.27 / 17.34 | 99.71 / 100.00 |
| 128K | decode | 22 | 18.33 / 82.14 | 4.84 / 8.06 | 96.59 / 99.00 |
| 256K | prefill | 921 | 10.53 / 75.07 | 4.15 / 23.90 | 99.81 / 100.00 |
| 256K | decode | 56 | 22.76 / 99.03 | 9.49 / 22.92 | 73.73 / 100.00 |

Process CPU 100% means one fully occupied logical core; this machine has 18 logical cores, for a theoretical approximately 1800% combined. System CPU is normalized across all CPUs, with 100% meaning the entire system is busy. GPU busy is global IOAccelerator `Device Utilization %`, including other apps and WindowServer rather than exclusive process utilization. The driver does not specify its exact averaging window.

## Memory by phase

All values below are GiB (2³⁰ bytes), using sampled peaks within each listed phase.

| Budget | Phase | Process RSS | Process physical footprint | MLX active | MLX allocator cumulative peak | Global GPU allocated | Global GPU used |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 128K | prefill | 30.60 | 48.18 | 39.12 | 39.64 | 58.14 | 31.89 |
| 128K | decode | 27.38 | 63.75 | 45.42 | 45.53 | 73.49 | 52.30 |
| 256K | prefill | 30.67 | 65.58 | 61.33 | 61.42 | 75.20 | 50.77 |
| 256K | decode | 27.45 | 96.37 | 62.55 | 62.56 | 106.24 | 58.76 |

Apple silicon uses unified memory. RSS, physical footprint, MLX allocator and GPU-driver statistics overlap and **must not be added**, nor should GPU values be treated as separate VRAM. RSS/footprint cover only the service PID; GPU allocated/used values cover the system. MLX allocator `peak_bytes` is a high-water mark since process loading and may include loading/warmup; it is not additional memory allocated by that phase.

## Memory pressure, swap and collection completeness

| Budget | Prefill guard samples | Decode guard samples | Swap start / end GiB | Swap change GiB | Sampled swap peak GiB | Telemetry errors / JSON-line errors |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| 128K | normal × 278 | normal × 22 | 1.09 / 1.09 | 0.00 | 1.09 | 0 / 0 |
| 256K | normal × 921 | normal × 27, warn × 29 | 1.09 / 13.40 | 12.31 | 13.40 | 0 / 0 |

128K: system memory-pressure samples are normal × 302; guard start/end is `normal` → `normal`, with sheds `0` → `0`. Total samples: 302. Mean/peak collection duration: 0.027 / 0.046 seconds.

256K: system memory-pressure samples are normal × 947, warn × 31 and critical × 1; guard start/end is `normal` → `warn`, with sheds `0` → `0`. Total samples: 979. Mean/peak collection duration: 0.033 / 1.925 seconds.

The 256K service log also records `13.5s between rounds`, coinciding with decode pressure and paging. Global GPU allocation peaks near 106 GiB while MLX active is near 63 GiB; retained allocator cache and other system memory also occupy space, so active values alone cannot predict paging. Routine near-full 256K input could separately test KV 8-bit or smaller allocator-cache/prefix-snapshot overhead. Those alternatives are not measured here, and default KV precision is unchanged.

## Collection method and run settings

Resources are sampled approximately once per second. Cumulative process CPU time comes from `proc_pid_rusage`, converted to seconds with Mach timebase; CPU percentage uses adjacent-sample differences. System CPU uses `host_statistics` busy/total tick differences. GPU uses unprivileged `ioreg -r -c IOAccelerator -a -l -d 1`; MLX/system memory and memory guard come from `/metrics`. Means are arithmetic averages of valid samples and peaks are sampled maxima. One-second sampling can miss transient peaks.

Phase boundaries are approximate: the first decode-round observation time minus that round's `ms / 1000` estimates engine_start; adding API `prefill_seconds` gives prefill_end, then `decode_seconds` gives decode_end. First-round `ms` includes prefill. Network delivery has latency, so one-second samples near boundaries can cross phases. CPU differences also cover the preceding sampling interval. Collection and `/metrics` polling introduce small overhead.

| Setting | Record |
| --- | --- |
| Hardware | Apple M5 Max, 40 GPU cores, 18 logical CPUs, 128 GiB unified memory |
| Decode mode | `--mode auto`, DFlash2, `--max-draft auto` |
| Service total context / output cap | `262144` / `32768` |
| Small-M | `--no-small-m`, disabled |
| KV precision | health `kv_bits=0`; KV quantization not explicitly enabled |
| Prefix cache | rungs `32768` / slots `1`; fresh process per condition, no prefix hit |
| wired-limit | Not explicitly set; system wired limit unchanged |
| CPU affinity | No process CPU affinity configured |
| macOS | `27.0.1` |
| Power state | `AC Power`; charging: `True` |
| pmset power setting | Raw `powermode` value `0`; enum meaning not inferred |

During testing, `8080` is occupied by agent-post, so tests use `127.0.0.1:18080`; routine scripts/clients retain `8080`. Each result is saved after finally cleanup and recording the service exit code. Test services stop after the runs; these records do not establish later port state.

After long-text and vision verification, both test ports 18080 / 8082 are closed and system memory-pressure level returns to 1 (normal). Post-cleanup status is in cleanup-status.json (historical local file; not published with this report). This does not mean swap files created during the tests immediately shrink.

128K: sampling interval `2026-10-19T10:49:46-04:00 / 2026-10-19T10:54:48-04:00`; service PID `74336`, exit code `-15`; finish_reason `length`; lookup_rounds `0`.

256K: sampling interval `2026-10-19T10:54:57-04:00 / 2026-10-19T11:11:22-04:00`; service PID `75117`, exit code `-15`; finish_reason `length`; lookup_rounds `0`.

Hardware, power and version metadata are captured during `128K prefill`; the original file does not separately record an exact capture timestamp. pmset records no thermal warning, performance warning or CPU power status at that time. This is not full-run temperature/throttling monitoring.

Dependency versions: `mlx-dspark 0.20.3`, `mlx 0.32.4`, `mlx-metal 0.32.4`, `mlx-lm 0.32.2`, `mlx-vlm 0.7.8`, `transformers 5.20.1`.

Structured client-configuration comparison before testing confirms that qwen CLI and pi each change only one context field for this model, `131072 → 262144`. Other model entries/limits are unchanged. The value is restored to `131072` afterward at the user's request.

## Raw records and reproduction files

- Test program (historical local file; not published with this report), telemetry implementation (historical local file; not published with this report), summary program (historical local file; not published with this report).
- Machine-readable summary JSON (historical local file; not published with this report), summary CSV (historical local file; not published with this report), console log (historical local file; not published with this report).
- Client configuration changes (historical local file; not published with this report), hardware/power snapshot (historical local file; not published with this report), original launch script (historical local file; not published with this report), current text-service script (historical local file; not published with this report).
- 128K: result JSON (historical local file; not published with this report), per-second CSV (historical local file; not published with this report), per-second JSONL (historical local file; not published with this report), event JSONL (historical local file; not published with this report), service log (historical local file; not published with this report), exact request (historical local file; not published with this report).
- 256K: result JSON (historical local file; not published with this report), per-second CSV (historical local file; not published with this report), per-second JSONL (historical local file; not published with this report), event JSONL (historical local file; not published with this report), service log (historical local file; not published with this report), exact request (historical local file; not published with this report).

## Independent vision verification

This is an mlx-dspark text-only test. Existing weights contain a vision tower, which mlx-dspark's text path discards. Vision can be restored through an mlx-vlm / DFlash2 service reusing the same disk cache. Vision verification/throughput are excluded from the tables above; see separate vision verification/run records (historical local file; not published with this report) and vision-service script (historical local file; not published with this report). Sharing disk cache does not share model tensors across processes.
