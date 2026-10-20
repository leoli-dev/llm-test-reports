# 代码审查 — 第 8 轮

[English](early-tests-local-llm-tetris-code-test-tetris-test-qwen3-6-35b-code-review.md) | [简体中文](early-tests-local-llm-tetris-code-test-tetris-test-qwen3-6-35b-code-review_CN.md)

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

## ❌ 旋转 bug 仍未修 — 代码未变动

声称已修，但 `index.html` 里仍然是：
```
WK[this.p.rotation]
```

必须改成：
```
WK.normal[this.p.rotation]
```

**具体操作**：在 `index.html` 内联 `<script>` 中，找到 `rotate()` 方法，  
把 `WK[this.p.rotation]` 改成 `WK.normal[this.p.rotation]`。  
全文只有这一处，用编辑器搜索 `WK[this.p.rotation]` 即可定位。
