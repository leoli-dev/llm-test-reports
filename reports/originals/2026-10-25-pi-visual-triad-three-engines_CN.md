# CAP-04 — Pi 视觉三题：MLTF、Splash、Strata，256K 上下文

[English](2026-10-25-pi-visual-triad-three-engines.md) | [简体中文](2026-10-25-pi-visual-triad-three-engines_CN.md)

测试始于2026-10-25，开发及独立评审延续到2026-10-26，时区 America/Toronto。九个独立本机项目，每个最多60分钟。这是新实验，不是 CAP-03 的修订。

本次三个题目中，Strata 的整体视觉作品最强。鹈鹕分差较小，庭院与太阳科普的制作差距较大。MLTF 庭院是代理交付失败，但作品可用，并非推理引擎崩溃。

| 题目 | MLTF | Splash | Strata |
| --- | --- | --- | --- |
| 2D 鹈鹕在香榭丽舍大道骑车 | 92/100 · 26.25 min | 89/100 · 29.24 min | 93/100 · 14.71 min |
| 3D 中国传统庭院 | 87/100 · 60.01 min | 85/100 · 24.83 min | 95/100 · 31.75 min |
| 3D 太阳诞生动画 | 86/100 · 29.00 min | 91/100 · 33.92 min | 96/100 · 29.95 min |

总分由内容覆盖40、视觉制作25、可用性20、运行技术10、交接5构成。评分由知晓模型身份的 Codex 作出，不是人工或盲测审美分。单独视觉分：鹈鹕17/16/19，庭院16/12/20，太阳14/19/21（依次 MLTF/Splash/Strata）。鹈鹕的小分差不应被理解成可靠的通用模型排名。

八个代理完成三阶段。MLTF 庭院因模型自写浏览器测试未退出而触及60分钟上限，没有 LLM API 错误或原生工作进程崩溃。场景仍能渲染，因此作品质量与交付失败分开记录。九个独立页面均无致命页面错误；三套 PNG/SVG 都实际下载并打开验证。

[Machine-readable results / 机器可读结果](../../assets/evidence/cap-04-summary.json) · [Metadata, protocol and full ratings / 元数据、协议与完整评分](../../assets/evidence/cap-04-evidence.zip) · [Archive hashes / 证据包哈希](../../assets/evidence/cap-04-publication.json)

![CAP-04 development-time](../../assets/figures/cap-04-development-time.png)

![CAP-04 rubric-scores](../../assets/figures/cap-04-rubric-scores.png)

## 题目、共同要求与固定流程

用户要求：2D 鹈鹕在香榭丽舍大道骑车；包含庭院元素的3D 中国传统庭院；介绍太阳诞生的3D 动画。为形成可比代理任务，执行前统一扩写清单及控件：2D 导出与适配；庭院二十项元素与旋转、缩放、重置、三个命名视角；太阳90秒时间轴、播放/暂停/重播/拖动/变速、字幕及环绕相机。这是扩写要求后的代理测试，不是只给一句话的图像比赛。

每个项目从全新 Git 基线及隔离 Pi 会话开始。三个固定阶段为编写、视觉自审、最终验证，共享3600秒开发预算；思考、工具、自测、修复及压缩均计时。加载、烟雾测试、10秒基线与独立评审不计时，允许提前完成。每次只加载一个大型候选模型，普通后台应用保留。固定均衡顺序：鹈鹕 MLTF→Splash→Strata；庭院 Splash→Strata→MLTF；太阳 Strata→MLTF→Splash。没有随机化，也没有重复抽样。

Pi 工具为 read/bash/edit/write；禁用 MCP、扩展、技能、提示模板及继承上下文文件。指令禁止联网、外部 AI、读取其他候选及评审源码，并记录活动；这不是操作系统沙箱。统一提供本地 Three.js r178、修正本地导入的 OrbitControls 及通用截图工具，没有预制作品或构图参考。三者均有图像输入并实际读取截图。监督者没有修复候选源码，没有反馈隐藏评分或额外提示。九份源码全部冻结后才开始验收。

冻结的 PLAN、COMMON、三份 BRIEF、SCIENCE 及三阶段提示均在元数据包中。庭院二十项是便于比较的综合清单，并不声称每一种历史中式庭院都必须具备全部元素。NASA 科学要点平等提供，因此科学内容不属于无资料天文记忆测试。

## 实际硬件、版本与配置

| 项目 | 记录值 |
| --- | --- |
| Inference host / 推理主机 | MacBook Pro Mac17,6 · Apple M5 Max · CPU18 · GPU40 · 128 GiB (137438953472 bytes) |
| Test-time OS / 实验时系统 | macOS27.0.1 · build26A434 · arm64 |
| Agent / 代理 | Pi1.4.0 · Node22.23.1 · host Python3.14.7 |
| Browser / 浏览器 | Chromium155.0.8051.0 · actual ANGLE Metal Renderer: Apple M5 Max |
| Shared request / 共同请求 | context262144 · max output32768 · reasoning medium · temperature1 · top_p0.95 · top_k20 |
| Sessions / 会话 | 每项目新会话 · 关闭自动重试 · 开启自动压缩 · 实际压缩0 |
| Visual runtime / 画面运行时 | Three.js r178 · 1440×900 / 390×844 · DPR1 |
| Telemetry / 遥测 | psutil + macOS 进程 footprint、GPU IORegistry、内存压力 · 标称1 Hz |

