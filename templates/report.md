# Experiment title

[English](report.md) | [简体中文](report_CN.md)

Test date: YYYY-MM-DD, timezone. Update language links after naming the report.

## Question and success criteria

State the question and the success criteria fixed before the run.

## Hardware, system and fixed conditions

| Item | Actual configuration and evidence |
|---|---|
| Inference location | Local / LAN PC / cloud |
| Inference host | Device, chip/CPU and core count, GPU and core count, unified/system memory |
| Test-time OS | OS version, build, architecture; snapshot timestamp and evidence |
| Client (if remote) | Client hardware/system, separately from the inference host |
| Power and thermal state | Power source/profile, relevant thermal conditions; not recorded if unavailable |
| Model | Full identifier, source, pinned revision |
| Quantization and cache | Weight format, KV format, prefix cache and warm/cold state |
| Engine and agent | Names, versions and fixed commits |
| Request settings | Context, max output, thinking/reasoning, sampling, concurrency |

Use **not recorded** for missing evidence. A current machine snapshot must not be substituted for historical test conditions. See the dated [workstation reference](../environment.md); use `../../environment.md` from a saved report in `reports/originals/`.

## Task and process

Retain the prompt, each round's requirements, actual model delivery, human instructions and failed retries. Distinguish model code from supervisor edits.

## Results and evidence

| Check | Result | Evidence or command |
|---|---|---|

Put images in `assets/`; use `../../assets/...` from `reports/originals/`. Link artifact code to a fixed commit in its separate repository.

## Performance and measurement

Separate prefill, decode, TTFT and end-to-end time. Record cache state, sample counts, telemetry coverage, failed requests, truncation and missing samples.

## Limits and conclusion

State human involvement, missing coverage, comparison differences and unsupported conclusions. Automated checks passing do not establish product acceptance. Supply a full Chinese `_CN.md` counterpart, retaining numerical and code evidence.
