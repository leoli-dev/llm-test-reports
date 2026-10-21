# Qwen3.8-27B：三种本机 8bit 配置与 GGUF 补测

[English](2026-10-21-splash-gguf-q8-perf06-replay.md) | [简体中文](2026-10-21-splash-gguf-q8-perf06-replay_CN.md)

PERF-10 · 测试日期：2026-10-21，America/Toronto。与 PERF-09 相同 M5 Max 主机上的本机推理。

## 问题与实测性能

按原始 PERF-06 两份长图文请求，在 Splash 上补测 Unsloth Q8_0，每项任务新起进程。下列 PERF-09 MLX affine8 与 MLTF 数据为早先同日参考，两项基线均未在本次重跑或交错运行。

| 配置；各两项任务 | TTFT s | 完整请求秒 | 正文交付 tok/s | 输出 / 总耗时 tok/s |
|---|---|---|---|---|
| Splash / GGUF Q8_0 | 774.17 | 1036.37 | 15.64 | 4.04 |
| Splash / MLX affine8 （早先 PERF-09） | 493.50 | 633.02 | 29.36 | 6.53 |
| MLTF / q8c （早先 PERF-09） | 630.92 | 777.38 | 27.97 | 5.27 |

这些是描述性实测，不能视为控制了其他变量的文件格式性能对照。Q8_0 与 MLX affine8 的量化数值与 native 投影路径不同，视觉线性层均为 BF16，但源容器及辅助张量 dtype 不同；运行顺序、温控、文件缓存、随机输出及推测接受率也有影响。两项任务不足以建立稳定排名或通用质量等价。

后台负载未受控制。GGUF A/B 正文交付期间整机 CPU 均值为 53.25% / 55.19%，全局 GPU busy 为 26.91% / 24.98%。测试结束后的只读进程快照发现多个浏览器 helper 各自超过单核 50% CPU。该快照发生在推理之后，不能建立它们在整个请求期间的精确负载；这些条件进一步限制速度差的因果归因。保留用户应用运行。

## 2026-10-21 补充：三种本机 8bit 配置

用户要求汇总三种本机配置，并因本次速度不符合本机使用需求，决定删除 GGUF 文件。这是本机保留策略，不是模型智力或通用 GGUF 质量结论。本次补充没有重新推理。

| 配置 | 来源实验 | 满4096输出 | 图片＋恢复 | 冷KV | Native footprint 峰 GiB | 本机决策 |
|---|---|---|---|---|---|---|
| Splash MLX affine8 | PERF-09 | 2/2 | 2/2 | 已核对 | 35.46 | 保留 |
| MLTF q8c | PERF-09 | 2/2 | 2/2 | 已核对 | 6.34 | 保留 |
| Splash GGUF Q8_0 | PERF-10 | 2/2 | 2/2 | 已核对 | 35.40 | 删除GGUF文件 |

MLTF q8c 由与 Splash MLX 轮次相同的 MLX affine8 源权重打包而成，因此这里比较三种引擎/输入配置，而非三份独立量化源模型。Splash MLX 与 GGUF 均使用 Splash 1.4.0 原生 Metal，MLTF 为 0.1.2。全部数据来自本机 M5 Max / 128 GiB / macOS 27.0.1（26A434），复用相同 A/B 请求字节、126976输入＋4096输出、INT8 KV、96 GiB预算、采样和thinking OFF设置。

Footprint 为每种配置两次请求中 native 进程 physical footprint 的最大观测值。MLTF 打包路径的映射/计账方式不同，该列不包含其他进程及全局口径，不是模型总 RAM；不能据较小的 MLTF 数值推断等额整机内存节省。

| 配置 | 任务 | TTFT s | 完整秒 | Content tok/s |
|---|---|---|---|---|
| Splash MLX affine8 | A | 434.69 | 574.97 | 29.20 |
| Splash MLX affine8 | B | 552.32 | 691.06 | 29.52 |
| MLTF q8c | A | 619.32 | 764.82 | 28.15 |
| MLTF q8c | B | 642.51 | 789.95 | 27.78 |
| Splash GGUF Q8_0 | A | 633.19 | 886.89 | 16.15 |
| Splash GGUF Q8_0 | B | 915.14 | 1185.84 | 15.13 |

