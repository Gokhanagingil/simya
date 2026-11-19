/** Açılış hikâyesi: 4 kısa, resimli ve atlanabilir sayfa. */
import { useState } from 'react';
import { useApp } from '../app/store';
import { Icon } from '../components/Icon';
import { StoryIllustration } from '../components/Illustrations';
import { tr } from '../i18n/tr';

export function IntroScreen() {
  const app = useApp();
  const [i, setI] = useState(0);
  const pages = tr.intro.pages;
  const p = pages[i]!;
  const last = i === pages.length - 1;
  const finish = () => {
    app.update((s) => ({
      ...s,
      introSeen: true,
      story: s.story.includes('giris') ? s.story : [...s.story, 'giris'],
    }));
    app.reset({ name: 'home' });
    // Öğretici, ilk bölüm açılınca başlar.
    if (!app.save.tutorialDone) app.push({ name: 'game', levelId: 'oda1-b01' });
  };
  return (
    <div className="screen intro-screen" data-testid="intro">
      <div className="intro-top">
        <span className="muted">
          {i + 1} / {pages.length}
        </span>
        <button type="button" className="btn" onClick={finish} data-testid="intro-skip">
          {tr.common.skip}
        </button>
      </div>
      <div className="intro-art" key={i}>
        <StoryIllustration page={i} />
      </div>
      <div className="intro-text" key={`t${i}`}>
        <h1 className="h1">{p.title}</h1>
        <p>{p.body}</p>
      </div>
      <div className="intro-actions">
        {i > 0 && (
          <button type="button" className="btn" onClick={() => setI(i - 1)}>
            <Icon name="back" />
            {tr.common.back}
          </button>
        )}
        <button
          type="button"
          className="btn primary grow"
          onClick={() => (last ? finish() : setI(i + 1))}
          data-testid="intro-next"
        >
          {last ? tr.intro.start : tr.common.next}
          <Icon name="play" />
        </button>
      </div>
    </div>
  );
}
