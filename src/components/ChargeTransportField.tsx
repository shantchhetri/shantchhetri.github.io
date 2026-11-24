import { useEffect, useRef } from 'react';

/**
 * Hero wallpaper (no text): charge transport in an organic semiconductor film.
 *
 * A thin film seen in perspective: planar NDI-type molecules in a brickwork
 * arrangement lie between a gold SOURCE and DRAIN electrode. Electrons are
 * injected at the source and move by thermally activated HOPPING between
 * neighbouring molecules, biased towards the drain by the applied field.
 * Each site has a random energy (energetic disorder): low-energy "trap"
 * sites hold an electron longer. An occupied molecule glows; electrons
 * reaching the drain are collected and re-injected at the source.
 *
 * Pre-renders the molecule once; draws a static frame for reduced-motion
 * users and pauses when off-screen.
 */

type Site = { u: number; v: number; e: number; rot: number; ph: number; glow: number; nb: number[] };
type Carrier = { at: number; to: number; t: number; dwell: number; prev: number; trail: [number, number][]; fade: number };

/** Colours for the white page (light) and for dark mode. Each value is an "r,g,b" string. */
const PALETTE = {
  light: { bond: '208,111,80', bondA: 0.55, shadow: '240,166,139', blur: 3, atomMid: '240,166,139', atomEdge: '176,87,59', net: '208,111,80', netA: 0.1, glow: '240,166,139', glowA: 0.4, trail: '229,138,107', halo: '240,166,139', core: '176,87,59', gold: '217,119,6', goldA: 0.28 },
  dark: { bond: '250,211,196', bondA: 0.55, shadow: '240,166,139', blur: 8, atomMid: '246,188,166', atomEdge: '229,138,107', net: '246,188,166', netA: 0.06, glow: '246,188,166', glowA: 0.45, trail: '253,232,224', halo: '240,166,139', core: '255,255,255', gold: '250,204,21', goldA: 0.22 },
};
type Pal = (typeof PALETTE)['light'];

