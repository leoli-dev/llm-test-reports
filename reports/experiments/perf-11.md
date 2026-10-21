# Splash affine8 native 256K context stress test

[English](perf-11.md) | [简体中文](perf-11_CN.md)

| Item | Record |
|---|---|
| Date | 2026-10-21 |
| Model | Qwen3.8-27B MLX affine8 / INT8 KV |
| Engine | Splash |
| Inference location | local |
| Inference hardware | MacBook Pro / Apple M5 Max / 18 CPU / 40 GPU / 128 GiB |
| Test-time OS | macOS 27.0.1 (26A434), arm64; test-time hardware.json |

Native 262144-token window; 258048-input/4096-output cold case mechanically completed=True, keys 5/5, output 4096. Includes 128K/192K tiers, exact warm repeat, two shared-prefix concurrent clients, actual oversized-input rejection=True, recovery 6/6; audit 62/63.

[Full report](../originals/2026-10-21-splash-affine8-256k-stress.md)

One finite text-only sequence with reasoning off, retained RAM prefixes and uncontrolled background load/thermals. Concurrent HTTP admission does not imply independent cold-prefill throughput. No new MLTF comparison, long-duration leak test or general reasoning-quality ranking.
