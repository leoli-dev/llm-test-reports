# Boston itinerary map / Pi

[English](early-01.md) | [简体中文](early-01_CN.md)

| Item | Record |
|---|---|
| ID | EARLY-01 |
| Date | 2026-08-21 approximately (conversation) |
| Model and runtime | Pi + oMLX Qwen3.8-27B AWQ 5bpw |
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

The conversation retains map, filter and marker checks, as well as an image-prefix-cache failure.

## Full reports

- [Boston map: test results and correction of reference copying](../originals/session-boston-map.md)

## Evidence limits

A final step directly copied pi-boston-map-first into pi-boston-guide; that result cannot be counted as independent model generation. Neither directory was located during retrieval.
