/**
 * Şişe yerleşimi (saf hesap, testlenebilir). 360×800 ekranda 12 şişeye kadar iki sırada,
 * şişeler büyük kalacak şekilde. Dokunma alanı = yuvanın tamamı (görselden geniş).
 */
export interface Slot {
  /** Yuvanın sol üst köşesi ve boyutu (dokunma alanı). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Şişe görselinin sol üst köşesi (yuva içinde ortalı). */
  bx: number;
  by: number;
}

export interface BoardLayout {
  rows: number;
  perRow: number;
  bottleW: number;
  bottleH: number;
  /** Seçili şişenin yükselme miktarı. */
  lift: number;
  slots: Slot[];
}

/** Şişe görselinin genişliğine göre yüksekliği (kapasite 4 için). */
export function bottleHeightFor(w: number, capacity: number): number {
  const unit = w * 0.76;
  return Math.round(w * 0.95 + unit * capacity + w * 0.12);
}

export function computeBoardLayout(
  count: number,
  width: number,
  height: number,
  capacity = 4,
): BoardLayout {
  const rows = count <= 5 ? 1 : 2;
  const perRow = Math.ceil(count / rows);
  const slotW = width / Math.max(perRow, 1);
  const lift = 14;
  // İpucu/öğretici oku için en üst sıranın üstünde boşluk (alt sırada ok üst sıranın tabanına taşabilir).
  const markerSpace = 34;
  const rowH = (height - markerSpace) / rows;
  // Genişlikten gelen sınır ve yükseklikten gelen sınırın küçüğü.
  let bottleW = Math.min(slotW * 0.74, 74);
  const maxByHeight = (w: number) => bottleHeightFor(w, capacity) + lift + 14 <= rowH;
  while (bottleW > 24 && !maxByHeight(bottleW)) bottleW -= 1;
  bottleW = Math.floor(bottleW);
  const bottleH = bottleHeightFor(bottleW, capacity);
  const slots: Slot[] = [];
  for (let i = 0; i < count; i++) {
    const row = rows === 1 ? 0 : i < perRow ? 0 : 1;
    const inRow = row === 0 ? Math.min(perRow, count) : count - perRow;
    const col = row === 0 ? i : i - perRow;
    // Satırı ortala (alt sırada daha az şişe olabilir).
    const rowOffset = (width - inRow * slotW) / 2;
    const x = rowOffset + col * slotW;
    const y = row === 0 ? 0 : markerSpace + rowH;
    const h = row === 0 ? markerSpace + rowH : rowH;
    const bx = x + (slotW - bottleW) / 2;
    const by = y + h - bottleH - 8;
    slots.push({ x, y, w: slotW, h, bx, by });
  }
  return { rows, perRow, bottleW, bottleH, lift, slots };
}
