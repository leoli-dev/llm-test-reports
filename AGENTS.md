# LLM test report archive

This is a report archive, not a model runtime or a monorepo of generated products.

- Canonical report content lives in `reports/originals/*.md`. Keep historical failures, measurements, human intervention and limits explicit. Do not silently rewrite a past conclusion using later results; add a dated update instead.
- `reports/experiments/*.md` groups report documents by test. `data/catalog.json` powers the static reader and experiment index. Use CONTRIBUTING.md and scripts/add-report.mjs when adding a new report.
- Separate local inference, LAN PC inference and cloud comparisons. A local source-code folder does not establish where inference ran.
- Product repositories use `llm-test-YYYY-MM-DD-{type}-{name}`, dated by test start. Link a pinned commit when available. Do not move product source into this repository.
- Never publish client auth, private API endpoints, credentials, full personal sessions, model weights or runtime caches. Preserve experimental facts when generalizing private paths; document publication transformations.
- Keep `site/` plain HTML, CSS and JavaScript. Build output in `dist/` must work under a GitHub Pages repository subpath, with no backend or external font requirement.
- Run `npm run build` and `npm run check` after content or site changes. For UI changes, test search, combined filters, report switching, image links and mobile overflow in Chromium. Do not use Google Chrome or Playwright channel chrome.
- The original local import inventory is external. Running scripts/import_archive.py again can replace the initial archive; prefer adding reports rather than reimporting over later edits.
