// Keyboard and mouse input. Keys set a move vector; holding the mouse button
// steers the turkey toward the pointer instead. Space (or a click) dashes.

export function createInput(canvas) {
  const keys = new Set();
  const state = { x: 0, y: 0, dash: false, pointerDown: false, pointerX: 0, pointerY: 0, anyKey: false };

  function refresh() {
    let x = 0;
    let y = 0;
    if (keys.has('arrowleft') || keys.has('a')) x -= 1;
    if (keys.has('arrowright') || keys.has('d')) x += 1;
    if (keys.has('arrowup') || keys.has('w')) y -= 1;
    if (keys.has('arrowdown') || keys.has('s')) y += 1;
    const length = Math.hypot(x, y);
    state.x = length > 0 ? x / length : 0;
    state.y = length > 0 ? y / length : 0;
  }

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key.startsWith('arrow') || key === ' ') event.preventDefault();
    keys.add(key);
    state.anyKey = true;
    if (key === ' ' || key === 'shift') state.dash = true;
    refresh();
  });
  window.addEventListener('keyup', (event) => {
    keys.delete(event.key.toLowerCase());
    refresh();
  });
  window.addEventListener('blur', () => { keys.clear(); refresh(); });

  function setPointer(event) {
    const rect = canvas.getBoundingClientRect();
    state.pointerX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    state.pointerY = ((event.clientY - rect.top) / rect.height) * canvas.height;
  }
  canvas.addEventListener('pointerdown', (event) => { state.pointerDown = true; state.anyKey = true; setPointer(event); });
  canvas.addEventListener('pointermove', setPointer);
  window.addEventListener('pointerup', () => { state.pointerDown = false; });

  return {
    state,
    consumeDash() { const was = state.dash; state.dash = false; return was; },
    consumeAnyKey() { const was = state.anyKey; state.anyKey = false; return was; },
    pressed(key) { return keys.has(key); },
  };
}
