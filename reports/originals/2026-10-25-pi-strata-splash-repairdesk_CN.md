# RepairDesk：Pi × Strata／Splash 复杂项目完整比较报告

[English](2026-10-25-pi-strata-splash-repairdesk.md) | [简体中文](2026-10-25-pi-strata-splash-repairdesk_CN.md)

实验时系统：macOS 27.0.1 (26A434)，arm64；推理与客户端均为本机 M5 Max，18 CPU / 40 GPU，128 GiB。依据原实验configs/host.json，不用当前工作站版本替代历史记录。

CAP-03 · 本机执行2026-10-25，America/Toronto；报告生成2026-10-25T21:13:36.388667+00:00。只有一次配对实验，未公开发布。

## 结果与判断

本次较适合从 **Strata版本继续开发**：开发38.16分钟，比Splash50.89分钟少12.73分钟；固定完成度79/80对77/80，程式码质量14/20对10/20。两边都能启动并完成主要工作流程，但不能用总分抵消已重现的高严重度缺陷。监督者没有修补任何候选实作。

| 部署 | 开发分钟 | 独立API | UI /20 | 完成度 /80 | 质量 /20 | 附加总分 /100 |
|---|---|---|---|---|---|---|
| strata | 38.16 | 30/30 | 19 | 79 | 14 | 93 |
| splash | 50.89 | 29/30 | 19 | 77 | 10 | 87 |

Strata的资料交易边界较可靠、HTTP/domain分层较清楚；不足是冲突后清空输入、schemaVersion型别验证漏项，以及一项自写竞态测试不稳定。Splash画面资讯密度较好，但存在历史booking备份无法还原、audit失败后业务资料仍已提交、汇入ID造成stored XSS、返回清单坏掉等实际问题。

**两边共通问题**：隔离HTTP探针带不可信Origin及text/plain仍可执行破坏性汇入。这证明入口未验证来源/媒体型别；不是所有浏览器与Private-Network政策下的完整跨站攻击实验。两边缺少登入并不单独扣分，因题目明确是本机工具；评审针对实际接受的破坏性请求。

## 项目与公平性

私有新题[BRIEF.md：BRIEF.md](../../assets/evidence/cap-03-evidence.zip)：维修工坊营运台，SQLite持久化、版本CRUD、库存预留/结案扣帐、两棚UTC半开区间排程、审计、原子汇入汇出、中文响应式介面。Python标准库＋原生HTML/CSS/JS，无外部套件下载。不是引用现成开源实作，也没有将旧项目源码交给模型。

目录依用户原文建立于`~/Code/qwen3.8_tests/2026-10-25-repairdesk-comparison/`（底线），没有覆盖旧`qwen3.8-tests`。两边相同空白Git基线、相同BRIEF、四段预定提示、各60分钟总开发预算；同一Pi session连续完成四阶段。工具read/bash/edit/write，禁用MCP/扩充/skills/提示模板/继承context文件，禁止外部AI、网路与对方/评测器源码。这是指令与记录审计，并非OS级沙箱。

先Strata后Splash，单一大型模型载入，其他一般背景程式没有由监督器关闭。模型启动、冒烟及10秒基线不算开发时间；思考、工具、测试、自修、压缩都算。安全上限3600秒、800工具起始或200000输出token；两边都自行完成，没有撞到上限。

[PLAN.md：PLAN.md](../../assets/evidence/cap-03-evidence.zip)与初版API评测/需求于正式开发前提交`33e236e`。评测器自测5/5。其后对未约定的DOM/option值与非同步等待假设做一致修正，并保留v1/v2/v3原始结果；详见[评测器变更记录：scoring/evaluator-change-log.md](../../assets/evidence/cap-03-evidence.zip)。两边最终快照冻结后才开始独立验收；隐藏结果未回馈模型，没有best-of重抽或失败样本替换。

## 实际模型、工具与上下文

