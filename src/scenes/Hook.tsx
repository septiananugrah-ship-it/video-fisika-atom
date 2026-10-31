import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, mix, ramp, rand} from '../anim';
import {Glow, Label, Motes, Ripple, Stage, Stream, Twinkles} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Pembuka (semua gerak analitik per frame):
// (A) papan lampu neon menyala merah-jingga (garis Ne dominan 585–703 nm) + kembang api tembaga hijau-kebiruan
//     (partikel: r = V(1−e^{−kτ})/k, jatuh ½gτ²), masing-masing dengan pita spektrum garisnya;
// (B) cahaya bintang → prisma → spektrum kontinu yang dipotong garis Fraunhofer (C 656, D 589, b 517, F 486, G 431);
// (C) "sidik jari" unsur: spektrum emisi H, Na, Ne berdampingan + sidik jari yang tergambar;
// (D) garis-garis mengalir ke siluet atom "?" → "bagaimana atom tersusun" → awan orbital (1s + 2p) "kimia kuantum".
const TAU = Math.PI * 2;
const fr = (v: number) => ((v % 1) + 1) % 1;
type P = [number, number];

/** Warna kira-kira untuk panjang gelombang (nm) tampak. */
export const nmColor = (nm: number): string => {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm < 440) [r, g, b] = [-(nm - 440) / 60, 0, 1];
  else if (nm < 490) [r, g, b] = [0, (nm - 440) / 50, 1];
  else if (nm < 510) [r, g, b] = [0, 1, -(nm - 510) / 20];
  else if (nm < 580) [r, g, b] = [(nm - 510) / 70, 1, 0];
  else if (nm < 645) [r, g, b] = [1, -(nm - 645) / 65, 0];
  else [r, g, b] = [1, 0, 0];
  const f = nm < 420 ? 0.35 + (0.65 * (nm - 380)) / 40 : nm > 680 ? 0.35 + (0.65 * (750 - nm)) / 70 : 1;
  const h = (v: number) =>
    Math.round(255 * Math.pow(Math.max(0, Math.min(1, v * f)), 0.8))
      .toString(16)
      .padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
};

type Ln = {nm: number; s: number};
const H_LINES: Ln[] = [
  {nm: 656.3, s: 1},
  {nm: 486.1, s: 0.8},
  {nm: 434.0, s: 0.6},
  {nm: 410.2, s: 0.45},
];
const NA_LINES: Ln[] = [
  {nm: 589.0, s: 1},
  {nm: 589.6, s: 1},
  {nm: 568.8, s: 0.35},
  {nm: 498.3, s: 0.3},
  {nm: 616.0, s: 0.3},
];
const NE_LINES: Ln[] = [585.2, 588.2, 594.5, 597.6, 603.0, 607.4, 609.6, 614.3, 616.4, 621.7, 626.6, 630.5, 633.4, 638.3, 640.2, 650.7, 659.9, 692.9, 540.1].map((nm, i) => ({
  nm,
  s: nm === 640.2 || nm === 585.2 ? 1 : 0.45 + 0.4 * rand(i * 3.7),
}));
const CU_LINES: Ln[] = [
  {nm: 510.6, s: 1},
  {nm: 515.3, s: 0.9},
  {nm: 521.8, s: 1},
  {nm: 465.1, s: 0.4},
  {nm: 450.0, s: 0.35},
  {nm: 435.0, s: 0.35},
];
const FRAUN: {nm: number; tag: string; w: number}[] = [
  {nm: 430.8, tag: 'G', w: 3},
  {nm: 486.1, tag: 'F', w: 4},
  {nm: 517.3, tag: 'b', w: 3},
  {nm: 527.0, tag: 'E', w: 2.5},
  {nm: 589.3, tag: 'D', w: 5},
  {nm: 656.3, tag: 'C', w: 4},
  {nm: 686.7, tag: 'B', w: 3},
];

