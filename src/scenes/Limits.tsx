import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp} from '../anim';
import {Glow, Label, Motes, Note, Ripple, Spark, Stage, Twinkles} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Keterbatasan Bohr (AUDIT, kualitatif): cocok untuk H; gagal untuk He (2 elektron saling tolak) & atom berelektron banyak;
// tak meramalkan kecerahan garis (Hα paling terang, Hβ, Hγ, Hδ makin redup); efek Zeeman (1 garis → 3 dalam medan B);
// L = nħ hanya ditetapkan. Orbit rₙ ∝ n² (36·n² px).

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const TAU = Math.PI * 2;

const BAL = [
  {lam: 656, col: '#ff3b3b', I: 1},
  {lam: 486, col: '#3fd8e8', I: 0.38},
  {lam: 434, col: '#4a6bff', I: 0.18},
  {lam: 410, col: '#9b5cff', I: 0.1},
];

const Nucleus: React.FC<{x: number; y: number; z: number; t: number}> = ({x, y, z, t}) => (
  <g>
    <Glow x={x} y={y} r={60 + z * 8} color="heat" opacity={0.75} />
    {z === 1 ? (
      <circle cx={x} cy={y} r={15} fill={C.heat} />
    ) : (
      Array.from({length: z * 2}, (_, k) => {
        const a = (k / (z * 2)) * TAU + t * 0.4;
        const rr = z > 2 ? 15 : 9;
        return <circle key={k} cx={x + rr * Math.cos(a) * (k % 3 === 0 ? 0.4 : 1)} cy={y + rr * Math.sin(a) * (k % 3 === 0 ? 0.4 : 1)} r={9} fill={k % 2 ? '#8e98b8' : C.heat} stroke="#0b1126" strokeWidth={1.2} />;
      })
    )}
  </g>
);

