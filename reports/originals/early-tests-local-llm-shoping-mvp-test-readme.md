# Local LLM Coding Capability Evaluation — Full-Stack E-commerce MVP

[English](early-tests-local-llm-shoping-mvp-test-readme.md) | [简体中文](early-tests-local-llm-shoping-mvp-test-readme_CN.md)

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

This repository documents an in-depth evaluation of the **full-stack coding capabilities** of a locally deployed large language model. Compared to Tetris (pure frontend), this evaluation requires the model to simultaneously cover four dimensions: frontend, backend API, and database design, making it closer to real-world engineering scenarios.

The evaluation used **Claude Code v2.1.160** as the Coding Agent, with **oMLX** performing local inference on Apple Silicon, and Claude Sonnet 4.6 serving as the Code Reviewer, verifying final runnability through multiple rounds of review.

---

## Test Environment

| Item | Configuration |
|------|------|
| **Hardware** | Apple M5 Max · 128 GB Unified Memory |
| **Inference Platform** | oMLX v0.4.0rc2 |
| **Coding Agent** | Claude Code v2.1.160 |
| **Reviewer** | Claude Sonnet 4.6 |
| **Evaluation Date** | 2026-06-04 |
| **Acceptance Criteria** | All six steps of the user workflow are operable in the browser |

---

## Assessment Questions

> See REQUIREMENT.md for the complete questions (a historical local file, not published with this report)

### Core Requirements

Implement an e-commerce system that supports the following **complete user flow**:

1. User registration / login (JWT authentication, password bcrypt encryption)
2. Browse product list (with pagination support)
3. View product details
4. Add products to cart / modify quantity (persisted to the database)
5. Submit order (inventory must be actually deducted within the same transaction)
6. View my order list and order details

### Veto Items

- Plaintext password storage
- Inventory deduction not within a transaction

### Hidden Assessment Points (not explicitly stated in the questions, key points to check during review)

- Does the cart have a database-level unique constraint (to prevent duplicate additions)?
- Does the order save the historical price at the time of ordering (not changing with product price fluctuations)?
- Transaction order: verify inventory → create order → deduct inventory → clear cart
- Are the API error code semantics correct (400/401/404/409)?
- Does a login error expose specifically which field is incorrect?

---

## Models Under Test

### 1. Qwen3.5-122B-A10B-4bit

| Property | Value |
|------|----|
| Type | VLM (MoE, active parameters approx. 10B) |
| Size | 68 GB (4bit quantization) |
| Inference Speed | ~41 tok/s |
| Context Window | 262,144 tokens |
| Sampling Parameters | temp=0.6, top_p=0.95, top_k=20 (official coding recommendation) |
| Thinking Mode | Disabled |
| Directory | `Qwen3.5-122B-A10B-4bit/` |

**Tech Stack Selection:**
- Frontend: Native JavaScript + Hash Router (no framework, zero dependencies)
- Backend: Node.js + Express + Prisma ORM
- Database: SQLite (development)
- Container: Docker Compose

**How to Run:**
```bash
cd Qwen3.5-122B-A10B-4bit
docker compose up
# 前端：http://localhost:3000
# 后端 API：http://localhost:3001
```

Or start locally:
```bash
# 后端
cd backend && npm install
npx prisma migrate dev
node src/seed.js
npm start

# 前端（另开终端）
cd frontend && npm install && npm start
```

**Evaluation Results:** After **2 rounds** of code review and **0 false reports**, the model proactively used Playwright for E2E verification and passed acceptance.

**Six-Step Process Acceptance (Playwright E2E):**

| Step | Status |
|------|:----:|
| User Registration / Login | ✅ |
| Browse Product List (Pagination) | ✅ |
| View Product Details | ✅ |
| Shopping Cart (Persistence, Quantity Merging) | ✅ |
| Submit Order (Inventory Deduction) | ✅ |
| View Order List and Details | ✅ |

**Implemented Bonus Items:**
- Product Search (Keywords) ✅
- Product Category Filtering ✅
- Order Cancellation + Inventory Rollback ✅
- Docker Compose One-Click Start ✅

