---
type: Note
title: Neon Bastion — Round 2 review and human-playthrough correction
status: current
description: Second independent review of Neon Bastion after the agent applied the full design review (87/100 scored blind), corrected to 74/100 once a human playthrough exposed inverted strafe, invisible tracers and a fabricated controls table that all survived 33 unit tests and 6 E2E.
tags: [qwen3.8, mlx-dspark, dflash2, pi, threejs, typescript, code-review, fps, benchmark, playtest, methodology]
timestamp: 2026-09-02T07:40:00Z
---

> **本页为第二轮。** 第一轮评审、Round 1 findings 与 UI/配色设计评审段见 [Round 1](devlog-projects-qwen3-8-test-notes-neon-bastion-round-1-review-2026-09-01.md)。

# Round 2 — 独立复核（2026-09-02）

被评审提交：`1badf4c "Apply design review: P1 blockers + P2 items + UI/color pass"`，基线 `545c546 "baseline: pre-review delivery (77/100 Request Changes)"`，工作树干净。17 files changed, 1,315 insertions(+), 478 deletions(-)。本轮所有数字均由评审方独立复跑，未采信 agent 自述。

## 结果

**Verdict: Request Changes — 87/100 (8.7/10)**，较 Round 1 的 77/100 提升 10 分。

Round 1 的四个 P1 与全部 P2 均已真实修复，且修复质量高于预期——E2E 是按题面重写的而非改名，配色数值与设计评审段逐项一致。仍为 Request Changes 的唯一原因是发现了一个**此前被叠字掩盖的 P1**：所有覆盖层（开始/暂停/结算）的文字实际渲染为纯黑 Times，在近黑背景上不可读，而现有 E2E 在结构上无法捕捉。

| Rubric | R1 | R2 | 变化说明 |
|---|---:|---:|---|
| R1 — 地图与碰撞 | 14/15 | 14/15 | 未改动。 |
| R2 — 战斗与命中 | 18/20 | **19/20** | hitmarker + 伤害数字 + 金色受击闪烁已实现（`02-combat-hit.png` 可见）。 |
| R3 — AI 与导航 | 16/20 | **18/20** | 补齐 `alert` 状态；调试面板暴露 state/目标/最后已知位置；新增 3 seed 全场终止性回归。仍未逐条转换测试。 |
| R4 — HUD/观战/结算/可访问性 | 9/15 | **11/15** | 导演模式 F2、reduced-motion、no-WebGL fallback、调试面板全部补齐（+4），但覆盖层文字不可读（−2）。 |
| R5 — 视觉与音频 | 8/10 | **9/10** | 配色分层、ACES、暖色钠灯、蓝图小地图全部落地。 |
| R6 — 验证证据 | 6/10 | **8/10** | E2E 已对齐题面 6 场景、3 轮连跑稳定；扣分见「渲染断言是弱代理」。 |
| R7 — 代码质量 | 7/10 | **8/10** | `ENV` token 化、死常量移除、README 诚实；扣分为覆盖层作用域缺陷。 |
| **Total** | **77** | **87** | **Request Changes；P1 为 UI-02。** |

## 独立验证

| 检查 | 结果 | 证据 |
|---|---|---|
| `tsc --noEmit` | Pass | exit 0。 |
| `npm run build` | Pass with warning | 仍有 >500 kB 单 chunk 警告，README 已记录为已知取舍。 |
| 单元测试 | Pass | 33/33（4 文件），较 R1 的 31 增加 2 条 AI 测试。 |
| Playwright E2E | Pass | 6/6，**连续 3 轮**均 7.0–7.7 s 全绿，未见 flake。 |
| 截图 | 5 张 | 新增 `06-fallback.png`；`02-combat-hit.png` 重命名并含 hitmarker。 |

## Round 1 遗留项的处置

