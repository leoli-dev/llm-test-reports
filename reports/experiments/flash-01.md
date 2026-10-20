# Orbital Garden

[English](flash-01.md) | [简体中文](flash-01_CN.md)

| Item | Record |
|---|---|
| ID | FLASH-01 |
| Date | 2026-08-31—09-01 |
| Model and runtime | MTPLX qwen3.8-flash-next-optimized-speed + Pi |
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

The core scene passed. The narrow-screen no-WebGL fallback was clipped.

## Full reports

- [Orbital Garden — MTPLX/Pi Flash Next independent acceptance and code review](../originals/devlog-projects-qwen3-8-test-notes-orbital-garden-mtplx-pi-flash-next-review-2026-08-31.md)

## Evidence limits

The old report directory name no longer resolves. The current directory matches the project and implementation structure; this is not a historical snapshot hash verification.
