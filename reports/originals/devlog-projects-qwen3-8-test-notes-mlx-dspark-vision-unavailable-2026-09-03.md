---
type: Note
title: "mlx-dspark cannot provide visual input for Qwen3.8-27B — Three drop points and locally feasible alternatives"
status: current
description: "The weights include a vision tower, but the service chain actively discards images at two points (sanitizing the vision tower during loading, flattening the image part during requests); measured prompt_tokens prove the image contribution is zero; this is not an architectural conflict between vision and speculative decoding, and a usable prototype already exists upstream."
tags: [mlx-dspark, qwen3.8-27b, vision, multimodal, dflash2, mlx-vlm]
timestamp: 2026-09-03T18:30:00Z
---

# mlx-dspark cannot provide visual input for Qwen3.8-27B

[English](devlog-projects-qwen3-8-test-notes-mlx-dspark-vision-unavailable-2026-09-03.md) | [简体中文](devlog-projects-qwen3-8-test-notes-mlx-dspark-vision-unavailable-2026-09-03_CN.md)

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Local inference workstation |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | See original report; current snapshot does not fill missing historical configuration |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | Not recorded in the surviving test evidence; current OS is not substituted |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

## Origin

Round 6 consisted entirely of art tasks. In task 7, pi attempted to read a screenshot and received:

```
Read image file [image/png]
[Current model does not support images. The image will be omitted from this request.]
```

The reviewer initially judged based on this that "the model is text-only" — **this judgment was wrong**; the user pointed out that Qwen3.8-27B supports multimodality. Verification confirmed the user was correct, but the true cause is more complex than "pi configuration error."

## Conclusion: Weights support it, service chain does not, with two independent drops

**The weights are indeed multimodal** (`config.json` of `mlx-community/Qwen3.8-27B-8bit`):

```
architectures        : Qwen3_5ForConditionalGeneration
language_model_only  : False
image_token_id       : 248056
vision_config        : present（deepstack_visual_indexes / depth / patch_size ...）
```

And the snapshot includes `preprocessor_config.json`, `processor_config.json`, and `video_preprocessor_config.json`.

**Drop point 1 — During loading, the vision tower never enters VRAM.** `mlx_dspark/load.py::_route_target` has an explicit exception for this family, forcing routing to mlx-lm even if the config contains `vision_config`:

```python
_TEXT_CAPABLE_MM = {"qwen3_5", "qwen3_5_moe"}
if cfg.get("model_type") in _TEXT_CAPABLE_MM:
    if find_spec(f"mlx_lm.models.{cfg['model_type']}") is not None:
        return "mlx_lm"
```

And `Model.sanitize` in `mlx_lm/models/qwen3_5.py` (lines 384–389) directly discards vision weights:

```python
if key.startswith("vision_tower") or key.startswith("model.visual"):
    continue
```

The routing function's own comment explains the motivation: *"only the mlx-lm path has the replicated-loop hidden-state tap the drafters need (qwen3_5 = Qwen3.6/Bonsai)"* — **this choice was made for DFlash's hidden-state tap**.

**Drop point 2 — During requests, the image part is flattened away.** Comment in `mlx_dspark/tools.py::_flatten_content`: *"dropping non-text parts — images/audio have no place in the text path"*.

**Drop point 3 (client) — pi's `models.json` declares `input: ["text"]` for this model.** This is the most superficial layer; **changing it alone is actually harmful**: the server will silently accept and discard the image, and pi will believe it saw the image.

## Empirical Evidence

Sent a 64×64 red-blue half-and-half PNG + one-line question to `/v1/chat/completions`:

```json
"usage": { "prompt_tokens": 17, "completion_tokens": 81 }
```

**17 prompt tokens** — image contribution is zero. Model response: *"No image was provided in your message."* No errors or warnings.

**Silent dropping is itself a problem independent of feature absence**: clients declaring image support have no way of knowing their attachments have disappeared, and will continue reasoning based on hallucinations.

## This is not an architectural conflict of "vision vs. speed"

The reviewer at one point framed it as a binary choice (using mlx-vlm for vision loses DFlash2), **this conclusion is also wrong**. Upstream [issue #6](https://github.com/ARahim3/mlx-dspark/issues/6) already has a usable prototype (Muse-Glimmer):

> the model, processor, tapped prefill, and **DSpark generation can share a single loaded target cleanly**

The mechanism is: **images only affect prefill** (producing image-conditioned `inputs_embeds`); after prefill, decoding returns to the original token path, and speculative decoding proceeds as usual. Measured 20 GB active / 25 GB peak, **only one copy of weights**, and the text prefix cache is not polluted. The change size is 159 additions / 15 deletions.

Additionally, `mlx_vlm/models/qwen3_5/` provides both `vision.py` and `speculative_verifier.py` (fused Metal verification kernel), indicating that the vision path itself does not reject speculation.

**So it is unimplemented, not impossible.** Issue #6 status is OPEN, with zero maintainer replies; the reviewer has appended specific obstacle analysis on the qwen3_5 side and local measured data under it ([comment](https://github.com/ARahim3/mlx-dspark/issues/6#issuecomment-5531919174)).

## Actual Impact on This Project

**Every visual defect in Round 6 was discovered by a human (the reviewer) looking at the images; pi did not discover any of them**:

| ID | Defect | Discovery Method |
|---|---|---|
| ART-07 | Boundary wall is still near-black night scene, dark horizon band | Viewed original canvas screenshot |
| ART-14 | Spawn point wall L=23.7 is still near-black | Calculated ENV palette brightness item by item |
| ART-15 | Third-person gun floats in front of the neck, not in hand; FPS view model is too large, like a pillar | Viewed screenshot |
| ART-16 | Glass wall narrow side rendered as blackboard | Viewed screenshot + darkFrac increased from 0.008 to 0.096 |

The only thing pi can do is "write pixel statistics assertions and then read that number," so its acceptance criteria are all "variance in a certain region is higher than before the change" or "pixel count of a certain color > threshold" — **such assertions can prove the change took effect, but cannot prove it looks correct**.

This should be written into the capability boundaries: **The first five rounds were all logic/gameplay tasks; the model was in a text closed-loop, could see the results itself, and performed well; Round 6 was all art tasks, the closed-loop was broken, and a human must serve as the eyes.**

## Feasible Alternatives on Local Machine

**Recommended: two providers.** The key premise is **the vision path does not need to be fast** — pi's main loop is writing code and running tests; looking at images is an occasional call.

- Writing code → mlx-dspark + Qwen3.8-27B-8bit (DFlash2 full speed)
- Viewing screenshots → **small VL model (4B–8B)** on an independent port, memory approx. 5–10 GB

**Do not** use the same 27B weights to start another mlx-vlm instance: it consumes an additional approx. 27 GB, and OPS-10 (historical local file, not released with this report) has already proven that the local allocator will hit 102 GB / 128 GB; adding this will cause the memory guard to trigger more frequently, making that crash easier to reproduce.

The server can use the FastAPI server bundled with `mlx_vlm` or `mlx-openai-server` (OpenAI compatible, multimodal via mlx-vlm backend), neither requiring changes to mlx-dspark.

**But connecting the eyes does not automatically mean improvement**: pi's existing acceptance habit is writing pixel assertions; the task specification needs to be rewritten accordingly to "take a screenshot yourself after changes to confirm the model looks reasonable." And the judgment of a small VL is limited — describing "whether the gun is in the hand" is probably possible, but judging "whether the view model size conforms to FPS conventions" is not certain. **It can replace some of the manual labor, but not all judgment.**

User decision: Do not switch for now, maintain the method of the reviewer looking at images, this record is kept for reference.
