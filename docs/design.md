# Archive design

[English](design.md) | [简体中文](design_CN.md)

The main task is finding a past experiment and reading its actual evidence. The interface uses a quiet laboratory archive: a cool blue navigation rail, white report paper, and measured typography. The memorable element is the pair of real model-built game images, rather than decorative graphics.

- Palette: ink #183447, deep blue #194f76, teal #186f6a, ground #f4f7fa, paper #ffffff, rules #dce5ec.
- Typography: local Avenir Next / system sans with Chinese system fallbacks; no remote font request. Monospace is reserved for report code.
- Layout: left-aligned persistent archive navigation; two featured artifacts; a dense, searchable experiment register; a separate reading view with report selector and heading navigation.
- Interaction: stable hash links, independent text/engine/location filters, visible empty state, Markdown download and original GitHub link. Reports stay readable at narrow widths, with tables scrolling inside the report.
- Restraint: no automated entrance animation, no decorative metrics dashboard, no background image generation. Screenshots are historical evidence from the experiments.

- Language: `index.html` is English; `index_CN.html` is Chinese. Language switching preserves the current report and filters. Markdown and catalogs use `_CN` pairs.
- Environment: the overview shows a dated workstation reference; report views distinguish current and test-time OS and identify client versus inference-host roles.