| 系统 | Model ID / 模型 ID | Quantization / 量化 | Runtime / 运行时 |
| --- | --- | --- | --- |
| MLTF | local/Qwen3.8-27B-MLTF-q8c | MLTF q8c | CLI0.1.2 · source873d5574d903f5c1685e286c9cd59b79475a49f6 |
| Splash | mlx-community/Qwen3.8-27B-8bit | MLX affine8 | source1.4.0 · 1482f6bbc2abf12375332725302019594150b6cb |
| Strata | qwen3.8-flash-next-iq3_s | Flash Next GSQ-RCO IQ3_S | Terminal0.2.6 · Control0.1.51 · Metal release0.1.50 |

MLTF、Splash 使用 int8 KV 与96G Metal 预算；Splash 记录 fp32 state、关闭闲置释放。Strata 请求及服务并发为1。选取的原生状态序列保留缓存、视觉、准入及计时计数，但内部定义不同。复用已安装权重，本轮没有完整重算权重哈希，未重新确立不可变上游权重版本。Strata 审计检出 HEAD 为4b9e05a2a806a3fe24f7b2560d98626c37dade35（有未跟踪 third_party/metal-cpp/），不将它冒充发布二进制对应源码。哈希来自实际原生子进程二进制，而不只是启动包装器。

| 原生二进制 | SHA256 |
| --- | --- |
| MLTF splash | 0d3d56f7a8133b01d9bcf6ea8414a3e05bfb50ee248aaa8b8695a3db9f06a7bb |
| Splash splash | 15b4ac64d5f4f2070361fc0e94623f8a67d74f083632ccaa6a7b9acd4ed8cf79 |
| Strata strata | 3fb8c8c8fabfcdc89446a1a0eb02cbc49bcd1a9123fc98aaa0c361af2912669d |

每轮 Pi 状态与原生状态均确认262144。MLTF 显示名称仍带128K，但实际原生上下文临时提高至262144，结束后恢复131072；全局 Pi 配置字节一致。服务恢复原始可用状态：Strata 就绪，MLTF/Splash 停止。实际最大输入范围85357至168095，因此这是256K 配置下的项目负载，不能等同压满256K 的容量、检索或质量测试。

## 实测用时、LLM 状态与开发压力

| 项目 | min | Phases / 阶段 | Requests / 请求 | Max input / 最大输入 | Output / 输出 | Decode tok/s | Tool errors / 工具错误 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| pelican-mltf | 26.25 | 3/3 | 42 | 87025 | 65221 | 48.54 | 2 |
| pelican-splash | 29.24 | 3/3 | 54 | 102938 | 64250 | 43.39 | 3 |
| pelican-strata | 14.71 | 3/3 | 61 | 85357 | 63239 | 84.56 | 3 |
| courtyard-splash | 24.83 | 3/3 | 52 | 90928 | 54988 | 45.11 | 1 |
| courtyard-strata | 31.75 | 3/3 | 156 | 168095 | 112951 | 84.56 | 7 |
| courtyard-mltf | 60.01 | 0/3 | 34 | 102364 | 76553 | 44.18 | 0 +1 unclosed / 未结束 |
| sun-strata | 29.95 | 3/3 | 143 | 161541 | 100897 | 88.59 | 4 |
| sun-mltf | 29.00 | 3/3 | 58 | 103196 | 54727 | 41.16 | 3 |
| sun-splash | 33.92 | 3/3 | 73 | 106306 | 57602 | 37.67 | 7 |

累计实测开发279.644613分钟。每格 API 错误均为0，原生工作进程 PID/启动身份数量均为1，前端身份亦稳定。上表已完成工具错误包含常规自修；庭院超时另有一个未结束调用及真实 TypeError，不能因已完成错误标记0而写成没有错误。阶段完成度不等于作品分数。加权解码为总 predicted_n / predicted_ms，包含思考与工具生成，不是最终回答打字速度。首个有效模型事件包含推理或工具增量，不是最终答案 TTFT。各引擎预填充/缓存口径不同，不据此作通用预填充排名。

| 项目 | First event mean s / 首事件均值秒 | Unique images / 独立图像字节 | History images / 历史图像次数 | Native RSS peak GiB | Native footprint peak GiB | Global GPU memory peak GiB | CPU mean % | GPU busy mean % |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| pelican-mltf | 4.15 | 15 | 241 | 17.22 | 21.70 | 33.07 | 6.74 | 93.80 |
| pelican-splash | 4.06 | 16 | 430 | 13.69 | 43.73 | 44.90 | 6.51 | 96.23 |
| pelican-strata | 1.14 | 19 | 633 | 72.79 | 29.46 | 64.56 | 7.36 | 88.52 |
| courtyard-splash | 3.69 | 25 | 612 | 13.36 | 43.67 | 44.49 | 6.73 | 94.99 |
| courtyard-strata | 0.89 | 44 | 2872 | 74.23 | 30.53 | 64.16 | 9.79 | 76.64 |
| courtyard-mltf | 6.20 | 16 | 216 | 12.75 | 18.27 | 32.58 | 6.69 | 59.94 |
| sun-strata | 1.01 | 44 | 3154 | 64.12 | 26.52 | 65.25 | 7.21 | 71.64 |
| sun-mltf | 4.31 | 35 | 981 | 23.22 | 28.20 | 32.94 | 6.15 | 89.77 |
| sun-splash | 3.54 | 34 | 1225 | 17.56 | 47.89 | 46.80 | 5.18 | 86.03 |

