---
type: Note
title: Neon Bastion — Round 3 verification (score withheld pending playtest)
status: current
description: Third-pass verification of Neon Bastion — every Round 2 fix independently confirmed, but a human playthrough then exposed that AI fire bypasses the event bus entirely (no tracer, flash, spark or sound for 7 of 8 units) and that the player gets no damage-taken feedback at all.
tags: [qwen3.8, mlx-dspark, dflash2, pi, threejs, code-review, fps, benchmark, playtest, methodology]
timestamp: 2026-09-02T10:45:00Z
---

> **本页为第三轮。** 前两轮见 [Round 1](devlog-projects-qwen3-8-test-notes-neon-bastion-round-1-review-2026-09-01.md) 与 [Round 2](devlog-projects-qwen3-8-test-notes-neon-bastion-round-2-review-2026-09-02.md)。

# Neon Bastion — Round 3 验证（评分暂缓至人工游玩）

被评审提交：`ad6545d "Fix round-2 review findings (4 P1, 2 P2) + sprint feedback"`，基线 `1badf4c`。13 files changed, +402/−76，工作树干净。

## 本轮不给分数——这是刻意的

Round 2 的方法论结论是：**静态代码审查 + headless 测试复跑 + 截图检视，三者叠加仍然无法验证「可玩性」**。A/D 反向、曳光不可见、操作说明造假三项，曾在 33 单测 + 6 E2E 全绿、5 张截图俱全的情况下通过了两轮评审。

若本轮再以同一套证据给出一个分数，等于立刻违背刚记录的结论。因此本页只回答「Round 2 的每条发现是否已修复」这个可证实的问题，**最终评分留待用户人工游玩后给出**，试玩清单见文末。

## 独立验证

| 检查 | 结果 | 证据 |
|---|---|---|
| `tsc --noEmit` | Pass | exit 0。 |
| `npm run build` | Pass with warning | 仍有 >500 kB chunk 警告，README 已记录为已知取舍。 |
| 单元测试 | Pass | **38/38（5 文件）**，较 R2 增加 5 条 movement 测试。 |
| Playwright E2E | Pass | 6/6，**连续 3 轮**均 7.4 s 全绿。 |
| 计算样式探针 | Pass | 评审方独立复跑（非 agent 自带断言），见下。 |

## Round 2 遗留项的处置

| ID | 状态 | 独立复核证据 |
|---|---|---|
| **UI-02**（P1 覆盖层黑字） | **已修复** | `hud.ts:255` 改为 `this.root.appendChild(this.screenEl)`。评审方探针实测：`.nb-screen` 的 parent 为 `nb-root nb-results`、`--cyan` 解析为 `#18e0ff`；`.nb-res-title` color `rgb(24,224,255)`（原 `rgb(0,0,0)`）、`.nb-sub` `rgb(230,238,251)`、`.nb-row .sc` 字体 `ui-monospace`。**Times 已完全消失。** |
| **CTRL-01**（P1 A/D 反向） | **已修复** | `match.ts:152-155` 改为 `rx = -Math.cos(p.yaw); rz = Math.sin(p.yaw);`，并附推导注释。新增 `tests/unit/movement.test.ts` 5 条：4 个朝向下的 D 向右、A 为 D 的镜像、D/A 无前后漂移。 |
| **FX-01**（P1 战斗反馈不可见） | **已修复** | 曳光起点移至枪口（`app.ts:249-253`，前 0.55 m / 眼下 0.12 m）；`spawnMuzzleFlash` 已实现（`renderer.ts:315`，池化）；`res.kind === 'wall'` 现在也触发火花（冷色，与命中单位的暖色区分）；`tracerLife` 0.09→0.18 s 并接入 CONFIG（原为死常量）；`maxParticles`/`hitKick`/`shotKick` 三个死常量已删除。`02-combat-hit.png` 可见曳光线、金色 hitmarker、火花，调试面板 `FX 5`。 |
| **DOC-02**（P1 README 虚构操作） | **已修复** | Controls 表与 `applyKey()` 逐条一致（Space=Jump、Q/E=观战、左键射击），并新增一行 **"Not yet implemented (honest list): crouch, melee, weapon switching, Tab leaderboard hold, `P` pause, `M` mute"**——把未实现项显式列出，正是题面要求的诚实度。 |
| **QA-10**（P2 渲染断言是弱代理） | **已修复** | 字节数代理已替换为**读取 WebGL canvas 实际像素**（`brightFrac` / `std` / `maxLuma`，采样 6 帧取最优），机位固定为面向中央高台。全黑画面现在会使测试失败。 |
| **ART-03**（P2 实机过暗） | **已修复但过头** | exposure 1.15→1.5、wall `#1A1D22`→`#23272E`、新增 `AmbientLight(0x3a4a6a, 0.25)`、钠灯 4 盏 @150→6 盏 @220。画面确实亮了，但见下方 ART-04。 |
| **FEEL-01**（P2 Sprint 无反馈） | 已实现 | FOV 78°→85° 平滑推移 + 头部晃动，reduced-motion 下禁用，并写入 Controls 表。可感知性待人工确认。 |

