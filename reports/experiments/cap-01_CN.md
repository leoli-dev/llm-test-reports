# Pi能力考试：Qwen3.8-27B 8bit 在MLTF / Splash上的表现

[English](cap-01.md) | [简体中文](cap-01_CN.md)

| 项目 | 记录 |
|---|---|
| 日期 | 2026-10-21 |
| 模型 | Qwen3.8-27B 8-bit (MLTF q8c / MLX affine8) |
| 引擎 | MLTF,Splash |
| 推理位置 | local |
| 推理主机硬件 | MacBook Pro / Apple M5 Max / 18 CPU / 40 GPU / 128 GiB |
| 实验时系统 | macOS 27.0.1 (26A434)，arm64；实验时采集 |

冻结18题、8领域，经实际Pi CLI主测，同128K上下文/medium/采样及每轮8K输出：MLTF 70.83、Splash 66.67。另列32K输出视觉补充：2D 50.00 / 94.44、3D 0.00 / 0.00（MLTF / Splash）。保留全部44会话，包含功能测试、渲染、逐项判分与证据；是本地选题适配，不是官方完整benchmark分数。

[完整报告](../originals/2026-10-21-pi-qwen38-27b-mltf-splash-capabilities_CN.md)

一次MLTF会话在写文件后被外部误中断，已核对的交付文件照常评分，计时不完整单列。每引擎/题目/预算仅一次随机会话，视觉由监督助手判分。Pi在不同预算阶段注入不同工作目录元数据，仅同阶段两端首输入一致；缺失/截断产物均保留在分母。
