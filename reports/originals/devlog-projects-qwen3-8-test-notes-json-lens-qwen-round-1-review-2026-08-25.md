---
type: Note
title: JSON Lens Qwen 3.8 Round 1 code review
status: current
description: Independent two-round review of the Qwen JSON Lens delivery: Round 1 defects are closed, but deep valid JSON still overflows the app stack.
tags: [json-lens, qwen3.8, code-review, frontend, benchmark]
timestamp: 2026-08-26T10:18:40Z
---

# JSON Lens Qwen 3.8 Round 1 code review

## Scope and evidence

| Field | Value |
|---|---|
| Reviewed delivery | `$HOME/Code/qwen3.8-tests/json-lens-qwen` |
| Model / workflow claimed by user | MTPLX Qwen 3.8 27B Optimized Quality — Coding Stable; sequential Qwen CLI-agent subtasks |
| Independent checks | `npm test -- --run`; `npm run build`; `npx playwright test` |

All declared checks pass locally: **95/95 Vitest**, a successful TypeScript/Vite production build, and **3/3 Playwright** scenarios. This is useful baseline evidence, but it does not establish the central state transitions and edge cases below.

## Verdict

**Request Changes.** The implementation is compact, readable, and meaningfully tested at the pure-function level, but it is not yet safe to call complete: a normal edit can replace the currently visible document with stale Worker output, and valid JSON values / locations are mishandled. The `onlyDiffs` UI also has no observable effect.

## P1 findings

### FE-12 — A stale large-file Worker result overwrites a newer small edit

`useParse.parse()` only increments `requestIdRef` in its large-file branch (`json-lens-qwen/src/hooks/useParse.ts:142-175`). When a >5 MiB input starts Worker request 1 and the user immediately replaces it with a small document, the small synchronous branch updates UI state but leaves the current request id at 1 and never sends Worker cancellation. The completed Worker message therefore still passes the equality check at `:74-75` and replaces the new document.

Browser reproduction: fill a >5 MiB valid document with top-level key `stale`, immediately replace it with `{ "fresh": true }`, and wait 1.5 seconds. The textarea still contains the fresh input, but rendered tree paths are `$`, `$.stale` and the UI retains the large-file indicator. This is data/view divergence in the main workflow.

Fix by advancing the generation and cancelling any in-flight Worker before *every* parse, including the synchronous branch; only accept a response for the active generation. Add an E2E regression for large → small replacement and a hook test with a mocked Worker.

### FE-13 — Valid JSON `null` and restored persisted JSON never become view state

`ParseStatus.value` uses `null` as the no-value sentinel, then `App` and `InputPanel` gate successful rendering and tools on `value !== null` (`json-lens-qwen/src/App.tsx:70-75,218`; `src/components/InputPanel.tsx:228`). A valid document containing only `null` parses successfully but renders no tree and leaves Format disabled. Represent parse success separately from the parsed value (the existing `parseState === 'done'` already provides the distinction).

Persistence has a second integration gap: `useLocalStorage` restores `jsonlens:text`, but `useParse()` is never asked to parse that initial text. With localStorage preloaded to `{ "saved": true }` and a reload, the textarea is restored while the result panel says “输入 JSON 后在此显示树形视图” and has zero rows. Parse restored text on mount and clear or replace stale query state appropriately.

### LIB-02 — Friendly structural errors report column numbers one character too high

`toLineColumn()` returns `position - lastNewline + 1` in `jsonErrors.ts:14-26`. With `lastNewline === -1`, position 0 becomes column 2; in general, 1-based column is `position - lastNewline`, not an additional `+ 1`. The structural scanner overrides native locations, so this affects the advertised trailing-comma, single-quote and unquoted-key messages.

Browser reproduction for a multiline object with a trailing comma reports that comma as “第 2 行，第 10 列”; it is column 9. Correct the formula and test first-character, single-line, and later-line error positions. The existing E2E expectation currently codifies the wrong number.

### FE-14 — “只看差异” is a no-op

`DiffView` sets `const visible = onlyDiffs ? entries : entries` (`json-lens-qwen/src/components/DiffView.tsx:46-52`). Both settings render exactly the same collection, so toggling the checkbox cannot filter anything. The supplied E2E explicitly asserts unchanged count after toggling (`e2e/jsonlens.spec.ts:182-188`), which verifies the defect instead of the stated feature.

Either render a comparison tree/list containing unchanged nodes and let the control hide them, or remove the checkbox and revise README/requirements. Add an interaction test that proves different content in the two modes.

## P2 findings

### LIB-03 — align-by-id silently drops duplicate elements

