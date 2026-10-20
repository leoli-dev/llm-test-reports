---
type: Note
title: "DeepSeek V4.1 Flash Ten-Game Reasoning Configuration Test"
status: current
description: "Results, latency, and export issues for the first ten games of real API matches; paused after the tenth game as requested by the user"
tags: [llm, benchmark, deepseek, game-test, latency]
timestamp: 2026-10-11T21:44:16Z
---

# DeepSeek V4.1 Flash Ten-Game Reasoning Configuration Test

[English](devlog-projects-ai-werewolf-notes-deepseek-v4-1-flash-10-game-benchmark.md) | [简体中文](devlog-projects-ai-werewolf-notes-deepseek-v4-1-flash-10-game-benchmark_CN.md)

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

## Test Scope

2026-10-11 Running DeepSeek V4.1 Flash (deepseek-flash) on GitHub Pages. Each game is a 12-player random standard game, with werewolf communication for 3 rounds, AI proxy play enabled, and god's view enabled. The original plan was speech reasoning none/low/high/max × decision reasoning none/low/high/max, with 3 games per group, totaling 48 games. The user later requested to pause after completing the tenth game; therefore, only decision none (3 games), low (3 games), high (3 games), and max (1 games) under speech none were run, and the remaining 38 games were not executed.

Per-game data is saved in artifacts/deepseek-v41-flash-benchmark-2026-10-11/progress.csv in the ai-werewolf repository, and the test report is located in report.md in the same directory. The API key remains in the browser keychain and was not written to project logs.

## Summary

| Speech Reasoning | Decision Reasoning | Games | Good Wins | Werewolf Wins | Events | Decisions | LLM Calls | Failures | Proxy Plays | Displayed Time |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| none | none | 3 | 1 | 2 | 512 | 454 | 455 | Not recorded | Not recorded | 23:01 |
| none | low | 3 | 1 | 2 | 543 | 477 | 618 | Not recorded | 48 | 1:40:49 |
| none | high | 3 | 0 | 3 | 530 | 461 | 530 | Not recorded | 17 | >2:27:20 |
| none | max | 1 | 0 | 1 | 181 | 166 | 132 | 53 | 56 | 2:41:37 |
| Total |  | 10 | 2 | 8 | 1,766 | 1,558 | 1,735 | At least 53 | At least 121 | >7:12:47 |

Times displayed on the game results page are summed; the first game in the high group exceeded 60 minutes, so the total is a lower bound. Failures and proxy play counts were not recorded for none/none. Failures and proxy plays are two different panel counts, and the values can differ. The sample size is small, and a large number of fallbacks mix model and rule-based AI results, so the overall win rate of the model cannot be determined based on this.

## Per-Game Results

| No. | Configuration (Speech/Decision) | Winner | Days | Events | Decisions | LLM Calls | Failures | Proxy Plays | Time |
|---:|---|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | none/none | Good | 4 | 178 | 164 | 165 | Not recorded | Not recorded | 07:52 |
| 2 | none/none | Werewolf | 3 | 145 | 130 | 130 | Not recorded | Not recorded | 06:22 |
| 3 | none/none | Werewolf | 5 | 189 | 160 | 160 | Not recorded | Not recorded | 08:47 |
| 4 | none/low | Werewolf | 4 | 177 | 153 | 199 | Not recorded | 14 | 30:51 |
| 5 | none/low | Good | 4 | 163 | 144 | 194 | Not recorded | 17 | 31:06 |
| 6 | none/low | Werewolf | 5 | 203 | 180 | 225 | Not recorded | 17 | 38:52 |
| 7 | none/high | Werewolf | 6 | 216 | 190 | 234 | Not recorded | 9 | >60 minutes |
| 8 | none/high | Werewolf | 4 | 168 | 151 | 159 | Not recorded | 3 | 39:51 |
| 9 | none/high | Werewolf | 4 | 146 | 120 | 137 | Not recorded | 5 | 47:29 |
| 10 | none/max | Werewolf | 5 | 181 | 166 | 132 | 53 | 56 | 2:41:37 |

## Observed Issues

1. High reasoning requests exhibit long-tail latency. The tenth game of none/max took 2:41:37, with the LLM panel recording 53 failures and 56 proxy plays; multiple requests took approximately 170–179 seconds. The total displayed duration for the three games in none/high exceeded 2:27:20.
2. Voting has noticeable "wait then settle" pauses. The source code voteRound first waits for askAll, and askAll uses Promise.all for decisions in the same round; vote results are not published until all requests are complete, so the slowest request holds up the entire round. See ai-werewolf/src/game/game.ts line 444 and line 1062. The page does not display how many requests are remaining.
3. Werewolf communication uses decision reasoning intensity, so high/max decision reasoning slows down multi-round werewolf discussions every night, not just actions like voting and skills.
4. Page export behavior is inconsistent with file visibility. "Export Record" was clicked for all ten games, and page toasts confirmed 178/164, 145/130, 189/160, 177/153, 163/144, 203/180, 216/190, 168/151, 146/120, and 181/166 respectively. The toasts stated that export was complete, but neither the user nor the local workspace could find the JSON download. Currently saved are summary statistics, not complete per-event JSON.
5. The proportion of proxy plays contaminates pure model evaluation. none/low recorded 48 proxy plays, none/high recorded 17, and none/max recorded 56. Subsequent reports should separate pure model responses from fallback actions.

## Export Limitations

The browser claimed the JSON was exported, but there was no file path, and no downloaded file was found; the user confirmed they could not see it either. Statistical summaries cannot be disguised as complete game JSON, so the raw JSON was not pasted into this log. BUG-04 tracks the issue of invisible export files. After fixing or confirming download delivery, the export should be redone and the raw files supplemented.
