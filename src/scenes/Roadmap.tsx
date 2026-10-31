import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, ramp, rand, smoothPath, win} from '../anim';
import {DrawPath, Glow, Motes, Ripple, Spark, Stage, Stream, pointAlong} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT, type Hue} from '../theme';

// Peta video: tiga kartu bagian dengan ikon yang terus bergerak (dihitung analitik):
// (1) hamburan Rutherford: partikel alfa (jingga) pada lintasan hiperbola Coulomb, tan(θ/2) = d/(2b) —
//     makin dekat inti makin besar belokan, satu memantul balik;
// (2) atom Bohr rₙ ∝ n²: elektron turun 3 → 2 dan memancarkan foton 656 nm (merah), lalu dieksitasi lagi;
// (3) awan orbital 1s + 2p (titik sampel kerapatan) yang berputar, dengan gelombang elektron berdiri samar;
// dihubungkan oleh lintasan tempat sebutir cahaya merambat.
const PARTS = [
  {n: '1', title: 'Jejak sejarah', color: C.kin, hue: 'kin' as Hue, items: ['Model Thomson', 'Percobaan Rutherford', 'Krisis atom klasik']},
  {n: '2', title: 'Atom Bohr', color: C.work, hue: 'work' as Hue, items: ['Spektrum garis', 'Postulat Bohr', 'Tingkat energi', 'Energi ionisasi', 'Deret Balmer']},
  {n: '3', title: 'Menuju kimia kuantum', color: C.spr, hue: 'spr' as Hue, items: ['Keterbatasan Bohr', 'Gelombang elektron', 'Orbital']},
];
const KEYS = [
  ['thomson', 'rutherford', 'krisis'],
  ['spektrum', 'postulat', 'tingkat', 'ionisasi', 'balmer'],
  ['keterbatasan', 'gelombang', 'orbital'],
];
const CX = [380, 960, 1540];
const TOP = 196;
const CW = 500;
const CH = 600;
const PY = TOP + CH + 40;
const ICON_Y = TOP + 196;

const X0P = CX[0] - 200;
const X1P = CX[2] + 200;
const PTS: [number, number][] = Array.from({length: 61}, (_, i) => {
  const u = i / 60;
  const x = X0P + (X1P - X0P) * u;
  const y = PY + 9 * (1 - Math.cos(((x - CX[0]) / (CX[1] - CX[0])) * Math.PI * 2)) * (x > CX[0] && x < CX[2] ? 1 : 0.3);
  return [x, y];
});
const PTS_D = smoothPath(PTS);
const UX = CX.map((x) => (x - X0P) / (X1P - X0P));

const fr = (v: number) => ((v % 1) + 1) % 1;
const TAU = Math.PI * 2;
type P = [number, number];
const RED = '#ff2a1a';

/** Lintasan hiperbola hamburan Coulomb (tolak) relatif terhadap inti; b = parameter dampak (+ = di atas). */
const hyper = (b: number, d: number, rmax: number, box: [number, number]): P[] => {
  const s = Math.sign(b) || 1;
  const B = Math.abs(b);
  const pmax = Math.PI - 2 * Math.atan(d / (2 * B));
  const pts: P[] = [];
  for (let i = 1; i < 500; i++) {
    const ph = (pmax * i) / 500;
    const u = Math.sin(ph) / B + (d / (2 * B * B)) * (Math.cos(ph) - 1);
    if (u <= 0) continue;
    const r = 1 / u;
    if (r > rmax) continue;
    const x = -r * Math.cos(ph);
    const y = -s * r * Math.sin(ph);
    if (Math.abs(x) > box[0] || Math.abs(y) > box[1]) continue;
    pts.push([x, y]);
  }
  return pts;
};
const NX = 30; // inti relatif pusat ikon
const TRACKS = [-92, -56, -28, -11, 1.4, 11, 28, 56, 92].map((b) => hyper(b, 18, 320, [230 + NX, 104]).map(([x, y]): P => [x + NX, y]));

