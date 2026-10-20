# 代码审查 — 第 2 轮

[English](early-tests-local-llm-tetris-code-test-tetris-test-qwen3-6-27b-code-review.md) | [简体中文](early-tests-local-llm-tetris-code-test-tetris-test-qwen3-6-27b-code-review_CN.md)

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

## ✅ Round 1 的 4 个 Bug 全部正确修复

经代码核实（不是看你说修了就信）：

| Bug | 修复状态 | 验证 |
|-----|:--------:|------|
| J/L 重复格子 | ✅ | 4个旋转各有4个唯一坐标，且形状符合标准SRS |
| I墙踢表不生效 | ✅ | `PIECES[currentPiece.type].name === 'I'` |
| 锁定延迟条件错 | ✅ | 改为 `canPlace({...y+1})` 每帧独立判断 |
| 无开始界面 | ✅ | `start-overlay` 默认显示 |

---

## 🚨 新发现：S 和 Z 旋转后形状互换

Round 1 没有指出，现在补上。

S piece rot1 的坐标：`[[1,-1],[1,0],[0,0],[0,1]]`，渲染结果：
```
.S
SS
S.   ← 这是 Z 的竖向形状，不是 S
```

Z piece rot1 的坐标：`[[0,-1],[0,0],[1,0],[1,1]]`，渲染结果：
```
S.
SS
.S   ← 这是 S 的竖向形状，不是 Z
```

两个方块旋转后互换了形状。S 旋转一次变成 Z 的样子，Z 旋转一次变成 S 的样子。

**修复**：交换 S 和 Z 的 rot1（同时 rot3 是 rot1 的重复，一起修）：

```js
// S piece 正确的 rot1：
[[0,-1],[0,0],[1,0],[1,1]]   // S.  / SS / .S

// Z piece 正确的 rot1：
[[1,-1],[1,0],[0,0],[0,1]]   // .Z / ZZ / Z.
```

即：把 S 的 rot1/rot3 改为 `[[0,-1],[0,0],[1,0],[1,1]]`，把 Z 的 rot1/rot3 改为 `[[1,-1],[1,0],[0,0],[0,1]]`。

---

## 其余代码质量评价

除上述 bug 外，整体质量不错：
- 7-Bag、Ghost、Hold、SRS、lock delay、level 倍率均已正确实现
- 代码结构清晰，单文件无依赖，直接用 http.server 运行
