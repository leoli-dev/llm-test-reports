# Jev vs local Laya / the same 72 questions

[English](jev-01.md) | [简体中文](jev-01_CN.md)

| Item | Record |
|---|---|
| ID | JEV-01 |
| Date | 2026-09-21 |
| Model and runtime | Jev cloud proxy compared with local Laya |
| Inference location | cloud |

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Mac client / local comparison; cloud hardware was not recorded |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | See original report; current snapshot does not fill missing historical configuration |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | Not recorded in the surviving test evidence; current OS is not substituted |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

## Historical result

Jev scored 66/72 (91.7%) and Laya 37/72 (51.4%). Cloud latency and rate limits are reported separately.

## Full reports

- [Comparative Evaluation of Cloud Jev and Local Laya](../originals/devlog-projects-jev-tests-notes-jev-vs-local-laya-comparison-2026-09-21.md)

## Evidence limits

Jev inference was not local. The investment use cases in jev-tests/investment are a different suite and must not be conflated with the 72-question diagnostic set.
