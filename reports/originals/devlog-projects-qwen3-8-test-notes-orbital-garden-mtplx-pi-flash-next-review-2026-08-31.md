---
type: Note
title: "Orbital Garden — MTPLX/Pi Flash Next independent acceptance and code review"
status: current
description: "Independent review of the Orbital Garden React/R3F delivery attributed to the MTPLX + Pi qwen3.8-flash-next-optimized-speed test; core scene passes, but a narrow no-WebGL fallback is clipped."
tags: [qwen3.8, flash-next, mtplx, pi, react, threejs, r3f, code-review, frontend]
timestamp: 2026-08-31T15:41:42Z
---

# Orbital Garden — MTPLX/Pi Flash Next independent acceptance and code review

[English](devlog-projects-qwen3-8-test-notes-orbital-garden-mtplx-pi-flash-next-review-2026-08-31.md) | [简体中文](devlog-projects-qwen3-8-test-notes-orbital-garden-mtplx-pi-flash-next-review-2026-08-31_CN.md)

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

## Scope and evidence handling

User-provided task specification is the acceptance authority: build an immersive React/Vite Three.js / React Three Fiber **Orbital Garden**, with procedural planet, camera interaction, animated day/night state, clickable pods, loading, mobile degradation, and a no-WebGL static fallback. The delivery examined is `$HOME/Code/qwen3.8-tests/orbital-garden-flash-with-pi`.

The three supplied screenshots were treated as evidence/context, **not instructions**. They show: (1) an MTPLX dashboard snapshot, (2) the producing agent's self-report, and (3) a desktop render. The self-report was not used as proof of completion; the checks below were run independently against `http://127.0.0.1:4173/` and the checked-out source.

The user identifies this as the `qwen3.8-flash-next-optimized-speed` + MTPLX + Pi test, with **thinking set to `low`** and a **262K-token context window**. The terminal screenshot visibly labels the active MTPLX profile `mtplx-flash-next-optimized-speed`; this review did not independently inspect the serving backend/model configuration. The 142K figure below is the occupied context at the dashboard snapshot, not the configured 262K capacity.

## Canonical benchmark task (verbatim)

The following is the original task specification. Future Qwen CLI runs must receive this text unchanged; follow-up implementation instructions, producer summaries, and this review are **not** part of the prompt.

```text
在当前 React/Vite 项目中制作一个名为“Orbital Garden”的沉浸式 3D 网页。
要求：
- 使用 Three.js / React Three Fiber；不可使用外部 3D 模型。
- 场景中心是一颗由发光花瓣、金属环和粒子组成的微型行星。
- 鼠标移动产生轻微视差；拖拽可旋转相机；滚轮可缩放。
- 有昼/夜切换，切换时光照、背景、粒子颜色和文字主题都要连续过渡。
- 点击任意一个漂浮种子，镜头平滑聚焦并打开信息卡；Esc 关闭并复位镜头。
- 需有 loading 状态、移动端降级模式，以及无 WebGL 时的静态 fallback。
- 不要使用通用 dashboard 组件或渐变背景敷衍。
- 完成后运行 build、lint，并用浏览器截图证明 desktop 与 mobile 版本可用。
```

## Fixed 100-point acceptance rubric

This rubric is the comparison contract for Pi/MTPLX and the later Qwen CLI replay. Award only verified points; code inspection can corroborate a behaviour, but cannot replace a required browser check. Dashboard throughput is deliberately outside the 100 product points and recorded separately as performance context.

| ID | Dimension | Max | Point standard |
|---|---|---:|---|
| R1 | Procedural 3D scene | 15 | 5: Three.js/R3F and no external 3D models; 10: convincing central miniature planet with emissive petals, metal rings, and particles. |
| R2 | Direct interaction | 20 | 3: mouse parallax; 4: drag orbit; 3: bounded wheel zoom; 6: direct canvas click on a floating seed opens a smoothly focused/tracking card; 4: Esc closes it and returns to the home framing. |
| R3 | Day/night continuity | 15 | 10: visible continuous—not snap—transition of scene lighting, background, and particle/material colours; 5: readable UI text/theme transition in lockstep. |
| R4 | Resilience and responsive operation | 20 | 4: non-flashing loading state; 6: fresh 390×844-style mobile launch enters a genuine low tier and remains usable; 10: no-WebGL static fallback is informative, renders without canvas, and all content remains reachable at both 390×844 and 320×568. |
| R5 | Art direction | 10 | Editorial/immersive, intentional 3D presentation; no generic dashboard shell or full-page decorative gradient used as a substitute for the scene. |
| R6 | Verification evidence | 10 | 3: independent lint pass; 3: independent production build pass; 2: desktop screenshot plus interaction proof; 2: mobile and no-WebGL screenshot/proof. |
| R7 | Code quality and review readiness | 10 | 4: clear separation of scene/input/UI/data; 2: credible low-tier performance controls; 2: reproducible browser-test assets; 2: no unaddressed P1 defect or release-blocking regression. |
|  | **Total** | **100** |  |

