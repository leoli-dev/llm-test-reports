# Splash GGUF Q8_0 / PERF-06 128K 图文补测

[English](perf-10.md) | [简体中文](perf-10_CN.md)

| 项目 | 记录 |
|---|---|
| 日期 | 2026-10-21 |
| 模型 | Qwen3.8-27B Unsloth GGUF Q8_0; BF16 projector; INT8 KV |
| 引擎 | Splash |
| 推理位置 | local |
| 推理主机硬件 | MacBook Pro / Apple M5 Max / CPU 18 / GPU 40 / 128 GiB unified memory |
| 实验时系统 | macOS 27.0.1（26A434），arm64；实验时 hardware.json |

两项新进程 GGUF Q8_0 图文请求，2/2 满 4096 输出；平均完整耗时 1036.37 秒，正文交付 15.64 tok/s。早先同日 PERF-09 参考另行标注。

[完整报告](../originals/2026-10-21-splash-gguf-q8-perf06-replay_CN.md)

PERF-09 基线未重跑/交错运行。Q8_0 与 affine8 量化数值不同，不作文件格式单因素或通用质量结论；PERF-09 未复现历史 PERF-06 速度。

后台负载未受控制；GGUF 正文交付期整机 CPU 约 53%–55%，全局 GPU busy 约 25%–27%。测试后发现浏览器 helper 高占用，不能据此建立请求期间的完整归因。
