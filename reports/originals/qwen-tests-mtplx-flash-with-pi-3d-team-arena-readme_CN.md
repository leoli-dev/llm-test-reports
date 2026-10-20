# NEON BASTION — 4v4 区域突击

[English](qwen-tests-mtplx-flash-with-pi-3d-team-arena-readme.md) | [简体中文](qwen-tests-mtplx-flash-with-pi-3d-team-arena-readme_CN.md)

<!-- environment-context:start -->

## 本机配置与系统（2026-10-20 补充）

| 项目 | 记录与证据边界 |
|---|---|
| 本机用途 | 本机推理工作站 |
| 本机硬件参考 | MacBook Pro `Mac17,6`；Apple M5 Max；18 核 CPU；40 核 GPU；128 GB 统一内存（128 GiB / 137438953472 字节） |
| 原报告明确记载的主机 | 详见原报告；未以当前快照补造历史配置 |
| 当前系统快照 | macOS 27.0.1，build `26A434`，arm64，Metal 4；采集于 2026-10-20 22:03:27 UTC |
| 实验时系统 | 现存测试证据中未记录；不以当前系统版本倒填 |
| 历史配置边界 | 旧测试未保存独立快照时，详细核数只作为当前本机配置参考；内网 PC／云端推理硬件不由 Mac 配置推断 |

[完整环境说明](../../environment_CN.md)。模型、量化、引擎、缓存和请求条件以本报告原有记录为准。原始图表、源码和命令输出保留源语言证据。

<!-- environment-context:end -->

一款浏览器 4v4 团队淘汰 FPS：你和三名 AI 队友对抗四名 AI 敌人，在手工构建的竞技场中作战。没有后端、网络请求或外部素材，几何、声音和界面全部在运行时生成。

技术栈：**Vite + TypeScript + Three.js**。游戏逻辑位于 `src/game/**`，不导入 Three.js 或 DOM，因此整个模拟可以在纯 Node 环境中运行和测试。

---

## 运行

```bash
npm install
npm run dev            # http://127.0.0.1:5173  (click START MATCH — audio + pointer lock start there)
```

其他命令：

```bash
npm run build          # tsc --noEmit && vite build  (type-check + production bundle)
npm run preview        # serve the built bundle on :4173
npm test               # unit tests (vitest): map geometry, hitscan, match rules, AI
npm run test:e2e       # Playwright end-to-end (Chromium, SwiftShader for WebGL)
npm run test:all       # both
CAPTURE=1 npm run test:e2e   # also regenerates ./screenshots from real running matches
```

浏览器：支持 WebGL2 的 Chrome/Safari/Firefox。没有 WebGL 时，游戏会降级为下述 2D 俯视渲染器，仍可游玩。

## 操作

| 按键 | 动作 |
| --- | --- |
| `WASD` | 移动 |
| `Shift` | 冲刺，声音更大，附近 AI 能听见 |
| `Space` | 跳跃 |
| mouse | 观察，使用指针锁定 |
| left click | 射击，即时命中，持续按住会增加散布 |
| `R` | 换弹 |
| `Tab` | 记分板 |
| `F` | 死亡后切换观战单位 |
| `V` | 导演模式，隐藏 HUD，使用环绕相机 |
| `M` | 静音 |
| `Esc` / `P` | 暂停，失去指针锁定也会暂停 |

URL 参数：`?seed=N` 生成确定性对局；`?headless=1` 跳过开始界面和指针锁定，供 E2E 测试使用；`?nogl=1` 强制 2D 降级渲染器；`?nomotion=1` 减少动态效果，禁用震动和粒子；`?director=1` 从环绕模式开始；`?states=1` 显示 AI 状态读数。

## 对局规则

4 对 4，每人一条命，先被全灭的队伍输；10 分钟后按存活人数、再按分数决定胜负。你是蓝队的 `VULA`。身体命中伤害 20，头部命中伤害 50；击杀获得 +1 命中分和 +3 击杀分。友军伤害完全无效：挡在前面的队友吸收射线，双方都不得分。

## 代码结构

