import { C as WORLD_WIDTH, S as WORLD_HEIGHT, _ as GAME_HEIGHT, a as getLevel, b as PLAYER_BODY, c as allRosterClips, d as unregisterGame, f as CAMERA, g as ENEMY_DISPLAY_SCALE, h as ENEMY_BODY, i as SOUTH_FLORIDA_LEVELS, l as getCharacter, n as inputManager, o as approach, p as COMBAT, r as useGameStore, s as audioManager, u as registerGame, v as JUMP, x as PLAYER_DISPLAY_SCALE, y as MOVE } from "./routes-BwETuoLp.mjs";
import { t as phaser_esm_exports } from "../_libs/phaser.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createGame-3ZgN9ise.js
var STANDARD_SHEET = {
	frameWidth: 160,
	frameHeight: 180,
	frames: 4
};
var BOSS_SHEET = {
	frameWidth: 180,
	frameHeight: 200,
	frames: 4
};
function clip(id, action, frameRate, repeat, sheet = STANDARD_SHEET) {
	return {
		key: `${id}-${action}`,
		textureKey: `${id}-${action}`,
		url: `/game/sprites/enemies/${id}/${action}.png`,
		...sheet,
		frameRate,
		repeat
	};
}
function makeSet(id, sheet = STANDARD_SHEET) {
	return {
		idle: clip(id, "idle", 6, -1, sheet),
		run: clip(id, "run", 8, -1, sheet),
		attack: clip(id, "attack", 10, 0, sheet),
		hurt: clip(id, "hurt", 10, 0, sheet)
	};
}
var BRUISER = {
	id: "bruiser",
	name: "Boardwalk Bruiser",
	title: "Heavy Street Enforcer",
	health: 45,
	speed: 88,
	damage: 12,
	attackRange: 76,
	aggroRange: 380,
	attackDurationMs: 480,
	attackCooldownMs: 1200,
	attackDelayMs: 160,
	knockback: 320,
	xp: 12,
	kiReward: 14,
	behaviorType: "melee",
	hasSuperArmor: true,
	animationSet: makeSet("bruiser")
};
var BLADE = {
	id: "blade",
	name: "Ybor Blade",
	title: "Agile Knife Duelist",
	health: 28,
	speed: 180,
	damage: 8,
	attackRange: 82,
	aggroRange: 460,
	attackDurationMs: 360,
	attackCooldownMs: 800,
	attackDelayMs: 100,
	knockback: 220,
	xp: 10,
	kiReward: 12,
	behaviorType: "fast",
	animationSet: makeSet("blade")
};
var ENEMIES = [
	BRUISER,
	BLADE,
	{
		id: "boss",
		name: "Syndicate Kingpin",
		title: "Vice Underworld Boss",
		health: 160,
		speed: 95,
		damage: 22,
		attackRange: 95,
		aggroRange: 550,
		attackDurationMs: 640,
		attackCooldownMs: 1e3,
		attackDelayMs: 200,
		knockback: 480,
		xp: 50,
		kiReward: 40,
		behaviorType: "boss",
		hasSuperArmor: true,
		animationSet: makeSet("boss", BOSS_SHEET)
	}
];
function getEnemy(id) {
	if (id === "thug") return BRUISER;
	if (id === "rat") return BLADE;
	return ENEMIES.find((e) => e.id === id) ?? BRUISER;
}
function allEnemyClips() {
	return ENEMIES.flatMap((enemy) => Object.values(enemy.animationSet));
}
function prefersReducedMotion() {
	return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function floatText(scene, x, y, text, color, size = "32px") {
	const label = scene.add.text(x, y, text, {
		fontFamily: "Bebas Neue, Impact, sans-serif",
		fontSize: size,
		color,
		stroke: "#0c1a24",
		strokeThickness: 6
	}).setOrigin(.5, 1).setDepth(50);
	label.setScale(.7);
	scene.tweens.add({
		targets: label,
		scaleX: 1.15,
		scaleY: 1.15,
		y: y - 20,
		duration: 120,
		ease: "Back.easeOut",
		onComplete: () => {
			scene.tweens.add({
				targets: label,
				scaleX: 1,
				scaleY: 1,
				y: y - 64,
				alpha: 0,
				duration: 480,
				ease: "Quad.easeIn",
				onComplete: () => label.destroy()
			});
		}
	});
}
function shakeCamera(scene, intensity = COMBAT.shake, duration = 140) {
	if (prefersReducedMotion()) return;
	scene.cameras.main.shake(duration, intensity);
}
function cameraZoomPunch(scene, targetZoom = 1.06, duration = 160) {
	if (prefersReducedMotion()) return;
	scene.cameras.main.zoomTo(targetZoom, duration * .4, "Quad.easeOut", true, (_cam, progress) => {
		if (progress === 1) scene.cameras.main.zoomTo(1, duration * .6, "Quad.easeIn");
	});
}
function flashSprite(sprite, tint = 16777215, durationMs = 70) {
	sprite.setTintFill(tint);
	sprite.scene.time.delayedCall(durationMs, () => {
		if (sprite.active) sprite.clearTint();
	});
}
function spawnHitSparks(scene, x, y, color = 16770560, count = 8) {
	for (let i = 0; i < count; i++) {
		const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
		const speed = Phaser.Math.FloatBetween(120, 380);
		const line = scene.add.line(x, y, 0, 0, Math.cos(angle) * 14, Math.sin(angle) * 14, color);
		line.setLineWidth(3);
		line.setDepth(45);
		scene.tweens.add({
			targets: line,
			x: x + Math.cos(angle) * (speed * .15),
			y: y + Math.sin(angle) * (speed * .15),
			alpha: 0,
			scaleX: .2,
			duration: 200,
			ease: "Quad.easeOut",
			onComplete: () => line.destroy()
		});
	}
}
function applySquashStretch(sprite, baseScaleX, baseScaleY, squashX, squashY, duration = 100) {
	const currentFacing = Math.sign(baseScaleX) || 1;
	sprite.setScale(Math.abs(baseScaleX) * squashX * currentFacing, baseScaleY * squashY);
	sprite.scene.tweens.add({
		targets: sprite,
		scaleX: Math.abs(baseScaleX) * currentFacing,
		scaleY: baseScaleY,
		duration,
		ease: "Quad.easeOut"
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
		const isBoss = data.behaviorType === "boss";
		const scale = isBoss ? ENEMY_DISPLAY_SCALE * 1.3 : ENEMY_DISPLAY_SCALE;
		this.sprite = scene.physics.add.sprite(x, y, data.animationSet.idle.textureKey, 0);
		this.sprite.setOrigin(.5, 1);
		this.sprite.setScale(scale);
		this.sprite.setDepth(18);
		this.sprite.setData("enemy", this);
		const body = this.sprite.body;
		body.setCollideWorldBounds(true);
		body.setMaxVelocity(data.speed + 80, JUMP.terminal);
		body.setAllowGravity(false);
		body.setDrag(0, 0);
		body.setFriction(0, 0);
		body.setBounce(0, 0);
		body.setSize(isBoss ? ENEMY_BODY.width * 1.4 : ENEMY_BODY.width, isBoss ? ENEMY_BODY.height * 1.3 : ENEMY_BODY.height);
		body.setOffset(isBoss ? ENEMY_BODY.offsetX * 1.2 : ENEMY_BODY.offsetX, isBoss ? ENEMY_BODY.offsetY * 1.2 : ENEMY_BODY.offsetY);
		body.pushable = false;
		body.moves = false;
		const hpW = isBoss ? 70 : 42;
		this.hpBg = scene.add.rectangle(x, y - 128, hpW + 4, 7, 793124, .85).setDepth(26);
		this.hpFill = scene.add.rectangle(x - hpW / 2, y - 128, hpW, 5, isBoss ? 15254618 : 15228236, 1).setOrigin(0, .5).setDepth(27);
		this.sprite.play(data.animationSet.idle.key);
	}
	get x() {
		return this.sprite.x;
	}
	get y() {
		return this.sprite.y;
	}
	takeHit(damage, knockbackX, knockbackY = -80) {
		if (this.dead || this.iFrames > 0) return false;
		this.health = Math.max(0, this.health - damage);
		this.iFrames = this.data.behaviorType === "boss" ? .25 : .17;
		this.hurtLock = this.data.behaviorType === "boss" ? .18 : .28;
		this.attackLock = 0;
		this.state = "hurt";
		this.cooldown = Math.max(this.cooldown, .35);
		this.sprite.body.setVelocity(this.data.behaviorType === "boss" ? knockbackX * .4 : knockbackX, this.data.behaviorType === "boss" ? -40 : knockbackY);
		flashSprite(this.sprite, this.data.behaviorType === "boss" ? 16711935 : 16777215);
		this.playClip("hurt");
		this.refreshHp();
		audioManager.hurt();
		if (this.health <= 0) this.defeat();
		return true;
	}
	update(dt, playerX, playerY, combat) {
		if (!this.sprite.active) return;
		const hpOffset = this.data.behaviorType === "boss" ? -145 : -128;
		this.hpBg.setPosition(this.x, this.y + hpOffset);
		const hpW = this.data.behaviorType === "boss" ? 70 : 42;
		this.hpFill.setPosition(this.x - hpW / 2, this.y + hpOffset);
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
		const dist = Math.hypot(playerX - this.x, playerY - this.y);
		const dir = playerX > this.x ? 1 : -1;
		if (this.attackLock > 0) {
			const vx = approach(body.velocity.x, 0, 1800 * dt);
			this.sprite.x += vx * dt;
			this.sprite.y += vy * dt;
			if (onFloor && this.sprite.y > 980) this.sprite.y = 980;
			body.setVelocity(vx, vy);
			body.updateFromGameObject();
			return;
		}
		if (dist < this.data.attackRange && this.cooldown <= 0) {
			this.facing = dir;
			this.startAttack(combat);
			return;
		}
		if (dist < this.data.aggroRange) {
			this.state = "chase";
			this.facing = dir;
			const targetVx = dir * this.data.speed;
			const vx = approach(body.velocity.x, targetVx, 1600 * dt);
			this.sprite.x += vx * dt;
			this.sprite.y += vy * dt;
			if (onFloor && this.sprite.y > 980) this.sprite.y = 980;
			body.setVelocity(vx, vy);
			body.updateFromGameObject();
			this.sprite.setFlipX(this.facing < 0);
			this.playClip("run");
			return;
		}
		this.state = "patrol";
		const deltaHome = this.homeX - this.x;
		if (Math.abs(deltaHome) > 160) this.patrolDir = deltaHome > 0 ? 1 : -1;
		this.facing = this.patrolDir;
		const vx = approach(body.velocity.x, this.patrolDir * (this.data.speed * .45), 800 * dt);
		this.sprite.x += vx * dt;
		this.sprite.y += vy * dt;
		if (onFloor && this.sprite.y > 980) this.sprite.y = 980;
		body.setVelocity(vx, vy);
		body.updateFromGameObject();
		this.sprite.setFlipX(this.facing < 0);
		this.playClip("idle");
	}
	startAttack(combat) {
		this.state = "attack";
		this.attackLock = this.data.attackDurationMs / 1e3;
		this.cooldown = this.data.attackCooldownMs / 1e3;
		this.struck = false;
		this.sprite.setFlipX(this.facing < 0);
		this.playClip("attack");
		const isBoss = this.data.behaviorType === "boss";
		this.sprite.scene.time.delayedCall(this.data.attackDelayMs, () => {
			if (this.dead || this.hurtLock > 0) return;
			audioManager.swing(isBoss ? .7 : 1.1);
			combat.spawnHit({
				x: this.x + this.facing * (isBoss ? 58 : 42),
				y: this.y - 48,
				width: isBoss ? 110 : 78,
				height: isBoss ? 96 : 74,
				damage: this.data.damage,
				knockback: this.data.knockback,
				faction: "enemy",
				level: isBoss ? "overhead" : "mid",
				durationMs: 140,
				follow: this.sprite,
				followOffsetX: this.facing * (isBoss ? 58 : 42),
				followOffsetY: -48
			});
		});
	}
	playClip(action) {
		const clip = this.data.animationSet[action];
		if (this.sprite.anims.currentAnim?.key === clip.key) return;
		this.sprite.anims.stop();
		this.sprite.setTexture(clip.textureKey, 0);
		this.sprite.play(clip.key, true);
	}
	refreshHp() {
		const hpW = this.data.behaviorType === "boss" ? 70 : 42;
		const pct = Math.max(0, this.health / this.data.health);
		this.hpFill.setSize(Math.round(hpW * pct), 5);
	}
	defeat() {
		this.dead = true;
		this.state = "dead";
		this.hpBg.destroy();
		this.hpFill.destroy();
		this.playClip("hurt");
		this.sprite.body.setVelocity(this.facing * -240, -180);
		this.sprite.scene.tweens.add({
			targets: this.sprite,
			alpha: 0,
			y: this.sprite.y + 20,
			duration: 520,
			delay: 200,
			ease: "Quad.easeIn",
			onComplete: () => {
				this.sprite.destroy();
			}
		});
	}
};
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
	onVictoryCallback;
	constructor(scene, debug = false) {
		this.scene = scene;
		this.debug = debug;
		this.hitboxes = scene.physics.add.group();
		this.enemySprites = scene.physics.add.group();
	}
	setOnVictory(callback) {
		this.onVictoryCallback = callback;
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
			if (overlaps(box, ebody)) {
				hit.struck.add(enemy.id);
				this.applyEnemyHit(enemy, hit);
			}
		}
		else if (hit.faction === "enemy") {
			if (hit.struck.has(player.id)) return;
			const pbody = player.sprite.body;
			if (overlaps(box, pbody)) {
				hit.struck.add(player.id);
				this.landOnPlayer(player, hit);
			}
		}
	}
	applyEnemyHit(enemy, hit) {
		const player = this.player;
		if (!player) return;
		const dir = player.x < enemy.x ? 1 : -1;
		const store = useGameStore.getState();
		const comboCount = store.comboHits;
		const scaling = Math.max(.4, 1 - comboCount * .05);
		const scaledDamage = Math.max(1, Math.round(hit.damage * scaling));
		if (!enemy.takeHit(scaledDamage, dir * hit.knockback, hit.knockbackY ?? (hit.level === "overhead" || hit.level === "unblockable" ? -140 : -70))) return;
		const hitX = (player.x + enemy.x) / 2;
		const hitY = enemy.y - 54;
		playImpact(this.scene, hitX, hitY);
		spawnHitSparks(this.scene, hitX, hitY, hit.damage > 25 ? 16729156 : 16770560, 10);
		const isHeavy = hit.damage > 20;
		floatText(this.scene, enemy.x, enemy.y - 120, `${scaledDamage}`, isHeavy ? "#e8c45a" : "#f4f7f5", isHeavy ? "36px" : "28px");
		if (isHeavy) {
			audioManager.hitHeavy();
			cameraZoomPunch(this.scene, 1.05, 140);
			shakeCamera(this.scene, .012, 160);
			this.hitstop(hit.hitstopFrames ? hit.hitstopFrames * 16 : 90);
		} else {
			audioManager.hitLight();
			shakeCamera(this.scene, COMBAT.shake, 100);
			this.hitstop(hit.hitstopFrames ? hit.hitstopFrames * 16 : COMBAT.hitstopMs);
		}
		store.addComboHit();
		audioManager.comboChime(store.comboHits);
		store.gainKi(8);
		store.gainXp(enemy.data.xp);
		if (enemy.dead) {
			store.addKo();
			store.gainKi(enemy.data.kiReward);
			floatText(this.scene, enemy.x, enemy.y - 150, "K.O.", "#e85d4c", "44px");
			audioManager.koAnnounce();
			cameraZoomPunch(this.scene, 1.08, 300);
			this.hitstop(160);
			const remaining = this.aliveCount();
			store.setAliveEnemies(remaining);
			if (remaining === 0) this.onVictoryCallback?.();
		}
	}
	landOnPlayer(player, hit) {
		const originX = hit.follow?.x ?? hit.x;
		const dir = player.x < originX ? -1 : 1;
		const hitResult = player.receiveIncomingAttack(hit.damage, hit.chipDamage ?? 3, dir * hit.knockback, hit.level ?? "mid");
		if (hitResult.type === "parry") {
			audioManager.parry();
			spawnHitSparks(this.scene, player.x, player.y - 50, 65535, 14);
			flashSprite(player.sprite, 65535, 140);
			floatText(this.scene, player.x, player.y - 130, "JUST PARRY!", "#00ffff", "36px");
			shakeCamera(this.scene, .008, 120);
			this.hitstop(120);
			useGameStore.getState().gainKi(25);
			return;
		}
		if (hitResult.type === "block") {
			audioManager.block();
			spawnHitSparks(this.scene, player.x, player.y - 50, 8965375, 6);
			flashSprite(player.sprite, 4491519, 80);
			floatText(this.scene, player.x, player.y - 130, "GUARD", "#8aa0aa", "26px");
			shakeCamera(this.scene, .004, 80);
			this.hitstop(40);
			return;
		}
		if (hitResult.type === "hit") {
			playImpact(this.scene, player.x - dir * 16, player.y - 56);
			spawnHitSparks(this.scene, player.x, player.y - 56, 15228236, 8);
			floatText(this.scene, player.x, player.y - 130, `${hit.damage}`, "#e85d4c", "32px");
			shakeCamera(this.scene, .012, 150);
			this.hitstop(70);
			useGameStore.getState().resetCombo();
		}
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
var CharacterStateMachine = class {
	currentState = "IDLE";
	stateTime = 0;
	stateFrames = 0;
	changeState(newState) {
		if (this.currentState === "KO") return;
		this.currentState = newState;
		this.stateTime = 0;
		this.stateFrames = 0;
	}
	tick(dt) {
		this.stateTime += dt;
		this.stateFrames++;
	}
	isNeutral() {
		return this.currentState === "IDLE" || this.currentState === "WALK_FWD" || this.currentState === "WALK_BACK";
	}
	isAirborne() {
		return this.currentState === "JUMP_RISE" || this.currentState === "JUMP_FALL";
	}
	isAttacking() {
		return this.currentState === "ATTACK_STARTUP" || this.currentState === "ATTACK_ACTIVE" || this.currentState === "ATTACK_RECOVERY";
	}
	isBlocking() {
		return this.currentState === "BLOCK_HIGH" || this.currentState === "BLOCK_LOW" || this.currentState === "BLOCK_STUN";
	}
	isParrying() {
		return this.currentState === "PARRY_ACTIVE" || this.currentState === "PARRY_SUCCESS";
	}
	isInvulnerable() {
		return this.currentState === "TECH_ROLL" || this.currentState === "PARRY_SUCCESS";
	}
	canCancel() {
		return this.currentState === "ATTACK_ACTIVE" || this.currentState === "ATTACK_RECOVERY";
	}
};
var JAV_FRAME_KIT = {
	light: {
		id: "jav-light",
		name: "Street Jab",
		level: "high",
		startupFrames: 4,
		activeFrames: 3,
		recoveryFrames: 8,
		damage: 10,
		chipDamage: 0,
		blockStunFrames: 6,
		hitStunFrames: 14,
		hitReaction: "light",
		knockbackX: 120,
		knockbackY: -40,
		hitstopFrames: 5,
		cancelableTo: ["special", "finisher"],
		kiGainOnHit: 12
	},
	heavy: {
		id: "jav-heavy",
		name: "Royal Haymaker",
		level: "mid",
		startupFrames: 8,
		activeFrames: 4,
		recoveryFrames: 14,
		damage: 22,
		chipDamage: 4,
		blockStunFrames: 10,
		hitStunFrames: 22,
		hitReaction: "heavy",
		knockbackX: 280,
		knockbackY: -80,
		hitstopFrames: 9,
		cancelableTo: ["special", "finisher"],
		kiGainOnHit: 18
	},
	kick: {
		id: "jav-kick",
		name: "Boardwalk Crescent",
		level: "low",
		startupFrames: 7,
		activeFrames: 4,
		recoveryFrames: 12,
		damage: 18,
		chipDamage: 3,
		blockStunFrames: 8,
		hitStunFrames: 18,
		hitReaction: "knockdown",
		knockbackX: 320,
		knockbackY: -180,
		hitstopFrames: 8,
		cancelableTo: ["special", "finisher"],
		kiGainOnHit: 15
	},
	special1: {
		id: "jav-chain",
		name: "Neon Chain Strike",
		level: "mid",
		startupFrames: 9,
		activeFrames: 5,
		recoveryFrames: 16,
		damage: 28,
		chipDamage: 6,
		blockStunFrames: 12,
		hitStunFrames: 26,
		hitReaction: "launch",
		knockbackX: 220,
		knockbackY: -380,
		hitstopFrames: 10,
		cancelableTo: ["finisher"],
		kiCost: 25,
		kiGainOnHit: 8
	},
	special2: {
		id: "jav-wave",
		name: "Crown Plasma Wave",
		level: "high",
		startupFrames: 12,
		activeFrames: 8,
		recoveryFrames: 18,
		damage: 32,
		chipDamage: 8,
		blockStunFrames: 14,
		hitStunFrames: 24,
		hitReaction: "heavy",
		knockbackX: 360,
		knockbackY: -60,
		hitstopFrames: 10,
		cancelableTo: ["finisher"],
		kiCost: 30,
		kiGainOnHit: 6
	},
	special3: {
		id: "jav-step",
		name: "Shadow Blitz",
		level: "overhead",
		startupFrames: 6,
		activeFrames: 6,
		recoveryFrames: 10,
		damage: 24,
		chipDamage: 5,
		blockStunFrames: 12,
		hitStunFrames: 22,
		hitReaction: "wallbounce",
		knockbackX: 420,
		knockbackY: -120,
		hitstopFrames: 9,
		cancelableTo: ["finisher"],
		kiCost: 20,
		iFrames: 6,
		kiGainOnHit: 8
	},
	finisher: {
		id: "jav-hood",
		name: "South Florida Legend",
		level: "unblockable",
		startupFrames: 14,
		activeFrames: 10,
		recoveryFrames: 24,
		damage: 65,
		chipDamage: 30,
		blockStunFrames: 20,
		hitStunFrames: 45,
		hitReaction: "launch",
		knockbackX: 580,
		knockbackY: -480,
		hitstopFrames: 18,
		cancelableTo: [],
		kiCost: 100,
		iFrames: 14
	},
	parry: {
		startupFrames: 2,
		activeFrames: 6,
		recoveryFrames: 14,
		advantageFrames: 16
	},
	dash: {
		durationFrames: 14,
		iFrames: 8,
		speed: 720
	}
};
function getFrameKit(characterId) {
	return JAV_FRAME_KIT;
}
var InputBuffer = class {
	history = [];
	bufferQueue = [];
	currentFrame = 0;
	bufferLeniencyFrames = 10;
	prevRaw = {
		left: false,
		right: false,
		up: false,
		down: false,
		light: false,
		heavy: false,
		kick: false,
		special1: false,
		special2: false,
		special3: false,
		finisher: false,
		guard: false,
		parry: false,
		dash: false
	};
	tapTimes = {
		fwdTap: -999,
		backTap: -999
	};
	push(raw, facing) {
		this.currentFrame++;
		this.history.push({ ...raw });
		if (this.history.length > 30) this.history.shift();
		this.bufferQueue = this.bufferQueue.filter((entry) => !entry.consumed && this.currentFrame - entry.frameCreated <= this.bufferLeniencyFrames);
		const justLight = raw.light && !this.prevRaw.light;
		const justHeavy = raw.heavy && !this.prevRaw.heavy;
		const justKick = raw.kick && !this.prevRaw.kick;
		const justSpec1 = raw.special1 && !this.prevRaw.special1;
		const justSpec2 = raw.special2 && !this.prevRaw.special2;
		const justSpec3 = raw.special3 && !this.prevRaw.special3;
		const justFinisher = raw.finisher && !this.prevRaw.finisher;
		const justParry = raw.parry && !this.prevRaw.parry || raw.guard && justLight;
		const justDash = raw.dash && !this.prevRaw.dash;
		const justUp = raw.up && !this.prevRaw.up;
		facing > 0 && raw.right || facing < 0 && raw.left;
		const movingBack = facing > 0 && raw.left || facing < 0 && raw.right;
		const justFwd = facing > 0 && raw.right && !this.prevRaw.right || facing < 0 && raw.left && !this.prevRaw.left;
		const justBack = facing > 0 && raw.left && !this.prevRaw.left || facing < 0 && raw.right && !this.prevRaw.right;
		if (justFwd) {
			if (this.currentFrame - this.tapTimes.fwdTap <= 14) {
				this.addCommand("DASH_FWD");
				this.tapTimes.fwdTap = -999;
			} else this.tapTimes.fwdTap = this.currentFrame;
		}
		if (justBack) {
			if (this.currentFrame - this.tapTimes.backTap <= 14) {
				this.addCommand("DASH_BACK");
				this.tapTimes.backTap = -999;
			} else this.tapTimes.backTap = this.currentFrame;
		}
		if (justDash) {
			if (movingBack) this.addCommand("DASH_BACK");
			else this.addCommand("DASH_FWD");
		}
		if (justFinisher) this.addCommand("FINISHER");
		if (justSpec3) this.addCommand("SPECIAL3");
		if (justSpec2) this.addCommand("SPECIAL2");
		if (justSpec1) this.addCommand("SPECIAL1");
		if (justParry) this.addCommand("PARRY");
		if (justKick) this.addCommand("KICK");
		if (justHeavy) this.addCommand("HEAVY");
		if (justLight) this.addCommand("LIGHT");
		if (justUp) this.addCommand("JUMP");
		this.prevRaw = { ...raw };
	}
	addCommand(command) {
		this.bufferQueue.push({
			command,
			frameCreated: this.currentFrame,
			consumed: false
		});
	}
	peek() {
		const entry = this.bufferQueue.find((e) => !e.consumed);
		return entry ? entry.command : null;
	}
	consume(command) {
		if (command) {
			const idx = this.bufferQueue.findIndex((e) => !e.consumed && e.command === command);
			if (idx !== -1) {
				this.bufferQueue[idx].consumed = true;
				return this.bufferQueue[idx].command;
			}
			return null;
		}
		const entry = this.bufferQueue.find((e) => !e.consumed);
		if (entry) {
			entry.consumed = true;
			return entry.command;
		}
		return null;
	}
	clear() {
		this.bufferQueue = [];
	}
};
var Player = class {
	id = "player";
	sprite;
	character;
	frameKit;
	fsm = new CharacterStateMachine();
	inputBuffer = new InputBuffer();
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
	currentAttack = null;
	attackPhase = null;
	attackPhaseTimer = 0;
	hitHasConnected = false;
	iFrames = 0;
	stunTimer = 0;
	dashTimer = 0;
	parryTimer = 0;
	parryWindow = 0;
	recovering = false;
	constructor(scene, x, y, character) {
		this.character = character;
		this.frameKit = getFrameKit(character.id);
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
		body.setMaxVelocity(Math.max(character.movementSpeed, this.frameKit.dash.speed), JUMP.terminal);
		body.setDrag(0, 0);
		body.setFriction(0, 0);
		body.setBounce(0, 0);
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
	receiveIncomingAttack(damage, chipDamage, knockbackX, attackLevel) {
		if (this.iFrames > 0 || this.recovering || this.fsm.isInvulnerable()) return { type: "invulnerable" };
		if (this.parryWindow > 0) {
			this.fsm.changeState("PARRY_SUCCESS");
			this.parryTimer = .28;
			this.iFrames = .35;
			this.clearAttack();
			return { type: "parry" };
		}
		if ((this.fsm.currentState === "BLOCK_HIGH" || this.fsm.currentState === "BLOCK_LOW") && attackLevel !== "unblockable") {
			const isCrouchGuarding = this.fsm.currentState === "BLOCK_LOW";
			if (!(attackLevel === "overhead" && isCrouchGuarding || attackLevel === "low" && !isCrouchGuarding)) {
				const store = useGameStore.getState();
				const health = Math.max(0, store.health - chipDamage);
				store.setHealth(health);
				this.fsm.changeState("BLOCK_STUN");
				this.stunTimer = .16;
				this.sprite.body.setVelocity(knockbackX * .4, 0);
				return { type: "block" };
			}
		}
		const store = useGameStore.getState();
		const health = Math.max(0, store.health - damage);
		store.setHealth(health);
		this.iFrames = COMBAT.playerIFramesMs / 1e3;
		this.stunTimer = .34;
		this.fsm.changeState("HITSTUN");
		this.clearAttack();
		this.sprite.body.setVelocity(knockbackX, -90);
		flashSprite(this.sprite, 16777215);
		this.playHurt();
		audioManager.hurt();
		if (health <= 0) this.knockOut();
		return { type: "hit" };
	}
	takeHit(damage, knockbackX) {
		const res = this.receiveIncomingAttack(damage, 3, knockbackX, "mid");
		return res.type === "hit" || res.type === "block";
	}
	update(actions, dt) {
		const body = this.sprite.body;
		const vyNow = body.velocity.y;
		const onFloor = body.blocked.down || body.touching.down || vyNow >= -12 && this.sprite.y >= 976 && this.sprite.y <= 998;
		this.grounded = onFloor;
		this.inputBuffer.push(actions.raw, this.facing);
		if (this.iFrames > 0) {
			this.iFrames = Math.max(0, this.iFrames - dt);
			this.sprite.setAlpha(.45 + .55 * Math.abs(Math.sin(this.iFrames * 28)));
		} else this.sprite.setAlpha(1);
		if (this.stunTimer > 0) {
			this.stunTimer = Math.max(0, this.stunTimer - dt);
			if (this.stunTimer === 0 && this.fsm.currentState === "HITSTUN") this.fsm.changeState(onFloor ? "IDLE" : "JUMP_FALL");
		}
		if (this.parryWindow > 0) this.parryWindow = Math.max(0, this.parryWindow - dt);
		if (this.parryTimer > 0) {
			this.parryTimer = Math.max(0, this.parryTimer - dt);
			if (this.parryTimer === 0 && this.fsm.isParrying()) this.fsm.changeState(onFloor ? "IDLE" : "JUMP_FALL");
		}
		if (this.dashTimer > 0) {
			this.dashTimer = Math.max(0, this.dashTimer - dt);
			if (this.dashTimer === 0) this.fsm.changeState(onFloor ? "IDLE" : "JUMP_FALL");
		}
		if (onFloor) this.coyote = JUMP.coyoteMs / 1e3;
		else this.coyote = Math.max(0, this.coyote - dt);
		if (actions.jumpPressed) this.buffer = JUMP.bufferMs / 1e3;
		else this.buffer = Math.max(0, this.buffer - dt);
		if (actions.jumpPressed) this.jumpHeld = true;
		if (!actions.jump) this.jumpHeld = false;
		this.fsm.tick(dt);
		this.updateMovement(actions, onFloor, dt);
		this.updateAttackPhase(dt);
		this.processInputQueue(actions);
		useGameStore.getState().rechargeKi(9 * dt);
		this.updateAnimation(onFloor);
	}
	updateMovement(actions, onFloor, dt) {
		const body = this.sprite.body;
		const isStunned = this.stunTimer > 0 || this.recovering;
		const isAttacking = this.fsm.isAttacking();
		const isDashing = this.fsm.currentState === "DASH_FWD" || this.fsm.currentState === "DASH_BACK";
		const isParrying = this.fsm.isParrying();
		const speed = this.character.movementSpeed;
		const accel = onFloor ? MOVE.accel : MOVE.airAccel;
		const friction = onFloor ? MOVE.friction : MOVE.airFriction;
		let vx = body.velocity.x;
		if (!isDashing && !isStunned && !isAttacking && !isParrying) {
			const movingBack = this.facing > 0 && actions.moveX < -.15 || this.facing < 0 && actions.moveX > .15;
			if (actions.guard || movingBack && onFloor) {
				if (actions.moveY > .3) this.fsm.changeState("BLOCK_LOW");
				else this.fsm.changeState("BLOCK_HIGH");
				vx = approach(vx, 0, friction * dt);
			} else if (Math.abs(actions.moveX) > .12) {
				vx = approach(vx, actions.moveX * speed, accel * dt);
				if (actions.moveX > .15) this.facing = 1;
				else if (actions.moveX < -.15) this.facing = -1;
				if (onFloor) this.fsm.changeState(actions.moveX * this.facing > 0 ? "WALK_FWD" : "WALK_BACK");
			} else {
				vx = approach(vx, 0, friction * dt);
				if (onFloor && this.fsm.currentState !== "IDLE") this.fsm.changeState("IDLE");
			}
		} else if (isDashing) vx = (this.fsm.currentState === "DASH_FWD" ? this.facing : -this.facing) * this.frameKit.dash.speed;
		else vx = approach(vx, 0, friction * dt);
		this.sprite.x += vx * dt;
		this.sprite.x = Math.max(40, Math.min(WORLD_WIDTH - 40, this.sprite.x));
		body.setVelocityX(vx);
		this.sprite.setFlipX(this.facing < 0);
		let vy = body.velocity.y;
		const canJump = this.coyote > 0 && !this.jumping && !isStunned && !isAttacking && !isParrying;
		if (this.buffer > 0 && canJump) {
			vy = JUMP.velocity;
			this.buffer = 0;
			this.coyote = 0;
			this.jumping = true;
			this.jumpHeld = true;
			this.fsm.changeState("JUMP_RISE");
			applySquashStretch(this.sprite, PLAYER_DISPLAY_SCALE, PLAYER_DISPLAY_SCALE, .75, 1.3, 120);
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
			if (!this.wasGrounded && this.vy > 120) {
				audioManager.land();
				applySquashStretch(this.sprite, PLAYER_DISPLAY_SCALE, PLAYER_DISPLAY_SCALE, 1.3, .75, 100);
			}
		} else if (vy > 0 && this.fsm.currentState === "JUMP_RISE") this.fsm.changeState("JUMP_FALL");
		this.sprite.y += vy * dt;
		if (onFloor && this.sprite.y > 980) this.sprite.y = 980;
		body.setVelocityY(vy);
		body.updateFromGameObject();
		this.wasGrounded = onFloor;
	}
	processInputQueue(actions) {
		if (this.stunTimer > 0 || this.recovering) return;
		const cmd = this.inputBuffer.peek();
		if (!cmd) return;
		if (cmd === "PARRY" && this.fsm.isNeutral()) {
			this.inputBuffer.consume("PARRY");
			this.startParry();
			return;
		}
		if ((cmd === "DASH_FWD" || cmd === "DASH_BACK") && this.fsm.isNeutral()) {
			this.inputBuffer.consume(cmd);
			this.startDash(cmd === "DASH_FWD");
			return;
		}
		if (this.fsm.isNeutral() || this.fsm.canCancel() && this.canCancelCurrentAttack(cmd)) this.executeAttackCommand(cmd);
	}
	canCancelCurrentAttack(nextCmd) {
		if (!this.currentAttack) return false;
		const cancelables = this.currentAttack.cancelableTo;
		if (nextCmd === "FINISHER") return cancelables.includes("finisher");
		if (nextCmd === "SPECIAL1" || nextCmd === "SPECIAL2" || nextCmd === "SPECIAL3") return cancelables.includes("special");
		if (nextCmd === "DASH_FWD" || nextCmd === "DASH_BACK") return cancelables.includes("dash");
		if (this.currentAttack.id.endsWith("light") && (nextCmd === "HEAVY" || nextCmd === "KICK")) return true;
		if (this.currentAttack.id.endsWith("heavy") && nextCmd === "KICK") return true;
		return false;
	}
	executeAttackCommand(cmd) {
		let attackData = null;
		let clipKey = "light";
		if (cmd === "LIGHT") {
			attackData = this.frameKit.light;
			clipKey = "light";
		} else if (cmd === "HEAVY") {
			attackData = this.frameKit.heavy;
			clipKey = "heavy";
		} else if (cmd === "KICK") {
			attackData = this.frameKit.kick;
			clipKey = "kick";
		} else if (cmd === "SPECIAL1") {
			attackData = this.frameKit.special1;
			clipKey = "special1";
		} else if (cmd === "SPECIAL2") {
			attackData = this.frameKit.special2;
			clipKey = "special2";
		} else if (cmd === "SPECIAL3") {
			attackData = this.frameKit.special3;
			clipKey = "special3";
		} else if (cmd === "FINISHER") {
			attackData = this.frameKit.finisher;
			clipKey = "finisher";
		}
		if (!attackData) return;
		const store = useGameStore.getState();
		if (attackData.kiCost && store.energy < attackData.kiCost) {
			useGameStore.setState({ flash: "Need more KI" });
			return;
		}
		this.inputBuffer.consume(cmd);
		if (attackData.kiCost) {
			store.spendKi(attackData.kiCost);
			store.gainXp(15);
		}
		this.currentAttack = attackData;
		this.attackPhase = "startup";
		this.attackPhaseTimer = attackData.startupFrames / 60;
		this.hitHasConnected = false;
		this.fsm.changeState("ATTACK_STARTUP");
		if (attackData.iFrames) this.iFrames = Math.max(this.iFrames, attackData.iFrames / 60);
		useGameStore.setState({
			currentMove: attackData.name,
			flash: ""
		});
		const clip = this.character.animationSet[clipKey];
		this.sprite.anims.stop();
		this.sprite.setTexture(clip.textureKey, 0);
		this.sprite.play(clip.key);
		audioManager.swing(cmd === "LIGHT" ? 1.4 : cmd === "HEAVY" ? .9 : 1.1);
	}
	updateAttackPhase(dt) {
		if (!this.currentAttack || !this.attackPhase) return;
		this.attackPhaseTimer -= dt;
		if (this.attackPhaseTimer <= 0) {
			if (this.attackPhase === "startup") {
				this.attackPhase = "active";
				this.attackPhaseTimer = this.currentAttack.activeFrames / 60;
				this.fsm.changeState("ATTACK_ACTIVE");
				this.spawnAttackHitbox();
			} else if (this.attackPhase === "active") {
				this.attackPhase = "recovery";
				this.attackPhaseTimer = this.currentAttack.recoveryFrames / 60;
				this.fsm.changeState("ATTACK_RECOVERY");
			} else if (this.attackPhase === "recovery") {
				this.clearAttack();
				this.fsm.changeState(this.grounded ? "IDLE" : "JUMP_FALL");
			}
		}
	}
	spawnAttackHitbox() {
		if (!this.currentAttack || !this.combat) return;
		const atk = this.currentAttack;
		const scene = this.sprite.scene;
		const isSpecial = atk.id.includes("chain") || atk.id.includes("wave") || atk.id.includes("dash") || atk.id.includes("clone") || atk.id.includes("stalker");
		if (atk.id.includes("hood") || atk.id.includes("phantom")) {
			audioManager.finisher();
			this.combat.spawnHit({
				x: this.x + this.facing * 75,
				y: this.y - 50,
				width: 170,
				height: 110,
				damage: atk.damage,
				chipDamage: atk.chipDamage,
				knockback: atk.knockbackX,
				knockbackY: atk.knockbackY,
				level: atk.level,
				hitReaction: atk.hitReaction,
				hitstopFrames: atk.hitstopFrames,
				faction: "player",
				durationMs: atk.activeFrames / 60 * 1e3
			});
			playSlash(scene, this.x + this.facing * 30, this.y, this.facing);
			return;
		}
		if (atk.id.includes("wave")) {
			audioManager.special();
			const bolt = playWave(scene, this.x, this.y, this.facing);
			if (bolt) this.combat.armProjectile(bolt, {
				damage: atk.damage,
				chipDamage: atk.chipDamage,
				knockback: atk.knockbackX,
				knockbackY: atk.knockbackY,
				level: atk.level,
				hitReaction: atk.hitReaction,
				hitstopFrames: atk.hitstopFrames,
				faction: "player",
				durationMs: 900
			});
			return;
		}
		if (atk.id.includes("clone")) {
			playClone(scene, this.sprite);
			audioManager.special();
		}
		playSlash(scene, this.x, this.y, this.facing);
		this.combat.spawnHit({
			x: this.x + this.facing * (isSpecial ? 68 : 58),
			y: this.y - 48,
			width: isSpecial ? 120 : 100,
			height: 90,
			damage: atk.damage,
			chipDamage: atk.chipDamage,
			knockback: atk.knockbackX,
			knockbackY: atk.knockbackY,
			level: atk.level,
			hitReaction: atk.hitReaction,
			hitstopFrames: atk.hitstopFrames,
			faction: "player",
			durationMs: atk.activeFrames / 60 * 1e3
		});
	}
	startParry() {
		this.fsm.changeState("PARRY_ACTIVE");
		this.parryWindow = this.frameKit.parry.activeFrames / 60;
		this.parryTimer = (this.frameKit.parry.activeFrames + this.frameKit.parry.recoveryFrames) / 60;
		flashSprite(this.sprite, 65535, 90);
		audioManager.swing(2);
	}
	startDash(forward) {
		this.fsm.changeState(forward ? "DASH_FWD" : "DASH_BACK");
		this.dashTimer = this.frameKit.dash.durationFrames / 60;
		this.iFrames = this.frameKit.dash.iFrames / 60;
		audioManager.dash();
		applySquashStretch(this.sprite, PLAYER_DISPLAY_SCALE, PLAYER_DISPLAY_SCALE, 1.35, .8, 120);
	}
	clearAttack() {
		this.currentAttack = null;
		this.attackPhase = null;
		this.attackPhaseTimer = 0;
		useGameStore.setState({ currentMove: "" });
	}
	playHurt() {
		const clip = this.character.animationSet.hurt;
		this.sprite.anims.stop();
		this.sprite.setTexture(clip.textureKey, 0);
		this.sprite.play(clip.key);
	}
	knockOut() {
		this.recovering = true;
		this.clearAttack();
		this.fsm.changeState("KO");
		this.stunTimer = 1.2;
		useGameStore.setState({ flash: "K.O. - RECOVERING" });
		audioManager.defeat();
		this.sprite.scene.time.delayedCall(1200, () => {
			if (!this.sprite.active) return;
			this.sprite.setPosition(this.spawn.x, this.spawn.y);
			this.sprite.body.setVelocity(0, 0);
			useGameStore.getState().setHealth(this.character.health);
			this.iFrames = 1.5;
			this.stunTimer = 0;
			this.recovering = false;
			this.fsm.changeState("IDLE");
			useGameStore.setState({ flash: "" });
		});
	}
	updateAnimation(onFloor) {
		if (this.recovering || this.fsm.currentState === "KO") return;
		if (this.fsm.currentState === "HITSTUN") return;
		if (this.fsm.isAttacking()) return;
		const set = this.character.animationSet;
		if (this.fsm.isBlocking() || this.fsm.isParrying()) {
			this.sprite.anims.stop();
			this.sprite.setTexture(set.idle.textureKey, 0);
			return;
		}
		if (!onFloor) {
			const frame = this.vy < -80 ? 1 : 3;
			this.sprite.anims.stop();
			if (this.sprite.texture.key !== set.jump.textureKey) this.sprite.setTexture(set.jump.textureKey, frame);
			else this.sprite.setFrame(frame);
			return;
		}
		const key = this.fsm.currentState === "WALK_FWD" || this.fsm.currentState === "WALK_BACK" || Math.abs(this.vx) > 28 ? set.run.key : set.idle.key;
		if (this.sprite.anims.currentAnim?.key !== key || !this.sprite.anims.isPlaying) this.sprite.play(key, true);
	}
	destroy() {
		this.sprite.destroy();
	}
};
var Phaser$2 = phaser_esm_exports;
var PlayScene = class extends Phaser$2.Scene {
	player;
	combat;
	far;
	platforms;
	bgScale = 1;
	fpsTimer = 0;
	isStageCleared = false;
	constructor() {
		super({ key: "play" });
	}
	init() {
		this.fpsTimer = 0;
		this.isStageCleared = false;
	}
	preload() {
		for (const lvl of SOUTH_FLORIDA_LEVELS) if (!this.textures.exists(`bg-${lvl.id}`)) this.load.image(`bg-${lvl.id}`, lvl.parallax.far);
		this.load.image("ground", "/game/backgrounds/fort-lauderdale/ground.jpg");
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
		this.isStageCleared = false;
		const levelId = useGameStore.getState().currentLevelId || "fort-lauderdale";
		const level = getLevel(levelId);
		const debug = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug");
		this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
		this.physics.world.gravity.y = 0;
		if (debug) {
			this.physics.world.createDebugGraphic();
			this.physics.world.drawDebug = true;
		}
		useGameStore.setState({
			debug,
			location: `${level.city} · ${level.name}`,
			aliveEnemies: level.enemies.length
		});
		const bgKey = this.textures.exists(`bg-${level.id}`) ? `bg-${level.id}` : "bg-fort-lauderdale";
		const bgHeight = level.groundY + 60;
		this.far = this.add.tileSprite(0, 0, 720, bgHeight, bgKey).setOrigin(0, 0).setScrollFactor(0).setDepth(0);
		const texHeight = this.textures.get(bgKey).getSourceImage()?.height || 1080;
		this.bgScale = bgHeight / texHeight;
		this.far.tileScaleY = this.bgScale;
		this.far.tileScaleX = this.bgScale;
		const groundH = WORLD_HEIGHT - level.groundY + 120;
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
		this.combat.setOnVictory(() => {
			this.handleStageClear();
		});
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
	handleStageClear() {
		if (this.isStageCleared) return;
		this.isStageCleared = true;
		const store = useGameStore.getState();
		store.setFlash("STAGE COMPLETE!");
		audioManager.roundAnnounce();
		floatText(this, this.cameras.main.scrollX + 360, 420, "STAGE CLEAR!", "#e8c45a", "54px");
		this.time.delayedCall(1200, () => {
			store.markLevelComplete(store.currentLevelId);
			store.setScreen("victory");
		});
	}
	update(_time, delta) {
		const dt = Math.min(delta / 1e3, .1);
		const actions = inputManager.poll();
		if (actions.pausePressed && useGameStore.getState().playing) {
			inputManager.enabled = false;
			useGameStore.getState().setScreen("city-select");
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
		this.far.tilePositionX = scrollX * .18 / Math.max(.1, this.bgScale);
		this.fpsTimer += dt;
		if (this.fpsTimer > .25) {
			this.fpsTimer = 0;
			const alive = this.combat.aliveCount();
			useGameStore.getState().setFps(Math.round(this.game.loop.actualFps));
			useGameStore.getState().setAliveEnemies(alive);
			if (!this.isStageCleared && alive === 0 && this.combat.enemies.length > 0) this.handleStageClear();
		}
	}
};
var Phaser$1 = phaser_esm_exports;
function createGame(parent) {
	const game = new Phaser$1.Game({
		type: Phaser$1.AUTO,
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
			mode: Phaser$1.Scale.FIT,
			autoCenter: Phaser$1.Scale.CENTER_BOTH,
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
