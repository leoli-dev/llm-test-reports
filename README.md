# LLM Test Reports

我的 LLM 测试报告档案：从实际任务、失败与人工反馈观察模型和推理引擎。

**[浏览静态报告站](https://leoli-dev.github.io/llm-test-reports/)** · **[原始 Markdown 报告](reports/originals/)** · [新增报告](CONTRIBUTING.md)

当前收录 **50 项实验、参数组或对照记录，73 份 Markdown 文档**。一项测试可能包含多轮评审，多项模型对照也可能引用同一份原始报告；这些数字不等同于独立样本数。

## 测试产物

| 作品 | 独立仓库 | 在线试玩 |
|---|---|---|
| Neon Bastion · mlx-dspark / Qwen3.8-27B 8bit / pi | [llm-test-2026-09-01-game-neon-bastion](https://github.com/leoli-dev/llm-test-2026-09-01-game-neon-bastion) | [GitHub Pages](https://leoli-dev.github.io/llm-test-2026-09-01-game-neon-bastion/) |
| Tank Battle · MLTF / Qwen3.8-27B 8bit q8c / pi | [llm-test-2026-10-20-game-tank-battle](https://github.com/leoli-dev/llm-test-2026-10-20-game-tank-battle) | [GitHub Pages](https://leoli-dev.github.io/llm-test-2026-10-20-game-tank-battle/) |

作品仓库使用 `llm-test-{测试开始日期}-{类型}-{作品名}`。Neon 为现有仓库重命名，保留原 Git 历史；坦克为四轮测试的最终游戏快照。其他 Neon 模型版本有独立报告，不与该作品仓库混为同一实现。

## 实验索引

| 日期 | 测试 / 参数组 | 模型与运行方式 | 报告 |
|---|---|---|
| 2026-10-20 | MLTF × Pi / 3D 坦克大战四轮 | MLTF 0.1.2 + Qwen3.8-27B 8bit q8c + Pi | [TANK-01](reports/experiments/tank-01.md) |
| 2026-10-19 | mlx-dspark 128K / 256K 长上下文 | Qwen3.8-27B 8bit；mlx-dspark 128K  | [PERF-04](reports/experiments/perf-04.md) |
| 2026-10-19 | mlx-vlm 视觉 + DFlash2 阶梯稳定性 | Qwen3.8-27B 8bit；mlx-vlm 视觉 + DFlash2 阶梯稳定性 | [PERF-05](reports/experiments/perf-05.md) |
| 2026-10-19 | MLTF vs mlx-vlm / 128K 图文性能 | Qwen3.8-27B 8bit；MLTF vs mlx-vlm  | [PERF-06](reports/experiments/perf-06.md) |
| 2026-10-19 | MLTF / Qwen、Pi、Hermes 三种真实 CLI | Qwen3.8-27B 8bit；MLTF  | [PERF-07](reports/experiments/perf-07.md) |
| 2026-10-19 | MLTF vs mlx-vlm / 128 请求质量对照 | Qwen3.8-27B 8bit；MLTF vs mlx-vlm  | [PERF-08](reports/experiments/perf-08.md) |
| 2026-10-11 | AI Werewolf / DeepSeek V4.1 Flash 十局 | DeepSeek V4.1 Flash API；云端 | [CLOUD-01](reports/experiments/cloud-01.md) |
| 2026-10-06 | Qwen3.8 Flash-Next / API 21 请求初测 | 内网 PC Qwen3.8 Flash-Next 服务；Mac 为客户端 | [PC-01](reports/experiments/pc-01.md) |
| 2026-10-06 | Repair Café / Pi 编程与约 151 分钟 soak | Pi → 内网 PC Qwen3.8 Flash-Next；Mac 保存代码 | [PC-02](reports/experiments/pc-02.md) |
| 2026-09-21 | Laya 本地服务 / 72 题与并发边界 | aac6fef/laya-multilingual-mlx；GPU FP16；1024 tokens | [LAYA-01](reports/experiments/laya-01.md) |
| 2026-09-21 | Jev vs 本地 Laya / 同一 72 题 | Jev 云端 proxy 对照本地 Laya | [JEV-01](reports/experiments/jev-01.md) |
| 2026-09-19—09-20 | MTPLX Flash-Next 冷 prefill 与近 128K soak | MTPLX；Flash-Next Optimized Speed | [PERF-01](reports/experiments/perf-01.md) |
| 2026-09-19—09-20 | MTPLX 27B Quality 冷 prefill 与近 128K soak | MTPLX；Qwen3.8-27B Optimized Quality | [PERF-02](reports/experiments/perf-02.md) |
| 2026-09-08—09-16 | Neon Bastion / ds-v4-flash-vision 55-task | ds-v4-flash-vision + DeepSeek Harness；云端对照 | [NEON-03](reports/experiments/neon-03.md) |
| 2026-09-07—09-16 | Neon Bastion / MTPLX 55-task 重跑 | MTPLX Qwen3.8-27B Optimized Speed + Pi | [NEON-02](reports/experiments/neon-02.md) |
| 2026-09-05—09-06 | Tide Isle / R1、R2 与 PLAY 副本 | MTPLX Qwen3.8-27B Optimized Speed + Pi | [TIDE-01](reports/experiments/tide-01.md) |
| 2026-09-01—09-04 | Neon Bastion / 8bit 七轮 | mlx-dspark + Qwen3.8-27B-8bit + DFlash2 + Pi | [NEON-01](reports/experiments/neon-01.md) |
| 2026-08-31—09-01 | Orbital Garden | MTPLX qwen3.8-flash-next-optimized-speed + Pi | [FLASH-01](reports/experiments/flash-01.md) |
| 2026-08-31—09-01 | Marble Workshop | MTPLX qwen3.8-flash-next-optimized-speed + Pi | [FLASH-02](reports/experiments/flash-02.md) |
| 2026-08-31—09-01 | Gare Saint-Lazare | MTPLX qwen3.8-flash-next-optimized-speed + Pi | [FLASH-03](reports/experiments/flash-03.md) |
| 2026-08-31—09-01（目录/会话） | Neon Bastion / Flash-Next 版本 | 目录标注 MTPLX Flash + Pi | [FLASH-04](reports/experiments/flash-04.md) |
| 2026-08-25—08-26 | JSON Lens / Ornith | Ornith 1.5 35B-A3B | [JSON-01](reports/experiments/json-01.md) |
| 2026-08-25—08-26 | JSON Lens / Qwen | Qwen3.8-27B | [JSON-02](reports/experiments/json-02.md) |
| 2026-08-23—08-24 | Frog Choir / 首轮与修复轮 | MTPLX Optimized Quality + Pi / Qwen Code | [FROG-01](reports/experiments/frog-01.md) |
| 2026-08-22 | Paris 3D | oMLX Qwen3.8-27B + Qwen Code | [EARLY-03](reports/experiments/early-03.md) |
| 2026-08-22—08-23 | LLM 内存带宽教学页 / 三轮 review | oMLX RC Qwen3.8-27B-oQ4e-mtp + Qwen Code | [EARLY-04](reports/experiments/early-04.md) |
| 2026-08-22 | oMLX RC / oQ4e-mtp Dashboard 观察 | oMLX 0.6.3rc2 + Qwen3.8-27B-oQ4e-mtp | [PERF-03](reports/experiments/perf-03.md) |
| 2026-08-21 前后（会话） | Boston 行程地图 / Pi | Pi + oMLX Qwen3.8-27B AWQ 5bpw | [EARLY-01](reports/experiments/early-01.md) |
| 2026-08-21 | Arcology 控制室 / Pi 尝试与 Qwen Code 交付 | oMLX True2456/Qwen3.8-27B-AWQ-5.0bpw；Pi / Qwen Code coding-reason | [EARLY-02](reports/experiments/early-02.md) |
| 2026-06-02—06-04 | 俄罗斯方块 / gemma-4-31b-it-8bit | Claude Code + oMLX；gemma-4-31b-it-8bit | [TET-01](reports/experiments/tet-01.md) |
| 2026-06-02—06-04 | 俄罗斯方块 / Qwen3.6-27B-UD-MLX-4bit | Claude Code + oMLX；Qwen3.6-27B-UD-MLX-4bit | [TET-02](reports/experiments/tet-02.md) |
| 2026-06-02—06-04 | 俄罗斯方块 / Qwen3.6-35B-A3B-MLX-8bit | Claude Code + oMLX；Qwen3.6-35B-A3B-MLX-8bit | [TET-03](reports/experiments/tet-03.md) |
| 2026-06-02—06-04 | 俄罗斯方块 / Qwen3.5-122B-A10B-4bit | Claude Code + oMLX；Qwen3.5-122B-A10B-4bit | [TET-04](reports/experiments/tet-04.md) |
| 2026-06（原报告） | 购物商城 MVP / Qwen3.5-122B-A10B-4bit | Claude Code + oMLX；Qwen3.5-122B-A10B-4bit | [SHOP-01](reports/experiments/shop-01.md) |
| 2026-06（原报告） | 购物商城 MVP / Qwen3.6-35B-A3B-MLX-8bit | Claude Code + oMLX；Qwen3.6-35B-A3B-MLX-8bit | [SHOP-02](reports/experiments/shop-02.md) |
| 2026-06（原报告） | 购物商城 MVP / Qwen3.6-27B-UD-MLX-4bit | Claude Code + oMLX；Qwen3.6-27B-UD-MLX-4bit | [SHOP-03](reports/experiments/shop-03.md) |
| 2026-06（原报告） | 购物商城 MVP / gemma-4-31b-it-8bit | Claude Code + oMLX；gemma-4-31b-it-8bit | [SHOP-04](reports/experiments/shop-04.md) |
| 2026-05-27 | Hermes POS gauntlet / Cart & Pricing | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit；Config A | [HERMES-01](reports/experiments/hermes-01.md) |
| 2026-05-27 | Cafe POS from-zero / Config A | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit | [HERMES-02](reports/experiments/hermes-02.md) |
| 2026-05-27 | Cafe POS from-zero / Config B | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit | [HERMES-03](reports/experiments/hermes-03.md) |
| 2026-05-27 | Cafe POS from-zero / Config C | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit | [HERMES-04](reports/experiments/hermes-04.md) |
| 2026-05-27 | Cafe POS from-zero / Config D | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit | [HERMES-05](reports/experiments/hermes-05.md) |
| 2026-05-27 | Cafe POS from-zero / Config E | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit | [HERMES-06](reports/experiments/hermes-06.md) |
| 2026-05-26 | 3D 太阳系 / Qwen3.6-35B-A3B-MLX-8bit | Hermes + oMLX；Qwen3.6-35B-A3B-MLX-8bit | [SOL-01](reports/experiments/sol-01.md) |
| 2026-05-26 | 3D 太阳系 / gemma-4-26b-a4b-it-bf16 | Hermes + oMLX；gemma-4-26b-a4b-it-bf16 | [SOL-02](reports/experiments/sol-02.md) |
| 2026-05-26 | 3D 太阳系 / Qwen3.6-27B-MTPLX-Optimized-Speed | Hermes + oMLX；Qwen3.6-27B-MTPLX-Optimized-Speed | [SOL-03](reports/experiments/sol-03.md) |
| 2026-05-26 | 3D 太阳系 / Qwen3-Coder-Next-8bit | Hermes + oMLX；Qwen3-Coder-Next-8bit | [SOL-04](reports/experiments/sol-04.md) |
| 2026-05-26 | 3D 太阳系 / gemma-4-31b-it-8bit | Hermes + oMLX；gemma-4-31b-it-8bit | [SOL-05](reports/experiments/sol-05.md) |
| 2026-05-26 | 3D 太阳系 / 40B 中止轮 | Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-8bit | [SOL-06](reports/experiments/sol-06.md) |
| 日期未核实 | 四份模型自我介绍 HTML | 文件名 4bit / 8bit / fp16 / flash；完整配置未核实 | [SELF-01](reports/experiments/self-01.md) |

## 目录

```text
reports/
  originals/     # 原报告 Markdown、HTML 转换稿与会话找回稿
  experiments/   # 按测试组织的 Markdown 入口
assets/          # 报告图表与截图
data/
  catalog.json   # 实验与文档目录
  provenance.json # 导入来源、原文与发布后内容哈希
site/            # 纯 HTML / CSS / JS 界面
scripts/         # 导入、注册、构建和校验
templates/       # 新报告模板
.github/workflows/pages.yml
```

## 本地查看

```sh
npm ci --ignore-scripts
npm run build
npm run check
npm run preview
```

打开 http://127.0.0.1:8437/。构建产物 `dist/` 只有静态 HTML、CSS、JS、JSON、Markdown 和图片，不需要服务器端 API。GitHub Pages 使用相同构建流程。

## 证据与边界

本机、内网 PC 与云端推理在报告中分开标注。原始性能口径、失败尝试、模型独立实现与人为介入均保留。源码缺失不填造；运行时观察不包装成严格 benchmark；初次整理和本次发布未重跑 LLM 生成任务。

为公开发布，旧报告的本机链接调整成相对链接、作品仓库链接，或注明历史文件未随报告发布；本机账号路径与私人 LAN 地址被概括。旧报告其他原文保持，来源及哈希见 [provenance.json](data/provenance.json)。含隐私的完整会话和客户端配置没有导入。

报告和网站维护于此，作品代码与许可证以各自独立仓库为准。
