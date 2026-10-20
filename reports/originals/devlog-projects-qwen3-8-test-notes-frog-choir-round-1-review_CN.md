---
type: Note
title: "Frog Choir — 第 1 轮独立代码审查"
status: outdated
description: "历史第 1 轮被拒绝；其相机、音频、校准及自动化覆盖方面的发现已在第 2, 轮中解决，仅遗留一个经验性的左右手映射缺陷。"
tags: [frog-choir, code-review, mediapipe, web-audio, pi, mtplx]
timestamp: 2026-08-24T03:13:46Z
---

# Frog Choir — 第 1 轮独立审查

[English](devlog-projects-qwen3-8-test-notes-frog-choir-round-1-review.md) | [简体中文](devlog-projects-qwen3-8-test-notes-frog-choir-round-1-review_CN.md)

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

## 范围与验证

在 Pi 报告完成后，对照位于 `$HOME/Code/qwen3.8-tests/test-prompts/frog-choir.md` 的固定提示词审查了 `$HOME/Code/qwen3.8-tests/frog-choir_mtplx-quality-pi`。独立命令执行通过：

| 命令 | 结果 | 证明了什么 |
|---|---|---|
| `npm run build` | 通过 | TypeScript 和 Vite 可以构建 |
| `npm test` | 25/25 通过 | 纯映射、平滑、高度及存在性辅助函数 |
| `npm run e2e` | 10/10 通过 | 仅限着陆页和演示滑块路径 |

随后用户执行了所需的真实浏览器测试：相机权限已授予，但预览保持空白；两个青蛙部件发出连续的机器般嗡嗡声，而非蛙鸣。源代码检查证实了这两项观察结果。

## 发现

| ID | 严重程度 | 证据 | 失败原因 |
|---|---|---|---|
| FE-05 | P1 | `src/hooks/useCamera.ts:38-42`; `src/App.tsx:42-45`; `src/components/CameraPreview.tsx:14-21` | 当应用仍停留在着陆屏幕时，`getUserMedia()` 已解决，因此 `videoRef.current` 为 null，且 `srcObject` 从未被附加。视频元素仅在 `setScreen('live')` 之后挂载，没有用于附加已保存流的 effect/ref 回调。因此，已授予的相机不显示图像，且手部追踪接收不到帧。 |
| FE-06 | P1 | `src/lib/croak.ts:43-45,77-84,108-110` | 两个振荡器持续运行。26–30 Hz 的正弦波 LFO 直接连接到侧增益的 AudioParam，同时应用程序每帧更新同一增益。这在连续的锯齿波/方波音调上产生了颤音/负增益相位反转，而非离散的蛙鸣包络；这直接解释了报告的连续嗡嗡声。 |
| FE-07 | P1 | `src/hooks/useHandTracking.ts:158-173`; `src/lib/handMapping.ts:4-24` | 仅显示的视频/画布进行了 CSS 镜像；`detectForVideo(video, ...)` 接收原始的浏览器视频帧。MediaPipe 假设输入为水平镜像的自拍图像来确定左右手，并指示消费者在输入未镜像时交换标签。应用程序保持标签不变，因此一旦修复相机播放，物理左右控制将反转。[MediaPipe Hands 文档](https://chuoling.github.io/mediapipe/solutions/hands.html) 支持这一结论。 |
| FE-08 | P2 | `src/hooks/useHandTracking.ts:175-205`; `src/lib/handHeight.ts:19-36` | 校准辅助函数计算了正确的采样范围，但 hook 使用 `min(yHigh)` / `max(yLow)` 将其与默认值结合。正常的较小可达范围只能保留或扩大默认的 0.15–0.85 范围，而永远无法替换它；因此，“重新校准”并未如承诺的那样重新映射用户的实际范围。 |
| QA-04 | P1 | `e2e/frog-choir.spec.ts:3-11,50-183`; 无 `CroakEngine` 测试 | 10 E2E 测试进入演示模式，从未授予/模拟相机流，从未断言 `video.srcObject`，未执行 MediaPipe 结果，也未检查或渲染音频。25 单元测试同样仅覆盖纯辅助函数。因此，报告的“全部验证通过”是测试数量的声明，而非核心功能验收证据。 |

## 所需修正与重新验证

1. 在 `useCamera` 中保留流，然后在 `<video>` ref 挂载时附加/播放它（或在请求权限之前渲染预览）；添加一个使用模拟 `getUserMedia` 流的集成测试，断言 `srcObject`、`play()` 以及就绪的视频帧。
2. 用由控制值触发或速率整形的每侧增益包络蛙鸣爆发（起音/衰减/静音）替换连续的振荡器/LFO 设计；使用确定性的离线音频/单元测试加上可听的人类验收检查。
3. 要么镜像实际提供给 MediaPipe 的输入，要么在分配 `userLeft`/`userRight` 之前交换其 `Left`/`Right` 输出；添加一个输入镜像约定与生产环境匹配的测试，而不是对当前映射的自我断言。
4. 在获得足够样本后，直接按侧分配 `calibrateFromSamples()` 输出，然后测试更窄的范围（如 0.3–0.7）在点击重新校准后映射到接近 1–0。
5. 仅在添加缺失的相机/音频/集成覆盖后，重新运行构建、单元测试和 E2E；然后在真实已授予的相机上，使用不同的左右手和可听见的蛙鸣进行手动验收。

## 结论

**要求修改 / 未接受。** 视觉/演示实现已存在，且声明的自动化命令通过，但两个用户可见的故障阻止了主要相机和音频体验的使用。一旦空白预览被修复，左右手和校准缺陷仍将存在。

> ⚠️ 已被 [第 2 轮评审](devlog-projects-qwen3-8-test-notes-frog-choir-round-2-review_CN.md) 取代：FE-05,、FE-06,、FE-08, 以及原始的 QA-04 覆盖缺口随后已得到解决。剩余的 P1 是一个经验上反转的手性映射，因此，在未进行真机检查的情况下，不得应用早期的理论映射结论。
