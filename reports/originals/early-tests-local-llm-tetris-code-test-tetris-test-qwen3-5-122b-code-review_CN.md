# 代码审查 — 第 1 轮

[English](early-tests-local-llm-tetris-code-test-tetris-test-qwen3-5-122b-code-review.md) | [简体中文](early-tests-local-llm-tetris-code-test-tetris-test-qwen3-5-122b-code-review_CN.md)

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

**总体评价：** 选型出色（Vue 3 + TypeScript + Composition API），架构清晰，加分项覆盖最全。能运行，但有一个导致旋转失效的关键 bug。

---

## 🚨 Bug 1：旋转失效——引用相等判断永远找不到当前状态

**问题描述：**

`src/types/pieces.ts` 第 152 行：

```ts
const currentShapeIndex = shapes.findIndex(
  (s) => s === tetromino.shape   // ← 引用相等，永远是 -1
)
```

`tetromino.shape` 在经过任何对象扩展（`{ ...tetromino, shape: ... }`）后就是新数组，与 `TETROMINO_SHAPES` 里的原始数组引用不同。`findIndex` 返回 `-1`，导致 `nextShapeIndex = (-1 + 1) % shapes.length = 0`，永远回到状态 0，旋转无法循环。

**修复方案：**

在 `Tetromino` 类型上增加 `rotationIndex: number` 字段，直接追踪当前旋转状态：

```ts
// src/types/index.ts — 在 Tetromino 接口加一个字段
rotationIndex: number

// src/types/pieces.ts — rotateTetromino 改为：
export const rotateTetromino = (tetromino: Tetromino): Tetromino => {
  const shapes = TETROMINO_SHAPES[tetromino.type]
  const nextIndex = (tetromino.rotationIndex + 1) % shapes.length
  return {
    ...tetromino,
    rotationIndex: nextIndex,
    shape: shapes[nextIndex]
  }
}

// 生成新方块时初始化为 0：
return { type, shape: shapes[0], color, rotationIndex: 0 }
```

**修复状态：** ✅ 已修复

修复位置：
- `src/types/index.ts` — 在 `Tetromino` 接口添加 `rotationIndex: number` 字段
- `src/types/pieces.ts` — `rotateTetromino` 函数改用 `rotationIndex` 追踪状态
- `src/types/pieces.ts` — `getRandomTetromino` 初始化 `rotationIndex: 0`
- `src/utils/gameLogic.ts` — `generatePieceBag` 初始化 `rotationIndex: 0`
- `src/App.vue` — `hold` 函数中创建 Hold 方块时初始化 `rotationIndex: 0`

---

## ✅ 做得好的部分

- Vue 3 Composition API + TypeScript 全覆盖 ✓
- 碰撞检测逻辑正确 ✓
- 消行逻辑正确（含 `row++` 防止跳行）✓
- Ghost piece / Hard drop 逻辑正确 ✓
- 7-Bag 随机器（Fisher-Yates）✓
- Hold 暂存机制 ✓
- 分数/等级/速度系统 ✓
- 移动端触控支持 ✓
- 响应式布局 ✓
- 本地最高分（localStorage）✓
- 预定义旋转状态表（非矩阵运算，更精确）✓
