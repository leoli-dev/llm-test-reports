# 独立评审：snowglobe-park vs noel-globe（Claude-mbp）

- 评审人：Claude-mbp（Claude Opus 5.5，本会话 reasoning effort = max）
- 候选：
  - **SG** = `leoli-dev/snowglobe-park` @ `2eee3d5`
  - **Noël** = `leoli-dev/noel-globe` @ `239e9bb`
- 状态：**独立初评，冻结于 2026-11-20T14:09Z**（未复核部分见 §6）。写成之前没有读过 Codex 的 `codex-review.md`、`report-en-draft.md` 和 `evidence/`。
- 证据目录：`<scratch>/claude-shots/`（81 张 JPEG + 4 个 JSON 运行日志）

## 0. 摘要（English summary first）

**EN.** Both candidates are real-time three.js snow globes that answer the same five-line task. They read the brief differently, and neither covers "every attraction and character" in a closed sense.

- **Noël** wins the first impression. Its castle, wheel, carousel and train are oversized so they fill the globe, so the park reads instantly. It is a polished page layout with a good phone flow, and photos persist in IndexedDB. Weather and day/night changes are subtle at the default view, and the park stays brightly lit at night. In 4 of my 12 guide fly-to spot checks the camera ended inside geometry or behind an obstacle.
- **SG** covers more of the brief. It has 8 weathers with snow build-up and a shake-the-globe effect, a dramatic day/night cycle with lit windows, stars and castle projection, zoom-to-cursor from the room down to street level, and a real tilt-shift "miniature" photo mode. Its roster is larger. The default frame shows the park small inside a big sky. It has two reproduced or confirmed input bugs: name labels swallow mouse-wheel zoom (medium), and a global Space shortcut overrides buttons that have keyboard focus (medium). Its photo album lives in memory only.
- Recommendation by priority (no total score): pick **Noël** for instant legibility, page polish and persistent photos. Pick **SG** for breadth of controllable weather and day/night, extreme continuous zoom and tilt-shift photography. SG needs the two input fixes first.

**中文。**
- 两者都是浏览器实时绘制的 three.js 玻璃球，都回应了同一段 5 行任务，但对任务的理解不同。“一个不能少”没有封闭的全集，两边都不应宣称完全达标。
- **Noël 第一眼更好懂、更好看**：地标被放大，填满了玻璃球；页面信息结构清楚，手机端体验好，相册能持久保存。
  - 问题：默认视角下天气和昼夜的变化很弱，夜里园区仍然像白天一样亮；图鉴飞行抽查 12 项里有 4 项镜头穿进几何体或被前景挡住。
- **SG 对需求的覆盖更广**：8 种天气，积雪会累积，还能摇一摇；昼夜有灯窗、星空和城堡投影；能从桌面无级缩放到街道视角，缩放跟随光标；缩微模式是真正的移轴摄影；图鉴条目更多。
  - 问题：默认构图里乐园在球里显得很小；名称标签会吞掉滚轮事件（中，已复现）；全局空格快捷键会盖掉按钮的键盘激活（中，静态确认）；相册只存在内存里。
- **条件化推荐**：看重“立即看懂、页面完成度、照片持久保存”选 Noël；看重“天气/昼夜的可控范围、极大范围的连续缩放、移轴缩微摄影、条目覆盖”选 SG，但应先修上面两个输入缺陷。

## 1. 利益冲突与独立性

- **SG 是我在本会话里按该任务生成的作品**，评审模型与 SG 的生成模型相同，所以我对 SG **无法盲评**。Codex 读过两边 README 里的模型署名，也不是盲评。
- 为压低偏差，我做了三件事：
  - 先按 Codex 提出的五个维度（核心需求、默认与近景视觉、交互与拍照流程、稳定性与性能、工程/可复现/无障碍）定好检查清单；
  - 两边跑同一套场景脚本，**只通过各自的 UI 操作**（点击、拖动滑块、滚轮），只在记录日志时读取 SG 的相机距离；
  - SG 的缺陷照实列出，包括 Codex 发现、我已复核的两条。
