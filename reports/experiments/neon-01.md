# Neon Bastion / 8bit 七轮

| 项目 | 记录 |
|---|---|
| 编号 | NEON-01 |
| 日期 | 2026-09-01—09-04 |
| 模型与运行方式 | mlx-dspark + Qwen3.8-27B-8bit + DFlash2 + Pi |
| 推理位置 | 本机 |

## 历史结果

七轮总结截稿 31 提交；09-16 横向总结记仓库终态 34 提交。约 30 小时；149 单测、26 E2E。部署当时丢弃图像，不能据此评价模型视觉能力。

## 原始报告

- [Neon Bastion 七轮总结 — Qwen3.8-27B-8bit 能不能做一个稍微复杂的游戏](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-final-summary-2026-09-04.md)
- [Neon Bastion — mlx-dspark/Qwen3.8-27B-8bit + Pi independent acceptance and code review](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-mlx-dspark-pi-review-2026-09-01.md)
- [Neon Bastion — Round 1 acceptance review and design direction](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-1-review-2026-09-01.md)
- [Neon Bastion — Round 2 review and human-playthrough correction](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-2-review-2026-09-02.md)
- [Neon Bastion — Round 3 verification (score withheld pending playtest)](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-3-review-2026-09-02.md)
- [Neon Bastion — Round 4 评审：玩法/场景重设计与十项任务拆解](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-4-review-2026-09-02.md)
- [Neon Bastion — Round 5 评审：Qwen3.8-27B-8bit 能否独立完成一个中等复杂度的游戏](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-5-review-2026-09-03.md)
- [Neon Bastion — Round 6 评审：从「可玩」到「像个游戏」的十项任务](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-6-review-2026-09-03.md)
- [Neon Bastion 第七轮评审 — R6 交付复盘与「探针窗口」失效类](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-7-review-2026-09-04.md)

## 测试产物

- [Neon Bastion](https://github.com/leoli-dev/llm-test-2026-09-01-game-neon-bastion)
- [浏览器试玩](https://leoli-dev.github.io/llm-test-2026-09-01-game-neon-bastion/)

## 证据边界

历史成绩由原报告保存，本次发布没有重新测评模型。