**Backend Highlights:**

| Check Item | Status | Description |
|--------|:----:|------|
| Password bcrypt Encryption | ✅ | salt rounds=10 |
| JWT Authentication | ✅ | 7 days validity, configured via environment variables |
| Login Errors Do Not Expose Fields | ✅ | Uniformly returns "Invalid email or password" |
| Shopping Cart Database Unique Constraint | ✅ | `@@unique([cartId, productId])` |
| Order Historical Price | ✅ | `OrderItem.price` independent field |
| Inventory Deduction Transaction | ✅ | `prisma.$transaction(async tx => {...})` |
| Insufficient Inventory 409 | ✅ | Correct error code semantics |
| Order Cancellation Inventory Rollback | ✅ | Completed within transaction |
| API Error Code Standards | ✅ | Correct usage of 400/401/404/409/500 |

**Bug Fix Log:**

| Round | Issue | Fix | Status |
|------|------|------|:----:|
| R1 | PrismaClient instantiated separately in each route file | Created `src/lib/prisma.js` global singleton, used `globalThis` to prevent duplicate instantiation during HMR | ✅ Proactively Fixed |

> The model **proactively fixed** the issue after receiving the Round 1 review, without being asked, and independently updated CODE_REVIEW.md.

**oMLX Runtime Statistics:**

| Metric | Value |
|------|----|
| Total Prefill Tokens | 10.8M |
| Cache Hit Tokens | 9,254,912 |
| Cache Efficiency | 85.4% |
| Token Generation Speed | 36.0 tok/s |
| VRAM Usage | ~65.19 GB |

---

### 2. Qwen3.6-35B-A3B-MLX-8bit

| Property | Value |
|------|----|
| Type | LLM (MoE, ~3B active parameters) |
| Size | ~35.51 GB (8bit quantization) |
| Inference Speed | ~60.1 tok/s |
| Context Window | 128,000 tokens |
| Sampling Parameters | Default parameters |
| Thinking Mode | Disabled |
| Directory | `Qwen3.6-35B-A3B-MLX-8bit/` |

**Tech Stack Selection:**
- Frontend: React 19 + Vite + TypeScript + React Router v7
- Backend: Node.js + Express + TypeScript + Prisma ORM
- Database: SQLite (development)
- Authentication: JWT (access token 7 days + refresh token 30 days, dual secrets)
- Containerization: Docker Compose + Nginx (frontend static serving)

**How to Run:**
```bash
cd Qwen3.6-35B-A3B-MLX-8bit
docker compose up --build
# 前端：http://localhost:3000
# 后端 API：http://localhost:3001
```

Or start locally:
```bash
# 后端
cd backend && npm install
npx prisma migrate dev
npm run seed
npm run dev

# 前端（另开终端）
cd frontend && npm install && npm run dev
```

**Test Account:**
```
Email: test@example.com
Password: password123
```

**Evaluation Results:** After **1 rounds** of code review and **4 fixes**, passed acceptance.

**Six-Step Process Acceptance (Playwright E2E):**

| Step | Status |
|------|:----:|
| User Registration / Login | ✅ |
| Browse Product List (Pagination) | ✅ |
| View Product Details | ✅ |
| Shopping Cart (Persistence, Quantity Merging) | ✅ |
| Submit Order (Inventory Deduction) | ✅ |
| View Order List and Details | ✅ |

**Implemented Bonus Features:**
- Product Search (Keyword) ✅
- Product Category Filtering ✅
- Order Cancellation + Inventory Rollback ✅
- Docker Compose One-Click Startup ✅
- JWT Refresh Token (access 7 days + refresh 30 days) ✅
- Full-Stack TypeScript (Frontend + Backend) ✅

**Backend Highlights:**

