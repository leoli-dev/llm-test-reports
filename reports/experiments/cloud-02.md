# Water garden / Opus 5.5 vs GPT 6.1 sol on one WebGL brief

[English](cloud-02.md) | [简体中文](cloud-02_CN.md)

| Item | Record |
|---|---|
| Date | 2026-10-23 |
| Model | Claude Opus 5.5 (high effort, Claude Code) vs GPT 6.1 sol (high reasoning, Codex); cloud |
| Engine | Claude Code,Codex |
| Inference location | cloud |
| Inference hardware | Cloud inference; client and evaluation host MacBook Pro / Apple M5 Max / 18 CPU / 40 GPU / 128 GiB |
| Test-time OS | Evaluation host macOS 27.0.1 (26A434), arm64; generation-time client OS not separately recorded |

Same Three.js/WebGL 2 shallow-water brief. Joint verdict after a conflict-disclosed debate between two reviewer agents: opus55 has a moderate overall lead (readable ripples, depth ray-march refraction, closer main scene, R16F heights, 4 presets); gpt61sol ships stronger reproducible browser QA and accessibility and higher uncapped throughput in repeated DPR 2 medium/high runs (about 1.2–1.6× dense, 2.5–3× main). GPT R32F heights lose the rendered ripple without float-linear filtering; Opus has a Space-key defect. Dense scene mixed.

[Full report](../originals/2026-10-23-water-garden-opus55-vs-gpt61sol.md)

One artifact per model, generation process not observed, reviewers each belong to one artifact family, visual judgments subjective, no real phone, Safari or Firefox; R32F finding by capability emulation only.

## Artifact

- [Water Garden LLM Test](https://github.com/leoli-dev/water-garden-llm-test)
- [Entry page with both live demos](https://leoli-dev.github.io/water-garden-llm-test/)
- [opus55 demo](https://leoli-dev.github.io/water-garden-llm-test/opus55/)
- [gpt61sol demo](https://leoli-dev.github.io/water-garden-llm-test/gpt61sol/)
