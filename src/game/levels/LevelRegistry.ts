import { GROUND_Y, WORLD_HEIGHT, WORLD_WIDTH } from "../config";

export type PropPlacement = {
  key: string;
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
  city: string;
  tagline: string;
  worldWidth: number;
  worldHeight: number;
  groundY: number;
  spawn: { x: number; y: number };
  platforms: PlatformDef[];
  props: PropPlacement[];
  enemies: EnemySpawn[];
  parallax: {
    far: string;
    ground: string;
  };
  boss?: {
    id: string;
    name: string;
    spawnX: number;
  };
};

export const FORT_LAUDERDALE: LevelDef = {
  id: "fort-lauderdale",
  name: "A1A Ocean Boardwalk",
  city: "Fort Lauderdale",
  tagline: "Las Olas luxury marina, sandy boardwalk, and sunlit oceanfront.",
  worldWidth: WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
  groundY: GROUND_Y,
  spawn: { x: 220, y: GROUND_Y },
  platforms: [
    { x: 1480, y: GROUND_Y - 110, width: 220, height: 22 },
    { x: 2180, y: GROUND_Y - 200, width: 180, height: 22 },
    { x: 2960, y: GROUND_Y - 110, width: 220, height: 22 },
  ],
  props: [
    { key: "beach_boards", x: 390, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "beach_chair", x: 780, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "beach_boards", x: 1480, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "beach_chair", x: 2410, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "beach_boards", x: 3260, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "beach_chair", x: 4070, y: GROUND_Y + 2, scale: 1, depth: 7 },
  ],
  enemies: [
    { id: "bruiser", x: 680 },
    { id: "blade", x: 1100 },
    { id: "bruiser", x: 1750 },
    { id: "blade", x: 2300 },
    { id: "bruiser", x: 2950 },
    { id: "blade", x: 3600 },
    { id: "bruiser", x: 4200 },
  ],
  parallax: {
    far: "/game/backgrounds/fort-lauderdale/arena.webp",
    ground: "/game/backgrounds/fort-lauderdale/ground.webp",
  },
};

export const TAMPA: LevelDef = {
  id: "tampa",
  name: "Ybor City Neon Strip",
  city: "Tampa",
  tagline: "Historic red brick cigar factories and warm gas-lit balconies.",
  worldWidth: WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
  groundY: GROUND_Y,
  spawn: { x: 220, y: GROUND_Y },
  platforms: [
    { x: 1380, y: GROUND_Y - 120, width: 240, height: 24 },
    { x: 2050, y: GROUND_Y - 210, width: 200, height: 24 },
    { x: 2800, y: GROUND_Y - 130, width: 260, height: 24 },
  ],
  props: [
    { key: "ybor_lamp", x: 410, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "ybor_crate", x: 830, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "ybor_lamp", x: 1510, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "ybor_crate", x: 2370, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "ybor_lamp", x: 3160, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "ybor_crate", x: 4030, y: GROUND_Y + 2, scale: 1, depth: 7 },
  ],
  enemies: [
    { id: "blade", x: 720 },
    { id: "bruiser", x: 1250 },
    { id: "blade", x: 1800 },
    { id: "blade", x: 2450 },
    { id: "bruiser", x: 3100 },
    { id: "blade", x: 3800 },
  ],
  parallax: {
    far: "/game/backgrounds/tampa/arena.webp",
    ground: "/game/backgrounds/tampa/ground.webp",
  },
};

