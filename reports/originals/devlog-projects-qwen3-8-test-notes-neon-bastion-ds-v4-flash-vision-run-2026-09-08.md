---
type: Note
title: Neon Bastion ds-v4-flash-vision run — A–G progress (35/55)
status: current
description: 用同一份 55 任务书在 ds-v4-flash-vision-with-dsh 部署下重跑 Neon Bastion；A01–G08（35/55）完成，游戏已达「能跑能打能死能重开能观战 + 完整 HUD/小地图/结算」的可玩闭环。
tags: [neon-bastion, ds-v4, deepseek, benchmark, task-decomposition]
timestamp: 2026-09-08T09:40:00Z
---

# Neon Bastion ds-v4-flash-vision run — A01–A03

在**同一套 55 份任务书**（`~/Code/qwen3.8-tests/test-prompts/neon-bastion/` + `INDEX.md`）下，
换 `ds-v4-flash-vision` 部署从零重跑 Neon Bastion，验证任务书与方法论对另一模型是否同样成立。

- 部署：DeepSeek `ds-v4-flash-vision`（本 session 直接作为 agent 执行，无需外部投喂脚本）
- 工作目录：`~/Code/qwen3.8-tests/ds-v4-flash-vision-with-dsh-neon-bastion`
- **本轮进度：3/55（A01–A03），用户按计划在 A03 完成后暂停、准备断网**

## 交付事实

**2026-09-08 续：A–D 段（16/55）全部完成。** 16 次提交（`880ae2a` A01 → `4f831ca` D05）。末态 `npm run build` 退出码 0、
**单测 265（15 文件）**、E2E 3（占位页）。`npm test` 与 `npm run test:e2e` 均绿。

已交付模块（全部纯逻辑层，无 three.js / DOM / AudioContext）：
- A：util / types / CONFIG / rng（可注入 seed 的 xorshift32+fmix32，`hashSeed` salt 隔离，禁 Math.random）
- B：mapData（地图唯一真源）→ geometry（AABB/地面高度/slab 射线，玻璃双模式 `ignoreGlass`）→ navmesh（距离+LOS 建边 + 确定性 Dijkstra）→ generateMap（四套布局 + seed 纯函数，连通性换图）
- C：movement（轴分离碰撞/重力/跳跃/maxStep 踏步）→ playerInput（四向自洽输入，`r=f×up`）→ render/camera（FOV/起伏/后坐/受击冲击/reduced-motion，纯数学，只读 Unit）
- D：weapon（冷却/半自动/散布纯函数）→ bullet（对象池 + 扫掠线段 CCD 防隧穿）→ hitscan（墙优先/头身命中体/玻璃看得到打不中/友军免伤/HP≥0）→ fire（唯一开火入口 + 计分不变量 + 事件总线 killfeed≤5）→ match（8 单位编排，fixed tick，冻结，纯数据 snapshot）

依赖版本：three ^0.185.1、vite ^8.2.2、vitest ^5.0.0、@playwright/test ^1.63.0、typescript ^7.0.2。

首环境问题：npm 全局缓存含 root-owned 临时文件（`~/.npm/_cacache/tmp`），`npm install` 报 EPERM；
已改用项目内 `--cache .npm-cache` 规避（工具链环境问题不应污染交付）。

负对照（A01 规则 #6）逐任务执行：A02 类型错误→build 非0；A03 改 hpMax→CONFIG 断言红；A04 去 salt/注入 Math.random→红；
B01 移中央立柱/改 id25 材质→红；B02 删 glass 分支→双模式断言红；B03 改 tie-break→确定性红；B04 绕过连通性换图→SEVERED 红；
C01 关轴回退+径向校正→"不在墙内"红；C02 把 r 取反→四向自洽红；C03 深度冻结证明不污染 Unit；D01 去 shotIndex→每发不同红；
D02 扫掠段坍缩成端点→薄墙隧穿红；D03 忽略墙优先→墙后/玻璃红；D04 让 AI 跳过 shot 事件→核心断言红；D05 删冻结守卫→冻结测试红。

**2026-09-08 续：E–G 段（35/55）完成。** 累计 34 次提交（`880ae2a` A01 → `6ddbe42` G08）。末态 `npm run build` 退出码 0、
**单测 407（28 文件）**、**E2E 52（13 spec）**，`npm run test:all` 全绿。

