import React from 'react';
import {AbsoluteFill, Img, interpolateColors, staticFile} from 'remotion';
import {EASE_IN_OUT, cyc, ramp, rand} from '../anim';
import {Glow, Motes, Ripple, Spark, Stage, Twinkles} from '../components/primitives';
import {BRAND} from '../brand';
import {useScene} from '../SceneContext';
import {C, FONT, type Hue} from '../theme';

const REFS = [
  'R. A. Serway & J. W. Jewett, Physics for Scientists and Engineers (fisika atom, model Bohr)',
  'D. Halliday, R. Resnick & J. Walker, Fundamentals of Physics (spektrum hidrogen, gelombang materi)',
  'A. Beiser, Concepts of Modern Physics (Rutherford, Bohr, de Broglie)',
  'P. Atkins & J. de Paula, Physical Chemistry (struktur atom, orbital hidrogen)',
  'NIST Atomic Spectra Database (garis Balmer H) · CODATA (R∞, a₀, energi ionisasi H)',
  'RPS Fisika Umum S1 Kimia UNESA (fisika atom)',
];

// butir yang mengorbit logo (kode warna atom: inti merah, elektron biru, tingkat energi hijau, orbit klasik toska, gelombang ungu, ionisasi emas)
const ORBIT: {hue: Hue; ph: number}[] = [
  {hue: 'heat', ph: 0},
  {hue: 'pot', ph: 1.05},
  {hue: 'work', ph: 2.09},
  {hue: 'cyan', ph: 3.14},
  {hue: 'spr', ph: 4.19},
  {hue: 'gold', ph: 5.24},
];
const OC = {x: 960, y: 188, rx: 190, ry: 48, tilt: -14, sp: 0.5};

const orbitPt = (a: number): [number, number] => {
  const c = Math.cos((OC.tilt * Math.PI) / 180);
  const s = Math.sin((OC.tilt * Math.PI) / 180);
  const ex = OC.rx * Math.cos(a);
  const ey = OC.ry * Math.sin(a);
  return [OC.x + ex * c - ey * s, OC.y + ex * s + ey * c];
};

const fr = (v: number) => ((v % 1) + 1) % 1;

// seri Fisika Umum (10 video)
const SERIES = ['Energi', 'Fluida Statis', 'Fluida Dinamis', 'Momentum', 'Osilasi', 'Gelombang', 'Termofisika', 'Listrik', 'Magnet', 'Atom'];
const STRIP = {y: 872, dx: 118};
const LINES: {from: number; nm: number; col: string}[] = [
  {from: 3, nm: 656, col: '#ff3b3b'},
  {from: 4, nm: 486, col: '#2fd6e0'},
  {from: 5, nm: 434, col: '#5b6bff'},
];

/** Motif kiri: tangga energi berskala −13,6/n²; elektron turun ke n = 2 memancarkan foton berwarna (656 / 486 / 434 nm bergantian). */
const Ladder: React.FC<{x: number; y: number; t: number; opacity: number}> = ({x, y, t, opacity}) => {
  if (opacity <= 0.001) return null;
  const yTop = y - 250;
  const yBot = y - 44;
  const lv = (n: number) => yTop + (yBot - yTop) / (n * n);
  const P = 3.6;
  const raw = t / P;
  const k = Math.floor(raw);
  const u = raw - k;
  const J = LINES[((k % 3) + 3) % 3];
  const fall = ramp(u, 0.25, 0.42, EASE_IN_OUT);
  const ex = x + 70;
  const ey = lv(J.from) + (lv(2) - lv(J.from)) * fall;
  const eo = Math.min(1, u * 6) * (1 - ramp(u, 0.75, 1));
  const pu = Math.max(0, (u - 0.42) / 0.55);
  const py = (lv(J.from) + lv(2)) / 2;
  const photon = Array.from({length: 21}, (_, i) => `${i ? 'L' : 'M'}${(x + 88 + pu * 120 + i * 3).toFixed(1)},${(py + 7 * Math.sin(i * 0.95 - t * 10)).toFixed(1)}`).join(' ');
  return (
    <g opacity={opacity}>
      <Glow x={x + 120} y={y - 130} r={170} color="work" opacity={0.25} />
      <line x1={x + 20} y1={yTop} x2={x + 210} y2={yTop} stroke={C.gold} strokeWidth={2} strokeDasharray="5 6" strokeOpacity={0.7} />
      <text x={x + 12} y={yTop - 4} textAnchor="end" dominantBaseline="central" fontFamily={FONT.mono} fontSize={15} fill={C.gold}>
        0
      </text>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <g key={n}>
          <line x1={x + 20} y1={lv(n)} x2={x + 210} y2={lv(n)} stroke={C.work} strokeWidth={n === 1 ? 4 : n === 2 ? 3.4 : 2.2} strokeOpacity={n <= 3 ? 0.85 : 0.5} />
          {n <= 2 ? (
            <text x={x + 12} y={lv(n)} textAnchor="end" dominantBaseline="central" fontFamily={FONT.mono} fontSize={16} fill={C.work}>
              {n}
            </text>
          ) : null}
        </g>
      ))}
      <circle cx={ex} cy={ey} r={22} fill="url(#soft-pot)" opacity={eo} />
      <circle cx={ex} cy={ey} r={8} fill={C.pot} opacity={eo} />
      <circle cx={ex - 2.5} cy={ey - 2.5} r={3} fill="#fff" opacity={0.7 * eo} />
      {pu > 0 && pu < 1 ? (
        <g opacity={Math.sin(Math.PI * pu)}>
          <path d={photon} fill="none" stroke={J.col} strokeWidth={9} strokeOpacity={0.25} />
          <path d={photon} fill="none" stroke={J.col} strokeWidth={3} />
          <text x={x + 120 + pu * 120} y={py - 22} textAnchor="middle" fontFamily={FONT.mono} fontSize={16} fill={J.col}>
            {J.nm} nm
          </text>
        </g>
      ) : null}
      <text x={x + 125} y={y - 18} textAnchor="middle" fontFamily={FONT.mono} fontSize={18} fill={C.work}>
        turun → foton hf = ΔE
      </text>
      <rect x={x - 6} y={y - 4} width={262} height={10} rx={4} fill="#26305a" stroke="#5b6a9e" strokeWidth={2} />
    </g>
  );
};

