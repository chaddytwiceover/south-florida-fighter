export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

export const WORLD_WIDTH = 4800;
export const WORLD_HEIGHT = GAME_HEIGHT;

/** Walkable boardwalk surface, measured from the top of the screen. */
export const GROUND_Y = 980;

export const FIXED_DT = 1 / 60;
export const MAX_DT = 0.1;

export const JUMP = {
  velocity: -560,
  cutMultiplier: 0.45,
  coyoteMs: 110,
  bufferMs: 130,
  riseGravity: 1450,
  fallGravity: 2550,
  apexHang: 0.55,
  apexWindow: 70,
  terminal: 980,
} as const;

export const MOVE = {
  accel: 2800,
  airAccel: 1700,
  friction: 2600,
  airFriction: 400,
} as const;

export const CAMERA = {
  lerpX: 0.14,
  lerpY: 0.12,
  deadzoneW: 64,
  deadzoneH: 88,
  lookAhead: 86,
  lookY: 220,
} as const;

export const PLAYER_DISPLAY_SCALE = 1.25;
export const PLAYER_BODY = { width: 54, height: 115, offsetX: 53, offsetY: 50 };

export const ENEMY_DISPLAY_SCALE = 1.2;
export const ENEMY_BODY = { width: 52, height: 115, offsetX: 54, offsetY: 50 };

export const COMBAT = {
  hitstopMs: 48,
  playerIFramesMs: 780,
  enemyIFramesMs: 170,
  shake: 0.007,
  comboWindow: 0.46,
} as const;

export const DEBUG_QUERY = "debug";