独立图像指传给模型的不同图像字节；重复历史图像次数不代表独立视觉任务或重新编码次数。候选均实际使用视觉，自行选择检查次数。内存列口径重叠，绝不能相加：进程 RSS、physical footprint、Metal/引擎分配、全局 GPU 内存范围不同。全局 GPU 包括后台应用及候选自测浏览器。亦保留 Pi/工具进程树 RSS 与引擎分配字节，但进程树求和可能重复统计共享页；RSS 小不能单独证明总 RAM 成本小。

![CAP-04 memory counters](../../assets/figures/cap-04-memory-counters.png)

![CAP-04 pressure timelines](../../assets/figures/cap-04-pressure-timelines.png)

全部开发采样显示正常内存压力，没有观察到 swap 增长，遥测错误字典为空。没有温度序列，不能据此声称没有温度降频。实际开发平均间隔约1.005–1.009秒，最大间隔1.082833秒，可能漏过短时尖峰。计划中的模型加载/服务切换与意外原生重启分开，本轮格内未观察到后者。生命周期、加载、基线、开发及独立评审遥测分别保留，因此不会隐藏超时庭院后段低 GPU 等待。

| 项目 | Samples / 样本 | Mean gap s / 平均间隔秒 | Max gap s / 最大间隔秒 | First delay s / 首样本延迟秒 | Final lag s / 末样本滞后秒 | Pi+tools RSS peak GiB |
| --- | --- | --- | --- | --- | --- | --- |
| pelican-mltf | 1565 | 1.006876 | 1.027982 | 0.075 | 0.329 | 1.30 |
| pelican-splash | 1741 | 1.007696 | 1.038267 | 0.098 | 0.738 | 1.59 |
| pelican-strata | 877 | 1.006885 | 1.029600 | 0.121 | 0.280 | 1.38 |
| courtyard-splash | 1479 | 1.007731 | 1.030206 | 0.097 | 0.489 | 1.69 |
| courtyard-strata | 1892 | 1.007103 | 1.047901 | 0.103 | 0.241 | 2.22 |
| courtyard-mltf | 3574 | 1.007560 | 1.082833 | 0.103 | 0.279 | 1.54 |
| sun-strata | 1788 | 1.005011 | 1.045803 | 0.108 | 0.725 | 2.81 |
| sun-mltf | 1729 | 1.006315 | 1.051543 | 0.077 | 0.799 | 1.52 |
| sun-splash | 2018 | 1.008776 | 1.057804 | 0.119 | 0.283 | 1.66 |

## 独立验收与评审器修正

Chromium 使用冻结 Git archive 副本。WebGL 正控制在实际 Apple M5 Max Metal 渲染器上通过8/8。仪器只观察应用创建上下文，不抢先分配上下文；通用立方体还验证未用的2D 导出画布不会被仪器污染。九个页面均无致命页面错误，所观察加载没有外部资源依赖，缩放及60秒循环稳定。60秒约3601次 requestAnimationFrame 回调，中位16.7ms，没有超过50ms 的回调间隔；这是60Hz 上限下浏览器响应代理量，不是 GPU 帧耗时或真实渲染吞吐排名。手机测试为390×844触控/视口模拟，没有使用实体手机。

首轮自动收集记录90个探针，其中一个导出选择器假设漏掉 MLTF 的真实 PNG/SVG 控件。随后对九个项目统一完成103项真实操作检查，再补充6项庭院键盘检查：真实播放/暂停/恢复/重置、下载并打开、相机拖动/滚轮、手机触控、标签/预设、太阳时间轴及实测2倍速、连续实际90秒播放，均通过。检查数量代表证据覆盖，不是作品分数；构图、裁切及科学措辞仍扣分。

保留首版证据。补充评审静态服务器曾因缺少 favicon 而崩溃，修正其自身处理器后重跑全部三个键盘流程。较早的通用 OrbitControls(null).dispose 清理夹具曾失败，亦仅修正候选代码之外的夹具；默认 Python 的辅助 psutil 探针改用捆绑运行时。这些均不是代修候选应用。全部页面都有 viewport meta，手机实际 innerWidth=scrollWidth=390。太阳暂停冻结模拟时间，独立开启的自动相机可继续。主要影片证据使用真实播放，因为300ms 拖动截图可能仍处于相机过渡。

## 固定量表与逐作品评审

量表在开发前冻结。内容/可用性/技术采用0、半分或满分；视觉各轴用0–5整数；交接用0/0.5/1。逐行双语原因、证据路径及分数见元数据包 scoring/review.json。下表公开全部条目，不用模型自报检查代替评审；运行与代码组织按范围评述，不事后增加代码质量权重。

