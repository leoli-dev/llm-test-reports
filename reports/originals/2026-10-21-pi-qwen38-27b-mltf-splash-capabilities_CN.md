# Pi能力考试：Qwen3.8-27B 8bit 在 MLTF 与 Splash 上的表现

[English](2026-10-21-pi-qwen38-27b-mltf-splash-capabilities.md) | [简体中文](2026-10-21-pi-qwen38-27b-mltf-splash-capabilities_CN.md)

CAP-01 · 本机测试开始于2026-10-21，America/Toronto。主测18题、8领域、36个会话，另有独立评分的8个32K输出视觉补充会话。这是选题子集与本地适配，不是任何所引benchmark的官方全量分数。

## 2026-10-21更新：视觉好坏交由用户评判

按用户要求，所有成功渲染的2D/3D产物须截图供用户查看。**用户视觉评价待补充。** 下文此前的助手rubric判分保留为历史预评，不代表用户认可的质量评分或偏好。此前32K补充2D领域分数（MLTF 50.00 / Splash 94.44）均应按此理解。文件交付、执行成败单独记录；8K主测分数不变。

| 评审编号 | 题目 / 引擎 | 实际Chromium截图 | 用户评价 |
|---|---|---|---|
| A | SVG-02 长箱座钟 / MLTF | [完整截图](../../assets/figures/cap-01-32k-mltf-svg-02.png) | 待补充 |
| B | SVG-02 长箱座钟 / Splash | [完整截图](../../assets/figures/cap-01-32k-splash-svg-02.png) | 待补充 |
| C | SVG-01 太阳系 / Splash | [完整截图](../../assets/figures/cap-01-32k-splash-svg-01.png) | 待补充 |

截图在下文完整展示，来自模型原始产物，没有修图。MLTF的SVG-01未交付文件；所有3D提交均未形成有效项目或渲染图，因此没有场景截图可评。缺文件、执行失败仍照实记录，但不作为对成品美观度的用户评分。收到用户反馈后单独署明来源记录，保留此前助手评审历史。

## 8K主测评分与解释

| 领域（总分等权） | 题数 | MLTF | Splash |
|---|---|---|---|
| 数学 | 3 | 100.00 | 66.67 |
| 编程 | 3 | 66.67 | 66.67 |
| 2D SVG作图 | 2 | 0.00 | 0.00 |
| 3D场景生成 | 2 | 0.00 | 0.00 |
| 逻辑推理 | 2 | 100.00 | 100.00 |
| 科学知识 | 2 | 100.00 | 100.00 |
| 指令遵循 | 2 | 100.00 | 100.00 |
| 长上下文检索 | 2 | 100.00 | 100.00 |
| 总分：八领域均值 | 18 | 70.83 | 66.67 |

零分可能来自未交付、预算截断或执行失败，不等于对已交付作品的视觉评价。每轮8,192输出token上限由本次考试方案选定；用户要求的是128K上下文，并未指定该输出上限。每题0–100分，总分对八领域均值等权，因此三题的数学/编程不会比两题的领域权重更大。精确答案、严格格式、执行测试与主观视觉rubric区分列出。主测每引擎每题仅一个随机会话，不提供置信区间或通用引擎智力排名；未衡量公开数据训练污染。

| 引擎 | 已交付源文件的产物题 | 计划产物题 | 正常stop结束会话 | 触及length会话 |
|---|---|---|---|---|
| mltf | 3 | 7 | 13 | 4 |
| splash | 2 | 7 | 12 | 6 |

敏感性检查：排除受人工中断影响的CODE-03配对、仍对八领域等权后，MLTF为75.00，Splash为70.83。主分仍保留全部计划题目与已核对的MLTF交付文件。

## 主机与固定配置

