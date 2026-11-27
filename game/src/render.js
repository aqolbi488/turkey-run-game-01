// All drawing: autumn farmyard-to-kitchen scenes, the turkey, the farmer,
// knives, ovens, corn, hay bales, the HUD and the title / end screens.
// Plain canvas shapes in a warm Thanksgiving palette — no image files.

import { FIELD, GATE, STAGES } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSE = 'pause';
export const SCREEN_OVER = 'over';
export const SCREEN_ESCAPED = 'escaped';

const INK = '#2b1a0e';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawGround(ctx, state) {
  const stage = STAGES[state.stage];
  ctx.fillStyle = stage.sky;
  ctx.fillRect(0, 0, FIELD.width, 64);
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, 64, FIELD.width, FIELD.height - 64);
  ctx.fillStyle = stage.groundDark;
  for (let i = 0; i < 26; i += 1) {
    const x = (i * 173 + state.stage * 61) % FIELD.width;
    const y = 84 + ((i * 97) % (FIELD.height - 120));
    ctx.fillRect(x, y, 26, 4);
  }
  // Autumn leaves scattered on the ground.
  const leafColors = ['#d97e4a', '#c1502e', '#e8a65c', '#a63d2a'];
  for (let i = 0; i < 18; i += 1) {
    ctx.fillStyle = leafColors[i % leafColors.length];
    const x = (i * 211 + 40) % FIELD.width;
    const y = 90 + ((i * 137) % (FIELD.height - 130));
    ctx.beginPath(); ctx.ellipse(x, y, 7, 4, i, 0, 6.29); ctx.fill();
  }
  if (state.stage === 2) {
    ctx.fillStyle = '#6e4a2f';
    ctx.fillRect(0, 64, FIELD.width, 10);
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillStyle = '#ffe9c4';
    ctx.fillText('THE KITCHEN — mind the oven!', 16, 92);
  } else if (state.stage === 1) {
    ctx.fillStyle = '#5d3a22';
    ctx.fillRect(0, 64, FIELD.width, 10);
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillStyle = '#ffe9c4';
    ctx.fillText('THE BARN', 16, 92);
  }
}

function drawBale(ctx, bale) {
  ctx.fillStyle = '#e3b34e';
  roundRect(ctx, bale.x, bale.y, bale.w, bale.h, 8); ctx.fill();
  ctx.strokeStyle = '#b98a2e'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = '#c99a35'; ctx.lineWidth = 2;
  for (let i = 1; i < 4; i += 1) { ctx.beginPath(); ctx.moveTo(bale.x + (bale.w / 4) * i, bale.y + 4); ctx.lineTo(bale.x + (bale.w / 4) * i, bale.y + bale.h - 4); ctx.stroke(); }
}

