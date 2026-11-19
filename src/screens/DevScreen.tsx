/** Gizli geliştirici menüsü (Hakkında > sürüme 7 dokunuş). */
import { useState } from 'react';
import { useApp } from '../app/store';
import { TopBar } from '../components/ui';
import { MATERIALS } from '../alchemy/recipes';
import { migrate, serialize } from '../game/save';
import { tr } from '../i18n/tr';
import { LEVELS, getLevel } from '../levels';

export function DevScreen() {
  const app = useApp();
  const [jump, setJump] = useState(LEVELS[0]!.id);
  const [text, setText] = useState('');
  const [solution, setSolution] = useState<string | null>(null);

  const exportSave = async () => {
    const data = serialize(app.save);
    setText(data);
    try {
      await navigator.clipboard.writeText(data);
      app.toast(tr.dev.copied);
    } catch {
      /* pano yoksa metin kutusundan kopyalanır */
    }
  };

  return (
    <div className="screen dev-screen" data-testid="dev">
      <TopBar title={tr.dev.title} />
      <div className="scroll dev-list">
        <label className="dev-row">
          <span>{tr.dev.jump}</span>
          <select value={jump} onChange={(e) => setJump(e.target.value)} className="dev-select">
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id} · {l.optimalMoves}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn block"
          onClick={() => app.push({ name: 'game', levelId: jump })}
        >
          {tr.dev.jump}
        </button>
        <button
          type="button"
          className="btn block"
          onClick={() => {
            const id = app.save.active?.levelId ?? jump;
            const l = getLevel(id);
            setSolution(
              l
                ? `${l.id}: ${l.solution.map(([a, b]) => `${a + 1}→${b + 1}`).join('  ')}`
                : tr.dev.solutionEmpty,
            );
          }}
        >
          {tr.dev.showSolution}
        </button>
        {solution && <p className="dev-solution">{solution}</p>}
        <button
          type="button"
          className="btn block"
          onClick={() => app.update((s) => ({ ...s, dust: s.dust + 100 }))}
        >
          {tr.dev.addDust}
        </button>
        <button
          type="button"
          className="btn block"
          onClick={() =>
            app.update((s) => {
              const levels = { ...s.levels };
              for (const l of LEVELS)
                levels[l.id] ??= { best: null, stars: 0, perfect: false, completions: 1 };
              return {
                ...s,
                levels,
                materials: [
                  ...new Set([
                    ...s.materials,
                    'su',
                    'ates',
                    'toprak',
                    'hava',
                    'tuz',
                    'civa',
                    'sis',
                    'prizma',
                  ]),
                ],
              };
            })
          }
        >
          {tr.dev.unlockAll}
        </button>
        <button
          type="button"
          className="btn block"
          onClick={() =>
            app.update((s) => ({
              ...s,
              materials: MATERIALS.filter((m) => m.kind !== 'compound')
                .map((m) => m.id)
                .concat(
                  s.materials.filter(
                    (m) => !MATERIALS.some((x) => x.id === m && x.kind !== 'compound'),
                  ),
                ),
            }))
          }
        >
          {tr.dev.grantMaterials}
        </button>
        <button
          type="button"
          className="btn block"
          onClick={() =>
            app.update((s) => ({ ...s, tutorialDone: false, seen: [], invalidTapHints: 0 }))
          }
        >
          {tr.dev.resetTutorial}
        </button>
        <button type="button" className="btn block" onClick={() => void exportSave()}>
          {tr.dev.export}
        </button>
        <textarea
          className="dev-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={tr.dev.importPlaceholder}
          rows={6}
        />
        <button
          type="button"
          className="btn block"
          onClick={() => {
            try {
              const next = migrate(JSON.parse(text));
              app.update(() => next);
              app.toast(tr.dev.importOk);
            } catch {
              app.toast(tr.dev.importFail);
            }
          }}
        >
          {tr.dev.import}
        </button>
      </div>
    </div>
  );
}
