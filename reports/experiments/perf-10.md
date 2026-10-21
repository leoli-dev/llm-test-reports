# Qwen3.8-27B: three local 8-bit configurations and GGUF record

[English](perf-10.md) | [简体中文](perf-10_CN.md)

| Item | Record |
|---|---|
| Date | 2026-10-21 |
| Model | Qwen3.8-27B MLX affine8 / MLTF q8c / GGUF Q8_0 (local files removed); INT8 KV |
| Engine | Splash,MLTF |
| Inference location | local |
| Inference hardware | MacBook Pro / Apple M5 Max / CPU 18 / GPU 40 / 128 GiB unified memory |
| Test-time OS | macOS 27.0.1 (26A434), arm64; test-time hardware.json |

Two fresh-process GGUF Q8_0 image requests; 2/2 full 4096-token outputs. Mean complete time 1036.37 s; content delivery 15.64 tok/s. Earlier same-day PERF-09 references are labeled separately.

[Full report](../originals/2026-10-21-splash-gguf-q8-perf06-replay.md)

PERF-09 baselines were not rerun/interleaved. Q8_0 and affine8 contain different quantized values; no format-only causal or general quality claim. Historical PERF-06 speed remained unreproduced in PERF-09.

Background load was uncontrolled: global CPU ~53%–55% and global GPU busy ~25%–27% during GGUF delivery. Browser helpers showed high CPU after inference; this does not establish their full load during the requests.

Local mean content delivery: Splash MLX affine8 29.36, MLTF q8c 27.97, Splash GGUF Q8_0 15.64 tok/s. All configurations completed 4096 outputs with vision/recovery checks. The user chose to remove GGUF weights because of observed speed.
