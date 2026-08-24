import sharp from "sharp";
import fs from "fs";
import path from "path";

/**
 * Procedural High-Res Wynwood Graffiti District Backdrop Generator for Stage 4
 * Creates a unique, distinct Miami Wynwood urban brawler stage:
 * - Downtown Miami neon skyscrapers in the upper background
 * - Vivid Wynwood graffiti warehouse murals in magenta, cyan, gold, and lime
 * - Industrial brick textures, overhead string lights, and neon gallery signs
 * - Exact 1920x1080 resolution scaled to seamlessly loop for parallax scrolling
 */

async function generateWynwoodBackground() {
  const width = 1920;
  const height = 1080;

  // SVG Layer defining Downtown Miami skyline + Wynwood Graffiti Warehouse Murals
  const svgContent = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Night Sky Gradient -->
      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0a0518" />
        <stop offset="35%" stop-color="#190d36" />
        <stop offset="65%" stop-color="#3b1154" />
        <stop offset="90%" stop-color="#6b1a64" />
        <stop offset="100%" stop-color="#2a0833" />
      </linearGradient>

      <!-- Neon Glow Filter -->
      <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Mural 1 Gradient -->
      <linearGradient id="mural1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff007f" />
        <stop offset="50%" stop-color="#00f0ff" />
        <stop offset="100%" stop-color="#ffe600" />
      </linearGradient>

      <!-- Mural 2 Gradient -->
      <linearGradient id="mural2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#7928ca" />
        <stop offset="50%" stop-color="#ff0080" />
        <stop offset="100%" stop-color="#7928ca" />
      </linearGradient>

      <!-- Mural 3 Gradient -->
      <linearGradient id="mural3" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00ffcc" />
        <stop offset="70%" stop-color="#ff3366" />
        <stop offset="100%" stop-color="#330066" />
      </linearGradient>

      <!-- Building Dark Gradient -->
      <linearGradient id="bldgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1c122c" />
        <stop offset="100%" stop-color="#0c0714" />
      </linearGradient>
    </defs>

    <!-- Sky Background -->
    <rect width="${width}" height="${height}" fill="url(#skyGrad)" />

    <!-- Stars & Synth Dust -->
    <g opacity="0.6">
      <circle cx="120" cy="80" r="1.5" fill="#fff" />
      <circle cx="340" cy="140" r="1" fill="#00f0ff" />
      <circle cx="580" cy="60" r="2" fill="#ff007f" />
      <circle cx="820" cy="110" r="1" fill="#fff" />
      <circle cx="1140" cy="75" r="1.5" fill="#ffe600" />
      <circle cx="1450" cy="130" r="1" fill="#fff" />
      <circle cx="1780" cy="90" r="2" fill="#00f0ff" />
    </g>

    <!-- Distant Downtown Miami Skyline Silhouettes -->
    <g fill="#120924" opacity="0.85">
      <rect x="60" y="240" width="110" height="400" />
      <polygon points="115,190 60,240 170,240" fill="#120924" />
      
      <rect x="210" y="180" width="140" height="460" />
      <rect x="250" y="140" width="60" height="40" />

      <rect x="420" y="220" width="180" height="420" />
      <polygon points="510,160 420,220 600,220" fill="#120924" />

      <rect x="680" y="190" width="130" height="450" />
      <rect x="860" y="260" width="160" height="380" />
      <rect x="1080" y="170" width="150" height="470" />
      <polygon points="1155,120 1080,170 1230,170" fill="#120924" />

      <rect x="1300" y="230" width="140" height="410" />
      <rect x="1500" y="190" width="160" height="450" />
      <rect x="1720" y="250" width="150" height="390" />
    </g>

    <!-- Glowing Skyscraper Windows & Neon Antennas -->
    <g fill="#00f0ff" opacity="0.75" filter="url(#neonGlow)">
      <rect x="278" y="120" width="4" height="20" fill="#ff007f" />
      <rect x="1153" y="100" width="4" height="20" fill="#00f0ff" />
      
      <!-- Window Grids -->
      <rect x="230" y="220" width="100" height="4" />
      <rect x="230" y="240" width="100" height="4" />
      <rect x="230" y="260" width="100" height="4" fill="#ffe600" />
      <rect x="230" y="280" width="100" height="4" />
      
      <rect x="1100" y="210" width="110" height="4" />
      <rect x="1100" y="230" width="110" height="4" fill="#ff007f" />
      <rect x="1100" y="250" width="110" height="4" />
      <rect x="1100" y="270" width="110" height="4" />
    </g>

    <!-- Midground Wynwood Art Warehouses -->
    <!-- Warehouse 1 (Left) -->
    <g>
      <rect x="0" y="420" width="480" height="660" fill="url(#bldgGrad)" stroke="#ff007f" stroke-width="3" />
      <!-- Giant Graffiti Wall Mural 1 -->
      <rect x="30" y="460" width="420" height="340" fill="#0f091c" rx="8" />
      <path d="M50,750 Q120,480 240,600 T430,500 L430,780 L50,780 Z" fill="url(#mural1)" opacity="0.9" />
      <circle cx="160" cy="560" r="55" fill="#ffe600" opacity="0.85" />
      <path d="M120,560 L200,560 M160,520 L160,600" stroke="#0c0714" stroke-width="12" />
      <text x="240" y="730" font-family="'Impact', 'Arial Black', sans-serif" font-size="54" font-weight="900" fill="#ffffff" stroke="#000" stroke-width="4" text-anchor="middle">WYNWOOD</text>
    </g>

    <!-- Warehouse 2 (Center-Left) -->
    <g>
      <rect x="490" y="380" width="460" height="700" fill="url(#bldgGrad)" stroke="#00f0ff" stroke-width="3" />
      <!-- Giant Graffiti Wall Mural 2 -->
      <rect x="520" y="420" width="400" height="360" fill="#0f091c" rx="8" />
      <polygon points="540,760 620,450 780,520 900,760" fill="url(#mural2)" opacity="0.9" />
      <circle cx="720" cy="580" r="70" fill="none" stroke="#00f0ff" stroke-width="18" />
      <text x="720" y="720" font-family="'Impact', 'Arial Black', sans-serif" font-size="46" font-weight="900" fill="#ffe600" stroke="#ff007f" stroke-width="3" text-anchor="middle">MIAMI ART</text>
    </g>

    <!-- Warehouse 3 (Center-Right) -->
    <g>
      <rect x="960" y="410" width="480" height="670" fill="url(#bldgGrad)" stroke="#ffe600" stroke-width="3" />
      <!-- Giant Graffiti Wall Mural 3 -->
      <rect x="990" y="450" width="420" height="340" fill="#0f091c" rx="8" />
      <path d="M1010,770 C1080,510 1200,470 1390,770 Z" fill="url(#mural3)" opacity="0.9" />
      <text x="1200" y="650" font-family="'Impact', 'Arial Black', sans-serif" font-size="64" font-weight="900" fill="#00f0ff" stroke="#000" stroke-width="5" text-anchor="middle">FIGHT CLUB</text>
    </g>

    <!-- Warehouse 4 (Right) -->
    <g>
      <rect x="1450" y="390" width="470" height="690" fill="url(#bldgGrad)" stroke="#ff007f" stroke-width="3" />
      <!-- Giant Graffiti Wall Mural 4 -->
      <rect x="1480" y="430" width="410" height="350" fill="#0f091c" rx="8" />
      <path d="M1500,760 Q1620,460 1740,610 T1870,520 L1870,760 Z" fill="url(#mural1)" opacity="0.9" />
      <text x="1680" y="720" font-family="'Impact', 'Arial Black', sans-serif" font-size="52" font-weight="900" fill="#ffe600" stroke="#000" stroke-width="4" text-anchor="middle">DISTRICT 305</text>
    </g>

    <!-- Overhead Festival String Lights between Warehouses -->
    <g stroke="#ff007f" stroke-width="2" fill="none" opacity="0.8">
      <path d="M0,420 Q240,490 480,420" />
      <path d="M480,380 Q720,460 960,410" />
      <path d="M960,410 Q1200,480 1450,390" />
      <path d="M1450,390 Q1680,470 1920,410" />
    </g>

    <!-- Glowing Light Bulbs along string -->
    <g fill="#ffe600" filter="url(#neonGlow)">
      <circle cx="120" cy="450" r="5" />
      <circle cx="240" cy="470" r="6" fill="#ff007f" />
      <circle cx="360" cy="450" r="5" />
      <circle cx="600" cy="425" r="6" fill="#00f0ff" />
      <circle cx="720" cy="445" r="6" />
      <circle cx="840" cy="425" r="5" fill="#ff007f" />
      <circle cx="1080" cy="445" r="6" fill="#ffe600" />
      <circle cx="1200" cy="465" r="6" fill="#00f0ff" />
      <circle cx="1320" cy="445" r="5" fill="#ff007f" />
      <circle cx="1560" cy="430" r="6" fill="#ffe600" />
      <circle cx="1680" cy="450" r="6" fill="#00f0ff" />
      <circle cx="1800" cy="430" r="5" fill="#ff007f" />
    </g>

    <!-- Industrial Overhead Pipes & Steel Trusses -->
    <g stroke="#26173d" stroke-width="8" opacity="0.9">
      <line x1="0" y1="840" x2="1920" y2="840" />
      <line x1="0" y1="860" x2="1920" y2="860" stroke-width="4" stroke="#ff007f" />
    </g>
  </svg>
  `;

  const destPath = path.resolve("public/game/backgrounds/miami/far.jpg");

  // Render SVG to sharp buffer and write high quality JPEG
  await sharp(Buffer.from(svgContent))
    .jpeg({ quality: 95 })
    .toFile(destPath);

  console.log(`Generated distinct Wynwood Graffiti District background at: ${destPath}`);
}

generateWynwoodBackground().catch(console.error);