- 冻结前没有读 Codex 的任何结论或证据文件。

## 2. 出处与生成事实（只陈述可证事实）

1. **共享任务正文**：两边 README 引用的 5 行任务正文逐字相同。
2. **原始首条消息不同**：
   - SG 生成时，用户首条消息的第一行是“在本folder下新建一子文件夹，在里面用 js 来构建一个 3D 圣诞玻璃球”。比 README 多了“在本folder下新建一子文件夹，在里面”这个前缀，其余 4 行相同。README 中的 5 行写法是用户在第三轮指定的。
   - Noël 原始消息的取证由 Codex 完成（据 Codex：开头多一句开场白，并且同样带建子文件夹的前缀）。这一点我无法独立核实。
   - 因此这是**最终发布作品的对照，不是严格的单变量模型实验**。
3. **SG 生成环境**：
   - 模型 `claude-opus-5-5`，reasoning effort = max；
   - 客户端是 Orca 里的 Claude Agent SDK / Claude Code 会话，推理走 Anthropic API（云端），服务端细节不可见；
   - 会话环境只自报 Platform darwin、OS Version Darwin 27.2.0，没有 build 号；
   - token 数与用时**未记录**。文件 mtime 只是不可靠的近似值，不计入效率比较。
4. **SG 生成过程**：
   - 构建期间用户没有插话或改代码，也没有从头重试。模型自己在 Thorium headless 里反复截图、修正、重建。
   - 用到的外部能力：Artifact 发布工具和 artifact-capabilities 技能（照片下载能力）。另有一个 impeccable 设计 hook，在写 `body.html` 时自动提示过一次 `<img>` 缺 `src`，已改。
5. **SG@2eee3d5 是最终发布快照**，不是第一次输出。它包含第二轮（用户要求发 GitHub）中模型做的改动：
   - 达菲一家挪离卡通城入口门柱；
   - og 标签和 favicon；
   - `serve`/`media` 脚本；
   - README、LICENSE 与 Pages workflow。
   这些都不是人工改动。
6. **Noël 的署名**：README 写 Model GPT-6.2-Astra、Thinking level High。我只引用 README，不推断它的 token 数和用时。

## 3. 环境与方法

| 项 | 值 |
| --- | --- |
| 浏览器 | Thorium 156.0.8078.28，headless，`--use-angle=metal --enable-gpu --ignore-gpu-blocklist`（未用 Chrome） |
| GPU | ANGLE Metal Renderer: Apple M5 Max（此前探测） |
| 被测构建 | Codex 在 `http://127.0.0.1:8462/{snowglobe-park,noel-globe}/dist/index.html` 提供；我用 `git archive <commit>` 导出源码与之逐文件比对，`src/`（Noël 另加 `index.html`）**完全一致** |
| 视口 | 桌面 1440×900，手机 390×844，DSF 1 |
| 脚本 | `scratchpad/eval/run.mjs`（不在候选仓库里）。两边场景相同：首帧 → 默认 → 天气 → 昼夜 → 滚轮缩放 → 图鉴计数与 12 项抽查 → 烟花/巡游 → 缩微拍照 → 无障碍静态探针 → 手机视图 |
| 日志 | `claude-shots/{sg,noel}-log.json`、`claude-shots/{sg,noel}-m-log.json` |

说明：
- SG 的时间默认会自动流逝，测试前点了暂停；Noël 的时间是静态的。
- SG 在闲置 30 秒后会缓慢自转，所以 `sg-07..09` 的机位角度不同，这是设计如此。
- 我只做功能与视觉评估，性能由 Codex 统一做串行 ABBA，我不给性能结论。

## 4. 分维度评估（领先 / 相当 / 取舍）

### D1 核心需求完成度 —— 取舍（SG 在广度上领先，Noël 在默认可辨识度上领先）