| 项目 | Strata | Splash |
|---|---|---|
| 基础模型/量化 | Qwen3.8-Flash-Next GSQ-RCO IQ3_S | Qwen3.8-27B MLX affine8 |
| 引擎 | Terminal0.2.6 / Control0.1.51 / 正式Metal0.1.50 | Splash1.4.0，source1482f6b |
| 框架 | Pi1.4.0 | Pi1.4.0 |
| Pi / 原生context | 262144 / 262144 | 262144 / 262144 |
| 每轮上限 / 思考 | 32768 / medium | 32768 / medium |
| 实际送出采样 | temperature1 / top_p.95 / top_k20 | temperature1 / top_p.95 / top_k20 |
| 最大实际输入 | 162672 | 124477 |
| 自发压缩 / 重启 | 0 / False | 0 / False |
| 自生成截图视觉输入 | 3张独立图片；历史请求重复携带99次 | 0张；使用DOM/CDP检查 |
| 最终源码SHA | 8ef8a5f4c7206f4953d495ed351f051916fefacd | 1de5c3088520f9beeeb5ff7ef67a35dbfeaf2908 |

主机M5 Max 18CPU/40GPU、128GiB统一记忆体，macOS27.0.1 build26A434；Node22.23.1、Python3.14.7。两边Pi模型宣告和原生服务状态均实际核对256K；Strata此项目实际超过128K输入，Splash本次未超过128K。不能把设定256K说成两边都跑满256K。

同样开放read图片与GPU视觉，Strata自行读取3张自己生成的画面，Splash没有读图；不是监督者额外提供提示。medium相同标签不代表相同计算量。权重沿用既有已验证安装，本轮保存路径/大小/设定而不重算整份权重SHA；实际引擎二进位hash与BUILD已存[configs：configs/](../../assets/evidence/cap-03-evidence.zip)。Strata审计source clone与正式binary的commit不同，以实际binary的hash/BUILD为准。

这是不同基础模型、精度、推理加速与引擎的**完整系统比较**，不能据此归因为某个引擎或IQ3/8bit的单因素胜负。

## 用时与执行成本

| 阶段 | Strata 分钟 | Splash 分钟 |
|---|---|---|
| domain/API | 11.25 | 13.01 |
| booking/audit/backup | 6.90 | 14.50 |
| UI | 12.14 | 18.55 |
| 整合收尾 | 7.87 | 4.83 |

| 指标 | Strata | Splash |
|---|---|---|
| 开发wall分钟 | 38.16 | 50.89 |
| LLM请求 | 126 | 58 |
| assistant输出token（含思考等） | 122489 | 101779 |
| 工具开始 / error flags | 137 / 3 | 65 / 5 |
| 未闭合工具 | 0 | 0 |
| LLM API错误 | 0 | 0 |
| 首模型事件中位秒 | 0.38 | 2.32 |
| 原生decode加权tok/s | 78.31 | 43.32 |

wall使用单调时钟，包含框架和工具。首模型事件截止非空思考/正文/工具delta，排除空role事件，不能当成最终答案TTFT；多数请求有前缀重用，不是冷启速度。decode用本请求SSE的predicted_n/累计predicted_ms加权，包含思考/工具生成。两服务prompt_n口径不能直接对齐，因此不把原生prefill速率作横向排名。工具error flag包含开发中的测试失败/清理中断，与LLM API错误不同。

Splash服务载入14.18秒另记；Strata测试开始前已ready，没有对称冷启动实验，不能拿载入秒数排名。Splash冒烟实际约8.15秒、Strata4.81秒，各是同一工具任务的写档/读回/JSON三项检查，均3/3；不是三道独立能力样本。服务切换明细见[service-switches.json：raw/service-switches.json](../../assets/evidence/cap-03-evidence.zip)。

## 系统压力与记忆体

