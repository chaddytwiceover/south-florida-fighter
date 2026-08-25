// @ts-nocheck

export const ROLLBACK_STATE_BYTES = 128;
export const ROLLBACK_HISTORY = 10;
export const ROLLBACK_FIXED_DT = 1 / 60;

const MAGIC = 0x5346;
const VERSION = 1;
const MAX_ENEMIES = 7;
const POS_SCALE = 4;
const VEL_SCALE = 4;

const FIGHTER_STATES = [
  "IDLE",
  "WALK_FWD",
  "WALK_BACK",
  "JUMP_RISE",
  "JUMP_FALL",
  "LANDING",
  "DASH_FWD",
  "DASH_BACK",
  "ATTACK_STARTUP",
  "ATTACK_ACTIVE",
  "ATTACK_RECOVERY",
  "BLOCK_HIGH",
  "BLOCK_LOW",
  "BLOCK_STUN",
  "PARRY_ACTIVE",
  "PARRY_SUCCESS",
  "PARRY_RECOVERY",
  "HITSTUN",
  "LAUNCHED",
  "KNOCKDOWN",
  "TECH_ROLL",
  "KO",
];

const ENEMY_STATES = ["idle", "patrol", "chase", "attack", "hurt", "dead"];

function clampInt(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(Number(value) || 0)));
}

function writeScaledInt16(view, offset, value, scale) {
  view.setInt16(offset, clampInt(value * scale, -32768, 32767), true);
}

function readScaledInt16(view, offset, scale) {
  return view.getInt16(offset, true) / scale;
}

function stateIndex(states, state) {
  return Math.max(0, states.indexOf(state));
}

function stringHash16(text) {
  let hash = 0x811c;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x0101) & 0xffff;
  }
  return hash;
}

function rawInputMask(actions) {
  const raw = actions?.raw ?? actions ?? {};
  return (
    (raw.left ? 1 : 0) |
    (raw.right ? 2 : 0) |
    (raw.up ? 4 : 0) |
    (raw.down ? 8 : 0) |
    (raw.light ? 16 : 0) |
    (raw.heavy ? 32 : 0) |
    (raw.kick ? 64 : 0) |
    (raw.special1 ? 128 : 0) |
    (raw.special2 ? 256 : 0) |
    (raw.special3 ? 512 : 0) |
    (raw.finisher ? 1024 : 0) |
    (raw.guard ? 2048 : 0) |
    (raw.parry ? 4096 : 0) |
    (raw.dash ? 8192 : 0)
  );
}

export function checksumInput(actions, frame = 0) {
  let hash = 0x9e3779b9 ^ (frame >>> 0);
  hash = Math.imul(hash ^ rawInputMask(actions), 0x85ebca6b) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35) >>> 0;
  return (hash ^ (hash >>> 16)) >>> 0;
}

