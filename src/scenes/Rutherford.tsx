import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, mix, ramp, rand} from '../anim';
import {Badge, Formula, Frac, Glow, Label, Motes, Note, Ripple, Spark, Stage, Sub, Sup, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Rutherford (AUDIT): Geiger–Marsden 1909 (lab Rutherford), interpretasi 1911; ≈ 1 dari 8000 terpantul > 90°;
// inti ≈ 10⁻¹⁵ m, atom ≈ 10⁻¹⁰ m → 10⁵×; stadion–kelereng.
// (1) alat: sumber α dalam kotak timbal → berkas → lembaran emas → cincin layar ZnS dengan kilatan;
//     sudut hambur tiap partikel diundi saat siklusnya mulai (saat tak terlihat → tanpa loncatan):
//     dugaan Thomson (samar) |θ| < 2,5°; kenyataan: kebanyakan < 5°, sebagian 15–70°, jarang > 90° (dilebihkan agar terlihat).
// (2) panel perbesaran: lintasan hiperbola Coulomb (tolak) u(φ) = sin φ / b + d/(2b²)(cos φ − 1), tan(θ/2) = d/(2b):
//     makin kecil parameter dampak b → makin besar belokan; b ≈ 0 → memantul.
// (3) analogi peluru meriam vs kertas tisu; (4) muatan + yang tersebar mengerut menjadi inti kecil;
// (5) zoom bertingkat 10⁵× (z = 10^(5p)) dari atom 10⁻¹⁰ m ke inti 10⁻¹⁵ m + stadion vs kelereng.
const TAU = Math.PI * 2;
const fr = (v: number) => ((v % 1) + 1) % 1;
const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
type P = [number, number];
const DEG = Math.PI / 180;

// ---------- alat (koordinat lokal, lembaran emas di 0,0) ----------
const RR = 250;
const SRC = -370;
const NP = 24;
const FLASH = '#8dffc4';
type Mode = 0 | 1 | 2; // 0 lurus, 1 dugaan Thomson, 2 kenyataan
const theta = (mode: Mode, u: number, v: number) => {
  const s = v > 0.5 ? 1 : -1;
  if (mode === 0) return (u - 0.5) * 0.03;
  if (mode === 1) return s * u * 2.5 * DEG;
  if (u < 0.07) return s * (100 + 60 * (u / 0.07)) * DEG;
  if (u < 0.24) return s * (15 + 55 * ((u - 0.07) / 0.17)) * DEG;
  return s * 5 * ((u - 0.24) / 0.76) ** 2 * DEG;
};

// ---------- panel perbesaran ----------
const PX0 = 1040;
const PX1 = 1830;
const PY0 = 262;
const PY1 = 850;
const NCX = 1435;
const NCY = 556;
const hyper = (b: number, d: number): P[] => {
  const s = Math.sign(b) || 1;
  const B = Math.abs(b);
  const pmax = Math.PI - 2 * Math.atan(d / (2 * B));
  const pts: P[] = [];
  for (let i = 1; i < 700; i++) {
    const ph = (pmax * i) / 700;
    const u = Math.sin(ph) / B + (d / (2 * B * B)) * (Math.cos(ph) - 1);
    if (u <= 0) continue;
    const r = 1 / u;
    const x = NCX - r * Math.cos(ph);
    const y = NCY - s * r * Math.sin(ph);
    if (x < PX0 + 6 || x > PX1 - 6 || y < PY0 + 6 || y > PY1 - 6) continue;
    pts.push([x, y]);
  }
  return pts;
};
const DD = 18; // jarak terdekat tumbukan sentral (px)
const BS = [1.0, 5, -9, 16, -25, 38, -55, 80, -110, 148, -190, 236, -275];
const TRACKS = BS.map((b) => ({b, pts: hyper(b, DD), th: (2 * Math.atan(DD / (2 * Math.abs(b)))) / DEG}));
// panjang busur kumulatif → laju tetap di sepanjang lintasan
const arcAt = (pts: P[]) => {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return (u: number): P => {
    const target = Math.max(0, Math.min(1, u)) * L[L.length - 1];
    let lo = 0;
    let hi = L.length - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (L[m] < target) lo = m;
      else hi = m;
    }
    const k = (target - L[lo]) / (L[hi] - L[lo] || 1);
    return [mix(pts[lo][0], pts[hi][0], k), mix(pts[lo][1], pts[hi][1], k)];
  };
};
const TRACK_AT = TRACKS.map((tr) => arcAt(tr.pts));
const GHOST_Y = Array.from({length: 10}, (_, i) => PY0 + 40 + i * 57);
const GHOST_D = GHOST_Y.map((_, i) => (rand(i * 4.1) - 0.5) * 4 * DEG);
const ghostPt = (i: number, u: number): P => {
  const x = mix(PX0 + 10, PX1 - 10, u);
  const y = GHOST_Y[i] + (x > NCX ? Math.tan(GHOST_D[i]) * (x - NCX) : 0);
  return [x, y];
};