| 开发期采样指标 | Strata | Splash |
|---|---|---|
| 约1秒样本数 | 2274 | 3032 |
| 原生RSS峰 GiB | 53.57 | 15.32 |
| 原生footprint峰 GiB | 21.92 | 45.12 |
| Pi＋工具树RSS峰 GiB | 1.40 | 1.24 |
| 全局GPU在用记忆体峰 GiB | 63.70 | 46.35 |
| 全机CPU均值 % | 7.30 | 5.61 |
| 全局GPU busy均值 % | 72.31 | 88.04 |
| swap增长峰 GiB | 0.00 | 0.00 |
| 压力分布 | {'normal': 2274} | {'normal': 3032} |
| 采样错误 | {} | {} |

RSS会包含mmap驻留文件页，footprint/Metal堆的归帐方式不同；Pi树的共享页也可能重复计数。以上数字与全局GPU记忆体互相重叠，**不可相加，也不能只用RSS断言哪边总RAM较少**。GPU/CPU为全机计数，包含背景活动和模型自己的浏览器/测试。采样峰不是瞬时精确峰。温度与Strata分配器高水位未取得，保留不可得；不宣称没有热降频。

两边所有开发期样本均normal、swap没有增加，未触发资源停止条件。刻意停止/重载发生在候选之间和最后恢复，不算成自发重启。

## 独立功能验收

| API项 | Strata | Splash |
|---|---|---|
| A01 | PASS | PASS |
| A02 | PASS | PASS |
| A03 | PASS | PASS |
| A04 | PASS | PASS |
| A05 | PASS | PASS |
| A06 | PASS | PASS |
| A07 | PASS | PASS |
| A08 | PASS | PASS |
| A09 | PASS | PASS |
| A10 | PASS | PASS |
| A11 | PASS | PASS |
| A12 | PASS | PASS |
| A13 | PASS | PASS |
| A14 | PASS | PASS |
| A15 | PASS | PASS |
| A16 | PASS | PASS |
| A17 | PASS | PASS |
| A18 | PASS | PASS |
| A19 | PASS | PASS |
| A20 | PASS | PASS |
| A21 | PASS | PASS |
| A22 | PASS | PASS |
| A23 | PASS | PASS |
| A24 | PASS | PASS |
| A25 | PASS | PASS |
| A26 | PASS | PASS |
| A27 | PASS | FAIL |
| A28 | PASS | PASS |
| A29 | PASS | PASS |
| A30 | PASS | PASS |

每项2分、30项60分；用独立临时DB/真实HTTP，涵盖版本、错误原子性、字面搜寻、库存竞争、状态机、半开时间区间、重启、备份、路径保护。完整案例名称见PLAN。Splash A27失败保留为0：booking→in_progress→done→export→import收到422，没有替换输入或修补程式。

| UI项 | Strata /2 | Splash /2 |
|---|---|---|
| U01 | 2 | 2 |
| U02 | 2 | 2 |
| U03 | 2 | 2 |
| U04 | 2 | 2 |
| U05 | 2 | 1 |
| U06 | 2 | 2 |
| U07 | 1 | 2 |
| U08 | 2 | 2 |
| U09 | 2 | 2 |
| U10 | 2 | 2 |

UI最终采v3＋有证据的人工裁定：[review.json：scoring/review.json](../../assets/evidence/cap-03-evidence.zip)。Strata U07因冲突清空日期给1；Splash U05编辑/开始/完成可行但返回清单失效给1；Splash U09原受返回缺陷连带影响，独立新页重验键盘/labels/验证提示全过给2，不重复扣分。两边额外实际验证零件更新与取消流程皆过。所有v1/v2/v3与补充测试保留，未改候选源码。

使用`/Applications/Chromium.app/Contents/MacOS/Chromium`，未使用Google Chrome或chrome channel；1440px桌面及390px手机版。两边无pageerror、无外部资产请求，390px页面无横向溢出，标题XSS字串以文字显示。但该题只覆盖title，不能抵消另一路径已重现的Splash汇入ID stored XSS。

## 程式码质量：逐项评审

