# Hermes Cafe POS / Config B

[English](session-cafe-pos-config-b.md) | [简体中文](session-cafe-pos-config-b_CN.md)

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

## Original review record 973

Config B review is complete and saved.

Verification results:

```text
project: $HOME/Code/hermes-eval-local-cafe-pos
npm test -- --verbose: pass, 23/23
npm run build: pass, no warnings
git repo: not initialized
```

Clear improvements over Config A:

- The build is clean, without Config A's type-only import warnings.
- The checkout path without a discount works: order amounts, stock and the order list basically function end to end.
- The project structure is more direct: JS + React + Vite, with less TypeScript configuration noise.
- UI/function coverage is closer to an actually usable app.

One critical bug remains:

Discount codes affect the cart display but do not reach checkout.

In Cart.jsx (historical local file; not published with this report), `appliedCode` is internal Cart component state.  
However, App.jsx (historical local file; not published with this report) calls only this at checkout:

```text
checkout(cart, productMap, stock, orders)
```

Then cart.js (historical local file; not published with this report) uses:

```text
calculatePricing(cart, productMap, null)
```

The cashier sees the `SAVE10` discount in the cart, but the receipt/order/sales summary after checkout records the **undiscounted amount**.

Scores:

```text
requirement_coverage: 8
functional_correctness: 7
ux_product_fit: 7.5
code_quality: 7
tests_verification: 6.5
constraint_following: 8
autonomy_recovery: 7
overall: 7.3
```

Record saved:

config-b-fromzero-01-local-cafe-pos.md (historical local file; not published with this report)

Committed as:

```text
6e9893c Record Config B from-zero POS evaluation
```

Current assessment: **Config B > Config A**.  
A builds something large and substantial, but its core checkout amounts are broken. B is cleaner and closer to a usable main flow, with discount integration still missing.

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
