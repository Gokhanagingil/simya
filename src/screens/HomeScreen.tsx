/** Ana ekran (Dükkân): tek baskın birincil eylem "Devam Et". */
import { useApp } from '../app/store';
import { Icon, type IconName } from '../components/Icon';
import { DustPill } from '../components/ui';
import { ShopIllustration } from '../components/Illustrations';
import { continueTarget, totalPerfect, totalStars } from '../game/progress';
import { availableRecipes } from '../alchemy/recipes';
import { formatNumber, tr } from '../i18n/tr';
import { getLevel } from '../levels';

export function HomeScreen() {
  const app = useApp();
  const save = app.save;
  const target = continueTarget(save);
  const stars = totalStars(save);
  const perfect = totalPerfect(save);
  const canDiscover = availableRecipes(new Set(save.materials)).length > 0;

  let sub: string;
  if (target.kind === 'level') {
    const l = getLevel(target.id)!;
    sub = tr.home.continueLevel(tr.rooms[l.room]!.name, l.index);
  } else if (target.kind === 'key') sub = tr.home.continueKey;
  else sub = tr.home.allDone;

  const onContinue = () => {
    if (target.kind === 'level') app.push({ name: 'game', levelId: target.id });
    else if (target.kind === 'key') app.push({ name: 'table' });
    else app.push({ name: 'map', room: 3 });
  };

  return (
    <div className="screen home-screen" data-testid="home">
      <header className="home-head">
        <h1 className="h1 app-title">{tr.appName}</h1>
        <DustPill amount={save.dust} />
      </header>

      <div className="home-stats" aria-label={tr.home.starsLabel}>
        <div className="stat-card">
          <Icon name="star" size={30} className="star-on" />
          <div>
            <div className="stat-num" data-testid="total-stars">
              {formatNumber(stars)}
            </div>
            <div className="stat-label">{tr.home.starsLabel}</div>
          </div>
        </div>
        <div className="stat-card">
          <Icon name="crown" size={30} className="crown" />
          <div>
            <div className="stat-num">{formatNumber(perfect)}</div>
            <div className="stat-label">{tr.home.perfectLabel}</div>
          </div>
        </div>
      </div>

      <div className="home-art" aria-hidden="true">
        <ShopIllustration />
      </div>

      <div className="home-actions">
        <button
          type="button"
          className="btn primary block huge continue-btn"
          onClick={onContinue}
          data-testid="continue"
        >
          <span className="continue-text">
            <span>{tr.home.continue}</span>
            <span className="continue-sub">{sub}</span>
          </span>
          <Icon name="play" size={34} />
        </button>
        <div className="home-grid">
          <NavButton
            icon="map"
            label={tr.home.rooms}
            onClick={() => app.push({ name: 'map', room: Math.max(1, ...save.roomsAnnounced) })}
            testId="nav-rooms"
          />
          <NavButton
            icon="flask"
            label={tr.home.table}
            onClick={() => app.push({ name: 'table' })}
            badge={canDiscover}
            testId="nav-table"
          />
          <NavButton
            icon="book"
            label={tr.home.notebook}
            onClick={() => app.push({ name: 'notebook', tab: 'story' })}
            testId="nav-notebook"
          />
          <NavButton
            icon="gear"
            label={tr.home.settings}
            onClick={() => app.push({ name: 'settings' })}
            testId="nav-settings"
          />
        </div>
      </div>
    </div>
  );
}

function NavButton(p: {
  icon: IconName;
  label: string;
  onClick: () => void;
  badge?: boolean;
  testId: string;
}) {
  return (
    <button type="button" className="btn nav-btn" onClick={p.onClick} data-testid={p.testId}>
      <Icon name={p.icon} size={30} />
      <span>{p.label}</span>
      {p.badge && <span className="badge-dot" aria-label={tr.home.newMaterial} />}
    </button>
  );
}