/** Pita spektrum emisi (garis terang di atas latar gelap); p = garis tumbuh bertahap. */
const Strip: React.FC<{x0: number; x1: number; y: number; h: number; lines: Ln[]; p: number; t: number; seed?: number}> = ({x0, x1, y, h, lines, p, t, seed = 0}) => {
  const X = (nm: number) => x0 + ((nm - 400) / 300) * (x1 - x0);
  return (
    <g>
      <rect x={x0 - 8} y={y - h / 2 - 8} width={x1 - x0 + 16} height={h + 16} rx={10} fill="#04060d" stroke={C.line} strokeWidth={2} />
      {lines.map((l, i) => {
        const q = ramp(p, (i / lines.length) * 0.55, (i / lines.length) * 0.55 + 0.45);
        if (q <= 0) return null;
        const hh = h * q;
        const col = nmColor(l.nm);
        const sh = 0.82 + 0.18 * Math.sin(t * 2.2 + i * 1.7 + seed);
        return (
          <g key={i} opacity={l.s * sh}>
            <rect x={X(l.nm) - 7} y={y - hh / 2} width={14} height={hh} fill={col} opacity={0.22} />
            <rect x={X(l.nm) - 2} y={y - hh / 2} width={4} height={hh} fill={col} />
          </g>
        );
      })}
    </g>
  );
};

/** Pita kontinu dengan garis serapan gelap. */
const Absorb: React.FC<{x0: number; x1: number; y: number; h: number; dark: number; t: number}> = ({x0, x1, y, h, dark, t}) => {
  const X = (nm: number) => x0 + ((nm - 400) / 300) * (x1 - x0);
  return (
    <g>
      <rect x={x0} y={y - h / 2} width={x1 - x0} height={h} fill="url(#hk-rainbow)" />
      <rect x={x0} y={y - h / 2} width={x1 - x0} height={h} fill="url(#hk-shade)" />
      {FRAUN.map((f, i) => {
        const q = ramp(dark, i * 0.08, i * 0.08 + 0.4);
        if (q <= 0) return null;
        return (
          <g key={f.tag}>
            <rect x={X(f.nm) - f.w / 2} y={y - (h / 2) * q} width={f.w} height={h * q} fill="#05060c" opacity={0.92} />
            <Label x={X(f.nm)} y={y + h / 2 + 26} size={20} font="mono" color={C.muted} opacity={q * (0.75 + 0.25 * Math.sin(t * 2 + i))}>
              {f.tag}
            </Label>
          </g>
        );
      })}
    </g>
  );
};

