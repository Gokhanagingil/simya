/**
 * Oyun ekranı: üst çubuk (geri, oda·bölüm, hamle, 3★ hedefi, toz), raf ve alt çubuk (güçler).
 * Durum her hamleden sonra kaydedilir; uygulama kapansa da kaldığı yerden sürer.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../app/store';
import { sound } from '../audio/sound';
import { Board, type PourSpec } from '../components/Board';
import { Icon, type IconName } from '../components/Icon';
import { Dialog, DustPill } from '../components/ui';
import {
  ECONOMY,
  HINT_TIME_LIMIT_MS,
  INVALID_TAP_HINT_COUNT,
  POUR_DURATION_MS,
} from '../config/game';
import { ROOMS } from '../config/rooms';
import {
  canPour,
  getValidTargets,
  isComplete,
  isSelectable,
  mixPreview,
  topGroup,
  type Bottle,
  type Color,
  type MoveEvent,
} from '../engine';
import {
  completeLevel,
  nextLevelId,
  isLevelUnlocked,
  type CompletionResult,
} from '../game/progress';
import {
  canAddBottle,
  canUndo,
  fogLeft,
  freeUndosLeft,
  hintFromStoredSolution,
  resumeSession,
  sessionAddBottle,
  sessionHintUsed,
  sessionMove,
  sessionRestart,
  sessionRevealBottle,
  sessionStuck,
  sessionUndo,
  sessionWon,
  startSession,
  toActive,
  undoCost,
  type Session,
} from '../game/session';
import { threeStarLimit } from '../game/stars';
import { tr } from '../i18n/tr';
import { getLevel } from '../levels';
import { vibrate } from '../platform/native';
import { requestHint } from '../solver/hintClient';
import { MechanicIntro } from './MechanicIntro';
import { ResultView } from './ResultView';

type Modal =
  | { kind: 'restart' }
  | { kind: 'paid'; power: 'undo' | 'hint' | 'extra' | 'fog'; cost: number }
  | { kind: 'stuck' }
  | null;

type TutorialStep = 'source' | 'target' | 'free' | 'sealed' | null;

export function GameScreen({ levelId }: { levelId: string }) {
  const app = useApp();
  const level = getLevel(levelId)!;
  const roomName = tr.rooms[level.room]!.name;
  const fog = level.mechanics.includes('fog');
  const mix = level.mechanics.includes('mix');

  const [session, setSession] = useState<Session>(() => {
    const active = app.save.active;
    return active && active.levelId === levelId
      ? resumeSession(level, active)
      : startSession(level);
  });
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const [selected, setSelected] = useState<number | null>(null);
  const [pour, setPour] = useState<PourSpec | null>(null);
  const pending = useRef<{ next: Session; events: readonly MoveEvent[] } | null>(null);
  const [sealed, setSealed] = useState<number[]>([]);
  const [hint, setHint] = useState<{ from: number; to: number } | null>(null);
  const [hintBusy, setHintBusy] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [fogPick, setFogPick] = useState(false);
  const [result, setResult] = useState<CompletionResult | null>(null);
  const [showIntro, setShowIntro] = useState(() => {
    const mech = ROOMS.find((r) => r.id === level.room)!.mechanic;
    return level.index === 1 && mech !== 'classic' && !app.save.seen.includes(`mech-${mech}`);
  });
  const tutorialActive = !app.save.tutorialDone && level.room === 1 && level.index === 1;
  const [tStep, setTStep] = useState<TutorialStep>(() =>
    tutorialActive && session.state.moves === 0 ? 'source' : tutorialActive ? 'free' : null,
  );
  const moveId = useRef(0);
  // Bağlamsal yardım: yalnızca bir kez (Defter > Nasıl oynanır'da yeniden okunabilir).
  const tipId =
    level.room === 1 && level.index === 2
      ? 'tip-undo'
      : level.room === 1 && level.index === 3
        ? 'tip-stars'
        : null;
  const [tip, setTip] = useState<string | null>(() =>
    tipId && !app.save.seen.includes(tipId) ? tipId : null,
  );
  const dismissTip = () => {
    if (!tip) return;
    const id = tip;
    setTip(null);
    app.update((s) => ({ ...s, seen: [...new Set([...s.seen, id])] }));
  };

  // Kayıt: oturum her değiştiğinde yarım bölüm olarak yazılır.
  const persist = useCallback(
    (s: Session) => {
      app.update((save) => ({ ...save, active: toActive(s) }));
    },
    [app],
  );

  useEffect(() => {
    // Bölüm açılınca etkin bölüm olarak işaretle.
    if (!result) persist(sessionRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spend = (cost: number): boolean => {
    if (app.save.dust < cost) {
      app.toast(tr.game.notEnoughDust);
      return false;
    }
    app.update((s) => ({ ...s, dust: s.dust - cost }));
    return true;
  };

  const state = session.state;
  const targets = useMemo(
    () => (selected === null ? [] : getValidTargets(state, selected)),
    [state, selected],
  );
  const previews = useMemo(() => {
    const out: Record<number, Color> = {};
    if (selected !== null && mix)
      for (const t of targets) {
        const c = mixPreview(state, selected, t);
        if (c) out[t] = c;
      }
    return out;
  }, [state, selected, targets, mix]);

  const finishLevel = useCallback(
    (s: Session) => {
      let res: CompletionResult | null = null;
      app.update((save) => {
        res = completeLevel(save, {
          level,
          moves: s.state.moves,
          usedPaidPower: s.usedPaidPower,
          usedExtraBottle: s.extraBottles > 0,
        });
        return { ...res.save, tutorialDone: res.save.tutorialDone || tutorialActive };
      });
      sound.play('win');
      if (app.save.settings.vibration) vibrate('success');
      if (tutorialActive) setTStep(null);
      window.setTimeout(() => setResult(res), 700 * app.animScale);
    },
    [app, level, tutorialActive],
  );

  const afterChange = useCallback(
    (next: Session) => {
      if (sessionWon(next)) {
        finishLevel(next);
      } else {
        persist(next);
        if (sessionStuck(next))
          window.setTimeout(() => setModal({ kind: 'stuck' }), 380 * app.animScale);
      }
    },
    [finishLevel, persist, app.animScale],
  );

  const onPourDone = useCallback(
    (id: number) => {
      if (id !== moveId.current || !pending.current) return;
      const { next, events } = pending.current;
      pending.current = null;
      setPour(null);
      setSession(next);
      const seals = events.flatMap((e) => (e.type === 'complete' ? [e.bottle] : []));
      if (events.some((e) => e.type === 'mix')) sound.play('mix');
      if (events.some((e) => e.type === 'reveal')) sound.play('reveal');
      if (seals.length) {
        sound.play('seal');
        if (app.save.settings.vibration) vibrate('light');
        setSealed(seals);
        window.setTimeout(() => setSealed([]), 950 * app.animScale);
        setTStep((t) => (t === 'free' || t === 'target' ? 'sealed' : t));
      }
      afterChange(next);
    },
    [afterChange, app.animScale, app.save.settings.vibration],
  );

  const doPour = (from: number, to: number) => {
    if (tip) dismissTip();
    const { session: next, events } = sessionMove(session, from, to);
    const p = events.find((e) => e.type === 'pour');
    if (!p || p.type !== 'pour') return;
    const display: Bottle[] = state.bottles.slice();
    display[to] = [
      ...state.bottles[to]!,
      ...Array.from({ length: p.amount }, () => ({ color: p.color, hidden: false })),
    ];
    pending.current = { next, events };
    const id = ++moveId.current;
    setSelected(null);
    setHint(null);
    sound.play('pour');
    setPour({
      id,
      from,
      to,
      color: p.color,
      amount: p.amount,
      display,
      durationMs: app.reducedMotion ? 220 : POUR_DURATION_MS * app.animScale,
      reduced: app.reducedMotion,
    });
    setTStep((t) => (t === 'source' || t === 'target' ? 'free' : t === 'sealed' ? 'free' : t));
  };

  const invalidHint = (text: string) => {
    if (app.save.invalidTapHints < INVALID_TAP_HINT_COUNT) {
      app.toast(text);
      app.update((s) => ({ ...s, invalidTapHints: s.invalidTapHints + 1 }));
    }
  };

  const onTapBottle = (i: number) => {
    if (pour || result) return;
    sound.unlock();
    if (fogPick) {
      const b = state.bottles[i]!;
      if (!b.some((u) => u.hidden)) {
        app.toast(tr.game.noFogHere);
        return;
      }
      if (!spend(ECONOMY.cost.fogClear)) return;
      const { session: next } = sessionRevealBottle(session, i);
      setFogPick(false);
      setSession(next);
      sound.play('reveal');
      persist(next);
      return;
    }
    if (selected === null) {
      if (isSelectable(state, i)) {
        setSelected(i);
        sound.play('tap');
        if (tStep === 'source') setTStep('target');
      } else if (isComplete(state.bottles[i]!, state.capacity))
        invalidHint(tr.game.completedBottle);
      return;
    }
    if (selected === i) {
      setSelected(null);
      if (tStep === 'target') setTStep('source');
      return;
    }
    if (canPour(state, selected, i)) {
      doPour(selected, i);
      return;
    }
    // Geçersiz hedef: seçim o şişeye geçer, hata sesi yok.
    if (isSelectable(state, i)) {
      setSelected(i);
      sound.play('soft');
    } else setSelected(null);
    invalidHint(
      isComplete(state.bottles[i]!, state.capacity)
        ? tr.game.completedBottle
        : mix
          ? tr.game.invalidTargetMix
          : tr.game.invalidTarget,
    );
  };

  const onTapEmpty = () => {
    if (pour) return;
    setSelected(null);
    if (tStep === 'target') setTStep('source');
  };

  // ---------- Güçler ----------
  const performUndo = (paid: boolean) => {
    const next = sessionUndo(session);
    if (!next) return;
    if (paid && !spend(ECONOMY.cost.undo)) return;
    setSelected(null);
    setHint(null);
    setSession(next);
    persist(next);
    setModal(null);
  };

  const onUndo = () => {
    if (pour) return;
    if (!canUndo(session)) {
      app.toast(tr.game.noUndo);
      return;
    }
    const cost = undoCost(session);
    if (cost === 0) performUndo(false);
    else if (app.save.dust < cost) app.toast(tr.game.notEnoughDust);
    else setModal({ kind: 'paid', power: 'undo', cost });
  };

  const performRestart = () => {
    const next = sessionRestart(session);
    setSelected(null);
    setHint(null);
    setSession(next);
    persist(next);
    setModal(null);
  };

  const askPaid = (power: 'hint' | 'extra' | 'fog', cost: number) => {
    if (pour) return;
    if (power === 'extra' && !canAddBottle(session)) {
      app.toast(tr.game.extraUsed);
      return;
    }
    if (power === 'fog' && fogLeft(session) === 0) {
      app.toast(tr.game.noFogLeft);
      return;
    }
    if (app.save.dust < cost) {
      app.toast(tr.game.notEnoughDust);
      return;
    }
    setModal({ kind: 'paid', power, cost });
  };

  const performPaid = async (power: 'undo' | 'hint' | 'extra' | 'fog') => {
    setModal(null);
    if (power === 'undo') return performUndo(true);
    if (power === 'extra') {
      if (!spend(ECONOMY.cost.extraBottle)) return;
      const next = sessionAddBottle(session);
      setSession(next);
      persist(next);
      return;
    }
    if (power === 'fog') {
      setFogPick(true);
      setSelected(null);
      return;
    }
    // İpucu: önce saklı çözüm yolu, değilse Worker'da çözücü. Öneri bulunamazsa ücret alınmaz.
    const stored = hintFromStoredSolution(session);
    let move: readonly [number, number] | null =
      stored && canPour(session.state, stored[0], stored[1]) ? stored : null;
    if (!move) {
      setHintBusy(true);
      const res = await requestHint(session.state, HINT_TIME_LIMIT_MS);
      setHintBusy(false);
      if (res.kind === 'none') {
        app.toast(tr.game.hintNoExit);
        return;
      }
      if (res.kind === 'timeout') {
        app.toast(tr.game.hintTimeout);
        return;
      }
      move = res.move;
    }
    if (sessionRef.current !== session) return;
    if (!spend(ECONOMY.cost.hint)) return;
    const next = sessionHintUsed(session);
    setSession(next);
    persist(next);
    setSelected(null);
    setHint({ from: move[0], to: move[1] });
    app.toast(tr.game.hintShown);
  };

  // Geri tuşu: önce açık pencere/sis seçimi kapanır, sonra odalara dönülür (ilerleme kayıtlı).
  useEffect(() => {
    app.setBackHandler(() => {
      if (fogPick) {
        setFogPick(false);
        return true;
      }
      if (selected !== null) {
        setSelected(null);
        return true;
      }
      return false;
    });
    return () => app.setBackHandler(null);
  }, [app, fogPick, selected]);

  if (result) {
    const nextId = nextLevelId(level);
    return (
      <ResultView
        level={level}
        result={result}
        onNext={() => {
          if (!nextId) {
            app.reset({ name: 'home' });
            return;
          }
          const nextLevel = getLevel(nextId)!;
          if (result.roomCompleted) {
            app.replace({ name: 'notebook', tab: 'story', page: `oda${result.roomCompleted}` });
            return;
          }
          if (!isLevelUnlocked(app.save, nextLevel)) {
            app.replace({ name: 'table' });
            return;
          }
          app.replace({ name: 'game', levelId: nextId, nonce: Date.now() });
        }}
        onReplay={() => app.replace({ name: 'game', levelId, nonce: Date.now() })}
        onMap={() => app.replace({ name: 'map', room: level.room })}
        onTable={() => app.replace({ name: 'table' })}
        hasNext={Boolean(nextId)}
      />
    );
  }

  const three = threeStarLimit(level.optimalMoves, fog);
  const free = freeUndosLeft(session);
  const tutorialText =
    tStep === 'source'
      ? tr.tutorial.tapSource
      : tStep === 'target'
        ? tr.tutorial.tapTarget
        : tStep === 'free'
          ? tr.tutorial.keepGoing
          : tStep === 'sealed'
            ? tr.tutorial.sealed
            : null;
  const firstMove = level.solution[0];
  const spotlight =
    tStep === 'source' && firstMove && state.moves === 0
      ? firstMove[0]
      : tStep === 'target' && firstMove && state.moves === 0 && selected === firstMove[0]
        ? firstMove[1]
        : null;

  return (
    <div className="screen game-screen" data-testid="game-screen">
      <header className="game-top">
        <div className="game-top-row">
          <button
            type="button"
            className="icon-btn"
            onClick={() => app.pop()}
            aria-label={tr.common.back}
            data-testid="back"
          >
            <Icon name="back" />
            <span>{tr.common.back}</span>
          </button>
          <h1 className="title" data-testid="level-title">
            {tr.game.title(roomName, level.index)}
          </h1>
        </div>
        <div className="game-stats">
          <span className="stat">
            <span className="muted">{tr.game.moves}</span>{' '}
            <strong data-testid="moves">{state.moves}</strong>
          </span>
          <span className="stat">
            <span className="muted">{tr.game.target}</span>{' '}
            <strong>{tr.game.targetValue(three)}</strong>
          </span>
          <DustPill amount={app.save.dust} />
        </div>
      </header>

      {tip && !tutorialText && !fogPick && (
        <div className="coach" role="status" data-testid="tip">
          <span>{tip === 'tip-undo' ? tr.tips.undo : tr.tips.stars}</span>
          <button type="button" className="btn coach-btn" onClick={dismissTip} data-testid="tip-ok">
            {tr.tips.gotIt}
          </button>
        </div>
      )}

      {tutorialText && !fogPick && (
        <div className="coach" role="status" data-testid="coach">
          <span>{tutorialText}</span>
          <button
            type="button"
            className="btn coach-btn"
            onClick={() => {
              setTStep(null);
              app.update((s) => ({ ...s, tutorialDone: true }));
            }}
          >
            {tr.tutorial.skip}
          </button>
        </div>
      )}

      <Board
        bottles={state.bottles}
        capacity={state.capacity}
        symbols={app.save.settings.symbols}
        selected={selected}
        targets={targets}
        mixPreviews={previews}
        hint={hint}
        spotlight={spotlight}
        sealed={sealed}
        pour={pour}
        onPourDone={onPourDone}
        onTapBottle={onTapBottle}
        onTapEmpty={onTapEmpty}
      />

      {fogPick ? (
        <div className="coach pick-panel" role="status" data-testid="coach">
          <span>{tr.game.pickFogBottle}</span>
          <button
            type="button"
            className="btn coach-btn"
            onClick={() => setFogPick(false)}
            data-testid="fog-cancel"
          >
            {tr.game.fogCancel}
          </button>
        </div>
      ) : (
        <nav className={`powers${fog ? ' five' : ''}`} aria-label={tr.game.paidNote}>
          <PowerButton
            icon="undo"
            label={tr.game.undo}
            sub={free > 0 ? tr.game.undoFree(free) : tr.common.cost(ECONOMY.cost.undo)}
            paid={free === 0}
            onClick={onUndo}
            testId="undo"
            disabled={!canUndo(session)}
          />
          <PowerButton
            icon="restart"
            label={tr.game.restart}
            sub={tr.common.free}
            onClick={() =>
              !pour && state.moves + session.extraBottles > 0 && setModal({ kind: 'restart' })
            }
            testId="restart"
            disabled={state.moves === 0 && session.past.length === 0}
          />
          <PowerButton
            icon="hint"
            label={hintBusy ? tr.game.hintThinking : tr.game.hint}
            sub={tr.common.cost(ECONOMY.cost.hint)}
            paid
            onClick={() => !hintBusy && askPaid('hint', ECONOMY.cost.hint)}
            testId="hint"
          />
          <PowerButton
            icon="bottlePlus"
            label={tr.game.extra}
            sub={tr.common.cost(ECONOMY.cost.extraBottle)}
            paid
            onClick={() => askPaid('extra', ECONOMY.cost.extraBottle)}
            testId="extra"
            disabled={!canAddBottle(session)}
          />
          {fog && (
            <PowerButton
              icon="fogClear"
              label={tr.game.fogClear}
              sub={tr.common.cost(ECONOMY.cost.fogClear)}
              paid
              onClick={() => askPaid('fog', ECONOMY.cost.fogClear)}
              testId="fog"
              disabled={fogLeft(session) === 0}
              wide
            />
          )}
        </nav>
      )}
      <p className="paid-note">{tr.game.paidNote}</p>

      {modal?.kind === 'restart' && (
        <Dialog
          title={tr.game.restartTitle}
          onDismiss={() => setModal(null)}
          testId="restart-dialog"
          actions={[
            {
              label: tr.game.restartYes,
              kind: 'primary',
              onClick: performRestart,
              testId: 'restart-yes',
            },
            { label: tr.common.cancel, onClick: () => setModal(null) },
          ]}
        >
          <p>{tr.game.restartBody}</p>
        </Dialog>
      )}

      {modal?.kind === 'paid' && (
        <Dialog
          title={tr.game.paidConfirmTitle(
            modal.power === 'undo'
              ? tr.game.undo
              : modal.power === 'hint'
                ? tr.game.hint
                : modal.power === 'extra'
                  ? tr.game.extra
                  : tr.game.fogClear,
          )}
          onDismiss={() => setModal(null)}
          testId="paid-dialog"
          actions={[
            {
              label: tr.game.paidConfirmYes(modal.cost),
              kind: 'primary',
              onClick: () => void performPaid(modal.power),
              testId: 'paid-yes',
            },
            { label: tr.common.cancel, onClick: () => setModal(null) },
          ]}
        >
          <p>
            {modal.power === 'undo'
              ? tr.game.undoPaidConfirmBody(modal.cost)
              : tr.game.paidConfirmBody(modal.cost)}
          </p>
        </Dialog>
      )}

      {modal?.kind === 'stuck' && (
        <Dialog
          title={tr.game.stuckTitle}
          testId="stuck-dialog"
          actions={[
            {
              label:
                free > 0
                  ? `${tr.game.undo} (${tr.game.undoFree(free)})`
                  : `${tr.game.undo} (${tr.common.cost(ECONOMY.cost.undo)})`,
              kind: 'primary',
              icon: 'undo',
              onClick: () => {
                setModal(null);
                onUndo();
              },
            },
            { label: tr.game.restartYes, icon: 'restart', onClick: performRestart },
            ...(canAddBottle(session)
              ? [
                  {
                    label: `${tr.game.extra} (${tr.common.cost(ECONOMY.cost.extraBottle)})`,
                    icon: 'bottlePlus' as IconName,
                    onClick: () => askPaid('extra', ECONOMY.cost.extraBottle),
                  },
                ]
              : []),
          ]}
        >
          <p>{tr.game.stuckBody}</p>
        </Dialog>
      )}

      {showIntro && (
        <MechanicIntro
          mechanic={ROOMS.find((r) => r.id === level.room)!.mechanic}
          onDone={() => {
            setShowIntro(false);
            const mech = ROOMS.find((r) => r.id === level.room)!.mechanic;
            app.update((s) => ({ ...s, seen: [...new Set([...s.seen, `mech-${mech}`])] }));
          }}
        />
      )}
    </div>
  );
}

function PowerButton(p: {
  icon: IconName;
  label: string;
  sub: string;
  onClick: () => void;
  testId: string;
  paid?: boolean;
  disabled?: boolean;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      className={`power${p.disabled ? ' disabled' : ''}${p.wide ? ' wide' : ''}`}
      onClick={p.onClick}
      data-testid={p.testId}
      aria-disabled={p.disabled || undefined}
    >
      <Icon name={p.icon} size={30} />
      <span className="power-text">
        <span className="power-label">{p.label}</span>
        <span className={`power-sub${p.paid ? ' paid' : ''}`}>
          {p.paid && <Icon name="dust" size={16} />}
          {p.sub}
        </span>
      </span>
    </button>
  );
}

export { topGroup };