| Check Item | Status | Description |
|--------|:----:|------|
| Password bcrypt Encryption | ✅ | salt rounds=10 |
| JWT Authentication | ✅ | access token 7 days, configured via environment variables |
| JWT Refresh Token | ✅ | 30 days validity, independent secret, frontend 401 auto-renewal |
| Login Errors Do Not Expose Fields | ✅ | Uniformly returns "Invalid email or password" |
| Shopping Cart Database Unique Constraint | ✅ | `@@unique([cartId, productId])` |
| Order Dual History Snapshots | ✅ | `OrderItem.productPrice` + `productName` (more complete than 122B) |
| Inventory Deduction Transaction | ✅ | `prisma.$transaction(async tx => {...})` |
| Insufficient Inventory 409 | ✅ | Detailed error message including product name and available quantity |
| Order Cancellation Inventory Rollback | ✅ | `increment` rollback within transaction |
| Category Normalization | ✅ | Independent Category table (foreign key association, vs string field in 122B) |
| Database Indexes | ✅ | `@@index([categoryId])` + `@@index([name])` to accelerate queries |
| API Error Code Standards | ✅ | Correct usage of 400/401/404/409/500 |
| Global Error Handling | ✅ | Express error handler fallback, prevents stack trace leakage |

**Bug Fix Log:**

| Round | Issue | Fix | Status |
|------|------|------|:----:|
| R1 | Code placed in wrong directory | Moved `backend/`, `frontend/`, `docker-compose.yml` to `Qwen3.6-35B-A3B-MLX-8bit/` | ✅ |
| R1 | Header JWT decode failure | Fixed URL-safe base64 decoding (`-` → `+`, `_` → `/`) | ✅ Proactively discovered |
| R1 | Search API 500 error | Removed Prisma `mode: 'insensitive'` (not supported by SQLite) | ✅ |
| R1 | Incomplete frontend UI verification | Supplemented Playwright E2E verification of the complete six-step process | ✅ |

**oMLX Runtime Statistics:**

| Metric | Value |
|------|----|
| Total Prefill Tokens | 11.7M |
| Cache Hit Tokens | 10.3M |
| Cache Efficiency | 88.0% |
| Token Generation Speed | **60.1 tok/s** |
| Prompt Processing Speed | 1236.6 tok/s |
| VRAM Usage | ~35.51 GB |

---

### 3. Qwen3.6-27B-UD-MLX-4bit

| Attribute | Value |
|------|----|
| Type | LLM (MoE, ~3B active parameters) |
| Size | ~24.78 GB (4bit quantization) |
| Inference Speed | ~14.2 tok/s (extremely slow) |
| Context Window | 128,000 tokens |
| Sampling Parameters | Default parameters |
| Thinking Mode | Disabled |
| Directory | `Qwen3.6-27B-UD-MLX-4bit/` |

**Tech Stack Selection:**
- Frontend: React 18 + Vite + TypeScript + React Router
- Backend: Node.js + Express + TypeScript
- Database: SQLite via **sql.js** (WebAssembly, in-memory database)
- Authentication: JWT (24 hour validity, no refresh token)
- Containerization: None (Docker Compose not implemented)

**Evaluation Result:** ❌ **Test aborted, failed acceptance.** Testing lasted more than 5 hours, and the project never ran properly.

**Root Cause Analysis:**

| Issue | Severity | Description |
|------|:--------:|------|
| sql.js used for Node.js backend | Critical | sql.js is a WebAssembly version of SQLite designed for **browsers**, unsuitable for server-side use. The database is entirely in memory, requiring manual calls to `saveDatabase()` to persist to disk for every write operation; any exception results in data loss |
| Incorrect reading of React Router route parameters | Critical | `ProductDetailPage` and `OrderDetailPage` used `window.location.pathname.split('/').pop()` to read route parameters instead of the `useParams()` provided by React Router, causing route parameters to be lost when accessing detail pages directly or refreshing |
| `/api/auth/me` missing authentication middleware | High | `auth.routes.ts` did not mount `authenticateToken`, so `_req.userId` was always `undefined`, and the API always returned 404 |
| Returning 403 instead of 401 when JWT is invalid | High | Expired/invalid tokens should return 401; 403 indicates "valid but no permission." The frontend could not correctly catch 401 to trigger the re-login flow |
| CORS hardcoded to localhost:5173 | Medium | Only allows the Vite development port, preventing operation in Docker or other environments |
| No Docker Compose | Medium | No one-click deployment; the startup process relies entirely on manual operations |
| All pages crammed into a single App.tsx | Low | A giant file of 430 lines, with helpers like `queryAll`/`queryGet` duplicated across multiple route files |
| ProductsPage loading state not reset on error | Low | `setLoading(false)` was not called when the API failed, causing the page to display "Loading..." permanently |

