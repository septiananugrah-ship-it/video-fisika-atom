import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, mix, ramp} from '../anim';
import {Arrow, DrawPath, Formula, Frac, Glow, Label, Motes, Note, Ripple, Spark, Stage, Sub, Sup, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Tingkat energi H (AUDIT): rₙ = n²a₀, a₀ = 0,0529 nm (≈ 0,053); Eₙ = −13,6/n² eV:
// E₁ −13,6, E₂ −3,40, E₃ −1,51, E₄ −0,85; selisih 10,2 / 1,89 / 0,66 eV (makin rapat menuju 0).
// Tangga digambar berskala: 44,85 px/eV. Sumur: U(d) = −27,2·(30/d) eV (titik balik E₁ di d = 60 px = 2a₀ gambar).

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const En = (n: number) => -13.6 / (n * n);
const fmtE = (n: number) => {
  const e = En(n);
  const s = n === 1 ? '−13,6' : n === 2 ? '−3,40' : n === 3 ? '−1,51' : n === 4 ? '−0,85' : (e.toFixed(2) as string).replace('-', '−').replace('.', ',');
  return `${s} eV`;
};

// tangga
const LX0 = 770;
const LX1 = 1100;
const Y0 = 230; // E = 0
const EY = (840 - Y0) / 13.6;
const ly = (e: number) => Y0 - e * EY;

// orbit
const ro = (n: number) => 20 * n * n;

// panel kanan
const PX = 1600;

export const Levels: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  // ---------- atom & orbit (baris 0) ----------
  const move = ramp(t, cue(1) - 0.5, cue(1) + 0.8, EASE_IN_OUT);
  const AX = mix(600, 300, move);
  const AY = 520 + 4 * Math.sin(t * 0.7);
  const S = mix(1, 0.55, move);
  const atomOn = ramp(t, -0.3, 0.9);
  const tJ = wordOf(0, 'jari');
  const orbP = [1, 2, 3, 4].map((n, i) => ramp(t, tJ - 0.2 + i * 0.45, tJ + 0.8 + i * 0.45, EASE_IN_OUT));
  const rulerOn = ramp(t, wordOf(0, 'kuadrat') - 0.5, wordOf(0, 'kuadrat') + 0.3) * (1 - move);
  const rCard = slot(t, wordOf(0, 'sama') - 0.4, cue(1) - 0.2);
  const eTh = 0.4 + 2.6 * t;

  // ---------- tangga (baris 1–4) ----------
  const ladOn = ramp(t, cue(1) - 0.1, cue(1) + 0.9, EASE_IN_OUT);
  const lvlP = (n: number) => (n <= 4 ? ramp(t, cue(1) + 0.1 + (n - 1) * 0.25, cue(1) + 0.9 + (n - 1) * 0.25, EASE_IN_OUT) : ramp(t, wordOf(3, 'rapat') - 0.8 + (n - 5) * 0.12, wordOf(3, 'rapat') + (n - 5) * 0.12, EASE_IN_OUT));
  const valT = [wordOf(2, 'pertama'), wordOf(2, 'kedua'), wordOf(2, 'ketiga'), cue(3) - 0.2];
  const valP = valT.map((v) => ramp(t, v - 0.3, v + 0.4));
  const eCard = slot(t, cue(1) + 0.2, cue(3) - 0.15);
  const gapOn = ramp(t, wordOf(3, 'rapat') - 0.4, wordOf(3, 'rapat') + 0.5) * (1 - ramp(t, cue(4) - 0.3, cue(4) + 0.3, EASE_IN_OUT));
  const inset = slot(t, cue(3) - 0.1, cue(4) - 0.1);
  const zeroOn = ramp(t, wordOf(3, 'nol') - 0.4, wordOf(3, 'nol') + 0.4);
  const well = ramp(t, cue(4) - 0.1, cue(4) + 0.8);
  const bound = ramp(t, wordOf(4, 'terikat') - 0.3, wordOf(4, 'terikat') + 0.4);
  const need = ramp(t, wordOf(4, 'perlu') - 0.3, wordOf(4, 'perlu') + 0.5);

  // elektron di tangga: duduk di E₁, baris 4 mencoba meloncat tetapi jatuh lagi
  const hop = well * Math.abs(Math.sin(t * 2.4)) * 46;
  const eLy = ly(En(1)) - 10 - hop + 3 * Math.sin(t * 3);

  // sumur (baris 4)
  const WY0 = 270;
  const WEY = 30;
  const wy = (e: number) => WY0 - e * WEY;
  const Ud = (d: number) => Math.max(-15.4, (-27.2 * 30) / Math.max(1, Math.abs(d)));
  const wellPts: [number, number][] = [];
  for (let d = -200; d <= 200; d += 4) wellPts.push([PX + d, wy(Ud(d))]);
  const wellD = wellPts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const wex = PX + 52 * Math.sin(t * 2.2);
  const wey = wy(En(1)) - 14 - 0.5 * hop;

  // inset diperbesar (baris 3): E ∈ [−1,7, 0]
  const IX0 = 1430;
  const IX1 = 1770;
  const IY0 = 250;
  const IEY = 290 / 1.6;
  const iy = (e: number) => IY0 - e * IEY;

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <radialGradient id="lv-nuc" cx="38%" cy="34%" r="70%">
            <stop offset="0%" stopColor="#ffb3bd" />
            <stop offset="50%" stopColor={C.heat} />
            <stop offset="100%" stopColor="#7a1626" />
          </radialGradient>
          <linearGradient id="lv-well" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.pot} stopOpacity="0" />
            <stop offset="100%" stopColor={C.pot} stopOpacity="0.28" />
          </linearGradient>
        </defs>

        {/* ============ atom: rₙ = n²a₀ ============ */}
        <g opacity={atomOn} transform={`translate(${AX},${AY}) scale(${S})`}>
          <Motes x={0} y={0} rx={360} ry={340} n={24} color="work" opacity={0.3} seed={2} />
          {[1, 2, 3, 4].map((n, i) => (
            <g key={n}>
              <circle cx={0} cy={0} r={ro(n)} fill="none" stroke={C.work} strokeWidth={10} opacity={0.08 * orbP[i]} />
              <DrawPath d={`M${ro(n)},0 A${ro(n)},${ro(n)} 0 1 0 ${-ro(n)},0 A${ro(n)},${ro(n)} 0 1 0 ${ro(n)},0`} p={orbP[i]} stroke="work" width={2.6 / S} opacity={0.85} />
              <Label x={-ro(n) * Math.cos(0.5) - 10} y={-ro(n) * Math.sin(0.5) - 12} size={26 / S} anchor="end" font="mono" color={C.work} opacity={orbP[i] * (n === 1 ? 1 - move : 1)}>
                {`n=${n}`}
              </Label>
            </g>
          ))}
          <Glow x={0} y={0} r={80} color="heat" opacity={0.8} />
          <circle cx={0} cy={0} r={11} fill="url(#lv-nuc)" />
          <Spark x={ro(1) * Math.cos(eTh)} y={-ro(1) * Math.sin(eTh)} r={7} color="pot" />
          {/* penggaris jari-jari */}
          <g opacity={rulerOn} transform="rotate(34)">
            <line x1={0} y1={0} x2={ro(4) + 20} y2={0} stroke={C.ink} strokeWidth={2} opacity={0.6} />
            {[1, 2, 3, 4].map((n, i) => {
              const p = ramp(t, wordOf(0, 'kuadrat') - 0.3 + i * 0.3, wordOf(0, 'kuadrat') + 0.3 + i * 0.3);
              return (
                <g key={n} opacity={p}>
                  <line x1={ro(n)} y1={-10} x2={ro(n)} y2={10} stroke={C.gold} strokeWidth={3} />
                  <g transform={`rotate(-34 ${ro(n) + (n === 1 ? 10 : 0)} -30)`}>
                  <Label x={ro(n) + (n === 1 ? 10 : 0)} y={-30} size={24} font="serif" italic color={C.gold}>
                    {n === 1 ? (
                      <>
                        a<TSub0 />
                      </>
                    ) : (
                      <>
                        {n * n}a<TSub0 />
                      </>
                    )}
                  </Label>
                  </g>
                </g>
              );
            })}
          </g>
        </g>
        <Label x={300} y={760} size={24} color={C.muted} opacity={ladOn}>
          atom (berskala n²)
        </Label>

        {/* ============ tangga energi berskala ============ */}
        <g opacity={ladOn}>
          {/* garis E = 0 */}
          <line x1={LX0 - 10} y1={Y0} x2={LX1 + 10} y2={Y0} stroke={C.gold} strokeWidth={2.5} strokeDasharray="10 8" strokeDashoffset={-t * 12} opacity={0.6 + 0.4 * zeroOn} />
          <Label x={LX1 + 22} y={Y0 - 14} size={24} anchor="start" font="mono" color={C.gold}>
            0 eV
          </Label>
          <Label x={LX0 - 22} y={Y0 - 14} size={24} anchor="end" font="mono" color={C.gold} opacity={zeroOn}>
            {'n → ∞'}
          </Label>
          {Array.from({length: 14}, (_, k) => k + 1).map((n) => {
            const y = ly(En(n));
            const p = lvlP(n);
            const v = n <= 4 ? valP[n - 1] : 0;
            return (
              <g key={n}>
                <DrawPath d={`M${LX0},${y} L${LX1},${y}`} p={p} stroke="work" width={n <= 4 ? 4 : 2.2} opacity={n <= 4 ? 1 : 0.7} />
                {n <= 4 ? (
                  <>
                    <line x1={LX0} y1={y} x2={LX1} y2={y} stroke={C.work} strokeWidth={12} opacity={0.12 * p + 0.15 * v * (1 - ramp(t, valT[n - 1] + 0.6, valT[n - 1] + 1.6, EASE_IN_OUT))} />
                    <Label x={LX0 - 22} y={y} size={26} anchor="end" font="mono" color={C.work} opacity={p}>
                      {`n=${n}`}
                    </Label>
                    <Label x={LX1 + 22} y={y + (n === 4 ? 4 : 0)} size={26} anchor="start" font="mono" color={C.ink} opacity={v}>
                      {fmtE(n)}
                    </Label>
                    <Ripple x={(LX0 + LX1) / 2} y={y} p={ramp(t, valT[n - 1] - 0.1, valT[n - 1] + 1.0, (q) => q)} r={90} color="work" rings={2} />
                  </>
                ) : null}
              </g>
            );
          })}
          {/* elektron di keadaan dasar */}
          <Spark x={LX0 + 60} y={eLy} r={10} color="pot" opacity={ramp(t, cue(1) + 0.6, cue(1) + 1.2)} />
          {/* selisih makin kecil */}
          <g opacity={gapOn}>
            {[1, 2, 3].map((n) => {
              const ya = ly(En(n));
              const yb = ly(En(n + 1));
              const de = ['10,2', '1,89', '0,66'][n - 1];
              return (
                <g key={n}>
                  <Arrow x1={1272} y1={ya - 4} x2={1272} y2={yb + 4} color="work" width={3} both pulse={false} />
                  <Label x={1290} y={(ya + yb) / 2 + (n === 3 ? -2 : 0)} size={22} anchor="start" font="mono" color={C.work}>
                    {de}
                  </Label>
                </g>
              );
            })}
          </g>
        </g>

        {/* ============ inset: bagian atas diperbesar ============ */}
        <g opacity={inset}>
          <rect x={IX0 - 30} y={IY0 - 40} width={IX1 - IX0 + 60} height={iy(-1.7) - IY0 + 70} rx={14} fill="rgba(10,16,36,0.85)" stroke={C.work} strokeOpacity={0.4} strokeWidth={2} />
          <line x1={IX0} y1={IY0} x2={IX1} y2={IY0} stroke={C.gold} strokeWidth={2} strokeDasharray="8 7" strokeDashoffset={-t * 12} />
          <Label x={IX1} y={IY0 - 18} size={20} anchor="end" font="mono" color={C.gold}>
            0
          </Label>
          {Array.from({length: 18}, (_, k) => k + 3).map((n, k) => {
            const y = iy(En(n));
            const p = ramp(t, cue(3) + 0.1 + k * 0.1, cue(3) + 0.5 + k * 0.1);
            return (
              <g key={n} opacity={p}>
                <line x1={IX0} y1={y} x2={IX1 - (n <= 6 ? 60 : 0)} y2={y} stroke={C.work} strokeWidth={n <= 6 ? 3 : 1.6} opacity={n <= 6 ? 1 : 0.7} />
                {n <= 6 ? (
                  <Label x={IX1 - 6} y={y} size={20} anchor="end" font="mono" color={C.work}>
                    {`n=${n}`}
                  </Label>
                ) : null}
              </g>
            );
          })}
          <Label x={(IX0 + IX1) / 2} y={iy(-1.7) + 14} size={22} color={C.muted}>
            diperbesar: makin rapat ke 0
          </Label>
          <Twinkles x={(IX0 + IX1) / 2} y={IY0 + 20} rx={150} ry={20} n={4} color="gold" seed={6} />
        </g>
        {/* garis bantu ke inset */}
        <path d={`M${LX1 + 8},${ly(-1.7)} L${IX0 - 30},${iy(-1.7) + 30}`} stroke={C.work} strokeOpacity={0.35 * inset} strokeWidth={1.5} strokeDasharray="5 6" fill="none" />

        {/* ============ sumur: terikat ============ */}
        <g opacity={well}>
          <path d={`${wellD} L${PX + 200},${wy(-15.4)} L${PX - 200},${wy(-15.4)} Z`} fill="url(#lv-well)" opacity={0.8} />
          <path d={wellD} fill="none" stroke={C.pot} strokeWidth={4} />
          <line x1={PX - 210} y1={WY0} x2={PX + 210} y2={WY0} stroke={C.gold} strokeWidth={2.5} strokeDasharray="10 8" strokeDashoffset={-t * 12} />
          <Label x={PX} y={WY0 - 30} size={26} color={C.gold}>
            E = 0: lepas (bebas)
          </Label>
          <line x1={PX - 62} y1={wy(En(1))} x2={PX + 62} y2={wy(En(1))} stroke={C.work} strokeWidth={3.5} />
          <Glow x={wex} y={wey} r={50} color="pot" opacity={0.6} />
          <Spark x={wex} y={wey} r={11} color="pot" />
          <Label x={PX} y={wy(-15.4) + 24} size={24} font="mono" color={C.work}>
            −13,6 eV
          </Label>
          <g opacity={bound}>
            <Label x={PX - 132} y={wy(-8.5)} size={26} color={C.pot} anchor="end">
              terikat
            </Label>
            <Label x={PX - 132} y={wy(-8.5) + 32} size={22} color={C.muted} anchor="end">
              (E &lt; 0)
            </Label>
          </g>
          <g opacity={need}>
            <Arrow x1={PX} y1={wy(En(1)) - 34} x2={PX} y2={WY0 + 12} color="gold" width={5} />
            <Label x={PX + 18} y={wy(-4)} size={26} anchor="start" color={C.gold}>
              +13,6 eV
            </Label>
            <Twinkles x={PX} y={WY0 + 20} rx={40} ry={20} n={3} color="gold" seed={5} />
          </g>
        </g>
      </Stage>

      {/* HTML */}
      <Formula x={1400} y={400} p={rCard} accent={C.work} caption="a₀ ≈ 0,053 nm (jari-jari Bohr)">
        <V>r</V>
        <Sub>
          <V>n</V>
        </Sub>{' '}
        = <V>n</V>
        <Sup>2</Sup>
        <V>a</V>
        <Sub>0</Sub>
      </Formula>
      <Formula x={1560} y={560} p={eCard} accent={C.work} caption="n = 1, 2, 3, …">
        <V>E</V>
        <Sub>
          <V>n</V>
        </Sub>{' '}
        = − <Frac n="13,6 eV" d={<span><V>n</V><Sup>2</Sup></span>} />
      </Formula>
      <Note x={1600} y={815} p={bound} color={C.gold} size={28}>
        tanda minus = elektron terikat
      </Note>
    </AbsoluteFill>
  );
};

/** Subskrip "0" untuk label SVG (a₀). */
const TSub0: React.FC = () => (
  <tspan baselineShift="sub" fontSize="0.65em" fontFamily={FONT.serif} fontStyle="normal">
    0
  </tspan>
);
