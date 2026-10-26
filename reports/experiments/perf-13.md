# Strata cold-KV TTFT: ten 128K-input and ten 256K stress trials

[English](perf-13.md) | [简体中文](perf-13_CN.md)

| Item | Record |
|---|---|
| Date | 2026-10-26 |
| Model | Qwen3.8-Flash-Next GSQ-RCO IQ3_S |
| Engine | Strata |
| Inference location | local |
| Inference hardware | Local MacBook Pro / Apple M5 Max / 18 CPU / 40 GPU / 137438953472 bytes (128 GiB) unified memory |
| Test-time OS | macOS 27.0.1 (26A434), arm64; captured test-time host.json |

20/20 trials completed with zero reused KV tokens and 4096 output tokens each. Mean TTFT 120.530/253.769 s; pooled prefill 1087.986/1017.203 and decode 80.060/76.651 tok/s for 128K/256K. All 4762 pressure samples normal; same-source swap growth 0; 275/275 audit checks passed.

[Full report](../originals/2026-10-26-strata-cold-kv-128k-256k.md)

128K denotes 131072 input tokens; the service stays at 262144 throughout. 256K is 258040 input + 4096 output + 8 reserved tokens. Preloaded model, thinking off, fixed group order and synthetic SQL; no general-quality or thermal-causality claim. Curated evidence excludes private process inventory and full input/SSE streams.