开头的均值表应与上述六次独立测量一起阅读。PERF-09 是早先同日参考，不是与 PERF-10 新交错的控制组；后台CPU/GPU负载、温控、自动ANE计划、输出内容及量化数值均未保持相同。本次 GGUF 慢速观测支持用户的本机保留决策，但不建立文件格式单因素排名。更早 PERF-06 的约58.06tok/s不计入此三方比较。

### 先归档后删除 GGUF：已完成

已删除 Q8_0 target 及其专用 GGUF 视觉投影器，共 29,978,232,480 字节（29.98 GB）权重；同时移除专用 prepared assembly、派生 tokenizer 元数据、选择链接及缓存锁条目。此为删除文件的逻辑大小，不保证等额增加 APFS 可用空间。

完整中英报告、图表、原始请求/SSE/输出/资源记录、校验和及来源仍归档保留。MLX8、MLTF q8c 和共享 DFlash2 checkpoint 均确认仍在。复现 GGUF 测试需重新下载固定 revision 文件。证据包附删除回执；原测试时下载及 manifest 记录仍作为历史证据保留。

## 主机、运行时与模型来源

| 项目 | 记录配置 |
|---|---|
| 推理位置 | 本机 Apple MacBook Pro；Mac17,6 |
| CPU / GPU / 内存 | Apple M5 Max / 18 CPU cores / 40 GPU cores / 128 GiB (137438953472 bytes) |
| 实验时系统 | macOS 27.0.1 (26A434), arm64 |
| Splash | 1.4.0 / 1482f6bbc2abf12375332725302019594150b6cb / native Metal |
| 构建工具 | Xcode 27.1 (27A9275); Metal 4 |
| Target | unsloth/Qwen3.8-27B-GGUF / Qwen3.8-27B-Q8_0.gguf |
| Target revision | 4ca720788d1e01f1bff70c033e0d0028fd02e502 |
| Target / 投影器字节 | 29,047,086,048 / 931,146,432 (mmproj-BF16.gguf) |
| Draft | incoai/Qwen3.8-27B-DFlash2 / BF16 / 015e795645c74b1a0eeef3b570031fb62e769bc5 |
| Draft 字节 | 3,848,817,896；与 PERF-09 相同源权重 |
| 模型权重文件总大小 | 33,827,050,376 字节（target + 投影器 + draft）；不代表运行时 RAM |
| API 模型 ID | mlx-community/Qwen3.8-27B-8bit （仅兼容别名；实际加载 GGUF） |
| 内存 / 上下文 / KV / 状态 | 96 GiB cap / 131072 tokens / INT8 KV / FP32 recurrent state |
| 缓存 / 推理模式 | 关闭 SSD prefix cache；核对冷 KV；reasoning none |
| 电源 | 接电；自动电源模式（powermode=0）；保存逐轮 thermal/status 证据 |

| 文件 | 字节 | SHA-256 | Hub LFS 哈希匹配 |
|---|---|---|---|
| unsloth/Qwen3.8-27B-GGUF/Qwen3.8-27B-Q8_0.gguf | 29047086048 | a680f44a06920e5d689774823782006aa3acc8db95750323373b24139b67e348 | True |
| unsloth/Qwen3.8-27B-GGUF/mmproj-BF16.gguf | 931146432 | 83ee4f4f205fa514161778c41df1ea14144faa0f713510893b63c2395f5c2d53 | True |
| incoai/Qwen3.8-27B-DFlash2/model.safetensors | 3848817896 | 67fc76d68dc5a9415511a4f394ef744d67510cd20e93b37cc2cc7d28e4bab65c | True |
| incoai/Qwen3.8-27B-DFlash2/config.json | 1239 | 873e3556509b0da06e29654ba00d4944888d4b5e8a33afde25f7eb27d321e980 | None |

