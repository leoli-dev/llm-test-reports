# Local Laya service / 72 questions and concurrency limits

[English](laya-01.md) | [简体中文](laya-01_CN.md)

| Item | Record |
|---|---|
| ID | LAYA-01 |
| Date | 2026-09-21 |
| Model and runtime | aac6fef/laya-multilingual-mlx; GPU FP16; 1024 tokens |
| Inference location | local |

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Local inference workstation |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | Apple M5 Max / 128 GB / Python 3.12.13 |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | Darwin 27.0.0; macOS product version not recorded |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

## Historical result

37/72 correct (51.4%). Single-question latency was very low, but concurrency seven produced a connection-reset cliff.

## Full reports

- [Laya Local Service In-Depth Evaluation](../originals/devlog-projects-laya-mlx-notes-local-service-deep-evaluation-2026-09-21.md)
- [Local benchmarks](../originals/source-benchmarks.md)

## Evidence limits

Laya is a discriminative model, listed separately from generative LLMs. Temporary /tmp result JSON mentioned in the report needs separate existence checks.
