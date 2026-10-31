import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, ramp} from '../anim';
import {Arrow, Formula, Frac, Glow, Label, Motes, Note, Ripple, Spark, Stage, Stream, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Gelombang materi (AUDIT): de Broglie λ = h/p; syarat gelombang berdiri melingkar 2πr = nλ
// ⇔ 2πr·p = nh ⇔ L = pr = nħ (aturan Bohr). n bulat → menutup mulus; n = 3,5 → putaran kedua berlawanan fase
// (sin(3,5(θ+2π)) = −sin(3,5θ)) → saling meniadakan. Schrödinger 1926: Ĥψ = Eψ → Eₙ = −13,6/n² eV (berskala).

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const TAU = Math.PI * 2;
const OMG = TAU * 0.55;

const CX = 600;
const CY = 520;
const R = 210;
const AMP = 24;

/** Path cincin r(θ) untuk θ ∈ [θ0, θ1]. */
const ring = (cx: number, cy: number, f: (th: number) => number, th0 = 0, th1 = TAU, n = 220) => {
  let d = '';
  for (let k = 0; k <= n; k++) {
    const th = th0 + ((th1 - th0) * k) / n;
    const r = f(th);
    d += `${k ? 'L' : 'M'}${(cx + r * Math.cos(th)).toFixed(1)},${(cy - r * Math.sin(th)).toFixed(1)}`;
  }
  return d;
};

/** Gelombang berdiri melingkar dengan n panjang gelombang (n bulat) atau gagal menutup (n tak bulat). */
const WaveRing: React.FC<{cx: number; cy: number; r: number; a: number; n: number; t: number; op: number; env?: number; w?: number; nodes?: boolean}> = ({
  cx,
  cy,
  r,
  a,
  n,
  t,
  op,
  env = 1,
  w = 4,
  nodes = true,
}) => {
  if (op <= 0.001) return null;
  const integer = Math.abs(n - Math.round(n)) < 1e-6;
  const col = C.spr;
  if (integer) {
    const ct = Math.cos(OMG * t);
    const d = ring(cx, cy, (th) => r + a * Math.sin(n * th) * ct);
    return (
      <g opacity={op}>
        <path d={ring(cx, cy, (th) => r + a * Math.sin(n * th))} fill="none" stroke={col} strokeOpacity={0.16} strokeWidth={1.5} />
        <path d={ring(cx, cy, (th) => r - a * Math.sin(n * th))} fill="none" stroke={col} strokeOpacity={0.16} strokeWidth={1.5} />
        <path d={d} fill="none" stroke={col} strokeOpacity={0.25} strokeWidth={w * 3} strokeLinejoin="round" />
        <path d={d} fill="none" stroke={col} strokeWidth={w} strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#fff" strokeOpacity={0.45} strokeWidth={w * 0.3} strokeLinejoin="round" />
        {nodes
          ? Array.from({length: 2 * n}, (_, k) => {
              const th = (k * Math.PI) / n;
              return <circle key={k} cx={cx + r * Math.cos(th)} cy={cy - r * Math.sin(th)} r={w * 0.9} fill="#fff" opacity={0.75} />;
            })
          : null}
      </g>
    );
  }
  // tak bulat: putaran 1 (ungu) & putaran 2 (merah putus-putus) berlawanan fase → saling meniadakan
  const phi = OMG * t;
  const e = a * env;
  const d1 = ring(cx, cy, (th) => r + e * Math.sin(n * th + phi));
  const d2 = ring(cx, cy, (th) => r + e * Math.sin(n * (th + TAU) + phi));
  const s0 = r + e * Math.sin(phi);
  const s1 = r + e * Math.sin(n * TAU + phi);
  return (
    <g opacity={op}>
      <path d={d2} fill="none" stroke={C.heat} strokeOpacity={0.55} strokeWidth={w * 0.6} strokeDasharray="6 7" />
      <path d={d1} fill="none" stroke={col} strokeOpacity={0.2} strokeWidth={w * 3} />
      <path d={d1} fill="none" stroke={col} strokeWidth={w} strokeOpacity={0.4 + 0.6 * env} />
      <line x1={cx + s0} y1={cy} x2={cx + s1} y2={cy} stroke={C.heat} strokeWidth={w * 0.8} strokeLinecap="round" />
      <circle cx={cx + r} cy={cy} r={w * 4} fill="url(#soft-heat)" opacity={0.6 + 0.4 * Math.sin(t * 6)} />
    </g>
  );
};

export const MatterWave: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  // ================= jadwal =================
  const tGel = wordOf(0, 'gelombang');
  const a0 = cue(1) - 0.2;
  const a1 = wordOf(1, 'mulus') - 0.1;
  const a2 = wordOf(1, 'Hanya') - 0.1;
  const a3 = wordOf(1, 'bulat') - 0.2;
  const a4 = cue(2) - 0.3;

  const wP = ramp(t, 0.3, 1.2) * (1 - ramp(t, tGel - 0.2, tGel + 0.7));
  const wT = ramp(t, tGel - 0.3, tGel + 0.6) * (1 - ramp(t, a0, a0 + 0.6, EASE_IN_OUT));
  const w3 = slot(t, a0, a1 + 0.45, 0.6);
  const w35 = slot(t, a1, a2 + 0.45);
  const w4 = Math.max(slot(t, a2, a3 + 0.45), ramp(t, a4, a4 + 0.6));
  const w5 = slot(t, a3, a4 + 0.45);
  const env35 = (() => {
    const ph = ((((t - a1) / 2.0) % 1) + 1) % 1;
    return Math.min(1, ph * 5) * (1 - ph) ** 1.4;
  })();

  const card0 = slot(t, wordOf(0, 'panjang') - 0.5, cue(1) - 0.1);
  const strip0 = slot(t, tGel - 0.1, cue(1) + 0.3);
  const grid = slot(t, cue(1) + 0.2, cue(2) + 0.2, 0.7, 0.6);
  const card2 = slot(t, cue(2) - 0.1, cue(3) - 0.1);
  const note2 = slot(t, wordOf(2, 'Kuantisasi') - 0.3, cue(3) - 0.1);
  const ticks = slot(t, cue(2) + 0.2, cue(3) + 0.3);
  const card3 = ramp(t, wordOf(3, 'Schrödinger') - 0.4, wordOf(3, 'Schrödinger') + 0.4);
  const tLev = wordOf(3, 'tingkat');
  const ladder = ramp(t, tLev - 0.6, tLev + 0.2);
  const selfP = ramp(t, wordOf(3, 'sendirinya') - 0.3, wordOf(3, 'sendirinya') + 0.5);

  // ================= partikel → gelombang (baris 0) =================
  const pa = t * 1.5;
  const travel = ring(CX, CY, (th) => R + AMP * Math.sin(4 * th - OMG * 1.6 * t));

  // ================= tangga (baris 3) =================
  const LX0 = 1130;
  const LX1 = 1610;
  const yL = (n: number) => 470 + (13.6 / (n * n) / 13.6) * 370;
  const levT = (n: number) => tLev + 0.35 * (n - 1);

  const labelOp = (w: number) => w;
  const states = [
    {w: w3, n: 3, txt: 'n = 3', ok: true},
    {w: w35, n: 3.5, txt: 'n = 3,5', ok: false},
    {w: w4, n: 4, txt: 'n = 4', ok: true},
    {w: w5, n: 5, txt: 'n = 5', ok: true},
  ];
  const minis = [
    {n: 3, x: 1210, y: 330, w: w3, txt: 'n = 3'},
    {n: 4, x: 1570, y: 330, w: Math.max(w4 * (1 - ramp(t, a4, a4 + 0.5)), 0), txt: 'n = 4'},
    {n: 5, x: 1210, y: 640, w: w5, txt: 'n = 5'},
    {n: 3.5, x: 1570, y: 640, w: w35, txt: 'n = 3,5'},
  ];

  return (
    <AbsoluteFill>
      <Stage>
        {/* ---------- atom: inti + cincin ---------- */}
        <Motes x={CX} y={CY} rx={300} ry={280} n={26} color="spr" opacity={0.4} seed={11} />
        <Glow x={CX} y={CY} r={R + 90} color="spr" opacity={0.25 * (1 - wP)} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={C.cyan} strokeOpacity={0.12 + 0.35 * wP} strokeWidth={2} strokeDasharray="6 9" />
        <Glow x={CX} y={CY} r={70} color="heat" opacity={0.8} />
        <circle cx={CX} cy={CY} r={17} fill={C.heat} />
        <circle cx={CX - 5} cy={CY - 5} r={6} fill="#fff" opacity={0.5} />
        <Label x={CX} y={CY} size={20} color="#fff" weight={700}>
          +
        </Label>

        {/* partikel klasik */}
        <Spark
          x={CX + R * Math.cos(pa)}
          y={CY - R * Math.sin(pa)}
          r={11}
          color="pot"
          opacity={wP}
          trail={[1, 2, 3, 4, 5].map((k) => [CX + R * Math.cos(pa - k * 0.06), CY - R * Math.sin(pa - k * 0.06)] as [number, number])}
        />
        {/* gelombang berjalan */}
        {wT > 0 ? (
          <g opacity={wT}>
            <path d={travel} fill="none" stroke={C.spr} strokeOpacity={0.25} strokeWidth={12} />
            <path d={travel} fill="none" stroke={C.spr} strokeWidth={4} />
          </g>
        ) : null}
        {/* gelombang berdiri */}
        {states.map((s) => (
          <WaveRing key={s.n} cx={CX} cy={CY} r={R} a={AMP} n={s.n} t={t} op={s.w} env={s.n === 3.5 ? env35 : 1} w={4.5} />
        ))}
        {states.map((s) => (
          <g key={`l${s.n}`} opacity={labelOp(s.w) * (1 - ramp(t, cue(3), cue(3) + 0.8))}>
            <Label x={CX} y={CY + R + 66} size={40} color={C.spr} weight={700}>
              {s.txt}
            </Label>
            <Label x={CX} y={CY + R + 112} size={26} color={s.ok ? C.work : C.heat} weight={600}>
              {s.ok ? '✓ bertemu dirinya dengan mulus' : '✕ tak menutup → saling meniadakan'}
            </Label>
          </g>
        ))}
        {[a1, a2, a3].map((a, k) => (
          <Ripple key={k} x={CX} y={CY} p={(t - a - 0.3) / 1.1} r={R + 60} color={k === 0 ? 'heat' : 'spr'} rings={2} />
        ))}
        {/* tanda λ di sepanjang keliling (n = 4) */}
        {ticks > 0 ? (
          <g opacity={ticks}>
            {[0, 1, 2, 3].map((k) => {
              const th = (k * TAU) / 4;
              const tm = th + TAU / 8;
              return (
                <g key={k}>
                  <line x1={CX + (R - 44) * Math.cos(th)} y1={CY - (R - 44) * Math.sin(th)} x2={CX + (R + 30) * Math.cos(th)} y2={CY - (R + 30) * Math.sin(th)} stroke={C.gold} strokeWidth={2.5} strokeOpacity={0.85} />
                  <Label x={CX + (R + 62) * Math.cos(tm)} y={CY - (R + 62) * Math.sin(tm)} size={32} color={C.gold} font="serif" italic weight={600}>
                    λ
                  </Label>
                </g>
              );
            })}
            <Label x={CX} y={CY - 70} size={28} color={C.gold} weight={600}>
              2πr = 4λ
            </Label>
          </g>
        ) : null}

        {/* ---------- strip gelombang linear (baris 0) ---------- */}
        {strip0 > 0 ? (
          <g opacity={strip0}>
            <path
              d={Array.from({length: 141}, (_, k) => {
                const x = 1100 + k * 4;
                const env = Math.min(1, (x - 1100) / 60, (1660 - x) / 60);
                const y = 640 + 34 * env * Math.sin((TAU * (x - 1100)) / 140 - OMG * 1.8 * t);
                return `${k ? 'L' : 'M'}${x},${y.toFixed(1)}`;
              }).join(' ')}
              fill="none"
              stroke={C.spr}
              strokeWidth={4}
            />
            <line x1={1240} y1={575} x2={1380} y2={575} stroke={C.gold} strokeWidth={2.5} />
            <line x1={1240} y1={563} x2={1240} y2={587} stroke={C.gold} strokeWidth={2.5} />
            <line x1={1380} y1={563} x2={1380} y2={587} stroke={C.gold} strokeWidth={2.5} />
            <Label x={1310} y={548} size={30} color={C.gold} font="serif" italic weight={600}>
              λ
            </Label>
            <Arrow x1={1110} y1={720} x2={1640} y2={720} color="pot" width={5} />
            <Label x={1660} y={720} size={30} color={C.pot} anchor="start" font="serif" italic weight={600}>
              p
            </Label>
            <Label x={1380} y={770} size={24} color={C.muted}>
              momentum besar → λ pendek
            </Label>
          </g>
        ) : null}

        {/* ---------- kisi 4 cincin kecil (baris 1) ---------- */}
        {grid > 0 ? (
          <g opacity={grid}>
            {minis.map((m) => {
              const hi = 0.4 + 0.6 * m.w;
              const ok = m.n !== 3.5;
              return (
                <g key={m.n}>
                  <Glow x={m.x} y={m.y} r={140} color={ok ? 'spr' : 'heat'} opacity={0.35 * m.w} />
                  <circle cx={m.x} cy={m.y} r={7} fill={C.heat} opacity={hi} />
                  <WaveRing cx={m.x} cy={m.y} r={80} a={11} n={m.n} t={t + m.n} op={hi} env={ok ? 1 : env35 * 0.6 + 0.4} w={3} nodes={false} />
                  <Label x={m.x} y={m.y + 122} size={26} color={ok ? C.work : C.heat} weight={600} opacity={hi}>
                    {m.txt} {ok ? '✓' : '✕'}
                  </Label>
                </g>
              );
            })}
          </g>
        ) : null}

        {/* ---------- tangga muncul dari gelombang (baris 3) ---------- */}
        {ladder > 0 ? (
          <g opacity={ladder}>
            <Stream pts={[[CX + R + 30, CY], [900, CY - 30], [LX0 - 10, 600]]} color="spr" n={9} speed={0.4} r={5} opacity={0.75} />
            <line x1={LX0} y1={470} x2={LX1} y2={470} stroke={C.work} strokeWidth={2} strokeDasharray="10 8" strokeOpacity={0.55 * ramp(t, levT(6), levT(6) + 0.4)} />
            {[1, 2, 3, 4, 5, 6].map((n) => {
              const p = ramp(t, levT(n), levT(n) + 0.45);
              const y = yL(n);
              const strong = n <= 3;
              return (
                <g key={n} opacity={p}>
                  <line
                    x1={(LX0 + LX1) / 2 - ((LX1 - LX0) / 2) * p}
                    y1={y}
                    x2={(LX0 + LX1) / 2 + ((LX1 - LX0) / 2) * p}
                    y2={y}
                    stroke={C.work}
                    strokeWidth={strong ? 4 : 1.8}
                    strokeOpacity={strong ? 0.95 : 0.6}
                    strokeLinecap="round"
                  />
                  {strong ? (
                    <>
                      <Label x={LX0 - 16} y={y} size={24} color={C.work} anchor="end">
                        n = {n}
                      </Label>
                      <Label x={LX1 + 16} y={y} size={22} color={C.ink} anchor="start" font="mono">
                        {['−13,6', '−3,40', '−1,51'][n - 1]} eV
                      </Label>
                    </>
                  ) : null}
                  <Ripple x={(LX0 + LX1) / 2} y={y} p={(t - levT(n)) / 0.9} r={strong ? 120 : 60} color="work" rings={2} />
                </g>
              );
            })}
            <Spark x={(LX0 + LX1) / 2 + 120 * Math.sin(t * 0.9)} y={yL(1) + 3 * Math.sin(t * 2.3)} r={10} color="pot" opacity={ramp(t, levT(1) + 0.3, levT(1) + 0.8)} />
            <Label x={(LX0 + LX1) / 2} y={428} size={28} color={C.work} weight={600} opacity={selfP}>
              muncul dengan sendirinya
            </Label>
            <Twinkles x={(LX0 + LX1) / 2} y={428} rx={200} ry={24} n={4} color="work" opacity={selfP} />
          </g>
        ) : null}
      </Stage>

      {/* ---------- kartu ---------- */}
      <Formula x={1380} y={330} p={card0} accent={C.spr} size={66} caption="de Broglie (1924): elektron adalah gelombang">
        <V>λ</V> = <Frac n={<V>h</V>} d={<V>p</V>} />
      </Formula>
      <Formula x={1380} y={330} p={card2} accent={C.spr} size={60} caption={<span>karena λ = h/p:  2πr·p = nh  →  pr = n·h/2π</span>}>
        2π<V>r</V> = <V>n</V>
        <V>λ</V>
        <span style={{margin: '0 0.5em', color: C.gold}}>⇔</span>
        <V>L</V> = <V>n</V>ħ
      </Formula>
      <Note x={1380} y={560} p={note2} color={C.spr} size={40}>
        Kuantisasi = <span style={{color: C.spr}}>gelombang berdiri</span>
      </Note>
      <Formula x={1380} y={290} p={card3} accent={C.work} size={66} caption="Erwin Schrödinger, 1926: persamaan gelombang elektron">
        <V>Ĥ</V>
        <V>ψ</V> = <V>E</V>
        <V>ψ</V>
      </Formula>
      <Stage>
        <Twinkles x={1380} y={560} rx={300} ry={50} n={5} color="spr" opacity={note2} />
        <Glow x={1380} y={290} r={260} color="work" opacity={0.25 * card3 * (1 - ramp(t, wordOf(3, 'Schrödinger') + 1, wordOf(3, 'Schrödinger') + 3))} />
      </Stage>
    </AbsoluteFill>
  );
};
