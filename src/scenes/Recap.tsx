import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, ramp, rand, win} from '../anim';
import {Frac, Glow, Motes, Ripple, Stage, Sub, Sup, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT, type Hue} from '../theme';

// Enam kartu rangkuman Fisika Atom, masing-masing dengan animasi mini yang terus berulang (analitik):
// inti Rutherford (alfa terbelok makin besar makin dekat inti + atom klasik runtuh) · orbit Bohr rₙ ∝ n² + tangga −13,6/n² ·
// garis spektrum (Lyman → 1 UV, Balmer → 2 tampak 656/486/434/410, Paschen → 3 IR) · ionisasi 13,6 eV (n = 1 → ∞) ·
// gelombang berdiri 2πr = nλ · awan orbital 1s/2p/3d; lalu pertanyaan kunci "dari tingkat mana … ke tingkat mana".
const SW = 444;
const SH = 64;

const hex2 = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
const ph = (t: number, period: number, off = 0) => ((((t + off) / period) % 1) + 1) % 1;
const MONO = {fontFamily: FONT.mono, fontSize: 15, fill: C.muted} as const;
const NM = {656: '#ff3b3b', 486: '#2fd6e0', 434: '#5b6bff', 410: '#9b5bff'} as const;
const UV = '#c9b8ff';
const IR = '#ff9c8a';

/** y layar tingkat energi (E = 0 di yTop, n = 1 di yBot), berskala −13,6/n². */
const lvY = (n: number, yTop: number, yBot: number) => yTop + (yBot - yTop) / (n * n);

/** 01 · Rutherford: alfa (jingga) dibelokkan inti (merah) — makin dekat makin besar; spiral = elektron klasik runtuh. */
const MiniRutherford: React.FC<{t: number}> = ({t}) => {
  const nx = 84;
  const ny = 32;
  const tracks = [-24, -11, 3, 13, 26];
  return (
    <g>
      <circle cx={nx} cy={ny} r={16} fill="url(#soft-heat)" />
      {tracks.map((b, k) => {
        const th = 2 * Math.atan(5 / Math.abs(b));
        const sg = Math.sign(b);
        const p0: [number, number] = [-14, ny + b];
        const p1: [number, number] = [nx, ny + b];
        const p2: [number, number] = [nx + 86 * Math.cos(th), ny + b + sg * 86 * Math.sin(th)];
        const q = (u: number): [number, number] => [
          (1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0],
          (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1],
        ];
        const u = ph(t, 2.4, k * 0.47);
        const [x, y] = q(u);
        return (
          <g key={b}>
            <path d={`M${p0.join(',')} Q${p1.join(',')} ${p2.join(',')}`} fill="none" stroke={C.kin} strokeWidth={1.1} strokeOpacity={0.28} />
            <circle cx={x} cy={y} r={3.6} fill={C.kin} opacity={cyc(u)} />
          </g>
        );
      })}
      <circle cx={nx} cy={ny} r={4.5} fill={C.heat} />
      {(() => {
        const cx = 250;
        const cy = 32;
        const u = ph(t, 3.2);
        const pos = (v: number): [number, number] => {
          const r = 26 * Math.pow(1 - v, 0.8);
          const a = v * 5.5 * Math.PI * 2;
          return [cx + r * Math.cos(a), cy - r * 0.9 * Math.sin(a)];
        };
        const spiral = Array.from({length: 60}, (_, i) => pos(i / 59));
        const [x, y] = pos(u);
        return (
          <g>
            <path d={spiral.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} fill="none" stroke={C.pot} strokeWidth={1} strokeOpacity={0.25} />
            <circle cx={cx} cy={cy} r={3.5} fill={C.heat} />
            {[1, 2, 3].map((k) => {
              const [tx, ty] = pos(Math.max(0, u - k * 0.012));
              return <circle key={k} cx={tx} cy={ty} r={3.2 - k * 0.6} fill={C.pot} opacity={cyc(u) * (0.5 - k * 0.12)} />;
            })}
            <circle cx={x} cy={y} r={4} fill={C.pot} opacity={cyc(u)} />
          </g>
        );
      })()}
      <text x={326} y={18} {...MONO} dominantBaseline="central" fill={C.heat}>
        inti kecil
      </text>
      <text x={326} y={42} {...MONO} dominantBaseline="central">
        klasik: runtuh
      </text>
    </g>
  );
};

