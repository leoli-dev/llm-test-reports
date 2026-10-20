# Arcology control room / Pi attempts and Qwen Code delivery

[English](early-02.md) | [简体中文](early-02_CN.md)

| Item | Record |
|---|---|
| ID | EARLY-02 |
| Date | 2026-08-21 |
| Model and runtime | oMLX True2456/Qwen3.8-27B-AWQ-5.0bpw; Pi / Qwen Code coding-reason |
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

Qwen Code delivered the application and fixed several defects. Narrow-screen overflow and a QA loop remained; earlier Pi/MTPLX attempts also hit shape errors and repeated-token failures.

## Full reports

- [First successful Qwen Code test](../originals/devlog-projects-qwen3-8-test-notes-first-successful-qwen-code-test.md)
- [Arcology control room — Round 1 review](../originals/devlog-projects-qwen3-8-test-notes-arcology-control-room-round-1-review.md)

## Evidence limits

Reports and conversation evidence remain. The original product source directory was not found and must not be described as recovered code.
