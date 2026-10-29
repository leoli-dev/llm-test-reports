# DeepSeek-V4.1-Flash-1017／Strata：M5 Max 128GiB 本机初测与退役决定

[English](2026-10-28-strata-deepseek41-flash1017-2bpw-m5max.md) | [简体中文](2026-10-28-strata-deepseek41-flash1017-2bpw-m5max_CN.md)

实验 ID：**PERF-14**。测试从 **2026-10-28** 开始，持续至 **2026-10-29**，时区 **America/Toronto**。英文与中文均为完整报告；本次归档、翻译和站点校验没有重跑模型测量。

> **2026-10-29 用户决定：这套模型不适合其本机使用，要求先归档并推送报告，再删除 DeepSeek 权重和相关 Pi／Strata 设置；保留 Strata 与 Qwen Flash Next。** 这是用户对本机实用性的判断，不是模型通用质量排名。原卸载请求保留如下；本次有日期的完成附记确认删除和 Qwen 可用性冒烟。

## 问题、标准与实验性质

本轮要回答：按官方 Strata 流程准备 DeepSeek 后，这台 Mac 能否开始本地测试，速度大致如何，128K／256K 是否可以加载并处理真实长输入。验证项目在操作中逐步增加，并非预注册、受控的跨模型性能考试。

每项调用前检查服务已加载且配置窗口相符。官方短题必须产生正常文字并包含 Paris；API 冒烟分别核对 JSON 与算术 391。长输入脚本先用实际 tokenizer 计数，再在约 10%／50%／90% 的**记录位置**放三个随机码，要求输出严格相符的 JSON；跟进另检查会话继续、缓存复用和正常结束。每个窗口只有一次合成检索及一次跟进。短生成使用输出上限 256，衡量速度，不评分文本完整性。

## 硬件、实验时系统与请求条件

| 项目 | 实际配置与证据边界 |
|---|---|
| 推理位置与客户端 | 本机推理；同一 Mac 上的本机 HTTP 与 Pi 客户端，没有 LAN PC 或云端推理 |
| 推理主机 | MacBook Pro／Apple M5 Max；18 核 CPU、40 核 GPU；128GiB 统一内存；内置 SSD。核数为部署时作者记录，GPU 与内存另有服务状态佐证 |
| 实验时系统 | macOS 27.2，见部署期日志；OS build 未记录；arm64，签名引擎包目标为 macos-arm64／Metal |
| 电源与热状态 | 电源、性能模式、温度与节流状态未记录，不能用来解释掉速 |
| 引擎与 Agent | Strata Control 0.1.53；DeepSeek Metal 组件 0.1.53，build `55a557bb6d77`；Pi 1.4.0，为测试时本机安装／源码检查记录，Pi smoke JSON 本身不含版本串 |
| 量化与缓存 | 主干平均 2.00 bpw；Engram IQ4_NL 有效 4.5 bpw；DSpark none；引擎自己的压缩缓存；没有指定 Qwen 的 INT8 KV 选项。首次长输入的 prompt cache 复用为 0，跟进单列 |
| 固定请求条件 | 单请求；6 专家 Full quality；`DS4_ENGRAM_THREADS=2`；文本输入；无 DFlash／MTP／DSpark 加速 |
| 短生成 | `reasoning_effort: none`，temperature 0，max_tokens 256，流式记录 TTFT 与引擎 timings |
| 长输入 | Anthropic 协议，thinking disabled、temperature 0、max_tokens 512；目标输入为窗口减约 2048；32K 累计等待上限 600 秒，128K／256K 为 1800 秒 |
| 未控制条件 | 其他应用、文件缓存、提示词与运行历史在样本间不同；未做后台负载、热状态或进程内存峰值连续监测 |

[环境证据及来源说明](../../assets/perf-14/evidence/environment-evidence.json)、[部署日志摘录](../../assets/perf-14/evidence/prepare-excerpt.log)。`environment.md` 中较早的系统快照没有用于倒填本次缺失的 OS build。

## 原始初测记录

2026-10-28–10-29，America/Toronto。机器：M5 Max（40 核 GPU）、128GB 统一内存、内置 SSD。文件准备、官方与 API 冒烟、32K／128K／256K 的三处合成检索及缓存跟进全部通过。测量结束时的状态快照为 256K、本机 8086 ready；这是历史状态，不是公开站读者当前可用的服务。权重、精度和内存预算未调整。260K 首次长输入的首字延迟约 15 分 57 秒，短请求无需读取整窗。

