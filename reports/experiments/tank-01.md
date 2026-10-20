# MLTF × Pi / 3D 坦克大战四轮

| 项目 | 记录 |
|---|---|
| 编号 | TANK-01 |
| 日期 | 2026-10-20 |
| 模型与运行方式 | MLTF 0.1.2 + Qwen3.8-27B 8bit q8c + Pi |
| 推理位置 | 本机 |

## 历史结果

四轮 430 请求、461,939 输出 tokens、约 5.44 小时；29 次文字监督提示。

## 原始报告

- [在 M5 Max 上用 MLTF 驱动 8-bit Qwen3.8-27B：pi 制作 3D 坦克大战的四轮监督实测](../originals/qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-zh-cn.md)
- [MLTF × 8-bit Qwen3.8-27B × pi：3D坦克大战四轮监督完整报告](../originals/devlog-projects-qwen3-8-test-notes-mltf-pi-tank-battle-four-round-report-2026-10-20.md)
- [本地 Qwen3.8-27B-MLTF-q8c × pi：3D 坦克大战监督实验报告](../originals/qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-1-zh-cn.md)
- [本地 Qwen3.8-27B-MLTF-q8c × pi：坦克大战第二轮监督报告](../originals/qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-2-zh-cn.md)
- [Qwen3.8-27B-MLTF-q8c × pi：第三轮游戏重构与本机性能报告](../originals/qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-3-zh-cn.md)
- [MLTF / Qwen3.8-27B 本机监督实验：R4 UI 遮挡修复](../originals/qwen-tests-mltf-27b-pi-tank-battle-2026-10-20-report-round-4-zh-cn.md)

## 测试产物

- [Tank Battle](https://github.com/leoli-dev/llm-test-2026-10-20-game-tank-battle)
- [浏览器试玩](https://leoli-dev.github.io/llm-test-2026-10-20-game-tank-battle/)

## 证据边界

game/ 是产品；supervision/ 是监督、性能与验收脚本；github-share 是分享快照，不另算一轮。
