# Hermes Cafe POS / Config B

[English](session-cafe-pos-config-b.md) | [简体中文](session-cafe-pos-config-b_CN.md)

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

来源：原会话中保存的独立评审。原报告／源码目录本次未定位；以下是原报告消息摘录，不是重新测评。

## 原评审记录 973

Config B review 完，已保存记录。

验证结果：

```text
project: $HOME/Code/hermes-eval-local-cafe-pos
npm test -- --verbose: pass, 23/23
npm run build: pass, no warnings
git repo: not initialized
```

比 Config A 明显好：

- build 干净，没有 Config A 那堆 type-only import warnings
- 非折扣 checkout 路径是正常的：订单金额、库存、订单列表基本能跑通
- 项目结构更直接，JS + React + Vite，少了 TypeScript 配置噪音
- UI/功能覆盖更接近真实可用 app

但仍有一个关键 bug：

折扣码只影响 cart 显示，不进入 checkout。

在 Cart.jsx（历史本机文件，未随本报告发布），`appliedCode` 是 Cart 组件内部 state。  
但 App.jsx（历史本机文件，未随本报告发布） checkout 时只调用：

```text
checkout(cart, productMap, stock, orders)
```

然后 cart.js（历史本机文件，未随本报告发布） 用：

```text
calculatePricing(cart, productMap, null)
```

所以结果是：cashier 在 cart 里看到 `SAVE10` 折扣，但 checkout 后 receipt/order/sales summary 记录的是**未打折金额**。

评分：

```text
requirement_coverage: 8
functional_correctness: 7
ux_product_fit: 7.5
code_quality: 7
tests_verification: 6.5
constraint_following: 8
autonomy_recovery: 7
overall: 7.3
```

记录已保存：

config-b-fromzero-01-local-cafe-pos.md（历史本机文件，未随本报告发布）

并提交：

```text
6e9893c Record Config B from-zero POS evaluation
```

当前小结：**Config B > Config A**。  
A 做出大而像样的东西，但 checkout 金额核心断了；B 更干净，主流程更接近可用，只是 discount integration 漏了。

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

