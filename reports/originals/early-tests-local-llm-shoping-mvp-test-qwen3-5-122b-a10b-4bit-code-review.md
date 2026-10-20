# Code Review — Round 2

[English](early-tests-local-llm-shoping-mvp-test-qwen3-5-122b-a10b-4bit-code-review.md) | [简体中文](early-tests-local-llm-shoping-mvp-test-qwen3-5-122b-a10b-4bit-code-review_CN.md)

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

**Overall Assessment:** The MVP has been completed and passed Playwright E2E verification, with all core functionalities operating normally. The PrismaClient multi-instance issue in Round 1 has been resolved.

---

## ✅ Acceptance Line: All Six-Step Process Passed

Playwright E2E verified:
1. **User Registration/Login** ✅
2. **Browse Product List (Pagination)** ✅
3. **View Product Details** ✅
4. **Shopping Cart (Persistence)** ✅
5. **Submit Order (Inventory Deduction)** ✅
6. **View Order List and Details** ✅

---

## Round 1 → Round 2 Fixes

### ✅ Fixed: PrismaClient Multiple Instance Issue

**Previous Issue:**
Each route file instantiated `new PrismaClient()` individually, which could lead to connection pool issues

**Fix:**
Created `src/lib/prisma.js` to export a global singleton:

```javascript
// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

All route files were changed to:
```javascript
import { prisma } from '../lib/prisma.js';
```

### ✅ Fixed: Order Creation Transaction API

**Previous Issue:**
`prisma.$startTransaction()` is not available in Prisma 5.x

**Fix:**
Switched to the `prisma.$transaction(async (tx) => {...})` interactive transaction API

---

## Backend Highlights

**Database Design (schema.prisma)**

- `CartItem` has a `@@unique([cartId, productId])` database-level unique constraint ✅
- `OrderItem` saves the historical price at the time of order placement `price: Float` ✅
- Cascade delete is configured correctly ✅

**Authentication (auth.js)**

- bcrypt encryption, salt rounds=10 ✅
- Unified error message `"Invalid email or password"` ✅
- Minimum password length of 6 characters validation ✅

**Order Creation (orders.js)**

- Uses `prisma.$transaction(async (tx) => {...})` transaction ✅
- Inventory validation → create order → deduct inventory → clear shopping cart ✅
- Returns 409 for insufficient inventory, returns 400 for empty shopping cart ✅
- Order cancellation rolls back inventory within the transaction ✅

**Product API (products.js)**

- Pagination, keyword search, category filtering ✅
- `/categories` independent endpoint ✅

---

## ⚠️ Unfixed (Technical Debt, Acceptable for MVP)

**1. Inventory Concurrency Protection (Acceptable under SQLite)**

Within the transaction, `SELECT` is performed before `UPDATE`, with no row-level locking (`SELECT FOR UPDATE`). SQLite naturally serializes operations due to file locking, preventing overselling; however, after switching to PostgreSQL, there is a theoretical risk of overselling under high concurrency.

**2. No TypeScript on the Frontend**

Native JavaScript implementation, lacking type safety. A bonus item for the exam.

---

## Summary

| Dimension | Evaluation |
|------|------|
| Six-step process usability | ✅ All passed |
| Password encryption | ✅ bcrypt |
| Historical price preservation | ✅ OrderItem.price |
| Inventory transactions | ✅ $transaction |
| Cancellation + rollback | ✅ Includes bonus items |
| Categories/Search | ✅ Includes bonus items |
| Docker Compose | ✅ Includes bonus items |
| API error code standards | ✅ |
| PrismaClient singleton | ✅ Fixed |
| Concurrent overselling (PostgreSQL) | ⚠️ Low risk |
| TypeScript | ❌ Not used |

**Round 2 Conclusion: ✅ Passed acceptance, all core functions are normal, and the PrismaClient singleton issue has been fixed.**