完整下载后按固定 Hub revision 的大小/LFS SHA-256（有该字段时）核对，再预备模型并启动服务。下载、元数据转换、加载、预热及 ANE 校准均不计入客户端请求时间；没有改写源模型文件。Draft 的 BF16 指源 checkpoint；Splash 加载时使用与 PERF-09 相同的原生 draft 投影量化，源文件大小不等于运行时精度或 RAM。

## 这里的 8bit 代表什么

本次 GGUF 检查到 866 个 tensors：506 个 Q8_0、360 个 F32。Q8_0 每块 32 个有符号 int8 加一个 FP16 scale，该类块实际存储 8.5 bit/weight。早先 MLX checkpoint 是每组 64 的无符号 affine8，带 scale 与 bias，其中 333 个视觉 tensors 均为 BF16，无量化 scale/bias tensors；本次使用含 110 个 BF16、224 个 F32 tensors 的 GGUF 投影器。因此两套权重并非数值一致，图片结果或速度都不能单独归因于 target 量化。

Splash 使用原生 Metal 运行时，支持 MLX safetensors 与 GGUF 作为输入格式；读取 MLX checkpoint 不代表使用 MLX 推理框架。加载器将两类源权重重排为 kernel 所需布局，本次 27B Q8_0 target 没有转换成 MLX affine8。

## 原始负载与控制项

A、B 为两项合成 SQLite 队列/DAG/测试代码任务，各自使用不同三形状图片。128k-repeat 是 B 的 fixture 名称，不表示热缓存重复。每次处理 126,976 输入 tokens，其中一张图片展开为 234 tokens；在 131,072 上下文内预留 4,096 输出。Temperature=1、top_p=.95、top_k=20、enable_thinking=false 及 stream usage 均不变。API 模型兼容别名使原始请求 JSON 字节保持一致。

一次仅加载一个测试引擎，先 A 后 B，每项独立启动新服务进程。生成前 CPU-only 模板/tokenization 预检核对请求、格式化 prompt 和 token ID 哈希。没有裁剪、改 filler、屏蔽 EOS、挑 seed 或只保留成功结果的重试；自然 EOS 与失败均保留。不清空文件系统缓存。启动/就绪不计入 HTTP 时间。主请求后执行 temperature=0、最多 128 输出 tokens 的短图片恢复探针，再停止该进程。

| 运行 | Request SHA-256 | 输入 tokens | Expanded token IDs SHA-256 | KV 命中 tokens |
|---|---|---|---|---|
| gguf-1 | 052763e089b1f87de8e721832e9ee918ac56503473efc2a1136d3cd8062da790 | 126976 | 4a282b941080c009a313edb954c5478efe2bb43537f399e63a9d5bddea8b0107 | 0 |
| gguf-2 | 2055ef57041a7afa551928d99fe9b7047ae5ee070a38e87f8727671bde35d45c | 126976 | 65e7b7f5f4dec5064245f5a34231ac95cfa6ba7457921d021aa77f0603fec203 | 0 |

## 逐次客户端结果与恢复

| 运行/任务 | 输入/输出 | TTFT s | 总秒 | 正文跨度秒 | tok/s | 长 decode / 满4096 | 图片 / 恢复 | 终止 |
|---|---|---|---|---|---|---|---|---|
| gguf-1 / 128k | 126976 / 4096 | 633.19 | 886.89 | 253.70 | 16.15 | 通过 / 通过 | 通过 / 通过 | length |
| gguf-2 / 128k-repeat | 126976 / 4096 | 915.14 | 1185.84 | 270.70 | 15.13 | 通过 / 通过 | 通过 / 通过 | length |

TTFT 截止第一段非空正文，而非初始 role chunk；完整时间截至 SSE 完成。正文交付率为 completion tokens / 首末非空正文跨度，包含首块 tokens。推测/缓冲 chunk 不等于逐 token 延迟。机械长 decode 覆盖要求至少 2,048 输出 tokens 加输入/缓存/健康检查，满 4,096 输出另行记录。形状/颜色/顺序及恢复检查不证明 SQLite 生成代码正确，本次没有执行生成代码。