**Key Gaps Compared to Passing Models:**

| Aspect | Qwen3.5-122B ✅ | Qwen3.6-35B ✅ | Qwen3.6-27B ❌ |
|------|:---:|:---:|:---:|
| Database Solution | Prisma ORM | Prisma ORM | sql.js WASM |
| Docker Compose | ✅ | ✅ | ❌ |
| Frontend Page Structure | Separate page files | Separate page files | All in App.tsx |
| Route Parameter Reading | `useParams()` | `useParams()` | `window.location` |
| JWT Expiration Status Code | 401 | 401 | 403 |
| Token Generation Speed | 36.0 tok/s | 60.1 tok/s | **14.2 tok/s** |

**oMLX Runtime Statistics:**

| Metric | Value |
|------|----|
| Total Prefill Tokens | 12.8M |
| Cache Hit Tokens | 11.3M |
| Cache Efficiency | 88.5% |
| Token Generation Speed | **14.2 tok/s** (approximately 1/4 of 35B) |
| Prompt Processing Speed | 319.1 tok/s |
| VRAM Usage | ~24.78 GB |
| Total Test Duration | >5 hours (aborted) |

---

### 4. gemma-4-31b-it-8bit

| Property | Value |
|------|----|
| Type | VLM |
| Size | ~32.40 GB (8bit quantization) |
| Inference Speed | ~15.6 tok/s |
| Context Window | 128,000 tokens |
| Sampling Parameters | temp=1.0, top_p=0.95, top_k=64 (officially recommended) |
| Thinking Mode | Disabled |
| Directory | `gemma-4-31b-it-8bit/` |

**Tech Stack Selection:**
- Frontend: React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router v7
- Backend: Node.js + Express + TypeScript + sqlite (native driver, no ORM)
- Database: SQLite (development)
- Authentication: JWT (24 hour validity)
- Containerization: Docker Compose

**How to Run:**
```bash
cd gemma-4-31b-it-8bit
docker compose up --build
# 前端：http://localhost:5173
# 后端 API：http://localhost:3001
```

Or start locally:
```bash
# 后端
cd backend && npm install && npm run dev

# 前端（另开终端）
cd frontend && npm install && npm run dev
```

**Evaluation Results:** After **3 rounds** of code review, passed acceptance.

**Six-Step Process Acceptance (Playwright E2E):**

| Step | Status |
|------|:----:|
| User Registration / Login | ✅ |
| Browse Product List (Pagination) | ✅ |
| View Product Details | ✅ |
| Shopping Cart (Persistence, Quantity Merging) | ✅ |
| Submit Order (Inventory Deduction) | ✅ |
| View Order List and Details | ✅ |

**Implemented Bonus Items:**
- Product Search (Keyword) ✅
- Product Category Filtering ✅
- Order Cancellation + Inventory Rollback ✅
- Docker Compose One-Click Startup ✅
- Tailwind CSS Responsive UI ✅

**Backend Highlights:**

| Check Item | Status | Description |
|--------|:----:|------|
| Password bcrypt Encryption | ✅ | salt rounds=10 |
| JWT Authentication | ✅ | 24 hour validity |
| Login Errors Do Not Expose Fields | ✅ | Uniformly returns "Invalid credentials" |
| Shopping Cart Database Unique Constraint | ✅ | `UNIQUE(user_id, product_id)` |
| Order Historical Price | ✅ | `price_at_purchase` field |
| Order Historical Product Name | ✅ | `product_name` field (LEFT JOIN protection) |
| Inventory Deduction Transaction | ✅ | `BEGIN TRANSACTION / COMMIT / ROLLBACK` |
| Insufficient Inventory 409 | ✅ | Correct error code semantics |
| Order Cancellation Inventory Rollback | ✅ | `stock + quantity` within transaction |
| API Error Code Standards | ✅ | Correct usage of 400/401/404/409 |