| 项目 | 记录值 |
|---|---|
| 推理主机 | 本机MacBook Pro / Apple M5 Max / 18 CPU / 40 GPU / 128 GiB |
| 实验时系统 | macOS 27.0.1 (26A434), arm64 |
| Pi | 1.3.0；实际CLI、全新会话；保留全局默认模型 |
| MLTF | 0.1.2 / packed q8c |
| Splash | 1.4.0 / 1482f6bbc2abf12375332725302019594150b6cb / MLX affine8 input |
| 源target | mlx-community/Qwen3.8-27B-8bit @ 815b83c0df8ffd1d1b5244cf75fd6ef14fca9ef9 |
| Draft源 | incoai/Qwen3.8-27B-DFlash2 @ 015e795645c74b1a0eeef3b570031fb62e769bc5；与MLTF打包来源的原始权重相同 |
| 上下文/输出预算 | 131072 context / 8192 per model turn |
| 采样与思考 | temperature=1, top_p=.95, top_k=20, reasoning_effort=medium |
| 内存/KV/缓存 | 96 GiB上限、INT8 KV、每题重新启动引擎；关闭SSD前缀缓存 |
| 生成工具 | 精确/文本题无工具；文件题仅受限read/write，最多三轮，不提供验收反馈 |
| Blender | 5.1.2 / 出厂空白启动；要求Cycles CPU最多32采样；推理结束后验收 |

两端来自同一8bit源checkpoint，但打包/加载、状态、数值及采样路径可不同。Splash使用默认自动ANE计划；native状态、来源及前后快照归档。128K限制相同不代表逐bit一致执行，推理采样未指定固定seed。转发前核对实际请求字段，不记录认证头。

## 考题准备与评分规则

完整题包和答案/rubric在修改Pi模型、调用推理前冻结为本地提交77eea8d。证据包包含QUESTION_BOOK、exam.json、prompt哈希、来源版本及评分器。原始prompt保留其源语言；SVG题为明确需求的本地改写；合成检索受RULER启发，不是官方生成器。

