# Hermes Cafe POS / Config A

[English](session-cafe-pos-config-a.md) | [简体中文](session-cafe-pos-config-a_CN.md)

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

Source: an independent review preserved in the original conversation. The original report/source directory was not located during this retrieval. The text below is an excerpt of the historical report message, not a new evaluation.

## Original review record 847

I completed the review and saved the record. Conclusion: **this from-zero test is much more informative than the earlier one and exposes Config A's real problem: it can produce the shape of a complete project, but integration correctness is unreliable.**

Verification results:

```text
project: $HOME/Code/hermes-eval-local-cafe-pos
npm test: pass, 24/24
npm run build: pass, but with many Vite/Rollup warnings
npx tsc --noEmit: pass
git repo: not initialized
```

The biggest issue: **the actual checkout flow is broken.**

In App.tsx (historical local file; not published with this report), UI checkout calls:

```text
checkout(cart, 0, 0, appliedDiscountCode, 0, products)
```

This passes `0` for subtotal / discount / tax. However, `checkout` in cart.ts (historical local file; not published with this report) does not recalculate those values internally; it creates the order directly from the arguments.

The cart panel may display the correct amount, but the receipt / order / sales summary produced after checkout can contain `$0.00` or incorrect amounts.

Other issues:

- All 24 tests pass, but they cover only domain helpers rather than the real React workflow, so they miss the main bug.
- README is still the default Vite template rather than project documentation.
- The build has many type-only import warnings, although `tsc --noEmit` passes.
- Hermes's final claim that everything is implemented is too optimistic.

Recorded scores:

```text
requirement_coverage: 7.5
functional_correctness: 5.5
ux_product_fit: 7
code_quality: 6.5
tests_verification: 5.5
constraint_following: 8
autonomy_recovery: 6.5
overall: 6.5
```

Saved in the evaluation log:

config-a-fromzero-01-local-cafe-pos.md (historical local file; not published with this report)

Committed as:

```text
275aa59 Record Config A from-zero POS evaluation
```

This round is valuable because it catches a real product-path bug beyond the passing tests.

## Original review record 1405

For this single **from-zero POS task**, this round of testing can be considered complete for now.

The current findings are clear:

```text
E 7.5  temp 0.3, ctx 200k, max_tokens 32768, rep_penalty 1.05
D 7.4  temp 0.6, ctx 200k, max_tokens 32768, rep_penalty 1.05
B 7.3  temp 0.7, ctx 131k, max_tokens 16384
A 6.5  temp 0.1, ctx 131k, max_tokens 8192
C 6.2  temp 0.6, top_p 0.95
```

Provisional sweet spot:

```text
ctx_window: 200000
max_tokens: 32768
temperature: 0.3
top_p: 0.8
top_k: 20
min_p: 0.0
rep_penalty: 1.05
enable_thinking: false
TurboQuant KV Cache: false
DFlash: false
```

My interpretation:
- `temp 0.1` is too conservative: it can be mechanical while missing integration.
- `top_p 0.95` was clearly worse in this round, with more scattered behavior.
- `rep_penalty 1.05 + 大 max_tokens + 200k ctx` points in the right direction.
- `temp 0.3` is slightly steadier than `0.6`, but the margin is small: E beats D by only 0.1 points.

Only two types of follow-up remain untested:
- Performance/stability switches: TurboQuant KV Cache / DFlash.
- Replication with another task type, such as extending an existing complex codebase rather than starting from zero.

If stopping for the day, E can serve as the default based on these findings.
