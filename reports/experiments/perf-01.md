# MTPLX Flash-Next / cold prefill and near-128K soak

[English](perf-01.md) | [简体中文](perf-01_CN.md)

| Item | Record |
|---|---|
| ID | PERF-01 |
| Date | 2026-09-19—09-20 |
| Model and runtime | MTPLX; Flash-Next Optimized Speed |
| Inference location | local |

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

## Historical result

Each model completed three near-128K natural-soak tasks: Flash ran for 13.5 minutes and Quality for 30.6 minutes. Cold prefill was measured at five input sizes.

## Full reports

- [MTPLX Flash-Next 128K Stress Test Execution Record](../originals/devlog-projects-qwen3-8-test-notes-mtplx-flash-next-128k-pressure-test-run-2026-09-20.md)
- [MTPLX Local Model Performance Comparison](../originals/qwen-tests-mtplx-model-comparison-report-2026-09-20.md)
- [MTPLX Local Model Performance Comparison](../originals/devlog-projects-qwen3-8-test-notes-mtplx-model-comparison-report-2026-09-20.md)

## Evidence limits

The Quality directory primarily contains results; both runs share pressure_test.py in the Flash directory. The initial 507 failure and incomplete matrix remain in the record.