| ID | 状态 | 复核证据 |
|---|---|---|
| FE-20 no-WebGL fallback | **已修复** | `probeWebGL()` + `?nogl=1`（`src/app.ts`）；`06-fallback.png` 显示中英双语说明、实时 2D 蓝图地图、比分与完整操作表，非白屏。 |
| QA-08 E2E 场景 | **已修复** | 6 个场景按题面重写：①W 前进 + 断言被柱体挡住（`z>14.5` 未穿墙）②身体 20 / 爆头 50 / 得分 +1 / hitmarker / 排行榜文本 / 墙后零伤害 ③死亡不可开火 → 观战 → Q/E 切换 → 自由镜头 ④冻结 + 8 行结算 + restart 全复位 ⑤定 seed 终止性 + `totalScore == hitScore + 3*kills` 全局不变量 ⑥fallback。 |
| DOC-01 README | **已修复** | 全 ✅ 合规表已删，改为 Status + What's implemented + **Known limitations**（headless pointer lock、rAF 节流、bundle、AI 强度四条）。 |
| UX-11 结算重叠 | **已修复（结构）** | `.nb-root.nb-results` 隐藏 msg/board/killfeed/team/bottom/spectate/cross；E2E 断言 `.nb-msg` 与 killfeed 不可见。但见下方 UI-02。 |
| FE-21 导演模式 | 已实现 | F2，`src/app.ts` + `hud.ts`。 |
| A11Y-04 reduced-motion | 已实现 | CSS + JS，覆盖 `app.ts`/`hud.ts`/`renderer.ts`。 |
| UX-10 调试面板 | 已实现 | `01-arena.png` 可见 FPS/P/FX/存活数/AI 状态分布，以及每单位 state + 目标 + 最后已知坐标。 |
| FE-22 命中反馈 | 已实现 | `02-combat-hit.png` 金色 hitmarker。 |
| FE-23 alert 状态 | 已实现 | `AIStateName` 增 `alert`；新增单测「enters alert when it hears a threat it cannot see」，并顺带修复了一处中央高台永久僵持。 |
| CLEAN-01 死常量 | 已修复 | `fovDeg` 已从 `constants.ts` 移除。 |
| ART-01 / ART-02 / UI-01 | 已实现 | 数值与设计评审段完全一致：`ENV` = boundary `0x0e1013` / wall `0x1a1d22` / ramp `0x2a2f36` / platform `0x333a44` / cover `0x3a4048`；队色 `0x18e0ff` vs `0xff3d63`；ACES + exposure 1.15 + SRGBColorSpace；`HemisphereLight(0x2a3550, 0x241c14)`；`0xffb45a` 钠灯；`Fog(38, 95)`；HP 层级与分段血条、蓝图小地图均落地。 |

## 新发现

### P1 · UI-02 — 覆盖层文字渲染为纯黑 Times，实际不可读

`.nb-screen` 被挂到构造函数的 `container`（即 `#app`），与 `.nb-root` 是**兄弟节点**而非其子节点（`src/render/hud.ts:184` vs `:250`）。而全部设计 token 定义在 `.nb-root` 上（`--cyan/--red/--gold/--ink/--data` 与 `color`、`font-family`）。因此覆盖层既不继承颜色与字体，也解析不到任何 `var()`。

对运行中的 preview 用 Playwright 读计算样式，实测：

```
.nb-root   --cyan = #18e0ff
.nb-screen --cyan = (未定义)        parentElement.className = ""
.nb-res-title  "BLUE WINS"  color = rgb(0,0,0)    font = Times
.nb-sub        "Victory"    color = rgb(0,0,0)    font = Times
.nb-row .sc    "0 / 0"      color = rgb(0,0,0)    font = Times
.nb-row.me .nm "Vega"       color = rgb(255,255,255)   ← 显式设色，唯一可读
.nb-cta        "PLAY AGAIN" color = rgb(234,252,255)   ← 显式设色，可读
```

`hud.ts:312` 的 `title.style.color = 'var(--cyan)'` 因变量不在作用域内而失效，回落到继承的黑色；`screenshots/04-results.png` 与这份计算样式完全吻合——只有 Vega 与 PLAY AGAIN 可读，其余隐没在背景里。

**该缺陷在基线中已存在**（`545c546` 同样是 `container.appendChild(this.screenEl)`），Round 1 被叠字掩盖。但本轮把颜色与字体迁入 CSS 变量后**显著恶化**：这一轮的排版与配色工作全部无法到达任何覆盖层，开始/暂停/结算三屏都在用浏览器默认衬线体。

修复只需一行：把 `container.appendChild(this.screenEl)` 改为 `this.root.appendChild(this.screenEl)`（`.nb-screen` 自带 `pointer-events:auto`，可重新启用输入），或将 token 块提升到 `#app` / `:root` 作用域。

