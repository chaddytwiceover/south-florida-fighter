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
import { getLevel } from "../levels/LevelRegistry";
import { createFxAnimations } from "../systems/CombatFx";
import { attachControlsTest, detachControlsTest } from "../systems/controlsTest";
import { useGameStore } from "../systems/gameStore";
import { Player } from "../systems/Player";
import { floatText } from "../combat/Juice";
import { audioManager } from "../audio/AudioManager";
import {
  addOptimizedImage,
  createLazyParallaxBackground,
  createOptimizedAnimation,
  enforceSteadyFrameRate,
  initPerformancePools,
  preloadFightBackground,
  preloadTextureAtlases,
} from "../PerformanceOptimizations.js";

const Phaser = (PhaserNS as { default?: typeof PhaserNS }).default ?? PhaserNS;

const PROP_CALIBRATION: Record<string, { bottomPad: number; scale: number }> = {
  ftl_surf: { bottomPad: 0, scale: 0.9 },
  ftl_tiki: { bottomPad: 0, scale: 0.95 },
  mb_artdeco_lamp: { bottomPad: 1, scale: 0.92 },
  mb_valet_sign: { bottomPad: 2, scale: 0.95 },
  palm: { bottomPad: 13, scale: 0.92 },
  pb_fountain: { bottomPad: 0, scale: 0.92 },
  pb_lamp: { bottomPad: 1, scale: 0.92 },
  pb_urn: { bottomPad: 0, scale: 0.95 },
  tampa_balcony: { bottomPad: 0, scale: 0.9 },
  tampa_barrel: { bottomPad: 2, scale: 0.95 },
  tampa_lamp: { bottomPad: 1, scale: 0.92 },
  tower: { bottomPad: 13, scale: 0.92 },
  wynwood_crates: { bottomPad: 3, scale: 0.95 },
  wynwood_hydrant: { bottomPad: 0, scale: 0.95 },
  wynwood_sign: { bottomPad: 0, scale: 0.92 },
};

export class PlayScene extends Phaser.Scene {
  private player!: Player;
  private combat!: CombatSystem;
  private far!: Phaser.GameObjects.TileSprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private bgScale = 1;
  private fpsTimer = 0;
  private isStageCleared = false;

  constructor() {
    super({ key: "play" });
  }

  init() {
    this.fpsTimer = 0;
    this.isStageCleared = false;
  }

  preload() {
    const levelId = useGameStore.getState().currentLevelId || "fort-lauderdale";
    preloadFightBackground(this, getLevel(levelId));
    preloadTextureAtlases(this);
  }

  create() {
    this.isStageCleared = false;
    const levelId = useGameStore.getState().currentLevelId || "fort-lauderdale";
    const level = getLevel(levelId);
    const debug =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has(DEBUG_QUERY);

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.physics.world.gravity.y = 0;
    enforceSteadyFrameRate(this);
    if (debug) {
      this.physics.world.createDebugGraphic();
      this.physics.world.drawDebug = true;
    }
    useGameStore.setState({
      debug,
      location: `${level.city} · ${level.name}`,
      aliveEnemies: level.enemies.length,
    });

    const parallax = createLazyParallaxBackground(this, level, GAME_WIDTH);
    this.far = parallax.far;
    this.bgScale = parallax.bgScale;

    // Ground Walkway
    const groundH = WORLD_HEIGHT - level.groundY + 120;
    this.add
      .tileSprite(WORLD_WIDTH / 2, level.groundY, WORLD_WIDTH, groundH, "ground")
      .setOrigin(0.5, 0)
      .setDepth(4);

    // Stage Props
    for (const prop of level.props) {
      const calibration = PROP_CALIBRATION[prop.key] ?? { bottomPad: 0, scale: 1 };
      const displayScale = prop.scale * calibration.scale;
      addOptimizedImage(this, prop.x, prop.y + calibration.bottomPad * displayScale, prop.key)
        .setOrigin(0.5, 1)
        .setScale(displayScale)
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
      createOptimizedAnimation(this, clip);
    }
    createFxAnimations(this);
    CombatSystem.preloadAnims(this);
    initPerformancePools(this);

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

    // Direct Victory Callback
    this.combat.setOnVictory(() => {
      this.handleStageClear();
    });

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

  handleStageClear() {
    if (this.isStageCleared) return;
    this.isStageCleared = true;

    const store = useGameStore.getState();
    store.setFlash("STAGE COMPLETE!");
    audioManager.roundAnnounce();

    floatText(
      this,
      this.cameras.main.scrollX + GAME_WIDTH / 2,
      420,
      "STAGE CLEAR!",
      "#e8c45a",
      "54px",
    );

    this.time.delayedCall(1200, () => {
      store.markLevelComplete(store.currentLevelId);
      store.setScreen("victory");
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
      const alive = this.combat.aliveCount();
      useGameStore.getState().setFps(Math.round(this.game.loop.actualFps));
      useGameStore.getState().setAliveEnemies(alive);

      // Check Victory fallback
      if (!this.isStageCleared && alive === 0 && this.combat.enemies.length > 0) {
        this.handleStageClear();
      }
    }
  }
}