**Bug Fix Log:**

| Round | Issue | Fix | Status |
|------|------|------|:----:|
| R1 | `orderController.ts` syntax error (missing colon in `message`) | Added colon | ✅ |
| R1 | Incorrect transaction order (inventory deduction before order creation) | Adjusted to: Check Inventory → Create Order → Deduct Inventory → Clear Cart | ✅ |
| R1 | Insufficient inventory returned 400 instead of 409 | Changed to 409 | ✅ |
| R1 | Registration success did not return token | register endpoint synchronously returns JWT | ✅ |
| R1 | Missing search/category/order cancellation/product_name/Docker | Completed all features | ✅ |
| R2 | OrderDetail displayed `item.name` (field does not exist) | Changed to `item.product_name` | ✅ |
| R2 | No cancel button on order details page | Added Cancel Order button | ✅ |
| R3 | `tsconfig.json` `verbatimModuleSyntax` + `nodenext` configuration conflict | Changed to CommonJS compatible configuration | ✅ |
| R3 | Tailwind v4 configuration entirely used v3 syntax (3 errors) | `@import "tailwindcss"` + `@tailwindcss/vite` plugin | ✅ |
| R3 | Product image URLs used deprecated `via.placeholder.com` | Replaced with `placehold.co` | ✅ |

**oMLX Runtime Statistics:**

| Metric | Value |
|------|----|
| Total Prefill Tokens | 2.8M |
| Cache Hit Tokens | 2.5M |
| Cache Efficiency | 88.8% |
| Token Generation Speed | 15.6 tok/s |
| Prompt Processing Speed | 303.7 tok/s |
| VRAM Usage | ~32.40 GB |

---

## Final Scoring

| Dimension | Weight | Qwen3.5-122B | Qwen3.6-35B | Qwen3.6-27B | gemma-4-31b-it |
|------|:----:|:------------:|:-----------:|:-----------:|:--------------:|
| Functional Completeness (Six-Step Process) | 30% | 30 | **30** | — (Incomplete) | 28 |
| Database Design | 20% | 19 | **20** | — | 15 |
| API Design and Error Handling | 20% | 18 | **20** | — | 16 |
| Backend Security and Correctness | 20% | 18 | **19** | — | 16 |
| Code Quality and Documentation | 10% | 9 | 9 | — | 7 |
| **Total Score** | **100%** | **94 / 100** | **98 / 100** | **❌ DNF** | **82 / 100** |

> Scores were independently assigned by Claude Sonnet 4.6; model self-assessment scores were not adopted. Qwen3.6-27B was aborted due to test timeout and is not included in the scoring rankings.

---

## Key Findings

**1. The quality gap between models is more pronounced in full-stack tasks**

Bugs in Tetris (pure frontend) are mostly logical implementation details, which are easy to find and fix. The e-commerce system requires models to simultaneously understand business logic (historical prices, cart merging), security practices (bcrypt, JWT), and database transactions—the depth and breadth of this knowledge make it easier for smaller models to show their limitations.

**2. Qwen3.5-122B proactively extrapolates**

After receiving the Round 1 review, the model not only fixed the pointed-out PrismaClient singleton issue but also proactively fixed another related transaction API issue (`$startTransaction` → `$transaction`) and independently updated CODE_REVIEW.md to Round 2. This stands in stark contrast to the behavior of smaller models in the Tetris evaluation, which "only fixed the specific line pointed out."

**3. High pass rate on hidden test points**

Historical price saving (`OrderItem.price`), database unique constraints for the shopping cart (`@@unique`), and transaction order correctness—all three of these explicitly unmentioned test points were handled correctly, indicating that 122B and 35B possess genuine business understanding capabilities rather than simply applying templates.

**4. Among the three models that passed acceptance, Qwen3.6-35B is the best overall**

Qwen3.5-122B (94 points), Qwen3.6-35B (98 points), and gemma-4-31b-it (82 points) all passed acceptance. 35B achieved the highest score with the fewest review rounds (1 rounds) and the most complete tech stack (Prisma + TypeScript + JWT Refresh).

