import React from 'react';
import {AbsoluteFill, interpolateColors} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, mix, ramp, rand} from '../anim';
import {Formula, Glow, Label, Motes, Ripple, Spark, Stage, Stream, Sub, Sup, TSub, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {ATOM, C, FONT} from '../theme';

// Dari orbit ke orbital: orbit Bohr yang tajam larut menjadi awan peluang (titik disampel dari |ψ₁ₛ|² ∝ e^(−2r/a₀):
// jari-jari 3D ~ Gamma(3, a₀/2) → distribusi radial r²e^(−2r/a₀), puncak di a₀), lalu bentuk orbital 1s / 2p (p_x, p_y, p_z
// berputar semu-3D, fase ± ungu/emas, bidang simpul) / 3d_xy (empat cuping), lalu orbital menentukan ikatan (H₂),
// sudut ikatan (H₂O 104,5°), dan blok s/p/d tabel periodik; penutup: portal "kimia kuantum dimulai".

const PLUS = C.spr;
const MINUS = C.gold;

/** Muncul pada a lalu selesai menghilang tepat di b (kartu bergantian di satu tempat tanpa tumpang-tindih). */
const slot = (t: number, a: number, b: number, fi = 0.6, fo = 0.5) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));

/** Titik 3D (satuan a₀) dari kerapatan 1s: r = −½ ln(u₁u₂u₃) ~ Gamma(3, ½), arah acak seragam. */
const g3 = (s: number): [number, number, number] => {
  const u1 = 0.001 + 0.999 * rand(s * 1.37 + 0.11);
  const u2 = 0.001 + 0.999 * rand(s * 2.71 + 0.53);
  const u3 = 0.001 + 0.999 * rand(s * 3.91 + 0.97);
  const r = Math.min(4.2, -0.5 * Math.log(u1 * u2 * u3));
  const cz = 2 * rand(s * 5.17 + 1.3) - 1;
  const ph = 2 * Math.PI * rand(s * 7.33 + 2.9);
  const sz = Math.sqrt(1 - cz * cz);
  return [r * sz * Math.cos(ph), r * sz * Math.sin(ph), r * cz];
};

/**
 * Awan peluang: setiap titik = satu "tempat elektron mungkin ditemukan", muncul-hilang (cyc) lalu disampel ulang saat tak terlihat.
 * d < 1 → titik masih menempel ke cincin orbit Bohr (jari-jari R px), d = 1 → awan penuh.
 */
const Cloud: React.FC<{
  t: number;
  x: number;
  y: number;
  a: number;
  n: number;
  seed: number;
  opacity: number;
  d?: number;
  R?: number;
  color?: string;
  r?: number;
  keep?: number;
  keepFade?: number;
}> = ({t, x, y, a, n, seed, opacity, d = 1, R = 0, color = C.spr, r = 2.4, keep = n, keepFade = 1}) => {
  if (opacity <= 0.01) return null;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const f = i < keep ? 1 : keepFade;
    if (f < 0.02) continue;
    const rate = 0.45 + 0.4 * rand(i * 3.3 + seed * 7.7);
    const raw = t * rate + rand(i * 1.7 + seed * 5.1);
    const k = Math.floor(raw);
    const o = cyc(raw - k);
    if (o < 0.03) continue;
    const [px, py, pz] = g3(seed * 1013 + i * 31.7 + k * 7.31);
    let X = px;
    let Y = py;
    if (d < 1) {
      const ang = Math.atan2(py, px);
      X = mix((Math.cos(ang) * R) / a, px, d);
      Y = mix((Math.sin(ang) * R) / a, py, d);
    }
    const depth = 0.75 + 0.25 * Math.max(-1, Math.min(1, pz / 2));
    out.push(<circle key={i} cx={x + a * X} cy={y + a * Y} r={r * depth} fill={color} opacity={o * depth * opacity * f} />);
  }
  return <g>{out}</g>;
};

/** Kerapatan ikatan H₂: titik ekstra terkumpul di antara dua inti (sebaran Gauss). */
const BondDots: React.FC<{t: number; x: number; y: number; sx: number; sy: number; n: number; opacity: number}> = ({t, x, y, sx, sy, n, opacity}) => {
  if (opacity <= 0.01) return null;
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const raw = t * (0.5 + 0.4 * rand(i * 2.3)) + rand(i * 4.1 + 3);
        const k = Math.floor(raw);
        const o = cyc(raw - k);
        if (o < 0.03) return null;
        const s = i * 17.3 + k * 5.9;
        const rr = Math.sqrt(-2 * Math.log(0.001 + 0.999 * rand(s + 0.7)));
        const th = 2 * Math.PI * rand(s * 1.9 + 2.2);
        return <circle key={i} cx={x + sx * rr * Math.cos(th)} cy={y + sy * rr * Math.sin(th)} r={2.3} fill="#d8b8ff" opacity={o * opacity * 0.9} />;
      })}
    </g>
  );
};

