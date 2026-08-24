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
    sky: string;
    far: string;
    mid: string;
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
  tagline: "Las Olas luxury marina and sunlit oceanfront boardwalk.",
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
    { key: "palm", x: 360, y: GROUND_Y + 8, scale: 1.35, depth: 8 },
    { key: "palm", x: 700, y: GROUND_Y + 8, scale: 1.15, flipX: true, depth: 6 },
    { key: "tower", x: 1080, y: GROUND_Y + 6, scale: 1.2, depth: 7 },
    { key: "palm", x: 1680, y: GROUND_Y + 8, scale: 1.4, depth: 8 },
    { key: "palm", x: 2420, y: GROUND_Y + 8, scale: 1.3, depth: 8 },
    { key: "tower", x: 3280, y: GROUND_Y + 6, scale: 1.15, depth: 7 },
    { key: "palm", x: 4160, y: GROUND_Y + 8, scale: 1.25, flipX: true, depth: 6 },
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
    sky: "/game/backgrounds/fort-lauderdale/far.jpg",
    far: "/game/backgrounds/fort-lauderdale/far.jpg",
    mid: "/game/backgrounds/fort-lauderdale/far.jpg",
    ground: "/game/backgrounds/fort-lauderdale/ground.jpg",
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
    { key: "palm", x: 420, y: GROUND_Y + 8, scale: 1.2, depth: 7 },
    { key: "tower", x: 1200, y: GROUND_Y + 6, scale: 1.3, depth: 8 },
    { key: "palm", x: 1890, y: GROUND_Y + 8, scale: 1.15, flipX: true, depth: 6 },
    { key: "tower", x: 2600, y: GROUND_Y + 6, scale: 1.25, depth: 7 },
    { key: "palm", x: 3450, y: GROUND_Y + 8, scale: 1.35, depth: 8 },
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
    sky: "/game/backgrounds/tampa/far.jpg",
    far: "/game/backgrounds/tampa/far.jpg",
    mid: "/game/backgrounds/tampa/far.jpg",
    ground: "/game/backgrounds/fort-lauderdale/ground.jpg",
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
    { key: "palm", x: 380, y: GROUND_Y + 8, scale: 1.45, depth: 8 },
    { key: "palm", x: 890, y: GROUND_Y + 8, scale: 1.3, flipX: true, depth: 6 },
    { key: "tower", x: 1650, y: GROUND_Y + 6, scale: 1.2, depth: 7 },
    { key: "palm", x: 2500, y: GROUND_Y + 8, scale: 1.4, depth: 8 },
    { key: "palm", x: 3380, y: GROUND_Y + 8, scale: 1.35, flipX: true, depth: 6 },
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
    sky: "/game/backgrounds/palm-beach/far.jpg",
    far: "/game/backgrounds/palm-beach/far.jpg",
    mid: "/game/backgrounds/palm-beach/far.jpg",
    ground: "/game/backgrounds/fort-lauderdale/ground.jpg",
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
    { key: "palm", x: 500, y: GROUND_Y + 8, scale: 1.25, depth: 7 },
    { key: "tower", x: 1300, y: GROUND_Y + 6, scale: 1.35, depth: 8 },
    { key: "palm", x: 2100, y: GROUND_Y + 8, scale: 1.15, flipX: true, depth: 6 },
    { key: "tower", x: 2850, y: GROUND_Y + 6, scale: 1.3, depth: 7 },
    { key: "palm", x: 3700, y: GROUND_Y + 8, scale: 1.4, depth: 8 },
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
    sky: "/game/backgrounds/miami/far.jpg",
    far: "/game/backgrounds/miami/far.jpg",
    mid: "/game/backgrounds/miami/far.jpg",
    ground: "/game/backgrounds/fort-lauderdale/ground.jpg",
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
    { key: "palm", x: 350, y: GROUND_Y + 8, scale: 1.4, depth: 8 },
    { key: "tower", x: 950, y: GROUND_Y + 6, scale: 1.25, depth: 7 },
    { key: "palm", x: 1650, y: GROUND_Y + 8, scale: 1.3, flipX: true, depth: 6 },
    { key: "tower", x: 2450, y: GROUND_Y + 6, scale: 1.2, depth: 7 },
    { key: "palm", x: 3200, y: GROUND_Y + 8, scale: 1.45, depth: 8 },
  ],
  enemies: [
    { id: "bruiser", x: 620 },
    { id: "blade", x: 1100 },
    { id: "bruiser", x: 1680 },
    { id: "blade", x: 2250 },
    { id: "bruiser", x: 2900 },
    { id: "boss", x: 3800 }, // Syndicate Kingpin Boss at stage end!
  ],
  boss: {
    id: "boss",
    name: "Syndicate Kingpin",
    spawnX: 3800,
  },
  parallax: {
    sky: "/game/backgrounds/miami-beach/far.jpg",
    far: "/game/backgrounds/miami-beach/far.jpg",
    mid: "/game/backgrounds/miami-beach/far.jpg",
    ground: "/game/backgrounds/fort-lauderdale/ground.jpg",
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