| 维度 /5 | Strata | Splash |
|---|---|---|
| correctness | 4 — 固定API30/30，audit故障可回滚；仍接受错误schemaVersion型别，冲突后遗失表单日期。 | 2 — 核心CRUD/库存/排程可运作；但自己汇出的历史booking不能还原，audit失败留下已提交资料，返回清单坏掉。 |
| security | 3 — 参数化SQL、静态目录边界、DOM文字渲染较完整；但接受不可信Origin及text/plain破坏性汇入。 | 2 — SQL与静态路径有防护，但汇入ID进入未转义HTML属性，已重现stored XSS；亦接受不可信Origin/text/plain汇入。 |
| architecture | 4 — CLI／HTTP／domain分离，测试共用支援码；850行service与797行JS仍偏大。 | 3 — 1214行app.py以区段/类别组织，能阅读但验证、DB、HTTP集中一档；商业交易与audit的抽象边界错置。 |
| tests_docs | 3 — 测试面广、文件诚实列限制；108项复验107过，一项竞态测试错误假定预留一定胜出，重跑10次仅6过。 | 3 — 69项复验全过，负例矩阵实质；未提交浏览器测试器，漏掉历史booking往返、audit故障及清单返回问题。 |

Strata后端：60行CLI＋257行HTTP＋850行domain；Splash为1214行app.py。前端JS797/638行。行数不直接给分；评分依责任边界、交易一致性、实际缺陷和可重跑测试。两边都有真实SQLite/HTTP测试与详细README，并非只有静态画面。

### 已重现/定位的问题

**S01 · strata · medium：排程冲突后清空日期**

失败分支呼叫refreshAfterMutation→reloadCurrentOrder→renderBookingForm，以伺服器尚无booking的空值覆盖表单；保留使用者草稿即可修正。 [strata/static/app.js:461](../../assets/evidence/cap-03-source-review.txt) · [证据：scoring/strata/browser-v3/results.json](../../assets/evidence/cap-03-evidence.zip)

**S02 · strata · low：schemaVersion型别验证不足**

Python的True==1及1.0==1使错误型别也成功汇入；需要明确检查整数且排除bool。 [strata/workshop/service.py:658](../../assets/evidence/cap-03-source-review.txt) · [证据：scoring/diagnostics.json](../../assets/evidence/cap-03-evidence.zip)

**S03 · strata · medium：竞态测试假定固定胜者**

同版本的开始与预留竞争，任一方胜出都合法；测试却一律要求有预留。复验107/108；此项重跑10次6过4失败，不能拿一次108全绿当稳定保证。 [strata/tests/test_phase4_audit.py:72](../../assets/evidence/cap-03-source-review.txt) · [证据：scoring/strata/flaky-test-repeats.json](../../assets/evidence/cap-03-evidence.zip)

**P01 · splash · high：备份拒绝自身汇出的历史预约**

export保留closed order的booking，validate_backup却拒绝inactive order；建立booking→in_progress→done→export→import会422。应允许历史booking并只对active项套用占用检查。 [splash/app.py:301](../../assets/evidence/cap-03-source-review.txt) · [证据：scoring/splash/api/A27/http.jsonl](../../assets/evidence/cap-03-evidence.zip)

**P02 · splash · high：商业写入与audit非同一交易**

transaction(work)先commit，audit之后才另写；注入audit INSERT失败后POST零件500，但零件已留在DB。应将audit纳入同一BEGIN IMMEDIATE交易。 [splash/app.py:493](../../assets/evidence/cap-03-source-review.txt) · [证据：scoring/diagnostics.json](../../assets/evidence/cap-03-evidence.zip)

**P03 · splash · high：汇入ID造成stored XSS**

data-id直接插入未转义id。汇入合法字串型别但含引号/onclick的工单ID，开详情再点开始按钮，Chromium实际弹出注入alert；应使用DOM属性赋值或完整属性转义。Strata同一探针没有执行。 [splash/static/app.js:181](../../assets/evidence/cap-03-source-review.txt) · [证据：scoring/splash/id-xss-v2/result.json](../../assets/evidence/cap-03-evidence.zip)

