# Neon Bastion / Flash-Next version

[English](flash-04.md) | [简体中文](flash-04_CN.md)

| Item | Record |
|---|---|
| ID | FLASH-04 |
| Date | 2026-08-31—09-01 (directory / conversation) |
| Model and runtime | Directory label: MTPLX Flash + Pi |
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

Product source, unit tests and E2E scripts exist. No complete independent summary specific to this directory was found.

## Full reports

- [NEON BASTION — 4v4 sector assault](../originals/qwen-tests-mtplx-flash-with-pi-3d-team-arena-readme.md)

## Evidence limits

Do not attribute the seven-round mlx-dspark/8bit results to this separate implementation.