## 值得记录的一点：agent 把评审意见内化成了回归测试

新增的两条断言直接针对上一轮的失效机制，注释写着 *"toHaveText/toBeVisible pass for black-on-black, so assert computed style"*：

- 开始屏与结算屏均断言 **computed color 与 font-family**（`rgb(232,244,255)` / `rgb(24,224,255)` + `system-ui`）
- 场景渲染断言改为**画布像素统计**而非 PNG 字节数

这是本轮质量最高的部分：它没有只修 bug，而是补上了"能发现这类 bug"的测试。

## 新发现

### P2 · ART-04 — 暖色照明过量，违背题面的「深灰混凝土」方向

`01-arena.png` 与 `02-combat-hit.png` 显示地面呈明显橙棕色，暖色光主导整个画面；而墙体 `#23272E` 仍偏暗，形成"亮橙地面 + 近黑墙面"的割裂对比。题面第「视觉、声音与性能」节要求的是「深灰混凝土、蓝/红队伍灯带、**少量**暖色工业照明」——当前的暖色不是少量。

根因是四项提亮改动被同时叠加：exposure ×1.30、wall 明度 ×1.4、新增环境光、钠灯总功率 ×2.2（4×150 → 6×220）。**这份建议由本评审方给出且未说明应逐项验证**，责任在评审方。

建议回退方向（一次只调一项并看图）：钠灯先回到 4 盏 @180、exposure 降到 1.3，保留 AmbientLight 与 wall 提亮；若仍暗，优先提 wall 而非加暖光。

## 人工游玩清单（评分前置条件）

请按下列七项实玩确认，任一不通过都应记为新发现：

1. **A/D 方向** — 按 D 是否向右平移（这是 CTRL-01 的直接验收）。
2. **弹道可见性** — 开火时能否看到枪口火焰、曳光线；打在墙上是否有火花。
3. **音效** — 开火、命中、击杀、换弹是否有声。*Round 2 报告的静音在静态审查中无法复现，本轮未作改动，需实机确认。*
4. **结算画面** — 标题是否为青色可读、排行榜文字是否清晰（UI-02 验收）。
5. **画面亮度** — 是否仍偏暗，或已过度偏橙（ART-04 验收）。
6. **Sprint** — 按住 Shift 是否能感到 FOV 推移与镜头晃动。
7. **射击手感** — 全自动是否仍觉得不对。*注：题面写的是「自动步枪」，改半自动属需求变更，需用户拍板。*

---

## 人工游玩结果（2026-09-02，用户实测）

用户按上方清单实玩，报告：**只有玩家自己的弹道有打击效果与音效；所有 AI 角色的射击没有任何反馈；玩家死了不知道是怎么死的；扣血也没有任何提示，被打到了不知道发生了什么。**

经复核，**全部属实**，且根因是一处架构性缺陷加一处功能空白。

### P1 · FX-02 — AI 射击完全绕过事件总线，因而无任何表现

`src/game/ai/aiController.ts:213` 直接调用 `fireWeapon(...)`：

```ts
fireWeapon({ units: ctx.units, solids: ctx.solids, shooter: unit, aim, now, seed: ctx.seed });
```