export function checksumState(blob) {
  let hash = 0x811c9dc5;
  const limit = Math.min(blob.byteLength, 124);
  for (let i = 0; i < limit; i += 1) {
    hash ^= blob[i];
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function getBody(sprite) {
  return sprite?.body ?? null;
}

function getVelocity(sprite) {
  const body = getBody(sprite);
  return {
    x: body?.velocity?.x ?? 0,
    y: body?.velocity?.y ?? 0,
  };
}

function sceneParts(sceneOrParts) {
  if (sceneOrParts?.player && sceneOrParts?.combat) return sceneOrParts;
  return {
    scene: sceneOrParts,
    player: sceneOrParts?.player,
    combat: sceneOrParts?.combat,
    store: sceneOrParts?.store,
  };
}

export function serializeGameState(sceneOrParts, frame = 0, inputHash = 0) {
  const parts = sceneParts(sceneOrParts);
  const player = parts.player;
  const combat = parts.combat;
  const store = parts.store?.getState ? parts.store.getState() : parts.store;
  const blob = new Uint8Array(ROLLBACK_STATE_BYTES);
  const view = new DataView(blob.buffer);

  view.setUint16(0, MAGIC, true);
  view.setUint8(2, VERSION);
  view.setUint8(3, Math.min(MAX_ENEMIES, combat?.enemies?.length ?? 0));
  view.setUint32(4, frame >>> 0, true);

  const playerVelocity = getVelocity(player?.sprite);
  writeScaledInt16(view, 8, player?.sprite?.x ?? 0, POS_SCALE);
  writeScaledInt16(view, 10, player?.sprite?.y ?? 0, POS_SCALE);
  writeScaledInt16(view, 12, playerVelocity.x, VEL_SCALE);
  writeScaledInt16(view, 14, playerVelocity.y, VEL_SCALE);
  view.setUint8(16, stateIndex(FIGHTER_STATES, player?.fsm?.currentState));
  view.setInt8(17, player?.facing ?? 1);
  view.setUint16(18, clampInt(store?.health ?? 0, 0, 65535), true);
  view.setUint16(20, clampInt(store?.energy ?? 0, 0, 65535), true);
  view.setUint8(22, clampInt(store?.comboHits ?? 0, 0, 255));
  view.setUint8(23, clampInt(store?.maxCombo ?? 0, 0, 255));
  view.setUint8(24, clampInt(store?.kos ?? 0, 0, 255));
  view.setUint8(25, clampInt(store?.aliveEnemies ?? 0, 0, 255));
  view.setUint16(26, stringHash16(store?.currentMove ?? ""), true);
  view.setUint8(
    28,
    (player?.grounded ? 1 : 0) |
      (player?.recovering ? 2 : 0) |
      (player?.jumping ? 4 : 0),
  );
  view.setUint8(29, clampInt(player?.fsm?.stateFrames ?? 0, 0, 255));
  view.setUint16(30, clampInt((player?.fsm?.stateTime ?? 0) * 1000, 0, 65535), true);

  const enemies = combat?.enemies ?? [];
  for (let i = 0; i < MAX_ENEMIES; i += 1) {
    const enemy = enemies[i];
    const base = 32 + i * 12;
    const velocity = getVelocity(enemy?.sprite);
    writeScaledInt16(view, base, enemy?.sprite?.x ?? 0, POS_SCALE);
    writeScaledInt16(view, base + 2, enemy?.sprite?.y ?? 0, POS_SCALE);
    writeScaledInt16(view, base + 4, velocity.x, VEL_SCALE);
    writeScaledInt16(view, base + 6, velocity.y, VEL_SCALE);
    view.setUint16(base + 8, clampInt(enemy?.health ?? 0, 0, 65535), true);
    view.setUint8(base + 10, stateIndex(ENEMY_STATES, enemy?.state));
    view.setUint8(
      base + 11,
      (enemy?.facing < 0 ? 1 : 0) |
        (enemy?.dead ? 2 : 0) |
        (enemy?.sprite?.active === false ? 4 : 0),
    );
  }

  view.setUint32(116, inputHash >>> 0, true);
  view.setUint32(124, checksumState(blob), true);
  return blob;
}

export function deserializeGameState(sceneOrParts, blob, meta = {}) {
  if (!(blob instanceof Uint8Array) || blob.byteLength !== ROLLBACK_STATE_BYTES) {
    throw new Error(`Rollback state must be a ${ROLLBACK_STATE_BYTES}-byte Uint8Array.`);
  }
  const view = new DataView(blob.buffer, blob.byteOffset, blob.byteLength);
  if (view.getUint16(0, true) !== MAGIC || view.getUint8(2) !== VERSION) {
    throw new Error("Rollback state header mismatch.");
  }
  if (view.getUint32(124, true) !== checksumState(blob)) {
    throw new Error("Rollback state checksum mismatch.");
  }

  const parts = sceneParts(sceneOrParts);
  const player = parts.player;
  const combat = parts.combat;
  const storeApi = parts.store;
  const storeState = storeApi?.getState ? storeApi.getState() : storeApi;
  const playerBody = getBody(player?.sprite);

  if (player?.sprite) {
    player.sprite.setPosition(
      readScaledInt16(view, 8, POS_SCALE),
      readScaledInt16(view, 10, POS_SCALE),
    );
    playerBody?.setVelocity(
      readScaledInt16(view, 12, VEL_SCALE),
      readScaledInt16(view, 14, VEL_SCALE),
    );
    playerBody?.updateFromGameObject?.();
    player.facing = view.getInt8(17) || 1;
    player.grounded = Boolean(view.getUint8(28) & 1);
    player.recovering = Boolean(view.getUint8(28) & 2);
    player.jumping = Boolean(view.getUint8(28) & 4);
    if (player.fsm) {
      player.fsm.currentState = FIGHTER_STATES[view.getUint8(16)] ?? "IDLE";
      player.fsm.stateFrames = view.getUint8(29);
      player.fsm.stateTime = view.getUint16(30, true) / 1000;
    }
    player.sprite.setFlipX(player.facing < 0);
  }

  if (storeApi?.setState) {
    storeApi.setState({
      health: view.getUint16(18, true),
      energy: view.getUint16(20, true),
      comboHits: view.getUint8(22),
      maxCombo: view.getUint8(23),
      kos: view.getUint8(24),
      aliveEnemies: view.getUint8(25),
      currentMove: meta.currentMove ?? storeState?.currentMove ?? "",
    });
  }

  const enemies = combat?.enemies ?? [];
  for (let i = 0; i < Math.min(MAX_ENEMIES, enemies.length); i += 1) {
    const enemy = enemies[i];
    const base = 32 + i * 12;
    if (!enemy?.sprite || enemy.sprite.destroyed) continue;
    const flags = view.getUint8(base + 11);
    const enemyBody = getBody(enemy.sprite);
    enemy.sprite.setPosition(
      readScaledInt16(view, base, POS_SCALE),
      readScaledInt16(view, base + 2, POS_SCALE),
    );
    enemyBody?.setVelocity(
      readScaledInt16(view, base + 4, VEL_SCALE),
      readScaledInt16(view, base + 6, VEL_SCALE),
    );
    enemyBody?.updateFromGameObject?.();
    enemy.health = view.getUint16(base + 8, true);
    enemy.state = ENEMY_STATES[view.getUint8(base + 10)] ?? "idle";
    enemy.facing = flags & 1 ? -1 : 1;
    enemy.dead = Boolean(flags & 2);
    enemy.sprite.setActive(!Boolean(flags & 4));
    enemy.sprite.setVisible(!Boolean(flags & 4));
    enemy.sprite.setFlipX(enemy.facing < 0);
    enemy.refreshHp?.();
  }
}

export function interpolateOpponentSprite(scene, sprite, from, to, frames = 3) {
  if (!sprite?.active || !scene?.tweens) return;
  const target = to ?? { x: sprite.x, y: sprite.y };
  const start = from ?? { x: sprite.x, y: sprite.y };
  sprite.setPosition(start.x, start.y);
  scene.tweens.killTweensOf(sprite);
  scene.tweens.add({
    targets: sprite,
    x: target.x,
    y: target.y,
    duration: Math.max(1, frames) * (1000 / 60),
    ease: "Linear",
    onUpdate: () => sprite.body?.updateFromGameObject?.(),
    onComplete: () => {
      sprite.setPosition(target.x, target.y);
      sprite.body?.updateFromGameObject?.();
    },
  });
}

export class RollbackNetcode {
  constructor(scene, options) {
    this.scene = scene;
    this.getPlayer = options.getPlayer;
    this.getCombat = options.getCombat;
    this.getStore = options.getStore;
    this.resimulateFrame = options.resimulateFrame;
    this.history = new Array(ROLLBACK_HISTORY);
    this.inputHistory = new Map();
    this.lastAgreedFrame = -1;
    this.currentFrame = -1;
    this.isRollingBack = false;
  }

  parts() {
    return {
      scene: this.scene,
      player: this.getPlayer(),
      combat: this.getCombat(),
      store: this.getStore(),
    };
  }

  recordFrame(frame, actions) {
    const inputHash = checksumInput(actions, frame);
    const store = this.getStore()?.getState?.() ?? this.getStore();
    const blob = serializeGameState(this.parts(), frame, inputHash);
    this.history[frame % ROLLBACK_HISTORY] = {
      frame,
      blob,
      inputHash,
      stateHash: new DataView(blob.buffer).getUint32(124, true),
      currentMove: store?.currentMove ?? "",
    };
    this.inputHistory.set(frame, actions);
    this.currentFrame = Math.max(this.currentFrame, frame);
    return inputHash;
  }

  markAgreedFrame(frame) {
    this.lastAgreedFrame = Math.max(this.lastAgreedFrame, frame);
  }

  stateForFrame(frame) {
    const entry = this.history[((frame % ROLLBACK_HISTORY) + ROLLBACK_HISTORY) % ROLLBACK_HISTORY];
    return entry?.frame === frame ? entry : null;
  }

  handleInputChecksum(frame, expectedChecksum, correctedInputs = new Map()) {
    const actual = this.inputHistory.has(frame)
      ? checksumInput(this.inputHistory.get(frame), frame)
      : 0;
    if ((actual >>> 0) === (expectedChecksum >>> 0)) {
      this.markAgreedFrame(frame);
      return { rolledBack: false, frame, checksum: actual >>> 0 };
    }
    return this.rollbackToLastAgreed(frame, correctedInputs);
  }

  rollbackToLastAgreed(mismatchFrame, correctedInputs = new Map()) {
    const targetFrame = Math.max(0, Math.min(this.lastAgreedFrame, mismatchFrame - 1));
    const restoreEntry = this.stateForFrame(targetFrame);
    if (!restoreEntry) {
      return { rolledBack: false, reason: "missing agreed state", frame: targetFrame };
    }

    const combat = this.getCombat();
    const before = (combat?.enemies ?? []).map((enemy) => ({
      sprite: enemy.sprite,
      x: enemy.sprite?.x ?? 0,
      y: enemy.sprite?.y ?? 0,
    }));

    this.isRollingBack = true;
    deserializeGameState(this.parts(), restoreEntry.blob, restoreEntry);

    for (let frame = targetFrame + 1; frame <= this.currentFrame; frame += 1) {
      const corrected = correctedInputs instanceof Map
        ? correctedInputs.get(frame)
        : correctedInputs?.[frame];
      const actions = corrected ?? this.inputHistory.get(frame);
      if (!actions) continue;
      this.inputHistory.set(frame, actions);
      this.resimulateFrame(actions, ROLLBACK_FIXED_DT);
      this.recordFrame(frame, actions);
    }

    this.isRollingBack = false;
    for (const prev of before) {
      if (!prev.sprite?.active) continue;
      interpolateOpponentSprite(this.scene, prev.sprite, prev, {
        x: prev.sprite.x,
        y: prev.sprite.y,
      }, 3);
    }
    this.scene.events.emit("rollback-complete", {
      fromFrame: mismatchFrame,
      restoredFrame: targetFrame,
      currentFrame: this.currentFrame,
    });
    return { rolledBack: true, fromFrame: mismatchFrame, restoredFrame: targetFrame };
  }
}
