import { GROUND_Y, WORLD_HEIGHT, WORLD_WIDTH } from "../config";

export type PropPlacement = {
  key: "palm" | "tower";
  x: number;
  y: number;
  scale: number;
  flipX?: boolean;
  depth: number;
};

export type PlatformDef = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type EnemySpawn = {
  id: string;
  x: number;
};

export type LevelDef = {
  id: string;
  name: string;
  worldWidth: number;
  worldHeight: number;
  groundY: number;
  spawn: { x: number; y: number };
  platforms: PlatformDef[];
  props: PropPlacement[];
  enemies: EnemySpawn[];
  parallax: {
    sky: string;
    far: string;
    mid: string;
    ground: string;
  };
};

export const FORT_LAUDERDALE: LevelDef = {
  id: "fort-lauderdale",
  name: "Fort Lauderdale",
  worldWidth: WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
  groundY: GROUND_Y,
  spawn: { x: 220, y: GROUND_Y },
  platforms: [
    { x: 1680, y: GROUND_Y - 110, width: 220, height: 22 },
    { x: 2280, y: GROUND_Y - 200, width: 180, height: 22 },
    { x: 2860, y: GROUND_Y - 110, width: 220, height: 22 },
  ],
  props: [
    { key: "palm", x: 360, y: GROUND_Y + 8, scale: 1.35, depth: 8 },
    { key: "palm", x: 700, y: GROUND_Y + 8, scale: 1.15, flipX: true, depth: 6 },
    { key: "tower", x: 1080, y: GROUND_Y + 6, scale: 1.2, depth: 7 },
    { key: "palm", x: 1480, y: GROUND_Y + 8, scale: 1.4, depth: 8 },
    { key: "palm", x: 1940, y: GROUND_Y + 8, scale: 1.05, flipX: true, depth: 5 },
    { key: "palm", x: 2420, y: GROUND_Y + 8, scale: 1.3, depth: 8 },
    { key: "tower", x: 2980, y: GROUND_Y + 6, scale: 1.15, depth: 7 },
    { key: "palm", x: 3360, y: GROUND_Y + 8, scale: 1.25, flipX: true, depth: 6 },
    { key: "palm", x: 3820, y: GROUND_Y + 8, scale: 1.45, depth: 8 },
    { key: "palm", x: 4280, y: GROUND_Y + 8, scale: 1.1, depth: 5 },
    { key: "tower", x: 4580, y: GROUND_Y + 6, scale: 1.25, depth: 7 },
    { key: "palm", x: 4760, y: GROUND_Y + 8, scale: 1.2, depth: 6 },
  ],
  enemies: [
    { id: "thug", x: 620 },
    { id: "rat", x: 980 },
    { id: "thug", x: 1480 },
    { id: "rat", x: 1980 },
    { id: "thug", x: 2520 },
    { id: "rat", x: 3080 },
    { id: "thug", x: 3620 },
    { id: "rat", x: 4180 },
  ],
  parallax: {
    sky: "/game/backgrounds/fort-lauderdale/sky-portrait.jpg",
    far: "/game/backgrounds/fort-lauderdale/far.jpg",
    mid: "/game/backgrounds/fort-lauderdale/mid.jpg",
    ground: "/game/backgrounds/fort-lauderdale/ground.jpg",
  },
};
