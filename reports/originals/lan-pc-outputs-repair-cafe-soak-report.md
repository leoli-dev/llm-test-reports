Pi continuous development and long-context stress evaluation

# Pi × LAN Qwen continuous development and long-context stress evaluation

[English](lan-pc-outputs-repair-cafe-soak-report.md) | [简体中文](lan-pc-outputs-repair-cafe-soak-report_CN.md)

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Mac client; inference ran on a LAN PC |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | See original report; current snapshot does not fill missing historical configuration |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | Not recorded in the surviving test evidence; current OS is not substituted |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

2026-10-06 · Neighborhood Repair Café · Vite / React / TypeScript

**Continuous stress and recovery: 151.3 minutes.** Four development stages plus the near-128K control segment: 131.3 minutes; additional 64K recovery: approximately 20.1 minutes. Unexpected interface errors: 0; correctly rejected over-budget requests: 1; operator cancellations: 4; failed stress-period health checks: 0/302. Completed model requests: 161, including later ordinary wrap-up; stress requests: 124.

## Method and limits

The installed pi was the only product coding agent, using the user-provided LAN OpenAI-compatible API. Four stages ran in one session: core website, repair workflow, budgets and bulk operations, and regression delivery. The lead evaluator designed the task, stress proxy and independent acceptance checks without writing the product implementation.

Reproducible synthetic repair-case material was prepended to every request system message, raising input targets to 64,000, 96,000 and 122,000 tokens. The opening changed each time to reduce long-prefix cache reuse. The maximum generation budget was 6144 tokens, temperature=0 and reasoning\_effort=high. A 122K input plus output budget approaches the 131072 total-context limit; a 122K input is not called a 128K input. Actual server usage is authoritative; a local tokenizer from the same family only estimates and calibrates deviations.

This workload repeatedly prefills material, making it slower than ordinary agent development with reusable history caches. The long reference material is synthetic, not a real repository naturally growing to 128K. PC GPU, temperature and memory counters were not read, so this cannot rule out GPU/system memory leaks or establish multi-hour, multi-user stability.

## Request performance

| Stage | Completed requests | Actual input tokens | Median first-delta seconds | Median total seconds | Prefill tok/s | Generation tok/s |
| --- | --- | --- | --- | --- | --- | --- |
| phase1 | 34 | 63,485–64,243 | 41.01 | 49.98 | 1570.2 | 61.55 |
| phase2 | 30 | 90,771–95,905 | 60.97 | 74.6 | 1582.75 | 59.5 |
| phase3 | 24 | 112,609–121,929 | 79.46 | 89.25 | 1543.7 | 56.25 |
| phase4 | 9 | 116,943–123,930 | 77.11 | 87.88 | 1531.1 | 55.2 |
| near128k-readonly | 6 | 128,759–128,964 | 84.46 | 85.95 | 1537.55 | 52.15 |
| product-recovery | 21 | 63,634–64,257 | 41.04 | 46.44 | 1570.5 | 60.8 |

| Stage | Requests with cache hits | Maximum cached tokens | Output-budget exhaustions |
| --- | --- | --- | --- |
| phase1 | 0 | 0 | 0 |
| phase2 | 0 | 0 | 0 |
| phase3 | 0 | 0 | 0 |
| phase4 | 4 | 123818 | 0 |
| near128k-readonly | 0 | 0 | 0 |
| product-recovery | 0 | 0 | 1 |

The first delta includes thinking or tool calls and does not guarantee user-visible prose. First-prose latency is recorded separately in CSV; pure tool responses have no prose. Generation speed uses server timings rather than character-count estimates. The controller did not restart the AI service. Human client corrections interrupt agent turns without establishing a service crash.

## Human intervention and failures

Actual continuous development exceeded the original 30–60 minute plan. A 40-minute cap per stage remained, without enforcing a total 60-minute cutoff. Reaching a cap cancels that agent turn and proceeds to the next stage; the original stage cannot be called fully autonomous success. The four stages and subsequent read-only Pi checks at approximately 129K input shared the coding session; control checks used a 1024-token output budget. During regression, 126340 input plus 6144 output requested a 133K budget, exceeding 131072, and the service correctly rejected it. This was a client budget overrun, not a service stability failure. Recovery opened a new Pi session using project files, without restarting the model. No deliberate service cooldown was used to extend the workload.

