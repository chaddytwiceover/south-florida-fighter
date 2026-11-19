// Generate optional, lightweight four-frame arcade-style character sheets.
// Usage: npm run sprites:refresh
// Existing live sprites are not overwritten; review the preview folder first.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.resolve("assets/sprite-refresh-preview");
const W = 160, H = 180;
const fighters = [
  { kind:"characters", id:"jav", skin:"#9a633f", shirt:"#6935c8", pants:"#242947", trim:"#e8c45a", hair:"#1d1520" },
  { kind:"enemies", id:"bruiser", skin:"#a96c43", shirt:"#ae4c38", pants:"#25394c", trim:"#e8c45a", hair:"#181820" },
  { kind:"enemies", id:"blade", skin:"#d49c67", shirt:"#216a71", pants:"#20273e", trim:"#53e8d7", hair:"#17171c" },
  { kind:"enemies", id:"boss", skin:"#89583f", shirt:"#402c52", pants:"#151e32", trim:"#ed6e87", hair:"#101118" },
];
const actions = {
  characters: ["idle","run","jump","hurt","light","heavy","kick","special1","special2","special3","finisher"],
  enemies: ["idle","run","attack","hurt"]
};
function pose(action, frame) {
  const swing = [0, 7, 0, -7][frame];
  if(action==="run") return { bounce: Math.abs(swing)*0.4, armL:-swing*2.2, armR:swing*2.2, legL:swing*2.4, legR:-swing*2.4 };
  if(action==="jump") return { bounce:[-6,-22,-30,-15][frame], armL:-15, armR:15, legL:-12,legR:12 };
  if(action==="hurt") return { bounce:0, armL:-15,armR:-24,legL:8,legR:14, tilt:-12 };
  if(["light","heavy","attack","special1","special2","special3","finisher"].includes(action))
    return { bounce:0, armL:-10, armR:[-5,-22,-44,-12][frame], legL:0,legR:frame===2?-8:0, tilt:frame===2?8:0 };
  if(action==="kick") return {bounce:0,armL:-9,armR:9,legL:0,legR:[0,-25,-54,-12][frame]};
  return {bounce:[0,-2,0,2][frame],armL:[-3,0,3,0][frame],armR:[3,0,-3,0][frame],legL:0,legR:0};
}
function svg(f, action, frame) {
  const p=pose(action,frame), boss=f.id==="boss", big=boss?1.13:1;
  const fx=action.startsWith("special")||action==="finisher";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="-40 -55 250 250">
  <g transform="translate(80 ${153+p.bounce}) scale(${big}) rotate(${p.tilt||0})" stroke="#101827" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M -17 -48 L ${-18+p.legL} -7 L ${-15+p.legL} 0 L -5 0 L 0 -39 Z" fill="${f.pants}"/>
  <path d="M 5 -46 L ${14+p.legR} -6 L ${22+p.legR} 0 L 34 0 L 21 -49 Z" fill="${f.pants}"/>
  <path d="M -19 -3 L -2 -3 L 0 2 L -22 2 Z M 17 -3 L 36 -3 L 39 2 L 15 2 Z" fill="${f.hair}"/>
  <path d="M -20 -98 L 20 -98 L 26 -48 L -25 -48 Z" fill="${f.shirt}"/>
  <path d="M -17 -91 L 17 -91" stroke="${f.trim}" stroke-width="4"/>
  <path d="M -22 -90 L ${-30+p.armL} -61 L ${-26+p.armL} -48" fill="none" stroke="${f.skin}" stroke-width="13"/>
  <path d="M 22 -90 L ${32-p.armR} -65 L ${32-p.armR*1.4} -51" fill="none" stroke="${f.skin}" stroke-width="13"/>
  <rect x="-18" y="-138" width="36" height="44" rx="13" fill="${f.skin}"/>
  <path d="M -20 -123 Q -19 -150 0 -149 Q 23 -150 20 -123 L 13 -131 L -9 -131 Z" fill="${f.hair}"/>
  <path d="M -11 -117 L -3 -117 M 5 -117 L 12 -117" stroke="${f.hair}" stroke-width="2.6"/>
  <path d="M -5 -102 L 6 -102" stroke="${f.hair}" stroke-width="2"/>
  </g>
  ${fx?`<circle cx="${[105,112,125,109][frame]}" cy="${[86,78,65,86][frame]}" r="${[6,12,20,8][frame]}" fill="none" stroke="${f.trim}" stroke-width="4" opacity=".82"/>`:""}
  </svg>`;
}
await fs.mkdir(OUT,{recursive:true});
let count=0;
for(const f of fighters) {
  const dir=path.join(OUT,f.kind,f.id); await fs.mkdir(dir,{recursive:true});
  for(const action of actions[f.kind]){
    const frames=await Promise.all(Array.from({length:4},(_,i)=>sharp(Buffer.from(svg(f,action,i))).png().toBuffer()));
    const sheet=await sharp({create:{width:W*4,height:H,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
      .composite(frames.map((input,i)=>({input,left:i*W,top:0}))).png({palette:true,effort:8}).toBuffer();
    await fs.writeFile(path.join(dir,action+".png"),sheet); count++;
  }
}
console.log(`Generated ${count} transparent four-frame sprite sheets at ${OUT}`);
console.log("Preview these files before copying them into public/game/sprites and running npm run pack:atlases.");
