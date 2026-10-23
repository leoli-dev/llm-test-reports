# 水景：Opus 5.5 与 GPT 6.1 sol 实现同一份 WebGL 需求

[English](2026-10-23-water-garden-opus55-vs-gpt61sol.md) | [简体中文](2026-10-23-water-garden-opus55-vs-gpt61sol_CN.md)

测试日期：2026-10-23，本地时间 UTC−4。评审与共识：2026-10-23 19:35–20:10 UTC。

## 问题与成功标准

两个云端编程 agent 收到同一份中文需求：用 TypeScript + Three.js + WebGL 2 做一个浏览器实时运行、俯视视角的浅水生态景观。需求包括：CPU 高度场水波模拟；GLSL 折射、反光和焦散；小鱼；沙底水道主场景和浓密水草第二场景；默认折叠的控制面板；测试；真实截图和录屏。灵感来自小红书帖子《Three.js超写实水体》（WOW-AI）。本报告要回答：哪份交付更好地满足这份需求，为什么。

成功标准在评审前就已确定，来自需求的验收部分：

- 按文档命令能启动。
- 默认画面是完整的俯视景观。
- 点击涟漪向外传播，拖动尾迹连续；两者都会衰减，且折射跟随水波。
- 鱼自然游动，没有明显双影。
- 主场景和水草场景完成，未完成的预设要列出。
- 没有未处理的 console 错误；resize、切换场景、暂停都稳定，GPU 资源不持续增长。
- 真实截图，以及 10–20 秒真实录屏。
- README、测试结果、实测性能和已知限制。

两份交付：

| 目录 | 模型与设置（按用户说明） | Agent |
|---|---|---|
| `water-garden-opus55` | Claude Opus 5.5，effort high | Claude Code |
| `water-garden-gpt61sol` | GPT 6.1 sol，reasoning high | Codex |

## 硬件、系统与固定条件

| 项目 | 实际配置与证据 |
|---|---|
| 推理位置 | 云端（各厂商服务推理），本机只是客户端 |
| 客户端与评测主机 | MacBook Pro，Apple M5 Max，18 核 CPU（6P+12E），40 核 GPU，128 GiB（`sysctl hw.memsize` = 137438953472） |
| 实验时系统 | macOS 27.0.1，build 26A434，arm64（评测时 `sw_vers`） |
| 电源与温度 | 未记录。ABBA 性能复测期间主机 load average 为 4–5。 |
| 模型 | Claude Opus 5.5（`claude-opus-5-5`），high effort；GPT 6.1 sol，high reasoning。具体服务端版本未记录。 |
| Agent 版本 | 评测时为 Claude Code 2.1.309、codex-cli 0.164.0。生成时所用版本未记录。 |
| 生成耗时与人工介入 | 未记录。只有目录修改时间：opus55 最后写入为本地 14:14，gpt61sol 为本地 14:53–14:57。需求在本地 12:25 送达。 |
| 评测运行环境 | Node 22.23.1；Chromium 155.0.8051.0（`/Applications/Chromium.app`，不是 Google Chrome），headless，ANGLE Metal；Playwright 1.64.1 只作为库调用 |
| 交付依赖 | gpt61sol：three 0.180.0、Vite 7.3.7、TS 5.9.3、Vitest 5.0.5。opus55：three 0.186.1、Vite 8.3.5、TS 5.9.3、Vitest 5.0.5。 |

两个目录都不是 Git 仓库，无法固定 commit。Claude-mbp 在临时副本上评测，交付的 `dist/` 和截图目录都没有动过。Codex-mbp 说明：在双方约定用副本之前，它第一次跑 test/build 时在原目录重新生成了 `dist/`，没有改源码。

## 任务与过程

1. 星遥（一个 Hermes agent）通过 Agent Post 把需求作为 Markdown 附件转发（SHA256 `9b29a27b…14fb5d0`）。两位评审都确认用的是同一份文件。证据包里附有该文件，本机路径已泛化。
2. 两个 agent 各自独立完成交付。gpt61sol 的 README 声明没有参考 Claude 的实现。
3. 评审按用户要求进行：Claude-mbp（Opus 5.5）和 Codex-mbp 先各自写**独立**评审，写完才读对方的。之后在共享的 devlog 讨论页里辩论五轮，共同确定结论 V2。Agent Post 只用来互相通知。
4. **利益冲突**：两位评审各属其中一份交付的模型家族，而且 Codex-mbp 的工作目录就在构建 gpt61sol 的会话旁边。因此双方约定两条规则：每条论断都要有可复现证据；主观视觉判断要明确标为主观。

## 结果与证据

### 交付物与自动检查

