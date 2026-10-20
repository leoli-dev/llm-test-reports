---
type: Review
title: "LLM bandwidth showcase — Round 3 review"
status: request-changes
tags: [qwen3.8, omlx, frontend, code-review, data-integrity]
timestamp: 2026-08-23T11:49:00Z
---

# LLM bandwidth showcase — Round 3 review

[English](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-3-review.md) | [简体中文](devlog-projects-qwen3-8-test-notes-llm-bandwidth-showcase-round-3-review_CN.md)

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

## Initial verdict

**Request Changes.** The three P1 items for Round-1 have been kept fixed; the animation has also been changed from decorative particles to a four-step single-token timeline, which is the correct direction. However, the delivery claiming that "all 10 items have been verified against official sources" has not yet been established: two Apple data points remain inconsistent with or inaccessible from the attached official pages, and the initial UI state for "optional autoplay" is opposite to the actual behavior.

> ⚠️ Historical findings below were reviewed again after the final patch. M3 Ultra, UX-04, and A11Y-01 have been marked as passed in the Final closeout at the end of this page; the source issue for M5 Max remains unresolved.

## Review scope and evidence

- Local static check: `node --check data.js calc.js animation.js app.js` passed.
- Local Playwright/Chromium loaded `http://127.0.0.1:8765` and captured first-view, full-page, and `#anim-title` targeted screenshots; the page rendered without any new loading errors introduced in this round. The targeted screenshot on the desktop 2308×1382 viewport stably reproduces the overlapping of text/description layers within the Canvas.
- Item-by-item check of `data.js` and the official source page. Apple's current M5 Max technical specifications should use `https://support.apple.com/en-us/126319`; the current `https://www.apple.com/mac/macbook-pro/specs/` is 404. Apple's M3 Ultra Mac Studio page `https://support.apple.com/en-us/122211` lists a maximum of 256GB unified memory, 819GB/s.

## Findings

### P1 — DATA-01 remains incomplete: M5 URL broken and M3 figures are stale

`data.js:60-71` Marked M5 Max as `confirmed`, but its source URL (`apple.com/mac/macbook-pro/specs`) returns 404; a source that cannot be clicked to verify cannot be called a traceable source. It should be changed to the Apple Support M5 MacBook Pro technical specifications page, and the citation date should be re-verified.

More seriously, the actual calculation fields for `data.js:161-169` are still `memoryGB: 512` and `bandwidthGBs: 816`, while its same note already states that the current values are "256GB / 819GB/s", and the attached Apple support page also supports the latter. Therefore, when selecting M3 Ultra, the capacity determination, comparison charts, and tok/s will all be based on incorrect values. The fields should be updated to `256` and `819`, and the note should only describe the specifications of the currently cited page; if historical specifications need to be retained, a separate and verifiable historical configuration should be added, and they must not be mixed.

### P1 — UX-04 timeline is visually broken: the explanation card obscures the diagram

Playwright's `#anim-title` screenshot confirms that the description card directly covers the labels and values at the bottom of the three main subjects: for example, "Memory (Model Weights)", "GPU Compute Cores", "Token Output", and their GB/GB/s/tok/s figures are located beneath the black semi-transparent description card, rendering them unreadable or partially readable. This is precisely the "messy" visual defect seen in the user's screenshot, not a matter of color scheme preference.

The root cause is that in the fixed-height 400px Canvas (`style.css:272-276`), the main subject boxes are centered at `h * 0.47` and extend up to approximately `h * 0.74` (`animation.js:76-87`), while `drawStepCaption()` draws a 96px-high description card (`animation.js:311-340`) starting from `h * 0.62`. These two areas inevitably overlap in design coordinates; different animation stages only change which element is highlighted and cannot eliminate the collision.

**Do not attempt to simply move the card down by a dozen or so pixels.** This would compromise narrow screens and would continue to leave body text layout to fragile Canvas coordinates. Refactor to the following structure:

1. The Canvas is responsible only for graphics: three nodes, two paths, and the current stage highlight; it no longer draws any description cards, formulas, or main subject labels, and necessary labels are placed in safe positions that do not overlap with nodes.
2. Below `#anim-canvas`, add a "Current Step" description area using standard HTML: step title, complete formula, and 1–2 sentences of explanation. HTML handles natural line wrapping, reading order, and screen reader semantics; the Canvas does not truncate text.
3. The height of the description area is determined by its content, while the Canvas maintains a fixed or responsive height dedicated to pure graphics; switching between the four stages only updates the description area text and the Canvas highlight.
4. Perform stage-by-stage screenshot acceptance testing at widths of 2308×1382, 1280×800, and 390px: no frame shall obscure nodes, node labels, formulas, or description text; the formula for each step must be fully readable.

