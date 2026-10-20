# Hermes Cafe POS / Config E

[English](session-cafe-pos-config-e.md) | [简体中文](session-cafe-pos-config-e_CN.md)

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

## Original review record 1397

Yes, that response is exceptionally detailed and shows more self-auditing than earlier rounds. Recorded evaluation: **Config E = 7.5/10, provisionally first**.

Strengths:
- `npm test` passes 22/22 and `npm run build` passes.
- The discount flow is the best so far: input values and applied discounts are separate, and checkout uses validated `appliedDiscount`, avoiding B/C's lost discounts.
- UI uses inline style, so it avoids D's missing import for the written `App.css`.
- Code structure is more modular than D.

Main issues:
- **Sales Summary computes incorrect amounts**: `grossRevenue` uses the final total, while `netRevenue` subtracts the discount again, mixing tax into revenue and deducting the discount twice.
- Reset has a `clearOrders` hook available, but App directly deletes localStorage and reloads, which is crude.
- No `README.md`.
- Tests still mainly simulate pure logic and do not cover real UI checkout / summary integration.

Saved: $HOME/Code/hermes-agent-eval-log/evaluations/2026-05-27/config-e-fromzero-01-local-cafe-pos.md (historical local file; not published with this report)  
Committed: `d008ce6 Record Config E from-zero POS evaluation`

Current ranking:

```text
E 7.5
D 7.4
B 7.3
A 6.5
C 6.2
```

Lower-temperature E leads by a small margin and seems steadier, with fewer missed integration connections, although business details are still wrong.

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