| 子项 | SG | Noël | 判断 |
| --- | --- | --- | --- |
| JS 实时 3D | three.js，单文件构建 | three.js，Vite + standalone | 相当 |
| 球内天气可控 | 8 种（晴、多云、小雪、暴风雪、雨、雷雨含闪电雷声、雾、极光）；积雪可调并会随天气累积/融化；可以摇一摇（`sg-03..06`、`sg-10..12`、`sg-13`） | 4 种（晴天、飘雪、细雨、多云；雾只跟多云一起出现）；默认视角下差异主要在背景和细小粒子（`noel-03..06`） | SG 领先 |
| 昼夜可控 | 滑杆 + 时间流逝；冬季日月轨迹、星空、夜间灯窗、城堡投影、14:00/19:30 巡游、21:00 烟花（`sg-07..09`） | 精确到分钟的滑杆；07:30 与 16:54 在默认视角下几乎和夜晚一样暗（`noel-07..09`）；静态代码显示夜里环境光 ≥0.79、主光 ≥1.19，园区一直很亮 | SG 领先（范围与对比）；Noël 取舍（可读性优先） |
| 乐园可辨识 | 默认机位里乐园占球体比例小，要放大才看得清；条目 60 景点 / 82 人物 | 默认机位里城堡、摩天轮、木马、火车填满球体，一眼就能认；条目 47 / 62 | 取舍 |
| 代表性抽查（12 项：城堡、摩天轮、茶杯、矿山车、太空山类、小小世界、米奇、米妮、艾莎、胡迪、玲娜贝儿、史迪奇） | 11/12 主体清楚，史迪奇被树挡（`sg-21..32`）；但图鉴面板盖住了画面左侧约 1/4 | 约 7/12 清楚；灰熊山极速矿车的镜头进入了网格内部，小小世界和疯帽子旋转杯只拍到看不出主体的局部，米妮被花环柱挡住（`noel-17..28`；补间 0.82 秒，截图在 4.2 秒，已是最终位姿） | SG 领先 |
| 无级缩放 | 连续缩放，范围 1700 → 1.6（约 1060 倍），指向光标，可直达街道视角；**标签吞滚轮缺陷**（见 §5） | 连续缩放，0.5× → 27.8×，朝 orbit 目标点推进；街道视角靠步行模式 | 取舍 |
| 缩微模式拍照 | 移轴摄影：对焦带、模糊、饱和、玩具速度、自拍、日期印；照片为视口分辨率 1440×900；灯箱 + 下载（Thorium 触发了 download 事件）；相册只在内存 | “缩小成玩偶走进乐园”：WASD/方向键漫游，照片是画布快照 890×522、无移轴；存入 IndexedDB 相册（刷新后仍在），可下载 | 取舍（两种理解都成立） |
| 可访问的 link | GitHub Pages（另有一个私有 artifact） | GitHub Pages | 相当（由 Codex 核验） |

### D2 默认与近景视觉 —— 取舍

- **SG**：
  - 默认构图偏电影感：木质音乐盒底座、散景灯、礼物和灯串，玻璃反射与球内云层很有氛围；
  - 夜景对比强：城堡投影、灯窗、极光、烟花（`sg-09`、`sg-13`、`sg-33`）；
  - 近景人物是偏细长的玩偶造型，可辨识；
  - 缺点：默认机位下乐园偏小，球体大半被天空和云占据；建筑偏方块，屋顶噪点雪斑较显眼。
- **Noël**：
  - 默认画面一眼就是“迪士尼雪景球”：城堡精细、配色统一，Q 版人物头大、远看也认得出；
  - 页面是编辑感很强的卡片布局，完成度高；
  - 缺点：3D 画布只占页面一张卡片，沉浸感弱于全屏；默认视角下天气和昼夜的变化弱；几处近景镜头穿进几何体。

### D3 交互与拍照流程 —— 取舍

- **SG**：
  - 全屏控制坞、右侧缩放轨、图鉴（搜索、飞行、跟随移动物体）、名称标签、快捷键、摇一摇、烟花/巡游按钮，拍照流程完整（`sg-35`、`sg-36`）；
  - 问题：标签吞滚轮；全局空格快捷键；相册不持久；巡游正在进行时，“巡游”按钮只弹提示、不移镜头；拖动时间滑杆跨过 14:00 会静默启动巡游。