而所有表现层事件由 `Match.emitShot()`（`src/game/match.ts:228-249`）发出——玩家的开火路径经过它，**AI 的不经过**。后果逐条对应用户的观察：

| 表现 | 玩家开火 | AI 开火 |
|---|---|---|
| `{type:'shot'}` 事件 | ✅ | ❌ 从不发出 |
| 曳光线 / 枪口火焰 | ✅ | ❌ |
| 命中火花（单位与墙面） | ✅ | ❌ |
| 枪声（含距离衰减） | ✅ | ❌ |
| `{type:'hit'}` 事件 | ✅ | ❌ |
| kill feed | ✅ 完整（含爆头标记） | ⚠️ 仅靠 reaper 兜底 |

伤害本身是生效的——`fireWeapon` 内部直接改 `target.hp`，所以玩家会掉血、会死，但整个过程在视觉与听觉上完全静默。这正是「不知道怎么死的」。

kill feed 之所以仍有内容，是因为 `match.ts:204-223` 有一条 reaper 兜底：扫描 `hp<=0` 的单位并用 `causeId` 补一条记录。但该路径信息降级——`headshot` 恒为 `false`，killer 取不到时写 `'???'`。

修复方向：让 AI 的开火也走 `Match` 的统一路径（把 `fireWeapon` 的调用移入 `Match` 并在其后调用 `emitShot`，或让 `aiController` 通过回调把 `FireResult` 交回 `Match`）。修完后 AI 的曳光、枪口火焰、火花与枪声会自动全部生效，因为 `app.ts` 的 `onEvent` 本就不区分射手身份——它只在 hitmarker/伤害数字处判断 `e.shooterId === 0`。

**为何三轮评审与全部测试都没发现**：单元测试直接调用 `fireWeapon` 验证伤害与计分，本就绕过事件层；E2E 通过 `__teamArenaTest.shoot()` 驱动玩家射击，走的是玩家路径；6 个 E2E 场景中没有任何一条断言「AI 开火时应产生表现事件」。**测试覆盖了"AI 会造成伤害"，从未覆盖"AI 开火看得见"。**

### P1 · FX-03 — 玩家受击方没有任何反馈，且相关规格常量在 Round 3 被删除

两层问题：

1. **`app.ts` 从不处理 `'hit'` 事件。** 其 `onEvent` 只分支 `'shot'`/`'kill'`/`'reload'`/`'end'`（`src/app.ts:243,270,278,280`）。即便 AI 走通了事件总线，玩家被击中时仍不会有屏幕红闪、伤害方向指示、痛觉音效或镜头冲击——这些**一项都未实现**。

2. **Round 3 把两个规格常量当作死常量删除了**（`git show ad6545d -- src/game/constants.ts`）：

   ```
   -  hitKick: 0.06,  // camera kick on being hit
   -  shotKick: 0.02, // camera kick per shot (recoil pitch)
   ```

   它们「死」是因为**功能从未实现**，而非冗余。题面第「竞技场与镜头」节明确要求：「第一人称镜头应有轻微移动起伏、**受击镜头冲击**与**枪口后坐**」。复核确认代码中确无任何后坐力实现（`applyLook` 只处理鼠标输入）。删除常量等于抹去了这两项未实现规格的最后线索。

   > ⚠️ 责任说明：Round 1 由评审方指出 `fovDeg` 为死常量（该项确为已实现值的冗余别名），Round 3 中 agent 将此推广到 `hitKick`/`shotKick`。评审方当时未区分「冗余别名」与「未实现功能的占位常量」，此处有诱导责任；但删除规格追踪线索而非实现功能，判断责任在 agent。

修复方向：实现受击反馈（方向指示器 + 短促红色暗角 + `hitKick` 镜头冲击 + 痛觉音效）与开火后坐（`shotKick` 累积 pitch 抬升并平滑回落），并恢复这两个常量。

### 对前三轮结论的影响

FX-02 是本项目迄今**最严重的单一缺陷**——它使 4v4 中 7/8 的角色在战斗中完全无声无影，直接摧毁题面「命中反馈」「可读性」两节的核心要求，也解释了用户从第一次试玩起就反复表达的「没有打击感」。