### 2D 鹈鹕在香榭丽舍大道骑车

**内容 /40**

| 条目 | Max / 上限 | MLTF | Splash | Strata |
| --- | --- | --- | --- | --- |
| C01 能辨认的鹈鹕 | 4 | 4 | 4 | 4 |
| C02 长嘴与喉囊 | 4 | 4 | 4 | 4 |
| C03 身体、翅膀与脚 | 4 | 4 | 4 | 4 |
| C04 可辨认的双轮单车、车架、前叉与车把 | 4 | 4 | 4 | 4 |
| C05 合理的骑行姿势与接触位置 | 4 | 4 | 4 | 4 |
| C06 香榭丽舍大道透视林荫街景 | 4 | 4 | 4 | 4 |
| C07 凯旋门背景 | 4 | 4 | 2 | 4 |
| C08 巴黎沿街建筑 | 4 | 4 | 4 | 4 |
| C09 树列、路面与街道陈设 | 4 | 4 | 4 | 4 |
| C10 完整原创构图，物件不以标签代替 | 4 | 4 | 4 | 4 |

**视觉制作 /25**

| 条目 | Max / 上限 | MLTF | Splash | Strata |
| --- | --- | --- | --- | --- |
| V01 构图 | 5 | 3 | 3 | 4 |
| V02 造型与材质细节 | 5 | 3 | 3 | 3 |
| V03 光照与配色 | 5 | 4 | 3 | 4 |
| V04 空间深度或2D层次可读性 | 5 | 3 | 4 | 4 |
| V05 一致性与叙事 | 5 | 4 | 3 | 4 |

**可用性 /20**

| 条目 | Max / 上限 | MLTF | Splash | Strata |
| --- | --- | --- | --- | --- |
| U01 可进入并看清场景 | 2 | 2 | 2 | 2 |
| U02 桌面构图可读 | 2 | 2 | 2 | 2 |
| U03 390px构图可读 | 2 | 2 | 2 | 1 |
| U04 现有控件可用 | 2 | 2 | 2 | 2 |
| U05 重置或重载可靠 | 2 | 2 | 2 | 2 |
| U06 无严重遮挡的界面覆盖 | 2 | 2 | 2 | 2 |
| U07 PNG或SVG导出 | 2 | 2 | 2 | 2 |
| U08 导出对应实际画面 | 2 | 2 | 2 | 2 |
| U09 控件可键盘操作 | 2 | 2 | 2 | 2 |
| U10 标题与说明简洁，不代替画面 | 2 | 2 | 2 | 2 |

**技术 /10**

| 条目 | Max / 上限 | MLTF | Splash | Strata |
| --- | --- | --- | --- | --- |
| T01 无致命页面错误 | 2 | 2 | 2 | 2 |
| T02 离线自包含资源加载 | 2 | 2 | 2 | 2 |
| T03 缩放后稳定 | 2 | 2 | 2 | 2 |
| T04 60秒运行稳定 | 2 | 2 | 2 | 2 |
| T05 真实可信的2D或3D渲染 | 2 | 2 | 2 | 2 |

**交接 /5**

| 条目 | Max / 上限 | MLTF | Splash | Strata |
| --- | --- | --- | --- | --- |
| H01 README启动说明 | 1 | 1 | 1 | 1 |
| H02 操作说明 | 1 | 1 | 1 | 1 |
| H03 覆盖范围说明 | 1 | 1 | 1 | 1 |
| H04 限制说明 | 1 | 1 | 1 | 1 |
| H05 可复现的本机入口 | 1 | 1 | 1 | 1 |

#### MLTF — 92/100

画面明快，长嘴与喉囊清楚，内容完整。前景树部分遮住后轮，沿街立面较重复；导出保留实际画面。

![pelican-mltf 初始桌面](../../assets/figures/cap-04-pelican-mltf-desktop.png)

![pelican-mltf PNG 打开的导出文件](../../assets/figures/cap-04-pelican-mltf-export-png.png)

![pelican-mltf SVG 打开的导出文件](../../assets/figures/cap-04-pelican-mltf-export-svg.png)

![pelican-mltf 390×844](../../assets/figures/cap-04-pelican-mltf-mobile.png)

[Original screenshot pack / 原图证据包](../../assets/evidence/cap-04-pelican-mltf-screenshots.zip)

#### Splash — 89/100

大道透视清晰，鸟与单车轮廓可辨；头和嘴遮住中央凯旋门大部分结构。平面造型及重复窗格限制精细度。

C07：鸟头与嘴遮住凯旋门大部分，仅上部及大道字样仍可见。

![pelican-splash 初始桌面](../../assets/figures/cap-04-pelican-splash-desktop.png)

![pelican-splash PNG 打开的导出文件](../../assets/figures/cap-04-pelican-splash-export-png.png)

![pelican-splash SVG 打开的导出文件](../../assets/figures/cap-04-pelican-splash-export-svg.png)

![pelican-splash 390×844](../../assets/figures/cap-04-pelican-splash-mobile.png)

