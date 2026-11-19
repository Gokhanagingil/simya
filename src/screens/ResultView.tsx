/** Bölüm sonu: yıldızlar, hamleniz / en iyi çözüm, rekor, kazanılan toz ve malzeme. */
import { useEffect, useState } from 'react';
import { useApp } from '../app/store';
import { sound } from '../audio/sound';
import { Icon } from '../components/Icon';
import { MaterialIcon } from '../components/MaterialIcon';
import { Stars } from '../components/ui';
import type { CompletionResult } from '../game/progress';
import { tr } from '../i18n/tr';
import type { LevelDef } from '../levels';

export function ResultView(p: {
  level: LevelDef;
  result: CompletionResult;
  onNext: () => void;
  onReplay: () => void;
  onMap: () => void;
  onTable: () => void;
  hasNext: boolean;
}) {
  const app = useApp();
  const r = p.result;
  const rec = app.save.levels[p.level.id];
  const b = r.dustBreakdown;
  const [tip, setTip] = useState<string | null>(null);
  useEffect(() => {
    if (r.materials.length) window.setTimeout(() => sound.play('discover'), 500);
    // Bağlamsal yardım: ilk malzeme ve ilk bölüm sonu, birer kez.
    const tipKey =
      r.materials.length && !app.save.seen.includes('tip-material')
        ? 'tip-material'
        : !app.save.seen.includes('tip-result')
          ? 'tip-result'
          : null;
    if (tipKey) {
      setTip(tipKey === 'tip-material' ? tr.tips.firstMaterial : tr.tips.firstResult);
      app.update((s) => ({ ...s, seen: [...new Set([...s.seen, tipKey])] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    app.setBackHandler(() => {
      p.onMap();
      return true;
    });
    return () => app.setBackHandler(null);
  });

  let recordLine: string;
  if (r.newRecord) recordLine = tr.result.newRecord(r.improvedBy);
  else if (r.firstClear && rec?.best != null) recordLine = tr.result.firstRecord;
  else recordLine = rec?.best != null ? tr.result.recordStays(rec.best) : '';

  return (
    <div className="screen result-screen" data-testid="result">
      <div className="scroll">
        <div className="result-head">
          <h1 className="h1">
            {r.roomCompleted
              ? tr.result.roomDone(tr.rooms[r.roomCompleted]!.name)
              : tr.result.title}
          </h1>
          <div className="result-stars">
            <Stars count={r.stars} size={56} />
          </div>
          {r.perfect && (
            <div className="perfect-badge" data-testid="perfect">
              <Icon name="crown" size={34} />
              <span>{tr.result.perfect}</span>
            </div>
          )}
        </div>

        {tip && (
          <p className="tip-note" data-testid="result-tip">
            <Icon name="info" size={22} />
            <span>{tip}</span>
          </p>
        )}

        <div className="card result-card">
          <div className="result-row">
            <span>{tr.result.yourMoves}</span>
            <strong data-testid="result-moves">{r.moves}</strong>
          </div>
          <div className="result-row">
            <span>{tr.result.bestSolution}</span>
            <strong>{p.level.optimalMoves}</strong>
          </div>
          {recordLine && (
            <p className={`record-line${r.newRecord ? ' celebrate' : ''}`}>{recordLine}</p>
          )}
          {r.usedExtraBottle && <p className="muted small">{tr.result.extraNoRecord}</p>}
          {r.usedPaidPower && <p className="muted small">{tr.result.paidCap}</p>}
        </div>

        {r.materials.length > 0 && (
          <div className="card result-card material-reward" data-testid="material-reward">
            <h2 className="h2">{tr.result.materials}</h2>
            <div className="reward-list">
              {r.materials.map((m) => (
                <div key={m} className="reward-item">
                  <MaterialIcon id={m} size={56} />
                  <strong>{tr.materials[m as keyof typeof tr.materials]?.name}</strong>
                </div>
              ))}
            </div>
            <p className="muted">{tr.result.materialsHint}</p>
          </div>
        )}
        <div className="card result-card">
          <div className="result-row">
            <span>{tr.result.dustEarned}</span>
            <strong className="dust-earned">
              <Icon name="dust" size={22} /> +{r.dustEarned}
            </strong>
          </div>
          {r.dustEarned === 0 ? (
            <p className="muted small">{tr.result.noNewDust}</p>
          ) : (
            <ul className="breakdown">
              {b.firstClear > 0 && (
                <li>
                  {tr.result.breakdownFirst} +{b.firstClear}
                </li>
              )}
              {b.stars > 0 && (
                <li>
                  {tr.result.breakdownStars} +{b.stars}
                </li>
              )}
              {b.perfect > 0 && (
                <li>
                  {tr.result.breakdownPerfect} +{b.perfect}
                </li>
              )}
              {b.room > 0 && (
                <li>
                  {tr.result.breakdownRoom} +{b.room}
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="result-actions">
        <button
          type="button"
          className="btn primary block huge"
          onClick={p.onNext}
          data-testid="next-level"
        >
          {r.roomCompleted ? tr.common.continue : p.hasNext ? tr.result.next : tr.result.toMap}
          <Icon name="play" />
        </button>
        <div className="row-2">
          <button type="button" className="btn" onClick={p.onReplay} data-testid="replay">
            <Icon name="restart" />
            {tr.result.replay}
          </button>
          {r.materials.length > 0 ? (
            <button type="button" className="btn" onClick={p.onTable}>
              <Icon name="flask" />
              {tr.result.toTable}
            </button>
          ) : (
            <button type="button" className="btn" onClick={p.onMap}>
              <Icon name="map" />
              {tr.result.toMap}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
