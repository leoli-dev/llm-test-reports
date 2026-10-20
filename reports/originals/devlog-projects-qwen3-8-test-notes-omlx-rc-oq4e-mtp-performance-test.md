---
type: Note
title: "oMLX RC + Qwen3.8-27B-oQ4e-mtp performance test"
status: current
description: "Active runtime-observation scope for the oMLX RC test of Qwen3.8-27B-oQ4e-mtp, with a repeatable comparison plan."
tags: [qwen3.8, omlx-rc, oq4e, mtp, performance, benchmark]
timestamp: 2026-08-22T21:05:06Z
---

# oMLX RC + Qwen3.8-27B-oQ4e-mtp performance test

[English](devlog-projects-qwen3-8-test-notes-omlx-rc-oq4e-mtp-performance-test.md) | [简体中文](devlog-projects-qwen3-8-test-notes-omlx-rc-oq4e-mtp-performance-test_CN.md)

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

Observe actual coding-agent behavior with local oMLX RC (Dashboard v0.6.3rc2) and `Qwen3.8-27B-oQ4e-mtp`, cautiously comparing archived snapshots of earlier Qwen3.8 configurations. The workspace is `$HOME/Code/qwen3.8-tests`.

A controlled comparative benchmark has not yet been completed: Dashboard figures mix caching and multiple requests. Firm conclusions require repeated measurements with the same prompt and agent/profile, cold/cleared caches and independent sessions.

## First session snapshot（2026-08-22）

The user-provided Dashboard screenshot shows `Generating...`: the active request has generated approximately 1.4k tokens over 1 minute 13 seconds, with an instantaneous speed of **18.6 tok/s**. Session totals are:

| Metric | Observation | Interpretation |
|---|---:|---|
| Total prefill | 216,363 tokens | Cumulative for this session, not the length of one context. |
| Cached tokens | 151,552 | Cache efficiency is 70.0%. |
| Uncached prompt processing | 528.5 tok/s | Input-prefill throughput; do not confuse it with decoding speed. |
| Session token generation | 42.4 tok/s | Weighted session average, affected by short requests and cached workflows. |
| Active-request generation | 18.6 tok/s | Closer to the immediate experience of this long output, but still requires stable-window measurements and repetition. |
| Model memory | Approximately 25.84 GB observed / 16.60 GB estimated | Dashboard record; total model pool approximately 30.4 GB. |

## Preliminary interpretation

- The **42.4 tok/s session average** looks faster than the previously archived 27B long-session observations of approximately 17.4–20 tok/s generation. It cannot quantify a speedup directly because session composition, cache hits and task stages differ.
- The active request at **18.6 tok/s** is near the earlier long-session range. Same-task, cold-cache, individual-request statistics are needed to establish actual oQ4e-mtp / RC decoding gains.
- Uncached prefill at 528.5 tok/s and 70% cache efficiency indicate good input-side performance in this run. They matter for overall agent latency but cannot replace generation-speed comparisons.

## Recording and acceptance plan

1. Retain the Dashboard screenshot and the completed active request results: output tokens, duration, stable decoding speed and errors/interruptions.
2. Choose one fixed coding prompt and run it at least 3 times in new sessions; record TTFT, uncached prefill, completion tokens, wall time, stable generation tok/s and peak memory.
3. Rerun the older model with the same agent, profile, context/output limits and concurrency. Report cold- and warm-cache results separately rather than conflating their averages with differences in model capability.

## Evidence

- User screenshot: `/var/folders/73/34m822xx0j56plz6t32f_s3c0000gn/T/codex-clipboard-2a6e8b21-7e6e-472f-893f-46783d9de97e.png`。
- Runtime process check: `omlx-server` used approximately 17 GB resident memory on 2026-08-22; Qwen Code CLI was running. This confirms that the service was active and is not a throughput benchmark.