**本次观察到的性能限制：本次长窗之后观察到明显掉速和系统 swap 增大，原因未定位。** 最初 32K 短生成为 15.0 token/s；256K 长输入测试之后，新短请求降至 2.3 token/s，重启 256K 进程后复测为 4.6 token/s，此时全系统 swap 仍约 8.62GiB。三档合成检索通过不代表持续性能稳定；不能仅用最初的 15 token/s 描述当前速度。

整套 256,816,878,701 bytes（256.82GB），7/7 文件均已由官方流程完成大小与 SHA256 校验，pack 完整性检查通过。停止其他模型服务后，官方引擎 smoke 正确回答 Paris；32K 的无思考 JSON 和思考算术 API 冒烟 2/2 通过。[校验清单](../../assets/perf-14/evidence/verified-manifest.json)、[准备日志摘录](../../assets/perf-14/evidence/prepare-excerpt.log)、[官方 smoke](../../assets/perf-14/evidence/official-smoke.log)、[API 冒烟](../../assets/perf-14/evidence/smoke-20261028-234743-749089.json)。

## 模型与运行配置

- 底模：`deepseek-ai/DeepSeek-V4.1-Flash-1017`。ISTA-DASLab GSQ-RCO GGUF 固定 revision：`cb02422c900df489cea5833e8a92171224059b3c`。
- 主干平均 2.00 bpw，属于混合量化，不能解释为全部 tensor 都是 2-bit；文件名标签为 IQ2_XXS。Engram 为 IQ4_NL，有效 4.5 bpw。DSpark 文件标为 Q8_0，也有混合精度；本次 `--dspark none`，未启用。
- Strata Control 0.1.53；DeepSeek Metal 组件 0.1.53，build `55a557bb6d77`。稳定引擎路径：`$HOME/.local/share/strata/install/engine-dsv41/0.1.53-macos-arm64-metal/strata-dsv41`。API 返回的 `engine: ds4-0.1` 是内部标识，不是发行版本。
- 单请求、六专家 Full quality、`DS4_ENGRAM_THREADS=2`，文本输入；API `http://127.0.0.1:8086/v1`，仅本机访问。默认 262144 tokens，输入与输出共享；可切换 32K／128K／256K。
- Pi provider `strata-deepseek`、模型 `deepseek-v4.1-flash`，文本输入、256K 窗口、每轮最多 32768 输出。Pi 无思考算术实测返回 `391`，thinking off 正确映射为 API none；该 smoke 关闭了 Pi 工具、扩展等能力。[Pi 原始记录](../../assets/perf-14/evidence/pi-smoke.json)。
- 直接 API 的函数调用另测通过：`report_number` 参数为 `{"value":391}`，回送工具结果后继续对话得到 `DONE`。这是 API 工具往返验证，不是 Pi 工具测试。[API 工具原始记录](../../assets/perf-14/evidence/tool-roundtrip.json)。

## 实测性能与长上下文

三次无思考英文短生成都输出 256 tokens，均由输出上限截断：

| 配置与运行状态 | 短输入 tokens | TTFT | 生成 token/s | 总耗时 |
|---|---:|---:|---:|---:|
| 初始 32K 暖进程、长输入测试前 | 42 | 2.487s | 15.0 | 19.524s |
| 256K 长输入测试之后的新短请求 | 38 | 9.995s | 2.3 | 119.434s |
| 重启 256K 进程后的新短请求 | 42 | 6.714s | 4.6 | 62.484s |

证据：[初始 32K](../../assets/perf-14/evidence/short-generation-32k.json)、[256K 长窗后](../../assets/perf-14/evidence/short-generation-256k.json)、[256K 重启后](../../assets/perf-14/evidence/short-generation-256k-fresh.json)。各样本的窗口、运行历史、提示词和内存状态不同，是非受控观察，不能据此认定掉速由 context 上限、热节流或某个特定 bug 导致；输出截断也不作为内容完整性或综合能力评分。

下表的 TTFT、预填和生成速度均来自首次长输入检索请求；缓存跟进另列说明。