/** 02 · Bohr: orbit rₙ ∝ n² (elips semu-3D) dan tangga energi berskala −13,6/n² — elektron di n = 2. */
const MiniBohr: React.FC<{t: number}> = ({t}) => {
  const cx = 64;
  const cy = 32;
  const a = t * 1.9;
  return (
    <g>
      {[1, 2, 3].map((n) => (
        <ellipse key={n} cx={cx} cy={cy} rx={6 * n * n} ry={3.2 * n * n} fill="none" stroke={C.work} strokeWidth={n === 2 ? 1.8 : 1.2} strokeOpacity={n === 2 ? 0.75 : 0.4} />
      ))}
      <circle cx={cx} cy={cy} r={8} fill="url(#soft-heat)" />
      <circle cx={cx} cy={cy} r={3.8} fill={C.heat} />
      <circle cx={cx + 24 * Math.cos(a)} cy={cy - 12.8 * Math.sin(a)} r={4.5} fill={C.pot} />
      <circle cx={cx + 24 * Math.cos(a)} cy={cy - 12.8 * Math.sin(a)} r={10} fill="url(#soft-pot)" />
      {[1, 2, 3, 4, 5].map((n) => {
        const y = lvY(n, 4, 58);
        return (
          <g key={n}>
            <line x1={172} y1={y} x2={296} y2={y} stroke={C.work} strokeWidth={n === 1 ? 2.4 : 1.6} strokeOpacity={0.55 + 0.4 * (n <= 3 ? 1 : 0.4)} />
            {n <= 2 ? (
              <text x={164} y={y} {...MONO} fontSize={11} textAnchor="end" dominantBaseline="central" fill={C.work}>
                {n}
              </text>
            ) : null}
          </g>
        );
      })}
      <line x1={172} y1={4} x2={296} y2={4} stroke={C.gold} strokeWidth={1} strokeDasharray="3 4" strokeOpacity={0.6} />
      <circle cx={234 + 40 * Math.sin(t * 0.9)} cy={lvY(2, 4, 58)} r={4} fill={C.pot} />
      <text x={326} y={18} {...MONO} dominantBaseline="central" fill={C.work}>
        rₙ ∝ n²
      </text>
      <text x={326} y={42} {...MONO} dominantBaseline="central">
        rapat ke atas
      </text>
    </g>
  );
};

/** 03 · Spektrum: lompatan turun ke n = 1 (Lyman, UV), n = 2 (Balmer, tampak), n = 3 (Paschen, IR); garis Balmer berkedip. */
const JUMPS: {x: number; from: number; to: number; col: string; nm?: keyof typeof NM}[] = [
  {x: 28, from: 2, to: 1, col: UV},
  {x: 44, from: 3, to: 1, col: UV},
  {x: 76, from: 3, to: 2, col: NM[656], nm: 656},
  {x: 92, from: 4, to: 2, col: NM[486], nm: 486},
  {x: 108, from: 5, to: 2, col: NM[434], nm: 434},
  {x: 124, from: 6, to: 2, col: NM[410], nm: 410},
  {x: 152, from: 4, to: 3, col: IR},
  {x: 166, from: 5, to: 3, col: IR},
];
const MiniSpectrum: React.FC<{t: number}> = ({t}) => {
  const yT = 2;
  const yB = 56;
  const sx = (nm: number) => 214 + ((nm - 390) / (700 - 390)) * 224;
  return (
    <g>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <line key={n} x1={14} y1={lvY(n, yT, yB)} x2={180} y2={lvY(n, yT, yB)} stroke={C.work} strokeWidth={n === 1 ? 2 : 1.2} strokeOpacity={0.6} />
      ))}
      {JUMPS.map((j, k) => {
        const u = ph(t, 3.6, k * 0.45);
        const y0 = lvY(j.from, yT, yB);
        const y1 = lvY(j.to, yT, yB);
        const head = y0 + (y1 - y0) * Math.min(1, u * 2.2);
        const o = cyc(u);
        return (
          <g key={k} opacity={o}>
            <line x1={j.x} y1={y0} x2={j.x} y2={head} stroke={j.col} strokeWidth={2.2} strokeLinecap="round" />
            <circle cx={j.x} cy={head} r={2.6} fill={j.col} />
          </g>
        );
      })}
      <text x={36} y={66} {...MONO} fontSize={11} textAnchor="middle" fill={UV}>
        Ly
      </text>
      <text x={100} y={66} {...MONO} fontSize={11} textAnchor="middle" fill={NM[486]}>
        Ba
      </text>
      <text x={159} y={66} {...MONO} fontSize={11} textAnchor="middle" fill={IR}>
        Pa
      </text>
      <rect x={210} y={12} width={232} height={34} rx={4} fill="#060914" stroke="#3a4770" strokeWidth={1} />
      {JUMPS.filter((j) => j.nm).map((j) => {
        const k = JUMPS.indexOf(j);
        const u = ph(t, 3.6, k * 0.45);
        const flash = Math.exp(-Math.pow((u - 0.5) / 0.12, 2));
        return (
          <g key={j.nm}>
            <rect x={sx(j.nm!) - 2.5} y={14} width={5} height={30} fill={j.col} opacity={0.45 + 0.55 * flash} />
            <rect x={sx(j.nm!) - 7} y={14} width={14} height={30} fill={j.col} opacity={0.25 * flash} />
          </g>
        );
      })}
      <text x={326} y={60} {...MONO} fontSize={12} textAnchor="middle" dominantBaseline="central">
        Balmer: tampak
      </text>
    </g>
  );
};

