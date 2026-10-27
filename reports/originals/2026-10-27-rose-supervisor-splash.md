# ROSE: Final report on the supervised Splash trial


Test-time OS: Unknown; not independently recorded.
2026-10-27 · One exploratory local run · Final commit `4c73f2a627c1a8595db0f3f04d0315203b5b629c`

**R01–R32 passed their formal acceptance checks, and the final product ran offline.** This was a continuous supervised run with directional feedback, retries and corrections to the evaluation infrastructure. PREP-03/04 were incomplete: this is not a preregistered independent evaluation and does not justify a general capability score. Strata was prepared but paused at the user's request, with zero attempts; it receives no score and no paired comparison is possible.

The user requested removal of the final page and source. The commit identifier remains for historical reference; raw evidence is retained locally and is not included in this publication.

## Results and retries

**42 attempts, 43 executions, 32 passes / 9 failures / 1 timeout; 23/32 cards passed first try, with 10 reviewed pieces of directional feedback.** Retried cards: R02 ×2, R06 ×2, R07 ×2, R09 ×2, R10 ×2, R13 ×2, R20 ×2, R30 ×3 and R31 ×2. Card, attempt, cost, reason and commit details are retained locally. Failures during the model's own development did not consume additional formal attempts. External infrastructure errors were documented and corrected, not counted as model failures.

| Frozen delivery | Result | Active wall time / API output | Reason under the original criteria |
|---|---|---|---|
| R02 a1 | Fail | 5.18 min / 33,578 | Large-number interpolation produced non-finite values for valid endpoints. |
| R06 a1 | Fail | 4.09 min / 19,692 | Executed broad process-name cleanup prohibited by the public system policy; product checks passed. |
| R07 a1 | Fail | 7.21 min / 40,454 | An intermediate attachment exceeded the main stem actually drawn. |
| R09 a1 | Fail | 11.50 min / 42,829 | Public cumulative tests exited 1 twice in a clean copy; independent geometry checks could not override this. |
| R10 a1 | Fail | 10.98 min / 51,841 | A visible leaf root in an intermediate state did not meet the attachment requirement against the drawn parent branch. |
| R13 a1 | Fail | 7.87 min / 40,390 | Close-up showed the sepal cluster detached from the stem tip; failed the original qualitative connection requirement without inventing a distance threshold. |
| R20 a1 | Timeout | 32.05 min / 120,000 | Exhausted the API output budget without a formal delivery. |
| R30 a1 | Fail | 32.97 min / 80,581 | Some early close-ups after historical navigation omitted the subject, violating the original hard requirement. |
| R30 a2 | Fail | 25.93 min / 59,011 | Early views were fixed, but later history still omitted connecting segments that were present in a fresh view at the same state. |
| R31 a1 | Fail | 54.90 min / 38,225 | Report coverage only: CPU/RSS values and an honest explanation of missing values were absent. Function, performance and background checks passed. |

R30's three attempts took **107.42 minutes and 198,661 output tokens** in total; both failures, both directional hints and all costs were retained. The third attempt passed after correction. A low whole-frame pixel difference cannot excuse the missing subject or connection.

R31 a2 was physically interrupted once: execution 001 received SIGINT at **18:53:29.282853 UTC**, after 988.446 seconds and 34,737 output tokens, with formal_delivery=false. This was a user interruption, not a model failure, timeout or extra attempt. On the user's instruction, execution 002 resumed the same source and Pi session with at most the remaining 2,611.554 seconds and 85,263 output tokens; it used 1,279.209 seconds and 5,287 output tokens. The single attempt totaled **2,267.656 seconds / 40,024 output tokens**, within its original 3,600-second / 120,000-token limit, excluding paused time, and passed. Scope changes do not imply multiple physical interruptions.

## Final acceptance and visual result

R32's independent clean Git archive passed offline npm ci, typecheck, build, 457 unit tests, plus three new R32 unit and three Chromium end-to-end tests, all with actual exit code 0. The numerical matrix covered **3 seeds × 33 boundaries/neighbors × 3 sizes × 3 cameras × 5 speeds = 4,455 combinations**; 99 continuous main-scene comparisons also passed. Maximum historical state/camera/pixel difference was 0; maximum world difference was **4.097 × 10⁻⁸ ≤ 10⁻⁶**. Meshes, world coordinates, materials, buffers and pixels were cross-checked, not merely stage labels.

Real input exercised eight stages, a 550 ms pause, a 97%→40% drag, five speeds, three cameras/reset, native keyboard input, a real end-to-start loop, and repeated dispose/remount. Original images and decoded interaction-video frames were inspected. An observer initially used the wrong remount entry name; the error was retained and only that short check was repeated without changing the product.

Fifty-three production source/configuration/lock files matched R31, and 32 newly built files matched it by SHA. The coverage map referenced existing full public regression, 100 seeks/20 loops/20 mounts, hardware 30-second tests ×3, 300-second playback, native trusted hidden/visible events, and R30 a3's 24 main images plus six samples, full eight-stage video and actual GL camera checks. The recorded counts are actual; lengthy checks were not presented as rerun. The dispatcher added R32 only, without deleting original assertions.

