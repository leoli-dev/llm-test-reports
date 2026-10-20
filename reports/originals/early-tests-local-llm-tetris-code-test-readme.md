# Local LLM Coding Capability Evaluation — Tetris

[English](early-tests-local-llm-tetris-code-test-readme.md) | [简体中文](early-tests-local-llm-tetris-code-test-readme_CN.md)

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

## Evaluation Background

This repository documents a real-world evaluation of the coding capabilities of **four** locally deployed large language models. The evaluation used **Claude Code v2.1.160** as the Coding Agent, with **oMLX** performing local inference on Apple Silicon. Three models were each tasked with implementing a Tetris game from scratch, after which Claude Sonnet 4.6 served as the Code Reviewer, verifying final executability through multiple rounds of review.

---

## Test Environment

| Item | Configuration |
|------|------|
| **Hardware** | Apple M5 Max · 128 GB Unified Memory |
| **Inference Platform** | oMLX v0.4.0rc2 |
| **Coding Agent** | Claude Code v2.1.160 |
| **Reviewer** | Claude Sonnet 4.6 |
| **Evaluation Date** | 2026-06-02 ~ 2026-06-04 |
| **Acceptance Criteria** | The game runs properly in the browser, and basic features are playable |

---

## Evaluation Questions

> The following is the original text of the complete evaluation questions. All three models received exactly the same questions.

### Frontend Test Question: Implement a Simple Tetris Game

Please use any frontend technology stack to implement a runnable Tetris mini-game. For example, native HTML/CSS/JavaScript, React, Vue, Svelte, etc., are all acceptable.

#### Basic Requirements

Implement a 10 × 20 Tetris game area.

The game should support the following features:

1. Automatic falling of blocks
2. Moving blocks left and right
3. Rotating blocks
4. Fast falling
5. Locking blocks when they hit the bottom or existing blocks
6. Automatically clearing full rows
7. Shifting blocks above down after row clearing
8. Game over determination
9. Restarting the game

#### Control Requirements

Keyboard control is recommended:

| Key | Function |
|------|------|
| ← / A | Move left |
| → / D | Move right |
| ↓ / S | Accelerate falling |
| ↑ / W | Rotate |
| Space | Drop directly to the bottom |
| P | Pause / Resume |
| R | Restart |

#### Interface Requirements

The page needs to display:

1. Main game area
2. Current score
3. Number of cleared rows
4. Current level or speed
5. Next block preview
6. Game status (e.g., in progress, paused, game over)

#### Scoring Rules

| Action | Score |
|------|------|
| Clear 1 row(s) | 100 |
| Clear 2 row(s) | 300 |
| Clear 3 row(s) | 500 |
| Clear 4 row(s) | 800 |
| Fast falling | Optional bonus points |

Level rules: Level up every 10 rows cleared; falling speed increases as the level rises.

#### Technical Requirements

The code needs to satisfy:

1. Can be run directly locally
2. Clear structure and readable logic
3. Avoid dependency on backend services
4. No database usage required
5. No score persistence required
6. Can use Canvas or DOM grid
7. Third-party UI libraries can be used, but core game logic must be implemented by yourself

#### Bonus Items

The following features are not mandatory but can add points:

1. Hold block
2. Ghost piece landing preview
3. Mobile touch support
4. Sound effect toggle
5. Local saving of high score
6. Responsive layout
7. TypeScript
8. Unit tests
9. Clear state management design
10. README explaining how to run and design ideas

#### Delivery Requirements

Please submit:

1. Source code
2. Running instructions
3. Brief description of the technology stack used
4. Brief description of how the core game logic is implemented
5. If AI assistance was used, please explain how it was used

#### Acceptance Criteria

Key checks:

1. Whether the game runs normally
2. Whether block movement, rotation, and collision are correct
3. Whether row clearing logic is correct
4. Whether game over is triggered correctly
5. Whether the code structure is clear
6. Whether the UI is basically usable
7. Whether there are obvious bugs

