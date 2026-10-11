import { reducedMotion } from "./dom";

interface Star {
  x: number;
  y: number;
  z: number;
  r: number;
  phase: number;
  hue: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

/** Full-screen animated star field with parallax, twinkle, meteors and a "warp" mode for the calculation ritual. */
export function startStarfield(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  let w = 0;
  let hgt = 0;
  let dpr = 1;
  let stars: Star[] = [];
  const meteors: Meteor[] = [];
  let mx = 0;
  let my = 0;
  let warp = 0;
  let warpTarget = 0;

  const resize = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = innerWidth;
    hgt = innerHeight;
    canvas.width = w * dpr;
    canvas.height = hgt * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${hgt}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(700, (w * hgt) / 2600));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 0.9 + 0.1,
      r: Math.random() * 1.3 + 0.2,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.15 ? 45 : Math.random() < 0.5 ? 220 : 270,
    }));
  };
  resize();
  addEventListener("resize", resize);
  window.addEventListener("pointermove", (e: PointerEvent) => {
    mx = e.clientX / w - 0.5;
    my = e.clientY / hgt - 0.5;
  });

  const still = reducedMotion();
  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min(50, now - last) / 16.67;
    last = now;
    warp += (warpTarget - warp) * 0.04 * dt;
    ctx.fillStyle = warp > 0.05 ? `rgba(5,4,15,${0.35 - warp * 0.2})` : "#05040f";
    ctx.fillRect(0, 0, w, hgt);
    const cx = w / 2;
    const cy = hgt / 2;
    const t = now / 1000;

    for (const s of stars) {
      if (!still) {
        s.z -= (0.0004 + warp * 0.02) * dt;
        if (s.z <= 0.02) {
          s.z = 1;
          s.x = Math.random() * 2 - 1;
          s.y = Math.random() * 2 - 1;
        }
      }
      const k = 0.5 / s.z;
      const px = cx + (s.x * w * k) / 2 - mx * 40 * (1 - s.z);
      const py = cy + (s.y * hgt * k) / 2 - my * 40 * (1 - s.z);
      if (px < -50 || px > w + 50 || py < -50 || py > hgt + 50) {
        s.z = 1;
        continue;
      }
      const tw = 0.55 + 0.45 * Math.sin(t * 2 + s.phase);
      const alpha = Math.min(1, (1 - s.z) * 1.4) * tw;
      const r = s.r * (1.4 - s.z);
      ctx.fillStyle = `hsla(${s.hue},90%,${s.hue === 45 ? 75 : 88}%,${alpha})`;
      if (warp > 0.05) {
        const len = warp * 30 * (1 - s.z);
        const dx = px - cx;
        const dy = py - cy;
        const d = Math.hypot(dx, dy) || 1;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = r;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - (dx / d) * len, py - (dy / d) * len);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (!still && Math.random() < 0.004 * dt && meteors.length < 3) {
      const fromLeft = Math.random() < 0.5;
      meteors.push({
        x: fromLeft ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
        y: Math.random() * hgt * 0.4,
        vx: (fromLeft ? 1 : -1) * (8 + Math.random() * 6),
        vy: 4 + Math.random() * 3,
        life: 1,
      });
    }
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i]!;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.life -= 0.012 * dt;
      const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 12, m.y - m.vy * 12);
      g.addColorStop(0, `rgba(255,236,190,${m.life})`);
      g.addColorStop(1, "rgba(255,236,190,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 12, m.y - m.vy * 12);
      ctx.stroke();
      if (m.life <= 0) meteors.splice(i, 1);
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  return {
    setWarp(on: boolean) {
      warpTarget = on ? 1 : 0;
    },
  };
}
