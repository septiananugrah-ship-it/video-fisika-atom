import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, mix, ramp, rand} from '../anim';
import {Badge, Formula, Frac, Glow, Label, Motes, Note, Ripple, Stage, Sub, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Thomson (AUDIT): 1897 elektron ditemukan; mₑ/mₚ = 1/1836; model roti kismis.
// (1) tabung sinar katode: berkas elektron dibelokkan medan listrik antara dua pelat ke arah pelat +
//     (parabola y = −k(x−x₀)² di antara pelat, garis singgung lurus sesudahnya), titik pendar di layar bergeser;
// (2) neraca: satu proton vs tumpukan elektron yang bertambah sampai 1836 → neraca seimbang;
// (3) model roti kismis: bola bermuatan + merata dengan elektron tertanam yang bergetar di tempat.
const fr = (v: number) => ((v % 1) + 1) % 1;
const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
type P = [number, number];

// ---------- tabung sinar katode ----------
const BY = 520; // sumbu berkas
const XK = 400; // katode
const XP0 = 770; // awal pelat
const XP1 = 1010; // akhir pelat
const XS = 1500; // layar
const beamY = (x: number, k: number) => {
  if (x <= XP0) return BY;
  if (x <= XP1) return BY - k * (x - XP0) ** 2;
  const L = XP1 - XP0;
  return BY - k * L * L - 2 * k * L * (x - XP1);
};
const TUBE = `M330,${BY - 66} H1180 L${XS},${BY - 190} Q${XS + 34},${BY} ${XS},${BY + 190} L1180,${BY + 66} H330 Q300,${BY} 330,${BY - 66} Z`;

const Charge: React.FC<{x: number; y: number; r: number; s: number; op?: number}> = ({x, y, r, s, op = 1}) => (
  <g opacity={op}>
    <circle cx={x} cy={y} r={r * 2.4} fill={`url(#soft-${s > 0 ? 'heat' : 'pot'})`} />
    <circle cx={x} cy={y} r={r} fill={s > 0 ? C.heat : C.pot} stroke={s > 0 ? '#ffc2ca' : '#c8e4ff'} strokeWidth={r * 0.09} />
    <circle cx={x - r * 0.32} cy={y - r * 0.36} r={r * 0.32} fill="#fff" opacity={0.3} />
    <line x1={x - r * 0.45} y1={y} x2={x + r * 0.45} y2={y} stroke="#fff" strokeWidth={r * 0.16} strokeLinecap="round" />
    {s > 0 ? <line x1={x} y1={y - r * 0.45} x2={x} y2={y + r * 0.45} stroke="#fff" strokeWidth={r * 0.16} strokeLinecap="round" /> : null}
  </g>
);

// ---------- model roti kismis ----------
const PX = 760;
const PYc = 515;
const PR = 240;
const ELEC: P[] = [
  [-120, -110],
  [40, -150],
  [150, -60],
  [-30, -40],
  [-160, 30],
  [90, 50],
  [-70, 110],
  [60, 150],
  [175, 105],
  [-5, 60],
];
const PLUS: P[] = Array.from({length: 26}, (_, i) => {
  const a = rand(i * 3.1) * Math.PI * 2;
  const r = PR * 0.88 * Math.sqrt(rand(i * 5.7 + 2));
  return [Math.cos(a) * r, Math.sin(a) * r];
});
const RAISIN: P[] = [
  [-80, -20],
  [-30, -55],
  [30, -30],
  [85, -10],
  [-55, 25],
  [10, 15],
  [60, 35],
  [-10, -10],
];

// tumpukan elektron (baris dari bawah, makin sempit ke atas)
const HEAP: P[] = (() => {
  const out: P[] = [];
  for (let r = 0; r < 16 && out.length < 150; r++) {
    const w = 16 - r;
    for (let c = 0; c < w && out.length < 150; c++) out.push([(c - (w - 1) / 2) * 9.6, -r * 8.4]);
  }
  return out;
})();

export const Thomson: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const end = 1 - ramp(t, dur - 0.7, dur + 0.2, EASE_IN_OUT);

  // (1) tabung
  const tube = Math.min(ramp(t, -0.2, 0.9), 1 - ramp(t, cue(1) - 0.5, cue(1) + 0.2, EASE_IN_OUT));
  const beamOn = ramp(t, 0.8, 1.8);
  const field = ramp(t, wordOf(0, 'bermuatan') - 0.4, wordOf(0, 'negatif') + 0.2, EASE_IN_OUT);
  const k = 0.0004 * field;
  const yS = beamY(XS, k);
  const year = ramp(t, wordOf(0, 'delapan') - 0.3, wordOf(0, 'delapan') + 0.5);
  const eTag = ramp(t, wordOf(0, 'elektron') - 0.3, wordOf(0, 'elektron') + 0.5);
  const neg = slot(t, wordOf(0, 'negatif') - 0.2, cue(1) - 0.3);
  const light = ramp(t, wordOf(0, 'ringan') - 0.3, wordOf(0, 'ringan') + 0.5);
  const camT = 1 + 0.03 * ramp(t, 0, cue(1), EASE_IN_OUT);

  // (2) neraca
  const bal = Math.min(ramp(t, cue(1) - 0.3, cue(1) + 0.5), 1 - ramp(t, cue(2) - 0.5, cue(2) + 0.1, EASE_IN_OUT));
  const fill = ramp(t, cue(1) + 0.4, wordOf(1, 'enam') + 0.2, EASE_IN_OUT);
  const N = Math.round(1836 * fill);
  const tBal = wordOf(1, 'enam') + 0.2;
  const settle = t > tBal ? 2.2 * Math.exp(-(t - tBal) * 1.6) * Math.sin((t - tBal) * 6) : 0;
  const tilt = -13 * (1 - fill) + settle + 0.5 * Math.sin(t * 1.3);
  const cardM = slot(t, wordOf(1, 'massanya') - 0.1, cue(2) - 0.2);

  // (3) roti kismis
  const pud = ramp(t, cue(2) - 0.3, cue(2) + 0.9);
  const neutral = ramp(t, wordOf(2, 'netral') - 0.3, wordOf(2, 'netral') + 0.5);
  const embed = ramp(t, wordOf(2, 'elektron') - 0.6, wordOf(2, 'tertanam') + 0.5, EASE_IN_OUT);
  const posG = ramp(t, wordOf(2, 'positif') - 0.5, wordOf(2, 'merata') + 0.4);
  const bread = ramp(t, wordOf(2, 'kismis') - 0.4, wordOf(2, 'roti') + 0.5, BACK);

  const pivotX = 760;
  const pivotY = 380;
  const arm = 270;
  const ta = (tilt * Math.PI) / 180;
  const lx = pivotX - arm * Math.cos(ta);
  const ly = pivotY - arm * Math.sin(ta);
  const rx = pivotX + arm * Math.cos(ta);
  const ry = pivotY + arm * Math.sin(ta);
  const pan = 190; // panjang tali
  const nDots = Math.min(150, Math.round(150 * fill));

  return (
    <AbsoluteFill style={{opacity: end}}>
      <Stage>
        <Motes x={960} y={520} rx={860} ry={320} n={26} color="pot" opacity={0.3} seed={5} />

        {/* ---------------- (1) tabung sinar katode ---------------- */}
        {tube > 0.001 ? (
          <g opacity={tube} transform={`translate(960 ${BY}) scale(${camT}) translate(-960 ${-BY})`}>
            <path d={TUBE} fill="#9fd8ff" fillOpacity={0.05} stroke="#9fc7ee" strokeOpacity={0.5} strokeWidth={3} />
            <path d={`M345,${BY - 54} H1170`} stroke="#fff" strokeOpacity={0.12} strokeWidth={6} strokeLinecap="round" />
            {/* layar berpendar */}
            <path d={`M${XS - 4},${BY - 186} Q${XS + 30},${BY} ${XS - 4},${BY + 186}`} fill="none" stroke="#6dffb5" strokeOpacity={0.35} strokeWidth={8} />
            <circle cx={XS + 6} cy={yS} r={60} fill="url(#soft-work)" opacity={beamOn} />
            <circle cx={XS + 6} cy={yS} r={9 + 2 * Math.sin(t * 8)} fill="#b8ffd9" opacity={beamOn} />
            {/* katode & anode */}
            <rect x={XK - 26} y={BY - 40} width={16} height={80} rx={4} fill="#8a96b8" />
            <circle cx={XK - 18} cy={BY} r={40} fill="url(#soft-kin)" opacity={0.5 * beamOn * (0.85 + 0.15 * Math.sin(t * 5))} />
            <rect x={540} y={BY - 52} width={10} height={44} fill="#8a96b8" />
            <rect x={540} y={BY + 8} width={10} height={44} fill="#8a96b8" />
            <rect x={590} y={BY - 52} width={10} height={44} fill="#8a96b8" />
            <rect x={590} y={BY + 8} width={10} height={44} fill="#8a96b8" />
            {/* pelat pembelok */}
            <rect x={XP0} y={BY - 52} width={XP1 - XP0} height={10} rx={3} fill={C.heat} opacity={0.4 + 0.6 * field} />
            <rect x={XP0} y={BY + 42} width={XP1 - XP0} height={10} rx={3} fill={C.pot} opacity={0.4 + 0.6 * field} />
            {Array.from({length: 6}, (_, j) => {
              const x = XP0 + 20 + j * 40;
              return (
                <g key={j} opacity={field}>
                  <text x={x} y={BY - 64} textAnchor="middle" fontFamily={FONT.head} fontWeight={700} fontSize={24} fill={C.heat}>
                    +
                  </text>
                  <text x={x} y={BY + 78} textAnchor="middle" fontFamily={FONT.head} fontWeight={700} fontSize={24} fill={C.pot}>
                    −
                  </text>
                  {(() => {
                    const ph = fr(t * 0.8 + j * 0.37);
                    const yy = BY - 36 + ph * 72;
                    return <circle cx={x + 20} cy={yy} r={2.5} fill={C.force} opacity={0.6 * cyc(ph)} />;
                  })()}
                </g>
              );
            })}
            {/* berkas */}
            <path
              d={Array.from({length: 41}, (_, j) => {
                const x = XK + ((XS - XK) * j) / 40;
                return `${j ? 'L' : 'M'}${x.toFixed(1)},${beamY(x, k).toFixed(1)}`;
              }).join(' ')}
              fill="none"
              stroke={C.pot}
              strokeWidth={10}
              strokeOpacity={0.18 * beamOn}
              strokeLinecap="round"
            />
            {Array.from({length: 26}, (_, j) => {
              const ph = fr(t * 0.55 + j / 26);
              const x = mix(XK, XS, ph);
              return (
                <g key={j} opacity={beamOn * cyc(ph)}>
                  <circle cx={x} cy={beamY(x, k)} r={12} fill="url(#soft-pot)" />
                  <circle cx={x} cy={beamY(x, k)} r={4.5} fill="#cfe6ff" />
                </g>
              );
            })}
            {/* jejak lurus (tanpa medan) samar */}
            <line x1={XP1} y1={BY} x2={XS} y2={BY} stroke={C.muted} strokeWidth={2} strokeDasharray="6 8" opacity={0.5 * field} />
            <Label x={XK - 18} y={BY + 100} size={26} color={C.muted}>
              katode (−)
            </Label>
            <Label x={570} y={BY + 100} size={26} color={C.muted}>
              anode
            </Label>
            <Label x={(XP0 + XP1) / 2} y={BY - 110} size={26} color={C.ink} opacity={0.4 + 0.6 * field}>
              pelat bermuatan
            </Label>
            <Label x={XS - 30} y={BY + 230} size={26} color="#8dffc4">
              layar berpendar
            </Label>
            <Label x={1250} y={yS - 52} size={34} weight={700} color={C.pot} opacity={eTag}>
              elektron e⁻
            </Label>
          </g>
        ) : null}

        {/* ---------------- (2) neraca massa ---------------- */}
        {bal > 0.001 ? (
          <g opacity={bal}>
            <Glow x={pivotX} y={540} r={420} color="pot" opacity={0.15} />
            <ellipse cx={pivotX} cy={800} rx={170} ry={18} fill="#000" opacity={0.3} />
            <path d={`M${pivotX - 120},800 H${pivotX + 120} L${pivotX + 70},770 H${pivotX - 70} Z`} fill="#3a4770" />
            <rect x={pivotX - 10} y={pivotY} width={20} height={390} fill="#5d6a8c" />
            <path d={`M${pivotX - 22},${pivotY + 16} L${pivotX},${pivotY - 20} L${pivotX + 22},${pivotY + 16} Z`} fill={C.gold} opacity={0.85} />
            <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#c3cde3" strokeWidth={10} strokeLinecap="round" />
            {/* jarum penunjuk */}
            <line x1={pivotX} y1={pivotY} x2={pivotX + 120 * Math.sin(ta)} y2={pivotY + 120 * Math.cos(ta)} stroke={C.gold} strokeWidth={3} />
            {/* piring kiri: proton */}
            {[
              [lx, ly, -1],
              [rx, ry, 1],
            ].map(([x, y, s]) => (
              <g key={s}>
                <line x1={x} y1={y} x2={x - 70} y2={y + pan} stroke="#8a96b8" strokeWidth={2} />
                <line x1={x} y1={y} x2={x + 70} y2={y + pan} stroke="#8a96b8" strokeWidth={2} />
                <path d={`M${x - 90},${y + pan} Q${x},${y + pan + 46} ${x + 90},${y + pan} Z`} fill="#4a5784" stroke="#9aa6d6" strokeWidth={2} />
              </g>
            ))}
            <Charge x={lx} y={ly + pan - 34} r={34} s={1} />
            {/* piring kanan: tumpukan elektron */}
            {HEAP.slice(0, nDots).map(([hx, hy], j) => (
              <circle key={j} cx={rx + hx + 1.5 * Math.sin(t * 2 + j)} cy={ry + pan - 4 + hy} r={4.2} fill={C.pot} opacity={0.9} />
            ))}
            <Label x={lx} y={ly + pan + 70} size={30} weight={600} color={C.heat}>
              1 proton
            </Label>
            <Label x={rx} y={ry + pan + 70} size={30} weight={600} color={C.pot}>
              {`${N} elektron`}
            </Label>
            <Ripple x={pivotX} y={pivotY} p={ramp(t, tBal - 0.1, tBal + 1.3, (x) => x)} r={160} color="gold" />
          </g>
        ) : null}

        {/* ---------------- (3) model roti kismis ---------------- */}
        {pud > 0.001 ? (
          <g opacity={pud}>
            <defs>
              <radialGradient id="th-pud" cx="42%" cy="38%" r="65%">
                <stop offset="0%" stopColor="#ff8a9a" stopOpacity={0.55} />
                <stop offset="70%" stopColor={C.heat} stopOpacity={0.3} />
                <stop offset="100%" stopColor="#7a1830" stopOpacity={0.25} />
              </radialGradient>
            </defs>
            <Glow x={PX} y={PYc} r={PR * 1.7} color="heat" opacity={0.25 + 0.25 * posG} />
            <circle cx={PX} cy={PYc} r={PR * (1 + 0.012 * Math.sin(t * 1.5))} fill="url(#th-pud)" stroke="#ff9aa8" strokeOpacity={0.5} strokeWidth={3} />
            <ellipse cx={PX - 80} cy={PYc - 120} rx={70} ry={34} fill="#fff" opacity={0.08} transform={`rotate(-30 ${PX - 80} ${PYc - 120})`} />
            {PLUS.map(([x, y], i) => (
              <text key={i} x={PX + x} y={PYc + y + 8} textAnchor="middle" fontFamily={FONT.head} fontWeight={700} fontSize={24} fill="#ffd0d6" opacity={(0.35 + 0.45 * posG) * (0.6 + 0.4 * Math.sin(t * 1.8 + i))}>
                +
              </text>
            ))}
            {ELEC.map(([x0, y0], i) => {
              const ang = (i / ELEC.length) * Math.PI * 2;
              const far = 1 - embed;
              const fx = PX + x0 + Math.cos(ang) * 520 * far;
              const fy = PYc + y0 + Math.sin(ang) * 340 * far;
              const jx = 7 * Math.sin(t * (5 + rand(i) * 3) + i);
              const jy = 7 * Math.sin(t * (4.3 + rand(i + 4) * 3) + i * 2);
              return <Charge key={i} x={fx + jx} y={fy + jy} r={17} s={-1} op={Math.min(1, embed * 2.5)} />;
            })}
            <Label x={PX} y={PYc - PR - 40} size={30} weight={600} color={C.heat} opacity={posG}>
              bola bermuatan + merata
            </Label>
            <Label x={PX} y={PYc + PR + 46} size={28} color={C.muted} opacity={neutral}>
              {'muatan + = muatan −  →  atom netral'}
            </Label>
            {/* roti kismis */}
            <g opacity={Math.min(1, bread)} transform={`translate(1430 ${470 + 6 * Math.sin(t * 1.2)}) scale(${0.85 + 0.15 * Math.min(1, bread)})`}>
              <ellipse cx={0} cy={118} rx={160} ry={16} fill="#000" opacity={0.3} />
              <path d="M-150,100 Q-160,-40 -60,-90 Q0,-115 60,-90 Q160,-40 150,100 Z" fill="#c98a4a" stroke="#f0b878" strokeWidth={3} />
              <path d="M-110,-30 Q0,-95 110,-30" fill="none" stroke="#f6cf98" strokeWidth={6} opacity={0.5} strokeLinecap="round" />
              {RAISIN.map(([x, y], i) => (
                <ellipse key={i} cx={x} cy={y + 30} rx={13} ry={9} fill="#4a2440" stroke="#7a3d6a" strokeWidth={2} transform={`rotate(${rand(i) * 80 - 40} ${x} ${y + 30})`} />
              ))}
            </g>
            <Label x={1430} y={660} size={30} weight={600} color="#f0b878" opacity={Math.min(1, bread)}>
              kismis dalam roti
            </Label>
            <Label x={1130} y={480} size={60} weight={700} color={C.muted} opacity={Math.min(1, bread)}>
              ≈
            </Label>
            <Twinkles x={1430} y={470} rx={170} ry={120} n={5} color="gold" opacity={Math.min(1, bread)} seed={3} />
          </g>
        ) : null}
      </Stage>

      <Badge x={1560} y={230} text="1897 · J. J. Thomson" color={C.gold} opacity={year * tube} />
      <Note x={960} y={810} p={neg} color={C.pot}>
        elektron: bermuatan <span style={{color: C.pot}}>negatif</span>
        <span style={{color: C.muted, opacity: light}}> · jauh lebih ringan dari atom</span>
      </Note>
      <Formula x={1450} y={470} p={cardM} accent={C.pot} caption="massa elektron vs massa proton">
        <V>m</V>
        <Sub>e</Sub> ≈ <Frac n={<><V>m</V><Sub>p</Sub></>} d="1836" />
      </Formula>
      <Note x={1450} y={830} p={slot(t, wordOf(2, 'kismis') + 0.3, dur)} color={C.heat} size={28}>
        model <span style={{color: '#f0b878'}}>roti kismis</span> (Thomson)
      </Note>
    </AbsoluteFill>
  );
};
