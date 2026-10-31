import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, mix, ramp} from '../anim';
import {Badge, DrawPath, Formula, Frac, Glow, Label, Motes, Note, Ripple, Spark, Stage, Sub, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Postulat Bohr 1913 (AUDIT): orbit stasioner tak memancar; L = nħ = n·h/2π; hf = E_i − E_f.
// Orbit rₙ ∝ n² (gambar: 38·n² px); laju sudut ω ∝ 1/n³ (ω₂/ω₃ = 27/8). 3→2: 13,6(1/4 − 1/9) = 1,89 eV → 656 nm (merah).

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const nmRGB = (nm: number) => {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm < 440) {
    r = (440 - nm) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = (510 - nm) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = (645 - nm) / 65;
  } else r = 1;
  const f = (v: number) => Math.round(255 * (0.15 + 0.85 * clamp01(v)));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
};
const RED = nmRGB(656);

const AX = 620;
const AY0 = 520;
const rn = (n: number) => 38 * n * n;
const W3 = 0.45;
const W2 = (W3 * 27) / 8;

// spektrum kanan (baris 4)
const SX0 = 1140;
const SX1 = 1760;
const sx = (nm: number) => SX0 + ((nm - 380) / 320) * (SX1 - SX0);
const SY = 660;
const SH = 64;
const HL = [656, 486, 434, 410];

/** Paket gelombang foton bergerak ke kanan. */
const Photon: React.FC<{x: number; y: number; color: string; lam: number; op: number; t: number}> = ({x, y, color, lam, op, t}) => {
  if (op <= 0.001) return null;
  const L = 170;
  const pts: string[] = [];
  for (let k = 0; k <= 60; k++) {
    const s = -L / 2 + (k / 60) * L;
    const env = Math.cos((Math.PI * s) / L);
    const yy = y - 18 * env * env * Math.sin((2 * Math.PI * (s - t * 0)) / lam);
    pts.push(`${k ? 'L' : 'M'}${(x + s).toFixed(1)},${yy.toFixed(1)}`);
  }
  return (
    <g opacity={op}>
      <ellipse cx={x} cy={y} rx={L * 0.6} ry={40} fill={color} opacity={0.12} />
      <path d={pts.join(' ')} fill="none" stroke={color} strokeWidth={10} opacity={0.25} strokeLinecap="round" />
      <path d={pts.join(' ')} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
      <circle cx={x + L / 2 - 4} cy={y} r={4} fill="#fff" opacity={0.6} />
    </g>
  );
};

