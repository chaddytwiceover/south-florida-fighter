import * as PhaserNS from "phaser";
import { allRosterClips, getCharacter } from "../characters/CharacterData";
import { CombatSystem } from "../combat/CombatSystem";
import {
  CAMERA,
  DEBUG_QUERY,
  GAME_HEIGHT,
  GAME_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../config";
import { allEnemyClips } from "../enemies/EnemyData";
import { inputManager } from "../input/InputManager";
import { getLevel, SOUTH_FLORIDA_LEVELS } from "../levels/LevelRegistry";
import { createFxAnimations } from "../systems/CombatFx";
import { attachControlsTest, detachControlsTest } from "../systems/controlsTest";
import { useGameStore } from "../systems/gameStore";
import { Player } from "../systems/Player";

const Phaser = (PhaserNS as { default?: typeof PhaserNS }).default ?? PhaserNS;

export class PlayScene extends Phaser.Scene {
  private player!: Player;
  private combat!: CombatSystem;
  private far!: Phaser.GameObjects.TileSprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private bgScale = 1;
  private fpsTimer = 0;

  constructor() {
    super({ key: "play" });
  }

  init() {
    this.fpsTimer = 0;
  }

  preload() {
    // Preload all 5 South Florida city backgrounds
    for (const lvl of SOUTH_FLORIDA_LEVELS) {
      if (!this.textures.exists(`bg-${lvl.id}`)) {
        this.load.image(`bg-${lvl.id}`, lvl.parallax.far);
      }
    }

    this.load.image("ground", "/game/backgrounds/fort-lauderdale/ground.jpg");
    this.load.image("palm", "/game/sprites/props/palm.png");
    this.load.image("tower", "/game/sprites/props/tower.png");

    this.load.spritesheet("slash-fx", "/game/sprites/fx/slash.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("wave-fx", "/game/sprites/fx/wave.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("impact-fx", "/game/sprites/fx/impact.png", {
      frameWidth: 128,
      frameHeight: 128,
    });

    for (const clip of allRosterClips()) {
      this.load.spritesheet(clip.textureKey, clip.url, {
        frameWidth: clip.frameWidth,
        frameHeight: clip.frameHeight,
      });
    }
    for (const clip of allEnemyClips()) {
      this.load.spritesheet(clip.textureKey, clip.url, {
        frameWidth: clip.frameWidth,
        frameHeight: clip.frameHeight,
      });
    }
  }

  create() {
    const levelId = useGameStore.getState().currentLevelId || "fort-lauderdale";
    const level = getLevel(levelId);
    const debug =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has(DEBUG_QUERY);

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.physics.world.gravity.y = 0;
    if (debug) {
      this.physics.world.createDebugGraphic();
      this.physics.world.drawDebug = true;
    }
    useGameStore.setState({ debug, location: `${level.city} · ${level.name}` });

    // Sky & Parallax Skyline Layer without vertical repetition
    const bgKey = this.textures.exists(`bg-${level.id}`)
      ? `bg-${level.id}`
      : "bg-fort-lauderdale";

    const bgHeight = level.groundY + 60;
    this.far = this.add
      .tileSprite(0, 0, GAME_WIDTH, bgHeight, bgKey)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(0);

    const tex = this.textures.get(bgKey).getSourceImage() as { width?: number; height?: number };
    const texHeight = tex?.height || 1080;
    this.bgScale = bgHeight / texHeight;
    this.far.tileScaleY = this.bgScale;
    this.far.tileScaleX = this.bgScale;

    // Ground Walkway
    const groundH = WORLD_HEIGHT - level.groundY + 120;
    this.add
      .tileSprite(WORLD_WIDTH / 2, level.groundY, WORLD_WIDTH, groundH, "ground")
      .setOrigin(0.5, 0)
      .setDepth(4);

    // Stage Props
    for (const prop of level.props) {
      this.add
        .image(prop.x, prop.y, prop.key)
        .setOrigin(0.5, 1)
        .setScale(prop.scale)
        .setFlipX(Boolean(prop.flipX))
        .setDepth(prop.depth);
    }

    // Platforms & Collision Floor
    this.platforms = this.physics.add.staticGroup();
    const floor = this.add
      .rectangle(0, level.groundY, WORLD_WIDTH + 40, 72, 0x000000, 0)
      .setOrigin(0, 0)
      .setVisible(false);
    this.physics.add.existing(floor, true);
    const floorBody = floor.body as Phaser.Physics.Arcade.StaticBody;
    floorBody.updateFromGameObject();
    this.platforms.add(floor);

    for (const pad of level.platforms) {
      const visual = this.add
        .tileSprite(pad.x, pad.y, pad.width, pad.height, "ground")
        .setOrigin(0.5, 0)
        .setDepth(9);
      this.physics.add.existing(visual, true);
      const padBody = visual.body as Phaser.Physics.Arcade.StaticBody;
      padBody.updateFromGameObject();
      this.platforms.add(visual);
    }
    this.platforms.refresh();

    // Create Animations
    for (const clip of allRosterClips()) {
      if (this.anims.exists(clip.key)) continue;
      this.anims.create({
        key: clip.key,
        frames: this.anims.generateFrameNumbers(clip.textureKey, {
          start: 0,
          end: clip.frames - 1,
        }),
        frameRate: clip.frameRate,
        repeat: clip.repeat,
      });
    }
    createFxAnimations(this);
    CombatSystem.preloadAnims(this);

    // Player Spawn
    const character = getCharacter(useGameStore.getState().characterId);
    this.player = new Player(this, level.spawn.x, level.spawn.y, character);
    this.physics.add.collider(this.player.sprite, this.platforms);

    // Combat System & Enemies Spawn
    this.combat = new CombatSystem(this, debug);
    this.combat.bindPlayer(this.player);
    for (const spawn of level.enemies) {
      const enemy = this.combat.spawnEnemy(spawn.id, spawn.x, level.groundY);
      this.physics.add.collider(enemy.sprite, this.platforms);
    }

    // Camera follow
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(
      this.player.sprite,
      true,
      CAMERA.lerpX,
      CAMERA.lerpY,
    );
    this.cameras.main.setDeadzone(CAMERA.deadzoneW, CAMERA.deadzoneH);
    this.cameras.main.setFollowOffset(-CAMERA.lookAhead, CAMERA.lookY);
    this.cameras.main.setRoundPixels(true);

    attachControlsTest(this.player, () => this.combat.aliveCount());
    if (typeof window !== "undefined") {
      window.__playGeneration = (window.__playGeneration ?? 0) + 1;
    }

    this.events.once("shutdown", () => {
      this.combat.shutdown();
      detachControlsTest();
    });
  }

  update(_time: number, delta: number) {
    const dt = Math.min(delta / 1000, 0.1);
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
    cam.setFollowOffset(
      current + (look - current) * Math.min(1, 4 * dt),
      CAMERA.lookY,
    );

    const scrollX = cam.scrollX;
    this.far.tilePositionX = (scrollX * 0.18) / Math.max(0.1, this.bgScale);

    this.fpsTimer += dt;
    if (this.fpsTimer > 0.25) {
      this.fpsTimer = 0;
      useGameStore.getState().setFps(Math.round(this.game.loop.actualFps));
      useGameStore.getState().setAliveEnemies(this.combat.aliveCount());

      // Check Victory condition
      if (this.combat.aliveCount() === 0) {
        const store = useGameStore.getState();
        if (store.screen === "play" && !store.flash.includes("VICTORY")) {
          store.setFlash("STAGE COMPLETE!");
          this.time.delayedCall(1200, () => {
            store.markLevelComplete(store.currentLevelId);
            store.setScreen("victory");
          });
        }
      }
    }
  }
}