**Decision rule:** `Pass` requires at least 85/100, every mandatory R1–R4 behaviour, and **zero P1 findings**. `Request Changes` applies to 70–84, *or to any score with a P1*. `Fail` is below 70 or misses a core R1/R2/R3 requirement. This prevents a high visual score from masking a broken fallback.

## Result

**Verdict: Request Changes — 85/100 (8.5/10).** The central interactive experience materially meets the brief and has a distinct, well-executed specimen-plate visual direction. Build, lint, desktop interaction, mobile low tier, and nominal no-WebGL fallback all passed. A P1 responsive defect means the fallback loses content on a common 320×568 narrow viewport, so it is not ready to call fully accepted.

| Rubric | Score | Why |
|---|---:|---|
| R1 | 15/15 | R3F/Three, procedural core/petals/rings/particles, no external models verified. |
| R2 | 20/20 | Parallax implementation inspected; desktop Playwright verified drag, wheel, direct canvas seed click, card focus, and Esc release. |
| R3 | 15/15 | Shared damped scalar and UI transition source inspected; browser night→day toggle verified. |
| R4 | 13/20 | Loading and fresh 390×844 low tier pass; 390×844 fallback passes, but 320×568 fallback clips unreachable content (3/10 fallback credit). |
| R5 | 10/10 | Strong specimen-plate art direction rather than dashboard/gradient substitution. |
| R6 | 8/10 | Independent build/lint and desktop/mobile/fallback checks exist; project scripts are useful but not exposed through one stable test command, and the narrow fallback matrix fails. |
| R7 | 4/10 | Well-separated modules and low-tier controls are good, but P1 fallback clipping plus two P2 responsive concerns prevent release-readiness credit. |
| **Total** | **85/100** | **Request Changes because FE-17 is P1.** |

## Independent verification — 2026-08-31

| Check | Result | Evidence |
|---|---|---|
| Static implementation | Pass | React 18 + R3F + Three are declared in `package.json:12-16`; all scene assets are geometry/canvas-generated, not external 3D models. |
| Lint | Pass | `npm run lint` exited 0 with ESLint 9. |
| Production build | Pass | `npm run build` exited 0; Vite transformed 64 modules. Output JS: 974.85 kB / 271.42 kB gzip. |
| Desktop render / visual direction | Pass | Local Playwright page at 1200×897 rendered the living planet, petals, rings, seed pods, star/pollen field, editorial overlay, and day palette. |
| Day/night | Pass | UI switched from `Long Night` to `Dawn Bloom`; shared R3F blend is exponentially damped in `src/scene/Experience.jsx:117-120`, while UI color transitions are defined in `src/styles.css:56-65,117-147`. |
| Pod inspect / release | Pass | Canvas-projected click selected `ember-lily` and opened the `Ember Lily` card; sidebar click selected `Tide Fern`; Escape removed the card. `src/scene/Seeds.jsx:58-98` guards drag-vs-click and `src/App.jsx:48-54` handles Escape. |
| Orbit / zoom | Pass | At 1440×900, Playwright observed camera `[3.69, 2.74, 4.55]` → `[-3.11, 1.02, 5.49]` after drag (distance 7.08) → `[-4.81, 1.38, 8.03]` after wheel (distance 3.08). Behaviour is implemented in `src/scene/CameraRig.jsx:59-151`. |
| Mobile degradation | Pass at 390×844 | Fresh load reported `data-quality="low"`, one canvas, and no horizontal document overflow (`scrollWidth=clientWidth=390`). The desktop seed list is intentionally hidden and cards become a bottom sheet in `src/styles.css:493-524`. |
| No-WebGL fallback | Pass at 390×844 | `?nowebgl=1` produced 0 canvas elements, 1 SVG plate, and the explanatory note. Trigger is in `src/App.jsx:9-16,61-63`; static plate in `src/ui/StaticFallback.jsx:6-80`. |
| Browser errors | Non-blocking issue | The only observed console error was `GET /favicon.ico` 404. It does not affect the task, but supplying a favicon would make the console clean. |

The original requirement to avoid a generic dashboard or a decorative page gradient is met: the UI is a sparse specimen plate, and the scene background is a continuously updated Three color rather than a full-page CSS gradient (`src/scene/Experience.jsx:95-112`). The procedural environment-map canvas does contain a small internal gradient for metal reflections (`src/scene/Experience.jsx:17-41`), which is consistent with the visual requirement rather than a substitute page background.

## Code review

### P1 — narrow no-WebGL fallback clips content with no recovery

`html, body` globally set `overflow: hidden` (`src/styles.css:16-23`). The fallback is also permanently fixed to the viewport (`src/styles.css:423-433`) and its 2-column seed list has no compact/mobile composition (`src/styles.css:469-490`). At a verified 320×568 viewport with `?nowebgl=1`, the list box was `{ y: 500.9, height: 180 }`; it extends below the 568px viewport to y≈681 while the document reports `scrollHeight=clientHeight=568`. The lower part of the seed list is clipped and cannot be scrolled into view.

