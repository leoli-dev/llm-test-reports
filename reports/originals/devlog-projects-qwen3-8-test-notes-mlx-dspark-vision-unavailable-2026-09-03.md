---
type: Note
title: mlx-dspark 无法为 Qwen3.8-27B 提供视觉输入——三道丢弃点与本机可行的替代方案
status: current
description: 权重带视觉塔但服务链路两处主动丢弃图像（加载时 sanitize 掉视觉塔、请求时 flatten 掉 image 部分），实测 prompt_tokens 证明图像贡献为零；并非视觉与投机解码的架构冲突，上游已有可用原型。
tags: [mlx-dspark, qwen3.8-27b, vision, multimodal, dflash2, mlx-vlm]
timestamp: 2026-09-03T18:30:00Z
---

# mlx-dspark 无法为 Qwen3.8-27B 提供视觉输入

## 起因

Round 6 全部是美术任务。pi 在任务 7 中尝试读取一张截图，得到：

```
Read image file [image/png]
[Current model does not support images. The image will be omitted from this request.]
```

评审方最初据此判断「模型是纯文本的」——**这个判断是错的**，用户指出 Qwen3.8-27B 支持多模态。查证后确认用户正确，但真正的原因比「pi 配置写错」复杂。

## 结论：权重支持，服务链路不支持，且有两道独立的丢弃

**权重确实是多模态的**（`mlx-community/Qwen3.8-27B-8bit` 的 `config.json`）：

```
architectures        : Qwen3_5ForConditionalGeneration
language_model_only  : False
image_token_id       : 248056
vision_config        : present（deepstack_visual_indexes / depth / patch_size ...）
```

且 snapshot 里带 `preprocessor_config.json`、`processor_config.json`、`video_preprocessor_config.json`。

**丢弃点 1 —— 加载时，视觉塔根本没进显存。** `mlx_dspark/load.py::_route_target` 对这一族有显式例外，即使 config 里有 `vision_config` 也强制路由到 mlx-lm：

```python
_TEXT_CAPABLE_MM = {"qwen3_5", "qwen3_5_moe"}
if cfg.get("model_type") in _TEXT_CAPABLE_MM:
    if find_spec(f"mlx_lm.models.{cfg['model_type']}") is not None:
        return "mlx_lm"
```

而 `mlx_lm/models/qwen3_5.py` 的 `Model.sanitize`（第 384–389 行）直接丢掉视觉权重：

```python
if key.startswith("vision_tower") or key.startswith("model.visual"):
    continue
```

路由函数自己的注释说明了动机：*"only the mlx-lm path has the replicated-loop hidden-state tap the drafters need (qwen3_5 = Qwen3.6/Bonsai)"* —— **是为了 DFlash 的 hidden-state tap 才这么选的**。

**丢弃点 2 —— 请求时，image 部分被 flatten 掉。** `mlx_dspark/tools.py::_flatten_content` 的注释：*"dropping non-text parts — images/audio have no place in the text path"*。

**丢弃点 3（客户端）—— pi 的 `models.json` 里该模型声明 `input: ["text"]`。** 这是最表层的一道，**单独改它反而有害**：服务端会静默接受并丢弃图像，pi 会以为自己看到了图。

## 实测证据

发送 64×64 红蓝对半 PNG + 一行提问到 `/v1/chat/completions`：

```json
"usage": { "prompt_tokens": 17, "completion_tokens": 81 }
```

**17 个 prompt token** —— 图像贡献为零。模型回答：*"No image was provided in your message."* 无任何错误或警告。

**静默丢弃本身是独立于功能缺失的问题**：声明支持图像的客户端无从得知自己的附件消失了，会对着幻觉继续推理。

## 这不是「视觉 vs 速度」的架构冲突

评审方一度把它写成二选一（视觉走 mlx-vlm 就失去 DFlash2），**这个结论也是错的**。上游 [issue #6](https://github.com/ARahim3/mlx-dspark/issues/6) 已有可用原型（Muse-Glimmer）：

> the model, processor, tapped prefill, and **DSpark generation can share a single loaded target cleanly**

机制是：**图像只影响 prefill**（产生 image-conditioned `inputs_embeds`），prefill 之后解码回到原有 token 路径，投机解码照常。实测 20 GB active / 25 GB peak、**只有一份权重**、文本 prefix cache 不受污染。改动量 159 增 / 15 删。

另外 `mlx_vlm/models/qwen3_5/` 同时提供 `vision.py` 与 `speculative_verifier.py`（融合 Metal 验证核），说明视觉路径本身也不排斥投机。

**所以是未实现，不是不可能。** issue #6 状态 OPEN、零条维护者回复；评审方已在其下追加 qwen3_5 侧的具体障碍分析与本机实测数据（[comment](https://github.com/ARahim3/mlx-dspark/issues/6#issuecomment-5531919174)）。

## 对本项目的实际影响

**Round 6 的每一个视觉缺陷都是人（评审方）看图发现的，pi 一个都没发现**：

| ID | 缺陷 | 发现方式 |
|---|---|---|
| ART-07 | 边界墙仍是夜景近黑，地平线暗带 | 看原始画布截图 |
| ART-14 | 出生点墙 L=23.7 仍是近黑 | 逐项计算 ENV 调色板亮度 |
| ART-15 | 第三人称枪悬在颈前不在手上；FPS 视角模型过大如柱 | 看截图 |
| ART-16 | 玻璃墙窄侧面渲染成黑板 | 看截图 + darkFrac 从 0.008 涨到 0.096 |

pi 能做的只有「写像素统计断言再读那个数字」，所以它的验收全是「某区域方差高于改动前」「某色像素数 > 阈值」——**这类断言能证明改动生效，证明不了看起来对**。

这条应写进能力边界：**前五轮全是逻辑/玩法任务，模型是文本闭环、能自己看到结果，表现很好；Round 6 全是美术任务，闭环断了，必须有人当眼睛。**

## 本机可行的替代方案

**推荐：两个 provider。** 关键前提是**视觉路径不需要快**——pi 的主循环是写代码与跑测试，看图是偶发调用。

- 写代码 → mlx-dspark + Qwen3.8-27B-8bit（DFlash2 全速）
- 看截图 → 独立端口上的**小 VL 模型（4B–8B）**，内存约 5–10 GB

**不要**用同一份 27B 权重再开一个 mlx-vlm 实例：多吃约 27 GB，而 OPS-10（历史本机文件，未随本报告发布） 已证明本机 allocator 会顶到 102 GB / 128 GB，加上去会让 memory guard 触发更频繁、那个崩溃更容易复现。

服务端可用 `mlx_vlm` 自带 FastAPI server 或 `mlx-openai-server`（OpenAI 兼容、多模态走 mlx-vlm 后端），均无需改动 mlx-dspark。

**但接上眼睛不等于自动变好**：pi 现有的验收习惯是写像素断言，任务书需要相应改写为「改完自己截图确认造型合理」。且小 VL 的判断力有限——描述「枪在不在手上」大概可以，判断「视角模型大小是否符合 FPS 惯例」未必。**它能替掉一部分体力活，替不掉全部判断。**

用户决定：暂不切换，维持评审方看图的方式，本条记录备查。
