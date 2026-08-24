import sharp from "sharp";
import fs from "fs";
import path from "path";

/**
 * South Florida Fighter — High Quality Enemy Sprite Sheet Generator
 * Generates true transparent, high-res 16-bit arcade pixel-art spritesheets
 * for Boardwalk Bruiser, Ybor Blade, and Syndicate Boss.
 */

const OUT_DIR = path.resolve("public/game/sprites/enemies");

async function renderSheet(destPath, width, height, framesSvg) {
  const fullSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Common Filters & Glows -->
      <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="bossGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Gradients -->
      <linearGradient id="bruiserSkin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#b36b44" />
        <stop offset="100%" stop-color="#784224" />
      </linearGradient>
      <linearGradient id="bruiserVest" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#e53e3e" />
        <stop offset="100%" stop-color="#741212" />
      </linearGradient>
      <linearGradient id="bladeSkin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#d69e76" />
        <stop offset="100%" stop-color="#915934" />
      </linearGradient>
      <linearGradient id="bladeJacket" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1a202c" />
        <stop offset="100%" stop-color="#0d1117" />
      </linearGradient>
      <linearGradient id="bladeCyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00f0ff" />
        <stop offset="100%" stop-color="#ffffff" />
      </linearGradient>
      <linearGradient id="bossSuit" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="60%" stop-color="#e2e8f0" />
        <stop offset="100%" stop-color="#cbd5e0" />
      </linearGradient>
      <linearGradient id="bossAura" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#d53f8c" />
        <stop offset="50%" stop-color="#805ad5" />
        <stop offset="100%" stop-color="#44337a" />
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffe600" />
        <stop offset="100%" stop-color="#c49a16" />
      </linearGradient>
    </defs>
    ${framesSvg}
  </svg>
  `;

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  await sharp(Buffer.from(fullSvg))
    .png()
    .toFile(destPath);
  console.log(`✓ Rendered: ${destPath} (${width}x${height})`);
}

// =========================================================================
// 1. BOARDWALK BRUISER (Heavyweight Brawler Thug) - 160x180 per frame (640x180)
// =========================================================================

function bruiserHead(cx, cy, expr = "neutral") {
  return `
    <!-- Head & Jaw -->
    <rect x="${cx - 16}" y="${cy - 22}" width="32" height="30" rx="6" fill="url(#bruiserSkin)" stroke="#1a0c03" stroke-width="2.5" />
    <!-- Buzzcut Hair -->
    <path d="M${cx - 16},${cy - 12} Q${cx},${cy - 26} M${cx - 16},${cy - 22} L${cx + 16},${cy - 22} L${cx + 16},${cy - 12} Z" fill="#111" />
    <!-- Facial Scar -->
    <line x1="${cx + 2}" y1="${cy - 16}" x2="${cx + 8}" y2="${cy - 6}" stroke="#ff4d4d" stroke-width="2" />
    <!-- Eyes / Brow -->
    <rect x="${cx - 12}" y="${cy - 10}" width="8" height="3" fill="#ff1a1a" />
    <rect x="${cx + 4}" y="${cy - 10}" width="8" height="3" fill="#ff1a1a" />
    <!-- Grimace / Mouth -->
    <rect x="${cx - 8}" y="${cy + 2}" width="16" height="${expr === "hurt" ? 8 : 4}" fill="${expr === "hurt" ? "#3a0505" : "#1a0505"}" stroke="#000" stroke-width="1" />
  `;
}

function bruiserTorso(cx, cy, bobY = 0) {
  return `
    <!-- Muscular Torso -->
    <polygon points="${cx - 30},${cy - 10} ${cx + 30},${cy - 10} ${cx + 22},${cy + 40} ${cx - 22},${cy + 40}" fill="url(#bruiserVest)" stroke="#1a0000" stroke-width="3" />
    <!-- Exposed Chest & Abs -->
    <polygon points="${cx - 12},${cy - 10} ${cx + 12},${cy - 10} ${cx + 6},${cy + 24} ${cx - 6},${cy + 24}" fill="url(#bruiserSkin)" stroke="#1a0c03" stroke-width="1.5" />
    <!-- Gold Chain -->
    <path d="M${cx - 16},${cy - 8} Q${cx},${cy + 16} ${cx + 16},${cy - 8}" fill="none" stroke="url(#gold)" stroke-width="3" />
    <!-- Belt & Heavy Buckle -->
    <rect x="${cx - 22}" y="${cy + 38}" width="44" height="8" fill="#1a1a1a" stroke="#000" stroke-width="1.5" />
    <rect x="${cx - 6}" y="${cy + 36}" width="12" height="12" fill="url(#gold)" stroke="#000" stroke-width="1.5" />
  `;
}

function generateBruiserSheets() {
  const fw = 160;
  const fh = 180;
  const bdir = path.join(OUT_DIR, "bruiser");

  // Idle (4 Frames)
  const idleSvg = [0, 1, 2, 3].map((f) => {
    const ox = f * fw;
    const cx = ox + 80;
    const cy = 60 + (f % 2 === 1 ? 2 : 0);
    const armBob = f === 2 ? -3 : 0;
    return `
      <g>
        <!-- Shadow -->
        <ellipse cx="${cx}" cy="172" rx="34" ry="7" fill="#000" opacity="0.35" />
        <!-- Legs -->
        <rect x="${cx - 20}" y="106" width="16" height="62" fill="#1f2937" stroke="#000" stroke-width="2.5" />
        <rect x="${cx + 4}" y="106" width="16" height="62" fill="#1f2937" stroke="#000" stroke-width="2.5" />
        <rect x="${cx - 24}" y="162" width="22" height="12" rx="3" fill="#111827" stroke="#000" stroke-width="2" />
        <rect x="${cx + 2}" y="162" width="22" height="12" rx="3" fill="#111827" stroke="#000" stroke-width="2" />
        <!-- Body -->
        ${bruiserTorso(cx, cy)}
        ${bruiserHead(cx, cy - 8)}
        <!-- Left Guard Arm & Brass Fist -->
        <rect x="${cx - 36}" y="${cy + 6 + armBob}" width="14" height="28" rx="4" fill="url(#bruiserSkin)" stroke="#000" stroke-width="2" />
        <rect x="${cx - 40}" y="${cy + 28 + armBob}" width="18" height="18" rx="4" fill="#374151" stroke="#000" stroke-width="2" />
        <line x1="${cx - 40}" y1="${cy + 34 + armBob}" x2="${cx - 22}" y2="${cy + 34 + armBob}" stroke="url(#gold)" stroke-width="3" />
        <!-- Right Guard Arm & Brass Fist -->
        <rect x="${cx + 22}" y="${cy + 4 + armBob}" width="14" height="28" rx="4" fill="url(#bruiserSkin)" stroke="#000" stroke-width="2" />
        <rect x="${cx + 22}" y="${cy + 26 + armBob}" width="18" height="18" rx="4" fill="#374151" stroke="#000" stroke-width="2" />
        <line x1="${cx + 22}" y1="${cy + 32 + armBob}" x2="${cx + 40}" y2="${cy + 32 + armBob}" stroke="url(#gold)" stroke-width="3" />
      </g>
    `;
  }).join("\n");

  // Run (4 Frames)
  const runSvg = [0, 1, 2, 3].map((f) => {
    const ox = f * fw;
    const cx = ox + 80;
    const cy = 60 + (f % 2 === 0 ? 3 : 0);
    const legOffset = (f === 0 || f === 1) ? 14 : -14;
    return `
      <g>
        <ellipse cx="${cx}" cy="172" rx="36" ry="7" fill="#000" opacity="0.35" />
        <!-- Moving Legs -->
        <polygon points="${cx - 16 + legOffset},106 ${cx - 2 + legOffset},106 ${cx - 18 - legOffset},164 ${cx - 32 - legOffset},164" fill="#1f2937" stroke="#000" stroke-width="2.5" />
        <polygon points="${cx + 2 - legOffset},106 ${cx + 16 - legOffset},106 ${cx + 18 + legOffset},164 ${cx + 4 + legOffset},164" fill="#1f2937" stroke="#000" stroke-width="2.5" />
        <rect x="${cx - 34 - legOffset}" y="160" width="22" height="14" rx="3" fill="#111827" stroke="#000" stroke-width="2" />
        <rect x="${cx + 2 + legOffset}" y="160" width="22" height="14" rx="3" fill="#111827" stroke="#000" stroke-width="2" />
        <!-- Body Leaning Forward -->
        ${bruiserTorso(cx - 6, cy)}
        ${bruiserHead(cx - 6, cy - 8)}
        <!-- Swinging Arms -->
        <rect x="${cx - 38 - legOffset * 0.8}" y="${cy + 10}" width="16" height="26" rx="4" fill="url(#bruiserSkin)" stroke="#000" stroke-width="2" />
        <rect x="${cx + 22 + legOffset * 0.8}" y="${cy + 10}" width="16" height="26" rx="4" fill="url(#bruiserSkin)" stroke="#000" stroke-width="2" />
      </g>
    `;
  }).join("\n");

  // Attack (4 Frames: Windup -> Strike -> Punch Contact -> Recovery)
  const attackSvg = [0, 1, 2, 3].map((f) => {
    const ox = f * fw;
    const cx = ox + 80;
    const cy = 60;
    if (f === 0) {
      // Windup
      return `
        <g>
          <ellipse cx="${cx}" cy="172" rx="34" ry="7" fill="#000" opacity="0.35" />
          <rect x="${cx - 18}" y="106" width="16" height="62" fill="#1f2937" stroke="#000" stroke-width="2.5" />
          <rect x="${cx + 6}" y="106" width="16" height="62" fill="#1f2937" stroke="#000" stroke-width="2.5" />
          ${bruiserTorso(cx + 8, cy)}
          ${bruiserHead(cx + 8, cy - 8)}
          <!-- Heavy Cocked Back Fist -->
          <rect x="${cx + 34}" y="${cy - 4}" width="26" height="26" rx="6" fill="#374151" stroke="#000" stroke-width="2.5" filter="url(#neonGlow)" />
          <line x1="${cx + 34}" y1="${cy + 6}" x2="${cx + 60}" y2="${cy + 6}" stroke="#e53e3e" stroke-width="4" />
        </g>
      `;
    } else if (f === 1 || f === 2) {
      // Impact Punch
      return `
        <g>
          <ellipse cx="${cx - 12}" cy="172" rx="38" ry="7" fill="#000" opacity="0.35" />
          <polygon points="${cx - 28},106 ${cx - 12},106 ${cx - 36},164 ${cx - 52},164" fill="#1f2937" stroke="#000" stroke-width="2.5" />
          <polygon points="${cx + 2},106 ${cx + 18},106 ${cx + 24},164 ${cx + 8},164" fill="#1f2937" stroke="#000" stroke-width="2.5" />
          ${bruiserTorso(cx - 14, cy)}
          ${bruiserHead(cx - 14, cy - 8)}
          <!-- Devastating Haymaker Extended Punch -->
          <rect x="${cx - 68}" y="${cy + 6}" width="54" height="20" rx="4" fill="url(#bruiserSkin)" stroke="#000" stroke-width="2" />
          <rect x="${cx - 78}" y="${cy}" width="32" height="32" rx="8" fill="#e53e3e" stroke="#000" stroke-width="3" filter="url(#neonGlow)" />
          <!-- Impact Sparks & Shocklines -->
          <g stroke="#ffe600" stroke-width="3" filter="url(#neonGlow)">
            <line x1="${cx - 78}" y1="${cy + 16}" x2="${cx - 96}" y2="${cy + 8}" />
            <line x1="${cx - 78}" y1="${cy + 16}" x2="${cx - 96}" y2="${cy + 24}" />
            <line x1="${cx - 78}" y1="${cy + 16}" x2="${cx - 92}" y2="${cy + 36}" />
          </g>
        </g>
      `;
    } else {
      // Recovery
      return `
        <g>
          <ellipse cx="${cx}" cy="172" rx="34" ry="7" fill="#000" opacity="0.35" />
          <rect x="${cx - 18}" y="106" width="16" height="62" fill="#1f2937" stroke="#000" stroke-width="2.5" />
          <rect x="${cx + 6}" y="106" width="16" height="62" fill="#1f2937" stroke="#000" stroke-width="2.5" />
          ${bruiserTorso(cx - 4, cy)}
          ${bruiserHead(cx - 4, cy - 8)}
          <rect x="${cx - 36}" y="${cy + 12}" width="16" height="26" rx="4" fill="url(#bruiserSkin)" stroke="#000" stroke-width="2" />
        </g>
      `;
    }
  }).join("\n");

  // Hurt (4 Frames: Head Snap -> Stagger -> Recoil -> Reset)
  const hurtSvg = [0, 1, 2, 3].map((f) => {
    const ox = f * fw;
    const cx = ox + 80;
    const cy = 60;
    const recoilX = f === 1 ? 16 : f === 2 ? 10 : 4;
    return `
      <g>
        <ellipse cx="${cx + recoilX}" cy="172" rx="34" ry="7" fill="#000" opacity="0.35" />
        <polygon points="${cx - 18 + recoilX},106 ${cx - 2 + recoilX},106 ${cx - 12},164 ${cx - 28},164" fill="#1f2937" stroke="#000" stroke-width="2.5" />
        <polygon points="${cx + 6 + recoilX},106 ${cx + 22 + recoilX},106 ${cx + 26},164 ${cx + 10},164" fill="#1f2937" stroke="#000" stroke-width="2.5" />
        ${bruiserTorso(cx + recoilX, cy + 4)}
        ${bruiserHead(cx + recoilX + 6, cy - 4, "hurt")}
        <!-- Flailing Arms -->
        <rect x="${cx + recoilX + 28}" y="${cy + 6}" width="16" height="26" rx="4" fill="url(#bruiserSkin)" stroke="#000" stroke-width="2" />
        <rect x="${cx + recoilX - 38}" y="${cy + 18}" width="16" height="26" rx="4" fill="url(#bruiserSkin)" stroke="#000" stroke-width="2" />
      </g>
    `;
  }).join("\n");

  return [
    renderSheet(path.join(bdir, "idle.png"), 640, 180, idleSvg),
    renderSheet(path.join(bdir, "run.png"), 640, 180, runSvg),
    renderSheet(path.join(bdir, "attack.png"), 640, 180, attackSvg),
    renderSheet(path.join(bdir, "hurt.png"), 640, 180, hurtSvg),
  ];
}

// =========================================================================
// 2. YBOR BLADE (Agile Dual-Blade Assassin) - 160x180 per frame (640x180)
// =========================================================================

function bladeHead(cx, cy, expr = "neutral") {
  return `
    <!-- Masked Ninja Head -->
    <rect x="${cx - 13}" y="${cy - 20}" width="26" height="26" rx="5" fill="#111827" stroke="#000" stroke-width="2.5" />
    <path d="M${cx - 13},${cy - 8} L${cx + 13},${cy - 8} L${cx},${cy + 10} Z" fill="#1f2937" stroke="#000" stroke-width="1.5" />
    <!-- Glowing Cyan Visor / Eyes -->
    <rect x="${cx - 10}" y="${cy - 12}" width="20" height="4" rx="2" fill="#00f0ff" filter="url(#neonGlow)" />
  `;
}

function bladeTorso(cx, cy) {
  return `
    <!-- Lean Sleek Assassin Jacket -->
    <polygon points="${cx - 20},${cy - 6} ${cx + 20},${cy - 6} ${cx + 14},${cy + 38} ${cx - 14},${cy + 38}" fill="url(#bladeJacket)" stroke="#000" stroke-width="2.5" />
    <!-- Cyan Neon Trim Accents -->
    <line x1="${cx - 16}" y1="${cy}" x2="${cx - 10}" y2="${cy + 34}" stroke="#00f0ff" stroke-width="2.5" />
    <line x1="${cx + 16}" y1="${cy}" x2="${cx + 10}" y2="${cy + 34}" stroke="#00f0ff" stroke-width="2.5" />
    <!-- Belt & Sheath Holster -->
    <rect x="${cx - 15}" y="${cy + 34}" width="30" height="6" fill="#374151" stroke="#000" stroke-width="1.5" />
  `;
}

function generateBladeSheets() {
  const fw = 160;
  const fh = 180;
  const bdir = path.join(OUT_DIR, "blade");

  // Idle (4 Frames)
  const idleSvg = [0, 1, 2, 3].map((f) => {
    const ox = f * fw;
    const cx = ox + 80;
    const cy = 64 + (f % 2 === 1 ? 2 : 0);
    return `
      <g>
        <ellipse cx="${cx}" cy="172" rx="28" ry="6" fill="#000" opacity="0.35" />
        <!-- Legs in low agile stance -->
        <polygon points="${cx - 14},104 ${cx - 2},104 ${cx - 22},166 ${cx - 36},166" fill="#111827" stroke="#000" stroke-width="2" />
        <polygon points="${cx + 2},104 ${cx + 14},104 ${cx + 24},166 ${cx + 10},166" fill="#111827" stroke="#000" stroke-width="2" />
        ${bladeTorso(cx, cy)}
        ${bladeHead(cx, cy - 6)}
        <!-- Dual Glowing Katanas / Blades (Reverse Grip) -->
        <!-- Left Blade -->
        <rect x="${cx - 30}" y="${cy + 6}" width="8" height="24" rx="2" fill="url(#bladeSkin)" stroke="#000" stroke-width="1.5" />
        <polygon points="${cx - 34},${cy + 24} ${cx - 38},${cy + 65} ${cx - 30},${cy + 65}" fill="url(#bladeCyan)" stroke="#00f0ff" stroke-width="1.5" filter="url(#neonGlow)" />
        <!-- Right Blade -->
        <rect x="${cx + 22}" y="${cy + 4}" width="8" height="24" rx="2" fill="url(#bladeSkin)" stroke="#000" stroke-width="1.5" />
        <polygon points="${cx + 26},${cy + 22} ${cx + 30},${cy + 63} ${cx + 22},${cy + 63}" fill="url(#bladeCyan)" stroke="#00f0ff" stroke-width="1.5" filter="url(#neonGlow)" />
      </g>
    `;
  }).join("\n");

  // Run (4 Frames: Fast Ninja Dash Sprint)
  const runSvg = [0, 1, 2, 3].map((f) => {
    const ox = f * fw;
    const cx = ox + 80;
    const cy = 68;
    const legOffset = (f === 0 || f === 1) ? 18 : -18;
    return `
      <g>
        <ellipse cx="${cx - 8}" cy="172" rx="32" ry="6" fill="#000" opacity="0.35" />
        <!-- Aggressive Low Sprint Legs -->
        <polygon points="${cx - 18 + legOffset},102 ${cx - 4 + legOffset},102 ${cx - 32 - legOffset},166 ${cx - 48 - legOffset},166" fill="#111827" stroke="#000" stroke-width="2" />
        <polygon points="${cx + 4 - legOffset},102 ${cx + 18 - legOffset},102 ${cx + 28 + legOffset},166 ${cx + 14 + legOffset},166" fill="#111827" stroke="#000" stroke-width="2" />
        ${bladeTorso(cx - 12, cy)}
        ${bladeHead(cx - 14, cy - 6)}
        <!-- Blades Trailing in Sprint -->
        <polygon points="${cx + 18},${cy + 8} ${cx + 65},${cy - 12} ${cx + 60},${cy - 18}" fill="url(#bladeCyan)" stroke="#00f0ff" stroke-width="2" filter="url(#neonGlow)" />
      </g>
    `;
  }).join("\n");

  // Attack (4 Frames: Coil -> Double Cross-Slash -> Impact -> Flourish)
  const attackSvg = [0, 1, 2, 3].map((f) => {
    const ox = f * fw;
    const cx = ox + 80;
    const cy = 64;
    if (f === 0) {
      // Coil
      return `
        <g>
          <ellipse cx="${cx}" cy="172" rx="28" ry="6" fill="#000" opacity="0.35" />
          <polygon points="${cx - 16},104 ${cx},104 ${cx - 24},166 ${cx - 38},166" fill="#111827" stroke="#000" stroke-width="2" />
          <polygon points="${cx + 4},104 ${cx + 20},104 ${cx + 18},166 ${cx + 4},166" fill="#111827" stroke="#000" stroke-width="2" />
          ${bladeTorso(cx, cy)}
          ${bladeHead(cx, cy - 6)}
          <!-- Crossed Blades Ready -->
          <line x1="${cx - 26}" y1="${cy - 8}" x2="${cx + 18}" y2="${cy + 34}" stroke="#00f0ff" stroke-width="4" filter="url(#neonGlow)" />
          <line x1="${cx + 26}" y1="${cy - 8}" x2="${cx - 18}" y2="${cy + 34}" stroke="#00f0ff" stroke-width="4" filter="url(#neonGlow)" />
        </g>
      `;
    } else if (f === 1 || f === 2) {
      // Double Cross X-Slash Impact
      return `
        <g>
          <ellipse cx="${cx - 18}" cy="172" rx="36" ry="6" fill="#000" opacity="0.35" />
          <polygon points="${cx - 28},104 ${cx - 12},104 ${cx - 48},166 ${cx - 64},166" fill="#111827" stroke="#000" stroke-width="2" />
          <polygon points="${cx - 2},104 ${cx + 14},104 ${cx + 18},166 ${cx + 4},166" fill="#111827" stroke="#000" stroke-width="2" />
          ${bladeTorso(cx - 18, cy)}
          ${bladeHead(cx - 20, cy - 6)}
          <!-- Giant Cyan Plasma X-Slash Arcs -->
          <g filter="url(#neonGlow)">
            <path d="M${cx - 85},${cy - 25} L${cx - 15},${cy + 45}" stroke="#00f0ff" stroke-width="6" />
            <path d="M${cx - 85},${cy + 45} L${cx - 15},${cy - 25}" stroke="#00f0ff" stroke-width="6" />
            <path d="M${cx - 75},${cy - 20} L${cx - 25},${cy + 40}" stroke="#ffffff" stroke-width="2.5" />
            <path d="M${cx - 75},${cy + 40} L${cx - 25},${cy - 20}" stroke="#ffffff" stroke-width="2.5" />
          </g>
        </g>
      `;
    } else {
      // Flourish Recovery
      return `
        <g>
          <ellipse cx="${cx}" cy="172" rx="28" ry="6" fill="#000" opacity="0.35" />
          <polygon points="${cx - 14},104 ${cx - 2},104 ${cx - 22},166 ${cx - 36},166" fill="#111827" stroke="#000" stroke-width="2" />
          <polygon points="${cx + 2},104 ${cx + 14},104 ${cx + 24},166 ${cx + 10},166" fill="#111827" stroke="#000" stroke-width="2" />
          ${bladeTorso(cx - 4, cy)}
          ${bladeHead(cx - 4, cy - 6)}
          <polygon points="${cx - 34},${cy + 18} ${cx - 42},${cy + 55} ${cx - 32},${cy + 55}" fill="url(#bladeCyan)" stroke="#00f0ff" stroke-width="1.5" />
        </g>
      `;
    }
  }).join("\n");

  // Hurt (4 Frames: Stagger recoil)
  const hurtSvg = [0, 1, 2, 3].map((f) => {
    const ox = f * fw;
    const cx = ox + 80;
    const cy = 64;
    const recoilX = f === 1 ? 18 : f === 2 ? 10 : 4;
    return `
      <g>
        <ellipse cx="${cx + recoilX}" cy="172" rx="28" ry="6" fill="#000" opacity="0.35" />
        <polygon points="${cx - 14 + recoilX},104 ${cx - 2 + recoilX},104 ${cx - 18},166 ${cx - 32},166" fill="#111827" stroke="#000" stroke-width="2" />
        <polygon points="${cx + 2 + recoilX},104 ${cx + 14 + recoilX},104 ${cx + 26},166 ${cx + 12},166" fill="#111827" stroke="#000" stroke-width="2" />
        ${bladeTorso(cx + recoilX, cy + 4)}
        ${bladeHead(cx + recoilX + 4, cy - 4, "hurt")}
        <!-- Blades flung backward -->
        <polygon points="${cx + recoilX + 24},${cy + 12} ${cx + recoilX + 55},${cy - 12} ${cx + recoilX + 48},${cy - 18}" fill="url(#bladeCyan)" stroke="#00f0ff" stroke-width="1.5" />
      </g>
    `;
  }).join("\n");

  return [
    renderSheet(path.join(bdir, "idle.png"), 640, 180, idleSvg),
    renderSheet(path.join(bdir, "run.png"), 640, 180, runSvg),
    renderSheet(path.join(bdir, "attack.png"), 640, 180, attackSvg),
    renderSheet(path.join(bdir, "hurt.png"), 640, 180, hurtSvg),
  ];
}

// =========================================================================
// 3. SYNDICATE BOSS (Miami Beach Kingpin) - 180x200 per frame (720x200)
// =========================================================================

function bossHead(cx, cy, expr = "neutral") {
  return `
    <!-- Crime Boss Head & Jaw -->
    <rect x="${cx - 18}" y="${cy - 24}" width="36" height="32" rx="6" fill="#d69e76" stroke="#221105" stroke-width="2.5" />
    <!-- Slick Back Hair -->
    <path d="M${cx - 18},${cy - 16} Q${cx},${cy - 30} ${cx + 18},${cy - 16} L${cx + 18},${cy - 26} L${cx - 18},${cy - 26} Z" fill="#111" stroke="#000" stroke-width="1.5" />
    <!-- Dark Sunglasses -->
    <polygon points="${cx - 16},${cy - 12} ${cx - 2},${cy - 12} ${cx - 4},${cy - 4} ${cx - 14},${cy - 4}" fill="#0a0a0a" stroke="#d53f8c" stroke-width="1.5" />
    <polygon points="${cx + 2},${cy - 12} ${cx + 16},${cy - 12} ${cx + 14},${cy - 4} ${cx + 4},${cy - 4}" fill="#0a0a0a" stroke="#d53f8c" stroke-width="1.5" />
    <!-- Gold Medallion Gleam -->
    <circle cx="${cx}" cy="${cy + 14}" r="5" fill="url(#gold)" stroke="#000" stroke-width="1.5" />
  `;
}

function bossTorso(cx, cy) {
  return `
    <!-- White Double-Breasted Pinstripe Suit Coat -->
    <polygon points="${cx - 36},${cy - 10} ${cx + 36},${cy - 10} ${cx + 30},${cy + 52} ${cx - 30},${cy + 52}" fill="url(#bossSuit)" stroke="#1a202c" stroke-width="3" />
    <!-- Magenta Silk Shirt -->
    <polygon points="${cx - 12},${cy - 10} ${cx + 12},${cy - 10} ${cx},${cy + 22}" fill="#d53f8c" stroke="#521b41" stroke-width="1.5" />
    <!-- Double Breasted Gold Buttons -->
    <circle cx="${cx - 12}" cy="${cy + 16}" r="3" fill="url(#gold)" />
    <circle cx="${cx + 12}" cy="${cy + 16}" r="3" fill="url(#gold)" />
    <circle cx="${cx - 10}" cy="${cy + 32}" r="3" fill="url(#gold)" />
    <circle cx="${cx + 10}" cy="${cy + 32}" r="3" fill="url(#gold)" />
  `;
}

function generateBossSheets() {
  const fw = 180;
  const fh = 200;
  const bdir = path.join(OUT_DIR, "boss");

  // Idle (4 Frames: Imposing breathing with glowing cane)
  const idleSvg = [0, 1, 2, 3].map((f) => {
    const ox = f * fw;
    const cx = ox + 90;
    const cy = 68 + (f % 2 === 1 ? 2 : 0);
    const orbGlow = f === 2 ? 10 : 6;
    return `
      <g>
        <!-- Boss Purple Aura -->
        <ellipse cx="${cx}" cy="186" rx="44" ry="9" fill="url(#bossAura)" opacity="0.4" filter="url(#bossGlow)" />
        <!-- White Slacks & Dress Shoes -->
        <rect x="${cx - 24}" y="120" width="20" height="66" fill="#f7fafc" stroke="#1a202c" stroke-width="2.5" />
        <rect x="${cx + 4}" y="120" width="20" height="66" fill="#f7fafc" stroke="#1a202c" stroke-width="2.5" />
        <rect x="${cx - 28}" y="180" width="26" height="12" rx="3" fill="#1a202c" stroke="#000" stroke-width="2" />
        <rect x="${cx + 2}" y="180" width="26" height="12" rx="3" fill="#1a202c" stroke="#000" stroke-width="2" />
        ${bossTorso(cx, cy)}
        ${bossHead(cx, cy - 8)}
        <!-- Heavy Gold Cane -->
        <rect x="${cx - 48}" y="${cy + 8}" width="6" height="114" fill="url(#gold)" stroke="#744210" stroke-width="1.5" />
        <!-- Glowing Lion Head / Purple Plasma Orb -->
        <circle cx="${cx - 45}" cy="${cy + 6}" r="${orbGlow}" fill="#d53f8c" stroke="#ffe600" stroke-width="2" filter="url(#bossGlow)" />
      </g>
    `;
  }).join("\n");

  // Run (4 Frames: Deliberate Menacing Stalk)
  const runSvg = [0, 1, 2, 3].map((f) => {
    const ox = f * fw;
    const cx = ox + 90;
    const cy = 68;
    const legOffset = (f === 0 || f === 1) ? 14 : -14;
    return `
      <g>
        <ellipse cx="${cx}" cy="186" rx="44" ry="9" fill="url(#bossAura)" opacity="0.4" filter="url(#bossGlow)" />
        <polygon points="${cx - 20 + legOffset},120 ${cx - 4 + legOffset},120 ${cx - 24 - legOffset},186 ${cx - 40 - legOffset},186" fill="#f7fafc" stroke="#1a202c" stroke-width="2.5" />
        <polygon points="${cx + 4 - legOffset},120 ${cx + 20 - legOffset},120 ${cx + 26 + legOffset},186 ${cx + 10 + legOffset},186" fill="#f7fafc" stroke="#1a202c" stroke-width="2.5" />
        ${bossTorso(cx - 4, cy)}
        ${bossHead(cx - 4, cy - 8)}
        <rect x="${cx - 44 - legOffset * 0.5}" y="${cy + 8}" width="6" height="114" fill="url(#gold)" stroke="#744210" stroke-width="1.5" />
        <circle cx="${cx - 41 - legOffset * 0.5}" cy="${cy + 6}" r="7" fill="#d53f8c" stroke="#ffe600" stroke-width="2" filter="url(#bossGlow)" />
      </g>
    `;
  }).join("\n");

  // Attack (4 Frames: Overhead Cane Slam Shockwave)
  const attackSvg = [0, 1, 2, 3].map((f) => {
    const ox = f * fw;
    const cx = ox + 90;
    const cy = 68;
    if (f === 0) {
      // Overhead Charge
      return `
        <g>
          <ellipse cx="${cx}" cy="186" rx="44" ry="9" fill="url(#bossAura)" opacity="0.4" filter="url(#bossGlow)" />
          <rect x="${cx - 22}" y="120" width="20" height="66" fill="#f7fafc" stroke="#1a202c" stroke-width="2.5" />
          <rect x="${cx + 6}" y="120" width="20" height="66" fill="#f7fafc" stroke="#1a202c" stroke-width="2.5" />
          ${bossTorso(cx, cy)}
          ${bossHead(cx, cy - 8)}
          <!-- Cane Raised Overhead Charging -->
          <g filter="url(#bossGlow)">
            <rect x="${cx - 18}" y="${cy - 65}" width="8" height="95" transform="rotate(-35, ${cx - 18}, ${cy - 65})" fill="url(#gold)" stroke="#744210" stroke-width="2" />
            <circle cx="${cx - 42}" cy="${cy - 70}" r="16" fill="#d53f8c" stroke="#ffe600" stroke-width="3" />
          </g>
        </g>
      `;
    } else if (f === 1 || f === 2) {
      // Seismic Cane Slam into Floor
      return `
        <g>
          <ellipse cx="${cx - 20}" cy="186" rx="50" ry="10" fill="url(#bossAura)" opacity="0.6" filter="url(#bossGlow)" />
          <polygon points="${cx - 30},120 ${cx - 12},120 ${cx - 45},186 ${cx - 62},186" fill="#f7fafc" stroke="#1a202c" stroke-width="2.5" />
          <polygon points="${cx + 2},120 ${cx + 20},120 ${cx + 28},186 ${cx + 10},186" fill="#f7fafc" stroke="#1a202c" stroke-width="2.5" />
          ${bossTorso(cx - 16, cy + 8)}
          ${bossHead(cx - 16, cy)}
          <!-- Cane Slammed Down -->
          <rect x="${cx - 68}" y="${cy + 18}" width="8" height="110" fill="url(#gold)" stroke="#744210" stroke-width="2" />
          <!-- Massive Shockwave Rings Erupting on Ground -->
          <g stroke="#d53f8c" stroke-width="6" fill="none" filter="url(#bossGlow)">
            <ellipse cx="${cx - 64}" cy="186" rx="35" ry="10" />
            <ellipse cx="${cx - 64}" cy="186" rx="55" ry="14" stroke="#ffe600" stroke-width="4" />
            <path d="M${cx - 95},186 L${cx - 110},160 M${cx - 35},186 L${cx - 20},160" stroke="#00f0ff" stroke-width="3" />
          </g>
        </g>
      `;
    } else {
      // Recovery
      return `
        <g>
          <ellipse cx="${cx}" cy="186" rx="44" ry="9" fill="url(#bossAura)" opacity="0.4" />
          <rect x="${cx - 24}" y="120" width="20" height="66" fill="#f7fafc" stroke="#1a202c" stroke-width="2.5" />
          <rect x="${cx + 4}" y="120" width="20" height="66" fill="#f7fafc" stroke="#1a202c" stroke-width="2.5" />
          ${bossTorso(cx - 6, cy)}
          ${bossHead(cx - 6, cy - 8)}
          <rect x="${cx - 48}" y="${cy + 12}" width="6" height="114" fill="url(#gold)" stroke="#744210" stroke-width="1.5" />
        </g>
      `;
    }
  }).join("\n");

  // Hurt / Rage Phase 2 (4 Frames: Stagger -> Super Armor Rage Activation)
  const hurtSvg = [0, 1, 2, 3].map((f) => {
    const ox = f * fw;
    const cx = ox + 90;
    const cy = 68;
    const recoilX = f === 1 ? 16 : f === 2 ? 8 : 2;
    const isRage = f === 2 || f === 3;
    return `
      <g>
        <!-- Flaring Rage Aura in Phase 2 -->
        <ellipse cx="${cx + recoilX}" cy="186" rx="${isRage ? 54 : 44}" ry="${isRage ? 14 : 9}" fill="${isRage ? "#e53e3e" : "url(#bossAura)"}" opacity="0.6" filter="url(#bossGlow)" />
        <polygon points="${cx - 22 + recoilX},120 ${cx - 6 + recoilX},120 ${cx - 24},186 ${cx - 40},186" fill="#f7fafc" stroke="#1a202c" stroke-width="2.5" />
        <polygon points="${cx + 4 + recoilX},120 ${cx + 20 + recoilX},120 ${cx + 28},186 ${cx + 12},186" fill="#f7fafc" stroke="#1a202c" stroke-width="2.5" />
        ${bossTorso(cx + recoilX, cy + 4)}
        ${bossHead(cx + recoilX + 4, cy - 4, "hurt")}
        <!-- Rage Lightning / Flaring Energy -->
        ${isRage ? `
          <g stroke="#ff0055" stroke-width="3" filter="url(#bossGlow)" fill="none">
            <path d="M${cx - 40},${cy - 20} L${cx - 20},${cy + 20} L${cx - 45},${cy + 40}" />
            <path d="M${cx + 40},${cy - 20} L${cx + 20},${cy + 20} L${cx + 45},${cy + 40}" />
          </g>
        ` : ""}
      </g>
    `;
  }).join("\n");

  return [
    renderSheet(path.join(bdir, "idle.png"), 720, 200, idleSvg),
    renderSheet(path.join(bdir, "run.png"), 720, 200, runSvg),
    renderSheet(path.join(bdir, "attack.png"), 720, 200, attackSvg),
    renderSheet(path.join(bdir, "hurt.png"), 720, 200, hurtSvg),
  ];
}

async function run() {
  console.log("Generating Redesigned High-Quality Enemy Sprites in PNG...");
  await Promise.all([
    ...generateBruiserSheets(),
    ...generateBladeSheets(),
    ...generateBossSheets(),
  ]);
  console.log("All Redesigned Enemy Sprites generated successfully!");
}

run().catch(console.error);
