# Hermes Cafe POS / Config E

来源：原会话中保存的独立评审。原报告／源码目录本次未定位；以下是原报告消息摘录，不是重新测评。

## 原评审记录 1397

系，呢个回复确实“超级详细”，而且比前几轮更有自我审计味。实际测评结果我记低咗：**Config E = 7.5/10，目前暂时第一**。

好处：
- `npm test` 22/22 pass，`npm run build` pass。
- discount flow 目前最好：输入值同已应用折扣分开，checkout 用 validated `appliedDiscount`，唔再似 B/C 咁丢折扣。
- UI 係 inline style，所以冇 D 嗰个 `App.css` 写咗但冇 import 嘅问题。
- 代码结构比 D 更模块化。

主要问题：
- **Sales Summary 算错数**：`grossRevenue` 用咗 final total，`netRevenue` 又再减 discount，导致收入统计混入 tax 且重复扣 discount。
- Reset 明明 hook 有 `clearOrders`，但 App 直接删 localStorage + reload，粗糙。
- 无 `README.md`。
- tests 依然偏纯逻辑模拟，冇覆盖真实 UI checkout / summary integration。

已保存：$HOME/Code/hermes-agent-eval-log/evaluations/2026-05-27/config-e-fromzero-01-local-cafe-pos.md（历史本机文件，未随本报告发布）  
已 commit：`d008ce6 Record Config E from-zero POS evaluation`

当前排名：

```text
E 7.5
D 7.4
B 7.3
A 6.5
C 6.2
```

低温 E 暂时赢少少，感觉系更稳、更少集成漏线，但业务细节仍会错。

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

