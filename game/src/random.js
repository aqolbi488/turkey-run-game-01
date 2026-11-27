// Seeded random numbers (mulberry32). The game never calls Math.random, so a
// given seed always plays out the same way — that is what makes ?seed= shots
// reproducible frame for frame.

export function makeRandom(seed) {
  let state = (seed >>> 0) || 1;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function range(random, low, high) {
  return low + random() * (high - low);
}

export function pick(random, list) {
  return list[Math.floor(random() * list.length) % list.length];
}