| 检查 | gpt61sol | opus55 |
|---|---|---|
| `typecheck` / 单元测试 / `build` | 通过 / 9 项全过 / 通过 | 通过 / 15 项全过 / 通过 |
| JS 包大小（min / gzip） | 533.47 kB / 138.31 kB | 631.49 kB / 167.49 kB |
| 源码量（src + tests + scripts） | 约 1.15k 行，压缩写法 | 约 4.56k 行，模块化、有注释 |
| 场景 | 2 个（沙蕨水道、浓密水草）；2 个可选预设声明未实现 | 4 个（沙底水道、浓密水草、浅色岩峰、稀疏岩石） |
| 单元测试侧重 | 水波（零状态、对称、衰减、边界、30/60/144 fps 一致、追帧、拖动插值）＋鱼群（确定性生成、2 分钟不出界） | 水波更深入（传播速度、对称误差 < 1e-6、窗口化衰减、海绵吸收、自动子步、重采样、30/60/144/37.3 fps 逐位相同、追帧上限）＋拖动插值；没有鱼群测试 |
| 随交付附带的浏览器验证 | `scripts/smoke.mjs`（20 项）、`scripts/record.mjs`、原始 `artifacts/smoke-report.json`、`VALIDATION.md` | 检查写在 README 里，没有附带可重跑的脚本；`.shots/` 里散落截图（已 gitignore） |
| 录屏 | 15.0 s，WebM + MP4 | 19.7 s，MP4 |
| 两位评审的 harness 中 console 错误 | 无 | 无 |
| 交替切换场景 12–16 次再加 resize 后的 GPU 资源 | 恒定 11 个 geometry / 6 个纹理 | 每个场景恒定；叶片纹理缓存加载完后纹理数稳定在 21 |
| 不支持 WebGL 2 | 显示可读的说明页 | 显示可读的说明页（中文） |

### 视觉还原度（主观，双方一致）

![gpt61sol 水道](../../assets/figures/cloud-02-water-garden-gpt-channel.jpg)
![opus55 水道](../../assets/figures/cloud-02-water-garden-opus-channel.jpg)

主场景，1440×900，DPR 2，默认质量。上图为 gpt61sol，下图为 opus55。

- **主场景：opus55 明显更接近参考。** 暖米色细沙、微弯的水道、橄榄绿两岸、清楚可见的分叉沉木、细长的霓虹类小鱼和柔和鱼影；蕨叶贴图也像参考里的蕨类。缺点是植物是平面贴图，岸边纹理有斑块感。
- gpt61sol 的叶片是有体积的 3D 几何，有真实阴影。但沙底偏灰绿、带深色碎屑斑点，水道是直的；岩石是低多边形，裂纹图案重复；叶片偏尖、像陆生植物；沉木几乎看不到。

![gpt61sol 水草](../../assets/figures/cloud-02-water-garden-gpt-dense.jpg)
![opus55 水草](../../assets/figures/cloud-02-water-garden-opus-dense.jpg)

- **浓密水草场景：没有明确的整体赢家。** gpt61sol 填充更满、层次和叶形更丰富，但看起来更像有很多灰色大石的陆地地面。opus55 的水生配色和物种观感更接近参考，但同一种星形贴图大片重复，中间夹着暗色空隙。
- **竖屏：** opus55 在竖屏时把场景旋转 90°，gpt61sol 保持纵向水道。评审在主观构图上略偏 GPT；这不是射线映射错误。
- 两者都远达不到参考里照片级的植物细节，两者也都自己承认了这一点。参考帧属于第三方内容，本报告不转载。

### 水面交互

默认参数，quality high，DPR 2，opus55 关闭悬停涟漪。截取点击后 60、150、300 ms（上排）和 600、1000、2000 ms（下排）：

![gpt61sol 点击序列](../../assets/figures/cloud-02-water-garden-ripple-gpt.jpg)
![opus55 点击序列](../../assets/figures/cloud-02-water-garden-ripple-opus.jpg)

- **gpt61sol：** 60–300 ms 有一圈很淡的环；在这套截图条件下，约 600 ms 后就看不出来了。此时模拟能量并没有归零，只是淡到看不见。拖动松开 200 ms 后的尾迹几乎看不到；GPT 自己的 `drag-ripples.png` 也只有淡淡的线，结果一致。用户可以调高扰动强度滑杆。
- **opus55：** 点击是一个 0.7 s 衰减、3.2 Hz 的振荡源，会荡出 2–3 圈同心波，2 秒后仍清楚可读，并带焦散聚焦。缺点是乳白色高光，以及焦散环沿太阳方向偏移，看起来像双环。
- 光学实现：
  - **opus55** 在深度缓冲里做光线步进（10 步 + 5 次二分）找折射命中点；鱼放在单独一层并做深度测试；焦散聚焦由高度场折射映射的雅可比行列式（1/|det J|）得到；渲染目标外扩 7%，边缘折射不会采到黑边。
  - **gpt61sol** 用三次迭代的深度/遮罩衰减来保护轮廓；鱼遮罩 pass 与可见鱼共用顶点形变；焦散是平流的正弦干涉纹加水面曲率聚焦。
  - 两者对自己用了哪些近似都有如实说明。

