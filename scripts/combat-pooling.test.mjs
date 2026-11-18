import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the real CombatSystem with a minimal scene; no renderer is needed.
function setup() {
  const timers = [];
  const released = [];
  const group = { add() {}, getChildren: () => [] };
  let physicsGroups = 0;
  const scene = {
    add: { group: () => group },
    physics: { add: { group: () => { physicsGroups++; return group; } } },
    time: { delayedCall: (_, callback) => timers.push(callback) },
  };
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync('src/game/combat/CombatSystem.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(code, { exports, require: (name) => name.includes('PerformanceOptimizations') ? {
    releaseProjectile: (sprite) => { released.push(sprite); sprite.active = false; },
  } : {} });
  const combat = new exports.CombatSystem(scene);
  return { combat, timers, released, physicsGroups };
}

test('combat hit collection does not reset pooled physics bodies', () => {
  // Only the enemy collection needs a PhysicsGroup; hitboxes retain pool settings.
  assert.equal(setup().physicsGroups, 1);
});

test('expiry from an earlier projectile use cannot retire a reused projectile', () => {
  const { combat, timers, released } = setup();
  const data = new Map();
  const sprite = { active: true, x: 0, y: 0, displayWidth: 10, displayHeight: 10,
    setData: (k, v) => data.set(k, v), getData: k => data.get(k) };
  const spec = { damage: 10, knockback: 1, faction: 'player', durationMs: 900 };
  combat.armProjectile(sprite, spec);
  combat.armProjectile(sprite, spec);
  timers[0]();
  assert.equal(sprite.active, true);
  assert.equal(released.length, 0);
  timers[1]();
  assert.equal(sprite.active, false);
  assert.equal(released.length, 1);
});
