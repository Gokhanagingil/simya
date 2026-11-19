/**
 * Şişe çizimi (SVG). Koyu, ışığı yakalayan cam: sıvılar camın içinde ≥ 3:1 kontrastla parlar,
 * şişe ise açık parşömen zeminde koyu kenarıyla belirgin durur.
 */
import { memo, useId } from 'react';
import type { Bottle, Color } from '../engine';
import { FOG_FILL, FOG_INK, GLASS_INTERIOR, PALETTE } from '../config/palette';
import { ColorSymbol } from './Symbol';

export interface PourAnim {
  /** Kaynakta boşalan (üstteki) birim sayısı. */
  drain?: number;
  /** Hedefte dolan (üstteki) birim sayısı ve rengi. */
  fill?: number;
  durationMs: number;
  delayMs: number;
}

export interface BottleViewProps {
  bottle: Bottle;
  capacity: number;
  width: number;
  height: number;
  symbols: boolean;
  complete: boolean;
  selected?: boolean;
  target?: boolean;
  dim?: boolean;
  anim?: PourAnim | null;
  mixPreview?: Color | null;
  /** Bu şişe şu an yeni mühürlendiyse kısa bir parıltı oynar. */
  justSealed?: boolean;
}

function geometry(w: number, h: number, capacity: number) {
  const pad = 3;
  const bw = w - pad * 2;
  const lipH = bw * 0.16;
  const lipW = bw * 0.8;
  const neckW = bw * 0.58;
  const neckH = bw * 0.42;
  const shoulder = bw * 0.26;
  const top = pad;
  const bodyTop = top + lipH + neckH + shoulder;
  const bottom = h - pad;
  const r = bw * 0.3;
  const x0 = pad;
  const x1 = pad + bw;
  const cx = w / 2;
  const ins = Math.max(3, bw * 0.085);
  const liquidTop = bodyTop - shoulder * 0.15;
  const liquidBottom = bottom - ins;
  const unitH = (liquidBottom - liquidTop) / capacity;
  const outline = [
    `M ${cx - lipW / 2} ${top + 2}`,
    `Q ${cx - lipW / 2} ${top} ${cx - lipW / 2 + 2} ${top}`,
    `H ${cx + lipW / 2 - 2}`,
    `Q ${cx + lipW / 2} ${top} ${cx + lipW / 2} ${top + 2}`,
    `V ${top + lipH - 2}`,
    `Q ${cx + lipW / 2} ${top + lipH} ${cx + neckW / 2} ${top + lipH}`,
    `V ${top + lipH + neckH}`,
    `C ${cx + neckW / 2} ${bodyTop - shoulder * 0.35} ${x1} ${bodyTop - shoulder * 0.6} ${x1} ${bodyTop}`,
    `V ${bottom - r}`,
    `Q ${x1} ${bottom} ${x1 - r} ${bottom}`,
    `H ${x0 + r}`,
    `Q ${x0} ${bottom} ${x0} ${bottom - r}`,
    `V ${bodyTop}`,
    `C ${x0} ${bodyTop - shoulder * 0.6} ${cx - neckW / 2} ${bodyTop - shoulder * 0.35} ${cx - neckW / 2} ${top + lipH + neckH}`,
    `V ${top + lipH}`,
    `Q ${cx - lipW / 2} ${top + lipH} ${cx - lipW / 2} ${top + lipH - 2}`,
    'Z',
  ].join(' ');
  const ix0 = x0 + ins;
  const ix1 = x1 - ins;
  const ir = Math.max(2, r - ins);
  const inner = [
    `M ${ix0} ${liquidTop - unitH}`,
    `H ${ix1}`,
    `V ${liquidBottom - ir}`,
    `Q ${ix1} ${liquidBottom} ${ix1 - ir} ${liquidBottom}`,
    `H ${ix0 + ir}`,
    `Q ${ix0} ${liquidBottom} ${ix0} ${liquidBottom - ir}`,
    'Z',
  ].join(' ');
  return {
    pad,
    bw,
    top,
    lipH,
    lipW,
    neckW,
    neckH,
    bodyTop,
    bottom,
    x0,
    x1,
    cx,
    ix0,
    ix1,
    unitH,
    liquidTop,
    liquidBottom,
    outline,
    inner,
  };
}

