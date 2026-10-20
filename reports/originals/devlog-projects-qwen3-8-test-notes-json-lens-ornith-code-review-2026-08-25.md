---
type: Note
title: "JSON Lens — Ornith 1.5 35B-A3B code review"
status: current
description: "Independent review of the JSON Lens model test: automated checks pass, but multiple explicit product requirements are absent from the delivered UI."
tags: [json-lens, code-review, qwen3.8, ornith, frontend, benchmark]
timestamp: 2026-08-25T16:52:38Z
---

# JSON Lens — Ornith 1.5 35B-A3B code review

[English](devlog-projects-qwen3-8-test-notes-json-lens-ornith-code-review-2026-08-25.md) | [简体中文](devlog-projects-qwen3-8-test-notes-json-lens-ornith-code-review-2026-08-25_CN.md)

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

## Scope and evidence

| Field | Value |
|---|---|
| Fixed prompt | `$HOME/Code/qwen3.8-tests/test-prompts/json-lens.md` |
| Reviewed delivery | `$HOME/Code/qwen3.8-tests/json-lens` |
| Generating model/session evidence | User screenshot: Ornith 1.5 35B-A3B Coding, Medium; 4 turns / 197 steps / 185m30s model time, 2m59s tools, 637K input + 12.4M cache + 211K output |
| Independent commands | `npm run build`; `npm test -- --run`; `npx playwright test` |

All three commands pass locally: production build succeeds, Vitest reports **158/158** tests across 10 files, and Playwright reports **3/3** tests. The build emits three CSS-minifier warnings because `src/index.css:154-156` uses `//` rather than CSS `/* ... */` comments. The unit run also logs a React `act(...)` warning from `src/smoke.test.tsx`.

## Verdict

**Request Changes — not accepted as the requested JSON Lens tool.** The foundations are solid: React/TypeScript/Vite, pure parse/query/diff helpers, local-only storage, a genuinely windowed tree, and passing automation. But the 3 E2E cases and unit suite do not exercise several mandatory user-facing behaviours; README claims those behaviours are present when their controls and integration paths do not exist. This makes the green suite insufficient evidence for the task's acceptance criteria.

## P1 findings

### FE-09 — Required daily-tool UI features are not implemented

`EditorPane` is only two textareas, a fix button, an indent radio group, and the “Show diffs only” checkbox (`src/components/EditorPane.tsx:77-238`). Although `parseJson` builds the required nearby-error snippet (`src/lib/parse.ts:110-119`), the editor displays only line/column, message, and causes (`EditorPane.tsx:126-139`), so the snippet never reaches the user. There are also no drag/drop handlers, format/compress/sort actions, or a path for applying those pure helpers. `formatJson`, `compressJson`, `sortKeys`, and `reparseEmbedded` exist only as library functions (`src/lib/utils.ts:41-121`), and no production UI imports or invokes them. Similarly, `VirtualTree` only copies `JSON.stringify(node.value)` when the *whole row* is clicked (`src/components/VirtualTree.tsx:144-153`); it has no separate “copy value” / “copy path” actions and cannot offer the required one-click embedded-JSON expansion.

This is not a cosmetic gap: several explicit prompt features are unavailable to a real user, despite README sections 1, 3, and 6 claiming they work.

### FE-10 — Large-file progress/cancellation acceptance is not met

For inputs above 5 MiB, `App` calls `parseInWorker`, but the visible UI only prints `Tree (N%)` and exposes no Cancel button (`src/App.tsx:39-46,141-149`). The worker sends only `0` immediately before a single atomic `JSON.parse`, then `100` afterward (`src/lib/parse.worker.ts:31-35`), so it cannot provide meaningful progress. On input changes, the effect only suppresses stale React state; it does not terminate the existing worker (`src/App.tsx:33-65`). `workerRunner` has no cancel handle either (`src/lib/workerRunner.ts:11-69`). The prompt explicitly requires a progress UI **and cancellation**, so the current lifecycle flag is not a functional substitute.

