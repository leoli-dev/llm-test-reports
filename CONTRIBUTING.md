# 添加一份测试报告

这个仓库集中保存报告。游戏、网站和其他测试产物保存在独立作品仓库；在报告中链接到对应提交。

## 命名与日期

- 作品仓库：`llm-test-YYYY-MM-DD-{type}-{name}`，采用该轮测试的**开始日期**。
- 已发布范例：`llm-test-2026-09-01-game-neon-bastion`、`llm-test-2026-10-20-game-tank-battle`。
- 同一项目的修复轮保留在原测试链里；不同模型的独立重跑可以另开记录。日期不清楚时明确说明，不用导入日期替代。

## 添加步骤

1. 从 [报告模板](templates/report.md) 新建 `reports/originals/YYYY-MM-DD-topic.md`，填写实际条件、任务、结果、失败与局限。
2. 将报告图片放到 `assets/`，在 Markdown 中用 `../../assets/...` 引用。发布前移除凭据、私人聊天和私有端点；保留指标及实验事实。
3. 注册报告：

```sh
node scripts/add-report.mjs \
  --id EXP-2026-10-21-example \
  --title '实验标题' \
  --date 2026-10-21 \
  --model '完整模型名称与量化' \
  --engine MLTF \
  --scope local \
  --file reports/originals/2026-10-21-example.md \
  --summary '实际结果与证据边界' \
  --repo https://github.com/leoli-dev/example
```

`--scope` 为 `local`、`lan` 或 `cloud`；`--repo` 可省略。`--engine` 可以用逗号分隔多个引擎。脚本写入实验 Markdown 和 `data/catalog.json`。

4. 运行 `npm ci --ignore-scripts`、`npm run build`、`npm run check`；用 `npm run preview` 后在 Chromium 中检查新报告、图片和窄屏布局。
5. 提交 Markdown、图片和 catalog，push 到 main。GitHub Actions 构建纯静态站，发布到 GitHub Pages。

## 文档与事实

- `reports/originals/` 保留原报告文字、表格和图片；`reports/experiments/` 是按测试组织的阅读入口。
- 最初导入的 HTML 报告已转成 Markdown；只有会话证据的旧测试标为 session-recovered，不能当作源码已恢复。
- 初次导入会调整本机链接、概括本机账号路径和私人 LAN 地址，并更新重命名后的作品链接。原报告内容哈希与发布后哈希存入 `data/provenance.json`。
- 本机找到了代码与代码已发布是两回事。为新作品添加独立 repo 链接后，档案才显示作品入口。
- 请勿上传模型权重、node_modules、虚拟环境、客户端 auth、原始私人会话或含凭据的请求日志。
