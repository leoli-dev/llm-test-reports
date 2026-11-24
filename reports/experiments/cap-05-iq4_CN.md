# Splash 上的 Flash Next UD-IQ4_XS：CAP-05 复测

[English](cap-05-iq4.md) | [简体中文](cap-05-iq4_CN.md)

| 项目 | 记录 |
|---|---|
| 日期 | 2026-11-24 |
| 模型 | Qwen3.8-Flash-Next UD-IQ4_XS / GSQ-RCO IQ3_S |
| 引擎 | Splash |
| 推理位置 | local |
| 推理主机硬件 | MacBook Pro Mac17,6 / Apple M5 Max / CPU 18 / GPU 40 / 128 GiB |
| 实验时系统 | macOS 27.2.1（26B131），arm64 |

同版冷探针中，IQ4 首事件耗时低 5.6%、解码慢 3.3%，Splash 峰值多 8.68 GiB。对照历史 IQ3，电影和清明均完成三轮，方块题从完成变为到限。

[完整报告](../originals/2026-11-24-flash-next-iq4xs-splash-cap05-replay_CN.md)

每个模式三次冷探针，每个产品任务一次。方块题达到 60 分钟上限。历史产物成绩来自不同的引擎和客户端版本。
