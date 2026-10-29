# DeepSeek-V4.1-Flash-1017 / Strata: M5 Max 128GiB local evaluation and retirement decision

[English](2026-10-28-strata-deepseek41-flash1017-2bpw-m5max.md) | [简体中文](2026-10-28-strata-deepseek41-flash1017-2bpw-m5max_CN.md)

Experiment ID: **PERF-14**. Testing began on **2026-10-28** and continued into **2026-10-29**, in **America/Toronto**. Both editions are complete reports. Archiving, translation and site validation did not repeat the model measurements.

> **Owner decision, 2026-10-29: this model setup is unsuitable for their local machine. They requested that the report be archived and pushed first, followed by deletion of the DeepSeek weights and its Pi / Strata settings, while retaining Strata and Qwen Flash Next.** This is the owner's practical acceptance decision for this machine, not a general model-quality ranking. This edition records the uninstall request; completion will be confirmed by a later dated update.

## Question, criteria and experiment type

The questions were whether this Mac could begin local testing after the official Strata preparation process, what speed to expect, and whether 128K / 256K could load and process actual long inputs. Checks were added during operation; this was not a preregistered, controlled comparison of models.

Before each call, the loaded service and configured window were checked. The official short smoke required normal text containing Paris; API smoke checked JSON and the arithmetic answer 391 separately. The long-input harness counted the actual tokenizer input and placed three random codes near 10% / 50% / 90% of **record positions**, requiring exactly matching JSON. Follow-ups checked conversation continuation, cache reuse and normal termination. Each window had one synthetic retrieval and one follow-up. Short generation used an output cap of 256 to measure speed, not to score text completeness.

## Hardware, test-time OS and request conditions

| Item | Actual configuration and evidence limits |
|---|---|
| Inference location and client | Local inference; local HTTP and Pi clients on the same Mac; no LAN PC or cloud inference |
| Inference host | MacBook Pro / Apple M5 Max; 18 CPU cores, 40 GPU cores; 128GiB unified memory; internal SSD. Core counts were author-recorded at deployment; service status also corroborates GPU and memory |
| Test-time OS | macOS 27.2 in the deployment log; OS build not recorded; arm64, with a signed macos-arm64 / Metal engine package target |
| Power and thermal state | Power source, performance mode, temperature and throttling were not recorded and cannot be used to explain the slowdown |
| Engine and agent | Strata Control 0.1.53; DeepSeek Metal package 0.1.53, build `55a557bb6d77`; Pi 1.4.0 from test-time installation / source inspection, while the Pi smoke JSON itself has no version string |
| Quantization and cache | Backbone average 2.00 bpw; Engram IQ4_NL effective 4.5 bpw; DSpark none; the engine's own compressed cache, without a Qwen INT8 KV option. Initial long requests reused 0 prompt-cache tokens; follow-ups are separate |
| Fixed request conditions | One request at a time; 6 experts, Full quality; `DS4_ENGRAM_THREADS=2`; text input; no DFlash / MTP / DSpark acceleration |
| Short generation | `reasoning_effort: none`, temperature 0, max_tokens 256; streamed TTFT and engine timings |
| Long input | Anthropic protocol, thinking disabled, temperature 0, max_tokens 512; target input approximately window minus 2048; cumulative wait caps of 600 seconds at 32K and 1800 seconds at 128K / 256K |
| Uncontrolled conditions | Other apps, file cache, prompts and execution history differed across samples; no continuous monitoring of background load, thermal state or process peak memory |

[Environment evidence and attribution](../../assets/perf-14/evidence/environment-evidence.json), [deployment log excerpt](../../assets/perf-14/evidence/prepare-excerpt.log). The older system snapshot in `environment.md` was not used to fill the missing OS build.

## Original initial-evaluation record

2026-10-28–10-29, America/Toronto. Machine: M5 Max (40 GPU cores), 128GB unified memory, internal SSD. File preparation, official and API smoke checks, synthetic retrieval at three positions in each of 32K / 128K / 256K, and cached follow-ups all passed. The end-of-measurement status snapshot showed a 256K service ready on local port 8086; this is historical status, not a service currently available to public-site readers. Weights, precision and memory budgets were not adjusted. The 260K initial long input took approximately 15 minutes 57 seconds to its first token; short requests do not read the whole configured window.

**Observed performance limitation: a marked slowdown and higher system swap followed this long-context sequence; the cause was not located.** Initial short generation at 32K produced 15.0 token/s. A new short request after the 256K long-input test fell to 2.3 token/s; after restarting the 256K process it measured 4.6 token/s, while whole-system swap remained around 8.62GiB. Passing the three synthetic retrieval cases does not establish stable sustained performance; the initial 15 token/s alone cannot describe the later operating state.

