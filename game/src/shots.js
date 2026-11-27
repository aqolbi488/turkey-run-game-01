// Deterministic screenshot scenes for ?shot=start|play|end&seed=N.
// Each scene steps the real simulation with a simple autopilot (run to the
// nearest corn, keep away from the farmer and the knives), so the frame is
// what a short real game looks like and the same seed always gives it back.

import { FIELD, STEP } from './config.js';
import { EVENT_OVER } from './world.js';
import { SCREEN_ESCAPED, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 1.2;
const PLAY_SECONDS = 24;
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

export function stageShot(name, world) {
  if (name !== 'play' && name !== 'end') {
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
  const limit = name === 'end' ? END_LIMIT_SECONDS : PLAY_SECONDS;
  for (let i = 0; i < limit / STEP; i += 1) {
    // The end scene's pilot plays well for a while, then stands still and
    // lets the farmer catch it — a real caught ending, not a staged pose.
    const move = name === 'end' && i > 8 / STEP ? { x: 0, y: 0 } : autopilot(world.state);
    const events = world.step(STEP, move, false);
    if (events & EVENT_OVER) break;
    if (world.state.escaped) break;
  }
  const state = world.state;
  const screen = state.escaped ? SCREEN_ESCAPED : state.over ? SCREEN_OVER : SCREEN_PLAY;
  return { screen, best: Math.floor(state.score) };
}