### gpt61sol 的可移植性缺陷（两位评审各自独立复现）

gpt61sol 把高度场以 R32F（`RedFormat`+`FloatType`）上传，并设了 `LinearFilter`（`src/render/WaterPipeline.ts`）。WebGL 2 核心规范不保证 32 位浮点纹理可以线性过滤。three.js 只打一条警告，仍然保持 LINEAR，于是纹理不完整，采样结果为 0。

用 init script 隐藏 `OES_texture_float_linear` 后，点击后 CPU 模拟仍报告 maxHeight ≈ 0.0035，但**画面上的涟漪和折射响应消失了**；场景其余部分照常渲染。opus55 用的 R16F 总是可以过滤，不受影响。

这一点只是用能力模拟确认的；哪些真实设备缺这个扩展没有测量。

![gpt61sol 缺 float-linear：看不到涟漪](../../assets/figures/cloud-02-water-garden-ripple-nofl-gpt.jpg)
![opus55 缺 float-linear](../../assets/figures/cloud-02-water-garden-ripple-nofl-opus.jpg)

### 其他缺陷与取舍

| 项目 | 所属 | 证据 |
|---|---|---|
| 焦点在按钮或 `<summary>` 上时按空格会切换暂停，而不是触发该控件（低严重度的键盘/无障碍缺陷） | opus55 | `src/ui/panel.ts:100-104` 只排除了 `input, select, textarea`。Codex 用「重置水面」按钮复现；gpt61sol 没有这个问题。 |
| 每次 resize 都重建场景，水波和鱼群被重置 | gpt61sol | README 有说明，`Garden.ts` 中已确认 |
| resize 时重采样水波状态，鱼和涟漪都保留 | opus55 | `WaterSim.resampled` |
| 暂停时的点击会排队，恢复后才触发；悬停涟漪默认开启（需求没有要求） | opus55 | `app.ts`（`poke`、`params.hoverRipples`） |
| 全局 uniform 和缓存不利于多实例复用；没有证据显示泄漏或切换变慢 | opus55 | `render/underwater.ts`、`app.ts` |
| 源码高度压缩（一行多条语句），不便审查 | gpt61sol | `Garden.ts`、`WaterPipeline.ts`、`FishSchool.ts` |
| 无障碍：ARIA 标签和按钮状态、减少动态效果偏好时启动即暂停、键盘保护、可中止的监听器、上下文丢失提示 | gpt61sol（更强） | `index.html`、`main.ts`、`Garden.ts` |
| 自动降级画质和像素预算 | 只有 opus55 | `app.ts` 的 `adaptQuality`、`QUALITIES` |

## 性能与测量

两位评审在 vsync 限制下实测，两者都约 60 FPS。Codex 测了 1280×800 DPR 1 medium，以及 1440×1000 DPR 2 high、约 20 秒内 40 次点击（p95 ≈ 16.7 ms，数值有限，计数稳定）。这只说明在这台 M5 Max 上两者都达到帧预算。

为了比较吞吐，两位评审都在同一画布尺寸下用 `--disable-gpu-vsync --disable-frame-rate-limit` 重跑，统计 rAF 帧间隔。**这些是 rAF 吞吐估计，不是单独的 GPU 计时。** 另外，两者同名的「质量档」做的工作并不相同：opus55 的 high 档是 MSAA 4、256 格网格、外扩 7%；gpt61sol 不用 MSAA。

Claude-mbp 的 ABBA×2（每格按 GPT、Opus、Opus、GPT 顺序跑两遍；1440×900，DPR 2；预热 2.5 s，采样 4 s）：

| 场景 / 质量 | gpt61sol fps 均值 [最小–最大] | opus55 fps 均值 [最小–最大] | 比值 |
|---|---|---|---|
| 主场景 / medium | 756 [734–771] | 301 [285–318] | 2.51 |
| 主场景 / high | 485 [455–533] | 163 [153–173] | 2.97 |
| 水草 / medium | 456 [409–495] | 363 [356–371] | 1.26 |
| 水草 / high | 346 [343–347] | 215 [213–218] | 1.61 |

Codex-mbp 的 ABBA（只测水草场景；1440×900，DPR 2；预热 1.5 s，采样 3 s；两次平均）：

| 质量 | gpt61sol | opus55 | 比值 |
|---|---|---|---|
| Medium | 563.4 | 469.9 | 约 1.20 |
| High | 414.6 | 354.3 | 约 1.17 |

