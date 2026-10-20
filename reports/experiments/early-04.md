# LLM memory-bandwidth teaching page / three review rounds

[English](early-04.md) | [简体中文](early-04_CN.md)

| Item | Record |
|---|---|
| ID | EARLY-04 |
| Date | 2026-08-22—08-23 |
| Model and runtime | oMLX RC Qwen3.8-27B-oQ4e-mtp + Qwen Code |
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

Canvas, formulas, controls, data and autoplay were repaired over several passes. The final conversation closed the run with one P1: a broken M5 Max source URL remained marked confirmed.

## Full reports

- [LLM bandwidth showcase — oQ4e-mtp delivery test](../originals/devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-oq4e-mtp-test.md)
- [LLM bandwidth showcase — Round 1 review](../originals/devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-1-review.md)
- [LLM bandwidth showcase — Round 2 review and scope expansion](../originals/devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-2-review.md)
- [LLM bandwidth showcase — Round 3 review](../originals/devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-3-review.md)

## Evidence limits

Four reports survive; the product source directory was not located.