// awan orbital
const CLOUD: {x: number; y: number; z: number; s: number}[] = (() => {
  const out: {x: number; y: number; z: number; s: number}[] = [];
  for (let i = 0; i < 170; i++) {
    const u = (k: number) => Math.max(1e-4, rand(i * 13.1 + k * 2.7 + 1));
    if (i < 50) {
      const r = -0.5 * Math.log(u(1) * u(2) * u(3));
      const ct = 2 * u(4) - 1;
      const ph = TAU * u(5);
      const st = Math.sqrt(1 - ct * ct);
      out.push({x: r * st * Math.cos(ph), y: r * st * Math.sin(ph), z: r * ct, s: 0});
    } else {
      const r = -Math.log(u(1) * u(2) * u(3) * u(4) * u(5)) * 0.42;
      const sg = u(6) > 0.5 ? 1 : -1;
      const ct = sg * Math.cbrt(u(7));
      const ph = TAU * u(8);
      const st = Math.sqrt(1 - ct * ct);
      out.push({x: r * st * Math.cos(ph), y: r * ct, z: r * st * Math.sin(ph), s: 1});
    }
  }
  return out;
})();

const Tag: React.FC<{x: number; y: number; color: string; children: React.ReactNode}> = ({x, y, color, children}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT.mono} fontSize={20} fill={color} opacity={0.92}>
    {children}
  </text>
);