**5. Qwen3.6-35B overtakes in full-stack tasks**

In the Tetris evaluation, 35B performed poorly (60 points) because refactoring the code introduced 4 new bugs. However, in the e-commerce task, its Category normalization design, DB indexing, JWT Refresh Token, and full-stack TypeScript implementation resulted in a score (98 points) higher than Qwen3.5-122B (94 points). Task type affects model performance.

**6. The failure of Qwen3.6-27B reveals that "tool selection" is a critical threshold**

The core error of 27B was using sql.js (a browser-side WASM database) for server-side storage, exposing a lack of understanding of the Node.js ecosystem. In contrast, the models that passed acceptance all chose appropriate tools (Prisma or native sqlite drivers). In full-stack tasks, **the ability to select the correct tools** determines success or failure earlier than specific implementation details.

**7. gemma-4-31b-it exposed a weakness in "configuration awareness"**

gemma completed all business logic but repeatedly failed at the engineering configuration level: tsconfig `verbatimModuleSyntax` configuration conflicts prevented the backend from starting, three Tailwind v4 configurations used v3 syntax causing CSS to fail completely, and a third-party image service had been discontinued. These are all "configuration awareness" issues unrelated to code logic—knowing which technology to use but not understanding the version differences and current state of the ecosystem for that technology. Such issues were almost non-existent in the Qwen series models.

**8. The impact of inference speed on complex tasks cannot be ignored**

| Model | Token Speed | Review Rounds | Final Score |
|------|:----------:|:-----------:|:------:|
| Qwen3.6-35B | 60.1 tok/s | 1 | 98 |
| Qwen3.5-122B | 36.0 tok/s | 2 | 94 |
| gemma-4-31b-it | 15.6 tok/s | 3 | 82 |
| Qwen3.6-27B | 14.2 tok/s | DNF | — |

The slower the speed, the higher the cost per iteration, the more limited the model's "thinking" time, and the more rounds are ultimately required for fixes. Models below 15 tok/s are clearly struggling with full-stack tasks.

---

## Repository Structure

