# Performance update — November 18, 2026

## Verified branch changes

- Retain AUTO/WebGL rendering and requestAnimationFrame scheduling from the original PR.
- Use a non-physics collection for pooled hitboxes/projectiles so adding an object does not reset its configured velocity and gravity.
- Guard delayed release callbacks with the current hit-data identity, remove duplicate projectile expiry, and clear projectile combat data/animation on release.
- Subscribe React HUD and parent bridge to whole KI units; retain fractional energy in simulation. Skip redundant full-energy, FPS, and enemy-count notifications.
- Widen the optional preview generator's viewBox: all 92 frames across 23 sheets have visible content and at least two transparent border pixels. These preview sheets are NOT installed as live game art.
- Upgrade TanStack Start to 1.169.5, above Vercel's reported 1.168.60 fix threshold for its BLOCKED_PACKAGE failure. Handle unknown router errors safely.
- Remove tracked generated Vercel output; builds regenerate it.
- Repair shell argument forwarding and isolate generic branding tests from project artwork. Preserve runtime branding behavior.

## Validation

- TypeScript: pass.
- Unit tests: 145 pass, zero failures (including two pooling regression tests).
- Lint: zero errors, 33 existing warnings.
- Production build: pass; database migration correctly skips without DATABASE_URL.
- Preview raster bounds: 92/92 pass.
- Dev and production browser smoke: attempted, blocked locally by Chromium socket permissions. GitHub Actions workflow added for both desktop and mobile checks.

## Remaining gates

Do not merge until remote browser checks and a successful Vercel preview have been inspected. Real-device mobile FPS has not been measured. No 60 FPS guarantee or measured FPS gain is claimed.

The previous PR description claimed an integrated 119-frame sprite atlas and fixed-step simulation; those changes were absent from the actual branch at c840301. They are not part of this update. Live art remains unchanged; completing the reference-based sprite overhaul and measuring frame pacing remain separate work.
