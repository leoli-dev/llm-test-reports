# LLM Test Reports

[English](README.md) | [简体中文](README_CN.md)

My LLM test archive: models and inference engines observed through real tasks, failures and human feedback. English is the default; full Chinese editions use `_CN`. Reports, indexes and the website are bilingual.

**[Browse the report site](https://leoli-dev.github.io/llm-test-reports/)** · **[Full Markdown reports](reports/originals/)** · [Add a report](CONTRIBUTING.md)

The archive contains **57 experiment, parameter or comparison records and 80 reports, each in full English and Chinese editions**. Multiple review rounds belong to one test chain; different models can share a report. These counts are not independent sample counts.

## Workstation and system

| Component | Current verified configuration |
|---|---|
| Computer | MacBook Pro `Mac17,6` · Apple M5 Max |
| CPU / GPU | 18-core CPU / 40-core GPU |
| Unified memory | 128 GB system label; 137438953472 bytes (128 GiB) |
| System | macOS 27.0.1 · build `26A434` · arm64 · Metal 4 |
| Snapshot date | 2026-10-20 22:03:27 UTC |

This is a **current reference**, not an assumed environment for every historical test. Each report identifies whether test-time OS evidence survives; LAN PC and cloud tests distinguish client from inference host. The separate Laya M3 Max runtime benchmark retains its reported environment, and the service evaluation retains its Darwin 27.0.0 kernel version. See [full configuration and historical limits](environment.md).

## Artifacts

| Artifact | Separate repository | Play |
|---|---|---|
| Neon Bastion · mlx-dspark / Qwen3.8-27B 8bit / Pi | [llm-test-2026-09-01-game-neon-bastion](https://github.com/leoli-dev/llm-test-2026-09-01-game-neon-bastion) | [GitHub Pages](https://leoli-dev.github.io/llm-test-2026-09-01-game-neon-bastion/) |
| Tank Battle · MLTF / Qwen3.8-27B 8bit q8c / Pi | [llm-test-2026-10-20-game-tank-battle](https://github.com/leoli-dev/llm-test-2026-10-20-game-tank-battle) | [GitHub Pages](https://leoli-dev.github.io/llm-test-2026-10-20-game-tank-battle/) |

Artifact repositories use `llm-test-YYYY-MM-DD-{type}-{name}`, dated by test start. Neon was renamed with Git history preserved; Tank Battle is the final four-round snapshot. Other Neon model versions have their own reports and are distinct implementations.

## Experiment index

| Date | Experiment / parameters | Model and runtime | Report |
|---|---|---|---|
| 2026-10-25 | Pi visual triad: MLTF, Splash and Strata at 256K | Qwen3.8-27B MLTF q8c / MLX affine8; Qwen3.8 Flash Next GSQ-RCO IQ3_S | [CAP-04](reports/experiments/cap-04.md) · [Code](https://github.com/leoli-dev/llm-test-2026-10-25-visual-triad) · [Demo](https://leoli-dev.github.io/llm-test-2026-10-25-visual-triad/) |
| 2026-10-25 | RepairDesk / Pi on Strata and Splash at 256K | Qwen3.8-Flash-Next GSQ-RCO IQ3_S vs Qwen3.8-27B MLX affine8 | [CAP-03](reports/experiments/cap-03.md) |
| 2026-10-23 | Water garden / Opus 5.5 vs GPT 6.1 sol on one WebGL brief | Claude Opus 5.5 (high effort, Claude Code) vs GPT 6.1 sol (high reasoning, Codex); cloud | [CLOUD-02](reports/experiments/cloud-02.md) |
| 2026-10-21 | Splash affine8 native 256K context stress test | Qwen3.8-27B MLX affine8 / INT8 KV | [PERF-11](reports/experiments/perf-11.md) |
| 2026-10-21 | Pi capability exam: Qwen3.8-27B 8-bit on MLTF / Splash | Qwen3.8-27B 8-bit (MLTF q8c / MLX affine8) | [CAP-01](reports/experiments/cap-01.md) |
| 2026-10-21 | Qwen3.8-27B: three local 8-bit configurations and GGUF record | Qwen3.8-27B MLX affine8 / MLTF q8c / GGUF Q8_0 | [PERF-10](reports/experiments/perf-10.md) |
| 2026-10-21 | Splash vs MLTF / PERF-06 128K vision replay | Qwen3.8-27B MLX affine 8bit / MLTF q8c; INT8 KV | [PERF-09](reports/experiments/perf-09.md) |
| 2026-10-20 | MLTF × Pi / four rounds of 3D Tank Battle | MLTF 0.1.2 + Qwen3.8-27B 8bit q8c + Pi | [TANK-01](reports/experiments/tank-01.md) |
| 2026-10-19 | MLTF vs mlx-vlm / 128-request quality comparison | Qwen3.8-27B 8bit; MLTF vs mlx-vlm  | [PERF-08](reports/experiments/perf-08.md) |
| 2026-10-19 | MLTF / real Qwen, Pi and Hermes CLI checks | Qwen3.8-27B 8bit; MLTF  | [PERF-07](reports/experiments/perf-07.md) |
| 2026-10-19 | MLTF vs mlx-vlm / 128K vision performance | Qwen3.8-27B 8bit; MLTF vs mlx-vlm  | [PERF-06](reports/experiments/perf-06.md) |
| 2026-10-19 | mlx-vlm / vision and DFlash2 stability ladder | Qwen3.8-27B 8bit; mlx-vlm vision + DFlash2 stepped stability | [PERF-05](reports/experiments/perf-05.md) |
| 2026-10-19 | mlx-dspark / 128K and 256K long context | Qwen3.8-27B 8bit; mlx-dspark 128K  | [PERF-04](reports/experiments/perf-04.md) |
| 2026-10-11 | AI Werewolf / ten DeepSeek V4.1 Flash games | DeepSeek V4.1 Flash API; cloud | [CLOUD-01](reports/experiments/cloud-01.md) |
| 2026-10-06 | Repair Café / Pi coding and approximately 151 minutes of soak | Pi → LAN PC Qwen3.8 Flash-Next; code stored on Mac | [PC-02](reports/experiments/pc-02.md) |
| 2026-10-06 | Qwen3.8 Flash-Next / initial 21-request API check | LAN PC Qwen3.8 Flash-Next service; Mac client | [PC-01](reports/experiments/pc-01.md) |
| 2026-09-21 | Local Laya service / 72 questions and concurrency limits | aac6fef/laya-multilingual-mlx; GPU FP16; 1024 tokens | [LAYA-01](reports/experiments/laya-01.md) |
| 2026-09-21 | Jev vs local Laya / the same 72 questions | Jev cloud proxy compared with local Laya | [JEV-01](reports/experiments/jev-01.md) |
| 2026-09-19—09-20 | MTPLX 27B Quality / cold prefill and near-128K soak | MTPLX; Qwen3.8-27B Optimized Quality | [PERF-02](reports/experiments/perf-02.md) |
| 2026-09-19—09-20 | MTPLX Flash-Next / cold prefill and near-128K soak | MTPLX; Flash-Next Optimized Speed | [PERF-01](reports/experiments/perf-01.md) |
| 2026-09-08—09-16 | Neon Bastion / ds-v4-flash-vision 55-task run | ds-v4-flash-vision + DeepSeek Harness; cloud comparison | [NEON-03](reports/experiments/neon-03.md) |
| 2026-09-07—09-16 | Neon Bastion / MTPLX 55-task rerun | MTPLX Qwen3.8-27B Optimized Speed + Pi | [NEON-02](reports/experiments/neon-02.md) |
| 2026-09-05—09-06 | Tide Isle / R1, R2 and PLAY copy | MTPLX Qwen3.8-27B Optimized Speed + Pi | [TIDE-01](reports/experiments/tide-01.md) |
| 2026-09-01—09-04 | Neon Bastion / seven 8bit rounds | mlx-dspark + Qwen3.8-27B-8bit + DFlash2 + Pi | [NEON-01](reports/experiments/neon-01.md) |
| 2026-08-31—09-01 (directory / conversation) | Neon Bastion / Flash-Next version | Directory label: MTPLX Flash + Pi | [FLASH-04](reports/experiments/flash-04.md) |
| 2026-08-31—09-01 | Gare Saint-Lazare | MTPLX qwen3.8-flash-next-optimized-speed + Pi | [FLASH-03](reports/experiments/flash-03.md) |
| 2026-08-31—09-01 | Marble Workshop | MTPLX qwen3.8-flash-next-optimized-speed + Pi | [FLASH-02](reports/experiments/flash-02.md) |
| 2026-08-31—09-01 | Orbital Garden | MTPLX qwen3.8-flash-next-optimized-speed + Pi | [FLASH-01](reports/experiments/flash-01.md) |
| 2026-08-25—08-26 | JSON Lens / Qwen | Qwen3.8-27B | [JSON-02](reports/experiments/json-02.md) |
| 2026-08-25—08-26 | JSON Lens / Ornith | Ornith 1.5 35B-A3B | [JSON-01](reports/experiments/json-01.md) |
| 2026-08-23—08-24 | Frog Choir / initial and repair rounds | MTPLX Optimized Quality + Pi / Qwen Code | [FROG-01](reports/experiments/frog-01.md) |
| 2026-08-22 | oMLX RC / oQ4e-mtp dashboard observation | oMLX 0.6.3rc2 + Qwen3.8-27B-oQ4e-mtp | [PERF-03](reports/experiments/perf-03.md) |
| 2026-08-22—08-23 | LLM memory-bandwidth teaching page / three review rounds | oMLX RC Qwen3.8-27B-oQ4e-mtp + Qwen Code | [EARLY-04](reports/experiments/early-04.md) |
| 2026-08-22 | Paris 3D | oMLX Qwen3.8-27B + Qwen Code | [EARLY-03](reports/experiments/early-03.md) |
| 2026-08-21 | Arcology control room / Pi attempts and Qwen Code delivery | oMLX True2456/Qwen3.8-27B-AWQ-5.0bpw; Pi / Qwen Code coding-reason | [EARLY-02](reports/experiments/early-02.md) |
| 2026-08-21 approximately (conversation) | Boston itinerary map / Pi | Pi + oMLX Qwen3.8-27B AWQ 5bpw | [EARLY-01](reports/experiments/early-01.md) |
| 2026-06-02—06-04 | Tetris / Qwen3.5-122B-A10B-4bit | Claude Code + oMLX; Qwen3.5-122B-A10B-4bit | [TET-04](reports/experiments/tet-04.md) |
| 2026-06-02—06-04 | Tetris / Qwen3.6-35B-A3B-MLX-8bit | Claude Code + oMLX; Qwen3.6-35B-A3B-MLX-8bit | [TET-03](reports/experiments/tet-03.md) |
| 2026-06-02—06-04 | Tetris / Qwen3.6-27B-UD-MLX-4bit | Claude Code + oMLX; Qwen3.6-27B-UD-MLX-4bit | [TET-02](reports/experiments/tet-02.md) |
| 2026-06-02—06-04 | Tetris / gemma-4-31b-it-8bit | Claude Code + oMLX; gemma-4-31b-it-8bit | [TET-01](reports/experiments/tet-01.md) |
| 2026-06 (original report) | Shopping MVP / gemma-4-31b-it-8bit | Claude Code + oMLX; gemma-4-31b-it-8bit | [SHOP-04](reports/experiments/shop-04.md) |
| 2026-06 (original report) | Shopping MVP / Qwen3.6-27B-UD-MLX-4bit | Claude Code + oMLX; Qwen3.6-27B-UD-MLX-4bit | [SHOP-03](reports/experiments/shop-03.md) |
| 2026-06 (original report) | Shopping MVP / Qwen3.6-35B-A3B-MLX-8bit | Claude Code + oMLX; Qwen3.6-35B-A3B-MLX-8bit | [SHOP-02](reports/experiments/shop-02.md) |
| 2026-06 (original report) | Shopping MVP / Qwen3.5-122B-A10B-4bit | Claude Code + oMLX; Qwen3.5-122B-A10B-4bit | [SHOP-01](reports/experiments/shop-01.md) |
| 2026-05-27 | Cafe POS from zero / Config E | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit | [HERMES-06](reports/experiments/hermes-06.md) |
| 2026-05-27 | Cafe POS from zero / Config D | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit | [HERMES-05](reports/experiments/hermes-05.md) |
| 2026-05-27 | Cafe POS from zero / Config C | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit | [HERMES-04](reports/experiments/hermes-04.md) |
| 2026-05-27 | Cafe POS from zero / Config B | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit | [HERMES-03](reports/experiments/hermes-03.md) |
| 2026-05-27 | Cafe POS from zero / Config A | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit | [HERMES-02](reports/experiments/hermes-02.md) |
| 2026-05-27 | Hermes POS gauntlet / Cart & Pricing | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit; Config A | [HERMES-01](reports/experiments/hermes-01.md) |
| 2026-05-26 | 3D Solar System / interrupted 40B run | Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-8bit | [SOL-06](reports/experiments/sol-06.md) |
| 2026-05-26 | 3D Solar System / gemma-4-31b-it-8bit | Hermes + oMLX; gemma-4-31b-it-8bit | [SOL-05](reports/experiments/sol-05.md) |
| 2026-05-26 | 3D Solar System / Qwen3-Coder-Next-8bit | Hermes + oMLX; Qwen3-Coder-Next-8bit | [SOL-04](reports/experiments/sol-04.md) |
| 2026-05-26 | 3D Solar System / Qwen3.6-27B-MTPLX-Optimized-Speed | Hermes + oMLX; Qwen3.6-27B-MTPLX-Optimized-Speed | [SOL-03](reports/experiments/sol-03.md) |
| 2026-05-26 | 3D Solar System / gemma-4-26b-a4b-it-bf16 | Hermes + oMLX; gemma-4-26b-a4b-it-bf16 | [SOL-02](reports/experiments/sol-02.md) |
| 2026-05-26 | 3D Solar System / Qwen3.6-35B-A3B-MLX-8bit | Hermes + oMLX; Qwen3.6-35B-A3B-MLX-8bit | [SOL-01](reports/experiments/sol-01.md) |
| Date unverified | Four model self-introduction HTML specimens | Filenames: 4bit / 8bit / fp16 / flash; full configuration unverified | [SELF-01](reports/experiments/self-01.md) |

## Contents

English files have paired `_CN` Chinese editions. Technical code and screenshots retain their source-language evidence.

```text
reports/originals/      # full reports
reports/experiments/    # entries grouped by experiment
assets/                # original figures and screenshots
data/                  # paired catalogs, environments, provenance and translation audit
site/                  # plain HTML / CSS / JS
scripts/               # registration, build and validation
templates/             # paired report templates
.github/workflows/pages.yml
```

## Local preview

```sh
npm ci --ignore-scripts
npm run build
npm run check
npm run preview
```

Open `http://127.0.0.1:8437/` for English or `http://127.0.0.1:8437/index_CN.html` for Chinese. `dist/` contains static files without a server API; GitHub Pages uses the same build.

## Evidence and limits

Original measurement definitions, failures, independent model implementations and human interventions are retained. Missing source is not fabricated, and runtime observations are not presented as controlled benchmarks. This organization, translation and publication did not repeat the historical generation experiments.

Publication relocates local links, links separate artifacts or marks unpublished historical files; private account paths and LAN addresses are generalized. Full translations preserve code, commands, numeric literals and original images. Translation is not a new performance measurement. Source, initial import and current localized hashes are in [provenance.json](data/provenance.json); source-code preservation checks are in [translation-audit.json](data/translation-audit.json). Full private sessions and client configuration were not imported.

Reports and the website are maintained here; artifact code and licenses belong to their separate repositories.