export const PALM_BEACH: LevelDef = {
  id: "palm-beach",
  name: "Worth Avenue Promenade",
  city: "Palm Beach",
  tagline: "Mediterranean stone archways, high-society estates, and golden sunset.",
  worldWidth: WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
  groundY: GROUND_Y,
  spawn: { x: 220, y: GROUND_Y },
  platforms: [
    { x: 1500, y: GROUND_Y - 110, width: 230, height: 22 },
    { x: 2250, y: GROUND_Y - 190, width: 200, height: 22 },
    { x: 3100, y: GROUND_Y - 120, width: 250, height: 22 },
  ],
  props: [
    { key: "worth_urn", x: 400, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "worth_fountain", x: 840, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "worth_urn", x: 1500, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "worth_fountain", x: 2430, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "worth_urn", x: 3220, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "worth_fountain", x: 4030, y: GROUND_Y + 2, scale: 1, depth: 7 },
  ],
  enemies: [
    { id: "bruiser", x: 650 },
    { id: "blade", x: 1150 },
    { id: "bruiser", x: 1700 },
    { id: "bruiser", x: 2350 },
    { id: "blade", x: 3000 },
    { id: "bruiser", x: 3750 },
  ],
  parallax: {
    far: "/game/backgrounds/palm-beach/arena.webp",
    ground: "/game/backgrounds/palm-beach/ground.webp",
  },
};

export const MIAMI: LevelDef = {
  id: "miami",
  name: "Wynwood Graffiti District",
  city: "Miami",
  tagline: "Vibrant warehouse murals, neon club alleyways, and downtown skyline.",
  worldWidth: WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
  groundY: GROUND_Y,
  spawn: { x: 220, y: GROUND_Y },
  platforms: [
    { x: 1400, y: GROUND_Y - 120, width: 240, height: 24 },
    { x: 2150, y: GROUND_Y - 210, width: 190, height: 24 },
    { x: 2950, y: GROUND_Y - 130, width: 250, height: 24 },
  ],
  props: [
    { key: "wynwood_hydrant_new", x: 420, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "wynwood_paint", x: 810, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "wynwood_hydrant_new", x: 1480, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "wynwood_paint", x: 2240, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "wynwood_hydrant_new", x: 2990, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "wynwood_paint", x: 3980, y: GROUND_Y + 2, scale: 1, depth: 7 },
  ],
  enemies: [
    { id: "blade", x: 600 },
    { id: "bruiser", x: 1050 },
    { id: "blade", x: 1550 },
    { id: "bruiser", x: 2100 },
    { id: "blade", x: 2750 },
    { id: "bruiser", x: 3400 },
    { id: "blade", x: 4050 },
  ],
  parallax: {
    far: "/game/backgrounds/miami/arena.webp",
    ground: "/game/backgrounds/miami/ground.webp",
  },
};

export const MIAMI_BEACH: LevelDef = {
  id: "miami-beach",
  name: "Ocean Drive Art Deco Strip",
  city: "Miami Beach",
  tagline: "Pastel neon hotels, midnight ocean breeze, and the Syndicate Boss finale.",
  worldWidth: WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
  groundY: GROUND_Y,
  spawn: { x: 220, y: GROUND_Y },
  platforms: [
    { x: 1450, y: GROUND_Y - 110, width: 220, height: 22 },
    { x: 2100, y: GROUND_Y - 200, width: 180, height: 22 },
    { x: 2850, y: GROUND_Y - 110, width: 220, height: 22 },
  ],
  props: [
    { key: "ocean_bollard", x: 410, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "ocean_planter", x: 810, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "ocean_bollard", x: 1510, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "ocean_planter", x: 2350, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "ocean_bollard", x: 3220, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "ocean_planter", x: 4000, y: GROUND_Y + 2, scale: 1, depth: 7 },
  ],
  enemies: [
    { id: "bruiser", x: 620 },
    { id: "blade", x: 1100 },
    { id: "bruiser", x: 1680 },
    { id: "blade", x: 2250 },
    { id: "bruiser", x: 2900 },
    { id: "boss", x: 3800 },
  ],
  boss: {
    id: "boss",
    name: "Syndicate Kingpin",
    spawnX: 3800,
  },
  parallax: {
    far: "/game/backgrounds/miami-beach/arena.webp",
    ground: "/game/backgrounds/miami-beach/ground.webp",
  },
};

export const SOUTH_FLORIDA_LEVELS: LevelDef[] = [
  FORT_LAUDERDALE,
  TAMPA,
  PALM_BEACH,
  MIAMI,
  MIAMI_BEACH,
];

export function getLevel(id: string): LevelDef {
  return SOUTH_FLORIDA_LEVELS.find((l) => l.id === id) ?? FORT_LAUDERDALE;
}