```
src/game/            pure simulation, no DOM/WebGL imports (runs in Node)
  util.ts            seeded RNG (mulberry32), math helpers
  map/arenaData.ts   THE map: every block, ramp, spawn, zone, nav node
  map/build.ts       derives collision, floor heights, ray occlusion, nav grid, minimap
  nav.ts             0.5 m walkability grid + A* used by the bots
  physics.ts         cylinder-vs-world movement, ground/step-up, gravity
  combat.ts          hitscan (ray vs AABB slab + ramp heightfield, one hit per ray), weapons
  ai.ts              perception + state machine + steering
  match.ts           fixed 60 Hz tick, damage/score, death + spectate, win check, restart
src/render/          Three.js scene, instanced geometry, tracers, sparks, 2D fallback view
src/ui/hud.ts        DOM HUD: crosshair, health, ammo, kill feed, scoreboard, minimap, screens
src/main.ts          bootstrap: input, fixed-step loop, camera modes, pause, test hooks
tests/unit/          vitest (geometry, hitscan rules, match rules, AI)
tests/e2e/           Playwright (real browser runs through the real renderer)
```

### 几何的唯一数据源

碰撞、即时命中遮挡、AI 导航和小地图全部读取由 `arenaData.ts` 构建的同一个派生 `World` 对象。墙挡子弹、挡身体、挡机器人路径，也会画在小地图上，不存在第二套可能失去同步的“视觉几何”。竞技场具备 180° 旋转对称性，`sym: true` 将物件绕原点镜像。单元测试断言：所有出生点都看不到敌方出生点，没有超过 11 m 的直线通道贯穿地图，每个出生点都能到达平台、侧翼、迷宫和敌方区域，导航边不会穿墙。

### 即时命中

`traceShot` 先检测几何，使用精确 AABB slab 检测和坡面高度场步进采样，再检测身体胶囊体与头部球体，并保留**最近**遮挡物。子弹遇到第一个物体就停止，因此掩体有效、队友会吸收子弹，墙后的目标不会受击。持续开火和移动增加散布，暂停后散布衰减。

### 机器人

感知刻意受限：目标只有在约 100° 视锥内或约 10 m 范围内、处于视距中且射线无遮挡时才会被“看到”。没有透视，也没有近似透视的“隔墙听见精确位置”；听觉只提供*调查方向*。状态为 `spawn_rally → advance → alert → take_cover → engage → search → careful_push`，每个机器人还有 `west` / `center` / `east` 路线，推动它们穿越地图而非原地游荡。反应延迟、点射节奏和命中率随机判定让机器人具有威胁而不会瞬杀。双方遵循相同规则。

### 确定性与测试接口

模拟以固定 1/60 s 步长运行，与渲染解耦；每单位、每 tick、每次射击使用带种子的随机数，不读取时钟，不使用 `Math.random` 或 DOM。`window.__teamArenaTest` 只暴露观察和*输入注入*：`step()`、`input()`、`place()`、`shoot()` 全部经过正常结算代码，因此测试不能绕过墙体遮挡或计分。`tests/e2e/game.spec.ts` 验证向柱子后射击不会造成伤害，而同一射击在无遮挡时可以命中。

性能：几何使用实例化，实体体积和平台各一个实例网格；曳光与命中火花使用固定大小的对象池；循环每帧最多追赶 5 个逻辑步。在使用 SwiftShader、没有 GPU 的无头 Chromium 中，E2E 性能测试测得全部 8 个单位与效果的帧预算保持在 20 ms 以下；在有真实 GPU 的 M 系列 MacBook 上保持 60 fps。

## 测试

```
tests/unit/map.test.ts      geometry invariants, LOS/lane sweeps, nav connectivity
tests/unit/combat.test.ts   hitscan: cover blocks, one hit per ray, head vs body, friendlies absorb
tests/unit/rules.test.ts    scoring, kill bonus, no double-count, wipe ends the match
tests/unit/ai.test.ts       perception (no wallhack), peripheral awareness, walked paths never cross walls,
                            and a full 2400-tick AI-vs-AI run where nobody ever moves through geometry
tests/unit/sim.test.ts      full matches run to a decided result, deterministic per seed, restart is clean
tests/e2e/game.spec.ts    boot/audio-gate, movement, hitscan-through-wall, AI brawl, death→spectate,
                          reload/scoreboard, 2D fallback, reduced motion, frame-budget check
```

## 截图

`screenshots/` 由 `CAPTURE=1 npm run test:e2e` 从实际运行的对局生成。交火画面使用安排的战斗场景；中局画面来自 2400 tick 的 AI 对 AI 战斗。

## 已知限制

* 机器人以战斗易读性为调校目标，而非公平；某些种子会进入接触较少的僵局，最终触及时间上限，按存活人数、再按分数决定结果。
* 伤害数字、击杀信息和小地图的构造保证其正确性，但视觉粗糙。
* 声音实时合成且刻意简化，包括枪声、命中、击杀、换弹、脚步、环境嗡鸣和对局结束短音。
* 2D 降级模式用于保证可运行，体验舒适度有限，键盘瞄准较粗略。
