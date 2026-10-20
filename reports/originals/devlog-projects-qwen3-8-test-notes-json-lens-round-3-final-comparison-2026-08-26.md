---
type: Note
title: "JSON Lens — Round 3 final review and Qwen vs Ornith comparison"
status: current
description: "Same-prompt final comparison of Qwen 3.8 27B and Ornith 1.5 35B-A3B JSON Lens deliveries; both pass declared gates but neither meets final acceptance."
tags: [json-lens, qwen3.8, ornith, code-review, benchmark, round-3]
timestamp: 2026-08-26T15:39:18Z
---

# JSON Lens — Round 3 final review and model comparison

[English](devlog-projects-qwen3-8-test-notes-json-lens-round-3-final-comparison-2026-08-26.md) | [简体中文](devlog-projects-qwen3-8-test-notes-json-lens-round-3-final-comparison-2026-08-26_CN.md)

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

## Scope and method

The same fixed JSON Lens prompt (historical local file, not distributed with this report) was used for both browser-only React/TypeScript/Vite deliveries:

| Delivery | Model / run | Directory |
|---|---|---|
| Qwen | MTPLX Qwen 3.8 27B Optimized Quality — Coding Stable | `$HOME/Code/qwen3.8-tests/json-lens-qwen` |
| Ornith | Ornith 1.5 35B-A3B Coding, Medium | `$HOME/Code/qwen3.8-tests/json-lens` |

This note continues Qwen's Round 1–2 review and compares the two projects after three review cycles. It uses source inspection, the existing [Ornith Round 1–3 review](devlog-projects-qwen3-8-test-notes-json-lens-ornith-code-review-2026-08-25.md), declared-gate reruns, and additional adversarial probes. A passing narrow test suite is counted as evidence for its tested behaviour, not as proof of every fixed-prompt requirement.

## Independent gate results

| Project | Build | Unit tests | Playwright |
|---|---:|---:|---:|
| Qwen | `tsc -b && vite build` pass; 38 modules, 187.18 kB JS | 120/120, 10 files | 6/6 pass |
| Ornith | `tsc --noEmit && vite build` pass; 44 modules, 182.80 kB JS | 223/223, 15 files | 5/5 pass |

Ornith's checks were rerun for this comparison. Qwen's same three gates were independently rerun immediately before this Round 3 review. Neither project was modified.

## Qwen Round 3 review

### What Round 2 genuinely fixed

The iterative TreeView traversal and exact-path JSONPath evaluation do handle the previously failing ordinary 4,000-level document. The global pre-order diff regression is also fixed for ordinary inputs, and the delivered E2E suite now includes the earlier stale large-to-small, localStorage-restore, and top-level-`null` cases.

### P1 — deep documents still crash the diff workflow

The deep-document repair is incomplete. `diff()` still recursively calls `isIdentical()` (`src/lib/diff.ts:52-72`), `collectChangedPaths()` (`:90-176`), and `emit()` (`:194-349`). Two independently constructed 4,000-level `{a: ...}` values, with different leaf values, throw `RangeError: Maximum call stack size exceeded` with both default options and `{ includeUnchanged: true }`. The exception begins in `isIdentical` when unchanged rows are requested; the other two recursive passes retain the same ceiling for the normal diff path.

This is a core feature failure for JSON which the platform parser accepts. Replace the complete diff pipeline with explicit frames/work stacks and add identical, changed, object, and array depth regressions.

### P1 — the new path-prefix tree breaks valid keys and permits prototype pollution

The Round 2 TreeView optimisation reconstructs segments by splitting display paths on `.` and `[` (`src/components/TreeView.tsx:152-209`). That representation is not reversible for legal JSON object keys:

- `{"a.b":{"child":1}}` and `{"a[0]":{"child":1}}` cannot show `child` after their parent is expanded.
- `{"#":{"child":1}}` overwrites the same `'#'` completion marker used for the root path, leaving only `$` visible.
- `JSON.parse('{"__proto__":{"child":1}}')` makes the plain-object segment dictionary follow the inherited `__proto__` property; storing its `'#'` marker mutates `Object.prototype['#']` in the page realm.

Use raw segment arrays carried by the tree model, or a fully reversible JSONPath encoding. Use `Map` (preferred) or null-prototype objects for segment storage and an explicit boolean completion field rather than the user-key-colliding `'#'` property. Add all four examples above as regressions. The same display-path construction is also ambiguous for copy/query/diff paths containing punctuation keys.

### P1 — Diff mode bypasses the >5 MiB Worker/cancel contract and lacks a diff tree

Only view mode uses `useParse`. In Diff mode, both textareas are synchronously parsed inside render-time `useMemo` calls (`src/App.tsx:65-68,262-311`), so either >5 MiB input can block the UI and has neither progress nor cancellation. This conflicts with the prompt's large-file requirement precisely in the two-document comparison workflow.

In addition, `DiffView` maps `DiffEntry[]` directly to flat rows (`src/components/DiffView.tsx:47-102`). The implementation provides coloured entries and a functional unchanged filter, but not the requested hierarchical diff tree / node markings. Ornith implements that missing product surface; Qwen does not.