## Native 计时与推测解码

| 运行 | Prompt 秒 | Prompt tok/s | Decode 秒 | Decode tok/s | Drafted / accepted / image / restart 增量 |
|---|---|---|---|---|---|
| gguf-1 | 633.10 | 200.56 | 253.69 | 16.14 | {'drafted_tokens': 5794, 'accepted_draft_tokens': 3268, 'images_encodes': 1, 'transport_restarts': 0} |
| gguf-2 | 915.04 | 138.77 | 270.70 | 15.13 | {'drafted_tokens': 5754, 'accepted_draft_tokens': 3273, 'images_encodes': 1, 'transport_restarts': 0} |

Native prompt_ms 是开始至首次输出，含首轮推测块工作；native decode 分子排除首块。Status command 计数是另一种耗时口径，在恢复前保存；都不是独立 GPU kernel 计时。

| 运行 | 请求前 prefill/decode tokens | Prefill tokens | Command prefill s | Decode tokens | Command decode s |
|---|---|---|---|---|---|
| gguf-1 | 0 / 0 | 126976 | 632.70 | 4096 | 252.56 |
| gguf-2 | 0 / 0 | 126976 | 914.44 | 4096 | 269.96 |

| 运行 | 请求前 native thermal | Native 默认 ANE 状态 |
|---|---|---|
| gguf-1 | nominal | {'state': 'split', 'share': 0.2352941176, 'minimum_rows': 512, 'reason': "at share 0.24 for chunks of 512 rows or more: 16.2 ms per 2048-row FFN layer against 21.2 on the GPU alone, 2.7% from the GPU alone on the Neural Engine's part (calibrated in 5.8 s)", 'split_commands': 1, 'reruns': 0, 'ane_ms': 827.745579, 'evaluations': 64} |
| gguf-2 | fair | {'state': 'split', 'share': 0.2352941176, 'minimum_rows': 512, 'reason': "at share 0.24 for chunks of 512 rows or more, 2.7% from the GPU alone on the Neural Engine's part (set up as calibrated before in 1.6 s)", 'split_commands': 1, 'reruns': 0, 'ane_ms': 2272.782076, 'evaluations': 64} |

ANE 与 PERF-09 一样使用默认自动选择，逐轮日志/status 保留校准与所选任务比例；没有 ANE-off 对照，因此不建立 ANE 单因素收益。未记录环境温度及独立 GPU 时钟/功耗。

## 内存、CPU/GPU 与交付采样

名义 1Hz 遥测区分 native 引擎、Python frontend 与进程树。进程 CPU 100% 表示一个逻辑核，system CPU 与 GPU busy 属于全局。RSS、physical footprint、native memory_actual 与 GPU 驱动计数在统一内存中重叠，不能相加，也不能由差值推断总 RAM 节省。进程树求和可能重复共享页；采样可能遗漏短峰，各列峰值也未必同时发生。

| 运行 / 阶段 | 样本 | 引擎 CPU 均/峰 % | 进程树 CPU 均/峰 % | 系统 CPU 均 % | 全局 GPU 均 % | RSS / footprint 峰 GiB | Native current 峰 GiB | GPU in-use / allocated 峰 GiB |
|---|---|---|---|---|---|---|---|---|
| gguf-1 / before_first_content | 629 | 0.26 / 4.11 | 0.47 / 29.41 | 36.44 | 92.72 | 3.53 / 35.29 | 34.44 | 36.26 / 38.48 |
| gguf-1 / content_delivery | 252 | 0.62 / 1.18 | 1.12 / 2.41 | 53.25 | 26.91 | 3.66 / 35.40 | 34.57 | 36.33 / 38.59 |
| gguf-2 / before_first_content | 909 | 0.16 / 3.06 | 0.45 / 35.44 | 52.35 | 99.43 | 3.54 / 35.23 | 34.44 | 36.20 / 38.45 |
| gguf-2 / content_delivery | 269 | 0.59 / 1.82 | 1.06 / 2.17 | 55.19 | 24.98 | 3.66 / 35.38 | 34.57 | 36.32 / 38.57 |

