import { useEffect, type ReactNode } from 'react';
import { useApp } from '../app/store';
import { formatNumber, tr } from '../i18n/tr';
import { Icon, type IconName } from './Icon';

export function TopBar({
  title,
  onBack,
  right,
}: {
  title: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const app = useApp();
  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-btn"
        onClick={onBack ?? app.pop}
        aria-label={tr.common.back}
        data-testid="back"
      >
        <Icon name="back" />
        <span>{tr.common.back}</span>
      </button>
      <h1 className="title">{title}</h1>
      {right}
    </header>
  );
}

export function DustPill({ amount }: { amount: number }) {
  return (
    <span className="pill dust-pill" aria-label={`${tr.common.dust}: ${amount}`} data-testid="dust">
      <Icon name="dust" size={22} className="dust-icon" />
      <span className="num">{formatNumber(amount)}</span>
    </span>
  );
}

export function Stars({
  count,
  size = 26,
  max = 3,
}: {
  count: number;
  size?: number;
  max?: number;
}) {
  return (
    <span className="stars" role="img" aria-label={tr.result.starsAria(count)}>
      {Array.from({ length: max }, (_, i) => (
        <Icon
          key={i}
          name={i < count ? 'star' : 'starOutline'}
          size={size}
          className={i < count ? 'star-on' : 'star-off'}
        />
      ))}
    </span>
  );
}

export interface DialogAction {
  label: string;
  kind?: 'primary' | 'danger' | 'plain';
  onClick: () => void;
  testId?: string;
  icon?: IconName;
}

/** Büyük, açık düğmeli pencere. Geri tuşu "Vazgeç" gibi davranır. */
export function Dialog({
  title,
  children,
  actions,
  onDismiss,
  testId,
}: {
  title: string;
  children?: ReactNode;
  actions: DialogAction[];
  onDismiss?: () => void;
  testId?: string;
}) {
  const app = useApp();
  useEffect(() => {
    if (!onDismiss) return;
    const prev = app.backHandler.current;
    app.setBackHandler(() => {
      onDismiss();
      return true;
    });
    return () => app.setBackHandler(prev);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      className="overlay"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onDismiss?.()}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        data-testid={testId}
      >
        <h2 id="dlg-title">{title}</h2>
        {children}
        <div className="actions">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              className={`btn block ${a.kind === 'primary' ? 'primary' : a.kind === 'danger' ? 'danger' : ''}`}
              onClick={a.onClick}
              data-testid={a.testId}
            >
              {a.icon && <Icon name={a.icon} />}
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
