import { useEffect, useState } from 'react';
import { sound } from '../audio/sound';
import { Dialog } from '../components/ui';
import { tr } from '../i18n/tr';
import { exitApp, onBackButton } from '../platform/native';
import { AboutScreen } from '../screens/AboutScreen';
import { DevScreen } from '../screens/DevScreen';
import { GameScreen } from '../screens/GameScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { IntroScreen } from '../screens/IntroScreen';
import { MapScreen } from '../screens/MapScreen';
import { NotebookScreen } from '../screens/NotebookScreen';
import { PyramidScreen } from '../screens/PyramidScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TableScreen } from '../screens/TableScreen';
import { UnlockScreen } from '../screens/UnlockScreen';
import { useApp } from './store';

export function App() {
  const app = useApp();
  const [askExit, setAskExit] = useState(false);
  const { sound: sfx, music, volume } = app.save.settings;

  useEffect(() => {
    sound.configure({ sfx, music, volume });
  }, [sfx, music, volume]);

  // Tarayıcı/WebView sesi ilk dokunuşta açar.
  useEffect(() => {
    const unlock = () => sound.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  // Android geri tuşu: önce ekranın kendi işleyicisi, sonra bir önceki ekran, ana ekranda çıkış sorusu.
  useEffect(
    () =>
      onBackButton(() => {
        if (app.backHandler.current?.()) return;
        if (askExit) {
          setAskExit(false);
          return;
        }
        if (app.stack.length > 1) app.pop();
        else if (app.screen.name === 'home') setAskExit(true);
        else app.reset({ name: 'home' });
      }),
    [app, askExit],
  );

  const s = app.screen;
  const key = app.stack.length + ':' + JSON.stringify(s);
  let view: React.ReactNode;
  switch (s.name) {
    case 'intro':
      view = <IntroScreen />;
      break;
    case 'home':
      view = <HomeScreen />;
      break;
    case 'map':
      view = <MapScreen room={s.room} />;
      break;
    case 'game':
      view = <GameScreen key={`${s.levelId}:${s.nonce ?? 0}`} levelId={s.levelId} />;
      break;
    case 'table':
      view = <TableScreen />;
      break;
    case 'pyramid':
      view = <PyramidScreen />;
      break;
    case 'notebook':
      view = <NotebookScreen tab={s.tab} page={s.page} />;
      break;
    case 'settings':
      view = <SettingsScreen />;
      break;
    case 'about':
      view = <AboutScreen />;
      break;
    case 'dev':
      view = <DevScreen />;
      break;
    case 'unlock':
      view = <UnlockScreen room={s.room} />;
      break;
  }

  return (
    <div className="app" key={s.name === 'game' ? 'game' : key}>
      {view}
      {askExit && (
        <Dialog
          title={tr.home.exitTitle}
          onDismiss={() => setAskExit(false)}
          testId="exit-dialog"
          actions={[
            {
              label: tr.home.exitNo,
              kind: 'primary',
              onClick: () => setAskExit(false),
              testId: 'exit-no',
            },
            { label: tr.home.exitYes, onClick: () => exitApp(), testId: 'exit-yes' },
          ]}
        >
          <p>{tr.home.exitBody}</p>
        </Dialog>
      )}
    </div>
  );
}
