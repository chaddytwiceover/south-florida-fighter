import { a as audioManager, c as registerGame, i as approach, l as unregisterGame, n as inputManager, o as allRosterClips, r as useGameStore, s as getCharacter } from "./routes-DjuggEnX.mjs";
import { t as phaser_esm_exports } from "../_libs/phaser.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createGame-B3_Nri0W.js
var GAME_HEIGHT = 1280;
var WORLD_WIDTH = 4800;
var WORLD_HEIGHT = GAME_HEIGHT;
var JUMP = {
	velocity: -560,
	cutMultiplier: .45,
	coyoteMs: 110,
	bufferMs: 130,
	riseGravity: 1450,
	fallGravity: 2550,
	apexHang: .55,
	apexWindow: 70,
	terminal: 980
};
var MOVE = {
	accel: 2800,
	airAccel: 1700,
	friction: 2600,
	airFriction: 400
};
var CAMERA = {
	lerpX: .14,
	lerpY: .12,
	deadzoneW: 64,
	deadzoneH: 88,
	lookAhead: 86,
	lookY: 220
};
var PLAYER_DISPLAY_SCALE = 1.18;
var PLAYER_BODY = {
	width: 38,
	height: 86,
	offsetX: 45,
	offsetY: 40
};
var ENEMY_DISPLAY_SCALE = 1.12;
var ENEMY_BODY = {
	width: 34,
	height: 80,
	offsetX: 47,
	offsetY: 44
};
var COMBAT = {
	hitstopMs: 48,
	playerIFramesMs: 780,
	enemyIFramesMs: 170,
	shake: .007,
	comboWindow: .46
};
function prefersReducedMotion() {
	return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function floatText(scene, x, y, text, color) {
	const label = scene.add.text(x, y, text, {
		fontFamily: "Bebas Neue, Impact, sans-serif",
		fontSize: "30px",
		color,
		stroke: "#0c1a24",
		strokeThickness: 5
	}).setOrigin(.5, 1).setDepth(40);
	scene.tweens.add({
		targets: label,
		y: y - 54,
		alpha: 0,
		duration: 560,
		ease: "Quad.easeOut",
		onComplete: () => label.destroy()
	});
}
function shakeCamera(scene, intensity = COMBAT.shake) {
	if (prefersReducedMotion()) return;
	scene.cameras.main.shake(130, intensity);
}
function flashSprite(sprite, tint = 16777215) {
	sprite.setTintFill(tint);
	sprite.scene.time.delayedCall(70, () => {
		if (sprite.active) sprite.clearTint();
	});
}
var Enemy = class {
	sprite;
	data;
	id;
	health;
	facing = -1;
	dead = false;
	state = "idle";
	homeX;
	iFrames = 0;
	hurtLock = 0;
	attackLock = 0;
	cooldown = .4;
	patrolDir = 1;
	hpBg;
	hpFill;
	struck = false;
	constructor(scene, x, y, data) {
		this.data = data;
		this.id = `${data.id}-${Math.round(x)}-${Math.round(Math.random() * 999)}`;
		this.health = data.health;
		this.homeX = x;
		this.sprite = scene.physics.add.sprite(x, y, data.animationSet.idle.textureKey, 0);
		this.sprite.setOrigin(.5, 1);
		this.sprite.setScale(ENEMY_DISPLAY_SCALE);
		this.sprite.setDepth(18);
		this.sprite.setData("enemy", this);
		const body = this.sprite.body;
		body.setCollideWorldBounds(true);
		body.setMaxVelocity(data.speed + 80, JUMP.terminal);
		body.setAllowGravity(false);
		body.setDrag(0, 0);
		body.setFriction(0, 0);
		body.setBounce(0, 0);
		body.setSize(ENEMY_BODY.width, ENEMY_BODY.height);
		body.setOffset(ENEMY_BODY.offsetX, ENEMY_BODY.offsetY);
		body.pushable = false;
		body.moves = false;
		this.hpBg = scene.add.rectangle(x, y - 118, 42, 6, 793124, .8).setDepth(26);
		this.hpFill = scene.add.rectangle(x - 19, y - 118, 38, 4, 15228236, 1).setOrigin(0, .5).setDepth(27);
		this.sprite.play(data.animationSet.idle.key);
	}
	get x() {
		return this.sprite.x;
	}
	get y() {
		return this.sprite.y;
	}
	takeHit(damage, knockbackX) {
		if (this.dead || this.iFrames > 0) return false;
		this.health = Math.max(0, this.health - damage);
		this.iFrames = .17;
		this.hurtLock = .28;
		this.attackLock = 0;
		this.state = "hurt";
		this.cooldown = Math.max(this.cooldown, .35);
		this.sprite.body.setVelocity(knockbackX, -80);
		flashSprite(this.sprite, 16777215);
		this.playClip("hurt");
		this.refreshHp();
		audioManager.hurt();
		if (this.health <= 0) this.defeat();
		return true;
	}
	update(dt, playerX, playerY, combat) {
		if (!this.sprite.active) return;
		this.hpBg.setPosition(this.x, this.y - 118);
		this.hpFill.setPosition(this.x - 19, this.y - 118);
		if (this.iFrames > 0) this.iFrames = Math.max(0, this.iFrames - dt);
		if (this.hurtLock > 0) this.hurtLock = Math.max(0, this.hurtLock - dt);
		if (this.attackLock > 0) this.attackLock = Math.max(0, this.attackLock - dt);
		if (this.cooldown > 0) this.cooldown = Math.max(0, this.cooldown - dt);
		const body = this.sprite.body;
		const vyNow = body.velocity.y;
		const onFloor = body.blocked.down || body.touching.down || vyNow >= -12 && this.sprite.y >= 976 && this.sprite.y <= 998;
		let vy = vyNow;
		vy = Math.min(vy + JUMP.fallGravity * dt, JUMP.terminal);
		if (onFloor && vy > 0) vy = 0;
		if (this.dead) {
			this.sprite.y += vy * dt;
			body.setVelocity(body.velocity.x, vy);
			body.updateFromGameObject();
			return;
		}
		if (this.hurtLock > 0) {
			const vx = approach(body.velocity.x, 0, 1800 * dt);
			this.sprite.x += vx * dt;
			this.sprite.y += vy * dt;
			if (onFloor && this.sprite.y > 980) this.sprite.y = 980;
			body.setVelocity(vx, vy);
			body.updateFromGameObject();
			return;
		}
		if (this.attackLock > 0) {
			const vx = approach(body.velocity.x, 0, 2200 * dt);
			this.sprite.x += vx * dt;
			this.sprite.y += vy * dt;
			if (onFloor && this.sprite.y > 980) this.sprite.y = 980;
			body.setVelocity(vx, vy);
			body.updateFromGameObject();
			return;
		}
		const dx = playerX - this.x;
		const dist = Math.abs(dx);
		const verticalOk = Math.abs(playerY - this.y) < 140;
		let vx = body.velocity.x;
		if (dist < this.data.aggroRange && verticalOk) {
			this.facing = dx >= 0 ? 1 : -1;
			this.sprite.setFlipX(this.facing < 0);
			if (dist <= this.data.attackRange && this.cooldown <= 0 && onFloor) {
				this.startAttack(combat);
				body.setVelocity(0, vy);
				body.updateFromGameObject();
				return;
			}
			this.state = "chase";
			vx = approach(vx, this.facing * this.data.speed, 1600 * dt);
			this.sprite.x += vx * dt;
			this.sprite.y += vy * dt;
			if (onFloor && this.sprite.y > 980) this.sprite.y = 980;
			body.setVelocity(vx, vy);
			body.updateFromGameObject();
			this.playLoop("run");
			return;
		}
		this.state = "patrol";
		if (this.x > this.homeX + 160) this.patrolDir = -1;
		if (this.x < this.homeX - 160) this.patrolDir = 1;
		this.facing = this.patrolDir;
		this.sprite.setFlipX(this.facing < 0);
		vx = approach(vx, this.patrolDir * this.data.speed * .55, 900 * dt);
		this.sprite.x += vx * dt;
		this.sprite.y += vy * dt;
		if (onFloor && this.sprite.y > 980) this.sprite.y = 980;
		body.setVelocity(vx, vy);
		body.updateFromGameObject();
		this.playLoop("run");
	}
	startAttack(combat) {
		this.state = "attack";
		this.attackLock = this.data.attackDurationMs / 1e3;
		this.cooldown = this.data.attackCooldownMs / 1e3;
		this.struck = false;
		this.sprite.body.setVelocityX(0);
		this.playClip("attack");
		audioManager.attack();
		this.sprite.scene.time.delayedCall(this.data.attackDelayMs, () => {
			if (this.dead || !this.sprite.active || this.struck) return;
			this.struck = true;
			combat.spawnHit({
				x: this.x + this.facing * 54,
				y: this.y - 50,
				width: this.data.behaviorType === "fast" ? 78 : 70,
				height: 62,
				damage: this.data.damage,
				knockback: this.data.knockback,
				faction: "enemy",
				durationMs: 120
			});
		});
	}
	defeat() {
		this.dead = true;
		this.state = "dead";
		const body = this.sprite.body;
		body.enable = false;
		this.playClip("hurt");
		audioManager.defeat();
		this.sprite.scene.tweens.add({
			targets: [
				this.sprite,
				this.hpBg,
				this.hpFill
			],
			alpha: 0,
			y: `+=24`,
			duration: 420,
			ease: "Quad.easeIn",
			onComplete: () => this.destroy()
		});
	}
	refreshHp() {
		const pct = this.health / Math.max(1, this.data.health);
		this.hpFill.width = 38 * pct;
	}
	playLoop(name) {
		const key = this.data.animationSet[name].key;
		if (this.sprite.anims.currentAnim?.key !== key || !this.sprite.anims.isPlaying) this.sprite.play(key, true);
	}
	playClip(name) {
		const clip = this.data.animationSet[name];
		this.sprite.anims.stop();
		this.sprite.setTexture(clip.textureKey, 0);
		this.sprite.play(clip.key);
	}
	destroy() {
		this.hpBg.destroy();
		this.hpFill.destroy();
		this.sprite.destroy();
	}
};
var SHEET = {
	frameWidth: 128,
	frameHeight: 128,
	frames: 4
};
function clip(id, action, frameRate, repeat) {
	return {
		key: `${id}-${action}`,
		textureKey: `${id}-${action}`,
		url: `/game/sprites/enemies/${id}/${action}.png`,
		...SHEET,
		frameRate,
		repeat
	};
}
function makeSet(id) {
	return {
		idle: clip(id, "idle", 6, -1),
		run: clip(id, "run", 10, -1),
		attack: clip(id, "attack", 12, 0),
		hurt: clip(id, "hurt", 10, 0)
	};
}
var THUG = {
	id: "thug",
	name: "Boardwalk Bruiser",
	health: 32,
	speed: 92,
	damage: 8,
	attackRange: 72,
	aggroRange: 360,
	attackDurationMs: 520,
	attackCooldownMs: 1100,
	attackDelayMs: 180,
	knockback: 300,
	xp: 8,
	kiReward: 10,
	behaviorType: "melee",
	animationSet: makeSet("thug")
};
var ENEMIES = [THUG, {
	id: "rat",
	name: "Skate Rat",
	health: 18,
	speed: 170,
	damage: 6,
	attackRange: 80,
	aggroRange: 440,
	attackDurationMs: 400,
	attackCooldownMs: 820,
	attackDelayMs: 120,
	knockback: 240,
	xp: 6,
	kiReward: 8,
	behaviorType: "fast",
	animationSet: makeSet("rat")
}];
function getEnemy(id) {
	return ENEMIES.find((e) => e.id === id) ?? THUG;
}
function allEnemyClips() {
	return ENEMIES.flatMap((enemy) => Object.values(enemy.animationSet));
}
function playSlash(scene, x, y, facing) {
	if (!scene.textures.exists("slash-fx")) return;
	const fx = scene.add.sprite(x + facing * 54, y - 52, "slash-fx", 0);
	fx.setOrigin(.5, .5);
	fx.setScale(1.15);
	fx.setFlipX(facing < 0);
	fx.setDepth(24);
	if (scene.anims.exists("slash-fx")) fx.play("slash-fx");
	scene.time.delayedCall(280, () => fx.destroy());
}
function playWave(scene, x, y, facing) {
	if (!scene.textures.exists("wave-fx")) return null;
	const bolt = scene.physics.add.sprite(x + facing * 42, y - 58, "wave-fx", 0);
	bolt.setOrigin(.5, .5);
	bolt.setScale(.95);
	bolt.setFlipX(facing < 0);
	bolt.setDepth(22);
	bolt.setVelocity(facing * 520, 0);
	bolt.body?.setAllowGravity(false);
	if (scene.anims.exists("wave-fx")) bolt.play("wave-fx");
	scene.time.delayedCall(900, () => {
		if (bolt.active) bolt.destroy();
	});
	return bolt;
}
function playImpact(scene, x, y) {
	if (!scene.textures.exists("impact-fx")) return;
	const fx = scene.add.sprite(x, y, "impact-fx", 0);
	fx.setOrigin(.5, .5);
	fx.setScale(.95);
	fx.setDepth(25);
	if (scene.anims.exists("impact-fx")) fx.play("impact-fx");
	else scene.time.delayedCall(220, () => fx.destroy());
	fx.once("animationcomplete", () => fx.destroy());
}
function playClone(scene, source) {
	const ghost = scene.add.sprite(source.x, source.y, source.texture.key, source.frame.name);
	ghost.setOrigin(source.originX, source.originY);
	ghost.setScale(source.scaleX, source.scaleY);
	ghost.setFlipX(source.flipX);
	ghost.setAlpha(.42);
	ghost.setTint(8011007);
	ghost.setDepth(source.depth - 1);
	scene.tweens.add({
		targets: ghost,
		alpha: 0,
		duration: 900,
		ease: "Quad.easeIn",
		onComplete: () => ghost.destroy()
	});
}
function createFxAnimations(scene) {
	if (scene.textures.exists("slash-fx") && !scene.anims.exists("slash-fx")) scene.anims.create({
		key: "slash-fx",
		frames: scene.anims.generateFrameNumbers("slash-fx", {
			start: 0,
			end: 3
		}),
		frameRate: 18,
		repeat: 0
	});
	if (scene.textures.exists("wave-fx") && !scene.anims.exists("wave-fx")) scene.anims.create({
		key: "wave-fx",
		frames: scene.anims.generateFrameNumbers("wave-fx", {
			start: 0,
			end: 3
		}),
		frameRate: 14,
		repeat: -1
	});
	if (scene.textures.exists("impact-fx") && !scene.anims.exists("impact-fx")) scene.anims.create({
		key: "impact-fx",
		frames: scene.anims.generateFrameNumbers("impact-fx", {
			start: 0,
			end: 3
		}),
		frameRate: 18,
		repeat: 0
	});
}
function near(ax, ay, aw, ah, bx, by, bw, bh) {
	return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
function overlaps(a, b) {
	return near(a.x, a.y, a.width, a.height, b.x, b.y, b.width, b.height);
}
var CombatSystem = class {
	scene;
	enemies = [];
	enemySprites;
	hitboxes;
	player = null;
	freeze = 0;
	debug;
	constructor(scene, debug = false) {
		this.scene = scene;
		this.debug = debug;
		this.hitboxes = scene.physics.add.group();
		this.enemySprites = scene.physics.add.group();
	}
	static preloadAnims(scene) {
		for (const clip of allEnemyClips()) {
			if (scene.anims.exists(clip.key)) continue;
			scene.anims.create({
				key: clip.key,
				frames: scene.anims.generateFrameNumbers(clip.textureKey, {
					start: 0,
					end: clip.frames - 1
				}),
				frameRate: clip.frameRate,
				repeat: clip.repeat
			});
		}
	}
	bindPlayer(player) {
		this.player = player;
		player.bindCombat(this);
	}
	spawnEnemy(id, x, y) {
		const enemy = new Enemy(this.scene, x, y, getEnemy(id));
		this.enemies.push(enemy);
		this.enemySprites.add(enemy.sprite);
		return enemy;
	}
	spawnHit(spec) {
		const rect = this.scene.add.rectangle(spec.x, spec.y, spec.width, spec.height, 15228236, this.debug ? .28 : 0);
		rect.setOrigin(.5, .5);
		rect.setDepth(23);
		this.scene.physics.add.existing(rect);
		const body = rect.body;
		body.setAllowGravity(false);
		body.setImmovable(true);
		body.setSize(spec.width, spec.height);
		body.updateFromGameObject();
		const data = {
			...spec,
			struck: /* @__PURE__ */ new Set()
		};
		rect.setData("hit", data);
		this.hitboxes.add(rect);
		this.resolveHitbox(rect, data);
		this.scene.time.delayedCall(spec.durationMs, () => {
			if (rect.active) rect.destroy();
		});
		return rect;
	}
	armProjectile(sprite, spec) {
		const data = {
			x: sprite.x,
			y: sprite.y,
			width: sprite.displayWidth,
			height: sprite.displayHeight,
			follow: sprite,
			followOffsetX: 0,
			followOffsetY: 0,
			struck: /* @__PURE__ */ new Set(),
			...spec
		};
		sprite.setData("hit", data);
		this.hitboxes.add(sprite);
		this.scene.time.delayedCall(spec.durationMs, () => {
			if (sprite.active) sprite.destroy();
		});
	}
	isFrozen() {
		return this.freeze > 0;
	}
	hitstop(ms = COMBAT.hitstopMs) {
		this.freeze = Math.max(this.freeze, ms / 1e3);
	}
	tickFreeze(dt) {
		this.freeze = Math.max(0, this.freeze - dt);
	}
	update(dt) {
		for (const obj of this.hitboxes.getChildren()) {
			const go = obj;
			const hit = go.getData("hit");
			if (hit?.follow && hit.follow.active) {
				const facing = hit.follow.flipX ? -1 : 1;
				go.setPosition(hit.follow.x + (hit.followOffsetX ?? 0) * facing, hit.follow.y + (hit.followOffsetY ?? 0));
				go.body?.updateFromGameObject();
			}
			if (hit) this.resolveHitbox(go, hit);
		}
		const player = this.player;
		if (!player) return;
		for (const enemy of this.enemies) {
			if (!enemy.sprite.active) continue;
			enemy.update(dt, player.x, player.y, this);
		}
	}
	aliveCount() {
		return this.enemies.filter((e) => !e.dead && e.sprite.active).length;
	}
	shutdown() {
		this.enemies.length = 0;
	}
	resolveHitbox(go, hit) {
		const player = this.player;
		if (!player) return;
		const box = go.body;
		if (!box) return;
		if (hit.faction === "player") for (const enemy of this.enemies) {
			if (enemy.dead || !enemy.sprite.active) continue;
			if (hit.struck.has(enemy.id)) continue;
			const ebody = enemy.sprite.body;
			const bodyHit = Boolean(box && ebody && overlaps(box, ebody));
			const spriteHit = near(hit.x - hit.width / 2, hit.y - hit.height / 2, hit.width, hit.height, enemy.x - 28, enemy.y - 90, 56, 90);
			if (!bodyHit && !spriteHit) continue;
			hit.struck.add(enemy.id);
			this.landOnEnemy(player, enemy, hit);
		}
		else if (hit.faction === "enemy") {
			if (hit.struck.has("player")) return;
			const pbody = player.sprite.body;
			if (overlaps(box, pbody)) {
				hit.struck.add("player");
				this.landOnPlayer(player, hit);
			}
		}
	}
	landOnEnemy(player, enemy, hit) {
		const dir = player.facing;
		if (!enemy.takeHit(hit.damage, dir * hit.knockback)) return;
		playImpact(this.scene, enemy.x + dir * 18, enemy.y - 56);
		floatText(this.scene, enemy.x, enemy.y - 120, `${hit.damage}`, "#f3e2c2");
		shakeCamera(this.scene, hit.damage > 20 ? .012 : COMBAT.shake);
		this.hitstop(hit.damage > 20 ? 80 : COMBAT.hitstopMs);
		const store = useGameStore.getState();
		store.addComboHit();
		store.gainKi(6);
		store.gainXp(enemy.data.xp);
		if (enemy.dead) {
			store.addKo();
			store.gainKi(enemy.data.kiReward);
			floatText(this.scene, enemy.x, enemy.y - 150, "KO", "#e85d4c");
			if (this.aliveCount() === 0) store.setFlash("Boardwalk clear");
		}
	}
	landOnPlayer(player, hit) {
		const originX = hit.follow?.x ?? hit.x;
		const dir = player.x < originX ? -1 : 1;
		if (!player.takeHit(hit.damage, dir * hit.knockback)) return;
		playImpact(this.scene, player.x - dir * 16, player.y - 56);
		floatText(this.scene, player.x, player.y - 130, `${hit.damage}`, "#e85d4c");
		shakeCamera(this.scene, .01);
		this.hitstop(60);
		useGameStore.getState().resetCombo();
	}
};
var FORT_LAUDERDALE = {
	id: "fort-lauderdale",
	name: "Fort Lauderdale",
	worldWidth: WORLD_WIDTH,
	worldHeight: WORLD_HEIGHT,
	groundY: 980,
	spawn: {
		x: 220,
		y: 980
	},
	platforms: [
		{
			x: 1680,
			y: 870,
			width: 220,
			height: 22
		},
		{
			x: 2280,
			y: 780,
			width: 180,
			height: 22
		},
		{
			x: 2860,
			y: 870,
			width: 220,
			height: 22
		}
	],
	props: [
		{
			key: "palm",
			x: 360,
			y: 988,
			scale: 1.35,
			depth: 8
		},
		{
			key: "palm",
			x: 700,
			y: 988,
			scale: 1.15,
			flipX: true,
			depth: 6
		},
		{
			key: "tower",
			x: 1080,
			y: 986,
			scale: 1.2,
			depth: 7
		},
		{
			key: "palm",
			x: 1480,
			y: 988,
			scale: 1.4,
			depth: 8
		},
		{
			key: "palm",
			x: 1940,
			y: 988,
			scale: 1.05,
			flipX: true,
			depth: 5
		},
		{
			key: "palm",
			x: 2420,
			y: 988,
			scale: 1.3,
			depth: 8
		},
		{
			key: "tower",
			x: 2980,
			y: 986,
			scale: 1.15,
			depth: 7
		},
		{
			key: "palm",
			x: 3360,
			y: 988,
			scale: 1.25,
			flipX: true,
			depth: 6
		},
		{
			key: "palm",
			x: 3820,
			y: 988,
			scale: 1.45,
			depth: 8
		},
		{
			key: "palm",
			x: 4280,
			y: 988,
			scale: 1.1,
			depth: 5
		},
		{
			key: "tower",
			x: 4580,
			y: 986,
			scale: 1.25,
			depth: 7
		},
		{
			key: "palm",
			x: 4760,
			y: 988,
			scale: 1.2,
			depth: 6
		}
	],
	enemies: [
		{
			id: "thug",
			x: 620
		},
		{
			id: "rat",
			x: 980
		},
		{
			id: "thug",
			x: 1480
		},
		{
			id: "rat",
			x: 1980
		},
		{
			id: "thug",
			x: 2520
		},
		{
			id: "rat",
			x: 3080
		},
		{
			id: "thug",
			x: 3620
		},
		{
			id: "rat",
			x: 4180
		}
	],
	parallax: {
		sky: "/game/backgrounds/fort-lauderdale/sky-portrait.jpg",
		far: "/game/backgrounds/fort-lauderdale/far.jpg",
		mid: "/game/backgrounds/fort-lauderdale/mid.jpg",
		ground: "/game/backgrounds/fort-lauderdale/ground.jpg"
	}
};
function attachControlsTest(player, getEnemyCount) {
	if (typeof window === "undefined") return;
	window.__controlsTest = {
		getYaw: () => player.facing < 0 ? Math.PI / 2 : 0,
		getSpeed: () => player.vx,
		getX: () => player.x,
		getY: () => player.y,
		getFacing: () => player.facing,
		getGrounded: () => player.grounded,
		getMoveX: () => inputManager.snapshot().moveX,
		getEnabled: () => inputManager.enabled,
		getHealth: () => useGameStore.getState().health,
		getKos: () => useGameStore.getState().kos,
		getEnemyCount,
		getDisplay: () => ({
			w: player.sprite.displayWidth,
			h: player.sprite.displayHeight,
			frameW: player.sprite.frame.width,
			frameH: player.sprite.frame.height
		}),
		setKeys: (codes) => {
			inputManager.setInjectedKeys(codes);
		},
		setSteer: (v) => {
			if (v > .2) inputManager.setInjectedKeys(["KeyA"]);
			else if (v < -.2) inputManager.setInjectedKeys(["KeyD"]);
			else inputManager.setInjectedKeys([]);
		}
	};
}
function detachControlsTest() {
	if (typeof window === "undefined") return;
	delete window.__controlsTest;
}
var COMBO_WINDOW = COMBAT.comboWindow;
var DASH_SPEED = 640;
var Player = class {
	sprite;
	character;
	facing = 1;
	grounded = false;
	spawn = {
		x: 0,
		y: 0
	};
	combat = null;
	coyote = 0;
	buffer = 0;
	jumpHeld = false;
	wasGrounded = false;
	jumping = false;
	actionLock = 0;
	combo = 0;
	comboWindow = 0;
	specialIndex = 0;
	attackBuffered = false;
	specialBuffered = false;
	bufferedSlot = null;
	playingMove = null;
	iFrames = 0;
	hurtLock = 0;
	recovering = false;
	constructor(scene, x, y, character) {
		this.character = character;
		this.spawn = {
			x,
			y
		};
		this.sprite = scene.physics.add.sprite(x, y, character.animationSet.idle.textureKey, 0);
		this.sprite.setOrigin(.5, 1);
		this.sprite.setScale(PLAYER_DISPLAY_SCALE);
		this.sprite.setDepth(20);
		const body = this.sprite.body;
		body.setCollideWorldBounds(true);
		body.setMaxVelocity(Math.max(character.movementSpeed, DASH_SPEED), JUMP.terminal);
		body.setDrag(0, 0);
		body.setFriction(0, 0);
		body.setBounce(0, 0);
		body.setAllowGravity(false);
		body.setAllowGravity(false);
		body.setSize(PLAYER_BODY.width, PLAYER_BODY.height);
		body.setOffset(PLAYER_BODY.offsetX, PLAYER_BODY.offsetY);
		body.pushable = false;
		body.moves = false;
		this.sprite.play(character.animationSet.idle.key);
	}
	bindCombat(combat) {
		this.combat = combat;
	}
	get x() {
		return this.sprite.x;
	}
	get y() {
		return this.sprite.y;
	}
	get vx() {
		return this.sprite.body.velocity.x;
	}
	get vy() {
		return this.sprite.body.velocity.y;
	}
	takeHit(damage, knockbackX) {
		if (this.iFrames > 0 || this.recovering) return false;
		const store = useGameStore.getState();
		const health = Math.max(0, store.health - damage);
		store.setHealth(health);
		this.iFrames = COMBAT.playerIFramesMs / 1e3;
		this.hurtLock = .34;
		this.clearMove();
		this.sprite.body.setVelocity(knockbackX, -90);
		flashSprite(this.sprite, 16777215);
		this.playHurt();
		audioManager.hurt();
		if (health <= 0) this.knockOut();
		return true;
	}
	update(actions, dt) {
		const body = this.sprite.body;
		const vyNow = body.velocity.y;
		const onFloor = body.blocked.down || body.touching.down || vyNow >= -12 && this.sprite.y >= 976 && this.sprite.y <= 998;
		this.grounded = onFloor;
		if (this.iFrames > 0) {
			this.iFrames = Math.max(0, this.iFrames - dt);
			this.sprite.setAlpha(.45 + .55 * Math.abs(Math.sin(this.iFrames * 24)));
		} else this.sprite.setAlpha(1);
		if (this.hurtLock > 0) this.hurtLock = Math.max(0, this.hurtLock - dt);
		if (onFloor) this.coyote = JUMP.coyoteMs / 1e3;
		else this.coyote = Math.max(0, this.coyote - dt);
		if (actions.jumpPressed) this.buffer = JUMP.bufferMs / 1e3;
		else this.buffer = Math.max(0, this.buffer - dt);
		if (actions.jumpPressed) this.jumpHeld = true;
		if (!actions.jump) this.jumpHeld = false;
		if (this.actionLock > 0) this.actionLock = Math.max(0, this.actionLock - dt);
		if (this.comboWindow > 0) this.comboWindow = Math.max(0, this.comboWindow - dt);
		else this.combo = 0;
		const stunned = this.hurtLock > 0 || this.recovering;
		const occupy = this.actionLock > 0 && this.playingMove;
		const freezeWalk = stunned || Boolean(occupy) && (this.playingMove?.effect === "dash" || this.playingMove?.effect === "finisher" || this.playingMove?.effect === "projectile" || this.playingMove?.effect === "clone");
		const speed = this.character.movementSpeed;
		const accel = onFloor ? MOVE.accel : MOVE.airAccel;
		const friction = onFloor ? MOVE.friction : MOVE.airFriction;
		let vx = body.velocity.x;
		if (!(this.playingMove?.effect === "dash" && this.actionLock > 0)) {
			if (Math.abs(actions.moveX) > .12 && !freezeWalk) vx = approach(vx, actions.moveX * speed, accel * dt);
			else vx = approach(vx, 0, friction * dt);
		}
		this.sprite.x += vx * dt;
		this.sprite.x = Math.max(40, Math.min(WORLD_WIDTH - 40, this.sprite.x));
		body.setVelocityX(vx);
		if (!freezeWalk) {
			if (actions.moveX > .15) this.facing = 1;
			else if (actions.moveX < -.15) this.facing = -1;
		}
		this.sprite.setFlipX(this.facing < 0);
		let vy = body.velocity.y;
		const canJump = this.coyote > 0 && !this.jumping && !stunned;
		if (this.buffer > 0 && canJump) {
			vy = JUMP.velocity;
			this.buffer = 0;
			this.coyote = 0;
			this.jumping = true;
			this.jumpHeld = true;
			this.clearMove();
			audioManager.jump();
		}
		if (this.jumping && !this.jumpHeld && vy < 0) {
			vy *= JUMP.cutMultiplier;
			this.jumping = false;
		}
		let gravity = vy < 0 ? JUMP.riseGravity : JUMP.fallGravity;
		if (Math.abs(vy) < JUMP.apexWindow) gravity *= JUMP.apexHang;
		vy = Math.min(vy + gravity * dt, JUMP.terminal);
		if (onFloor) {
			if (vy > 0) vy = 0;
			this.jumping = false;
			if (!this.wasGrounded && this.vy > 120) audioManager.land();
		}
		this.sprite.y += vy * dt;
		if (onFloor && this.sprite.y > 980) this.sprite.y = 980;
		body.setVelocityY(vy);
		body.updateFromGameObject();
		this.wasGrounded = onFloor;
		if (!stunned) {
			if (actions.attackPressed) this.attackBuffered = true;
			if (actions.specialPressed) this.specialBuffered = true;
			if (actions.specialSlot !== null) {
				this.specialBuffered = true;
				this.bufferedSlot = actions.specialSlot;
			}
			if (this.actionLock <= 0) {
				if (this.attackBuffered) {
					this.attackBuffered = false;
					this.startAttack();
				} else if (this.specialBuffered) {
					this.specialBuffered = false;
					const slot = this.bufferedSlot;
					this.bufferedSlot = null;
					this.startSpecial(slot);
				}
			}
		}
		useGameStore.getState().rechargeKi(8 * dt);
		this.updateAnimation(onFloor, vx, vy);
	}
	startAttack() {
		const step = this.comboWindow > 0 ? Math.min(this.combo, 2) : 0;
		const move = this.character.attacks[step];
		this.combo = step + 1;
		this.comboWindow = COMBO_WINDOW;
		this.playMove(move);
	}
	startSpecial(slot) {
		const store = useGameStore.getState();
		if (store.energy >= 100) {
			this.playMove(this.character.finisher);
			store.spendKi(this.character.finisher.kiCost);
			store.gainXp(20);
			this.combo = 0;
			this.comboWindow = 0;
			return;
		}
		const index = slot !== null ? Math.max(0, Math.min(2, slot)) : this.specialIndex;
		const move = this.character.specials[index];
		if (store.energy < move.kiCost) {
			useGameStore.setState({ flash: "Need more KI" });
			return;
		}
		store.spendKi(move.kiCost);
		store.gainXp(10);
		this.playMove(move);
		this.specialIndex = (index + 1) % 3;
		useGameStore.setState({ specialIndex: this.specialIndex });
		this.combo = 0;
		this.comboWindow = 0;
	}
	playMove(move) {
		this.playingMove = move;
		this.actionLock = move.durationMs / 1e3;
		useGameStore.setState({
			currentMove: move.name,
			flash: ""
		});
		const clip = this.character.animationSet[move.anim];
		this.sprite.anims.stop();
		this.sprite.setTexture(clip.textureKey, 0);
		this.sprite.play(clip.key);
		const scene = this.sprite.scene;
		const delay = move.anim === "light" ? 70 : move.anim === "heavy" ? 140 : move.anim === "finisher" ? 200 : 110;
		if (move.effect === "melee" || move.effect === "finisher") {
			playSlash(scene, this.x, this.y, this.facing);
			audioManager.attack();
			scene.time.delayedCall(delay, () => {
				if (this.playingMove !== move) return;
				this.combat?.spawnHit({
					x: this.x + this.facing * (move.effect === "finisher" ? 70 : 62),
					y: this.y - 48,
					width: move.effect === "finisher" ? 160 : 110,
					height: 96,
					damage: move.damage,
					knockback: move.effect === "finisher" ? 460 : 260,
					faction: "player",
					durationMs: move.effect === "finisher" ? 200 : 140
				});
			});
		}
		if (move.effect === "projectile") {
			audioManager.special();
			scene.time.delayedCall(120, () => {
				if (this.playingMove !== move) return;
				const bolt = playWave(scene, this.x, this.y, this.facing);
				if (bolt) this.combat?.armProjectile(bolt, {
					damage: move.damage,
					knockback: 320,
					faction: "player",
					durationMs: 900
				});
			});
		}
		if (move.effect === "dash") {
			this.sprite.body.setVelocityX(this.facing * DASH_SPEED);
			audioManager.whoosh();
			this.combat?.spawnHit({
				x: this.x + this.facing * 40,
				y: this.y - 50,
				width: 70,
				height: 64,
				damage: move.damage,
				knockback: 300,
				faction: "player",
				durationMs: move.durationMs,
				follow: this.sprite,
				followOffsetX: 40,
				followOffsetY: -50
			});
		}
		if (move.effect === "clone") {
			playClone(scene, this.sprite);
			audioManager.special();
		}
		if (move.effect === "finisher") audioManager.finisher();
	}
	playHurt() {
		const clip = this.character.animationSet.hurt;
		this.sprite.anims.stop();
		this.sprite.setTexture(clip.textureKey, 0);
		this.sprite.play(clip.key);
	}
	knockOut() {
		this.recovering = true;
		this.clearMove();
		this.hurtLock = 1.1;
		useGameStore.setState({ flash: "KO — get up" });
		this.sprite.scene.time.delayedCall(1100, () => {
			if (!this.sprite.active) return;
			this.sprite.setPosition(this.spawn.x, this.spawn.y);
			this.sprite.body.setVelocity(0, 0);
			useGameStore.getState().setHealth(this.character.health);
			this.iFrames = 1.2;
			this.hurtLock = 0;
			this.recovering = false;
			useGameStore.setState({ flash: "" });
		});
	}
	clearMove() {
		this.playingMove = null;
		this.actionLock = 0;
		this.attackBuffered = false;
		this.specialBuffered = false;
		this.bufferedSlot = null;
		useGameStore.setState({ currentMove: "" });
	}
	updateAnimation(onFloor, vx, vy) {
		if (this.hurtLock > 0 || this.recovering) return;
		if (this.actionLock > 0 && this.playingMove) return;
		if (this.playingMove && this.actionLock <= 0) {
			this.playingMove = null;
			useGameStore.setState({ currentMove: "" });
		}
		const set = this.character.animationSet;
		if (!onFloor) {
			const frame = vy < -80 ? 1 : 3;
			this.sprite.anims.stop();
			if (this.sprite.texture.key !== set.jump.textureKey) this.sprite.setTexture(set.jump.textureKey, frame);
			else this.sprite.setFrame(frame);
			return;
		}
		const key = Math.abs(vx) > 28 ? set.run.key : set.idle.key;
		if (this.sprite.anims.currentAnim?.key !== key || !this.sprite.anims.isPlaying) this.sprite.play(key, true);
	}
	destroy() {
		this.sprite.destroy();
	}
};
var Phaser$1 = phaser_esm_exports;
var PlayScene = class extends Phaser$1.Scene {
	player;
	combat;
	far;
	mid;
	platforms;
	fpsTimer = 0;
	constructor() {
		super({ key: "play" });
	}
	init() {
		this.fpsTimer = 0;
	}
	preload() {
		const level = FORT_LAUDERDALE;
		this.load.image("sky", level.parallax.sky);
		this.load.image("far", level.parallax.far);
		this.load.image("mid", level.parallax.mid);
		this.load.image("ground", level.parallax.ground);
		this.load.image("palm", "/game/sprites/props/palm.png");
		this.load.image("tower", "/game/sprites/props/tower.png");
		this.load.spritesheet("slash-fx", "/game/sprites/fx/slash.png", {
			frameWidth: 128,
			frameHeight: 128
		});
		this.load.spritesheet("wave-fx", "/game/sprites/fx/wave.png", {
			frameWidth: 128,
			frameHeight: 128
		});
		this.load.spritesheet("impact-fx", "/game/sprites/fx/impact.png", {
			frameWidth: 128,
			frameHeight: 128
		});
		for (const clip of allRosterClips()) this.load.spritesheet(clip.textureKey, clip.url, {
			frameWidth: clip.frameWidth,
			frameHeight: clip.frameHeight
		});
		for (const clip of allEnemyClips()) this.load.spritesheet(clip.textureKey, clip.url, {
			frameWidth: clip.frameWidth,
			frameHeight: clip.frameHeight
		});
	}
	create() {
		const level = FORT_LAUDERDALE;
		const debug = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug");
		this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
		this.physics.world.gravity.y = 0;
		if (debug) {
			this.physics.world.createDebugGraphic();
			this.physics.world.drawDebug = true;
		}
		useGameStore.setState({ debug });
		this.add.image(360, GAME_HEIGHT / 2, "sky").setDisplaySize(720, GAME_HEIGHT).setScrollFactor(0).setDepth(0);
		this.far = this.add.tileSprite(0, 430, 720, 420, "far").setOrigin(0).setScrollFactor(0).setDepth(1);
		this.mid = this.add.tileSprite(0, 520, 720, 380, "mid").setOrigin(0).setScrollFactor(0).setAlpha(.26).setDepth(2);
		const groundH = WORLD_HEIGHT - level.groundY + 90;
		this.add.tileSprite(WORLD_WIDTH / 2, level.groundY, WORLD_WIDTH, groundH, "ground").setOrigin(.5, 0).setDepth(4);
		for (const prop of level.props) this.add.image(prop.x, prop.y, prop.key).setOrigin(.5, 1).setScale(prop.scale).setFlipX(Boolean(prop.flipX)).setDepth(prop.depth);
		this.platforms = this.physics.add.staticGroup();
		const floor = this.add.rectangle(0, level.groundY, WORLD_WIDTH + 40, 72, 0, 0).setOrigin(0, 0).setVisible(false);
		this.physics.add.existing(floor, true);
		floor.body.updateFromGameObject();
		this.platforms.add(floor);
		for (const pad of level.platforms) {
			const visual = this.add.tileSprite(pad.x, pad.y, pad.width, pad.height, "ground").setOrigin(.5, 0).setDepth(9);
			this.physics.add.existing(visual, true);
			visual.body.updateFromGameObject();
			this.platforms.add(visual);
		}
		this.platforms.refresh();
		for (const clip of allRosterClips()) {
			if (this.anims.exists(clip.key)) continue;
			this.anims.create({
				key: clip.key,
				frames: this.anims.generateFrameNumbers(clip.textureKey, {
					start: 0,
					end: clip.frames - 1
				}),
				frameRate: clip.frameRate,
				repeat: clip.repeat
			});
		}
		createFxAnimations(this);
		CombatSystem.preloadAnims(this);
		const character = getCharacter(useGameStore.getState().characterId);
		this.player = new Player(this, level.spawn.x, level.spawn.y, character);
		this.physics.add.collider(this.player.sprite, this.platforms);
		this.combat = new CombatSystem(this, debug);
		this.combat.bindPlayer(this.player);
		for (const spawn of level.enemies) {
			const enemy = this.combat.spawnEnemy(spawn.id, spawn.x, level.groundY);
			this.physics.add.collider(enemy.sprite, this.platforms);
		}
		this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
		this.cameras.main.startFollow(this.player.sprite, true, CAMERA.lerpX, CAMERA.lerpY);
		this.cameras.main.setDeadzone(CAMERA.deadzoneW, CAMERA.deadzoneH);
		this.cameras.main.setFollowOffset(-CAMERA.lookAhead, CAMERA.lookY);
		this.cameras.main.setRoundPixels(true);
		attachControlsTest(this.player, () => this.combat.aliveCount());
		if (typeof window !== "undefined") window.__playGeneration = (window.__playGeneration ?? 0) + 1;
		this.events.once("shutdown", () => {
			this.combat.shutdown();
			detachControlsTest();
		});
	}
	update(_time, delta) {
		const dt = Math.min(delta / 1e3, .1);
		const actions = inputManager.poll();
		if (actions.pausePressed && useGameStore.getState().playing) {
			inputManager.enabled = false;
			useGameStore.getState().setScreen("select");
		}
		if (this.combat.isFrozen()) {
			this.combat.tickFreeze(dt);
			this.player.update(actions, 0);
		} else {
			this.player.update(actions, dt);
			this.combat.update(dt);
		}
		const look = -this.player.facing * CAMERA.lookAhead;
		const cam = this.cameras.main;
		const current = cam.followOffset.x;
		cam.setFollowOffset(current + (look - current) * Math.min(1, 4 * dt), CAMERA.lookY);
		const scrollX = cam.scrollX;
		this.far.tilePositionX = scrollX * .22;
		this.mid.tilePositionX = scrollX * .42;
		this.fpsTimer += dt;
		if (this.fpsTimer > .25) {
			this.fpsTimer = 0;
			useGameStore.getState().setFps(Math.round(this.game.loop.actualFps));
			useGameStore.getState().setAliveEnemies(this.combat.aliveCount());
		}
	}
};
var Phaser = phaser_esm_exports;
function createGame(parent) {
	const game = new Phaser.Game({
		type: Phaser.AUTO,
		parent,
		width: 720,
		height: GAME_HEIGHT,
		backgroundColor: "#0b6e7a",
		antialias: true,
		roundPixels: true,
		pixelArt: false,
		banner: false,
		physics: {
			default: "arcade",
			arcade: {
				gravity: {
					x: 0,
					y: 0
				},
				debug: false,
				fps: 60,
				fixedStep: false
			}
		},
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH,
			width: 720,
			height: GAME_HEIGHT
		},
		input: {
			keyboard: true,
			activePointers: 3
		},
		scene: [PlayScene],
		audio: { disableWebAudio: true },
		render: { powerPreference: "high-performance" }
	});
	registerGame(game);
	game.events.once("destroy", () => unregisterGame(game));
	return game;
}
//#endregion
export { createGame };
