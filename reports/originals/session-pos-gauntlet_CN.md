# Hermes POS / Cart & Pricing

[English](session-pos-gauntlet.md) | [简体中文](session-pos-gauntlet_CN.md)

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

## 原评审记录 573

检查完。第一个配置做 `01_CART_AND_PRICING` 的结果：**功能测试全过，但改动范围明显超题。**

结果：

```text
branch: run-20260527-setup
npm test: 9/9 pass
npm run build: pass
changed files: 5
```

做对的部分：

- src/domain/cart.js（历史本机文件，未随本报告发布）：重复添加同一商品会合并并递增数量。
- src/domain/cart.js（历史本机文件，未随本报告发布）：顺手修了 search by SKU/category，虽然这不是 01 重点。
- src/domain/pricing.js（历史本机文件，未随本报告发布）：`SAVE10`、`COFFEE5` 折扣修对，税后计算也过测试。
- src/domain/checkout.js（历史本机文件，未随本报告发布）：顺手修了 checkout 扣库存，属于后面题目的内容。

主要问题：

- `01_CART_AND_PRICING.md` 明确写了 “除非必要，不要修改 UI 文件”，但它改了 src/App.jsx（历史本机文件，未随本报告发布） 和 src/components/ProductCatalog.jsx（历史本机文件，未随本报告发布）。这对 01 来讲不必要。
- `ProductCatalog` 的 UI 改动有可疑副作用：商品加入购物车后，它不再显示商品名，而显示 `In cart (n)`。这会降低 catalog 可读性，也不是 README 要求。
- 它还把“购物车数量达到库存时隐藏商品卡片”写进 UI，这不是题目要求，且可能让 cashier 不知道商品去哪了。
- 它修了 02/03 的部分内容，说明低温配置虽然能解题，但没有严格控制任务边界。

评分：

```text
正确性: 8.5/10
测试结果: 10/10
任务边界: 5/10
代码审慎度: 6/10
整体: 7/10
```

作为配置 A：稳、能过、不会乱引依赖，但有“顺手多修/过度改 UI”的倾向。第 01 题理想答案其实只需要改 `src/domain/cart.js` 和 `src/domain/pricing.js`。