| 题目 | 领域/题名 | 来源/适配 |
|---|---|---|
| MATH-01 | 数学 / 代数 / 多项式插值 | [来源](https://huggingface.co/datasets/HuggingFaceH4/MATH-500/blob/6e4ed1a2a79af7d8630a6b768ec859cb5af4d3be/test.jsonl#test/intermediate_algebra/1197.json) · 数学事实改述，数值与参考答案不变，增加最终答案标记。 |
| MATH-02 | 数学 / 数论 / 真因子之和 | [来源](https://huggingface.co/datasets/HuggingFaceH4/MATH-500/blob/6e4ed1a2a79af7d8630a6b768ec859cb5af4d3be/test.jsonl#test/number_theory/737.json) · 数学事实改述，数值与参考答案不变，增加最终答案标记。 |
| MATH-03 | 数学 / 几何 / 平行四边形 | [来源](https://huggingface.co/datasets/HuggingFaceH4/MATH-500/blob/6e4ed1a2a79af7d8630a6b768ec859cb5af4d3be/test.jsonl#test/geometry/627.json) · 数学事实改述，数值与参考答案不变，增加最终答案标记。 |
| CODE-01 | 编程 / HumanEval/24 / largest_divisor | [来源](https://github.com/openai/human-eval/blob/b9453e8f1865df0a0057a1383767caa400acfbcf/data/HumanEval.jsonl.gz) · 原题保留，仅增加本地文件交付要求。 |
| CODE-02 | 编程 / HumanEval/129 / minPath | [来源](https://github.com/openai/human-eval/blob/b9453e8f1865df0a0057a1383767caa400acfbcf/data/HumanEval.jsonl.gz) · 原题保留，仅增加本地文件交付要求。 |
| CODE-03 | 编程 / HumanEval/145 / order_by_points | [来源](https://github.com/openai/human-eval/blob/b9453e8f1865df0a0057a1383767caa400acfbcf/data/HumanEval.jsonl.gz) · 原题保留，仅增加本地文件交付要求。 |
| SVG-01 | 2D SVG作图 / 太阳系示意图 | [来源](https://github.com/johnbean393/SVGBench/blob/55c1cde8bf03b63d385c931e95bd7f728cde8fde/questions/questions.json) · 参考原题意图本地改写，明确需求并固定画幅；非官方SVGBench分数。原仓库未声明许可，不公开其完整原始题集。 |
| SVG-02 | 2D SVG作图 / 3:00长箱座钟 | [来源](https://github.com/johnbean393/SVGBench/blob/55c1cde8bf03b63d385c931e95bd7f728cde8fde/questions/questions.json) · 参考原题意图本地改写，明确需求并固定画幅；非官方SVGBench分数。原仓库未声明许可，不公开其完整原始题集。 |
| SCENE-01 | 3D场景生成 / 城市广场与喷泉沙盘 | [来源](https://huggingface.co/datasets/Qwen/BlenderWorld/tree/e67837a78e2d963447bc1b147db42f46bc6ef07f/bw_0115) · 保留MIT原题与加权二元rubric；本地脚本交付、Blender 5.1.2及最多32采样CPU渲染替代官方4.2.10多agent流程，仅报告rubric分，不含官方整体评审。 |
| SCENE-02 | 3D场景生成 / 北欧黄铜台灯 | [来源](https://huggingface.co/datasets/Qwen/BlenderWorld/tree/e67837a78e2d963447bc1b147db42f46bc6ef07f/bw_0150) · 保留MIT原题与加权二元rubric；本地脚本交付、Blender 5.1.2及最多32采样CPU渲染替代官方4.2.10多agent流程，仅报告rubric分，不含官方整体评审。 |
| LOGIC-01 | 逻辑推理 / 五个对象的逻辑推断 | [来源](https://github.com/suzgunmirac/BIG-Bench-Hard/blob/9ee07bd481feebf959a6b59d61ea57bdcf30964d/bbh/logical_deduction_five_objects.json) · 保留原题，仅增加本地答案交付格式。 |
| LOGIC-02 | 逻辑推理 / 日历推理 | [来源](https://github.com/suzgunmirac/BIG-Bench-Hard/blob/9ee07bd481feebf959a6b59d61ea57bdcf30964d/bbh/date_understanding.json) · 保留原题，仅增加本地答案交付格式。 |
| SCIENCE-01 | 科学知识 / 物理 / MMLU-Pro validation 10 | [来源](https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro/tree/b189ec765aa7ed75c8acfea42df31fdae71f97be) · 选公开validation中的物理首题与生物第二题，保留10个选项和答案；API快照及哈希已冻结，不是完整或test split的MMLU-Pro准确率。 |
| SCIENCE-02 | 科学知识 / 生物 / MMLU-Pro validation 21 | [来源](https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro/tree/b189ec765aa7ed75c8acfea42df31fdae71f97be) · 选公开validation中的物理首题与生物第二题，保留10个选项和答案；API快照及哈希已冻结，不是完整或test split的MMLU-Pro准确率。 |
| FOLLOW-01 | 指令遵循 / IFEval 1021 | [来源](https://github.com/google-research/google-research/tree/3bbd8fbea969c2ebee2bcce61711b5cd32b5ec32/instruction_following_eval) · 保留原始prompt，对所选指令执行本地确定性严格检查，不是官方IFEval汇总实现。 |
| FOLLOW-02 | 指令遵循 / IFEval 1075 | [来源](https://github.com/google-research/google-research/tree/3bbd8fbea969c2ebee2bcce61711b5cd32b5ec32/instruction_following_eval) · 保留原始prompt，对所选指令执行本地确定性严格检查，不是官方IFEval汇总实现。 |
| LONG-01 | 长上下文检索 / 多键检索 / 约64K输入 | [来源](https://github.com/NVIDIA/RULER/tree/c3f5e3b4f87f97e048793bb510a3a6b19a46bf3a) · 受RULER启发自行生成的固定seed多键检索题，非官方生成器或官方分数；报告实际套模板后的token计数，文件名仅代表近似目标长度。 |
| LONG-02 | 长上下文检索 / 多键检索 / 约120K输入 | [来源](https://github.com/NVIDIA/RULER/tree/c3f5e3b4f87f97e048793bb510a3a6b19a46bf3a) · 受RULER启发自行生成的固定seed多键检索题，非官方生成器或官方分数；报告实际套模板后的token计数，文件名仅代表近似目标长度。 |

数学与选项题使用确定性精确核对。HumanEval使用原测试加固定seed的边界/随机oracle案例，全部通过才得100，否则0；测试通过比例仅作诊断，不作主分，也不是HumanEval+。IFEval使用针对所选指令的本地严格检查；MMLU-Pro取自公开validation例题。检索按五个精确键值对评分。

产物必须实际交付。已交付的Python/Blender脚本在限定时间和隔离读写/网络下原样执行，监督者不修作品、不向模型反馈。静态SVG在关闭JS和网络的Chromium中渲染。Blender按原始importance权重的二元rubric结合渲染与场景检查评分，不使用官方整体质量/多agent评审；SVG使用冻结的等权清单。视觉分由本监督Codex助手逐项提供依据，V标签匿名展示，但监督者能访问映射，因此不属于独立或完全盲评。

## 逐题结果与实际交付

| 题目 | MLTF得分 | Splash得分 | 首请求输入tokens | MLTF上游秒 | Splash上游秒 | MLTF思考 / 总输出tokens | Splash思考 / 总输出tokens |
|---|---|---|---|---|---|---|---|
| MATH-01 | 100.00 | 0.00 | 197 | 103.24 | 152.95 | 5889 / 6297 | 8192 / 8192 |
| MATH-02 | 100.00 | 100.00 | 193 | 7.83 | 12.46 | 290 / 486 | 512 / 785 |
| MATH-03 | 100.00 | 100.00 | 206 | 24.63 | 10.41 | 1129 / 1394 | 370 / 543 |
| CODE-01 | 100.00 | 100.00 | 738 | 9.75 | 6.92 | 185 / 369 | 100 / 261 |
| CODE-02 | 100.00 | 100.00 | 1094 | 42.56 | 54.29 | 701 / 1792 | 1049 / 2120 |
| CODE-03 | 0.00 | 0.00 | 812 | 不完整 | 194.31 | ≥5408 / ≥5660 | 8192 / 8192 |
| SVG-01 | 0.00 | 0.00 | 803 | 154.58 | 209.48 | 8192 / 8192 | 8192 / 8192 |
| SVG-02 | 0.00 | 0.00 | 802 | 238.79 | 249.32 | 8192 / 8192 | 8192 / 8192 |
| SCENE-01 | 0.00 | 0.00 | 940 | 284.98 | 284.65 | 8192 / 8192 | 8192 / 8192 |
| SCENE-02 | 0.00 | 0.00 | 1093 | 256.04 | 246.62 | 8192 / 8192 | 8192 / 8192 |
| LOGIC-01 | 100.00 | 100.00 | 297 | 3.63 | 3.45 | 155 / 161 | 97 / 138 |
| LOGIC-02 | 100.00 | 100.00 | 265 | 3.22 | 1.68 | 82 / 152 | 49 / 81 |
| SCIENCE-01 | 100.00 | 100.00 | 287 | 3.50 | 3.79 | 106 / 202 | 99 / 185 |
| SCIENCE-02 | 100.00 | 100.00 | 308 | 7.98 | 7.78 | 258 / 508 | 195 / 479 |
| FOLLOW-01 | 100.00 | 100.00 | 190 | 40.78 | 36.77 | 1526 / 1944 | 1532 / 1876 |
| FOLLOW-02 | 100.00 | 100.00 | 183 | 29.10 | 30.55 | 64 / 925 | 64 / 887 |
| LONG-01 | 100.00 | 100.00 | 65556 | 149.74 | 148.31 | 169 / 242 | 262 / 335 |
| LONG-02 | 100.00 | 100.00 | 119359 | 310.76 | 313.38 | 177 / 253 | 185 / 261 |

输出总tokens包含思考和所有模型轮次；中断请求缺终端usage时仅列下界（≥）。上游时间不含代理模板/token预检及服务启动；多轮总时长不是解码吞吐。证据中的首模型事件包含reasoning/tool delta，不能与PERF-09/10的首非空最终正文TTFT混淆。Pi wall含客户端/收尾开销，中断时长标为不可用。

| 编程题 | 原始测试通过 | 固定seed附加检查通过 | 主分 |
|---|---|---|---|
| CODE-01 / splash | True | 211/211 | 100.00 |
| CODE-01 / mltf | True | 211/211 | 100.00 |
| CODE-02 / mltf | True | 120/120 | 100.00 |
| CODE-02 / splash | True | 120/120 | 100.00 |
| CODE-03 / splash | N/A | N/A/N/A | 0.00 |
| CODE-03 / mltf | False | 15/202 | 0.00 |

## 失败与人工干预

| 记录 | 得分 | Pi stop | 请求错误 | 评分依据 |
|---|---|---|---|---|
| MATH-01 / splash | 0.00 | length | [] | {'expected': '\\frac{3}{56}', 'extracted': ''} |
| CODE-03 / splash | 0.00 | length | [] | Required artifact missing |
| CODE-03 / mltf | 0.00 | toolUse | ["BrokenPipeError(32, 'Broken pipe')"] |  |
| SVG-01 / mltf | 0.00 | length | [] | Required artifact missing |
| SVG-01 / splash | 0.00 | length | [] | Required artifact missing |
| SVG-02 / splash | 0.00 | length | [] | Required artifact missing |
| SVG-02 / mltf | 0.00 | length | [] | Required artifact missing |
| SCENE-01 / mltf | 0.00 | length | [] | Required artifact missing |
| SCENE-01 / splash | 0.00 | length | [] | Required artifact missing |
| SCENE-02 / splash | 0.00 | length | [] | Required artifact missing |
| SCENE-02 / mltf | 0.00 | length | [] | Required artifact missing |

监督者排查agent_settled之后Pi收尾延迟时，中断与进程进入MLTF CODE-03发生竞态，打断了该会话写文件后的回应。answer.py已完整写出，按同会话write工具载荷逐字节核对后照常验收，但会话完成/计时标为中断。Splash CODE-03没有交付文件，保留length失败。恢复时短暂放错目录的副本在评分前依据工具日志纠正；主测没有重新推理或替换样本；后来由用户要求的32K视觉补充作为独立阶段。控制器事件、原始trace与产物哈希保留，此干预限制了干净的agent完成率比较。

后续仅在当前Pi子进程发出agent_settled并等待三秒后收尾；生成参数与考题不变。预算截断、错误、缺文件及渲染失败均保留在分母中；没有修正模型答案或场景。

## 同输入与执行核对

| 题目 | 首请求token ID一致 | 输入计数 |
|---|---|---|
| MATH-01 | True | [197, 197] |
| MATH-02 | True | [193, 193] |
| MATH-03 | True | [206, 206] |
| CODE-01 | True | [738, 738] |
| CODE-02 | True | [1094, 1094] |
| CODE-03 | True | [812, 812] |
| SVG-01 | True | [803, 803] |
| SVG-02 | True | [802, 802] |
| SCENE-01 | True | [940, 940] |
| SCENE-02 | True | [1093, 1093] |
| LOGIC-01 | True | [297, 297] |
| LOGIC-02 | True | [265, 265] |
| SCIENCE-01 | True | [287, 287] |
| SCIENCE-02 | True | [308, 308] |
| FOLLOW-01 | True | [190, 190] |
| FOLLOW-02 | True | [183, 183] |
| LONG-01 | True | [65556, 65556] |
| LONG-02 | True | [119359, 119359] |

仅首请求应一致，后续工具轮次包含各自不同的模型产物。128K为配置容量，不是每道短题的长度；长输入实际计数见表。后台负载与温控未控制，保留逐秒native/frontend/system CPU、全局GPU、压力/swap和status，重叠统一内存口径不相加；不为速度差指定单一原因。

| 引擎 | native分配器峰值GiB | native进程footprint峰值GiB | 前端footprint峰值GiB | 全局GPU内存峰值GiB | 全局压力状态 |
|---|---|---|---|---|---|
| mltf | 34.02 | 5.50 | 0.60 | 31.37 | normal |
| splash | 34.28 | 35.16 | 0.60 | 36.24 | normal |

这些数值是各引擎逐题推理阶段1秒采样观测的最大值，口径不同，不能相加；Metal/统一内存分配未必计入native进程footprint。全局GPU内存、压力及swap含后台应用；完整逐题首尾swap和CPU/GPU采样可下载。

## 可视产物与rubric依据

固定8,192输出token预算内，两端均未交付SVG或Blender源文件，因此未进行视觉渲染或主观逐项判分。八个视觉题会话按冻结的未交付规则记0分。本轮因而不能比较2D/3D成品质量；见下方另列的32K输出补充轮。

## 独立32K输出视觉补充轮

两端在主测输出预算下未交付视觉产物后，用户明确要求追加更大预算补充轮。题包提交2aaf3f6在补充推理前冻结相同四题及rubric字节，后续协议提交66908c6 / 3a3eb3a规定主测结束后串行启动并记录Pi更新。每引擎每道视觉题各新增一次会话，仅生成参数中的每轮max_tokens由8192提高到32768；context仍131072，medium思考、采样、工具/轮数限制、1800秒会话时限、引擎重启策略、渲染限制与评分标准相同。主测推理结束后实际Pi两入口提高到32768输出，全局默认仍为MTPLX。主测分数不覆盖；这是由已观察失败触发的预算后续试验，不是独立盲测复现。

| 补充领域 | MLTF | Splash |
|---|---|---|
| 2D SVG作图 | 50.00 | 94.44 |
| 3D场景生成 | 0.00 | 0.00 |

Pi还会自动向系统消息注入`<cwd>`工作目录元数据。补充阶段使用独立的固定目录，比主测首输入多7个token（例如SVG-01：803对810）。冻结题目与中性系统文件不变，每阶段内两端收到相同输入，但跨预算阶段的实际系统消息不是逐字节一致。这是额外的跨阶段差异，不能把一切变化都归因于输出上限；补充轮全程保留该固定目录，没有替换推理样本。

执行器修正5a94013发生在任何3D补充输出、全部产物执行之前：将最初过窄的导入短名单改为题干允许的标准库集合。未修改模型源文件、冻结题目、答案或rubric，当时尚未执行任何产物。

在补充轮出答案前，操作说明a40ab28统一规定：对原文“约/大约”的物理尺寸使用10%容差，按场景单位及世界坐标下的求值几何核对；原二元标准中的各项仍须同时满足。SVG-01 R01另要求光芒，而改写题干只明确要求发光太阳；保留并披露这一不充分说明，下面另列排除R01后的敏感性分数。

| SVG-01引擎 | 冻结严格分数 | 排除R01的敏感性分数 |
|---|---|---|
| mltf | 0.00 | 0.00 |
| splash | 88.89 | 100.00 |

当length截断导致工具参数不完整时，Pi可在同一会话内发出工具错误消息，请模型重发完整调用。这是预设三轮限制内的普通工具反馈，不是监督者修代码，也不是benchmark验收反馈；所有这些轮次、输出token和时延均计入。

| 补充会话 | 分数 | Pi stop | 首请求输入tokens | 思考 / 总输出tokens | 上游秒 | 交付源文件 |
|---|---|---|---|---|---|---|
| SVG-01 / mltf | 0.00 | length | 810 | 32768 / 32768 | 788.86 | — |
| SVG-01 / splash | 88.89 | length, toolUse, stop | 810 | 28095 / 43118 | 1025.44 | image.svg |
| SVG-02 / splash | 100.00 | toolUse, stop | 809 | 16905 / 24788 | 670.81 | image.svg |
| SVG-02 / mltf | 100.00 | length, toolUse, stop | 809 | 30599 / 43088 | 1176.95 | image.svg |
| SCENE-01 / mltf | 0.00 | length | 947 | 32768 / 32768 | 1018.31 | — |
| SCENE-01 / splash | 0.00 | toolUse, stop | 947 | 12296 / 19163 | 577.77 | scene.py |
| SCENE-02 / splash | 0.00 | toolUse, toolUse, stop | 1100 | 13849 / 18089 | 546.53 | scene.py |
| SCENE-02 / mltf | 0.00 | toolUse, stop | 1100 | 8724 / 12298 | 349.41 | scene.py |

| 补充题目 | 首请求token ID一致 | 输入计数 |
|---|---|---|
| SVG-01 | True | [810, 810] |
| SVG-02 | True | [809, 809] |
| SCENE-01 | True | [947, 947] |
| SCENE-02 | True | [1100, 1100] |

### 32K补充 / mltf / SVG-01

交付/执行门槛失败：`Required artifact missing`

### 32K补充 / splash / SVG-01

![32K splash SVG-01](../../assets/figures/cap-01-32k-splash-svg-01.png)

| 标准（源rubric） | 权重 | 通过 | 依据（原始判分记录） |
|---|---|---|---|
| 中央有发光太阳及光芒 | 1 | False | 太阳居中且有发光光晕，但没有独立可辨的放射线条，未满足冻结标准中额外的光芒要求。 |
| 八大行星的轨道距离顺序正确 | 1 | True | 水星至海王星分别位于八条嵌套太阳轨道，内外次序正确。 |
| 朝向太阳的一侧受光、背向一侧有阴影 | 1 | True | 各行星有独立明暗渐变，亮部焦点朝向中央太阳；例如地球受光方向为左下方。 |
| 八条各自独立的椭圆轨道 | 1 | True | 八条独立同心椭圆构成行星轨道，与小行星带和彗星路径相区分。 |
| 行星相对大小层级合理 | 1 | True | 木星为最大行星，随后为土星及冰巨星，类地行星均明显更小，大小层级合理。 |
| 地球/月球、火星极冠、木星风暴和土星环可识别 | 1 | True | 地球有陆地、云纹和附近月球；火星有白色极冠，木星有条带与红色风暴，土星有可见星环。 |
| 九个标签清晰可读并带引线 | 1 | True | 太阳和八大行星名称均清晰、分开排布，并有细引线连接。 |
| 小行星带位于火星与木星之间 | 1 | True | 点状小行星带位于火星轨道外、木星轨道内。 |
| 深色星空及尾部背离太阳的彗星 | 1 | True | 背景为深色星空；右上彗星尾部向外延伸，背离中央太阳。 |

判分备注（原文）：严格按冻结的光芒措辞，仅R01未通过。改写题干要求发光太阳但未明确要求放射线条，排除这一不充分说明项后为100/100；已结合渐变几何核对渲染受光方向。

### 32K补充 / splash / SVG-02

![32K splash SVG-02](../../assets/figures/cap-01-32k-splash-svg-02.png)

| 标准（源rubric） | 权重 | 通过 | 依据（原始判分记录） |
|---|---|---|---|
| 座钟位于房间内窗边 | 1 | True | 钟体立于左侧窗边，墙地交界和地板条明确构成室内空间。 |
| 桃花心木外壳有木纹、顶饰、钟罩、长箱及底座 | 1 | True | 红棕桃花心木观感的外壳具有细木纹与节疤、顶饰、圆顶钟罩、玻璃长箱和造型底座。 |
| 罗马数字钟面，时针指III、分针指XII | 1 | True | 罗马数字钟面上的分针竖直指XII，较短时针水平指III，符合3:00。 |
| 窗外日光与方向一致的长地面影子 | 1 | True | 左窗可见太阳，地面受光与向右下伸出的长钟影在光照方向上相符。 |
| 透过玻璃可见处于右摆终点的黄铜钟摆 | 1 | True | 玻璃后钟摆杆与黄铜摆球向右倾斜，摆球位于所示摆弧右端。 |
| 三只链条悬挂的黄铜重锤，右侧一只较高 | 1 | True | 三只链条悬挂的黄铜重锤均可见，最右侧高于左侧和中间两只。 |
| 木、金属和玻璃的明暗材质与立体感有效 | 1 | True | 深木色轮廓与木纹、圆柱金属高光、半透明玻璃斜纹体现材质区分与体积感。 |

判分备注（原文）：七项冻结二元要求均满足。画面为风格化矢量插画，没有额外加入整体美感或照片真实度分数。

### 32K补充 / mltf / SVG-02

![32K mltf SVG-02](../../assets/figures/cap-01-32k-mltf-svg-02.png)

| 标准（源rubric） | 权重 | 通过 | 依据（原始判分记录） |
|---|---|---|---|
| 座钟位于房间内窗边 | 1 | True | 完整落地长箱钟位于大窗旁，背景有墙面和木地板，房间关系明确。 |
| 桃花心木外壳有木纹、顶饰、钟罩、长箱及底座 | 1 | True | 深暖棕色木壳可见木纹和节疤，顶饰、钟罩、玻璃长箱与宽底座齐全。 |
| 罗马数字钟面，时针指III、分针指XII | 1 | True | 钟面为罗马数字；长分针朝上指XII，短时针向右指III，读数为3:00。 |
| 窗外日光与方向一致的长地面影子 | 1 | True | 日光来自左窗，地板有光斑，钟体长影向右下延伸，方向一致。 |
| 透过玻璃可见处于右摆终点的黄铜钟摆 | 1 | True | 黄铜摆球位于悬点右侧、所画摆弧的右端，透过玻璃清晰可见。 |
| 三只链条悬挂的黄铜重锤，右侧一只较高 | 1 | True | 三只黄铜重锤分别悬于链条，右侧重锤明显高于其余两只。 |
| 木、金属和玻璃的明暗材质与立体感有效 | 1 | True | 木板与木纹、金属渐变高光、玻璃斜向反射共同区分三种材质，并形成纵深。 |

判分备注（原文）：七项冻结二元要求均满足。部分主罗马数字有叠写、拥挤，但3:00仍清楚；该分数不是整体艺术精致度评分。

### 32K补充 / mltf / SCENE-01

交付/执行门槛失败：`Required artifact missing`

### 32K补充 / splash / SCENE-01

交付/执行门槛失败：`Unchanged Blender source failed in transparent executor`

### 32K补充 / splash / SCENE-02

交付/执行门槛失败：`AssertionError('Unexpected scene import')`

### 32K补充 / mltf / SCENE-02

交付/执行门槛失败：`AssertionError('Unexpected scene import')`

## 3D执行失败与执行器诊断

所有3D提交均未产生有效Blender项目和渲染图。MLTF城市脚本未交付，保持0分。最初使用的blender-exec包装器会在Blender返回0时隐藏Python stderr，导致城市首执行没有可用Python回溯；该尝试、日志和评分快照均保留。随后本地执行器改用直接Blender 5.1.2、--factory-startup、相同空场景清理、--python-exit-code 1、完整stdout/stderr，并将Blender用户目录重定向到隔离工作区。原始代码字节未改，没有再次询问模型；重跑暴露了下表城市脚本错误，仍无有效交付。

两份台灯脚本均导入Blender自带bmesh，超出冻结题干字面的bpy/math/mathutils/标准库名单，因此严格导入门槛分保持0。另仅为诊断允许bmesh并原样执行两份脚本，结果均因原始API错误失败。探索性执行不替换严格分，也未提供修复后的视觉样本；保留所有执行尝试及未改源文件哈希。

| 会话 | 严格结果 | 原样执行依据 |
|---|---|---|
| Splash / SCENE-01 | 0 | scene.py:44/181：Base Color收到3分量RGB，Blender要求4分量，触发ValueError，未生成项目/渲染。 |
| Splash / SCENE-02 | 0 | 严格bmesh导入检查拒绝；允许bmesh后，scene.py:269的recalc_face_normals(..., direction=...)因无效关键字触发TypeError。 |
| MLTF / SCENE-02 | 0 | 严格bmesh导入检查拒绝；允许bmesh后，scene.py:90访问mix.outputs["Result"]，因输出不存在触发KeyError。 |

## 编程反例

MLTF交付的CODE-03使用abs(n)后的数字求和，忽略负号。原题例子[1, 11, -1, -11, -12]被稳定排序为[1, -1, 11, -11, -12]，而题目要求[-1, -11, 1, -12, 11]。原始测试组失败，附加检查仅通过15/202。该文件在已披露外部中断前完整写出；整个agent会话被中断仍属于试验边界。

## 评分图表与归档证据

![cap-01-domains.png](../../assets/figures/cap-01-domains.png)

![cap-01-tasks.png](../../assets/figures/cap-01-tasks.png)

[完整证据与题包](../../assets/evidence/cap-01-evidence.zip)包含主测及补充的冻结prompt、评分器、来源版本/许可、逐题Pi/native请求/SSE/结果、模型产物、执行日志、逐项判分、输入哈希、资源及干预记录。不含模型权重、私密模型配置/认证、个人会话或运行缓存。发布泛化文本证据中的用户/工作路径（必要时包括生成的源文件），逐文件列出本地原件与公开副本SHA256；本地生成源文件保持原样。二进制.blend若生成则留存本地、不放入公开ZIP，以免嵌入工作站路径；本轮没有有效.blend交付，仍提供原脚本与执行诊断。

边界：小型选题样本、随机medium思考及有限输出预算、公开数据污染未衡量、本地运行适配及主观视觉评分、一次写文件后的外部中断；不建立长会话、并发吞吐或通用智力排名。较高总分仅代表这套题包和配置下结果更好。