This refactoring is a necessary completion condition for UX-04. Until it is completed, the new "explanatory animation" actually hinders reading more than the original pure particle animation.

### P1 — UX-04’s “optional autoplay” contract is violated at first paint

`animation.js:494` unconditionally calls `api.play()` when reduced motion is not enabled; however, the first-screen button is explicitly labeled "Autoplay (optional)" in `index.html:93`, with an initial state of `aria-pressed="false"`, and `app.js:220-244` only synchronizes the state after the user clicks. In other words, while the animation is actually playing, both the visual label and assistive technologies report "not playing."

The default behavior should be to stop at the fully readable first step, allowing the user to explicitly start playback; alternatively, retain automatic start but call `setPlayBtn(true)` during initialization and change the label to "Pause autoplay." Based on user feedback from Round-2, the former is recommended.

### P2 — Incomplete ARIA semantics for Tablist

`index.html:97` marks the stage container as `role="tablist"`, but the plain buttons created by `app.js:212-217` lack `role="tab"`, `aria-selected`, keyboard arrow navigation, or associated `tabpanel`. This causes assistive technologies to receive incomplete component semantics. Either implement the full tab pattern, or remove `tablist` and describe them as a group of plain "jump to stage" buttons; the latter is closer to the current interaction.

## Positive verification

- FE-03: The Canvas first screen is visible; the previous blank startup failure has not recurred.
- FE-04: When the default RTX 5090 + Qwen3.8 FP16 capacity is insufficient, the conclusion and horizontal comparison display "Not Applicable," without fabricating offload tok/s.
- UX-03: The context slider has influenced the total occupancy/capacity conclusion, and is explicitly labeled as an educational estimate.
- The data model has added `memoryType`, and records total/active MoE parameters for DeepSeek V4 Flash; calculations still use total parameters, consistent with the weight storage and read bandwidth model.
- The timeline's "read weights → compute layer by layer → output 1 token → repeat" and the `weightGB ÷ bandwidthGBs → ms/token → tok/s` explanation substantively address the user's criticism that the original particle animation was "unexplainable." The remaining issues are the control contract and data correctness, not reverting to the original decorative animation.

## Acceptance criteria for next review

1. M5 Max link opens and directly supports 128GB / 614GB/s; the actual fields for M3 Ultra are 256GB / 819GB/s, with consistent source, title, and date.
2. Canvas is separated from the description area; no text or graphic overlap in the step-by-step Playwright screenshots, and the complete formula is legible.
3. First-screen playback state, button text, and `aria-pressed` are consistent; either default pause or explicit synchronized autoplay is acceptable.
4. Incomplete removal of stage controls `tablist` semantics, or completion of accessible tabs behavior.
5. Re-run JS syntax, browser loading, and capacity/comparison value assertions after selecting M3 Ultra.

## Final closeout — 2026-08-23

**Final verdict: not accepted; case closed with one known P1 data-integrity exception.** The user requested final review and closure after Qwen's last patch.

### Independently accepted

- `node --check` passes for all four JavaScript files.
- Playwright screenshots at 2308×1382 and 1280×800 show that the diagram, its three node labels, legend, and the new DOM explanation panel no longer overlap. The explanation is below the Canvas, and the full formula is visible as wrapping HTML text.
- The page defaults to stopped: the button text is “Auto Play (Optional)” and `aria-pressed="false"`; `animation.js` no longer starts `requestAnimationFrame` during initialization.
- The `tablist` role has been removed; stage controls are ordinary buttons.
- M3 Ultra has been corrected in `data.js` to 256GB / 819GB/s and retains a matching Apple Support source.

### Rejection reason retained at closure

DATA-01 remains unresolved. `data.js:60-72` still marks the M5 Max entry as `confirmed` while linking to `https://www.apple.com/mac/macbook-pro/specs/`, which returns 404. Qwen described this as a blocking inability to find a source, but the Apple Support page `https://support.apple.com/en-us/126319` is live and explicitly lists both 614GB/s for the 40-core M5 Max and configurable 128GB unified memory. The entry must use that URL and its matching title before it can be called source-traceable.

No implementation was made in this review because the task was independent acceptance, not an authorization to alter Qwen's deliverable. The test case is now concluded as **failed acceptance with a single, concrete P1 remaining**; DATA-01 stays in the project backlog for any future reopening.