### FE-11 — Query navigation and diff-tree requirements are missing

`App` computes match paths but never updates `highlightedPath`; the “Run query” button is intentionally a no-op (`src/App.tsx:68-82,119-127`). `VirtualTree` can color a rendered match but cannot expand ancestors, scroll to, or step through hits (`src/components/VirtualTree.tsx:231-238`). This fails “Jump one by one”.

The diff side is a flat list of changed entries, not a JSON tree with three-color node markings (`src/components/DiffView.tsx:111-157`). `showDiffsOnly` changes only report boilerplate (`src/lib/report.ts:51-65`); it cannot filter a tree because no full diff tree exists. The required “Show only differences” control is therefore effectively meaningless in the displayed comparison.

## P2 correctness, accessibility, and test-quality findings

### LIB-01 — JSONPath cannot compare against `null`

`parseLiteral()` uses `null` both as the valid JSON literal and as the parse-failure sentinel (`src/lib/jsonpath.ts:102-134`); `parsePredicate()` then rejects it at `:177-180`. Direct check: `query({ a: [{ x: null }] }, "$.a[?(@.x == null)]")` returns `{ ok: false, error: { message: "Expected a literal value" } }`. The required simple-comparison subset should either support valid JSON literals consistently or document and test the deliberate restriction.

### LIB-02 — ID alignment silently conflates distinct/duplicate ids

`indexById()` normalizes ids with `String(id)` and keeps only the first entry (`src/lib/diff.ts:74-81`). Thus numeric `1` and string `"1"` align as the same id, and duplicate IDs lose later elements. For example, comparing `[{id:1,n:"a"},{id:1,n:"b"}]` to `[{id:1,n:"c"}]` with alignment enabled produces only a single change from `a` to `c`; the second source item disappears from the report. Either preserve primitive type in the key and report duplicate-id ambiguity, or fall back to index alignment with a visible warning.

### A11Y-02 — The stated button accessibility is not true

The prompt requires every button to have an accessible label, but the expand/collapse toolbar buttons and query/export buttons rely only on visible text (`src/App.tsx:119-127`; `src/components/VirtualTree.tsx:312-317`; `src/components/DiffView.tsx:75-88`). More importantly, the expand chevron is a `role="button"` nested inside another focusable `role="treeitem"` and has `tabIndex={-1}` (`src/components/VirtualTree.tsx:241-272`), which makes a control unavailable to keyboard focus. Rows also use `tabIndex={0}` for every rendered node rather than the roving-tabindex tree pattern.

### QA-05 — Tests prove narrow happy paths, not the claimed product

The three E2E tests cover repair/tree presence, DOM row count, and report text only (`playwright/json-lens.spec.ts:29-100`). They do not test drag/drop, nearby error snippet, utilities, embedded JSON expansion, worker cancellation/progress, copy path, query jumps, a diff tree/coloring, or actual download payloads. The smoke suite contains `expect(1 + 1).toBe(2)` (`src/smoke.test.tsx:12-14`) and produces an unhandled `act(...)` warning. README's assertion that all acceptance functionality is shipped is therefore materially overstated.

## Positive verification

- `parseJson` and `tryFix` are clean pure functions with focused tests; the repair scanner preserves valid quoted apostrophes.
- The tree is genuinely DOM-virtualized: after the provided 30,000-object generator is expanded (about 150,000 tree nodes), Playwright observes fewer than 200 rendered rows.
- `diff` recursively distinguishes added, removed, changed, and type-changed values for ordinary objects and index-aligned arrays; report export uses browser `Blob` download without network access.
- The project has no runtime fetch usage and the build is compact (main JS 170 kB; worker 0.36 kB before gzip).

## Acceptance path

