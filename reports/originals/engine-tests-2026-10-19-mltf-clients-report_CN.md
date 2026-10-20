# MLTF：qwen / pi / hermes 真实 CLI 图文长任务验收

[English](engine-tests-2026-10-19-mltf-clients-report.md) | [简体中文](engine-tests-2026-10-19-mltf-clients-report_CN.md)

<!-- environment-context:start -->

## 本机配置与系统（2026-10-20 补充）

| 项目 | 记录与证据边界 |
|---|---|
| 本机用途 | 本机推理工作站 |
| 本机硬件参考 | MacBook Pro `Mac17,6`；Apple M5 Max；18 核 CPU；40 核 GPU；128 GB 统一内存（128 GiB / 137438953472 字节） |
| 原报告明确记载的主机 | 详见原报告；未以当前快照补造历史配置 |
| 当前系统快照 | macOS 27.0.1，build `26A434`，arm64，Metal 4；采集于 2026-10-20 22:03:27 UTC |
| 实验时系统 | macOS 27.0.1 (26A434) |
| 历史配置边界 | 旧测试未保存独立快照时，详细核数只作为当前本机配置参考；内网 PC／云端推理硬件不由 Mac 配置推断 |

[完整环境说明](../../environment_CN.md)。模型、量化、引擎、缓存和请求条件以本报告原有记录为准。原始图表、源码和命令输出保留源语言证据。

<!-- environment-context:end -->

生成于 2026-10-19T18:45:33.884644-04:00。三客户端4096输出主轮完整通过：**否；见失败项**。

最终端到端验收（Hermes独立16K跟进单列）：**通过**。原主轮失败和无效适配尝试完整保留。

设备：Apple M5 Max，40 GPU cores，物理统一内存128 GiB，macOS 27.0.1。

每个客户端使用新启动的同配置 MLTF 服务，实际安装的 CLI 负责图像附件、模型请求、读取本地独立 nonce 文件及工具结果回传。代理逐字节转发到 MLTF；测试钩子只观察 native GenerationRequest，不替换请求或采样。

模型 `mlx-community/Qwen3.8-27B-8bit`，窗口 131,072 tokens，vision 开启，目标权重来自原 8bit 模型的 packed q8c，KV 为 INT8。共同正文 88,064 tokens；实际输入含各 CLI 的系统提示、工具、图像和结果，以逐请求 usage 为准。**本轮是 128K 窗口内的长任务，不是 128K 满载输入。**

推荐采样 `temperature=1 / top_p=0.95 / top_k=20` 同时核对客户端真实 HTTP body 和原生引擎请求。启动时保留客户端原设置：qwen low，pi / hermes medium thinking；Hermes原生恢复期间的effort变化逐请求记录。输出每请求上限 4096，最多三次生成；冷启动与工具后续请求的缓存分别记录。

## 功能与整体耗时

| 客户端 | 验收 | HTTP / native 次数 | CLI wall 秒 | 工具成功闭环 | 图片颜色/形状/顺序 | 最终回答字符 |
|---|---|---:|---:|---:|---|---:|
| qwen | 通过 | 2 / 2 | 263.13 | 1 / 1 | 通过 | 11,692 |
| pi | 通过 | 2 / 2 | 257.74 | 1 / 1 | 通过 | 16,542 |
| hermes | 失败/待查 | 4 / 3 | 401.63 | 1 / 1 | 失败 | 170 |

CLI wall 包含启动、客户端预处理、工具执行和所有请求。客户端的系统提示与 thinking effort 不同，数字用于实际链路验收，不能当作同提示、同推理预算的客户端性能排名。

## 全部请求：缓存、prefill 和 decode

| 客户端 / 请求 | 输入 / 输出 / reasoning tokens | effort / native thinking | 正文字符 | 缓存 tokens | 冷/暖 | TTFT¹ 秒 | lifecycle prefill² tok/s | lifecycle decode³ tok/s | 请求 wall 秒 | finish |
|---|---:|---|---:|---:|---|---:|---:|---:|---:|---|
| qwen / 0001 | 95824 / 130 / 71 | low / True | 0 | 0 | cold | 183.82 | 521.70 | 62.33 | 185.88 | tool_calls |
| qwen / 0002 | 96004 / 4096 / 1341 | low / True | 11,692 | 95808 | warm | 0.94 | 230.40 | 54.81 | 75.63 | length |
| pi / 0001 | 89323 / 77 / 11 | medium / True | 45 | 0 | cold | 162.80 | 549.10 | 72.86 | 163.77 | tool_calls |
| pi / 0002 | 89451 / 4096 / 31 | medium / True | 16,542 | 89312 | warm | 0.76 | 208.63 | 44.14 | 93.54 | length |
| hermes / 0001 | 92209 / 70 / 12 | medium / True | 0 | 0 | cold | 154.75 | 596.37 | 87.64 | 155.49 | tool_calls |
| hermes / 0002 | 92379 / 4096 / 4096 | medium / True | 0 | 92192 | warm | 0.84 | 247.88 | 30.71 | 134.05 | length |
| hermes / 0003 | 92419 / 4096 / 0 | none / False | 17,119 | 92352 | warm | 0.58 | 140.61 | 40.64 | 101.34 | length |
| hermes / 0004 | — / — / — | medium / None | 0 | None | unknown | — | — | — | — | None |

