# Flash Next UD-IQ4_XS on Splash: CAP-05 replay

[English](cap-05-iq4.md) | [简体中文](cap-05-iq4_CN.md)

| Item | Record |
|---|---|
| Date | 2026-11-24 |
| Model | Qwen3.8-Flash-Next UD-IQ4_XS / GSQ-RCO IQ3_S |
| Engine | Splash |
| Inference location | local |
| Inference hardware | MacBook Pro Mac17,6 / Apple M5 Max / CPU 18 / GPU 40 / 128 GiB |
| Test-time OS | macOS 27.2.1 (26B131), arm64 |

In the matched cold probe, IQ4 first-event latency fell 5.6%, decode fell 3.3%, and peak Splash allocation rose 8.68 GiB. Both builds completed the movie and scroll tasks. IQ4 hit the voxel deadline where historical IQ3 finished.

[Full report](../originals/2026-11-24-flash-next-iq4xs-splash-cap05-replay.md)

Three cold trials per profile and one run per product. Voxel reached the 60-minute limit. Historical product results use different runtime and client versions.