function drawOven(ctx, oven, time) {
  ctx.fillStyle = '#3a3f4a';
  roundRect(ctx, oven.x - 30, oven.y - 26, 60, 52, 6); ctx.fill();
  ctx.strokeStyle = '#171a20'; ctx.lineWidth = 3; ctx.stroke();
  const hot = oven.phase === 'hot';
  const warn = oven.phase === 'warn';
  ctx.fillStyle = hot ? '#ff6b35' : warn ? (Math.sin(time * 18) > 0 ? '#ffb347' : '#5a3a22') : '#22262e';
  roundRect(ctx, oven.x - 20, oven.y - 12, 40, 28, 4); ctx.fill();
  ctx.fillStyle = '#e8e8e8';
  for (let i = 0; i < 3; i += 1) { ctx.beginPath(); ctx.arc(oven.x - 14 + i * 14, oven.y - 19, 3.5, 0, 6.29); ctx.fill(); }
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('OVEN', oven.x, oven.y + 40);
  ctx.textAlign = 'left';
  if (hot) { ctx.strokeStyle = 'rgba(255,107,53,0.55)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(oven.x, oven.y, 44, 0, 6.29); ctx.stroke(); }
}

function drawCorn(ctx, corn, time) {
  const bob = Math.sin(time * 3 + corn.bob) * 2;
  ctx.fillStyle = '#ffd23f';
  roundRect(ctx, corn.x - 5, corn.y - 11 + bob, 10, 22, 5); ctx.fill();
  ctx.strokeStyle = '#d9a521'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#7fae4c';
  ctx.beginPath(); ctx.ellipse(corn.x - 7, corn.y + 8 + bob, 5, 9, -0.6, 0, 6.29); ctx.fill();
  ctx.beginPath(); ctx.ellipse(corn.x + 7, corn.y + 8 + bob, 5, 9, 0.6, 0, 6.29); ctx.fill();
}

function drawKnife(ctx, knife) {
  ctx.save();
  ctx.translate(knife.x, knife.y);
  ctx.rotate(knife.spin);
  ctx.fillStyle = '#dfe6ee';
  ctx.beginPath(); ctx.moveTo(-14, -4); ctx.lineTo(6, -4); ctx.lineTo(14, 0); ctx.lineTo(6, 4); ctx.lineTo(-14, 4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8b98a8'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(-20, -3, 7, 6);
  ctx.restore();
}

function drawGate(ctx, gate) {
  ctx.strokeStyle = gate.open ? '#7fae4c' : '#8a8a8a';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(gate.x, gate.y, 28, 0, 6.29); ctx.stroke();
  ctx.fillStyle = gate.open ? 'rgba(127,174,76,0.25)' : 'rgba(120,120,120,0.18)';
  ctx.beginPath(); ctx.arc(gate.x, gate.y, 28, 0, 6.29); ctx.fill();
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillStyle = gate.open ? '#2f5d1f' : '#555';
  ctx.textAlign = 'center';
  ctx.fillText(gate.open ? 'ESCAPE!' : 'GATE', gate.x, gate.y + 4);
  ctx.textAlign = 'left';
}

function drawTurkey(ctx, turkey, time) {
  const hurt = time < turkey.hurtUntil && Math.sin(time * 30) > 0;
  ctx.save();
  ctx.translate(turkey.x, turkey.y);
  ctx.scale(turkey.facing, 1);
  // Tail feathers.
  const featherColors = ['#c1502e', '#e8a65c', '#a63d2a', '#d97e4a', '#b98a2e'];
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = featherColors[i];
    ctx.beginPath(); ctx.ellipse(-13, -8 + i * 4, 11, 5, -0.5 + i * 0.22, 0, 6.29); ctx.fill();
  }
  // Body.
  ctx.fillStyle = hurt ? '#ff8a7a' : '#8a5a33';
  ctx.beginPath(); ctx.ellipse(0, 2, 16, 13, 0, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#a06a3a';
  ctx.beginPath(); ctx.ellipse(3, 4, 10, 8, 0, 0, 6.29); ctx.fill();
  // Head, beak, wattle.
  ctx.fillStyle = hurt ? '#ffb0a0' : '#6e4525';
  ctx.beginPath(); ctx.arc(13, -8, 8, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#f2a93b';
  ctx.beginPath(); ctx.moveTo(19, -9); ctx.lineTo(27, -6); ctx.lineTo(19, -3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath(); ctx.ellipse(17, -1, 3, 5, 0, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(15, -10, 3.2, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(16, -10, 1.7, 0, 6.29); ctx.fill();
  // Legs.
  ctx.strokeStyle = '#e08a2e'; ctx.lineWidth = 2.5;
  const run = Math.sin(time * 16) * 4;
  ctx.beginPath(); ctx.moveTo(-3, 13); ctx.lineTo(-3 + run, 19); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5, 13); ctx.lineTo(5 - run, 19); ctx.stroke();
  ctx.restore();
  if (turkey.hidden) {
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillStyle = '#2f5d1f';
    ctx.textAlign = 'center';
    ctx.fillText('hidden', turkey.x, turkey.y - 26);
    ctx.textAlign = 'left';
  }
}

function drawFarmer(ctx, farmer, spotted) {
  ctx.save();
  ctx.translate(farmer.x, farmer.y);
  ctx.scale(farmer.facing, 1);
  // Overalls and shirt.
  ctx.fillStyle = '#3f6db5';
  roundRect(ctx, -11, 2, 22, 20, 4); ctx.fill();
  ctx.fillStyle = '#b03a2e';
  roundRect(ctx, -12, -10, 24, 14, 4); ctx.fill();
  // Head and hat.
  ctx.fillStyle = '#f0c297';
  ctx.beginPath(); ctx.arc(0, -16, 9, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#e3b34e';
  ctx.fillRect(-14, -24, 28, 5);
  roundRect(ctx, -8, -32, 16, 9, 3); ctx.fill();
  // Arms reaching for the turkey.
  ctx.strokeStyle = '#b03a2e'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(10, -4); ctx.lineTo(20, 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10, -4); ctx.lineTo(-18, 4); ctx.stroke();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(3, -17, 1.8, 0, 6.29); ctx.fill();
  ctx.restore();
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillStyle = spotted ? '#c0392b' : '#555';
  ctx.textAlign = 'center';
  ctx.fillText(spotted ? '! FARMER !' : 'farmer', farmer.x, farmer.y - 40);
  ctx.textAlign = 'left';
}

function drawHud(ctx, state, best) {
  ctx.fillStyle = 'rgba(26,18,11,0.82)';
  ctx.fillRect(0, 0, FIELD.width, 40);
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillStyle = '#ffe9c4';
  ctx.fillText('Score ' + Math.floor(state.score), 14, 27);
  ctx.fillText('Distance ' + Math.floor(state.distance) + ' m', 190, 27);
  ctx.fillText('Corn ' + state.cornGot, 400, 27);
  ctx.fillStyle = '#ff8a7a';
  let hearts = '';
  for (let i = 0; i < Math.max(0, state.lives); i += 1) hearts += '♥';
  ctx.fillText('Lives ' + hearts, 520, 27);
  ctx.fillStyle = '#ffe9c4';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(STAGES[state.stage].name, 660, 27);
  if (best > 0) { ctx.font = '13px system-ui, sans-serif'; ctx.fillText('Best ' + best, 850, 27); }
  if (state.message && state.time < state.messageUntil) {
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const w = ctx.measureText(state.message).width + 28;
    ctx.fillStyle = 'rgba(26,18,11,0.75)';
    roundRect(ctx, FIELD.width / 2 - w / 2, 48, w, 30, 8); ctx.fill();
    ctx.fillStyle = '#ffd23f';
    ctx.fillText(state.message, FIELD.width / 2, 69);
    ctx.textAlign = 'left';
  }
}

function panel(ctx, title, lines, footer) {
  ctx.fillStyle = 'rgba(26,18,11,0.72)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = '#fff4e0';
  roundRect(ctx, FIELD.width / 2 - 320, 70, 640, 390, 16); ctx.fill();
  ctx.strokeStyle = '#c1502e'; ctx.lineWidth = 4; ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = 'bold 40px system-ui, sans-serif';
  ctx.fillText(title, FIELD.width / 2, 160);
  ctx.font = '18px system-ui, sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, FIELD.width / 2, 205 + i * 30));
  ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.fillStyle = '#c1502e';
  ctx.fillText(footer, FIELD.width / 2, 448);
  ctx.textAlign = 'left';
}

export function drawGame(ctx, world, screen, best) {
  const state = world.state;
  drawGround(ctx, state);
  for (const bale of state.bales) drawBale(ctx, bale);
  for (const oven of state.ovens) drawOven(ctx, oven, state.time);
  drawGate(ctx, state.gate);
  for (const corn of state.corns) if (corn.active) drawCorn(ctx, corn, state.time);
  for (const knife of state.knives) if (knife.active) drawKnife(ctx, knife);
  drawFarmer(ctx, state.farmer, state.spotted);
  drawTurkey(ctx, state.turkey, state.time);
  drawHud(ctx, state, best);

  if (screen === SCREEN_TITLE) {
    panel(ctx, 'GOBBLE DASH', [
      'The Great Thanksgiving Escape',
      '',
      'You are the turkey. The farmer wants dinner.',
      'Dodge the farmer, the oven and the carving knives.',
      'Grab ' + GATE.cornNeeded + ' corn to open the escape gate.',
      'Hide behind hay bales to break his line of sight.',
      '',
      'Move: WASD / arrows / hold mouse · Dash: Space · Pause: P',
    ], 'Press ENTER or click to run!');
  } else if (screen === SCREEN_PAUSE) {
    panel(ctx, 'PAUSED', ['The farmer is catching his breath too.'], 'Press P to keep running');
  } else if (screen === SCREEN_OVER) {
    panel(ctx, 'CAUGHT!', [
      'The farmer got you this time…',
      '',
      'Score ' + Math.floor(state.score) + ' · Distance ' + Math.floor(state.distance) + ' m',
      'Corn grabbed ' + state.cornGot + ' · Reached ' + STAGES[state.stage].name,
      'Best score ' + Math.max(best, Math.floor(state.score)),
    ], 'Press ENTER or click to run again');
  } else if (screen === SCREEN_ESCAPED) {
    panel(ctx, 'YOU ESCAPED!', [
      'Freedom! No Thanksgiving dinner today.',
      '',
      'Score ' + Math.floor(state.score) + ' · Distance ' + Math.floor(state.distance) + ' m',
      'Corn grabbed ' + state.cornGot + ' · All 3 stages cleared',
      'Best score ' + Math.max(best, Math.floor(state.score)),
    ], 'Press ENTER or click to run again');
  }
}