| Request | Stage | Reason for correct server rejection |
| --- | --- | --- |
| 103 | phase4 | {"error": {"type": "invalid\_request\_error", "message": "prompt (126340 tokens) + max tokens (6144) exceeds the context (131072); requests are never truncated. Send a smaller max\_tokens (at most 4724 here), or add \"fit\_max\_tokens\": true to the model's strata-<model>.json to shorten it to the room left (#545)"}} |

| Stage | Operator event | Time, relative seconds |
| --- | --- | --- |
| phase1 | pi\_end | 1996.3 |
| phase2 | pi\_timeout | 4396.4 |
| phase2 | pi\_end | 4396.4 |
| phase3 | pi\_timeout | 6796.5 |
| phase3 | pi\_end | 6796.5 |
| product-recovery | pi\_timeout | 9079.2 |
| product-recovery | pi\_end | 9079.2 |

Review breaks followed the stress/recovery period. Later unstressed-final-polish and delivery-docs used ordinary short contexts and caching, excluded from continuous stress duration and high-input speed measurements. One recovery cancellation occurred before gateway logging finished, so requests.jsonl has no completion row. progress.jsonl request\_start and recovery\_shutdown establish it as a separate operator cancellation without fabricating HTTP status. Pi automatic compaction was disabled to maintain stress, eventually taking the original session to its total budget boundary. This does not establish that everyday Pi development with normal compaction would necessarily interrupt.

## Near-limit control checks

| Case | Assessment | Actual answer |
| --- | --- | --- |
| full-context-money | Pass | {"total\_cents": 6000, "within\_sixty": true} |
| full-context-date | Pass | {"leap\_valid": true, "nonleap\_valid": false, "days": 2} |
| full-context-migration | Pass | {"accept\_v1": true, "reject\_v99": true, "reject\_duplicate": true} |

The near-limit segment used six requests. Each of three questions required a read tool call followed by a structured answer, with actual inputs of 128759–128964 tokens and a 1024-token output budget. These are small checks of money, dates and backup rules; 3/3 is not general reasoning or coding accuracy. This segment shared the earlier coding session.

| UTC time | Reason | Type |
| --- | --- | --- |
| 2026-10-06T16:45:36.411942+00:00 | Prevent prohibited Google Chrome/channel chrome use; explicit user Chromium rule | operator\_client\_cancel |

The model configured a browser test as channel: chrome. The evaluator stopped that pi turn before Chrome launched and supplied an explicit Chromium binary path for the next stage. The initial pi system prompt said only “Use only Chromium” without repeating the complete user prohibition on channel chrome. This is agent-configuration correction, not a strict experiment on forgetting the original instruction. Resulting BrokenPipe records belong to evaluator cancellation and are not counted as service failures. Subsequent regression tasks included real independent-acceptance feedback, retaining both pre-fix and post-fix results.

## Independent validation

