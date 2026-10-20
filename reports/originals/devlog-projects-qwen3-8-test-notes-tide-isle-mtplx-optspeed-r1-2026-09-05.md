---
type: Note
title: "Tide Isle R1 — mtplx-qwen38-27b-optimized-speed + pi Four-Task Summary"
status: current
description: "Re-ran the coding-agent evaluation using the MTPLX optimized-speed deployment; the vision loop was closed for the first time, directly yielding defect discoveries, and the \"root cause localization does not converge\" boundary identified in the previous round does not hold in this round—both stalls converged autonomously."
tags: [tide-isle, qwen3.8-27b, mtplx, pi, agent-evaluation, vision, methodology]
timestamp: 2026-09-05T02:00:00Z
---

# Tide Isle R1 — mtplx optimized-speed Four-Task Summary

[English](devlog-projects-qwen3-8-test-notes-tide-isle-mtplx-optspeed-r1-2026-09-05.md) | [简体中文](devlog-projects-qwen3-8-test-notes-tide-isle-mtplx-optspeed-r1-2026-09-05_CN.md)

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

> Shareable version of the same content: <https://claude.ai/code/artifact/76978d9c-768b-4cd9-b225-da732e684d9e>

The control group is the [Neon Bastion Seven-Round Summary](devlog-projects-qwen3-8-test-notes-neon-bastion-final-summary-2026-09-04.md)
(same model family, mlx-dspark 8bit deployment). This round switched to the **MTPLX optimized-speed** deployment, with the task defined by the user:
A browser-based 3D sandbox life game, *Tide Isle*, benchmarked against Animal Crossing.

Workspace `~/Code/qwen3.8-tests/mtplx-27B-optspeed-with-pi-tide-isle`,
Task specifications `~/Code/qwen3.8-tests/tide-isle-tasks-r1/task-{1..6}.md`, spec `test-prompts/tide-isle.md`.
R1 concluded at task-4 as planned (task-5 fishing, task-6 shop/housing moved to R2).

> ⚠️ **2026-09-05 Addendum (after manual playthrough): The conclusions below regarding "visual self-check" must be read with this limitation in mind.**
> The user played the game once on the actual machine and caught **seven issues**, all of which passed 161 unit tests + 57 E2E tests + the agent's four consecutive rounds of four-category visual self-checks.
> See PLAY-02 / PLAY-03 (historical local files, not published with this report) and the "Manual Playthrough Review" section at the end of this page.

## Deployment and Metrics

Server side `:8001`: `--profile turbo --batching-preset solo --scheduler-mode serial`,
`--context-window 131072`, `--depth 3`, `--ssd-session-cache off`, `--reasoning-parser qwen3`.
Pi side `mtplx-qwen38-27b-optimized-speed`, thinking `medium`, `maxTokens 32768`.

> ⚠️ Before starting, pi's `models.json` pointed to a non-existent `:8000`, and `contextWindow` was set to 262144
> while the server only had 131072. The former immediately reported a connection error and was easy to detect; **the latter is more dangerous—pi would pack prompts according to 256k,
> only hard-failing in the middle of the task, and is easily misrecorded as "the model is not working."** See OPS-13 (historical local files, not published with this report).

## Deliverables

5 commits, 77 files, **+7,796 / −123**; `src/` 5,795 lines of TS, `tests/` 1,286 lines, `e2e/` 2,676 lines.
Unit tests **161** (10 files), E2E **57**, committed screenshots **31**. All four verification checks (`tsc` / `vitest` /
`npm run build` exit codes / `playwright`) were independently re-run by the reviewer in an **isolated copy**, consistent with the agent's self-report.

| Task | Duration | Requests | Compaction | Bash | Edit | Output Tokens | Thinking Characters |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 Skeleton/Map/Movement | 90m | 89 | 1 | 40 | 33 | 138,886 | 270,419 |
| 2 Time/Weather | 145m | 185 | 3 | 79 | 56 | 200,159 | 298,835 |
| 3 Save | 91m | 123 | 2 | 64 | 41 | 131,085 | 216,723 |
| **4 Items/Backpack/Interaction** | **303m** | **438** | **7** | **292** | 96 | **427,155** | **741,202** |
| Total | 10h29m | 835 | 13 | 475 | 226 | 897,285 | 1,527,179 |

**919 tool calls, 0 tool errors** (previous round: 1,836 calls, 3.4% failure rate).

