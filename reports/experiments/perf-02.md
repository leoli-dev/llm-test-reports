# MTPLX 27B Quality 冷 prefill 与近 128K soak

| 项目 | 记录 |
|---|---|
| 编号 | PERF-02 |
| 日期 | 2026-09-19—09-20 |
| 模型与运行方式 | MTPLX；Qwen3.8-27B Optimized Quality |
| 推理位置 | 本机 |

## 历史结果

各模型完成 3 个 near-128K natural soak 任务；Flash 13.5 分钟，Quality 30.6 分钟。冷 prefill 有五档输入。

## 原始报告

- [MTPLX Qwen3.8 27B Optimized Quality 压测执行记录](../originals/devlog-projects-qwen3-8-test-notes-mtplx-qwen38-27b-quality-pressure-test-run-2026-09-20.md)
- [MTPLX 本机模型性能对比](../originals/qwen-tests-mtplx-model-comparison-report-2026-09-20.md)
- [MTPLX 本机两模型性能对比报告](../originals/devlog-projects-qwen3-8-test-notes-mtplx-model-comparison-report-2026-09-20.md)

## 证据边界

Quality 目录主要是运行结果；两轮共用 Flash 目录的 pressure_test.py。初轮 507 与未完成矩阵均保留。
