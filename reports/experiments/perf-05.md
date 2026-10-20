# mlx-vlm / vision and DFlash2 stability ladder

[English](perf-05.md) | [简体中文](perf-05_CN.md)

| Item | Record |
|---|---|
| ID | PERF-05 |
| Date | 2026-10-19 |
| Model and runtime | Qwen3.8-27B 8bit; mlx-vlm vision + DFlash2 stepped stability |
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

32K, 64K, 96K, 128K and 128K-repeat stages and recovery probes passed. Two failed greedy-decoding samples are retained.

## Full reports

- [Qwen3.8-27B vision + DFlash2 stepped stability measurements](../originals/engine-tests-2026-10-19-vision-stability-report.md)

## Evidence limits

The main table spans processes and different sampling conditions; it is not one continuous single-factor run. Historical files were migrated from the former mlx-dspark directory.
