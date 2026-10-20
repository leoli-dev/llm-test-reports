# Frog Choir / initial and repair rounds

[English](frog-01.md) | [简体中文](frog-01_CN.md)

| Item | Record |
|---|---|
| ID | FROG-01 |
| Date | 2026-08-23—08-24 |
| Model and runtime | MTPLX Optimized Quality + Pi / Qwen Code |
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

Core features failed in the first review. The second round restored camera, audio and calibration paths; real-device evidence still showed a handedness-mapping problem.

## Full reports

- [MTPLX + Pi `frog-choir` test](../originals/devlog-projects-qwen3-8-test-notes-mtplx-pi-frog-choir-test.md)
- [Frog Choir — Round 1 independent review](../originals/devlog-projects-qwen3-8-test-notes-frog-choir-round-1-review.md)
- [Frog Choir — Round 2 independent review](../originals/devlog-projects-qwen3-8-test-notes-frog-choir-round-2-review.md)

## Evidence limits

Older reports use frog-choir_mtplx-quality-pi. The current directory was associated by project name and file structure, without proving byte-for-byte identity to the reviewed version.
