# South Florida Fighter — Nano Banana Mega Prompts

Consolidated single-generation prompts for player, enemy, and background art.
Each is structured as one multi-frame sheet (or single wide image, for
backgrounds) so proportions, palette, and alignment stay consistent across
frames — much better odds than generating pieces one at a time.

**Contents:**
1. [JAV — Player Sprite Sheet](#1-jav--player-sprite-sheet)
2. [Enemies — Bruiser, Blade, Boss](#2-enemies--bruiser-blade-boss)
3. [Backgrounds — 5-City Circuit](#3-backgrounds--5-city-circuit)
4. [Shared Usage Notes](#4-shared-usage-notes)

---

## 1. JAV — Player Sprite Sheet

```
Pixel art fighting game character sprite sheet, side-view 2D beat-em-up fighter 
"JAV". Character reference: Young Black street fighter wearing purple tilted backwards 
baseball cap, heavy gold Cuban link chain, white oversized graphic t-shirt, forearm tattoo, 
baggy distressed denim jeans, and crisp white sneakers.

STYLE LOCK (apply identically to every frame):
- Crisp 16-bit era pixel art, clean black outlines, limited palette
- South Florida synthwave arcade aesthetic — teal/coral/magenta neon accents 
  against the character's base colors
- Reference quality: Street Fighter Alpha / Guilty Gear era pixel sprites
- Transparent background, no shadow, no floor line, no text, no watermark
- Character always facing right, bottom-anchored on an implied ground line
- Consistent character height and proportions across every frame — do not let 
  scale, outfit details, or palette drift between frames

LAYOUT: single horizontal sprite sheet, 8 frames left to right, each frame 
160x180px, character filling ~80-85% of frame height in each.

FRAME-BY-FRAME CONTENT:

Frame 1 — Run cycle, contact pose: front foot planted on ground, back leg 
trailing, mid-stride push-off.
Frame 2 — Run cycle, passing pose (NEW in-between): both legs crossing under 
the body, this is the mid-air transition frame that smooths the stride — 
knees close together, arms mid-swing.
Frame 3 — Run cycle, extended pose: back leg fully extended behind, front 
knee driven high and forward, opposite-arm swing, slight forward lean.

Frame 4 — Attack anticipation (NEW wind-up frame): weight shifted onto rear 
leg, striking arm cocked back at the elbow, torso coiled opposite the strike 
direction, focused expression, front hand guarding — stored energy about to 
release.
Frame 5 — Attack active/contact: arm fully extended at point of impact, 
weight driven forward, sharp dynamic line through the whole pose.
Frame 6 — Attack recovery: arm retracting, weight settling back to neutral 
stance, slightly relaxed posture.

Frame 7 — Hit reaction, impact peak: body bent backward from impact, head 
snapped back, one foot lifting off the ground, arms flailing outward, wincing 
expression — this is the moment impact lands.
Frame 8 — Hit reaction, stagger recovery (NEW in-between): body pitching 
forward out of the knockback, feet scrambling to reset balance, arms 
lowering — the transition between impact and returning to neutral stance.

Output at 2x resolution (1280x360 total canvas, 320x360 per frame) for clean 
downscaling. Ground contact point for every frame should sit on the same 
horizontal baseline for consistent post-processing alignment.
```

---

## 2. Enemies — Bruiser, Blade, Boss

Each enemy archetype gets its own sheet, same 8-frame structure as JAV
(run × 3, attack × 3, hurt × 2) so the animation and extraction pipeline
stays identical across every character in the game.

### 2a. Bruiser (heavy melee grunt)

```
Pixel art fighting game enemy sprite sheet, side-view 2D beat-em-up "Bruiser" 
enemy — a heavyset street-brawler thug, broad shoulders, short cropped hair, 
tank-top or open red/black athletic vest, thick forearms, brass knuckles, slower 
and heavier-looking than the player character. Muscular, lumbering silhouette that 
reads as "hits hard, moves slow" at a glance.

STYLE LOCK (apply identically to every frame):
- Crisp 16-bit era pixel art, clean black outlines, limited palette
- South Florida synthwave arcade aesthetic — muted street-thug tones (grays, 
  dark reds, faded denim) with a hint of neon rim-light matching the stage
- Reference quality: Street Fighter Alpha / Guilty Gear era pixel sprites, 
  visually distinct silhouette from JAV's leaner build
- Transparent background, no shadow, no floor line, no text, no watermark
- Character always facing left (enemies face the player), bottom-anchored on 
  an implied ground line
- Consistent height, bulk, and palette across every frame — no drift

LAYOUT: single horizontal sprite sheet, 8 frames left to right, each frame 
160x180px, character filling ~85-90% of frame height (Bruiser reads larger 
and heavier than JAV).

FRAME-BY-FRAME CONTENT:
Frame 1 — Run/lumber cycle, contact pose: heavy plodding stride, front foot 
slamming down.
Frame 2 — Run/lumber cycle, passing pose: weight shifting between legs, 
lumbering mid-stride, arms swinging with visible mass/momentum.
Frame 3 — Run/lumber cycle, extended pose: back leg driving off ground, 
forward lean showing bulk and momentum.
Frame 4 — Attack anticipation: telegraphed heavy wind-up, both arms/shoulder 
cocked back, wide stable stance, "this is going to hurt" tension.
Frame 5 — Attack active/contact: heavy haymaker or shoulder-charge at full 
extension, maximum committed force.
Frame 6 — Attack recovery: overextended, slightly off-balance, arm dropping, 
brief vulnerability window.
Frame 7 — Hit reaction, impact peak: bulk absorbing the hit, staggering 
back but not falling (Bruiser should look tough even when hurt).
Frame 8 — Hit reaction, stagger recovery: regaining footing, shaking it off, 
re-squaring shoulders toward the player.

Output at 2x resolution (1280x360 total canvas, 320x360 per frame). Ground 
contact point consistent across all 8 frames.
```

### 2b. Blade (fast weapon-wielding enemy)

```
Pixel art fighting game enemy sprite sheet, side-view 2D beat-em-up "Blade" 
enemy — a lean, fast street enforcer wielding two hunting knives or short blades, 
black face bandana, neon green athletic jacket, athletic build, sharper/angular 
silhouette than Bruiser, quicker and more aggressive looking. Reads as "fast and 
dangerous" at a glance.

STYLE LOCK (apply identically to every frame):
- Crisp 16-bit era pixel art, clean black outlines, limited palette
- South Florida synthwave arcade aesthetic — sharper cooler tones (teal, 
  black, silver blade glint) with neon rim-light matching the stage
- Reference quality: Street Fighter Alpha / Guilty Gear era pixel sprites, 
  visually distinct silhouette from both JAV and Bruiser — leaner, angular
- Transparent background, no shadow, no floor line, no text, no watermark
- Character always facing left (enemies face the player), bottom-anchored on 
  an implied ground line
- Consistent height, build, weapon, and palette across every frame — no drift

LAYOUT: single horizontal sprite sheet, 8 frames left to right, each frame 
160x180px, character filling ~80-85% of frame height (Blade reads leaner and 
faster than JAV or Bruiser).

FRAME-BY-FRAME CONTENT:
Frame 1 — Run cycle, contact pose: quick low sprint stride, front foot 
planted, blade held ready.
Frame 2 — Run cycle, passing pose: legs crossing under body at speed, blade 
trailing slightly, fast mid-air transition.
Frame 3 — Run cycle, extended pose: full sprint extension, aggressive forward 
lean, blade leading the charge.
Frame 4 — Attack anticipation: quick low crouch-coil, blade drawn back for a 
fast slash, narrow low profile.
Frame 5 — Attack active/contact: blade slash at full extension, sharp 
diagonal line through the pose, speed-lines optional.
Frame 6 — Attack recovery: quick snap-back to guard stance, blade returning 
to ready position, minimal recovery window (Blade should look fast even 
recovering).
Frame 7 — Hit reaction, impact peak: sharp recoil, blade arm flung wide, 
losing footing from the hit.
Frame 8 — Hit reaction, stagger recovery: quick regain of balance, blade 
snapping back to guard, re-engaging fast.

Output at 2x resolution (1280x360 total canvas, 320x360 per frame). Ground 
contact point consistent across all 8 frames.
```

### 2c. Syndicate Boss (2-phase, Miami Beach finale)

```
Pixel art fighting game boss sprite sheet, side-view 2D beat-em-up "Syndicate 
Boss" — an imposing crime-boss figure in a double-breasted white suit, sunglasses, 
gold watch, wielding a heavy gold-topped cane, glowing with a dangerous neon 
purple aura, larger and more commanding presence than any grunt enemy.

STYLE LOCK (apply identically to every frame):
- Crisp 16-bit era pixel art, clean black outlines, limited palette
- South Florida synthwave arcade aesthetic — richer/more saturated palette 
  than the grunts (deep purples, gold accents, art-deco-adjacent detailing 
  matching the Miami Beach Ocean Drive stage), stronger neon rim-light
- Reference quality: Street Fighter Alpha / Guilty Gear era boss sprites — 
  visually the most detailed and imposing character in the roster
- Transparent background, no shadow, no floor line, no text, no watermark
- Character always facing left (enemies face the player), bottom-anchored on 
  an implied ground line
- Consistent height, bulk, and palette across every frame — no drift. Boss 
  should read noticeably larger than Bruiser.

LAYOUT: single horizontal sprite sheet, 8 frames left to right, each frame 
180x200px (boss frame size per existing game spec), character filling 
~85-90% of frame height.

FRAME-BY-FRAME CONTENT:
Frame 1 — Idle/stalk cycle, weight forward: slow deliberate advancing step, 
cane planted, unhurried and confident.
Frame 2 — Idle/stalk cycle, passing pose: mid-step transition, coat/fabric 
motion adding weight and drama.
Frame 3 — Idle/stalk cycle, weight back: opposite step, cane lifting, 
continued unhurried menace.
Frame 4 — Shockwave attack anticipation: cane raised high overhead with 
both hands, wide stable stance, visible charge-up tension (telegraphs the 
cane-slam shockwave attack).
Frame 5 — Shockwave attack active/contact: cane slamming down into ground at 
full force, impact pose, ground-level energy implied at the cane's tip.
Frame 6 — Attack recovery: cane lifting back up, boss re-settling into 
stalking stance, brief recovery window.
Frame 7 — Hit reaction / Phase 2 rage trigger, impact peak: staggering from 
a hit, coat flaring, expression shifting to anger (usable as the "health 
below 50%, entering rage phase" frame).
Frame 8 — Hit reaction, stagger recovery / rage aura onset: regaining 
composure with a subtle aura/glow beginning at the edges of the silhouette, 
transitioning into the more aggressive Phase 2 stance.

Output at 2x resolution (1440x400 total canvas, 360x400 per frame). Ground 
contact point consistent across all 8 frames.
```

---

## 3. Backgrounds — 5-City Circuit

Each stage uses parallax layers per the existing pipeline (far background +
ground layer). These prompts generate the **far background** layer at
1920×1080; ground-layer detail call-outs are included per city for a
follow-up generation if you want a separate foreground parallax band.

### 3a. Fort Lauderdale — A1A Ocean Boardwalk

```
Wide 2D side-scrolling beat-em-up game background, far parallax layer. 
Fort Lauderdale A1A oceanfront boardwalk at dusk/night. Palm trees silhouetted 
against a synthwave gradient sky (deep blue to coral/pink horizon), distant 
oceanfront hotel towers with lit windows, a sliver of moonlit ocean visible 
beyond a low seawall, string lights along the boardwalk railing. 
Pixel art style, clean and readable at a distance, muted enough to not compete 
with foreground character sprites, teal/coral neon accent lighting matching 
the game's overall palette. No characters, no foreground detail, no text. 
1920x1080, designed to tile/loop horizontally for parallax scrolling.

Ground layer (optional second generation): sandy boardwalk planks, palm trunk 
silhouettes, low tiki-style railings, beach-adjacent arcade signage.
```

### 3b. Tampa — Ybor City Neon Strip

```
Wide 2D side-scrolling beat-em-up game background, far parallax layer. 
Tampa's Ybor City at night — historic brick buildings with wrought-iron 
balconies, neon cigar-shop and bar signage in Spanish/Cuban-influenced 
lettering, string lights crossing between buildings, warm brick-red and 
amber tones against a dark purple night sky. 
Pixel art style, clean and readable at a distance, muted enough to not compete 
with foreground character sprites, neon accent lighting matching the game's 
overall palette. No characters, no foreground detail, no text. 
1920x1080, designed to tile/loop horizontally for parallax scrolling.

Ground layer (optional second generation): elevated brick platform tiers, 
wrought-iron railings, cobblestone street texture.
```

### 3c. Palm Beach — Worth Avenue Promenade

```
Wide 2D side-scrolling beat-em-up game background, far parallax layer. 
Palm Beach's Worth Avenue at golden hour/dusk — upscale Mediterranean-revival 
architecture, manicured palm-lined promenade, ornate fountains, warm 
gold/salmon building facades against a soft peach-and-lavender sky, subtle 
wealth-district polish (awnings, wrought-iron lamp posts). 
Pixel art style, clean and readable at a distance, muted enough to not compete 
with foreground character sprites, refined neon-accent lighting matching the 
game's overall palette. No characters, no foreground detail, no text. 
1920x1080, designed to tile/loop horizontally for parallax scrolling.

Ground layer (optional second generation): promenade pavement, low fountain 
edges, ornate lamp posts for dash-lane visual rhythm.
```

### 3d. Miami — Wynwood Graffiti District

```
Wide 2D side-scrolling beat-em-up game background, far parallax layer. 
Miami's Wynwood Arts District at night — large-scale colorful graffiti murals 
covering warehouse walls, dense urban brawler alley feel, vibrant clashing 
colors (magenta, cyan, yellow) balanced against a dark urban night sky, 
string lights and neon gallery signage. 
Pixel art style, clean and readable at a distance, muted enough to not compete 
with foreground character sprites — murals provide color, but composition 
stays uncluttered behind gameplay space. No characters, no foreground detail, 
no text. 1920x1080, designed to tile/loop horizontally for parallax scrolling.

Ground layer (optional second generation): warehouse loading docks, chain-link 
fencing, dense urban clutter reinforcing the "gauntlet" stage gimmick.
```

### 3e. Miami Beach — Ocean Drive Art Deco Strip

```
Wide 2D side-scrolling beat-em-up game background, far parallax layer. 
Miami Beach's Ocean Drive at night — iconic Art Deco hotel facades in pastel 
teal, pink, and cream with neon trim lighting, palm trees, a glowing skyline 
silhouette, dramatic and slightly more saturated/cinematic than the other 
four stages since this is the final boss stage. 
Pixel art style, clean and readable at a distance, muted enough to not compete 
with foreground character sprites, rich neon accent lighting (Art Deco neon 
trim especially) matching the game's overall palette, boss-stage gravitas. 
No characters, no foreground detail, no text. 1920x1080, designed to 
tile/loop horizontally for parallax scrolling.

Ground layer (optional second generation): Ocean Drive pavement, Art Deco 
building bases, palm trunks, subtle rage-aura-compatible red undertone 
reserved for the Phase 2 boss moment.
```

---

## 4. Shared Usage Notes

- **Attach the existing sprite sheet PNG as a reference image** for whichever
  character/enemy you're regenerating, alongside its text prompt, if your
  access path supports image+text conditioning — this is the single biggest
  lever against drift, more than any amount of extra prompt detail. For
  backgrounds, attach an existing stage background if you want to preserve
  its exact architecture/layout while only refreshing detail quality.
- **Generate several times, cherry-pick for internal consistency** — for
  sprite sheets, a slightly rougher sheet where all 8 frames agree with each
  other beats one gorgeous frame that doesn't match the rest. For
  backgrounds, cherry-pick for "reads well behind fast-moving sprites,"
  not just "looks good in isolation."
- **Always run sprite results through `extract-8frame-sprites.mjs`** — the
  flood-fill / bounding-box / bottom-center anchoring pass. AI-generated
  frames won't be pixel-perfectly aligned to the target grid on their own.
  Backgrounds don't need this pass but should be checked against the
  `tileScaleY` math in `PlayScene.ts` so they scale to `GROUND_Y + 60`
  without visible seams.
- **New frames to splice in per character:** passing-stride (run),
  anticipation (attack wind-up), and stagger-recovery (hit reaction) — 3
  net-new poses beyond each character's current 4-frame sheets.
- **After extraction, update `CharacterData.ts` / `EnemyData.ts`** frame
  index arrays and use variable per-frame durations: hold longer on
  anticipation and stagger frames, move quickly through passing-stride
  frames. For the boss, frames 7–8 double as the Phase 2 rage-trigger
  reference in `Enemy.ts`'s `behaviorType === "boss"` branch.
- **Keep each character/enemy visually distinct at a glance** — Bruiser
  (bulky/slow), Blade (lean/fast), Boss (largest/most detailed) should read
  as different threat types even in silhouette, since combat readability
  depends on players parsing enemy type instantly mid-fight.
