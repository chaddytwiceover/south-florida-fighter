# South Florida Fighter

The game uses Phaser, React, TypeScript and Vite. Stage definitions are in
src/game/levels and game art lives in public/game. Keep keyboard and touch
controls working through the same gameplay paths.

Use npm ci, then npm run dev. Run npm run typecheck, npm test and npm run build
before shipping. GitHub Actions exercises all five arenas with Playwright on
development and production builds. Vercel serves the static dist directory.