¹ TTFT 到首个生成增量，包含 thinking、正文或工具参数；首个可见正文时间另存 clients-summary.json / requests.csv。
² MLTF 口径为未缓存 prefill tokens ÷ start-to-first-emission elapsed；包含请求生命周期开销和首批生成，不是纯 GPU kernel 计时。暖缓存不会把复用 tokens 算成重新 prefill。
³ MLTF 口径为扣除首个完整 speculative emission 后的 tokens ÷ first-emission-to-done elapsed。包含 reasoning、正文和工具输出 tokens。它与 /status 的 native command throughput 口径不同；两者原值均保留。速度与token总量以全部HTTP/native逐请求证据为准，CLI终态摘要可能漏计截断中间轮。

完整的首正文时刻、生成交付间隔、prompt/decode 分母与 tokens 见 requests.csv（历史本机文件，未随本报告发布） 和 clients-summary.json（历史本机文件，未随本报告发布）。所有 HTTP 尝试均列出；失败请求保留，不以重跑结果替换。

## CPU、GPU 与统一内存

| 客户端 | Native / 前端 / CLI CPU 均值 % | 全局 GPU busy 均值 % | Native RSS / footprint 峰值 GiB | 前端 RSS / footprint 峰值 GiB | CLI tree RSS / footprint 峰值 GiB | MLTF allocator 峰值 GiB | 全局 GPU in-use 峰值 GiB |
|---|---:|---:|---:|---:|---:|---:|---:|
| qwen | 0.72 / 0.68 / 0.27 | 98.97 | 1.50 / 5.82 | 0.82 / 0.59 | 0.42 / 0.32 | 34.34 | 33.18 |
| pi | 0.78 / 0.82 / 0.32 | 99.15 | 1.50 / 5.57 | 0.80 / 0.57 | 0.14 / 0.09 | 34.08 | 32.63 |
| hermes | 0.91 / 0.93 / 0.64 | 96.75 | 1.68 / 6.01 | 0.80 / 0.57 | 0.81 / 0.57 | 34.52 | 32.32 |

CPU 100% 表示一个逻辑 CPU 核。Native 是实际 `splash` 子进程；前端是 Python HTTP 服务；CLI tree 包含启动适配器和其实际 agent 子进程。GPU busy / GPU driver memory 为全局计数，可能包括其他应用。
**RSS、physical footprint、MLTF allocator 和 GPU driver memory 口径重叠，不能相加。** Native OS footprint 不能代表全部 Metal 分配；进程树内存和可能重复计算共享页。本报告不据此计算 RAM 节省百分比。

| 客户端 | 1Hz 样本 | 压力计数 | swap 起→止 GiB（增量） | 状态 stale 样本 | telemetry 错误 |
|---|---:|---|---:|---:|---|
| qwen | 262 | {"normal": 262} | 4.70 → 4.70 (0.00) | 0 | {"process.process": 1} |
| pi | 257 | {"normal": 257} | 4.75 → 4.72 (-0.02) | 0 | {} |
| hermes | 401 | {"normal": 401} | 4.72 → 4.70 (-0.02) | 0 | {"process.process": 3} |

表中process.process采集错误来自已退出的短命CLI子进程（Qwen caffeinate；Hermes启动期间python/git）的进程枚举与查询竞争，原始错误和缺样计数保留。Native/HTTP前端是否完整采集另见每项valid_count/missing_count及server_roster_error_count；不会把缺样填成0。

![CPU、GPU 与内存逐秒曲线](../../assets/figures/ec9367fbf12d-resources.png)

## 验证边界和证据

图像识别和 nonce 证明真实图文与工具闭环。主轮长代码在4096 cap截断；独立16K跟进按其实际finish reason记录。本轮未执行生成代码、未验证 25 个 unittest，也未证明不同精度路径或不同客户端的回答质量等价。采样为随机，单轮成绩不提供统计置信度。

Pi 的 JSON 模式可能在模型 error/length 时仍退出 0，因此同时检查 finalized assistant 事件、agent settled、工具执行结果与 nonce；Qwen / Hermes 同时检查终态 envelope 和原始代理 / native 请求。

