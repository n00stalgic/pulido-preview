// The accession plate: one sealed record drawn as a single sheet, 18 x 24 in
// proportions. Pure string output (no DOM, no imports) so the same function
// draws the on-screen plate, the print sheet, and any later export.

                         
               
               
                
               
              
                   
  

                          
                    
               
                   
                  
                 
                
                
                  
                     
                      
  

export const PLATE_W = 1800;
export const PLATE_H = 2400;
const GOLD = "#C8AA76";
const BONE = "#F2EFE9";

const esc = (s        ) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const byte = (hex        , i        ) => parseInt(hex.slice((i * 2) % (hex.length - 1), ((i * 2) % (hex.length - 1)) + 2), 16) / 255;

function wrap(text        , max        , maxLines        )           {
  const out           = [];
  let line = "";
  for (const w of text.trim().split(/\s+/)) {
    if ((line + " " + w).trim().length > max) {
      out.push(line);
      line = w;
    } else line = (line + " " + w).trim();
  }
  if (line) out.push(line);
  if (out.length > maxLines) {
    out.length = maxLines;
    out[maxLines - 1] = out[maxLines - 1].replace(/[ .,;]*$/, "") + "...";
  }
  return out;
}

const clock = (iso         ) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toUpperCase() : "";
const day = (iso        ) =>
  new Date(iso).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" }).toUpperCase();

