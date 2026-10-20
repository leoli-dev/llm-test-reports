# MLTF vs mlx-vlm / 128K 图文性能

| 项目 | 记录 |
|---|---|
| 编号 | PERF-06 |
| 日期 | 2026-10-19 |
| 模型与运行方式 | Qwen3.8-27B 8bit；MLTF vs mlx-vlm  |
| 推理位置 | 本机 |

## 历史结果

各后端两轮；decode 约 3.53×，整请求时间减少约 34.5%。

## 原始报告

- [MLTF 与 MLX-VLM：128K 图文长任务对照](../originals/engine-tests-2026-10-19-mltf-comparison-report.md)

## 证据边界

8bit 权重源相同，KV 与数值路径不同；并非等精度实验，也不是长期稳定性证明。 原报告内可能残留 mlx-dspark 旧绝对链接；现文件已迁移到本条位置。