When `alignById` is enabled, `diff()` maps each element by serialized `id` and skips repeated ids (`json-lens-qwen/src/lib/diff.ts:82-107`). Comparing duplicate-id source elements to a single same-id target reports only the first change; the later source element disappears. Detect duplicate ids and fall back to index comparison (or surface an explicit ambiguity) instead of returning an incomplete diff.

### UX-05 — Tree traversal reverses sibling order and breaks pre-order hierarchy

`buildVisibleRows()` pushes object/array children to `rows` in reverse while separately stacking expanded children (`json-lens-qwen/src/components/TreeView.tsx:59-96`). For an object with `a` and `b` subtrees both expanded, visible paths are `$`, `$.b`, `$.a`, `$.a.x`, `$.b.y`: sibling order is reversed and `b`'s descendant is separated from its parent. Build rows in document pre-order; the E2E currently documents and accepts the reverse order.

### QA-06 — Integration coverage misses all findings above

No tests exercise persisted-state parsing, a large → small replacement, top-level `null`, true/false behaviour of `onlyDiffs`, duplicate ids, or nested expanded order. Add these before claiming all acceptance gates rather than only the currently green narrow scenarios.

## What looks good

- The pure JSON repair layer keeps valid double-quoted apostrophes intact and its focused tests are clear.
- Production build is clean and small (about 182 kB main JS, 8.9 kB CSS, 4.8 kB Worker before gzip).
- The 100k-node check confirms DOM windowing; only a small row window is mounted.
- The Worker pre-scan genuinely yields before the blocking parse, which gives cancellation a meaningful window once request lifecycle handling is corrected.

## Suggested acceptance path

1. Repair Worker generation/cancellation and parse initial persisted values.
2. Separate “parse succeeded” from parsed payload so `null` is a first-class JSON document; correct 1-based column arithmetic.
3. Implement a real two-state diff presentation (or drop the no-op control), and define duplicate-id handling.
4. Correct tree pre-order, add focused unit/E2E regressions, then rerun the three quality gates.

No delivery files were modified during this independent review.

## Round 2 — 2026-08-26

### Re-verified closed items

The claimed quality gates pass independently: **115/115 Vitest** across 9 files, `npm run build`, and **3/3 Playwright**. Browser checks also confirmed that a >5 MiB `stale` document no longer replaces an immediate small `fresh` edit, top-level `null` renders as one root row with Format enabled, localStorage-restored JSON produces its tree on reload, and disabling “只看差异” adds unchanged rows.

The following Round-1 findings are therefore closed: FE-12 (request generation/cancellation), FE-13 (top-level null + restored parsing), LIB-02 (1-based columns), FE-14 (functional only-diffs), LIB-03 (duplicate-id fallback), and UX-05 (normal-document pre-order). The corresponding unit tests are focused and meaningful.

### Verdict

**Request Changes.** The routine paths are now materially stronger, but a compact, valid deep document still breaks core query/tree functionality. The Round-2 recursion introduced in `TreeView` also regresses the original stack-based large-data approach.

### P1 — FE-15: deep valid JSON triggers a stack overflow

`JSON.parse` accepts an object nested 4,000 levels (about 24 KB of JSON). In contrast, both `query(value, '$.a…')` and `buildVisibleRows(value, allAncestorPaths)` throw `RangeError: Maximum call stack size exceeded`. `jsonpath.ts` recursively consumes one path segment per call (`:336-403`), and the new pre-order `TreeView` implementation recursively descends every expanded ancestor (`:51-101`). Query navigation normally expands matching ancestors, so this is not merely a test-helper limitation.

Restore iterative, explicit-stack traversal in `TreeView` while preserving pre-order; make exact-path JSONPath evaluation iterative as well. Add 4,000-level regression tests to both layers. This preserves compatibility with JSON accepted by the platform parser and removes the new call-stack ceiling.

### Remaining P2s

- **UX-06 — full diff list is not globally pre-order.** `compareTwo()` emits all change rows before `addUnchangedEntries()` appends clean rows. For a nested document with an unchanged parent, all-rows order can be `$.a | $.b.d | $.b | $.b.c | $.e`: child `$.b.d` appears before parent `$.b`. The new test filters to unchanged rows before asserting order, so it does not prove the displayed list is pre-order. Merge entries in one structural traversal.
- **QA-06 — browser regression coverage remains partial.** New hook/App/component tests cover large→small stale messages, restored state, null and traversal order; the 3 E2E scenarios still do not drive large→small replacement, restored localStorage, or top-level null in a real browser.