图像源为同一840×280 PNG。Pi/Hermes实际嵌入字节与源文件SHA256核对；Qwen真实CLI会转成同尺寸JPEG，明确记录真实编码和MIME、SHA256差异、RGB平均绝对误差及差异像素比例，并只对此已核实转换允许像素近似通过。识图答案和native image_spans仍须单独通过。不能声称三个客户端上传的图像字节相同。

临时 profile 隔离测试、输出 cap、工具范围和无关辅助请求；未替换 SDK 传输。Pi/Hermes 本轮关闭自动压缩以保留长正文，Qwen 保留其正常压缩机制；实际每次请求都核对共享长正文仍在。各客户端初始effort保留，自动恢复中的变化逐请求记录。

- 每请求速度与参数 CSV（历史本机文件，未随本报告发布）
- 每客户端 CPU/GPU/内存汇总 CSV（历史本机文件，未随本报告发布）
- 逐秒资源 CSV（历史本机文件，未随本报告发布）
- 完整机器可读审计（历史本机文件，未随本报告发布）
- 测试计划（历史本机文件，未随本报告发布）
- 持久客户端配置最终审计（历史本机文件，未随本报告发布）
- 服务恢复与进程清理审计（历史本机文件，未随本报告发布）
- 恢复后的实际服务状态（历史本机文件，未随本报告发布）
- 真实 CLI 离线解析器（历史本机文件，未随本报告发布）

真实CLI暴露了两项视觉能力声明缺口：Qwen补充`generationConfig.modalities.image=true`，Hermes补充本机模型的`supports_vision=true`；只修改对应canonical模型能力字段，采样和其他全局选择保留。Qwen修复证据（历史本机文件，未随本报告发布）、Hermes修复证据（历史本机文件，未随本报告发布）。随后原生图像请求由本报告实际HTTP和native job证据验证。

## Hermes独立16K输出跟进（不池入4096主轮）

预先记录的跟进计划（历史本机文件，未随本报告发布）只提高测试输出/步数预算，保持同一图像源、88,064正文tokens、vision、128K、medium初始thinking和推荐三项采样。输出cap=16,384，agent iterations=4，代理最多6次生成。原4096轮和全部失败证据保留；本节速度、时间、内存不合入主轮CSV或曲线。

- 真实CLI结果：通过；exit `0`，wall **1,052.92秒**，HTTP/native `4/4`。
- 终态视觉：`True`；nonce工具结果/最终回答：`True/True`；最终回答`94,183`字符。
- Native / 前端 / CLI CPU均值 `1.22 / 0.99 / 0.72%`；全局GPU busy均值`97.97%`。
- allocator峰值`36.34 GiB`，全局GPU in-use峰值`32.63 GiB`；内存口径重叠，不能相加。压力`{"normal": 1048}`，swap增量`-0.02 GiB`。
- 必需检查失败/待查：`[]`。

| 请求 | HTTP/forwarded | 输入 / 输出 / reasoning | effort | cache tokens | TTFT秒 | prefill tok/s | decode tok/s | wall秒 | finish |
|---|---|---:|---|---:|---:|---:|---:|---:|---|
| 0001 | 200 / True | 92219 / 131 / 73 | medium | 0 | 163.67 | 563.91 | 55.48 | 165.98 | tool_calls |
| 0002 | 200 / True | 92450 / 16384 / 16384 | medium | 92192 | 1.12 | 250.91 | 37.33 | 439.96 | length |
| 0003 | 200 / True | 92490 / 16384 / 0 | none | 92320 | 0.70 | 278.36 | 58.73 | 279.63 | length |
| 0004 | 200 / True | 108919 / 6042 / 54 | medium | 92480 | 40.34 | 408.59 | 52.28 | 155.83 | stop |

本轮请求2的16,384输出tokens全部用于思考，正文为空；Hermes自动将请求3设为none恢复，请求3输出16,384正文tokens后触发续写，请求4恢复medium并自然stop。**扩大输出cap没有消除思考耗尽现象**；最终成功包含客户端原生恢复和续写的全部时间。

Hermes终态CLI摘要只报告`6173` completion tokens；逐HTTP/native证据记录实际生成`38,941` tokens（reasoning `16,511`）。CLI摘要未包含截断中间轮，速度与总量必须以全部HTTP/native逐请求证据为准。

Native RSS / footprint峰值`2.23 / 7.82 GiB`；前端`0.82 / 0.58 GiB`；CLI tree `0.25 / 0.21 GiB`。资源采样`1048`个；native/前端进程采集错误`0`，短命CLI子进程查询竞争`2`次，原始缺样保留。

