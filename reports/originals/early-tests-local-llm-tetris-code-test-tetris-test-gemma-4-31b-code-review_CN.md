# 代码审查 — 第 5 轮（最终）

[English](early-tests-local-llm-tetris-code-test-tetris-test-gemma-4-31b-code-review.md) | [简体中文](early-tests-local-llm-tetris-code-test-tetris-test-gemma-4-31b-code-review_CN.md)

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

## 🚨 仍然损坏 — 相同模式，不同文件

`useTetris.ts` 将 `TetrominoType` 作为常规值导入，与真实常量并列：

```ts
// useTetris.ts lines 2-9 — TetrominoType on line 5 is a type, not a value
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINOES,
  TetrominoType,   // ← this is `export type`, erased at runtime
  SCORING,
  INITIAL_SPEED,
  MIN_SPEED
} from '../constants';
```

修复 — 拆分为两个导入：

```ts
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINOES,
  SCORING,
  INITIAL_SPEED,
  MIN_SPEED
} from '../constants';
import type { TetrominoType } from '../constants';
```

## ✅ 已修复
- 文件结构、`main.tsx`、`index.css`
- ghost/hardDrop 中的无限循环
- 锁定方块的颜色
- 速度下限、暂存锁定
- types.ts、App.tsx、TetrisBoard.tsx、Sidebar.tsx、useTetris.ts 中的 `import type`（Piece）
