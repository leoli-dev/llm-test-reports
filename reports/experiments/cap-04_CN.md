# Pi 视觉三题：MLTF、Splash、Strata，256K 上下文

[English](cap-04.md) | [简体中文](cap-04_CN.md)

| 项目 | 记录 |
|---|---|
| 日期 | 2026-10-25 |
| 模型 | Qwen3.8-27B MLTF q8c / MLX affine8; Qwen3.8 Flash Next GSQ-RCO IQ3_S |
| 引擎 | MLTF,Splash,Strata |
| 推理位置 | local |
| 推理主机硬件 | MacBook Pro Mac17,6 / Apple M5 Max / CPU18 / GPU40 / 128 GiB |
| 实验时系统 | 实验时采集：macOS27.0.1 build26A434 arm64 |

256K 下九个视觉项目：Strata 本次制作较强，全部场景可渲染；MLTF 庭院卡在自测超时。含完整压力/状态、原始截图及逐条评分。

[完整报告](../originals/2026-10-25-pi-visual-triad-three-engines_CN.md)

每格单次样本；知晓身份评分；模型/量化/引擎组合不同。最大输入168095，未压满256K。


## 2026-10-26 作品公开发布

[九作品代码仓库](https://github.com/leoli-dev/llm-test-2026-10-25-visual-triad) · [GitHub Pages 导航](https://leoli-dev.github.io/llm-test-2026-10-25-visual-triad/index_CN.html) · [固定发布提交](https://github.com/leoli-dev/llm-test-2026-10-25-visual-triad/tree/540ab4469a10ecac11583eaef10b3fbde7727be5)

九件应用HTML/JS/CSS/vendor与原冻结版本字节一致，新增导航、完整README报告、原图及数据。MLTF庭院代理超时及原评分保持不变。
