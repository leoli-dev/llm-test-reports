# DeepSeek Flash 1017／Strata：M5 Max 初测与退役决定

[English](perf-14.md) | [简体中文](perf-14_CN.md)

| 项目 | 记录 |
|---|---|
| 日期 | 2026-10-28 |
| 模型 | DeepSeek-V4.1-Flash-1017 GSQ-RCO IQ2_XXS / backbone average 2.00 bpw |
| 引擎 | Strata |
| 推理位置 | local |
| 推理主机硬件 | MacBook Pro／Apple M5 Max／18 核 CPU／40 核 GPU／128GiB 统一内存／内置 SSD |
| 实验时系统 | macOS 27.2；OS build 未记录；arm64（签名引擎包目标） |

32K、128K、256K 合成检索通过；260,078-token 首次输入的首字等待 957.087 秒。长窗序列后短生成从 15.0 降至 2.3 token/s，重启后为 4.6；用户要求发布报告后退役。

[完整报告](../originals/2026-10-28-strata-deepseek41-flash1017-2bpw-m5max_CN.md)

各性能点一次采样，运行历史与系统负载未受控；缓存跟进非独立检索。swap 为全系统读数，掉速原因未定位。本版记录退役请求，未提前声明完成卸载。
