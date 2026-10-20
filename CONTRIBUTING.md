# Add a test report

[English](CONTRIBUTING.md) | [简体中文](CONTRIBUTING_CN.md)

This repository stores reports. Games, websites and other artifacts live in separate repositories; link a fixed artifact commit whenever available.

## Names and languages

- English is the default. Use `reports/originals/YYYY-MM-DD-topic.md` and a complete Chinese counterpart `YYYY-MM-DD-topic_CN.md`. Translate the full report, including tables, failures and limits. A summary is not a replacement for the full translation.
- Chinese documentation, JSON catalogs and HTML entry points use `_CN` before their extension. Technical source code and original screenshots retain their evidence language; explain them in both report editions.
- Artifact repositories use `llm-test-YYYY-MM-DD-{type}-{name}`, dated by the test's **start date**. Examples: `llm-test-2026-09-01-game-neon-bastion` and `llm-test-2026-10-20-game-tank-battle`.
- Repair rounds remain in one experiment chain. Independent model reruns can have separate records. Unknown dates must be labeled; an import date must not replace a test date.

## Record the actual environment

Use the paired [report template](templates/report.md). Record the inference host's chip/CPU, GPU, memory, OS version and build, architecture, inference engine and agent versions, model revision/quantization, cache and request settings. For a remote PC or cloud model, record client and inference host separately. Mark unavailable details **not recorded**.

The [workstation snapshot](environment.md) is a dated reference. Never use its current OS version to fill an undocumented historical OS. Preserve any captured hardware/status evidence, excluding identifiers and credentials.

## Register a report pair

1. Save both full Markdown reports, with language links. Put images in `assets/` and reference them from reports with `../../assets/...`. Remove credentials, private conversations and private endpoints while preserving measurements and experimental facts.
2. Run the registrar (the following values are illustrative, not measurements):

```sh
node scripts/add-report.mjs \
  --id EXP-2026-10-21-example \
  --title 'Example experiment' \
  --title-cn '实验示例' \
  --date 2026-10-21 \
  --model 'Exact model name and quantization' \
  --engine MLTF \
  --scope local \
  --file reports/originals/2026-10-21-example.md \
  --summary 'Observed result and evidence limits' \
  --summary-cn '实测结果与证据边界' \
  --hardware 'MacBook Pro / Apple M5 Max / CPU 18 / GPU 40 / 128 GB' \
  --test-os 'Not recorded' \
  --test-os-cn '未记录'
```

`--scope` is `local`, `lan` or `cloud`; use the **inference location**, not the source-code folder location. `--file` is the English file; the `_CN.md` counterpart must exist. `--engine` accepts comma-separated engines. Optional `--repo` links an artifact; optional caveats require both `--caveat` and `--caveat-cn`. The script creates both experiment entry files and updates both catalogs. `--hardware` describes the actual inference host, or explicitly says it was not recorded; `--test-os` and `--test-os-cn` describe test-time evidence.

3. Run `npm ci --ignore-scripts`, `npm run build`, and `npm run check`. Preview with `npm run preview`; check both languages, current-report language switching, search, combined filters, images, downloads and a narrow viewport in Chromium.
4. Commit report pairs, assets and both catalogs. A push to main builds and publishes the static GitHub Pages site.

## Historical evidence and provenance

`reports/originals/` holds full report editions; `reports/experiments/` groups them by test. HTML reports from the first import were converted to Markdown. Conversation-only recovery stays labeled as such and does not establish that source code was recovered.

`data/provenance.json` retains original source hashes, the initial import hashes and current localized file hashes. Original figures, code, commands, numeric literals, failures, uncertainty and human intervention must survive translation. When publication generalizes private paths or relocates links, document that transformation. Do not re-run the initial importer over this maintained bilingual archive.

Finding local source and publishing an artifact are separate facts. Never upload weights, `node_modules`, virtual environments, client auth, full private sessions or request logs containing credentials. Publication checks do not create a new model benchmark.