它同时第三次印证了同一条方法论：Round 1「对照自己写的测试验收」→ Round 2「只验证可断言的东西」→ Round 3「测试覆盖了因果，从未覆盖表现」。三轮的决定性缺陷全部由**人工游玩**发现，无一由自动化证据发现。

PLAY-01 清单的其余各项（A/D 方向、结算可读性、亮度、Sprint 手感、音效有无）在本次反馈中未被单独否定，但因 FX-02 使 AI 相关表现全部缺失，第 3 项「音效」的原始结论需在 FX-02 修复后重测。

---

## 玩法重设计规格（2026-09-02 用户裁定 · 优先于原始题面）

> **执行版拆分**：本节与 FX-02 / FX-03 已按依赖顺序切成 5 个自足任务，存于
> `~/Code/qwen3.8-tests/neon-bastion-followup-tasks.md`，供逐个投喂给 Pi。
> 顺序为 FX-02 → FX-03 → 射速+半自动 → 移除换弹 → 弹丸系统，每个任务 16–28 行。
> 拆分原因：一次性投喂本页全文（178 行）曾导致模型生成 32,768 token 思考、零正文，撞 `max_tokens` 上限被截断
> （pi session usage：`stop=length`、`output=32768`、thinking 118,179 字符、text 0 字符）。
> 该文件是本节的派生执行件，**规格以本节为准**；若两者冲突，改本节并重新生成拆分。

> **裁定：本节优先于 `test-prompts/3d-team-arena.md`。** 用户在实玩后决定以游戏体验为准，凡与题面冲突处一律以本节为准，实施方无需再回溯题面。原题面中「自动步枪 + 弹匣 + R 换弹」与「射击采用 hitscan」两处**作废**。
>
> 本节是给实施方（Pi）的规格，不是评审意见。

### 目标

把交火从「瞬时判定的扫射」改成「有节奏、可读、可闪避的对射」。核心是三件事：**降低射速**、**取消弹药管理**、**让子弹有飞行时间**。

### R1 · 射速统一为每秒 1 发

| 项 | 现值 | 目标 |
|---|---|---|
| `CONFIG.fireInterval`（玩家） | `0.085`（11.7 发/秒） | **`1.0`** |
| `CONFIG.ai.fireInterval` | `0.2`（5 发/秒） | **`1.0`** |

玩家与 AI 使用同一射速，不再有任何一方在射速上占优。

**连带必须处理**：`CONFIG.ai.burstMin: 3` / `burstMax: 6` 的连发概念在 1 发/秒下失效——一次 burst 会拖 3–6 秒。`aiController` 的连发状态机需简化为「到点开一枪」，并保留原有的反应延迟与命中率抖动。

### R2 · 完全移除换弹与弹药

删除 `magSize` / `reserveMax` / `reloadTime`、`R` 键绑定、空弹匣锁定、换弹音效与 HUD 的弹药与 `nb-reload` 显示。射速节流是唯一的开火限制，任何角色都不会「打空」。

HUD 右下角的弹药区可直接移除，或改为显示「下一发就绪」的冷却指示（后者更有助于 1 发/秒的节奏读取，建议采用）。

### R3 · 玩家改为半自动：一次点击一发

当前 `mousedown` 置 `fire = true`、`mouseup` 才清除，因此按住即连发。改为**边沿触发**：一次 `mousedown` 只产生一次开火意图，按住不重复；再次开火必须松开后重新按下，且仍受 R1 的 1 发/秒节流约束。

AI 侧不需要「点击」概念，按 R1 的节流开火即可。

### R4 · 子弹改为可闪避的飞行弹丸

**这一项确定走真弹丸系统。** 用户要求「看到子弹射过来还能躲开」，而 hitscan 在开火瞬间即完成判定，不存在可闪避的飞行时间——仅让曳光「看起来在飞」无法满足该目标。