1. Wire the missing editor/tree controls to the existing pure utilities; add drop handling, node-level copy buttons, and safe embedded-value expansion.
2. Give worker parsing a cancellable controller, visible progress state, and a cancel UI. Preserve stale-result protection but terminate superseded workers.
3. Implement query result navigation (including ancestor expansion + scrolling) and a virtualized/filtered diff tree with node-level diff classes.
4. Fix null-literal parsing and define duplicate/mixed-type id behavior; add regression tests.
5. Replace superficial E2E checks with the prompt's actual interactions, remove test warnings, correct CSS comments, and align README with verified behaviour.

No delivery files were modified during this independent review.

## Round 2 — 2026-08-25

The follow-up reports every review item resolved. Independent verification confirms real improvements, but **the verdict remains Request Changes**: three P1 acceptance paths still fail in the delivered browser app.

### Re-verified quality gates and closed library defects

| Command | Result |
|---|---|
| `npm run build` | pass; no CSS minifier warnings |
| `npm test -- --run` | **195/195** pass across 11 files; no React `act(...)` warning |
| `npx playwright test` | **3/3** pass |

`jsonpath` now represents a parsed literal separately from parse failure, and the `== null` regression suite passes (`json-lens/src/lib/jsonpath.ts:102-141`; `jsonpath.test.ts:274-321`). The id alignment fix rejects duplicate ids and keys unique ids by value **and type** (`json-lens/src/lib/diff.ts:55-157`; `diff.test.ts:273-321`). The smoke tautology is gone; CSS comments are valid; editor toolbar operations, drag/drop, copy controls and a cancellable streaming worker were materially added.

### P1 — FE-10 remains: two simultaneous large documents cancel each other

`App` starts `parseText("a")` and `parseText("b")` together in `Promise.all` (`json-lens/src/App.tsx:38-63`), but both calls are routed through the one module-global `parseController` (`lib/workerRunner.ts:121-132`). `ParseController.parse()` begins by cancelling the previous handle (`:38-39`), so B necessarily cancels an in-flight A worker.

Browser reproduction with two separately valid 8,628,914-character documents: after three seconds the Tree shows **“No JSON to display”** and the diff is `type-changed $: undefined → <B document>`. This is a data-loss failure for the central two-input Diff workflow. Use a controller/ref per pane (or parse both in a single multi-job controller), and add an E2E test with two >5 MiB inputs.

The replacement Worker parser is also no longer native `JSON.parse`: it calls the new custom `streamingParse` (`lib/parse.worker.ts:3-7,55-60`), contrary to the prompt's explicit native-parse requirement. Cancellation can be achieved by terminating a Worker around native parsing; if the custom parser is retained, the implementation needs an explicit product-level exception and broad parity/fuzz coverage.

### P1 — FE-11 remains: query navigation cannot locate a collapsed deep match

The new Next/Prev controls update `highlightedPath` (`src/App.tsx:102-121,160-179`), but `VirtualTree` only calls `scrollIntoView` if the target row already exists in `rowMapRef`; it neither expands ancestors nor sets a calculated scroll offset (`src/components/VirtualTree.tsx:168-176`).

Browser reproduction: load `{ "a": { "b": { "name": "needle" } } }`, query `$.a.b.name`, then choose Next. The only rendered rows remain `$` and `$.a`, both with an empty outline; no target receives focus. The existing app test only uses `"$[*]"`, where matches already render below the root (`src/App.test.tsx:38-70`). Query navigation must first expand every ancestor of the match, then lay out and scroll/focus the target.

### P1 — FE-11 remains: no Diff tree or functional “show diffs only” filter

`DiffView` is unchanged structurally: it maps `DiffEntry[]` into a flat flex list (`src/components/DiffView.tsx:111-157`). There is no `DiffTree`, hierarchy, virtualization, or unchanged-node rendering, so it cannot implement either tree-level three-colour markings or a filter that hides unchanged nodes. `showDiffsOnly` still only changes report text via `buildMarkdownReport` (`src/lib/report.ts:51-65`). Direct DOM inspection of a nested added/removed/changed example finds no diff-tree rows; it finds just three flat entry cards.

### Remaining P2s