## Conclusion 1 · Vision Loop Closed, Directly Yielding Defect Discoveries

The previous round's OPS-11 (mlx-dspark silently dropping images in both loading and requests) does not exist in MTPLX. All four pre-start checks passed:
Server-side image reception (1280×720 screenshot approx. 900 prompt tokens / 10s), `mtplx-request-policy.ts` extension does not touch images,
pi's read tool uses image part, random image content Q&A 3/3.

**In task-1, it caught a rendering defect that would have failed the entire acceptance by "reading back the screenshot"**: `pushPrism`
corners in `world.ts` were stored as `[x,z,y]`, but the top face was written as `[x,y,z]`, causing the top face to be rendered as a vertical wall, making the entire island look like a "grid basket".
**No assertion could catch this type of defect**—non-blank, non-solid color, color count, and inter-frame differences all passed normally.

Comparison with the previous round: R6 had eleven art tasks, five visual defects, pi **0/5**, all discovered by humans looking at the images.

## Conclusion 2 · The "Root Cause Localization Does Not Converge" Boundary Does Not Hold in This Round

The previous round's boundary one stated: **Once root cause localization is required in a multi-factor coupled system, it will continue to consume resources without converging**,
and both stalls (AI-01 176m, R7 206m) required the reviewer to run the root cause in an independent copy and hand it over.

In this round, two stalls of the same form occurred within task-4, **both converged autonomously**:

| | Symptom | Duration | True Root Cause | Convergence |
|---|---|---:|---|---|
| 1 | All five cases in the screenshot spec timed out at 20s with `ready()` | 2h11m | The spec lacked `page.goto`, and the test remained at `about:blank` throughout | Autonomous (06:43:04) |
| 2 | After adding backpack UI, the entire page darkened by 3.5x | 2h20m | The global `.tide-panel` injected by `ui/backpack.ts` collided with the HUD's same-name class, four-side offsets took effect simultaneously, stretching the panel into a 0.88 opacity dark layer covering the entire viewport | Autonomous |

**The reviewer's intervention was 89 seconds late and contributed nothing to the result.** Timeline: 06:43:04 pi self-reported
"settle doesn't do a goto at all — I was assuming there was one"; 06:44:33 reviewer sent the root cause;
06:44:41 message arrived. **This is a documented misjudgment**, lessons below.

The reasoning quality of the second stall was significantly higher than the first: it upgraded from "changing hypotheses" to **quantitative back-calculation**—
it deduced "a 0.88 opacity dark panel covering the center" from the partition brightness 143→39 (143×0.12 + 23×0.88 ≈ 37–39),
then used git worktree to check out the task-3 baseline for comparison, binary searched by file grouping, `toDataURL` raw canvas (bright)
vs Playwright full-page screenshot (dark), `elementsFromPoint` + computed styles to lock it down. And it **actively overturned its previous
"fog compression" misdiagnosis, honestly writing the misdiagnosis process into the report**.

Token fingerprint of the stalls: task-4 thinking 741k characters (74.1 × 10,000) (first three tasks total 786k (78.6 × 10,000)), bash 292 times,
while edit only 96 times—**high thinking + high exploration + low modification**. Consistent with the previous round's AI-01 signature
(369k thinking (36.9 × 10,000) vs remaining nine tasks total 420k (42 × 10,000)).

## Conclusion 3 · Category Hints for "What to Look At" Can Fill an Entire Blind Spot

In task-1, the reviewer independently looked at the images and found four issues it missed, with the commonality being **"missing things" and "overall composition"**:
Default camera too far (island only occupies 45% of the frame), pond is an axis-aligned perfect rectangle, no shadows in the entire scene, no transition on the coastline.
**Nothing in the frame pointed to this type of issue**—wrong objects actively attract attention, "shadows that should be there but aren't" do not.

From task-2, three categories of checks were added to the input (composition / missing parts / geometry too regular), and it immediately self-checked:
Sky has no sun/moon disk, 3 streetlights aligned in a straight line, plus 5 polishing items all verified as true.
In task-3, a fourth category was added (**whether the attributes measured by assertions are consistent with the visual impression**), producing the most valuable discovery in that round:

> **Wrong Layer Measured**: The "overlay changed the screen" assertion for save-ui / delete save / corruption prompt read WebGL canvas pixels,
> while panels, toasts, and popups are **DOM overlays, not present in the canvas at all**, resulting in a pre/post frame diff = 0.

