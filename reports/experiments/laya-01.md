# Laya 本地服务 / 72 题与并发边界

| 项目 | 记录 |
|---|---|
| 编号 | LAYA-01 |
| 日期 | 2026-09-21 |
| 模型与运行方式 | aac6fef/laya-multilingual-mlx；GPU FP16；1024 tokens |
| 推理位置 | 本机 |

## 历史结果

72 题 37/72，51.4%；单题很快，但并发 7 有 reset 断崖。

## 原始报告

- [Laya 本地服务深度测评](../originals/devlog-projects-laya-mlx-notes-local-service-deep-evaluation-2026-09-21.md)
- [Local benchmarks](../originals/source-benchmarks.md)

## 证据边界

Laya 是判别模型，与生成式 LLM 分列；报告中的临时 /tmp JSON 要单独核对是否仍在。
