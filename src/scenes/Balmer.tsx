import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, mix, ramp} from '../anim';
import {Formula, Frac, Glow, Label, Motes, Ripple, Stage, Sub, Sup, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Deret hidrogen (AUDIT): 3→2 = 13,6(1/4 − 1/9) = 1,89 eV → 656 nm; 4→2 = 486; 5→2 = 434; 6→2 = 410 (tampak, Balmer).
// Lyman (→1): 121,6 · 102,6 · 97,3 · 95,0 nm (UV); Paschen (→3): 1875 · 1282 · 1094 nm (IR).
// 1/λ = R(1/n₁² − 1/n₂²), R = 1,097×10⁷ m⁻¹. Tangga berskala Eₙ = −13,6/n².

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const TAU = Math.PI * 2;
const lamOf = (u: number, l: number) => 1240 / (13.6 * (1 / (l * l) - 1 / (u * u)));

// ---------- tangga ----------
const LX0 = 290;
const LX1 = 800;
const YT = 215;
const YB = 820;
const yE = (e: number) => YT + (-e / 13.6) * (YB - YT);
const yN = (n: number) => yE(-13.6 / (n * n));

// ---------- spektrum ----------
const SX0 = 1010;
const SX1 = 1790;
const SY = 610;
const SH = 64;
const xl = (l: number) => SX0 + ((l - 380) / 370) * (SX1 - SX0);
const LG0 = Math.log10(85);
const LG1 = Math.log10(2000);
const xg = (l: number) => SX0 + ((Math.log10(l) - LG0) / (LG1 - LG0)) * (SX1 - SX0);

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
const LYC = '#cdbcff';
const PAC = '#ff9e9e';
const BCOL: Record<number, string> = {3: '#ff3b3b', 4: '#3fd8e8', 5: '#4a6bff', 6: '#9b5cff'};

type Jump = {u: number; l: number; ax: number; col: string; lam: number};
const J = (u: number, l: number, ax: number, col: string): Jump => ({u, l, ax, col, lam: lamOf(u, l)});
const BAL = [J(3, 2, 500, BCOL[3]), J(4, 2, 550, BCOL[4]), J(5, 2, 600, BCOL[5]), J(6, 2, 650, BCOL[6])];
const LYM = [J(2, 1, 325, LYC), J(3, 1, 355, LYC), J(4, 1, 385, LYC), J(5, 1, 415, LYC)];
const PAS = [J(4, 3, 705, PAC), J(5, 3, 735, PAC), J(6, 3, 765, PAC)];

const JD = 2.6; // durasi satu lompatan

/** Paket gelombang foton. */
const Packet: React.FC<{x: number; y: number; ang: number; lam: number; color: string; op: number; t: number}> = ({x, y, ang, lam, color, op, t}) => {
  if (op <= 0.001) return null;
  const len = 74;
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  let d = '';
  for (let k = 0; k <= 36; k++) {
    const u = -len / 2 + (len * k) / 36;
    const env = Math.exp(-(((2 * u) / len) ** 2) * 2.4);
    const off = 9 * env * Math.sin((TAU * u) / lam - t * 12);
    d += `${k ? 'L' : 'M'}${(x + c * u - s * off).toFixed(1)},${(y + s * u + c * off).toFixed(1)}`;
  }
  return (
    <g opacity={op}>
      <circle cx={x} cy={y} r={26} fill={color} opacity={0.16} />
      <path d={d} fill="none" stroke={color} strokeOpacity={0.3} strokeWidth={8} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
};

export const Balmer: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  // ---------- jadwal lompatan ----------
  const tTurun = wordOf(1, 'turun');
  const tEmpat = wordOf(2, 'empat');
  const tLima = wordOf(2, 'lima');
  const tLy = wordOf(4, 'Lyman');
  const tPa = wordOf(4, 'Paschen');
  const ev: {t0: number; j: Jump}[] = [];
  for (let s = tTurun - 0.6; s < cue(2) - 1.0; s += 3.3) ev.push({t0: s, j: BAL[0]});
  ev.push({t0: tEmpat - 0.6, j: BAL[1]});
  ev.push({t0: tLima - 0.6, j: BAL[2]});
  for (let s = tLima + 2.0, k = 0; s < cue(3) - 0.4; s += 1.5, k++) ev.push({t0: s, j: BAL[k % 3]});
  for (let s = cue(3) - 0.2, k = 0; s < cue(4) - 0.4; s += 1.15, k++) ev.push({t0: s, j: BAL[(k + 3) % 4]});
  for (let s = cue(4) + 0.3, k = 0; s < dur - 1; s += 1.6, k++) ev.push({t0: s, j: BAL[k % 4]});
  for (let s = tLy - 0.7, k = 0; s < dur - 1; s += 1.35, k++) ev.push({t0: s, j: LYM[k % 4]});
  for (let s = tPa - 0.7, k = 0; s < dur - 1; s += 1.5, k++) ev.push({t0: s, j: PAS[k % 3]});

  // ---------- fase ----------
  const ladOn = ramp(t, 0.2, 1.4);
  const pz = ramp(t, cue(4) - 0.3, cue(4) + 1.6, EASE_IN_OUT); // visible → skala log lebar
  const xOf = (l: number) => mix(xl(l), xg(l), pz);
  const card1 = slot(t, wordOf(1, 'koma') - 0.4, cue(2) - 0.2);
  const card5 = ramp(t, wordOf(5, 'Rydberg') - 0.4, wordOf(5, 'Rydberg') + 0.4);
  const balG = ramp(t, wordOf(3, 'Balmer') - 0.3, wordOf(3, 'Balmer') + 0.5);
  const lyG = ramp(t, tLy - 0.3, tLy + 0.5);
  const paG = ramp(t, tPa - 0.3, tPa + 0.5);
  const q0 = slot(t, 0.6, cue(1) + 0.4);
  const visHi = ramp(t, wordOf(3, 'tampak') - 0.2, wordOf(3, 'tampak') + 0.5) * (1 - ramp(t, cue(4), cue(4) + 1));

  // garis spektrum: kapan pertama menyala
  const firstLand = (j: Jump) => {
    const e = ev.filter((x) => x.j === j).map((x) => x.t0 + JD * 0.9);
    return e.length ? Math.min(...e) : 1e9;
  };
  const lineOn = (j: Jump, ghost: number) => Math.max(ghost, ramp(t, firstLand(j) - 0.1, firstLand(j) + 0.35));
  const arrowOn = (j: Jump) => {
    const e = ev.filter((x) => x.j === j).map((x) => x.t0);
    const a = e.length ? Math.min(...e) : 1e9;
    return ramp(t, a, a + 0.6, EASE_IN_OUT);
  };
  const ghost = 0.3 * ramp(t, 0.4, 1.2);

  const nLevels = [1, 2, 3, 4, 5, 6, 7];

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <linearGradient id="bal-vis" x1="0" y1="0" x2="1" y2="0">
            {VIS.map(([l, c]) => (
              <stop key={l} offset={`${((l - 380) / 370) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
          <clipPath id="bal-clip">
            <rect x={SX0 - 2} y={SY - 140} width={SX1 - SX0 + 4} height={SH + 240} />
          </clipPath>
        </defs>

        {/* ---------- tangga ---------- */}
        <g opacity={ladOn}>
          <Motes x={(LX0 + LX1) / 2} y={520} rx={330} ry={300} n={22} color="work" opacity={0.3} seed={2} />
          <line x1={LX0} y1={YT} x2={LX1} y2={YT} stroke={C.work} strokeWidth={2} strokeDasharray="10 8" strokeOpacity={0.6} />
          <Label x={LX0 - 18} y={YT} size={24} color={C.work} anchor="end">
            ∞
          </Label>
          {nLevels.map((n) => {
            const y = yN(n);
            const strong = n <= 3;
            return (
              <g key={n}>
                <line x1={LX0} y1={y} x2={LX1} y2={y} stroke={C.work} strokeWidth={strong ? 4 : 1.8} strokeOpacity={strong ? 0.95 : 0.55} strokeLinecap="round" />
                {n <= 3 ? (
                  <Label x={LX0 - 18} y={y + (n === 6 ? 4 : 0)} size={n <= 3 ? 26 : 20} color={C.work} anchor="end">
                    {n <= 3 ? `n = ${n}` : 'n = 4…6'}
                  </Label>
                ) : null}
                {strong ? (
                  <Label x={LX1 + 16} y={y} size={22} color={C.ink} anchor="start" font="mono">
                    {['−13,6', '−3,40', '−1,51'][n - 1]} eV
                  </Label>
                ) : null}
              </g>
            );
          })}

          {/* panah lompatan (tetap tampil setelah pertama kali) */}
          {[...BAL, ...LYM, ...PAS].map((j, k) => {
            const p = arrowOn(j);
            if (p <= 0) return null;
            const y0 = yN(j.u) + 4;
            const y1 = mix(y0, yN(j.l) - 12, p);
            return (
              <g key={`a${k}`}>
                <line x1={j.ax} y1={y0} x2={j.ax} y2={y1} stroke={j.col} strokeOpacity={0.22} strokeWidth={11} strokeLinecap="round" />
                <line x1={j.ax} y1={y0} x2={j.ax} y2={y1} stroke={j.col} strokeWidth={3.5} strokeLinecap="round" />
                <path d={`M${j.ax - 8},${y1 - 8} L${j.ax},${y1 + 4} L${j.ax + 8},${y1 - 8} Z`} fill={j.col} opacity={p} />
              </g>
            );
          })}

          {/* label kelompok di tangga */}
          <Label x={(BAL[0].ax + BAL[3].ax) / 2} y={yN(2) + 30} size={24} color={C.ink} weight={600} opacity={balG}>
            Balmer
          </Label>
          <Label x={(LYM[0].ax + LYM[3].ax) / 2} y={YB + 32} size={24} color={LYC} weight={600} opacity={lyG}>
            Lyman
          </Label>
          <Label x={(PAS[0].ax + PAS[2].ax) / 2} y={yN(3) + 28} size={22} color={PAC} weight={600} opacity={paG}>
            Paschen
          </Label>

          {/* elektron yang turun */}
          {ev.map((e, k) => {
            const u = (t - e.t0) / JD;
            if (u < 0 || u > 1) return null;
            const j = e.j;
            const yU = yN(j.u);
            const yL = yN(j.l);
            const d = EASE_IN_OUT(Math.min(1, Math.max(0, (u - 0.15) / 0.3)));
            const y = mix(yU, yL, d);
            const op = Math.min(1, u / 0.12) * (1 - ramp(u, 0.48, 0.66));
            return (
              <g key={k}>
                <circle cx={j.ax} cy={y} r={30} fill="url(#soft-pot)" opacity={op} />
                <circle cx={j.ax} cy={y} r={9} fill={C.pot} opacity={op} />
                <circle cx={j.ax} cy={y} r={4} fill="#fff" opacity={op} />
                <Ripple x={j.ax} y={yL} p={(u - 0.43) / 0.35} r={60} color="white" rings={2} width={2} />
              </g>
            );
          })}
        </g>

        {/* ---------- foton terbang ke spektrum ---------- */}
        {ev.map((e, k) => {
          const u = (t - e.t0) / JD;
          if (u < 0.44 || u > 0.92) return null;
          const j = e.j;
          const a: [number, number] = [j.ax + 14, yN(j.l) - 8];
          const b: [number, number] = [xOf(j.lam), SY - 6];
          const tau = EASE_IN_OUT((u - 0.45) / 0.45);
          const c: [number, number] = [(a[0] + b[0]) / 2, Math.min(Math.max(a[1], b[1]) + 120, 850)];
          const x = (1 - tau) ** 2 * a[0] + 2 * (1 - tau) * tau * c[0] + tau * tau * b[0];
          const y = (1 - tau) ** 2 * a[1] + 2 * (1 - tau) * tau * c[1] + tau * tau * b[1];
          const dx = 2 * (1 - tau) * (c[0] - a[0]) + 2 * tau * (b[0] - c[0]);
          const dy = 2 * (1 - tau) * (c[1] - a[1]) + 2 * tau * (b[1] - c[1]);
          const lamPx = Math.max(6, Math.min(48, j.lam / 24));
          const op = Math.min(1, (u - 0.44) * 20) * (1 - ramp(u, 0.86, 0.92));
          return <Packet key={k} x={x} y={y} ang={Math.atan2(dy, dx)} lam={lamPx} color={j.col} op={op} t={t} />;
        })}

        {/* ---------- spektrum ---------- */}
        <g opacity={ramp(t, 0.2, 1.0)}>
          <g clipPath="url(#bal-clip)">
            <rect x={xOf(85)} y={SY} width={xOf(380) - xOf(85)} height={SH} fill={LYC} opacity={0.14 * pz} />
            <rect x={xOf(750)} y={SY} width={xOf(2000) - xOf(750)} height={SH} fill={PAC} opacity={0.14 * pz} />
            <rect x={xOf(380)} y={SY} width={xOf(750) - xOf(380)} height={SH} fill="#05070f" />
            <rect x={xOf(380)} y={SY} width={xOf(750) - xOf(380)} height={SH} fill="url(#bal-vis)" opacity={0.16 + 0.1 * visHi} />
            <rect x={xOf(380)} y={SY - 6} width={xOf(750) - xOf(380)} height={4} fill="url(#bal-vis)" opacity={0.85} />
            {/* garis spektrum */}
            {[...BAL, ...LYM, ...PAS].map((j, k) => {
              const isB = BAL.includes(j);
              const on = lineOn(j, isB ? ghost : 0) * (isB ? 1 : pz);
              if (on <= 0.001) return null;
              const x = xOf(j.lam);
              const flash = ev
                .filter((e) => e.j === j)
                .reduce((m, e) => {
                  const q = (t - (e.t0 + JD * 0.9)) / 0.6;
                  return q > 0 && q < 1 ? Math.max(m, Math.sin(Math.PI * q)) : m;
                }, 0);
              return (
                <g key={k} opacity={on}>
                  <rect x={x - 9} y={SY} width={18} height={SH} fill={j.col} opacity={0.25 + 0.3 * flash} />
                  <rect x={x - 2.5} y={SY} width={5} height={SH} fill={j.col} />
                  <rect x={x - 1} y={SY} width={2} height={SH} fill="#fff" opacity={0.5 + 0.5 * flash} />
                </g>
              );
            })}
            <rect x={xOf(85)} y={SY} width={xOf(2000) - xOf(85)} height={SH} fill="none" stroke={C.muted} strokeOpacity={0.4 * pz} strokeWidth={1.5} />
            <rect x={xOf(380)} y={SY} width={xOf(750) - xOf(380)} height={SH} fill="none" stroke={C.muted} strokeOpacity={0.5} strokeWidth={1.5} />
          </g>
          {/* kilatan pendaratan */}
          {ev.map((e, k) => (
            <Ripple key={k} x={xOf(e.j.lam)} y={SY + SH / 2} p={(t - (e.t0 + JD * 0.88)) / 0.7} r={60} color="white" rings={2} width={2} />
          ))}
          {/* label nm (skala tampak) */}
          {BAL.map((j, k) => (
            <Label key={k} x={xl(j.lam)} y={SY + SH + 28} size={22} color={j.col} font="mono" opacity={(1 - pz) * Math.max(ghost * 2, lineOn(j, 0))}>
              {Math.round(j.lam)}
            </Label>
          ))}
          <Label x={SX1} y={SY + SH + 28} size={20} color={C.muted} anchor="end" font="mono" opacity={(1 - pz) * 0.8}>
            nm
          </Label>
          {/* sumbu log (skala lebar) */}
          {[100, 200, 500, 1000, 2000].map((l) => (
            <g key={l} opacity={pz}>
              <line x1={xg(l)} y1={SY + SH} x2={xg(l)} y2={SY + SH + 8} stroke={C.muted} strokeWidth={1.5} />
              <Label x={Math.min(xg(l), SX1 - 26)} y={SY + SH + 28} size={19} color={C.muted} font="mono">
                {l === 2000 ? '2000 nm' : l}
              </Label>
            </g>
          ))}
          {/* label kelompok di atas spektrum */}
          <Label x={xOf(565)} y={SY - 34} size={26} color={C.ink} weight={600} opacity={balG}>
            Balmer · tampak
          </Label>
          <Label x={xg(105)} y={SY - 34} size={24} color={LYC} weight={600} opacity={lyG * pz}>
            Lyman · UV
          </Label>
          <Label x={xg(1250)} y={SY - 34} size={24} color={PAC} weight={600} opacity={paG * pz}>
            Paschen · IR
          </Label>
          <Glow x={xOf(565)} y={SY + SH / 2} r={260} color="white" opacity={0.12 * balG} />
          <Twinkles x={xOf(565)} y={SY + SH / 2} rx={180} ry={40} n={4} color="white" opacity={visHi} />

          {/* awal: garis lama menunggu penjelasan */}
          <Label x={(SX0 + SX1) / 2} y={SY - 40} size={34} color={C.gold} weight={700} opacity={q0}>
            mengapa garis-garis ini?
          </Label>
        </g>
      </Stage>

      {/* ---------- kartu ---------- */}
      <Formula x={1420} y={320} p={card1} accent={BCOL[3]} size={56}>
        <div>
          Δ<V>E</V> = 13,6
          <span style={{fontSize: '1.1em'}}>(</span>
          <Frac n="1" d={<span>2<Sup>2</Sup></span>} /> − <Frac n="1" d={<span>3<Sup>2</Sup></span>} />
          <span style={{fontSize: '1.1em'}}>)</span> ≈ <span style={{color: BCOL[3]}}>1,89 eV</span>
        </div>
        <div style={{marginTop: 6}}>
          <V>λ</V> = <Frac n="1240" d="1,89" /> ≈ <span style={{color: BCOL[3]}}>656 nm</span>
        </div>
      </Formula>
      <Formula x={1420} y={330} p={card5} accent={C.work} size={60} caption={<span>R ≈ 1,097 × 10<Sup>7</Sup> m<Sup>−1</Sup> · n₁ = 1, 2, 3 → Lyman, Balmer, Paschen</span>}>
        <Frac n="1" d={<V>λ</V>} /> = <V>R</V>
        <span style={{fontSize: '1.1em'}}> (</span>
        <Frac n="1" d={<span><V>n</V><Sub>1</Sub><Sup>2</Sup></span>} /> − <Frac n="1" d={<span><V>n</V><Sub>2</Sub><Sup>2</Sup></span>} />
        <span style={{fontSize: '1.1em'}}>)</span>
      </Formula>
      <Stage>
        <Twinkles x={1420} y={330} rx={330} ry={80} n={5} color="work" opacity={card5 * ramp(t, wordOf(5, 'Rydberg') + 0.6, wordOf(5, 'Rydberg') + 1.2)} />
      </Stage>
    </AbsoluteFill>
  );
};