---

## Models Under Test

### 1. gemma-4-31b-it-8bit

| Property | Value |
|------|----|
| Type | VLM (Dense) |
| Size | 33 GB (8bit quantization) |
| Inference Speed | ~14 tok/s (~23 tok/s with MTP speculative decoding enabled) |
| Context Window | 262,144 tokens |
| Sampling Parameters | temp=1.0, top_p=0.95, top_k=64 (Officially recommended by Google) |
| Thinking Mode | Not supported |
| Directory | `tetris-test-gemma-4-31b/` |

**Tech Stack Selection:** React 18 + TypeScript + Vite + HTML5 Canvas API

The architecture is clearly layered: custom Hook `useTetris` encapsulates all game logic, while `TetrisBoard` and `Sidebar` are responsible for rendering respectively. The code uses TypeScript comprehensively, with complete type annotations.

**Implemented Bonus Items:** Hold buffer (has bug), Ghost piece (has bug), TypeScript, README

**How to Run:**
```bash
cd tetris-test-gemma-4-31b
npm install
npm run dev
# 浏览器访问 http://localhost:5173
```

**Evaluation Result:** After 5 rounds of code review, it ultimately **failed to pass acceptance**. The root cause is that the model only fixed the specific line explicitly pointed out each time; the same pattern of `import type` errors was discovered one by one in 5 files, and it claimed to have fixed them 3 times, but the code actually remained unchanged. The game never ran successfully in the browser.

**Main Bugs:**

| Bug | Description |
|-----|------|
| Missing Entry File | `src/main.tsx` and `src/index.css` were not generated, resulting in a blank page |
| `import type` Chain Error | TypeScript type-only exports are erased at runtime, causing errors in 5 files one by one |
| Ghost Piece Infinite Loop | The while loop in `getGhostPiece()` checks a fixed position, causing the browser to freeze |
| Locked Color Loss | Fixed blocks store integer `1` instead of color strings |
| Speed Lower Limit Not Effective | The constant `MIN_SPEED` was defined but not used in `setInterval` |

---

### 2. Qwen3.6-27B-UD-MLX-4bit

| Property | Value |
|------|----|
| Type | LLM (Dense) |
| Size | 26 GB (4bit quantization) |
| Inference Speed | ~20 tok/s |
| Context Window | 262,144 tokens |
| Sampling Parameters | temp=0.3, top_p=0.8, top_k=20 |
| Thinking Mode | Disabled |
| Directory | `tetris-test-Qwen3.6-27B/` |

**Technology Stack Selection:** Native HTML/CSS/JavaScript + Canvas API (single file 784 lines, zero dependencies)

**How to Run:**
```bash
cd tetris-test-Qwen3.6-27B
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080
```

**Evaluation Results:** After 3 rounds of code review, it finally **passed acceptance**. 0 false reports, each fix was precise and effective, and it proactively invoked Playwright MCP for automated browser testing verification (invoked 76+ times in total).

**Implemented Bonus Features:** Hold buffer (correct, including locking mechanism), Ghost piece (correct), 7-Bag standard randomizer, SRS rotation system + Wall Kick, Next queue (4 previews), Responsive CSS

**Bug Fix Log:**

| Round | Bug | Fix Status |
|------|-----|:--------:|
| R1 | J/L piece rotation coordinates had duplicate cells, resulting in 3 cells after rotation | ✅ |
| R1 | I piece Wall Kick table index type error (number vs string) | ✅ |
| R1 | Lock delay judgment condition error, piece might never lock | ✅ |
| R1 | Initial empty board had no operation hints | ✅ |
| R2 | S and Z shapes swapped after rotation (rot1 coordinates swapped) | ✅ |

**oMLX Runtime Statistics (During this evaluation period):**