| 配置窗口 | 真实输入 tokens | 三处检索／跟进 | TTFT | 预填 token/s | 生成 token/s |
|---|---:|---|---:|---:|---:|
| 32K（32768） | 30,705 | 3/3 通过；跟进通过并复用缓存 | 92.548s | 331.9 | 11.6 |
| 128K（131072） | 129,000 | 3/3 通过；跟进通过并复用缓存 | 384.916s | 335.3 | 10.6 |
| 256K（262144） | 260,078 | 3/3 通过；跟进通过并复用缓存 | 957.087s | 271.8 | 5.2 |

三档测试均在合成记录约 10%、50%、90% 位置放置三个随机码，首次输入无缓存，全部找回。32K／128K／256K 首次分别生成 44／41／42 tokens；256K 首次请求总耗时 965.115s。缓存跟进结果如下：

| 配置窗口 | 跟进真实输入 tokens | 缓存复用 tokens | 跟进 TTFT | 生成 token/s |
|---|---:|---:|---:|---:|
| 32K | 30,774 | 30,748 | 1.662s | 15.1 |
| 128K | 129,066 | 129,040 | 1.926s | 11.5 |
| 256K | 260,145 | 260,119 | 2.284s | 7.6 |

各跟进只重读 26 tokens，不能把整段输入除以这个短延迟当成预填速度。上一轮回答已包含随机码，因此跟进验证会话延续和缓存复用，不是第二次独立长文检索。原始证据：[32K](../../assets/perf-14/evidence/long-32768-20261028-234910-947945.json)、[128K](../../assets/perf-14/evidence/long-131072-20261028-235311-357133.json)、[256K](../../assets/perf-14/evidence/long-262144-20261029-000256-587890.json)。

## 内存与结果边界

启动日志估计其他程序占用约 40–44GB 匿名内存，因此专家常驻预算低于计划估算的约 69GB：32K 为 45.37GB 专家，128K 为 48.73GB，256K 为 49.49GB；256K 启动日志另报其他程序约 40.0GB 匿名内存、缓存 0.24GB。各次启动时其他程序状态不同，这些是引擎预算／分配日志，不能用来推断更大窗口减少内存，也不是模型总 RSS、实测峰值或系统总占用。上游速度实测时还同跑了约 60GB 的闲置 Qwen 服务，不能称为“空闲机器”。部分专家和 Engram 从 SSD 按需读取，文件大小也不是常驻 RAM。[32K 引擎日志](../../assets/perf-14/evidence/engine-32k-initial.log)、[256K 引擎日志](../../assets/perf-14/evidence/engine-256k.log)。

全系统 swap 的时点观察：初始 32K 短生成前后均为 14.50M；128K 整轮结束为 530.06M；256K 长输入测试前／中／末为 530.06／540.00／572.00M。随后长窗后的短生成阶段观察到约 8850–8866M，保存读数为 **8866.38M（约 8.66GiB）**；重启 256K 后的短样本前／后为 8834.38／8826.38M，仍约 **8.62GiB**。因此 572M 只是前一阶段读数，不能作为整个测试的最终 swap 占用。这些是 sysctl 的全系统读数，不是模型进程峰值，不能把全部增长归因于 DeepSeek，也不能声称全部测试无换页。[128K 结束](../../assets/perf-14/evidence/swap-after-128k.txt)、[256K 前](../../assets/perf-14/evidence/swap-before-256k.txt)、[中](../../assets/perf-14/evidence/swap-during-256k.txt)、[末](../../assets/perf-14/evidence/swap-after-256k.txt)、[后续短请求后](../../assets/perf-14/evidence/swap-after-post-long-short.txt)、[重启样本前后](../../assets/perf-14/evidence/short-generation-256k-fresh.json)。

