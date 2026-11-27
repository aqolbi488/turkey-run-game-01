// Deterministic screenshot scenes for ?shot=start|play|kitchen|end&seed=N.
// Each scene steps the real simulation with a simple autopilot (run to the
// nearest corn, keep away from the farmer and the knives), so the frame is
// what a short real game looks like and the same seed always gives it back.
// The play and kitchen scenes stop at the first lively moment — a knife in
// flight, an oven flaring hot, the farmer close enough to read as a threat
// and the turkey well framed — so the screenshot shows a run in play with
// its HUD, never an end panel.

import { FIELD, STEP } from './config.js';
import { EVENT_OVER } from './world.js';
import { SCREEN_ESCAPED, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 1.2;
const PLAY_MIN_SECONDS = 2.8;
const PLAY_CAP_SECONDS = 12;
const KITCHEN_MIN_IN_STAGE_SECONDS = 2.5;
const KITCHEN_CAP_SECONDS = 40;
const END_LIMIT_SECONDS = 240;

function autopilot(state) {
  const t = state.turkey;
  let tx = state.gate.open ? state.gate.x : FIELD.width / 2;
  let ty = state.gate.open ? state.gate.y : FIELD.height / 2;
  let best = Infinity;
  for (const corn of state.corns) {
    if (!corn.active) continue;
    const d = (corn.x - t.x) ** 2 + (corn.y - t.y) ** 2;
    if (d < best) { best = d; tx = corn.x; ty = corn.y; }
  }
  if (state.gate.open) { tx = state.gate.x; ty = state.gate.y; }
  let mx = tx - t.x;
  let my = ty - t.y;
  // Flee the farmer when close, and sidestep knives.
  const fdx = t.x - state.farmer.x;
  const fdy = t.y - state.farmer.y;
  const fd = Math.hypot(fdx, fdy);
  if (fd < 150 && fd > 0) { mx += (fdx / fd) * 220; my += (fdy / fd) * 220; }
  for (const knife of state.knives) {
    if (!knife.active) continue;
    const kd = Math.hypot(knife.x - t.x, knife.y - t.y);
    if (kd < 90) { mx += (t.x - knife.x) * 2; my += (t.y - knife.y) * 2; }
  }
  for (const oven of state.ovens) {
    if (oven.phase !== 'hot') continue;
    const od = Math.hypot(oven.x - t.x, oven.y - t.y);
    if (od < 90) { mx += (t.x - oven.x) * 2; my += (t.y - oven.y) * 2; }
  }
  const len = Math.hypot(mx, my) || 1;
  return { x: mx / len, y: my / len };
}

// A lively moment: the run is still going, a carving knife is in flight, an
// oven is flaring hot, the farmer is 80–350 px from the turkey (near enough
// to read as the threat, not yet on top of it), and hunter and hunted both
// sit clear of the field edges and the HUD so the frame reads at a
// glance when shrunk.
function isLively(state) {
  if (state.over || state.escaped) return false;
  const t = state.turkey;
  const f = state.farmer;
  const farmerDist = Math.hypot(t.x - f.x, t.y - f.y);
  if (farmerDist < 80 || farmerDist > 350) return false;
  if (!state.knives.some((knife) => knife.active)) return false;
  if (!state.ovens.some((oven) => oven.phase === 'hot')) return false;
  if (t.x < 70 || t.x > FIELD.width - 70) return false;
  if (t.y < 95 || t.y > FIELD.height - 60) return false;
  if (f.x < 40 || f.x > FIELD.width - 40) return false;
  if (f.y < 70 || f.y > FIELD.height - 40) return false;
  return true;
}

export function stageShot(name, world) {
  if (name !== 'play' && name !== 'kitchen' && name !== 'end') {
    // Title scene: a breath of ambient play, farmer kept at his start corner
    // so the turkey is untouched behind the title panel.
    world.state.farmer.x = FIELD.width - 60;
    world.state.farmer.y = 80;
    for (let i = 0; i < START_SECONDS / STEP; i += 1) {
      world.state.farmer.x = FIELD.width - 60;
      world.state.farmer.y = 80;
      world.step(STEP, { x: 0, y: 0 }, false);
    }
    world.state.message = '';
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'play' || name === 'kitchen') {
    // Run-in-play scenes: autopilot until the first lively moment, then stop
    // mid-run and show the play screen — no end panel over the field. The
    // play scene takes the first lively moment in Stage 1 after ~3 s; the
    // kitchen scene plays through Stages 1–2 and takes the first lively
    // moment at least ~2.5 s into Stage 3. If the cap passes with no lively
    // moment but the run is still going, the cap frame is still a run in
    // play; only a run that ended early reports its honest end screen.
    const isKitchen = name === 'kitchen';
    const cap = isKitchen ? KITCHEN_CAP_SECONDS : PLAY_CAP_SECONDS;
    let stageEnteredAt = 0;
    let prevStage = world.state.stage;
    let found = false;
    for (let i = 0; i < cap / STEP; i += 1) {
      const events = world.step(STEP, autopilot(world.state), false);
      const state = world.state;
      if (state.stage !== prevStage) { prevStage = state.stage; stageEnteredAt = state.time; }
      if (events & EVENT_OVER) break;
      if (state.escaped) break;
      const ready = isKitchen
        ? state.stage === 2 && state.time - stageEnteredAt >= KITCHEN_MIN_IN_STAGE_SECONDS
        : state.stage === 0 && state.time >= PLAY_MIN_SECONDS;
      if (ready && isLively(state)) { found = true; break; }
    }
    const state = world.state;
    if (found || (!state.over && !state.escaped)) {
      return { screen: SCREEN_PLAY, best: Math.floor(state.score) };
    }
    const screen = state.escaped ? SCREEN_ESCAPED : SCREEN_OVER;
    return { screen, best: Math.floor(state.score) };
  }
  // End scene: the pilot plays well for a while, then stands still and lets
  // the farmer catch it — a real caught ending, not a staged pose.
  for (let i = 0; i < END_LIMIT_SECONDS / STEP; i += 1) {
    const move = i > 8 / STEP ? { x: 0, y: 0 } : autopilot(world.state);
    const events = world.step(STEP, move, false);
    if (events & EVENT_OVER) break;
    if (world.state.escaped) break;
  }
  const state = world.state;
  const screen = state.escaped ? SCREEN_ESCAPED : state.over ? SCREEN_OVER : SCREEN_PLAY;
  return { screen, best: Math.floor(state.score) };
}
