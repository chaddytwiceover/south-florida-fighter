import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
import { a as ChevronLeft, i as ChevronRight, n as Sword, o as ArrowUp, r as Sparkles } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DjuggEnX.js
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
	frameWidth: 128,
	frameHeight: 128,
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
		idle: clip(id, "idle", 6, -1),
		run: clip(id, "run", 10, -1),
		jump: clip(id, "jump", 8, 0),
		hurt: clip(id, "hurt", 8, 0),
		light: clip(id, "light", 14, 0),
		heavy: clip(id, "heavy", 11, 0),
		kick: clip(id, "kick", 12, 0),
		special1: clip(id, "special1", 12, 0),
		special2: clip(id, "special2", 12, 0),
		special3: clip(id, "special3", 12, 0),
		finisher: clip(id, "finisher", 10, 0)
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
	title: "Street Crown",
	tagline: "Move smart. Hit clean.",
	portrait: "/game/sprites/characters/jav/portrait.png",
	accent: "royal",
	health: 110,
	ki: 100,
	movementSpeed: 275,
	attackPower: 12,
	attacks: [
		move({
			id: "jav-light",
			name: "Light Punch",
			anim: "light",
			damage: 8,
			durationMs: 280,
			effect: "melee",
			description: "Quick jab that starts the string."
		}),
		move({
			id: "jav-heavy",
			name: "Heavy Punch",
			anim: "heavy",
			damage: 14,
			durationMs: 420,
			effect: "melee",
			description: "Committed haymaker, second hit of the combo."
		}),
		move({
			id: "jav-kick",
			name: "Kick",
			anim: "kick",
			damage: 12,
			durationMs: 400,
			effect: "melee",
			description: "Roundhouse that closes the three-hit string."
		})
	],
	specials: [
		move({
			id: "jav-chain",
			name: "Chain Slash",
			anim: "special1",
			damage: 16,
			kiCost: 25,
			durationMs: 480,
			effect: "melee",
			description: "Whip a short purple chain from the lead fist."
		}),
		move({
			id: "jav-wave",
			name: "Energy Wave",
			anim: "special2",
			damage: 18,
			kiCost: 30,
			durationMs: 500,
			effect: "projectile",
			description: "Fire a royal-purple ki bolt down the boardwalk."
		}),
		move({
			id: "jav-step",
			name: "Shadow Step",
			anim: "special3",
			damage: 10,
			kiCost: 20,
			durationMs: 340,
			effect: "dash",
			description: "Blink-dash through a lane of space."
		})
	],
	finisher: move({
		id: "jav-hood",
		name: "Hood Legend",
		anim: "finisher",
		damage: 32,
		kiCost: 100,
		durationMs: 780,
		effect: "finisher",
		description: "Drop low and detonate a crown shockwave."
	}),
	animationSet: makeSet("jav")
};
var CHARACTERS = [JAV, {
	id: "keno",
	name: "KENO",
	title: "Alley Phantom",
	tagline: "Silent, hits true, leaves only whispers.",
	portrait: "/game/sprites/characters/keno/portrait.png",
	accent: "night",
	health: 90,
	ki: 100,
	movementSpeed: 325,
	attackPower: 14,
	attacks: [
		move({
			id: "keno-light",
			name: "Light Slash",
			anim: "light",
			damage: 8,
			durationMs: 260,
			effect: "melee",
			description: "Short katana cut that starts the string."
		}),
		move({
			id: "keno-heavy",
			name: "Heavy Slash",
			anim: "heavy",
			damage: 15,
			durationMs: 440,
			effect: "melee",
			description: "Overhead commit, second hit of the combo."
		}),
		move({
			id: "keno-kick",
			name: "Spin Cut",
			anim: "kick",
			damage: 13,
			durationMs: 400,
			effect: "melee",
			description: "Turning slash that closes the three-hit string."
		})
	],
	specials: [
		move({
			id: "keno-dash",
			name: "Shadow Dash",
			anim: "special1",
			damage: 12,
			kiCost: 20,
			durationMs: 320,
			effect: "dash",
			description: "Slip forward in a blade-first blur."
		}),
		move({
			id: "keno-clone",
			name: "Shadow Clone",
			anim: "special2",
			damage: 8,
			kiCost: 30,
			durationMs: 500,
			effect: "clone",
			description: "Leave a whispering afterimage in place."
		}),
		move({
			id: "keno-stalker",
			name: "Night Stalker",
			anim: "special3",
			damage: 20,
			kiCost: 30,
			durationMs: 520,
			effect: "melee",
			description: "Leaping overhead pounce from the dark."
		})
	],
	finisher: move({
		id: "keno-phantom",
		name: "Alley Phantom",
		anim: "finisher",
		damage: 32,
		kiCost: 100,
		durationMs: 780,
		effect: "finisher",
		description: "Shadow fire erupts as the finishing stance hits."
	}),
	animationSet: makeSet("keno")
}];
function getCharacter(id) {
	return CHARACTERS.find((c) => c.id === id) ?? JAV;
}
function allClips(character) {
	return Object.values(character.animationSet);
}
function allRosterClips() {
	return CHARACTERS.flatMap(allClips);
}
/** Tiny placeholder SFX. Swap for real assets later. */
var AudioManagerImpl = class {
	ctx = null;
	muted = false;
	unlock() {
		if (typeof window === "undefined") return;
		if (!this.ctx) {
			const Ctx = window.AudioContext || window.webkitAudioContext;
			if (!Ctx) return;
			this.ctx = new Ctx();
		}
		this.ctx.resume();
	}
	beep(freq, duration, type, gain = .05) {
		if (this.muted || !this.ctx || this.ctx.state !== "running") return;
		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const amp = this.ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, t);
		amp.gain.setValueAtTime(gain, t);
		amp.gain.exponentialRampToValueAtTime(1e-4, t + duration);
		osc.connect(amp);
		amp.connect(this.ctx.destination);
		osc.start(t);
		osc.stop(t + duration);
	}
	jump() {
		this.beep(420, .09, "square", .04);
	}
	land() {
		this.beep(140, .07, "triangle", .035);
	}
	attack() {
		this.beep(210, .07, "square", .045);
	}
	special() {
		this.beep(540, .12, "sawtooth", .03);
	}
	whoosh() {
		this.beep(180, .1, "triangle", .04);
	}
	finisher() {
		this.beep(90, .18, "sawtooth", .05);
		this.beep(360, .14, "square", .03);
	}
	hurt() {
		this.beep(110, .12, "sawtooth", .05);
	}
	defeat() {
		this.beep(70, .16, "triangle", .05);
		this.beep(180, .1, "square", .03);
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
function persistCharacter(id) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem("sfs.characterId", id);
}
function readSavedCharacter() {
	if (typeof window === "undefined") return JAV.id;
	return window.localStorage.getItem("sfs.characterId") ?? JAV.id;
}
var initial = getCharacter(readSavedCharacter());
var useGameStore = create((set, get) => ({
	screen: "title",
	playing: false,
	characterId: initial.id,
	characterName: initial.name,
	portrait: initial.portrait,
	health: initial.health,
	maxHealth: initial.health,
	energy: 55,
	maxEnergy: initial.ki,
	xp: 0,
	coins: 0,
	kos: 0,
	comboHits: 0,
	aliveEnemies: 0,
	location: "Fort Lauderdale Beach",
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
	setFps: (fps) => set({ fps }),
	setHealth: (health) => set({ health }),
	setAliveEnemies: (aliveEnemies) => set({ aliveEnemies }),
	setFlash: (flash) => set({ flash }),
	applyCharacter: (id) => {
		const character = getCharacter(id);
		persistCharacter(character.id);
		set({
			characterId: character.id,
			characterName: character.name,
			portrait: character.portrait,
			health: character.health,
			maxHealth: character.health,
			maxEnergy: character.ki,
			energy: 55,
			xp: 0,
			kos: 0,
			comboHits: 0,
			aliveEnemies: 0,
			currentMove: "",
			specialIndex: 0,
			flash: ""
		});
	},
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
	addKo: () => set({
		kos: get().kos + 1,
		comboHits: get().comboHits
	}),
	addComboHit: () => set({ comboHits: get().comboHits + 1 }),
	resetCombo: () => set({ comboHits: 0 })
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
	"Digit1",
	"Digit2",
	"Digit3",
	"Escape",
	"Enter"
]);
var EMPTY = {
	moveX: 0,
	jump: false,
	jumpPressed: false,
	attack: false,
	attackPressed: false,
	special: false,
	specialPressed: false,
	specialSlot: null,
	pausePressed: false
};
function radialDeadzone(x, y, dz = .18) {
	const m = Math.hypot(x, y);
	if (m < dz) return {
		x: 0,
		y: 0
	};
	const scale = (m - dz) / (1 - dz) / m;
	return {
		x: x * scale,
		y: y * scale
	};
}
var InputManagerImpl = class {
	enabled = false;
	keys = /* @__PURE__ */ new Set();
	injected = /* @__PURE__ */ new Set();
	touchLeft = false;
	touchRight = false;
	touchMoveX = 0;
	touchJump = false;
	touchAttack = false;
	touchSpecial = false;
	prevJump = false;
	prevAttack = false;
	prevSpecial = false;
	prevPause = false;
	prevSlot = [
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
		this.touchJump = false;
		this.touchAttack = false;
		this.touchSpecial = false;
		this.prevJump = true;
		this.prevAttack = true;
		this.prevSpecial = true;
		this.prevPause = true;
		this.prevSlot = [
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
	readGamepad() {
		if (typeof navigator === "undefined" || !navigator.getGamepads) return {
			x: 0,
			jump: false,
			attack: false,
			special: false
		};
		const pads = navigator.getGamepads();
		for (const pad of pads) {
			if (!pad || pad.mapping !== "standard") continue;
			const stick = radialDeadzone(pad.axes[0] ?? 0, pad.axes[1] ?? 0);
			const dpadX = (pad.buttons[15]?.pressed ? 1 : 0) - (pad.buttons[14]?.pressed ? 1 : 0);
			return {
				x: clamp(stick.x + dpadX, -1, 1),
				jump: Boolean(pad.buttons[0]?.pressed),
				attack: Boolean(pad.buttons[2]?.pressed),
				special: Boolean(pad.buttons[3]?.pressed || pad.buttons[1]?.pressed)
			};
		}
		return {
			x: 0,
			jump: false,
			attack: false,
			special: false
		};
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
				false
			];
			this.last = EMPTY;
			return EMPTY;
		}
		const pad = this.readGamepad();
		const left = this.down("ArrowLeft", "KeyA") || this.touchLeft;
		const right = this.down("ArrowRight", "KeyD") || this.touchRight;
		let moveX = 0;
		if (left) moveX -= 1;
		if (right) moveX += 1;
		if (moveX === 0 && Math.abs(this.touchMoveX) > .2) moveX = this.touchMoveX;
		if (moveX === 0) moveX = pad.x;
		moveX = clamp(moveX, -1, 1);
		const jump = this.down("Space", "ArrowUp", "KeyW") || this.touchJump || pad.jump;
		const attack = this.down("KeyJ") || this.touchAttack || pad.attack;
		const special = this.down("KeyK") || this.touchSpecial || pad.special;
		const pause = this.down("Escape");
		const slotHeld = [
			this.down("Digit1"),
			this.down("Digit2"),
			this.down("Digit3")
		];
		let specialSlot = null;
		for (let i = 0; i < 3; i += 1) if (slotHeld[i] && !this.prevSlot[i]) specialSlot = i;
		const actions = {
			moveX,
			jump,
			jumpPressed: jump && !this.prevJump,
			attack,
			attackPressed: attack && !this.prevAttack,
			special,
			specialPressed: special && !this.prevSpecial,
			specialSlot,
			pausePressed: pause && !this.prevPause
		};
		this.prevJump = jump;
		this.prevAttack = attack;
		this.prevSpecial = special;
		this.prevPause = pause;
		this.prevSlot = slotHeld;
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
function KitList({ character }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 gap-y-0.5 font-sans text-[0.58rem] font-bold uppercase tracking-wider text-foam/80",
		children: [
			character.attacks.map((move) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate",
				children: move.name
			}, move.id)),
			character.specials.map((move) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate text-gold",
				children: move.name
			}, move.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate text-coral",
				children: character.finisher.name
			})
		]
	});
}
function FighterCard({ character, selected, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-testid": `fighter-${character.id}`,
		onClick: onSelect,
		className: cn("flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.1rem] border p-2.5 text-left transition-transform duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)]", selected ? "border-gold bg-ink/90 ring-2 ring-gold" : "border-foam/15 bg-ink/70 hover:border-foam/40"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: character.portrait,
					alt: "",
					className: "size-14 shrink-0 rounded-[0.85rem] border border-foam/20 object-cover",
					draggable: false
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl leading-none tracking-wide text-foam",
						children: character.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-sans text-[0.62rem] font-bold uppercase tracking-[0.16em] text-sand",
						children: character.title
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 truncate font-sans text-[0.7rem] text-muted",
				children: character.tagline
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex gap-3 font-sans text-[0.62rem] font-extrabold uppercase tracking-wider text-foam/70",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["HP ", character.health] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["SPD ", character.movementSpeed] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["ATK ", character.attackPower] })
				]
			})
		]
	});
}
function CharacterSelect() {
	const selected = getCharacter(useGameStore((s) => s.characterId));
	const confirm = () => {
		audioManager.unlock();
		useGameStore.getState().applyCharacter(selected.id);
		useGameStore.getState().setScreen("play");
		window.setTimeout(() => restartPlayScene(), 80);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-stretch justify-center bg-ink/80 px-3 py-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full w-full max-w-md flex-col gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-[0.62rem] font-bold uppercase tracking-[0.22em] text-sand",
					children: "South Florida Samurai"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl leading-none text-foam",
					children: "Pick your fighter"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex min-h-0 flex-1 flex-col gap-2",
					children: CHARACTERS.map((character) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FighterCard, {
						character,
						selected: character.id === selected.id,
						onSelect: () => useGameStore.getState().applyCharacter(character.id)
					}, character.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-[1rem] border border-foam/15 bg-ink/90 px-3 py-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KitList, { character: selected })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => useGameStore.getState().setScreen("title"),
						className: "h-11 rounded-full border border-foam/20 px-4 font-sans text-xs font-extrabold uppercase tracking-[0.14em] text-foam",
						children: "Back"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-testid": "confirm-fighter",
						onClick: confirm,
						className: "h-11 flex-1 rounded-full bg-foam px-6 font-sans text-sm font-extrabold uppercase tracking-[0.14em] text-ink hover:bg-sand",
						children: ["Fight as ", selected.name]
					})]
				})
			]
		})
	});
}
function Meter({ label, value, max, barClass }) {
	const pct = Math.max(0, Math.min(100, value / Math.max(1, max) * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-sans text-[0.58rem] font-extrabold uppercase tracking-wider text-foam/70",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-sans text-[0.58rem] font-bold tabular-nums text-foam/55",
			children: Math.round(value)
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-0.5 h-1.5 overflow-hidden rounded-full bg-ink-2 ring-1 ring-foam/15",
		role: "meter",
		"aria-label": label,
		"aria-valuenow": Math.round(value),
		"aria-valuemin": 0,
		"aria-valuemax": max,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `h-full rounded-full ${barClass}`,
			style: { width: `${pct}%` }
		})
	})] });
}
function Hud() {
	const characterId = useGameStore((s) => s.characterId);
	const characterName = useGameStore((s) => s.characterName);
	const portrait = useGameStore((s) => s.portrait);
	const health = useGameStore((s) => s.health);
	const maxHealth = useGameStore((s) => s.maxHealth);
	const energy = useGameStore((s) => s.energy);
	const maxEnergy = useGameStore((s) => s.maxEnergy);
	const xp = useGameStore((s) => s.xp);
	const kos = useGameStore((s) => s.kos);
	const comboHits = useGameStore((s) => s.comboHits);
	const aliveEnemies = useGameStore((s) => s.aliveEnemies);
	const location = useGameStore((s) => s.location);
	const fps = useGameStore((s) => s.fps);
	const debug = useGameStore((s) => s.debug);
	const currentMove = useGameStore((s) => s.currentMove);
	const specialIndex = useGameStore((s) => s.specialIndex);
	const flash = useGameStore((s) => s.flash);
	const character = getCharacter(characterId);
	const nextSpecial = character.specials[specialIndex];
	const finisherReady = energy >= 100;
	(0, import_react.useEffect)(() => {
		if (!flash) return;
		const timer = window.setTimeout(() => useGameStore.setState({ flash: "" }), 900);
		return () => window.clearTimeout(timer);
	}, [flash]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-testid": "hud",
		className: "pointer-events-none absolute inset-x-0 top-0 z-20 p-[max(0.45rem,env(safe-area-inset-top))] px-[max(0.7rem,env(safe-area-inset-left))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 items-center gap-2 rounded-[1.2rem] border border-foam/15 bg-ink/75 p-1.5 pr-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-12 shrink-0 overflow-hidden rounded-[0.8rem] border border-gold/50 bg-ocean",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: portrait,
						alt: "",
						className: "size-full object-cover object-top",
						draggable: false
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl leading-none tracking-wide text-foam",
						children: characterName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 space-y-0.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
								label: "HP",
								value: health,
								max: maxHealth,
								barClass: "bg-coral"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
								label: "KI",
								value: energy,
								max: maxEnergy,
								barClass: "bg-ocean-2"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
								label: "XP",
								value: xp,
								max: 100,
								barClass: "bg-gold"
							})
						]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-col items-end gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-full border border-foam/15 bg-ink/70 px-2.5 py-1 font-sans text-[0.58rem] font-bold uppercase tracking-[0.12em] text-sand",
						children: location
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-full border border-foam/15 bg-ink/70 px-2.5 py-1 font-sans text-[0.58rem] font-bold uppercase tracking-wider text-foam",
						children: finisherReady ? character.finisher.name : nextSpecial.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rounded-full border border-foam/15 bg-ink/70 px-2.5 py-1 font-sans text-[0.58rem] font-bold uppercase tracking-wider text-foam",
						children: [
							"KO ",
							kos,
							" · ",
							aliveEnemies,
							" left"
						]
					}),
					currentMove ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-full bg-royal px-3 py-1 font-display text-sm tracking-wide text-foam",
						children: currentMove
					}) : null,
					comboHits >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rounded-full bg-coral px-3 py-1 font-display text-sm tracking-wide text-ink",
						children: [comboHits, " HIT"]
					}) : null,
					flash ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-full bg-coral px-3 py-1 font-sans text-[0.65rem] font-extrabold uppercase tracking-wider text-ink",
						children: flash
					}) : null,
					debug ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-[0.65rem] tabular-nums text-sand",
						children: ["FPS ", fps]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-testid": "roster-button",
						className: "pointer-events-auto rounded-full border border-foam/20 bg-ink/70 px-3 py-1 font-sans text-[0.6rem] font-extrabold uppercase tracking-wider text-foam/80",
						onClick: () => {
							inputManager.enabled = false;
							useGameStore.getState().setScreen("select");
						},
						children: "Roster"
					})
				]
			})]
		})
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
		useGameStore.getState().setScreen("select");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-end justify-center bg-ink/25 px-4 pb-[max(1.4rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-[1.6rem] border border-foam/15 bg-ink/82 px-5 py-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-[0.68rem] font-bold uppercase tracking-[0.28em] text-sand",
					children: "South Florida"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-6xl leading-none text-foam",
					children: "Samurai"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 font-sans text-sm font-semibold text-foam/80",
					children: "Portrait arcade brawler"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-2 max-w-sm font-sans text-sm leading-relaxed text-muted",
					children: "JAV and KENO hit the Fort Lauderdale boardwalk. Combos, knockback, and a gauntlet of bruisers and skate rats."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: start,
					className: "mt-5 inline-flex h-12 min-w-[10.5rem] items-center justify-center rounded-full bg-foam px-8 font-sans text-base font-extrabold uppercase tracking-[0.14em] text-ink transition-transform duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)] hover:bg-sand active:scale-[0.98]",
					children: "Choose fighter"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 font-sans text-xs text-foam/55",
					children: "A / D move · Space jump · J attack combo · K special"
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
		className: cn("pointer-events-auto select-none touch-none", "flex flex-col items-center justify-center gap-0.5", "border border-foam/20 bg-ink/70 text-foam", "shadow-[0_6px_0_rgba(0,0,0,0.35)]", "active:translate-y-0.5 active:shadow-[0_3px_0_rgba(0,0,0,0.35)]", "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand", className),
		...handlers,
		children
	});
}
function TouchControls() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-20",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute bottom-[max(0.9rem,env(safe-area-inset-bottom))] left-[max(0.7rem,env(safe-area-inset-left))] flex gap-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PadButton, {
				label: "Move left",
				holdKey: "touchLeft",
				className: "h-[4.25rem] w-[4.25rem] rounded-[1.3rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
					className: "size-8",
					strokeWidth: 2.5
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-sans text-[0.65rem] font-bold uppercase tracking-wider text-foam/70",
					children: "Left"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PadButton, {
				label: "Move right",
				holdKey: "touchRight",
				className: "h-[4.25rem] w-[4.25rem] rounded-[1.3rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
					className: "size-8",
					strokeWidth: 2.5
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-sans text-[0.65rem] font-bold uppercase tracking-wider text-foam/70",
					children: "Right"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute bottom-[max(0.9rem,env(safe-area-inset-bottom))] right-[max(0.7rem,env(safe-area-inset-right))] flex items-end gap-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PadButton, {
					label: "Attack",
					holdKey: "touchAttack",
					className: "h-16 w-16 rounded-[1.15rem] bg-coral/90 text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sword, {
						className: "size-6",
						strokeWidth: 2.2
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-sans text-[0.6rem] font-extrabold uppercase tracking-wider",
						children: "Attack"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PadButton, {
					label: "Special",
					holdKey: "touchSpecial",
					className: "h-14 w-14 rounded-[1.1rem] bg-ink/55",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
						className: "size-5",
						strokeWidth: 2.2
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-sans text-[0.6rem] font-bold uppercase tracking-wider text-foam/60",
						children: "Special"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PadButton, {
				label: "Jump",
				holdKey: "touchJump",
				className: "h-[4.8rem] w-[4.8rem] rounded-[1.5rem] bg-ink/75 text-foam",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {
					className: "size-7",
					strokeWidth: 2.6
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-sans text-[0.7rem] font-extrabold uppercase tracking-wider",
					children: "Jump"
				})]
			})]
		})]
	});
}
function GameApp() {
	const hostRef = (0, import_react.useRef)(null);
	const screen = useGameStore((s) => s.screen);
	const [touchReady, setTouchReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const host = hostRef.current;
		if (!host) return;
		let game = null;
		let cancelled = false;
		import("./createGame-B3_Nri0W.mjs").then(({ createGame }) => {
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
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "game-stage",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: hostRef,
					id: "sf-game",
					className: "game-canvas"
				}),
				screen === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {}) : null,
				screen === "play" && touchReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchControls, {}) : null,
				screen === "title" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleOverlay, {}) : null,
				screen === "select" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterSelect, {}) : null,
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
export { audioManager as a, registerGame as c, approach as i, unregisterGame as l, inputManager as n, allRosterClips as o, useGameStore as r, getCharacter as s, routes_exports as t };
