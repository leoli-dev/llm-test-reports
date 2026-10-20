# Neon Bastion / 8bit 七轮

[English](neon-01.md) | [简体中文](neon-01_CN.md)

| 项目 | 记录 |
|---|---|
| 编号 | NEON-01 |
| 日期 | 2026-09-01—09-04 |
| 模型与运行方式 | mlx-dspark + Qwen3.8-27B-8bit + DFlash2 + Pi |
| 推理位置 | 本机 |

<!-- environment-context:start -->

## 本机配置与系统（2026-10-20 补充）

| 项目 | 记录与证据边界 |
|---|---|
| 本机用途 | 本机推理工作站 |
| 本机硬件参考 | MacBook Pro `Mac17,6`；Apple M5 Max；18 核 CPU；40 核 GPU；128 GB 统一内存（128 GiB / 137438953472 字节） |
| 原报告明确记载的主机 | 详见原报告；未以当前快照补造历史配置 |
| 当前系统快照 | macOS 27.0.1，build `26A434`，arm64，Metal 4；采集于 2026-10-20 22:03:27 UTC |
| 实验时系统 | 现存测试证据中未记录；不以当前系统版本倒填 |
| 历史配置边界 | 旧测试未保存独立快照时，详细核数只作为当前本机配置参考；内网 PC／云端推理硬件不由 Mac 配置推断 |

[完整环境说明](../../environment_CN.md)。模型、量化、引擎、缓存和请求条件以本报告原有记录为准。原始图表、源码和命令输出保留源语言证据。

<!-- environment-context:end -->

## 历史结果

七轮总结截稿 31 提交；09-16 横向总结记仓库终态 34 提交。约 30 小时；149 单测、26 E2E。部署当时丢弃图像，不能据此评价模型视觉能力。

## 原始报告

- [Neon Bastion 七轮总结](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-final-summary-2026-09-04_CN.md)
- [Neon Bastion — mlx-dspark/Qwen3.8-27B-8bit + Pi 独立验收与代码审查](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-mlx-dspark-pi-review-2026-09-01_CN.md)
- [Neon Bastion — mlx-dspark/Qwen3.8-27B-8bit + Pi 独立验收与代码审查](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-1-review-2026-09-01_CN.md)
- [Round 2 — 独立复核（2026-09-02）](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-2-review-2026-09-02_CN.md)
- [Neon Bastion — Round 3 验证（评分暂缓至人工游玩）](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-3-review-2026-09-02_CN.md)
- [Neon Bastion — Round 4 评审](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-4-review-2026-09-02_CN.md)
- [Neon Bastion — Round 5 评审](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-5-review-2026-09-03_CN.md)
- [Neon Bastion — Round 6 评审](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-6-review-2026-09-03_CN.md)
- [第七轮评审](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-7-review-2026-09-04_CN.md)

## 测试产物

- [Neon Bastion](https://github.com/leoli-dev/llm-test-2026-09-01-game-neon-bastion)
- [浏览器试玩](https://leoli-dev.github.io/llm-test-2026-09-01-game-neon-bastion/)
