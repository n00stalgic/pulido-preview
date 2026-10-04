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
    const r = 150 + byte(h, i * 2 + 1) * 420;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, f };
  });
  const out           = [];
  for (let k = 0; k < 40; k++) {
    const a = byte(h, 20 + k) * Math.PI * 2;
    const r = 120 + byte(h, 60 + k) * 520;
    out.push(`<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r).toFixed(1)}" r="${(1.2 + byte(h, 100 + k) * 2.2).toFixed(1)}" fill="${BONE}" opacity="${(0.12 + byte(h, 140 + k) * 0.3).toFixed(2)}"/>`);
  }
  for (const r of [650, 612, 400, 200]) {
    out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GOLD}" stroke-width="${r === 650 ? 2 : 1}" opacity="${r === 650 ? 0.55 : 0.2}"${r === 612 || r === 200 ? ' stroke-dasharray="3 9"' : ""}/>`);
  }
  for (let i = 0; i < 360; i += 5) {
    const a = (i * Math.PI) / 180;
    const l = i % 30 === 0 ? 22 : 9;
    out.push(`<line x1="${(cx + Math.cos(a) * 650).toFixed(1)}" y1="${(cy + Math.sin(a) * 650).toFixed(1)}" x2="${(cx + Math.cos(a) * (650 - l)).toFixed(1)}" y2="${(cy + Math.sin(a) * (650 - l)).toFixed(1)}" stroke="${GOLD}" stroke-width="1.5" opacity=".4"/>`);
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

const T = (x        , y        , t        , o                                                                               = {}) =>
  `<text x="${x}" y="${y}"${o.a ? ` text-anchor="${o.a}"` : ""} font-family="${o.f ?? "'DM Mono',monospace"}" font-size="${o.s ?? 20}" letter-spacing="${o.ls ?? 4}" fill="${o.c ?? BONE}" opacity="${o.op ?? 0.7}">${esc(t)}</text>`;

export function plateSvg(p            )         {
  const cx = PLATE_W / 2;
  const cy = 1130;
  const L = 150;
  const R = PLATE_W - 150;
  const roman = ["I", "II", "III", "IV", "V"];
  const done = p.rooms.filter((r) => r.at);
  const kinds = Array.from(new Set(p.rooms.map((r) => r.meta.split("/").pop()?.trim().toUpperCase()).filter(Boolean)))            ;
  const out           = [];
  out.push(`<rect width="${PLATE_W}" height="${PLATE_H}" fill="#080808"/>`);
  out.push(`<defs><radialGradient id="pg" cx="50%" cy="47%" r="52%"><stop offset="0" stop-color="${GOLD}" stop-opacity=".1"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient></defs><rect width="${PLATE_W}" height="${PLATE_H}" fill="url(#pg)"/>`);
  out.push(`<rect x="60" y="60" width="${PLATE_W - 120}" height="${PLATE_H - 120}" fill="none" stroke="${GOLD}" stroke-width="2" opacity=".55"/><rect x="84" y="84" width="${PLATE_W - 168}" height="${PLATE_H - 168}" fill="none" stroke="${GOLD}" stroke-width="1" opacity=".25"/>`);
  // header block, top left
  out.push(T(L, 180, "HYAKUTAKE", { c: GOLD, ls: 8, s: 22, op: 1 }));
  out.push(T(L, 214, "FIELD RECORD", { ls: 8, s: 20, op: 0.75 }));
  const hdr                       = [
    ["RECORD NO.", [p.accession]],
    ["NAME", [p.name]],
    ["DATE", [day(p.sealedAt)]],
    ["LOCATION", ["EXPOSITION PARK", "LOS ANGELES, CA"]],
  ];
  let y = 300;
  for (const [k, vs] of hdr) {
    out.push(T(L, y, k, { s: 18, ls: 4, op: 0.5 }));
    vs.forEach((v, i) => out.push(T(L + 250, y + i * 34, v, { s: 20, ls: 4, op: 0.9, c: k === "RECORD NO." ? GOLD : BONE })));
    y += vs.length * 34 + 22;
  }
  // rooms, top right
  out.push(T(R, 180, "FIVE ROOMS", { a: "end", c: GOLD, ls: 8, s: 22, op: 1 }));
  p.rooms.filter((r) => r.meta).forEach((r, i) => {
    const yy = 244 + i * 40;
    out.push(T(R - 440, yy, `${r.mark || roman[i] || ""}.`, { s: 19, op: 0.55 }));
    out.push(T(R - 380, yy, r.verb.charAt(0) + r.verb.slice(1).toLowerCase(), { s: 20, op: 0.9 }));
    out.push(T(R, yy, clock(r.at), { a: "end", s: 19, c: GOLD, op: 0.9 }));
  });
  // orbital diagram with crosshair axes
  out.push(`<line x1="${cx}" y1="440" x2="${cx}" y2="${cy + 700}" stroke="${GOLD}" stroke-width="1" opacity=".3"/><line x1="${L - 40}" y1="${cy}" x2="${R + 40}" y2="${cy}" stroke="${GOLD}" stroke-width="1" opacity=".3"/>`);
  out.push(`<circle cx="${cx}" cy="440" r="9" fill="#080808" stroke="${GOLD}" stroke-width="1.5" opacity=".8"/><circle cx="${cx}" cy="${cy + 700}" r="9" fill="#080808" stroke="${GOLD}" stroke-width="1.5" opacity=".8"/>`);
  out.push(geometry(p, cx, cy));
  // left data block
  const lb                     = [
    ["COORDINATES", "34.0141 N  118.2870 W"],
    ["OBSERVATIONS", String(done.length)],
    ["MEDIUM", kinds.join(" / ")],
  ];
  lb.forEach(([k, v], i) => {
    out.push(T(L, 1930 + i * 58, k, { s: 18, op: 0.5 }));
    out.push(T(L + 250, 1930 + i * 58, v, { s: 19, op: 0.9 }));
  });
  // right data block
  const rb                     = [
    ["CONFIGURATION", p.index],
    ["OF", p.total],
    ["REGISTRY", p.accession],
    ["SEALED", clock(p.sealedAt)],
    ["SHA-256", p.digest.slice(0, 16) + "..."],
  ];
  rb.forEach(([k, v], i) => {
    out.push(T(R - 560, 1900 + i * 46, k, { s: 17, op: 0.5 }));
    out.push(T(R, 1900 + i * 46, v, { a: "end", s: 17, op: 0.9, c: k === "CONFIGURATION" ? GOLD : BONE }));
  });
  out.push(T(R, 2150, "A CITY OBSERVED", { a: "end", s: 16, op: 0.55 }));
  out.push(T(R, 2174, "CANNOT BE RECREATED", { a: "end", s: 16, op: 0.55 }));
  // cursive fragment, centered low
  const frag = p.fragments.filter(Boolean)[0];
  if (frag) {
    wrap(frag, 24, 2).forEach((ln, j) =>
      out.push(`<text x="${cx}" y="${2010 + j * 56}" text-anchor="middle" transform="rotate(-3 ${cx} 2010)" font-family="'Homemade Apple',cursive" font-size="38" fill="#fff" opacity=".9">${esc(ln)}</text>`),
    );
    out.push(`<line x1="${cx - 330}" y1="2150" x2="${cx + 330}" y2="2150" stroke="${GOLD}" stroke-width="1.5" opacity=".45"/>`);
  }
  // evidence strip
  const bw = 284;
  const gap = 20;
  const by = 2210;
  const bh = 120;
  const box = (i        ) => `<rect x="${L + i * (bw + gap)}" y="${by}" width="${bw}" height="${bh}" fill="none" stroke="${GOLD}" stroke-width="1" opacity=".4"/>`;
  for (let i = 0; i < 5; i++) out.push(box(i));
  const bx = (i        ) => L + i * (bw + gap);
  // 1 geometry glyph
  const g = p.faces.map((f, i) => {
    const a = (i / p.faces.length) * Math.PI * 2 - Math.PI / 2;
    const rr = 34 + f * 8;
    return `${(bx(0) + bw / 2 + Math.cos(a) * rr).toFixed(1)},${(by + bh / 2 + Math.sin(a) * rr).toFixed(1)}`;
  });
  out.push(`<polygon points="${g.join(" ")}" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity=".8"/>`);
  g.forEach((q) => out.push(`<circle cx="${q.split(",")[0]}" cy="${q.split(",")[1]}" r="3.5" fill="${BONE}"/>`));
  // 2 waveform
  const pk = (p.rooms.find((r) => r.peaks && r.peaks.length)?.peaks ?? []).slice(0, 40);
  pk.forEach((v, i) => {
    const hh = Math.max(4, Math.round(v * 80));
    out.push(`<rect x="${bx(1) + 14 + i * 6.4}" y="${by + bh / 2 - hh / 2}" width="3" height="${hh}" fill="${GOLD}" opacity=".85"/>`);
  });
  // 3 caption facsimile
  const cap = p.fragments.filter(Boolean)[1] ?? p.fragments.filter(Boolean)[0] ?? "";
  wrap(cap, 22, 2).forEach((ln, j) =>
    out.push(`<text x="${bx(2) + 18}" y="${by + 54 + j * 34}" font-family="'Homemade Apple',cursive" font-size="20" fill="#fff" opacity=".85">${esc(ln)}</text>`),
  );
  // 4 digest as dot grid
  for (let i = 0; i < 48; i++) {
    const on = byte(p.digest, i) > 0.5;
    out.push(`<circle cx="${bx(3) + 30 + (i % 12) * 20}" cy="${by + 26 + Math.floor(i / 12) * 24}" r="${on ? 4 : 2}" fill="${on ? GOLD : BONE}" opacity="${on ? 0.9 : 0.3}"/>`);
  }
  // 5 seal point
  out.push(`<circle cx="${bx(4) + bw / 2}" cy="${by + bh / 2}" r="34" fill="none" stroke="${GOLD}" stroke-width="1" opacity=".5"/><circle cx="${bx(4) + bw / 2}" cy="${by + bh / 2}" r="6" fill="${GOLD}"/>`);
  out.push(`<line x1="${bx(4) + bw / 2 - 60}" y1="${by + bh / 2}" x2="${bx(4) + bw / 2 + 60}" y2="${by + bh / 2}" stroke="${GOLD}" opacity=".4"/>`);
  out.push(T(cx, 2300, `${p.accession}  /  ONE OF ONE  /  VERSION ${p.version}`, { a: "middle", s: 15, op: 0.4 }));
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PLATE_W} ${PLATE_H}" role="img" aria-label="Accession plate ${esc(p.accession)}">` +
    out.join("") +
    `</svg>`
  );
}
