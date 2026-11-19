/**
 * Raf: şişeleri yerleştirir, dokunuşları iletir ve dökme animasyonunu oynatır.
 * Oyun mantığı burada değil (GameScreen + motor).
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Bottle, Color } from '../engine';
import { isComplete } from '../engine';
import { PALETTE } from '../config/palette';
import { computeBoardLayout } from '../game/layout';
import { tr } from '../i18n/tr';
import { BottleView, type PourAnim } from './BottleView';
import { Icon } from './Icon';

export interface PourSpec {
  id: number;
  from: number;
  to: number;
  color: Color;
  amount: number;
  /** Animasyon sırasında gösterilecek şişeler (kaynak eski, hedef eski + dökülen). */
  display: readonly Bottle[];
  durationMs: number;
  reduced: boolean;
}

export interface BoardProps {
  bottles: readonly Bottle[];
  capacity: number;
  symbols: boolean;
  selected: number | null;
  targets: readonly number[];
  mixPreviews: Readonly<Record<number, Color>>;
  hint: { from: number; to: number } | null;
  /** Öğreticide vurgulanan şişe. */
  spotlight: number | null;
  sealed: readonly number[];
  pour: PourSpec | null;
  onPourDone: (id: number) => void;
  onTapBottle: (index: number) => void;
  onTapEmpty: () => void;
}

function describe(b: Bottle, capacity: number): string {
  if (b.length === 0) return tr.game.srEmpty;
  const parts = b.map((u) => (u.hidden ? tr.game.srHidden : tr.colors[u.color]!)).join(', ');
  return isComplete(b, capacity) ? `${tr.game.srSealed}, ${parts}` : parts;
}

export function Board(p: BoardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 328, h: 420 });
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bottles = p.pour ? p.pour.display : p.bottles;
  const L = computeBoardLayout(bottles.length, size.w, size.h, p.capacity);

  // Dökme animasyonu: kaynak şişe hedefin üstüne uçar, eğilir, sıvı akar, geri döner.
  const [stream, setStream] = useState<null | {
    x: number;
    y: number;
    h: number;
    color: string;
    id: number;
  }>(null);
  useEffect(() => {
    const pour = p.pour;
    if (!pour) return;
    const T = pour.durationMs;
    const s = L.slots[pour.from];
    const t = L.slots[pour.to];
    const el = slotRefs.current[pour.from]?.querySelector<HTMLElement>('.bottle-fly');
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setStream(null);
      p.onPourDone(pour.id);
    };
    if (!s || !t || !el || pour.reduced || typeof el.animate !== 'function') {
      const timer = window.setTimeout(finish, T);
      return () => window.clearTimeout(timer);
    }
    const bw = L.bottleW;
    const left = s.bx <= t.bx;
    const side = left ? -1 : 1;
    const angle = left ? 72 : -72;
    const sMouth = { x: s.bx + bw / 2, y: s.by - L.lift };
    const P = { x: t.bx + bw / 2 + side * bw * 0.16, y: t.by - bw * 0.62 };
    const dx = P.x - sMouth.x;
    const dy = P.y - sMouth.y;
    const anim = el.animate(
      [
        { transform: `translate(0px, ${-L.lift}px) rotate(0deg)`, offset: 0 },
        { transform: `translate(${dx}px, ${dy - L.lift}px) rotate(${angle}deg)`, offset: 0.3 },
        { transform: `translate(${dx}px, ${dy - L.lift}px) rotate(${angle}deg)`, offset: 0.76 },
        { transform: 'translate(0px, 0px) rotate(0deg)', offset: 1 },
      ],
      { duration: T, easing: 'ease-in-out', fill: 'none' },
    );
    const streamOn = window.setTimeout(
      () =>
        setStream({
          x: P.x,
          y: P.y,
          h: t.by + bw * 0.9 - P.y,
          color: PALETTE[pour.color].fill,
          id: pour.id,
        }),
      T * 0.3,
    );
    const streamOff = window.setTimeout(() => setStream(null), T * 0.76);
    anim.onfinish = finish;
    const safety = window.setTimeout(finish, T + 200);
    return () => {
      window.clearTimeout(streamOn);
      window.clearTimeout(streamOff);
      window.clearTimeout(safety);
      anim.cancel();
    };
    // Yalnızca yeni bir dökmede çalışır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.pour?.id]);

  return (
    <div
      ref={ref}
      className="board"
      data-testid="board"
      onClick={(e) => {
        if (e.target === e.currentTarget) p.onTapEmpty();
      }}
    >
      {bottles.map((b, i) => {
        const slot = L.slots[i];
        if (!slot) return null;
        const complete = isComplete(b, p.capacity);
        const isSel = p.selected === i && !p.pour;
        const isTarget = !p.pour && p.targets.includes(i);
        const dim = !p.pour && p.selected !== null && !isSel && !isTarget;
        let anim: PourAnim | null = null;
        if (p.pour && i === p.pour.from)
          anim = {
            drain: p.pour.amount,
            durationMs: p.pour.durationMs * 0.44,
            delayMs: p.pour.reduced ? 0 : p.pour.durationMs * 0.3,
          };
        if (p.pour && i === p.pour.to)
          anim = {
            fill: p.pour.amount,
            durationMs: p.pour.durationMs * 0.44,
            delayMs: p.pour.reduced ? 0 : p.pour.durationMs * 0.3,
          };
        const hintRole =
          p.hint && !p.pour ? (p.hint.from === i ? 'from' : p.hint.to === i ? 'to' : null) : null;
        return (
          <div
            key={i}
            ref={(el) => {
              slotRefs.current[i] = el;
            }}
            className={`slot${p.pour?.from === i ? ' pouring' : ''}`}
            style={{ left: slot.x, top: slot.y, width: slot.w, height: slot.h }}
          >
            <button
              type="button"
              className="slot-hit"
              data-testid={`bottle-${i}`}
              data-selected={isSel || undefined}
              data-target={isTarget || undefined}
              data-complete={complete || undefined}
              aria-label={tr.game.srBottle(i + 1, describe(b, p.capacity))}
              aria-pressed={isSel}
              onClick={() => p.onTapBottle(i)}
            />
            <div
              className="bottle-fly"
              style={{
                left: slot.bx - slot.x,
                top: slot.by - slot.y,
                width: L.bottleW,
                height: L.bottleH,
                transformOrigin: `${L.bottleW / 2}px 0px`,
                transform: isSel ? `translateY(${-L.lift}px)` : undefined,
              }}
            >
              <BottleView
                bottle={b}
                capacity={p.capacity}
                width={L.bottleW}
                height={L.bottleH}
                symbols={p.symbols}
                complete={complete}
                selected={isSel}
                target={isTarget || hintRole === 'to'}
                dim={dim}
                anim={anim}
                mixPreview={isTarget ? (p.mixPreviews[i] ?? null) : null}
                justSealed={p.sealed.includes(i)}
              />
            </div>
            {(hintRole || p.spotlight === i) && (
              <div
                className={`marker ${hintRole ?? 'spot'}`}
                style={{
                  left: slot.bx - slot.x + L.bottleW / 2,
                  top: slot.by - slot.y - L.lift - 6,
                }}
              >
                <Icon name="arrowDown" size={34} />
              </div>
            )}
          </div>
        );
      })}
      {stream && (
        <div
          key={stream.id}
          className="stream"
          style={{
            left: stream.x - 4,
            top: stream.y,
            height: Math.max(10, stream.h),
            background: stream.color,
          }}
        />
      )}
    </div>
  );
}
