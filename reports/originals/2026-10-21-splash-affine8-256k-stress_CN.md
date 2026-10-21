# Splash Qwen3.8-27B affine8：原生256K上下文压力测试

[English](2026-10-21-splash-affine8-256k-stress.md) | [简体中文](2026-10-21-splash-affine8-256k-stress_CN.md)

PERF-11 · 测试开始于2026-10-21，America/Toronto。实际本机推理；本实验没有重跑MLTF。

## 实测结果

| 阶段 | 交付/计数/窗口检查 | 键值检索 | 至少2048输出 | 结束后健康 |
|---|---|---|---|---|
| 256k | True | 5/5 | True | True |
| 256k-repeat | True | 5/5 | True | True |
| batchA | True | 5/5 | None | True |
| batchB | True | 5/5 | None | True |

机械完成与语义检索分别判定。服务配置为256K本身不证明接近256K的实际请求成功；以下独立预检与终端usage核对处理长度。失败或缺失结果照实保留，不替换样本。此处冷请求指native KV/前缀未命中，不表示操作系统文件缓存冷启动或刚下载权重。

本轮实际接纳并处理了接近256K的输入，未截断：258048输入、4096输出tokens。冷请求TTFT为947.72秒，总耗时1023.74秒；五键检索5/5。能装下、等待时间与检索实用性应分开看。

## 推理前确定的问题与标准

用户要求将Splash 8bit提高到256K并做压力测试、写报告。协议/执行脚本提交e64ddb6早于全部生成。原生窗口262144是输入与输出合计，不能把262144输入再加输出。256K长输出题使用恰好258048个套模板后输入tokens，另预留最多4096输出。关闭思考，使有限输出预算用于可见生成。

固定顺序为128K、192K、256K、原样重复256K、两个长输入客户端同时请求、一次超限拒绝，并在各串行阶段及并发组后进行短恢复探针。低档输入也运行在同一个256K配置的服务上，不是另启128K/192K引擎配置。检查SSE及usage完整、无静默输入截断、总长度不超过262144、五键检索、ready/Metal健康及无transport重启。至少2048输出作为长解码覆盖，4096为满输出预算；自然提前停止不重新抽样。

## 实际环境与固定条件

| 项目 | 记录配置 |
|---|---|
| 推理位置 | 本机Mac回环HTTP |
| 硬件 | MacBook Pro / Apple M5 Max / 18 CPU / 40 GPU / 128 GiB |
| 实验时系统 | ProductName:		macOS; ProductVersion:		27.0.1; BuildVersion:		26A434; arm64 |
| 供电 | Now drawing from 'AC Power';  -InternalBattery-0 (id=REDACTED)	68%; charging; 1:04 remaining present: true |
| Target | mlx-community/Qwen3.8-27B-8bit @ 815b83c0df8ffd1d1b5244cf75fd6ef14fca9ef9 |
| Draft | incoai/Qwen3.8-27B-DFlash2 @ 015e795645c74b1a0eeef3b570031fb62e769bc5; BF16 |
| 引擎 | Splash 1.4.0 native Metal @ 1482f6bbc2abf12375332725302019594150b6cb |
| Binary SHA256 | 15b4ac64d5f4f2070361fc0e94623f8a67d74f083632ccaa6a7b9acd4ed8cf79 |
| 量化 / KV / 状态 | MLX affine8, group64 / INT8 / FP32 |
| 上下文 / 内存上限 | 262144 total tokens / 96 GiB |
| RoPE | None （未超出原生窗口进行扩展） |
| 采样 / 思考 | temperature=1, top_p=.95, top_k=20; reasoning=none; recovery temperature=0 |
| 缓存 / ANE | 磁盘缓存关闭；保留RAM前缀缓存；ANE自动策略 |
| 客户端 / Pi | Python直接HTTP；全局Pi配置未改 |
| 服务启动秒数 | 11.05 |
| 协议 / 执行源码 | e64ddb6 / 5ecf5f6fe3d04a1a3432b2e7e574e6de523d6a5b |

硬件/系统快照来自本轮，未用旧工作站参考补填。离线复用已有target/draft及准备结果；本轮未重新下载、也未重新逐个哈希全部权重tensor。保留安装源摘要和实际native身份/build/layout/KV信息。MLX描述输入权重格式，推理为Splash原生Metal。本轮仍加载视觉组件，但请求全部为文本，不建立256K视觉能力结论。

## 合成任务与输入核对