| 运行 | Frontend footprint 峰 GiB | Tree footprint 求和峰 GiB | Native 累计分配峰 GiB | 请求 / 恢复 swap 增量 GiB | 压力样本计数 | SSE 最大间隔秒 / >2s / >5s |
|---|---|---|---|---|---|---|
| gguf-1 | 0.74 | 35.69 | 34.57 | -0.01 / -0.01 | {'normal': 881} | 0.71 / 0 / 0 |
| gguf-2 | 0.38 | 35.67 | 34.57 | 0.00 / 0.00 | {'normal': 1178} | 0.43 / 0 / 0 |

保护阈值为连续 15 次 critical 样本或 native footprint >115 GiB，仅停止本轮测试进程组。Swap 与 GPU 计数是整机口径。恢复探针后主动终止各服务，清理 SIGTERM 不代表崩溃。

## 审计、失败与对比边界

证据审计：38 项中 38 项通过。保留全部检查结果，没有为了全绿重试。

- `gguf-1`: errors=[]; telemetry_errors={}; native_status_stale=0; native_status_callback_failed=0

- `gguf-2`: errors=[]; telemetry_errors={}; native_status_stale=0; native_status_callback_failed=0

PERF-09 早先同日均值为 Splash MLX affine8 29.36 tok/s、MLTF 27.97 tok/s。该 MLTF 复跑未复现更早 PERF-06 的约 58.06 tok/s，原因尚未隔离，不能把旧数字作为本次 GGUF 的同期控制。PERF-09 还保留 MLTF B 的一次 status 遥测超时（审计 66/67），其生成证据另有完整记录。 [PERF-09](../experiments/perf-09_CN.md)

本次是性能/功能覆盖补测，不是 perplexity、代码正确性、通用智力、长会话稳定性、并发或工具能力测试；也不能据此验证用户此前 Windows Strata 的 IQ2_XS/IQ3_S 体验，或将此稠密 27B 与 Flash-Next 比较。更高精度本身不建立框架排名。

GGUF 派生 tokenizer 启动时触发 Transformers regex 警告。本次未修改 tokenizer，两份原始 fixture 均在生成前通过与 PERF-06 的格式化 prompt 和展开 token ID 精确哈希核对。这只验证本次 fixture，不证明所有输入均无差异；server 日志保留警告与模板补丁提示。

## 图表与可复核证据

![客户端性能；标注早先参考](../../assets/figures/perf-10-performance.png)

![GGUF 逐秒资源](../../assets/figures/perf-10-resources.png)

![GGUF SSE 交付间隔](../../assets/figures/perf-10-delivery.png)

[证据包](../../assets/evidence/perf-10-evidence.zip)：原始请求/图片/输出、SSE、结果、1Hz 资源记录、汇总 JSON/CSV、请求/token 哈希、thermal/status 日志、模型校验和、固定运行时与测试脚本来源、审计及清理记录；附早先 PERF-09 汇总和审计供参考。不含权重、环境、缓存或认证。

发布时泛化元数据/日志的本机用户目录与运行路径，省略电池标识符。原始请求 JSON、PNG、输出文本字节、数值与哈希保留不变，publication-manifest.json 记录原始/发布哈希；没有采集完整个人会话或无关进程命令行。

来源：[pinned GGUF](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF/tree/4ca720788d1e01f1bff70c033e0d0028fd02e502), [pinned Splash loading contract](https://github.com/incoai/splash/blob/1482f6bbc2abf12375332725302019594150b6cb/DEVELOPMENT.md), [same DFlash2 draft](https://huggingface.co/incoai/Qwen3.8-27B-DFlash2/tree/015e795645c74b1a0eeef3b570031fb62e769bc5).
