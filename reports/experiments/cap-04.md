# Pi visual triad: MLTF, Splash and Strata at 256K

[English](cap-04.md) | [简体中文](cap-04_CN.md)

| Item | Record |
|---|---|
| Date | 2026-10-25 |
| Model | Qwen3.8-27B MLTF q8c / MLX affine8; Qwen3.8 Flash Next GSQ-RCO IQ3_S |
| Engine | MLTF,Splash,Strata |
| Inference location | local |
| Inference hardware | MacBook Pro Mac17,6 / Apple M5 Max / CPU18 / GPU40 / 128 GiB |
| Test-time OS | macOS27.0.1 build26A434 arm64, captured during the experiment |

Nine visual projects at 256K: Strata leads observed craft; all scenes render, MLTF courtyard times out in its own test. Full pressure/status records, original screenshots and criterion ratings.

[Full report](../originals/2026-10-25-pi-visual-triad-three-engines.md)

One sample per cell; identity-aware judgments; different model/quant/engine bundles. Max input168095, not full256K saturation.


## Artifact publication · 2026-10-26

[Nine-project source repository](https://github.com/leoli-dev/llm-test-2026-10-25-visual-triad) · [GitHub Pages gallery](https://leoli-dev.github.io/llm-test-2026-10-25-visual-triad/) · [Pinned publication commit](https://github.com/leoli-dev/llm-test-2026-10-25-visual-triad/tree/540ab4469a10ecac11583eaef10b3fbde7727be5)

Application HTML/JS/CSS/vendor match the original frozen versions byte for byte. Added navigation, the full README report, original screenshots and data. The MLTF courtyard agent timeout and original scores remain unchanged.
