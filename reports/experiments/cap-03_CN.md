# RepairDesk / Pi 在 Strata 与 Splash 的256K复杂项目配对评测

[English](cap-03.md) | [简体中文](cap-03_CN.md)

| 项目 | 记录 |
|---|---|
| 日期 | 2026-10-25 |
| 模型 | Qwen3.8-Flash-Next GSQ-RCO IQ3_S vs Qwen3.8-27B MLX affine8 |
| 引擎 | Strata,Splash |
| 推理位置 | local |
| 推理主机硬件 | Local MacBook Pro / Apple M5 Max / 18 CPU / 40 GPU / 128 GiB unified memory |
| 实验时系统 | macOS 27.0.1 (26A434)，arm64；实验时host.json记录 |

同题四阶段、各60分钟：Strata 38.16分钟，完成度79/80、质量14/20；Splash 50.89分钟，77/80、10/20。保留已重现的数据完整性/安全/UI缺陷与评测器修正，监督者未代修产品代码。

[完整报告](../originals/2026-10-25-pi-strata-splash-repairdesk_CN.md)

单项目每边一轮、非盲评、固定顺序；基础模型/量化/引擎及自主视觉策略不同。已核实配置256K，最大实际输入162672/124477。整理证据排除完整会话、私有配置及完整产品源码；只做本地提交，不push。
