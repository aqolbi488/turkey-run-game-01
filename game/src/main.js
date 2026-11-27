// Entry point: wires input, audio, the world and the renderer together,
// runs the fixed-step loop, and handles the ?shot= screenshot scenes.

import { FIELD, STEP } from './config.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { SCREEN_ESCAPED, SCREEN_OVER, SCREEN_PAUSE, SCREEN_PLAY, SCREEN_TITLE, drawGame } from './render.js';
import { stageShot } from './shots.js';
import { EVENT_CORN, EVENT_ESCAPED, EVENT_HURT, EVENT_KNIFE, EVENT_OVEN, EVENT_OVER, EVENT_SPOTTED, EVENT_STAGE, createWorld } from './world.js';

const canvas = document.getElementById('game');
canvas.width = FIELD.width;
canvas.height = FIELD.height;
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed')) || 7;
const shot = params.get('shot');

const input = createInput(canvas);
const audio = createAudio();

let world = createWorld(seed);
let screen = SCREEN_TITLE;
let best = 0;
let last = performance.now();
let accumulator = 0;

function announce(text) { if (status) status.textContent = text; }

function startRun() {
  world = createWorld(seed + Math.floor(performance.now() / 1000) % 997);
  screen = SCREEN_PLAY;
  audio.unlock();
  audio.gobble();
  announce('Run! Grab corn, dodge the farmer, reach the gate.');
}

function handleEvents(events) {
  if (events & EVENT_CORN) audio.corn();
  if (events & EVENT_HURT) audio.hurt();
  if (events & EVENT_SPOTTED) audio.spotted();
  if (events & EVENT_KNIFE) audio.knife();
  if (events & EVENT_OVEN) audio.oven();
  if (events & EVENT_STAGE) { audio.stage(); announce('Stage cleared!'); }
  if (events & EVENT_OVER) { screen = SCREEN_OVER; best = Math.max(best, Math.floor(world.state.score)); audio.caught(); announce('Caught! Press Enter to run again.'); }
  if (events & EVENT_ESCAPED) { screen = SCREEN_ESCAPED; best = Math.max(best, Math.floor(world.state.score)); audio.escaped(); announce('You escaped! Press Enter to run again.'); }
}

function moveVector() {
  const s = input.state;
  if (s.pointerDown) {
    const t = world.state.turkey;
    const dx = s.pointerX - t.x;
    const dy = s.pointerY - t.y;
    const len = Math.hypot(dx, dy);
    if (len > 8) return { x: dx / len, y: dy / len };
    return { x: 0, y: 0 };
  }
  return { x: s.x, y: s.y };
}

function frame(now) {
  requestAnimationFrame(frame);
  const elapsed = Math.min(0.25, (now - last) / 1000);
  last = now;

  const wantStart = input.consumeAnyKey() && (input.pressed('enter') || input.state.pointerDown || screen === SCREEN_TITLE);
  if ((screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_ESCAPED) && (input.pressed('enter') || input.state.pointerDown)) {
    startRun();
  } else if (screen === SCREEN_TITLE && wantStart) {
    startRun();
  }
  if (input.pressed('p')) {
    if (screen === SCREEN_PLAY) screen = SCREEN_PAUSE;
    else if (screen === SCREEN_PAUSE) screen = SCREEN_PLAY;
  }

  if (screen === SCREEN_PLAY) {
    accumulator += elapsed;
    while (accumulator >= STEP) {
      const events = world.step(STEP, moveVector(), input.consumeDash());
      if (events) handleEvents(events);
      accumulator -= STEP;
      if (screen !== SCREEN_PLAY) break;
    }
  }
  drawGame(ctx, world, screen, best);
}

if (shot) {
  const staged = stageShot(shot, world);
  screen = staged.screen;
  best = staged.best;
  drawGame(ctx, world, screen, best);
  document.title = 'Gobble Dash — ' + shot;
  window.__shotReady = true;
} else {
  announce('Gobble Dash. Press Enter or click to run.');
  requestAnimationFrame(frame);
}