const lobeD = (L: number, W: number) => `M0,0 C${L * 0.22},${W} ${L * 0.95},${W * 1.08} ${L},0 C${L * 0.95},${-W * 1.08} ${L * 0.22},${-W} 0,0 Z`;

/** Motif kanan: orbital 2p berputar semu-3D (cuping fase + ungu / − emas) dengan bidang simpul. */
const P2: React.FC<{x: number; y: number; t: number; opacity: number}> = ({x, y, t, opacity}) => {
  if (opacity <= 0.001) return null;
  const cx = x + 125;
  const cy = y - 140;
  const th = t * 0.6;
  const al = 0.35;
  // sumbu orbital condong 30° dari tegak, berputar mengelilingi sumbu tegak
  const ax = Math.sin(0.52) * Math.cos(th);
  const ay = Math.sin(0.52) * Math.sin(th);
  const az = Math.cos(0.52);
  const sx = ax;
  const sy = -(az * Math.cos(al) + ay * Math.sin(al));
  const dep = -ay * Math.cos(al) + az * Math.sin(al);
  const ls = Math.hypot(sx, sy);
  const L = 92 * (1 + 0.03 * Math.sin(t * 1.6));
  const Le = Math.max(L * ls, 36);
  const ang = (Math.atan2(sy, sx) * 180) / Math.PI;
  const plus = <path key="p" d={lobeD(Le, 38)} fill="url(#out-p)" stroke={C.spr} strokeWidth={2} />;
  const minus = <path key="m" d={lobeD(Le, 38)} transform="rotate(180)" fill="url(#out-m)" stroke={C.gold} strokeWidth={2} />;
  return (
    <g opacity={opacity}>
      <Glow x={cx} y={cy} r={170} color="spr" opacity={0.35} />
      <g transform={`translate(${cx} ${cy}) rotate(${ang})`}>
        <ellipse cx={0} cy={0} rx={22} ry={96} fill={C.heat} fillOpacity={0.07} stroke={C.heat} strokeOpacity={0.5} strokeWidth={1.6} strokeDasharray="6 6" />
        {dep >= 0 ? [minus, plus] : [plus, minus]}
        <text x={Le * 0.6} y={0} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={24} fill="#fff" transform={`rotate(${-ang} ${Le * 0.6} 0)`}>
          +
        </text>
        <text x={-Le * 0.6} y={0} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={24} fill="#fff" transform={`rotate(${-ang} ${-Le * 0.6} 0)`}>
          −
        </text>
      </g>
      <circle cx={cx} cy={cy} r={6} fill={C.heat} />
      <text x={x + 125} y={y - 18} textAnchor="middle" fontFamily={FONT.mono} fontSize={18} fill={C.spr}>
        orbital 2p: dua cuping
      </text>
      <rect x={x - 6} y={y - 4} width={262} height={10} rx={4} fill="#26305a" stroke="#5b6a9e" strokeWidth={2} />
    </g>
  );
};

