# LLM 测试报告档案

[English](AGENTS.md) | [简体中文](AGENTS_CN.md)

本仓库保存报告，不承载模型运行时或全部生成产物源码。

- 全文报告位于 `reports/originals/*.md`。英文为无后缀默认版本，每份报告和面向读者的文档均有完整 `_CN.md` 中文版。保留历史失败、测量值、人工介入与边界；更新需注明日期，不静默替换历史结论。
- `reports/experiments/*.md` 按实验组织报告，`data/catalog.json` 与 `data/catalog_CN.json` 驱动中英阅读站。两种语言的文档 ID 保持一致。新增配对报告遵循 CONTRIBUTING_CN.md 和 scripts/add-report.mjs。
- 记录实际推理主机硬件和实验时的系统版本／build，提供证据。`environment_CN.md` 是有日期的当前本机参考，不用当前系统倒填缺失的历史条件。未知项明确标注。
- 区分本机、内网 PC 和云端推理，并注明客户端与推理主机角色。本机源码目录不能证明推理发生在本机。
- 作品仓库使用 `llm-test-YYYY-MM-DD-{type}-{name}`，日期取测试开始日。尽可能固定到提交。产物源码保留在独立仓库。
- 不发布客户端 auth、私人端点、凭据、完整私人会话、模型权重或运行缓存。概括私人路径时保留实验事实并记录发布变换。
- `site/` 保持纯 HTML、CSS 和 JavaScript。英文入口为 `index.html`，中文为 `index_CN.html`；切换语言保留当前报告。`dist/` 支持 GitHub Pages 仓库子路径，不依赖后端或外部字体。
- 修改后运行 `npm run build` 和 `npm run check`。界面变动需在 Chromium 检查中英版本、搜索、组合筛选、报告切换、图片、下载和窄屏溢出。不使用 Google Chrome 或 Playwright channel chrome。
- 原始源码、命令、图表和字面量证据保留源语言。翻译周围说明，不重绘截图或改写数值来暗示不同结果。保留来源和源码翻译审计。
- 最初的本地导入清单位于仓库外。首次导入脚本不得覆盖已维护的双语档案；应新增配对报告。
