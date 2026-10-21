# LLM Test Reports

[English](README.md) | [简体中文](README_CN.md)

我的 LLM 测试报告档案：从实际任务、失败与人工反馈观察模型和推理引擎。英文是默认版本，中文文件统一加 `_CN`；正文、索引与网站均有完整中英版本。

**[浏览中文报告站](https://leoli-dev.github.io/llm-test-reports/index_CN.html)** · **[完整 Markdown 报告](reports/originals/)** · [新增报告](CONTRIBUTING_CN.md)

当前收录 **53 项实验、参数组或对照记录，76 份报告（各有中英全文）**。多轮评审属于同一实验链，不同模型可能共用报告；这些数字不等于独立样本数。

## 本机配置与系统

| 项目 | 当前核实配置 |
|---|---|
| 设备 | MacBook Pro `Mac17,6` · Apple M5 Max |
| CPU / GPU | 18 核 CPU / 40 核 GPU |
| 统一内存 | 系统显示 128 GB；137438953472 字节（128 GiB） |
| 系统 | macOS 27.0.1 · build `26A434` · arm64 · Metal 4 |
| 快照日期 | 2026-10-20 22:03:27 UTC |

这是**当前配置参考**，不自动代表所有历史测试。每份报告注明实验时系统是否有记录；内网 PC／云端测试单列客户端与推理主机。Laya 的 M3 Max 运行时 benchmark 保留原环境，服务测评的 Darwin 27.0.0 也保留原始口径。见[完整配置与历史边界](environment_CN.md)。

## 测试产物

| 作品 | 独立仓库 | 在线试玩 |
|---|---|---|
| Neon Bastion · mlx-dspark / Qwen3.8-27B 8bit / Pi | [llm-test-2026-09-01-game-neon-bastion](https://github.com/leoli-dev/llm-test-2026-09-01-game-neon-bastion) | [GitHub Pages](https://leoli-dev.github.io/llm-test-2026-09-01-game-neon-bastion/) |
| Tank Battle · MLTF / Qwen3.8-27B 8bit q8c / Pi | [llm-test-2026-10-20-game-tank-battle](https://github.com/leoli-dev/llm-test-2026-10-20-game-tank-battle) | [GitHub Pages](https://leoli-dev.github.io/llm-test-2026-10-20-game-tank-battle/) |

作品仓库采用 `llm-test-YYYY-MM-DD-{type}-{name}`，日期为测试开始日。Neon 仓库改名保留 Git 历史；坦克仓库为四轮实验后的最终快照。其他 Neon 模型版本有各自报告，不代表此作品仓库的同一实现。

## 实验索引

| 日期 | 测试 / 参数组 | 模型与运行方式 | 报告 |
|---|---|---|---|
| 2026-10-21 | Pi能力考试：Qwen3.8-27B 8bit 在MLTF / Splash上的表现 | Qwen3.8-27B 8-bit (MLTF q8c / MLX affine8) | [CAP-01](reports/experiments/cap-01_CN.md) |
| 2026-10-21 | Qwen3.8-27B：三种本机 8bit 配置比较与 GGUF 记录 | Qwen3.8-27B MLX affine8 / MLTF q8c / GGUF Q8_0 | [PERF-10](reports/experiments/perf-10_CN.md) |
| 2026-10-21 | Splash vs MLTF / 复现 PERF-06 的 128K 图文性能 | Qwen3.8-27B MLX affine 8bit / MLTF q8c; INT8 KV | [PERF-09](reports/experiments/perf-09_CN.md) |
| 2026-10-20 | MLTF × Pi / 3D 坦克大战四轮 | MLTF 0.1.2 + Qwen3.8-27B 8bit q8c + Pi | [TANK-01](reports/experiments/tank-01_CN.md) |
| 2026-10-19 | MLTF vs mlx-vlm / 128 请求质量对照 | Qwen3.8-27B 8bit；MLTF vs mlx-vlm  | [PERF-08](reports/experiments/perf-08_CN.md) |
| 2026-10-19 | MLTF / Qwen、Pi、Hermes 三种真实 CLI | Qwen3.8-27B 8bit；MLTF  | [PERF-07](reports/experiments/perf-07_CN.md) |
| 2026-10-19 | MLTF vs mlx-vlm / 128K 图文性能 | Qwen3.8-27B 8bit；MLTF vs mlx-vlm  | [PERF-06](reports/experiments/perf-06_CN.md) |
| 2026-10-19 | mlx-vlm 视觉 + DFlash2 阶梯稳定性 | Qwen3.8-27B 8bit；mlx-vlm 视觉 + DFlash2 阶梯稳定性 | [PERF-05](reports/experiments/perf-05_CN.md) |
| 2026-10-19 | mlx-dspark 128K / 256K 长上下文 | Qwen3.8-27B 8bit；mlx-dspark 128K  | [PERF-04](reports/experiments/perf-04_CN.md) |
| 2026-10-11 | AI Werewolf / DeepSeek V4.1 Flash 十局 | DeepSeek V4.1 Flash API；云端 | [CLOUD-01](reports/experiments/cloud-01_CN.md) |
| 2026-10-06 | Repair Café / Pi 编程与约 151 分钟 soak | Pi → 内网 PC Qwen3.8 Flash-Next；Mac 保存代码 | [PC-02](reports/experiments/pc-02_CN.md) |
| 2026-10-06 | Qwen3.8 Flash-Next / API 21 请求初测 | 内网 PC Qwen3.8 Flash-Next 服务；Mac 为客户端 | [PC-01](reports/experiments/pc-01_CN.md) |
| 2026-09-21 | Laya 本地服务 / 72 题与并发边界 | aac6fef/laya-multilingual-mlx；GPU FP16；1024 tokens | [LAYA-01](reports/experiments/laya-01_CN.md) |
| 2026-09-21 | Jev vs 本地 Laya / 同一 72 题 | Jev 云端 proxy 对照本地 Laya | [JEV-01](reports/experiments/jev-01_CN.md) |
| 2026-09-19—09-20 | MTPLX 27B Quality 冷 prefill 与近 128K soak | MTPLX；Qwen3.8-27B Optimized Quality | [PERF-02](reports/experiments/perf-02_CN.md) |
| 2026-09-19—09-20 | MTPLX Flash-Next 冷 prefill 与近 128K soak | MTPLX；Flash-Next Optimized Speed | [PERF-01](reports/experiments/perf-01_CN.md) |
| 2026-09-08—09-16 | Neon Bastion / ds-v4-flash-vision 55-task | ds-v4-flash-vision + DeepSeek Harness；云端对照 | [NEON-03](reports/experiments/neon-03_CN.md) |
| 2026-09-07—09-16 | Neon Bastion / MTPLX 55-task 重跑 | MTPLX Qwen3.8-27B Optimized Speed + Pi | [NEON-02](reports/experiments/neon-02_CN.md) |
| 2026-09-05—09-06 | Tide Isle / R1、R2 与 PLAY 副本 | MTPLX Qwen3.8-27B Optimized Speed + Pi | [TIDE-01](reports/experiments/tide-01_CN.md) |
| 2026-09-01—09-04 | Neon Bastion / 8bit 七轮 | mlx-dspark + Qwen3.8-27B-8bit + DFlash2 + Pi | [NEON-01](reports/experiments/neon-01_CN.md) |
| 2026-08-31—09-01（目录/会话） | Neon Bastion / Flash-Next 版本 | 目录标注 MTPLX Flash + Pi | [FLASH-04](reports/experiments/flash-04_CN.md) |
| 2026-08-31—09-01 | Gare Saint-Lazare | MTPLX qwen3.8-flash-next-optimized-speed + Pi | [FLASH-03](reports/experiments/flash-03_CN.md) |
| 2026-08-31—09-01 | Marble Workshop | MTPLX qwen3.8-flash-next-optimized-speed + Pi | [FLASH-02](reports/experiments/flash-02_CN.md) |
| 2026-08-31—09-01 | Orbital Garden | MTPLX qwen3.8-flash-next-optimized-speed + Pi | [FLASH-01](reports/experiments/flash-01_CN.md) |
| 2026-08-25—08-26 | JSON Lens / Qwen | Qwen3.8-27B | [JSON-02](reports/experiments/json-02_CN.md) |
| 2026-08-25—08-26 | JSON Lens / Ornith | Ornith 1.5 35B-A3B | [JSON-01](reports/experiments/json-01_CN.md) |
| 2026-08-23—08-24 | Frog Choir / 首轮与修复轮 | MTPLX Optimized Quality + Pi / Qwen Code | [FROG-01](reports/experiments/frog-01_CN.md) |
| 2026-08-22 | oMLX RC / oQ4e-mtp Dashboard 观察 | oMLX 0.6.3rc2 + Qwen3.8-27B-oQ4e-mtp | [PERF-03](reports/experiments/perf-03_CN.md) |
| 2026-08-22—08-23 | LLM 内存带宽教学页 / 三轮 review | oMLX RC Qwen3.8-27B-oQ4e-mtp + Qwen Code | [EARLY-04](reports/experiments/early-04_CN.md) |
| 2026-08-22 | Paris 3D | oMLX Qwen3.8-27B + Qwen Code | [EARLY-03](reports/experiments/early-03_CN.md) |
| 2026-08-21 | Arcology 控制室 / Pi 尝试与 Qwen Code 交付 | oMLX True2456/Qwen3.8-27B-AWQ-5.0bpw；Pi / Qwen Code coding-reason | [EARLY-02](reports/experiments/early-02_CN.md) |
| 2026-08-21 前后（会话） | Boston 行程地图 / Pi | Pi + oMLX Qwen3.8-27B AWQ 5bpw | [EARLY-01](reports/experiments/early-01_CN.md) |
| 2026-06-02—06-04 | 俄罗斯方块 / Qwen3.5-122B-A10B-4bit | Claude Code + oMLX；Qwen3.5-122B-A10B-4bit | [TET-04](reports/experiments/tet-04_CN.md) |
| 2026-06-02—06-04 | 俄罗斯方块 / Qwen3.6-35B-A3B-MLX-8bit | Claude Code + oMLX；Qwen3.6-35B-A3B-MLX-8bit | [TET-03](reports/experiments/tet-03_CN.md) |
| 2026-06-02—06-04 | 俄罗斯方块 / Qwen3.6-27B-UD-MLX-4bit | Claude Code + oMLX；Qwen3.6-27B-UD-MLX-4bit | [TET-02](reports/experiments/tet-02_CN.md) |
| 2026-06-02—06-04 | 俄罗斯方块 / gemma-4-31b-it-8bit | Claude Code + oMLX；gemma-4-31b-it-8bit | [TET-01](reports/experiments/tet-01_CN.md) |
| 2026-06（原报告） | 购物商城 MVP / gemma-4-31b-it-8bit | Claude Code + oMLX；gemma-4-31b-it-8bit | [SHOP-04](reports/experiments/shop-04_CN.md) |
| 2026-06（原报告） | 购物商城 MVP / Qwen3.6-27B-UD-MLX-4bit | Claude Code + oMLX；Qwen3.6-27B-UD-MLX-4bit | [SHOP-03](reports/experiments/shop-03_CN.md) |
| 2026-06（原报告） | 购物商城 MVP / Qwen3.6-35B-A3B-MLX-8bit | Claude Code + oMLX；Qwen3.6-35B-A3B-MLX-8bit | [SHOP-02](reports/experiments/shop-02_CN.md) |
| 2026-06（原报告） | 购物商城 MVP / Qwen3.5-122B-A10B-4bit | Claude Code + oMLX；Qwen3.5-122B-A10B-4bit | [SHOP-01](reports/experiments/shop-01_CN.md) |
| 2026-05-27 | Cafe POS from-zero / Config E | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit | [HERMES-06](reports/experiments/hermes-06_CN.md) |
| 2026-05-27 | Cafe POS from-zero / Config D | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit | [HERMES-05](reports/experiments/hermes-05_CN.md) |
| 2026-05-27 | Cafe POS from-zero / Config C | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit | [HERMES-04](reports/experiments/hermes-04_CN.md) |
| 2026-05-27 | Cafe POS from-zero / Config B | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit | [HERMES-03](reports/experiments/hermes-03_CN.md) |
| 2026-05-27 | Cafe POS from-zero / Config A | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit | [HERMES-02](reports/experiments/hermes-02_CN.md) |
| 2026-05-27 | Hermes POS gauntlet / Cart & Pricing | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit；Config A | [HERMES-01](reports/experiments/hermes-01_CN.md) |
| 2026-05-26 | 3D 太阳系 / 40B 中止轮 | Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-8bit | [SOL-06](reports/experiments/sol-06_CN.md) |
| 2026-05-26 | 3D 太阳系 / gemma-4-31b-it-8bit | Hermes + oMLX；gemma-4-31b-it-8bit | [SOL-05](reports/experiments/sol-05_CN.md) |
| 2026-05-26 | 3D 太阳系 / Qwen3-Coder-Next-8bit | Hermes + oMLX；Qwen3-Coder-Next-8bit | [SOL-04](reports/experiments/sol-04_CN.md) |
| 2026-05-26 | 3D 太阳系 / Qwen3.6-27B-MTPLX-Optimized-Speed | Hermes + oMLX；Qwen3.6-27B-MTPLX-Optimized-Speed | [SOL-03](reports/experiments/sol-03_CN.md) |
| 2026-05-26 | 3D 太阳系 / gemma-4-26b-a4b-it-bf16 | Hermes + oMLX；gemma-4-26b-a4b-it-bf16 | [SOL-02](reports/experiments/sol-02_CN.md) |
| 2026-05-26 | 3D 太阳系 / Qwen3.6-35B-A3B-MLX-8bit | Hermes + oMLX；Qwen3.6-35B-A3B-MLX-8bit | [SOL-01](reports/experiments/sol-01_CN.md) |
| 日期未核实 | 四份模型自我介绍 HTML | 文件名 4bit / 8bit / fp16 / flash；完整配置未核实 | [SELF-01](reports/experiments/self-01_CN.md) |

## 目录

英文文件与 `_CN` 中文文件逐一配对。技术源码与截图保留原语言证据。

```text
reports/originals/      # 完整报告
reports/experiments/    # 按实验组织的入口
assets/                # 原始图表与截图
data/                  # 中英目录、配置、来源与翻译审计
site/                  # 纯 HTML / CSS / JS
scripts/               # 注册、构建与校验
templates/             # 配对报告模板
.github/workflows/pages.yml
```

## 本地查看

```sh
npm ci --ignore-scripts
npm run build
npm run check
npm run preview
```

打开 `http://127.0.0.1:8437/` 查看英文，`http://127.0.0.1:8437/index_CN.html` 查看中文。`dist/` 只有静态文件，无服务器 API；GitHub Pages 使用同一构建流程。

## 证据与边界

保留原始性能口径、失败尝试、模型独立实现与人工介入。源码缺失不补造，运行时观察不包装成严格 benchmark。本次整理、翻译与发布没有重跑历史生成实验。

公开发布时，旧本机链接改为相对链接、独立作品链接，或注明历史文件未发布；私人账号路径与 LAN 地址被概括。中英全文保留源码、命令、数值字面量和原始图像；翻译并非新的性能测量。来源、首次发布及当前翻译哈希见 [provenance_CN.json](data/provenance_CN.json)，源码保留检查见 [translation-audit_CN.json](data/translation-audit_CN.json)。含隐私的完整会话与客户端配置未导入。

报告与网站在本仓库维护，产物代码和许可证以各独立仓库为准。