**为什么测试抓不到**：Playwright 的 `toHaveText` 与 `toBeVisible` 对黑底黑字同样通过。这与 Round 1 是同一类失效——命令 exit 0 不等于界面可用。

### P2 · QA-10 — 「竞技场已渲染」的断言是弱代理

E2E 场景 1 以「CDP 截图字节数 > 20000」证明 3D 场景非空白（agent 自述其校准为「blank ≈ 4KB, real ≈ 100KB」）。但 `01-arena.png` 为 87,928 字节、断言通过，而**画面中 3D 场景全黑**，字节几乎全部来自新做的 HUD（蓝图小地图、调试面板、排行榜）。HUD 变丰富后该校准已失效。

同时该图不满足题面对首张截图「开局中央区」的要求——玩家出生朝向暗角。建议改为断言 WebGL canvas 区域内的像素方差或非背景色像素占比，并让截图取自面向中央高台的机位。

## 评价

这一轮的修复质量显著高于 Round 1 的自评可信度。E2E 是**按题面重写**而非改名交差：场景 5 的 `totalScore == hitScore + 3*kills` 全场不变量、以及 3 seed 的终止性回归，都超出了题面的字面要求；`alert` 状态的补齐还顺带修掉了一处真实的 AI 僵持。README 从「15 行全 ✅」变成带 Known limitations 的诚实文档，是本轮最值得肯定的转变。

Round 1 记录的失效模式——「对照自己写的测试验收，而非对照题面验收」——在本轮已明显收敛。但 UI-02 说明另一条边界仍未跨过：**agent 仍然只验证能被断言的东西，而不验证屏幕上实际呈现的东西**。它自己保存的 `04-results.png` 里，标题就是黑的。

---

# Round 2 修正 — 人工游玩复核（2026-09-02）

用户亲自游玩一局后报告 6 项问题。**全部为真，且本人在 Round 1 与 Round 2 中一项都未发现。** 原因是评审方法的结构性缺口：两轮都只做了静态代码审查、headless 测试复跑与截图检视，而题面「最终验收」第 2 条要求的**人工实际游玩**从未被任何一方执行——agent 不能玩，评审方也没有玩。

**修正后：74/100（7.4/10），仍为 Request Changes。**

需要说明的是，这不代表 Round 2 的修复让产品变差。Round 2 的修复全部是真实的。77（R1）与 87（R2）都是在同一套够不着实际游玩的证据基础上给出的；下列缺陷在两轮中一直存在。若 R1 当时能游玩，其分数同样会更低。

| Rubric | R2 (盲评) | 修正 | 原因 |
|---|---:|---:|---|
| R1 — 地图与碰撞 | 14/15 | 14/15 | 未受影响。 |
| R2 — 战斗与命中 | 19/20 | **14/20** | A/D 平移方向取反；曳光不可见；无枪口火焰；打墙无火花。 |
| R3 — AI 与导航 | 18/20 | 18/20 | 未受影响。 |
| R4 — HUD/观战/结算/可访问性 | 11/15 | **10/15** | UI-02 未解决，叠加操作说明与实现不符。 |
| R5 — 视觉与音频 | 9/10 | **6/10** | 实机画面过暗难以辨读；战斗反馈几近于无。 |
| R6 — 验证证据 | 8/10 | **6/10** | 33 单测 + 6 E2E 全绿，却放过了平移反向与不可见曳光——测试套件结构上看不见「游玩」。 |
| R7 — 代码质量 | 8/10 | **6/10** | README 凭空编造 6 个不存在的操作，比 R1 的「漏写」更严重。 |
| **Total** | **87** | **74** | **Request Changes；P1 为 CTRL-01、FX-01、DOC-02。** |

## 新发现

### P1 · CTRL-01 — A/D 平移方向取反

`src/game/match.ts:150-153` 的前向为 `(sin θ, cos θ)`，相机使用同一约定（`src/render/renderer.ts:381-383`）。Three.js 右手系 Y-up 下，屏幕右方应为 `f × up = (-cos θ, sin θ)`；代码写的是 `(cos θ, -sin θ)`，恰为其负向，因此 A 向右、D 向左。

修复：`rx = -Math.cos(p.yaw); rz = Math.sin(p.yaw);`

**为何测试未发现**：E2E 场景 1 只断言 W 前进（`z1 < z0 - 1`），从未测试 A/D；33 个单测中没有任何 strafe 方向断言。建议补一条「yaw=0 时按 D，x 应增大」的纯逻辑单测。

