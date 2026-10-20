# MLTF × Pi / four rounds of 3D Tank Battle

[English](tank-01.md) | [简体中文](tank-01_CN.md)

| Item | Record |
|---|---|
| ID | TANK-01 |
| Date | 2026-10-20 |
| Model and runtime | MLTF 0.1.2 + Qwen3.8-27B 8bit q8c + Pi |
| Inference location | local |

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Local inference workstation |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | See original report; current snapshot does not fill missing historical configuration |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | macOS 27.0.1 |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

## Historical result

Four rounds: 430 requests, 461,939 output tokens, approximately 5.44 hours, and 29 supervisory text prompts.

## Full reports

- [Driving 8-bit Qwen3.8-27B with MLTF on M5 Max: A Four-Round Supervised Test of pi Building a 3D Tank Battle](../originals/qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report.md)
- [Driving 8-bit Qwen3.8-27B with MLTF on M5 Max: A Four-Round Supervised Test of pi Building a 3D Tank Battle](../originals/devlog-projects-qwen3-8-test-notes-mltf-pi-tank-battle-four-round-report-2026-10-20.md)
- [Local Qwen3.8-27B-MLTF-q8c × pi: 3D Tank Battle Supervised Experiment Report](../originals/qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-1.md)
- [Local Qwen3.8-27B-MLTF-q8c × pi: Tank Battle Round 2 supervised report](../originals/qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-2.md)
- [Qwen3.8-27B-MLTF-q8c × pi: Round 3 game restructuring and local performance report](../originals/qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-3.md)
- [MLTF / Qwen3.8-27B supervised local experiment: R4 UI-obstruction repair](../originals/qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-4.md)

## Artifact

- [Tank Battle](https://github.com/leoli-dev/llm-test-2026-10-20-game-tank-battle)
- [Play in your browser](https://leoli-dev.github.io/llm-test-2026-10-20-game-tank-battle/)

## Evidence limits

game/ contains the product; supervision/ contains supervision, performance and acceptance scripts. github-share is a sharing snapshot, not another experiment round.
