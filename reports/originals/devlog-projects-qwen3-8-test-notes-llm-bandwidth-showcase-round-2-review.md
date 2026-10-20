---
type: Note
title: LLM bandwidth showcase — Round 2 review and scope expansion
status: current
description: Second review accepts the three Round-1 functional fixes but requires a pedagogically meaningful visualization and a current 2026 device/model catalog.
tags: [qwen3.8, oq4e, mtp, review, frontend, visualization, data]
timestamp: 2026-08-23T03:53:17Z
---

# LLM bandwidth showcase — Round 2 review and scope expansion

## Functional regression check

Round-1 fixes are accepted: Canvas first-load animation now paints; capacity-insufficient configurations show “不适用” rather than invalid local-bandwidth tok/s; context length now affects the explicitly labelled KV teaching estimate, total memory and fit result. No console warning/error was found during the independent local page check.

## UX-04 — Current animation is decorative, not explanatory (P1)

The user’s visual review correctly identifies the remaining core problem. The current scene shows weight blocks moving from a generic “memory warehouse” to “GPU core” and a separate token stack moving upward. Its movement is not causally legible:

- It does not show **one decode step**: read the model weights once → execute layers → emit one next token → repeat.
- It gives no visual mapping from `weightGB / bandwidthGBs` to the displayed milliseconds/token or tok/s.
- The particle count, speed, channel width and token stack change independently enough that a viewer cannot infer which motion represents bandwidth, model size or output cadence.
- The static image still conveys almost all available information; motion adds visual activity without adding the lesson.

### Required redesign

Replace the decorative continuous flow with a user-controlled, labeled **single-token timeline**:

1. **读取权重** — highlight one “model weight read” whose label states `64 GB ÷ 800 GB/s = 80 ms`.
2. **逐层计算** — short, visually secondary compute step; explain it is omitted from the bandwidth-only upper bound.
3. **输出 1 token** — emit exactly one token and show the cycle total / derived theoretical rate.
4. **重复下一个 token** — reset the timeline and make the recurrence explicit.

Keep playback optional, but step/seek must remain comprehensible when paused and under `prefers-reduced-motion`. For offload, stop the timeline at the unsupported boundary and say that the local-memory formula is not used; do not invent an external-transfer animation rate.

**Acceptance evidence:** a reviewer can pause at each step and explain, from visible labels alone, why a larger weight size raises time/token and higher bandwidth lowers it; changing the selected device/model updates the formula and the one-cycle duration coherently.

## DATA-01 — Device and model catalog is outdated (P1)

The page must stop presenting its small old list as “所有已调研硬件”. Add a current, source-backed 2026 baseline:

- GeForce RTX 5090 — 32 GB GDDR7, 1,792 GB/s.
- RTX PRO 6000 Blackwell Workstation Edition — 96 GB ECC GDDR7, 1,792 GB/s.
- Apple M5 Max top configuration — up to 128 GB unified memory, up to 614 GB/s.
- NVIDIA DGX Spark — 128 GB coherent unified memory, 273 GB/s. “DGX” is a product family; list a concrete named system, rather than a generic “NVIDIA DGX”.
- Qwen3.8-27B — dense 27B model.
- DeepSeek-V4-Flash — record **284B total / 13B active**. Storage/capacity and weight-bandwidth calculations must use total parameters; active parameters may be separately displayed as compute-context metadata.

All additions require new official URLs and the actual retrieval date. Hardware records should distinguish `dedicated VRAM` from `unified/coherent system memory`, so a reader does not conflate a GPU board with an integrated system.

### Verified source set (2026-08-23)

- NVIDIA RTX 5090 announcement: 32 GB / 1,792 GB/s.
- NVIDIA RTX PRO 6000 product specifications: 96 GB / 1,792 GB/s.
- Apple M5 Max announcement: up to 128 GB / 614 GB/s.
- NVIDIA DGX Spark product specifications: 128 GB / 273 GB/s.
- Qwen Qwen3.8-27B official model card.
- DeepSeek-V4-Flash official model card: 284B total / 13B active.

