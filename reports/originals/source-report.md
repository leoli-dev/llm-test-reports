# DeepSeek V4.1 Flash Test Summary (First 10 Games)

[English](source-report.md) | [简体中文](source-report_CN.md)

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Mac client / local comparison; cloud hardware was not recorded |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | See original report; current snapshot does not fill missing historical configuration |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | Not recorded in the surviving test evidence; current OS is not substituted |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

The test page is [ai-werewolf GitHub Pages](https://leoli-dev.github.io/ai-werewolf/). All completed games used deepseek-flash (DeepSeek-V4.1-Flash), 12 random standard gameplay, 3 rounds of wolf team communication, AI auto-play, and god's-eye view. The original plan was to cover 16 sets of reasoning configurations, with 3 games per set; the user requested a pause after game 10, so this report only summarizes the first 10 games, with the remaining 38 games not run.

## Results

| Speech Reasoning | Decision Reasoning | Completed Games | Good Guy Wins | Werewolf Wins | Events | Decisions | LLM Calls | Failures | Auto-play | Total Displayed Time |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| none | none | 3 | 1 | 2 | 512 | 454 | 455 | Not recorded | Not recorded | 23:01 |
| none | low | 3 | 1 | 2 | 543 | 477 | 618 | Not recorded | 48 | 1:40:49 |
| none | high | 3 | 0 | 3 | 530 | 461 | 530 | Not recorded | 17 | >2:27:20 |
| none | max | 1 | 0 | 1 | 181 | 166 | 132 | 53 | 56 | 2:41:37 |
| **Total** |  | **10** | **2** | **8** | **1,766** | **1,558** | **1,735** | **At least 53** | **At least 121** | **>7:12:47** |

The time is the sum of the timers displayed on each game's result page; game 1 in the high group displayed a time exceeding 60 minutes, so only a lower bound can be given for the total duration. The none/none group did not save failure/auto-play counts, so they are summarized as "Not recorded". The panel counts failures and auto-play separately, so the values are not necessarily equal.

The sample size for wins and losses is small, and the results do not constitute a conclusion on model strength. In the configurations run, werewolves won 8 times and good guys won 2 times; random identities, game situations, and auto-play caused by high latency all affect the results.

## Issues Found During Testing

1. **High reasoning response times are very long and often fall back.** Game 1 in none/max took 2:41:37, with 53 failures and 56 auto-play instances recorded; multiple responses were close to 170–179 seconds. The three games in none/high totaled at least >2:27:20. The game state could still progress automatically, but the waiting significantly impacted experience and test throughput.
2. **The voting phase is held up by the slowest request.** It was observed multiple times that voting lasted for several minutes; the source code's `voteRound()` waits for `askAll()` to complete before aggregating, while `askAll()` uses `Promise.all` to wait for all decisions in that group (game.ts:444 (historical local file, not published with this report), game.ts:1062 (historical local file, not published with this report)). Therefore, a slow response delays the results of the entire round, and the page does not display the number of remaining requests.
3. **Wolf team communication also uses decision reasoning intensity.** The multi-round wolf chat each night is affected by the decision level; in the max group, long waits and auto-play repeatedly occurred during the wolf team communication phase.
4. **Export success prompts are inconsistent with file visibility.** After each of the 10 games ended, "Export Record" was clicked, and the toast confirmed the number of events/decisions; neither the user nor the local workspace found the JSON. The current archive only contains per-game statistics, lacking the complete per-event JSON requested by the user; the download delivery path needs to be fixed or verified before retesting.
5. **The auto-play ratio changes test results.** none/low recorded 48 auto-play instances, none/high recorded 17, and none/max recorded 56; win/loss statistics mixed model outputs and rule-based AI fallbacks, so future comparisons should separately count pure model decisions and fallback games.

## Export Verification and Archiving Limitations

The number of events/decisions confirmed by each result toast was, in order: 178/164, 145/130, 189/160, 177/153, 163/144, 203/180, 216/190, 168/151, 146/120, 181/166. The page toast indicated that JSON export was triggered, but did not provide a file path; the user confirmed that the download was also not visible. Therefore, this directory did not fabricate or rewrite the original JSON; `progress.csv`, the configuration summaries, and this report only save verifiable statistical data.

The API key remains in the browser's encrypted keychain and was not copied to the report or local archive.
