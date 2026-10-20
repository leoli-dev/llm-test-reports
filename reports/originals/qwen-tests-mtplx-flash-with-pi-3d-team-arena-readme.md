# NEON BASTION — 4v4 sector assault

A browser 4v4 team-elimination FPS: you plus three AI allies against four AI enemies, on a
hand-built arena, with no backend, no network requests and no external assets (geometry,
sound and UI are all generated at runtime).

Stack: **Vite + TypeScript + Three.js**. Game logic lives in `src/game/**` and never imports
Three.js or the DOM, so the whole simulation runs and is tested in plain Node.

---

## Run it

```bash
npm install
npm run dev            # http://127.0.0.1:5173  (click START MATCH — audio + pointer lock start there)
```

Other commands:

```bash
npm run build          # tsc --noEmit && vite build  (type-check + production bundle)
npm run preview        # serve the built bundle on :4173
npm test               # unit tests (vitest): map geometry, hitscan, match rules, AI
npm run test:e2e       # Playwright end-to-end (Chromium, SwiftShader for WebGL)
npm run test:all       # both
CAPTURE=1 npm run test:e2e   # also regenerates ./screenshots from real running matches
```

Browser: any WebGL2 Chrome/Safari/Firefox. Without WebGL the game falls back to a 2D
top-down renderer (see below) so it is still playable.

## Controls

| key | action |
| --- | --- |
| `WASD` | move |
| `Shift` | sprint (louder: nearby AI hear you) |
| `Space` | jump |
| mouse | look (pointer lock) |
| left click | fire (hitscan, spread grows while holding) |
| `R` | reload |
| `Tab` | scoreboard |
| `F` | change spectated unit (after you die) |
| `V` | director mode — HUD hidden, orbit camera |
| `M` | mute |
| `Esc` / `P` | pause (pointer-lock loss also pauses) |

URL flags: `?seed=N` (deterministic match), `?headless=1` (skip the start screen and pointer
lock — used by the E2E tests), `?nogl=1` (force the 2D fallback renderer), `?nomotion=1`
(reduced motion: no shake, no particles), `?director=1` (start in orbit mode),
`?states=1` (show the AI state readout).

## What a match is

4 v 4, one life each, first team wiped wins; a 10-minute limit decides the rest by bodies
left, then by score. You are `VULA` on blue. Body shots cost 20, headshots 50, a kill is
+1 hit point and +3 kill points, friendly fire does nothing at all (a teammate in the way
absorbs the ray and nobody scores).

## Layout of the code

```
src/game/            pure simulation, no DOM/WebGL imports (runs in Node)
  util.ts            seeded RNG (mulberry32), math helpers
  map/arenaData.ts   THE map: every block, ramp, spawn, zone, nav node
  map/build.ts       derives collision, floor heights, ray occlusion, nav grid, minimap
  nav.ts             0.5 m walkability grid + A* used by the bots
  physics.ts         cylinder-vs-world movement, ground/step-up, gravity
  combat.ts          hitscan (ray vs AABB slab + ramp heightfield, one hit per ray), weapons
  ai.ts              perception + state machine + steering
  match.ts           fixed 60 Hz tick, damage/score, death + spectate, win check, restart
src/render/          Three.js scene, instanced geometry, tracers, sparks, 2D fallback view
src/ui/hud.ts        DOM HUD: crosshair, health, ammo, kill feed, scoreboard, minimap, screens
src/main.ts          bootstrap: input, fixed-step loop, camera modes, pause, test hooks
tests/unit/          vitest (geometry, hitscan rules, match rules, AI)
tests/e2e/           Playwright (real browser runs through the real renderer)
```

### One source of truth for geometry

Collision, hitscan occlusion, AI navigation and the minimap all read the same derived `World`
object built from `arenaData.ts`. A wall that blocks a bullet blocks a body, blocks a bot's
path, and is drawn on the minimap — there is no second "visual" geometry to drift out of sync.
The arena is 180° rotationally symmetric (`sym: true` mirrors a prop through the origin), and
unit tests assert: no spawn has line-of-sight to an enemy spawn, no straight lane longer than
11 m runs the length of the map, every spawn can reach the deck/flanks/maze/enemy bay, and no
nav edge tunnels through a wall.

### Hitscan

`traceShot` tests geometry first (exact slab test against AABBs plus a marching sampler over
ramp heightfields), then bodies (capsule + head sphere), and keeps the **nearest** blocker.
A bullet stops at the first thing it meets, so cover works, teammates absorb shots, and a
target behind a wall cannot be hit. Spread grows with sustained fire and movement and decays
after a pause.

### Bots

Perception is deliberately limited: a target is only "seen" if it is inside a ~100° cone (or
within ~10 m), inside sight range, and reachable by a clear ray — no wallhacks, no
wallhack-adjacent "hearing through walls". Hearing only gives a *direction to investigate*.
States: `spawn_rally → advance → alert → take_cover → engage → search → careful_push`, plus a
per-bot lane route (`west` / `center` / `east`) that keeps them crossing the map instead of
loitering. Reaction delay, burst discipline and an accuracy roll mean a bot is dangerous, not
instant-death. Same rules for both teams.

### Determinism and the test surface

The simulation ticks on a fixed 1/60 s step decoupled from rendering, uses a seeded RNG per
unit/tick/shot, and reads no clock, no `Math.random`, no DOM. `window.__teamArenaTest` exposes
inspection and *input injection* only — `step()`, `input()`, `place()`, `shoot()` all go
through the normal resolution code, so tests cannot bypass wall occlusion or scoring:
`tests/e2e/game.spec.ts` proves a shot through a pillar deals nothing while the same shot with
a clear line does.

Performance: geometry is instanced (one instanced mesh for solid volumes, one for decks),
tracers and impact sparks come from fixed-size pools, and the loop caps catch-up at 5 logic
steps per frame. In headless Chromium (SwiftShader, no GPU) the frame budget measured by the
E2E perf test stays under 20 ms with all 8 units plus effects; on an M-series MacBook with a
real GPU it holds 60 fps.

## Tests

```
tests/unit/map.test.ts      geometry invariants, LOS/lane sweeps, nav connectivity
tests/unit/combat.test.ts   hitscan: cover blocks, one hit per ray, head vs body, friendlies absorb
tests/unit/rules.test.ts    scoring, kill bonus, no double-count, wipe ends the match
tests/unit/ai.test.ts       perception (no wallhack), peripheral awareness, walked paths never cross walls,
                            and a full 2400-tick AI-vs-AI run where nobody ever moves through geometry
tests/unit/sim.test.ts      full matches run to a decided result, deterministic per seed, restart is clean
tests/e2e/game.spec.ts    boot/audio-gate, movement, hitscan-through-wall, AI brawl, death→spectate,
                          reload/scoreboard, 2D fallback, reduced motion, frame-budget check
```

## Screenshots

`screenshots/` is generated by `CAPTURE=1 npm run test:e2e` from actual running matches
(the firefight frame is a staged fight, the mid-match frame is 2400 ticks of AI-vs-AI combat).

## Known limits

* Bots are tuned for readable fights, not for公平: some seeds drift into a low-contact
  stalemate and finish on the time limit (decided by bodies left, then score).
* Damage numbers, kill feed and the minimap are correct-by-construction but visually crude.
* Sound is synthesised on the fly and intentionally minimal (gunshot, hit, kill, reload,
  footsteps, ambient hum, match end sting).
* The 2D fallback exists for capability, not for comfort: keyboard aim is coarse.