- **E（AI，E01–E07）**：感知（视锥/视距/遮挡，玻璃不挡视线；听觉不给身份）→ 状态机骨架 + 导航寻路跟随（确定性 brain，与玩家共用 `stepUnit`）→ doctrine 人格（seed 纯函数、每队恰 2 flanker + 2 rusher）→ 开火决策（反应延迟、瞄准偏移命中率、`minFireDist`、**拒绝隔玻璃开火**，经 D04 唯一 `fireFrom`）→ 防僵持（四道递进闸门 + `retreatDwell` 第三出口 + 每单位无接触计时器 + Match 硬时间上限 `warTime+150`）→ 防卡死（`handleStall` 检测 + 墙角切向滑出 + 交战不被打断）→ 终止性全量扫描（seed 1..40、300 逻辑秒、逐 tick 三不变量、失败打印可复现 seed）。**所有 40 seed 都能结束**。
- **F（应用外壳，F01–F03）**：`src/app.ts` 的 `App`（纯逻辑：屏幕状态机、固定 1/60 累加器 `acc += min(realDt, maxFrameDt 0.25)`、`fastForward`/`teleport`/`setSeed`/`playAgain`、输入单一入口）+ `mountApp`（DOM/rAF/Pointer Lock）+ `src/testHooks.ts`（`window.__nb`，与真实输入同一条 `applyKey`/`applyLook` 路径）→ `src/render/scene.ts` 从 `mapData.solids` 生成几何（按尺寸缓存复用；8 单位共享胶囊几何 + 每队一份材质；`map/sceneGeometrySignature` 证明场景来自当前地图）→ 死亡观战（`resolveSpectator` 纯函数、Q/E 环形切换、`spectateCamera` 第三人称平滑跟随 / 蓝队全灭回落自由俯视 26m）。**C03 的相机 E2E 按备注在 F01 补上**。
- **G（比赛 UI，G01–G08）**：HUD（DOM 覆盖层 `.nb-root`、准星/分段血条/**冷却不是弹药**/比分/killfeed）→ 实时排行榜（复用组件、玩家高亮、同分按 id 稳定不抖、DOM 读回 `totalScore === hitScore + 3×kills`）→ 小地图（**共享视野不透视**：`sharedViewCanSee` 本队任一存活单位看见才显示，最后已知位置淡出 0.7s，玻璃不挡视线；`ai.*` 与 `minimap.*` 两组视野参数独立性有测试锁）→ 受击/命中反馈（暗角 + 来向弧 `damageBearing` + 爆头/身体 hitmarker + 浮动 20/50，**只订阅 D04 事件总线**）→ 结算层与 restart（复用排行榜、隐藏全部局内 chrome、restart 无残留）→ 导演模式 F2 + 调试面板 F3/`` ` `` → reduced-motion 与 no-WebGL fallback（`?nogl=1` 永不白屏、比赛照常；云在 reduced-motion 下"停运动不删元素"）→ favicon/theme-color/apple-touch-icon（内联 SVG data-URI，`#`→`%23`）。

**G 段新增的工程习惯（可复用）**：
- **负对照必须先确认 build 成功再跑 E2E**——本轮两次"控制组全绿"的假象都源于 `tsc --noEmit` 因 unused local 失败、`dist/` 仍是旧构建；`npm run build` 的退出码是硬闸门（与 OPS-12 同源）。
- **断言要读"看得见的东西"**：调试面板的 state 断言最初读 `data-state` 属性，把显示文字写死也照过；改成读可见 `<span>` 的 textContent 并加"5 号是 dead 且非全同行相同"的非均匀断言后才真正承重。同理 G02 的不变量断言在"全 0 分数"时恒真，先用 `addScore` 造非零再断言。
- **复用组件会牵连既有断言**：结算层复用 `Scoreboard` 后，G02 的"`.nb-scoreboard` 恰好 1 个"改为"`.nb-root > .nb-scoreboard`（局内）恰好 1 个"。

## 当前状态

**A–G 全段完成（35/55）。** 关键路径 A→B→C→D→E→F 早已打通：逻辑层能跑完整 AI-vs-AI 对局且**每局必结束**；应用外壳把 Match 接到浏览器（固定 tick / 屏幕状态 / 输入 / 测试钩子）；渲染器从 mapData 画出竞技场；死亡观战、HUD、实时排行榜、小地图（共享视野）、受击/命中反馈、结算与 restart、导演模式与调试面板、reduced-motion 与 no-WebGL fallback、favicon 全部就位。**此刻游戏已是"能玩的最小闭环 + 完整 UI"**，只差美术（H）、人形与持枪（I）、特效（J）、音频（K），以及证据与交付（L–M）。

## 与前一轮（qwen 55-task）的不同点

- 部署/模型不同（本轮回 `ds-v4-flash-vision`），无外部编排脚本；执行器即本 agent。
- 恢复时经 devlog Recall 即可重建上下文，无需依赖上次的 `notes/neon-bastion-55task-rerun-2026-09-07.md`。

## 恢复点

从 **H01** 起投。任务书位于 `test-prompts/neon-bastion/`，按 `INDEX.md` 字母序。
每任务完成定义：`npm run build` 退出码 0 + 新增测试全绿 + 既有测试不回归 + 单独 commit + 每条新断言做一次负对照。
**负对照流程提醒**：先改代码 → 跑 `npm run build` 并确认 `built in`（否则 E2E 测的是旧 `dist/`）→ 跑目标测试确认变红 → 还原 → 重新 build。
