---
type: Note
title: "Frog Choir — independent Round 2 review"
status: current
description: "Round 2 restores the camera/audio/calibration paths and all automated checks pass, but real-device evidence shows the current handedness swap is reversed."
tags: [frog-choir, code-review, mediapipe, web-audio, qwen-code, mtplx]
timestamp: 2026-08-24T03:13:46Z
---

# Frog Choir — Round 2 independent review

[English](devlog-projects-qwen3-8-test-notes-frog-choir-round-2-review.md) | [简体中文](devlog-projects-qwen3-8-test-notes-frog-choir-round-2-review_CN.md)

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

Re-reviewed `$HOME/Code/qwen3.8-tests/frog-choir_mtplx-quality-pi` after the Round 1 remediation. The user supplied a real-device screenshot showing a working camera preview, hand skeleton, live state, stage, and controls. The same real-device test establishes that the detected left/right mapping is reversed.

Independent automated verification:

| Command | Result |
|---|---|
| `npm run build` | pass |
| `npm test` | 35/35 pass across 7 files |
| `npm run e2e` | 11/11 pass |

## Round 1 remediation status

| ID | Status | Evidence |
|---|---|---|
| FE-05 — blank granted camera | fixed | pending stream attaches from the `CameraPreview` mount callback; mocked-camera Playwright test verifies `srcObject`, ready frame, and expected pixels. `src/hooks/useCamera.ts:23-31`; `src/components/CameraPreview.tsx:12-21`; `e2e/frog-choir.spec.ts:197-243`. |
| FE-06 — continuous machine buzz | fixed in code; user reports only handedness remains | `CroakEngine` now schedules finite double-ribbit gain envelopes and stops each oscillator; 5 dedicated unit tests assert silence below threshold, envelope, rate, mute, and disposal. `src/lib/croak.ts:1-170`; `src/lib/croak.test.ts`. |
| FE-08 — shared/non-effective calibration | fixed | hook stores independent `userLeft` / `userRight` calibration state and refs; dedicated tests cover distinct ranges and no overwrite. `src/hooks/useHandTracking.ts:42-78,188-223`; `src/hooks/useHandTracking.calibration.test.ts`. |
| QA-04 — missing camera/audio boundary coverage | materially closed | 3 camera-hook tests, 5 audio tests, and mocked-stream E2E added; automated checks now cover the former blank-preview failure. This does not replace device-specific manual acceptance. |

## Remaining P1: true-device handedness is reversed

The current implementation explicitly swaps MediaPipe labels:

| Incoming label | Current target | Real-device expected target |
|---|---|---|
| `Left` | `userRight` / low part | `userLeft` / high part |
| `Right` | `userLeft` / high part | `userRight` / low part |

Evidence is stronger than the prior documentation-based assumption: on the user's actual camera pipeline, a physical left hand appears in the expected mirrored preview location but drives the right/low state. The correct next change is deliberately small: remove the label swap in `src/lib/handMapping.ts:16-24`, update `src/lib/handMapping.test.ts`, rerun the three automated commands, then manually test each hand separately.

The current mapping unit test is circular: it asserts the same swapped mapping that production implements, which is why all 35 unit tests pass while the real device fails. It must be changed with the implementation.

## Verdict

**Request Changes — one P1 remaining.** Camera, sound, calibration, build, unit tests, and E2E have materially improved and the user confirms the main interaction now runs. Do not mark final acceptance until a single-hand real-device check confirms left→high and right→low.
