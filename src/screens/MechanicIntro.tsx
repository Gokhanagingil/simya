/** Yeni mekanik tanıtım kartı: tek ekran, resimli. */
import { BottleView } from '../components/BottleView';
import type { Bottle, MechanicId } from '../engine';
import { tr } from '../i18n/tr';

const u = (color: Bottle[number]['color'], hidden = false) => ({ color, hidden });

const EXAMPLES: Record<MechanicId, { before: Bottle[]; after: Bottle[] }> = {
  classic: {
    before: [
      [u('blue'), u('red')],
      [u('red'), u('red'), u('red')],
    ],
    after: [[u('blue')], [u('red'), u('red'), u('red'), u('red')]],
  },
  fog: {
    before: [[u('yellow', true), u('blue', true), u('green')], [u('green')]],
    after: [
      [u('yellow', true), u('blue')],
      [u('green'), u('green')],
    ],
  },
  mix: {
    before: [[u('red')], [u('blue'), u('yellow'), u('yellow')]],
    after: [[], [u('blue'), u('orange'), u('orange'), u('orange')]],
  },
};

export function MechanicDemo({ mechanic }: { mechanic: MechanicId }) {
  const ex = EXAMPLES[mechanic];
  const bottle = (b: Bottle, key: string) => (
    <BottleView
      key={key}
      bottle={b}
      capacity={4}
      width={46}
      height={190}
      symbols
      complete={b.length === 4 && b.every((x) => x.color === b[0]!.color)}
    />
  );
  return (
    <div className="mech-demo" aria-hidden="true">
      <div className="mech-pair">{ex.before.map((b, i) => bottle(b, `b${i}`))}</div>
      <svg width="40" height="40" viewBox="0 0 24 24" className="mech-arrow">
        <path
          d="M4 12h14M13 6l6 6-6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mech-pair">{ex.after.map((b, i) => bottle(b, `a${i}`))}</div>
    </div>
  );
}

export function MechanicIntro({ mechanic, onDone }: { mechanic: MechanicId; onDone: () => void }) {
  const t = tr.mechanics[mechanic];
  return (
    <div className="overlay" role="presentation">
      <div
        className="dialog mech-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mech-title"
        data-testid="mechanic-intro"
      >
        <h2 id="mech-title">{t.title}</h2>
        <p>{t.body}</p>
        <MechanicDemo mechanic={mechanic} />
        <ul className="rule-list">
          {t.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <div className="actions">
          <button
            type="button"
            className="btn primary block"
            onClick={onDone}
            data-testid="mechanic-ok"
          >
            {tr.mechanics.start}
          </button>
        </div>
      </div>
    </div>
  );
}
