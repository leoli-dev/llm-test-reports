# Paris 3D

[English](early-03.md) | [简体中文](early-03_CN.md)

| Item | Record |
|---|---|
| ID | EARLY-03 |
| Date | 2026-08-22 |
| Model and runtime | oMLX Qwen3.8-27B + Qwen Code |
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

The later version passed 46/46 unit tests and built successfully, and coordinate data was repaired. Final visual acceptance and all three tour modes still failed.

## Full reports

- [Paris 3D — Qwen3.8-27B test](../originals/devlog-projects-qwen3-8-test-notes-paris-3d-qwen3-8-27b-test.md)

## Evidence limits

Some reports still refer to prompts/; the prompts were found under test-prompts/. Product source in paris3d/ was not located.