- **Noël**：
  - 造景台、图鉴、相册三段信息结构清楚；图鉴有主题区筛选；步行模式有屏幕方向键；相册持久保存，可下载（`noel-31..34`）；
  - 问题：图鉴飞行的落点质量不稳定。

### D4 稳定性与性能 —— 待 Codex 的数据

- 我的所有运行中，两边都是 0 个 pageerror、0 个 console error/warning。
- 就绪时间：SG 540 ms、Noël 459 ms，各跑一次、本地服务，**不是基准测试**。
- 性能结论以 Codex 的串行 ABBA 为准。

### D5 工程、可复现与无障碍 —— 相当（各有长短）

- **SG**：esbuild 单文件；README 写明 prompt 和模型；MIT 许可；GitHub Actions 自动构建并部署 Pages；带截图和配图脚本。
- **Noël**：Vite 构建 + standalone 脚本；Pages 从提交里的 `docs/index.html` 发布，没有 CI；有 THIRD_PARTY_NOTICES（three、Lucide）；package.json 许可为 ISC。
- **无障碍静态探针**：两边都设了 `lang="zh-CN"`，都有 `prefers-reduced-motion` 规则，可见控件里没有无名控件（SG 24 个、Noël 26 个）。Noël 用了原生 `<dialog>`。SG 的空格快捷键问题见 §5。

## 5. 缺陷清单（阻断 / 中 / 低；标注“复现”或“静态”）

两边都没有发现阻断级缺陷。

### SG

| 级别 | 缺陷 | 证据 |
| --- | --- | --- |
| 中 | **名称标签吞滚轮，缩放卡死**。标签 `#labels > .lbl` 为 `pointer-events:auto`，光标停在标签上时 wheel 事件到不了 canvas | **复现**：Thorium 1440×900，暂停时间并设为 12:00，光标放在 canvas 中心 (720, 495)，每 300 ms 一次 `wheel(deltaY=-260)`，共 30 次。`camera.dist` 依次为 529.3 → 360.9 → 245.8 → 167.4 → 114.0 → 111.5，之后 25 次都停在 111.4。`elementFromPoint` 返回 `div.lbl`“小镇广场圣诞树”。因为是指向光标的缩放，标签会一直留在光标下，用户必须移开鼠标。同一次主跑中 `zoom-in-6/12` 两帧相同（`sg-14`、`sg-15`）。canvas 旁边位置的对照，见 §6 复核 |
| 中 | **全局空格快捷键截获按钮焦点**。`keydown` 只放过 search/text/textarea/select，按钮获得焦点时按空格会执行“摇一摇”，并 `preventDefault` 掉按钮激活（Enter 不受影响） | Codex 复现；我**静态**确认于 `src/ui/ui.js` 的 `bindKeys` |
| 低 | 相册只在内存里，刷新后照片丢失（但能下载保存） | 静态 + 复现下载事件 `snowglobe-<ts>.jpg` |
| 低 | 相机没有碰撞检测，指向光标缩放到底时会进入建筑（`zoom-max` 只拍到一面粉墙） | 复现 `sg-19` |
| 低 | 把时间拖回白天后，烟花表演仍继续 | 复现 `sg-34`（14:00 仍有烟花爆点） |
| 低 | 巡游已在进行时，“巡游”按钮不移镜头；拖时间滑杆跨过 14:00/19:30 会静默启动巡游，导致本次巡游截图没拍到花车 | 复现 `sg-34`（需补拍，见 §6） |
| 低 | 桌面端选中图鉴条目后面板不收起，遮住画面左侧约 1/4 | 复现 `sg-23..32` |
| 低（主观） | 默认机位下乐园在球内占比小，需要放大才看得清 | `sg-02` |

### Noël

