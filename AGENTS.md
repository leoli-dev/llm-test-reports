# LLM test report archive

[English](AGENTS.md) | [简体中文](AGENTS_CN.md)

This repository stores reports, rather than a model runtime or generated-product monorepo.

- Full report editions live in `reports/originals/*.md`. English is the unsuffixed default; every report and reader-facing document has a full Chinese `_CN.md` counterpart. Preserve historical failures, measurements, human intervention and limits. Add dated updates instead of silently replacing past conclusions.
- `reports/experiments/*.md` groups documents by test. `data/catalog.json` and `data/catalog_CN.json` power the English and Chinese readers. Keep document IDs stable across languages. Follow CONTRIBUTING.md and use scripts/add-report.mjs with a report pair.
- Record actual inference-host hardware and test-time OS/version/build, with evidence. `environment.md` is a dated current workstation reference; do not substitute its current OS for undocumented historical conditions. Mark unknowns explicitly.
- Distinguish local, LAN PC and cloud inference, and label client versus inference host. A local source-code folder does not establish where inference ran.
- Product repositories use `llm-test-YYYY-MM-DD-{type}-{name}`, dated by test start. Link a pinned commit when possible. Keep product source in its own repository.
- Never publish client auth, private endpoints, credentials, full personal sessions, model weights or runtime caches. Preserve facts when generalizing private paths and document publication transformations.
- Keep `site/` plain HTML, CSS and JavaScript. The English entry is `index.html`; Chinese is `index_CN.html`. Preserve report selection when switching language. `dist/` must work under a GitHub Pages repository subpath without a backend or external fonts.
- Run `npm run build` and `npm run check` after changes. For UI changes, verify both languages, search, combined filters, report switching, images, downloads and mobile overflow in Chromium. Do not use Google Chrome or Playwright channel chrome.
- Original code, commands, figures and literal evidence retain their source language. Translate surrounding explanations; do not redraw screenshots or alter numbers to suggest a different outcome. Preserve provenance and the source-code translation audit.
- The original local import inventory is external. The initial importer must not overwrite the maintained bilingual archive; add paired reports instead.

## Local devlog scope

- Project slug: `llm-test-reports`.
- Devlog root: `~/Code/project-devlog/`; follow that repository's `AGENTS.md` and the `devlog` skill.
- Project hub: `~/Code/project-devlog/projects/llm-test-reports/index.md`.
- Before project work, read the hub and `~/Code/project-devlog/projects/llm-test-reports/backlog.md`.
- Keep project progress and TODOs in that backlog; append meaningful session outcomes to `log.md` and link supporting notes from `index.md`.
- This scope owns the report archive, static site, report import/publication and documentation.
- Historical model-test methodology and cross-model comparisons remain in `~/Code/project-devlog/projects/qwen3.8-test/`; the global public report archive is `~/Code/llm-test-reports/`. Cross-link rather than duplicate their progress lists.
