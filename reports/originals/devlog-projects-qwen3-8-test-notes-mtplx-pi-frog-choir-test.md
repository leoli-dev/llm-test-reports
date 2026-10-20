---
type: Note
title: "MTPLX Qwen3.8 Optimized Quality — Pi frog-choir test"
status: current
description: "Pi coding-agent frog-choir run was initially interrupted by MTPLX, later claimed complete, but independent Round 1 review found four core functional defects."
tags: [mtplx, qwen3.8, pi, qwen-code, frog-choir, benchmark]
timestamp: 2026-08-23T23:25:22Z
---

# MTPLX + Pi `frog-choir` test

[English](devlog-projects-qwen3-8-test-notes-mtplx-pi-frog-choir-test.md) | [简体中文](devlog-projects-qwen3-8-test-notes-mtplx-pi-frog-choir-test_CN.md)

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

## Scope

| Field | Value |
|---|---|
| Fixed prompt | `$HOME/Code/qwen3.8-tests/test-prompts/frog-choir.md` |
| Pi work directory | `$HOME/Code/qwen3.8-tests/frog-choir_mtplx-quality-pi` |
| Primary agent | Pi (`@earendil-works/pi-coding-agent`) via local OpenAI-compatible MTPLX endpoint |
| Model served by MTPLX | `mtplx-qwen38-27b-optimized-quality` — Qwen3.8 27B Optimized Quality |
| MTPLX runtime | 2.9.1 / build 2009009; `qwen3_next`, MTP `quality` profile, 131,072-token context, reasoning/thinking off |
| Quantization | model weights INT8 (group size 64); MTP head INT8; paged KV cache q8 — **not 4-bit** |
| Planned verification | implementation plan, project implementation, Playwright checks, then TypeScript/build verification |

## Pi run outcome

Pi completed a substantial portion of the implementation and ran `npm run build`. The build reported four TypeScript categories to fix:

- unused `TrackerStatus` import in `src/App.tsx`;
- unsupported `orientation` attribute on an input in `src/components/DemoPanel.tsx`;
- unused `HandSide` import in `src/vision/HandTracker.ts`;
- unused `wrist` local in `src/vision/HandTracker.ts`.

Pi began the next turn to make those four mechanical edits. After 165 streamed completion tokens, the response terminated with:

```text
request cancelled via POST /v1/mtplx/cancel after 165 streamed tokens
```

Server request log evidence: 30,798 prompt tokens, 165 generated tokens, 20.072 s elapsed, `request_cancelled: true`, `cancellation_reason: stream_cancelled`.

> ⚠️ Update, 2026-08-23: Pi later continued and reported the project complete with build, 25 unit tests and 10 Playwright tests passing. An independent Round 1 review found that the actual camera path, Web Audio output, handedness mapping, and calibration still do not meet the task. See [Round 1 review](devlog-projects-qwen3-8-test-notes-frog-choir-round-1-review.md); the task is not accepted.

## What the investigation established

This was an MTPLX explicit cancellation path, not a clean model completion and not a Pi HTTP disconnect: the MTPLX cancellation handler was invoked while the Pi stream transport was still present. The caller that sent the local `POST /v1/mtplx/cancel/{request_id}` has not yet been identified, so it is incorrect to label the root cause a Pi configuration problem.

Controls after restarting the service:

| Control | Result | Limit |
|---|---|---|
| Pi, ~27.8K prompt-token long-context continuation without tools | completed: 374 completion tokens / 63.47 s | does not reproduce tool continuation |
| Pi, ~30.1K prompt-token continuation with tools exposed | completed: 317 completion tokens / 80.71 s | model answered directly instead of invoking a tool; not a full post-tool reproduction |
| Qwen Code 0.22.0, same MTPLX model | smoke test completed with `enable_thinking: false` | identical `frog-choir` run is pending |

For recurrence attribution, the local MTPLX runtime now has a temporary diagnostic-only audit at `~/.mtplx/logs/cancel-audit-8000.jsonl`, logging the caller headers of the cancel endpoint. No lasting Pi extension policy change was retained. The diagnostic service restart interrupted the original active Pi session, so it must not be treated as a continuation test.

## Relation to upstream issues

[MTPLX #310](https://github.com/youssofal/MTPLX/issues/310) reports a Pi tool-round tensor broadcast-shape crash near 19K sequence tokens; [#311](https://github.com/youssofal/MTPLX/issues/311) reports a raw-CSS `!` repetition loop near an 8,192-token boundary. They share the Qwen3.8 + Pi + tool-continuation area, but neither failure signature occurred here. This run showed an explicit cancel request instead. The issues are useful context, not a proven match.

## Speed record from the supplied Dashboard snapshot

The screenshot is a shared MTPLX Dashboard snapshot while the model had 71K / 131K context and 86.3 GB / 128 GB memory in use:

| Metric | Observed value |
|---|---:|
| 5-minute stable decode range | 18.3–21.4 TPS |
| 5-minute average decode | **19.9 TPS** |
| instantaneous decode | 17.6 TPS |
| prefill average | 132 TPS |
| all-time max decode | 67.4 TPS |

Record **19.9 TPS** as the current 5-minute Dashboard average only. It is not the isolated average speed of the interrupted `frog-choir` request: the Dashboard includes a long, cached, shared runtime state (3.22M cached tokens), whereas the failed request lasted about 20 seconds and did not finish.

## Next evidence needed

See BENCH-03 (historical local file, not released with this report): run the exact prompt from new independent directories with Qwen Code first and Pi second; retain request-level token/timing records and the cancel audit file if cancellation recurs.