/** 04 · Ionisasi: elektron naik dari n = 1 melewati E = 0 (emas) lalu lepas; butuh 13,6 eV. */
const MiniIon: React.FC<{t: number}> = ({t}) => {
  const yT = 10;
  const yB = 58;
  const u = ph(t, 3.4);
  const up = Math.min(1, u / 0.5);
  const e = up < 1 ? 1 - Math.pow(1 - up, 2) : 1;
  const fly = Math.max(0, (u - 0.5) / 0.5);
  const x = 110 + fly * 170;
  const y = yB + (yT - yB) * e - fly * 18;
  return (
    <g>
      <rect x={14} y={-6} width={200} height={yT + 6} fill={C.gold} opacity={0.1 + 0.04 * Math.sin(t * 2)} />
      <line x1={14} y1={yT} x2={214} y2={yT} stroke={C.gold} strokeWidth={1.6} strokeDasharray="4 4" />
      {[1, 2, 3].map((n) => (
        <line key={n} x1={14} y1={lvY(n, yT, yB)} x2={200} y2={lvY(n, yT, yB)} stroke={C.work} strokeWidth={n === 1 ? 2.2 : 1.3} strokeOpacity={0.6} />
      ))}
      <line x1={40} y1={yB - 3} x2={40} y2={yT + 4} stroke={C.gold} strokeWidth={2.4} markerEnd="url(#arrow-gold)" />
      <text x={50} y={36} {...MONO} fontSize={12} dominantBaseline="central" fill={C.gold}>
        13,6 eV
      </text>
      {[1, 2, 3, 4].map((k) => {
        const uu = Math.max(0, u - k * 0.02);
        const upk = Math.min(1, uu / 0.5);
        const ek = upk < 1 ? 1 - Math.pow(1 - upk, 2) : 1;
        const fk = Math.max(0, (uu - 0.5) / 0.5);
        return <circle key={k} cx={110 + fk * 170} cy={yB + (yT - yB) * ek - fk * 18} r={4 - k * 0.7} fill={C.pot} opacity={cyc(u) * (0.5 - k * 0.1)} />;
      })}
      <circle cx={x} cy={y} r={4.6} fill={C.pot} opacity={cyc(u)} />
      <circle cx={x} cy={y} r={11} fill="url(#soft-gold)" opacity={cyc(u) * fly} />
      <text x={326} y={18} {...MONO} dominantBaseline="central" fill={C.gold}>
        n = 1 → ∞
      </text>
      <text x={326} y={42} {...MONO} dominantBaseline="central">
        ≈ 1312 kJ/mol
      </text>
    </g>
  );
};

