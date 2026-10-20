# 本地 LLM 编程能力测评 — 俄罗斯方块

[English](early-tests-local-llm-tetris-code-test-readme.md) | [简体中文](early-tests-local-llm-tetris-code-test-readme_CN.md)

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

## 测评背景

本仓库记录了一次对**四款**本地部署大语言模型编程能力的真实测评。测评使用 **Claude Code v2.1.160** 作为 Coding Agent，以 **oMLX** 在 Apple Silicon 上进行本地推理，分别让三个模型从零实现一个俄罗斯方块游戏，再由 Claude Sonnet 4.6 担任 Code Reviewer，通过多轮 review 验证最终可运行性。

---

## 测试环境

| 项目 | 配置 |
|------|------|
| **硬件** | Apple M5 Max · 128 GB 统一内存 |
| **推理平台** | oMLX v0.4.0rc2 |
| **Coding Agent** | Claude Code v2.1.160 |
| **Reviewer** | Claude Sonnet 4.6 |
| **测评日期** | 2026-06-02 ~ 2026-06-04 |
| **验收标准** | 游戏在浏览器中可正常运行，基础功能可玩 |

---

## 测评题目

> 以下为完整测评题目原文，三个模型收到完全相同的题目。

### 前端测试题：实现一个简单俄罗斯方块游戏

请使用任意前端技术栈实现一个可运行的俄罗斯方块小游戏，例如原生 HTML/CSS/JavaScript、React、Vue、Svelte 等均可。

#### 基本要求

实现一个 10 × 20 的俄罗斯方块游戏区域。

游戏应支持以下功能：

1. 方块自动下落
2. 左右移动方块
3. 旋转方块
4. 快速下落
5. 方块触底或碰到已有方块后固定
6. 满一行后自动消除
7. 消除行后上方方块下移
8. 游戏结束判断
9. 重新开始游戏

#### 操作要求

建议使用键盘控制：

| 按键 | 功能 |
|------|------|
| ← / A | 左移 |
| → / D | 右移 |
| ↓ / S | 加速下落 |
| ↑ / W | 旋转 |
| Space | 直接落到底部 |
| P | 暂停 / 继续 |
| R | 重新开始 |

#### 界面要求

页面需要展示：

1. 游戏主区域
2. 当前分数
3. 已消除行数
4. 当前等级或速度
5. 下一个方块预览
6. 游戏状态（例如进行中、暂停、游戏结束）

#### 计分规则

| 动作 | 分数 |
|------|------|
| 消除 1 行 | 100 |
| 消除 2 行 | 300 |
| 消除 3 行 | 500 |
| 消除 4 行 | 800 |
| 快速下落 | 可选加分 |

等级规则：每消除 10 行升一级，下落速度随等级提升而加快。

#### 技术要求

代码需要满足：

1. 可以本地直接运行
2. 结构清晰，逻辑可读
3. 避免依赖后端服务
4. 不要求使用数据库
5. 不要求持久化分数
6. 可以使用 Canvas，也可以使用 DOM grid
7. 可以使用第三方 UI 库，但核心游戏逻辑应由自己实现

#### 加分项

以下功能不是必须，但可以加分：

1. Hold 暂存方块
2. Ghost piece 落点预览
3. 移动端触控支持
4. 音效开关
5. 最高分本地保存
6. 响应式布局
7. TypeScript
8. 单元测试
9. 清晰的状态管理设计
10. README 说明运行方式和设计思路

#### 交付要求

请提交：

1. 源代码
2. 运行说明
3. 简短说明你使用的技术栈
4. 简短说明核心游戏逻辑如何实现
5. 如有 AI 辅助，请说明使用方式

#### 验收标准

重点检查：

1. 游戏是否能正常运行
2. 方块移动、旋转、碰撞是否正确
3. 消行逻辑是否正确
4. 游戏结束是否正确触发
5. 代码结构是否清晰
6. UI 是否基本可用
7. 是否有明显 bug

---

## 参测模型

### 1. gemma-4-31b-it-8bit

| 属性 | 值 |
|------|----|
| 类型 | VLM（Dense） |
| 大小 | 33 GB（8bit 量化） |
| 推理速度 | ~14 tok/s（开启 MTP 投机解码后 ~23 tok/s） |
| Context 窗口 | 262,144 tokens |
| 采样参数 | temp=1.0, top_p=0.95, top_k=64（Google 官方推荐） |
| Thinking 模式 | 不支持 |
| 目录 | `tetris-test-gemma-4-31b/` |

