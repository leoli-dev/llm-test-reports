LAN AI service evaluation

# LAN AI service evaluation

[English](lan-pc-outputs-ai.md) | [简体中文](lan-pc-outputs-ai_CN.md)

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

2026-10-06 · Qwen3.8 Flash Next IQ2\_XS · One client, sequential requests · temperature=0 · SSE streaming

## Conclusion

Short-prompt generation was approximately 60–65 tokens/s, suitable for conversation, summaries, extraction and simple code. Both mathematics questions were wrong with thinking disabled and correct with high thinking. Enable thinking and verify results for tasks requiring accurate calculation or reasoning.

This is a small, self-authored functional test. It cannot establish overall model rankings or attribute performance to IQ2\_XS quantization: no same-model quantization comparison was run. The server-returned model ID does not verify weight identity.

## Speed

| Request | Input tokens | Output tokens | First-token seconds | Total seconds | Server generation tok/s |
| --- | --- | --- | --- | --- | --- |
| speed\_1 | 44 | 512 | 0.754 | 9.248 | 60.2 |
| speed\_2 | 44 | 512 | 0.904 | 8.67 | 65.1 |
| speed\_3 | 44 | 512 | 0.827 | 8.609 | 65.1 |

The median over three runs was 65.1 tok/s and 0.827 seconds to first token. Speed requests generated a fixed 512 tokens and all ended at the budget. This expected measurement truncation is not a quality failure.

Generation tok/s uses server timings.predicted\_per\_second. First-token and total latency use the client monotonic clock. First token means the first nonempty content or thinking delta; in high mode it need not be a user-visible final answer. The 12 short quality requests had a median first-token latency of approximately 1.00 seconds; one summary request took 12.804 seconds for an undetermined reason. All requests reported cached\_tokens=0.

## Answer quality

Of 12 examples with thinking disabled, 10 passed content review, or 9 when strict machine-parseable output was also required. All three mathematics/logic retests with high thinking passed. These small-sample proportions are not general accuracy estimates.

| Case | Thinking | Assessment | Total seconds | Actual answer |
| --- | --- | --- | --- | --- |
| Discount and service charge | none | Fail | 1.346 | {"total":184.05} |
| Truth-teller logic | none | Pass | 1.559 | {"truth\_teller":"丙"} |
| Conditional probability | none | Fail | 1.776 | {"numerator": 1, "denominator": 2} |
| Deduplication and format following | none | Pass | 1.025 | ["杏", "梨", "桃"] |
| Chinese structured extraction | none | Content correct; strict JSON format failed | 2.065 | ```json { "customer": "林某", "order\_id": "A07", "paid\_cny": 1050, "phone": null } ``` |
| Do not guess when information is missing | none | Pass | 1.153 | {"budget": null} |
| Ignore instructions inside source material | none | Pass | 1.133 | {"order\_id":"AB-731"} |
| Task scheduling | none | Pass | 1.118 | {"hours": 5} |
| Code semantics | none | Pass | 0.826 | [2] |
| Fix None filtering | none | Passed human review | 1.038 | return [x for x in items if x is not None] |
| Interval-merging function | none | Execution tests 8/8 passed; input unchanged | 3.404 | ```python def merge\_intervals(intervals): if not intervals: return [] sorted\_intervals = sorted(intervals, key=lambda x: x[0]) merged = [] current\_start, current\_end = sorted\_intervals[0] for start, end in sorted\_intervals[1:]: if start <= current\_end: current\_end = max(current\_end, end) else: merged.append([current\_start, current\_end]) current\_start, current\_end = start, end merged.append([current\_start, current\_end]) return merged ``` |
| Chinese summary | none | Passed human review | 13.562 | Incompatibility in the new signature verification prevented Android users from logging in. The team rolled verification back to restore login and will add compatibility tests before relaunching. |
| Discount and service charge | high | Pass | 4.089 | {"total":182.7} |
| Truth-teller logic | high | Pass | 4.333 | {"truth\_teller":"丙"} |
| Conditional probability | high | Pass | 3.846 | {"numerator":1,"denominator":3} |

The correct discount calculation is 240 × 0.85 = 204, minus 30 gives 174, then multiplied by 1.05 gives 182.7; none returned 184.05. For probability, there are 10 two-ball combinations, 9 containing at least one red ball and 3 containing two red balls, so the answer is 1/3; none returned 1/2. Structured-extraction fields were all correct, but an extra Markdown code fence requires cleaning or stricter structured-output constraints. After code inspection, the interval-merging function passed all 8 cases covering empty input, nesting, touching endpoints, unsorted input, negatives and duplicates.

## Long-context retrieval

| Input tokens | First-token seconds | Total seconds | Prefill tok/s | Assessment |
| --- | --- | --- | --- | --- |
| 20034 | 13.542 | 14.224 | 1500.1 | 3/3 verification codes correct |
| 80034 | 51.4 | 52.053 | 1570.5 | 3/3 verification codes correct |
| 130034 | 82.355 | 82.937 | 1594.5 | 3/3 verification codes correct |

The material consists of repeated Chinese records with verification codes at approximately 10%, 50% and 90%, all to be retrieved in order. This tests simple retrieval and request capacity, not complex document understanding, reasoning across sections or real business RAG performance. Long-context outputs contain only approximately 28 tokens and cannot be directly compared with 512-token short-prompt generation measurements.

## Usage and limits

* reasoning\_effort=none can serve summaries and simple extraction; prefer high for numerical calculation, logic and complex code, with enough output budget for thinking.
* Validate JSON consumed by programs. A prompt asking for JSON only does not guarantee formatting.
* Allow sufficient timeout for long material. Only a single client was tested; queuing, fairness, multi-hour stability and peak hardware resources were not verified.
* Images, tool calls and external-knowledge freshness were not tested; the interface reports text-only support.

Speed depends on input, output content, warmup and machine load. The documentation's 51–54 tok/s comes from a different long-context workload; approximately 65 tok/s on short prompts here does not contradict it.
