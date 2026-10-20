# Shopping MVP / Qwen3.5-122B-A10B-4bit

[English](shop-01.md) | [简体中文](shop-01_CN.md)

| Item | Record |
|---|---|
| ID | SHOP-01 |
| Date | 2026-06 (original report) |
| Model and runtime | Claude Code + oMLX; Qwen3.5-122B-A10B-4bit |
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

94/100. Accepted after two code-review rounds.

## Full reports

- [Local LLM Coding Capability Evaluation — Full-Stack E-commerce MVP](../originals/early-tests-local-llm-shoping-mvp-test-readme.md)
- [Code Review — Round 2](../originals/early-tests-local-llm-shoping-mvp-test-qwen3-5-122b-a10b-4bit-code-review.md)

## Artifact

- [Shopping MVP 同题作品](https://github.com/leoli-dev/local-llm-shoping-mvp-test)
