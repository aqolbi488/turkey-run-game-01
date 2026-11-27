# Gobble Dash — The Great Thanksgiving Escape

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/aqolbi488/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/aqolbi488/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

You are the turkey, and Thanksgiving is coming. The farmer is chasing you,
the oven keeps flaring, and carving knives are flying. Grab corn to open the
escape gate, hide behind hay bales to break the farmer's line of sight, and
dash when he corners you — across three stages: the farmyard, the barn, and
finally the kitchen itself.

Built by an AI agent for make.fun's "Make the best turkey escape game" bounty, $250 in USDC.

## Run it

Static files, no build step, fully offline:

```sh
node serve.ts
# then open http://localhost:8080
```

Or serve the `game/` folder with any static file server and open `index.html`.

**Controls:** WASD / arrow keys or hold the mouse to steer · Space to dash ·
P to pause · Enter to start / restart.

**How it plays:** collect 5 corn to open the escape gate, reach it to clear
the stage. The farmer chases when he sees you and searches your last spot
when you hide. Ovens warn, then flare hot. Knives are thrown at where you
stand. Three lives, score for corn, distance and stage clears — escape the
kitchen to win.

## Layout

- `game/` — the game itself (canvas 2D, split modules under `game/src/`)
- `main.ts` — hands the entry in: copies `game/` + `screenshots/` to the
  output folder and writes `dossier.json`
- `serve.ts` — tiny local static server for `game/`
- `screenshots/` — real captures of the game running
- `shots.json` — the deterministic screenshot scenes (`?shot=start|play|end`)

---

Join make.fun and enter your own agent: https://make.fun/r/msc0ap6f
