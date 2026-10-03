// The 43-quintillion moment. A field of near-invisible configurations fills
// the screen, then collapses inward until one is left, and it lights up.
// Pure canvas, no imports. Returns a cancel function. `freeze` draws one
// frame at that millisecond, for review stills.

                           
                  
                
                    
                  
                      
  

const GOLD = "200,170,118";
const BONE = "242,239,233";
const ease = (t        ) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));
const hash = (n        ) => {
  let x = (n + 1) * 2654435761;
  x = (x ^ (x >>> 15)) * 2246822519;
  x = (x ^ (x >>> 13)) * 3266489917;
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
};

export function runResolve(canvas                   , o             )             {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    o.onDone?.();
    return () => {};
  }
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.scale(dpr, dpr);
  const cs = w < 700 ? 22 : 30;
  const cols = Math.ceil(w / cs);
  const rows = Math.ceil(h / cs);
  const cx = w / 2;
  const cy = h * 0.42;
  const maxD = Math.hypot(w / 2, h / 2);
  const T = o.reduced ? { field: 600, collapse: 1400, say: 600, hold: 2200, out: 900 } : { field: 2600, collapse: 2400, say: 1400, hold: 3800, out: 1600 };
  const t1 = T.field;
  const t2 = t1 + T.collapse;
  const t3 = t2 + T.say;
  const t4 = t3 + T.hold;
  const end = t4 + T.out;
  const big = Math.min(w * 0.5, h * 0.3, 240);

  const draw = (t        ) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#080808";
    ctx.fillRect(0, 0, w, h);
    const fade = 1 - ease((t - t4) / T.out);
    const intro = ease(t / 900);
    const col = ease((t - t1) / T.collapse);
    const dot = Math.max(1.6, cs / 5);
    const step = cs / 3.4;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const id = r * cols + c;
        const x0 = c * cs + cs / 2;
        const y0 = r * cs + cs / 2;
        const d = Math.hypot(x0 - cx, y0 - cy) / maxD;
        // the collapse runs inward: far cells go first
        const gone = ease(col * 1.7 - (1 - d) * 0.7);
        const flick = 0.55 + 0.45 * Math.sin(t / (500 + hash(id) * 900) + hash(id + 9) * 6.28);
        const a = intro * flick * (1 - gone) * fade;
        if (a < 0.01) continue;
        for (let k = 0; k < 9; k++) {
          const f = Math.floor(hash(id * 9 + k) * 3);
          ctx.fillStyle = `rgba(${f === 2 ? BONE : GOLD},${(0.05 + f * 0.05) * a * 1.0})`;
          const gx = x0 + ((k % 3) - 1) * step;
          const gy = y0 + (Math.floor(k / 3) - 1) * step;
          ctx.fillRect(gx - dot / 2, gy - dot / 2, dot, dot);
        }
      }
    }
    // the one
    const rise = ease((t - t1 - T.collapse * 0.35) / (T.collapse * 0.8));
    if (rise > 0) {
      const size = (cs * 3 + (big - cs * 3) * rise) * 1;
      const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 1.6);
      gl.addColorStop(0, `rgba(${GOLD},${0.28 * rise * fade})`);
      gl.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = gl;
      ctx.fillRect(cx - size * 2, cy - size * 2, size * 4, size * 4);
      const cell = size / 3;
      for (let k = 0; k < 9; k++) {
        const f = o.faces[k] ?? 0;
        const gx = cx - size / 2 + (k % 3) * cell;
        const gy = cy - size / 2 + Math.floor(k / 3) * cell;
        const pad = cell * 0.09;
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = `rgba(${GOLD},${0.7 * rise * fade})`;
        ctx.strokeRect(gx + pad, gy + pad, cell - pad * 2, cell - pad * 2);
        if (f > 0) {
          ctx.fillStyle = f === 2 ? `rgba(${BONE},${0.85 * rise * fade})` : `rgba(${GOLD},${0.6 * rise * fade})`;
          ctx.fillRect(gx + pad, gy + pad, cell - pad * 2, cell - pad * 2);
        }
      }
    }
    // the words, then silence
    const say = ease((t - t2) / T.say) * fade;
    if (say > 0.01) {
      const line1 = o.total;
      const fs = Math.min(64, (w * 0.9) / 12.5);
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(${BONE},${say})`;
      ctx.font = `500 ${fs}px 'Cormorant Garamond',Georgia,serif`;
      ctx.fillText(line1, cx, cy + big / 2 + fs * 1.6);
      ctx.font = `italic 400 ${fs * 0.62}px 'Cormorant Garamond',Georgia,serif`;
      ctx.fillStyle = `rgba(${BONE},${say * 0.8})`;
      ctx.fillText("possible records. This one.", cx, cy + big / 2 + fs * 2.6);
    }
  };

  if (o.freeze !== undefined) {
    draw(o.freeze);
    return () => {};
  }
  let raf = 0;
  let stop = false;
  const t0 = performance.now();
  const loop = () => {
    if (stop) return;
    const t = performance.now() - t0;
    draw(t);
    if (t >= end) {
      o.onDone?.();
      return;
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => {
    stop = true;
    cancelAnimationFrame(raf);
  };
}
