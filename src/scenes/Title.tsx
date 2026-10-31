import React from 'react';
import {AbsoluteFill, Img, interpolateColors, staticFile} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, mix, ramp, rand} from '../anim';
import {Glow, Ripple, Stage, Twinkles} from '../components/primitives';
import {BRAND} from '../brand';
import {useScene} from '../SceneContext';
import {C, FONT, type Hue} from '../theme';

// Judul bernuansa atom:
//  · kiri: tangga tingkat energi hidrogen berskala Eₙ = −13,6/n² eV (makin rapat ke atas), elektron melompat turun
//    3→2, 4→2, 5→2 (dieksitasi kembali di antaranya) dan memancarkan foton 656 (merah), 486 (toska), 434 (biru);
//  · foton terbang ke pita spektrum di bawah → garis spektrum H terbentuk satu per satu;
//  · kanan: atom Bohr kecil dengan jari-jari rₙ ∝ n² (4,2·n² px) yang mengikuti lompatan yang sama;
//  · kata "Tangga": huruf-hurufnya menaik seperti anak tangga, hijau (tingkat energi) → emas.
const fr = (v: number) => ((v % 1) + 1) % 1;
type P = [number, number];

const nmColor = (nm: number): string => {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm < 440) [r, g, b] = [-(nm - 440) / 60, 0, 1];
  else if (nm < 490) [r, g, b] = [0, (nm - 440) / 50, 1];
  else if (nm < 510) [r, g, b] = [0, 1, -(nm - 510) / 20];
  else if (nm < 580) [r, g, b] = [(nm - 510) / 70, 1, 0];
  else if (nm < 645) [r, g, b] = [1, -(nm - 645) / 65, 0];
  else [r, g, b] = [1, 0, 0];
  const h = (v: number) =>
    Math.round(255 * Math.pow(Math.max(0, Math.min(1, v)), 0.8))
      .toString(16)
      .padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
};

// tangga energi
const LX0 = 130;
const LX1 = 290;
const Y0 = 210; // E = 0
const KY = 47.06; // px per eV  (E₁ = −13,6 → y = 850)
const En = (n: number) => -13.6 / (n * n);
const ey = (e: number) => Y0 - e * KY;

// lompatan: [waktu, ke n]
const HOPS: {at: number; to: number; emit?: number; hue?: Hue}[] = [
  {at: 1.0, to: 2, emit: 656, hue: 'heat'},
  {at: 2.6, to: 4},
  {at: 3.1, to: 2, emit: 486, hue: 'cyan'},
  {at: 4.5, to: 5},
  {at: 5.0, to: 2, emit: 434, hue: 'pot'},
];
const FLY = 1.35;
const SX0 = 560;
const SX1 = 1360;
const SY = 900;
const sx = (nm: number) => SX0 + ((nm - 400) / 300) * (SX1 - SX0);
const bez = (a: P, c: P, b: P, s: number): P => [(1 - s) * (1 - s) * a[0] + 2 * (1 - s) * s * c[0] + s * s * b[0], (1 - s) * (1 - s) * a[1] + 2 * (1 - s) * s * c[1] + s * s * b[1]];

const AX = 1738;
const AY = 450;
const RB = 4.2; // px · n²