/** Proyeksi semu-3D: putar sumbu z (th), lalu condong al (dilihat sedikit dari atas). */
const proj = (v: [number, number, number], th: number, al: number) => {
  const [x, y, z] = v;
  const x1 = x * Math.cos(th) - y * Math.sin(th);
  const y1 = x * Math.sin(th) + y * Math.cos(th);
  return {sx: x1, sy: -(z * Math.cos(al) + y1 * Math.sin(al)), d: -y1 * Math.cos(al) + z * Math.sin(al)};
};

/** Path satu cuping yang menunjuk ke +x lokal (panjang L, setengah lebar W). */
const lobePath = (L: number, W: number) =>
  `M0,0 C${(L * 0.22).toFixed(1)},${W.toFixed(1)} ${(L * 0.95).toFixed(1)},${(W * 1.08).toFixed(1)} ${L.toFixed(1)},0 C${(L * 0.95).toFixed(1)},${(-W * 1.08).toFixed(1)} ${(L * 0.22).toFixed(1)},${(-W).toFixed(1)} 0,0 Z`;

/** Cuping yang diproyeksikan: arah layar (ux, uy) dengan panjang terlihat ls (0..1). */
const Lobe: React.FC<{x: number; y: number; ux: number; uy: number; L: number; W: number; plus: boolean; opacity: number; sw?: number}> = ({x, y, ux, uy, L, W, plus, opacity, sw = 2}) => {
  const ls = Math.hypot(ux, uy);
  const Le = Math.max(L * ls, W * 0.95);
  const ang = (Math.atan2(uy, ux) * 180) / Math.PI;
  const shift = -(1 - ls) * Le * 0.45;
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang}) translate(${shift} 0)`} opacity={opacity}>
      <path d={lobePath(Le, W)} fill={`url(#orb-${plus ? 'p' : 'm'})`} stroke={plus ? PLUS : MINUS} strokeWidth={sw} strokeOpacity={0.9} />
    </g>
  );
};

/** Tiga orbital 2p (p_x, p_y, p_z) berputar bersama; sorotan berpindah halus x → y → z. */
const P2Triad: React.FC<{t: number; x: number; y: number; s: number}> = ({t, x, y, s}) => {
  const th = 0.42 * t + 0.6;
  const al = 0.4;
  const L = 122 * s * (1 + 0.03 * Math.sin(t * 1.6));
  const W = 50 * s;
  const axes: {v: [number, number, number]; name: string}[] = [
    {v: [1, 0, 0], name: 'x'},
    {v: [0, 1, 0], name: 'y'},
    {v: [0, 0, 1], name: 'z'},
  ];
  const w = axes.map((_, k) => 0.28 + 0.72 * Math.pow(0.5 + 0.5 * Math.cos(2 * Math.PI * (t / 7.5 - k / 3)), 2));
  const lobes = axes.flatMap((a, k) =>
    [1, -1].map((sg) => {
      const P = proj([a.v[0] * sg, a.v[1] * sg, a.v[2] * sg], th, al);
      return {k, sg, P};
    }),
  );
  lobes.sort((A, B) => A.P.d - B.P.d);
  return (
    <g>
      {/* bidang simpul (tegak lurus sumbu), makin jelas untuk orbital yang disorot */}
      {axes.map((a, k) => {
        const o = a.v;
        const e1: [number, number, number] = o[0] ? [0, 1, 0] : [1, 0, 0];
        const e2: [number, number, number] = o[2] ? [0, 1, 0] : [0, 0, 1];
        const Rn = 0.95 * L;
        const pts = [
          [1, 1],
          [1, -1],
          [-1, -1],
          [-1, 1],
        ].map(([p, q]) => {
          const P = proj([(e1[0] * p + e2[0] * q) * Rn, (e1[1] * p + e2[1] * q) * Rn, (e1[2] * p + e2[2] * q) * Rn], th, al);
          return `${(x + P.sx).toFixed(1)},${(y + P.sy).toFixed(1)}`;
        });
        const hi = (w[k] - 0.28) / 0.72;
        return <polygon key={a.name} points={pts.join(' ')} fill={C.heat} fillOpacity={0.07 * hi} stroke={C.heat} strokeOpacity={0.5 * hi} strokeWidth={1.6} strokeDasharray="7 7" />;
      })}
      {lobes.map(({k, sg, P}) => (
        <Lobe key={`${k}${sg}`} x={x} y={y} ux={P.sx} uy={P.sy} L={L} W={W} plus={sg > 0} opacity={w[k] * (0.72 + 0.28 * (P.d + 1) * 0.5)} />
      ))}
      <circle cx={x} cy={y} r={5} fill={C.heat} />
      {axes.map((a, k) => {
        const P = proj(a.v, th, al);
        const ls = Math.max(0.35, Math.hypot(P.sx, P.sy));
        const hi = (w[k] - 0.28) / 0.72;
        return (
          <g key={a.name}>
            <Label x={x + (P.sx / ls) * (L * ls + 30)} y={y + (P.sy / ls) * (L * ls + 30)} size={30} color={C.ink} weight={700} opacity={0.35 + 0.65 * hi} font="serif" italic>
              p<TSub>{a.name}</TSub>
            </Label>
            <Label x={x + P.sx * L * 0.62} y={y + P.sy * L * 0.62} size={26} color="#fff" weight={700} opacity={hi * Math.max(0, Math.hypot(P.sx, P.sy) - 0.3)}>
              +
            </Label>
            <Label x={x - P.sx * L * 0.62} y={y - P.sy * L * 0.62} size={26} color="#fff" weight={700} opacity={hi * Math.max(0, Math.hypot(P.sx, P.sy) - 0.3)}>
              −
            </Label>
          </g>
        );
      })}
    </g>
  );
};

