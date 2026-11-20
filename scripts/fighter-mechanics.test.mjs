import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function gameModule(path, dependencies = {}) {
  const { outputText } = ts.transpileModule(readFileSync('src/game/' + path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      assert(Object.hasOwn(dependencies, name), 'Unexpected game dependency ' + name);
      return dependencies[name];
    },
  });
  return exports;
}

const input = gameModule('input/InputBuffer.ts');
const states = gameModule('combat/CharacterStateMachine.ts');
const { InputBuffer } = input;
const dt = 1 / 60;

test('jump does not occupy the combat queue and guard-punch is one parry', () => {
  const buffer = new InputBuffer();
  buffer.push({ up: true, light: true }, 1, dt);
  assert.equal(buffer.take(() => true), 'LIGHT');
  assert.equal(buffer.take(() => true), null);
  buffer.push({}, 1, dt);
  buffer.push({ guard: true, light: true }, 1, dt);
  assert.equal(buffer.take(() => true), 'PARRY');
  assert.equal(buffer.take(() => true), null);
});

test('an ineligible input does not hide a legal cancel queued after it', () => {
  const buffer = new InputBuffer();
  buffer.push({ light: true }, 1, dt);
  buffer.push({ heavy: true }, 1, dt);
  assert.equal(buffer.take(command => command === 'HEAVY'), 'HEAVY');
  assert.equal(buffer.take(() => true), 'LIGHT');
});

test('buffer expiry follows simulation time even at high refresh rates and during hitstop', () => {
  const buffer = new InputBuffer();
  buffer.push({ light: true }, 1, 1 / 120);
  for (let i = 0; i < 20; i++) buffer.push({}, 1, 0);
  for (let i = 0; i < 12; i++) buffer.push({}, 1, 1 / 120);
  assert.equal(buffer.take(() => true), 'LIGHT');
  buffer.push({ heavy: true }, 1, 1 / 120);
  for (let i = 0; i < 22; i++) buffer.push({}, 1, 1 / 120);
  assert.equal(buffer.take(() => true), null);
});

test('double-tapping left still dashes left after the first tap turns the fighter', () => {
  const buffer = new InputBuffer();
  buffer.push({ left: true }, 1, dt);
  buffer.push({}, -1, dt);
  buffer.push({ left: true }, -1, dt);
  assert.equal(buffer.take(() => true), 'DASH_FWD');
});

const noop = () => {};
const audioManager = new Proxy({}, { get: () => noop });

function playerFixture() {
  const jobs = [];
  const data = { health: 6, setHealth(value) { this.health = value; }, resetCombo: noop };
  const store = { getState: () => data, setState: noop };
  const { Player } = gameModule('systems/Player.ts', {
    '../combat/CharacterStateMachine': states,
    '../combat/FrameData': {},
    '../combat/Juice': { flashSprite: noop },
    '../config': { COMBAT: { playerIFramesMs: 780 } },
    '../input/InputBuffer': input,
    './CombatFx': {},
    './gameStore': { useGameStore: store },
    '../utils/math': {},
    '../audio/AudioManager': { audioManager },
    '../PerformanceOptimizations.js': { setSpriteClipFrame: noop },
  });
  const player = Object.create(Player.prototype);
  Object.assign(player, {
    fsm: new states.CharacterStateMachine(),
    inputBuffer: new InputBuffer(),
    spawn: { x: 220, y: 980 },
    character: { health: 120, animationSet: { hurt: { key: 'hurt' } } },
    frameKit: { parry: { startupFrames: 2, activeFrames: 6, recoveryFrames: 14, advantageFrames: 16 } },
    sprite: {
      active: true, setPosition: (x, y) => { player.sprite.x = x; player.sprite.y = y; },
      body: { setVelocity: noop, updateFromGameObject: noop },
      scene: { time: { delayedCall: (_, callback) => jobs.push(callback) } },
      anims: { stop: noop }, play: noop,
    },
  });
  return { player, jobs, data };
}

