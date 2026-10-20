---
type: Note
title: Arcology control room — Round 1 findings and Round 2 verification
status: current
description: Round 1 findings and independent static verification of the Qwen Code fixes for Arcology 2049.
tags: [review, frontend, qwen-code, arcology]
timestamp: 2026-08-21T23:30:28Z
---

# Arcology control room — Round 1 review

Target: `$HOME/Downloads/qwen3.8_test/arcology-control-room`.

## Evidence gathered

- File split matches the requested `index.html` / `style.css` / `app.js`; no external package, asset, API or placeholder marker found.
- `node --check app.js` passes.
- The generating agent recorded a headless Chrome/CDP run with zero console errors/warnings. This is useful evidence, but it is not treated as independent visual verification.
- Independent Browser Use could not open the local `file://` target because of the environment URL policy, so this review does **not** claim visual or pointer-level manual verification.

## Findings

### P1 — Region selection is not reliable across the visible city

`drawBuilding()` puts full SVG building groups above the ground plate (`app.js:210-229`). The click handler resolves only an element whose nearest ancestor is `.region-ground` (`app.js:817-822`). Clicking a building, vehicle, road or pipeline therefore does not identify the owning region, even though the acceptance requirement is to click a map region. The existing ground rim may work, but it is not an adequate target.

Suggested fix: resolve `closest('.region')` (each parent group already has `data-id`) or add an intentional transparent hit-area for every region. Preserve the drag threshold logic, and cover pointer cancel / lost capture as part of the same change.

### P2 — Initial alert can name the wrong region

When startup has no alert, the code selects a random region but interpolates `regions[0].name` into the alert text (`app.js:884`). The alert can say “Helix Core” while its target and click action refer to another region.

Suggested fix: store the selected region once and use that same reference for both `pushAlert()` arguments and message.

### P2 — Core controls are not fully keyboard / assistive-technology reachable

Region cards and alerts are clickable `div`s (`app.js:373-390`, `:440-455`) instead of buttons or focusable elements with keyboard handlers. The range input lacks an explicit accessible name (`index.html:104`). The dialog has role metadata but does not move focus into the modal, trap it, or restore it to the triggering control (`index.html:117`, `app.js:827-828`).

Suggested fix: use semantic buttons (or explicit `tabindex`, roles and Enter/Space semantics), add an `aria-label` / `<label>` for the timeline, and implement modal focus lifecycle.

### P2 — Remaining acceptance test needs a real visible browser pass

The app has adequate static wiring for zoom, pan, LIVE/SIM, alert location and Load Shed. However the delivered evidence is agent-generated headless CDP plus syntax parsing; it does not establish the visual quality or narrow-screen behavior. This is a test gap, not a claim that those features fail.

## Non-findings

- No syntax error in `app.js`.
- No static evidence of externally fetched content or unsafe dynamic evaluation.
- The agent already caught and patched two plausible runtime issues before this review, which is a positive sign for its self-correction loop.

## Recommended next step

Close FE-01 first, then run QA-01 in a visible local browser. Only after that should this project be used as evidence for selecting Qwen Code + profile defaults over another agent setup.

## Round 2 — 2026-08-21

Qwen Code acted on the Round 1 findings. This reviewer inspected the resulting files rather than trusting the agent's completion message, and reran `node --check app.js` successfully.

### Verdict

**B+ implementation review; FE-01, FE-02 and UX-01 are closed.** The remaining QA-01 is a real visual, cross-breakpoint acceptance pass—not a known implementation failure. The environment still prevents this reviewer from opening the local `file://` page in Browser Use, so it is deliberately left open.

### Verified fixes

- **FE-01 closed.** `app.js:811-838` captures `closest('.region')` from the original `pointerdown` target, before pointer capture takes effect, and chooses that region only when the interaction has not crossed the drag threshold. The handler resets state for `pointercancel` and `lostpointercapture`. Since each region's building, road and pipeline nodes live inside that `.region` group, the former ground-only hit-target restriction is removed. Qwen's headless CDP report additionally records a building-click selection test; it is supporting evidence, not the basis of this conclusion.
- **FE-02 closed.** `app.js:917-920` assigns the random selected region to `r`, then uses `r` both in `pushAlert()` and the visible message.
- **UX-01 closed.** Region cards and alert rows are focusable `role=button` controls with Enter/Space handling (`app.js:373-395`, `:444-464`); the timeline has both a label and an accessible name (`index.html:104-105`); and the modal saves focus, initially focuses Cancel, cycles Tab inside itself, and restores focus on close (`app.js:840-861`). A visible `:focus-visible` treatment is present in `style.css:45`.

### Remaining evidence gap

- **QA-01 remains open.** A human visible-browser pass should still exercise the desktop and narrow layouts, pointer drag/zoom, timeline, alert navigation and Load Shed/Restore. This is the only outstanding acceptance item in backlog.md（历史本机文件，未随本报告发布）.