[Original screenshot pack / 原图证据包](../../assets/evidence/cap-04-pelican-splash-screenshots.zip)

#### Strata — 93/100

骑手靠左，地标保持清楚；贝雷帽与飘动围巾加强巴黎故事感。肢体仍较硬朗简单，竖屏上下黑边浪费大量空间。

U03：控件可用，但横向画布在竖屏成为上下大黑边之间的小条画面。

![pelican-strata 初始桌面](../../assets/figures/cap-04-pelican-strata-desktop.png)

![pelican-strata PNG 打开的导出文件](../../assets/figures/cap-04-pelican-strata-export-png.png)

![pelican-strata SVG 打开的导出文件](../../assets/figures/cap-04-pelican-strata-export-svg.png)

![pelican-strata 390×844](../../assets/figures/cap-04-pelican-strata-mobile.png)

[Original screenshot pack / 原图证据包](../../assets/evidence/cap-04-pelican-strata-screenshots.zip)

2D 源码保留矢量或绘图图元，导出 PNG/SVG，不以标签代替鸟。实际打开 PNG、SVG 并确认画面对应，原文件保留在证据中。MLTF 的前景遮挡较轻；Splash 地标被遮挡影响内容分；Strata 靠左叙事增加视觉分，但手机呈现扣分。

### 3D 中国传统庭院

**内容 /40**

| 条目 | Max / 上限 | MLTF | Splash | Strata |
| --- | --- | --- | --- | --- |
| C01 围合院墙 | 2 | 2 | 2 | 2 |
| C02 正门或月洞门 | 2 | 2 | 2 | 2 |
| C03 影壁 | 2 | 2 | 2 | 2 |
| C04 主厅 | 2 | 2 | 2 | 2 |
| C05 厢房 | 2 | 2 | 2 | 2 |
| C06 连廊 | 2 | 2 | 2 | 2 |
| C07 亭 | 2 | 2 | 2 | 2 |
| C08 传统曲线瓦屋顶 | 2 | 2 | 2 | 2 |
| C09 木柱或斗拱 | 2 | 2 | 2 | 2 |
| C10 窗棂 | 2 | 2 | 2 | 2 |
| C11 匾额或对联 | 2 | 2 | 2 | 2 |
| C12 石砖铺地 | 2 | 2 | 2 | 2 |
| C13 池水 | 2 | 2 | 2 | 2 |
| C14 小桥 | 2 | 2 | 2 | 2 |
| C15 假山 | 2 | 2 | 2 | 2 |
| C16 竹子 | 2 | 2 | 2 | 2 |
| C17 乔木、灌木或花卉 | 2 | 2 | 2 | 2 |
| C18 家具或灯笼 | 2 | 2 | 2 | 2 |
| C19 合理院落布局与动线 | 2 | 2 | 2 | 2 |
| C20 真实3D，并可从适当视角观察 | 2 | 2 | 2 | 2 |

**视觉制作 /25**

| 条目 | Max / 上限 | MLTF | Splash | Strata |
| --- | --- | --- | --- | --- |
| V01 构图 | 5 | 4 | 2 | 4 |
| V02 造型与材质细节 | 5 | 3 | 2 | 4 |
| V03 光照与配色 | 5 | 3 | 2 | 4 |
| V04 空间深度或2D层次可读性 | 5 | 3 | 3 | 4 |
| V05 一致性与叙事 | 5 | 3 | 3 | 4 |

**可用性 /20**

| 条目 | Max / 上限 | MLTF | Splash | Strata |
| --- | --- | --- | --- | --- |
| U01 可进入并看到完整场景 | 2 | 2 | 1 | 2 |
| U02 环绕旋转可用 | 2 | 2 | 2 | 2 |
| U03 缩放可用 | 2 | 2 | 2 | 2 |
| U04 重置可恢复视角 | 2 | 2 | 2 | 2 |
| U05 三个预设视角可用 | 2 | 2 | 2 | 2 |
| U06 必需元素可发现 | 2 | 2 | 2 | 2 |
| U07 标签切换或等价元素检查 | 2 | 2 | 2 | 2 |
| U08 桌面缩放适配 | 2 | 2 | 2 | 2 |
| U09 手机视口操作与布局 | 2 | 1 | 1 | 2 |
| U10 控件标签与键盘操作 | 2 | 2 | 2 | 2 |

**技术 /10**

| 条目 | Max / 上限 | MLTF | Splash | Strata |
| --- | --- | --- | --- | --- |
| T01 无致命页面错误 | 2 | 2 | 2 | 2 |
| T02 离线自包含资源加载 | 2 | 2 | 2 | 2 |
| T03 缩放后稳定 | 2 | 2 | 2 | 2 |
| T04 60秒运行稳定 | 2 | 2 | 2 | 2 |
| T05 真实可信的2D或3D渲染 | 2 | 2 | 2 | 2 |

**交接 /5**

| 条目 | Max / 上限 | MLTF | Splash | Strata |
| --- | --- | --- | --- | --- |
| H01 README启动说明 | 1 | 0 | 1 | 1 |
| H02 操作说明 | 1 | 0.5 | 1 | 1 |
| H03 覆盖范围说明 | 1 | 0.5 | 1 | 1 |
| H04 限制说明 | 1 | 0 | 1 | 1 |
| H05 可复现的本机入口 | 1 | 1 | 1 | 1 |

