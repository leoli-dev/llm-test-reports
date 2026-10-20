# Hermes Cafe POS / Config C

来源：原会话中保存的独立评审。原报告／源码目录本次未定位；以下是原报告消息摘录，不是重新测评。

## 原评审记录 1085

Config C review 完，已保存。

验证：

```text
npm test: pass, 22/22
npm run build: pass
build warnings: none
git repo: not initialized
```

结论：**Config C 反而比 B 差。**

主要问题：

1. **折扣 checkout 仍然坏**
   
   Cart.jsx（历史本机文件，未随本报告发布） 有把 `discountCode` 发出去：

   ```text
   pos-checkout { cart, discountCode }
   ```

   但 App.jsx（历史本机文件，未随本报告发布） 收到后没有传给 checkout，最后 cart.js（历史本机文件，未随本报告发布） 仍然：

   ```text
   calculatePricing(cart, productMap, null)
   ```

   所以 receipt / orders / summary 全部丢失折扣。

2. **库存状态同步更差**

   `App.jsx` 有自己的 `stock`，但 ProductCatalog.jsx（历史本机文件，未随本报告发布） 又自己 `loadStock()` 成本地 state。checkout 后 App 更新 stock，ProductCatalog 不会实时更新。

   更奇怪的是 Cart.jsx（历史本机文件，未随本报告发布） 读：

   ```text
   window.__posStock
   ```

   但全项目没有地方设置它。实际 stock limit 可能用旧 demo stock。

3. **CustomEvent 架构导致状态分裂**

   它自己报告也承认用了 window CustomEvent。这个选择确实让状态散在 ProductCatalog / Cart / App / Orders / Receipt / Summary，各自监听事件，容易漏同步。

4. **报告过度乐观**

   它说“all spec requirements implemented”，但 discount checkout 和 live stock sync 都没做好。README 也还是 Vite 模板。

评分：

```text
requirement_coverage: 7
functional_correctness: 5.8
ux_product_fit: 6.8
code_quality: 5.5
tests_verification: 5.8
constraint_following: 7.5
autonomy_recovery: 6
overall: 6.2
```

已保存：

config-c-fromzero-01-local-cafe-pos.md（历史本机文件，未随本报告发布）

并提交：

```text
330271f Record Config C from-zero POS evaluation
```

当前排序我会暂定：

```text
Config B: 7.3  最好
Config A: 6.5
Config C: 6.2  不推荐
```

## 原评审记录 1405

如果按而家呢个 **from-zero POS 单任务** 来讲，可以先算一轮测试完。

目前结论几清楚：

```text
E 7.5  temp 0.3, ctx 200k, max_tokens 32768, rep_penalty 1.05
D 7.4  temp 0.6, ctx 200k, max_tokens 32768, rep_penalty 1.05
B 7.3  temp 0.7, ctx 131k, max_tokens 16384
A 6.5  temp 0.1, ctx 131k, max_tokens 8192
C 6.2  temp 0.6, top_p 0.95
```

暂定 sweet spot：

```text
ctx_window: 200000
max_tokens: 32768
temperature: 0.3
top_p: 0.8
top_k: 20
min_p: 0.0
rep_penalty: 1.05
enable_thinking: false
TurboQuant KV Cache: false
DFlash: false
```

我会点理解：
- `temp 0.1` 太保守，反而容易机械但漏 integration。
- `top_p 0.95` 呢轮明显差，容易散。
- `rep_penalty 1.05 + 大 max_tokens + 200k ctx` 方向系啱。
- `temp 0.3` 比 `0.6` 稳少少，但优势唔大，E 赢 D 只系 0.1 分。

未测试嘅只剩两类：
- performance/稳定性开关：TurboQuant KV Cache / DFlash
- 换任务类型复验：例如“扩展既有复杂代码库”而唔系 from-zero

如果你今日想收工，结论可以用 E 做默认。

