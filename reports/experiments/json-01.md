# JSON Lens / Ornith

[English](json-01.md) | [简体中文](json-01_CN.md)

| Item | Record |
|---|---|
| ID | JSON-01 |
| Date | 2026-08-25—08-26 |
| Model and runtime | Ornith 1.5 35B-A3B |
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

A same-prompt, multi-round comparison. Declared automated gates passed, but final acceptance requirements were not fully met.

## Full reports

- [JSON Lens — Ornith 1.5 35B-A3B code review](../originals/devlog-projects-qwen3-8-test-notes-json-lens-ornith-code-review-2026-08-25.md)
- [JSON Lens — Round 3 final review and model comparison](../originals/devlog-projects-qwen3-8-test-notes-json-lens-round-3-final-comparison-2026-08-26.md)

## Evidence limits

The reports and prompt survive; the product source directory was not located.
