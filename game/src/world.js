// The simulation: turkey, farmer, knives, ovens, corn, hay bales and the
// escape gate across three stages (farmyard, barn, kitchen). Pure stepping —
// no drawing, no DOM — so the screenshot scenes can run it headlessly.

import { CORN, FARMER, FIELD, GATE, KNIFE, METERS_PER_SECOND, OVEN, SCORE, STAGES, TURKEY } from './config.js';
import { makeRandom, range } from './random.js';

export const EVENT_NONE = 0;
export const EVENT_CORN = 1;
export const EVENT_HURT = 2;
export const EVENT_SPOTTED = 4;
export const EVENT_STAGE = 8;
export const EVENT_OVER = 16;
export const EVENT_ESCAPED = 32;
export const EVENT_KNIFE = 64;
export const EVENT_OVEN = 128;

const BALE = { w: 74, h: 40 };

function dist2(ax, ay, bx, by) { const dx = ax - bx; const dy = ay - by; return dx * dx + dy * dy; }
function clamp(value, low, high) { return Math.min(high, Math.max(low, value)); }

export function createWorld(seed) {
  const random = makeRandom(seed);
  const state = {
    time: 0, stage: 0, score: 0, distance: 0, cornGot: 0, lives: TURKEY.lives,
    over: false, escaped: false, spotted: false, message: '', messageUntil: 0,
    turkey: { x: 120, y: FIELD.height / 2, vx: 0, vy: 0, dashLeft: 0, dashReadyAt: 0, hurtUntil: 0, facing: 1, hidden: false },
    farmer: { x: FIELD.width - 90, y: 90, mode: 'chase', lastSeenX: 0, lastSeenY: 0, searchUntil: 0, sightLostAt: -1, facing: -1 },
    knives: [], corns: [], ovens: [], bales: [],
    gate: { x: FIELD.width - 60, y: FIELD.height - 70, open: false },
    nextKnifeAt: KNIFE.firstDelay,
  };

  function say(text, seconds = 2.2) { state.message = text; state.messageUntil = state.time + seconds; }

  function placeCorn() {
    for (let tries = 0; tries < 24; tries += 1) {
      const x = range(random, 50, FIELD.width - 50);
      const y = range(random, 70, FIELD.height - 50);
      if (dist2(x, y, state.turkey.x, state.turkey.y) < 90 * 90) continue;
      if (state.bales.some((b) => x > b.x - 14 && x < b.x + b.w + 14 && y > b.y - 14 && y < b.y + b.h + 14)) continue;
      state.corns.push({ x, y, active: true, bob: random() * 6.28 });
      return;
    }
    state.corns.push({ x: FIELD.width / 2, y: 120, active: true, bob: 0 });
  }

  function setupStage(index) {
    const stage = STAGES[index];
    state.stage = index;
    state.bales = [];
    for (let i = 0; i < stage.bales; i += 1) {
      state.bales.push({ x: range(random, 90, FIELD.width - 190), y: range(random, 90, FIELD.height - 130), w: BALE.w, h: BALE.h });
    }
    state.ovens = [];
    for (let i = 0; i < stage.ovens; i += 1) {
      state.ovens.push({ x: range(random, 140, FIELD.width - 140), y: range(random, 110, FIELD.height - 110), phase: 'idle', at: state.time + range(random, 1.5, 4) });
    }
    state.corns = [];
    for (let i = 0; i < CORN.perStage; i += 1) placeCorn();
    state.knives = [];
    state.nextKnifeAt = state.time + KNIFE.firstDelay;
    state.gate.open = false;
    state.farmer.x = FIELD.width - 90; state.farmer.y = 90; state.farmer.mode = 'chase'; state.farmer.sightLostAt = -1;
    say(stage.name + ' — grab ' + GATE.cornNeeded + ' corn, then reach the gate!', 3);
  }

  function insideBale(x, y, pad = 0) {
    return state.bales.some((b) => x > b.x - pad && x < b.x + b.w + pad && y > b.y - pad && y < b.y + b.h + pad);
  }

  function lineBlocked(ax, ay, bx, by) {
    for (let t = 0.1; t < 0.95; t += 0.08) {
      if (insideBale(ax + (bx - ax) * t, ay + (by - ay) * t, 2)) return true;
    }
    return false;
  }

  function hurt(events) {
    const t = state.turkey;
    if (state.time < t.hurtUntil || state.over) return events;
    state.lives -= 1;
    t.hurtUntil = state.time + TURKEY.hurtGrace;
    events |= EVENT_HURT;
    if (state.lives <= 0) { state.over = true; events |= EVENT_OVER; }
    else say('Ouch! ' + state.lives + (state.lives === 1 ? ' life' : ' lives') + ' left — keep running!');
    return events;
  }

  function step(dt, move, wantDash) {
    let events = EVENT_NONE;
    if (state.over || state.escaped) return events;
    state.time += dt;
    state.distance += METERS_PER_SECOND * dt;
    state.score += SCORE.perSecond * dt + SCORE.perMeter * METERS_PER_SECOND * dt;

    const t = state.turkey;
    const f = state.farmer;
    const stage = STAGES[state.stage];

    // Turkey movement, with a short dash on demand.
    if (wantDash && state.time >= t.dashReadyAt) { t.dashLeft = TURKEY.dashSeconds; t.dashReadyAt = state.time + TURKEY.dashCooldown; }
    const speed = t.dashLeft > 0 ? TURKEY.dashSpeed : TURKEY.speed;
    t.dashLeft = Math.max(0, t.dashLeft - dt);
    t.x = clamp(t.x + move.x * speed * dt, TURKEY.radius, FIELD.width - TURKEY.radius);
    t.y = clamp(t.y + move.y * speed * dt, 44 + TURKEY.radius, FIELD.height - TURKEY.radius);
    if (move.x !== 0) t.facing = move.x > 0 ? 1 : -1;
    t.hidden = insideBale(t.x, t.y, 4);

    // Farmer: chase when he sees the turkey, search the last spot when he loses it.
    const sees = !t.hidden && !lineBlocked(f.x, f.y, t.x, t.y);
    if (sees) {
      if (!state.spotted) { events |= EVENT_SPOTTED; say('Spotted! The farmer is coming!'); }
      state.spotted = true;
      f.lastSeenX = t.x; f.lastSeenY = t.y; f.sightLostAt = -1; f.mode = 'chase';
    } else if (state.spotted) {
      if (f.sightLostAt < 0) f.sightLostAt = state.time;
      if (state.time - f.sightLostAt > FARMER.loseSightSeconds) { state.spotted = false; f.mode = 'search'; f.searchUntil = state.time + FARMER.searchSeconds; say('You broke his line of sight — stay hidden!'); }
    }
    let tx = f.lastSeenX; let ty = f.lastSeenY;
    if (f.mode === 'chase' && sees) { tx = t.x; ty = t.y; }
    if (f.mode === 'search' && state.time > f.searchUntil) { f.mode = 'chase'; tx = FIELD.width / 2; ty = FIELD.height / 2; }
    const fdx = tx - f.x; const fdy = ty - f.y;
    const flen = Math.hypot(fdx, fdy) || 1;
    const fspeed = stage.farmerSpeed * (f.mode === 'search' ? 0.72 : 1);
    if (flen > 6) { f.x += (fdx / flen) * fspeed * dt; f.y += (fdy / flen) * fspeed * dt; f.facing = fdx >= 0 ? 1 : -1; }
    if (dist2(f.x, f.y, t.x, t.y) < FARMER.catchRadius * FARMER.catchRadius) events = hurt(events);

    // Carving knives: thrown from the kitchen side at the turkey's position.
    if (state.time >= state.nextKnifeAt && state.knives.length < stage.knives + 2) {
      const fromTop = random() < 0.5;
      const kx = clamp(t.x + range(random, -60, 60), 20, FIELD.width - 20);
      const ky = fromTop ? 46 : FIELD.height - 20;
      const dx = t.x - kx; const dy = t.y - ky; const len = Math.hypot(dx, dy) || 1;
      state.knives.push({ x: kx, y: ky, vx: (dx / len) * KNIFE.speed, vy: (dy / len) * KNIFE.speed, spin: 0, active: true });
      state.nextKnifeAt = state.time + Math.max(KNIFE.minInterval, 2.6 - state.stage * 0.5) * range(random, 0.8, 1.3);
      events |= EVENT_KNIFE;
    }
    for (const knife of state.knives) {
      if (!knife.active) continue;
      knife.x += knife.vx * dt; knife.y += knife.vy * dt; knife.spin += dt * 14;
      if (knife.x < -20 || knife.x > FIELD.width + 20 || knife.y < 30 || knife.y > FIELD.height + 20) { knife.active = false; continue; }
      if (insideBale(knife.x, knife.y, 0)) { knife.active = false; continue; }
      if (dist2(knife.x, knife.y, t.x, t.y) < (KNIFE.radius + TURKEY.radius - 4) ** 2) { knife.active = false; events = hurt(events); }
    }

    // Ovens flare on a cycle: warn, then hot. Standing in a hot oven hurts.
    for (const oven of state.ovens) {
      if (oven.phase === 'idle' && state.time >= oven.at) { oven.phase = 'warn'; oven.at = state.time + OVEN.warnSeconds; }
      else if (oven.phase === 'warn' && state.time >= oven.at) { oven.phase = 'hot'; oven.at = state.time + OVEN.hotSeconds; events |= EVENT_OVEN; }
      else if (oven.phase === 'hot' && state.time >= oven.at) { oven.phase = 'idle'; oven.at = state.time + range(random, 2.5, 5); }
      if (oven.phase === 'hot' && dist2(oven.x, oven.y, t.x, t.y) < (OVEN.radius + TURKEY.radius - 6) ** 2) events = hurt(events);
    }

    // Corn and the gate.
    for (const corn of state.corns) {
      if (!corn.active) continue;
      if (dist2(corn.x, corn.y, t.x, t.y) < (CORN.radius + TURKEY.radius) ** 2) {
        corn.active = false; state.cornGot += 1; state.score += SCORE.corn; events |= EVENT_CORN;
        if (state.cornGot % GATE.cornNeeded === 0) state.gate.open = true;
        placeCorn();
      }
    }
    if (state.gate.open && dist2(state.gate.x, state.gate.y, t.x, t.y) < (GATE.radius + TURKEY.radius) ** 2) {
      if (state.stage < STAGES.length - 1) {
        state.score += SCORE.stageBonus; events |= EVENT_STAGE;
        t.x = 120; t.y = FIELD.height / 2;
        setupStage(state.stage + 1);
      } else {
        state.score += SCORE.escapeBonus; state.escaped = true; events |= EVENT_ESCAPED;
      }
    }
    return events;
  }

  setupStage(0);
  return { state, step, reset() { return createWorld(seed); } };
}