#### MLTF — 87/100

围合院落完整，总览能容纳全院，窗棂、木构、池桥清楚。重复亮色水纹较生硬，手机固定面板遮挡场景。代理卡在自测超时，没有交付 README 或视觉记录。

U09：真实触摸事件环绕有效，但两个固定面板遮挡手机上方大量场景。

![courtyard-mltf 初始桌面](../../assets/figures/cap-04-courtyard-mltf-desktop.png)

![courtyard-mltf 总览，隐藏标签](../../assets/figures/cap-04-courtyard-mltf-overview.png)

![courtyard-mltf 细节，隐藏标签](../../assets/figures/cap-04-courtyard-mltf-detail.png)

![courtyard-mltf 侧面，隐藏标签](../../assets/figures/cap-04-courtyard-mltf-side.png)

![courtyard-mltf 390×844](../../assets/figures/cap-04-courtyard-mltf-mobile.png)

[Original screenshot pack / 原图证据包](../../assets/evidence/cap-04-courtyard-mltf-screenshots.zip)

#### Splash — 85/100

二十项元素均有呈现，包括屋顶、亭、桥、假山与种植。默认构图前景拥挤且裁切院落，檐下过暗，大片屋顶主导桌面及手机视图。

U01：入口可渲染，但默认视角裁切院落，前景屋顶遮住池水；切换视角后可观察。

U09：触摸环绕有效，控件可达；竖屏裁切较紧，屋顶占据过多画面。

![courtyard-splash 初始桌面](../../assets/figures/cap-04-courtyard-splash-desktop.png)

![courtyard-splash 总览，隐藏标签](../../assets/figures/cap-04-courtyard-splash-overview.png)

![courtyard-splash 细节，隐藏标签](../../assets/figures/cap-04-courtyard-splash-detail.png)

![courtyard-splash 侧面，隐藏标签](../../assets/figures/cap-04-courtyard-splash-side.png)

![courtyard-splash 390×844](../../assets/figures/cap-04-courtyard-splash-mobile.png)

[Original screenshot pack / 原图证据包](../../assets/evidence/cap-04-courtyard-splash-screenshots.zip)

#### Strata — 95/100

空间组织最清楚：入口园景与影壁，经月洞门进入池、桥、亭、主厅内院。瓦顶、木构、窗棂细节最丰富。桌面标签及长面板偏拥挤，但可隐藏；手机控件可折叠。

![courtyard-strata 初始桌面](../../assets/figures/cap-04-courtyard-strata-desktop.png)

![courtyard-strata 总览，隐藏标签](../../assets/figures/cap-04-courtyard-strata-overview.png)

![courtyard-strata 细节，隐藏标签](../../assets/figures/cap-04-courtyard-strata-detail.png)

![courtyard-strata 侧面，隐藏标签](../../assets/figures/cap-04-courtyard-strata-side.png)

![courtyard-strata 390×844](../../assets/figures/cap-04-courtyard-strata-mobile.png)

[Original screenshot pack / 原图证据包](../../assets/evidence/cap-04-courtyard-strata-screenshots.zip)

全部二十项可在适当视角中辨认，并非只读标签。Strata 将渲染、材质、自然、构件、建筑、布局拆成六个 ES 模块；MLTF/Splash 主要把场景与界面放在一个 HTML 中。模块划分较便于扩展，但不能证明隐藏正确性；三者均不是经历史考据的建筑复原。亭、假山、月洞门遇到默认屋顶遮挡时，需要环绕观察。

### 3D 太阳诞生动画

**内容 /40**

| 条目 | Max / 上限 | MLTF | Splash | Strata |
| --- | --- | --- | --- | --- |
| C01 约46亿年前气体尘埃云 | 4 | 4 | 4 | 4 |
| C02 引力坍缩 | 4 | 4 | 4 | 4 |
| C03 旋转与压扁 | 4 | 4 | 4 | 4 |
| C04 中心原恒星 | 4 | 4 | 4 | 4 |
| C05 吸积盘与物质汇聚 | 4 | 4 | 4 | 4 |
| C06 核心升温增密 | 4 | 4 | 4 | 4 |
| C07 氢聚变成氦 | 4 | 4 | 4 | 4 |
| C08 年轻太阳清除周围残余气体尘埃 | 4 | 4 | 4 | 4 |
| C09 稳定主序星太阳 | 4 | 4 | 4 | 4 |
| C10 连贯的科学演变、字幕与时间尺度压缩说明 | 4 | 2 | 2 | 4 |

**视觉制作 /25**

| 条目 | Max / 上限 | MLTF | Splash | Strata |
| --- | --- | --- | --- | --- |
| V01 构图 | 5 | 3 | 4 | 4 |
| V02 造型与材质细节 | 5 | 2 | 3 | 4 |
| V03 光照与配色 | 5 | 3 | 4 | 4 |
| V04 空间深度或2D层次可读性 | 5 | 3 | 4 | 4 |
| V05 一致性与叙事 | 5 | 3 | 4 | 5 |

