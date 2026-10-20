# Neon Bastion / seven 8bit rounds

[English](neon-01.md) | [简体中文](neon-01_CN.md)

| Item | Record |
|---|---|
| ID | NEON-01 |
| Date | 2026-09-01—09-04 |
| Model and runtime | mlx-dspark + Qwen3.8-27B-8bit + DFlash2 + Pi |
| Inference location | local |

<!-- environment-context:start -->

## Workstation and system (context added 2026-10-20)

| Item | Record and evidence boundary |
|---|---|
| Workstation role | Local inference workstation |
| Current hardware reference | MacBook Pro `Mac17,6`; Apple M5 Max; 18-core CPU; 40-core GPU; 128 GB unified memory (128 GiB / 137438953472 bytes) |
| Host explicitly recorded by the source | See original report; current snapshot does not fill missing historical configuration |
| Current system snapshot | macOS 27.0.1, build `26A434`, arm64, Metal 4; captured 2026-10-20 22:03:27 UTC |
| Test-time OS | Not recorded in the surviving test evidence; current OS is not substituted |
| Historical limits | Without a separate test-time snapshot, detailed core counts are a current workstation reference. Mac specifications do not establish LAN PC or cloud inference hardware. |

[Full environment notes](../../environment.md). Model, quantization, engine, cache and request settings remain those recorded in this report. Original figures, source code and command output retain source-language evidence.

<!-- environment-context:end -->

## Historical result

The seven-round summary captured 31 commits; the September 16 comparison records a final repository state of 34 commits. Approximately 30 hours, 149 unit tests and 26 E2E scenarios. The deployment discarded images, which is not evidence of the model's intrinsic visual ability.

## Full reports

- [Neon Bastion Seven-Round Summary](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-final-summary-2026-09-04.md)
- [Neon Bastion — mlx-dspark/Qwen3.8-27B-8bit + Pi independent acceptance and code review](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-mlx-dspark-pi-review-2026-09-01.md)
- [Neon Bastion — mlx-dspark/Qwen3.8-27B-8bit + Pi independent acceptance and code review](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-1-review-2026-09-01.md)
- [Round 2 — Independent Re-review (2026-09-02)](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-2-review-2026-09-02.md)
- [Neon Bastion — Round 3 Verification (Scoring Deferred to Manual Play)](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-3-review-2026-09-02.md)
- [Neon Bastion — Round 4 review](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-4-review-2026-09-02.md)
- [Neon Bastion — Round 5 review](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-5-review-2026-09-03.md)
- [Neon Bastion — Round 6 review](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-6-review-2026-09-03.md)
- [Round 7 Review](../originals/devlog-projects-qwen3-8-test-notes-neon-bastion-round-7-review-2026-09-04.md)

## Artifact

- [Neon Bastion](https://github.com/leoli-dev/llm-test-2026-09-01-game-neon-bastion)
- [Play in your browser](https://leoli-dev.github.io/llm-test-2026-09-01-game-neon-bastion/)
