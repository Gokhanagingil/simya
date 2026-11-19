/** Simya masası: iki yuva, büyük "Birleştir" düğmesi, büyük malzeme kartları. */
import { useState } from 'react';
import { useApp } from '../app/store';
import { sound } from '../audio/sound';
import { Icon } from '../components/Icon';
import { MaterialIcon } from '../components/MaterialIcon';
import { Dialog, TopBar } from '../components/ui';
import { clueTarget, combine, inventory, type CombineOutcome } from '../alchemy/table';
import { awaitingKey } from '../game/progress';
import { tr } from '../i18n/tr';
import { vibrate } from '../platform/native';

type MatKey = keyof typeof tr.materials;
const name = (id: string) => tr.materials[id as MatKey]?.name ?? id;

export function TableScreen() {
  const app = useApp();
  const [slots, setSlots] = useState<[string | null, string | null]>([null, null]);
  const [outcome, setOutcome] = useState<CombineOutcome | null>(null);
  const [clue, setClue] = useState<string | null>(null);
  const items = inventory(app.save);
  const waiting = awaitingKey(app.save);

  const pick = (id: string) => {
    sound.unlock();
    sound.play('tap');
    setOutcome(null);
    setSlots(([a, b]) => (a === null ? [id, b] : b === null ? [a, id] : [a, id]));
  };

  const doCombine = () => {
    const [a, b] = slots;
    if (!a || !b) return;
    let out: CombineOutcome | null = null;
    app.update((s) => {
      const r = combine(s, a, b);
      out = r.outcome;
      return r.save;
    });
    const o = out as CombineOutcome | null;
    if (!o) return;
    setOutcome(o);
    if (o.kind === 'discovered') {
      sound.play('discover');
      if (app.save.settings.vibration) vibrate('success');
      setSlots([null, null]);
      if (o.unlockedRoom) {
        const room = o.unlockedRoom;
        window.setTimeout(() => app.push({ name: 'unlock', room }), 1600 * app.animScale);
      }
    } else if (o.kind === 'nothing') {
      sound.play('soft');
      if (o.showClue) {
        const target = clueTarget(app.save);
        if (target) setClue(target);
      }
    }
  };

  return (
    <div className="screen table-screen" data-testid="table">
      <TopBar
        title={tr.table.title}
        right={
          <button
            type="button"
            className="icon-btn"
            onClick={() => app.push({ name: 'pyramid' })}
            data-testid="to-pyramid"
          >
            <Icon name="pyramid" />
            <span>{tr.table.pyramid}</span>
          </button>
        }
      />
      <div className="scroll">
        {waiting && (
          <div className="card key-riddle" data-testid="key-riddle">
            <h2 className="h2">
              <Icon name="key" size={28} /> {tr.story.keyRiddles[waiting.id]!.title}
            </h2>
            <p>{tr.story.keyRiddles[waiting.id]!.body}</p>
          </div>
        )}
        <p className="muted">{tr.table.intro}</p>
        <div className="table-slots">
          {[0, 1].map((i) => {
            const id = slots[i];
            return (
              <button
                key={i}
                type="button"
                className={`table-slot${id ? ' filled' : ''}`}
                onClick={() => setSlots((s) => (i === 0 ? [null, s[1]] : [s[0], null]))}
                aria-label={
                  id
                    ? `${tr.table.selectedSlot(i + 1)}: ${name(id)}. ${tr.table.removeFromSlot}`
                    : `${tr.table.selectedSlot(i + 1)}: ${tr.table.slotEmpty}`
                }
                data-testid={`slot-${i}`}
              >
                {id ? (
                  <>
                    <MaterialIcon id={id} size={64} />
                    <span className="slot-name">{name(id)}</span>
                  </>
                ) : (
                  <span className="slot-empty">{tr.table.slotEmpty}</span>
                )}
              </button>
            );
          })}
          <span className="plus" aria-hidden="true">
            +
          </span>
        </div>
        <button
          type="button"
          className="btn primary block huge"
          disabled={!slots[0] || !slots[1]}
          onClick={doCombine}
          data-testid="combine"
        >
          <Icon name="flask" size={32} />
          {tr.table.combine}
        </button>

        <div aria-live="polite">
          {outcome?.kind === 'nothing' && (
            <p className="table-msg" data-testid="combine-nothing">
              {tr.table.nothing}
            </p>
          )}
          {outcome?.kind === 'known' && (
            <p className="table-msg">{tr.table.already(name(outcome.result))}</p>
          )}
          {outcome?.kind === 'discovered' && (
            <div className="card discovery" data-testid="discovery">
              <div className="discovery-glow">
                <MaterialIcon id={outcome.result} size={96} />
              </div>
              <h2 className="h2">
                {outcome.unlockedRoom ? tr.table.keyFound : tr.table.discovered}
              </h2>
              <p className="discovery-name">{name(outcome.result)}</p>
              <p className="muted">{tr.materials[outcome.result as MatKey]?.text}</p>
              <p className="small">{tr.table.discoveredBody(name(outcome.result))}</p>
            </div>
          )}
        </div>

        <h2 className="h2 section-title">{tr.table.inventory}</h2>
        {items.length === 0 ? (
          <p className="muted">{tr.table.noMaterials}</p>
        ) : (
          <div className="inventory">
            {items.map((id) => (
              <button
                key={id}
                type="button"
                className="mat-card"
                onClick={() => pick(id)}
                data-testid={`mat-${id}`}
              >
                <MaterialIcon id={id} size={56} />
                <span>{name(id)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {clue && (
        <Dialog
          title={tr.table.hintTitle}
          onDismiss={() => setClue(null)}
          actions={[{ label: tr.common.ok, kind: 'primary', onClick: () => setClue(null) }]}
        >
          <p className="riddle">{tr.materials[clue as MatKey].riddle}</p>
          <p>
            <strong>{tr.notebook.clueLabel}: </strong>
            {tr.materials[clue as MatKey].clue}
          </p>
        </Dialog>
      )}
    </div>
  );
}