/** Kembang api: roket naik lalu meledak; partikel melambat (hambatan) dan jatuh. */
const Firework: React.FC<{cx: number; cy: number; t: number; on: number}> = ({cx, cy, t, on}) => {
  if (on <= 0.001) return null;
  const N = 34;
  return (
    <g opacity={on}>
      {[0, 1].map((b) => {
        const raw = t / 2.6 + b * 0.5;
        const cycle = Math.floor(raw);
        const ph = raw - cycle;
        const bx = cx + (b ? 120 : -110) + (rand(cycle * 3 + b) - 0.5) * 80;
        const by = cy + (b ? -30 : 40) + (rand(cycle * 5 + b + 9) - 0.5) * 50;
        const rise = ph / 0.2;
        if (ph < 0.2) {
          const ry = mix(cy + 330, by, rise * (2 - rise));
          return (
            <g key={b} opacity={Math.min(1, rise * 4)}>
              <line x1={bx} y1={ry} x2={bx} y2={ry + 40} stroke="#ffd9a0" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
              <circle cx={bx} cy={ry} r={4} fill="#fff4dc" />
            </g>
          );
        }
        const q = (ph - 0.2) / 0.8;
        const k = 3.4;
        const R = (qq: number) => (1 - Math.exp(-k * qq)) / (1 - Math.exp(-k));
        const fade = Math.pow(1 - q, 1.4) * Math.min(1, q * 12);
        return (
          <g key={b} opacity={fade}>
            <circle cx={bx} cy={by} r={170 * R(q)} fill="url(#soft-work)" opacity={0.5 * (1 - q)} />
            {Array.from({length: N}, (_, i) => {
              const a = (TAU * i) / N + rand(i + b * 31) * 0.2;
              const v = 0.75 + 0.25 * rand(i * 7 + b);
              const pos = (qq: number): P => [bx + Math.cos(a) * 175 * v * R(qq), by + Math.sin(a) * 175 * v * R(qq) + 70 * qq * qq];
              const [x, y] = pos(q);
              const [x2, y2] = pos(Math.max(0, q - 0.07));
              const col = i % 3 === 0 ? '#4fc8ff' : i % 3 === 1 ? '#3be8b0' : '#7af0d0';
              return (
                <g key={i}>
                  <line x1={x2} y1={y2} x2={x} y2={y} stroke={col} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
                  <circle cx={x} cy={y} r={3.2 + 1.2 * Math.sin(t * 9 + i)} fill={col} />
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

/** Bintang berkilau (empat ujung). */
const Star: React.FC<{x: number; y: number; t: number; s: number}> = ({x, y, t, s}) => {
  const k = s * (1 + 0.08 * Math.sin(t * 3.1));
  const a = 46 * k;
  const b = 9 * k;
  const d = `M${x},${y - a} Q${x + b},${y - b} ${x + a},${y} Q${x + b},${y + b} ${x},${y + a} Q${x - b},${y + b} ${x - a},${y} Q${x - b},${y - b} ${x},${y - a} Z`;
  return (
    <g>
      <circle cx={x} cy={y} r={90 * k} fill="url(#soft-gold)" />
      <path d={d} fill="#fff6dc" transform={`rotate(${8 * Math.sin(t * 0.7)} ${x} ${y})`} />
      <circle cx={x} cy={y} r={10 * k} fill="#fff" />
    </g>
  );
};

/** Sidik jari: busur konsentris yang tergambar bertahap. */
const Finger: React.FC<{x: number; y: number; p: number; t: number}> = ({x, y, p, t}) => {
  if (p <= 0) return null;
  return (
    <g opacity={Math.min(1, p * 2)}>
      {Array.from({length: 9}, (_, i) => {
        const rx = 18 + i * 12;
        const ry = 26 + i * 15;
        const gap = 0.5 + 0.25 * rand(i);
        const a0 = -Math.PI / 2 + gap;
        const a1 = a0 + (TAU - 2 * gap) * ramp(p, i * 0.06, i * 0.06 + 0.5);
        const pts: P[] = Array.from({length: 33}, (_, j) => {
          const a = mix(a0, a1, j / 32);
          return [x + rx * Math.cos(a) * (1 + 0.04 * Math.sin(a * 3 + i)), y + ry * Math.sin(a)];
        });
        return (
          <path
            key={i}
            d={pts.map((q, j) => `${j ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ')}
            fill="none"
            stroke={i % 3 === 0 ? nmColor(656) : i % 3 === 1 ? nmColor(589) : nmColor(486)}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.55 + 0.35 * Math.sin(t * 1.6 - i * 0.5)}
          />
        );
      })}
    </g>
  );
};

// awan orbital (1s + 2p): titik sampel deterministik
const CLOUD: {x: number; y: number; z: number; s: number}[] = (() => {
  const out: {x: number; y: number; z: number; s: number}[] = [];
  for (let i = 0; i < 230; i++) {
    const u = (k: number) => Math.max(1e-4, rand(i * 17.3 + k * 3.1 + 5));
    if (i < 70) {
      const r = -0.5 * Math.log(u(1) * u(2) * u(3));
      const ct = 2 * u(4) - 1;
      const ph = TAU * u(5);
      const st = Math.sqrt(1 - ct * ct);
      out.push({x: r * st * Math.cos(ph), y: r * st * Math.sin(ph), z: r * ct, s: 0});
    } else {
      const r = -Math.log(u(1) * u(2) * u(3) * u(4) * u(5)) * 0.42;
      const sg = u(6) > 0.5 ? 1 : -1;
      const ct = sg * Math.cbrt(u(7));
      const ph = TAU * u(8);
      const st = Math.sqrt(1 - ct * ct);
      out.push({x: r * st * Math.cos(ph), y: r * ct, z: r * st * Math.sin(ph), s: 1});
    }
  }
  return out;
})();

const STRIP_Y = [360, 520, 680];
const SX0 = 560;
const SX1 = 1360;

export const Hook: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const c = [0, 1, 2, 3, 4, 5].map(cue);
  const end = 1 - ramp(t, dur - 0.7, dur + 0.3, EASE_IN_OUT);

  // (A) neon + kembang api
  const A = Math.min(ramp(t, 0.3, 1.2), 1 - ramp(t, c[1] - 0.7, c[1] - 0.1, EASE_IN_OUT));
  const tNe = wordOf(0, 'neon');
  const neOn = ramp(t, tNe - 0.4, tNe + 0.5);
  const flick = neOn * (1 - 0.35 * (1 - ramp(t, tNe, tNe + 1.2)) * (0.5 + 0.5 * Math.sin(t * 23)));
  const hum = 0.9 + 0.1 * Math.sin(t * 5.3);
  const tFw = wordOf(0, 'kembang');
  const fwOn = ramp(t, tFw - 0.6, tFw + 0.3);
  const neSp = ramp(t, wordOf(0, 'merah') - 0.2, wordOf(0, 'jingga') + 0.9);
  const cuSp = ramp(t, wordOf(0, 'hijau') - 0.2, wordOf(0, 'kebiruan') + 0.9);

  // (B) bintang → prisma → spektrum
  const B = Math.min(ramp(t, c[1] - 0.5, c[1] + 0.3), 1 - ramp(t, c[2] - 0.6, c[2] - 0.05, EASE_IN_OUT));
  const beam = ramp(t, c[1] - 0.1, wordOf(1, 'prisma') + 0.3);
  const fan = ramp(t, wordOf(1, 'prisma') - 0.1, wordOf(1, 'prisma') + 0.9);
  const dark = ramp(t, wordOf(1, 'garis') - 0.4, wordOf(1, 'tajam') + 0.4, (x) => x);

  // (C) sidik jari unsur → (D) bergeser ke kiri
  const Cin = ramp(t, c[2] - 0.4, c[2] + 0.4);
  const D = ramp(t, c[3] - 0.2, c[3] + 1.0, EASE_IN_OUT);
  const Cout = 1 - ramp(t, c[5] - 0.3, c[5] + 0.5, EASE_IN_OUT);
  const sp = [ramp(t, c[2] - 0.2, c[2] + 1.6, (x) => x), ramp(t, wordOf(2, 'warna') - 0.4, wordOf(2, 'warna') + 1.4, (x) => x), ramp(t, wordOf(2, 'garisnya') - 0.4, wordOf(2, 'garisnya') + 1.4, (x) => x)];
  const fp = ramp(t, wordOf(2, 'seperti') - 0.3, wordOf(2, 'jari') + 0.6, (x) => x) * (1 - D);
  const gx = mix(960, 520, D);
  const gs = mix(1, 0.7, D);

  // (D) siluet atom → orbital
  const atomIn = ramp(t, c[3] + 0.3, c[3] + 1.4);
  const flow = ramp(t, wordOf(3, 'petunjuk') - 0.5, wordOf(3, 'petunjuk') + 0.5) * (1 - ramp(t, c[4] + 0.6, c[4] + 1.4));
  const ask = ramp(t, c[4] - 0.3, c[4] + 0.5, BACK);
  const Q = ramp(t, c[5] - 0.2, c[5] + 1.4, EASE_IN_OUT);
  const ax = mix(1350, 960, Q);
  const ay = mix(520, 500, Q);
  const AR = mix(210, 240, Q);
  const qMark = (1 - Q) * atomIn;
  const kk = ramp(t, wordOf(5, 'kimia') - 0.4, wordOf(5, 'kuantum') + 0.4);
  const rot = t * 0.45;

  const spectraX = (nm: number) => SX0 + ((nm - 400) / 300) * (SX1 - SX0);
  const toScr = (x: number, y: number): P => [gx + (x - 960) * gs, 520 + (y - 520) * gs];

  return (
    <AbsoluteFill style={{opacity: end}}>
      <Stage>
        <defs>
          <linearGradient id="hk-rainbow" x1="0" y1="0" x2="1" y2="0">
            {Array.from({length: 13}, (_, i) => (
              <stop key={i} offset={`${(i / 12) * 100}%`} stopColor={nmColor(400 + i * 25)} />
            ))}
          </linearGradient>
          <linearGradient id="hk-shade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity={0.45} />
            <stop offset="30%" stopColor="#000" stopOpacity={0} />
            <stop offset="70%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.45} />
          </linearGradient>
          <linearGradient id="hk-fan" x1="0" y1="0" x2="0" y2="1">
            {Array.from({length: 13}, (_, i) => (
              <stop key={i} offset={`${(i / 12) * 100}%`} stopColor={nmColor(700 - i * 25)} stopOpacity={0.55} />
            ))}
          </linearGradient>
          <radialGradient id="hk-atom" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8fb8ff" stopOpacity={0.35} />
            <stop offset="70%" stopColor="#3b5fa8" stopOpacity={0.14} />
            <stop offset="100%" stopColor="#3b5fa8" stopOpacity={0} />
          </radialGradient>
        </defs>
        <Motes x={960} y={520} rx={900} ry={340} n={30} color="cyan" opacity={0.3} seed={4} />

        {/* ---------------- (A) neon & kembang api ---------------- */}
        {A > 0.001 ? (
          <g opacity={A}>
            <g transform={`translate(0 ${6 * Math.sin(t * 0.6)})`}>
              <rect x={190} y={300} width={560} height={260} rx={22} fill="#0a0f22" stroke="#2a375f" strokeWidth={3} />
              {[
                [210, 320],
                [730, 320],
                [210, 540],
                [730, 540],
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={6} fill="#3a4770" />
              ))}
              <line x1={300} y1={300} x2={300} y2={200} stroke="#3a4770" strokeWidth={3} />
              <line x1={640} y1={300} x2={640} y2={200} stroke="#3a4770" strokeWidth={3} />
              <Glow x={470} y={430} r={420} color="kin" opacity={0.75 * flick * hum} still />
              <circle cx={470} cy={430} r={300} fill="url(#soft-heat)" opacity={0.5 * flick * hum} />
              {/* tabung kaca (mati) di bawah huruf neon HTML */}
              <text x={470} y={482} textAnchor="middle" fontFamily={FONT.head} fontWeight={600} fontSize={150} letterSpacing={18} fill="none" stroke="#5a3a3a" strokeWidth={3} opacity={0.6}>
                NEON
              </text>
            </g>
            <Label x={470} y={610} size={30} color={nmColor(615)} weight={600} opacity={neOn}>
              lampu neon
            </Label>
            <Strip x0={240} x1={700} y={700} h={56} lines={NE_LINES} p={neSp} t={t} seed={1} />
            <Label x={210} y={700} size={28} font="mono" color={C.muted} anchor="end" opacity={neSp > 0 ? 1 : 0.4}>
              Ne
            </Label>

            <Firework cx={1430} cy={400} t={t - tFw + 0.7} on={fwOn} />
            <Label x={1430} y={610} size={30} color="#4fe0c0" weight={600} opacity={fwOn}>
              kembang api tembaga
            </Label>
            <Strip x0={1200} x1={1660} y={700} h={56} lines={CU_LINES} p={cuSp} t={t} seed={2} />
            <Label x={1700} y={700} size={28} font="mono" color={C.muted} anchor="start" opacity={cuSp > 0 ? 1 : 0.4}>
              Cu
            </Label>
            <Label x={960} y={800} size={22} font="mono" color={C.muted} opacity={ramp(t, wordOf(0, 'hijau'), wordOf(0, 'hijau') + 0.8) * 0.85}>
              400 nm ──────── panjang gelombang ──────── 700 nm
            </Label>
          </g>
        ) : null}

        {/* ---------------- (B) bintang → prisma → spektrum ---------------- */}
        {B > 0.001 ? (
          <g opacity={B}>
            <Star x={230} y={460} t={t} s={1} />
            <Twinkles x={230} y={460} rx={90} ry={90} n={4} color="gold" seed={3} />
            {/* berkas putih */}
            <polygon points={`260,452 ${mix(260, 690, beam)},${mix(452, 470, beam)} ${mix(260, 690, beam)},${mix(468, 494, beam)} 260,468`} fill="#fff6e0" opacity={0.45} />
            <Stream pts={[[270, 460], [mix(270, 690, beam), mix(460, 482, beam)]]} color="white" n={7} speed={0.8} r={4} jitter={2} opacity={beam} />
            {/* prisma */}
            <polygon points="760,330 640,600 880,600" fill="#9fd8ff" fillOpacity={0.14} stroke="#cfeaff" strokeWidth={3} />
            <polygon points="760,350 662,585 700,585" fill="#fff" opacity={0.08 + 0.05 * Math.sin(t * 2)} />
            {/* kipas warna */}
            {fan > 0 ? (
              <polygon points={`815,500 ${mix(815, 1080, fan)},${mix(500, 360, fan)} ${mix(815, 1080, fan)},${mix(520, 640, fan)} 815,520`} fill="url(#hk-fan)" opacity={0.75} />
            ) : null}
            <g opacity={fan}>
              <rect x={1080} y={340} width={14} height={320} fill="#1a2240" />
              <g transform="translate(1110 0)">
                <Absorb x0={0} x1={640} y={500} h={170} dark={dark} t={t} />
              </g>
            </g>
            <Label x={230} y={590} size={28} color={C.gold} weight={600} opacity={ramp(t, c[1], c[1] + 0.6)}>
              cahaya bintang
            </Label>
            <Label x={760} y={650} size={26} color={C.muted} opacity={fan}>
              prisma
            </Label>
            <Label x={1430} y={330} size={30} color={C.ink} weight={600} opacity={dark > 0 ? Math.min(1, dark * 3) : 0}>
              garis-garis gelap (Fraunhofer)
            </Label>
            <Label x={1430} y={660} size={20} font="mono" color={C.muted} opacity={fan * 0.8}>
              400 nm · · · · · · · · · · · · · · · · 700 nm
            </Label>
          </g>
        ) : null}

        {/* ---------------- (C/D) sidik jari unsur ---------------- */}
        {Cin * Cout > 0.001 ? (
          <g opacity={Cin * Cout}>
            <g transform={`translate(${gx} 520) scale(${gs}) translate(-960 -520)`}>
              {[H_LINES, NA_LINES, NE_LINES].map((ls, k) => (
                <g key={k}>
                  <Strip x0={SX0} x1={SX1} y={STRIP_Y[k]} h={96} lines={ls} p={sp[k]} t={t} seed={k * 3} />
                  <Label x={SX0 - 50} y={STRIP_Y[k]} size={52} weight={700} anchor="end" color={[nmColor(656), nmColor(589), nmColor(625)][k]} opacity={0.35 + 0.65 * Math.min(1, sp[k] * 3)}>
                    {['H', 'Na', 'Ne'][k]}
                  </Label>
                </g>
              ))}
              <Label x={960} y={790} size={22} font="mono" color={C.muted} opacity={0.8 * (1 - D)}>
                400 nm ──────── spektrum emisi ──────── 700 nm
              </Label>
            </g>
            <g transform="translate(1620 500) scale(1.35) translate(-1620 -500)">
              <Finger x={1620} y={500} p={fp} t={t} />
            </g>
            <Label x={1620} y={720} size={30} color={C.gold} weight={600} opacity={fp}>
              sidik jari unsur
            </Label>
            {/* garis-garis → siluet atom */}
            {[0, 1, 2].map((k) => {
              const nm = [656.3, 589.0, 640.2][k];
              const [x0, y0] = toScr(spectraX(nm) + 10, STRIP_Y[k]);
              const hueK = (['heat', 'force', 'kin'] as const)[k];
              return <Stream key={k} pts={[[x0 + 30, y0], [mix(x0 + 30, ax - AR, 0.5), mix(y0, ay, 0.3) - 20], [ax - AR * 0.55, ay]]} color={hueK} n={6} speed={0.45} r={4.5} seed={k} opacity={flow} />;
            })}
          </g>
        ) : null}

        {/* ---------------- (D) atom ---------------- */}
        {atomIn > 0.001 ? (
          <g opacity={atomIn}>
            <Glow x={ax} y={ay} r={AR * 2} color="spr" opacity={0.35 + 0.35 * ask} />
            <circle cx={ax} cy={ay} r={AR} fill="url(#hk-atom)" opacity={(1 - Q * 0.7) * (0.8 + 0.2 * Math.sin(t * 1.4))} />
            <circle cx={ax} cy={ay} r={AR} fill="none" stroke={C.cyan} strokeWidth={2.5} strokeDasharray="10 12" strokeDashoffset={-t * 30} opacity={0.6 * (1 - Q)} />
            {[0, 1, 2].map((k) => {
              const ph = fr(t * 0.35 + k / 3);
              return <circle key={k} cx={ax} cy={ay} r={AR * (0.4 + 0.75 * ph)} fill="none" stroke={C.cyan} strokeWidth={2} opacity={0.35 * cyc(ph) * (1 - Q)} />;
            })}
            <text
              x={ax}
              y={ay + 8}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily={FONT.head}
              fontWeight={700}
              fontSize={200 * (0.9 + 0.12 * ask + 0.04 * Math.sin(t * 2.2))}
              fill={C.ink}
              opacity={qMark * (0.55 + 0.45 * ask)}
              style={{paintOrder: 'stroke', stroke: 'rgba(7,11,24,0.6)', strokeWidth: 10}}
            >
              ?
            </text>
            {/* awan orbital */}
            {Q > 0.001 ? (
              <g opacity={Q}>
                <circle cx={ax} cy={ay} r={9} fill={C.heat} />
                <circle cx={ax} cy={ay} r={26} fill="url(#soft-heat)" />
                {CLOUD.map((p, i) => {
                  const tilt = 0.35;
                  const x1 = p.x * Math.cos(rot) + p.z * Math.sin(rot);
                  const z1 = -p.x * Math.sin(rot) + p.z * Math.cos(rot);
                  const y1 = p.y * Math.cos(tilt) - z1 * Math.sin(tilt);
                  const z2 = p.y * Math.sin(tilt) + z1 * Math.cos(tilt);
                  const sc = p.s ? 112 : 96;
                  const grow = ramp(Q, (i % 23) * 0.02, (i % 23) * 0.02 + 0.55);
                  const tw = 0.55 + 0.45 * Math.sin(t * 2.5 + i * 1.3);
                  return <circle key={i} cx={ax + x1 * sc * grow} cy={ay + y1 * sc * grow} r={2.6 + 1.2 * z2} fill={p.s ? C.spr : C.pot} opacity={(0.45 + 0.3 * z2) * tw} />;
                })}
                <Ripple x={ax} y={ay} p={ramp(t, c[5] + 0.4, c[5] + 2.2, (x) => x)} r={330} color="spr" />
              </g>
            ) : null}
            <Label x={1350} y={225} size={26} font="mono" color={C.gold} opacity={ramp(t, wordOf(3, 'awal') - 0.2, wordOf(3, 'awal') + 0.6) * (1 - Q)}>
              awal abad ke-20
            </Label>
            <Label x={ax} y={ay + AR + 60} size={40} weight={700} color={C.ink} opacity={ask * (1 - Q)}>
              bagaimana atom tersusun?
            </Label>
            <Label x={ax} y={ay + AR + 70} size={44} weight={700} color={C.spr} opacity={kk}>
              kimia kuantum
            </Label>
            <Twinkles x={ax} y={ay} rx={AR + 40} ry={AR} n={6} color="spr" opacity={kk} seed={8} />
          </g>
        ) : null}
      </Stage>
      {A > 0.001 ? (
        <div
          style={{
            position: 'absolute',
            left: 470,
            top: 430 + 6 * Math.sin(t * 0.6),
            transform: 'translate(-50%, -50%)',
            fontFamily: FONT.head,
            fontWeight: 600,
            fontSize: 150,
            letterSpacing: 18,
            paddingLeft: 18,
            color: '#fff1e8',
            opacity: A * (0.08 + 0.92 * flick * hum),
            textShadow: '0 0 6px #ff7a4a, 0 0 16px #ff5a2e, 0 0 38px #ff4a1e, 0 0 80px #ff3a10, 0 0 140px #ff3a10',
            whiteSpace: 'nowrap',
          }}
        >
          NEON
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
