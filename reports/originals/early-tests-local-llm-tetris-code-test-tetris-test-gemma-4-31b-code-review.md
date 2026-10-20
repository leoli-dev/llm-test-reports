# Code Review — Round 5 (Final)

## 🚨 Still Broken — Same Pattern, Different File

`useTetris.ts` imports `TetrominoType` as a regular value import alongside real constants:

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

Fix — split into two imports:

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

## ✅ Fixed So Far
- File structure, `main.tsx`, `index.css`
- Infinite loop in ghost/hardDrop
- Locked piece color
- Speed floor, hold lock-out
- `import type` in types.ts, App.tsx, TetrisBoard.tsx, Sidebar.tsx, useTetris.ts (Piece)
