# Neon Bastion / ds-v4-flash-vision 55-task run

[English](neon-03.md) | [简体中文](neon-03_CN.md)

| Item | Record |
|---|---|
| ID | NEON-03 |
| Date | 2026-09-08—09-16 |
| Model and runtime | ds-v4-flash-vision + DeepSeek Harness; cloud comparison |
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

All 55/55 tasks completed. The historical final record contains 550 unit tests and 122 E2E scenarios; human acceptance still found omissions in automated coverage.

## Full reports

- [Neon Bastion ds-v4-flash-vision run — A01–A03](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-ds-v4-flash-vision-run-2026-09-08.md)
- [Neon Bastion Three-Round Test Cross-Sectional Summary](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-three-rounds-summary-2026-09-16.md)

## Evidence limits

Source was stored locally, but inference was in the cloud. This is not a local-inference benchmark. The old single-run note title is stale; use the cross-run summary and acceptance documents for the final state.
