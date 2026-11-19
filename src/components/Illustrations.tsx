/** Özgün, kodla çizilmiş sahne resimleri (açılış hikâyesi ve ana ekran). */

const PAL = ['#e33b45', '#f28a1c', '#f6d23a', '#4cb944', '#3b8cf0', '#b858cf', '#ff9ccb'];

function MiniBottle({
  x,
  y,
  s = 1,
  fill,
  level = 0.6,
}: {
  x: number;
  y: number;
  s?: number;
  fill: string;
  level?: number;
}) {
  const h = 44 * s;
  const w = 20 * s;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={`M${w * 0.3} 0h${w * 0.4}v${h * 0.18}l${w * 0.3} ${h * 0.14}v${h * 0.62}a${w * 0.2} ${w * 0.2} 0 0 1-${w * 0.2} ${w * 0.2}h-${w * 0.6}a${w * 0.2} ${w * 0.2} 0 0 1-${w * 0.2}-${w * 0.2}v-${h * 0.62}l${w * 0.3}-${h * 0.14}Z`}
        fill="#241f1d"
        stroke="#1b120b"
        strokeWidth={1.6}
      />
      <rect
        x={w * 0.08}
        y={h * (1 - level * 0.62)}
        width={w * 0.84}
        height={h * level * 0.62 - 2}
        rx={w * 0.12}
        fill={fill}
      />
      <path
        d={`M${w * 0.22} ${h * 0.4}v${h * 0.4}`}
        stroke="#fff"
        strokeOpacity="0.35"
        strokeWidth={1.6 * s}
        strokeLinecap="round"
      />
    </g>
  );
}

export function ShopIllustration() {
  return (
    <svg
      viewBox="0 0 320 170"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
    >
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe1c0" />
          <stop offset="1" stopColor="#e3cfa4" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.35" r="0.6">
          <stop offset="0" stopColor="#fff6d6" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff6d6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="320" height="170" rx="18" fill="url(#wall)" />
      <rect x="0" y="0" width="320" height="170" rx="18" fill="url(#glow)" />
      {/* Kemerli pencere */}
      <path d="M128 92V52a32 32 0 0 1 64 0v40Z" fill="#cfe3ea" stroke="#6b4226" strokeWidth="4" />
      <path d="M160 20v72M128 60h64" stroke="#6b4226" strokeWidth="3" />
      {/* Raflar */}
      {[72, 128].map((y) => (
        <rect key={y} x="14" y={y} width="292" height="8" rx="3" fill="#6b4226" />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <MiniBottle
          key={`a${i}`}
          x={22 + i * 17}
          y={28}
          fill={PAL[i % PAL.length]!}
          level={0.4 + (i % 3) * 0.2}
        />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <MiniBottle
          key={`b${i}`}
          x={210 + i * 18}
          y={28}
          fill={PAL[(i + 3) % PAL.length]!}
          level={0.5 + (i % 2) * 0.3}
        />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <MiniBottle
          key={`c${i}`}
          x={24 + i * 36}
          y={84}
          s={1}
          fill={PAL[(i + 1) % PAL.length]!}
          level={0.35 + ((i * 3) % 5) * 0.12}
        />
      ))}
      {/* Tezgâh ve defter */}
      <rect x="10" y="140" width="300" height="24" rx="6" fill="#8a5a33" />
      <rect x="10" y="140" width="300" height="6" rx="3" fill="#a8743f" />
      <g transform="translate(132 122) rotate(-6)">
        <rect width="58" height="20" rx="3" fill="#5a2e1a" />
        <rect x="4" y="3" width="50" height="14" rx="2" fill="#f4ead3" />
        <path d="M29 3v14" stroke="#5a2e1a" strokeWidth="2" />
      </g>
      <circle cx="262" cy="130" r="9" fill="#e5b343" stroke="#9a6a1c" strokeWidth="2.5" />
    </svg>
  );
}

export function StoryIllustration({ page }: { page: number }) {
  return (
    <svg
      viewBox="0 0 320 200"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
    >
      <rect width="320" height="200" rx="20" fill="#efe1c0" />
      {page === 0 && (
        <g>
          {/* Mektup ve mühür */}
          <g transform="translate(70 40) rotate(-4)">
            <rect width="180" height="120" rx="6" fill="#fbf6ea" stroke="#9a6a1c" strokeWidth="3" />
            <path d="M0 0 90 64 180 0" fill="none" stroke="#9a6a1c" strokeWidth="3" />
            <circle cx="90" cy="70" r="16" fill="#8e2a1c" />
            <path d="M84 66l6 8 6-8" stroke="#f4c9a0" strokeWidth="3" fill="none" />
          </g>
          <path
            d="M40 170h240"
            stroke="#c9b07e"
            strokeWidth="3"
            strokeDasharray="2 8"
            strokeLinecap="round"
          />
        </g>
      )}
      {page === 1 && (
        <g>
          {/* Dükkân kapısı, yokuş */}
          <path d="M0 200 320 150V200Z" fill="#c9a877" />
          <rect x="96" y="40" width="128" height="140" rx="6" fill="#6b4226" />
          <path d="M108 180V70a52 52 0 0 1 104 0v110Z" fill="#3d2414" />
          <path d="M160 32v0" />
          <rect x="112" y="16" width="96" height="26" rx="4" fill="#9a6a1c" />
          <text x="160" y="34" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fbf6ea">
            SİMYACI
          </text>
          <circle cx="196" cy="128" r="5" fill="#e5b343" />
          {[0, 1, 2].map((i) => (
            <MiniBottle key={i} x={128 + i * 22} y={86} fill={PAL[i * 2]!} level={0.6} />
          ))}
        </g>
      )}
      {page === 2 && (
        <g>
          {/* Açık defter */}
          <path
            d="M40 50c40-12 80-8 120 8 40-16 80-20 120-8v120c-40-12-80-8-120 8-40-16-80-20-120-8Z"
            fill="#fbf6ea"
            stroke="#6b4226"
            strokeWidth="3"
          />
          <path d="M160 58v120" stroke="#6b4226" strokeWidth="3" />
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M58 ${76 + i * 18}h${70 - (i % 2) * 18}`}
              stroke="#8f7b62"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="6 5"
            />
          ))}
          <text x="230" y="110" textAnchor="middle" fontSize="15" fontStyle="italic" fill="#2a1a0e">
            Kimsenin
          </text>
          <text x="230" y="130" textAnchor="middle" fontSize="15" fontStyle="italic" fill="#2a1a0e">
            görmediği renk…
          </text>
        </g>
      )}
      {page === 3 && (
        <g>
          <rect x="20" y="132" width="280" height="10" rx="4" fill="#6b4226" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <MiniBottle
              key={i}
              x={36 + i * 44}
              y={60}
              s={1.6}
              fill={PAL[(i * 3) % PAL.length]!}
              level={0.3 + (i % 3) * 0.25}
            />
          ))}
          <circle cx="270" cy="40" r="18" fill="#f6d23a" opacity="0.6" />
        </g>
      )}
    </svg>
  );
}
