# Initial publication checks · 2026-10-20

- Built 50 experiment/parameter/comparison records and 73 Markdown documents.
- Validated all report-to-document references, rendered reader links and local image paths.
- Verified that imported Markdown cannot execute scripts, event handlers or javascript links in the static reader.
- Chromium checked all 50 experiment rows, search, no-result state, combined engine/location filters, three cloud records, report navigation and document switching.
- Chromium checked the archive and Tank Battle report at a 390px viewport with no horizontal page overflow. Page errors and failed resource requests were zero.
- Initial publication includes source provenance hashes. Credential-pattern, private-key and credential-filename scans found no matches in the selected report or Tank Battle publishing trees.
- Neon Bastion rename preserves its original history. Its unchanged game built and all 149 unit tests passed.
- Tank Battle game/src matches the final experimental workspace byte for byte. Its publishing checkout built; maze structure, r3-smoke, r3-flow and r4-layout passed in Chromium at an isolated local port.

These are publication and regression checks. They do not create a new LLM run, new performance sample or renewed model ranking. They do not establish that all historical claims have been independently remeasured.
