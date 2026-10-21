# Splash vs MLTF / PERF-06 128K vision replay

[English](perf-09.md) | [简体中文](perf-09_CN.md)

| Item | Record |
|---|---|
| Date | 2026-10-21 |
| Model | Qwen3.8-27B MLX affine 8bit / MLTF q8c; INT8 KV |
| Engine | Splash,MLTF |
| Inference location | local |
| Inference hardware | MacBook Pro / Apple M5 Max / CPU 18 / GPU 40 / 128 GiB unified memory |
| Test-time OS | macOS 27.0.1 (26A434), arm64; test-time hardware.json |

Fresh-process ABBA replay: four full 4096-token outputs and vision/recovery checks passed. Splash mean complete time 633.02 s vs MLTF 777.38 s; content delivery 29.36 vs 27.97 tok/s.

[Full report](../originals/2026-10-21-splash-vs-mltf-perf06-replay.md)

Two tasks per backend. Fresh MLTF did not reproduce historical PERF-06 speed; cause not isolated. One status-telemetry timeout is retained (66/67 evidence checks). No generated-code correctness or general quality claim.