/** 05 · Gelombang berdiri: n = 4 gelombang pas mengelilingi orbit; tali dengan simpul tetap. */
const MiniWave: React.FC<{t: number}> = ({t}) => {
  const cx = 60;
  const cy = 32;
  const amp = 6 * Math.cos(t * 3.2);
  const ring = Array.from({length: 73}, (_, i) => {
    const f = (i / 72) * Math.PI * 2;
    const r = 22 + amp * Math.sin(4 * f + 0.4);
    return `${i ? 'L' : 'M'}${(cx + r * Math.cos(f)).toFixed(1)},${(cy - r * Math.sin(f)).toFixed(1)}`;
  }).join(' ');
  const str = Array.from({length: 61}, (_, i) => {
    const x = 140 + (i / 60) * 160;
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${(32 + 16 * Math.sin((3 * Math.PI * i) / 60) * Math.cos(t * 3.2)).toFixed(1)}`;
  }).join(' ');
  return (
    <g>
      <circle cx={cx} cy={cy} r={22} fill="none" stroke={C.cyan} strokeWidth={1} strokeDasharray="3 4" strokeOpacity={0.45} />
      <path d={ring} fill="none" stroke={C.spr} strokeWidth={2.4} />
      <circle cx={cx} cy={cy} r={4} fill={C.heat} />
      <line x1={140} y1={32} x2={300} y2={32} stroke={C.muted} strokeWidth={0.8} strokeOpacity={0.4} />
      <path d={str} fill="none" stroke={C.spr} strokeWidth={2.4} />
      {[0, 1, 2, 3].map((k) => (
        <circle key={k} cx={140 + (k * 160) / 3} cy={32} r={3.2} fill={C.heat} />
      ))}
      <text x={326} y={18} {...MONO} dominantBaseline="central" fill={C.spr}>
        λ = h/p
      </text>
      <text x={326} y={42} {...MONO} dominantBaseline="central">
        n = 4
      </text>
    </g>
  );
};

/** 06 · Orbital: awan 1s berkelip, 2p berputar (fase ungu/emas), 3d empat cuping. */
const lobe = (L: number, W: number) => `M0,0 C${L * 0.22},${W} ${L * 0.95},${W * 1.08} ${L},0 C${L * 0.95},${-W * 1.08} ${L * 0.22},${-W} 0,0 Z`;
const MiniOrbital: React.FC<{t: number}> = ({t}) => {
  const fs = 0.35 + 0.65 * Math.abs(Math.cos(t * 0.8));
  return (
    <g>
      <circle cx={40} cy={30} r={26} fill="url(#soft-spr)" />
      {Array.from({length: 46}, (_, i) => {
        const raw = t * (0.5 + 0.4 * rand(i * 3.1)) + rand(i * 1.9);
        const k = Math.floor(raw);
        const s = i * 13.7 + k * 4.3;
        const r = -0.5 * Math.log((0.01 + 0.99 * rand(s)) * (0.01 + 0.99 * rand(s + 1.1)) * (0.01 + 0.99 * rand(s + 2.3)));
        const a = rand(s + 3.7) * Math.PI * 2;
        const rr = Math.min(2.6, r) * 9 * Math.sqrt(1 - Math.pow(2 * rand(s + 5.1) - 1, 2));
        return <circle key={i} cx={40 + rr * Math.cos(a)} cy={30 + rr * Math.sin(a)} r={1.5} fill={C.spr} opacity={cyc(raw - k)} />;
      })}
      <g transform={`translate(150 30) rotate(${-90 + 25 * Math.sin(t * 0.6)}) scale(${fs.toFixed(3)} 1)`}>
        <path d={lobe(27, 11)} fill="url(#soft-spr)" stroke={C.spr} strokeWidth={1.6} />
        <path d={lobe(27, 11)} transform="rotate(180)" fill="url(#soft-gold)" stroke={C.gold} strokeWidth={1.6} />
      </g>
      <g transform={`translate(260 30) rotate(${t * 18})`}>
        {[45, 135, 225, 315].map((a, k) => (
          <path key={a} d={lobe(25, 9)} transform={`rotate(${a})`} fill={`url(#soft-${k % 2 ? 'gold' : 'spr'})`} stroke={k % 2 ? C.gold : C.spr} strokeWidth={1.4} />
        ))}
      </g>
      {['1s', '2p', '3d'].map((s, k) => (
        <text key={s} x={[40, 150, 260][k]} y={66} {...MONO} fontSize={12} textAnchor="middle" fill={C.spr}>
          {s}
        </text>
      ))}
      <text x={326} y={18} {...MONO} dominantBaseline="central" fill={C.cyan}>
        orbit →
      </text>
      <text x={326} y={42} {...MONO} dominantBaseline="central" fill={C.spr}>
        orbital
      </text>
    </g>
  );
};

