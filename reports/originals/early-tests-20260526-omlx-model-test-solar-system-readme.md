# oMLX Local LLM Model Test: Solar System Demo

Date: 2026-05-26

This folder archives a same-prompt benchmark for Hermes Agent running through oMLX local LLMs on a MacBook Pro M5 Max with 128GB RAM.

## Test Prompt

The task was to create a new project under `~/Code` without preparing git first, building a dynamic 3D solar system demo:

- Use a beautiful 3D animation to display the solar system.
- Include the Sun and 9 planets.
- Include major satellites, including the Moon.
- Objects should rotate/orbit according to plausible real-world rules.
- Users can zoom in/out.
- Clicking a planet should show a popup with text introduction.

## Environment

- Hermes Agent with oMLX local provider
- oMLX endpoint: `http://127.0.0.1:8000/v1`
- Hermes context length: `131072`
- Hermes max tokens: `8192`
- Sampling used for most tests: `temperature: 0.1`, `top_p: 0.8`, `top_k: 20`, `min_p: 0.01`
- Qwen thinking disabled where applicable

## Final Ranking

| Rank | Model | Score | Result |
| ---: | --- | ---: | --- |
| 1 | `Qwen3.6-35B-A3B-MLX-8bit` | 82/100 | Best overall. Recommended Hermes default. |
| 2 | `gemma-4-26b-a4b-it-bf16` | 68/100 | Runs, but too thin and rushed. |
| 3 | `Qwen3.6-27B-MTPLX-Optimized-Speed` | 60-65/100 | Fast, but quality and rendering correctness were weaker. |
| 4 | `Qwen3-Coder-Next-8bit` | 55/100 | Very fast, but final visual result mostly failed. |
| 5 | `gemma-4-31b-it-8bit` | 25/100 | Generated broken code; not usable. |
| 6 | `Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-8bit` | Eliminated | Too slow for agent workflow; test stopped before completion. |

## Per-Model Notes

### `Qwen3.6-35B-A3B-MLX-8bit`

Archived folder:

`solar-system-Qwen3.6-35B-A3B-MLX-8bit`

This was the best result in the test. It produced a real Three.js project with separate `index.html`, `styles.css`, and `script.js`. The app rendered properly, interactions worked, and the model appeared to perform practical verification such as browser and console checks.

Strengths:

- Best overall agent behavior.
- Real runnable project, not just a surface-level file.
- Good visual scene and usable interaction.
- Popup interaction worked.
- More careful than other models about verification.

Weaknesses:

- Missed Pluto/冥王星 despite the prompt asking for 9 planets.
- Visual polish and scale could still improve.
- Satellite coverage was not complete enough.

Conclusion:

Use this as the primary Hermes local LLM.

### `gemma-4-26b-a4b-it-bf16`

Archived folder:

`solar-system-gemma-4-26b-a4b-it-bf16`

This model produced a working single-file Three.js demo. Playwright/browser checks confirmed the page loaded, the canvas rendered, and clicking the Sun opened a popup.

Strengths:

- Runs successfully.
- Includes Sun, 9 planets, orbit lines, starfield, zoom/drag controls, and popup.
- Cleaner than the failed Gemma 31B result.

Weaknesses:

- Only a single `index.html`; no serious project structure.
- No git repo initialization.
- Planet objects were visually tiny in the default view.
- Only the Moon was included; other major satellites were missing.
- UI text and popup content were English rather than following the Chinese/Cantonese prompt.
- Felt like a quick minimal demo rather than a carefully completed task.

Conclusion:

Acceptable as a fallback or comparison model, but not recommended as the default.

### `Qwen3.6-27B-MTPLX-Optimized-Speed`

Archived folder:

`solar-system-Qwen3.6-27B-MTPLX-Optimized-Speed`

This model was fast and attempted a more structured project, but the implementation had important rendering/layout problems.

Strengths:

- Good speed.
- Attempted a Three.js implementation with UI and popup behavior.
- Useful for quick rough testing.

Weaknesses:

- Important rendering bugs.
- Some created planet objects were not correctly added to the scene.
- UI layout had issues.
- Final visual result was weaker than expected.

Conclusion:

Can be kept only as a speed-test model, but after cleanup it was removed. It is not recommended for serious Hermes agent work.

### `Qwen3-Coder-Next-8bit`

Archived folder:

`solar-system-Qwen3-Coder-Next-8bit`

This model completed very quickly and generated code that looked plausible on the surface. However, the actual browser result was poor.

Strengths:

- Very fast.
- Included Sun, 9 planets, Pluto, Moon, controls, labels, and popup in code.
- Syntax/load checks were not the main issue.

Weaknesses:

- Actual rendered page was mostly black.
- 3D bodies were barely visible or effectively not useful.
- Only Moon was included as a satellite.
- Did not show strong final-output verification.

Conclusion:

Good reminder that a coding model is not automatically a good agent model. Not recommended as Hermes default.

### `gemma-4-31b-it-8bit`

Archived folder:

`solar-system-gemma-4-31b-it-8bit`

This run failed at the code level. It generated a Vite-style project, but `src/main.js` was polluted with line-number-like prefixes and invalid fragments, causing syntax errors.

Strengths:

- Attempted a modern frontend project structure.
- Contained some relevant solar-system data.

Weaknesses:

- JavaScript syntax was broken.
- Vite could not run the app.
- Final result was unusable.

Conclusion:

Delete. Not worth keeping for Hermes agent use.

### `Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-8bit`

Archived folder:

None. The generated repo was removed because the test was stopped.

This model was eliminated mainly due to speed. During the run, oMLX showed token generation around `9.5 tok/s`, and the task was still running after about 27 minutes.

Strengths:

- None confirmed in this benchmark because the test was stopped before completion.

Weaknesses:

- Far too slow for Hermes agent workflows.
- Agent tasks require multiple tool calls and iterative reasoning, so low generation speed compounds badly.
- The model name suggests a heavily merged/style-tuned model, which is risky for stable tool use and instruction following.

Conclusion:

Do not use as Hermes default. It was deleted during model cleanup.

## Final Decision

The final selected model is:

`Qwen3.6-35B-A3B-MLX-8bit`

After the test, the local oMLX model store was cleaned up to keep only this model. Hermes local configuration was also updated so `local-omlx` only lists and defaults to:

`Qwen3.6-35B-A3B-MLX-8bit`

Recommended final settings:

```yaml
model:
  default: Qwen3.6-35B-A3B-MLX-8bit
  provider: custom
  base_url: http://127.0.0.1:8000/v1
  context_length: 131072
  max_tokens: 8192
```

Recommended oMLX sampling/settings:

```text
temperature: 0.1
top_p: 0.8
top_k: 20
min_p: 0.01
max_context_window: 131072
max_tokens: 8192
enable_thinking: false
```

## Takeaway

For Hermes Agent, the best model is not simply the largest or the fastest one. The most useful model needs stable instruction following, reliable tool use, enough speed for multi-step workflows, and the discipline to verify its own output. In this test, `Qwen3.6-35B-A3B-MLX-8bit` had the best balance.