export const Bohr: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const AY = AY0 + 4 * Math.sin(t * 0.7);

  const atomOn = ramp(t, -0.3, 0.9);
  const orbitP = [1, 2, 3].map((n, i) => ramp(t, wordOf(1, 'orbit') - 0.3 + i * 0.35, wordOf(1, 'orbit') + 0.9 + i * 0.35, EASE_IN_OUT));
  const eOn = ramp(t, wordOf(1, 'elektron') - 0.2, wordOf(1, 'elektron') + 0.6);
  const statNote = slot(t, wordOf(1, 'tidak') - 0.3, cue(3) - 0.2);
  const portrait = slot(t, 0.3, cue(2) - 0.2, 0.8, 0.5);
  const lCard = slot(t, cue(2) - 0.1, cue(3) - 0.1);
  const kel = wordOf(2, 'kelipatan');
  const lLbl = ramp(t, kel - 0.3, kel + 0.5) * (1 - ramp(t, cue(4) - 0.6, cue(4), EASE_IN_OUT));
  const post1 = slot(t, cue(1) - 0.2, cue(3) - 0.2);
  const post2 = slot(t, cue(3) - 0.1, cue(4) - 0.2);

  // lompatan 3 → 2
  const tJ = wordOf(3, 'turun') + 0.1;
  const D = 0.6;
  const jp = ramp(t, tJ, tJ + D, EASE_IN_OUT);
  const TH0 = 0.35 - W3 * (tJ + D / 2);
  const dt = t - tJ;
  const extra = dt <= 0 ? 0 : dt < D ? ((W2 - W3) * dt * dt) / (2 * D) : (W2 - W3) * (dt - D / 2);
  const thAt = (tt: number) => {
    const d = tt - tJ;
    const ex = d <= 0 ? 0 : d < D ? ((W2 - W3) * d * d) / (2 * D) : (W2 - W3) * (d - D / 2);
    return TH0 + W3 * tt + ex;
  };
  const th = TH0 + W3 * t + extra;
  const rr = mix(rn(3), rn(2), jp);
  const ex = AX + rr * Math.cos(th);
  const ey = AY - rr * Math.sin(th);
  const trail = Array.from({length: 8}, (_, k) => {
    const tt = t - 0.06 * (k + 1);
    const r2 = mix(rn(3), rn(2), ramp(tt, tJ, tJ + D, EASE_IN_OUT));
    const a = thAt(tt);
    return [AX + r2 * Math.cos(a), AY - r2 * Math.sin(a)] as [number, number];
  });
  const hopHint = slot(t, wordOf(3, 'melompat') - 0.3, tJ + D, 0.5, 0.4);
  const tE = tJ + D * 0.5;
  const ex0 = AX + mix(rn(3), rn(2), 0.5) * Math.cos(thAt(tE));
  const ey0 = AY - mix(rn(3), rn(2), 0.5) * Math.sin(thAt(tE));
  const phX = ex0 + 40 + Math.max(0, t - tE) * 420;
  const phOp = ramp(t, tE, tE + 0.25) * (1 - ramp(t, tE + 1.4, tE + 2.0, EASE_IN_OUT));
  const hfCard = slot(t, wordOf(3, 'energinya') - 0.4, cue(4) - 0.1);

  // baris 4
  const specOn = ramp(t, cue(4) - 0.1, cue(4) + 0.7);
  const fitP = HL.map((_, i) => ramp(t, wordOf(4, 'semua') - 0.2 + i * 0.25, wordOf(4, 'semua') + 0.4 + i * 0.25));
  const tick = ramp(t, wordOf(4, 'tepat') - 0.4, wordOf(4, 'tepat') + 0.3);
  const klasik = ramp(t, wordOf(4, 'melawan') - 0.3, wordOf(4, 'melawan') + 0.5);

  // hantu spiral klasik di baris 0
  const ghostOn = 0.9 * ramp(t, 0.2, 1.2) * (1 - ramp(t, cue(1) - 0.6, cue(1) + 0.1, EASE_IN_OUT));
  const gu = (k: number) => k / 240;
  const ghostD = Array.from({length: 241}, (_, k) => {
    const u = Math.min(gu(k), 0.995);
    const r = 210 * Math.cbrt(1 - u);
    const a = 0.3 + t * 0.6 + 16 * (1 - Math.sqrt(1 - u));
    return `${k ? 'L' : 'M'}${(AX + r * Math.cos(a)).toFixed(1)},${(AY - r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <radialGradient id="bo-nuc" cx="38%" cy="34%" r="70%">
            <stop offset="0%" stopColor="#ffb3bd" />
            <stop offset="50%" stopColor={C.heat} />
            <stop offset="100%" stopColor="#7a1626" />
          </radialGradient>
        </defs>

        {/* hantu spiral klasik (masalah yang diselesaikan Bohr) */}
        <g opacity={ghostOn}>
          <path d={ghostD} fill="none" stroke={C.cyan} strokeWidth={2.4} opacity={0.5} />
          <DrawPath d={`M${AX - 120},${AY0 - 120} L${AX + 120},${AY0 + 120}`} p={ramp(t, wordOf(0, 'berani') - 0.3, wordOf(0, 'berani') + 0.2, EASE_IN_OUT)} stroke="heat" width={6} />
          <DrawPath d={`M${AX + 120},${AY0 - 120} L${AX - 120},${AY0 + 120}`} p={ramp(t, wordOf(0, 'berani') - 0.1, wordOf(0, 'berani') + 0.4, EASE_IN_OUT)} stroke="heat" width={6} />
          <Label x={AX} y={AY0 + 250} size={26} color={C.cyan}>
            spiral klasik (runtuh)
          </Label>
        </g>

        {/* ============ atom Bohr ============ */}
        <g opacity={atomOn}>
          <Motes x={AX} y={AY} rx={380} ry={340} n={28} color="work" opacity={0.3} seed={5} />
          {[1, 2, 3].map((n, i) => {
            const r = rn(n);
            const hot = n === 3 ? 1 - jp : n === 2 ? jp : 0;
            const pulse = ramp(t, kel + i * 0.3, kel + i * 0.3 + 0.3) * (1 - ramp(t, kel + i * 0.3 + 0.5, kel + i * 0.3 + 1.0, EASE_IN_OUT));
            return (
              <g key={n}>
                <circle cx={AX} cy={AY} r={r} fill="none" stroke={C.work} strokeWidth={10 + 8 * pulse} opacity={(0.07 + 0.08 * hot + 0.2 * pulse) * orbitP[i]} />
                <DrawPath d={`M${AX + r},${AY} A${r},${r} 0 1 0 ${AX - r},${AY} A${r},${r} 0 1 0 ${AX + r},${AY}`} p={orbitP[i]} stroke="work" width={2.6 + 1.2 * hot} opacity={0.75 + 0.25 * hot} />
                <Label x={AX - r * Math.cos(0.42) - 12} y={AY + r * Math.sin(0.42) + 14} size={26} anchor="end" font="mono" color={C.work} opacity={orbitP[i]}>
                  {`n=${n}`}
                </Label>
                <Label x={AX + r * Math.cos(0.42) + 12} y={AY + r * Math.sin(0.42) + 14} size={24} anchor="start" font="serif" italic color={C.ink} opacity={lLbl * ramp(t, kel + i * 0.3, kel + i * 0.3 + 0.4)}>
                  {`L = ${n === 1 ? '' : n}ħ`}
                </Label>
              </g>
            );
          })}
          <Glow x={AX} y={AY} r={100} color="heat" opacity={0.8} />
          <circle cx={AX} cy={AY} r={18 * (1 + 0.04 * Math.sin(t * 3.1))} fill="url(#bo-nuc)" />
          <text x={AX} y={AY + 1} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={19} fill="#fff">
            +
          </text>
          {/* petunjuk lompatan */}
          <DrawPath
            d={`M${AX + rn(3) * Math.cos(0.62)},${AY - rn(3) * Math.sin(0.62)} Q${AX + 250 * Math.cos(0.7)},${AY - 250 * Math.sin(0.7) - 10} ${AX + (rn(2) + 14) * Math.cos(0.55)},${AY - (rn(2) + 14) * Math.sin(0.55)}`}
            p={hopHint}
            stroke="white"
            width={2.5}
            dash="7 8"
            opacity={0.7 * hopHint}
          />
          <Spark x={ex} y={ey} r={11} color="pot" trail={trail} opacity={eOn} />
          <Ripple x={ex0} y={ey0} p={ramp(t, tE - 0.05, tE + 1.1, (x) => x)} r={120} color="heat" rings={3} />
          <Label x={AX} y={AY + rn(3) + 34} size={22} color={C.muted} opacity={orbitP[2] * 0.85}>
            {'jari-jari ∝ n² (berskala)'}
          </Label>
        </g>
        <Photon x={phX} y={ey0} color={RED} lam={28} op={phOp} t={t} />
        <Label x={phX} y={ey0 - 46} size={24} color={RED} opacity={phOp}>
          foton 656 nm
        </Label>

        {/* ============ Niels Bohr ============ */}
        <g opacity={portrait}>
          <Motes x={1440} y={420} rx={200} ry={170} n={18} color="gold" opacity={0.4} seed={9} />
          <circle cx={1440} cy={400} r={128} fill="#0f1a3a" stroke={C.gold} strokeWidth={3} />
          <circle cx={1440} cy={400} r={128} fill="none" stroke={C.gold} strokeWidth={8} opacity={0.15 + 0.1 * Math.sin(t * 1.6)} />
          <g transform={`translate(1440,${404 + 2 * Math.sin(t * 1.1)})`}>
            <path d="M-92,104 C-86,52 -50,34 0,34 C50,34 86,52 92,104 Z" fill="#2b3550" />
            <path d="M-22,34 L0,70 L22,34 Z" fill="#e8ecf5" opacity={0.85} />
            <path d="M-6,40 L0,74 L6,40 Z" fill="#7a2a3a" />
            <rect x={-14} y={8} width={28} height={30} fill="#d2ad8e" />
            <ellipse cx={0} cy={-26} rx={42} ry={50} fill="#d8b596" />
            <path d="M-44,-28 C-48,-80 48,-84 44,-30 C36,-60 -10,-66 -44,-28 Z" fill="#5b4632" />
            <ellipse cx={-15} cy={-26} rx={7} ry={4} fill="#2a2a35" />
            <ellipse cx={15} cy={-26} rx={7} ry={4} fill="#2a2a35" />
            <path d="M-14,4 Q0,10 14,4" stroke="#7a4a3a" strokeWidth={3} fill="none" strokeLinecap="round" />
          </g>
          <Label x={1440} y={570} size={38} weight={600} color={C.ink}>
            Niels Bohr
          </Label>
          <Label x={1440} y={614} size={30} font="mono" color={C.gold}>
            1913
          </Label>
          <Twinkles x={1440} y={400} rx={170} ry={140} n={4} color="gold" seed={3} />
        </g>

        {/* ============ cocok dengan 4 garis ============ */}
        <g opacity={specOn}>
          <Label x={SX0} y={SY - SH / 2 - 140} size={26} anchor="start" color={C.work}>
            ramalan Bohr
          </Label>
          <Label x={SX0} y={SY + SH / 2 + 76} size={26} anchor="start" color={C.muted}>
            teramati
          </Label>
          <rect x={SX0} y={SY - SH / 2} width={SX1 - SX0} height={SH} rx={6} fill="#04060d" stroke={C.line} strokeWidth={2} />
          {HL.map((nm, i) => {
            const x = sx(nm);
            const fl = 0.86 + 0.14 * Math.sin(t * 3.7 + i * 1.9);
            const drop = fitP[i];
            const ty = mix(SY - SH / 2 - 120, SY - SH / 2 - 26, drop);
            return (
              <g key={nm}>
                <rect x={x - 14} y={SY - SH / 2} width={28} height={SH} fill={nmRGB(nm)} opacity={0.2 * fl} />
                <rect x={x - 3.5} y={SY - SH / 2} width={7} height={SH} fill={nmRGB(nm)} opacity={fl} />
                <g opacity={drop}>
                  <path d={`M${x - 12},${ty - 18} L${x + 12},${ty - 18} L${x},${ty} Z`} fill={C.work} />
                </g>
                <g opacity={tick}>
                  <Ripple x={x} y={SY} p={ramp(t, wordOf(4, 'tepat') - 0.1 + i * 0.1, wordOf(4, 'tepat') + 0.9 + i * 0.1, (q) => q)} r={60} color="work" rings={2} />
                  <Label x={x} y={SY + SH / 2 + 34} size={28} color={C.work} weight={700}>
                    ✓
                  </Label>
                </g>
                <Label x={x} y={SY - SH / 2 - (nm === 434 ? 92 : 68)} size={20} font="mono" color={nmRGB(nm)} opacity={drop}>
                  {nm}
                </Label>
              </g>
            );
          })}
          <Twinkles x={(SX0 + SX1) / 2} y={SY} rx={300} ry={60} n={6} color="work" opacity={tick} seed={8} />
        </g>
      </Stage>

      {/* HTML */}
      <Badge x={1440} y={215} text="Postulat 1" color={C.work} opacity={post1} size={26} />
      <Badge x={1440} y={215} text="Postulat 2" color={C.work} opacity={post2} size={26} />
      <Note x={1440} y={770} p={statNote} color={C.work} size={30}>
        orbit stasioner: <span style={{color: C.work}}>tidak memancarkan energi</span>
      </Note>
      <Formula x={1440} y={430} p={lCard} accent={C.work} caption="n = 1, 2, 3, … (kelipatan bulat)">
        <V>L</V> = <V>n</V>ħ = <V>n</V> · <Frac n={<V>h</V>} d={<span>2<V>π</V></span>} />
      </Formula>
      <Formula x={1440} y={430} p={hfCard} accent={RED} caption="= 1,89 eV  →  λ = 656 nm (merah)">
        <V>hf</V> = <V>E</V>
        <Sub>3</Sub> − <V>E</V>
        <Sub>2</Sub>
      </Formula>
      <Note x={1450} y={400} p={klasik} color={C.gold} size={32}>
        melawan fisika klasik, <span style={{color: C.work}}>tapi tepat</span>
      </Note>
    </AbsoluteFill>
  );
};