/** Penutup: logo SCIENTIAN, tagline, nama penyusun, rujukan, jejak seri (10 video), dan pil penutup seri (motif atom). */
export const Outro: React.FC = () => {
  const {t, dur} = useScene();
  const logo = ramp(t, 0.2, 1.6);
  const name = ramp(t, 1.4, 2.4);
  const by = ramp(t, 2.4, 3.4);
  const next = ramp(t, 9.2, 10.2);
  const motif = ramp(t, 1.0, 3.0);
  const out = 1 - ramp(t, dur - 1.6, dur - 0.1, EASE_IN_OUT);
  const orbitOn = ramp(t, 0.8, 2.2);
  const pts = ORBIT.map((o) => {
    const a = o.ph + t * OC.sp;
    const trail = [1, 2, 3, 4, 5].map((k) => orbitPt(a - k * 0.07));
    return {o, a, p: orbitPt(a), trail, front: Math.sin(a) > 0};
  });
  const ring = (front: boolean) =>
    pts
      .filter((q) => q.front === front)
      .map((q) => <Spark key={q.o.hue} x={q.p[0]} y={q.p[1]} r={5.25 + 1.25 * Math.sin(q.a)} color={q.o.hue} trail={q.trail} opacity={orbitOn * (0.8 + 0.2 * Math.sin(q.a))} />);
  const ellipseD = (() => {
    let d = '';
    for (let i = 0; i <= 48; i++) {
      const [x, y] = orbitPt((i / 48) * Math.PI * 2);
      d += `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    }
    return d;
  })();
  // jejak seri: titik menyala berurutan
  const s0 = 6.0;
  const sStep = 0.32;
  const stripOn = ramp(t, 5.4, 6.2);
  const sx = (i: number) => 960 + (i - 4.5) * STRIP.dx;
  const headP = Math.min(9, Math.max(0, (t - s0) / sStep));
  const lastOn = ramp(t, s0 + 9 * sStep, s0 + 9 * sStep + 0.5);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <Stage>
        <defs>
          <radialGradient id="out-p" cx="62%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#e6d4ff" stopOpacity="0.9" />
            <stop offset="55%" stopColor={C.spr} stopOpacity="0.6" />
            <stop offset="100%" stopColor={C.spr} stopOpacity="0.25" />
          </radialGradient>
          <radialGradient id="out-m" cx="62%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#fff0c4" stopOpacity="0.9" />
            <stop offset="55%" stopColor={C.gold} stopOpacity="0.55" />
            <stop offset="100%" stopColor={C.gold} stopOpacity="0.22" />
          </radialGradient>
        </defs>
        <Glow x={960} y={240} r={440} color="pot" opacity={0.3 * logo} />
        <Glow x={960} y={188} r={200} color="spr" opacity={0.25 * logo} />
        <Motes x={960} y={300} rx={620} ry={260} n={40} color="spr" opacity={0.45 * logo} seed={13} />
        {/* atom-atom kecil melayang naik pelan (inti merah, elektron biru mengorbit) */}
        {Array.from({length: 20}, (_, k) => {
          const p = fr((t + rand(k * 3.1) * 14) / (10 + 5 * rand(k)));
          const x = 60 + rand(k * 5.3) * 1800 + 10 * Math.sin(t * 0.7 + k);
          const y = 1000 - p * 900;
          const tilt = rand(k * 2.9) * 180;
          const a = t * (1.5 + rand(k * 7.1)) + k;
          const c = Math.cos((tilt * Math.PI) / 180);
          const s = Math.sin((tilt * Math.PI) / 180);
          const exx = 11 * Math.cos(a);
          const eyy = 4.5 * Math.sin(a);
          return (
            <g key={k} opacity={cyc(p) * 0.4 * logo}>
              <ellipse cx={x} cy={y} rx={11} ry={4.5} fill="none" stroke={C.cyan} strokeWidth={0.8} strokeOpacity={0.6} transform={`rotate(${tilt} ${x} ${y})`} />
              <circle cx={x} cy={y} r={2.6} fill={C.heat} />
              <circle cx={x + exx * c - eyy * s} cy={y + exx * s + eyy * c} r={1.8} fill={C.pot} />
            </g>
          );
        })}
        <path d={ellipseD} fill="none" stroke={C.spr} strokeOpacity={0.18 * orbitOn} strokeWidth={1.5} strokeDasharray="4 10" strokeDashoffset={-t * 14} />
        {ring(false)}
        <Ladder x={110} y={860} t={t} opacity={0.85 * motif} />
        <P2 x={1560} y={860} t={t} opacity={0.85 * motif} />
        <Twinkles x={960} y={530} rx={360} ry={30} n={4} color="gold" opacity={by * 0.7} seed={17} />
        {/* jejak seri Fisika Umum: 10 video menyala berurutan */}
        <g opacity={stripOn}>
          <line x1={sx(0)} y1={STRIP.y} x2={sx(9)} y2={STRIP.y} stroke={C.faint} strokeWidth={2} />
          <line x1={sx(0)} y1={STRIP.y} x2={sx(0) + headP * STRIP.dx} y2={STRIP.y} stroke={C.cyan} strokeWidth={2} strokeOpacity={0.7} />
          {headP > 0 && headP < 9 ? <Spark x={sx(0) + headP * STRIP.dx} y={STRIP.y} r={3.5} color="cyan" /> : null}
          {SERIES.map((s, i) => {
            const li = ramp(t, s0 + i * sStep - 0.1, s0 + i * sStep + 0.35);
            const last = i === 9;
            const col = interpolateColors(li, [0, 1], [C.faint, last ? C.gold : C.cyan]);
            const r = last ? 8 + 1.2 * Math.sin(t * 2.4) * lastOn : 5.5;
            return (
              <g key={s}>
                {last ? <Glow x={sx(i)} y={STRIP.y} r={36} color="gold" opacity={0.8 * li} /> : null}
                <circle cx={sx(i)} cy={STRIP.y} r={r} fill={col} stroke={col} strokeWidth={1.5} />
                <text
                  x={sx(i)}
                  y={STRIP.y + 18}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily={FONT.sans}
                  fontSize={13}
                  fontWeight={last ? 600 : 400}
                  fill={interpolateColors(li, [0, 1], [C.faint, last ? C.gold : C.muted])}
                >
                  {s}
                </text>
              </g>
            );
          })}
          <Ripple x={sx(9)} y={STRIP.y} p={(t - s0 - 9 * sStep) / 1.4} r={70} color="gold" rings={2} />
        </g>
      </Stage>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 70}}>
        <Img
          src={staticFile('scientian-logo.png')}
          style={{
            width: 230,
            height: 230,
            opacity: logo,
            scale: String((0.85 + 0.15 * logo) * (1 + 0.015 * Math.sin(t * 1.3))),
            rotate: `${(1 - logo) * -20}deg`,
          }}
        />
        <div style={{fontFamily: FONT.head, fontSize: 64, fontWeight: 700, letterSpacing: 16 + 6 * (1 - name), color: C.ink, marginTop: 4, opacity: name, textShadow: `0 0 ${18 + 8 * Math.sin(t * 1.6)}px ${C.cyan}55`}}>{BRAND.channel}</div>
        <div style={{fontFamily: FONT.head, fontSize: 28, color: C.muted, letterSpacing: 3, marginTop: 4, opacity: name}}>
          Explore <span style={{color: C.gold}}>Science</span> with Yayan
        </div>
        <div style={{marginTop: 34, fontFamily: FONT.sans, fontSize: 24, color: C.muted, opacity: by, letterSpacing: 2}}>DISUSUN OLEH</div>
        <div style={{fontFamily: FONT.head, fontSize: 46, fontWeight: 600, color: C.ink, opacity: by, marginTop: 2, translate: `0px ${(1 - by) * 12}px`}}>{BRAND.author}</div>
        <div style={{marginTop: 34, textAlign: 'center'}}>
          <div style={{fontFamily: FONT.mono, fontSize: 18, letterSpacing: 4, color: C.gold, marginBottom: 10, opacity: ramp(t, 3.4, 4.2)}}>RUJUKAN</div>
          {REFS.map((r, i) => {
            const o = ramp(t, 3.7 + i * 0.22, 4.6 + i * 0.22);
            return (
              <div key={r} style={{fontFamily: FONT.sans, fontSize: 21, color: C.muted, lineHeight: 1.55, opacity: o, translate: `0px ${(1 - o) * 10}px`}}>
                {r}
              </div>
            );
          })}
          <div style={{marginTop: 12, fontFamily: FONT.sans, fontSize: 19, color: C.muted, opacity: 0.85 * ramp(t, 5.2, 6.0)}}>
            Ilustrasi skematis · ukuran atom & inti tidak berskala kecuali disebut · panjang gelombang di udara
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 70,
            fontFamily: FONT.head,
            fontSize: 30,
            color: C.ink,
            opacity: next,
            padding: '10px 28px',
            borderRadius: 999,
            border: `2px solid ${C.gold}`,
            background: 'rgba(10,16,36,0.85)',
            boxShadow: `0 0 ${16 + 12 * (0.5 + 0.5 * Math.sin(t * 2))}px ${C.gold}66, 0 0 30px ${C.spr}44`,
            translate: `0px ${(1 - next) * 14}px`,
          }}
        >
          <span style={{color: C.ink}}>{BRAND.next}</span>
        </div>
      </AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible'}}>
        {ring(true)}
      </svg>
    </AbsoluteFill>
  );
};
