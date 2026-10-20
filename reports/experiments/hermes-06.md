# Cafe POS from zero / Config E

[English](hermes-06.md) | [简体中文](hermes-06_CN.md)

| Item | Record |
|---|---|
| ID | HERMES-06 |
| Date | 2026-05-27 |
| Model and runtime | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit |
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

Historical score: 7.5/10. All 22/22 tests and the build passed. Discount integration was stronger, but Sales Summary deducted discounts twice and mixed tax into revenue.

## Full reports

- [Hermes Cafe POS / Config E](../originals/session-cafe-pos-config-e.md)

## Evidence limits

The conversation preserves the original review and eval-log commit d008ce6. Product/report repositories are absent; the commit is a clue, not a verified readable Git object. The same product directory was rebuilt across configurations.