Final informed technical scores on five 0–2 scales were **plant recognition 1, flower form 1, decay 1, interaction 2, composition 1**, all satisfying the original ≥1 threshold. The young plant was small, the flower relatively flat, distant falling petals resembled soil, and UI/soil had substantial empty space. Only R30 a1 received one neutral blind still-image review and one informed technical review; it was not double-blind. The a1 blind score cannot be extrapolated to the final version, which had no new blind review. The candidate report was self-assessment; limitations including ignored clean-build logs absent from the Git archive and an uncaptured outer npm exit code were recorded and not substituted for independent evidence.

After viewing the final product, the user judged it poor: it met basic functional needs but lacked beauty and surprise. The supervisor failed to prioritize visual quality early and incurred high time and resource costs through excessive task splitting and repeated testing. This user judgment is separate from the technical score above.

## Time, tokens and cost

| Measure | Observed value |
|---|---:|
| First to last formal request, UTC | 04:33:40.235 → 20:13:10.669 |
| Calendar span / active attempt wall time | 15.66 hours / 9.35 hours |
| Cumulative API request wall time / ended tool time | 4.50 hours / 4.83 hours |
| Difference outside attempts | 6.31 hours, including external acceptance, preparation, infrastructure, coordination and user pause |
| API requests / completion output | 1,505, all HTTP 200 / **1,483,480** |
| Prompt / cached / new prompt tokens | 196,558,859 / 192,671,136 / 3,887,723 |
| Reasoning / internal compaction difference | 631,969 (included in output) / 66,345 |
| Tools | 1,665 start / 1,664 end / 64 isError; one in flight at user interruption |
| Native median decode / prefill | 120.79 / 1,479.30 tokens/s |
| Median proxy first content / measurable visible first character | 0.687 s (n=1,505) / 5.777 s (n=338) |

API completion includes internal compaction and is authoritative; an early R06 a2 summary omitted 3,846 tokens and was corrected from raw records. Deduplication used engine/card/attempt/execution/request ID without adding aggregates to child executions. Reasoning is not added twice; the internal difference is API output minus recorded assistant output. Tools include tests and sleeps; API and tool durations are not mutually exclusive utilization buckets. The gap cannot all be assigned to model speed or external acceptance; the calendar interval also excludes final acceptance and reporting after the last request. Native decode uses (n−1)/predicted_ms; prefill retains the engine's numerator/cache convention. First content can include reasoning, and visible first character covers only the measurable subset.

**Cloud Codex agent tokens and billing were not measured and are unknown; local API tokens are not their cost.** There was repeated work: current/all/independent long checks, approximately 20 minutes from four 300-second caps in R30 a3, and approximately 47.5 minutes from ten long sleeps in R31 a1, as well as selector/GL field/native focus/sampling corrections and agent garbage collection. Later, hash-based coverage reduced unnecessary repetition. A snapshot count of 91 mentions/starts/log reads of test:all is not 91 complete runs. In the later phase one Codex agent reused execution and acceptance roles; this was independent relative to Pi, not consistently two independent people.

## Performance and resources

The local inference host was an Apple M5 Max with ANGLE Metal, 128 GiB unified memory and 18 logical CPUs. The macOS product/kernel version was not independently frozen for the run; a current environment file must not be substituted. Splash 1.4.1, Qwen3.8 Flash Next GSQ-RCO IQ3_S, 262,144 context, medium thinking; the local engine identity retains shard/version provenance.

External release testing at a 1280×720 viewport and DPR 1 (actual buffer 1280×633 after UI) produced 1,801 frames in each of three runs, with median/p95 around **16.7 ms**, within the original 33.4/50 ms limits, or approximately **60 FPS**. The scene had 22,322 triangles and 44 draws; 300-second stability, a genuine 12-second background pause/resume, and resource disposal cycles passed. Over a 395.05-second window, the externally owned browser tree accumulated 124.637 CPU seconds, or 31.55% on a single-logical-core scale. Summed RSS rose from 1,052,475,392 to 1,174,241,280 bytes, peaking at 1,176,649,728; shared pages may be counted more than once, so this is neither unique physical memory nor backend RSS.

These figures are **external measurements**, not the candidate's self-report. The candidate ultimately marked OS CPU/RSS unmeasured and retained the EPERM/protocol limitation. CDP renderer main-thread busy fraction and JS heap were reported separately: heap is not RSS and one renderer is not the whole browser tree.

Among 33,579 approximately 1 Hz attempt samples, memory pressure was normal 33,484 times and warn 95 times; native thermal state was nominal 18,056 and fair 15,523 times. No valid Celsius temperature was available. CPU/RSS/footprint/GPU/pressure/swap and missing values are retained locally per execution with their separate scopes; swap segments cannot simply be added and samples do not cover gaps. User preview from 10:11:39 Toronto introduced a mixed system load that cannot be attributed solely to inference.

## Evidence and final state

Machine summary, execution/interruption/resumption data, request metrics and SHA evidence index are retained in the local archive. Failure, feedback and interruption summaries remain locally; the original test workspace was cleaned up.

Splash was stopped after identity checks. Preview services were subsequently stopped and the test workspace removed at the user's request; the Strata test was not started. Both engines and their models remain installed.
