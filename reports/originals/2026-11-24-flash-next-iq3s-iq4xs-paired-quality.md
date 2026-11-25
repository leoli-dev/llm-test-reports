# Qwen3.8-Flash-Next coding quality on Splash: IQ3_S and IQ4_XS

English | [简体中文](2026-11-24-flash-next-iq3s-iq4xs-paired-quality_CN.md)

**The observed coding scores did not establish that IQ4_XS offers a practical gain on this Mac. The interval leaves uncertainty about the size and direction of the difference.** IQ3_S passed 72/120 (60.0%) and IQ4_XS passed 73/120 (60.8%). The difference, IQ4_XS minus IQ3_S, was **+0.8 percentage points**.

## Paired results

| Scope | Pairs | IQ3_S | IQ4_XS | Both pass | IQ3 only | IQ4 only | Both fail |
|---|---:|---:|---:|---:|---:|---:|---:|
| Formal overall | 120 | 72/120 (60.0%) | 73/120 (60.8%) | 61 | 11 | 12 | 36 |
| Medium | 49 | 43/49 (87.8%) | 41/49 (83.7%) | 40 | 3 | 1 | 5 |
| Hard | 71 | 29/71 (40.8%) | 32/71 (45.1%) | 21 | 8 | 11 | 31 |

The 95% paired score interval was [-7.3, +9.1] and the 90% interval was [-5.9, +7.6] percentage points. The exact McNemar p-value was 1.0000. The difficulty-stratified bootstrap gave a 95% interval of [-6.7, +8.3]. The formal cohort contained 3,782 private cases. A task passed when every private case passed. Across 24 pilot pairs, pooled request time averaged 49.4 s and 3 responses were truncated. The formal plan selected 120 pairs, with 120 received and 120 eligible for the paired analysis. The effective sample was below 160 pairs and is interpreted as a screen for large effects. At the user's request, grading paused after 125/240 formal responses were scored. It resumed from the saved responses and existing grades.

| Failure mode | IQ3_S | IQ4_XS |
|---|---:|---:|
| Private-case failures | 44 | 37 |
| Truncated outputs | 2 | 9 |
| Missing code blocks | 2 | 1 |
| Template-token leaks | 0 | 0 |
| Infrastructure retries | 0 | 0 |
| Final missing responses in paired blocks | 0 | 0 |

The first example in each direction follows the frozen task order. Both packs passed the listed public cases.

| Task ID | IQ3_S private cases | IQ4_XS private cases |
|---|---:|---:|
| `LCB-atcoder-abc377_f` | 40/40 | 32/40 |
| `LCB-atcoder-arc195_b` | 31/40 | 40/40 |

## Workstation cost

| Metric | IQ3_S | IQ4_XS |
|---|---:|---:|
| Mean request time, s | 48.83 | 54.42 |
| Request median, s | 52.85 | 55.99 |
| Mean output tokens, including reasoning | 4244.32 | 4471.80 |
| End-to-end output, token/s | 86.91 | 82.18 |
| Load-time peak sample, GiB | 55.71 | 64.39 |

For routine short-context coding on this workstation, IQ3_S used less memory and had lower request latency. The measured correctness difference gives little reason to switch for coding accuracy alone. The long-context probes provide additional evidence for that workload.

## Diagnostic probes

| Scope | Pairs | IQ3_S | IQ4_XS | Both pass | IQ3 only | IQ4 only | Both fail |
|---|---:|---:|---:|---:|---:|---:|---:|
| Standalone functions | 12 | 10/12 (83.3%) | 10/12 (83.3%) | 10 | 0 | 0 | 2 |
| Mock tools | 48 | 46/48 (95.8%) | 47/48 (97.9%) | 46 | 0 | 1 | 1 |
| Long context | 12 | 7/12 (58.3%) | 12/12 (100.0%) | 7 | 0 | 5 | 0 |
| 16k | 4 | 2/4 (50.0%) | 4/4 (100.0%) | 2 | 0 | 2 | 0 |
| 64k | 4 | 3/4 (75.0%) | 4/4 (100.0%) | 3 | 0 | 1 | 0 |
| 128k | 4 | 2/4 (50.0%) | 4/4 (100.0%) | 2 | 0 | 2 | 0 |

On long-context probes, IQ3_S passed 7/12 and IQ4_XS passed 12/12. The exact paired p-value was 0.0625. Each length had four probes with reused task types, so the result is exploratory.

| Repository | Pack | Public suite (tests run) | Hidden suite (tests run) | Tool calls | Output tokens |
|---|---|---:|---:|---:|---:|
| A1-invlib | IQ3 | pass (13) | pass (13) | 11 | 9,117 |
| A1-invlib | IQ4 | pass (13) | pass (13) | 9 | 4,753 |
| A2-cronlite | IQ3 | fail (1) | fail (1) | 5 | 24,000 |
| A2-cronlite | IQ4 | fail (50) | fail (59) | 8 | 24,000 |
| A4-migrate | IQ3 | pass (3) | pass (35) | 17 | 15,921 |
| A4-migrate | IQ4 | pass (5) | pass (35) | 18 | 19,064 |

Both A2 runs exhausted the 24,000-token budget. The IQ3_S suite failed to import because CronError was missing. IQ4_XS reached the hidden suite, which recorded 10 failures and 10 errors across 59 tests.

## Protocol and evidence

