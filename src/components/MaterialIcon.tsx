/** Malzeme simgeleri: her madde için kodla çizilmiş küçük bir amblem (SVG). */
import { MATERIAL_BY_ID } from '../alchemy/recipes';

type Glyph = (c: string) => React.ReactElement;

const G: Record<string, Glyph> = {
  su: (c) => <path d="M24 8c-6 9-11 15-11 21a11 11 0 0 0 22 0c0-6-5-12-11-21Z" fill={c} />,
  ates: (c) => (
    <path d="M24 6c2 7 9 10 9 19a9 9 0 0 1-18 0c0-5 3-8 5-11 1 4 3 5 4 5-1-5 0-9 0-13Z" fill={c} />
  ),
  toprak: (c) => (
    <>
      <path d="M8 34 18 18l6 8 5-6 11 14Z" fill={c} />
      <rect x="6" y="34" width="36" height="5" rx="2" fill={c} opacity="0.7" />
    </>
  ),
  hava: (c) => (
    <path
      d="M8 18h20a5 5 0 1 0-5-5M8 26h28a5 5 0 1 1-5 5M8 34h14"
      fill="none"
      stroke={c}
      strokeWidth="3.4"
      strokeLinecap="round"
    />
  ),
  tuz: (c) => (
    <>
      <circle cx="24" cy="24" r="13" fill="none" stroke={c} strokeWidth="3.4" />
      <path d="M11 24h26" stroke={c} strokeWidth="3.4" />
    </>
  ),
  civa: (c) => (
    <>
      <circle cx="24" cy="23" r="8" fill="none" stroke={c} strokeWidth="3.2" />
      <path
        d="M16 9a8 6 0 0 0 16 0M24 31v10M19 37h10"
        fill="none"
        stroke={c}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </>
  ),
  buhar: (c) => (
    <path
      d="M16 38c-4-4 4-8 0-12s4-8 0-12M24 38c-4-4 4-8 0-12s4-8 0-12M32 38c-4-4 4-8 0-12s4-8 0-12"
      fill="none"
      stroke={c}
      strokeWidth="3.2"
      strokeLinecap="round"
    />
  ),
  camur: (c) => <path d="M7 30c5-6 9-2 13-5s7-8 12-4 6 7 9 9v6H7Z" fill={c} />,
  lav: (c) => (
    <>
      <path d="M6 38 18 12h12l12 26Z" fill="#5a3a2a" />
      <path d="M20 12h8l-2 9 4 7-6 10-3-9 3-7Z" fill={c} />
    </>
  ),
  kum: (c) => (
    <>
      {[
        [14, 32],
        [20, 26],
        [26, 32],
        [32, 26],
        [24, 20],
        [17, 38],
        [30, 38],
        [36, 33],
        [11, 38],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.6" fill={c} />
      ))}
    </>
  ),
  kivilcim: (c) => (
    <path
      d="M24 6l3 12 12 3-12 3-3 12-3-12-12-3 12-3Z M36 8l1 4 4 1-4 1-1 4-1-4-4-1 4-1Z"
      fill={c}
    />
  ),
  sis: (c) => (
    <path
      d="M8 17h24M14 24h26M8 31h26M16 38h18"
      fill="none"
      stroke={c}
      strokeWidth="3.6"
      strokeLinecap="round"
    />
  ),
  tas: (c) => <path d="M10 34l4-14 10-6 12 5 4 15-10 5H18Z" fill={c} />,
  tugla: (c) => (
    <>
      <rect x="7" y="14" width="34" height="20" rx="2" fill={c} />
      <path d="M7 24h34M18 14v10M30 24v10" stroke="#f4ead3" strokeWidth="2" />
    </>
  ),
  cam: (c) => (
    <>
      <rect
        x="11"
        y="9"
        width="26"
        height="30"
        rx="3"
        fill={c}
        opacity="0.55"
        stroke={c}
        strokeWidth="3"
      />
      <path d="M16 14l-1 14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
    </>
  ),
  kurum: (c) => (
    <>
      <circle cx="18" cy="28" r="7" fill={c} />
      <circle cx="28" cy="22" r="8" fill={c} />
      <circle cx="31" cy="32" r="6" fill={c} />
    </>
  ),
  billur: (c) => (
    <path d="M24 6l10 12-10 24-10-24Z M14 18h20" fill={c} stroke="#f4ead3" strokeWidth="1.6" />
  ),
  murekkep: (c) => (
    <>
      <path d="M14 22h20v14a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4Z" fill={c} />
      <rect x="19" y="14" width="10" height="8" rx="2" fill={c} />
      <path d="M33 6 22 26" stroke="#5a4330" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  bulut: (c) => <path d="M14 34a7 7 0 0 1 0-14 10 10 0 0 1 19-2 8 8 0 0 1 1 16Z" fill={c} />,
  isik: (c) => (
    <>
      <circle cx="24" cy="24" r="8" fill={c} />
      <path
        d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4"
        stroke={c}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  ),
  gokkusagi: () => (
    <>
      {['#e33b45', '#f28a1c', '#f6d23a', '#4cb944', '#3b8cf0', '#b858cf'].map((col, i) => (
        <path
          key={col}
          d={`M${6 + i * 2.6} 38a${18 - i * 2.6} ${18 - i * 2.6} 0 0 1 ${36 - i * 5.2} 0`}
          fill="none"
          stroke={col}
          strokeWidth="2.6"
        />
      ))}
    </>
  ),
  mercek: (c) => (
    <>
      <ellipse cx="24" cy="24" rx="9" ry="16" fill={c} opacity="0.6" stroke={c} strokeWidth="3" />
      <path d="M21 14v8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  prizma: (c) => (
    <>
      <path d="M24 8 40 36H8Z" fill={c} opacity="0.8" />
      <path d="M2 24l16 2" stroke="#fffbe8" strokeWidth="2.4" />
      {['#e33b45', '#f6d23a', '#3b8cf0'].map((col, i) => (
        <path key={col} d={`M30 ${25 + i * 2}l16 ${i * 4 - 2}`} stroke={col} strokeWidth="2.4" />
      ))}
    </>
  ),
  ayna: (c) => (
    <>
      <ellipse cx="24" cy="20" rx="12" ry="14" fill={c} stroke="#9a6a1c" strokeWidth="3" />
      <path d="M18 12l-3 10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
      <path d="M24 34v8M18 42h12" stroke="#9a6a1c" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  'kayip-renk': () => (
    <>
      <circle cx="24" cy="24" r="14" fill="#2a1a0e" />
      <circle
        cx="24"
        cy="24"
        r="14"
        fill="none"
        stroke="#d9a441"
        strokeWidth="2"
        strokeDasharray="3 4"
      />
      <text
        x="24"
        y="25"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="18"
        fontWeight="700"
        fill="#d9a441"
      >
        ?
      </text>
    </>
  ),
};

export function MaterialIcon({
  id,
  size = 48,
  unknown = false,
}: {
  id: string;
  size?: number;
  unknown?: boolean;
}) {
  const tint = MATERIAL_BY_ID.get(id)?.tint ?? '#6b4226';
  const glyph = unknown ? null : G[id];
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      className="material-icon"
    >
      <circle
        cx="24"
        cy="24"
        r="23"
        fill={unknown ? '#d9c9a6' : '#fbf6ea'}
        stroke={unknown ? '#8f7b62' : '#9a6a1c'}
        strokeWidth="2"
      />
      {glyph ? (
        glyph(tint)
      ) : (
        <text
          x="24"
          y="25"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="24"
          fontWeight="700"
          fill="#5a4330"
        >
          ?
        </text>
      )}
    </svg>
  );
}