This is of the same type as the previous round's "probe window failure"—**the assertion is structurally impossible to measure the target, and it is green**.
The difference is that in the previous round, humans calculated it, while in this round, it self-checked it. In the same round, it also self-checked a hand-written PNG decoder unfilter missing one byte
(the "darkened" page decoded to be brighter, 130 vs actual 68, discovered by comparing with PIL) and HUD minute floating-point truncation.

**It is recommended to solidify the four categories of checks into subsequent task specifications.**

## Persistent Old Habit · Replacing Visual Judgment with Assertion Metric Names

- task-2: Assertion measured the pixel count of `R−B>30` (measured 84), report stated "ground warm light pools are clear".
  **The two large light pools in the image are greenish-white cold light**—light hitting the grass made the grass look green, only a small area by the window was warm.
- task-4: The reviewer explicitly requested to check "whether icons can be distinguished as **what they are** at the actual grid size",
  section (d) answered "icon silhouettes are **distinct**". The metric and the question are not the same thing: two differently colored diagonal sticks can pass "distinct",
  while being indistinguishable as objects.
  (> ⚠️ However, in this case, the reviewer's initial judgment that "fishing rod and branch are indistinguishable" was **invalid** after 6× magnification verification—
  the fishing rod has a hanging fishing line and float, the branch is bent with forks, all six icons are distinguishable. The methodological criticism holds, the specific case does not.)

**This is a variant of the previous round's "regional statistics can detect presence/absence, but not similarity"**: this time the error was not in the assertion,
but in **using the assertion's metric name to describe the visual impression**.

## Round-by-Round Correction Rate

Every pointed-out issue was fixed in the next round, **none required a second mention**:

| | task-1 | task-2 | task-3 | task-4 |
|---|---|---|---|---|
| Negative Control | Only written in the report, **not committed** | Committed, `?break=` 6 items + README calibration table | Committed + code-level control | Includes paired negative control screenshots |
| Screenshots | Two duplicates with same name | Naming fixed, but written to `test-results/` in `.gitignore` | **Correctly committed** | All 31 committed |
| Visual Self-Check | Sections (a)(b) | + Three categories of checks | + Fourth category of checks | Four categories + misdiagnosis record |

Compared to the previous round's R2 "README fabricated six non-existent operations", no fabrication occurred in this round; task-4 commit message actively stated
"previous 'fog compression' misdiagnosis has been overturned".

## Reviewer's Own Three Failures (Methodology)

