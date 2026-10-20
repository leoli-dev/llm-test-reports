# mlx-dspark 128K / 256K 长上下文

| 项目 | 记录 |
|---|---|
| 编号 | PERF-04 |
| 日期 | 2026-10-19 |
| 模型与运行方式 | Qwen3.8-27B 8bit；mlx-dspark 128K  |
| 推理位置 | 本机 |

## 历史结果

128K 完成；256K 也返回但出现内存压力与约 12.31 GiB swap 增量。

## 原始报告

- [Qwen3.8-27B 128K / 256K 长上下文实测](../originals/engine-tests-2026-10-19-long-context-report.md)

## 证据边界

每长度一个性能样本；512-token 输出，不是完整代码质量测试。 原报告内可能残留 mlx-dspark 旧绝对链接；现文件已迁移到本条位置。
