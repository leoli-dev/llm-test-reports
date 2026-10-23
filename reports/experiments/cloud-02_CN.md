# 水景 / Opus 5.5 与 GPT 6.1 sol 实现同一份 WebGL 需求

[English](cloud-02.md) | [简体中文](cloud-02_CN.md)

| 项目 | 记录 |
|---|---|
| 日期 | 2026-10-23 |
| 模型 | Claude Opus 5.5 (high effort, Claude Code) vs GPT 6.1 sol (high reasoning, Codex); cloud |
| 引擎 | Claude Code,Codex |
| 推理位置 | cloud |
| 推理主机硬件 | 云端推理；客户端与评测主机 MacBook Pro / Apple M5 Max / 18 CPU / 40 GPU / 128 GiB |
| 实验时系统 | 评测主机 macOS 27.0.1（26A434），arm64；生成时客户端系统未单独记录 |

同一份 Three.js/WebGL 2 浅水需求。两位评审 agent 披露利益冲突后辩论得出共同结论：opus55 整体中等领先（涟漪清晰、深度光线步进折射、主场景更接近参考、R16F 高度纹理、4 个预设）；gpt61sol 附带的可复现浏览器 QA 与无障碍更强，在重复的 DPR 2 medium/high 测试中无上限吞吐更高（水草约 1.2–1.6 倍、主水道 2.5–3 倍）。GPT 的 R32F 高度纹理在缺 float-linear 时画面涟漪消失；Opus 有空格键缺陷。水草场景互有胜负。

[完整报告](../originals/2026-10-23-water-garden-opus55-vs-gpt61sol_CN.md)

每个模型只有一份交付，生成过程未观察，评审各属一方模型家族，视觉判断为主观，未测真机、Safari 或 Firefox；R32F 结论仅来自能力模拟。