| 级别 | 缺陷 | 证据 |
| --- | --- | --- |
| 中 | 图鉴飞行落点不稳：12 项抽查中 4 项镜头穿进网格或被前景挡住（灰熊山极速矿车、小小世界、疯帽子旋转杯、米妮） | 复现 `noel-19`、`noel-20`、`noel-22`、`noel-24`；补间 0.82 秒，已是最终位姿 |
| 低–中 | 昼夜对比弱：默认视角下 07:30、16:54 与夜晚几乎一样；夜里园区光照仍然很高（环境光 ≥0.79、主光 ≥1.19），没看到灯窗类夜间效果 | 复现 `noel-07..09` + 静态 `scene.js time()` |
| 低 | 默认视角下天气差异细微 | 复现 `noel-03..06` |
| 低 | 本次没有拍到烟花。静态代码显示夜间每 4 秒一轮单发烟花，发射点在城堡上方 y≈5–6.7，可能是时机或取景问题 | `noel-29`，需复核 |
| 低 | 巡游条目飞到位后只拍到一个建筑表面的局部，没看到花车 | `noel-30`，需复核 |
| 低 | 缩放到底会进入城堡墙体 | 复现 `noel-14` |
| 低 | 照片是 890×522 的画布快照，没有缩微（移轴）效果；画布嵌在页面卡片里，尺寸较小 | 复现 `noel-33` |

## 6. 复核（冻结后补测，Codex 性能测试结束后进行）

冻结快照见 `claude-review-initial-frozen.md`。本节和 §6.2 是冻结之后追加的，日志在 `claude-shots/recheck-log.json`。

修订记录：2026-11-20T14:19Z，按 Codex 的意见收窄了 §6.3 和 §6.4 的性能措辞。原文是“Noël 约快 1.21 倍”和“更低的渲染开销”，这两句超出了 rAF 证据能支持的范围。结论方向不变，冻结稿没有改动。

### 6.1 补测结果

1. **SG 标签吞滚轮：确认，并有相邻 canvas 对照**（`recheck-sg-label-stuck.jpg`、`recheck-sg-label-control.jpg`）。
   - 光标在 (720, 495)，每 300 ms 一次 `wheel -260`，共 14 次：`dist` 最后停在 111.42，`elementFromPoint` = `div.lbl "小镇广场圣诞树"`。
   - 把光标上移 60 px 到纯画布（`#scene`）后继续滚轮：`dist` 111.42 → 77.60 → 52.90 → 36.04，随后下一个标签“中央花园·米奇雕像”来到光标下，又卡在约 35.2。
   - 结论：放大时标签会接连出现在光标位置，缩放会反复卡住。
   - Codex 独立复现：30 次后 `dist` 111.421291；移到 canvas 点 (40, 450) 再滚动 → 76.005987。
2. **SG 巡游：功能正常**。先把时间设为 13:54 再点“巡游”，镜头会飞到小镇大街；28 秒时圣诞雪橇花车（米奇和米妮）和玩具兵已走上大街（`recheck-sg-parade-12s/20s/28s.jpg`）。主跑中没拍到，原因是时间滑杆跨过 14:00 时巡游已自动开始，按钮只弹了提示。这条维持低级 UX 问题，不算功能缺失。
3. **Noël 取景问题：到位 5 秒后仍存在**。
   - 灰熊山极速矿车：画面被网格内部填满（`recheck-noel-grizzly-5s.jpg`，6.8×）；
   - 小小世界：只看到屋顶局部（`recheck-noel-smallworld-5s.jpg`，10.8×）；
   - 疯帽子旋转杯：画面里是红色横梁和小熊，看不到茶杯（`recheck-noel-teacups-5s.jpg`，10.5×）；
   - 米妮：被花环柱遮挡（`recheck-noel-minnie-5s.jpg`，19.8×）。
   - Codex 独立复现了灰熊山和小小世界两项。
4. **Noël 烟花：功能存在，但很小**。在默认全景下以 0.5 秒间隔连拍 8 张（`recheck-noel-home-night-1..8.jpg`，`prefers-reduced-motion` = false），第 3 张能看到城堡右上方一朵白色小烟花，第 4、5 张是余烬，与静态代码“夜间每 4 秒一轮单发”一致。用图鉴的“城堡夜空烟花”条目飞过去的 3 张连拍（`recheck-noel-fireworks-1..3.jpg`）没拍到爆点，烟花多半在取景框外。这条归为低级取景问题，不算未实现。
5. **Noël 巡游：仍未确认**。“圣诞星光巡游”条目飞到位后的 3 张（`recheck-noel-parade-1..3.jpg`）只拍到一座山体和 SALOON 建筑，没看到花车。静态代码里有巡游花车组和运动函数，所以记为“视觉上未确认”，不当作未实现。