**技术栈选择：** React 18 + TypeScript + Vite + HTML5 Canvas API

架构分层清晰：自定义 Hook `useTetris` 封装全部游戏逻辑，`TetrisBoard` 和 `Sidebar` 分别负责渲染。代码使用 TypeScript 全覆盖，有完整的类型注解。

**已实现的加分项：** Hold 暂存（有 bug）、Ghost piece（有 bug）、TypeScript、README

**如何运行：**
```bash
cd tetris-test-gemma-4-31b
npm install
npm run dev
# 浏览器访问 http://localhost:5173
```

**测评结果：** 历经 5 轮 code review，最终**未能通过验收**。根本问题是模型每次只修被明确指出的那一行，相同模式的 `import type` 错误在 5 个文件中被逐一发现，3 次声称修复但代码实际未变动。游戏从未在浏览器中成功运行。

**主要 Bug：**

| Bug | 描述 |
|-----|------|
| 入口文件缺失 | `src/main.tsx` 和 `src/index.css` 未生成，页面空白 |
| `import type` 连锁错误 | TypeScript type-only 导出在运行时被抹除，5个文件逐一报错 |
| Ghost piece 死循环 | `getGhostPiece()` 的 while 循环检查固定位置，浏览器冻结 |
| 锁定颜色丢失 | 固定方块存储整数 `1` 而非颜色字符串 |
| 速度下限未生效 | 定义了 `MIN_SPEED` 常量但未在 `setInterval` 中使用 |

---

### 2. Qwen3.6-27B-UD-MLX-4bit

| 属性 | 值 |
|------|----|
| 类型 | LLM（Dense） |
| 大小 | 26 GB（4bit 量化） |
| 推理速度 | ~20 tok/s |
| Context 窗口 | 262,144 tokens |
| 采样参数 | temp=0.3, top_p=0.8, top_k=20 |
| Thinking 模式 | 关闭 |
| 目录 | `tetris-test-Qwen3.6-27B/` |

**技术栈选择：** 原生 HTML/CSS/JavaScript + Canvas API（单文件 784 行，零依赖）

**如何运行：**
```bash
cd tetris-test-Qwen3.6-27B
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080
```

**测评结果：** 历经 3 轮 code review，最终**通过验收**。0 次谎报，每次修复均精准有效，且主动调用 Playwright MCP 进行自动化浏览器测试验证（共调用 76+ 次）。

**已实现的加分项：** Hold 暂存（正确，含锁定机制）、Ghost piece（正确）、7-Bag 标准随机器、SRS 旋转系统 + Wall Kick、Next 队列（4个预览）、响应式 CSS

**Bug 修复记录：**

| 轮次 | Bug | 修复状态 |
|------|-----|:--------:|
| R1 | J/L 方块旋转坐标有重复格子，旋转后变成 3 格 | ✅ |
| R1 | I 方块 Wall Kick 表索引类型错误（数字 vs 字符串） | ✅ |
| R1 | 锁定延迟判断条件错误，方块可能永不锁定 | ✅ |
| R1 | 初始空棋盘无任何操作提示 | ✅ |
| R2 | S 和 Z 旋转后形状互换（rot1 坐标对调） | ✅ |

**oMLX 运行统计（本次测评期间）：**

| 指标 | 值 |
|------|----|
| 总 Prefill Tokens | 10.1M |
| 缓存命中 Tokens | 9,216,000 |
| 缓存效率 | 91.0% |
| Token Generation 速度 | 13.8 tok/s |
| 显存占用 | ~24.74 GB |
| 总会话时长 | 约 1h 17m |

---

### 4. Qwen3.5-122B-A10B-4bit

| 属性 | 值 |
|------|----|
| 类型 | VLM（MoE，激活参数约 10B） |
| 大小 | 68 GB（4bit 量化） |
| 推理速度 | ~41 tok/s |
| Context 窗口 | 262,144 tokens |
| 采样参数 | temp=0.6, top_p=0.95, top_k=20（官方 coding 推荐） |
| Thinking 模式 | 关闭 |
| 目录 | `tetris-test-Qwen3.5-122B/` |

**技术栈选择：** Vue 3 (Composition API) + TypeScript + Vite + 原生 CSS

四个模型中功能最完整、加分项覆盖最全的实现。