/** Orbital 3d_xy: empat cuping di antara sumbu, fase berselang-seling, dua bidang simpul (sumbu x & y). */
const D3: React.FC<{t: number; x: number; y: number; s: number; L?: number; W?: number; labels?: boolean}> = ({t, x, y, s, L = 120, W = 44, labels = true}) => {
  const rot = 10 * t;
  const sq = 0.8 + 0.12 * Math.sin(t * 0.55);
  const l = L * s * (1 + 0.03 * Math.sin(t * 1.5));
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${sq.toFixed(3)}) rotate(${rot.toFixed(2)})`}>
      <line x1={-l * 1.05} y1={0} x2={l * 1.05} y2={0} stroke={C.heat} strokeWidth={2} strokeDasharray="7 7" strokeOpacity={0.6} />
      <line x1={0} y1={-l * 1.05} x2={0} y2={l * 1.05} stroke={C.heat} strokeWidth={2} strokeDasharray="7 7" strokeOpacity={0.6} />
      {[45, 135, 225, 315].map((a, k) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d={lobePath(l, W * s)} fill={`url(#orb-${k % 2 ? 'm' : 'p'})`} stroke={k % 2 ? MINUS : PLUS} strokeWidth={2} />
          {labels ? (
            <text x={l * 0.6} y={0} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={24} fill="#fff" transform={`rotate(${-a - rot} ${l * 0.6} 0)`}>
              {k % 2 ? '−' : '+'}
            </text>
          ) : null}
        </g>
      ))}
      <circle cx={0} cy={0} r={5} fill={C.heat} />
    </g>
  );
};

// tabel periodik mini (periode 1–4)
const SYM = [
  ['H', ...Array(16).fill(''), 'He'],
  ['Li', 'Be', ...Array(10).fill(''), 'B', 'C', 'N', 'O', 'F', 'Ne'],
  ['Na', 'Mg', ...Array(10).fill(''), 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'],
  ['K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr'],
];
const blockOf = (row: number, col: number) => (col < 2 || (row === 0 && col === 17) ? 's' : col >= 12 ? 'p' : 'd');
const BLOCK = {s: {c: C.spr, delay: 0}, p: {c: C.gold, delay: 0.45}, d: {c: C.pot, delay: 0.9}} as const;

const PTable: React.FC<{t: number; x: number; y: number; on: number; lit: number}> = ({t, x, y, on, lit}) => {
  const pitch = 27;
  const cs = 24;
  const x0 = x - (18 * pitch - 3) / 2;
  const y0 = y - (4 * pitch - 3) / 2;
  const cells: React.ReactNode[] = [];
  SYM.forEach((row, r) =>
    row.forEach((sym, c) => {
      if (!sym) return;
      const b = blockOf(r, c);
      const L = ramp(lit, BLOCK[b].delay + c * 0.03 + r * 0.05, BLOCK[b].delay + c * 0.03 + r * 0.05 + 0.5);
      const col = BLOCK[b].c;
      const tw = 0.85 + 0.15 * Math.sin(t * 2 + c * 0.6 + r);
      cells.push(
        <g key={`${r}-${c}`}>
          <rect x={x0 + c * pitch} y={y0 + r * pitch} width={cs} height={cs} rx={4} fill={col} fillOpacity={0.05 + 0.5 * L * tw} stroke={interpolateColors(L, [0, 1], [C.muted, col])} strokeOpacity={0.35 + 0.5 * L} strokeWidth={1.3} />
          <text x={x0 + c * pitch + cs / 2} y={y0 + r * pitch + cs / 2 + 0.5} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.sans} fontWeight={600} fontSize={sym.length > 1 ? 10.5 : 12} fill="#fff" opacity={0.45 + 0.55 * L}>
            {sym}
          </text>
        </g>,
      );
    }),
  );
  const ls = ramp(lit, 0, 0.5);
  const lp = ramp(lit, 0.45, 0.95);
  const ld = ramp(lit, 0.9, 1.4);
  const xs = x0 + pitch - 1.5;
  const xp = x0 + 15 * pitch - 1.5;
  const xd = x0 + 7 * pitch - 1.5;
  return (
    <g opacity={on} transform={`translate(${x} ${y}) scale(1.2) translate(${-x} ${-y})`}>
      <Glow x={x} y={y} r={300} color="spr" opacity={0.25 * lit} />
      {cells}
      {/* label blok + ikon orbital yang mengisinya */}
      <g opacity={0.4 + 0.6 * ls}>
        <circle cx={xs} cy={y0 - 66} r={13 * (1 + 0.06 * Math.sin(t * 2))} fill="url(#orb-p)" stroke={PLUS} strokeWidth={1.5} />
        <Label x={xs} y={y0 - 28} size={24} color={C.spr} weight={700}>
          blok s
        </Label>
      </g>
      <g opacity={0.4 + 0.6 * lp}>
        <g transform={`translate(${xp} ${y0 - 66}) rotate(${90 + 20 * Math.sin(t * 0.9)})`}>
          <path d={lobePath(22, 9)} fill="url(#orb-p)" stroke={PLUS} strokeWidth={1.5} />
          <path d={lobePath(22, 9)} transform="rotate(180)" fill="url(#orb-m)" stroke={MINUS} strokeWidth={1.5} />
        </g>
        <Label x={xp} y={y0 - 28} size={24} color={C.gold} weight={700}>
          blok p
        </Label>
      </g>
      <g opacity={0.4 + 0.6 * ld}>
        <D3 t={t} x={xd} y={y0 + 30} s={1} L={22} W={8} labels={false} />
        <Label x={xd} y={y0 + 66} size={24} color={C.pot} weight={700}>
          blok d
        </Label>
      </g>
    </g>
  );
};

