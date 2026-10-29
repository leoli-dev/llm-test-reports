# PERF-14 证据：M5 Max 上的 DeepSeek-V4.1-Flash-1017

[English](README.md) | [简体中文](README_CN.md)

这里是 2026-10-28–29（America/Toronto）在 M5 Max、128GiB 统一内存上进行 Strata 本机测试的选定脱敏证据。[完整报告](../../reports/originals/2026-10-28-strata-deepseek41-flash1017-2bpw-m5max_CN.md)。

- `evidence/` 包含合成 API、Pi 与工具冒烟记录，三次短生成，32K／128K／256K 的首次长文检索与缓存跟进，冻结的引擎／启动日志，全系统 swap 时点读数，权重校验清单，架构元数据，以及部署日志摘录。`environment-evidence.json` 明确标注作者记录的环境背景，不冒充原始硬件导出。`retirement-request.json` 记录用户决定，不代表已完成删除。
- `source/long_context.py` 保留检索算法，仅将写死的私人 home 路径改为 `Path.home() / 'local_llms'`。重放需要另行安装匹配权重和运行时；此归档不分发模型。
- `publication-provenance.json` 记录原件与公开件哈希、准确选择范围、排除项与变换。测量数值和合成提示词／回答均保留。完整准备日志不公开，其原件哈希与选定摘录的关系保留。
- `translation-check.json` 校验两篇完整报告的表格数值、代码块和行内字面量；这是发布校验，不是另一轮推理。
- `SHA256SUMS.json` 校验公开报告和所有选定资产，不包含其自身与 ZIP。`deepseek1017-m5max-evidence.zip` 包含证据、脚本、双语说明、来源、翻译检查与 SHA 清单。没有权重、运行缓存、客户端凭据、全局 Pi 配置或完整私人会话。

历史服务状态与命令描述测量时刻。用户在 2026-10-29 要求先发布报告、再退役；实际删除状态以报告有日期的更新为准。短生成在长窗序列后从 15.0 降至 2.3 token/s，重启后为 4.6 token/s；样本非受控，原因未定位。三档首次长文检索均通过，缓存跟进不属于独立检索复现。