**如何运行：**
```bash
cd tetris-test-Qwen3.5-122B
npm install
npm run dev
# 浏览器访问 http://localhost:3000
```

**测评结果：** 历经 **1 轮** code review，**1 个 bug，1 次修复，0 次谎报**，一轮通过验收。是四个模型中表现最干净的。

**已实现的加分项：** Hold 暂存 ✓、Ghost piece ✓、7-Bag 随机器 ✓、本地最高分（localStorage）✓、移动端触控 ✓、响应式布局 ✓、TypeScript ✓、README ✓

**Bug 修复记录：**

| 轮次 | Bug | 描述 | 状态 |
|------|-----|------|:----:|
| R1 | 旋转失效 | `rotateTetromino` 用引用相等（`===`）查找当前旋转状态，数组拷贝后永远返回 index -1，旋转无法循环 | ✅ 一次修对 |

**oMLX 运行统计：**

| 指标 | 值 |
|------|----|
| 总 Prefill Tokens | 3,247,432 |
| 缓存命中 Tokens | 2,940,928 |
| 缓存效率 | 90.6% |
| Token Generation 速度 | 41.3 tok/s |
| 显存占用 | ~65.22 GB |

---

### 3. Qwen3.6-35B-A3B-MLX-8bit

| 属性 | 值 |
|------|----|
| 类型 | LLM（MoE，激活参数约 3B） |
| 大小 | 37 GB（8bit 量化） |
| 推理速度 | ~82 tok/s（thinking 关闭） |
| Context 窗口 | 262,144 tokens |
| 采样参数 | temp=0.3, top_p=0.8, top_k=20 |
| Thinking 模式 | **关闭**（开启时 8192 tokens 全被推理链消耗，content 输出为 0） |
| 目录 | `tetris-test-Qwen3.6-35B/` |

**技术栈选择：** 原生 HTML/CSS/JavaScript + Canvas API

初版采用多文件模块化架构（`js/game.js`、`js/renderer.js`、`js/board.js`、`js/piece.js`、`js/audio.js`、`js/input.js`、`js/constants.js`），是三个模型中工程设计最完整的。但在第 2 轮修复时将全部代码压缩重写为单文件内联版本，原有架构被废弃。

> **注意：** `js/` 和 `css/` 目录是初版代码，已不被 `index.html` 加载，仅供参考。游戏运行使用 `index.html` 内的内联版本。

**如何运行：**
```bash
cd tetris-test-Qwen3.6-35B
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080
```

**测评结果：** 历经 8 轮 code review（超出约定的 5 轮），最终**通过验收**。3 次声称修复但代码实际未变动，2 次将修复写进废弃的外部 JS 文件。

**已实现的加分项（初版）：** Hold 暂存（正确）、Ghost piece、音效系统（Web Audio API 合成音效）、本地最高分（localStorage）、Next 队列、响应式 CSS、DAS 自动重复输入（专业级键盘处理）

**Bug 修复记录：**

| 轮次 | Bug | 模型行为 | 最终状态 |
|------|-----|---------|:--------:|
| R1 | I 件 rot0 竖向生成，应为横向 | 声称修复，代码未变动 | — |
| R2 | 同上，再次指出 | 实际修复，但顺带将整个代码库压缩重写，引入 4 个新 bug | ✅ |
| R3 | Ghost 不透明（`cell()` 覆盖了 `globalAlpha`）+ 音效开关无效 | 修在废弃的外部 JS 文件，无效 | — |
| R4 | `spawn()` 未重置 `this.pr`，方块生成即触底，左右键失效 | 定位 bug | — |
| R5 | R3+R4 三个 bug 同批修复 | `pr=0` 和音效正确修复，ghost 仍修在废弃文件 | ⚠️ |
| R6 | Ghost 仍在废弃文件 | 修在 `index.html`，正确 | ✅ |
| R7 | 旋转失效：`WK[rotation]` 应为 `WK.normal[rotation]` | 声称修复，代码未变动 | — |
| R8 | 同上，再次指出 | 实际修复 | ✅ |

---

## 最终评分

| 维度 | gemma-4-31b | Qwen3.6-27B | Qwen3.6-35B | Qwen3.5-122B |
|------|:-----------:|:-----------:|:-----------:|:------------:|
| 初版架构设计（/20） | 15 | 18 | 19 | **20** |
| 功能完整性（/20） | 10 | 17 | 15 | **19** |
| 代码正确性（/20） | 5 | 14 | 8 | **18** |
| 自修复能力（/20） | 2 | 17 | 5 | **20** |
| 最终交付质量（/20） | 0 | 14 | 13 | **19** |
| **总分** | **32 / 100** | **80 / 100** | **60 / 100** | **96 / 100** |