/** The unique configuration as geometry: nine marks placed by the record's own hash. */
function geometry(p            , cx        , cy        )         {
  const h = p.digest;
  const pts = p.faces.map((f, i) => {
    const a = byte(h, i * 2) * Math.PI * 2;
    const r = 150 + byte(h, i * 2 + 1) * 380;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, f };
  });
  const out           = [];
  for (let k = 0; k < 40; k++) {
    const a = byte(h, 20 + k) * Math.PI * 2;
    const r = 120 + byte(h, 60 + k) * 520;
    out.push(`<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r).toFixed(1)}" r="${(1.2 + byte(h, 100 + k) * 2.2).toFixed(1)}" fill="${BONE}" opacity="${(0.12 + byte(h, 140 + k) * 0.3).toFixed(2)}"/>`);
  }
  for (const r of [610, 575, 380, 190]) {
    out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GOLD}" stroke-width="${r === 610 ? 2 : 1}" opacity="${r === 610 ? 0.55 : 0.2}"${r === 575 || r === 190 ? ' stroke-dasharray="3 9"' : ""}/>`);
  }
  for (let i = 0; i < 360; i += 5) {
    const a = (i * Math.PI) / 180;
    const l = i % 30 === 0 ? 22 : 9;
    out.push(`<line x1="${(cx + Math.cos(a) * 610).toFixed(1)}" y1="${(cy + Math.sin(a) * 610).toFixed(1)}" x2="${(cx + Math.cos(a) * (610 - l)).toFixed(1)}" y2="${(cy + Math.sin(a) * (610 - l)).toFixed(1)}" stroke="${GOLD}" stroke-width="1.5" opacity=".4"/>`);
  }
  const path = pts.map((q, i) => `${i ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" ");
  out.push(`<path d="${path}" fill="none" stroke="${GOLD}" stroke-width="2" opacity=".55"/>`);
  out.push(`<path d="M${pts[8].x.toFixed(1)} ${pts[8].y.toFixed(1)} L${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} M${pts[2].x.toFixed(1)} ${pts[2].y.toFixed(1)} L${pts[5].x.toFixed(1)} ${pts[5].y.toFixed(1)} L${pts[7].x.toFixed(1)} ${pts[7].y.toFixed(1)}" fill="none" stroke="${GOLD}" stroke-width="1" opacity=".3" stroke-dasharray="2 8"/>`);
  for (const q of pts) {
    const r = q.f === 0 ? 11 : q.f === 1 ? 17 : 24;
    out.push(`<circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="${r * 2.6}" fill="${GOLD}" opacity="${q.f === 2 ? 0.14 : 0.07}"/>`);
    out.push(`<circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="${r}" fill="${q.f === 0 ? "none" : q.f === 1 ? GOLD : BONE}" stroke="${q.f === 2 ? BONE : GOLD}" stroke-width="2.5"/>`);
  }
  out.push(`<circle cx="${cx}" cy="${cy}" r="5" fill="${GOLD}"/>`);
  return out.join("");
}

function wave(peaks          , x        , y        )         {
  const w = 5;
  const gap = 5;
  return peaks
    .map((p, i) => {
      const hgt = Math.max(5, Math.round(p * 46));
      return `<rect x="${x + i * (w + gap)}" y="${y - hgt / 2}" width="${w}" height="${hgt}" fill="${GOLD}" opacity=".85"/>`;
    })
    .join("");
}

export function plateSvg(p            )         {
  const cx = PLATE_W / 2;
  const cy = 1100;
  const roman = ["I", "II", "III", "IV"];
  const rows = p.rooms
    .filter((r) => r.meta)
    .map((r, i) => {
      const y = 1885 + i * 62;
      const mark = esc(r.mark || roman[i] || "");
      return (
        `<text x="150" y="${y}" font-family="Cinzel,serif" font-size="26" letter-spacing="6" fill="${GOLD}">${mark}</text>` +
        `<text x="230" y="${y}" font-family="Cinzel,serif" font-size="26" letter-spacing="8" fill="${BONE}">${esc(r.verb)}</text>` +
        `<text x="520" y="${y}" font-family="'DM Mono',monospace" font-size="22" letter-spacing="3" fill="${BONE}" opacity=".7">${esc(r.place)}  /  ${esc(r.meta)}</text>` +
        (r.peaks && r.peaks.length ? wave(r.peaks, 1180, y - 8) : "") +
        `<text x="${PLATE_W - 150}" y="${y}" text-anchor="end" font-family="'DM Mono',monospace" font-size="22" letter-spacing="3" fill="${GOLD}" opacity=".85">${esc(clock(r.at))}</text>` +
        `<line x1="150" y1="${y + 20}" x2="${PLATE_W - 150}" y2="${y + 20}" stroke="${GOLD}" stroke-width="1" opacity=".18"/>`
      );
    })
    .join("");
  const frags = p.fragments.filter(Boolean).slice(0, 3);
  const spots = [
    { x: 150, y: 640, rot: -4, anchor: "start" },
    { x: PLATE_W - 150, y: 1500, rot: 3, anchor: "end" },
    { x: 150, y: 1560, rot: -2, anchor: "start" },
  ];
  const hand = frags
    .map((f, i) => {
      const s = spots[i];
      return wrap(f, 26, 3)
        .map(
          (ln, j) =>
            `<text x="${s.x}" y="${s.y + j * 54}" text-anchor="${s.anchor}" transform="rotate(${s.rot} ${s.x} ${s.y})" font-family="'Homemade Apple',cursive" font-size="34" fill="#fff" opacity=".88">${esc(ln)}</text>`,
        )
        .join("");
    })
    .join("");
  const dig = (p.digest.match(/.{1,32}/g) ?? []).map(
    (r, i) =>
      `<text x="${PLATE_W / 2}" y="${2232 + i * 26}" text-anchor="middle" font-family="'DM Mono',monospace" font-size="17" letter-spacing="3" fill="${GOLD}" opacity=".75">${r}</text>`,
  );
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PLATE_W} ${PLATE_H}" role="img" aria-label="Accession plate ${esc(p.accession)}">` +
    `<rect width="${PLATE_W}" height="${PLATE_H}" fill="#080808"/>` +
    `<defs><radialGradient id="pg" cx="50%" cy="46%" r="55%"><stop offset="0" stop-color="${GOLD}" stop-opacity=".12"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient></defs>` +
    `<rect width="${PLATE_W}" height="${PLATE_H}" fill="url(#pg)"/>` +
    `<rect x="60" y="60" width="${PLATE_W - 120}" height="${PLATE_H - 120}" fill="none" stroke="${GOLD}" stroke-width="2" opacity=".55"/>` +
    `<rect x="84" y="84" width="${PLATE_W - 168}" height="${PLATE_H - 168}" fill="none" stroke="${GOLD}" stroke-width="1" opacity=".25"/>` +
    `<text x="150" y="190" font-family="'DM Mono',monospace" font-size="22" letter-spacing="7" fill="${GOLD}">HYAKUTAKE  /  EXPOSITION PARK</text>` +
    `<text x="${PLATE_W - 150}" y="190" text-anchor="end" font-family="'DM Mono',monospace" font-size="22" letter-spacing="7" fill="${BONE}" opacity=".55">VERSION ${p.version}</text>` +
    `<text x="150" y="300" font-family="Cinzel,serif" font-size="38" letter-spacing="14" fill="${BONE}" opacity=".8">FIELD RECORD</text>` +
    `<text x="140" y="540" font-family="Cinzel,serif" font-size="190" letter-spacing="2" fill="${GOLD}">${esc(p.accession)}</text>` +
    `<text x="${PLATE_W - 150}" y="330" text-anchor="end" font-family="'Cormorant Garamond',Georgia,serif" font-style="italic" font-size="84" fill="${BONE}">${esc(p.name)}</text>` +
    `<text x="${PLATE_W - 150}" y="380" text-anchor="end" font-family="'DM Mono',monospace" font-size="24" letter-spacing="6" fill="${BONE}" opacity=".6">${esc(day(p.sealedAt))}</text>` +
    geometry(p, cx, cy) +
    hand +
    `<text x="${cx}" y="1790" text-anchor="middle" font-family="'DM Mono',monospace" font-size="24" letter-spacing="5" fill="${GOLD}">CONFIGURATION ${esc(p.index)}</text>` +
    `<text x="${cx}" y="1830" text-anchor="middle" font-family="'Cormorant Garamond',Georgia,serif" font-style="italic" font-size="34" fill="${BONE}" opacity=".8">of ${esc(p.total)}. This one.</text>` +
    rows +
    `<text x="150" y="2200" font-family="Cinzel,serif" font-size="24" letter-spacing="10" fill="${BONE}">SEALED  /  ${esc(clock(p.sealedAt))}</text>` +
    `<text x="${PLATE_W - 150}" y="2200" text-anchor="end" font-family="'DM Mono',monospace" font-size="17" letter-spacing="4" fill="${BONE}" opacity=".5">SHA-256</text>` +
    dig.join("") +
    `<text x="150" y="2290" font-family="'Cormorant Garamond',Georgia,serif" font-style="italic" font-size="30" fill="${BONE}" opacity=".7">Origin is becoming scarce. Yours is filed here.</text>` +
    `<text x="${PLATE_W - 150}" y="2290" text-anchor="end" font-family="'DM Mono',monospace" font-size="17" letter-spacing="4" fill="${BONE}" opacity=".45">${esc(p.accession)}  /  ONE OF ONE  /  NOT INTENDED TO SCALE</text>` +
    `</svg>`
  );
}
