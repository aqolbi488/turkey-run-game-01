// Shared numbers for Gobble Dash: field size, speeds, stage table and scoring.
// Every other module reads its tuning from here so a balance change is one edit.

export const FIELD = { width: 960, height: 540 };
export const STEP = 1 / 120;

export const TURKEY = { radius: 16, speed: 235, dashSpeed: 360, dashSeconds: 0.35, dashCooldown: 1.6, lives: 3, hurtGrace: 1.2 };
export const FARMER = { radius: 19, baseSpeed: 150, speedPerStage: 14, catchRadius: 30, searchSeconds: 2.2, loseSightSeconds: 1.4 };
export const KNIFE = { radius: 9, speed: 300, firstDelay: 2.4, minInterval: 1.1 };
export const CORN = { radius: 10, score: 25, perStage: 6 };
export const OVEN = { radius: 42, warnSeconds: 0.9, hotSeconds: 1.1, scorePenalty: 0 };
export const GATE = { radius: 30, cornNeeded: 5 };

export const STAGES = [
  { name: 'Stage 1 · Farmyard', ground: '#7a5a33', groundDark: '#6b4d2a', sky: '#f2c879', knives: 1, ovens: 1, bales: 4, farmerSpeed: 150 },
  { name: 'Stage 2 · The Barn', ground: '#8a6a3d', groundDark: '#75562f', sky: '#e8a65c', knives: 2, ovens: 2, bales: 5, farmerSpeed: 168 },
  { name: 'Stage 3 · The Kitchen', ground: '#9c7b4a', groundDark: '#84663a', sky: '#d97e4a', knives: 3, ovens: 3, bales: 4, farmerSpeed: 186 },
];

export const SCORE = { perSecond: 2, perMeter: 1, corn: CORN.score, stageBonus: 150, escapeBonus: 400 };
export const METERS_PER_SECOND = 6;