**P04 · splash · medium：返回清单未还原DOM状态**

renderOrderDetail把orders-list设为display:none，返回仅清detailId再renderOrdersView，未清旧detail/还原list。新页可用、开过详情后清单不可见；需同步还原两区。 [splash/static/app.js:499](../../assets/evidence/cap-03-source-review.txt) · [证据：scoring/splash/manual-ui-v2/result.json](../../assets/evidence/cap-03-evidence.zip)

**B01 · both · high：不可信Origin/text/plain汇入被接受**

两边只解析JSON内容，未核对Origin或Content-Type。隔离HTTP探针带不可信Origin及text/plain仍200并清空测试零件。这证明入口防护缺失；未宣称已完成所有浏览器/Private-Network政策下的真实跨站攻击。建议限制来源及JSON媒体型别，必要时使用本地操作token。 [strata/workshop/http_app.py:152](../../assets/evidence/cap-03-source-review.txt) · [证据：scoring/cross-origin.json](../../assets/evidence/cap-03-evidence.zip)

### 自写测试与独立验收不同

Strata作者最后一轮记录为108/108；监督者对冻结副本复验107/108。失败的混合竞态测试错误要求预留必胜，实际开始或预留任一胜出都合法；单项10次6过4失败。这是测试缺陷，不是把合法业务结果判成资料错误，也不称作者先前108全过是捏造。Splash69/69复验通过，但没有覆盖此次备份/故障/XSS缺陷。自写测试数量不当作模型间的共同分母。

故障注入以SQLite trigger令audit INSERT失败：Strata500且零件未建立；Splash500但零件存在。schemaVersion=true与1.0：Strata200、Splash422。汇入ID点击XSS在两轮Chromium诊断重现于Splash，Strata没有执行。另做排程ID探针没有执行脚本，阴性结果亦保留。这些后续诊断不重写固定30项API分数，属于预定的质量评审证据。

### Agent操作风险

两边都有按命令字串pkill的清理；Strata用特定port，Splash还使用更广的`app.py --host`及`remote-debugging-port`。这种清理没有PID/cwd/启动时间归属检查，可能波及无关开发/侦错程序；没有证据确认实际误杀了用户程序，亦不隐瞒风险。它是执行行为，另列于[process-cleanup-audit.json：scoring/process-cleanup-audit.json](../../assets/evidence/cap-03-evidence.zip)，没有暗中混入源码评分。监督器的模型服务切换及临时app清理由所属服务/PID/cwd/启动时间核验。

## 画面与可用性

观察最终实际截图：Splash侧栏、KPI与紧凑横向操作列的资讯密度较好；Strata上方导览、较大留白和直列卡片较简单。两边手机版均可用，没有以外观偏好直接加分。Splash返回清单缺陷、Strata冲突后失去日期则是有操作证据的可用性问题。

| Strata | Splash |
|---|---|
| [桌面](../../assets/figures/cap-03-strata-desktop-final.png) | [桌面](../../assets/figures/cap-03-splash-desktop-final.png) |
| [390px](../../assets/figures/cap-03-strata-mobile390.png) | [390px](../../assets/figures/cap-03-splash-mobile390.png) |
| [独立流程：scoring/strata/manual-ui-v2/result.json](../../assets/evidence/cap-03-evidence.zip) | [独立流程：scoring/splash/manual-ui-v2/result.json](../../assets/evidence/cap-03-evidence.zip) |

## 审计、限制及交付

证据/设定/来源完整性核查 **22/22**，此数字不是功能通过率。两份原始项目、验证副本及BRIEF hash相同；全局Pi设定digest未变；两边原始码未被监督者修正。[audit.json：audit.json](../../assets/evidence/cap-03-evidence.zip) · [完整性证据：scoring/final-integrity.json](../../assets/evidence/cap-03-evidence.zip)。