// one naphthalene-diimide-like core, drawn once to an off-screen canvas
function moleculeSprite(pal: Pal): HTMLCanvasElement {
  const c = document.createElement('canvas');
  const W = 220;
  const H = 120;
  c.width = W * 2;
  c.height = H * 2;
  const g = c.getContext('2d')!;
  g.scale(2, 2);
  g.translate(W / 2, H / 2);
  const r = 18;
  const dx = r * Math.sqrt(3);
  const ring = (cx: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = Math.PI / 6 + (Math.PI / 3) * i;
      return [cx + r * Math.cos(a), r * Math.sin(a)] as [number, number];
    });
  const A = ring(-dx / 2);
  const B = ring(dx / 2);
  const atoms: [number, number, number][] = [...A, ...B].map(([x, y]) => [x, y, 3.4]);
  const bonds: [[number, number], [number, number]][] = [];
  for (let i = 0; i < 6; i++) {
    bonds.push([A[i], A[(i + 1) % 6]], [B[i], B[(i + 1) % 6]]);
  }
  // imide rings: N and carbonyl O on both ends
  for (const s of [-1, 1]) {
    const N: [number, number] = [s * dx * 1.55, 0];
    const O1: [number, number] = [s * dx * 1.2, -r * 1.3];
    const O2: [number, number] = [s * dx * 1.2, r * 1.3];
    const ringTop = s < 0 ? A[3] : B[5];
    const ringBot = s < 0 ? A[2] : B[0];
    bonds.push([ringTop, O1], [ringBot, O2], [O1, N], [O2, N], [N, [s * dx * 2.25, 0]]);
    atoms.push([N[0], N[1], 4.6], [O1[0], O1[1], 3.8], [O2[0], O2[1], 3.8], [s * dx * 2.25, 0, 2.6]);
  }
  g.lineCap = 'round';
  g.strokeStyle = `rgba(${pal.bond},${pal.bondA})`;
  g.lineWidth = 2.2;
  g.shadowColor = `rgba(${pal.shadow},0.9)`;
  g.shadowBlur = pal.blur;
  g.beginPath();
  for (const [p, q] of bonds) {
    g.moveTo(p[0], p[1]);
    g.lineTo(q[0], q[1]);
  }
  g.stroke();
  for (const [x, y, rad] of atoms) {
    const grd = g.createRadialGradient(x - rad * 0.3, y - rad * 0.3, 0.2, x, y, rad);
    grd.addColorStop(0, 'rgba(255,255,255,0.95)');
    grd.addColorStop(0.5, `rgba(${pal.atomMid},0.85)`);
    grd.addColorStop(1, `rgba(${pal.atomEdge},0.55)`);
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, rad, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

export function ChargeTransportField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sprites = { light: moleculeSprite(PALETTE.light), dark: moleculeSprite(PALETTE.dark) };
    let pal: Pal = PALETTE.light;
    let mol = sprites.light;

    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let sites: Site[] = [];
    let carriers: Carrier[] = [];
    let C = 15;
    let R = 8;

    // seeded random so the film looks the same on every visit
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    /** Perspective projection of film coordinates (u: source→drain, v: far→near). */
    const P = (u: number, v: number) => {
      const t = v;
      const mobile = w < 760;
      const horizon = h * (mobile ? 0.42 : 0.3);
      const bottom = h * 1.02;
      const y = horizon + (bottom - horizon) * (0.6 * t + 0.4 * t * t);
      const spread = 0.82 + 0.33 * t; // gentle perspective
      const x = w * 0.5 + (u - 0.5) * w * (mobile ? 1.15 : 0.92) * spread;
      return { x, y, s: 0.62 + 0.45 * t, a: 0.35 + 0.65 * t };
    };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      C = w < 760 ? 6 : 11;
      R = w < 760 ? 5 : 6;
      seed = 7;
      sites = [];
      for (let i = 0; i < R; i++) {
        for (let j = 0; j < C; j++) {
          const off = i % 2 ? 0.5 : 0; // brickwork: alternate rows shifted by half a molecule
          sites.push({
            u: (j + off) / (C - 0.5) + (rnd() - 0.5) * 0.012,
            v: i / (R - 1) + (rnd() - 0.5) * 0.02,
            e: rnd(), // site energy (0 = deep trap)
            rot: (rnd() - 0.5) * 0.35,
            ph: rnd() * 6.28,
            glow: 0,
            nb: [],
          });
        }
      }
      const du = 1.05 / (C - 0.5);
      const dv = 1.1 / (R - 1);
      sites.forEach((a, ia) => {
        sites.forEach((b, ib) => {
          if (ia !== ib && Math.abs(a.u - b.u) <= du && Math.abs(a.v - b.v) <= dv) a.nb.push(ib);
        });
      });
      const n = w < 760 ? 6 : 10;
      carriers = Array.from({ length: n }, () => spawn(true));
    };

    function spawn(anywhere = false): Carrier {
      const pool = sites.map((s, i) => [s, i] as const).filter(([s]) => (anywhere ? s.u < 0.85 : s.u < 0.06));
      const [, i] = pool[Math.floor(Math.random() * pool.length)];
      return { at: i, to: -1, t: 0, dwell: 200 + Math.random() * 900, prev: -1, trail: [], fade: anywhere ? 1 : 0 };
    }

    function pickNext(c: Carrier) {
      const s = sites[c.at];
      const weights = s.nb.map((k) => {
        const n = sites[k];
        const drift = Math.exp(3.2 * (n.u - s.u) * (C - 1)); // field pushes electrons towards the drain
        const energy = 0.6 + (1 - n.e) * 0.8; // downhill hops are easier
        const occupied = carriers.some((o) => o !== c && (o.at === k || o.to === k)) ? 0.05 : 1;
        return drift * energy * occupied * (k === c.prev ? 0.25 : 1);
      });
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r <= 0) return s.nb[i];
      }
      return s.nb[s.nb.length - 1];
    }

    const electrode = (u0: number) => {
      const a = P(u0 - 0.012, -0.05);
      const b = P(u0 + 0.012, -0.05);
      const c2 = P(u0 + 0.012, 1.02);
      const d = P(u0 - 0.012, 1.02);
      const grd = ctx.createLinearGradient(0, a.y, 0, d.y);
      grd.addColorStop(0, `rgba(${pal.gold},0.04)`);
      grd.addColorStop(1, `rgba(${pal.gold},${pal.goldA})`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(c2.x, c2.y);
      ctx.lineTo(d.x, d.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(${pal.gold},0.35)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const draw = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      ctx.clearRect(0, 0, w, h);
      const dark = document.documentElement.classList.contains('dark');
      pal = dark ? PALETTE.dark : PALETTE.light;
      mol = dark ? sprites.dark : sprites.light;

      // coupling network (transfer integrals between neighbours)
      ctx.lineWidth = 1;
      for (let si = 0; si < sites.length; si++) {
        const s = sites[si];
        const p = P(s.u, s.v);
        for (const k of s.nb) {
          if (k < si) continue; // draw each bond once
          const q = P(sites[k].u, sites[k].v);
          ctx.strokeStyle = `rgba(${pal.net},${pal.netA * p.a})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      electrode(-0.04); // source
      electrode(1.04); // drain

      // molecules, far to near; a molecule glows while an electron sits on it
      const occupied = new Set(carriers.filter((c) => c.to === -1).map((c) => c.at));
      for (let si = 0; si < sites.length; si++) {
        const s = sites[si];
        const p = P(s.u, s.v);
        const bob = reduce ? 0 : Math.sin(now / 1400 + s.ph) * 1.2 * p.s;
        const target = occupied.has(si) ? 1 : 0;
        s.glow = reduce ? target : s.glow + (target - s.glow) * Math.min(1, dt / 160);
        if (s.glow > 0.02) {
          const rg = ctx.createRadialGradient(p.x, p.y + bob, 0, p.x, p.y + bob, 46 * p.s);
          rg.addColorStop(0, `rgba(${pal.glow},${pal.glowA * s.glow})`);
          rg.addColorStop(1, `rgba(${pal.glow},0)`);
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.arc(p.x, p.y + bob, 46 * p.s, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.save();
        ctx.globalAlpha = (0.22 + 0.5 * p.a) * (0.75 + 0.5 * s.glow);
        ctx.translate(p.x, p.y + bob);
        ctx.rotate(s.rot);
        const ms = (w < 760 ? 0.4 : 0.5) * p.s;
        ctx.scale(ms, ms * 0.62); // flattened: molecules lie in the film plane
        ctx.drawImage(mol, -mol.width / 2, -mol.height / 2);
        ctx.restore();
      }

      // electrons
      for (let ci = 0; ci < carriers.length; ci++) {
        const c = carriers[ci];
        c.fade = Math.min(1, c.fade + dt / 500);
        let x: number;
        let y: number;
        let sc: number;
        if (c.to === -1) {
          if (!reduce) c.dwell -= dt;
          const s = sites[c.at];
          const p = P(s.u, s.v);
          x = p.x;
          y = p.y - 4 * p.s;
          sc = p.s;
          if (c.dwell <= 0) {
            c.to = pickNext(c);
            c.t = 0;
          }
        } else {
          c.t += dt / 300;
          const a = P(sites[c.at].u, sites[c.at].v);
          const b = P(sites[c.to].u, sites[c.to].v);
          const k = c.t < 0.5 ? 2 * c.t * c.t : 1 - Math.pow(-2 * c.t + 2, 2) / 2;
          x = a.x + (b.x - a.x) * k;
          y = a.y + (b.y - a.y) * k - Math.sin(Math.PI * Math.min(1, c.t)) * 14 * a.s - 4 * a.s;
          sc = a.s + (b.s - a.s) * k;
          if (c.t >= 1) {
            c.prev = c.at;
            c.at = c.to;
            c.to = -1;
            const e = sites[c.at].e;
            c.dwell = 250 + (1 - e) * 1500 + Math.random() * 300; // deep traps hold charge longer
            if (sites[c.at].u > 0.97) carriers[ci] = spawn(); // collected at the drain → re-inject
          }
        }
        c.trail.push([x, y]);
        if (c.trail.length > 20) c.trail.shift();

        // trail
        for (let i = 1; i < c.trail.length; i++) {
          ctx.strokeStyle = `rgba(${pal.trail},${(i / c.trail.length) * 0.55 * c.fade})`;
          ctx.lineWidth = 2.4 * sc;
          ctx.beginPath();
          ctx.moveTo(c.trail[i - 1][0], c.trail[i - 1][1]);
          ctx.lineTo(c.trail[i][0], c.trail[i][1]);
          ctx.stroke();
        }
        // halo + core
        const halo = ctx.createRadialGradient(x, y, 0, x, y, 22 * sc);
        halo.addColorStop(0, `rgba(${pal.trail},${0.9 * c.fade})`);
        halo.addColorStop(0.35, `rgba(${pal.halo},${0.35 * c.fade})`);
        halo.addColorStop(1, `rgba(${pal.halo},0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, 22 * sc, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${pal.core},${c.fade})`;
        ctx.beginPath();
        ctx.arc(x, y, 3.4 * sc, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      if (visible) draw(now);
      else last = now;
      raf = requestAnimationFrame(loop);
    };

    build();
    if (reduce) draw(performance.now()); // static frame: electrons resting on glowing molecules
    else raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      build();
      if (reduce) draw(performance.now());
    });
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