The complete set was 256,816,878,701 bytes (256.82GB). All 7/7 files passed the official size and SHA256 checks, and pack integrity passed. After other model services were stopped, official engine smoke correctly answered Paris; the 32K API smoke checks for JSON without thinking and arithmetic with thinking passed 2/2. [Verified manifest](../../assets/perf-14/evidence/verified-manifest.json), [preparation excerpt](../../assets/perf-14/evidence/prepare-excerpt.log), [official smoke](../../assets/perf-14/evidence/official-smoke.log), [API smoke](../../assets/perf-14/evidence/smoke-20261028-234743-749089.json).

## Model and runtime configuration

- Base model: `deepseek-ai/DeepSeek-V4.1-Flash-1017`. ISTA-DASLab GSQ-RCO GGUF pinned revision: `cb02422c900df489cea5833e8a92171224059b3c`.
- Backbone average 2.00 bpw is mixed quantization, not 2-bit for every tensor; the filename label is IQ2_XXS. Engram is IQ4_NL, effective 4.5 bpw. The DSpark file is labeled Q8_0 and also contains mixed precision; `--dspark none` disabled it in these tests.
- Strata Control 0.1.53; DeepSeek Metal package 0.1.53, build `55a557bb6d77`. Stable engine path: `$HOME/.local/share/strata/install/engine-dsv41/0.1.53-macos-arm64-metal/strata-dsv41`. The API `engine: ds4-0.1` value is an internal identifier, not a release version.
- One request, six experts at Full quality, `DS4_ENGRAM_THREADS=2`, text input; API `http://127.0.0.1:8086/v1`, local only. Default 262144 tokens shared by input and output, switchable to 32K / 128K / 256K.
- Pi provider `strata-deepseek`, model `deepseek-v4.1-flash`, text input, 256K window and at most 32768 output tokens per turn. Pi's arithmetic call without thinking returned `391`, correctly mapping thinking off to API none; this smoke disabled Pi tools, extensions and related capabilities. [Pi record](../../assets/perf-14/evidence/pi-smoke.json).
- A separate direct API function-call round trip passed: `report_number` received `{"value":391}`; sending back the tool result produced the continuation `DONE`. This validates an API tool round trip, not Pi tool use. [API tool record](../../assets/perf-14/evidence/tool-roundtrip.json).

## Measured performance and long context

All three English short-generation samples disabled thinking and produced 256 tokens, ending at the output cap:

| Configuration and execution state | Short input tokens | TTFT | Generation token/s | Total time |
|---|---:|---:|---:|---:|
| Initial warm 32K process, before long-input testing | 42 | 2.487s | 15.0 | 19.524s |
| New short request after the 256K long-input test | 38 | 9.995s | 2.3 | 119.434s |
| New short request after restarting the 256K process | 42 | 6.714s | 4.6 | 62.484s |

Evidence: [initial 32K](../../assets/perf-14/evidence/short-generation-32k.json), [after 256K long context](../../assets/perf-14/evidence/short-generation-256k.json), [after the 256K restart](../../assets/perf-14/evidence/short-generation-256k-fresh.json). Windows, execution histories, prompts and memory states differed. These are uncontrolled observations and do not establish that the context cap, thermal throttling or a specific bug caused the slowdown. Capped output is not a score of text completeness or general capability.

TTFT, prefill and generation rates in the following table are from the initial long-input retrieval request. Cached follow-ups are shown separately.

| Configured window | Actual input tokens | Three-position retrieval / follow-up | TTFT | Prefill token/s | Generation token/s |
|---|---:|---|---:|---:|---:|
| 32K (32768) | 30,705 | 3/3 passed; follow-up passed with cache reuse | 92.548s | 331.9 | 11.6 |
| 128K (131072) | 129,000 | 3/3 passed; follow-up passed with cache reuse | 384.916s | 335.3 | 10.6 |
| 256K (262144) | 260,078 | 3/3 passed; follow-up passed with cache reuse | 957.087s | 271.8 | 5.2 |

Each case placed three random codes near 10%, 50% and 90% of synthetic records. Initial requests had no cache reuse and recovered every code. The initial 32K / 128K / 256K requests generated 44 / 41 / 42 tokens respectively; the initial 256K request took 965.115s in total. Cached follow-ups were:

| Configured window | Actual follow-up input tokens | Cache-reused tokens | Follow-up TTFT | Generation token/s |
|---|---:|---:|---:|---:|
| 32K | 30,774 | 30,748 | 1.662s | 15.1 |
| 128K | 129,066 | 129,040 | 1.926s | 11.5 |
| 256K | 260,145 | 260,119 | 2.284s | 7.6 |

Each follow-up reread only 26 tokens; dividing the full input by this short delay would not measure prefill rate. The previous answer already contained the codes, so follow-ups validate conversation continuation and cache reuse, not a second independent long-document retrieval. Evidence: [32K](../../assets/perf-14/evidence/long-32768-20261028-234910-947945.json), [128K](../../assets/perf-14/evidence/long-131072-20261028-235311-357133.json), [256K](../../assets/perf-14/evidence/long-262144-20261029-000256-587890.json).

## Memory and limits of the findings