function BottleViewImpl(p: BottleViewProps) {
  const uid = useId().replace(/:/g, '');
  const g = geometry(p.width, p.height, p.capacity);
  const clip = `clip-${uid}`;
  const hatch = `hatch-${uid}`;
  const n = p.bottle.length;
  const drain = p.anim?.drain ?? 0;
  const fill = p.anim?.fill ?? 0;
  const symR = Math.min(g.unitH, g.ix1 - g.ix0) * 0.27;

  const renderUnit = (u: Bottle[number], i: number) => {
    const y = g.liquidBottom - (i + 1) * g.unitH;
    const sw = PALETTE[u.color];
    const isTop = i === n - 1;
    // Birimler arasında ince boşluk olmasın diye 0,6 px taşırılır.
    return (
      <g key={i}>
        <rect
          x={g.ix0}
          y={y - 0.6}
          width={g.ix1 - g.ix0}
          height={g.unitH + 1.2}
          className="liquid"
          style={{ fill: sw.fill }}
        />
        {isTop && !u.hidden && (
          <rect
            x={g.ix0}
            y={y}
            width={g.ix1 - g.ix0}
            height={Math.max(3, g.unitH * 0.12)}
            style={{ fill: sw.light }}
            className="liquid"
          />
        )}
        {p.symbols && (
          <g className="sym" style={{ opacity: u.hidden ? 0 : 1 }}>
            <ColorSymbol id={sw.symbol} cx={g.cx} cy={y + g.unitH / 2} r={symR} fill={sw.ink} />
          </g>
        )}
        <g className="fog" style={{ opacity: u.hidden ? 1 : 0 }}>
          <rect
            x={g.ix0}
            y={y - 0.6}
            width={g.ix1 - g.ix0}
            height={g.unitH + 1.2}
            fill={FOG_FILL}
          />
          <rect
            x={g.ix0}
            y={y - 0.6}
            width={g.ix1 - g.ix0}
            height={g.unitH + 1.2}
            fill={`url(#${hatch})`}
          />
          <text
            x={g.cx}
            y={y + g.unitH / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={g.unitH * 0.62}
            fontWeight={700}
            fill={FOG_INK}
          >
            ?
          </text>
        </g>
        {i > 0 && p.bottle[i - 1]!.color !== u.color && !u.hidden && !p.bottle[i - 1]!.hidden && (
          <rect
            x={g.ix0}
            y={y + g.unitH - 0.8}
            width={g.ix1 - g.ix0}
            height={1.6}
            fill={GLASS_INTERIOR}
            opacity={0.55}
          />
        )}
      </g>
    );
  };
  // Dökülen/dolan üst birimler tek grup olarak, grubun tabanından ölçeklenir.
  const animCount = p.anim ? drain || fill : 0;
  const still = p.bottle.slice(0, n - animCount).map((u, i) => renderUnit(u, i));
  const moving = p.bottle.slice(n - animCount).map((u, k) => renderUnit(u, n - animCount + k));
  const units = (
    <>
      {still}
      {animCount > 0 && (
        <g
          className={drain ? 'unit-drain' : 'unit-fill'}
          style={
            {
              '--pour-d': `${p.anim!.durationMs}ms`,
              '--pour-delay': `${p.anim!.delayMs}ms`,
            } as React.CSSProperties
          }
        >
          {moving}
        </g>
      )}
    </>
  );

  const classes = ['bottle-svg'];
  if (p.selected) classes.push('is-selected');
  if (p.target) classes.push('is-target');
  if (p.dim) classes.push('is-dim');
  if (p.complete) classes.push('is-complete');
  if (p.justSealed) classes.push('just-sealed');

  return (
    <svg
      className={classes.join(' ')}
      width={p.width}
      height={p.height}
      viewBox={`0 0 ${p.width} ${p.height}`}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clip}>
          <path d={g.inner} />
        </clipPath>
        <pattern
          id={hatch}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="3" height="7" fill="#ffffff" opacity="0.10" />
        </pattern>
      </defs>
      {/* Cam gövde */}
      <path d={g.outline} fill={GLASS_INTERIOR} className="glass" />
      <g clipPath={`url(#${clip})`}>{units}</g>
      {/* Cam parlaklığı */}
      <path
        d={`M ${g.x0 + g.bw * 0.2} ${g.bodyTop + 6} V ${g.bottom - g.bw * 0.45}`}
        stroke="#ffffff"
        strokeOpacity={0.28}
        strokeWidth={Math.max(2, g.bw * 0.07)}
        strokeLinecap="round"
        fill="none"
      />
      <path d={g.outline} fill="none" className="glass-edge" strokeWidth={2.4} />
      {p.complete && (
        <g className="cork">
          <rect
            x={g.cx - g.neckW * 0.42}
            y={g.top - 1}
            width={g.neckW * 0.84}
            height={g.lipH + g.neckH * 0.7}
            rx={3}
            fill="#a8743f"
            stroke="#5a3a1c"
            strokeWidth={1.6}
          />
          <rect
            x={g.cx - g.neckW * 0.3}
            y={g.top + 2}
            width={g.neckW * 0.18}
            height={g.lipH + g.neckH * 0.4}
            fill="#d6a46c"
            rx={2}
          />
        </g>
      )}
      {p.mixPreview && (
        <g className="mix-preview">
          <circle
            cx={g.cx}
            cy={g.top + g.lipH + g.neckH * 0.5}
            r={g.neckW * 0.62}
            fill={PALETTE[p.mixPreview].fill}
            stroke="#1b120b"
            strokeWidth={2}
          />
          {p.symbols && (
            <ColorSymbol
              id={PALETTE[p.mixPreview].symbol}
              cx={g.cx}
              cy={g.top + g.lipH + g.neckH * 0.5}
              r={g.neckW * 0.3}
              fill={PALETTE[p.mixPreview].ink}
            />
          )}
        </g>
      )}
    </svg>
  );
}

export const BottleView = memo(BottleViewImpl);

/** Şişenin ağzının (yuva içindeki) konumu: dökme animasyonu için. */
export function mouthOffset(width: number): { x: number; y: number } {
  return { x: width / 2, y: 3 };
}