type Item = {title: string; color: string; hue: Hue; body: React.ReactNode; Mini: React.FC<{t: number}>; size?: number};
const ITEMS: Item[] = [
  {
    title: 'Inti Rutherford',
    color: C.heat,
    hue: 'heat',
    body: (
      <span>
        <V>r</V>
        <Sub>atom</Sub> : <V>r</V>
        <Sub>inti</Sub> ≈ 10<Sup>5</Sup>
      </span>
    ),
    Mini: MiniRutherford,
  },
  {
    title: 'Orbit Bohr terkuantisasi',
    color: C.work,
    hue: 'work',
    body: (
      <span>
        <V>E</V>
        <Sub>n</Sub> = −<Frac n={<span>13,6 eV</span>} d={<span><V>n</V><Sup>2</Sup></span>} size={0.62} />
      </span>
    ),
    Mini: MiniBohr,
  },
  {
    title: 'Garis spektrum',
    color: C.cyan,
    hue: 'cyan',
    body: (
      <span>
        <V>h</V>
        <V>f</V> = <V>E</V>
        <Sub>i</Sub> − <V>E</V>
        <Sub>f</Sub>
      </span>
    ),
    Mini: MiniSpectrum,
  },
  {
    title: 'Energi ionisasi H',
    color: C.gold,
    hue: 'gold',
    body: (
      <span>
        <V>E</V>
        <Sub>ion</Sub> = <span style={{color: C.gold}}>13,6 eV</span>
      </span>
    ),
    Mini: MiniIon,
  },
  {
    title: 'Gelombang berdiri',
    color: C.pot,
    hue: 'pot',
    body: (
      <span>
        2π<V>r</V> = <V>n</V>
        <V color={C.spr}>λ</V>
      </span>
    ),
    Mini: MiniWave,
  },
  {
    title: 'Orbital',
    color: C.spr,
    hue: 'spr',
    body: (
      <span>
        |<V color={C.spr}>ψ</V>|<Sup>2</Sup> <span style={{fontFamily: FONT.head, fontSize: 30, color: C.muted}}>= awan peluang</span>
      </span>
    ),
    Mini: MiniOrbital,
  },
];

const COLS = [400, 960, 1520];
const ROWS = [326, 596];
const CH = 244;