各性能点仅一次采样；本轮通过范围是特定合成检索与会话延续，后续已观察到明显性能变化，持续性能稳定性尚未通过验收。未完成满窗输出、综合质量或内存峰值监测，不能外推一般长文推理能力。上游 Mac 文档只实测至约 32K；此处 128K／256K 结论来自以上本机原始记录。[上游 Mac 文档](https://github.com/Niko1221/Strata/blob/main/docs/DEEPSEEK_MAC.md)。

## 历史操作、复现与证据

以下是测量时的命令形态，退役后不作为当前服务入口。Pi 命令只证明普通客户端往返；API 工具往返另测。归档中没有发布全局 Pi 配置或凭据。

```sh
~/local_llms/strata/deepseek/start.sh
~/local_llms/strata/deepseek/status.sh
~/local_llms/strata/deepseek/smoke.sh
~/local_llms/strata/deepseek/stop.sh
pi --provider strata-deepseek --model deepseek-v4.1-flash
```

[长输入脚本](../../assets/perf-14/source/long_context.py) 保留记录生成、计数、SSE、超时和跟进判定算法，仅将私有根目录改为 `Path.home() / 'local_llms'`。重放必须先另行安装匹配权重／运行时并启动匹配窗口，再从各 JSON 的 `input.replay` 读取 seed 与 target。原请求、SSE、期望码、原始输出和实际 tokens 均保留；没有发布 257GB 权重、slot 二进制缓存或完整个人会话。

[下载证据 ZIP](../../assets/perf-14/deepseek1017-m5max-evidence.zip) · [证据目录说明](../../assets/perf-14/README_CN.md) · [SHA256 清单](../../assets/perf-14/SHA256SUMS.json) · [来源与公开变换](../../assets/perf-14/publication-provenance.json)。准备日志只公开包含环境、包与 pack 的摘录，完整本机日志的 SHA256 保留在来源清单中。

## 2026-10-29：用户验收与退役请求

用户阅览结果后明确认为该模型不适合本机，并要求保存报告到 `llm-test-reports`、push 后再删除模型，以及撤销 Pi／Strata 中该 DeepSeek 的配置，同时保留 Strata 与 Qwen Flash Next。此前 9/9 隐藏码找回和 3/3 缓存跟进通过的事实保留；其通过范围不能推翻用户对等待、速度和系统资源代价的否定评价。

首次归档时，主线程尚待报告推送后执行卸载，因此初版未提前声称已删除、已释放空间或 Qwen 已验收。下方有日期的完成附记记录后续操作，并保留本报告的测量结论。

## 2026-10-29：退役完成与 Qwen 可用性验证

完整报告与证据到达远端提交 `bfff8e2f31c82af7b9a459c9ec63676eb7642811` 后，才删除 DeepSeek 权重、其 Pi provider、Strata 三档窗口设置及对应运行时／slot 缓存组件。删除范围为 41 个顶层路径、106 个文件，合计 **257252688366 bytes 逻辑数据（257.25GB／239.585GiB）**。这是文件逻辑大小总和，不是 SSD 实际释放容量测量。完整删除收据含私人本机路径，不予公开；[精简退役记录](../../assets/perf-14/evidence/retirement-completion.json) 保留相关事实。

全部 Qwen 文件大小与选定配置组件的 SHA256 均与删除前基线一致，Pi settings 逐字节不变。Qwen 服务加载 `qwen3.8-flash-next-iq3_s`，引擎 `0.1.52-metal`，context 262144，单个 serving slot，vision enabled／available，本机端口 8085。在 **2026-10-29T10:38:45.920896+00:00**，直接 API 算术与原 Pi `strata` provider 均返回 `391`。DeepSeek provider 已缺席，8086 端口关闭。[Qwen 冒烟证据](../../assets/perf-14/evidence/qwen-retained-smoke.json)。

这里仅确认删除后的可用性。未重测视觉质量、Pi 工具、长文行为或性能；smoke JSON 中保留的 timings 属于附带诊断，不构成新的 Qwen benchmark。

发布修正：初次提交 `bad8f452e7be6dda0e477268bcaa4695ce5dcd45` 因仓库 ignore 规则漏入 14 个已审查的日志文件，Pages workflow 失败。后续提交 `bfff8e2f31c82af7b9a459c9ec63676eb7642811` 显式补齐，且 [Pages workflow 40859039500](https://github.com/leoli-dev/llm-test-reports/actions/runs/40859039500) 成功。删除前已将全部必需报告／证据文件与提交树核对，字节相符。本次发布修正没有改变冻结测量或其哈希。

## 发布处理

采用显式白名单，逐项保留本机原文件 SHA256 与公开文件 SHA256。私人 home 路径统一为 `$HOME`，报告链接改为仓库相对路径；复现脚本只改私有根路径。公开 GitHub／Hugging Face 链接与不标识私人网络主机的 loopback 地址保留。未发布 `before/`、`private/`、原始 Pi `models.json`／备份、客户端 auth、权重和运行缓存。完整中英翻译保留测量值、失败、未定位原因和人工介入；退役决定是新增日期更新，没有静默改写过去通过的检索结果。