test('guard stun can absorb another hit and lethal chip damage respawns in idle', () => {
  const { player, jobs, data } = playerFixture();
  player.fsm.changeState('BLOCK_HIGH');
  assert.equal(player.receiveIncomingAttack(20, 3, 0, 'mid').type, 'block');
  assert.equal(player.fsm.currentState, 'BLOCK_STUN');
  assert.equal(data.health, 3);
  assert.equal(player.receiveIncomingAttack(20, 3, 0, 'mid').type, 'block');
  assert.equal(data.health, 0);
  assert.equal(player.fsm.currentState, 'KO');
  player.fsm.changeState('WALK_FWD');
  assert.equal(player.fsm.currentState, 'KO');
  assert.equal(jobs.length, 1);
  jobs[0]();
  assert.equal(data.health, 120);
  assert.equal(player.fsm.currentState, 'IDLE');
  assert.equal(player.sprite.x, 220);
});

test('parry opens after startup and locks movement through whiff recovery', () => {
  const { player } = playerFixture();
  player.startParry();
  assert.equal(player.fsm.currentState, 'PARRY_STARTUP');
  player.updateParry(3 / 60, true);
  assert.equal(player.fsm.currentState, 'PARRY_ACTIVE');
  player.updateParry(6 / 60, true);
  assert.equal(player.fsm.currentState, 'PARRY_RECOVERY');
  assert.equal(player.fsm.isParrying(), true);
  player.updateParry(14 / 60, true);
  assert.equal(player.fsm.currentState, 'IDLE');
});

test('enemy wind-up is canceled by a stagger and offsets are mirrored only by the resolver', () => {
  const { Enemy } = gameModule('enemies/Enemy.ts', {
    '../combat/Juice': { flashSprite: noop },
    '../config': {},
    '../audio/AudioManager': { audioManager },
    '../utils/math': {},
    '../PerformanceOptimizations.js': {},
  });
  const jobs = [];
  const hits = [];
  const enemy = Object.create(Enemy.prototype);
  Object.assign(enemy, {
    facing: -1, health: 30, iFrames: 0, cooldown: 0,
    data: { health: 30, damage: 8, knockback: 220, behaviorType: 'fast',
      attackDurationMs: 360, attackDelayMs: 100, attackCooldownMs: 800 },
    hpFill: { setSize: noop }, playClip: noop,
    sprite: {
      x: 100, y: 980, active: true, setFlipX: noop, body: { setVelocity: noop },
      scene: { time: { delayedCall: (_, callback) => {
        const job = { callback, canceled: false, remove() { this.canceled = true; } };
        jobs.push(job);
        return job;
      } } },
    },
  });
  const combat = { spawnHit: hit => hits.push(hit) };
  enemy.startAttack(combat);
  jobs[0].callback();
  assert.equal(hits[0].x, 58);
  assert.equal(hits[0].followOffsetX, 42);
  enemy.startAttack(combat);
  enemy.takeHit(5, 0);
  assert.equal(jobs[1].canceled, true);
});

test('a scaled finisher still breaks armor and only the live combo expires', () => {
  const store = {
    comboHits: 5, maxCombo: 5,
    addComboHit() { this.maxCombo = Math.max(this.maxCombo, ++this.comboHits); },
    resetCombo() { this.comboHits = 0; },
    gainKi: noop, gainXp: noop,
  };
  const { CombatSystem } = gameModule('combat/CombatSystem.ts', {
    '../audio/AudioManager': { audioManager },
    '../characters/CharacterData': {},
    '../config': { COMBAT: { comboWindow: 1.25 } },
    '../enemies/EnemyData': {},
    '../enemies/Enemy': {},
    '../systems/Player': {},
    '../systems/gameStore': { useGameStore: { getState: () => store } },
    '../systems/CombatFx': { playImpact: noop },
    './Juice': { floatText: noop },
    './CombatJuiciness': { hitstopDuration: () => 0.2, applyJuiceHit: noop },
    '../PerformanceOptimizations.js': {},
  });
  const group = { getChildren: () => [] };
  const combat = new CombatSystem({
    add: { group: () => group }, physics: { add: { group: () => group } },
  });
  combat.bindPlayer({ x: 0, bindCombat: noop });
  const hits = [];
  combat.applyEnemyHit({
    x: 50, y: 980, data: { xp: 1 },
    takeHit(...args) { hits.push(args); return true; },
  }, { damage: 48, knockback: 20, faction: 'player' });
  assert.equal(hits[0][0], 36);
  assert.equal(hits[0][3], true);
  combat.update(1);
  assert.equal(store.comboHits, 6);
  combat.update(0.25);
  assert.equal(store.comboHits, 0);
  assert.equal(store.maxCombo, 6);
});
