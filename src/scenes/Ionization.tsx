import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, mix, ramp} from '../anim';
import {Arrow, Formula, Frac, Glow, Label, Motes, Note, Ripple, Spark, Stage, Stream, Sub, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Energi ionisasi H (AUDIT): E∞ − E₁ = 0 − (−13,6) = 13,6 eV; × 96,485 = 1312 kJ/mol (terukur 1312,0);
// λ = 1240/13,6 = 91,2 nm (batas Lyman, UV jauh). Tangga digambar berskala Eₙ = −13,6/n².

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const TAU = Math.PI * 2;

// ---------- tangga energi (berskala) ----------
const LX0 = 340;
const LX1 = 720;
const YT = 230; // E = 0 (n = ∞)
const YB = 800; // E = −13,6 eV (n = 1)
const yE = (e: number) => YT + (-e / 13.6) * (YB - YT);
const En = (n: number) => -13.6 / (n * n);
const EX = 440; // posisi elektron di tangga
const AX = 620; // panah emas 13,6 eV

// ---------- atom ----------
const NX = 1400;
const NY = 545;
const R0 = 120;
const OM = 1.7;

// ---------- pita spektrum (0–800 nm, linear) ----------
const SB0 = 960;
const SB1 = 1800;
const SBY = 772;
const SBH = 34;
const xs = (l: number) => SB0 + (l * (SB1 - SB0)) / 800;
const VIS: [number, string][] = [
  [380, '#6a2cff'],
  [410, '#8b4dff'],
  [440, '#3d5cff'],
  [470, '#2aa8ff'],
  [490, '#2fe0d8'],
  [520, '#45f06a'],
  [570, '#e8f03a'],
  [590, '#ffc23a'],
  [620, '#ff6a2a'],
  [656, '#ff3030'],
  [700, '#e81e2a'],
  [750, '#8a0f1c'],
];
const UVC = '#d2c2ff';

/** Paket gelombang foton (sinus beramplop) sepanjang arah ang. */
const Packet: React.FC<{x: number; y: number; ang: number; lam: number; color: string; op: number; len?: number; t: number}> = ({x, y, ang, lam, color, op, len = 90, t}) => {
  if (op <= 0.001) return null;
  const pts: string[] = [];
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  for (let k = 0; k <= 45; k++) {
    const u = -len / 2 + (len * k) / 45;
    const env = Math.exp(-(((2 * u) / len) ** 2) * 2.6);
    const off = 11 * env * Math.sin((TAU * u) / lam - t * 14);
    pts.push(`${k ? 'L' : 'M'}${(x + c * u - s * off).toFixed(1)},${(y + s * u + c * off).toFixed(1)}`);
  }
  const d = pts.join(' ');
  return (
    <g opacity={op}>
      <circle cx={x} cy={y} r={38} fill="url(#soft-spr)" />
      <path d={d} fill="none" stroke={color} strokeOpacity={0.3} strokeWidth={9} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={1.2} strokeLinecap="round" />
    </g>
  );
};

export const Ionization: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  // ================= jadwal =================
  const tTiga = wordOf(1, 'tiga');
  const hit0 = cue(3) + 1.7;
  const P = 3.4;
  const LAMS = [85, 68, 56];
  const hits = [0, 1, 2].map((k) => hit0 + k * P).filter((h) => h < dur - 1.0);
  const lifts = [wordOf(0, 'melepaskan'), tTiga - 0.2, cue(2) + 1.2, cue(2) + 4.8, ...hits];
  let S = -1e9;
  for (const s of lifts) if (s <= t) S = s;
  const u = (t - S) / 2.6; // fase lompatan aktif
  const active = u >= 0 && u < 1;
  const restOp = active ? ramp(u, 0.72, 1) : 1;
  const riseOp = active ? 1 - ramp(u, 0.55, 0.78) : 0;

  // ================= opasitas bagian =================
  const ladOn = ramp(t, 0.1, 1.3);
  const atomOp = ramp(t, 0.5, 1.5) * (1 - slot(t, cue(2) - 0.3, cue(3) + 0.2));
  const note0 = slot(t, wordOf(0, 'minimum') - 0.3, tTiga - 0.5);
  const card1 = slot(t, tTiga - 0.2, cue(2) - 0.1);
  const arrowP = ramp(t, tTiga - 0.4, tTiga + 0.9, EASE_IN_OUT);
  const card2 = slot(t, wordOf(2, 'seribu') - 0.4, cue(3) - 0.15);
  const bars = slot(t, cue(2) + 0.1, cue(3) - 0.15);
  const fillA = ramp(t, wordOf(2, 'seribu') - 0.2, wordOf(2, 'kilojoule') + 0.4, EASE_IN_OUT);
  const fillB = ramp(t, wordOf(2, 'persis') - 0.6, wordOf(2, 'pengukuran') + 0.2, EASE_IN_OUT);
  const okP = ramp(t, wordOf(2, 'pengukuran') - 0.1, wordOf(2, 'pengukuran') + 0.5);
  const note2 = slot(t, wordOf(2, 'persis') - 0.2, cue(3) - 0.15);
  const card3 = ramp(t, wordOf(3, 'sembilan') - 0.4, wordOf(3, 'sembilan') + 0.4);
  const spec = ramp(t, cue(3) - 0.2, cue(3) + 0.9);
  const uvHi = ramp(t, wordOf(3, 'ultraungu') - 0.3, wordOf(3, 'ultraungu') + 0.5);

  const hiN1 = ramp(t, wordOf(1, 'satu') - 0.2, wordOf(1, 'satu') + 0.4) * (1 - ramp(t, cue(2), cue(2) + 1));
  const hiInf = ramp(t, wordOf(1, 'terhingga') - 0.2, wordOf(1, 'terhingga') + 0.4) * (1 - ramp(t, cue(2), cue(2) + 1));

  // ================= elektron di tangga =================
  const y1 = yE(-13.6);
  const restY = y1 + 3 * Math.sin(t * 2.4);
  const riseK = EASE_IN_OUT(Math.min(1, Math.max(0, u / 0.5)));
  const after = ramp(u, 0.5, 0.78);
  const riseY = mix(y1, YT, riseK) - 55 * after;
  const riseX = EX + 46 * after;
  const trail: [number, number][] = Array.from({length: 6}, (_, k) => {
    const uu = Math.max(0, u - 0.025 * (k + 1));
    return [EX + 46 * ramp(uu, 0.5, 0.78), mix(y1, YT, EASE_IN_OUT(Math.min(1, uu / 0.5))) - 55 * ramp(uu, 0.5, 0.78)];
  });

  // ================= elektron di atom =================
  const th = OM * t;
  const orbX = NX + R0 * Math.cos(th);
  const orbY = NY - R0 * Math.sin(th);
  const thS = OM * S;
  const dEsc = R0 + 900 * u * u;
  const escX = NX + dEsc * Math.cos(thS + 0.35 * u);
  const escY = NY - dEsc * Math.sin(thS + 0.35 * u);
  const escOp = active ? riseOp * (1 - ramp(dEsc, 280, 440)) : 0;

  // ================= foton UV =================
  const SRC: [number, number] = [960, 430];
  const photons = hits.map((h, k) => {
    const tgt: [number, number] = [NX + R0 * Math.cos(OM * h), NY - R0 * Math.sin(OM * h)];
    const tau = (t - (h - 1.3)) / 1.3;
    const on = tau > 0 && tau < 1;
    const x = mix(SRC[0], tgt[0], tau);
    const y = mix(SRC[1], tgt[1], tau);
    const ang = Math.atan2(tgt[1] - SRC[1], tgt[0] - SRC[0]);
    const op = on ? Math.min(1, tau * 8) * (1 - ramp(tau, 0.92, 1)) : 0;
    return {h, x, y, ang, op, lam: LAMS[k % LAMS.length], tgt, tau};
  });

  const ladderLevels = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <linearGradient id="ion-vis" x1="0" y1="0" x2="1" y2="0">
            {VIS.map(([l, c]) => (
              <stop key={l} offset={`${((l - 380) / 370) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
          <linearGradient id="ion-uv" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={UVC} stopOpacity={0.55} />
            <stop offset="100%" stopColor="#6a2cff" stopOpacity={0.35} />
          </linearGradient>
        </defs>

        {/* ---------- tangga energi ---------- */}
        <g opacity={ladOn}>
          <Glow x={EX} y={y1} r={110} color="pot" opacity={0.45} />
          <line x1={LX0 - 60} y1={YB + 30} x2={LX0 - 60} y2={YT - 50} stroke={C.muted} strokeOpacity={0.5} strokeWidth={2} markerEnd="url(#arrow-muted)" />
          <Label x={LX0 - 60} y={YT - 78} size={24} color={C.muted} font="serif" italic>
            E
          </Label>
          <Label x={(LX0 + LX1) / 2} y={YT - 36} size={22} color={C.muted} opacity={0.85}>
            elektron bebas
          </Label>
          {/* garis ∞ (E = 0) */}
          <line x1={LX0} y1={YT} x2={LX1} y2={YT} stroke={C.work} strokeWidth={2.5} strokeDasharray="10 8" strokeOpacity={0.85} />
          <rect x={LX0 - 10} y={YT - 14} width={LX1 - LX0 + 20} height={28} rx={14} fill={C.gold} opacity={0.18 * hiInf} />
          <Label x={LX0 - 18} y={YT} size={26} color={C.work} anchor="end">
            n = ∞
          </Label>
          <Label x={LX1 + 18} y={YT} size={24} color={C.ink} anchor="start" font="mono">
            0 eV
          </Label>
          {ladderLevels.map((n) => {
            const y = yE(En(n));
            const strong = n <= 3;
            return (
              <g key={n}>
                <line x1={LX0} y1={y} x2={LX1} y2={y} stroke={C.work} strokeWidth={strong ? 4 : 1.6} strokeOpacity={strong ? 0.95 : 0.45} strokeLinecap="round" />
                {strong ? (
                  <>
                    <Label x={LX0 - 18} y={y} size={26} color={C.work} anchor="end">
                      n = {n}
                    </Label>
                    <Label x={LX1 + 18} y={y} size={24} color={C.ink} anchor="start" font="mono">
                      {En(n).toFixed(n === 1 ? 1 : 2).replace('.', ',').replace('-', '−')} eV
                    </Label>
                  </>
                ) : null}
              </g>
            );
          })}
          <rect x={LX0 - 10} y={y1 - 14} width={LX1 - LX0 + 20} height={28} rx={14} fill={C.pot} opacity={0.2 * hiN1} />

          {/* panah emas 13,6 eV */}
          {arrowP > 0 ? (
            <>
              <Glow x={AX} y={(y1 + YT) / 2} r={170} color="gold" opacity={0.35 * arrowP} />
              <Arrow x1={AX} y1={y1 - 6} x2={AX} y2={mix(y1 - 6, YT + 10, arrowP)} color="gold" width={7} />
              <Stream pts={[[AX, y1 - 10], [AX, YT + 14]]} color="gold" n={6} speed={0.45} r={5} jitter={0} opacity={0.7 * arrowP} />
              <Label x={AX + 26} y={560} size={48} color={C.gold} anchor="start" weight={700} opacity={ramp(arrowP, 0.5, 1)}>
                13,6 eV
              </Label>
              <Twinkles x={AX + 110} y={560} rx={110} ry={40} n={5} opacity={ramp(arrowP, 0.6, 1)} />
            </>
          ) : null}

          {/* elektron: diam di n = 1, naik ke ∞ saat lompatan */}
          <Spark x={EX} y={restY} r={11} color="pot" opacity={restOp} />
          {active ? <Spark x={riseX} y={riseY} r={11} color="pot" opacity={riseOp} trail={u < 0.55 ? trail : undefined} /> : null}
          {active ? <Ripple x={EX} y={y1} p={u / 0.45} r={90} color="gold" /> : null}
          {active ? <Ripple x={EX} y={YT} p={(u - 0.42) / 0.5} r={80} color="gold" rings={2} /> : null}
          <Motes x={(LX0 + LX1) / 2} y={(YT + YB) / 2} rx={260} ry={300} n={22} color="work" opacity={0.35} seed={3} />
        </g>

        {/* ---------- atom H ---------- */}
        <g opacity={atomOp}>
          <Motes x={NX} y={NY} rx={240} ry={190} n={22} color="pot" opacity={0.4} seed={7} />
          <circle cx={NX} cy={NY} r={R0} fill="none" stroke={C.cyan} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="6 9" />
          <Glow x={NX} y={NY} r={70} color="heat" opacity={0.8} />
          <circle cx={NX} cy={NY} r={17} fill={C.heat} />
          <circle cx={NX - 5} cy={NY - 5} r={6} fill="#fff" opacity={0.55} />
          <Label x={NX} y={NY} size={20} color="#fff" weight={700}>
            +
          </Label>
          <Spark x={orbX} y={orbY} r={10} color="pot" opacity={restOp} />
          {active ? <Spark x={escX} y={escY} r={10} color="pot" opacity={escOp} trail={[0.03, 0.06, 0.09, 0.12].map((dk) => {
            const uu = Math.max(0, u - dk);
            const dd = R0 + 900 * uu * uu;
            return [NX + dd * Math.cos(thS + 0.35 * uu), NY - dd * Math.sin(thS + 0.35 * uu)] as [number, number];
          })} /> : null}
          <Label x={NX} y={NY + 165} size={24} color={C.muted}>
            atom hidrogen
          </Label>
          {photons.map((p, k) => (
            <g key={k}>
              <Packet x={p.x} y={p.y} ang={p.ang} lam={9} color={UVC} op={p.op} t={t} />
              <Label x={p.x} y={p.y - 46} size={22} color={UVC} opacity={p.op}>
                λ = {p.lam} nm
              </Label>
              <Ripple x={p.tgt[0]} y={p.tgt[1]} p={(t - p.h) / 0.9} r={110} color="spr" />
            </g>
          ))}
        </g>

        {/* ---------- pita spektrum (UV jauh) ---------- */}
        {spec > 0 ? (
          <g opacity={spec}>
            <rect x={SB0} y={SBY} width={xs(380) - SB0} height={SBH} fill="url(#ion-uv)" />
            <rect x={xs(380)} y={SBY} width={xs(750) - xs(380)} height={SBH} fill="url(#ion-vis)" />
            <rect x={xs(750)} y={SBY} width={SB1 - xs(750)} height={SBH} fill="#ff8f8f" opacity={0.22} />
            <rect x={SB0} y={SBY} width={xs(91.2) - SB0} height={SBH} fill={C.gold} opacity={(0.3 + 0.15 * Math.sin(t * 3)) * (0.5 + 0.5 * uvHi)} />
            <rect x={SB0} y={SBY} width={SB1 - SB0} height={SBH} fill="none" stroke={C.muted} strokeOpacity={0.5} strokeWidth={1.5} />
            <line x1={xs(91.2)} y1={SBY - 10} x2={xs(91.2)} y2={SBY + SBH + 10} stroke={C.gold} strokeWidth={3} />
            <Label x={xs(91.2)} y={SBY + SBH + 30} size={22} color={C.gold} weight={600}>
              91 nm
            </Label>
            {[400, 500, 600, 700].map((l) => (
              <g key={l}>
                <line x1={xs(l)} y1={SBY + SBH} x2={xs(l)} y2={SBY + SBH + 8} stroke={C.muted} strokeWidth={1.5} />
                <Label x={xs(l)} y={SBY + SBH + 30} size={20} color={C.muted} font="mono">
                  {l}
                </Label>
              </g>
            ))}
            <Label x={xs(780)} y={SBY + SBH + 30} size={20} color={C.muted} font="mono">
              nm
            </Label>
            <Label x={xs(180)} y={SBY - 24} size={24} color={UVC} weight={600} opacity={0.6 + 0.4 * uvHi}>
              ultraungu jauh
            </Label>
            <Label x={xs(565)} y={SBY - 24} size={24} color={C.muted}>
              cahaya tampak
            </Label>
            {photons.map((p, k) => {
              const op = Math.max(0, Math.min(1, (p.tau + 0.2) * 4, (1.6 - p.tau) * 3));
              return op > 0.001 && p.tau > -0.2 ? (
                <g key={k} opacity={op}>
                  <circle cx={xs(p.lam)} cy={SBY + SBH / 2} r={14 + 6 * Math.sin(t * 6)} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={2} />
                  <circle cx={xs(p.lam)} cy={SBY + SBH / 2} r={5} fill="#fff" />
                </g>
              ) : null;
            })}
          </g>
        ) : null}
      </Stage>

      {/* ---------- kartu ---------- */}
      <Note x={1380} y={300} p={note0} color={C.gold} size={34}>
        energi minimum: <span style={{color: C.work}}>n = 1</span> → <span style={{color: C.work}}>n = ∞</span>
      </Note>
      <Formula x={1380} y={290} p={card1} accent={C.gold} size={62} caption="0 − (−13,6 eV): dari keadaan dasar sampai lepas">
        <V>E</V>
        <Sub>∞</Sub> − <V>E</V>
        <Sub>1</Sub> = <span style={{color: C.gold}}>13,6 eV</span>
      </Formula>
      <Formula x={1380} y={290} p={card2} accent={C.gold} size={58} caption="1 eV per atom = 96,485 kJ/mol">
        13,6 <span style={{fontFamily: FONT.sans, fontSize: '0.62em'}}>eV</span> × 96,485 ≈ <span style={{color: C.gold}}>1312</span>{' '}
        <span style={{fontFamily: FONT.sans, fontSize: '0.62em'}}>kJ/mol</span>
      </Formula>
      <Formula x={1380} y={290} p={card3} accent={C.spr} size={58} caption="foton dengan λ < 91 nm mampu mengionkan H">
        <V>λ</V> = <Frac n={<span>1240 eV·nm</span>} d={<span>13,6 eV</span>} /> ≈ <span style={{color: UVC}}>91,2 nm</span>
      </Formula>

      {/* ---------- teori vs pengukuran ---------- */}
      {bars > 0 ? (
        <div style={{position: 'absolute', inset: 0, opacity: bars}}>
          {[
            {label: 'Teori Bohr (13,6 eV × Nₐ)', val: '1312', f: fillA, c: C.gold, y: 520},
            {label: 'Hasil pengukuran', val: '1312,0', f: fillB, c: C.work, y: 630},
          ].map((b) => (
            <div key={b.label} style={{position: 'absolute', left: 1000, top: b.y, width: 760}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT.head, fontSize: 28, color: C.ink, marginBottom: 10}}>
                <span>{b.label}</span>
                <span style={{fontFamily: FONT.mono, color: b.c, opacity: ramp(b.f, 0.7, 1)}}>{b.val} kJ/mol</span>
              </div>
              <div style={{position: 'relative', height: 34, borderRadius: 17, background: 'rgba(30,44,90,0.6)', border: `1.5px solid ${b.c}55`, overflow: 'hidden'}}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${b.f * 100}%`,
                    borderRadius: 17,
                    background: `linear-gradient(90deg, ${b.c}55, ${b.c})`,
                    boxShadow: `0 0 22px ${b.c}66`,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: 90,
                    left: `${(((t * 0.35) % 1) * 1.2 - 0.1) * 100}%`,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)',
                    opacity: b.f,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <Note x={1380} y={790} p={note2 * okP} color={C.work} size={32}>
        = hasil pengukuran <span style={{color: C.work, fontWeight: 700}}>✓</span>
      </Note>
      <Stage>
        <g opacity={bars}>
          <Ripple x={1760} y={667} p={(t - wordOf(2, 'pengukuran')) / 1.1} r={120} color="work" />
          <Twinkles x={1380} y={290} rx={380} ry={70} n={6} opacity={card2 * ramp(t, wordOf(2, 'seribu') + 0.6, wordOf(2, 'seribu') + 1.2)} />
        </g>
      </Stage>
    </AbsoluteFill>
  );
};
