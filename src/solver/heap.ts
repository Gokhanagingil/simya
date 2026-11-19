/** Küçük öncelik değerini önce veren ikili yığın (öncelikler ve değerler ayrı dizilerde). */
export class MinHeap {
  private prio: number[] = [];
  private vals: number[] = [];

  get size(): number {
    return this.vals.length;
  }

  push(priority: number, value: number): void {
    const p = this.prio;
    const v = this.vals;
    let i = v.length;
    p.push(priority);
    v.push(value);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (p[parent]! <= priority) break;
      p[i] = p[parent]!;
      v[i] = v[parent]!;
      i = parent;
    }
    p[i] = priority;
    v[i] = value;
  }

  pop(): number | undefined {
    const p = this.prio;
    const v = this.vals;
    if (v.length === 0) return undefined;
    const top = v[0]!;
    const lastP = p.pop()!;
    const lastV = v.pop()!;
    const n = v.length;
    if (n > 0) {
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        if (l >= n) break;
        const r = l + 1;
        const c = r < n && p[r]! < p[l]! ? r : l;
        if (p[c]! >= lastP) break;
        p[i] = p[c]!;
        v[i] = v[c]!;
        i = c;
      }
      p[i] = lastP;
      v[i] = lastV;
    }
    return top;
  }
}