### 6.2 归类修订（与 Codex 讨论后，保留原评级供对照）

| 条目 | 冻结稿 | 修订后 | 理由 |
| --- | --- | --- | --- |
| SG 标签吞滚轮 | 中 | **中（双方独立复现）** | 直接影响“无级缩放”这一核心交互 |
| SG 空格快捷键 | 中 | **低到中** | 取决于键盘用户；Enter 和指针仍可用。保留双方意见 |
| Noël 照片无移轴、画布偏小 | 低（列入缺陷） | **不列缺陷，算实现取舍** | 原 prompt 没有把“缩微”定义成移轴 |
| Noël 昼夜对比弱 | 低到中 | **视觉限制（风格），不是控制失效** | 正午确实明显变亮；问题在于夜里园区仍然很亮 |
| Noël 图鉴取景 | 中 | **中，限定为“评审视觉抽样 12 项中 4 项”** | 不推广为全图鉴通过率 |
| Noël 烟花 | 低（未拍到） | **低：取景问题**，烟花在全景下可见 | 见 §6.1 第 4 条 |
| Noël 巡游 | 低（未拍到） | **视觉上未确认**，不算未实现 | 见 §6.1 第 5 条 |
| reduced-motion | 两边都有 CSS 规则 | **Noël 的 JS 只对烟花生效；SG 只有 CSS** | 依据 `shows.js` 的 `matchMedia` |
| 缩放范围 | SG 1700→1.6 vs Noël 0.5×–27.8× | **按同一口径写**：两边都按“首页距离 / 当前距离”计算倍数。SG 实测 0.45×（缩出到 1700）到约 475×（缩入到 1.6，首页距离 760）；Noël 实测 0.5× 到 27.8× | 不再把代码距离界限和观测倍数直接相除比较 |
| 启动时间 | SG 540 ms / Noël 459 ms | 和 Codex 的 659 / 1749 **顺序相反**，两组判据不同，**不排序** | 单次样本，不是基准 |

### 6.3 性能（引用 Codex 的数据，我未测）

不限帧率、等画布 1280×800、DPR 1、ABBA×2：SG 平均 445.43 fps（430.44–470.79），Noël 平均 540.22 fps（520.44–575.99）。在这一个晴天正午场景里，Noël 的 rAF 吞吐均值约为 SG 的 1.21 倍。这不是 GPU 计时，也没有分开 CPU 和 GPU，两边的工作量也不相同，所以不能推出普遍的渲染效率优势。另外，这个场景没有进入缩微模式，SG 的移轴 pass 是关闭的（`src/fx/post.js:75`，只在 `src/ui/photo.js:71` 进入缩微时打开）。两边在默认 60 Hz 下都能跑满帧。

### 6.4 修订后的总体判断

- 冻结稿的**条件化推荐不变**：看重“立即看懂、页面完成度、持久相册、手机浏览”选 Noël（另外，在这次同像素晴天正午测试中，Noël 的 rAF 吞吐较高）；看重“天气/昼夜的范围、极大范围的连续缩放、移轴缩微摄影、园区与演出的广度”选 SG，前提是修好标签吞滚轮。
- 不设总冠军。

## 7. 条件化推荐

- 看重**第一眼就认出迪士尼、页面完成度、手机浏览、照片持久保存** → **Noël**。
- 看重**天气与昼夜的可控范围和戏剧性、从整颗球到街道的连续缩放、移轴缩微摄影、更大的条目覆盖、烟花/巡游/摇一摇这些玩法** → **SG**。前提是先修好“标签吞滚轮”和“空格快捷键”两个中级缺陷，并考虑把相册改成持久存储。
- 两边都没做到“一个不能少”的全集；条目数不等于独立建模，比较时应以抽查为准。
