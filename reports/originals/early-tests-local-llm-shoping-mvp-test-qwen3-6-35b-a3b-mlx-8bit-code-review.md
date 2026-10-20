# Code Review — Round 1

[English](early-tests-local-llm-shoping-mvp-test-qwen3-6-35b-a3b-mlx-8bit-code-review.md) | [简体中文](early-tests-local-llm-shoping-mvp-test-qwen3-6-35b-a3b-mlx-8bit-code-review_CN.md)

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

**Overall Evaluation:** The most comprehensive technology selection (React 19 + TypeScript full-stack), with a more standardized database design than 122B. JWT Refresh Token, database indexing, and product name historical snapshots were all proactively implemented. The backend code quality is extremely high.

---

## ✅ Issue 1: Code placed in wrong directory — FIXED

The code has been moved to the `Qwen3.6-35B-A3B-MLX-8bit/` subdirectory.

---

## ✅ Issue 2: Frontend UI Verification — FIXED

Completed E2E verification of the six-step complete user flow using Playwright:

| Step | Action | Result |
|------|------|:----:|
| 1. User Registration/Login | Registered a new user `uiuser`, successfully redirected to the homepage | ✅ |
| 2. Browse Product List (Pagination) | Homepage displays 6 products, pagination buttons work correctly (2 pages) | ✅ |
| 3. View Product Details | Clicked "Wireless Headphones", displayed image/price/stock/description | ✅ |
| 4. Add to Cart/Modify Quantity | Added 1 item(s) → changed quantity to 2 → subtotal $399.98 | ✅ |
| 5. Submit Order (Inventory Deduction) | Clicked Checkout → redirected to order page, status PENDING | ✅ |
| 6. View Order/Cancel | Entered order details → cancelled order → status changed to CANCELLED | ✅ |

**Additional Verification:**
- Inventory rollback after order cancellation (50 → 48 → 50) ✅
- Product search functionality ("headphones" → 1 results) ✅
- Product category filtering (Electronics → 3 results) ✅
- Header displays username + Cart/Orders navigation links ✅
- JWT token automatic refresh logic (401 → refresh) ✅

---

## Backend Highlights (Exceeds Qwen3.5-122B in multiple areas)

**Database Design (schema.prisma)**

- `Category` independent table, products linked via foreign key (normalization vs. the category string field in 122B) ✅
- `Product` has `@@index([categoryId])` and `@@index([name])` performance indexes ✅
- `CartItem` has `@@unique([cartId, productId])` database unique constraint ✅
- `OrderItem` saves two historical snapshot fields: `productName` + `productPrice` (more complete than 122B which only saves price) ✅
- More standardized field naming: `passwordHash` (vs. `password` in 122B) ✅

**Authentication (auth.ts)**

- bcrypt encryption, `SALT_ROUNDS` constant ✅
- **JWT Refresh Token** (bonus point): access token 7 days + refresh token 30 days, two independent secrets ✅
- Login does not expose which specific field is incorrect ✅
- Uses destructuring in response to exclude `passwordHash`: `const { passwordHash: _, ...userWithoutPassword } = user` ✅

**Order Creation (orders.ts)**

- `prisma.$transaction(async tx => {...})` interactive transaction ✅
- Correct sequence: verify stock → create order + details → deduct stock → clear cart ✅
- Insufficient stock returns 409, with clear error message including product name and available quantity ✅
- Full TypeScript coverage (`error instanceof Error` type guard) ✅

**Full-Stack TypeScript**

Frontend (React 19 + Vite + TypeScript) + Backend (Express + TypeScript) both use TypeScript, the most significant bonus point ✅

---

## Fix Log

| Round | Issue | Fix | Status |
|------|------|------|:----:|
| R1 | Code placed in wrong directory | Moved `backend/`, `frontend/`, `docker-compose.yml` to `Qwen3.6-35B-A3B-MLX-8bit/` | ✅ |
| R1 | No frontend UI verification | Playwright E2E verification of the complete six-step user flow | ✅ |
| R1 | Header JWT decode failure | Fixed URL-safe base64 decoding (`-` → `+`, `_` → `/`) | ✅ |
| R1 | Search API 500 error | Removed Prisma `mode: 'insensitive'` (not supported by SQLite) | ✅ |

---

## Final Score

| Dimension | Weight | Qwen3.6 | Score |
|------|:----:|:-------:|:----:|
| Functional Completeness (Six-Step Process) | 30% | All passed, including 5 bonus features | 30 |
| Database Design | 20% | Correct relationships, unique constraints, historical prices, indexes | 20 |
| API Design and Error Handling | 20% | RESTful, accurate error codes, complete documentation | 20 |
| Backend Security and Correctness | 20% | bcrypt, JWT+Refresh, transactions, no overselling | 20 |
| Code Quality and Documentation | 10% | Full-stack TypeScript, clear structure, complete README | 10 |
| **Total Score** | **100%** | | **100 / 100** |