Claude-mbp 早先的单轮扫描覆盖 DPR 1/2 和 low/medium/high（证据包里的 `perf.jsonl`），比值按行在约 1.25 到 4.99 之间。每次运行的波动很大，opus55 水草场景尤其明显。在两位评审重复进行的 1440×900、DPR 2 medium/high 测试中，方向是一致的：gpt61sol 吞吐更高，水草场景约 1.2–1.6 倍，主水道约 2.5–3 倍。不过初期探索扫描并不一致：low 档下 opus55 水草场景比 gpt61sol 水草场景更快（DPR 1 时 785 对 677 fps；DPR 2 时 755 对 687）。不存在固定倍率。两者都没有在手机硬件上测过，两份 README 也都说明了这一点。

## 分项判断

这是**两位评审看过交付后协商得出的主观判断**，不是测量得分，因此不给数字总分。

| 维度 | 领先方 | 理由 |
|---|---|---|
| 范围与交付物 | opus55（小幅） | 4 个预设，必做是 2 个；GPT 达到必做范围，并说明了省略项 |
| 主场景还原度 | opus55（明显） | 配色、弯曲水道、沉木、鱼的比例与鱼影 |
| 水草场景还原度 | 无 | GPT 胜在填充和叶形变化；Opus 胜在水生配色和物种观感 |
| 水面交互与光学 | opus55（明显） | 涟漪多圈清晰、深度光线步进、雅可比焦散；GPT 默认响应太淡 |
| 健壮性与可移植性 | opus55 | R16F 高度纹理、resize 保留状态、自动降级；GPT 有 R32F 缺陷 |
| 帧吞吐 | gpt61sol | 重复的 DPR 2 medium/high 测试中无上限吞吐更高（1.2–3 倍，取决于场景）；水草场景 low 档则不然 |
| 代码可读性 | opus55 | GPT 源码过度压缩；Opus 的 `app.ts` 有 615 行，并有全局状态 |
| 随附 QA 与无障碍 | gpt61sol（明显） | 可重跑的 smoke/录屏脚本和原始 JSON、ARIA、减少动态效果；Opus 有空格键缺陷 |

## 一致结论（共识 V2，含 Codex 第 5 轮的范围澄清）

> 对这份特定需求（重点是有说服力的可交互水面和生态主场景），**water-garden-opus55 整体有中等优势**：默认涟漪更清楚可读，主水道更接近参考，折射/焦散实现、resize 后的连续性和 R16F 高度纹理路径都更完整。多出的两个预设算小幅加分；GPT 已达到必做的两个场景。**water-garden-gpt61sol 更精简，附带的可复现浏览器 QA 和无障碍更强**，并且在我们重复进行的 1440×900、DPR 2 medium/high 测试中无上限帧吞吐都更高：水草场景约 1.2–1.6 倍，主水道约 2.5–3 倍（这些是 rAF 吞吐估计，不是单独的 GPU 计时；不存在固定倍率）。它默认的水面响应太淡；缺少 float-linear 支持时，CPU 模拟仍在运行，画面上的水波响应却会消失。水草场景没有明确的整体赢家。Opus 也有自己的问题：空格键缺陷、重复的贴图斑块、乳白色/双重高光。两者在测试的场景切换中资源都稳定，在这台 M5 Max 上都能达到 60 FPS，都远达不到参考的照片级植物，也都没有真机验证。这是针对这两份具体交付、已披露利益冲突的评审，不是对两个模型家族的总体排名。

## 局限与结论

- **每个模型只跑一次。** 一份需求，各一份交付，没有重复实验，不能据此推断模型家族的总体能力。
- **生成过程没有观察记录。** 生成时的耗时、token 用量、人工介入和 agent 版本都未记录。
- **评审有偏向。** 两位评审各属一份交付的模型家族。视觉判断是主观的，双方虽已达成一致，但没有独立的人类评分。
- **硬件覆盖有限。** 桌面性能只来自一台 M5 Max。移动端只做了触摸和视口模拟，没有测 Safari、Firefox，也没有真机。
- **R32F 结论的边界。** float-linear 这一项来自能力模拟，受影响的设备范围未知。
- **自动检查的含义。** 自动检查通过不等于产品验收通过，用户自己的视觉判断可能不同。

## 证据

- 图片：`assets/figures/cloud-02-water-garden-*.jpg`，由 Claude-mbp 的 harness 截取。
- 证据包：[cloud-02-evidence.zip](../../assets/evidence/cloud-02-evidence.zip)。内含需求原文、两位评审的 harness 脚本和原始 JSON/日志，以及说明路径泛化方式的 README；没有改动任何数字。
- 共识记录：在用户私人 devlog 的 `projects/llm-test-reports/notes/water-garden-eval/`（两份独立评审、五轮），不公开。
