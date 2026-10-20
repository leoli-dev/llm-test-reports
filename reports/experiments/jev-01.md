# Jev vs 本地 Laya / 同一 72 题

| 项目 | 记录 |
|---|---|
| 编号 | JEV-01 |
| 日期 | 2026-09-21 |
| 模型与运行方式 | Jev 云端 proxy 对照本地 Laya |
| 推理位置 | 云端对照 |

## 历史结果

Jev 66/72（91.7%），Laya 37/72（51.4%）；云端延迟和限流单列。

## 原始报告

- [云端 Jev 与本地 Laya 对比评测](../originals/devlog-projects-jev-tests-notes-jev-vs-local-laya-comparison-2026-09-21.md)

## 证据边界

Jev 服务不在本机推理；jev-tests/investment 的投资测试属于另一组用例，不能与 72 题混为一份。
