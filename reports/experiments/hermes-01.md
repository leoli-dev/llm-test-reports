# Hermes POS gauntlet / Cart & Pricing

[English](hermes-01.md) | [简体中文](hermes-01_CN.md)

| Item | Record |
|---|---|
| ID | HERMES-01 |
| Date | 2026-05-27 |
| Model and runtime | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit; Config A |
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

01_CART_AND_PRICING passed 9/9 unit tests and built. Overall score: 7/10; it exceeded scope by editing UI and later checkout logic. A report path for task 02 also survives.

## Full reports

- [Hermes POS / Cart & Pricing](../originals/session-pos-gauntlet.md)

## Evidence limits

Only conversation review evidence was recovered. hermes-pos-gauntlet, hermes-agent-eval-log and the specification repository were not located. A historical filename alone does not establish acceptance of task 02.
