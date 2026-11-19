/** Defter: Hikâye, Tarifler, İpuçları ve bilmeceler, Nasıl oynanır. */
import { useApp, type Screen } from '../app/store';
import { Icon } from '../components/Icon';
import { MaterialIcon } from '../components/MaterialIcon';
import { TopBar } from '../components/ui';
import { StoryIllustration } from '../components/Illustrations';
import { MATERIALS, RECIPES } from '../alchemy/recipes';
import { ROOMS } from '../config/rooms';
import { awaitingKey, isRoomUnlocked } from '../game/progress';
import { tr } from '../i18n/tr';
import { MechanicDemo } from './MechanicIntro';

type Tab = Extract<Screen, { name: 'notebook' }>['tab'];
type MatKey = keyof typeof tr.materials;
const name = (id: string) => tr.materials[id as MatKey]?.name ?? id;

export function NotebookScreen({ tab, page }: { tab: Tab; page?: string }) {
  const app = useApp();
  const tabs: Tab[] = ['story', 'recipes', 'riddles', 'howto'];
  return (
    <div className="screen notebook-screen" data-testid="notebook">
      <TopBar title={tr.notebook.title} />
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={t === tab}
            className={`tab${t === tab ? ' active' : ''}`}
            onClick={() => app.replace({ name: 'notebook', tab: t })}
            data-testid={`tab-${t}`}
          >
            {tr.notebook.tabs[t]}
          </button>
        ))}
      </div>
      <div className="scroll notebook-page">
        {tab === 'story' && <StoryTab page={page} />}
        {tab === 'recipes' && <RecipesTab />}
        {tab === 'riddles' && <RiddlesTab />}
        {tab === 'howto' && <HowToTab />}
      </div>
    </div>
  );
}

function StoryTab({ page }: { page?: string }) {
  const app = useApp();
  const unlocked = new Set(app.save.story);
  const rooms = [1, 2, 3] as const;

  // Oda bittiğinde bu sayfaya gelinir: sayfa öne çıkar ve "Devam" bir sonraki adıma götürür.
  if (page) {
    const key = page as 'oda1' | 'oda2' | 'oda3';
    const p = tr.story[key];
    const onContinue = () => {
      const waiting = awaitingKey(app.save);
      if (waiting) app.replace({ name: 'table' });
      else {
        const next = ROOMS.find((r) => r.id === Number(key.slice(3)) + 1);
        if (next && isRoomUnlocked(app.save, next.id)) app.replace({ name: 'map', room: next.id });
        else app.reset({ name: 'home' });
      }
    };
    return (
      <article className="story-page featured" data-testid="story-featured">
        <h2 className="h2">{p.title}</h2>
        {p.body.split('\n\n').map((para, i) => (
          <p key={i} className={para.startsWith('“') ? 'handwriting' : ''}>
            {para}
          </p>
        ))}
        <button
          type="button"
          className="btn primary block huge"
          onClick={onContinue}
          data-testid="story-continue"
        >
          {tr.common.continue}
          <Icon name="play" />
        </button>
      </article>
    );
  }

  return (
    <>
      <article className="story-page">
        <div className="story-art">
          <StoryIllustration page={2} />
        </div>
        {tr.intro.pages.map((p) => (
          <section key={p.title}>
            <h2 className="h2">{p.title}</h2>
            <p>{p.body}</p>
          </section>
        ))}
      </article>
      {rooms.map((r) => {
        const key = `oda${r}` as const;
        const p = tr.story[key];
        return unlocked.has(key) ? (
          <article key={key} className="story-page">
            <h2 className="h2">{p.title}</h2>
            {p.body.split('\n\n').map((para, i) => (
              <p key={i} className={para.startsWith('“') ? 'handwriting' : ''}>
                {para}
              </p>
            ))}
          </article>
        ) : (
          <article key={key} className="story-page locked">
            <Icon name="lock" size={28} />
            <p className="muted">{tr.notebook.storyLocked}</p>
          </article>
        );
      })}
    </>
  );
}

function RecipesTab() {
  const app = useApp();
  const owned = new Set(app.save.materials);
  const found = RECIPES.filter((r) => owned.has(r.result));
  if (found.length === 0) return <p className="muted">{tr.notebook.noRecipes}</p>;
  return (
    <ul className="recipe-list">
      {found.map((r) => (
        <li key={r.result} className="recipe">
          <MaterialIcon id={r.result} size={52} />
          <div>
            <strong>{name(r.result)}</strong>
            <div className="muted">{tr.notebook.recipeLine(name(r.a), name(r.b))}</div>
            <div className="small">{tr.materials[r.result as MatKey].text}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function RiddlesTab() {
  const app = useApp();
  const owned = new Set(app.save.materials);
  const keys = new Set(ROOMS.map((r) => r.key).filter(Boolean));
  const open = MATERIALS.filter((m) => m.kind === 'compound' && !owned.has(m.id));
  return (
    <>
      <section className="card principles">
        <h2 className="h2">{tr.notebook.principles}</h2>
        <ul>
          {tr.principles
            .filter((p) => owned.has(p.id) || ['ates', 'su', 'hava', 'toprak'].includes(p.id))
            .map((p) => (
              <li key={p.id}>{p.text}</li>
            ))}
        </ul>
      </section>
      <p className="muted">{open.length ? tr.notebook.riddlesIntro : tr.notebook.noRiddles}</p>
      <ul className="riddle-list">
        {open.map((m) => (
          <li key={m.id} className="riddle-item">
            <MaterialIcon id={m.id} size={44} unknown />
            <div>
              {keys.has(m.id) && (
                <span className="key-badge">
                  <Icon name="key" size={18} /> {tr.notebook.keyBadge}
                </span>
              )}
              <p className="riddle">{tr.materials[m.id as MatKey].riddle}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function HowToTab() {
  return (
    <>
      <p className="muted">{tr.howto.intro}</p>
      {(['classic', 'fog', 'mix'] as const).map((m) => (
        <section key={m} className="card howto-card">
          <h2 className="h2">{tr.mechanics[m].title}</h2>
          <p>{tr.mechanics[m].body}</p>
          <MechanicDemo mechanic={m} />
          <ul className="rule-list">
            {tr.mechanics[m].rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      ))}
      <section className="card howto-card">
        <h2 className="h2">{tr.howto.powersTitle}</h2>
        <ul className="rule-list">
          {tr.howto.powers.map((p) => (
            <li key={p.id}>{p.text}</li>
          ))}
        </ul>
        <p className="small">{tr.howto.powersNote}</p>
      </section>
      <section className="card howto-card">
        <h2 className="h2">{tr.howto.starsTitle}</h2>
        <ul className="rule-list">
          {tr.howto.stars.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
      <section className="card howto-card">
        <h2 className="h2">{tr.howto.tableTitle}</h2>
        <ul className="rule-list">
          {tr.howto.table.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
