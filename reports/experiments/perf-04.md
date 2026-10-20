# mlx-dspark / 128K and 256K long context

[English](perf-04.md) | [简体中文](perf-04_CN.md)

| Item | Record |
|---|---|
| ID | PERF-04 |
| Date | 2026-10-19 |
| Model and runtime | Qwen3.8-27B 8bit; mlx-dspark 128K  |
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

128K completed. 256K also returned output, but memory pressure occurred and swap increased by approximately 12.31 GiB.

## Full reports

- [Qwen3.8-27B 128K / 256K long-context measurements](../originals/engine-tests-2026-10-19-long-context-report.md)

## Evidence limits

One performance sample per length, with 512-token output; not a complete code-quality test. Old absolute report links may still describe the former mlx-dspark directory; the files were migrated into the MLTF historical records.
