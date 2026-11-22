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
  platformArt: string;
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
  platformArt: "/game/backgrounds/fort-lauderdale/platform.webp",
  platforms: [
    { x: 490, y: GROUND_Y - 62, width: 310 },
    { x: 1770, y: GROUND_Y - 72, width: 280 },
    { x: 2070, y: GROUND_Y - 134, width: 234 },
    { x: 3510, y: GROUND_Y - 78, width: 350 },
  ],
  props: [
    { key: "beach_boards", x: 374, y: GROUND_Y - 62, scale: 1, depth: 7 },
    { key: "beach_chair", x: 780, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "beach_boards", x: 1480, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "beach_chair", x: 2135, y: GROUND_Y - 134, scale: 1, depth: 7 },
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
  platformArt: "/game/backgrounds/tampa/platform.webp",
  platforms: [
    { x: 510, y: GROUND_Y - 72, width: 344 },
    { x: 1815, y: GROUND_Y - 68, width: 250 },
    { x: 2110, y: GROUND_Y - 132, width: 284 },
    { x: 3340, y: GROUND_Y - 82, width: 330 },
  ],
  props: [
    { key: "ybor_lamp", x: 372, y: GROUND_Y - 72, scale: 1, depth: 7 },
    { key: "ybor_crate", x: 830, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "ybor_lamp", x: 1510, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "ybor_crate", x: 2200, y: GROUND_Y - 132, scale: 1, depth: 7 },
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
  platformArt: "/game/backgrounds/palm-beach/platform.webp",
  platforms: [
    { x: 490, y: GROUND_Y - 58, width: 280 },
    { x: 1520, y: GROUND_Y - 70, width: 300 },
    { x: 1820, y: GROUND_Y - 126, width: 260 },
    { x: 3370, y: GROUND_Y - 64, width: 340 },
  ],
  props: [
    { key: "worth_urn", x: 378, y: GROUND_Y - 58, scale: 1, depth: 7 },
    { key: "worth_fountain", x: 840, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "worth_urn", x: 1500, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "worth_fountain", x: 1860, y: GROUND_Y - 126, scale: 1, depth: 7 },
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
  platformArt: "/game/backgrounds/miami/platform.webp",
  platforms: [
    { x: 492, y: GROUND_Y - 68, width: 312 },
    { x: 1950, y: GROUND_Y - 74, width: 250 },
    { x: 2220, y: GROUND_Y - 138, width: 228 },
    { x: 3450, y: GROUND_Y - 80, width: 314 },
  ],
  props: [
    { key: "wynwood_hydrant_new", x: 306, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "wynwood_paint", x: 810, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "wynwood_hydrant_new", x: 1480, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "wynwood_paint", x: 2298, y: GROUND_Y - 138, scale: 1, depth: 7 },
    { key: "wynwood_hydrant_new", x: 2990, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "wynwood_paint", x: 3980, y: GROUND_Y + 2, scale: 1, depth: 7 },
  ],
  enemies: [
    { id: "blade", x: 740 },
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
  platformArt: "/game/backgrounds/miami-beach/platform.webp",
  platforms: [
    { x: 510, y: GROUND_Y - 58, width: 340 },
    { x: 2140, y: GROUND_Y - 64, width: 310 },
    { x: 2470, y: GROUND_Y - 120, width: 280 },
    { x: 3480, y: GROUND_Y - 72, width: 338 },
  ],
  props: [
    { key: "ocean_bollard", x: 378, y: GROUND_Y - 58, scale: 1, depth: 7 },
    { key: "ocean_planter", x: 810, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "ocean_bollard", x: 1510, y: GROUND_Y + 2, scale: 1, depth: 7 },
    { key: "ocean_planter", x: 2560, y: GROUND_Y - 120, scale: 1, depth: 7 },
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
