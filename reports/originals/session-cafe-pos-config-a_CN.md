# Hermes Cafe POS / Config A

[English](session-cafe-pos-config-a.md) | [简体中文](session-cafe-pos-config-a_CN.md)

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

## 原评审记录 847

我 review 完并保存记录了。结论：**这次 from-zero 测试比之前有效很多，也暴露出 Config A 的真实问题：能搭出完整项目外形，但 integration correctness 不稳。**

验证结果：

```text
project: $HOME/Code/hermes-eval-local-cafe-pos
npm test: pass, 24/24
npm run build: pass, but with many Vite/Rollup warnings
npx tsc --noEmit: pass
git repo: not initialized
```

最大问题：**真实 checkout 是坏的。**

在 App.tsx（历史本机文件，未随本报告发布），UI checkout 调用：

```text
checkout(cart, 0, 0, appliedDiscountCode, 0, products)
```

也就是说 subtotal / discount / tax 全部传了 `0`。但 cart.ts（历史本机文件，未随本报告发布） 的 `checkout` 并没有内部重新计算这些值，而是直接用传入值创建 order。

结果是：cart panel 显示金额可能正确，但点击 checkout 后生成的 receipt / order / sales summary 会出现 `$0.00` 或错误金额。

其他问题：

- 测试 24 个全过，但只测 domain helpers，没有测真实 React workflow，所以漏掉主 bug。
- README 还是默认 Vite 模板，不是项目文档。
- build 有很多 type-only import 警告，虽然 `tsc --noEmit` 过。
- Hermes 最终报告说“全部实现”，这个判断过于乐观。

评分我记录为：

```text
requirement_coverage: 7.5
functional_correctness: 5.5
ux_product_fit: 7
code_quality: 6.5
tests_verification: 5.5
constraint_following: 8
autonomy_recovery: 6.5
overall: 6.5
```

已保存到 eval log：

config-a-fromzero-01-local-cafe-pos.md（历史本机文件，未随本报告发布）

并提交：

```text
275aa59 Record Config A from-zero POS evaluation
```

这轮很有价值：不是“测试全绿就完事”，而是抓到了真实产品路径 bug。

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

