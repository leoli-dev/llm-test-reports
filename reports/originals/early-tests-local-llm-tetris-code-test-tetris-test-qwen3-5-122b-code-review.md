# Code Review — Round 1

[English](early-tests-local-llm-tetris-code-test-tetris-test-qwen3-5-122b-code-review.md) | [简体中文](early-tests-local-llm-tetris-code-test-tetris-test-qwen3-5-122b-code-review_CN.md)

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Local inference workstation |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | See original report; current snapshot does not fill missing historical configuration |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | Not recorded in the surviving test evidence; current OS is not substituted |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

**Overall Evaluation:** Excellent selection (Vue 3 + TypeScript + Composition API), clear architecture, and the most comprehensive coverage of bonus items. It runs, but contains one critical bug that causes the rotation to fail.

---

## 🚨 Bug 1: Rotation Failure — Reference Equality Check Never Finds Current State

**Problem Description:**

`src/types/pieces.ts` Line 152:

```ts
const currentShapeIndex = shapes.findIndex(
  (s) => s === tetromino.shape   // ← 引用相等，永远是 -1
)
```

`tetromino.shape` is a new array after any object extension (`{ ...tetromino, shape: ... }`), which differs from the original array reference in `TETROMINO_SHAPES`. `findIndex` returns `-1`, causing `nextShapeIndex = (-1 + 1) % shapes.length = 0`, always reverting to state 0, so rotation cannot cycle.

**Fix:**

Add a `rotationIndex: number` field to the `Tetromino` type to directly track the current rotation state:

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

**Fix Status:** ✅ Fixed

Fix locations:
- `src/types/index.ts` — Added `rotationIndex: number` field to the `Tetromino` interface
- `src/types/pieces.ts` — `rotateTetromino` function now uses `rotationIndex` to track state
- `src/types/pieces.ts` — `getRandomTetromino` initializes `rotationIndex: 0`
- `src/utils/gameLogic.ts` — `generatePieceBag` initializes `rotationIndex: 0`
- `src/App.vue` — Initializes `rotationIndex: 0` when creating the Hold piece in the `hold` function

---

## ✅ Well-Executed Parts

- Vue 3 Composition API + TypeScript full coverage ✓
- Collision detection logic is correct ✓
- Line clearing logic is correct (including `row++` to prevent line skipping) ✓
- Ghost piece / Hard drop logic is correct ✓
- 7-Bag randomizer (Fisher-Yates) ✓
- Hold mechanism ✓
- Score/rank/speed system ✓
- Mobile touch support ✓
- Responsive layout ✓
- Local high score (localStorage) ✓
- Predefined rotation state table (not matrix operations, more precise) ✓