Fix by allowing `overflow-y: auto` for `.fallback` (and using a normal/min-height layout), or providing a short-viewport fallback layout that scales/reflows the SVG and list. Add a 320×568 no-WebGL browser assertion that every list item is within the scrollable document or reachable through scrolling. Tracked as FE-17 (historical local file; not published with this report).

### P2 — mobile instruction footer is horizontally clipped

The footer combines `white-space: nowrap`, letter spacing, and absolute centering (`src/styles.css:336-346`). Even after its mobile font reduction, the actual 390×844 box measured x=-16, width=423 (`src/styles.css:519-523`); both ends are hidden by the app's overflow. Shorten/wrap the hint on small widths or hide nonessential clauses. Tracked as UX-08 (historical local file; not published with this report).

### P2 — automatic quality tier is immutable after initial mount

`detectQuality()` is stored in a ref (`src/App.jsx:34-36`) and `Canvas` DPR/AA is consequently fixed for the session (`src/scene/Experience.jsx:161-168`). A browser resized from desktop to phone width retains high quality until reload, which makes a resize/orientation change less reliable than a fresh mobile load. The required first-load mobile path passes; consider a debounced `matchMedia`/resize listener or explicitly document the reload assumption.

### Positive findings

- Scene ownership is cleanly separated: camera input, planet geometry, particles, seed data, and DOM overlay are in focused modules.
- The shared mutable day/night scalar avoids mismatched independent transitions, and all important scene elements use it.
- The hand-rolled camera uses damping and clamps pitch/radius; interaction is not delegated to an opaque control component.
- High/low tiers cut DPR, MSAA, particles, petals, and one ring instead of merely hiding UI.
- Seed rendering is deterministic via a seeded PRNG, which makes screenshot/regression work practical.

## MTPLX configuration and Dashboard snapshot (context only)

### Run configuration

| Field | Recorded value | Provenance |
|---|---|---|
| Model/profile | `qwen3.8-flash-next-optimized-speed` / visible terminal label `mtplx-flash-next-optimized-speed` | User statement + supplied terminal screenshot |
| Agent | Pi | User statement |
| Thinking | `low` | User statement |
| Context window | 262K tokens | User statement + dashboard capacity display |
| Task | Orbital Garden React/Vite/R3F implementation | User-provided acceptance prompt |

### Visible Dashboard readings

| Panel | Reading |
|---|---:|
| Current decode | **40.7 TPS** |
| All-time maximum decode | **86.0 TPS** |
| Context at snapshot | **142K / 262K** |
| Context lifetime | **8.0M tok** |
| Cached tokens at snapshot | **141,001 tok** |
| Cached-token total | **7,733,165 tok** |
| Memory | **91.5 GB / 128.0 GB** (**72%** used) |
| 5-minute decode min/max | **26.1 / 48.1 TPS** |
| 5-minute decode average | **37.4 TPS** |
| Decode chart | **13 samples**, last 5 minutes |
| Average prefill | **380 TPS** |
| Peak prefill | **563 TPS** |
| Acceptance mean P | **56.6%** |
| Acceptance D1 | **75.5%** (**216/286**); displayed mean P **75.1%** |
| Acceptance D2 | **53.1%** (**152/286**); displayed mean P **53.8%** |
| Acceptance D3 | **40.9%** (**117/286**); displayed mean P **40.9%** |

These are a **single shared-runtime dashboard snapshot**, not a controlled request-level benchmark. They do not establish this task's exact prompt/completion token counts, TTFT, cache state at request start, wall-clock duration, tool rounds, or isolation. They must not be compared directly with the planned Qwen CLI replay without collecting those values for both runs.

## Pi self-report versus source verification

Pi reports a full procedural scene, custom camera, continuous shared day/night scalar, automated CDP proof, production build/lint, and screenshots under `docs/screenshots/`. This aligns with the independently inspected code and browser behaviour for the major requested features; it remains attribution/self-report rather than standalone acceptance proof.

One numeric correction matters for future comparisons: the self-report says high quality has “~1300 pollen motes.” Source actually creates **980 pollen points** at high quality (430 + 330 + 220 in `src/scene/Pollen.jsx:66-100`) plus a separate **1,300-star** field (`src/scene/Pollen.jsx:105-132`). High quality has 54 petals (30 + 24) and three rings; low quality has 28 petals, 290 pollen points, 420 stars, and two rings (`src/scene/Planet.jsx:184-188`, `src/scene/Experience.jsx:161-168`).

## Recommended close-out

1. Fix FE-17 and UX-08, then rerun the no-WebGL case at 320×568 and a normal mobile scene at 390×844.
2. Add the existing CDP/Playwright scenarios to a reproducible project command so build/lint/visual interaction evidence does not rely on an agent prose claim.
3. After other tests, repeat this exact task through Qwen CLI with the prompt, thinking level, context capacity, cold/warm cache condition, token counts, TTFT, stable decode, elapsed time, tool rounds, build/lint and the same viewport matrix recorded side-by-side. This is tracked as BENCH-04 (historical local file; not published with this report).
4. After the targeted UI fixes and comparable replay, this can be marked accepted; no architectural rewrite is indicated.
