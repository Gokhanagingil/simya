/** Oda anahtarı / kilit açılış sahnesi. */
import { useEffect } from 'react';
import { useApp } from '../app/store';
import { sound } from '../audio/sound';
import { Icon } from '../components/Icon';
import { MaterialIcon } from '../components/MaterialIcon';
import { ROOMS } from '../config/rooms';
import { tr } from '../i18n/tr';
import { levelId } from '../levels';

export function UnlockScreen({ room }: { room: number }) {
  const app = useApp();
  const def = ROOMS.find((r) => r.id === room)!;
  const t = tr.story.unlock[room]!;
  useEffect(() => {
    sound.play('discover');
    app.update((s) => ({ ...s, roomsAnnounced: [...new Set([...s.roomsAnnounced, room])] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);
  return (
    <div className="screen unlock-screen" data-testid="unlock">
      <div className="unlock-art" aria-hidden="true">
        <div className="unlock-ring">
          <MaterialIcon id={def.key!} size={120} />
        </div>
        <Icon name="key" size={48} className="unlock-key" />
      </div>
      <h1 className="h1 center">{t.title}</h1>
      <p className="center">{t.body}</p>
      <div className="unlock-actions">
        <button
          type="button"
          className="btn primary block huge"
          onClick={() => app.reset({ name: 'game', levelId: levelId(room, 1) })}
          data-testid="unlock-go"
        >
          {tr.story.unlockGo}: {tr.rooms[room]!.name}
          <Icon name="play" />
        </button>
      </div>
    </div>
  );
}
