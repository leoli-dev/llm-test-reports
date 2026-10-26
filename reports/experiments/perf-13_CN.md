# Strata冷KV首字实测：十次128K输入与十次256K满窗压力

[English](perf-13.md) | [简体中文](perf-13_CN.md)

| 项目 | 记录 |
|---|---|
| 日期 | 2026-10-26 |
| 模型 | Qwen3.8-Flash-Next GSQ-RCO IQ3_S |
| 引擎 | Strata |
| 推理位置 | local |
| 推理主机硬件 | Local MacBook Pro / Apple M5 Max / 18 CPU / 40 GPU / 137438953472 bytes (128 GiB) unified memory |
| 实验时系统 | macOS 27.0.1（26A434）、arm64；实验时host.json实录 |

20/20完成，全部零KV复用且输出4096 tokens。128K/256K平均TTFT120.530/253.769秒，pooled prefill1087.986/1017.203、decode80.060/76.651 tok/s；4762次压力全normal，同源swap增0，275/275核对通过。

[完整报告](../originals/2026-10-26-strata-cold-kv-128k-256k_CN.md)

128K指131072输入，服务窗口全程262144；256K为258040输入+4096输出+8预留。模型预加载、无思考、固定组序及合成SQL负载，不作通用能力或热因果结论；整理证据不含私人进程清单和完整输入/SSE流。