| 题包 | 实际输入 | 输出上限 | 合计预算 | 键值近似位置 |
|---|---|---|---|---|
| 128k | 130560 | 512 | 131072 | KEY_A:1.036%, KEY_B:24.999%, KEY_C:49.922%, KEY_D:74.799%, KEY_E:98.709% |
| 192k | 196096 | 512 | 196608 | KEY_A:1.015%, KEY_B:24.895%, KEY_C:49.771%, KEY_D:74.597%, KEY_E:98.471% |
| 256k | 258048 | 4096 | 262144 | KEY_A:1.008%, KEY_B:24.948%, KEY_C:49.841%, KEY_D:74.709%, KEY_E:98.574% |
| batchA | 258048 | 256 | 258304 | KEY_A:1.008%, KEY_B:24.948%, KEY_C:49.841%, KEY_D:74.709%, KEY_E:98.574% |
| batchB | 258048 | 256 | 258304 | KEY_A:1.008%, KEY_B:24.948%, KEY_C:49.841%, KEY_D:74.709%, KEY_E:98.574% |
| overflow | 262145 | 16 | 262161 | KEY_A:1.010%, KEY_B:24.889%, KEY_C:49.738%, KEY_D:74.616%, KEY_E:98.462% |

固定seed的合成记录包含五个独立生成的键值，约分布在1%、25%、50%、75%、99%处。输出首行必须恰为所需JSON对象；长输出题随后生成大量SQLite INSERT以维持解码，不评价SQL正确性。两个并发变体保留相同档案并改变末尾指令/标签，输入也恰为258048，各允许256输出。请求原始字节、参考键值、输入ID哈希、服务端apply-template/tokenize检查和终端usage均保留。失败后不缩短prompt。这是本地合成测试，不是官方RULER分数。

| 题包 | 冻结哈希未改 | 服务端token/哈希检查 |
|---|---|---|
| 128k | True | True |
| 192k | True | True |
| 256k | True | True |
| batchA | True | True |
| batchB | True | True |
| overflow | True | True |

## 客户端计时与结果

| 阶段 | HTTP | 输入 | 输出 | TTFT s | 总秒 | Content tok/s | 缓存输入 | 重启增量 | 错误 |
|---|---|---|---|---|---|---|---|---|---|
| 128k | 200 | 130560 | 76 | 260.66 | 262.36 | 44.55 | 0 | 0 | [] |
| 192k | 200 | 196096 | 75 | 553.24 | 555.49 | 33.35 | 0 | 0 | [] |
| 256k | 200 | 258048 | 4096 | 947.72 | 1023.74 | 53.88 | 0 | 0 | [] |
| 256k-repeat | 200 | 258048 | 4096 | 0.36 | 77.89 | 52.83 | 258016 | 0 | [] |
| batchA | 200 | 258048 | 77 | 27.06 | 30.96 | 19.73 | 258016 | 0 | [] |
| batchB | 200 | 258048 | 77 | 27.06 | 30.83 | 20.44 | 253952 | 0 | [] |
| overflow | 400 | N/A | N/A | N/A | 0.14 | N/A | N/A | 0 | [] |

TTFT截止第一段非空最终正文delta，不是仅含role的事件。总秒数从HTTP提交到SSE结束，不含CPU token预检、启动、恢复与遥测收尾。正文交付率为全部输出tokens除以首末非空正文跨度；推测块可能含多个tokens，不是逐token延迟。下表native指标保留其prompt/decode分母差异。自然提前停止、失败及length长输出均保留。各档输出要求不同，因此总耗时不是纯prefill对照。

| 阶段 | 原生prompt秒 | Prompt tok/s | 原生decode秒 | Decode tok/s | 草稿tokens | 接受草稿tokens |
|---|---|---|---|---|---|---|
| 128k | 260.59 | 501.02 | 1.71 | 43.98 | 140 | 55 |
| 192k | 553.14 | 354.52 | 2.25 | 32.90 | 161 | 51 |
| 256k | 947.59 | 272.32 | 76.01 | 53.87 | 3730 | 3563 |
| 256k-repeat | 0.35 | 90.69 | 77.53 | 52.82 | 3794 | 3554 |
| batchA | 0.51 | 62.57 | 3.90 | 19.48 | 154 | 54 |
| batchB | 26.62 | 153.87 | 3.77 | 20.17 | 147 | 55 |
| overflow | N/A | N/A | N/A | N/A | N/A | N/A |

![PERF-11 latency](../../assets/figures/perf-11-latency.png)

原生热请求的prompt速率仅计未命中输入：原样重复命中258016后只需处理32个未命中tokens。亚秒TTFT不是重新冷读取258048 tokens。长输出是重复结构SQL，DFlash接受率较高，输出速率仅适用于本任务，不代表通用文字/编程吞吐。

## 缓存复用、并发客户端、拒绝与恢复

短恢复之后原样重复256K请求，实际缓存命中须与此前独立前缀请求分开解释。并发组总耗时30.97秒；观测到native decode/prefill batch宽度峰值为2/2。因复用前缀，这是热前缀下的接纳/批处理压力测试；两个HTTP客户端本身不能证明独立冷prefill吞吐或GPU lane同时运行。

超限输入经核对为262145 tokens，在输出前已超出整个窗口。预期HTTP400/context_length_exceeded检查结果：True。要求拒绝且不截断；随后恢复单独验收。

