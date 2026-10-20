# Hermes Cafe POS / Config C

[English](session-cafe-pos-config-c.md) | [简体中文](session-cafe-pos-config-c_CN.md)

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

## Original review record 1085

Config C review is complete and saved.

Verification:

```text
npm test: pass, 22/22
npm run build: pass
build warnings: none
git repo: not initialized
```

Conclusion: **Config C is worse than B.**

Main issues:

1. **Discounted checkout is still broken**
   
   Cart.jsx (historical local file; not published with this report) emits `discountCode`:

   ```text
   pos-checkout { cart, discountCode }
   ```

   But App.jsx (historical local file; not published with this report) does not pass it to checkout when receiving the event. Ultimately cart.js (historical local file; not published with this report) still uses:

   ```text
   calculatePricing(cart, productMap, null)
   ```

   The receipt / orders / summary therefore all lose the discount.

2. **Stock-state synchronization is worse**

   `App.jsx` has its own `stock`, while ProductCatalog.jsx (historical local file; not published with this report) separately calls `loadStock()` into local state. App updates stock after checkout, but ProductCatalog does not update live.

   Stranger still, Cart.jsx (historical local file; not published with this report) reads:

   ```text
   window.__posStock
   ```

   Nothing in the project sets this value. The actual stock limit may use old demo stock.

3. **The CustomEvent architecture fragments state**

   Its own report acknowledges using window CustomEvent. This spreads state across ProductCatalog / Cart / App / Orders / Receipt / Summary, each listening for events, making synchronization easy to miss.

4. **The report is too optimistic**

   It claims “all spec requirements implemented,” but discounted checkout and live stock sync are incomplete. README is also still the Vite template.

Scores:

```text
requirement_coverage: 7
functional_correctness: 5.8
ux_product_fit: 6.8
code_quality: 5.5
tests_verification: 5.8
constraint_following: 7.5
autonomy_recovery: 6
overall: 6.2
```

Saved:

config-c-fromzero-01-local-cafe-pos.md (historical local file; not published with this report)

Committed as:

```text
330271f Record Config C from-zero POS evaluation
```

Provisional current ranking:

```text
Config B: 7.3  最好
Config A: 6.5
Config C: 6.2  不推荐
```

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