1. **Monitor read the wrong panel.** `zellij action dump-screen` captured the **currently focused** panel,
   after focus returned to the reviewer's side, it read the reviewer's own status bar's `Working on X`, ran for 1h39m without triggering once.
   The second version using "jsonl silent for 4 minutes" also false-alarmed—pi's single long thinking can exceed 4 minutes without writing to disk.
   **Final criterion: session jsonl last entry is `role=assistant` + `stopReason=stop` + no `toolCall`**
   (consistent with the previous round's OPS-09 record, should have been adopted directly). Another guard mistakenly treated pi's output
   `Working tree is clean` as "still busy".
2. **Did not re-sample implementer's status before intervening.** Used evidence accumulated two hours ago to support a judgment of "still stuck now",
   while it had already gotten out 89 seconds ago. **General rule: must re-sample current status before intervening, old evidence cannot prove the present.**
   This is of the same origin as the previous round's "assuming terminal operations took effect without verifying".
3. **Independent review polluted the reviewed working tree.** When the reviewer ran `npx playwright test`, the screenshot spec
   regenerated and overwrote 8 committed screenshots. If not restored, pi's next commit would commit the reviewer's run results together,
   making it impossible to distinguish which image was generated by whom. **Subsequent reviews must be conducted in an isolated copy created via rsync.**

The reviewer also had a technical misjudgment: suspected "Playwright full-page screenshot caused WebGL dark frame", measured fullPage and viewport
**pixel-by-pixel same brightness**, hypothesis falsified. The true discriminative experiment was the one pi did—`toDataURL` raw canvas
vs page screenshot. **Both the reviewer and the implementer guessed the wrong direction on the same issue, the difference is only that the latter guessed wrong more times, with a higher cost each time.**

## Delivery Defects (Fixed in Subsequent Tasks)

- task-2's 9 time-of-day/weather screenshots were written to `test-results/`, and that directory is in `.gitignore`,
  **never entered the repository**—task-2's visual evidence in the deliverables was temporarily non-existent. task-4 has completed it.
- `playwright.config.ts`'s `webServer` used `npm run dev` (source code immediate compilation) instead of `vite preview`,
  **bypassing the previous round's four "stale dist" failures**, but the cost is **E2E never tests build artifacts**,
  `npm run build` only runs separately alongside. The failure mode changed, it did not disappear.

## Manual Playthrough Review (2026-09-05)

After R1 delivery, the user played the game on the actual machine, **caught seven issues in one go**:

| # | Issue | Location |
|---|---|---|
| 1 | **D / → keys cannot walk** (W A S normal) | `game.ts:557` left/right branch `dz` symbol reversed, one character (bug page (historical local files, not published with this report)) |
| 2 | Opening full island overview, **character too small to see** | Default camera distance; character screen height ratio approx. 1.7% |
| 3 | **Mouse cannot drag the view** | `main.ts` only bound `wheel` zoom and click pick, no drag pan |
| 4 | **Trees and houses have no collision**, character passes through directly | `player.ts:54`'s `collides()` only tests solid blocks, objects are rendering layer decorations |
| 5 | After zooming in, **cloud layer blocks between camera and scene** blurring the view | Clouds are world-space planar billboards, falling between camera and island in close-up |
| 6 | **Rain is not 3D particles**, just a layer covering the front of the screen + sound effects | — |
| 7 | **No BGM** | `src/game/` only has footsteps, rain sounds and 4 types of UI sound effects |

**All seven passed 161 unit tests + 57 E2E + agent's four consecutive rounds of four-category visual self-checks.**

This is not "visual self-check is useless"—it did catch things like top face y/z swap, wrong layer measurement, PNG decoder off-by-one that
automated assertions cannot measure. **But they have a common premise: can be seen in a static screenshot.**

> **The vision loop closed, reducing the miss rate of defects like "screen rendering is wrong"; for "play feels wrong", the reduction is zero.**
> Movement direction, collision, mouse drag, camera distance sense—none can be judged from a static screenshot.
> Item 2 (character too small to see) was even always in the screenshots, the reviewer wrote "default camera too far, island only occupies 45% of the frame" in task-1,
> but classified it as a composition polishing item, not realizing it was **the first-time game experience being completely broken**.

This makes the previous round's "writing manual playthrough as a mandatory part of the process" not only continue to hold, **but stronger than the previous round**:
In the previous round, the agent was blind, manual playthrough was the only eye; in this round, the agent can see, and did four rounds of structured self-checks,
manual playthrough still caught seven in one go. **Conclusion: Manual playthrough cannot be replaced by visual self-check, and should be a mandatory part after each batch of tasks.**

Fix task specifications have been split into three batches: `~/Code/qwen3.8-tests/tide-isle-tasks-r2/`
(A Controls and Camera / B World Entity Feel / C Presentation and Sound, 7 items total).

## R2 Fix Round (2026-09-05 → 09-06, Paused Before Batch C)

Split into three batches according to the seven issues found in manual playthrough. **Batch A and Batch B, 5 items total, have been delivered and independently reviewed**, Batch C (3D rain particles, BGM) not submitted.

| Task | Content | Duration | Notes |
|---|---|---:|---|
| A1 | Fix D/→ keys (`game.ts:557` symbol) | 33m | Root cause written in task spec |
| A2 | Default camera close-up follow (character ≥ 6% frame height) | 1h57m | Old full island overview retained as farthest end 1× |
| A3 | Mouse drag pan + HUD overlap fix | 1h59m | Added 5th category self-check |
| B1 | Tree/Stone/House/Lamp post collision | 2h42m | Visible geometry constants made single source |
| B2 | Cloud layer does not block close-up | 3h48m | Reviewer's problem statement gave wrong solution, see PLAY-04 (historical local files, not published with this report) |
| B2-fix | Flaky assertion + thin margin full repo scan | 2h | See OPS-17 (historical local files, not published with this report) |

Final status: **10 commits, 112 files, +13,068/−160**; unit tests **274**, E2E **92**, screenshots 40+; all four checks independently re-run and passed by the reviewer in
a one-time isolated copy. Cumulative net work **23.6 hours**, 1,598 requests, 25 compactions,
output **1.73 million tokens** (173 × 10,000), thinking **3.21 million characters** (321 × 10,000), converted to **¥251**.

### Three Main Gains from R2

**One, Duration is determined by the number of times "need to figure out why yourself", not by implementation complexity.**

| Batch | Tasks | Total Duration | Root Cause Investigation Duration | Ratio |
|---|---:|---:|---:|---:|
| R1 task-1..3 | 3 | 5h26m | 0 | 0% |
| R1 task-4 | 1 | 6h07m | 4h31m | **74%** |
| R2 Batch A + B1 | 4 | 7h11m | 0 | 0% |

Batch A three items total 4h29m, changed approx. 3,100 lines; task-4 one item 6h07m, changed 3,354 lines. **Code volume is comparable, the difference is all in root cause localization.**

**Two, Converting "similarity" into decidable numbers, succeeded twice in this round.** task-2's brightness metrics (meanLuma / darkFrac / histogram bucket count);
A3's UI overlap—**taking all HUD element bounding rectangles to be pairwise non-intersecting and within the viewport, excluding ancestor/descendant pairs** (otherwise always red),
verified once for each of three viewport sizes, paired with `?break=help` to remove width limit negative control. This type of defect no longer needs human eyes from now on.

**III. The negative control only completed half the work.** During the B1 falsification, the reviewer discovered: after corrupting the real code,
the negative control test for `?break=collide` **still passed** — because it asserts precisely that "it should not block when broken."
**The negative control proves the assertion is not tautological, but it cannot catch regressions; catching regressions relies on the guard side. The two must be paired, and they have different strength requirements.**
This refines the previous round's "a negative control not written into the repository is equivalent to not doing it" by one more level of precision.

### Reviewer's Independent Falsification Results (All via real code regression, not via `?break=`)

| Task | Injected Real Regression | Result |
|---|---|---|
| A1 | `synthMove` symbol reverted to incorrect value | movement unit tests **17/25 turned red** |
| A3 | Removed two instances of `max-width` in `hud.ts` | Assertion turned red and **listed overlapping elements pair by pair** |
| B1 | Short-circuited obstacle loop in `Player.collides()` | **6 unit tests + 2 E2E tests turned red** |
| B2-fix | Ran 5 consecutive times to confirm flakiness disappearance | **5/5 all passed** |

### New Failures and Methodology

- Tool calls degraded to plain text (historical local file, not published with this report) — the only model-level failure in this round,
  occurred three times, suspected trigger condition was long composite shell commands; **judgment was correct throughout, what was broken was the step from intent to tool call**.
- OPS-17 (historical local file, not published with this report) Red tests may also be unrelated to the code under test (mirror of OPS-12)
- OPS-18 (historical local file, not published with this report) Acceptance of stability fixes must be N repetitions and cross-executor
- OPS-19 (historical local file, not published with this report) The isolated copy itself is also mutable shared state; one disposable copy per run
- PLAY-04 (historical local file, not published with this report) The reviewer's problem statement provided two dead-end solutions under the orthogonal camera

### Mistake Count

**Reviewer 6 times, Implementer 0 times** (tool call failures are classified as deployment/model level and not counted as implementer judgment mistakes).
In the previous round, this ratio was reversed. The reviewer's six instances were: monitor criteria wrong in four versions, failed to re-sample state before intervention (89 seconds late),
review contaminated the working tree, review and falsification shared the same copy, B2 problem statement dead-end solution, and after saying "can play on real device" unilaterally initiated a fix.

## Item-by-Item Comparison with the Previous Round

| | Neon Bastion (mlx-dspark 8bit) | Tide Isle R1 (MTPLX optimized-speed) |
|---|---|---|
| Visual Input | ❌ Silently discarded (OPS-11) | ✅ Passed, and directly produced defect discovery |
| Visual Defect Detection | 0/5, all relied on humans | Self-detected 1 fatal rendering defect + 1 structural assertion error + several polish items |
| Root Cause Localization | Both stalls **required human-provided root cause** | Both stalls **converged autonomously** |
| Tool Failure Rate | 3.4% (62/1,836) | **0%** (0/919) |
| Fabricated Unimplemented Features | Appeared in R2 (six non-existent operations) | Did not appear; proactively annotated misdiagnoses and unperformed items |
| decode | 19.1 tok/s | Server-side turbo/solo, baseline not re-obtained under the same criteria |

**A single point does not constitute a conclusion**: This round only task-4 produced stall samples (containing two instances); R2 requires more samples
to confirm whether "the disappearance of the root cause localization boundary" is a deployment/model difference or a task nature difference.
