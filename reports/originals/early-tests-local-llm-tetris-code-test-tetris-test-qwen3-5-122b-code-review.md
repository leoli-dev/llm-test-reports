# Code Review — Round 1

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
