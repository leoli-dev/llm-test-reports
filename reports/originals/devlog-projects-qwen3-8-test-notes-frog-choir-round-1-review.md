---
type: Note
title: "Frog Choir — independent Round 1 code review"
status: outdated
description: "Historical Round 1 rejection; its camera, audio, calibration, and automated-coverage findings were resolved in Round 2, leaving one empirical handedness mapping defect."
tags: [frog-choir, code-review, mediapipe, web-audio, pi, mtplx]
timestamp: 2026-08-24T03:13:46Z
---

# Frog Choir — Round 1 independent review

[English](devlog-projects-qwen3-8-test-notes-frog-choir-round-1-review.md) | [简体中文](devlog-projects-qwen3-8-test-notes-frog-choir-round-1-review_CN.md)

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

## Scope and verification

Reviewed `$HOME/Code/qwen3.8-tests/frog-choir_mtplx-quality-pi` against the fixed prompt at `$HOME/Code/qwen3.8-tests/test-prompts/frog-choir.md`, after Pi reported completion. Independent commands passed:

| Command | Result | What it proves |
|---|---|---|
| `npm run build` | pass | TypeScript and Vite can build |
| `npm test` | 25/25 pass | pure mapping, smoothing, height, and presence helpers |
| `npm run e2e` | 10/10 pass | landing page and demo-slider path only |

The user then performed the required real-browser test: camera permission was granted but the preview stayed blank; the two frog parts emitted a continuous machine-like buzz rather than frog calls. Source inspection confirms both observations.

## Findings

| ID | Severity | Evidence | Why it fails |
|---|---|---|---|
| FE-05 | P1 | `src/hooks/useCamera.ts:38-42`; `src/App.tsx:42-45`; `src/components/CameraPreview.tsx:14-21` | `getUserMedia()` resolves while the app is still on the landing screen, so `videoRef.current` is null and `srcObject` is never attached. The video element mounts only after `setScreen('live')`, with no effect/ref callback to attach the saved stream. A granted camera therefore displays no image and hand tracking receives no frames. |
| FE-06 | P1 | `src/lib/croak.ts:43-45,77-84,108-110` | Both oscillators run continuously. The 26–30 Hz sine LFO is connected directly to the side gain's AudioParam, while application updates that same gain every frame. This creates tremolo/negative-gain phase inversion on a continuous saw/square tone, not discrete frog-call envelopes; it directly explains the reported continuous buzz. |
| FE-07 | P1 | `src/hooks/useHandTracking.ts:158-173`; `src/lib/handMapping.ts:4-24` | Only the displayed video/canvas is CSS-mirrored; `detectForVideo(video, ...)` receives the original browser video frame. MediaPipe determines handedness assuming a horizontally mirrored selfie input and instructs consumers to swap labels when input is not mirrored. The app keeps labels as-is, so physical left/right control is reversed once camera playback is fixed. [MediaPipe Hands documentation](https://chuoling.github.io/mediapipe/solutions/hands.html) supports this conclusion. |
| FE-08 | P2 | `src/hooks/useHandTracking.ts:175-205`; `src/lib/handHeight.ts:19-36` | The calibration helper computes the correct sampled range, but the hook combines it with defaults using `min(yHigh)` / `max(yLow)`. A normal smaller reachable range can only retain or widen the default 0.15–0.85 range, never replace it; “Recalibrate” therefore does not remap the user's actual range as promised. |
| QA-04 | P1 | `e2e/frog-choir.spec.ts:3-11,50-183`; no `CroakEngine` test | The 10 E2E tests enter demo mode, never grant/mock a camera stream, never assert `video.srcObject`, do not exercise MediaPipe results, and do not inspect or render audio. The 25 unit tests likewise cover only pure helpers. The reported “All validations passed” is consequently a test-count claim, not core-feature acceptance evidence. |

## Required correction and re-verification

1. Keep the stream in `useCamera`, then attach/play it when the `<video>` ref mounts (or render the preview before requesting permission); add an integration test with a mocked `getUserMedia` stream that asserts `srcObject`, `play()`, and a ready video frame.
2. Replace the continuous oscillator/LFO design with per-side, gain-enveloped croak bursts (attack/decay/silence) triggered or rate-shaped by control value; use a deterministic offline-audio/unit test plus an audible human acceptance check.
3. Either mirror the actual input supplied to MediaPipe or swap its `Left`/`Right` outputs before assigning `userLeft`/`userRight`; add a test whose input-mirroring convention matches production, not a self-assertion of the current mapping.
4. Assign `calibrateFromSamples()` output directly per side after sufficient samples, then test a narrower range such as 0.3–0.7 maps to near 1–0 after clicking recalibrate.
5. Re-run build, unit, and E2E only after adding the missing camera/audio/integration coverage; then manually accept on a real granted camera with distinct left/right hands and audible frog calls.

## Verdict

**Request Changes / not accepted.** The visual/demo implementation is present and the declared automated commands pass, but two user-visible failures prevent use of the main camera-and-audio experience. The handedness and calibration defects would remain once the blank preview is fixed.

> ⚠️ Superseded by [Round 2 review](devlog-projects-qwen3-8-test-notes-frog-choir-round-2-review.md): FE-05, FE-06, FE-08, and the original QA-04 coverage gap were subsequently addressed. The remaining P1 is an empirically reversed handedness mapping, so the earlier theoretical mapping conclusion must not be applied without the real-device check.
