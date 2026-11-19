/** Odalar ve bölüm haritası. Her bölüm numaralı bir şişe; yıldızlar ve kusursuz işareti. */
import { useApp } from '../app/store';
import { Icon } from '../components/Icon';
import { Stars, TopBar } from '../components/ui';
import { ROOMS } from '../config/rooms';
import { isLevelUnlocked, isRoomUnlocked, roomStars } from '../game/progress';
import { tr } from '../i18n/tr';
import { levelsOfRoom } from '../levels';

export function MapScreen({ room }: { room: number }) {
  const app = useApp();
  const save = app.save;
  const unlocked = isRoomUnlocked(save, room);
  const levels = levelsOfRoom(room);
  const done = levels.filter((l) => save.levels[l.id]?.completions).length;
  const rs = roomStars(save, room);
  const def = ROOMS.find((r) => r.id === room)!;

  return (
    <div className="screen map-screen" data-testid="map">
      <TopBar title={tr.map.title} />
      <div className="room-tabs" role="tablist">
        {ROOMS.map((r) => {
          const open = isRoomUnlocked(save, r.id);
          return (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={r.id === room}
              className={`room-tab${r.id === room ? ' active' : ''}`}
              onClick={() => app.replace({ name: 'map', room: r.id })}
              data-testid={`room-tab-${r.id}`}
            >
              {!open && <Icon name="lock" size={20} />}
              <span>{tr.rooms[r.id]!.name}</span>
            </button>
          );
        })}
      </div>
      <div className="scroll">
        <div className="room-head">
          <p className="muted room-tagline">{tr.rooms[room]!.tagline}</p>
          {unlocked && (
            <p className="room-progress">
              <span>{tr.map.progress(done, levels.length)}</span>
              <span className="dot">·</span>
              <span>{tr.map.stars(rs.stars, rs.max)}</span>
            </p>
          )}
        </div>
        {!unlocked ? (
          <div className="card locked-room" data-testid="room-locked">
            <Icon name="lock" size={44} />
            <p>{tr.map.roomLocked}</p>
            <p className="muted">
              {tr.map.roomLockedHow(tr.materials[def.key as keyof typeof tr.materials]?.name ?? '')}
            </p>
          </div>
        ) : (
          <div className="level-grid">
            {levels.map((l) => {
              const rec = save.levels[l.id];
              const open = isLevelUnlocked(save, l);
              const current = open && !rec?.completions;
              return (
                <button
                  key={l.id}
                  type="button"
                  className={`level-cell${open ? '' : ' locked'}${current ? ' current' : ''}`}
                  onClick={() =>
                    open ? app.push({ name: 'game', levelId: l.id }) : app.toast(tr.map.levelLocked)
                  }
                  aria-label={`${tr.map.level(l.index)}${open ? '' : `, ${tr.common.locked}`}${rec?.stars ? `, ${tr.result.starsAria(rec.stars)}` : ''}${rec?.perfect ? `, ${tr.common.perfect}` : ''}`}
                  data-testid={`level-${l.index}`}
                >
                  <span className="cell-bottle" aria-hidden="true">
                    <svg viewBox="0 0 40 52" width="40" height="52">
                      <path
                        d="M14 3h12v8l8 9v24a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5V20l8-9Z"
                        fill={open ? '#241f1d' : '#cbbb98'}
                        stroke="#3d2414"
                        strokeWidth="2.4"
                        strokeLinejoin="round"
                      />
                      {rec?.completions ? (
                        <path d="M8 30h24v14a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3Z" fill="#e5b343" />
                      ) : null}
                    </svg>
                    <span className="cell-num">
                      {open ? l.index : <Icon name="lock" size={20} />}
                    </span>
                  </span>
                  <span className="cell-stars">
                    {rec?.perfect ? <Icon name="crown" size={22} className="crown" /> : null}
                    {open && rec?.completions ? <Stars count={rec.stars} size={18} /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