export const Title: React.FC = () => {
  const {t, dur} = useScene();
  const a = ramp(t, 0.2, 1.4);
  const sub = ramp(t, 1.5, 2.5);
  const brand = ramp(t, 2.6, 3.6);
  const out = 1 - ramp(t, dur - 1.0, dur - 0.1, EASE_IN_OUT);
  const push = 1 + 0.035 * ramp(t, -0.8, dur, EASE_IN_OUT);
  const rig = ramp(t, 0.0, 1.0);
  const stair = ramp(t, 2.0, 3.4, EASE_IN_OUT);
  const title = BRAND.title;
  const HL = 'Tangga';
  const split = title.indexOf(HL);

  // energi elektron (berurutan, tiap lompatan 0,28 dtk)
  let e = En(3);
  for (const h of HOPS) e = mix(e, En(h.to), ramp(t, h.at, h.at + 0.28, EASE_IN_OUT));
  const nEff = Math.sqrt(13.6 / -e);
  const eY = ey(e);
  const ex = 210 + 50 * Math.sin(t * 1.7);

  // atom Bohr kecil
  const rr = RB * nEff * nEff;
  const ang = t * 2.4;
  const elx = AX + rr * Math.cos(ang);
  const ely = AY - rr * Math.sin(ang);

  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 48%'}}>
        <Stage>
          <defs>
            {[656, 486, 434].map((nm) => (
              <radialGradient key={nm} id={`ti-g${nm}`}>
                <stop offset="0%" stopColor={nmColor(nm)} stopOpacity={0.8} />
                <stop offset="45%" stopColor={nmColor(nm)} stopOpacity={0.22} />
                <stop offset="100%" stopColor={nmColor(nm)} stopOpacity={0} />
              </radialGradient>
            ))}
          </defs>
          <Glow x={960} y={470} r={720} color="spr" opacity={0.16 * a} />
          <Glow x={960} y={470} r={520} color="work" opacity={0.07 * a} />
          {/* butir cahaya warna-warni melayang di latar */}
          {Array.from({length: 18}, (_, i) => {
            const ph = fr(t * (0.05 + rand(i) * 0.05) + rand(i * 3.3));
            const x = 360 + rand(i * 7.7) * 1200 + 24 * Math.sin(t * 0.9 + i);
            const y = 840 - ph * 640;
            return <circle key={i} cx={x} cy={y} r={2 + rand(i * 2.1) * 2.5} fill={nmColor(420 + rand(i * 5.1) * 260)} opacity={0.32 * cyc(ph) * a} />;
          })}

          {/* ---- tangga energi ---- */}
          <g opacity={rig}>
            <rect x={LX0 - 30} y={Y0 - 24} width={LX1 - LX0 + 50} height={ey(-13.6) - Y0 + 50} rx={14} fill="#0a1128" opacity={0.6} />
            <line x1={LX0} y1={Y0} x2={LX1} y2={Y0} stroke={C.gold} strokeWidth={2} strokeDasharray="6 7" opacity={0.7} />
            <text x={LX1 + 4} y={Y0 - 10} textAnchor="end" fontFamily={FONT.mono} fontSize={17} fill={C.gold} opacity={0.85}>
              0 eV
            </text>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => {
              const y = ey(En(n));
              const lit = Math.max(0, 1 - Math.abs(nEff - n) * 1.4);
              return (
                <g key={n}>
                  <line x1={LX0} y1={y} x2={LX1} y2={y} stroke={C.work} strokeWidth={n <= 5 ? 4 : 2} opacity={n <= 5 ? 0.55 + 0.45 * lit : 0.35} strokeLinecap="round" />
                  {n <= 3 ? (
                    <text x={LX0 - 12} y={y + 6} textAnchor="end" fontFamily={FONT.mono} fontSize={19} fill={C.work} opacity={0.85}>
                      {n}
                    </text>
                  ) : null}
                </g>
              );
            })}
            <text x={LX0 - 12} y={ey(En(5)) + 6} textAnchor="end" fontFamily={FONT.mono} fontSize={15} fill={C.work} opacity={0.6}>
              ⋮
            </text>
            <text x={LX1} y={ey(En(1)) - 14} textAnchor="end" fontFamily={FONT.mono} fontSize={18} fill={C.muted}>
              −13,6 eV
            </text>
            <text x={LX1} y={ey(En(2)) + 26} textAnchor="end" fontFamily={FONT.mono} fontSize={18} fill={C.muted}>
              −3,40 eV
            </text>
            <text x={(LX0 + LX1) / 2} y={ey(-13.6) + 0} dy={-58} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={24} fill={C.work} opacity={0.85}>
              Eₙ = −13,6/n²
            </text>
            {/* lompatan: panah eksitasi pucat & panah turun berwarna */}
            {HOPS.map((h, k) => {
              const from = k === 0 ? 3 : HOPS[k - 1].to;
              const p = ramp(t, h.at - 0.1, h.at + 0.3) * (1 - ramp(t, h.at + 0.9, h.at + 1.5, EASE_IN_OUT));
              if (p <= 0.001) return null;
              const xx = 160 + k * 26;
              const col = h.emit ? nmColor(h.emit) : C.muted;
              const y1 = ey(En(from));
              const y2 = ey(En(h.to));
              return (
                <g key={k} opacity={p}>
                  <line x1={xx} y1={y1} x2={xx} y2={y2 + (y2 > y1 ? -8 : 8)} stroke={col} strokeWidth={h.emit ? 4 : 2.5} strokeDasharray={h.emit ? undefined : '5 5'} />
                  <path d={y2 > y1 ? `M${xx - 7},${y2 - 12} L${xx},${y2} L${xx + 7},${y2 - 12}` : `M${xx - 7},${y2 + 12} L${xx},${y2} L${xx + 7},${y2 + 12}`} fill="none" stroke={col} strokeWidth={3} />
                </g>
              );
            })}
            {/* elektron */}
            <circle cx={ex} cy={eY} r={26} fill="url(#soft-pot)" />
            <circle cx={ex} cy={eY} r={10} fill={C.pot} stroke="#cfe6ff" strokeWidth={1.5} />
            <circle cx={ex - 3} cy={eY - 3} r={3.5} fill="#fff" opacity={0.7} />
          </g>

          {/* ---- foton terbang ke pita spektrum ---- */}
          {HOPS.filter((h) => h.emit).map((h) => {
            const nm = h.emit as number;
            const s = ramp(t, h.at + 0.1, h.at + 0.1 + FLY, EASE_IN_OUT);
            const A: P = [LX1 + 14, ey(En(2))];
            const Cc: P = [LX1 + 30, SY + 10];
            const B: P = [sx(nm), SY];
            const [x, y] = bez(A, Cc, B, s);
            const [x2, y2] = bez(A, Cc, B, Math.min(1, s + 0.01));
            const ang2 = Math.atan2(y2 - y, x2 - x);
            const vis = s > 0 && s < 1 ? Math.min(1, s * 8, (1 - s) * 8) : 0;
            const wave = Array.from({length: 25}, (_, j) => {
              const u = (j / 24 - 0.5) * 70;
              const w = 9 * Math.sin(u * 0.32 - t * 22) * Math.cos((u / 70) * Math.PI);
              return `${j ? 'L' : 'M'}${(x + u * Math.cos(ang2) - w * Math.sin(ang2)).toFixed(1)},${(y + u * Math.sin(ang2) + w * Math.cos(ang2)).toFixed(1)}`;
            }).join(' ');
            const trail = Array.from({length: 10}, (_, j) => bez(A, Cc, B, Math.max(0, s - j * 0.018)));
            return (
              <g key={nm} opacity={vis}>
                <path d={trail.map((q, j) => `${j ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ')} fill="none" stroke={nmColor(nm)} strokeWidth={3} opacity={0.3} strokeLinecap="round" />
                <circle cx={x} cy={y} r={34} fill={`url(#ti-g${nm})`} />
                <path d={wave} fill="none" stroke={nmColor(nm)} strokeWidth={3.5} strokeLinecap="round" />
              </g>
            );
          })}

          {/* ---- pita spektrum H ---- */}
          <g opacity={ramp(t, 0.6, 1.6)}>
            <rect x={SX0 - 10} y={SY - 30} width={SX1 - SX0 + 20} height={60} rx={10} fill="#04060d" stroke={C.line} strokeWidth={2} />
            {HOPS.filter((h) => h.emit).map((h, k) => {
              const nm = h.emit as number;
              const land = h.at + 0.1 + FLY;
              const q = ramp(t, land - 0.05, land + 0.35, BACK);
              if (q <= 0) return null;
              const sh = 0.85 + 0.15 * Math.sin(t * 2.6 + k * 2);
              return (
                <g key={nm}>
                  <rect x={sx(nm) - 9} y={SY - 26 * q} width={18} height={52 * q} fill={nmColor(nm)} opacity={0.25 * sh} />
                  <rect x={sx(nm) - 2.5} y={SY - 26 * q} width={5} height={52 * q} fill={nmColor(nm)} opacity={sh} />
                  <text x={sx(nm)} y={SY + 56} textAnchor="middle" fontFamily={FONT.mono} fontSize={19} fill={nmColor(nm)} opacity={Math.min(1, q)}>
                    {nm}
                  </text>
                  <Ripple x={sx(nm)} y={SY} p={ramp(t, land - 0.05, land + 1.1, (x) => x)} r={70} color={h.hue as Hue} rings={2} width={2} />
                </g>
              );
            })}
            <text x={SX0 - 26} y={SY + 7} textAnchor="end" fontFamily={FONT.head} fontWeight={700} fontSize={30} fill={C.ink} opacity={0.85}>
              H
            </text>
            <text x={SX1 + 26} y={SY + 7} textAnchor="start" fontFamily={FONT.mono} fontSize={18} fill={C.muted} opacity={0.8}>
              nm
            </text>
          </g>

          {/* ---- atom Bohr kecil (rₙ ∝ n²) ---- */}
          <g opacity={rig}>
            <Glow x={AX} y={AY} r={150} color="cyan" opacity={0.25} />
            {[1, 2, 3, 4, 5].map((n) => (
              <circle key={n} cx={AX} cy={AY} r={RB * n * n} fill="none" stroke={C.cyan} strokeWidth={1.6} strokeDasharray={n > 1 ? '4 6' : undefined} opacity={0.25 + 0.35 * Math.max(0, 1 - Math.abs(nEff - n) * 1.4)} />
            ))}
            <circle cx={AX} cy={AY} r={14} fill="url(#soft-heat)" />
            <circle cx={AX} cy={AY} r={5} fill={C.heat} />
            {HOPS.filter((h) => h.emit).map((h) => (
              <Ripple key={h.at} x={AX} y={AY} p={ramp(t, h.at, h.at + 1.2, (x) => x)} r={150} color={h.hue as Hue} rings={2} width={2} />
            ))}
            {[1, 2, 3, 4, 5].map((k) => {
              const aa = ang - k * 0.12;
              return <circle key={k} cx={AX + rr * Math.cos(aa)} cy={AY - rr * Math.sin(aa)} r={6 * (1 - k / 6)} fill={C.pot} opacity={0.35 * (1 - k / 6)} />;
            })}
            <circle cx={elx} cy={ely} r={16} fill="url(#soft-pot)" />
            <circle cx={elx} cy={ely} r={6.5} fill={C.pot} stroke="#cfe6ff" strokeWidth={1.2} />
            <text x={AX} y={AY + 140} textAnchor="middle" fontFamily={FONT.mono} fontSize={17} fill={C.cyan} opacity={0.8}>
              rₙ ∝ n²
            </text>
          </g>

          <Ripple x={960} y={470} p={(t - 0.8) / 2.2} r={760} color="work" rings={2} width={2} />
          <Twinkles x={960} y={460} rx={600} ry={90} n={7} color="work" opacity={ramp(t, 2.2, 3.0)} seed={6} />
        </Stage>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 150}}>
          <div style={{fontFamily: FONT.head, fontSize: 28, letterSpacing: 12, color: C.gold, fontWeight: 600, opacity: a}}>{BRAND.series.toUpperCase()}</div>
          <div style={{display: 'flex', marginTop: 18, alignItems: 'flex-end'}}>
            {title.split('').map((ch, i) => {
              const p = ramp(t, 0.5 + i * 0.045, 1.4 + i * 0.045, BACK);
              const hot = i >= split && i < split + HL.length;
              const k = i - split;
              // "Tangga": tiap huruf naik satu anak tangga, berdenyut seperti elektron yang melompat
              const step = hot ? -(k - 2.5) * 5 * stair : 0;
              const hop = hot ? -6 * Math.max(0, Math.sin(t * 2.4 - k * 0.6)) ** 6 * stair : 0;
              const bob = 4 * Math.sin(t * 1.3 - i * 0.4) * ramp(t, 1.8, 2.8) * (hot ? 1 - stair * 0.6 : 1);
              const col = hot ? interpolateColors(0.5 + 0.5 * Math.sin(t * 1.4 - k * 0.5), [0, 1], [C.work, C.gold]) : C.ink;
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: FONT.head,
                    fontWeight: 700,
                    fontSize: 118,
                    letterSpacing: -3,
                    whiteSpace: 'pre',
                    display: 'inline-block',
                    color: col,
                    opacity: Math.min(1, p),
                    translate: `0px ${(1 - p) * 60 + bob + step + hop}px`,
                    textShadow: hot ? `0 0 ${36 + 14 * Math.sin(t * 2 + i * 0.4)}px ${col}99` : '0 0 40px rgba(170,200,255,0.22)',
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
          <div style={{fontFamily: FONT.head, fontSize: 50, color: C.ink, fontWeight: 500, marginTop: 8, opacity: sub, translate: `0px ${(1 - sub) * 16}px`}}>{BRAND.subtitle}</div>
          <div style={{fontFamily: FONT.sans, fontSize: 26, color: C.muted, marginTop: 14, opacity: ramp(t, 2.1, 3.1)}}>{BRAND.course}</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 34,
              padding: '10px 26px 10px 14px',
              borderRadius: 999,
              border: '1.5px solid rgba(255,201,74,0.38)',
              background: 'rgba(30,22,40,0.55)',
              opacity: brand,
              translate: `0px ${(1 - brand) * 14}px`,
              boxShadow: `0 0 ${24 + 10 * Math.sin(t * 1.8)}px rgba(255,201,74,0.22)`,
            }}
          >
            <Img src={staticFile('scientian-logo.png')} style={{width: 46, height: 46, rotate: `${4 * Math.sin(t * 0.9)}deg`}} />
            <div style={{fontFamily: FONT.head, fontSize: 30, color: C.ink, fontWeight: 500, letterSpacing: 2}}>
              Explore <span style={{color: C.gold, fontWeight: 600}}>Science</span> with Yayan
            </div>
          </div>
          <div style={{fontFamily: FONT.mono, fontSize: 22, color: C.muted, marginTop: 40, opacity: ramp(t, 4.2, 5.2), letterSpacing: 3 + 2 * (1 - ramp(t, 4.2, 5.6))}}>
            elektron <span style={{color: C.work}}>turun tangga</span> → <span style={{color: nmColor(656)}}>foton</span> <span style={{color: nmColor(486)}}>ber</span>
            <span style={{color: C.pot}}>warna</span>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