**可用性 /20**

| 条目 | Max / 上限 | MLTF | Splash | Strata |
| --- | --- | --- | --- | --- |
| U01 自动播放与进度推进 | 2 | 2 | 2 | 2 |
| U02 暂停停止场景推进 | 2 | 2 | 2 | 2 |
| U03 恢复播放可推进 | 2 | 2 | 2 | 2 |
| U04 重播可复位 | 2 | 2 | 2 | 2 |
| U05 时间轴拖动改变实际阶段 | 2 | 2 | 2 | 2 |
| U06 速度选择可用 | 2 | 2 | 2 | 2 |
| U07 字幕与阶段同步 | 2 | 2 | 2 | 2 |
| U08 相机环绕可用 | 2 | 2 | 2 | 2 |
| U09 手机布局与控件 | 2 | 1 | 1 | 2 |
| U10 控件可键盘操作 | 2 | 2 | 2 | 2 |

**技术 /10**

| 条目 | Max / 上限 | MLTF | Splash | Strata |
| --- | --- | --- | --- | --- |
| T01 无致命页面错误 | 2 | 2 | 2 | 2 |
| T02 离线自包含资源加载 | 2 | 2 | 2 | 2 |
| T03 缩放后稳定 | 2 | 2 | 2 | 2 |
| T04 60秒运行稳定 | 2 | 2 | 2 | 2 |
| T05 真实可信的2D或3D渲染 | 2 | 2 | 2 | 2 |

**交接 /5**

| 条目 | Max / 上限 | MLTF | Splash | Strata |
| --- | --- | --- | --- | --- |
| H01 README启动说明 | 1 | 1 | 1 | 1 |
| H02 操作说明 | 1 | 1 | 1 | 1 |
| H03 覆盖范围说明 | 1 | 1 | 1 | 1 |
| H04 限制说明 | 1 | 1 | 1 | 1 |
| H05 可复现的本机入口 | 1 | 1 | 1 | 1 |

#### MLTF — 86/100

主要阶段均有动画，控件可用。偏大的柔光粒子、核心亮带削弱立体形态，构图留黑较多。「46亿年压缩成90秒」含混地混合太阳年龄与形成过程时长。

C10：阶段与示意说明齐全，但46亿年压缩成90秒的表述混淆形成时长与年龄。

U09：手机控件与字幕有效，但早期云团横向裁切明显。

![sun-mltf 初始桌面](../../assets/figures/cap-04-sun-mltf-desktop.png)

![sun-mltf real playback 0s / 真实播放](../../assets/figures/cap-04-sun-mltf-live-00.png)

![sun-mltf real playback 45s / 真实播放](../../assets/figures/cap-04-sun-mltf-live-45.png)

![sun-mltf real playback 89s / 真实播放](../../assets/figures/cap-04-sun-mltf-live-89.png)

![sun-mltf 390×844](../../assets/figures/cap-04-sun-mltf-mobile.png)

[Original screenshot pack / 原图证据包](../../assets/evidence/cap-04-sun-mltf-screenshots.zip)

#### Splash — 91/100

较有电影感：原恒星大，暖色盘明显，清除到稳定恒星的转场清楚。聚变阶段严重过曝；页脚将真实形成过程写成跨越约46亿年，表达有误。

C10：页脚明确将真实形成过程写成约46亿年；这是太阳年龄，不是其形成所需时长。

U09：手机控件有效，但早期云团位于下方，并被底部界面裁切。

![sun-splash 初始桌面](../../assets/figures/cap-04-sun-splash-desktop.png)

![sun-splash real playback 0s / 真实播放](../../assets/figures/cap-04-sun-splash-live-00.png)

![sun-splash real playback 45s / 真实播放](../../assets/figures/cap-04-sun-splash-live-45.png)

![sun-splash real playback 89s / 真实播放](../../assets/figures/cap-04-sun-splash-live-89.png)

![sun-splash 390×844](../../assets/figures/cap-04-sun-splash-mobile.png)

[Original screenshot pack / 原图证据包](../../assets/evidence/cap-04-sun-splash-screenshots.zip)

#### Strata — 96/100

科普顺序最清楚，有核心剖视、清晰章节标题与阶段导航。细粒子、恒星纹理及配色转变较统一；仍是风格化示意，并非天体物理模拟。

![sun-strata 初始桌面](../../assets/figures/cap-04-sun-strata-desktop.png)

![sun-strata real playback 0s / 真实播放](../../assets/figures/cap-04-sun-strata-live-00.png)

![sun-strata real playback 45s / 真实播放](../../assets/figures/cap-04-sun-strata-live-45.png)

![sun-strata real playback 89s / 真实播放](../../assets/figures/cap-04-sun-strata-live-89.png)

![sun-strata 390×844](../../assets/figures/cap-04-sun-strata-mobile.png)

[Original screenshot pack / 原图证据包](../../assets/evidence/cap-04-sun-strata-screenshots.zip)