原始证据：hermes/followup16k（历史本机文件，未随本报告发布）。独立跟进请求CSV（历史本机文件，未随本报告发布）、资源汇总CSV（历史本机文件，未随本报告发布）、逐秒CSV（历史本机文件，未随本报告发布）、完整跟进审计（历史本机文件，未随本报告发布）、独立33项审计（历史本机文件，未随本报告发布）。


![Hermes独立16K跟进资源曲线](../../assets/figures/102d3c9aadad-followup-resources.png)

## 保留的失败尝试与测试收尾异常

- qwen / invalid-adapter（历史本机文件，未随本报告发布）：首次真实CLI没有发送图像、声明36个工具，协调器在prefill阶段中止；CLI exit -15。证据完整保留，未计入成功主轮速度/内存结论。
- runner-pi-hermes.log（历史本机文件，未随本报告发布）：pi 收尾时 PermissionError: [Errno 1] Operation not permitted。这是协调器清理已停止/僵尸进程组的异常，按原始HTTP/native终态单独判断应用请求；Pi已完成的成功数据保留。协调器随后修复并恢复普通服务。
- runner.log（历史本机文件，未随本报告发布）：qwen 收尾时 PermissionError: [Errno 1] Operation not permitted。这是协调器清理已停止/僵尸进程组的异常，按原始HTTP/native终态单独判断应用请求；Pi已完成的成功数据保留。协调器随后修复并恢复普通服务。

普通MLTF服务恢复记录：service-restored.json（历史本机文件，未随本报告发布），PID `59376`，ready `True`。

### qwen

原始证据：qwen/live（历史本机文件，未随本报告发布），前端 PID `51935`，native PIDs `[51948]`。
检查失败/待查：`[]`。
CLI 终态错误：`[]`。
文件读取/解析错误：`[]`。

- 请求 0001：HTTP 200、forwarded=True，可见正文识图=None、nonce=False；必需检查失败/待查 `[]`；观测偏离 `[]`；错误 `[]`。
- 请求 0002：HTTP 200、forwarded=True，可见正文识图=True、nonce=True；必需检查失败/待查 `[]`；观测偏离 `[]`；错误 `[]`。
### pi

原始证据：pi/live（历史本机文件，未随本报告发布），前端 PID `47427`，native PIDs `[47434]`。
检查失败/待查：`[]`。
CLI 终态错误：`[]`。
文件读取/解析错误：`[]`。

- 请求 0001：HTTP 200、forwarded=True，可见正文识图=False、nonce=False；必需检查失败/待查 `[]`；观测偏离 `[]`；错误 `[]`。
- 请求 0002：HTTP 200、forwarded=True，可见正文识图=True、nonce=True；必需检查失败/待查 `[]`；观测偏离 `[]`；错误 `[]`。
### hermes

原始证据：hermes/live（历史本机文件，未随本报告发布），前端 PID `49522`，native PIDs `[49539]`。
检查失败/待查：`["cli_exit_zero", "cli_tool_answer_evidence", "vision_colors_shapes_order", "no_blocked_http_attempts"]`。
CLI 终态错误：`[{"exit_code": 1, "error": null}]`。
文件读取/解析错误：`[]`。

- 请求 0001：HTTP 200、forwarded=True，可见正文识图=None、nonce=False；必需检查失败/待查 `[]`；观测偏离 `[]`；错误 `[]`。
- 请求 0002：HTTP 200、forwarded=True，可见正文识图=None、nonce=False；必需检查失败/待查 `[]`；观测偏离 `[]`；错误 `[]`。
- Hermes自动恢复：前一请求0002的4096输出全部为reasoning且正文为空，CLI原生length continuation将请求0003的reasoning_effort改为none，native thinking=false。原medium设置仍是启动配置；temperature/top_p/top_k继续为1/.95/20。恢复请求及耗时完整计入。
- 请求 0003：HTTP 200、forwarded=True，可见正文识图=True、nonce=True；必需检查失败/待查 `[]`；观测偏离 `["http_original_effort_preserved", "native_thinking_enabled"]`；错误 `[]`。
- 请求 0004：HTTP 429、forwarded=False，可见正文识图=None、nonce=False；必需检查失败/待查 `["native_job_matched_by_exact_public_id", "native_sampling_recommended", "native_float32_sampling_matches_http", "native_sampling_matches_http", "native_frontend_pid_matches_status", "native_output_cap_matches_plan", "native_prompt_matches_usage", "native_vision_input_present", "native_thinking_matches_http_effort", "usage_inside_128k", "usage_total_consistent", "cache_counts_consistent", "prefill_rate_arithmetic_consistent", "decode_rate_arithmetic_consistent", "http_success", "stream_finished"]`；观测偏离 `["native_thinking_enabled"]`；错误 `[{"proxy_errors": "per-case generation request limit 3 exceeded"}]`。
