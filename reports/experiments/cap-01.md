# Pi capability exam: Qwen3.8-27B 8-bit on MLTF / Splash

[English](cap-01.md) | [简体中文](cap-01_CN.md)

| Item | Record |
|---|---|
| Date | 2026-10-21 |
| Model | Qwen3.8-27B 8-bit (MLTF q8c / MLX affine8) |
| Engine | MLTF,Splash |
| Inference location | local |
| Inference hardware | MacBook Pro / Apple M5 Max / 18 CPU / 40 GPU / 128 GiB |
| Test-time OS | macOS 27.0.1 (26A434), arm64; captured at test time |

Frozen 18-question, eight-domain primary examination through actual Pi CLI, same 128K context/medium/sampling and 8K per-turn output: MLTF 70.83, Splash 66.67. Separate 32K-output visual supplement: 2D 50.00 / 94.44, 3D 0.00 / 0.00 (MLTF / Splash). All 44 sessions retained; functional tests, renders, criterion judgments and evidence included. Curated local adaptation, not official full-benchmark scores.

[Full report](../originals/2026-10-21-pi-qwen38-27b-mltf-splash-capabilities.md)

One MLTF post-write session was externally interrupted; its verified delivered file is graded, with incomplete timing disclosed. One stochastic session per engine/task/budget; visual judgments are by the supervising assistant. Pi injects different workspace metadata across budget phases; only within-phase pairs have matching initial input. Missing/truncated artifacts remain in the denominator.
