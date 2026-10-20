# MLTF vs mlx-vlm / 128 请求质量对照

| 项目 | 记录 |
|---|---|
| 编号 | PERF-08 |
| 日期 | 2026-10-19 |
| 模型与运行方式 | Qwen3.8-27B 8bit；MLTF vs mlx-vlm  |
| 推理位置 | 本机 |

## 历史结果

后验实际代码执行 11/12 vs 10/12；medium 数学 18/20 vs 17/20；32K/128K 检索两端均 2/6。

## 原始报告

- [MLTF / mlx-vlm 配对质量、速度与内存对照](../originals/engine-tests-2026-10-19-quality-comparison-report.md)

## 证据边界

代码冻结严格分均 10/12，与后验放宽沙箱分开。小样本不能证明无损；OFF 数学均 0/20 有地板效应。 原报告内可能残留 mlx-dspark 旧绝对链接；现文件已迁移到本条位置。
