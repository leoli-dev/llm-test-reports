# mlx-vlm 视觉 + DFlash2 阶梯稳定性

| 项目 | 记录 |
|---|---|
| 编号 | PERF-05 |
| 日期 | 2026-10-19 |
| 模型与运行方式 | Qwen3.8-27B 8bit；mlx-vlm 视觉 + DFlash2 阶梯稳定性 |
| 推理位置 | 本机 |

## 历史结果

32K、64K、96K、128K、128K-repeat 五个阶段及恢复探针通过，另保留两个 greedy 失败样本。

## 原始报告

- [Qwen3.8-27B 视觉 + DFlash2 阶梯稳定性实测](../originals/engine-tests-2026-10-19-vision-stability-report.md)

## 证据边界

主表跨进程与不同采样，不能解读为同进程连续单因素对比。 原报告内可能残留 mlx-dspark 旧绝对链接；现文件已迁移到本条位置。