// ---------- zoom ----------
const ZX = 640;
const ZY = 520;
const R0 = 250;
const NUC: P[] = [
  [0, 0],
  [0.5, 0.1],
  [-0.45, 0.2],
  [0.15, -0.5],
  [-0.2, 0.55],
  [0.6, -0.35],
  [-0.6, -0.3],
  [0.3, 0.55],
  [-0.1, -0.15],
  [0.25, 0.15],
  [-0.35, -0.6],
  [0.62, 0.42],
  [-0.65, 0.48],
  [0.05, 0.7],
];

export const Rutherford: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const end = 1 - ramp(t, dur - 0.7, dur + 0.2, EASE_IN_OUT);

  // ---- alat ----
  const app = Math.min(ramp(t, -0.2, 0.9), 1 - ramp(t, cue(3) - 0.4, cue(3) + 0.3, EASE_IN_OUT));
  const mv = ramp(t, cue(1) - 0.5, cue(1) + 0.7, EASE_IN_OUT);
  const gx = mix(980, 570, mv);
  const gy = mix(530, 545, mv);
  const gs = mix(1.12, 0.9, mv);
  const beam = ramp(t, wordOf(0, 'menembakkan') - 0.6, wordOf(0, 'partikel') + 0.2);
  const foilHi = ramp(t, wordOf(0, 'lembaran') - 0.3, wordOf(0, 'emas') + 0.4);
  const tThom = cue(1) - 0.6;
  const tReal = cue(2) - 0.4;
  const modeAt = (tt: number): Mode => (tt < tThom ? 0 : tt < tReal ? 1 : 2);
  const scope = 30 * DEG * Math.sin(t * 0.35);

  // ---- panel ----
  const panel = Math.min(ramp(t, cue(1) - 0.3, cue(1) + 0.5), 1 - ramp(t, cue(5) - 0.6, cue(5) + 0.1, EASE_IN_OUT));
  const ghost = slot(t, cue(1) - 0.1, cue(2) + 0.3, 0.6, 0.6);
  const real = ramp(t, cue(2) - 0.1, cue(2) + 0.7);
  const backHi = ramp(t, wordOf(2, 'memantul') - 0.4, wordOf(2, 'memantul') + 0.4);
  const straightHi = slot(t, wordOf(2, 'menembus') - 0.3, wordOf(2, 'tetapi') + 0.2);
  const nucLbl = ramp(t, wordOf(4, 'inti') - 0.3, wordOf(4, 'inti') + 0.5);

  // ---- analogi ----
  const ana = Math.min(ramp(t, cue(3) - 0.2, cue(3) + 0.6), 1 - ramp(t, cue(4) - 0.4, cue(4) + 0.2, EASE_IN_OUT));
  const tFire = wordOf(3, 'menembakkan') - 0.1;
  const tHit = wordOf(3, 'tisu') + 0.1;
  const tBack = Math.max(tHit + 0.4, wordOf(3, 'memantul') + 0.2);
  const fly = ramp(t, tFire, tHit, (x) => x);
  const ret = ramp(t, tHit, tBack + 0.8, EASE_IN_OUT);
  const bx = t < tHit ? mix(330, 740, fly) : mix(740, 380, ret);
  const by = t < tHit ? 540 - 40 * Math.sin(Math.PI * fly) : 540 - 70 * Math.sin(Math.PI * ret);
  const bang = ramp(t, tHit - 0.05, tHit + 0.9, (x) => x);

  // ---- kesimpulan ----
  const con = Math.min(ramp(t, cue(4) - 0.3, cue(4) + 0.6), 1 - ramp(t, cue(5) - 0.6, cue(5) + 0.1, EASE_IN_OUT));
  const shrink = ramp(t, wordOf(4, 'terkumpul') - 0.6, wordOf(4, 'kecil') + 0.3, EASE_IN_OUT);
  const hazeR = mix(220, 8, shrink);
  const year = ramp(t, wordOf(4, 'sebelas') - 0.3, wordOf(4, 'sebelas') + 0.5);
  const cNote = slot(t, wordOf(4, 'inti') - 0.1, cue(5) - 0.3);

  // ---- zoom ----
  const zoom = ramp(t, cue(5) - 0.4, cue(5) + 0.4);
  const zp = ramp(t, cue(5) + 1.0, wordOf(5, 'kecil') + 0.2, EASE_IN_OUT);
  const L = 5 * zp;
  const z = Math.pow(10, L);
  const Ra = R0 * z;
  const Rn = R0 * z * 1e-5;
  const card = slot(t, wordOf(5, 'seratus') - 0.2, dur, 0.6, 0.5);
  const stad = ramp(t, wordOf(5, 'stadion') - 0.4, wordOf(5, 'stadion') + 0.5, BACK);
  const marble = ramp(t, wordOf(5, 'kelereng') - 0.4, wordOf(5, 'kelereng') + 0.4);

  const toG = (x: number, y: number): P => [gx + x * gs, gy + y * gs];
  const [fx, fy] = toG(0, 0);

  return (
    <AbsoluteFill style={{opacity: end}}>
      <Stage>
        <defs>
          <clipPath id="ru-panel">
            <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} rx={18} />
          </clipPath>
          <linearGradient id="ru-lead" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b7390" />
            <stop offset="100%" stopColor="#363c55" />
          </linearGradient>
          <radialGradient id="ru-ball" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#8a8f9e" />
            <stop offset="60%" stopColor="#2b2f3a" />
            <stop offset="100%" stopColor="#111" />
          </radialGradient>
        </defs>
        <Motes x={960} y={530} rx={880} ry={330} n={26} color="kin" opacity={0.28} seed={7} />

        {/* ---------------- alat Geiger–Marsden ---------------- */}
        {app > 0.001 ? (
          <g opacity={app}>
            <g transform={`translate(${gx} ${gy}) scale(${gs})`}>
              <circle cx={0} cy={0} r={RR + 60} fill="url(#soft-work)" opacity={0.18} />
              {/* cincin layar ZnS (celah untuk berkas di kiri) */}
              <path
                d={`M${RR * Math.cos(Math.PI - 0.17)},${-RR * Math.sin(Math.PI - 0.17)} A${RR},${RR} 0 1 1 ${RR * Math.cos(Math.PI + 0.17)},${-RR * Math.sin(Math.PI + 0.17)}`}
                fill="none"
                stroke={FLASH}
                strokeOpacity={0.3}
                strokeWidth={14}
              />
              <path
                d={`M${RR * Math.cos(Math.PI - 0.17)},${-RR * Math.sin(Math.PI - 0.17)} A${RR},${RR} 0 1 1 ${RR * Math.cos(Math.PI + 0.17)},${-RR * Math.sin(Math.PI + 0.17)}`}
                fill="none"
                stroke={FLASH}
                strokeOpacity={0.6}
                strokeWidth={2}
              />
              {/* mikroskop pada cincin */}
              <g transform={`rotate(${-scope / DEG})`}>
                <rect x={RR + 10} y={-11} width={62} height={22} rx={5} fill="#8a96b8" />
                <rect x={RR + 70} y={-15} width={14} height={30} rx={3} fill="#c3cde3" />
              </g>
              {/* kotak timbal + sumber */}
              <rect x={-445} y={-72} width={130} height={144} rx={10} fill="url(#ru-lead)" stroke="#9aa3c0" strokeOpacity={0.5} strokeWidth={2} />
              <rect x={-345} y={-8} width={32} height={16} fill="#0a0f22" />
              <circle cx={SRC - 10} cy={0} r={34 + 3 * Math.sin(t * 4)} fill="url(#soft-kin)" />
              <circle cx={SRC - 10} cy={0} r={11} fill={C.kin} />
              <text x={SRC - 10} y={5} textAnchor="middle" fontFamily={FONT.mono} fontSize={14} fill="#fff" opacity={0.85}>
                Ra
              </text>
              {/* berkas α ke foil */}
              <line x1={-313} y1={0} x2={-6} y2={0} stroke={C.kin} strokeOpacity={0.22 * beam} strokeWidth={10} strokeLinecap="round" />
              {/* lembaran emas */}
              <rect x={-4} y={-92} width={8} height={184} rx={2} fill={C.gold} opacity={0.75 + 0.25 * foilHi} />
              <rect x={-1.5} y={-92 + ((t * 60) % 184)} width={3} height={30} fill="#fff" opacity={0.35} />
              <circle cx={0} cy={0} r={46} fill="url(#soft-gold)" opacity={foilHi} />
              {/* partikel α & kilatan */}
              {Array.from({length: NP}, (_, j) => {
                const raw = t * 0.42 + j / NP;
                const cycle = Math.floor(raw);
                const ph = raw - cycle;
                const tStart = (cycle - j / NP) / 0.42;
                const mode = modeAt(tStart);
                const th = theta(mode, rand(j * 7.3 + cycle * 1.91), rand(j * 3.7 + cycle * 2.13 + 5));
                if (beam <= 0.001) return null;
                let x = 0;
                let y = 0;
                if (ph < 0.42) {
                  x = mix(SRC + 40, 0, ph / 0.42);
                } else {
                  const r = ((ph - 0.42) / 0.36) * (RR - 8);
                  x = r * Math.cos(th);
                  y = -r * Math.sin(th);
                }
                const fl = ph > 0.78 ? (ph - 0.78) / 0.22 : 0;
                const hx = (RR - 2) * Math.cos(th);
                const hy = -(RR - 2) * Math.sin(th);
                const ghostly = mode === 1;
                return (
                  <g key={j} opacity={beam}>
                    {ph < 0.78 ? <Spark x={x} y={y} r={5} color="kin" opacity={Math.min(1, ph * 10) * (ghostly ? 0.5 : 1)} /> : null}
                    {fl > 0 ? (
                      ghostly ? (
                        <circle cx={hx} cy={hy} r={8 + 14 * fl} fill="none" stroke={FLASH} strokeWidth={2} strokeDasharray="3 4" opacity={0.6 * (1 - fl)} />
                      ) : (
                        <g opacity={(1 - fl) * Math.min(1, fl * 8)}>
                          <circle cx={hx} cy={hy} r={26} fill="url(#soft-work)" />
                          <circle cx={hx} cy={hy} r={5 + 3 * (1 - fl)} fill="#eafff4" />
                        </g>
                      )
                    ) : null}
                  </g>
                );
              })}
              <Label x={SRC + 8} y={112} size={24} color={C.kin}>
                sumber α
              </Label>
              <Label x={SRC + 8} y={140} size={20} color={C.muted}>
                (kotak timbal)
              </Label>
              <Label x={0} y={-122} size={26} weight={600} color={C.gold} opacity={0.5 + 0.5 * foilHi}>
                lembaran emas
              </Label>
              <Label x={0} y={RR + 44} size={24} color={FLASH} opacity={ramp(t, wordOf(0, 'emas'), wordOf(0, 'emas') + 0.8)}>
                layar ZnS berkilat
              </Label>
            </g>
            {/* garis penghubung ke panel perbesaran */}
            <g opacity={panel}>
              <line x1={fx} y1={fy - 10} x2={PX0} y2={PY0 + 20} stroke={C.gold} strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="5 7" />
              <line x1={fx} y1={fy + 10} x2={PX0} y2={PY1 - 20} stroke={C.gold} strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="5 7" />
              <circle cx={fx} cy={fy} r={16} fill="none" stroke={C.gold} strokeWidth={2} opacity={0.7} />
            </g>
          </g>
        ) : null}

        {/* ---------------- panel perbesaran ---------------- */}
        {panel > 0.001 ? (
          <g opacity={panel}>
            <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} rx={18} fill="#060a18" fillOpacity={0.85} stroke={C.gold} strokeOpacity={0.45} strokeWidth={2} />
            <g clipPath="url(#ru-panel)">
              {/* dugaan Thomson (samar) */}
              {ghost > 0.001 ? (
                <g opacity={ghost}>
                  {[NCY - 200, NCY, NCY + 200].map((y, k) => (
                    <g key={k}>
                      <circle cx={NCX} cy={y} r={100} fill={C.heat} opacity={0.13} />
                      <circle cx={NCX} cy={y} r={100} fill="none" stroke="#ff9aa8" strokeOpacity={0.35} strokeWidth={2} strokeDasharray="6 6" />
                      {[0, 1, 2, 3].map((e) => {
                        const a = e * 1.6 + k;
                        return <circle key={e} cx={NCX + 55 * Math.cos(a) + 4 * Math.sin(t * 5 + e)} cy={y + 55 * Math.sin(a) + 4 * Math.sin(t * 4 + e + k)} r={7} fill={C.pot} opacity={0.6} />;
                      })}
                    </g>
                  ))}
                  {GHOST_Y.map((_, i) => {
                    const pts = Array.from({length: 2}, (_, j) => ghostPt(i, j));
                    const mid = ghostPt(i, (NCX - PX0) / (PX1 - PX0));
                    const ph = fr(t * 0.32 + rand(i * 2.7));
                    const [x, y] = ghostPt(i, ph);
                    return (
                      <g key={i}>
                        <path d={`M${pts[0][0]},${pts[0][1]} L${mid[0]},${mid[1]} L${pts[1][0]},${pts[1][1]}`} fill="none" stroke={C.kin} strokeWidth={2} strokeDasharray="6 7" opacity={0.4} />
                        <circle cx={x} cy={y} r={7} fill="none" stroke={C.kin} strokeWidth={2.5} opacity={0.75 * cyc(ph)} />
                      </g>
                    );
                  })}
                </g>
              ) : null}
              {/* kenyataan: hiperbola Coulomb */}
              {real > 0.001 ? (
                <g opacity={real}>
                  {TRACKS.map((tr, k) => {
                    const bigTurn = tr.th > 140;
                    const straight = tr.th < 12;
                    const op = bigTurn ? 0.45 + 0.5 * backHi : straight ? 0.35 + 0.4 * straightHi : 0.42;
                    return (
                      <path
                        key={k}
                        d={tr.pts.map((q, j) => `${j ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ')}
                        fill="none"
                        stroke={bigTurn ? C.gold : C.kin}
                        strokeWidth={bigTurn ? 2.6 + 1.5 * backHi : 2}
                        opacity={op}
                      />
                    );
                  })}
                  {TRACKS.map((tr, k) => {
                    const ph = fr(t * 0.26 + rand(k * 5.1));
                    const at = TRACK_AT[k];
                    const [x, y] = at(ph);
                    const trail = [1, 2, 3, 4].map((j) => at(Math.max(0, ph - j * 0.018)));
                    return <Spark key={k} x={x} y={y} r={6} color="kin" trail={trail} opacity={cyc(ph)} />;
                  })}
                  <circle cx={NCX} cy={NCY} r={34 + 4 * Math.sin(t * 3)} fill="url(#soft-heat)" />
                  <circle cx={NCX} cy={NCY} r={9} fill={C.heat} />
                  <circle cx={NCX - 3} cy={NCY - 3} r={3} fill="#fff" opacity={0.7} />
                  <Ripple x={NCX} y={NCY} p={ramp(t, wordOf(2, 'memantul') - 0.2, wordOf(2, 'memantul') + 1.2, (x) => x)} r={140} color="gold" />
                  <Label x={NCX + 30} y={NCY + 36} size={22} color={C.heat} anchor="start" opacity={nucLbl}>
                    inti (+)
                  </Label>
                </g>
              ) : null}
            </g>
            <Label x={(PX0 + PX1) / 2} y={PY0 - 30} size={28} weight={600} color={C.ink} opacity={ghost}>
              dugaan model Thomson: belokan kecil
            </Label>
            <Label x={(PX0 + PX1) / 2} y={PY0 - 30} size={28} weight={600} color={C.ink} opacity={real * (1 - cNote)}>
              kenyataan: makin dekat inti → belokan makin besar
            </Label>
          </g>
        ) : null}

        {/* ---------------- analogi ---------------- */}
        {ana > 0.001 ? (
          <g opacity={ana}>
            <Glow x={560} y={540} r={360} color="kin" opacity={0.15} />
            <ellipse cx={560} cy={655} rx={360} ry={16} fill="#000" opacity={0.25} />
            <line x1={190} y1={640} x2={930} y2={640} stroke={C.line} strokeWidth={3} />
            {/* meriam */}
            <g transform={`rotate(${-4 + 3 * ramp(t, tFire, tFire + 0.15) * (1 - ramp(t, tFire + 0.15, tFire + 0.8))} 250 560)`}>
              <rect x={200} y={528} width={130} height={46} rx={18} fill="#4a5068" stroke="#9aa3c0" strokeWidth={2} />
              <rect x={318} y={524} width={18} height={54} rx={5} fill="#6b7390" />
            </g>
            <circle cx={250} cy={608} r={30} fill="#3a2a1a" stroke="#8a6a4a" strokeWidth={4} />
            <circle cx={250} cy={608} r={6} fill="#8a6a4a" />
            <circle cx={340} cy={550} r={30 * ramp(t, tFire, tFire + 0.1) * (1 - ramp(t, tFire + 0.1, tFire + 0.6))} fill="url(#soft-kin)" />
            {/* kertas tisu */}
            <line x1={720} y1={400} x2={800} y2={400} stroke="#8a96b8" strokeWidth={4} />
            <path
              d={Array.from({length: 21}, (_, j) => {
                const yy = 404 + j * 11;
                const xx = 760 + (4 + 14 * bang * (1 - bang)) * Math.sin(j * 0.8 - t * 4) * (j / 20);
                return `${j ? 'L' : 'M'}${xx.toFixed(1)},${yy.toFixed(1)}`;
              }).join(' ')}
              fill="none"
              stroke="#eef3ff"
              strokeWidth={9}
              opacity={0.75}
              strokeLinecap="round"
            />
            {/* peluru */}
            <circle cx={bx} cy={by} r={22} fill="url(#ru-ball)" stroke="#555a66" strokeWidth={1.5} opacity={ramp(t, cue(3), cue(3) + 0.4)} />
            {t > tFire && t < tHit ? (
              <g opacity={0.6}>
                {[1, 2, 3].map((k) => (
                  <line key={k} x1={bx - 30 - k * 14} y1={by - 10 + k * 7} x2={bx - 30 - k * 14 - 30} y2={by - 10 + k * 7} stroke={C.muted} strokeWidth={2} strokeLinecap="round" />
                ))}
              </g>
            ) : null}
            <Ripple x={745} y={530} p={bang} r={110} color="kin" />
            <Label x={760} y={340} size={58} weight={700} color={C.gold} opacity={ramp(t, tBack - 0.3, tBack + 0.2, BACK) * (0.8 + 0.2 * Math.sin(t * 5))}>
              ?!
            </Label>
            <Label x={265} y={480} size={26} color={C.muted}>
              peluru meriam
            </Label>
            <Label x={760} y={680} size={26} color={C.ink}>
              kertas tisu
            </Label>
          </g>
        ) : null}

        {/* ---------------- kesimpulan: inti kecil ---------------- */}
        {con > 0.001 ? (
          <g opacity={con}>
            <circle cx={560} cy={560} r={230} fill="none" stroke={C.cyan} strokeWidth={2} strokeDasharray="8 10" strokeDashoffset={-t * 20} opacity={0.45} />
            {[0, 1, 2].map((k) => {
              const a = t * (0.9 + k * 0.25) + k * 2.1;
              const rot = k * 60;
              const ex = 560 + 195 * Math.cos(a) * Math.cos(rot * DEG) - 82 * Math.sin(a) * Math.sin(rot * DEG);
              const ey = 560 + 195 * Math.cos(a) * Math.sin(rot * DEG) + 82 * Math.sin(a) * Math.cos(rot * DEG);
              return (
                <g key={k}>
                  <ellipse cx={560} cy={560} rx={195} ry={82} fill="none" stroke={C.cyan} strokeWidth={1.5} opacity={0.25} transform={`rotate(${rot} 560 560)`} />
                  <circle cx={ex} cy={ey} r={18} fill="url(#soft-pot)" />
                  <circle cx={ex} cy={ey} r={8} fill={C.pot} />
                </g>
              );
            })}
            <circle cx={560} cy={560} r={hazeR} fill={C.heat} opacity={mix(0.18, 0.95, shrink)} />
            <circle cx={560} cy={560} r={hazeR * 2.5 + 20} fill="url(#soft-heat)" opacity={0.4 + 0.5 * shrink} />
            {Array.from({length: 10}, (_, i) => {
              const a = rand(i * 2.3) * TAU;
              const r = Math.sqrt(rand(i * 4.9)) * hazeR * 0.85;
              return (
                <text key={i} x={560 + r * Math.cos(a)} y={568 + r * Math.sin(a)} textAnchor="middle" fontFamily={FONT.head} fontWeight={700} fontSize={22} fill="#ffd0d6" opacity={(1 - shrink) * 0.6}>
                  +
                </text>
              );
            })}
            <Ripple x={560} y={560} p={ramp(t, wordOf(4, 'kecil') - 0.1, wordOf(4, 'kecil') + 1.3, (x) => x)} r={180} color="heat" />
            <line x1={560} y1={545} x2={560} y2={292} stroke={C.heat} strokeWidth={2} strokeDasharray="4 5" opacity={nucLbl} />
            <Label x={560} y={274} size={27} weight={600} color={C.heat} opacity={nucLbl}>
              inti: + dan hampir seluruh massa
            </Label>
            <Label x={560} y={835} size={24} color={C.pot} opacity={0.8}>
              elektron di ruang yang hampir kosong
            </Label>
          </g>
        ) : null}

        {/* ---------------- zoom 10⁵× ---------------- */}
        {zoom > 0.001 ? (
          <g opacity={zoom}>
            <defs>
              <clipPath id="ru-zoom">
                <rect x={110} y={175} width={1060} height={710} rx={20} />
              </clipPath>
            </defs>
            <rect x={110} y={175} width={1060} height={710} rx={20} fill="#050815" fillOpacity={0.6} stroke={C.line} strokeWidth={2} />
            <g clipPath="url(#ru-zoom)">
              {Ra < 4000 ? (
                <g opacity={1 - ramp(L, 0.9, 1.5)}>
                  <circle cx={ZX} cy={ZY} r={Ra} fill="url(#soft-pot)" opacity={0.6} />
                  <circle cx={ZX} cy={ZY} r={Ra} fill="none" stroke={C.cyan} strokeWidth={2.5} strokeDasharray="10 10" />
                  {Array.from({length: 26}, (_, i) => {
                    const a = rand(i * 3.3) * TAU + t * (0.3 + rand(i) * 0.4);
                    const r = (0.35 + 0.6 * rand(i * 7.1)) * Ra;
                    return <circle key={i} cx={ZX + r * Math.cos(a)} cy={ZY + r * Math.sin(a)} r={5} fill={C.pot} opacity={0.6} />;
                  })}
                </g>
              ) : null}
              {[1, 2, 3, 4].map((k) => {
                const r = Ra * Math.pow(10, -k);
                const op = ramp(r, 30, 90) * (1 - ramp(r, 500, 1400));
                if (op <= 0.001) return null;
                return (
                  <g key={k} opacity={op}>
                    <circle cx={ZX} cy={ZY} r={r} fill="none" stroke={C.cyan} strokeWidth={1.8} strokeDasharray="4 8" opacity={0.6} />
                    <Label x={ZX} y={ZY - r - 22} size={22} font="mono" color={C.cyan}>
                      {['', '10⁻¹¹ m', '10⁻¹² m', '10⁻¹³ m', '10⁻¹⁴ m'][k]}
                    </Label>
                  </g>
                );
              })}
              {/* inti */}
              <circle cx={ZX} cy={ZY} r={Math.max(14, Rn * 2)} fill="url(#soft-heat)" />
              {Rn < 6 ? <circle cx={ZX} cy={ZY} r={3.5} fill={C.heat} opacity={1 - ramp(Rn, 3, 6)} /> : null}
              {Rn > 3
                ? NUC.map(([ux, uy], i) => (
                    <g key={i} opacity={ramp(Rn, 3, 8)}>
                      <circle cx={ZX + ux * Rn * 0.78 + Rn * 0.03 * Math.sin(t * 6 + i)} cy={ZY + uy * Rn * 0.78 + Rn * 0.03 * Math.cos(t * 5 + i)} r={Rn * 0.27} fill={i % 2 ? '#8a93ad' : C.heat} stroke="#fff" strokeOpacity={0.3} strokeWidth={Math.max(0.5, Rn * 0.01)} />
                    </g>
                  ))
                : null}
            </g>
            <Label x={ZX} y={Math.max(205, ZY - Ra - 28)} size={26} font="mono" color={C.cyan} opacity={1 - ramp(L, 0.02, 0.25)}>
              atom ≈ 10⁻¹⁰ m
            </Label>
            <Label x={ZX} y={ZY - 300} size={28} font="mono" weight={600} color={C.heat} opacity={ramp(L, 4.4, 5)}>
              inti ≈ 10⁻¹⁵ m
            </Label>
            <Label x={ZX} y={850} size={24} font="mono" color={C.gold}>
              {`perbesaran ×${Math.round(z).toLocaleString('id-ID')}`}
            </Label>
          </g>
        ) : null}

        {/* stadion vs kelereng */}
        {stad > 0.001 ? (
          <g opacity={Math.min(1, stad) * zoom} transform={`translate(1500 ${640 + 4 * Math.sin(t * 0.9)}) scale(${0.85 + 0.15 * Math.min(1, stad)})`}>
            <ellipse cx={0} cy={0} rx={300} ry={150} fill="#2a3360" stroke="#8a96b8" strokeWidth={3} />
            <ellipse cx={0} cy={0} rx={250} ry={112} fill="#1d5a3a" />
            <ellipse cx={0} cy={0} rx={200} ry={80} fill="none" stroke="#e8f0ff" strokeOpacity={0.4} strokeWidth={2} />
            <line x1={0} y1={-80} x2={0} y2={80} stroke="#e8f0ff" strokeOpacity={0.4} strokeWidth={2} />
            <circle cx={0} cy={0} r={26} fill="none" stroke="#e8f0ff" strokeOpacity={0.4} strokeWidth={2} />
            {Array.from({length: 24}, (_, i) => {
              const a = (i / 24) * TAU + t * 0.05;
              return <circle key={i} cx={275 * Math.cos(a)} cy={131 * Math.sin(a)} r={3} fill={C.gold} opacity={0.3 + 0.3 * Math.sin(t * 3 + i)} />;
            })}
            <circle cx={0} cy={0} r={22 + 8 * marble} fill="url(#soft-heat)" opacity={marble} />
            <circle cx={0} cy={0} r={3} fill={C.heat} />
            <Ripple x={0} y={0} p={ramp(t, wordOf(5, 'kelereng') - 0.1, wordOf(5, 'kelereng') + 1.3, (x) => x)} r={90} color="heat" />
          </g>
        ) : null}
        <Label x={1500} y={455} size={28} weight={600} color={C.ink} opacity={Math.min(1, stad) * zoom}>
          atom = stadion
        </Label>
        <Label x={1500} y={835} size={28} weight={600} color={C.heat} opacity={marble * zoom}>
          inti = kelereng di tengah
        </Label>
        <Twinkles x={1500} y={640} rx={60} ry={40} n={4} color="heat" opacity={marble * zoom} seed={9} />
      </Stage>

      <Badge x={1560} y={225} text="1909 · Geiger & Marsden" color={C.gold} opacity={slot(t, wordOf(0, 'laboratorium') - 0.2, cue(1) - 0.2)} />
      <Note x={1435} y={800} p={slot(t, wordOf(2, 'delapan') - 0.2, cue(3) + 0.8)} color={C.gold} size={28}>
        ≈ <span style={{color: C.gold}}>1 dari 8000</span> memantul (θ &gt; 90°)
      </Note>
      <Badge x={560} y={225} text="1911 · Rutherford" color={C.heat} opacity={year * con} />
      <Note x={1435} y={225} p={cNote} color={C.heat} size={28}>
        inti: <span style={{color: C.heat}}>sangat kecil, padat, bermuatan +</span>
      </Note>
      <Formula x={1500} y={300} p={card} accent={C.heat}>
        <Frac n={<><V>r</V><Sub>atom</Sub></>} d={<><V>r</V><Sub>inti</Sub></>} /> ≈ 10<Sup>5</Sup>
      </Formula>
    </AbsoluteFill>
  );
};
