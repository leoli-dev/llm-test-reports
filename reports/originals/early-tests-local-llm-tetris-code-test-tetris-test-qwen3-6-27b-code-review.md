# Code Review — Round 2

[English](early-tests-local-llm-tetris-code-test-tetris-test-qwen3-6-27b-code-review.md) | [简体中文](early-tests-local-llm-tetris-code-test-tetris-test-qwen3-6-27b-code-review_CN.md)

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

## ✅ All 4 Bugs in Round 1 Correctly Fixed

Verified via code inspection (not merely trusting verbal claims):

| Bug | Fix Status | Verification |
|-----|:--------:|------|
| Duplicate J/L cells | ✅ | 4 rotations each have 4 unique coordinates, and the shape conforms to standard SRS |
| I-wall kick table not effective | ✅ | `PIECES[currentPiece.type].name === 'I'` |
| Incorrect lock delay condition | ✅ | Changed to `canPlace({...y+1})` with independent per-frame evaluation |
| No start screen | ✅ | `start-overlay` displayed by default |

---

## 🚨 New Finding: S and Z Shapes Swap After Rotation

Round 1 did not point this out; adding it now.

Coordinates for S piece rot1: `[[1,-1],[1,0],[0,0],[0,1]]`, rendering result:
```
.S
SS
S.   ← 这是 Z 的竖向形状，不是 S
```

Coordinates for Z piece rot1: `[[0,-1],[0,0],[1,0],[1,1]]`, rendering result:
```
S.
SS
.S   ← 这是 S 的竖向形状，不是 Z
```

The two pieces swap shapes after rotation. S rotated once takes the shape of Z, and Z rotated once takes the shape of S.

**Fix**: Swap the rot1 of S and Z (since rot3 is a duplicate of rot1, fix them together):

```js
// S piece 正确的 rot1：
[[0,-1],[0,0],[1,0],[1,1]]   // S.  / SS / .S

// Z piece 正确的 rot1：
[[1,-1],[1,0],[0,0],[0,1]]   // .Z / ZZ / Z.
```

That is: change S's rot1/rot3 to `[[0,-1],[0,0],[1,0],[1,1]]`, and change Z's rot1/rot3 to `[[1,-1],[1,0],[0,0],[0,1]]`.

---

## Remaining Code Quality Assessment

Apart from the bugs mentioned above, the overall quality is good:
- 7-Bag, Ghost, Hold, SRS, lock delay, and level multipliers are all correctly implemented
- The code structure is clear, it is a single file with no dependencies, and can be run directly using http.server
