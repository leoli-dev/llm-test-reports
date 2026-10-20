# MLTF vs mlx-vlm / 128-request quality comparison

[English](perf-08.md) | [简体中文](perf-08_CN.md)

| Item | Record |
|---|---|
| ID | PERF-08 |
| Date | 2026-10-19 |
| Model and runtime | Qwen3.8-27B 8bit; MLTF vs mlx-vlm  |
| Inference location | local |

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Local inference workstation |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | See original report; current snapshot does not fill missing historical configuration |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | macOS 27.0.1 |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

## Historical result

Post-hoc execution of the original code passed 11/12 vs 10/12; medium-thinking mathematics passed 18/20 vs 17/20. Both backends scored 2/6 on each 32K/128K retrieval group.

## Full reports

- [MLTF / mlx-vlm paired quality, speed and memory comparison](../originals/engine-tests-2026-10-19-quality-comparison-report.md)

## Evidence limits

Frozen strict code scores were 10/12 on both backends, separate from post-hoc relaxed-sandbox scores. Small samples cannot establish losslessness; OFF mathematics was 0/20 on both and suffered a floor effect. Historical files were migrated from the former mlx-dspark directory.