评审者知道候选身分，不是盲评。只有一个项目、每边一轮、固定Strata先后Splash，时间/视觉策略亦不同；不提供无意义的单样本信赖区间。结果限于此硬体、部署、Python/原生前端题与预算；不外推所有编程、量化忠实度、真实多人负载或通用256K推理。没有测PPL/KL。

测试在字节不变的Git archive副本执行；所有DB为测试资料，没有使用真实客户资料或接触真实外站。当前Strata原生262144 ready、in_flight0；Splash停止，恢复最初服务状态。两边全局Pi条目原本已为256K，未修改其他provider/default。

项目启动（各用不同port与自己的DB）：

```sh
cd ~/Code/qwen3.8_tests/2026-10-25-repairdesk-comparison/strata
python3 app.py --host 127.0.0.1 --port 4101 --db "$PWD/demo.sqlite"
# 另一終端
cd ~/Code/qwen3.8_tests/2026-10-25-repairdesk-comparison/splash
python3 app.py --host 127.0.0.1 --port 4102 --db "$PWD/demo.sqlite"
```

`../strata/`（源代码仅保留本机，未发布） · `../splash/`（源代码仅保留本机，未发布） · [复现说明：reproduce.md](../../assets/evidence/cap-03-evidence.zip) · [结果CSV：results.csv](../../assets/evidence/cap-03-evidence.zip) · [完整JSON](../../assets/evidence/cap-03-summary.json) · [证据ZIP：evidence.zip](../../assets/evidence/cap-03-evidence.zip) · [逐档SHA256：evidence-manifest.json](../../assets/evidence/cap-03-evidence.zip)。原始本机实验的artifacts各候选目录保留完整Git历史bundle；本报告仓库仅收入源代码hash/审查摘录，不包含完整产品源代码或bundle。

## 归档与公开证据版说明（2026-10-25）

本次仅加入报告仓库并做本地commit，没有push、部署或发布两个产品仓库。原评测没有重跑，分数、失败、人工裁定和限制保留。中英全文配对；源代码、命令与原始截图保持证据语言。原本绝对文件链接改为源代码审查摘录/带成员路径的ZIP证据链接；完整代码保留在原实验的独立仓库中。

本页证据是重新整理的公开安全版，不是原始39,095,476字节本地ZIP：排除完整Pi会话、模型消息/完整SSE、私有配置/凭据、模型权重/缓存、运行DB和完整产品源码；保留协议、评测器、请求计时/用量元数据、原始数值资源列、验收/诊断、失败、源码hash和截图。账户目录统一为`/Users/benchmark`，完整进程列表/原生状态省略，数值摘要不改；脚本占位路径需按本机调整。[转换与hash记录](../../assets/evidence/cap-03-publication.json)。

[整理证据ZIP](../../assets/evidence/cap-03-evidence.zip)：1510710字节、441个条目，SHA256 `c2c1cfa08546526642d536f9e53770760ece05484ab8c0a9b4eab23560fb86ab`。内部manifest逐档校验并读回确认；原始报告SHA256 `ab308e32cf1c80666d5244906f7cf6ccefb9327a883257ab22f680d3273ade4f`，原评测归档提交`fe5bf41`。

## 原始界面截图

### Strata 桌面 / 390px

![Strata desktop](../../assets/figures/cap-03-strata-desktop-final.png)

![Strata mobile390](../../assets/figures/cap-03-strata-mobile390.png)

### Splash 桌面 / 390px

![Splash desktop](../../assets/figures/cap-03-splash-desktop-final.png)

![Splash mobile390](../../assets/figures/cap-03-splash-mobile390.png)

[双语数值与源代码保真检查](../../assets/evidence/cap-03-localization-audit.json) · [归档构建及Chromium检查](../../assets/evidence/cap-03-archive-checks.json)。

证据整理另移除Git作者/提交者的本机个人署名；commit ID、提交信息与源码hash保留，转换记载在ZIP内publication.json。
