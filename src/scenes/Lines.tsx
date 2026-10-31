import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp} from '../anim';
import {Badge, Formula, Frac, Glow, Label, Motes, Note, Ripple, Stage, Stream, Sup, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Spektrum garis hidrogen (AUDIT, NIST): Hα 656,3 ("656 nm"), 486, 434, 410 nm; Balmer 1885.
// Rumus Balmer λ = B·n²/(n² − 4), B = 364,6 nm → n = 3: 656,3; 4: 486,1; 5: 434,0; 6: 410,2 nm.
// Prisma: ungu dibelokkan paling kuat (jatuh paling dekat), merah paling lemah (paling jauh) → sumbu λ naik ke kanan.

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

const B = 364.6;
const H = [
  {n: 3, nm: 656, word: 'merah', k: 0},
  {n: 4, nm: 486, word: 'hijau', k: 0},
  {n: 5, nm: 434, word: 'biru', k: 1},
  {n: 6, nm: 410, word: 'ungu', k: 0},
];

// layar spektrum (horizontal) & sumbu λ
const LX0 = 1040;
const LX1 = 1760;
const lx = (nm: number) => LX0 + ((nm - 380) / 320) * (LX1 - LX0);
const SCY = 640;
const SCH = 70;

// tabung & prisma
const TX0 = 170;
const TX1 = 560;
const TY = 360;
const PRX = 820;
const PRY = 380;
const EXIT: [number, number] = [PRX + 34, PRY + 8];

export const Lines: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  const appOn = ramp(t, -0.3, 0.9) * (1 - ramp(t, cue(3) - 0.2, cue(3) + 0.9, EASE_IN_OUT));
  const powerOn = ramp(t, wordOf(0, 'arus') - 0.3, wordOf(0, 'arus') + 0.5);
  const glowP = ramp(t, wordOf(0, 'hidrogen') - 0.4, wordOf(0, 'hidrogen') + 0.6);
  const flick = 0.82 + 0.1 * Math.sin(t * 9.3) + 0.08 * Math.sin(t * 23.7 + 1);
  const beamOn = ramp(t, wordOf(0, 'uraikan') - 0.4, wordOf(0, 'uraikan') + 0.4) * appOn;
  const raysOn = ramp(t, wordOf(0, 'prisma') - 0.2, wordOf(0, 'prisma') + 0.8) * appOn;
  const screenOn = ramp(t, wordOf(0, 'prisma') - 0.1, wordOf(0, 'prisma') + 0.7);
  const ghost = slot(t, cue(1) - 0.2, wordOf(1, 'garis') + 0.4, 0.6, 0.7);
  const lineP = H.map((h) => ramp(t, wordOf(1, h.word, h.k) - 0.35, wordOf(1, h.word, h.k) + 0.25));
  // sebelum baris 1 sinar sudah menyala redup (tanpa warna terurai di layar)
  const hAlpha = slot(t, cue(2) - 0.1, cue(3) + 0.5);
  const zoom = ramp(t, cue(2) - 0.2, cue(2) + 1.0, EASE_IN_OUT) * (1 - ramp(t, cue(3) - 0.3, cue(3) + 0.8, EASE_IN_OUT));
  const balmerOn = ramp(t, cue(3) + 0.1, cue(3) + 1.0);
  const formP = slot(t, wordOf(3, 'menemukan') - 0.2, wordOf(3, 'tidak') - 0.2, 0.6, 0.5);
  const nLbl = ramp(t, wordOf(3, 'rumus') - 0.2, wordOf(3, 'rumus') + 0.8);
  const whyP = ramp(t, wordOf(3, 'tidak') - 0.3, wordOf(3, 'tidak') + 0.4);

  // kamera: dorong ke garis merah saat Hα
  const cs = 1 + 0.06 * zoom;
  const cx = 1080;
  const cy = 560;

  // tabung lucutan
  const tubeCol = '#e88cff';
  const tubeCore = '#ff9ee8';

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <linearGradient id="ln-tube" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd2f6" stopOpacity="0.9" />
            <stop offset="45%" stopColor={tubeCore} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#8a3fd0" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="ln-prism" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d8ecff" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#6aa8e8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2a4f8a" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="ln-rainbow" x1="0" y1="0" x2="1" y2="0">
            {[380, 410, 440, 470, 490, 510, 540, 570, 590, 620, 645, 680, 700].map((nm) => (
              <stop key={nm} offset={`${((nm - 380) / 320) * 100}%`} stopColor={nmRGB(nm)} />
            ))}
          </linearGradient>
          <radialGradient id="ln-pink">
            <stop offset="0%" stopColor={tubeCol} stopOpacity="0.6" />
            <stop offset="45%" stopColor={tubeCol} stopOpacity="0.18" />
            <stop offset="100%" stopColor={tubeCol} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g transform={`translate(${cx},${cy}) scale(${cs}) translate(${-cx},${-cy})`}>
          {/* ============ tabung lucutan + catu daya ============ */}
          <g opacity={appOn}>
            <ellipse cx={(TX0 + TX1) / 2} cy={TY} rx={300} ry={140} fill="url(#ln-pink)" opacity={glowP * flick} />
            {/* kabel ke catu daya */}
            <g opacity={powerOn}>
              <path d={`M${TX0 - 18},${TY} L${TX0 - 50},${TY} L${TX0 - 50},${TY + 200} L${(TX0 + TX1) / 2 - 40},${TY + 200}`} fill="none" stroke={C.muted} strokeWidth={3} />
              <path d={`M${TX1 + 18},${TY} L${TX1 + 50},${TY} L${TX1 + 50},${TY + 200} L${(TX0 + TX1) / 2 + 40},${TY + 200}`} fill="none" stroke={C.muted} strokeWidth={3} />
              <rect x={(TX0 + TX1) / 2 - 40} y={TY + 172} width={80} height={56} rx={10} fill="#162452" stroke={C.force} strokeWidth={2.5} />
              <path d={`M${(TX0 + TX1) / 2 - 8},${TY + 182} L${(TX0 + TX1) / 2 - 18},${TY + 202} L${(TX0 + TX1) / 2 + 2},${TY + 200} L${(TX0 + TX1) / 2 - 6},${TY + 220}`} fill="none" stroke={C.force} strokeWidth={3} strokeLinejoin="round" />
              <Label x={(TX0 + TX1) / 2} y={TY + 262} size={24} color={C.muted}>
                tegangan tinggi
              </Label>
              <Stream pts={[[TX1 + 50, TY + 200], [TX1 + 50, TY], [TX1 + 18, TY]]} color="pot" n={5} speed={0.7} r={3.5} jitter={0} />
            </g>
            {/* elektroda */}
            <rect x={TX0 - 22} y={TY - 22} width={24} height={44} rx={4} fill="#59627f" />
            <rect x={TX1 - 2} y={TY - 22} width={24} height={44} rx={4} fill="#59627f" />
            {/* kaca */}
            <rect x={TX0} y={TY - 30} width={TX1 - TX0} height={60} rx={30} fill="rgba(160,190,255,0.08)" stroke="#a9bce8" strokeWidth={2.5} />
            <rect x={TX0 + 8} y={TY - 18} width={TX1 - TX0 - 16} height={36} rx={18} fill="url(#ln-tube)" opacity={glowP * flick} />
            <rect x={TX0 + 26} y={TY - 25} width={TX1 - TX0 - 52} height={5} rx={2.5} fill="#fff" opacity={0.35} />
            {/* elektron bergerak dalam gas */}
            <Stream pts={[[TX0 + 10, TY], [TX1 - 10, TY]]} color="pot" n={12} speed={0.55} r={3.2} jitter={9} opacity={glowP} />
            <Label x={(TX0 + TX1) / 2} y={TY - 78} size={28} color={tubeCol} opacity={glowP}>
              gas hidrogen, tekanan rendah
            </Label>
          </g>

          {/* ============ berkas cahaya → prisma → layar ============ */}
          <g opacity={beamOn}>
            <rect x={TX1 + 60} y={TY - 3} width={PRX - 40 - TX1 - 60} height={6} rx={3} fill="#ffe8fb" opacity={0.25 + 0.1 * flick} />
            <rect x={PRX - 74} y={TY - 40} width={8} height={30} fill="#59627f" />
            <rect x={PRX - 74} y={TY + 10} width={8} height={30} fill="#59627f" />
            <Stream pts={[[TX1 + 60, TY], [PRX - 30, TY + 4]]} color="press" n={8} speed={0.9} r={3.6} jitter={0} />
          </g>
          <g opacity={appOn * ramp(t, wordOf(0, 'prisma') - 0.5, wordOf(0, 'prisma') + 0.2)}>
            <path d={`M${PRX},${PRY - 90} L${PRX + 80},${PRY + 60} L${PRX - 80},${PRY + 60} Z`} fill="url(#ln-prism)" stroke="#cfe2ff" strokeWidth={2.5} strokeLinejoin="round" />
            <path d={`M${PRX - 6},${PRY - 70} L${PRX - 52},${PRY + 44}`} stroke="#fff" strokeWidth={3} opacity={0.3} strokeLinecap="round" />
            <Label x={PRX} y={PRY + 96} size={26} color={C.muted}>
              prisma
            </Label>
          </g>
          {/* sinar terurai */}
          {H.map((h, i) => {
            const end: [number, number] = [lx(h.nm), SCY - SCH / 2];
            const op = raysOn * mix(0.25, 1, lineP[i]);
            return (
              <g key={h.nm} opacity={op}>
                <line x1={EXIT[0]} y1={EXIT[1]} x2={end[0]} y2={end[1]} stroke={nmRGB(h.nm)} strokeWidth={10} opacity={0.12} />
                <line x1={EXIT[0]} y1={EXIT[1]} x2={end[0]} y2={end[1]} stroke={nmRGB(h.nm)} strokeWidth={2.5} opacity={0.75} />
                <Stream pts={[EXIT, end]} color="white" n={5} speed={0.6} r={2.6} jitter={0} seed={i} opacity={0.7 * lineP[i]} />
              </g>
            );
          })}

          {/* ============ layar spektrum ============ */}
          <g opacity={screenOn}>
            <rect x={LX0 - 20} y={SCY - SCH / 2 - 10} width={LX1 - LX0 + 40} height={SCH + 20} rx={12} fill="#0b1228" stroke={C.line} strokeWidth={2} />
            <rect x={LX0} y={SCY - SCH / 2} width={LX1 - LX0} height={SCH} rx={6} fill="#04060d" />
            {/* "pelangi utuh?" yang diharapkan */}
            <g opacity={ghost * 0.55}>
              <rect x={LX0} y={SCY - SCH / 2} width={LX1 - LX0} height={SCH} rx={6} fill="url(#ln-rainbow)" />
            </g>
            {H.map((h, i) => {
              const x = lx(h.nm);
              const fl = 0.86 + 0.14 * Math.sin(t * 3.7 + i * 1.9);
              const p = lineP[i];
              const big = h.nm === 656 ? hAlpha : 0;
              return (
                <g key={h.nm} opacity={p}>
                  <rect x={x - 16} y={SCY - SCH / 2} width={32} height={SCH} fill={nmRGB(h.nm)} opacity={0.2 * fl + 0.15 * big} />
                  <rect x={x - 3.5} y={SCY - SCH / 2} width={7} height={SCH} fill={nmRGB(h.nm)} opacity={fl} />
                  <rect x={x - 1.2} y={SCY - SCH / 2} width={2.4} height={SCH} fill="#fff" opacity={0.55 * fl} />
                  <Ripple x={x} y={SCY} p={ramp(t, wordOf(1, h.word, h.k) - 0.2, wordOf(1, h.word, h.k) + 1.0, (q) => q)} r={70} color={h.nm > 600 ? 'heat' : h.nm > 470 ? 'cyan' : h.nm > 420 ? 'pot' : 'spr'} rings={2} />
                  <Label x={x} y={SCY - SCH / 2 - 30} size={23} font="mono" color={nmRGB(h.nm)} weight={600}>
                    {h.nm}
                  </Label>
                </g>
              );
            })}
            {/* sumbu λ */}
            <line x1={LX0} y1={SCY + SCH / 2 + 22} x2={LX1} y2={SCY + SCH / 2 + 22} stroke={C.muted} strokeWidth={2} opacity={0.7} />
            {[400, 500, 600, 700].map((nm) => (
              <g key={nm}>
                <line x1={lx(nm)} y1={SCY + SCH / 2 + 16} x2={lx(nm)} y2={SCY + SCH / 2 + 28} stroke={C.muted} strokeWidth={2} />
                <Label x={lx(nm)} y={SCY + SCH / 2 + 48} size={21} font="mono" color={C.muted}>
                  {nm}
                </Label>
              </g>
            ))}
            <Label x={LX1 + 6} y={SCY + SCH / 2 + 80} size={21} anchor="end" font="mono" color={C.faint}>
              λ (nm)
            </Label>
            <Label x={(LX0 + LX1) / 2} y={SCY - SCH / 2 - 76} size={28} color={C.muted} opacity={ghost}>
              pelangi utuh?
            </Label>
            {/* n tiap garis (Balmer) */}
            <g opacity={nLbl}>
              {H.map((h, i) => (
                <Label key={h.n} x={lx(h.nm)} y={SCY + SCH / 2 + 118 + (h.n === 6 ? 0 : 0)} size={22} font="mono" color={C.gold} opacity={ramp(t, wordOf(3, 'rumus') + i * 0.18 - 0.2, wordOf(3, 'rumus') + i * 0.18 + 0.4)}>
                  {`n=${h.n}`}
                </Label>
              ))}
            </g>
          </g>
          {/* sorotan Hα */}
          <g opacity={hAlpha}>
            <Twinkles x={lx(656)} y={SCY} rx={50} ry={60} n={5} color="heat" seed={2} />
            <Glow x={lx(656)} y={SCY} r={90} color="heat" opacity={0.7} />
          </g>
        </g>

        {/* ============ Johann Balmer ============ */}
        <g opacity={balmerOn}>
          <Motes x={330} y={420} rx={190} ry={170} n={18} color="gold" opacity={0.4} seed={7} />
          <circle cx={330} cy={410} r={128} fill="#0f1a3a" stroke={C.gold} strokeWidth={3} />
          <circle cx={330} cy={410} r={128} fill="none" stroke={C.gold} strokeWidth={8} opacity={0.15 + 0.1 * Math.sin(t * 1.6)} />
          {/* siluet: kepala, janggut, bahu */}
          <g transform={`translate(330,${414 + 2 * Math.sin(t * 1.1)})`}>
            <path d="M-92,104 C-86,52 -50,34 0,34 C50,34 86,52 92,104 Z" fill="#26375f" />
            <path d="M-20,34 L0,62 L20,34 Z" fill="#e8ecf5" opacity={0.85} />
            <ellipse cx={0} cy={-26} rx={40} ry={48} fill="#c9a98a" />
            <path d="M-38,-12 C-36,30 -16,46 0,46 C16,46 36,30 38,-12 C28,6 14,10 0,10 C-14,10 -28,6 -38,-12 Z" fill="#d8d6d2" />
            <path d="M-40,-40 C-38,-74 38,-74 40,-40 C30,-58 -30,-58 -40,-40 Z" fill="#b9b6b0" />
            <circle cx={-14} cy={-28} r={4} fill="#2a2a35" />
            <circle cx={14} cy={-28} r={4} fill="#2a2a35" />
          </g>
          <Label x={330} y={580} size={36} weight={600} color={C.ink}>
            Johann Balmer
          </Label>
          <Label x={330} y={624} size={30} font="mono" color={C.gold}>
            1885
          </Label>
        </g>
        {/* tanda tanya yang melayang */}
        <g opacity={whyP}>
          {[0, 1, 2].map((k) => {
            const ph = (t * 0.35 + k / 3) % 1;
            return (
              <text
                key={k}
                x={520 + k * 60 + 10 * Math.sin(t + k)}
                y={330 - ph * 120}
                fontFamily={FONT.head}
                fontWeight={700}
                fontSize={44 + 10 * k}
                fill={C.gold}
                opacity={cyc(ph) * 0.8}
                textAnchor="middle"
              >
                ?
              </text>
            );
          })}
        </g>
      </Stage>

      {/* HTML */}
      <Badge x={lx(656) - 120} y={SCY - 190} text={<span>H<sub style={{fontSize: '0.65em', verticalAlign: '-0.25em'}}>α</sub> = 656 nm</span>} color={C.heat} opacity={hAlpha} size={40} scale={0.92 + 0.08 * hAlpha + 0.02 * Math.sin(t * 2.4)} />
      <Formula x={680} y={800} p={formP} accent={C.gold} size={58} caption={`B = ${String(B).replace('.', ',')} nm  ·  n = 3, 4, 5, 6, …`}>
        <V>λ</V> = <V>B</V> · <Frac n={<span><V>n</V><Sup>2</Sup></span>} d={<span><V>n</V><Sup>2</Sup> − 4</span>} />
      </Formula>
      <Note x={680} y={800} p={whyP} color={C.gold} size={36}>
        rumus sederhana… tapi <span style={{color: C.gold}}>mengapa?</span>
      </Note>
    </AbsoluteFill>
  );
};