/** Ikon tiap bagian (SVG, selalu bergerak). */
const Icon: React.FC<{i: number; x: number; y: number; t: number; act: number}> = ({i, x, y, t, act}) => {
  if (i === 0) {
    // hamburan Rutherford
    return (
      <g>
        <Glow x={x + NX} y={y} r={170} color="kin" opacity={0.2 + 0.3 * act} />
        <rect x={x + NX - 3} y={y - 104} width={6} height={208} fill={C.gold} opacity={0.18} />
        {TRACKS.map((pts, k) => (
          <path key={`p${k}`} d={pts.map((q, j) => `${j ? 'L' : 'M'}${(x + q[0]).toFixed(1)},${(y + q[1]).toFixed(1)}`).join(' ')} fill="none" stroke={C.kin} strokeWidth={k === 4 ? 2.5 : 1.6} strokeDasharray="4 6" opacity={k === 4 ? 0.6 : 0.35} />
        ))}
        {TRACKS.map((pts, k) => {
          const ph = fr(t * 0.42 + rand(k * 3.3));
          const [px, py] = pointAlong(pts, ph);
          const trail = [1, 2, 3, 4].map((j) => {
            const q = pointAlong(pts, Math.max(0, ph - j * 0.025));
            return [x + q[0], y + q[1]] as P;
          });
          return <Spark key={k} x={x + px} y={y + py} r={5} color="kin" trail={trail} opacity={cyc(ph)} />;
        })}
        <circle cx={x + NX} cy={y} r={20 + 3 * Math.sin(t * 3)} fill="url(#soft-heat)" />
        <circle cx={x + NX} cy={y} r={7} fill={C.heat} />
        <circle cx={x + NX - 2} cy={y - 2} r={2.5} fill="#fff" opacity={0.7} />
        <Tag x={x + NX} y={y + 128} color={C.kin}>
          hamburan alfa
        </Tag>
      </g>
    );
  }
  if (i === 1) {
    // atom Bohr: 3 → 2 memancarkan foton merah
    const nx = x - 70;
    const P = 3.2;
    const raw = t / P;
    const cyIdx = Math.floor(raw);
    const ph = raw - cyIdx;
    const nEff = 3 - ramp(ph, 0.42, 0.5, EASE_IN_OUT) + ramp(ph, 0.86, 0.96, EASE_IN_OUT);
    const R = 12.5 * nEff * nEff;
    const w = 2.1;
    const ang = t * w;
    const ex = nx + R * Math.cos(ang);
    const ey = y - R * Math.sin(ang);
    const aE = (cyIdx + 0.46) * P * w;
    const q = (ph - 0.46) / 0.42;
    const sx = nx + 12.5 * 6.25 * Math.cos(aE);
    const sy = y - 12.5 * 6.25 * Math.sin(aE);
    const dx = Math.cos(aE);
    const dy = -Math.sin(aE);
    const dist = 30 + 190 * Math.max(0, q);
    const px = sx + dx * dist;
    const py = sy + dy * dist;
    const wave = Array.from({length: 21}, (_, j) => {
      const u = (j / 20 - 0.5) * 60;
      const amp = 8 * Math.sin(u * 0.36 - t * 20) * Math.cos((u / 60) * Math.PI);
      return `${j ? 'L' : 'M'}${(px + u * dx + amp * -dy).toFixed(1)},${(py + u * dy + amp * dx).toFixed(1)}`;
    }).join(' ');
    return (
      <g>
        <Glow x={nx} y={y} r={170} color="work" opacity={0.2 + 0.3 * act} />
        {[1, 2, 3].map((n) => (
          <circle key={n} cx={nx} cy={y} r={12.5 * n * n} fill="none" stroke={C.cyan} strokeWidth={2} strokeDasharray={n > 1 ? '5 6' : undefined} opacity={0.3 + 0.4 * Math.max(0, 1 - Math.abs(nEff - n))} />
        ))}
        <circle cx={nx} cy={y} r={18} fill="url(#soft-heat)" />
        <circle cx={nx} cy={y} r={7} fill={C.heat} />
        {[1, 2, 3, 4].map((k) => {
          const aa = ang - k * 0.13;
          return <circle key={k} cx={nx + R * Math.cos(aa)} cy={y - R * Math.sin(aa)} r={7 * (1 - k / 5)} fill={C.pot} opacity={0.3 * (1 - k / 5)} />;
        })}
        <Spark x={ex} y={ey} r={7} color="pot" />
        <Ripple x={sx} y={sy} p={(ph - 0.44) / 0.4} r={60} color="heat" rings={2} width={2} />
        {q > 0 && q < 1 ? (
          <g opacity={Math.min(1, q * 8, (1 - q) * 5)}>
            <circle cx={px} cy={py} r={26} fill="url(#soft-heat)" />
            <path d={wave} fill="none" stroke={RED} strokeWidth={3.5} strokeLinecap="round" />
          </g>
        ) : null}
        {/* tangga mini */}
        {[1, 2, 3].map((n) => {
          const yy = y - 90 + (13.6 / (n * n) / 13.6) * 180;
          return <line key={n} x1={x + 150} y1={yy} x2={x + 215} y2={yy} stroke={C.work} strokeWidth={3} opacity={0.4 + 0.5 * Math.max(0, 1 - Math.abs(nEff - n))} />;
        })}
        <circle cx={x + 182} cy={y - 90 + (1 / (nEff * nEff)) * 180} r={6} fill={C.pot} />
        <Tag x={nx} y={y + 128} color={C.work}>
          rₙ ∝ n²
        </Tag>
        <Tag x={x + 182} y={y + 128} color={C.work}>
          foton
        </Tag>
      </g>
    );
  }
  // awan orbital
  const rot = t * 0.5;
  const tilt = 0.4 + 0.1 * Math.sin(t * 0.3);
  return (
    <g>
      <Glow x={x} y={y} r={170} color="spr" opacity={0.25 + 0.3 * act} />
      <path
        d={Array.from({length: 97}, (_, j) => {
          const th = (j / 96) * TAU;
          const r = 108 + 8 * Math.sin(5 * th) * Math.cos(t * 3);
          return `${j ? 'L' : 'M'}${(x + r * Math.cos(th)).toFixed(1)},${(y - r * 0.92 * Math.sin(th)).toFixed(1)}`;
        }).join(' ')}
        fill="none"
        stroke={C.spr}
        strokeWidth={2}
        opacity={0.35}
      />
      {CLOUD.map((p, k) => {
        const x1 = p.x * Math.cos(rot) + p.z * Math.sin(rot);
        const z1 = -p.x * Math.sin(rot) + p.z * Math.cos(rot);
        const y1 = p.y * Math.cos(tilt) - z1 * Math.sin(tilt);
        const z2 = p.y * Math.sin(tilt) + z1 * Math.cos(tilt);
        const sc = p.s ? 62 : 54;
        return <circle key={k} cx={x + x1 * sc} cy={y + y1 * sc} r={2.2 + 0.9 * z2} fill={p.s ? C.spr : C.pot} opacity={(0.5 + 0.3 * z2) * (0.6 + 0.4 * Math.sin(t * 2.3 + k))} />;
      })}
      <circle cx={x} cy={y} r={5} fill={C.heat} />
      <Tag x={x} y={y + 128} color={C.spr}>
        orbital
      </Tag>
    </g>
  );
};