代码中原本不存在弹丸速度概念（全仓无 `bulletSpeed`/`projectile`，`tracerLife` 只是曳光显示时长），故「现在的 50%」无对应现值。**建议起始值 `bulletSpeed: 60`（单位/秒），调参区间 45–80。** 推导：竞技场约 64 单位宽，典型交火距离 10–30 单位；60 单位/秒下飞行时间为 0.17 s（10 单位）至 0.5 s（30 单位）——中远距离可反应闪避，近距离仍难躲，符合「有威胁但可读」的手感。README 已将武器称作 pulse rifle，慢速能量弹与该命名自洽。

**实施要点（关系到现有验证能否保住）**：

1. **逐帧推进 + 连续碰撞**，不要用「点是否在墙内」的离散检测。每个逻辑 tick 对弹丸走过的线段调用一次现有的 `resolveShot` 式射线检测，**命中判定逻辑完全复用**——这样「墙体优先」「头/身命中体」「友军免伤」「单发只计分一次」四条不变量与其对应的单元测试可以原样保留，只是判定时机从「开火瞬间」变为「弹丸抵达时」。
2. **弹丸对象池**，寿命上限与最大存活数设上限，避免累积（现有 `sparks`/`tracers` 已有池化范式可直接沿用）。
3. **命中在弹丸抵达时才结算**：伤害、计分、`kill` 事件、hitmarker 全部延后到那一刻，射手可能在弹丸飞行途中已阵亡——需决定此时是否仍计分（建议**仍计分**，实现更简单且符合直觉）。
4. **AI 需要预瞄**：`aiController` 当前朝目标当前位置开火，在有飞行时间后将几乎打不中移动目标。需按 `目标位置 + 目标速度 × 预估飞行时间` 做一阶提前量，并保留现有的命中率抖动作为难度调节。
5. **曳光改为跟随弹丸**：曳光线段应画在弹丸的当前位置上（短拖尾），而不是开火瞬间画出完整弹道。这同时让 FX-02 修复后的 AI 弹道具备真正的可读性——玩家能看到子弹从哪个方向飞来。

### 与 FX-02 / FX-03 的关系

本次改动**必须在 FX-02 修复之后或与其同时进行**。FX-02（AI 开火绕过事件总线）未修时，AI 的弹丸同样不会产生任何表现，「看到子弹射过来」这一目标无从谈起——7/8 的角色仍将无声无影。FX-03（受击零反馈）同理：1 发/秒的节奏下每一次中弹都很关键，缺少受击提示会让新的战斗节奏更难读。

**建议实施顺序**：FX-02 → FX-03 → R1/R2/R3 → R4。

### 实施影响面

移除换弹牵动 **13 个文件**（全仓 `mag|reload` 命中）：

- 逻辑：`combat/weapon.ts`（`registerShot` 的弹匣与换弹锁定）、`combat/hitscan.ts`、`units/units.ts`、`match.ts`、`ai/aiController.ts`、`types.ts`
- 表现：`render/hud.ts`（弹药与 `nb-reload`）、`render/renderer.ts`、`game/audio.ts`（`reload()`）、`app.ts`（`R` 键、`audio.empty()`）
- 测试：`tests/unit/hitscan.test.ts` 的 `'empty magazine cannot fire; reload blocks firing then refills'` 需删除；E2E 场景 2 的弹匣递减断言需改写；`testHooks.ts` 的状态字段
- 文档：README 的 Controls 表移除 `R`，「What's implemented」同步更新，并说明新的射击模型

### 平衡性与验收

`ai.accuracy: 0.62` 与 `reactTime: 0.26` 是在 5 发/秒下调出的；射速降至 1/5 后单位时间伤害同步降至约 1/5，对局会显著拉长，并可能出现双方长时间打不死的僵持（Round 2 修 `alert` 状态时曾遇到同类问题）。改完**必须**用 `tests/unit/ai.test.ts` 现有的「3 seed 全场终止性回归」验证比赛仍能在有限逻辑时间内结束；若不能，优先上调 `ai.accuracy` 而非回调射速。

新增建议测试：弹丸飞行时间与距离成正比、弹丸不穿墙（连续碰撞）、飞行途中射手死亡仍正常结算、玩家按住鼠标只产生一发。
