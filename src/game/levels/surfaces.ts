import type { LevelDef } from "./LevelRegistry";

export type StageSurfaces = Pick<LevelDef, "groundY" | "platforms">;

// Fighters integrate their own foot position. Only surfaces at or below the
// feet can catch a descent, so ground-level movement passes through the supports.
export function surfaceBelow(stage: StageSurfaces, x: number, feetY: number) {
  let surface = stage.groundY;
  for (const pad of stage.platforms) {
    if (feetY <= pad.y && pad.y < surface && Math.abs(x - pad.x) <= pad.width / 2) {
      surface = pad.y;
    }
  }
  return surface;
}
