---
type: Note
title: Neon Bastion — mlx-dspark/Qwen3.8-27B-8bit + Pi independent acceptance and code review
status: current
description: Independent review of the Neon Bastion 4v4 browser FPS from the local mlx-dspark DFlash2 stack — core simulation and unit tests are excellent, three spec features are absent, the E2E suite misses the mandated scenarios, plus a concrete UI and palette direction for the presentation layer.
tags: [qwen3.8, mlx-dspark, dflash2, pi, threejs, typescript, code-review, fps, benchmark, design, color, hud]
timestamp: 2026-09-01T21:34:00Z
---

# Neon Bastion — mlx-dspark/Qwen3.8-27B-8bit + Pi independent acceptance and code review

## Scope and evidence handling

The acceptance authority is `test-prompts/3d-team-arena.md`（历史本机文件，未随本报告发布） (11,907 bytes — the most detailed prompt in this test set). The reviewed delivery is `$HOME/Code/qwen3.8-tests/mlx-dspark-27B-8bit-with-pi-3d-team-arena`; it is not a Git repository, so this is a working-tree review.

The agent's own closing claim ("complete and fully green") is **not** treated as proof. Every build/test number below was re-run independently by the reviewer against the checked-out tree.

## Run configuration and performance context

| Field | Recorded value | Provenance |
|---|---|---|
| Server | `mlx-dspark 0.18.0`, PID 44895 | `/health` |
| Model | `mlx-community/Qwen3.8-27B-8bit` | `/v1/models` |
| Speculative decoding | DFlash 2 (`incoai/Qwen3.8-27B-DFlash2`) | `/health`; drafter `config.json` `conv_kernel_size: 2` |
| Context window | 131,072 | `--context-window 131072` |
| Output cap | 16,384 → **32,768** mid-session | See "Output-cap incident" below |
| Agent | Pi 0.84.4, thinking `low` | `~/.pi/agent/models.json` |
| Session duration | approximately 5 hours | Pi session `01a05d98-e82c-7cb1-9cc0-319ed9c37cb0` |
| Requests / tokens | 201 requests · 13,928,046 in · 297,247 out | `/metrics` |
| Tool calls | 196 (bash 89 · edit 49 · write 39 · read 19), 4 failures (2.0%) | Pi session log |
| Context compactions | 3 (at 115,643 / 120,613 / 115,113 tokens) | Pi session log |
| Mean decode | 21.7 → 19.8 tok/s over the session | `/metrics` `mean_decode_tokens_per_sec` |
| Mean accept length | 3.15 | `/metrics` |
| Prefix-cache reuse | 94.6% (13,169,005 of 13,928,046 input tokens) | `/metrics` |
| Peak MLX allocator | 69.0 GB (active 42–52 GB) | `/metrics` `memory.peak_bytes` |

This is a session-level observation, not a controlled benchmark: cold/warm cache state, per-request TTFT and hardware contention are not isolated. It does, however, satisfy the real-workload part of BENCH-05.

### Speed behaviour observed (useful for later replays)

- Decode rate is governed by `ms/round`, which rises monotonically with context: 81 ms at a fresh start → 133 ms → 185 ms before compaction. Measured slope ≈ **5.5 ms per 1,000 generated tokens**; extrapolating that slope to a 10,880-token generation predicted 158 ms/round against 137–158 ms observed.
- `tok/s` alone is a misleading health signal: it also swings with draft acceptance, which is content-dependent (91% while writing code, 28% while writing prose) and moves independently of `ms/round`.
- **Compaction is not purely a cost — it is the only operation that lowers `ms/round`** (185 → 133, i.e. 12–22 → 23–28 tok/s). Running a larger context window to avoid compaction would trade a one-off pause for a permanently slower regime.
- Raising `--context-window` to the model's native 262,144 was considered and rejected: `/machine` puts the plain-decode ceiling at 17.0 tok/s at zero context, 12.9 at 131K and ≈10.4 at 262K.

