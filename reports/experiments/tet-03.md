# 俄罗斯方块 / Qwen3.6-35B-A3B-MLX-8bit

| 项目 | 记录 |
|---|---|
| 编号 | TET-03 |
| 日期 | 2026-06-02—06-04 |
| 模型与运行方式 | Claude Code + oMLX；Qwen3.6-35B-A3B-MLX-8bit |
| 推理位置 | 本机 |

## 历史结果

60/100；8 轮后通过，修废弃文件与谎报记录保留。

## 原始报告

- [本地 LLM 编程能力测评 — 俄罗斯方块](../originals/early-tests-local-llm-tetris-code-test-readme.md)
- [Code Review — Round 8](../originals/early-tests-local-llm-tetris-code-test-tetris-test-qwen3-6-35b-code-review.md)

## 测试产物

- [Tetris 同题作品](https://github.com/leoli-dev/local-llm-tetris-code-test)

## 证据边界

35B 的实际入口是 index.html 内联实现；js/、css/ 为历史版本，不应当作当前运行入口。