Startup logs estimated approximately 40–44GB of anonymous memory in other applications. Expert residency budgets were therefore below the plan estimate of roughly 69GB: 45.37GB for experts at 32K, 48.73GB at 128K and 49.49GB at 256K. The 256K startup also logged approximately 40.0GB of anonymous memory in other apps and 0.24GB of cache. Other apps differed at each startup. These engine budget / allocation logs do not show that larger windows reduce memory, and are not total model RSS, measured peak memory or whole-system usage. The upstream speed run also co-ran an idle Qwen service occupying approximately 60GB; it was not an otherwise idle machine. Some experts and Engram are read on demand from SSD, so file size is not resident RAM. [32K engine log](../../assets/perf-14/evidence/engine-32k-initial.log), [256K engine log](../../assets/perf-14/evidence/engine-256k.log).

Whole-system swap point samples: 14.50M both before and after the initial 32K short generation; 530.06M at the end of the 128K round; 530.06 / 540.00 / 572.00M before / during / at the end of the 256K long-input test. The later short-generation stage after long context observed roughly 8850–8866M, with a saved reading of **8866.38M (approximately 8.66GiB)**. Before / after the short sample following the 256K restart, readings were 8834.38 / 8826.38M, still around **8.62GiB**. Thus 572M is a reading from an earlier stage, not final swap usage for the whole sequence. These sysctl readings are for the whole system, not model process peaks. They do not establish that DeepSeek caused all of the increase, and do not support a claim that the entire test ran without paging. [After 128K](../../assets/perf-14/evidence/swap-after-128k.txt), [before 256K](../../assets/perf-14/evidence/swap-before-256k.txt), [during](../../assets/perf-14/evidence/swap-during-256k.txt), [end](../../assets/perf-14/evidence/swap-after-256k.txt), [after the later short request](../../assets/perf-14/evidence/swap-after-post-long-short.txt), [restart sample readings](../../assets/perf-14/evidence/short-generation-256k-fresh.json).

Every performance point is one sample. Passing is limited to these synthetic retrieval and continuation cases. A substantial later performance change was observed, so stable sustained performance has not been accepted. Full-window output, broad quality evaluation and peak-memory monitoring were not completed, and general long-document reasoning cannot be inferred. Upstream Mac documentation measured only to approximately 32K; the 128K / 256K results here come from the local evidence above. [Upstream Mac documentation](https://github.com/Niko1221/Strata/blob/main/docs/DEEPSEEK_MAC.md).

## Historical operation, reproduction and evidence

These are the command forms used during measurement. They are not current service entry points after retirement. The Pi command established a plain client round trip; API tools were tested separately. Global Pi configuration and credentials are not published.

```sh
~/local_llms/strata/deepseek/start.sh
~/local_llms/strata/deepseek/status.sh
~/local_llms/strata/deepseek/smoke.sh
~/local_llms/strata/deepseek/stop.sh
pi --provider strata-deepseek --model deepseek-v4.1-flash
```

The [long-input harness](../../assets/perf-14/source/long_context.py) preserves record generation, token counting, SSE handling, timeouts and follow-up checks. Only the private root path was changed to `Path.home() / 'local_llms'`. Replay requires separately installing matching weights / runtime and starting the matching window, then reading seed and target from `input.replay` in each JSON. Requests, SSE data, expected codes, original outputs and actual token counts are retained. The 257GB weights, slot binary caches and full personal sessions are excluded.

[Download evidence ZIP](../../assets/perf-14/deepseek1017-m5max-evidence.zip) · [Evidence guide](../../assets/perf-14/README.md) · [SHA256 manifest](../../assets/perf-14/SHA256SUMS.json) · [Provenance and publication transforms](../../assets/perf-14/publication-provenance.json). The preparation log is a selected excerpt containing environment, package and pack records; the complete local log's SHA256 remains in the provenance manifest.

## 2026-10-29: owner acceptance and retirement request

After reviewing the results, the owner explicitly judged this model unsuitable for their machine and requested saving the report in `llm-test-reports`, pushing it, then deleting the model and removing its Pi / Strata configuration while keeping Strata and Qwen Flash Next. The earlier 9/9 recovered hidden codes and 3/3 successful cached follow-ups remain recorded. Their limited passing scope does not overturn the owner's rejection of the wait, speed and system-resource costs.

When this archive was written, the main task still had to perform uninstall after the report push. This edition therefore does not claim deletion, reclaimed space or a successful Qwen acceptance check. A subsequent dated uninstall record should retain the measured findings in this report.

## Publication handling

An explicit allowlist preserves original local-file SHA256 and published-file SHA256 for each selected source. Private home paths are generalized to `$HOME`, report links are relative archive links, and the reproduction script changes only its private root path. Public GitHub / Hugging Face links and loopback endpoints that do not identify a private network host remain. `before/`, `private/`, raw Pi `models.json` / backups, client auth, weights and runtime caches are excluded. The complete bilingual editions preserve measurements, failures, unlocated causes and human intervention. Retirement is a new dated update, without silently replacing the historical retrieval passes.