### Output-cap incident (process finding)

`--max-tokens-cap` was lowered 32,768 → 16,384 mid-session to bound a runaway thinking chain (one request reached 10,880 tokens with no visible output). It then **truncated a legitimate long answer**: `prompt_tokens 6,932` / `completion_tokens 16,384` with context only 17.8% used, and Pi reported "Response was truncated before completion". The cap was restored to 32,768.

Lesson recorded for future runs: the output cap must be sized to the longest *legitimate* output, not to the worst tolerable wait. Truncation discards the entire generation (~14 minutes here); a long wait at least yields a usable result.

## Result

**Verdict: Request Changes — 77/100 (7.7/10).**

The hard parts are right. Hitscan wall-priority, head/body hitboxes, single-score-per-bullet, friendly-fire exclusion, seeded spread, fair AI perception and a connected nav graph are all correctly implemented and covered by an unusually good unit-test suite that maps almost one-to-one onto the prompt's own test list. The deductions are for scope, not for correctness: three explicitly required features are absent, the debug panel is a stub, the Playwright suite does not implement the five scenarios the prompt mandated, and the README's compliance table presents the delivery as fully conformant by omitting what is missing.

| Rubric | Score | Why |
|---|---:|---|
| R1 — arena, map data, collision | 14/15 | `mapData.ts` is a genuine single source; unit tests prove ≥12 cover solids, walkable spawns, a connected nav graph with no wall-crossing links, two west/east routes to centre, ramps to the platform, and no spawn-to-spawn line of sight. |
| R2 — combat, hitscan, scoring | 18/20 | Wall-priority resolved before target selection, head sphere + body AABB with nearest-part choice, 20/50 damage, HP floor, friendly fire excluded at selection time, `+1` hit / `+3` kill guarded by `hp<=0 && alive`. No visual hitmarker or damage numbers (audio cue + target flash only). |
| R3 — AI, perception, navigation | 16/20 | Perception is genuinely fair (100° cone via `fovHalfDeg: 50`, range limit, eye→torso LOS raycast; hearing is separate and cannot target). But 7 of the 8 required states exist — no distinct `alert` state — and AI state/target/last-known-position are not inspectable anywhere. |
| R4 — HUD, spectate, results, accessibility | 8/15 | HUD, leaderboard, killfeed, spectator cycling, free-cam fallback and full restart reset are implemented and tested. **Director mode, reduced-motion and the no-WebGL fallback are entirely absent**, and the debug panel shows only FPS. |
| R5 — visual and audio | 8/10 | Procedural low-poly geometry, WebAudio synthesis gated behind the first gesture, particle pooling, tracers and muzzle flash are present; art direction judged only from the four committed screenshots. |
| R6 — verification evidence | 6/10 | 31/31 unit tests and 4 screenshots are strong, but the E2E suite implements different, weaker scenarios than the five the prompt mandated. |
| R7 — code quality and review readiness | 7/10 | Clean pure-logic/render separation, intent-bearing comments, typed modules. Offset by the README compliance table, a dead `fovDeg` constant beside `fovHalfDeg`, and an unaddressed 561 kB single chunk. |
| **Total** | **77/100** | **Request Changes; FE-20, QA-08, DOC-01 and UX-11 are P1.** |

## Independent verification — 2026-09-01

| Check | Result | Evidence |
|---|---|---|
| Production build | Pass with warning | `npm run build` exited 0; 561.34 kB JS / 146.34 kB gzip, standard >500 kB chunk warning. |
| Unit tests | Pass | `npx vitest run` → 31/31 across 4 files in 227 ms. |
| E2E | Pass | `npx playwright test` → 5/5 in 5.5 s (headless Chromium + WebGL). |
| Screenshots | Present | `screenshots/01-arena.png`, `02-combat.png`, `03-spectator.png`, `04-results.png`. |
| Codebase size | 4,111 lines TypeScript | 20 source files + 5 test files. |

## Findings

### P1 — blocks acceptance

