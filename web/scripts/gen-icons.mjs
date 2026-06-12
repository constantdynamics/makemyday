// Generates Make My Day PWA icons as PNGs (no native deps; pure-JS raster + pngjs).
// Full-bleed brand gradient background + a compass needle, kept inside the
// maskable safe zone (center 80%). Supersampled for clean anti-aliased edges.
import { PNG } from 'pngjs';
import { writeFileSync } from 'node:fs';

const C1 = [124, 92, 255]; // brand-500 #7c5cff
const C2 = [239, 75, 189]; // accent-500 #ef4bbd

const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];

// signed area sign test for point-in-triangle
function inTri(px, py, ax, ay, bx, by, cx, cy) {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

// Returns [r,g,b,a] (0..255) for a point in the unsupersampled coordinate space.
function sample(x, y, S) {
  const cx = S / 2,
    cy = S / 2;
  // background gradient (diagonal)
  const t = (x + y) / (2 * S);
  let [r, g, b] = mix(C1, C2, t);
  let a = 255;

  const dx = x - cx,
    dy = y - cy;
  const dist = Math.hypot(dx, dy);

  // compass ring
  const ringR = S * 0.3;
  const ringW = S * 0.045;
  if (Math.abs(dist - ringR) < ringW / 2) {
    [r, g, b] = [255, 255, 255];
  }

  // needle (two triangles meeting at center)
  const len = S * 0.225;
  const half = S * 0.062;
  const northN = inTri(x, y, cx, cy - len, cx - half, cy, cx + half, cy);
  const southN = inTri(x, y, cx, cy + len, cx - half, cy, cx + half, cy);
  if (northN) {
    [r, g, b] = [255, 255, 255];
  } else if (southN) {
    // translucent south wing over gradient
    [r, g, b] = mix([r, g, b], [255, 255, 255], 0.55);
  }

  // center hub
  if (dist < S * 0.028) [r, g, b] = [255, 255, 255];

  return [r, g, b, a];
}

function render(size) {
  const ss = Math.max(2, Math.round(1200 / size)); // supersample factor
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const fx = ((x + (sx + 0.5) / ss) / size) * size;
          const fy = ((y + (sy + 0.5) / ss) / size) * size;
          const px = sample(fx, fy, size);
          r += px[0];
          g += px[1];
          b += px[2];
          a += px[3];
        }
      }
      const n = ss * ss;
      const idx = (size * y + x) << 2;
      png.data[idx] = Math.round(r / n);
      png.data[idx + 1] = Math.round(g / n);
      png.data[idx + 2] = Math.round(b / n);
      png.data[idx + 3] = Math.round(a / n);
    }
  }
  return PNG.sync.write(png);
}

const targets = [
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
  ['public/apple-touch-icon.png', 180],
];
for (const [path, size] of targets) {
  writeFileSync(path, render(size));
  console.log('wrote', path, size + 'x' + size);
}
