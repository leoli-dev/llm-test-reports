# MLTF × Pi / 3D 坦克大战四轮

[English](tank-01.md) | [简体中文](tank-01_CN.md)

| 项目 | 记录 |
|---|---|
| 编号 | TANK-01 |
| 日期 | 2026-10-20 |
| 模型与运行方式 | MLTF 0.1.2 + Qwen3.8-27B 8bit q8c + Pi |
| 推理位置 | 本机 |

<!-- environment-context:start -->

## 本机配置与系统（2026-10-20 补充）

| 项目 | 记录与证据边界 |
|---|---|
| 本机用途 | 本机推理工作站 |
| 本机硬件参考 | MacBook Pro `Mac17,6`；Apple M5 Max；18 核 CPU；40 核 GPU；128 GB 统一内存（128 GiB / 137438953472 字节） |
| 原报告明确记载的主机 | 详见原报告；未以当前快照补造历史配置 |
| 当前系统快照 | macOS 27.0.1，build `26A434`，arm64，Metal 4；采集于 2026-10-20 22:03:27 UTC |
| 实验时系统 | macOS 27.0.1 |
| 历史配置边界 | 旧测试未保存独立快照时，详细核数只作为当前本机配置参考；内网 PC／云端推理硬件不由 Mac 配置推断 |

[完整环境说明](../../environment_CN.md)。模型、量化、引擎、缓存和请求条件以本报告原有记录为准。原始图表、源码和命令输出保留源语言证据。

<!-- environment-context:end -->

## 历史结果

四轮 430 请求、461,939 输出 tokens、约 5.44 小时；29 次文字监督提示。

## 原始报告

- [在 M5 Max 上用 MLTF 驱动 8-bit Qwen3.8-27B：pi 制作 3D 坦克大战的四轮监督实测](../originals/qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report_CN.md)
- [在 M5 Max 上用 MLTF 驱动 8-bit Qwen3.8-27B：pi 制作 3D 坦克大战的四轮监督实测](../originals/devlog-projects-qwen3-8-test-notes-mltf-pi-tank-battle-four-round-report-2026-10-20_CN.md)
- [本地 Qwen3.8-27B-MLTF-q8c × pi：3D 坦克大战监督实验报告](../originals/qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-1_CN.md)
- [本地 Qwen3.8-27B-MLTF-q8c × pi：坦克大战第二轮监督报告](../originals/qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-2_CN.md)
- [Qwen3.8-27B-MLTF-q8c × pi：第三轮游戏重构与本机性能报告](../originals/qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-3_CN.md)
- [MLTF / Qwen3.8-27B 本机监督实验：R4 UI 遮挡修复](../originals/qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-4_CN.md)

## 测试产物

- [Tank Battle](https://github.com/leoli-dev/llm-test-2026-10-20-game-tank-battle)
- [浏览器试玩](https://leoli-dev.github.io/llm-test-2026-10-20-game-tank-battle/)

## 证据边界

game/ 是产品；supervision/ 是监督、性能与验收脚本；github-share 是分享快照，不另算一轮。
