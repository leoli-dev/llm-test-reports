# MLTF / real Qwen, Pi and Hermes CLI checks

[English](perf-07.md) | [简体中文](perf-07_CN.md)

| Item | Record |
|---|---|
| ID | PERF-07 |
| Date | 2026-10-19 |
| Model and runtime | Qwen3.8-27B 8bit; MLTF  |
| Inference location | local |

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Local inference workstation |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | See original report; current snapshot does not fill missing historical configuration |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | macOS 27.0.1 (26A434) |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

## Historical result

Qwen and Pi passed the main round. Hermes failed the 4096-token main round; a separate 16K follow-up ultimately passed.

## Full reports

- [MLTF: real qwen / pi / hermes CLI acceptance on long multimodal tasks](../originals/engine-tests-2026-10-19-mltf-clients-report.md)

## Evidence limits

Original failures remain. This was a long task within a 128K window, not a full 128K input. Client system prompts and thinking settings differed. Historical files were migrated from the former mlx-dspark directory.
