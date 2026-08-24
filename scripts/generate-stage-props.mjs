import sharp from "sharp";
import fs from "fs";
import path from "path";

/**
 * South Florida Fighter — Stage Prop Asset Generator
 * Generates transparent, pixel-art arcade props for all 5 South Florida levels:
 * - Stage 1 (Fort Lauderdale): ftl_tiki, ftl_surf, tower, palm
 * - Stage 2 (Tampa): tampa_lamp, tampa_balcony, tampa_barrel
 * - Stage 3 (Palm Beach): pb_fountain, pb_lamp, pb_urn
 * - Stage 4 (Miami Wynwood): wynwood_hydrant, wynwood_crates, wynwood_sign
 * - Stage 5 (Miami Beach): mb_artdeco_lamp, mb_valet_sign, mb_palm
 */

const PROPS_DIR = path.resolve("public/game/sprites/props");
fs.mkdirSync(PROPS_DIR, { recursive: true });

async function saveSvgProp(filename, width, height, svgContent) {
  const fullSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffe600" />
        <stop offset="100%" stop-color="#c49a16" />
      </linearGradient>
      <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#8b5a2b" />
        <stop offset="100%" stop-color="#4a2e12" />
      </linearGradient>
      <linearGradient id="marbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fdfbf7" />
        <stop offset="50%" stop-color="#e2d8c3" />
        <stop offset="100%" stop-color="#b8a688" />
      </linearGradient>
      <linearGradient id="decoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#00f0ff" />
        <stop offset="50%" stop-color="#ff007f" />
        <stop offset="100%" stop-color="#ffe600" />
      </linearGradient>
    </defs>
    ${svgContent}
  </svg>
  `;

  const dest = path.join(PROPS_DIR, filename);
  await sharp(Buffer.from(fullSvg))
    .png()
    .toFile(dest);
  console.log(`✓ Generated prop: ${filename} (${width}x${height})`);
}

async function generateAllProps() {
  console.log("Generating stage props for South Florida Fighter...");

  // ==========================================
  // STAGE 1: FORT LAUDERDALE (Boardwalk / Beach)
  // ==========================================
  
  // ftl_tiki.png (Tiki Torch Post with Wood Direction Sign) - 96x192
  await saveSvgProp("ftl_tiki.png", 96, 192, `
    <!-- Bamboo Post -->
    <rect x="42" y="48" width="12" height="144" fill="url(#woodGrad)" stroke="#221206" stroke-width="2" />
    <line x1="38" y1="80" x2="58" y2="80" stroke="#361a06" stroke-width="3" />
    <line x1="38" y1="120" x2="58" y2="120" stroke="#361a06" stroke-width="3" />
    <line x1="38" y1="160" x2="58" y2="160" stroke="#361a06" stroke-width="3" />

    <!-- Tiki Torch Bowl -->
    <polygon points="34,48 62,48 54,26 42,26" fill="#361a06" stroke="#1c0b02" stroke-width="2" />
    
    <!-- Animated Flame -->
    <g filter="url(#neonGlow)">
      <path d="M48,4 C36,18 40,26 48,26 C56,26 60,18 48,4 Z" fill="#ff4500" />
      <path d="M48,10 C42,18 44,24 48,24 C52,24 54,18 48,10 Z" fill="#ffe600" />
    </g>

    <!-- Wooden Sign Plate -->
    <polygon points="12,70 84,70 76,96 12,96" fill="#a06836" stroke="#221206" stroke-width="2" />
    <text x="44" y="88" font-family="'Impact', sans-serif" font-size="12" fill="#fff" font-weight="900" text-anchor="middle">A1A BEACH</text>
  `);

  // ftl_surf.png (Surfboard Rack) - 128x160
  await saveSvgProp("ftl_surf.png", 128, 160, `
    <!-- Wooden Frame -->
    <rect x="18" y="40" width="8" height="120" fill="url(#woodGrad)" stroke="#1a0c03" stroke-width="2" />
    <rect x="102" y="40" width="8" height="120" fill="url(#woodGrad)" stroke="#1a0c03" stroke-width="2" />
    <rect x="14" y="90" width="100" height="8" fill="url(#woodGrad)" stroke="#1a0c03" stroke-width="2" />

    <!-- Surfboard 1 (Teal/Pink) -->
    <path d="M38,150 C30,110 32,40 46,12 C58,40 60,110 52,150 Z" fill="#00f0ff" stroke="#065f66" stroke-width="2" />
    <path d="M42,24 C44,70 44,120 44,146" stroke="#ff007f" stroke-width="4" />

    <!-- Surfboard 2 (Gold/Coral) -->
    <path d="M74,152 C66,112 68,44 82,18 C94,44 96,112 88,152 Z" fill="#ffe600" stroke="#8a7300" stroke-width="2" />
    <path d="M78,30 C80,74 80,124 80,148" stroke="#ff4500" stroke-width="4" />
  `);

  // ==========================================
  // STAGE 2: TAMPA (Ybor City Historic Strip)
  // ==========================================

  // tampa_lamp.png (Wrought-Iron Gas Lamppost) - 80x210
  await saveSvgProp("tampa_lamp.png", 80, 210, `
    <!-- Base -->
    <polygon points="26,208 54,208 48,180 32,180" fill="#1b1d22" stroke="#000" stroke-width="2" />
    <!-- Cast Iron Pole -->
    <rect x="36" y="50" width="8" height="130" fill="#2c3038" stroke="#0c0d10" stroke-width="2" />
    <circle cx="40" cy="110" r="8" fill="#1b1d22" />

    <!-- Ornate Scrollwork Bracket -->
    <path d="M40,65 Q18,65 24,42 Q30,60 40,55" fill="none" stroke="#2c3038" stroke-width="3" />
    <path d="M40,65 Q62,65 56,42 Q50,60 40,55" fill="none" stroke="#2c3038" stroke-width="3" />

    <!-- Lantern Housing -->
    <polygon points="22,46 58,46 50,14 30,14" fill="#1b1d22" stroke="#000" stroke-width="2" />
    <!-- Lantern Glass & Glow -->
    <polygon points="26,44 54,44 48,18 32,18" fill="#ffe600" opacity="0.85" filter="url(#neonGlow)" />
    <!-- Cap & Finial -->
    <polygon points="28,14 52,14 40,2" fill="#2c3038" stroke="#000" stroke-width="1.5" />
    <circle cx="40" cy="2" r="3" fill="#ffe600" />
  `);

  // tampa_balcony.png (Ybor Wrought-Iron Balcony Post with Cigar Sign) - 110x230
  await saveSvgProp("tampa_balcony.png", 110, 230, `
    <!-- Red Brick Pillar Base -->
    <rect x="25" y="110" width="60" height="120" fill="#8b3a2b" stroke="#3d120a" stroke-width="3" />
    <line x1="25" y1="140" x2="85" y2="140" stroke="#3d120a" stroke-width="2" />
    <line x1="25" y1="170" x2="85" y2="170" stroke="#3d120a" stroke-width="2" />
    <line x1="25" y1="200" x2="85" y2="200" stroke="#3d120a" stroke-width="2" />

    <!-- Wrought Iron Railing Top -->
    <rect x="10" y="30" width="90" height="80" fill="none" stroke="#1a1c20" stroke-width="3" />
    <path d="M20,30 L20,110 M40,30 L40,110 M60,30 L60,110 M80,30 L80,110" stroke="#1a1c20" stroke-width="2" />
    <circle cx="50" cy="70" r="16" fill="none" stroke="#1a1c20" stroke-width="2.5" />

    <!-- Neon Cigar Sign -->
    <g filter="url(#neonGlow)">
      <rect x="15" y="130" width="80" height="30" rx="4" fill="#150820" stroke="#ff0055" stroke-width="2" />
      <text x="55" y="150" font-family="'Impact', sans-serif" font-size="12" fill="#ffe600" text-anchor="middle" font-weight="900">YBOR CIGAR</text>
    </g>
  `);

  // tampa_barrel.png (Aged Wooden Rum Cask) - 72x88
  await saveSvgProp("tampa_barrel.png", 72, 88, `
    <ellipse cx="36" cy="44" rx="30" ry="40" fill="url(#woodGrad)" stroke="#1a0a03" stroke-width="2.5" />
    <line x1="8" y1="26" x2="64" y2="26" stroke="#222" stroke-width="4" />
    <line x1="6" y1="44" x2="66" y2="44" stroke="#222" stroke-width="4" />
    <line x1="8" y1="62" x2="64" y2="62" stroke="#222" stroke-width="4" />
    <circle cx="36" cy="35" r="4" fill="#111" />
  `);

  // ==========================================
  // STAGE 3: PALM BEACH (Worth Avenue Luxury)
  // ==========================================

  // pb_fountain.png (Ornate Mediterranean Tiered Fountain) - 140x160
  await saveSvgProp("pb_fountain.png", 140, 160, `
    <!-- Base Basin -->
    <ellipse cx="70" cy="145" rx="60" ry="14" fill="url(#marbleGrad)" stroke="#5e4f3a" stroke-width="3" />
    <rect x="35" y="110" width="70" height="36" fill="url(#marbleGrad)" stroke="#5e4f3a" stroke-width="2" />
    
    <!-- Middle Tier -->
    <ellipse cx="70" cy="110" rx="45" ry="10" fill="url(#marbleGrad)" stroke="#5e4f3a" stroke-width="2.5" />
    <rect x="52" y="65" width="36" height="45" fill="url(#marbleGrad)" stroke="#5e4f3a" stroke-width="2" />

    <!-- Top Basin -->
    <ellipse cx="70" cy="65" rx="28" ry="7" fill="url(#marbleGrad)" stroke="#5e4f3a" stroke-width="2" />
    <polygon points="62,65 78,65 70,35" fill="url(#marbleGrad)" stroke="#5e4f3a" stroke-width="2" />

    <!-- Flowing Cyan Water Streams -->
    <g stroke="#00f0ff" stroke-width="2.5" fill="none" opacity="0.85" filter="url(#neonGlow)">
      <path d="M70,35 Q60,48 55,65" />
      <path d="M70,35 Q80,48 85,65" />
      <path d="M48,65 Q36,85 40,110" />
      <path d="M92,65 Q104,85 100,110" />
      <path d="M30,110 Q16,130 25,145" />
      <path d="M110,110 Q124,130 115,145" />
    </g>
  `);

  // pb_lamp.png (Gilded Boulevard Lamp with Hanging Flower Basket) - 80x210
  await saveSvgProp("pb_lamp.png", 80, 210, `
    <!-- Base with Gold Trim -->
    <polygon points="24,208 56,208 50,180 30,180" fill="#2d3748" stroke="#1a202c" stroke-width="2" />
    <rect x="36" y="45" width="8" height="135" fill="#4a5568" stroke="#1a202c" stroke-width="2" />
    <rect x="34" y="110" width="12" height="6" fill="url(#goldGrad)" />
    <rect x="34" y="60" width="12" height="6" fill="url(#goldGrad)" />

    <!-- Ornate Gold Lamp Head -->
    <polygon points="26,45 54,45 48,15 32,15" fill="url(#goldGrad)" stroke="#744210" stroke-width="2" />
    <polygon points="28,42 52,42 46,18 34,18" fill="#fffff0" opacity="0.9" filter="url(#neonGlow)" />
    <polygon points="30,15 50,15 40,4" fill="url(#goldGrad)" />

    <!-- Hanging Flower Basket (Left) -->
    <line x1="36" y1="65" x2="14" y2="65" stroke="#2d3748" stroke-width="3" />
    <line x1="14" y1="65" x2="14" y2="80" stroke="#2d3748" stroke-width="2" />
    <ellipse cx="14" cy="85" rx="10" ry="6" fill="#805ad5" />
    <circle cx="12" cy="82" r="4" fill="#ed64a6" />
    <circle cx="16" cy="84" r="4" fill="#f6e05e" />
  `);

  // pb_urn.png (Terracotta Palm Planter) - 64x96
  await saveSvgProp("pb_urn.png", 64, 96, `
    <!-- Tropical Plant Fronds -->
    <path d="M32,40 Q10,15 2,30" stroke="#38a169" stroke-width="4" fill="none" />
    <path d="M32,40 Q54,15 62,30" stroke="#38a169" stroke-width="4" fill="none" />
    <path d="M32,40 Q32,10 32,2" stroke="#48bb78" stroke-width="4" fill="none" />
    
    <!-- Terracotta Vase -->
    <polygon points="12,45 52,45 44,92 20,92" fill="#c05621" stroke="#652b19" stroke-width="2.5" />
    <ellipse cx="32" cy="45" rx="20" ry="5" fill="#dd6b20" stroke="#652b19" stroke-width="2" />
    <rect x="16" y="90" width="32" height="6" fill="#9c4221" />
  `);

  // ==========================================
  // STAGE 4: MIAMI WYNWOOD (Urban Arts District)
  // ==========================================

  // wynwood_hydrant.png (Graffiti Neon Fire Hydrant) - 54x80
  await saveSvgProp("wynwood_hydrant.png", 54, 80, `
    <!-- Body -->
    <rect x="14" y="24" width="26" height="52" fill="#ff007f" stroke="#4a0024" stroke-width="2" />
    <rect x="8" y="72" width="38" height="8" fill="#111" />
    
    <!-- Top Cap -->
    <ellipse cx="27" cy="24" rx="14" ry="8" fill="#00f0ff" stroke="#004d54" stroke-width="2" />
    <rect x="23" y="10" width="8" height="8" fill="#ffe600" />
    
    <!-- Side Nozzles -->
    <rect x="6" y="36" width="8" height="12" fill="#00f0ff" stroke="#111" stroke-width="1.5" />
    <rect x="40" y="36" width="8" height="12" fill="#00f0ff" stroke="#111" stroke-width="1.5" />
    
    <!-- Graffiti Splatters -->
    <circle cx="24" cy="44" r="5" fill="#ffe600" />
    <circle cx="32" cy="54" r="4" fill="#00ffcc" />
  `);

  // wynwood_crates.png (Stacked Spray Paint Barrels & Wooden Crates) - 120x110
  await saveSvgProp("wynwood_crates.png", 120, 110, `
    <!-- Wooden Crate (Left) -->
    <rect x="6" y="45" width="60" height="60" fill="url(#woodGrad)" stroke="#1a0c03" stroke-width="2.5" />
    <line x1="6" y1="45" x2="66" y2="105" stroke="#1a0c03" stroke-width="2" />
    <line x1="6" y1="105" x2="66" y2="45" stroke="#1a0c03" stroke-width="2" />
    <text x="36" y="80" font-family="'Impact', sans-serif" font-size="12" fill="#00f0ff" text-anchor="middle">SPRAY</text>

    <!-- Neon Steel Drum (Right) -->
    <rect x="66" y="30" width="48" height="75" rx="6" fill="#7928ca" stroke="#2d0b52" stroke-width="2.5" />
    <line x1="66" y1="52" x2="114" y2="52" stroke="#ff0080" stroke-width="3" />
    <line x1="66" y1="78" x2="114" y2="78" stroke="#ff0080" stroke-width="3" />
    <circle cx="90" cy="42" r="5" fill="#00f0ff" />
  `);

  // wynwood_sign.png (Neon Gallery Art Arrow Post) - 80x190
  await saveSvgProp("wynwood_sign.png", 80, 190, `
    <!-- Steel Post -->
    <rect x="36" y="30" width="8" height="160" fill="#2d3748" stroke="#111" stroke-width="2" />

    <!-- Neon Arrow 1 (Pointing Right) -->
    <g filter="url(#neonGlow)">
      <polygon points="10,40 60,40 74,54 60,68 10,68" fill="#120924" stroke="#00f0ff" stroke-width="2.5" />
      <text x="38" y="58" font-family="'Impact', sans-serif" font-size="11" fill="#00f0ff" font-weight="900" text-anchor="middle">GALLERIES ▶</text>
    </g>

    <!-- Neon Arrow 2 (Pointing Left) -->
    <g filter="url(#neonGlow)">
      <polygon points="70,80 20,80 6,94 20,108 70,108" fill="#120924" stroke="#ff007f" stroke-width="2.5" />
      <text x="42" y="98" font-family="'Impact', sans-serif" font-size="11" fill="#ff007f" font-weight="900" text-anchor="middle">◀ MURALS</text>
    </g>
  `);

  // ==========================================
  // STAGE 5: MIAMI BEACH (Ocean Drive Finale)
  // ==========================================

  // mb_artdeco_lamp.png (Art Deco Pastel Neon Streetlight) - 88x220
  await saveSvgProp("mb_artdeco_lamp.png", 88, 220, `
    <!-- Stepped Deco Base -->
    <polygon points="18,218 70,218 62,195 26,195" fill="#1a202c" stroke="#000" stroke-width="2" />
    <polygon points="26,195 62,195 56,180 32,180" fill="#2d3748" stroke="#000" stroke-width="2" />
    
    <!-- Sleek Streamline Pole with Teal Trim -->
    <rect x="38" y="45" width="12" height="135" fill="#4a5568" stroke="#1a202c" stroke-width="2" />
    <rect x="42" y="55" width="4" height="115" fill="#00f0ff" />

    <!-- Art Deco Wing Fins -->
    <polygon points="38,60 14,40 38,40" fill="#ff007f" stroke="#000" stroke-width="1.5" />
    <polygon points="50,60 74,40 50,40" fill="#ff007f" stroke="#000" stroke-width="1.5" />

    <!-- Glowing Globe Orb -->
    <g filter="url(#neonGlow)">
      <circle cx="44" cy="24" r="18" fill="#fff" stroke="#00f0ff" stroke-width="2.5" />
      <circle cx="44" cy="24" r="12" fill="#00f0ff" opacity="0.6" />
    </g>
  `);

  // mb_valet_sign.png (Ocean Drive VIP Valet & Velvet Rope) - 110x120
  await saveSvgProp("mb_valet_sign.png", 110, 120, `
    <!-- Valet Podium -->
    <polygon points="15,40 55,40 48,115 22,115" fill="#120924" stroke="#ffe600" stroke-width="2" />
    <rect x="18" y="50" width="34" height="18" fill="#ff007f" rx="2" />
    <text x="35" y="63" font-family="'Impact', sans-serif" font-size="10" fill="#fff" text-anchor="middle">VALET</text>

    <!-- Brass Stanchion 1 -->
    <rect x="70" y="50" width="6" height="65" fill="url(#goldGrad)" stroke="#553c00" stroke-width="1.5" />
    <circle cx="73" cy="46" r="6" fill="url(#goldGrad)" />
    <rect x="64" y="112" width="18" height="6" fill="url(#goldGrad)" />

    <!-- Brass Stanchion 2 -->
    <rect x="100" y="50" width="6" height="65" fill="url(#goldGrad)" stroke="#553c00" stroke-width="1.5" />
    <circle cx="103" cy="46" r="6" fill="url(#goldGrad)" />
    <rect x="94" y="112" width="18" height="6" fill="url(#goldGrad)" />

    <!-- Hanging Red Velvet Rope -->
    <path d="M73,52 Q88,72 103,52" fill="none" stroke="#e53e3e" stroke-width="5" />
  `);

  console.log("All stage props generated successfully!");
}

generateAllProps().catch(console.error);
