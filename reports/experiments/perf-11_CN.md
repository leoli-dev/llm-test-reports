# Splash affine8原生256K上下文压力测试

[English](perf-11.md) | [简体中文](perf-11_CN.md)

| 项目 | 记录 |
|---|---|
| 日期 | 2026-10-21 |
| 模型 | Qwen3.8-27B MLX affine8 / INT8 KV |
| 引擎 | Splash |
| 推理位置 | local |
| 推理主机硬件 | MacBook Pro / Apple M5 Max / 18 CPU / 40 GPU / 128 GiB |
| 实验时系统 | macOS 27.0.1（26A434），arm64；本轮hardware.json |

原生262144窗口；258048输入/4096输出上限冷请求机械完成=True、检索5/5、实际输出4096。包含128K/192K阶梯、原样热重复、两个共享前缀并发客户端、实际超限拒绝=True、恢复6/6；核查62/63。

[完整报告](../originals/2026-10-21-splash-affine8-256k-stress_CN.md)

一次有限纯文本序列，关闭思考、保留RAM前缀，后台负载/温控未控制。并发HTTP接纳不等于独立冷prefill吞吐。未新增MLTF对照，也不证明长期无泄漏或通用推理质量。