- Claude Opus 5.5 reviewed the design in Orca. The 24 disjoint pilot pairs set the formal cohort size and budget using pooled latency and truncation counts. The formal set was frozen before generation. We selected Python 3 stdin tasks from a pinned LiveCodeBench Lite release by difficulty and year. Interactive, non-stdin, multiple-answer and tolerance tasks were screened out. The grader used all private cases for every selected item. Public cases were diagnostic. Forty-task blocks alternated IQ3→IQ4 and IQ4→IQ3. [Pinned dataset](https://huggingface.co/datasets/livecodebench/code_generation_lite/tree/0fe84c3912ea0c4d4a78037083943e8f0c4dd505) · [LiveCodeBench](https://github.com/LiveCodeBench/LiveCodeBench)
- Both inference and client ran locally on MacBook Pro Mac17,6 / Apple M5 Max / CPU 18 / GPU 40 / 128 GiB / arm64. Test-time OS was macOS 27.2.1 (26B131). The run used Splash 1.7.0 from source `61f6d51643a2cf8b3ed868dcb4bcda176ae578ec`. ISTA GSQ-RCO IQ3_S revision `ed59f92082b1e93c0e96d60a8b11aab089b52f09` and Unsloth UD-IQ4_XS revision `f5d175de2cf7f720d45d6064019a81fcf056e986` share vocabulary and chat template (template SHA-256 prefix `12827f24b742ea4e`). Their calibration and mixed-quantization recipes differ.
- Both used a 262,144 context, 96 GiB budget, INT8 KV, FP32 state, SSD cache off, DFlash2, temperature 1, top_p .95 and top_k 20. Each formal task received one medium-effort request, 4,096 reasoning tokens, 8192 total output tokens, a per-task shared seed, a per-request cache salt and concurrency one. Splash stopped before switching packs. The API model ID was checked and one warm-up discarded after each load. A pilot preflight confused the client alias with the API ID and rolled back before generating answers. Adaptive speculative decoding can vary with a fixed seed.
- Grading used the pinned offline arm64 Python 3.13 Docker image `sha256:9ef1a599f863231c3d91e941389bfdc4a2d6070557243d54df1a4e57015b960e`. Standard output was compared after whitespace tokenization and ignored case only where the statement explicitly allowed it. The container limit was 384 MiB and candidate processes had a 320 MiB address-space limit. Each case had a 4 CPU-second limit and a 7-second watchdog. Timeout or killed results were checked twice using the saved program and resolved by majority. Truncation, absent code blocks, runtime errors and wrong outputs failed. Infrastructure failures were tracked independently. Superiority required a point difference of at least five percentage points and a paired 95% score interval excluding zero. A 90% interval within ±5 points met equivalence. An upper 90% bound below +5 points met IQ3 non-inferiority. [Tango's paired score method](https://pubmed.ncbi.nlm.nih.gov/9595618/)
- The 48 mock tool prompts came from 12 templates with three parameterized variations each. Context lengths in the table are fixture labels. Actual input tokens appear in the evidence. Repositories included one run per pack, capped at 40 tool calls and 24,000 output tokens. Models could run public unittest tests through a tool. Hidden tests ran after generation. These diagnostics have small samples or reused templates. A diagnostic-only compatibility fix handled message-only tool fixtures and null tool-call fields before those probes ran.
- [Per-item results with sanitized request and grader metrics](../../assets/2026-11-24-flash-next-iq3s-iq4xs-paired-quality/paired-results.json). The archive excludes dataset text, candidate source, private endpoints and credentials.

## Comparison with prior evidence

The previous same-version short probe measured 8.68 GiB higher peak allocation, 3.3% slower native decode and a first event 0.241 s sooner with IQ4_XS. End-to-end throughput in this run includes prompt processing and answer generation. [CAP-05 same-version probe](./2026-11-24-flash-next-iq4xs-splash-cap05-replay.md)

Strata reported mean KL against Q8_0 of 0.101 on IQ4_XS and 0.144 on IQ3_S, with perplexity of 4.120 and 4.097 respectively. A dual RTX 3090 community run across 456 MMLU prompts reported 86.40% for IQ4_XS and 86.62% for IQ3_S with Q8 PLE. These studies measured token fidelity and general-knowledge accuracy respectively. [Strata fidelity measurements](https://github.com/Niko1221/Strata/blob/main/docs/QUANTS.md) · [Dual RTX 3090 measurements](https://github.com/Niko1221/Strata/issues/5881)

ITLab ran 49 tasks on the same Strata version with Unsloth UD-IQ4_XS V3.1 and Swift 1.5 abliterated IQ3_S. Both reached 34/34 programming checks and 83/83 software-project checks. That comparison used a Swift derivative and different top_p settings. Separately, ISTA reported 82.0% for its IQ3_S on SWE-bench Verified, against 82.8% for the base model. Forum users described conflicting firsthand experiences. We found no public coding benchmark with paired task outcomes for these two exact packs under matched settings. [ITLab’s 49-task run](https://itlab.cl/en/unsloth-avalon-iq3-ks-itlab-bench-ranking/) · [ISTA release discussion](https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF/discussions/26) · [Community discussion](https://www.reddit.com/r/LocalLLM/comments/1xtnw7y/qwen_38_fn_gsq_rco_iq3s_is_better_than_new/)

The contest tasks may have appeared in training data. The single samples, near-exclusive AtCoder coverage, exclusion of huge or multi-answer cases, and local Python timing rules all limit generalization. The findings apply to these two published packs under the measured workstation configuration.