| 恢复探针 | 精确正文及健康通过 | 秒 | 错误 |
|---|---|---|---|
| 128k-recovery | True | 0.16 | [] |
| 192k-recovery | True | 0.17 | [] |
| 256k-recovery | True | 0.19 | [] |
| 256k-repeat-recovery | True | 0.19 | [] |
| concurrent-recovery | True | 0.19 | [] |
| overflow-recovery | True | 0.16 | [] |

native queue-to-start：batchA为26.05秒、batchB为0.00秒。batchB最初有4096个未命中输入tokens；batchA较晚启动并复用新可用的共享前缀，随后两者在lane 0/1解码。客户端TTFT包含这段等待。并发短JSON和串行重复SQL的草稿接受率、输出长度不同，不能将正文速率直接当作并发加速倍率。

## 内存、负载、热状态与保护

| 阶段 | 样本 | footprint峰GiB | 当前allocation峰GiB | 整机CPU均值% | 全局GPU busy均值% | 内存压力 | 热状态 |
|---|---|---|---|---|---|---|---|
| startup | 4 | 31.20 | N/A | 10.83 | 61.50 | {'normal': 4} | {'null': 4} |
| preflight | 1 | 31.02 | 30.30 | 15.53 | 21.00 | {'normal': 1} | {'nominal': 1} |
| 128k | 131 | 35.44 | 34.53 | 7.47 | 99.44 | {'normal': 131} | {'nominal': 39, 'fair': 92} |
| 192k | 277 | 41.84 | 40.92 | 9.19 | 99.64 | {'normal': 277} | {'fair': 277} |
| 256k | 510 | 50.25 | 49.34 | 7.10 | 99.68 | {'normal': 510} | {'fair': 510} |
| 256k-repeat | 39 | 50.36 | 49.47 | 4.94 | 98.97 | {'normal': 39} | {'fair': 39} |
| concurrent | 15 | 50.99 | 50.08 | 4.31 | 99.60 | {'normal': 15} | {'fair': 15} |

累计977个样本；遥测错误计数：{'native_status': 4, 'engine_pid': 1, 'primary_process': 1}。全局swap开始6.93GiB、峰值6.93GiB、结束6.93GiB；相对本轮初始值峰值增加0.00GiB。已有swap不归因于Splash。资源保护终止：None；运行错误：None。

同一个服务持续运行并保留RAM前缀，后续内存包含此前缓存。统一内存下footprint、RSS、native allocation、进程树之和与全局GPU内存会重叠，不能相加。GPU利用率是全局驱动采样，不专属Splash；后台应用和温控未控制。两秒采样可能遗漏瞬时峰值。推理前固定保护条件：连续15次critical内存压力、native footprint超过115GiB、或新增swap超过8GiB。每请求绝对时限及服务端超时均3600秒，仅允许终止本测试拥有的进程组。

![PERF-11 memory](../../assets/figures/perf-11-memory.png)

严格核查：62/63。唯一未通过项要求全部样本均无遥测缺失/错误：服务就绪前四个样本缺少native status，其中一个采样时native子进程尚未可解析。之后973个样本的遥测错误均为零。保留启动缺口及原始未通过项，不将其记作推理失败，也不因此替换请求。目标两秒采样，启动status超时可能延长实际间隔。缺失计数显示为N/A或图中缺口，不表示零内存。

## 失败、人工介入与边界

CPU输入准备阶段最初误把本地Transformers的apply_chat_template字典当作token-ID列表，准备失败发生于任何推理之前。已改为先渲染文本再显式编码，源码、日期说明和失败回执保留；此后所有题包均在推理前通过服务端token哈希/计数预检。没有修正模型答案、替换失败样本或修改模型引擎源码。监督者生成合成输入、启动/监控本测试服务、核验精确键值并编写报告。

这是一条有限测试序列，各独立档位只抽样一次，另含刻意热重复与共享前缀并发组，不能证明长时间无泄漏、通用256K推理质量、生产并发容量或与MLTF/GGUF的稳定排名。本轮关闭思考且输入为纯文本记录，不同于此前Pi medium考试和128K图文代码回放，计时不能直接互换。即使容量测试机械完成，检索失败也会限制长上下文实际用途。

## 证据与收尾

[完整脱敏证据](../../assets/evidence/perf-11-evidence.zip)：2117519字节，104项manifest，SHA256为a89e6d2bd3f6dd777cae7ef6f5fd540cd9030aa222dfe7d11ee12de56be859f4。包含协议/执行脚本、固定seed实际请求、token/哈希预检、模型/系统来源、原始SSE/正文、状态/资源采样、所有失败与恢复/退出回执。逐文件列出原件/公开副本SHA256。公开时将用户/运行/测试路径泛化为符号变量并隐去电池ID，复现需适配代码路径；不含认证key/headers、私密客户端配置、权重、运行缓存或无关个人会话。记录和回答均为合成数据。已核对ZIP完整性、manifest哈希及实际API key不存在。

序列结束后停止本测试服务，保留已有模型文件与全局Pi配置。exit.json记录实际退出结果；完成后的计划SIGTERM收尾不记作推理崩溃。
