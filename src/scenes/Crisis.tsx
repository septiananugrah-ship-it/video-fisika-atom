import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp} from '../anim';
import {Arrow, Badge, Card, DrawPath, Glow, Label, Motes, Note, Ripple, Spark, Stage, Twinkles} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Krisis atom klasik (AUDIT): radiasi Larmor → r³ berkurang linear terhadap waktu, ω ∝ r^(−3/2)
// → r(u) = R0·(1−u)^(1/3), θ(u) = θ0 + Θ·(1 − √(1−u)); waktu runtuh ≈ 1,6×10⁻¹¹ s (orde 10⁻¹¹–10⁻¹⁰ s).
// Spektrum: seharusnya kontinu; teramati garis H 656 / 486 / 434 / 410 nm.

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
const HLINES = [656, 486, 434, 410];

// spektrum (fase 4)
const SX0 = 1000;
const SX1 = 1760;
const sx = (nm: number) => SX0 + ((nm - 380) / 320) * (SX1 - SX0);
const S1Y = 380;
const S2Y = 640;
const SH = 74;

const Nucleus: React.FC<{x: number; y: number; r?: number; op?: number; t: number}> = ({x, y, r = 20, op = 1, t}) => (
  <g opacity={op}>
    <Glow x={x} y={y} r={r * 5} color="heat" opacity={0.8} />
    <circle cx={x} cy={y} r={r * (1 + 0.04 * Math.sin(t * 3.1))} fill="url(#cr-nuc)" />
    <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.3} fill="#fff" opacity={0.45} />
    <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={r * 1.05} fill="#fff">
      +
    </text>
  </g>
);

