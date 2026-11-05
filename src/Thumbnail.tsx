import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BRAND} from './brand';
import {C, FONT} from './theme';

// Tangga energi atom H: Eₙ = −13,6 eV / n². Bagian n ≥ 2 digambar berskala (makin rapat ke atas);
// celah besar n = 1 → 2 diperpendek dengan tanda patah sumbu.
const Y0 = 280; // E = 0 (n = ∞)
const Y2 = 820; // E = −3,40 eV (n = 2)
const Y1 = 1110; // E = −13,6 eV (n = 1), setelah patahan
const yOf = (n: number) => (n === 1 ? Y1 : Y0 + ((Y2 - Y0) * 4) / (n * n));
const XL = 1730;
const XR = 2170;
const JX = 2010; // posisi lompatan 3 → 2
const RED = '#ff3b3b'; // 656 nm

const Arrowhead: React.FC<{x: number; y: number; ang: number; color: string; s?: number}> = ({x, y, ang, color, s = 1}) => (
  <path d="M -22 -14 L 6 0 L -22 14 Z" fill={color} transform={`translate(${x} ${y}) rotate(${ang}) scale(${s})`} />
);

/** Foton bergelombang dari (x0,y0) ke arah sudut ang sepanjang len. */
const photonPath = (x0: number, y0: number, ang: number, len: number) => {
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const u = (i / 120) * len;
    const w = 18 * Math.sin((u / 46) * 2 * Math.PI) * Math.min(1, u / 40, (len - u) / 40);
    pts.push(`${(x0 + u * ca - w * sa).toFixed(1)},${(y0 + u * sa + w * ca).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')}`;
};

/** Gambar mini 2K untuk YouTube/LMS. */
export const Thumbnail: React.FC = () => {
  const y2 = yOf(2);
  const y3 = yOf(3);
  const pAng = (-14 * Math.PI) / 180;
  const p0x = JX + 40;
  const p0y = (y2 + y3) / 2;
  const pLen = 380;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 30% 40%, #20305e 0%, ${C.bg} 70%)`, fontFamily: FONT.head}}>
      <svg width={2560} height={1440} style={{position: 'absolute', inset: 0}}>
        <circle cx={JX + 120} cy={(y2 + y3) / 2} r={300} fill={RED} opacity={0.07} />
        {/* patahan sumbu energi antara n = 1 dan n = 2 */}
        <line x1={XL - 0} y1={Y2 + 70} x2={XL} y2={Y1 - 70} stroke={C.muted} strokeWidth={4} strokeDasharray="4 14" strokeLinecap="round" />
        {[Y2 + 150, Y2 + 180].map((y) => (
          <path key={y} d={`M ${XL - 30} ${y + 12} L ${XL + 30} ${y - 12}`} stroke={C.muted} strokeWidth={5} />
        ))}
        {/* batas ionisasi */}
        <line x1={XL} y1={Y0} x2={XR} y2={Y0} stroke={C.gold} strokeWidth={4} strokeDasharray="16 12" opacity={0.8} />
        <text x={XL - 24} y={Y0 + 14} textAnchor="end" fontFamily={FONT.mono} fontSize={38} fill={C.gold}>
          n = ∞
        </text>
        <text x={XR + 20} y={Y0 + 14} fontFamily={FONT.mono} fontSize={34} fill={C.gold}>
          0 eV
        </text>
        {/* tingkat energi */}
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <line key={n} x1={XL} y1={yOf(n)} x2={XR} y2={yOf(n)} stroke={C.work} strokeWidth={n <= 3 ? 8 : 5} strokeLinecap="round" opacity={n <= 3 ? 1 : 0.7} />
        ))}
        {[1, 2, 3].map((n) => (
          <text key={n} x={XL - 24} y={yOf(n) + 14} textAnchor="end" fontFamily={FONT.mono} fontSize={40} fill={C.ink}>
            n = {n}
          </text>
        ))}
        {[
          [1, '−13,6 eV'],
          [2, '−3,40 eV'],
          [3, '−1,51 eV'],
        ].map(([n, t]) => (
          <text key={n} x={XL + 10} y={yOf(n as number) + 48} fontFamily={FONT.mono} fontSize={34} fill={C.muted}>
            {t}
          </text>
        ))}
        {/* lompatan 3 → 2 */}
        <line x1={JX} y1={y3 + 6} x2={JX} y2={y2 - 26} stroke="#ffffff" strokeWidth={6} />
        <Arrowhead x={JX} y={y2 - 14} ang={90} color="#ffffff" />
        <circle cx={JX} cy={y2} r={22} fill={C.pot} stroke="#ffffff" strokeWidth={4} />
        <circle cx={JX} cy={y3} r={16} fill="none" stroke={C.pot} strokeWidth={4} strokeDasharray="6 6" opacity={0.8} />
        {/* foton merah 656 nm */}
        <path d={photonPath(p0x, p0y, pAng, pLen)} fill="none" stroke={RED} strokeWidth={7} strokeLinecap="round" />
        <Arrowhead x={p0x + (pLen + 10) * Math.cos(pAng)} y={p0y + (pLen + 10) * Math.sin(pAng)} ang={-14} color={RED} s={1.2} />
        <text x={p0x + 230} y={p0y + 70} textAnchor="middle" fontFamily={FONT.head} fontWeight={700} fontSize={58} fill={RED}>
          656 nm
        </text>
        <text x={(XL + XR) / 2} y={1265} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={60} fill={C.ink}>
          Eₙ = −13,6 eV / n²
        </text>
      </svg>
      <div style={{position: 'absolute', left: 140, top: 180, color: C.gold, fontSize: 54, letterSpacing: 10, fontWeight: 600}}>{BRAND.series.toUpperCase()}</div>
      <div style={{position: 'absolute', left: 130, top: 280, color: C.ink, fontSize: 190, fontWeight: 700, lineHeight: 0.98, letterSpacing: -6}}>
        Tangga di
        <br />
        <span style={{color: C.work}}>Dalam Atom</span>
      </div>
      <div style={{position: 'absolute', left: 140, top: 760, color: C.muted, fontSize: 70, fontWeight: 500}}>{BRAND.subtitle}</div>
      <div style={{position: 'absolute', left: 140, bottom: 140, color: C.ink, fontSize: 44, letterSpacing: 8, fontWeight: 600}}>
        {BRAND.channel} <span style={{color: C.muted, letterSpacing: 2, fontWeight: 400}}>· {BRAND.tagline}</span>
      </div>
    </AbsoluteFill>
  );
};
