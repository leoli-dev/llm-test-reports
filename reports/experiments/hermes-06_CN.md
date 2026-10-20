# Cafe POS from-zero / Config E

[English](hermes-06.md) | [简体中文](hermes-06_CN.md)

| 项目 | 记录 |
|---|---|
| 编号 | HERMES-06 |
| 日期 | 2026-05-27 |
| 模型与运行方式 | Hermes + oMLX Qwen3.6-35B-A3B-MLX-8bit |
| 推理位置 | 本机 |

<!-- environment-context:start -->

## 本机配置与系统（2026-10-20 补充）

| 项目 | 记录与证据边界 |
|---|---|
| 本机用途 | 本机推理工作站 |
| 本机硬件参考 | MacBook Pro `Mac17,6`；Apple M5 Max；18 核 CPU；40 核 GPU；128 GB 统一内存（128 GiB / 137438953472 字节） |
| 原报告明确记载的主机 | 详见原报告；未以当前快照补造历史配置 |
| 当前系统快照 | macOS 27.0.1，build `26A434`，arm64，Metal 4；采集于 2026-10-20 22:03:27 UTC |
| 实验时系统 | 现存测试证据中未记录；不以当前系统版本倒填 |
| 历史配置边界 | 旧测试未保存独立快照时，详细核数只作为当前本机配置参考；内网 PC／云端推理硬件不由 Mac 配置推断 |

[完整环境说明](../../environment_CN.md)。模型、量化、引擎、缓存和请求条件以本报告原有记录为准。原始图表、源码和命令输出保留源语言证据。

<!-- environment-context:end -->

## 历史结果

历史评分 7.5/10。22/22 测试与 build 通过；折扣集成较好，Sales Summary 重复扣折扣并混入税。

## 原始报告

- [Hermes Cafe POS / Config E](../originals/session-cafe-pos-config-e_CN.md)

## 证据边界

会话保存原评审和 eval-log 提交号 d008ce6；旧源码与报告仓库当前不存在，提交号只作线索，未找到可读取的 Git 对象。各配置使用同一产品目录重建，不把最后一版当作全部五版。