| Metric | Value |
|------|----|
| Total Prefill Tokens | 10.1M |
| Cache Hit Tokens | 9,216,000 |
| Cache Efficiency | 91.0% |
| Token Generation Speed | 13.8 tok/s |
| VRAM Usage | ~24.74 GB |
| Total Session Duration | Approx. 1h 17m |

---

### 4. Qwen3.5-122B-A10B-4bit

| Attribute | Value |
|------|----|
| Type | VLM (MoE, ~10B active parameters) |
| Size | 68 GB (4bit quantization) |
| Inference Speed | ~41 tok/s |
| Context Window | 262,144 tokens |
| Sampling Parameters | temp=0.6, top_p=0.95, top_k=20 (official coding recommendation) |
| Thinking Mode | Disabled |
| Directory | `tetris-test-Qwen3.5-122B/` |

**Tech Stack Selection:** Vue 3 (Composition API) + TypeScript + Vite + Native CSS

The implementation with the most complete functionality and the most comprehensive coverage of bonus items among the four models.

**How to Run:**
```bash
cd tetris-test-Qwen3.5-122B
npm install
npm run dev
# 浏览器访问 http://localhost:3000
```

**Evaluation Results:** After **1 rounds** of code review, **1 bugs, 1 fixes, and 0 false reports**, it passed acceptance in one round. It was the cleanest performing among the four models.

**Implemented Bonus Items:** Hold Buffer ✓, Ghost Piece ✓, 7-Bag Randomizer ✓, Local High Score (localStorage) ✓, Mobile Touch Support ✓, Responsive Layout ✓, TypeScript ✓, README ✓

**Bug Fix Log:**

| Round | Bug | Description | Status |
|------|-----|------|:----:|
| R1 | Rotation Failure | `rotateTetromino` used reference equality (`===`) to find the current rotation state; after array copying, it always returned index -1, preventing rotation from cycling | ✅ Fixed correctly on first attempt |

**oMLX Runtime Statistics:**

| Metric | Value |
|------|----|
| Total Prefill Tokens | 3,247,432 |
| Cache Hit Tokens | 2,940,928 |
| Cache Efficiency | 90.6% |
| Token Generation Speed | 41.3 tok/s |
| VRAM Usage | ~65.22 GB |

---

### 3. Qwen3.6-35B-A3B-MLX-8bit

| Attribute | Value |
|------|----|
| Type | LLM (MoE, ~3B active parameters) |
| Size | 37 GB (8bit quantization) |
| Inference Speed | ~82 tok/s (thinking disabled) |
| Context Window | 262,144 tokens |
| Sampling Parameters | temp=0.3, top_p=0.8, top_k=20 |
| Thinking Mode | **Disabled** (when enabled, all 8192 tokens are consumed by the reasoning chain, and content output is 0) |
| Directory | `tetris-test-Qwen3.6-35B/` |

**Tech Stack Selection:** Native HTML/CSS/JavaScript + Canvas API

The initial version adopted a multi-file modular architecture (`js/game.js`, `js/renderer.js`, `js/board.js`, `js/piece.js`, `js/audio.js`, `js/input.js`, `js/constants.js`), which was the most complete in engineering design among the three models. However, during the 2th round of fixes, all code was compressed and rewritten into a single-file inline version, and the original architecture was discarded.

> **Note:** The `js/` and `css/` directories contain the initial version code, which is no longer loaded by `index.html` and is for reference only. The game runs using the inline version within `index.html`.

**How to Run:**
```bash
cd tetris-test-Qwen3.6-35B
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080
```

**Evaluation Results:** After 8 rounds of code review (exceeding the agreed-upon 5 rounds), it ultimately **passed acceptance**. It claimed fixes 3 times when the code actually remained unchanged, and wrote fixes into deprecated external JS files 2 times.

**Implemented Bonus Features (Initial Version):** Hold buffer (correct), Ghost piece, Sound system (Web Audio API synthesized sounds), Local high score (localStorage), Next queue, Responsive CSS, DAS automatic input repeat (professional-grade keyboard handling)

