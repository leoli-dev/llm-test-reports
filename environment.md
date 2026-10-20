# Workstation and system

[English](environment.md) | [简体中文](environment_CN.md)

## Current verified workstation

Captured on **2026-10-20 at 22:03:27 UTC** (America/Toronto: 18:03:27 EDT).

| Component | Verified configuration |
|---|---|
| Computer | Apple MacBook Pro, model identifier `Mac17,6` |
| SoC | Apple M5 Max |
| CPU | 18 cores |
| GPU | 40 cores |
| Unified memory | 128 GB as displayed by System Information; `hw.memsize=137438953472` bytes (128 GiB) |
| Architecture | Apple silicon / arm64 |
| Operating system | macOS 27.0.1 |
| OS build | `26A434` |
| Graphics API | Metal 4 |

The snapshot comes from `system_profiler SPHardwareDataType SPDisplaysDataType`, `sw_vers`, and `sysctl`. Serial numbers, hardware UUIDs and provisioning identifiers are excluded. See the machine-readable [workstation snapshot](data/environment.json).

## Historical tests

This is a **current snapshot**, not proof of the OS used by every earlier experiment. The 2026-10-19 engine benchmarks have frozen hardware records confirming macOS 27.0.1; the four-round Tank Battle experiment records the same version. Older reports without a captured OS version are marked **not recorded**. CPU/GPU details that were not separately captured in an older test are a workstation reference, not a newly verified historical measurement.

The per-report environment block identifies whether the workstation was the inference host, a client for a LAN PC, or a client/local comparison machine for a cloud test. **Mac hardware must not be presented as the inference hardware of a remote PC or cloud model.** Remote inference hardware that was not recorded stays unspecified.

Model, quantization, KV format, inference engine, agent, context/output budgets, sampling, cache state, power conditions and software versions vary by test. Use the individual report for those settings; current settings do not replace historical ones.

## Figures and code

Screenshots, original figures, source code and command output are retained as evidence. They can contain source-language labels or literal quotations even when surrounding prose is translated. Such evidence is not redrawn or edited to suggest a different test environment or outcome.

[Sanitized historical hardware fields and source hashes](data/environment-history.json). Missing fields remain null and are not filled from the current configuration.

The Laya service evaluation records M5 Max, 128 GB and Darwin 27.0.0 (a kernel version, not a macOS product version). The separate direct-runtime benchmark reports **M3 Max, 40-core GPU, 128 GiB and macOS 27.2**. These source records describe different environments and retain their attribution; they are not relabeled as the current M5 Max.
