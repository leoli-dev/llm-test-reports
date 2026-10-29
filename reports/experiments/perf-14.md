# DeepSeek Flash 1017 / Strata: M5 Max evaluation and retirement

[English](perf-14.md) | [简体中文](perf-14_CN.md)

| Item | Record |
|---|---|
| Date | 2026-10-28 |
| Model | DeepSeek-V4.1-Flash-1017 GSQ-RCO IQ2_XXS / backbone average 2.00 bpw |
| Engine | Strata |
| Inference location | local |
| Inference hardware | MacBook Pro / Apple M5 Max / 18 CPU cores / 40 GPU cores / 128GiB unified memory / internal SSD |
| Test-time OS | macOS 27.2; OS build not recorded; arm64 (signed engine package target) |

32K, 128K and 256K synthetic retrieval passed; first 260,078-token input took 957.087s to first token. Short generation fell from 15.0 to 2.3 token/s after the long-context sequence and measured 4.6 after restart. The owner requested retirement after publication.

[Full report](../originals/2026-10-28-strata-deepseek41-flash1017-2bpw-m5max.md)

One sample per performance point, uncontrolled run history and system load. Cached follow-ups are not independent retrieval tests. Swap is whole-system; the slowdown cause was not located. This edition records a retirement request, not completed uninstall.