export const Recap: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const s3 = Math.max(cue(3) + 1.6, wordOf(3, 'ionisasi') - 0.4);
  const s5 = Math.max(cue(4) + 1.8, wordOf(4, 'orbit') - 0.5);
  const starts = [cue(1), cue(2), cue(3), s3, cue(4), s5];
  const nextOf = (i: number) => (i < 5 ? starts[i + 1] : cue(5));
  const head = ramp(t, 0, 0.8);
  const q = ramp(t, cue(5) + 0.2, cue(5) + 1.2);
  const dim = 1 - 0.6 * ramp(t, cue(5), cue(5) + 1.0, EASE_IN_OUT);
  const tA = wordOf(5, 'tingkat', 0);
  const tB = wordOf(5, 'tingkat', 1);
  const hlA = ramp(t, tA - 0.6, tA + 0.3);
  const hlB = ramp(t, tB - 0.6, tB + 0.3);
  // kartu yang diacu pertanyaan menyala lagi: "dari tingkat mana" → kartu 2 (tingkat Bohr), "ke tingkat mana" → kartu 3 (deret spektrum)
  const reA = hlA * (1 - 0.6 * hlB);
  const reB = hlB;
  const reOf = (i: number) => (i === 1 ? reA : i === 2 ? reB : 0);
  // ilustrasi kecil di kiri pertanyaan: elektron jatuh 3 → 2 memancarkan foton 656 nm
  const fu = ph(t, 2.8);
  const fall = ramp(fu, 0.15, 0.4, EASE_IN_OUT);
  const yL3 = 772;
  const yL2 = 836;
  const phot = Math.max(0, (fu - 0.4) / 0.55);
  return (
    <AbsoluteFill>
      <Stage>
        <Motes x={960} y={470} rx={900} ry={330} n={36} color="spr" opacity={0.3} seed={5} />
        {/* latar: foton kecil (warna garis Balmer) melayang naik */}
        {Array.from({length: 18}, (_, k) => {
          const p = ph(t, 11 + 5 * rand(k), rand(k * 3.3) * 14);
          const x = 100 + rand(k * 5.1) * 1720 + 14 * Math.sin(t * 0.8 + k);
          const y = 880 - p * 700;
          const col = [NM[656], NM[486], NM[434], NM[410]][k % 4];
          const d = Array.from({length: 13}, (_, i) => `${i ? 'L' : 'M'}${(x - 15 + i * 2.5).toFixed(1)},${(y + 4 * Math.sin(i * 1.1 + t * 6)).toFixed(1)}`).join(' ');
          return <path key={k} d={d} fill="none" stroke={col} strokeWidth={1.8} opacity={cyc(p) * 0.4} transform={`rotate(${-60 + 30 * rand(k * 2.7)} ${x} ${y})`} />;
        })}
        {ITEMS.map((it, i) => {
          const x = COLS[i % 3];
          const y = ROWS[Math.floor(i / 3)];
          const o = ramp(t, 0.2 + i * 0.12, 0.9 + i * 0.12) * (1 - ramp(t, starts[i] - 0.2, starts[i] + 0.4));
          const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 - i * 0.9);
          return o > 0.01 ? (
            <rect key={it.title} x={x - 250} y={y - CH / 2} width={500} height={CH} rx={20} fill={it.color} fillOpacity={0.03 + 0.03 * pulse} stroke={it.color} strokeOpacity={0.25 + 0.25 * pulse} strokeWidth={2} strokeDasharray="10 9" strokeDashoffset={-t * 16} opacity={o} />
          ) : null;
        })}
        {ITEMS.map((it, i) => {
          const x = COLS[i % 3];
          const y = ROWS[Math.floor(i / 3)];
          const act = win(t, starts[i], nextOf(i), 0.5, 0.6) * dim;
          return (
            <g key={it.title}>
              <Glow x={x} y={y} r={300} color={it.hue} opacity={0.35 * act} />
              <Ripple x={x} y={y} p={(t - starts[i] - 0.1) / 1.3} r={300} color={it.hue} rings={2} width={2} />
            </g>
          );
        })}
        <Glow x={COLS[1]} y={ROWS[0]} r={300} color="work" opacity={0.4 * reA} />
        <Glow x={COLS[2]} y={ROWS[0]} r={300} color="cyan" opacity={0.4 * reB} />
        <g opacity={q}>
          {/* kiri: lompatan 3 → 2 + foton merah */}
          <line x1={96} y1={yL3} x2={196} y2={yL3} stroke={C.work} strokeWidth={3} strokeOpacity={0.4 + 0.6 * hlA} />
          <line x1={96} y1={yL2} x2={196} y2={yL2} stroke={C.work} strokeWidth={3} strokeOpacity={0.4 + 0.6 * hlB} />
          <text x={88} y={yL3} textAnchor="end" dominantBaseline="central" fontFamily={FONT.mono} fontSize={16} fill={C.work}>
            3
          </text>
          <text x={88} y={yL2} textAnchor="end" dominantBaseline="central" fontFamily={FONT.mono} fontSize={16} fill={C.work}>
            2
          </text>
          <circle cx={130} cy={yL3 + (yL2 - yL3) * fall} r={8} fill={C.pot} opacity={cyc(fu)} />
          <circle cx={130} cy={yL3 + (yL2 - yL3) * fall} r={20} fill="url(#soft-pot)" opacity={cyc(fu)} />
          {phot > 0 && phot < 1 ? (
            <path
              d={Array.from({length: 17}, (_, i) => `${i ? 'L' : 'M'}${(150 + phot * 70 + i * 3).toFixed(1)},${(yL2 - 26 - phot * 20 + 6 * Math.sin(i * 0.9 - t * 9)).toFixed(1)}`).join(' ')}
              fill="none"
              stroke={NM[656]}
              strokeWidth={3}
              opacity={Math.sin(Math.PI * phot)}
            />
          ) : null}
          {/* kanan: garis spektrum merah 656 nm menyala */}
          <rect x={1726} y={770} width={96} height={64} rx={6} fill="#060914" stroke="#3a4770" strokeWidth={1.5} />
          <rect x={1771} y={772} width={6} height={60} fill={NM[656]} opacity={0.5 + 0.5 * Math.exp(-Math.pow((fu - 0.6) / 0.15, 2))} />
          <rect x={1764} y={772} width={20} height={60} fill={NM[656]} opacity={0.25 * Math.exp(-Math.pow((fu - 0.6) / 0.15, 2))} />
          <text x={1774} y={852} textAnchor="middle" fontFamily={FONT.mono} fontSize={15} fill={C.muted}>
            656 nm
          </text>
          <Twinkles x={960} y={800} rx={620} ry={40} n={7} color="gold" seed={7} />
        </g>
        <Ripple x={600} y={800} p={(t - tA + 0.3) / 1.4} r={260} color="work" rings={2} />
        <Ripple x={1360} y={800} p={(t - tB + 0.3) / 1.4} r={260} color="cyan" rings={2} />
      </Stage>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: FONT.head, fontSize: 30, letterSpacing: 8 + 2 * (1 - head), color: C.gold, fontWeight: 600, opacity: head}}>
        RANGKUMAN
      </div>
      {ITEMS.map((it, i) => {
        const p = ramp(t, starts[i] - 0.1, starts[i] + 0.7, BACK);
        const x = COLS[i % 3];
        const y = ROWS[Math.floor(i / 3)];
        const re = reOf(i);
        const act = Math.max(win(t, starts[i], nextOf(i), 0.5, 0.6), re);
        const dimI = dim + (1 - dim) * re;
        const mini = ramp(t, starts[i] + 0.4, starts[i] + 1.2);
        const bob = 3 * Math.sin(t * 1.1 + i * 1.3);
        const Mini = it.Mini;
        return (
          <div
            key={it.title}
            style={{
              position: 'absolute',
              left: x - 250,
              top: y - CH / 2,
              width: 500,
              height: CH,
              boxSizing: 'border-box',
              borderRadius: 20,
              background: 'linear-gradient(160deg, rgba(22,34,72,0.95), rgba(10,16,36,0.95))',
              border: `1.5px solid ${it.color}${hex2(0x55 + 0x44 * act)}`,
              borderLeft: `8px solid ${it.color}`,
              boxShadow: `0 16px 44px rgba(0,0,0,0.45), 0 0 ${30 + 30 * act}px ${it.color}${hex2(0x22 + 0x22 * act)}`,
              padding: '18px 28px 0',
              opacity: Math.min(1, p) * dimI,
              scale: String(0.9 + 0.1 * p + 0.02 * act),
              translate: `0px ${bob - 6 * act}px`,
              color: C.ink,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(105deg, transparent ${-40 + p * 150 - 16}%, rgba(255,245,220,0.12) ${-40 + p * 150}%, transparent ${-40 + p * 150 + 16}%)`,
                pointerEvents: 'none',
              }}
            />
            <div style={{fontFamily: FONT.head, fontSize: 26, color: it.color, fontWeight: 600, letterSpacing: 1}}>
              {String(i + 1).padStart(2, '0')} · {it.title}
            </div>
            <div style={{fontFamily: FONT.serif, fontSize: it.size ?? 40, marginTop: 10, whiteSpace: 'nowrap', textAlign: 'center', height: 82, lineHeight: '82px'}}>{it.body}</div>
            <svg width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`} style={{display: 'block', marginTop: 2, opacity: mini, overflow: 'visible'}}>
              <Mini t={t + rand(i) * 3} />
            </svg>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 770,
          textAlign: 'center',
          fontFamily: FONT.head,
          fontSize: 46,
          fontWeight: 700,
          color: C.ink,
          opacity: q,
          translate: `0px ${(1 - q) * 20}px`,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{color: C.work, textShadow: `0 0 ${26 * hlA}px ${C.work}aa`}}>Dari tingkat mana</span> elektron itu jatuh, dan{' '}
        <span style={{color: C.cyan, textShadow: `0 0 ${26 * hlB}px ${C.cyan}aa`}}>ke tingkat mana</span>?
      </div>
    </AbsoluteFill>
  );
};