```
local-llm-shoping-mvp-test/
├── README.md                              # 本文件
├── REQUIREMENT.md                         # 完整测评题目
├── Qwen3.5-122B-A10B-4bit/               # Qwen3.5-122B 的代码（✅ 通过验收，94分）
│   ├── CODE_REVIEW.md                     # 2轮 code review 记录
│   ├── docker-compose.yml                 # 一键启动配置
│   ├── backend/
│   │   ├── src/
│   │   │   ├── server.js                  # Express 入口
│   │   │   ├── lib/prisma.js              # PrismaClient 全局单例
│   │   │   ├── middleware/auth.js         # JWT 认证中间件
│   │   │   ├── routes/
│   │   │   │   ├── auth.js               # 注册/登录
│   │   │   │   ├── products.js           # 商品列表/详情/搜索/分类
│   │   │   │   ├── cart.js               # 购物车 CRUD
│   │   │   │   └── orders.js             # 下单/查询/取消
│   │   │   └── seed.js                   # 初始化10件商品
│   │   └── prisma/schema.prisma          # 数据库 schema（含所有模型和关系）
│   └── frontend/
│       └── src/
│           ├── router.js                  # Hash Router（含动态路由）
│           ├── api.js                     # API 请求封装
│           └── pages/
│               ├── auth.js               # 登录/注册页
│               ├── products.js           # 商品列表/详情页
│               ├── cart.js               # 购物车页
│               └── orders.js             # 订单页
├── Qwen3.6-35B-A3B-MLX-8bit/             # Qwen3.6-35B 的代码（✅ 通过验收，98分）
    ├── CODE_REVIEW.md                     # 1轮 code review 记录
    ├── docker-compose.yml                 # 一键启动配置
    ├── backend/
    │   ├── src/
    │   │   ├── index.ts                   # Express 入口
    │   │   ├── lib/db.ts                  # PrismaClient 全局单例
    │   │   ├── middleware/auth.ts          # JWT 认证中间件（含 refresh secret）
    │   │   ├── routes/
    │   │   │   ├── auth.ts               # 注册/登录/refresh token/logout
    │   │   │   ├── products.ts           # 商品列表/详情/搜索/分类
    │   │   │   ├── cart.ts               # 购物车 CRUD（upsert 合并数量）
    │   │   │   └── orders.ts             # 下单/查询/取消
    │   │   └── seed.ts                   # 12件商品 + 4分类 + 测试用户
    │   └── prisma/schema.prisma          # 数据库 schema（含 Category 表和索引）
    └── frontend/
        └── src/
            ├── App.tsx                    # React Router 路由布局
            ├── api/
            │   ├── client.ts             # API client（含 401 自动续签逻辑）
            │   └── types.ts              # TypeScript 类型定义
            ├── hooks/useAuth.ts          # 认证状态 hook
            ├── components/
            │   ├── Header.tsx            # 导航栏（含用户名/购物车/订单）
            │   ├── ProductCard.tsx       # 商品卡片组件
            │   └── Pagination.tsx        # 分页组件
            ├── pages/
            │   ├── Login.tsx             # 登录页
            │   ├── Register.tsx          # 注册页
            │   ├── ProductList.tsx       # 商品列表（搜索/分类/分页）
            │   ├── ProductDetail.tsx     # 商品详情页
            │   ├── Cart.tsx              # 购物车页
            │   ├── OrdersList.tsx        # 订单列表页
            │   └── OrderDetail.tsx       # 订单详情页
            └── styles/global.css         # 响应式全局样式
├── Qwen3.6-27B-UD-MLX-4bit/             # Qwen3.6-27B 的代码（❌ 测试中止，DNF）
    ├── README.md                          # 模型生成的说明文档
    ├── backend/
    │   └── src/
    │       ├── index.ts                   # Express 入口（CORS 硬编码 5173）
    │       ├── database/init.ts           # sql.js WASM 初始化（致命选型错误）
    │       ├── middleware/auth.ts         # JWT 认证（错误码 403 而非 401）
    │       ├── routes/
    │       │   ├── auth.routes.ts        # 注册/登录（/me 缺少认证中间件）
    │       │   ├── products.routes.ts    # 商品列表/详情
    │       │   ├── cart.routes.ts        # 购物车 CRUD
    │       │   └── orders.routes.ts      # 下单/查询/取消
    │       └── seed/products.ts          # 12件商品 + 4分类
    └── frontend/
        └── src/
            ├── App.tsx                    # 所有页面组件塞入单文件（430行）
            ├── api.ts                     # API client
            └── contexts/AuthContext.tsx   # 认证状态管理
└── gemma-4-31b-it-8bit/                  # gemma-4-31b-it 的代码（✅ 通过验收，82分）
    ├── README.md                          # 模型生成的说明文档
    ├── docker-compose.yml                 # 一键启动配置
    ├── backend/
    │   └── src/
    │       ├── index.ts                   # Express 入口 + 自动 seed
    │       ├── config/db.ts               # SQLite 初始化（原生驱动）
    │       ├── middleware/auth.ts         # JWT 认证中间件
    │       ├── utils/auth.ts             # bcrypt + JWT 工具函数
    │       ├── controllers/              # MVC controller 层
    │       │   ├── authController.ts     # 注册/登录
    │       │   ├── productController.ts  # 商品列表/详情/搜索/分类
    │       │   ├── cartController.ts     # 购物车 CRUD
    │       │   └── orderController.ts    # 下单/查询/取消
    │       └── routes/                   # 路由层
    └── frontend/
        └── src/
            ├── App.tsx                    # React Router 路由布局
            ├── api.ts                     # Axios API client
            └── pages/
                ├── Login.tsx             # 登录页
                ├── Register.tsx          # 注册页
                ├── Home.tsx              # 商品列表（搜索/分类/分页）
                ├── ProductDetail.tsx     # 商品详情页
                ├── Cart.tsx              # 购物车页
                ├── Orders.tsx            # 订单列表页
                └── OrderDetail.tsx       # 订单详情（含取消按钮）
```