export const Limits: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  // ================= 0: H ✓, He ?, berelektron banyak ? =================
  const p0 = slot(t, 0.2, cue(1) + 0.3, 0.8, 0.7);
  const hOn = ramp(t, 0.3, 1.3);
  const okH = ramp(t, wordOf(0, 'hidrogen') - 0.2, wordOf(0, 'hidrogen') + 0.5, BACK);
  const heOn = ramp(t, wordOf(0, 'gagal') - 0.4, wordOf(0, 'gagal') + 0.5);
  const qHe = ramp(t, wordOf(0, 'helium') - 0.2, wordOf(0, 'helium') + 0.5, BACK);
  const manyOn = ramp(t, wordOf(0, 'banyak') - 0.3, wordOf(0, 'banyak') + 0.5);

  const HX = 460;
  const HeX = 1000;
  const MX = 1520;
  const AY = 500;
  const SC = (x: number) => `translate(${x},${AY}) scale(1.32) translate(${-x},${-AY})`;

  // H: elektron di orbit Bohr
  const hA = t * 1.6;
  // He: dua elektron saling tolak — lintasan terganggu (tidak tertutup)
  const he1a = t * 1.5 + 0.5 * Math.sin(t * 0.9);
  const he1r = 115 + 22 * Math.sin(t * 1.7) + 10 * Math.sin(t * 3.1);
  const he2a = he1a + Math.PI + 0.7 * Math.sin(t * 1.3);
  const he2r = 115 + 22 * Math.sin(t * 1.9 + 2) + 10 * Math.sin(t * 2.6);
  const e1: [number, number] = [HeX + he1r * Math.cos(he1a), AY + he1r * 0.92 * Math.sin(he1a)];
  const e2: [number, number] = [HeX + he2r * Math.cos(he2a), AY + he2r * 0.92 * Math.sin(he2a)];
  const heTrail = (k: number) =>
    Array.from({length: 26}, (_, i) => {
      const tt = t - i * 0.06;
      const a1 = tt * 1.5 + 0.5 * Math.sin(tt * 0.9);
      const a = k === 0 ? a1 : a1 + Math.PI + 0.7 * Math.sin(tt * 1.3);
      const r = k === 0 ? 115 + 22 * Math.sin(tt * 1.7) + 10 * Math.sin(tt * 3.1) : 115 + 22 * Math.sin(tt * 1.9 + 2) + 10 * Math.sin(tt * 2.6);
      return `${i ? 'L' : 'M'}${(HeX + r * Math.cos(a)).toFixed(1)},${(AY + r * 0.92 * Math.sin(a)).toFixed(1)}`;
    }).join(' ');

  // ================= 1: kecerahan & Zeeman =================
  const p1 = slot(t, cue(1) - 0.2, cue(2) + 0.2, 0.7, 0.7);
  const brOn = ramp(t, wordOf(1, 'terang') - 0.6, wordOf(1, 'terang') + 0.3);
  const bohrQ = ramp(t, wordOf(1, 'lain') - 0.2, wordOf(1, 'lain') + 0.5);
  const zOn = ramp(t, cue(1) + 1.2, cue(1) + 2.0);
  const B = ramp(t, wordOf(1, 'terbelah') - 0.2, wordOf(1, 'magnet') + 0.4, EASE_IN_OUT);
  const SPL = 70 * B; // pergeseran Zeeman ∝ B

  // strip kecerahan
  const BX0 = 170;
  const BX1 = 860;
  const bx = (l: number) => BX0 + ((l - 380) / 370) * (BX1 - BX0);

  // panel Zeeman
  const ZX = 1420;
  const ZY = 380;

  // ================= 2: mengapa hanya orbit tertentu? =================
  const p2 = ramp(t, cue(2) - 0.3, cue(2) + 0.6);
  const OX = 720;
  const OY = 530;
  const qOn = ramp(t, wordOf(2, 'mengapa') - 0.3, wordOf(2, 'mengapa') + 0.5);
  const tStamp = wordOf(2, 'menetapkannya');
  const stamp = ramp(t, tStamp - 0.15, tStamp + 0.25, EASE_IN_OUT);
  const forb = ramp(t, wordOf(2, 'tertentu') - 0.3, wordOf(2, 'tertentu') + 0.5);
  // elektron "mencoba" orbit terlarang (r antara n=2 dan n=3) lalu memudar — siklus 2,4 s
  const tryPh = (((t - cue(2)) / 2.4) % 1 + 1) % 1;
  const tryR = [90, 230][Math.floor(((t - cue(2)) / 2.4 + 100) % 2)];

  const bob = 4 * Math.sin(t * 2.1);

  return (
    <AbsoluteFill>
      <Stage>
        {/* ================= 0 ================= */}
        {p0 > 0 ? (
          <g opacity={p0}>
            {/* H */}
            <g opacity={hOn} transform={SC(HX)}>
              <Motes x={HX} y={AY} rx={190} ry={170} n={16} color="pot" opacity={0.4} seed={1} />
              <circle cx={HX} cy={AY} r={120} fill="none" stroke={C.cyan} strokeOpacity={0.4} strokeWidth={2} strokeDasharray="6 8" />
              <Nucleus x={HX} y={AY} z={1} t={t} />
              <Spark x={HX + 120 * Math.cos(hA)} y={AY + 120 * Math.sin(hA)} r={10} color="pot" />
              <Label x={HX} y={AY + 195} size={28} color={C.ink} weight={600}>
                Hidrogen · 1 elektron
              </Label>
            </g>
            {/* He */}
            <g opacity={heOn} transform={SC(HeX)}>
              <Motes x={HeX} y={AY} rx={190} ry={170} n={16} color="pot" opacity={0.4} seed={4} />
              <path d={heTrail(0)} fill="none" stroke={C.pot} strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
              <path d={heTrail(1)} fill="none" stroke={C.pot} strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
              <line x1={e1[0]} y1={e1[1]} x2={e2[0]} y2={e2[1]} stroke={C.press} strokeOpacity={0.45} strokeWidth={2} strokeDasharray="5 7" />
              <Nucleus x={HeX} y={AY} z={2} t={t} />
              <Spark x={e1[0]} y={e1[1]} r={10} color="pot" />
              <Spark x={e2[0]} y={e2[1]} r={10} color="pot" />
              <Label x={HeX} y={AY + 152} size={20} color={C.press} opacity={0.85}>
                saling tolak
              </Label>
              <Label x={HeX} y={AY + 195} size={28} color={C.ink} weight={600}>
                Helium · 2 elektron
              </Label>
            </g>
            {/* berelektron banyak */}
            <g opacity={manyOn} transform={SC(MX)}>
              <Motes x={MX} y={AY} rx={190} ry={170} n={14} color="pot" opacity={0.35} seed={9} />
              {[60, 110, 150].map((r, k) => (
                <circle key={k} cx={MX} cy={AY} r={r} fill="none" stroke={C.cyan} strokeOpacity={0.18} strokeWidth={1.5} />
              ))}
              <Nucleus x={MX} y={AY} z={5} t={t} />
              {Array.from({length: 11}, (_, k) => {
                const sh = k < 2 ? 0 : k < 10 ? 1 : 2;
                const r = [60, 110, 150][sh] + 8 * Math.sin(t * (1.3 + k * 0.17) + k);
                const a = k * 2.4 + t * (1.6 - sh * 0.4) * (k % 2 ? 1 : -1) * 0.8;
                return <circle key={k} cx={MX + r * Math.cos(a)} cy={AY + r * Math.sin(a)} r={6} fill={C.pot} opacity={0.9} />;
              })}
              <Label x={MX} y={AY + 195} size={28} color={C.ink} weight={600}>
                Atom berelektron banyak
              </Label>
            </g>
          </g>
        ) : null}

        {/* ================= 1 ================= */}
        {p1 > 0 ? (
          <g opacity={p1}>
            {/* kecerahan garis */}
            <g opacity={brOn}>
              <Label x={(BX0 + BX1) / 2} y={215} size={30} color={C.ink} weight={600}>
                Kecerahan garis
              </Label>
              <Label x={BX0} y={275} size={22} color={C.muted} anchor="start">
                pengamatan
              </Label>
              {BAL.map((b, k) => {
                const h = 150 * b.I * (1 + 0.04 * Math.sin(t * 3 + k));
                return (
                  <g key={k}>
                    <rect x={bx(b.lam) - 14} y={460 - h} width={28} height={h} rx={5} fill={b.col} opacity={0.35} />
                    <rect x={bx(b.lam) - 14} y={460 - h} width={28} height={4} rx={2} fill={b.col} />
                  </g>
                );
              })}
              <rect x={BX0} y={468} width={BX1 - BX0} height={50} fill="#05070f" stroke={C.muted} strokeOpacity={0.45} />
              {BAL.map((b, k) => (
                <g key={k} opacity={0.15 + 0.85 * b.I * (0.92 + 0.08 * Math.sin(t * 4 + k * 2))}>
                  <rect x={bx(b.lam) - 9} y={468} width={18} height={50} fill={b.col} opacity={0.35} />
                  <rect x={bx(b.lam) - 2.5} y={468} width={5} height={50} fill={b.col} />
                </g>
              ))}
              <Label x={BX0} y={590} size={22} color={C.muted} anchor="start" opacity={bohrQ}>
                ramalan Bohr
              </Label>
              <g opacity={bohrQ}>
                <rect x={BX0} y={620} width={BX1 - BX0} height={50} fill="#05070f" stroke={C.muted} strokeOpacity={0.45} />
                {BAL.map((b, k) => (
                  <g key={k}>
                    <rect x={bx(b.lam) - 2.5} y={620} width={5} height={50} fill={b.col} opacity={0.55} />
                    <Label x={bx(b.lam)} y={715 + 5 * Math.sin(t * 2.5 + k)} size={40} color={C.gold} weight={700}>
                      ?
                    </Label>
                  </g>
                ))}
                <Label x={(BX0 + BX1) / 2} y={785} size={24} color={C.ink}>
                  posisi <tspan fill={C.work}>✓</tspan> · kecerahan <tspan fill={C.gold}>?</tspan>
                </Label>
              </g>
            </g>

            {/* Zeeman */}
            <g opacity={zOn}>
              <Label x={ZX} y={215} size={30} color={C.ink} weight={600}>
                Di dalam medan magnet
              </Label>
              {/* kutub */}
              <rect x={ZX - 330} y={ZY - 75} width={90} height={150} rx={10} fill={C.heat} opacity={0.85} />
              <rect x={ZX + 240} y={ZY - 75} width={90} height={150} rx={10} fill={C.pot} opacity={0.85} />
              <Label x={ZX - 285} y={ZY} size={40} color="#fff" weight={700}>
                U
              </Label>
              <Label x={ZX + 285} y={ZY} size={40} color="#fff" weight={700}>
                S
              </Label>
              {[-50, -18, 18, 50].map((dy, k) => (
                <g key={k} opacity={0.15 + 0.6 * B}>
                  <line x1={ZX - 235} y1={ZY + dy} x2={ZX + 235} y2={ZY + dy} stroke={C.spr} strokeWidth={1.6} strokeDasharray="4 8" strokeOpacity={0.7} />
                  {[0, 1, 2].map((i) => {
                    const ph = (((t * 0.35 + i / 3 + k * 0.13) % 1) + 1) % 1;
                    return <circle key={i} cx={ZX - 235 + 470 * ph} cy={ZY + dy} r={3.2} fill={C.spr} opacity={Math.min(1, ph * 6) * (1 - ph)} />;
                  })}
                </g>
              ))}
              <Label x={ZX} y={ZY - 102} size={26} color={C.spr} weight={600} opacity={B}>
                B
              </Label>
              {/* tabung gas H menyala */}
              <rect x={ZX - 90} y={ZY - 20} width={180} height={40} rx={20} fill="#ff6a6a" opacity={0.22 + 0.06 * Math.sin(t * 5)} />
              <rect x={ZX - 90} y={ZY - 8} width={180} height={16} rx={8} fill="#ffb0b0" opacity={0.5 + 0.1 * Math.sin(t * 7)} />
              <Glow x={ZX} y={ZY} r={110} color="heat" opacity={0.5} />
              {/* spektrum diperbesar sekitar 656 nm */}
              <rect x={ZX - 320} y={ZY + 160} width={640} height={80} fill="#05070f" stroke={C.muted} strokeOpacity={0.45} />
              {[-1, 0, 1].map((s) => (
                <g key={s} opacity={s === 0 ? 1 : 0.35 + 0.65 * B}>
                  <rect x={ZX + s * SPL - 12} y={ZY + 160} width={24} height={80} fill="#ff3b3b" opacity={(s === 0 ? 0.35 : 0.3) * (s === 0 ? 1 - 0.3 * B : 1)} />
                  <rect x={ZX + s * SPL - 3} y={ZY + 160} width={6} height={80} fill="#ff3b3b" />
                  <rect x={ZX + s * SPL - 1} y={ZY + 160} width={2} height={80} fill="#fff" opacity={0.6} />
                </g>
              ))}
              <Ripple x={ZX} y={ZY + 200} p={(t - wordOf(1, 'terbelah') - 0.3) / 1.0} r={140} color="heat" rings={2} />
              <Label x={ZX} y={ZY + 285} size={26} color={C.ink} opacity={1 - B}>
                B = 0 → 1 garis
              </Label>
              <Label x={ZX} y={ZY + 285} size={26} color={C.ink} opacity={B}>
                B ≠ 0 → 3 garis (efek Zeeman)
              </Label>
              <Label x={ZX} y={ZY + 340} size={30} color={C.gold} weight={700} opacity={ramp(B, 0.7, 1)}>
                Bohr: ?
              </Label>
            </g>
          </g>
        ) : null}

        {/* ================= 2 ================= */}
        {p2 > 0 ? (
          <g opacity={p2}>
            <Motes x={OX} y={OY} rx={360} ry={330} n={24} color="cyan" opacity={0.35} seed={5} />
            {/* orbit terlarang */}
            {[90, 230].map((r, k) => (
              <g key={k} opacity={forb * 0.8}>
                <circle cx={OX} cy={OY} r={r} fill="none" stroke={C.heat} strokeOpacity={0.45} strokeWidth={2} strokeDasharray="3 10" />
                <Label x={OX + r * 0.707} y={OY - r * 0.707} size={26} color={C.heat} weight={700}>
                  ✕
                </Label>
              </g>
            ))}
            {forb > 0 ? (
              <g opacity={forb * Math.min(1, tryPh * 5) * (1 - tryPh) * 0.9}>
                <circle cx={OX + tryR * Math.cos(t * 1.4)} cy={OY + tryR * Math.sin(t * 1.4)} r={8} fill={C.pot} />
                <circle cx={OX + tryR * Math.cos(t * 1.4)} cy={OY + tryR * Math.sin(t * 1.4)} r={22} fill="url(#soft-heat)" />
              </g>
            ) : null}
            {/* orbit yang diizinkan rₙ ∝ n² */}
            {[1, 2, 3].map((n) => {
              const r = 36 * n * n;
              const a = t * (2.2 / n) + n;
              return (
                <g key={n}>
                  <circle cx={OX} cy={OY} r={r} fill="none" stroke={C.cyan} strokeOpacity={0.75} strokeWidth={3} />
                  <Label x={OX - r - 8} y={OY} size={24} color={C.cyan} anchor="end" opacity={n === 1 ? 0 : 1}>
                    n = {n}
                  </Label>
                  <Spark x={OX + r * Math.cos(a)} y={OY + r * Math.sin(a)} r={9} color="pot" />
                </g>
              );
            })}
            <Label x={OX} y={OY + 36 + 22} size={20} color={C.cyan}>
              n = 1
            </Label>
            <Nucleus x={OX} y={OY} z={1} t={t} />
            <Label x={OX + 300} y={OY + 290} size={22} color={C.muted} anchor="start">
              rₙ ∝ n²
            </Label>
            <Ripple x={1450} y={600} p={(t - tStamp - 0.1) / 1.0} r={260} color="gold" />
            <Twinkles x={1450} y={600} rx={240} ry={90} n={5} opacity={ramp(t, tStamp + 0.3, tStamp + 0.8)} />
          </g>
        ) : null}
      </Stage>

      {/* ---------- HTML ---------- */}
      {p0 > 0 ? (
        <>
          <div style={{position: 'absolute', left: HX, top: 245 + bob, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * okH})`, opacity: p0 * Math.min(1, okH * 1.5)}}>
            <Badge2 text="✓ cocok" color={C.work} />
          </div>
          <div style={{position: 'absolute', left: HeX, top: 245 - bob, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * qHe})`, opacity: p0 * Math.min(1, qHe * 1.5)}}>
            <Badge2 text="? gagal" color={C.gold} />
          </div>
          <div style={{position: 'absolute', left: MX, top: 245 + bob, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * manyOn})`, opacity: p0 * manyOn}}>
            <Badge2 text="? gagal" color={C.gold} />
          </div>
        </>
      ) : null}

      <Note x={1450} y={330} p={p2 * qOn} color={C.gold} size={40}>
        mengapa hanya orbit tertentu?
      </Note>
      {stamp > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 1450,
            top: 600,
            transform: `translate(-50%,-50%) rotate(-8deg) scale(${mix(1.6, 1, stamp)})`,
            opacity: p2 * Math.min(1, stamp * 1.4),
            border: `5px solid ${C.gold}`,
            outline: `2px solid ${C.gold}88`,
            outlineOffset: 6,
            borderRadius: 14,
            padding: '14px 40px 18px',
            background: 'rgba(40,30,8,0.55)',
            textAlign: 'center',
            color: C.gold,
            boxShadow: `0 0 40px ${C.gold}44`,
          }}
        >
          <div style={{fontFamily: FONT.head, fontWeight: 700, fontSize: 30, letterSpacing: 4}}>ATURAN BOHR</div>
          <div style={{fontFamily: FONT.serif, fontSize: 64, lineHeight: 1.2, color: C.ink}}>
            <i>L</i> = <i>n</i>ħ
          </div>
          <div style={{fontFamily: FONT.head, fontWeight: 600, fontSize: 28, letterSpacing: 1, whiteSpace: 'nowrap'}}>hanya ditetapkan, tanpa alasan</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Badge2: React.FC<{text: string; color: string}> = ({text, color}) => (
  <div
    style={{
      padding: '10px 28px',
      borderRadius: 999,
      background: 'rgba(10,16,36,0.9)',
      border: `2.5px solid ${color}`,
      boxShadow: `0 0 26px ${color}55`,
      color,
      fontFamily: FONT.head,
      fontWeight: 700,
      fontSize: 34,
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);
