# Code Review — Round 5 (Final)

[English](early-tests-local-llm-tetris-code-test-tetris-test-gemma-4-31b-code-review.md) | [简体中文](early-tests-local-llm-tetris-code-test-tetris-test-gemma-4-31b-code-review_CN.md)

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