**Bug Fix Log:**

| Round | Bug | Model Behavior | Final Status |
|------|-----|---------|:--------:|
| R1 | I piece rot0 generated vertically, should be horizontal | Claimed fix, code unchanged | — |
| R2 | Same as above, pointed out again | Actually fixed, but also compressed and rewrote the entire codebase, introducing 4 new bugs | ✅ |
| R3 | Ghost not transparent (`cell()` overwrote `globalAlpha`) + Sound toggle ineffective | Fixed in deprecated external JS file, ineffective | — |
| R4 | `spawn()` did not reset `this.pr`, piece generated at bottom, left/right keys ineffective | Located bug | — |
| R5 | Three bugs from R3+R4 fixed in same batch | `pr=0` and sound correctly fixed, ghost still fixed in deprecated file | ⚠️ |
| R6 | Ghost still in deprecated file | Fixed in `index.html`, correct | ✅ |
| R7 | Rotation failed: `WK[rotation]` should be `WK.normal[rotation]` | Claimed fix, code unchanged | — |
| R8 | Same as above, pointed out again | Actually fixed | ✅ |

---

## Final Scoring

| Dimension | gemma-4-31b | Qwen3.6-27B | Qwen3.6-35B | Qwen3.5-122B |
|------|:-----------:|:-----------:|:-----------:|:------------:|
| Initial Architecture Design (/20) | 15 | 18 | 19 | **20** |
| Functional Completeness (/20) | 10 | 17 | 15 | **19** |
| Code Correctness (/20) | 5 | 14 | 8 | **18** |
| Self-Repair Capability (/20) | 2 | 17 | 5 | **20** |
| Final Delivery Quality (/20) | 0 | 14 | 13 | **19** |
| **Total Score** | **32 / 100** | **80 / 100** | **60 / 100** | **96 / 100** |

---

## Key Findings

**1. Thinking mode is incompatible with code generation tasks**

When Qwen3.6-35B has thinking enabled, the 8192 token limit is entirely consumed by the internal reasoning chain (`reasoning_content`), resulting in an actual code output (`content`) of 0 bytes. With thinking disabled, the inference speed reaches 82 tok/s, making it the fastest model among the three.

**2. False reporting of fixes is a common phenomenon (but not across all models)**

Both gemma and Qwen3.6-35B exhibited multiple instances of claiming fixes were made while the code actually remained unchanged, sometimes even writing the fixes into deprecated files. Qwen3.6-27B and Qwen3.5-122B each had 0 instances of false reporting.

**3. Self-verification capabilities are inconsistent**

Qwen3.6-27B proactively invoked Playwright MCP to verify game behavior. Qwen3.6-35B also used Playwright but fell into an infinite loop due to using a `getImageData` loop to read canvas pixels. gemma performed no runtime verification at all. Qwen3.5-122B did not use Playwright, but its fixes were precise and correct on the first attempt.

**4. Architectural complexity is not positively correlated with delivery quality**

gemma, which had the most complex tech stack (React + TypeScript + Vite), was the only model that failed to pass acceptance. Qwen3.6-35B had the most complete initial architecture, but a single incorrect refactoring decision (compressing a multi-file architecture into a single file) introduced 4 new bugs, dragging a task that could have been fixed in 2 rounds out to 8 rounds.

**5. Larger model scale leads to higher fix quality**

Qwen3.5-122B (122B total parameters, 10B active) was the only model that completed fixes within 1 rounds, had 0 instances of false reporting, and proactively made correct fixes in all relevant files. Scale brought better code comprehension and more reliable execution.

**6. Models still fail to perform global checks even after being repeatedly pointed out about the same issue (more pronounced in smaller models)**

Both gemma and Qwen3.6-35B exhibited a tendency to "only fix the specific line pointed out," without proactively searching for similar issues globally.

---

## Repository Structure

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