### P1 · FX-01 — 战斗视觉反馈实际不可见

三处叠加，题面要求的「枪口火焰、曳光/弹道痕迹、撞墙火花」实现了不到一半：

1. **曳光起点是射手眼睛**（`src/app.ts:241` `eyeOf(shooter)`），对玩家即相机原点。起点位于相机的线段投影为屏幕中心一点，第一人称下不可能被看见——他人的曳光可见，自己的永远不可见。应自枪口偏移发出。
2. **曳光寿命 0.09 s**（`renderer.ts:272`），60 fps 下约 5 帧，处于可感知边缘。
3. **枪口火焰完全未实现**：`constants.ts:87` 存在 `muzzleLife: 0.05`，但全 `src/` 无任何使用处——又一个死常量（同 R1 的 `fovDeg`）。
4. **撞墙无火花**：`spawnHitSpark` 仅在 `res.kind === 'unit'` 时调用（`app.ts:243`）。

音效调用链经查完整（`audio.init()` 由开始屏真实点击触发，master gain 0.5），静态无法解释用户报告的静音，待用户侧控制台确认。

### P1 · DOC-02 — README 记载 6 个不存在的操作

| README | 实际 |
|---|---|
| `Click` / `Space` 射击 | Space 为**跳跃**；射击仅左键 |
| `C` Crouch | 不存在 |
| `1` / `2` Knife / Pulse rifle | 不存在 |
| `Q` Melee | 实为**观战上一个** |
| `Tab` 排行榜 | 不存在 |
| `P` Pause / `M` Mute | 不存在 |

实际绑定仅：WASD/方向键、Shift、Space、R、Q、E、F2、F3/`` ` ``；已实现的 `E`（观战下一个）反而未记载。

这比 Round 1 的 DOC-01 更严重：R1 是**遗漏**未实现项，本轮是**虚构**功能。Round 2 复核中本人只检查了 Known limitations 一节，未将 Controls 表与 `applyKey` 逐条比对，属复核疏漏。

### P2 · ART-03 — 实机画面过暗（设计建议本身的缺陷）

设计评审段建议的 wall `#1A1D22` 仅约 11% 明度，当时假定钠灯与高台自发光足以建立层次，**但未对整体画面设定亮度下限**。实机游玩下画面难以辨读。修正建议：`toneMappingExposure` 1.15 → 1.5；wall 提至 `#23272E`；新增 `AmbientLight(0x3a4a6a, 0.25)` 保证无纯黑区域；钠灯强度 150 → 220 并增至 6 盏。

### 非缺陷 · 全自动射速与题面一致

用户报告「点击鼠标像机关枪，两三秒打空」。`fireInterval: 0.085`（11.7 发/秒）× 30 发 = 2.55 秒，与观察吻合；但题面第 3 节明确要求「玩家武器为一把自动步枪」，故全自动为**符合规格**。若改为半自动（一次点击一发）属需求变更而非修复，需用户拍板。判断：真正造成「手感不对」的是 FX-01——没有曳光、枪口火焰与命中反馈的全自动，等同于对着虚空扫射。

### 非缺陷 · Sprint 生效但无反馈

`sprintSpeed 8.4` vs `walkSpeed 5.4`（1.56×）确实生效，但无 FOV 推移、无 HUD 指示、无音效变化，因此不可感知。属反馈缺失，建议加入 FOV 由 75° 平滑推至 82° 与轻微镜头晃动。

## 方法论结论（本次评审最重要的产出）

Round 1 记录的失效模式是「agent 对照自己写的测试验收，而非对照题面验收」；Round 2 补充为「agent 只验证可断言的东西，不验证屏幕上实际呈现的东西」。本次修正暴露了第三层，且这一层属于**评审方**：

> **静态审查 + headless 测试 + 截图检视，三者叠加仍然无法验证「可玩性」。** 平移反向、不可见曳光、操作说明造假——这三项在 33 个单测与 6 个 E2E 全绿、5 张截图俱全的情况下毫发无损地通过了两轮评审。

对后续 benchmark 的直接影响：**任何交互式交付的验收结论，在人工游玩之前都应标注为「未完成」，而不是给出分数。** 建议为此类题目引入一个强制的人工验收环节，其结论优先于一切自动化证据。