### P2 — acceptance E2E is still too narrow

The test named “100k” supplies 10,000 keys, not 100,000, because browser `fill()` times out (`e2e/jsonlens.spec.ts:48-55`). The stale-worker test also uses 10,000 keys, far below the 5 MiB threshold, so it cannot exercise the Worker path it claims to cover (`:216-257`). No E2E covers special-key expansion, actual Worker cancellation/progress, drag-and-drop (which is not implemented in `InputPanel.tsx`), large diff mode, query navigation, copy actions, or download bytes.

### Qwen Round 3 verdict

**Request Changes.** The routine document path is good and the original Round 1 P1s were substantively addressed, but the current delivery introduces a local prototype-pollution vulnerability, breaks ordinary JSON keys, and still fails deep/large diff work. It is not ready for final acceptance.

## Unified Ornith recheck

The existing [Ornith review](devlog-projects-qwen3-8-test-notes-json-lens-ornith-code-review-2026-08-25.md) already records the significant Round 3 improvements: separate A/B parse controllers, deep query navigation, a real diff tree/filter, friendly snippets, and quota notice. It correctly keeps a P1 open because >5 MiB parsing uses custom `streamingParse` rather than the prompt's mandated native `JSON.parse` (`src/lib/parse.worker.ts:1-7,55-60`).

This comparison adds one unified deep-data finding that was not covered by its prior Round 3 tests: `buildTree()` recursively descends with `walk()` (`src/lib/tree.ts:52-121`) and its `diffValues()` is recursive (`src/lib/diff.ts:198-300`). The same independently constructed 4,000-level JSON causes `RangeError` in both `buildTree(a)` and `diff(a, b)`. Therefore Ornith also remains **Request Changes**, now with two P1 classes: native-parser non-compliance and deep tree/diff stack overflow.

There is also a root-`null` display regression: parse success is folded into the `JsonValue | null` no-document sentinel (`src/App.tsx:19-20,62-79`), then `VirtualTree` substitutes `{}` and renders its empty state for `value === null` (`src/components/VirtualTree.tsx:55-59,456-465`). Query also runs against `{}` through `parsedA ?? {}`. This is P2 for the prompt's normal document UI, but it is a concrete area where Qwen's Round 2 fix is better.

## Scorecard

Scores are out of 10 and are comparative quality scores, not release approvals. The weighted total intentionally keeps hard acceptance blockers visible rather than letting test volume mask them.

| Dimension (weight) | Qwen 3.8 27B | Ornith 1.5 35B-A3B | Evidence-based comparison |
|---|---:|---:|---|
| Fixed-prompt feature coverage (30%) | 5.5 | 8.0 | Qwen implements most everyday controls but lacks drag/drop and a hierarchical diff view, and sends Diff-mode large files through the main thread. Ornith implements the fuller editor, copy, query-navigation and diff-tree surface. |
| Correctness & security (25%) | 3.0 | 5.5 | Qwen's deep diff failure plus valid-key regression and `__proto__` prototype pollution are severe. Ornith has no equivalent pollution/path issue found, but its deep tree/diff paths still overflow. |
| Large-data behaviour (15%) | 6.0 | 5.5 | Qwen's view Worker keeps native parsing and its tree/query depth fix is real, but Diff mode has no worker. Ornith has cancellable two-pane workers/progress but replaces the required native parser and eagerly builds a recursive full tree. |
| Tests & verification (15%) | 6.0 | 8.0 | Qwen: 120 unit / 6 E2E, but two named large-data E2Es do not reach their thresholds. Ornith: 223 unit / 5 E2E with substantially broader component coverage, though several browser integrations and deep stress remain untested. |
| Maintainability & accessibility (15%) | 6.5 | 7.5 | Qwen is compact and labels controls, but the ad-hoc path parser/marker dictionary is fragile. Ornith is more modular and has roving tree focus, with remaining explicit-aria-label polish. |
| **Weighted quality score** | **5.0 / 10** | **7.0 / 10** | **Neither is accepted; Ornith is materially closer.** |

## Final comparison conclusion

**Ornith 1.5 35B-A3B wins this three-round task on overall product completion and test evidence.** Its third-round code delivers the larger share of the requested daily-tool experience: dual large-input lifecycle handling, query navigation, a diff tree, functional filtering, editor integration, and a substantially broader regression suite.

**Qwen 3.8 27B has two meaningful strengths:** it retained native `JSON.parse` for its Worker path, and its final iterative TreeView/JSONPath work solves the ordinary 4,000-level navigation case that Ornith still fails. But its Round 3 optimisation traded that gain for a correctness and security regression, and its Diff mode remains structurally less complete. The raw green gate count should therefore not be interpreted as a win for Qwen.

For a strict acceptance rerun, Ornith first needs native Worker parsing (or an explicit requirement waiver) plus iterative deep tree/diff traversal. Qwen first needs a safe canonical path representation, non-recursive diffing, Worker-backed two-pane Diff parsing, and the missing hierarchical diff/drag-drop interactions. Until then, both results are informative coding-agent outputs, not accepted JSON Lens deliveries.