- The required nearby error snippet is still constructed by `parseJson` but omitted from both editor error views (`src/lib/parse.ts:110-119`; `src/components/EditorPane.tsx:301-315,404-418`).
- README says all buttons have `aria-label`, but export buttons and the expand/collapse-all toolbar still lack one (`src/components/DiffView.tsx:75-88`; `VirtualTree.tsx:402-407`).
- The prompt calls for a localStorage-quota fallback **with a user notice**. `saveState` remains a silent catch and README now documents that silent behaviour (`src/lib/storage.ts:24-31`; `README.md:92`).
- The 3 original E2E cases still do not cover the new toolbar/drop/copy/cancel controls, two-large-input Diff, a deep query jump, or a Diff-tree/filter interaction (`playwright/json-lens.spec.ts:29-100`).

### Round 2 conclusion

The library fixes, warning cleanup, layout fix, and newly added editor/tree controls are accepted. Do **not** mark FE-10/FE-11 or final task acceptance complete until the three P1 browser reproductions above are fixed and covered by end-to-end tests.

## Round 3 — 2026-08-26

### Independent verification

| Command | Result |
|---|---|
| `npm run build` | pass |
| `npm test -- --run` | **223/223** pass across 15 files |
| `npx playwright test` | **5/5** pass |

The reported functional remediations are real:

- `App` has controller instances per source (`json-lens/src/App.tsx:29-36`). In a headless browser I loaded two separately valid **5,244,955-character** JSON documents at once; A rendered in the tree and the Markdown diff correctly reported only `$.marker: "A" → "B"`. The prior cross-cancellation reproduction no longer occurs.
- Querying `$.a.b.name` against `{a:{b:{name:"needle"}}}` and pressing Next renders `$`, `$.a`, `$.a.b`, and `$.a.b.name`; the target gets the blue outline and DOM focus. The two-stage ancestor-expand / centering logic in `VirtualTree.tsx:168-222` works.
- The hierarchical diff view and show-diffs-only pruning work in both source and browser checks (`DiffView.tsx:70-257`, `diffTree.ts`). A nested clean container becomes visible only in full mode and materializes its child on toggle. Error snippets and the dismissible storage warning are also present and covered by unit/E2E cases.

### Remaining P1 — the Worker no longer uses the required native parser

The fixed prompt explicitly requires parsing with native `JSON.parse`. Normal-size documents still use it through `parseJson`, but every >5 MiB document uses the custom `streamingParse` implementation (`json-lens/src/lib/parse.worker.ts:3-7,55-60`), which is a distinct parser with its own syntax/semantic compatibility surface. This was introduced to make byte-level progress and cooperative cancellation possible, but it does not meet that technical requirement.

To close this strictly, keep native `JSON.parse` in the Worker and cancel by terminating/replacing the Worker. A determinate in-parse percentage cannot honestly coexist with an atomic native parse; the UI may instead show an indeterminate parsing state, or the prompt requirement must be explicitly waived. The current custom parser has useful targeted tests but no differential/fuzz suite demonstrating parity with `JSON.parse` over the full JSON grammar.

### Remaining P2s

- The claimed 5 E2E scenarios do not exercise the two-large-document path, deep query jump, Worker cancellation/progress, drop/copy controls, or actual download payloads (`json-lens/playwright/json-lens.spec.ts:29-158`). The related unit tests are useful but do not replace browser coverage of the integration paths.
- The prompt asks for `aria` labels on all buttons. The export controls, Run Query, and tree Expand/Collapse-all buttons still have text names but no explicit `aria-label` (`components/DiffView.tsx:132-145`; `App.tsx:213-221`; `VirtualTree.tsx:402-407`).
- Only A's parse progress is displayed (`App.tsx:255-284`). A B-only large parse activates Cancel but provides no visual B progress.

### Round 3 verdict

**Request Changes under the fixed prompt, with one remaining P1.** All three functional blockers from Round 2 are closed and the implementation has materially improved. If native `JSON.parse` is waived for cancellable streaming parsing, the remaining issues are P2 QA/accessibility polish and the functional verdict would become approve.