export const Crisis: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  // ---------- posisi atom ----------
  const slide = ramp(t, cue(3) - 0.2, cue(3) + 1.0, EASE_IN_OUT);
  const AX = mix(720, 470, slide);
  const AY = 510 + 4 * Math.sin(t * 0.7);
  const R0 = 200;
  const atomOn = ramp(t, -0.3, 0.9);

  // ---------- gerak elektron: orbit tetap → spiral (Larmor) ----------
  const tSp = wordOf(2, 'spiral') - 0.5;
  const tCr = Math.max(tSp + 2.5, wordOf(2, 'inti') + 0.2);
  const T = tCr - tSp;
  const W0 = 2.8; // rad/s pada orbit awal
  const THM = 2 * W0 * T; // agar laju sudut menyambung di awal spiral
  const uOf = (tt: number) => clamp01((tt - tSp) / T);
  const thOf = (tt: number) => {
    if (tt <= tSp) return 0.6 + W0 * tt;
    const u = Math.min(uOf(tt), 0.997);
    return 0.6 + W0 * tSp + THM * (1 - Math.sqrt(1 - u));
  };
  const rOf = (tt: number) => R0 * Math.cbrt(1 - Math.min(uOf(tt), 0.997)) * (1 - 0.92 * ramp(tt, tCr - 0.25, tCr, (x) => x));
  const posOf = (tt: number, cx = AX): [number, number] => {
    const r = rOf(tt);
    const a = thOf(tt);
    return [cx + r * Math.cos(a), AY - r * Math.sin(a)];
  };
  const [ex, ey] = posOf(t);
  const trail = Array.from({length: 9}, (_, k) => posOf(t - 0.035 * (k + 1)));
  const crashed = ramp(t, tCr - 0.1, tCr + 0.3);
  // pemulihan: "kenyataannya atom stabil"
  const tReal = wordOf(3, 'Kenyataannya');
  const restore = ramp(t, tReal - 0.2, tReal + 0.9, EASE_IN_OUT);
  const thS = 0.4 + 1.3 * t;
  const sxE = AX + R0 * Math.cos(thS);
  const syE = AY - R0 * Math.sin(thS);
  const sTrail = Array.from({length: 9}, (_, k) => [AX + R0 * Math.cos(thS - 0.06 * (k + 1)), AY - R0 * Math.sin(thS - 0.06 * (k + 1))] as [number, number]);

  // jejak spiral
  const uNow = uOf(t);
  const spPts: [number, number][] = [];
  if (uNow > 0) {
    const N = 220;
    for (let k = 0; k <= N; k++) {
      const tt = tSp + (k / N) * (Math.min(t, tCr) - tSp);
      spPts.push(posOf(tt));
    }
  }
  const spD = spPts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

  // ---------- radiasi EM: cincin dipancarkan dari posisi elektron ----------
  const tRad = wordOf(1, 'memancarkan') - 0.4;
  const radOn = ramp(t, tRad, tRad + 0.6) * (1 - ramp(t, tCr + 1.2, tCr + 2.2, EASE_IN_OUT));
  const DT = 0.32;
  const LIFE = 1.7;
  const rings: {x: number; y: number; r: number; op: number}[] = [];
  if (radOn > 0) {
    const k1 = Math.floor(t / DT);
    for (let k = k1; k > k1 - Math.ceil(LIFE / DT) - 1; k--) {
      const te = k * DT;
      if (te < tRad || te > tCr || te > t) continue;
      const age = (t - te) / LIFE;
      if (age >= 1) continue;
      const [rx, ry] = posOf(te);
      rings.push({x: rx, y: ry, r: 8 + age * 380, op: cyc(age) * (0.5 + 0.5 * uOf(te))});
    }
  }

  // ---------- teks & kartu ----------
  const orbitOn = ramp(t, 0.2, 1.4, EASE_IN_OUT) * (1 - ramp(t, tSp, tSp + 1.5, EASE_IN_OUT)) + 0.85 * restore;
  const planetOn = slot(t, wordOf(0, 'planet') - 0.6, cue(2) - 0.2, 0.7, 0.5);
  const accOn = slot(t, wordOf(1, 'melingkar') - 0.3, tSp + 0.3);
  const emNote = slot(t, wordOf(1, 'elektromagnetik', 1) - 0.4, cue(2) - 0.2);
  const timerOn = slot(t, tSp - 0.3, cue(3) + 0.6, 0.5, 0.5);
  const lossNote = slot(t, wordOf(2, 'kehilangan') - 0.3, cue(3) - 0.1);
  const runtuh = slot(t, tCr - 0.05, tReal - 0.1, 0.35, 0.45);
  const tval = 1.6 * uOf(t);
  const contOn = ramp(t, wordOf(3, 'kontinu') - 0.6, wordOf(3, 'kontinu') + 0.3);
  const strike = ramp(t, tReal - 0.1, tReal + 0.6, EASE_IN_OUT);
  const lineOn = ramp(t, wordOf(3, 'garis') - 0.7, wordOf(3, 'garis') + 0.2);
  const stableNote = ramp(t, tReal - 0.1, tReal + 0.6);
  const expOn = ramp(t, cue(3) + 0.2, cue(3) + 0.9);

  // inset tata surya
  const PX = 1480;
  const PY = 420;
  const pa = 0.9 * t + 1;

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <radialGradient id="cr-nuc" cx="38%" cy="34%" r="70%">
            <stop offset="0%" stopColor="#ffb3bd" />
            <stop offset="50%" stopColor={C.heat} />
            <stop offset="100%" stopColor="#7a1626" />
          </radialGradient>
          <radialGradient id="cr-sun" cx="40%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#fff3c4" />
            <stop offset="55%" stopColor={C.gold} />
            <stop offset="100%" stopColor="#b8741a" />
          </radialGradient>
          <linearGradient id="cr-rainbow" x1="0" y1="0" x2="1" y2="0">
            {[380, 410, 440, 470, 490, 510, 540, 570, 590, 620, 645, 680, 700].map((nm) => (
              <stop key={nm} offset={`${((nm - 380) / 320) * 100}%`} stopColor={nmRGB(nm)} stopOpacity={nm < 400 || nm > 680 ? 0.5 : 1} />
            ))}
          </linearGradient>
        </defs>

        {/* ============ atom ============ */}
        <g opacity={atomOn}>
          <Motes x={AX} y={AY} rx={300} ry={260} n={26} color="cyan" opacity={0.35} seed={3} />
          {/* orbit klasik */}
          <circle cx={AX} cy={AY} r={R0} fill="none" stroke={C.cyan} strokeWidth={2.5} strokeDasharray="10 12" strokeDashoffset={-t * 14} opacity={0.55 * orbitOn} />
          {/* gelombang EM */}
          <g opacity={radOn}>
            {rings.map((g, i) => (
              <g key={i} opacity={g.op}>
                <circle cx={g.x} cy={g.y} r={g.r} fill="none" stroke={C.press} strokeWidth={3} opacity={0.75} />
                <circle cx={g.x} cy={g.y} r={g.r * 0.86} fill="none" stroke={C.press} strokeWidth={1.4} opacity={0.35} />
              </g>
            ))}
          </g>
          {/* jejak spiral */}
          {spPts.length > 1 ? <path d={spD} fill="none" stroke={C.cyan} strokeWidth={2.4} opacity={0.6 * (1 - restore)} /> : null}
          <Nucleus x={AX} y={AY} t={t} r={20 + 6 * crashed * (1 - restore)} />
          <Ripple x={AX} y={AY} p={ramp(t, tCr - 0.05, tCr + 1.4, (x) => x)} r={240} color="heat" rings={4} />
          {/* elektron klasik (runtuh) */}
          <Spark x={ex} y={ey} r={11} color="pot" trail={trail} opacity={(1 - crashed) * (1 - restore)} />
          {/* elektron "nyata" stabil */}
          <Spark x={sxE} y={syE} r={11} color="pot" trail={sTrail} opacity={restore} />
          {/* percepatan sentripetal */}
          <g opacity={accOn}>
            <Arrow x1={ex} y1={ey} x2={ex + (AX - ex) * 0.42} y2={ey + (AY - ey) * 0.42} color="force" width={5} pulse={false} />
            <Label x={ex + (AX - ex) * 0.55 + 6} y={ey + (AY - ey) * 0.55 - 26} size={30} color={C.force} font="serif" italic>
              a
            </Label>
          </g>
          <Label x={AX} y={AY + R0 + 46} size={28} color={C.muted} opacity={ramp(t, 0.6, 1.4) * (1 - ramp(t, cue(1) - 0.4, cue(1) + 0.2, EASE_IN_OUT))}>
            model planet Rutherford
          </Label>
          <Label x={AX + R0 * 0.72 + 30} y={AY - R0 * 0.72 - 22} size={26} color={C.pot} opacity={ramp(t, 1.4, 2.2) * (1 - ramp(t, tSp - 0.5, tSp, EASE_IN_OUT))}>
            elektron
          </Label>
          <Label x={AX - 58} y={AY + 46} size={26} color={C.heat} opacity={ramp(t, 1.8, 2.6) * (1 - ramp(t, tSp - 0.5, tSp, EASE_IN_OUT))}>
            inti
          </Label>
          <Twinkles x={AX} y={AY} rx={220} ry={220} n={5} color="work" opacity={restore} seed={4} />
        </g>

        {/* ============ inset tata surya ============ */}
        <g opacity={planetOn}>
          <circle cx={PX} cy={PY} r={150} fill="none" stroke={C.muted} strokeWidth={2} strokeDasharray="6 10" opacity={0.6} />
          <Glow x={PX} y={PY} r={110} color="gold" />
          <circle cx={PX} cy={PY} r={34} fill="url(#cr-sun)" />
          <circle cx={PX + 150 * Math.cos(pa)} cy={PY - 150 * Math.sin(pa)} r={14} fill="#3fa0ff" />
          <circle cx={PX + 150 * Math.cos(pa) - 4} cy={PY - 150 * Math.sin(pa) - 4} r={5} fill="#c9f0ff" opacity={0.7} />
          <Label x={PX} y={PY + 200} size={30} color={C.gold}>
            seperti planet & matahari
          </Label>
        </g>
        <DrawPath d={`M${PX - 260},${PY} Q${PX - 330},${PY - 10} ${AX + R0 + 40},${AY - 20}`} p={planetOn} stroke="muted" width={2} dash="6 10" opacity={0.6 * planetOn} />

        {/* ============ spektrum (fase 4) ============ */}
        <g opacity={expOn}>
          <Label x={SX0} y={S1Y - SH / 2 - 34} size={30} anchor="start" color={C.muted} opacity={contOn}>
            seharusnya: spektrum kontinu
          </Label>
          <g opacity={contOn * (1 - 0.6 * strike)}>
            <rect x={SX0} y={S1Y - SH / 2} width={SX1 - SX0} height={SH} rx={8} fill="url(#cr-rainbow)" opacity={0.9} />
            <rect x={SX0 + ((t * 120) % (SX1 - SX0 + 200)) - 100} y={S1Y - SH / 2} width={60} height={SH} fill="#fff" opacity={0.12} />
          </g>
          <DrawPath d={`M${SX0 - 10},${S1Y + SH / 2 + 8} L${SX1 + 10},${S1Y - SH / 2 - 8}`} p={strike} stroke="heat" width={6} />
          <DrawPath d={`M${SX0 - 10},${S1Y - SH / 2 - 8} L${SX1 + 10},${S1Y + SH / 2 + 8}`} p={ramp(t, tReal + 0.2, tReal + 0.8, EASE_IN_OUT)} stroke="heat" width={6} />

          <Label x={SX0} y={S2Y - SH / 2 - 34} size={30} anchor="start" color={C.work} opacity={lineOn}>
            kenyataannya: spektrum garis
          </Label>
          <g opacity={lineOn}>
            <rect x={SX0} y={S2Y - SH / 2} width={SX1 - SX0} height={SH} rx={8} fill="#05070f" stroke={C.line} strokeWidth={2} />
            {HLINES.map((nm, i) => {
              const x = sx(nm);
              const fl = 0.85 + 0.15 * Math.sin(t * 4 + i * 1.7);
              const on = ramp(t, wordOf(3, 'garis') - 0.6 + i * 0.12, wordOf(3, 'garis') + i * 0.12);
              return (
                <g key={nm} opacity={on}>
                  <rect x={x - 14} y={S2Y - SH / 2} width={28} height={SH} fill={nmRGB(nm)} opacity={0.22 * fl} />
                  <rect x={x - 3.5} y={S2Y - SH / 2} width={7} height={SH} fill={nmRGB(nm)} opacity={fl} />
                  <Label x={x} y={S2Y + SH / 2 + 26} size={22} font="mono" color={C.muted}>
                    {nm}
                  </Label>
                </g>
              );
            })}
            <Label x={SX1} y={S2Y + SH / 2 + 62} size={22} anchor="end" font="mono" color={C.faint}>
              λ (nm)
            </Label>
          </g>
        </g>
      </Stage>

      {/* HTML */}
      <Note x={1480} y={720} p={emNote} color={C.press}>
        muatan dipercepat → memancarkan gelombang EM
      </Note>
      <Card x={1480} y={410} opacity={timerOn} accent={C.heat} style={{padding: '22px 36px', textAlign: 'center'}}>
        <div style={{fontFamily: FONT.head, fontSize: 26, color: C.muted, marginBottom: 6}}>waktu sampai jatuh ke inti</div>
        <div style={{fontFamily: FONT.mono, fontSize: 60, fontWeight: 600, color: C.ink}}>
          {tval.toFixed(2).replace('.', ',')} × 10<sup style={{fontSize: '0.55em', verticalAlign: '0.7em'}}>−11</sup> s
        </div>
        <div style={{fontFamily: FONT.sans, fontSize: 24, color: C.muted, marginTop: 6}}>≈ sepersepuluh miliar detik (orde 10⁻¹¹–10⁻¹⁰ s)</div>
      </Card>
      <Note x={1480} y={640} p={lossNote} color={C.cyan} size={28}>
        kehilangan energi → orbit menyusut
      </Note>
      <Badge x={AX} y={AY - 120} text="runtuh!" color={C.heat} opacity={runtuh} scale={0.8 + 0.2 * ramp(t, tCr - 0.05, tCr + 0.4, (x) => 1 - Math.pow(1 - x, 3)) + 0.03 * Math.sin(t * 6)} size={40} />
      <Note x={AX} y={810} p={stableNote} color={C.work} size={32}>
        ✓ Kenyataannya atom stabil
      </Note>
    </AbsoluteFill>
  );
};
