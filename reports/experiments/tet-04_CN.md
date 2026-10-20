# 俄罗斯方块 / Qwen3.5-122B-A10B-4bit

[English](tet-04.md) | [简体中文](tet-04_CN.md)

| 项目 | 记录 |
|---|---|
| 编号 | TET-04 |
| 日期 | 2026-06-02—06-04 |
| 模型与运行方式 | Claude Code + oMLX；Qwen3.5-122B-A10B-4bit |
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

96/100；1 轮后通过。

## 原始报告

- [本地 LLM 编程能力测评 — 俄罗斯方块](../originals/early-tests-local-llm-tetris-code-test-readme_CN.md)
- [代码审查 — 第 1 轮](../originals/early-tests-local-llm-tetris-code-test-tetris-test-qwen3-5-122b-code-review_CN.md)

## 测试产物

- [Tetris 同题作品](https://github.com/leoli-dev/local-llm-tetris-code-test)