| Check file | Pass | Failure notes |
| --- | --- | --- |
| repair-cafe-final-budget-domain.json | 15/15 | All passed |
| repair-cafe-final-core-ui.json | 13/13 | All passed |
| repair-cafe-final-domain.json | 25/25 | All passed |
| repair-cafe-final-extended-domain.json | 16/16 | All passed |
| repair-cafe-final-workflow-ui.json | 8/8 | All passed |
| repair-cafe-phase1-core-ui.json | 12/13 | Combined name/status/category filtering: locator.click: Timeout 30000ms exceeded. Call log: [2m - waiting for getByRole('button', { name: '清除筛选', exact: true })[22m |
| repair-cafe-phase1-domain.json | 25/25 | All passed |
| repair-cafe-phase2-extended-domain.json | 16/16 | All passed |
| repair-cafe-phase2-workflow-ui.json | 7/8 | Completing an edit form must confirm unchecked items: edit form bypassed unchecked-checklist confirmation 'done' !== 'pending' |
| repair-cafe-phase3-budget-domain.json | 15/15 | All passed |
| repair-cafe-phase3-draft-budget-domain.json | 14/15 | v2 invalid settings import rejection: validateSettings is not defined |

| Additional UI checks | Pass |
| --- | --- |
| Budget, reference date, selection cleanup, CSV scope, clearing forms | 5/5 |

| Final command | Actual exit code |
| --- | --- |
| unit | 0 |
| build | 0 |

The first self-written domain tests failed 5 of 18 checks, including an incorrect integer-cent expectation of 31 for 0.1+0.2 and a wrong timezone assertion. The model corrected them after running checks. A subsequent full build exposed and fixed duplicate function names and the backup-preview count field. Green self-written tests do not establish independent acceptance. Final evaluation must combine independent user journeys, calculation checks and build logs.

## Final assessment

This run was stable under single-request, continuously long-context conditions with the model already loaded. Pi used native tools through the API to build a useful website, but did not autonomously deliver successfully in one pass during stress. Stage limits, client context-budget overruns and omitted UI states required human acceptance and recovery. After fixes by the same model, the final code passed 66 self-written tests, 56 independent domain checks and 26 Chromium user journeys, with a successful production build.

| Item | Assessment | Evidence |
| --- | --- | --- |
| Service stability | Passed in this run | Approximately 151 minutes of continuous stress/recovery, with 124 valid stress requests. All 6 near-limit requests at 128759–128964 input completed. Stress-period health checks had 0 failures; no unexpected HTTP errors. PC hardware counters were unavailable, so leaks cannot be ruled out. |
| Performance | First-token latency grows approximately linearly with input | First delta was approximately 41 seconds at 64K, 61 seconds at 96K, 79 seconds at 122K and 84.5 seconds near 129K. Server medians for long generation were approximately 55–62 tok/s. The near-limit, short-output median of 52.2 tok/s is not a long-generation speed measurement. |
| Continuous tasks and autonomous delivery | Human review and context management required | Multiple stages ran in one session, but two hit the 40-minute turn cap. Regression 126340+6144 exceeded total 131072 and was correctly rejected. Disabled compaction and forced material rereading were test settings, not evidence of a model/service crash. Recovery and short wrap-up sessions followed. |
| Functional correctness | Passed tested scope after repair | Pi fixed completion-confirmation bypass, unsynchronized budget input, revived hidden selections, ineffective form clearing and component argument wiring. Final checks passed: 66 self-written unit/component tests, 56 independent domain checks and 26 independent Chromium journeys. Pre-fix failures are retained. |
| Visuals and experience | Practical utility style; not yet polished | No horizontal overflow on desktop or 390px mobile. Main tasks include a workbench, costs/budgets and real operations. Pages are long and dense; heading and technical-explanation hierarchy could improve. A missing favicon causes one 404 without affecting functionality. |
| Engineering delivery | Builds and runs locally | Vite React TypeScript, with domain/components separated. Pi wrote README and DELIVERY; git snapshots capture stages. Global Pi settings were unchanged; source and delivery files contain no actual API key. |

### repair-cafe-final-top.png

![Actual website screenshot](../../assets/figures/d2e87e9be4a5-repair-cafe-final-top.png)

### repair-cafe-final-desktop.png

![Actual website screenshot](../../assets/figures/2ed024eb4b5f-repair-cafe-final-desktop.png)

### repair-cafe-final-mobile.png

![Actual website screenshot](../../assets/figures/0759ecc601e4-repair-cafe-final-mobile.png)

## Traceable files

repo: $HOME/Code/repair-cafe-qwen-soak-20261006

* repair-cafe-request-metrics.csv: actual per-request performance and finish reasons
* Independent acceptance JSON and screenshots: local browser validation results
* Neighborhood Repair Café programming task and test plan: predefined task, incremental requirements and criteria
* repair-cafe-source.zip: product source and staged tasks