七个真实播放截图时间点为0/15/30/45/60/75/89秒。按时间对齐，不是按语义阶段对齐：45秒 MLTF 已到核心升温，另外两者仍是吸积盘。三者均有演变的3D 物质及清除到主序阶段。粒子位置、阶段更新及相机控件主要在 index.html；按时间驱动的拖动有利于重播，但粒子示意不是流体、辐射转移或核物理计算。

科学措辞：[NASA 太阳事实](https://science.nasa.gov/sun/facts/)指出太阳约46亿年前形成；[NASA 恒星](https://science.nasa.gov/universe/stars/)将恒星形成描述为数百万年的过程。Splash 页脚称真实过程跨越约46亿年，时长误导。MLTF「46亿年→90秒」也可理解为一直讲到今天的历史，但没有清楚区分。两者各只在 C10 扣2分，C01 正确年代仍给分。Strata 明确说「此后46亿年」，区分形成与后续历史。三者均区分聚变与化学燃烧，并将超新星触发视为假说。

## MLTF 庭院超时与干预记录

模型在2008.24秒开始一个没有 timeout 参数的 Bash/Node/Chromium 自测。代码含 `const bb=new (Object.getPrototypeOf(it.group).constructor==='Object'?0:0); // noop`，尝试构造0并抛 TypeError。关闭浏览器只在成功路径，catch 打印错误及设置 process.exitCode，却没有关闭仍活动的浏览器连接，Bash 一直不返回。监督者按共同上限等候，在3600.3937秒结束其拥有的进程树（轮询延迟0.3937秒），等待尾段1592.15秒。没有提示、修源码、延长时间或额外隐藏验收重试。

完成的已结束阶段为0/3，仍在尝试阶段1，没有 README 或 VISUAL-NOTES。此前写好的冻结场景仍通过独立渲染与操作检查，作品得87/100；87分不表示代理成功按时交付。操作失败来自模型自写工具流程，并不是推理服务器内存不足的证据。诊断及结局见 raw/courtyard-mltf/formal/selftest-hang-*.json。

## 源码固定版本、复现与证据

| 项目 | Port / 端口 | Frozen Git commit / 冻结提交 |
| --- | --- | --- |
| pelican-mltf | 4201 | 5f8b8e21944b504810e8f4bc40eb0a6615ddbb0a |
| pelican-splash | 4202 | b0466e9ce3a096c4ad60a7ce980ad7e6625532b3 |
| pelican-strata | 4203 | a2a56fde2762c58b728ccb9267484b107782bab5 |
| courtyard-splash | 4204 | 0cad523ac65333ea00ba8f8cdcbb9337af6cc636 |
| courtyard-strata | 4205 | be87304de4399612d1c45c0e8ddb4956da586b4a |
| courtyard-mltf | 4206 | c73d7fee98b16c3113c71f809a58717b28c2e1ed |
| sun-strata | 4207 | 783d6d411cdb5782887c2bc5212efb7defeec9ab |
| sun-mltf | 4208 | e2e4a227cd3312d02f99fbe53cd2f5762328693e |
| sun-splash | 4209 | f2db95d954ca49774466033d62b7af0c9195cdb4 |

每件作品保留在本机独立 Git 仓库 `~/Code/qwen3.8_tests/2026-10-25-visual-triad/llm-test-2026-10-25-visual-{topic}-{engine}`。没有发布作品仓库或演示网址。在本机进入对应目录、核对固定提交，启动下面静态服务并打开回环地址。示例端口4201，其他按表选择；冻结场景不需要安装包。

```sh
python3 -m http.server 4201 --bind 127.0.0.1
# http://127.0.0.1:4201/
```

独立评审前后，原作者工作树均干净，HEAD 与快照一致，冻结副本所有文件哈希未变。初始输入及 vendor 完整性见 configs/seed-integrity.json。报告展示42张字节一致复制的独立截图；九个项目包保留全部独立原图与导出 PNG。太阳包含七个真实播放时间点；元数据包含完整条目评分、原生状态/资源序列、每请求用量/计时/采样、评审器源码、源码哈希、文档、修正日志及超时诊断。四幅独立 Matplotlib 图有 PNG/SVG 及输入输出哈希，按实际时间戳绘制，不重采样或把缺失值填零。

公开包排除完整私人 Pi 会话/消息、完整 SSE、凭据、私人配置、权重、缓存、运行数据库及完整产品实现。文本账户目录统一为 `/Users/benchmark`；省略进程名单、完整原生实例状态及阶段消息块，保留选取的能力/计数与标量测量。publication.json 记录变换及哈希，manifest.json 将各成员映射到证据包并验证 SHA256。截图未改动，私人拼图只用于审阅，不替代原图证据。完整原始资料仍保留在本机实验 evaluation 目录。

## 结论边界

每题每系统只有一个实际样本，视觉制作评分主观且知晓身份。模型、参数规模、量化、原生引擎、缓存/draft/视觉路径及自主策略同时变化，不能隔离引擎因果或量化质量。固定顺序均衡位置但无法消除后台负载与时间影响。允许提前完成，因此实际开发时长不同。没有压满256K，没有 PPL/KL、统计置信区间、真人观众研究或通用智力排名。控件响应、60Hz 浏览器循环与元素齐全，均不能单独证明专业视觉品质、历史准确或科学模拟正确。