// portal: spiral aliran ke pusat
const PC = {x: 960, y: 440};
const SPIRALS: [number, number][][] = Array.from({length: 8}, (_, k) =>
  Array.from({length: 18}, (_, j) => {
    const u = j / 17;
    const rr = 440 * (1 - u) + 24;
    const a = (k * Math.PI) / 4 + u * 2.4;
    return [PC.x + rr * Math.cos(a), PC.y + rr * 0.62 * Math.sin(a)] as [number, number];
  }),
);
const RING_WORDS = ['Ĥψ = Eψ', 'n · ℓ · mℓ', 'spin', 'orbital molekul', 'hibridisasi', 'ψ(r, θ, φ)'];

export const Orbitals: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const intro = ramp(t, -0.6, 0.6);
  const tDis = wordOf(0, 'lintasan') - 0.3;
  const d = ramp(t, tDis, tDis + 2.8, EASE_IN_OUT);
  const tAwan = wordOf(1, 'awan');
  const t1s = wordOf(2, 'satu');
  const t2p = wordOf(2, 'dua');
  const t3d = wordOf(2, 'tiga');
  const tBond = Math.max(cue(3) + 1.2, wordOf(3, 'berikatan'));
  const tAng = Math.max(tBond + 1.2, wordOf(3, 'sudut'));
  const tSus = Math.max(tAng + 1.2, wordOf(3, 'susunan'));
  const tTab = Math.max(tSus + 0.3, wordOf(3, 'tabel'));
  const tEnd = Math.max(cue(4) + 0.6, wordOf(4, 'berakhir'));
  const tKim = Math.max(tEnd + 0.6, wordOf(4, 'kimia'));

  // awan 1s: tengah → kiri (bersama grafik) → panel 1s → atom H pertama di H₂
  const mA = ramp(t, cue(1) - 0.2, cue(1) + 1.2, EASE_IN_OUT);
  const mB = ramp(t, cue(2) - 0.7, cue(2) + 0.6, EASE_IN_OUT);
  const mC = ramp(t, tBond - 1.3, tBond - 0.2, EASE_IN_OUT);
  const pb = ramp(t, tBond - 0.3, tBond + 1.8, EASE_IN_OUT);
  const pD = ramp(t, cue(4) - 0.5, cue(4) + 0.9, EASE_IN_OUT);
  const cxA = mix(mix(mix(960, 640, mA), 400, mB), mix(260, 358, pb), mC);
  const cyA = mix(540, 470, mB);
  const aA = mix(mix(110, 70, mB), 60, mC);
  const dotCol = interpolateColors(d, [0, 1], [C.pot, C.spr]);

  // elektron Bohr
  const om = 2.4;
  const ePos = (a: number): [number, number] => [cxA + aA * Math.cos(a), cyA - aA * Math.sin(a)];
  const eA = t * om;
  const trail = Array.from({length: 8}, (_, k) => ePos(eA - (k + 1) * 0.08));

  // fase A kanan
  const opR = slot(t, tAwan - 0.4, cue(2) - 0.1);
  const pF = slot(t, tAwan + 0.6, cue(2) - 0.1);
  const opPlot = slot(t, tAwan + 1.2, cue(2) - 0.1);
  const drawP = ramp(t, tAwan + 1.2, tAwan + 2.8, EASE_IN_OUT);
  const PX0 = 1110;
  const PY0 = 770;
  const PWd = 480;
  const PHt = 190;
  const pr = (r: number) => r * r * Math.exp(-2 * r) / Math.exp(-2);
  const nPl = 60;
  const plotPts = Array.from({length: nPl + 1}, (_, i) => {
    const r = (5 * i) / nPl;
    return [PX0 + (r / 5) * PWd, PY0 - pr(r) * PHt] as [number, number];
  });
  const plotD = plotPts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const probeR = 2.5 + 2.2 * Math.sin(t * 0.9);
  const probe: [number, number] = [PX0 + (probeR / 5) * PWd, PY0 - pr(probeR) * PHt];

  // fase B
  const o1 = slot(t, t1s - 0.3, tBond - 1.0);
  const o2 = slot(t, t2p - 0.3, tAng - 0.4);
  const s2 = 0.75 + 0.25 * ramp(t, t2p - 0.3, t2p + 0.6, BACK);
  const o3 = slot(t, t3d - 0.3, tSus - 0.3);
  const s3 = 0.75 + 0.25 * ramp(t, t3d - 0.3, t3d + 0.6, BACK);
  const oLeg = slot(t, t2p + 0.6, tBond - 0.8);

  // fase C
  const oB = ramp(t, tBond - 0.9, tBond - 0.1);
  const oH = ramp(t, tBond + 0.6, tBond + 1.4);
  const oW = ramp(t, tAng - 0.4, tAng + 0.4);
  const sW = 0.8 + 0.2 * ramp(t, tAng - 0.4, tAng + 0.5, BACK);
  const arcP = ramp(t, tAng + 0.3, tAng + 1.2, EASE_IN_OUT);
  const oT = ramp(t, tSus - 0.3, tSus + 0.4);
  const lit = Math.max(0, t - (tTab - 0.6));

  // fase D
  const oP = ramp(t, cue(4) - 0.2, cue(4) + 1.3);
  const tx1 = ramp(t, tEnd - 0.5, tEnd + 0.3);
  const tx2 = ramp(t, tKim - 0.3, tKim + 0.6);
  const tx2s = ramp(t, tKim - 0.3, tKim + 0.7, BACK);
  const panels = 1 - pD;
  const sc = 1 - 0.45 * pD;

  // H₂O
  const OX = 960;
  const OY = 425;
  const bl = 150;
  const half = (104.5 / 2) * (Math.PI / 180);
  const rockW = 4 * Math.sin(t * 0.7);
  const hA: [number, number] = [OX - bl * Math.sin(half), OY + bl * Math.cos(half)];
  const hB: [number, number] = [OX + bl * Math.sin(half), OY + bl * Math.cos(half)];
  const arcR = 62;
  const arcD = `M${OX - arcR * Math.sin(half)},${OY + arcR * Math.cos(half)} A${arcR},${arcR} 0 0 0 ${OX + arcR * Math.sin(half)},${OY + arcR * Math.cos(half)}`;

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <radialGradient id="orb-1s">
            <stop offset="0%" stopColor={C.spr} stopOpacity="0.5" />
            <stop offset="22%" stopColor={C.spr} stopOpacity="0.26" />
            <stop offset="55%" stopColor={C.spr} stopOpacity="0.07" />
            <stop offset="100%" stopColor={C.spr} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orb-p" cx="62%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#e6d4ff" stopOpacity="0.9" />
            <stop offset="55%" stopColor={C.spr} stopOpacity="0.6" />
            <stop offset="100%" stopColor={C.spr} stopOpacity="0.25" />
          </radialGradient>
          <radialGradient id="orb-m" cx="62%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#fff0c4" stopOpacity="0.9" />
            <stop offset="55%" stopColor={C.gold} stopOpacity="0.55" />
            <stop offset="100%" stopColor={C.gold} stopOpacity="0.22" />
          </radialGradient>
        </defs>
        <Motes x={960} y={500} rx={880} ry={330} n={30} color="spr" opacity={0.3} seed={21} />

        {/* ======================= panel (fase A–C), runtuh ke portal di fase D ======================= */}
        <g opacity={panels} transform={`translate(${PC.x} ${PC.y}) scale(${sc}) translate(${-PC.x} ${-PC.y})`}>
          {/* awan 1s utama */}
          <g opacity={intro}>
            <circle cx={cxA} cy={cyA} r={aA * 3.2} fill="url(#orb-1s)" opacity={d * (0.8 + 0.2 * Math.sin(t * 1.3))} />
            <circle cx={cxA} cy={cyA} r={aA * 2.3 * (1 + 0.02 * Math.sin(t * 1.4))} fill="none" stroke={C.spr} strokeWidth={1.5} strokeOpacity={0.35 * o1} />
            <ellipse cx={cxA} cy={cyA} rx={aA * 2.3} ry={aA * 0.62} fill="none" stroke={C.spr} strokeWidth={1.4} strokeOpacity={0.35 * o1} strokeDasharray="6 8" strokeDashoffset={-t * 18} />
            <Cloud t={t} x={cxA} y={cyA} a={aA} n={380} seed={1} opacity={d} d={d} R={aA} color={dotCol} r={mix(2.6, 2.1, mC)} keep={250} keepFade={1 - mC} />
            {/* orbit Bohr yang tajam → larut */}
            <circle cx={cxA} cy={cyA} r={aA} fill="none" stroke={C.cyan} strokeWidth={3} opacity={1 - d} />
            <circle cx={cxA} cy={cyA} r={aA} fill="none" stroke={C.cyan} strokeWidth={9} opacity={0.15 * (1 - d)} />
            <circle cx={cxA} cy={cyA} r={aA} fill="none" stroke={C.cyan} strokeWidth={1.5} strokeDasharray="4 8" opacity={0.45 * d * (1 - mB)} />
            <Label x={cxA + aA * 0.72 + 18} y={cyA - aA * 0.72 - 16} size={26} color={C.cyan} opacity={(1 - mB) * (0.4 + 0.6 * d)} font="serif" italic>
              a<TSub>0</TSub>
            </Label>
            <Spark x={ePos(eA)[0]} y={ePos(eA)[1]} r={9} color="pot" trail={trail} opacity={1 - d} />
            <Glow x={cxA} y={cyA} r={40} color="heat" opacity={0.8} />
            <circle cx={cxA} cy={cyA} r={8} fill={C.heat} />
            <circle cx={cxA - 2.5} cy={cyA - 2.5} r={3} fill="#fff" opacity={0.5} />
          </g>
          <Label x={960} y={205} size={34} color={C.cyan} weight={600} opacity={intro * (1 - ramp(d, 0, 0.42, EASE_IN_OUT)) * (1 - mA)}>
            model Bohr: lintasan yang tajam
          </Label>
          <Label x={960} y={205} size={34} color={C.spr} weight={600} opacity={ramp(d, 0.5, 0.95) * (1 - mA)}>
            mekanika kuantum: tidak ada lintasan
          </Label>

          {/* fase A kanan: awan peluang + rumus + peluang radial */}
          <Label x={1345} y={240} size={56} color={C.spr} weight={700} opacity={opR}>
            awan peluang
          </Label>
          <Twinkles x={1345} y={240} rx={190} ry={30} n={4} color="spr" opacity={opR * 0.8} seed={4} />
          <g opacity={opPlot}>
            <line x1={PX0} y1={PY0} x2={PX0 + PWd + 20} y2={PY0} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
            <line x1={PX0} y1={PY0} x2={PX0} y2={PY0 - PHt - 30} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
            <path d={`${plotD} L${PX0 + PWd},${PY0} L${PX0},${PY0} Z`} fill={C.spr} opacity={0.14 * drawP} />
            <path d={plotD} fill="none" stroke={C.spr} strokeWidth={4} strokeDasharray="1000 1000" strokeDashoffset={1000 * (1 - drawP)} pathLength={1000} strokeLinecap="round" />
            <line x1={PX0 + PWd / 5} y1={PY0} x2={PX0 + PWd / 5} y2={PY0 - PHt - 8} stroke={C.cyan} strokeWidth={2} strokeDasharray="5 6" opacity={drawP} />
            <Label x={PX0 + PWd / 5} y={PY0 + 26} size={26} color={C.cyan} font="serif" italic opacity={drawP}>
              a<TSub>0</TSub>
            </Label>
            <Label x={PX0 + PWd / 5 + 18} y={PY0 - PHt - 4} size={22} color={C.cyan} anchor="start" opacity={drawP}>
              puncak = jari-jari Bohr (0,053 nm)
            </Label>
            <Label x={PX0 + PWd + 14} y={PY0 + 26} size={24} color={C.muted} font="serif" italic>
              r
            </Label>
            <Label x={PX0 + 14} y={PY0 - PHt - 36} size={22} color={C.muted} anchor="start">
              peluang radial P(r)
            </Label>
            <Spark x={probe[0]} y={probe[1]} r={6} color="spr" opacity={drawP} />
          </g>

          {/* fase B: label 1s */}
          <Label x={400} y={745} size={46} color={C.spr} weight={700} opacity={o1}>
            1s
          </Label>
          <Label x={400} y={792} size={24} color={C.muted} opacity={o1}>
            bola
          </Label>

          {/* 2p */}
          <g opacity={o2}>
            <Glow x={960} y={470} r={260} color="spr" opacity={0.35} />
            <P2Triad t={t} x={960} y={470} s={s2} />
            <Label x={960} y={745} size={46} color={C.spr} weight={700}>
              2p
            </Label>
            <Label x={960} y={792} size={24} color={C.muted}>
              dua cuping · p<TSub>x</TSub>, p<TSub>y</TSub>, p<TSub>z</TSub>
            </Label>
          </g>
          {/* 3d */}
          <g opacity={o3}>
            <Glow x={1520} y={470} r={260} color="gold" opacity={0.25} />
            <D3 t={t} x={1520} y={470} s={s3} />
            <Label x={1520} y={745} size={46} color={C.spr} weight={700}>
              3d
            </Label>
            <Label x={1520} y={792} size={24} color={C.muted}>
              empat cuping (3d<tspan baselineShift="sub" fontSize="0.65em">xy</tspan>)
            </Label>
          </g>
          {/* legenda fase */}
          <g opacity={oLeg}>
            <circle cx={720} cy={846} r={10} fill="url(#orb-p)" stroke={PLUS} strokeWidth={1.5} />
            <Label x={738} y={846} size={22} color={C.spr} anchor="start">
              fase +
            </Label>
            <circle cx={880} cy={846} r={10} fill="url(#orb-m)" stroke={MINUS} strokeWidth={1.5} />
            <Label x={898} y={846} size={22} color={C.gold} anchor="start">
              fase −
            </Label>
            <line x1={1028} y1={846} x2={1068} y2={846} stroke={C.heat} strokeWidth={2.5} strokeDasharray="7 6" />
            <Label x={1078} y={846} size={22} color={C.heat} anchor="start">
              simpul
            </Label>
          </g>

          {/* fase C: H₂ */}
          <g opacity={oB}>
            <Cloud t={t + 3.7} x={mix(540, 442, pb)} y={470} a={60} n={260} seed={2} opacity={1} r={2.1} />
            <Glow x={mix(540, 442, pb)} y={470} r={40} color="heat" opacity={0.8} />
            <circle cx={mix(540, 442, pb)} cy={470} r={8} fill={C.heat} />
          </g>
          <circle cx={400} cy={470} r={60 + 40 * pb} fill="url(#orb-1s)" opacity={pb * (0.8 + 0.2 * Math.sin(t * 2))} />
          <BondDots t={t} x={400} y={470} sx={50} sy={33} n={90} opacity={pb * pb * oB} />
          <Ripple x={400} y={470} p={(t - tBond - 1.4) / 1.4} r={170} color="spr" rings={2} />
          <g opacity={oH}>
            <Label x={400} y={745} size={46} color={C.ink} weight={700}>
              H<TSub>2</TSub>
            </Label>
            <Label x={400} y={792} size={24} color={C.muted}>
              awan bertumpang-tindih → ikatan
            </Label>
          </g>

          {/* H₂O: sudut ikatan */}
          <g opacity={oW} transform={`translate(${OX} 470) scale(${sW}) rotate(${rockW}) translate(${-OX} -470)`}>
            <Glow x={OX} y={OY + 40} r={260} color="spr" opacity={0.3} />
            {/* cuping ikatan (ungu) & pasangan bebas (emas) */}
            {[-1, 1].map((sg) => (
              <g key={sg}>
                <g transform={`translate(${OX} ${OY}) rotate(${90 - sg * (104.5 / 2)})`}>
                  <path d={lobePath(bl + 30, 38)} fill="url(#orb-p)" opacity={0.42} />
                </g>
                <g transform={`translate(${OX} ${OY}) rotate(${-90 + sg * 54})`}>
                  <path d={lobePath(100 * (1 + 0.04 * Math.sin(t * 1.8 + sg)), 34)} fill="url(#orb-m)" opacity={0.5} stroke={MINUS} strokeOpacity={0.4} strokeWidth={1.4} />
                </g>
              </g>
            ))}
            <line x1={OX} y1={OY} x2={hA[0]} y2={hA[1]} stroke="#dfe6ff" strokeWidth={10} strokeLinecap="round" opacity={0.85} />
            <line x1={OX} y1={OY} x2={hB[0]} y2={hB[1]} stroke="#dfe6ff" strokeWidth={10} strokeLinecap="round" opacity={0.85} />
            <path d={arcD} fill="none" stroke={C.gold} strokeWidth={3.5} strokeDasharray="1000 1000" strokeDashoffset={1000 * (1 - arcP)} pathLength={1000} />
            <circle cx={OX} cy={OY} r={ATOM.O.r} fill={ATOM.O.fill} />
            <circle cx={OX - 12} cy={OY - 12} r={12} fill="#fff" opacity={0.28} />
            <Label x={OX} y={OY} size={30} color="#fff" weight={700}>
              O
            </Label>
            {[hA, hB].map((h, k) => (
              <g key={k}>
                <circle cx={h[0]} cy={h[1]} r={ATOM.H.r} fill={ATOM.H.fill} />
                <circle cx={h[0] - 8} cy={h[1] - 8} r={8} fill="#fff" opacity={0.6} />
                <text x={h[0]} y={h[1] + 1} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={26} fill="#283050">
                  H
                </text>
              </g>
            ))}
            <Label x={OX} y={OY + arcR + 32} size={32} color={C.gold} weight={700} opacity={arcP}>
              104,5°
            </Label>
          </g>
          <Ripple x={OX} y={OY + 70} p={(t - tAng - 0.9) / 1.3} r={150} color="gold" rings={2} />
          <g opacity={oW}>
            <Label x={960} y={745} size={46} color={C.ink} weight={700}>
              H<TSub>2</TSub>O
            </Label>
            <Label x={960} y={792} size={24} color={C.muted}>
              sudut ikatan 104,5°
            </Label>
          </g>

          {/* tabel periodik: blok s, p, d */}
          <PTable t={t} x={1520} y={520} on={oT} lit={lit} />
          <g opacity={oT}>
            <Label x={1520} y={745} size={46} color={C.ink} weight={700}>
              tabel periodik
            </Label>
            <Label x={1520} y={792} size={24} color={C.muted}>
              blok = orbital terakhir yang terisi
            </Label>
          </g>
        </g>

        {/* ======================= fase D: portal ke kimia kuantum ======================= */}
        <g opacity={oP}>
          <Glow x={PC.x} y={PC.y} r={520} color="spr" opacity={0.45} />
          <Glow x={PC.x} y={PC.y} r={220} color="gold" opacity={0.35} />
          {Array.from({length: 8}, (_, k) => {
            const ph = (((t * 0.32 + k / 8) % 1) + 1) % 1;
            const rr = 26 + 400 * Math.pow(ph, 1.6);
            const col = [C.spr, C.gold, C.cyan, C.pot][k % 4];
            return <ellipse key={k} cx={PC.x} cy={PC.y} rx={rr} ry={rr * 0.62} fill="none" stroke={col} strokeWidth={1.2 + 3 * ph} opacity={cyc(ph) * 0.6} />;
          })}
          {SPIRALS.map((pts, k) => (
            <Stream key={k} pts={pts} color={(['spr', 'gold', 'pot', 'cyan'] as const)[k % 4]} n={5} speed={0.3} r={4.5} opacity={0.75} seed={k} jitter={2} />
          ))}
          {RING_WORDS.map((w, k) => {
            const a = t * 0.16 + (k * Math.PI * 2) / RING_WORDS.length;
            const x = PC.x + 390 * Math.cos(a);
            const y = PC.y + 210 * Math.sin(a);
            const depth = 0.5 + 0.5 * Math.sin(a);
            return (
              <Label key={w} x={x} y={y} size={22 + 8 * depth} color={k % 2 ? C.gold : C.spr} opacity={0.35 + 0.5 * depth} font={k === 0 || k === 5 ? 'serif' : 'head'} italic={k === 0 || k === 5}>
                {w}
              </Label>
            );
          })}
          <g transform={`translate(${PC.x} ${PC.y}) scale(${0.85 + 0.05 * Math.sin(t * 1.5)}) translate(${-PC.x} ${-PC.y})`}>
            <D3 t={t * 1.6} x={PC.x} y={PC.y} s={0.75} labels={false} />
          </g>
          <Glow x={PC.x} y={PC.y} r={70} color="white" opacity={0.6} />
        </g>
      </Stage>

      {/* rumus awan 1s (fase A) */}
      <Formula x={1345} y={385} p={pF} accent={C.spr} size={58} caption="makin rapat titiknya, makin besar peluang menemukan elektron">
        |<V>ψ</V>
        <Sub>1s</Sub>|<Sup>2</Sup> ∝ <V>e</V>
        <Sup>
          −2<V>r</V>/<V>a</V>
          <span style={{fontSize: '0.7em'}}>0</span>
        </Sup>
      </Formula>

      {/* teks penutup */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 742, textAlign: 'center', fontFamily: FONT.head, fontSize: 40, fontWeight: 500, color: C.muted, opacity: tx1, translate: `0px ${(1 - tx1) * 14}px`, whiteSpace: 'nowrap'}}>
        Di sinilah <span style={{color: C.ink}}>fisika atom</span> berakhir —
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 800,
          textAlign: 'center',
          fontFamily: FONT.head,
          fontSize: 62,
          fontWeight: 700,
          color: C.gold,
          opacity: tx2,
          scale: String(0.9 + 0.1 * tx2s),
          letterSpacing: 2 + 3 * (1 - tx2),
          textShadow: `0 0 ${22 + 10 * Math.sin(t * 2)}px ${C.gold}88, 0 0 40px ${C.spr}66`,
          whiteSpace: 'nowrap',
        }}
      >
        kimia kuantum dimulai
      </div>
    </AbsoluteFill>
  );
};
