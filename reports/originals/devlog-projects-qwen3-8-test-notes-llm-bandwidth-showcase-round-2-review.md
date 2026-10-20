---
type: Note
title: "LLM bandwidth showcase — Round 2 review and scope expansion"
status: current
description: "Second review accepts the three Round-1 functional fixes but requires a pedagogically meaningful visualization and a current 2026 device/model catalog."
tags: [qwen3.8, oq4e, mtp, review, frontend, visualization, data]
timestamp: 2026-08-23T03:53:17Z
---

# LLM bandwidth showcase — Round 2 review and scope expansion

[English](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-2-review.md) | [简体中文](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-2-review_CN.md)

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Local inference workstation |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | See original report; current snapshot does not fill missing historical configuration |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | Not recorded in the surviving test evidence; current OS is not substituted |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

## Functional regression check

Round-1 fixes are accepted: Canvas first-load animation now paints; capacity-insufficient configurations show “Not applicable” rather than invalid local-bandwidth tok/s; context length now affects the explicitly labelled KV teaching estimate, total memory and fit result. No console warning/error was found during the independent local page check.

## UX-04 — Current animation is decorative, not explanatory (P1)

The user’s visual review correctly identifies the remaining core problem. The current scene shows weight blocks moving from a generic “memory warehouse” to “GPU core” and a separate token stack moving upward. Its movement is not causally legible:

- It does not show **one decode step**: read the model weights once → execute layers → emit one next token → repeat.
- It gives no visual mapping from `weightGB / bandwidthGBs` to the displayed milliseconds/token or tok/s.
- The particle count, speed, channel width and token stack change independently enough that a viewer cannot infer which motion represents bandwidth, model size or output cadence.
- The static image still conveys almost all available information; motion adds visual activity without adding the lesson.

### Required redesign

Replace the decorative continuous flow with a user-controlled, labeled **single-token timeline**:

1. **Read Weights** — highlight one “model weight read” whose label states `64 GB ÷ 800 GB/s = 80 ms`.
2. **Layer-wise Computation** — short, visually secondary compute step; explain it is omitted from the bandwidth-only upper bound.
3. **Output 1 token** — emit exactly one token and show the cycle total / derived theoretical rate.
4. **Repeat Next Token** — reset the timeline and make the recurrence explicit.

Keep playback optional, but step/seek must remain comprehensible when paused and under `prefers-reduced-motion`. For offload, stop the timeline at the unsupported boundary and say that the local-memory formula is not used; do not invent an external-transfer animation rate.

**Acceptance evidence:** a reviewer can pause at each step and explain, from visible labels alone, why a larger weight size raises time/token and higher bandwidth lowers it; changing the selected device/model updates the formula and the one-cycle duration coherently.

## DATA-01 — Device and model catalog is outdated (P1)

The page must stop presenting its small old list as “all surveyed hardware.” Add a current, source-backed 2026 baseline:

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

