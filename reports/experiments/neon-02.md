# Neon Bastion / MTPLX 55-task rerun

[English](neon-02.md) | [简体中文](neon-02_CN.md)

| Item | Record |
|---|---|
| ID | NEON-02 |
| Date | 2026-09-07—09-16 |
| Model and runtime | MTPLX Qwen3.8-27B Optimized Speed + Pi |
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

All 55/55 tasks eventually completed in 55 commits: 793 unit tests, 202 E2E scenarios and nine negative controls, over approximately 70 hours. Per-task evidence and the September 16 comparison survive.

## Full reports

- [Neon Bastion 55-task rerun — A01–D05](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-55task-rerun-2026-09-07.md)
- [Neon Bastion Three-Round Test Cross-Sectional Summary](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-three-rounds-summary-2026-09-16.md)

## Evidence limits

55task-run contains orchestration and metrics. Game source is in mtplx-27B-optimized-speed-with-pi-neon-bastion.
