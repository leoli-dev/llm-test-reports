# RepairDesk / Pi on Strata and Splash at 256K

[English](cap-03.md) | [简体中文](cap-03_CN.md)

| Item | Record |
|---|---|
| Date | 2026-10-25 |
| Model | Qwen3.8-Flash-Next GSQ-RCO IQ3_S vs Qwen3.8-27B MLX affine8 |
| Engine | Strata,Splash |
| Inference location | local |
| Inference hardware | Local MacBook Pro / Apple M5 Max / 18 CPU / 40 GPU / 128 GiB unified memory |
| Test-time OS | macOS 27.0.1 (26A434), arm64; captured test-time host.json |

Same four-phase brief, 60 minutes each: Strata 38.16 min, completion 79/80 and quality 14/20; Splash 50.89 min, 77/80 and 10/20. Preserves reproduced data-integrity/security/UI defects and evaluator corrections; no supervisor product-code fixes.

[Full report](../originals/2026-10-25-pi-strata-splash-repairdesk.md)

One project, one run per system, identity-aware review and fixed order; base models, quantization, engines and self-selected visual strategies differ. Configured 256K was verified; maximum observed input was 162672/124477. Curated evidence excludes full sessions, private config and complete product source. Local commit only, no push.
