import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
import { a as Sword, c as RotateCcw, d as Lock, f as Flame, h as ArrowUp, l as Play, m as ChevronLeft, n as VolumeX, o as Sparkles, p as ChevronRight, r as Volume2, s as Shield, t as Zap, u as MapPin } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BHug610o.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
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
var current = null;
var restartTimer = null;
function registerGame(game) {
	current = game;
}
function unregisterGame(game) {
	if (current === game) current = null;
}
function restartPlayScene() {
	if (typeof window === "undefined") return;
	if (restartTimer !== null) window.clearTimeout(restartTimer);
	restartTimer = window.setTimeout(() => {
		restartTimer = null;
		const scene = current?.scene.getScene("play");
		if (scene) scene.scene.restart();
	}, 50);
}
var SHEET = {
	frameWidth: 256,
	frameHeight: 144,
	frames: 4
};
function clip(id, action, frameRate, repeat) {
	return {
		key: `${id}-${action}`,
		textureKey: `${id}-${action}`,
		url: `/game/sprites/characters/${id}/${action}.png`,
		...SHEET,
		frameRate,
		repeat
	};
}
function makeSet(id) {
	return {
		idle: clip(id, "idle", 8, -1),
		run: clip(id, "run", 10, -1),
		jump: clip(id, "jump", 8, 0),
		hurt: clip(id, "hurt", 10, 0),
		light: clip(id, "light", 14, 0),
		heavy: clip(id, "heavy", 12, 0),
		kick: clip(id, "kick", 12, 0),
		special1: clip(id, "special1", 12, 0),
		special2: clip(id, "special2", 12, 0),
		special3: clip(id, "special3", 12, 0),
		finisher: clip(id, "finisher", 12, 0)
	};
}
function move(partial) {
	return {
		kiCost: 0,
		...partial
	};
}
var JAV = {
	id: "jav",
	name: "JAV",
	title: "South Florida Champion",
	tagline: "Move smart. Hit clean. Rule the coast.",
	portrait: "/game/sprites/characters/jav/portrait.png",
	accent: "royal",
	health: 120,
	ki: 100,
	movementSpeed: 300,
	attackPower: 15,
	attacks: [
		move({
			id: "jav-light",
			name: "Street Jab",
			anim: "light",
			damage: 10,
			durationMs: 240,
			effect: "melee",
			description: "Quick straight punch that initiates combo strings."
		}),
		move({
			id: "jav-heavy",
			name: "Royal Haymaker",
			anim: "heavy",
			damage: 22,
			durationMs: 380,
			effect: "melee",
			description: "Committed heavy punch with high knockback."
		}),
		move({
			id: "jav-kick",
			name: "Crescent Sweep",
			anim: "kick",
			damage: 18,
			durationMs: 340,
			effect: "melee",
			description: "Low sweeping roundhouse that knocks down opponents."
		})
	],
	specials: [
		move({
			id: "jav-chain",
			name: "Neon Chain Lash",
			anim: "special1",
			damage: 28,
			kiCost: 25,
			durationMs: 460,
			effect: "melee",
			description: "Unleash a purple energy chain whip that launches enemies."
		}),
		move({
			id: "jav-wave",
			name: "Crown Plasma Wave",
			anim: "special2",
			damage: 32,
			kiCost: 30,
			durationMs: 480,
			effect: "projectile",
			description: "Fire a royal-purple ki plasma wave down the boardwalk."
		}),
		move({
			id: "jav-step",
			name: "Shadow Blitz",
			anim: "special3",
			damage: 24,
			kiCost: 20,
			durationMs: 320,
			effect: "dash",
			description: "Invulnerable phantom dash through enemy lines."
		})
	],
	finisher: move({
		id: "jav-hood",
		name: "Seismic Crown Slam",
		anim: "finisher",
		damage: 65,
		kiCost: 100,
		durationMs: 720,
		effect: "finisher",
		description: "Leap skyward and detonate a massive royal ground-rupture."
	}),
	animationSet: makeSet("jav")
};
function getCharacter(id) {
	return JAV;
}
function allClips(character) {
	return Object.values(character.animationSet);
}
function allRosterClips() {
	return [JAV].flatMap(allClips);
}
/**
* Modern 2D Fighter WebAudio DSP Sound Engine
* Rich procedural synthesizer for punchy 808 impacts, sword/chain whooshes,
* metal parry clangs, combo chimes, and match events.
*/
var AudioManagerImpl = class {
	ctx = null;
	masterGain = null;
	musicGain = null;
	sfxGain = null;
	muted = false;
	volume = .8;
	unlock() {
		if (typeof window === "undefined") return;
		if (!this.ctx) {
			const Ctx = window.AudioContext || window.webkitAudioContext;
			if (!Ctx) return;
			this.ctx = new Ctx();
			this.masterGain = this.ctx.createGain();
			this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
			this.masterGain.connect(this.ctx.destination);
			this.sfxGain = this.ctx.createGain();
			this.sfxGain.gain.setValueAtTime(1, this.ctx.currentTime);
			this.sfxGain.connect(this.masterGain);
			this.musicGain = this.ctx.createGain();
			this.musicGain.gain.setValueAtTime(.5, this.ctx.currentTime);
			this.musicGain.connect(this.masterGain);
		}
		if (this.ctx.state === "suspended") this.ctx.resume();
	}
	setVolume(vol) {
		this.volume = Math.max(0, Math.min(1, vol));
		if (this.masterGain && this.ctx) this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
	}
	toggleMute() {
		this.muted = !this.muted;
		this.setVolume(this.volume);
		return this.muted;
	}
	playNoise(duration, bandFreq, gainVal) {
		if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		const bufferSize = this.ctx.sampleRate * duration;
		const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
		const output = buffer.getChannelData(0);
		for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
		const whiteNoise = this.ctx.createBufferSource();
		whiteNoise.buffer = buffer;
		const filter = this.ctx.createBiquadFilter();
		filter.type = "bandpass";
		filter.frequency.setValueAtTime(bandFreq, t);
		filter.Q.setValueAtTime(3, t);
		const gain = this.ctx.createGain();
		gain.gain.setValueAtTime(gainVal, t);
		gain.gain.exponentialRampToValueAtTime(1e-4, t + duration);
		whiteNoise.connect(filter);
		filter.connect(gain);
		gain.connect(this.sfxGain);
		whiteNoise.start(t);
	}
	jump() {
		if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = "sine";
		osc.frequency.setValueAtTime(160, t);
		osc.frequency.exponentialRampToValueAtTime(380, t + .12);
		gain.gain.setValueAtTime(.06, t);
		gain.gain.exponentialRampToValueAtTime(1e-4, t + .12);
		osc.connect(gain);
		gain.connect(this.sfxGain);
		osc.start(t);
		osc.stop(t + .12);
	}
	land() {
		if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = "triangle";
		osc.frequency.setValueAtTime(120, t);
		osc.frequency.exponentialRampToValueAtTime(45, t + .08);
		gain.gain.setValueAtTime(.08, t);
		gain.gain.exponentialRampToValueAtTime(1e-4, t + .08);
		osc.connect(gain);
		gain.connect(this.sfxGain);
		osc.start(t);
		osc.stop(t + .08);
	}
	dash() {
		if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		this.playNoise(.14, 800, .08);
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = "sawtooth";
		osc.frequency.setValueAtTime(400, t);
		osc.frequency.exponentialRampToValueAtTime(150, t + .14);
		gain.gain.setValueAtTime(.04, t);
		gain.gain.exponentialRampToValueAtTime(1e-4, t + .14);
		osc.connect(gain);
		gain.connect(this.sfxGain);
		osc.start(t);
		osc.stop(t + .14);
	}
	swing(speed = 1) {
		if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		const dur = .08 / speed;
		this.playNoise(dur, 1200 * speed, .05);
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = "triangle";
		osc.frequency.setValueAtTime(320 * speed, t);
		osc.frequency.exponentialRampToValueAtTime(110, t + dur);
		gain.gain.setValueAtTime(.05, t);
		gain.gain.exponentialRampToValueAtTime(1e-4, t + dur);
		osc.connect(gain);
		gain.connect(this.sfxGain);
		osc.start(t);
		osc.stop(t + dur);
	}
	hitLight() {
		if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		this.playNoise(.06, 2400, .08);
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = "square";
		osc.frequency.setValueAtTime(240, t);
		osc.frequency.exponentialRampToValueAtTime(70, t + .08);
		gain.gain.setValueAtTime(.08, t);
		gain.gain.exponentialRampToValueAtTime(1e-4, t + .08);
		osc.connect(gain);
		gain.connect(this.sfxGain);
		osc.start(t);
		osc.stop(t + .08);
	}
	hitHeavy() {
		if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		this.playNoise(.12, 1800, .12);
		const sub = this.ctx.createOscillator();
		const subGain = this.ctx.createGain();
		sub.type = "sine";
		sub.frequency.setValueAtTime(140, t);
		sub.frequency.exponentialRampToValueAtTime(35, t + .22);
		subGain.gain.setValueAtTime(.18, t);
		subGain.gain.exponentialRampToValueAtTime(1e-4, t + .22);
		sub.connect(subGain);
		subGain.connect(this.sfxGain);
		sub.start(t);
		sub.stop(t + .22);
	}
	block() {
		if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = "triangle";
		osc.frequency.setValueAtTime(90, t);
		osc.frequency.exponentialRampToValueAtTime(50, t + .09);
		gain.gain.setValueAtTime(.12, t);
		gain.gain.exponentialRampToValueAtTime(1e-4, t + .09);
		osc.connect(gain);
		gain.connect(this.sfxGain);
		osc.start(t);
		osc.stop(t + .09);
	}
	parry() {
		if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		[
			880,
			1320,
			1760,
			2640
		].forEach((freq, idx) => {
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			osc.type = "sine";
			osc.frequency.setValueAtTime(freq, t);
			const amp = .08 / (idx + 1);
			gain.gain.setValueAtTime(amp, t);
			gain.gain.exponentialRampToValueAtTime(1e-4, t + .35);
			osc.connect(gain);
			gain.connect(this.sfxGain);
			osc.start(t);
			osc.stop(t + .35);
		});
	}
	special() {
		if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		this.playNoise(.2, 3200, .08);
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = "sawtooth";
		osc.frequency.setValueAtTime(280, t);
		osc.frequency.exponentialRampToValueAtTime(680, t + .18);
		gain.gain.setValueAtTime(.08, t);
		gain.gain.exponentialRampToValueAtTime(1e-4, t + .2);
		osc.connect(gain);
		gain.connect(this.sfxGain);
		osc.start(t);
		osc.stop(t + .2);
	}
	finisher() {
		if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		this.playNoise(.35, 1200, .2);
		const sub = this.ctx.createOscillator();
		const subGain = this.ctx.createGain();
		sub.type = "sawtooth";
		sub.frequency.setValueAtTime(160, t);
		sub.frequency.exponentialRampToValueAtTime(28, t + .45);
		subGain.gain.setValueAtTime(.22, t);
		subGain.gain.exponentialRampToValueAtTime(1e-4, t + .45);
		sub.connect(subGain);
		subGain.connect(this.sfxGain);
		sub.start(t);
		sub.stop(t + .45);
	}
	comboChime(comboCount) {
		if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		const baseFreq = 440 * Math.pow(1.06, Math.min(18, comboCount));
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = "sine";
		osc.frequency.setValueAtTime(baseFreq, t);
		gain.gain.setValueAtTime(.06, t);
		gain.gain.exponentialRampToValueAtTime(1e-4, t + .15);
		osc.connect(gain);
		gain.connect(this.sfxGain);
		osc.start(t);
		osc.stop(t + .15);
	}
	roundAnnounce() {
		if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		[
			320,
			480,
			640
		].forEach((freq, i) => {
			const startT = t + i * .12;
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			osc.type = "sawtooth";
			osc.frequency.setValueAtTime(freq, startT);
			gain.gain.setValueAtTime(.08, startT);
			gain.gain.exponentialRampToValueAtTime(1e-4, startT + .15);
			osc.connect(gain);
			gain.connect(this.sfxGain);
			osc.start(startT);
			osc.stop(startT + .15);
		});
	}
	koAnnounce() {
		if (this.muted || !this.ctx || !this.sfxGain || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		[
			640,
			480,
			240,
			110
		].forEach((freq, i) => {
			const startT = t + i * .14;
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			osc.type = "square";
			osc.frequency.setValueAtTime(freq, startT);
			gain.gain.setValueAtTime(.1, startT);
			gain.gain.exponentialRampToValueAtTime(1e-4, startT + .2);
			osc.connect(gain);
			gain.connect(this.sfxGain);
			osc.start(startT);
			osc.stop(startT + .2);
		});
	}
	hurt() {
		this.hitLight();
	}
	attack() {
		this.swing();
	}
	whoosh() {
		this.dash();
	}
	defeat() {
		this.koAnnounce();
	}
};
var audioManager = new AudioManagerImpl();
function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
function approach(current, target, maxDelta) {
	if (current < target) return Math.min(current + maxDelta, target);
	if (current > target) return Math.max(current - maxDelta, target);
	return target;
}
var FORT_LAUDERDALE = {
	id: "fort-lauderdale",
	name: "A1A Ocean Boardwalk",
	city: "Fort Lauderdale",
	tagline: "Las Olas luxury marina and sunlit oceanfront boardwalk.",
	worldWidth: WORLD_WIDTH,
	worldHeight: WORLD_HEIGHT,
	groundY: 980,
	spawn: {
		x: 220,
		y: 980
	},
	platforms: [
		{
			x: 1480,
			y: 870,
			width: 220,
			height: 22
		},
		{
			x: 2180,
			y: 780,
			width: 180,
			height: 22
		},
		{
			x: 2960,
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
			x: 1680,
			y: 988,
			scale: 1.4,
			depth: 8
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
			x: 3280,
			y: 986,
			scale: 1.15,
			depth: 7
		},
		{
			key: "palm",
			x: 4160,
			y: 988,
			scale: 1.25,
			flipX: true,
			depth: 6
		}
	],
	enemies: [
		{
			id: "bruiser",
			x: 680
		},
		{
			id: "blade",
			x: 1100
		},
		{
			id: "bruiser",
			x: 1750
		},
		{
			id: "blade",
			x: 2300
		},
		{
			id: "bruiser",
			x: 2950
		},
		{
			id: "blade",
			x: 3600
		},
		{
			id: "bruiser",
			x: 4200
		}
	],
	parallax: {
		sky: "/game/backgrounds/fort-lauderdale/far.jpg",
		far: "/game/backgrounds/fort-lauderdale/far.jpg",
		mid: "/game/backgrounds/fort-lauderdale/far.jpg",
		ground: "/game/backgrounds/fort-lauderdale/ground.jpg"
	}
};
var SOUTH_FLORIDA_LEVELS = [
	FORT_LAUDERDALE,
	{
		id: "tampa",
		name: "Ybor City Neon Strip",
		city: "Tampa",
		tagline: "Historic red brick cigar factories and warm gas-lit balconies.",
		worldWidth: WORLD_WIDTH,
		worldHeight: WORLD_HEIGHT,
		groundY: 980,
		spawn: {
			x: 220,
			y: 980
		},
		platforms: [
			{
				x: 1380,
				y: 860,
				width: 240,
				height: 24
			},
			{
				x: 2050,
				y: 770,
				width: 200,
				height: 24
			},
			{
				x: 2800,
				y: 850,
				width: 260,
				height: 24
			}
		],
		props: [
			{
				key: "palm",
				x: 420,
				y: 988,
				scale: 1.2,
				depth: 7
			},
			{
				key: "tower",
				x: 1200,
				y: 986,
				scale: 1.3,
				depth: 8
			},
			{
				key: "palm",
				x: 1890,
				y: 988,
				scale: 1.15,
				flipX: true,
				depth: 6
			},
			{
				key: "tower",
				x: 2600,
				y: 986,
				scale: 1.25,
				depth: 7
			},
			{
				key: "palm",
				x: 3450,
				y: 988,
				scale: 1.35,
				depth: 8
			}
		],
		enemies: [
			{
				id: "blade",
				x: 720
			},
			{
				id: "bruiser",
				x: 1250
			},
			{
				id: "blade",
				x: 1800
			},
			{
				id: "blade",
				x: 2450
			},
			{
				id: "bruiser",
				x: 3100
			},
			{
				id: "blade",
				x: 3800
			}
		],
		parallax: {
			sky: "/game/backgrounds/tampa/far.jpg",
			far: "/game/backgrounds/tampa/far.jpg",
			mid: "/game/backgrounds/tampa/far.jpg",
			ground: "/game/backgrounds/fort-lauderdale/ground.jpg"
		}
	},
	{
		id: "palm-beach",
		name: "Worth Avenue Promenade",
		city: "Palm Beach",
		tagline: "Mediterranean stone archways, high-society estates, and golden sunset.",
		worldWidth: WORLD_WIDTH,
		worldHeight: WORLD_HEIGHT,
		groundY: 980,
		spawn: {
			x: 220,
			y: 980
		},
		platforms: [
			{
				x: 1500,
				y: 870,
				width: 230,
				height: 22
			},
			{
				x: 2250,
				y: 790,
				width: 200,
				height: 22
			},
			{
				x: 3100,
				y: 860,
				width: 250,
				height: 22
			}
		],
		props: [
			{
				key: "palm",
				x: 380,
				y: 988,
				scale: 1.45,
				depth: 8
			},
			{
				key: "palm",
				x: 890,
				y: 988,
				scale: 1.3,
				flipX: true,
				depth: 6
			},
			{
				key: "tower",
				x: 1650,
				y: 986,
				scale: 1.2,
				depth: 7
			},
			{
				key: "palm",
				x: 2500,
				y: 988,
				scale: 1.4,
				depth: 8
			},
			{
				key: "palm",
				x: 3380,
				y: 988,
				scale: 1.35,
				flipX: true,
				depth: 6
			}
		],
		enemies: [
			{
				id: "bruiser",
				x: 650
			},
			{
				id: "blade",
				x: 1150
			},
			{
				id: "bruiser",
				x: 1700
			},
			{
				id: "bruiser",
				x: 2350
			},
			{
				id: "blade",
				x: 3e3
			},
			{
				id: "bruiser",
				x: 3750
			}
		],
		parallax: {
			sky: "/game/backgrounds/palm-beach/far.jpg",
			far: "/game/backgrounds/palm-beach/far.jpg",
			mid: "/game/backgrounds/palm-beach/far.jpg",
			ground: "/game/backgrounds/fort-lauderdale/ground.jpg"
		}
	},
	{
		id: "miami",
		name: "Wynwood Graffiti District",
		city: "Miami",
		tagline: "Vibrant warehouse murals, neon club alleyways, and downtown skyline.",
		worldWidth: WORLD_WIDTH,
		worldHeight: WORLD_HEIGHT,
		groundY: 980,
		spawn: {
			x: 220,
			y: 980
		},
		platforms: [
			{
				x: 1400,
				y: 860,
				width: 240,
				height: 24
			},
			{
				x: 2150,
				y: 770,
				width: 190,
				height: 24
			},
			{
				x: 2950,
				y: 850,
				width: 250,
				height: 24
			}
		],
		props: [
			{
				key: "palm",
				x: 500,
				y: 988,
				scale: 1.25,
				depth: 7
			},
			{
				key: "tower",
				x: 1300,
				y: 986,
				scale: 1.35,
				depth: 8
			},
			{
				key: "palm",
				x: 2100,
				y: 988,
				scale: 1.15,
				flipX: true,
				depth: 6
			},
			{
				key: "tower",
				x: 2850,
				y: 986,
				scale: 1.3,
				depth: 7
			},
			{
				key: "palm",
				x: 3700,
				y: 988,
				scale: 1.4,
				depth: 8
			}
		],
		enemies: [
			{
				id: "blade",
				x: 600
			},
			{
				id: "bruiser",
				x: 1050
			},
			{
				id: "blade",
				x: 1550
			},
			{
				id: "bruiser",
				x: 2100
			},
			{
				id: "blade",
				x: 2750
			},
			{
				id: "bruiser",
				x: 3400
			},
			{
				id: "blade",
				x: 4050
			}
		],
		parallax: {
			sky: "/game/backgrounds/miami/far.jpg",
			far: "/game/backgrounds/miami/far.jpg",
			mid: "/game/backgrounds/miami/far.jpg",
			ground: "/game/backgrounds/fort-lauderdale/ground.jpg"
		}
	},
	{
		id: "miami-beach",
		name: "Ocean Drive Art Deco Strip",
		city: "Miami Beach",
		tagline: "Pastel neon hotels, midnight ocean breeze, and the Syndicate Boss finale.",
		worldWidth: WORLD_WIDTH,
		worldHeight: WORLD_HEIGHT,
		groundY: 980,
		spawn: {
			x: 220,
			y: 980
		},
		platforms: [
			{
				x: 1450,
				y: 870,
				width: 220,
				height: 22
			},
			{
				x: 2100,
				y: 780,
				width: 180,
				height: 22
			},
			{
				x: 2850,
				y: 870,
				width: 220,
				height: 22
			}
		],
		props: [
			{
				key: "palm",
				x: 350,
				y: 988,
				scale: 1.4,
				depth: 8
			},
			{
				key: "tower",
				x: 950,
				y: 986,
				scale: 1.25,
				depth: 7
			},
			{
				key: "palm",
				x: 1650,
				y: 988,
				scale: 1.3,
				flipX: true,
				depth: 6
			},
			{
				key: "tower",
				x: 2450,
				y: 986,
				scale: 1.2,
				depth: 7
			},
			{
				key: "palm",
				x: 3200,
				y: 988,
				scale: 1.45,
				depth: 8
			}
		],
		enemies: [
			{
				id: "bruiser",
				x: 620
			},
			{
				id: "blade",
				x: 1100
			},
			{
				id: "bruiser",
				x: 1680
			},
			{
				id: "blade",
				x: 2250
			},
			{
				id: "bruiser",
				x: 2900
			},
			{
				id: "boss",
				x: 3800
			}
		],
		boss: {
			id: "boss",
			name: "Syndicate Kingpin",
			spawnX: 3800
		},
		parallax: {
			sky: "/game/backgrounds/miami-beach/far.jpg",
			far: "/game/backgrounds/miami-beach/far.jpg",
			mid: "/game/backgrounds/miami-beach/far.jpg",
			ground: "/game/backgrounds/fort-lauderdale/ground.jpg"
		}
	}
];
function getLevel(id) {
	return SOUTH_FLORIDA_LEVELS.find((l) => l.id === id) ?? FORT_LAUDERDALE;
}
function readUnlockedLevels() {
	if (typeof window === "undefined") return ["fort-lauderdale"];
	try {
		const saved = window.localStorage.getItem("sfs.unlockedLevels");
		if (saved) return JSON.parse(saved);
	} catch {}
	return ["fort-lauderdale"];
}
function saveUnlockedLevels(levels) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem("sfs.unlockedLevels", JSON.stringify(levels));
	} catch {}
}
var initialChar = JAV;
var initialLevel = getLevel("fort-lauderdale");
var useGameStore = create((set, get) => ({
	screen: "title",
	playing: false,
	characterId: initialChar.id,
	characterName: initialChar.name,
	portrait: initialChar.portrait,
	health: initialChar.health,
	maxHealth: initialChar.health,
	energy: 50,
	maxEnergy: initialChar.ki,
	xp: 0,
	coins: 0,
	kos: 0,
	comboHits: 0,
	maxCombo: 0,
	aliveEnemies: 0,
	currentLevelId: initialLevel.id,
	unlockedLevels: readUnlockedLevels(),
	location: `${initialLevel.city} · ${initialLevel.name}`,
	fps: 0,
	debug: false,
	currentMove: "",
	specialIndex: 0,
	flash: "",
	setPlaying: (playing) => set({ playing }),
	setScreen: (screen) => set({
		screen,
		playing: screen === "play"
	}),
	setCurrentLevel: (levelId) => {
		const lvl = getLevel(levelId);
		set({
			currentLevelId: lvl.id,
			location: `${lvl.city} · ${lvl.name}`,
			health: initialChar.health,
			energy: 50,
			comboHits: 0,
			maxCombo: 0,
			kos: 0,
			currentMove: "",
			flash: ""
		});
	},
	markLevelComplete: (levelId) => {
		const current = get().unlockedLevels;
		const all = SOUTH_FLORIDA_LEVELS.map((l) => l.id);
		const nextLevelId = all[all.indexOf(levelId) + 1];
		if (nextLevelId && !current.includes(nextLevelId)) {
			const updated = [...current, nextLevelId];
			saveUnlockedLevels(updated);
			set({ unlockedLevels: updated });
		}
	},
	setFps: (fps) => set({ fps }),
	setHealth: (health) => set({ health }),
	setAliveEnemies: (aliveEnemies) => set({ aliveEnemies }),
	setFlash: (flash) => set({ flash }),
	rechargeKi: (amount) => {
		const { energy, maxEnergy, currentMove } = get();
		if (currentMove) return;
		set({ energy: Math.min(maxEnergy, energy + amount) });
	},
	spendKi: (amount) => {
		const { energy } = get();
		set({ energy: Math.max(0, energy - amount) });
	},
	gainKi: (amount) => {
		const { energy, maxEnergy } = get();
		set({ energy: Math.min(maxEnergy, energy + amount) });
	},
	gainXp: (amount) => {
		const { xp } = get();
		set({ xp: Math.min(100, xp + amount) });
	},
	addKo: () => set({ kos: get().kos + 1 }),
	addComboHit: () => {
		const newHits = get().comboHits + 1;
		set({
			comboHits: newHits,
			maxCombo: Math.max(get().maxCombo, newHits)
		});
	},
	resetCombo: () => set({ comboHits: 0 }),
	resetRunStats: () => set({
		health: initialChar.health,
		energy: 50,
		kos: 0,
		comboHits: 0,
		maxCombo: 0,
		currentMove: "",
		flash: ""
	})
}));
var GAME_CODES = /* @__PURE__ */ new Set([
	"ArrowLeft",
	"ArrowRight",
	"ArrowUp",
	"ArrowDown",
	"KeyA",
	"KeyD",
	"KeyW",
	"KeyS",
	"Space",
	"KeyJ",
	"KeyK",
	"KeyL",
	"KeyU",
	"KeyI",
	"KeyO",
	"KeyP",
	"KeyZ",
	"KeyX",
	"KeyC",
	"KeyE",
	"KeyF",
	"KeyG",
	"ShiftLeft",
	"ShiftRight",
	"Digit1",
	"Digit2",
	"Digit3",
	"Digit4",
	"Escape",
	"Enter"
]);
var EMPTY = {
	moveX: 0,
	moveY: 0,
	jump: false,
	jumpPressed: false,
	attack: false,
	attackPressed: false,
	special: false,
	specialPressed: false,
	specialSlot: null,
	guard: false,
	parry: false,
	dash: false,
	pausePressed: false,
	raw: {
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
	}
};
var InputManagerImpl = class {
	enabled = false;
	keys = /* @__PURE__ */ new Set();
	injected = /* @__PURE__ */ new Set();
	touchLeft = false;
	touchRight = false;
	touchUp = false;
	touchDown = false;
	touchMoveX = 0;
	touchJump = false;
	touchAttack = false;
	touchHeavy = false;
	touchKick = false;
	touchSpecial = false;
	touchSpecial2 = false;
	touchSpecial3 = false;
	touchFinisher = false;
	touchGuard = false;
	touchParry = false;
	touchDash = false;
	prevJump = false;
	prevAttack = false;
	prevSpecial = false;
	prevPause = false;
	prevSlot = [
		false,
		false,
		false,
		false
	];
	bound = false;
	last = EMPTY;
	onKeyDown = (event) => {
		if (GAME_CODES.has(event.code)) event.preventDefault();
		if (event.repeat) return;
		this.keys.add(event.code);
	};
	onKeyUp = (event) => {
		if (GAME_CODES.has(event.code)) event.preventDefault();
		this.keys.delete(event.code);
	};
	onBlur = () => {
		this.keys.clear();
		this.injected.clear();
	};
	bind() {
		if (this.bound || typeof window === "undefined") return;
		this.bound = true;
		window.addEventListener("keydown", this.onKeyDown, { passive: false });
		window.addEventListener("keyup", this.onKeyUp, { passive: false });
		window.addEventListener("blur", this.onBlur);
		document.addEventListener("visibilitychange", this.onBlur);
	}
	enablePlay() {
		this.enabled = true;
		this.keys.clear();
		this.injected.clear();
		this.touchLeft = false;
		this.touchRight = false;
		this.touchUp = false;
		this.touchDown = false;
		this.touchJump = false;
		this.touchAttack = false;
		this.touchHeavy = false;
		this.touchKick = false;
		this.touchSpecial = false;
		this.touchSpecial2 = false;
		this.touchSpecial3 = false;
		this.touchFinisher = false;
		this.touchGuard = false;
		this.touchParry = false;
		this.touchDash = false;
		this.prevJump = true;
		this.prevAttack = true;
		this.prevSpecial = true;
		this.prevPause = true;
		this.prevSlot = [
			true,
			true,
			true,
			true
		];
	}
	unbind() {
		if (!this.bound) return;
		this.bound = false;
		window.removeEventListener("keydown", this.onKeyDown);
		window.removeEventListener("keyup", this.onKeyUp);
		window.removeEventListener("blur", this.onBlur);
		document.removeEventListener("visibilitychange", this.onBlur);
		this.keys.clear();
		this.injected.clear();
	}
	setInjectedKeys(codes) {
		this.injected.clear();
		for (const code of codes) this.injected.add(code);
	}
	down(...codes) {
		for (const code of codes) if (this.keys.has(code) || this.injected.has(code)) return true;
		return false;
	}
	poll() {
		if (!this.enabled) {
			this.prevJump = false;
			this.prevAttack = false;
			this.prevSpecial = false;
			this.prevPause = false;
			this.prevSlot = [
				false,
				false,
				false,
				false
			];
			this.last = EMPTY;
			return EMPTY;
		}
		const left = this.down("ArrowLeft", "KeyA") || this.touchLeft;
		const right = this.down("ArrowRight", "KeyD") || this.touchRight;
		const up = this.down("ArrowUp", "KeyW") || this.touchUp || this.touchJump;
		const down = this.down("ArrowDown", "KeyS") || this.touchDown;
		let moveX = 0;
		if (left) moveX -= 1;
		if (right) moveX += 1;
		if (moveX === 0 && Math.abs(this.touchMoveX) > .2) moveX = this.touchMoveX;
		moveX = clamp(moveX, -1, 1);
		const jump = this.down("Space", "ArrowUp", "KeyW") || this.touchJump;
		const light = this.down("KeyJ", "KeyZ") || this.touchAttack;
		const heavy = this.down("KeyK", "KeyX") || this.touchHeavy;
		const kick = this.down("KeyL", "KeyC") || this.touchKick;
		const special1 = this.down("Digit1", "KeyU") || this.touchSpecial;
		const special2 = this.down("Digit2", "KeyI") || this.touchSpecial2;
		const special3 = this.down("Digit3", "KeyO") || this.touchSpecial3;
		const finisher = this.down("Digit4", "KeyP") || this.touchFinisher;
		const guard = this.down("KeyS", "ShiftLeft", "ShiftRight", "KeyG") || this.touchGuard;
		const parry = this.down("KeyF") || this.touchParry;
		const dash = this.down("KeyE") || this.touchDash;
		const pause = this.down("Escape");
		const specialSlotHeld = [
			this.down("Digit1", "KeyU") || this.touchSpecial,
			this.down("Digit2", "KeyI") || this.touchSpecial2,
			this.down("Digit3", "KeyO") || this.touchSpecial3,
			this.down("Digit4", "KeyP") || this.touchFinisher
		];
		let specialSlot = null;
		for (let i = 0; i < 4; i += 1) if (specialSlotHeld[i] && !this.prevSlot[i]) specialSlot = i;
		const raw = {
			left,
			right,
			up,
			down,
			light,
			heavy,
			kick,
			special1,
			special2,
			special3,
			finisher,
			guard,
			parry,
			dash
		};
		const anyAttack = light || heavy || kick;
		const anySpecial = special1 || special2 || special3 || finisher;
		const actions = {
			moveX,
			moveY: down ? 1 : up ? -1 : 0,
			jump,
			jumpPressed: jump && !this.prevJump,
			attack: anyAttack,
			attackPressed: anyAttack && !this.prevAttack,
			special: anySpecial,
			specialPressed: anySpecial && !this.prevSpecial,
			specialSlot,
			guard,
			parry,
			dash,
			pausePressed: pause && !this.prevPause,
			raw
		};
		this.prevJump = jump;
		this.prevAttack = anyAttack;
		this.prevSpecial = anySpecial;
		this.prevPause = pause;
		this.prevSlot = specialSlotHeld;
		this.last = actions;
		return actions;
	}
	snapshot() {
		return this.last;
	}
};
var inputManager = new InputManagerImpl();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function CitySelectMap() {
	const currentLevelId = useGameStore((s) => s.currentLevelId);
	const unlockedLevels = useGameStore((s) => s.unlockedLevels);
	const selectedLevel = getLevel(currentLevelId);
	const handleSelectCity = (levelId) => {
		if (!unlockedLevels.includes(levelId)) {
			audioManager.hitLight();
			return;
		}
		audioManager.swing(1.2);
		useGameStore.getState().setCurrentLevel(levelId);
	};
	const handleDeploy = () => {
		audioManager.unlock();
		audioManager.roundAnnounce();
		useGameStore.getState().resetRunStats();
		useGameStore.getState().setScreen("play");
		window.setTimeout(() => restartPlayScene(), 80);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-stretch justify-center bg-ink/90 px-3 py-4 select-none backdrop-blur-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full w-full max-w-md flex-col justify-between gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-coral animate-ping" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-sans text-[0.62rem] font-bold uppercase tracking-[0.26em] text-sand",
							children: "South Florida Circuit"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-4xl leading-none text-foam",
						children: "Choose Your Arena"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => useGameStore.getState().setScreen("title"),
						className: "rounded-full border border-foam/20 bg-ink/80 px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider text-foam/80 hover:bg-ink active:scale-95",
						children: "Title"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 overflow-y-auto space-y-2 pr-1",
					children: SOUTH_FLORIDA_LEVELS.map((lvl, index) => {
						const isUnlocked = unlockedLevels.includes(lvl.id);
						const isSelected = lvl.id === selectedLevel.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: !isUnlocked,
							onClick: () => handleSelectCity(lvl.id),
							className: cn("relative flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-all duration-200", isSelected && isUnlocked ? "border-gold bg-ink/95 shadow-[0_0_20px_rgba(232,196,90,0.3)] ring-2 ring-gold" : isUnlocked ? "border-foam/15 bg-ink/75 hover:border-foam/40 hover:bg-ink/85" : "border-foam/10 bg-ink/40 opacity-55 cursor-not-allowed"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative size-16 shrink-0 overflow-hidden rounded-xl border border-foam/20 bg-ocean",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: lvl.parallax.far,
									alt: "",
									className: "size-full object-cover",
									draggable: false
								}), !isUnlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute inset-0 bg-ink/80 flex items-center justify-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-6 text-foam/60" })
								}) : isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute top-1 right-1 rounded-full bg-gold p-0.5 shadow",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3 text-ink" })
								}) : null]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono text-[0.6rem] font-black text-coral",
											children: ["STAGE ", index + 1]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-sans text-[0.62rem] font-bold text-sand/80 uppercase",
											children: ["· ", lvl.city]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-2xl leading-none text-foam truncate",
										children: lvl.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 font-sans text-[0.65rem] text-muted line-clamp-1",
										children: lvl.tagline
									})
								]
							})]
						}, lvl.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-foam/20 bg-ink-2/85 p-3 shadow-inner",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-sans text-[0.7rem] font-black uppercase tracking-wider text-sand",
								children: [selectedLevel.city, " · Fight Briefing"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[0.62rem] text-foam/60",
								children: selectedLevel.boss ? "★ BOSS STAGE" : "STANDARD ARENA"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-sans text-xs text-foam/85 leading-relaxed",
							children: selectedLevel.tagline
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-center gap-3 border-t border-foam/10 pt-1.5 font-mono text-[0.62rem] text-foam/70",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Enemies: ",
									selectedLevel.enemies.length,
									" Fighters"
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-gold",
									children: "Reward: +100 XP"
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: handleDeploy,
					className: "flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-coral via-sand to-gold px-8 font-sans text-base font-black uppercase tracking-[0.18em] text-ink shadow-[0_0_25px_rgba(232,93,76,0.6)] transition-all hover:scale-[1.01] active:scale-[0.98]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-5 fill-ink" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Fight in ", selectedLevel.city] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4.5 text-ink" })
					]
				})
			]
		})
	});
}
function getComboRank(hits) {
	if (hits >= 15) return {
		label: "LEGENDARY!",
		color: "text-amber-300 bg-amber-500/20 border-amber-400"
	};
	if (hits >= 10) return {
		label: "SAVAGE!",
		color: "text-rose-400 bg-rose-500/20 border-rose-400"
	};
	if (hits >= 7) return {
		label: "SUPER!",
		color: "text-purple-300 bg-purple-500/20 border-purple-400"
	};
	if (hits >= 4) return {
		label: "GREAT!",
		color: "text-cyan-300 bg-cyan-500/20 border-cyan-400"
	};
	return {
		label: "GOOD",
		color: "text-emerald-300 bg-emerald-500/20 border-emerald-400"
	};
}
function Hud() {
	useGameStore((s) => s.characterId);
	const characterName = useGameStore((s) => s.characterName);
	const portrait = useGameStore((s) => s.portrait);
	const health = useGameStore((s) => s.health);
	const maxHealth = useGameStore((s) => s.maxHealth);
	const energy = useGameStore((s) => s.energy);
	const maxEnergy = useGameStore((s) => s.maxEnergy);
	useGameStore((s) => s.xp);
	const kos = useGameStore((s) => s.kos);
	const comboHits = useGameStore((s) => s.comboHits);
	const aliveEnemies = useGameStore((s) => s.aliveEnemies);
	const location = useGameStore((s) => s.location);
	const fps = useGameStore((s) => s.fps);
	const debug = useGameStore((s) => s.debug);
	const currentMove = useGameStore((s) => s.currentMove);
	const flash = useGameStore((s) => s.flash);
	const [ghostHp, setGhostHp] = (0, import_react.useState)(health);
	const [muted, setMuted] = (0, import_react.useState)(audioManager.muted);
	(0, import_react.useEffect)(() => {
		if (health < ghostHp) {
			const timer = setTimeout(() => {
				setGhostHp((prev) => Math.max(health, prev - (prev - health) * .25));
			}, 250);
			return () => clearTimeout(timer);
		} else setGhostHp(health);
	}, [health, ghostHp]);
	const hpPct = Math.max(0, Math.min(100, health / Math.max(1, maxHealth) * 100));
	const ghostHpPct = Math.max(0, Math.min(100, ghostHp / Math.max(1, maxHealth) * 100));
	const kiPct = Math.max(0, Math.min(100, energy / Math.max(1, maxEnergy) * 100));
	const finisherReady = energy >= 100;
	const toggleAudio = () => {
		const isMuted = audioManager.toggleMute();
		setMuted(isMuted);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-testid": "hud",
		className: "pointer-events-none absolute inset-x-0 top-0 z-20 p-[max(0.45rem,env(safe-area-inset-top))] px-[max(0.7rem,env(safe-area-inset-left))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 items-center gap-2.5 rounded-[1.2rem] border border-foam/20 bg-ink/85 p-2 shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative size-13 shrink-0 overflow-hidden rounded-[0.85rem] border-2 border-gold/60 bg-ocean shadow-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: portrait,
						alt: "",
						className: "size-full object-cover object-top",
						draggable: false
					}), finisherReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 bg-gold/30 animate-pulse flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5 text-amber-200" })
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1 space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-2xl leading-none tracking-wide text-foam drop-shadow",
								children: characterName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-[0.65rem] font-bold text-sand/80",
								children: [
									"HP ",
									Math.round(health),
									"/",
									maxHealth
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative h-2.5 w-full overflow-hidden rounded-full bg-ink-2 ring-1 ring-foam/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-y-0 left-0 rounded-full bg-rose-800 transition-all duration-300 ease-out",
								style: { width: `${ghostHpPct}%` }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-coral to-rose-500 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(232,93,76,0.9)]",
								style: { width: `${hpPct}%` }
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-[0.58rem] font-extrabold uppercase tracking-wider",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: finisherReady ? "text-gold animate-pulse" : "text-foam/70",
									children: finisherReady ? "★ SEISMIC CROWN SLAM READY" : "KI GAUGE"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-foam/60",
									children: [Math.round(energy), "%"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-ink-2 p-0.5 ring-1 ring-foam/20",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `h-full rounded-full transition-all duration-100 ${finisherReady ? "bg-gradient-to-r from-amber-400 via-gold to-yellow-300 shadow-[0_0_12px_rgba(232,196,90,1)] animate-pulse" : "bg-gradient-to-r from-ocean-2 to-cyan-400 shadow-[0_0_8px_rgba(20,145,155,0.8)]"}`,
									style: { width: `${kiPct}%` }
								})
							})]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-col items-end gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: toggleAudio,
							className: "pointer-events-auto flex size-7 items-center justify-center rounded-full border border-foam/20 bg-ink/80 text-foam/80 hover:bg-ink hover:text-foam active:scale-95",
							"aria-label": muted ? "Unmute sound" : "Mute sound",
							children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-3.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"data-testid": "circuit-map-button",
							className: "pointer-events-auto flex items-center gap-1 rounded-full border border-foam/20 bg-ink/80 px-2.5 py-1 font-sans text-[0.62rem] font-black uppercase tracking-wider text-foam/90 hover:bg-ink active:scale-95",
							onClick: () => {
								inputManager.enabled = false;
								useGameStore.getState().setScreen("city-select");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3 text-sand" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Map" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-full border border-foam/15 bg-ink/80 px-2.5 py-0.5 font-sans text-[0.58rem] font-bold uppercase tracking-[0.14em] text-sand",
						children: location
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rounded-full border border-foam/15 bg-ink/80 px-2.5 py-0.5 font-sans text-[0.58rem] font-bold uppercase tracking-wider text-foam",
						children: [
							"KO ",
							kos,
							" · ",
							aliveEnemies,
							" LEFT"
						]
					}),
					currentMove ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-full bg-royal/90 border border-purple-400/40 px-3 py-1 font-display text-sm tracking-wide text-foam shadow-[0_0_10px_rgba(107,46,160,0.6)]",
						children: currentMove
					}) : null,
					comboHits >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col items-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `flex items-center gap-1.5 rounded-full border px-3 py-0.5 font-display text-base tracking-wider drop-shadow shadow-md ${getComboRank(comboHits).color}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [comboHits, " HITS"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-sans font-black",
								children: getComboRank(comboHits).label
							})]
						})
					}) : null,
					flash ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-full bg-coral px-3 py-1 font-sans text-[0.65rem] font-black uppercase tracking-wider text-ink shadow-[0_0_15px_rgba(232,93,76,0.8)] animate-bounce",
						children: flash
					}) : null,
					debug ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-[0.65rem] tabular-nums text-sand",
						children: ["FPS ", fps]
					}) : null
				]
			})]
		})
	});
}
var TIPS = [
	"Tip: Cancel any Normal Attack (Light/Heavy/Kick) into a Special or Finisher on hit!",
	"Tip: Tap Parry (F / Shield) right before an impact for a Frame-1 Just Parry and +25 KI!",
	"Tip: Double-tap Forward or press Dash (E) to phase through enemy attacks with iFrames!",
	"Tip: Hold Guard (S / Shift) to block high attacks; crouch guard to block low sweeps!",
	"Tip: At 100% KI, unleash your Unblockable Super Finisher (P / 4) for massive damage!"
];
function Preloader({ onReady }) {
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [tipIndex, setTipIndex] = (0, import_react.useState)(0);
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const interval = setInterval(() => {
			setProgress((p) => {
				if (p >= 100) {
					clearInterval(interval);
					setLoaded(true);
					return 100;
				}
				return p + Math.floor(Math.random() * 18 + 12);
			});
		}, 90);
		const tipTimer = setInterval(() => {
			setTipIndex((i) => (i + 1) % TIPS.length);
		}, 2800);
		return () => {
			clearInterval(interval);
			clearInterval(tipTimer);
		};
	}, []);
	const handleStart = () => {
		audioManager.unlock();
		audioManager.roundAnnounce();
		onReady();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-40 flex flex-col items-center justify-between bg-ink px-4 py-8 text-foam select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-ocean/20 via-ink to-ink opacity-80" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(11,110,122,0.05)_50%,transparent_100%)] bg-[length:100%_4px]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex w-full max-w-md items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block h-2 w-2 animate-ping rounded-full bg-coral" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-sans text-[0.65rem] font-extrabold uppercase tracking-[0.24em] text-sand",
						children: "South Florida Arcade Engine v2.0"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 text-xs text-foam/60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-3.5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[0.68rem]",
						children: "60 FPS LOCKED"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex flex-col items-center text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mb-3 flex items-center justify-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -inset-4 rounded-full bg-ocean-2/20 blur-xl animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-16 text-foam drop-shadow-[0_0_15px_rgba(20,145,155,0.8)]" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-sans text-xs font-black uppercase tracking-[0.38em] text-coral drop-shadow",
						children: "Fort Lauderdale Boardwalk"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-6xl tracking-wider text-foam sm:text-7xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]",
						children: "SOUTH FLORIDA"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-5xl tracking-widest text-gold -mt-2 drop-shadow-[0_0_20px_rgba(232,196,90,0.6)]",
						children: "FIGHTER"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex w-full max-w-md flex-col items-center gap-4",
				children: [!loaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-[0.7rem] font-bold uppercase tracking-wider text-foam/80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Loading Arena Assets & Audio DSP..." }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-sand",
							children: [progress, "%"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-2 w-full overflow-hidden rounded-full bg-ink-2 ring-1 ring-foam/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full rounded-full bg-gradient-to-r from-ocean-2 via-gold to-coral transition-all duration-150 ease-out shadow-[0_0_12px_rgba(232,93,76,0.8)]",
							style: { width: `${progress}%` }
						})
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: handleStart,
					className: "group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-coral via-sand to-gold px-8 font-sans text-base font-black uppercase tracking-[0.2em] text-ink shadow-[0_0_30px_rgba(232,93,76,0.6)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-5 fill-ink" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Enter Arena" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5 animate-spin text-ink" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-[2.8rem] w-full rounded-xl border border-foam/10 bg-ink-2/80 px-3.5 py-2 text-center shadow-inner",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-sans text-[0.7rem] font-medium leading-tight text-foam/85 transition-opacity duration-300",
						children: TIPS[tipIndex]
					})
				})]
			})
		]
	});
}
function RotateHint() {
	const [landscape, setLandscape] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const check = () => {
			const wide = window.innerWidth > window.innerHeight * 1.12;
			const phone = Math.min(window.innerWidth, window.innerHeight) < 820;
			setLandscape(wide && phone);
		};
		check();
		window.addEventListener("resize", check);
		window.addEventListener("orientationchange", check);
		return () => {
			window.removeEventListener("resize", check);
			window.removeEventListener("orientationchange", check);
		};
	}, []);
	if (!landscape) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-x-0 top-0 z-40 flex justify-center p-[max(0.4rem,env(safe-area-inset-top))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "rounded-full border border-sand/30 bg-ink/80 px-3 py-1 font-sans text-[0.7rem] font-bold uppercase tracking-[0.16em] text-sand",
			children: "Rotate to portrait"
		})
	});
}
function TitleOverlay() {
	const start = () => {
		audioManager.unlock();
		audioManager.roundAnnounce();
		useGameStore.getState().setScreen("city-select");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-end justify-center bg-ink/40 px-4 pb-[max(1.4rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] select-none backdrop-blur-[2px]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-[1.8rem] border border-foam/20 bg-ink/90 px-6 py-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.65)] backdrop-blur-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-coral animate-ping" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-sans text-[0.68rem] font-black uppercase tracking-[0.32em] text-sand",
						children: "5-City Florida Championship"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-6xl leading-none tracking-wide text-foam drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]",
					children: "SOUTH FLORIDA"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-5xl leading-none tracking-widest text-gold -mt-1 drop-shadow-[0_0_20px_rgba(232,196,90,0.6)]",
					children: "FIGHTER"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto my-3 flex max-w-xs items-center justify-center gap-4 text-xs font-bold text-foam/80 border-y border-foam/10 py-1.5 font-mono",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1 text-gold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-3.5" }), " 5 CITIES"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1 text-cyan-400",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-3.5" }), " JUST PARRY"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1 text-coral",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), " BOSS RAID"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-2 max-w-sm font-sans text-xs leading-relaxed text-muted",
					children: "Fight across Fort Lauderdale, Tampa, Palm Beach, Miami, and Miami Beach. Master frame-1 parries, combo juggles, and seismic finishers."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: start,
					className: "mt-5 inline-flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-coral via-sand to-gold px-8 font-sans text-base font-black uppercase tracking-[0.18em] text-ink shadow-[0_0_25px_rgba(232,93,76,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-5 fill-ink" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Enter Florida Circuit" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4.5 text-ink" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid grid-cols-2 gap-2 rounded-xl border border-foam/10 bg-ink-2/60 p-2.5 text-left font-sans text-[0.62rem] text-foam/75",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-sand uppercase block mb-0.5",
							children: "Keyboard"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "A/D: Move · Space: Jump" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "J/K/L: Light/Heavy/Kick" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "F: Parry · S: Guard · E: Dash" })
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-sand uppercase block mb-0.5",
							children: "Specials & Mobile"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "U/I/O: Specials 1-3" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "P / 4: Super Finisher" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Touch Controls + Swipe" })
					] })]
				})
			]
		})
	});
}
function holdHandlers(key) {
	return {
		onPointerDown: (event) => {
			event.preventDefault();
			event.currentTarget.setPointerCapture(event.pointerId);
			inputManager[key] = true;
		},
		onPointerUp: (event) => {
			event.preventDefault();
			inputManager[key] = false;
		},
		onPointerCancel: () => {
			inputManager[key] = false;
		}
	};
}
function PadButton({ label, holdKey, className, children }) {
	const handlers = holdHandlers(holdKey);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		className: cn("pointer-events-auto select-none touch-none", "flex flex-col items-center justify-center gap-0.5", "border border-foam/20 bg-ink/80 text-foam", "shadow-[0_6px_0_rgba(0,0,0,0.4)] backdrop-blur-sm", "active:translate-y-0.5 active:shadow-[0_2px_0_rgba(0,0,0,0.4)]", "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand", className),
		...handlers,
		children
	});
}
function TouchControls() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-20",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute bottom-[max(0.7rem,env(safe-area-inset-bottom))] left-[max(0.6rem,env(safe-area-inset-left))] flex flex-col gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PadButton, {
					label: "Dash",
					holdKey: "touchDash",
					className: "h-11 w-11 rounded-[0.9rem] bg-ocean/80 text-foam border-ocean-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-5 text-amber-300" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-sans text-[0.55rem] font-bold uppercase",
						children: "Dash"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PadButton, {
					label: "Guard / Parry",
					holdKey: "touchParry",
					className: "h-11 w-11 rounded-[0.9rem] bg-cyan-900/80 text-cyan-200 border-cyan-400/40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-sans text-[0.55rem] font-bold uppercase",
						children: "Parry"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PadButton, {
					label: "Move left",
					holdKey: "touchLeft",
					className: "h-[3.9rem] w-[3.9rem] rounded-[1.2rem]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
						className: "size-7",
						strokeWidth: 2.5
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-sans text-[0.6rem] font-bold uppercase tracking-wider text-foam/70",
						children: "Left"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PadButton, {
					label: "Move right",
					holdKey: "touchRight",
					className: "h-[3.9rem] w-[3.9rem] rounded-[1.2rem]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
						className: "size-7",
						strokeWidth: 2.5
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-sans text-[0.6rem] font-bold uppercase tracking-wider text-foam/70",
						children: "Right"
					})]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute bottom-[max(0.7rem,env(safe-area-inset-bottom))] right-[max(0.6rem,env(safe-area-inset-right))] flex items-end gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PadButton, {
						label: "Light Attack",
						holdKey: "touchAttack",
						className: "h-13 w-13 rounded-[1rem] bg-coral/90 text-ink shadow-[0_0_10px_rgba(232,93,76,0.5)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sword, {
							className: "size-5",
							strokeWidth: 2.4
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-sans text-[0.55rem] font-black uppercase",
							children: "Light"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PadButton, {
						label: "Heavy Attack",
						holdKey: "touchHeavy",
						className: "h-13 w-13 rounded-[1rem] bg-rose-600/90 text-foam border-rose-400",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, {
							className: "size-5",
							strokeWidth: 2.4
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-sans text-[0.55rem] font-black uppercase",
							children: "Heavy"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PadButton, {
						label: "Special",
						holdKey: "touchSpecial",
						className: "h-12 w-12 rounded-[0.95rem] bg-purple-900/80 text-purple-200 border-purple-400/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
							className: "size-4.5",
							strokeWidth: 2.2
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-sans text-[0.55rem] font-bold uppercase",
							children: "Special"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PadButton, {
						label: "Super Finisher",
						holdKey: "touchFinisher",
						className: "h-12 w-12 rounded-[0.95rem] bg-amber-500/90 text-ink border-amber-300 shadow-[0_0_12px_rgba(232,196,90,0.8)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4.5 fill-ink" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-sans text-[0.55rem] font-black uppercase",
							children: "Super"
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PadButton, {
				label: "Jump",
				holdKey: "touchJump",
				className: "h-[4.4rem] w-[4.4rem] rounded-[1.35rem] bg-ink/85 text-foam border-foam/30",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {
					className: "size-7",
					strokeWidth: 2.6
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-sans text-[0.65rem] font-extrabold uppercase tracking-wider",
					children: "Jump"
				})]
			})]
		})]
	});
}
function VictoryScreen() {
	const currentLevelId = useGameStore((s) => s.currentLevelId);
	const health = useGameStore((s) => s.health);
	const maxHealth = useGameStore((s) => s.maxHealth);
	const maxCombo = useGameStore((s) => s.maxCombo);
	const kos = useGameStore((s) => s.kos);
	const level = getLevel(currentLevelId);
	const hpPct = Math.round(health / Math.max(1, maxHealth) * 100);
	const getGrade = () => {
		if (hpPct >= 80 && maxCombo >= 10) return {
			grade: "S",
			label: "FLAWLESS CHAMPION",
			color: "text-amber-300"
		};
		if (hpPct >= 60 || maxCombo >= 6) return {
			grade: "A",
			label: "DOMINANT VICTORY",
			color: "text-emerald-300"
		};
		if (hpPct >= 30) return {
			grade: "B",
			label: "CLEAN VICTORY",
			color: "text-cyan-300"
		};
		return {
			grade: "C",
			label: "SURVIVED THE GAUNTLET",
			color: "text-sand"
		};
	};
	const gradeInfo = getGrade();
	const allLevels = SOUTH_FLORIDA_LEVELS.map((l) => l.id);
	const nextLevelId = allLevels[allLevels.indexOf(currentLevelId) + 1] ?? null;
	const isFinalStage = !nextLevelId;
	const handleNextCity = () => {
		if (!nextLevelId) {
			useGameStore.getState().setScreen("city-select");
			return;
		}
		audioManager.unlock();
		audioManager.roundAnnounce();
		useGameStore.getState().setCurrentLevel(nextLevelId);
		useGameStore.getState().setScreen("play");
		window.setTimeout(() => restartPlayScene(), 80);
	};
	const handleReplay = () => {
		audioManager.unlock();
		audioManager.roundAnnounce();
		useGameStore.getState().resetRunStats();
		useGameStore.getState().setScreen("play");
		window.setTimeout(() => restartPlayScene(), 80);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-center justify-center bg-ink/90 px-4 py-6 select-none backdrop-blur-lg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-[2rem] border border-foam/20 bg-ink/95 p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.7)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-gold animate-spin" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-sans text-[0.68rem] font-black uppercase tracking-[0.32em] text-sand",
							children: [level.city, " · Area Secured"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-gold animate-spin" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-5xl tracking-wide text-foam drop-shadow",
					children: isFinalStage ? "CIRCUIT CHAMPION!" : "STAGE COMPLETE!"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "my-4 flex items-center justify-center gap-4 rounded-2xl border border-gold/30 bg-gradient-to-b from-amber-500/10 to-ink p-4 shadow-inner",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-18 items-center justify-center rounded-2xl border-2 border-gold bg-ink font-display text-6xl text-gold shadow-[0_0_20px_rgba(232,196,90,0.5)]",
						children: gradeInfo.grade
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs font-bold text-sand/80 uppercase",
							children: "Performance Grade"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `font-display text-2xl leading-tight drop-shadow ${gradeInfo.color}`,
							children: gradeInfo.label
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-2 rounded-2xl border border-foam/10 bg-ink-2/70 p-3 font-mono",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[0.62rem] text-foam/60 uppercase",
							children: "Max Combo"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-display text-2xl text-coral",
							children: [maxCombo, " HITS"]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[0.62rem] text-foam/60 uppercase",
							children: "Remaining HP"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-display text-2xl text-cyan-300",
							children: [hpPct, "%"]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[0.62rem] text-foam/60 uppercase",
							children: "K.O. Count"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-2xl text-gold",
							children: kos
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-col gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleNextCity,
						className: "flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-coral via-sand to-gold px-8 font-sans text-base font-black uppercase tracking-[0.16em] text-ink shadow-[0_0_25px_rgba(232,93,76,0.6)] transition-all hover:scale-[1.01] active:scale-[0.98]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isFinalStage ? "View Circuit Map" : "Advance to Next City" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: handleReplay,
							className: "flex h-11 items-center justify-center gap-1.5 rounded-xl border border-foam/20 bg-ink-2/80 font-sans text-xs font-bold uppercase tracking-wider text-foam hover:bg-ink active:scale-95",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Retry Stage" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => useGameStore.getState().setScreen("city-select"),
							className: "flex h-11 items-center justify-center gap-1.5 rounded-xl border border-foam/20 bg-ink-2/80 font-sans text-xs font-bold uppercase tracking-wider text-sand hover:bg-ink active:scale-95",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Circuit Map" })]
						})]
					})]
				})
			]
		})
	});
}
/**
* Iframe Embedding & Host Website Communication Bridge
* Enables seamless two-way postMessage communication when hosted on Vercel
* and embedded in parent sites / CMS / portals.
*/
function postToParent(payload) {
	if (typeof window === "undefined" || window.parent === window) return;
	try {
		window.parent.postMessage(payload, "*");
	} catch (err) {
		console.warn("Could not postMessage to parent window:", err);
	}
}
function initIframeBridge() {
	if (typeof window === "undefined") return () => {};
	const handleMessage = (event) => {
		const data = event.data;
		if (!data || typeof data !== "object") return;
		if (data.type === "SF_SET_VOLUME" && typeof data.volume === "number") audioManager.setVolume(data.volume);
		else if (data.type === "SF_TOGGLE_MUTE") audioManager.toggleMute();
		else if (data.type === "SF_RESTART") restartPlayScene();
	};
	window.addEventListener("message", handleMessage);
	postToParent({ type: "SF_GAME_READY" });
	return () => {
		window.removeEventListener("message", handleMessage);
	};
}
function GameApp() {
	const hostRef = (0, import_react.useRef)(null);
	const screen = useGameStore((s) => s.screen);
	const health = useGameStore((s) => s.health);
	const energy = useGameStore((s) => s.energy);
	const [isLoading, setIsLoading] = (0, import_react.useState)(true);
	const [touchReady, setTouchReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		return initIframeBridge();
	}, []);
	(0, import_react.useEffect)(() => {
		postToParent({
			type: "SF_STATE_CHANGE",
			data: {
				screen,
				health,
				energy
			}
		});
	}, [
		screen,
		health,
		energy
	]);
	(0, import_react.useEffect)(() => {
		const host = hostRef.current;
		if (!host) return;
		let game = null;
		let cancelled = false;
		import("./createGame-CysCI2YK.mjs").then(({ createGame }) => {
			if (cancelled || !host) return;
			game = createGame(host);
		});
		return () => {
			cancelled = true;
			game?.destroy(true);
			host.replaceChildren();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (screen !== "play") {
			inputManager.enabled = false;
			setTouchReady(false);
			return;
		}
		inputManager.bind();
		inputManager.enablePlay();
		setTouchReady(false);
		const timer = window.setTimeout(() => setTouchReady(true), 450);
		return () => window.clearTimeout(timer);
	}, [screen]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "game-shell",
		tabIndex: 0,
		onClick: () => hostRef.current?.focus(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "game-stage",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: hostRef,
					id: "sf-game",
					className: "game-canvas"
				}),
				isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Preloader, { onReady: () => setIsLoading(false) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					screen === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {}) : null,
					screen === "play" && touchReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchControls, {}) : null,
					screen === "title" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleOverlay, {}) : null,
					screen === "city-select" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CitySelectMap, {}) : null,
					screen === "victory" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VictoryScreen, {}) : null
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateHint, {})
			]
		})
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameApp, {});
}
//#endregion
export { WORLD_WIDTH as C, WORLD_HEIGHT as S, GAME_HEIGHT as _, getLevel as a, PLAYER_BODY as b, allRosterClips as c, unregisterGame as d, CAMERA as f, ENEMY_DISPLAY_SCALE as g, ENEMY_BODY as h, SOUTH_FLORIDA_LEVELS as i, getCharacter as l, inputManager as n, approach as o, COMBAT as p, useGameStore as r, audioManager as s, routes_exports as t, registerGame as u, JUMP as v, PLAYER_DISPLAY_SCALE as x, MOVE as y };
