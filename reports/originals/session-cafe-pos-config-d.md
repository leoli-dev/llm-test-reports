# Hermes Cafe POS / Config D

来源：原会话中保存的独立评审。原报告／源码目录本次未定位；以下是原报告消息摘录，不是重新测评。

## 原评审记录 1254

测评完成，已保存记录并 commit。

Config D 结果：**7.4/10，目前暂时第一**。  
比 B/C 好嘅地方系业务逻辑终于完整好多：discount 会进入 checkout/order/receipt，之前几轮嘅“折扣丢失”问题基本解决；`npm test` 24/24 pass，`npm run build` 也 clean pass。

但有一个好明显嘅集成失误：佢写咗 11KB 嘅 `src/App.css`，但完全冇 import，实际 build 出来 CSS 只有 437 bytes，所以运行时 POS UI 大部分系未套样式状态。即系“代码里好似有靓 UI”，但 browser 实际唔会用到。

记录文件：$HOME/Code/hermes-agent-eval-log/evaluations/2026-05-27/config-d-fromzero-01-local-cafe-pos.md（历史本机文件，未随本报告发布）  
summary 已更新并提交：`0ae4c25 Record Config D from-zero POS evaluation`

当前排名：D 7.4 > B 7.3 > A 6.5 > C 6.2。

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