export const Roadmap: React.FC = () => {
  const {t, cue, dur, wordOf} = useScene();
  const head = ramp(t, 0, 0.8);
  const ps = [ramp(t, cue(1) - 0.2, cue(1) + 0.7, BACK), ramp(t, cue(2) - 0.2, cue(2) + 0.7, BACK), ramp(t, cue(3) - 0.2, cue(3) + 0.7, BACK)];
  const act = [win(t, cue(1) - 0.2, cue(2) - 0.3, 0.6, 0.8), win(t, cue(2) - 0.2, cue(3) - 0.3, 0.6, 0.8), win(t, cue(3) - 0.2, dur, 0.6, 0.8)];
  const pathP =
    UX[0] * ramp(t, 0.6, cue(1), EASE_IN_OUT) +
    (UX[1] - UX[0]) * ramp(t, cue(2) - 0.6, cue(2) + 0.6, EASE_IN_OUT) +
    (UX[2] - UX[1]) * ramp(t, cue(3) - 0.6, cue(3) + 0.6, EASE_IN_OUT) +
    (1 - UX[2]) * ramp(t, cue(3) + 0.6, cue(3) + 2.2, EASE_IN_OUT);
  const [lx, ly] = pointAlong(PTS, pathP);
  const lead: [number, number][] = [1, 2, 3, 4, 5].map((k) => pointAlong(PTS, Math.max(0, pathP - k * 0.008)));
  const loop = ramp(t, cue(3) + 1.6, cue(3) + 2.6);
  const ghost = win(t, 0.4, cue(3) + 0.6, 0.8, 0.8);
  const itemAt = (i: number, k: number) => wordOf(i + 1, KEYS[i][k]) - 0.15;
  const imp = ramp(t, wordOf(0, 'fisika') - 0.2, wordOf(0, 'atom') + 0.6);
  const three = ramp(t, wordOf(0, 'tiga') - 0.2, wordOf(0, 'tiga') + 0.6);

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', fontFamily: FONT.head, fontSize: 50, fontWeight: 700, color: C.ink, opacity: head, translate: `0px ${(1 - head) * 14}px`}}>
        Peta perjalanan: <span style={{color: C.work, opacity: 0.35 + 0.65 * imp}}>fisika atom</span> <span style={{color: C.muted, opacity: 0.35 + 0.65 * three}}>dalam tiga bagian</span>
      </div>
      <Stage>
        <Motes x={960} y={520} rx={900} ry={340} n={36} color="cyan" opacity={0.35} seed={11} />
        {/* butir cahaya warna-warni (foton) yang melayang di latar */}
        {Array.from({length: 18}, (_, k) => {
          const ph = fr(t * (0.05 + rand(k) * 0.05) + rand(k * 3.1));
          const x = 60 + rand(k * 5.3) * 1800 + 18 * Math.sin(t * 0.8 + k);
          const y = 900 - ph * 760;
          const col = [RED, '#00e5ff', '#3a4bff', C.pot, C.spr][k % 5];
          return <circle key={k} cx={x} cy={y} r={2.5 + rand(k * 2.2) * 2} fill={col} opacity={0.4 * cyc(ph) * head} />;
        })}
        {PARTS.map((p, i) => (
          <rect
            key={`gh${i}`}
            x={CX[i] - CW / 2}
            y={TOP}
            width={CW}
            height={CH}
            rx={24}
            fill="none"
            stroke={p.color}
            strokeOpacity={0.35}
            strokeWidth={2}
            strokeDasharray="10 12"
            strokeDashoffset={-t * 24}
            opacity={ghost * (1 - Math.min(1, ps[i]))}
          />
        ))}
        {PARTS.map((p, i) => (
          <Glow key={`gl${i}`} x={CX[i]} y={TOP + CH / 2} r={420} color={p.hue} opacity={0.35 * act[i]} />
        ))}
        <path d={PTS_D} fill="none" stroke={C.line} strokeWidth={4} strokeDasharray="4 12" strokeLinecap="round" opacity={head} />
        <DrawPath d={PTS_D} p={pathP} stroke="cyan" width={3} halo opacity={0.85} />
        <Spark x={lx} y={ly} r={7} color="cyan" trail={lead} opacity={(1 - loop) * ramp(t, 0.6, 1.0)} />
        <Stream pts={PTS} color="cyan" n={5} speed={0.12} r={5} jitter={2} opacity={loop} />
        {PARTS.map((p, i) => (
          <g key={i} opacity={Math.min(1, ps[i])}>
            <Ripple x={CX[i]} y={PY} p={ramp(t, cue(i + 1) - 0.1, cue(i + 1) + 1.4, (x) => x)} r={90} color={p.hue} />
            <circle cx={CX[i]} cy={PY} r={20 + 4 * Math.sin(t * 2.4 + i)} fill={`url(#soft-${p.hue})`} />
            <circle cx={CX[i]} cy={PY} r={11} fill={p.color} />
            <circle cx={CX[i]} cy={PY} r={4.5} fill="#fff" opacity={0.8} />
          </g>
        ))}
      </Stage>
      {PARTS.map((p, i) => {
        const q0 = Math.min(1, ps[i]);
        return (
          <div
            key={p.n}
            style={{
              position: 'absolute',
              left: CX[i] - CW / 2,
              top: TOP,
              width: CW,
              height: CH,
              borderRadius: 24,
              background: 'linear-gradient(160deg, rgba(22,34,72,0.94), rgba(10,16,36,0.94))',
              border: `1.5px solid ${p.color}55`,
              borderTop: `8px solid ${p.color}`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.45), 0 0 ${40 + 40 * act[i]}px ${p.color}${Math.round(0x22 + 0x30 * act[i]).toString(16).padStart(2, '0')}`,
              opacity: Math.min(1, ps[i] * 1.3) * (0.35 + 0.65 * q0),
              translate: `0px ${(1 - q0) * 40 - 6 * act[i]}px`,
              scale: String(0.9 + 0.1 * ps[i]),
              fontFamily: FONT.head,
              color: C.ink,
              padding: '22px 34px',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: `linear-gradient(105deg, transparent ${-40 + 150 * q0 - 16}%, rgba(255,230,210,0.12) ${-40 + 150 * q0}%, transparent ${-40 + 150 * q0 + 16}%)`,
              }}
            />
            <div style={{fontFamily: FONT.mono, fontSize: 22, color: p.color, letterSpacing: 4}}>BAGIAN {p.n}</div>
            <div style={{fontSize: i === 2 ? 29 : 31, fontWeight: 700, marginTop: 4, letterSpacing: -0.5, whiteSpace: 'nowrap'}}>{p.title}</div>
            <div style={{height: 212}} />
            <div>
              {p.items.map((it, k) => {
                const q = ramp(t, itemAt(i, k), itemAt(i, k) + 0.6);
                return (
                  <div key={it} style={{fontSize: 27, color: C.muted, lineHeight: i === 1 ? 1.55 : 1.7, opacity: q, translate: `${(1 - q) * 14}px 0px`, whiteSpace: 'nowrap'}}>
                    <span style={{color: p.color, marginRight: 8}}>—</span>
                    {it}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <Stage>
        {PARTS.map((_, i) => (
          <g key={i} opacity={Math.min(1, ps[i])}>
            <g transform={`translate(${CX[i]} ${ICON_Y}) scale(0.8) translate(${-CX[i]} ${-ICON_Y})`}>
              <Icon i={i} x={CX[i]} y={ICON_Y} t={t} act={act[i]} />
            </g>
          </g>
        ))}
      </Stage>
    </AbsoluteFill>
  );
};