---

## 关键发现

**1. Thinking 模式与代码生成任务不兼容**

Qwen3.6-35B 开启 thinking 时，8192 tokens 的上限被内部推理链（`reasoning_content`）完全消耗，实际代码输出（`content`）为 0 字节。关闭 thinking 后推理速度达 82 tok/s，是三者中最快的模型。

**2. 谎报修复是普遍现象（但并非所有模型）**

gemma 和 Qwen3.6-35B 均出现多次声称修复但代码实际未变动的情况，有时还将修复写进废弃文件。Qwen3.6-27B 和 Qwen3.5-122B 均为 0 次谎报。

**3. 自我验证能力参差不齐**

Qwen3.6-27B 主动调用 Playwright MCP 验证游戏行为。Qwen3.6-35B 也使用了 Playwright，但因用 `getImageData` 循环读取 canvas 像素而陷入死循环。gemma 完全不做运行验证。Qwen3.5-122B 未使用 Playwright，但修复精准，一次就对。

**4. 架构复杂度与交付质量不正相关**

技术栈最复杂的 gemma（React + TypeScript + Vite）反而是唯一未通过验收的模型。Qwen3.6-35B 初版架构最完整，但一次错误的重构决策（将多文件架构压缩成单文件）引入了 4 个新 bug，将一个 2 轮能修完的任务拖成了 8 轮。

**5. 模型规模越大，修复质量越高**

Qwen3.5-122B（122B 总参数，10B 激活）是唯一在 1 轮内完成修复、0 次谎报、且主动在所有相关文件中正确修复的模型。规模带来了更好的代码理解力和更可靠的执行。

**6. 模型在被反复指出同一问题后仍不能全局检查（小模型更明显）**

gemma 和 Qwen3.6-35B 均表现出"只修被点名的那一行"的倾向，不会主动搜索全局的同类问题。

---

## 仓库结构

```
local-llm-tetris-code-test/
├── README.md                          # 本文件
├── .gitignore
├── tetris-test-gemma-4-31b/           # gemma-4-31b 的代码（未通过验收）
│   ├── CODE_REVIEW.md                 # 5轮 code review 记录
│   ├── src/                           # React + TypeScript 源码
│   │   ├── App.tsx
│   │   ├── hooks/useTetris.ts         # 核心游戏逻辑
│   │   ├── components/
│   │   ├── constants.ts
│   │   └── types.ts
│   ├── package.json
│   └── vite.config.ts
├── tetris-test-Qwen3.6-27B/           # Qwen3.6-27B 的代码（✅ 通过验收）
│   ├── CODE_REVIEW.md                 # 3轮 code review 记录
│   └── index.html                     # 单文件游戏（784行，零依赖）
└── tetris-test-Qwen3.6-35B/           # Qwen3.6-35B 的代码（✅ 通过验收，8轮）
    ├── CODE_REVIEW.md                 # 8轮 code review 记录
    ├── index.html                     # 运行版本（第2轮重写的单文件内联版）
    ├── js/                            # 初版模块化代码（已废弃，仅供参考）
    │   ├── game.js                    # 游戏状态机与核心逻辑
    │   ├── renderer.js                # Canvas 渲染
    │   ├── board.js                   # 棋盘状态
    │   ├── piece.js                   # 方块定义与旋转
    │   ├── audio.js                   # Web Audio API 音效
    │   ├── input.js                   # 键盘 DAS 输入处理
    │   └── constants.js               # 方块定义、计分、SRS Wall Kick
    └── css/style.css                  # 初版样式（已废弃）
└── tetris-test-Qwen3.5-122B/          # Qwen3.5-122B 的代码（✅ 通过验收，1轮）
    ├── CODE_REVIEW.md                 # 1轮 code review 记录
    ├── src/
    │   ├── App.vue                    # 主游戏组件（Vue 3 Composition API）
    │   ├── types/
    │   │   ├── index.ts               # Tetromino 类型定义
    │   │   ├── pieces.ts              # 方块形状、旋转、随机器
    │   │   └── game.ts                # 游戏配置常量
    │   └── utils/gameLogic.ts         # 碰撞检测、消行、Ghost piece 等
    ├── package.json
    └── vite.config.ts
```