**FE-20 · No-WebGL fallback is absent.** The prompt requires a fallback that shows match state, controls and an unsupported-3D message, explicitly "不能白屏或报错". No `WebGLRenderingContext` probe or fallback branch exists anywhere in `src/`.

**QA-08 · The Playwright suite does not implement the mandated scenarios.** Five tests exist and pass, but they are not the five specified:

| Prompt scenario | Delivered |
|---|---|
| 1 — pointer lock, WASD, mouse turn, assert player cannot pass a named wall | Replaced by a boot/HUD/pixel-diversity smoke test. **No movement or wall-collision assertion.** |
| 2 — unobstructed body+head hits, assert HP, hitmarker, score, leaderboard sync; then behind wall | Partially: a loose `damaged \|\| scored` OR assertion and a magazine decrement. No head/body distinction, no leaderboard sync. |
| 3 — death, cannot fire, spectate ally, **switch target**, free-cam fallback | Only death + `spectate.mode !== 'alive'` + banner text. Switching and fallback exist in unit tests, not E2E. |
| 4 — blue wins, freeze, results leaderboard, restart resets 8 units | Closest match; asserts winner, title and `alive && hp === 100`, but not score reset to 0. |
| 5 — seeded AI-vs-AI fast-forward: match terminates, no negative HP, no double scoring, no stuck state | **Missing entirely**; the slot is occupied by a wall-occlusion test (which is scenario 2's second half). |

**DOC-01 · README compliance table misrepresents completeness.** `README.md:203-220` presents 15 requirement rows, all `✅`, and simply omits director mode, reduced-motion and the no-WebGL fallback. The prompt's final acceptance item explicitly forbids presenting unimplemented work as done; a compliance table that silently drops the unmet rows is misleading by omission.


**UX-11 · 结算画面文字重叠（2026-09-01 补充，来自截图复核）。** `screenshots/04-results.png` 显示 `BLUE WINS` 与 `ENEMY DOWN` 互相压字，其下还叠一层半透明 `VICTORY`；结算排行榜表头渲染为 `PlayerK / S`，行文本与背景常驻排行榜重叠，实际不可读；kill feed 覆盖小地图下方。该缺陷存在于 agent 自己提交的验收截图中却未被其发现，也未被任何 E2E 断言捕获——E2E 只断言了 `.nb-res-title` 的文本等于 `BLUE WINS`，不检查布局。这同时是 R4 与 R6 扣分的实证。

### P2

- **FE-21 · Director mode not implemented.** No occurrence in `src/`.
- **A11Y-04 · reduced-motion not implemented.** No `prefers-reduced-motion` handling.
- **UX-10 · Debug panel is a stub.** Only `nb-fps` exists; the prompt requires live active units, active particles, alive counts and AI state distribution, plus inspectable AI state/target/last-known-position.
- **FE-22 · No visual hit feedback.** `hitmarker` appears only as an audio comment (`src/game/audio.ts:86`); there is no crosshair hitmarker element and no damage numbers. Target flash (`flashUntil`) is implemented.
- **FE-23 · AI state machine is 7 of 8 states.** `AIStateName` = `assemble | patrol | engage | retreat | search | cautious | dead` (`src/game/types.ts:135-142`); the required `警戒/alert` state is absent, and AI unit tests cover 5 behaviours rather than every transition.
- **QA-09 · Bundle warning unaddressed.** 561 kB single chunk; no code splitting or `chunkSizeWarningLimit` decision.
- **CLEAN-01 · Dead constant.** `CONFIG.ai.fovDeg: 100` sits beside the authoritative `fovHalfDeg: 50` (`src/game/constants.ts`) and is unused — an easy source of a future 200° FOV bug.

## What went right (worth keeping as a pattern)

- **Map data really is the single source.** Collision, raycast occlusion, nav graph and minimap all derive from `mapData.ts`, and the unit tests assert the derivations rather than the renderer.
- **Correctness invariants are enforced at the right layer.** `resolveShot` rejects same-team targets before distance comparison, and wall distance is compared against candidate distance so a wall between shooter and target always wins (`src/game/combat/hitscan.ts`).
- **Scoring cannot double-count.** One `fireWeapon` call consumes one round and awards at most one `+1` (and one `+3` behind an `alive` guard).
- **The unit suite is the strongest seen in this test set** — 31 tests covering nav connectivity, spawn LOS, spread determinism by seed and shot index, magazine/reload locking, scoring rules and spectator cycling.

## 改进方向：UI 与配色（2026-09-01 设计评审）

以下为表现层的具体整改方向。全部限于渲染与 HUD，不触及已通过测试的战斗、AI 与地图逻辑。

### 贯穿全局的规则

> **饱和度只留给「人」和「命中反馈」。地图只用明度，不用色相。**

眼睛捕捉到任何鲜艳的东西 = 那里有个人。当前构建破坏了这条规则：蓝队 `0x2f7bff`（色相 217°）与墙体 `0x1c2438`（色相 220°）属同一色相家族，仅有明度差，**蓝队实际上被伪装进了自己的地图**。红队可辨、蓝队不可辨，这不是审美问题而是团队射击游戏的目标识别失效。下列各项都是这条规则的推论。

### 1. 环境：抽掉色相，换取明度差（最高优先级）

五种建筑现挤在 8–17% 明度、同一蓝色相内；掩体与墙的明度比仅 1.4:1。

| 用途 | 现值 | 建议 | 理由 |
|---|---|---|---|
| boundary | `0x11141e` | `#0E1013` | 最暗，边界应退入背景 |
| wall | `0x1c2438` | `#1A1D22` | 饱和度 38% → 8%，去蓝味 |
| **cover** | `0x262f45` | **`#3A4048`** | 提亮至 25%；掩体是需要瞬时判断的对象，应为最亮建筑（比值提到 2.3:1） |
| ramp | `0x232c42` | `#2A2F36` | 居中，使垂直路线可辨 |
| platform | `0x2b3a5e` | `#333A44` + emissive `#16324f` @0.35 | 唯一允许带色相的建筑——它是被争夺的高地 |

原则：每一类比上一类亮约 1.5×。证据位置：`src/render/renderer.ts:88-97`。

### 2. 队伍色：把蓝队旋转到青色

```
BLUE  body 0x2f7bff → #18E0FF   head 0x9fd0ff → #B8F6FF   emissive #0A6E8C
RED   body 0xff2f5e → #FF3D63   head #FFC9D4
```

青 190° 对品红红 348°，相距 158°，环境为 210°/8% 饱和；两队同时可辨，互不占优。证据位置：`src/render/renderer.ts:12-13`。

另建议为每个角色增加**地面队色圆环**（半径 0.5 m，加色混合，透明度 0.35）。低多边形下角色仅为方块，轮廓识别慢；地面环在掩体后部分遮挡时仍可见，正是题面要求的「非 UI 辅助方式区分阵营」。

### 3. 灯光：题面要求的暖色工业照明当前完全缺失

- `HemisphereLight` 地面色 `0x0a0a12`（近黑，等于无反弹）→ `#241C14` 暖灰。冷天光 + 暖地面反弹是让混凝土读作混凝土而非蓝塑料的关键。
- 新增 **4 盏钠灯** `#FFB45A`，intensity 70、distance 26、decay 2、y=5.5，置于两个迷宫拐角与两条侧翼通道口——这是题面「迷宫转角须有清楚的明暗层次」所要求而当前缺失的部分。
- `Fog(near 22, far 72)` → `near 38, far 95`。竞技场仅约 64 单位宽，22 m 起雾等于把交火区糊掉。
- **当前未设置 tone mapping**，这是画面呈现为「发灰的暗」而非「有层次的暗」的真正原因。单点收益最大的一处改动：

```js
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;
```

证据位置：`src/render/renderer.ts:57-58, 74-84`。

### 4. HUD 排版：当前为默认字体栈

`'Segoe UI', system-ui, sans-serif`（`src/render/hud.ts:8`）是 Windows 优先栈，在本机静默退回 `system-ui`，等于未做选择。HUD 有两类互不相同的排版任务：

- **数据**（血量/弹药/比分/排行榜）需等宽且不跳动：`ui-monospace, 'SF Mono', 'Cascadia Mono', monospace` + `font-variant-numeric: tabular-nums`（当前仅两个选择器有，应铺开至全部数字）。
- **播报**（kill feed / SPECTATING / BLUE WINS）需要宽而有底气的声音。题面禁止外部字体，因此不引入字体文件，改以排版处理建立语气：`text-transform: uppercase; letter-spacing: .18em; font-weight: 800`，配下方 1px 青色规则线——军用刻印标牌的语气，与「未来工业竞技场」一致。

### 5. 血量与弹药的层级是反的

当前 HP 30px、弹药 34px——弹药比血量还大。FPS 中「我是否将死」永远优先于「是否需要换弹」。

- HP 数字 30 → **46px**，weight 800；弹药 34 → **26px**，opacity 0.8。
- 血条 240×14 → **320×6，切为 4 段 ×25 血、间隔 2px**。分段条在余光中是「数格子」，连续条是「估长度」，前者显著更快。
- 颜色按状态跳变而非固定渐变：>60% `#2FD08A`、25–60% `#FFC93C`、<25% `#FF3D63` + 0.9 s 脉冲。当前恒为同一绿色渐变，血条从不报警。

证据位置：`src/render/hud.ts:11-14`。

### 6. 结算画面重叠的根因与改法（对应 P1 UX-11）

三层绝对定位落在同一条带：`.nb-msg`（`top:34%`，40px）、`.nb-res-title`（56px）、以及未关闭的常驻 `.nb-board`。

1. 进入 `results` 时将 `.nb-msg`、`.nb-board`、`.nb-killfeed` 置为 `hidden`——它们是局内 chrome，不应存活到结算。此步即解决 `BLUE WINS / ENEMY DOWN / VICTORY` 叠字。
2. `.nb-board-lg .h { gap: 16px }`——表头挤成 `PlayerK / S` 是因 `.h` 使用 `justify-content: space-between` 而在 420px 宽下两个 span 无最小间距。
3. 结算面板给出真正的容器：`display:grid; gap:28px; place-items:center; padding:40px; max-width:560px`。

### 7. 命中反馈规格（对应 P2 FE-22）

- **准星 hitmarker**：4 条 45° 短线，长 8px、宽 2px，自中心 4px 扩张至 9px 用 90 ms，再淡出 120 ms。身体命中 `#FFFFFF`，爆头 `#FFC93C`。这是当前手感缺失最严重的一处。
- **伤害数字**：命中点世界坐标投影至屏幕，上飘 42px、550 ms 淡出；身体 18px，爆头 26px 且用 `#FFC93C`。
- **击杀**：准星 90 ms 内放大 6%；kill feed 行自 `x:-12px` 滑入。

### 8. 签名元素：把小地图做成「要塞蓝图」

底 `#0A0D12`，结构线 1px `#2A3A5A`，两个出生区为 12% 队色填充楔形，存活单位 3px 实心点、阵亡为空心环。数据已全部在 `mapData.ts` 中，纯表现层改动。这是「Neon Bastion」这个名字唯一可以被兑现的地方。

### 9. 减一件配饰

移除 `.nb-title` 的三段彩虹渐变（`#5bb0ff → #c48bff → #ff6d8a`，`src/render/hud.ts:44`）。紫粉渐变标题是最模板化的选择，且引入了紫色这一全游戏别处不存在的第三色系。改为青到白，或平涂 `#E8F4FF` 配青色规则线。

### 若只做三件事

按收益排序：**加 tone mapping** → **把 cover 提亮到 `#3A4048`** → **蓝队改青色 `#18E0FF`**。三项合计约二十行改动。
