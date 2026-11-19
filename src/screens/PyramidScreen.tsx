/** Keşif piramidi: katmanlar; keşfedilenler renkli ve adlı, diğerleri "?" silüeti. */
import { useApp } from '../app/store';
import { MaterialIcon } from '../components/MaterialIcon';
import { TopBar } from '../components/ui';
import { APEX_ID, MATERIALS } from '../alchemy/recipes';
import { tr } from '../i18n/tr';

export function PyramidScreen() {
  const app = useApp();
  const owned = new Set(app.save.materials);
  const compounds = MATERIALS.filter((m) => m.kind === 'compound');
  const found = compounds.filter((m) => owned.has(m.id)).length;
  const layers = [3, 2, 1] as const;
  return (
    <div className="screen pyramid-screen" data-testid="pyramid">
      <TopBar title={tr.pyramid.title} />
      <div className="scroll">
        <p className="muted center">{tr.pyramid.discovered(found, compounds.length)}</p>
        <div className="pyramid">
          <div className="pyr-apex" aria-label={`${tr.pyramid.apex}: ${tr.pyramid.apexLocked}`}>
            <MaterialIcon id={APEX_ID} size={68} />
            <span className="pyr-name">{tr.pyramid.apex}</span>
          </div>
          <p className="muted small center">{tr.pyramid.apexLocked}</p>
          {layers.map((layer) => (
            <section key={layer} className="pyr-layer">
              <h2 className="pyr-title">{tr.pyramid.layers[layer]}</h2>
              <div className="pyr-row">
                {MATERIALS.filter((m) => m.layer === layer).map((m) => {
                  const known = owned.has(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`pyr-cell${known ? ' known' : ''}`}
                      data-testid={`pyr-${m.id}`}
                      role="img"
                      aria-label={
                        known
                          ? tr.materials[m.id as keyof typeof tr.materials].name
                          : tr.pyramid.unknown
                      }
                    >
                      <MaterialIcon id={m.id} size={52} unknown={!known} />
                      {known && (
                        <span className="pyr-name">
                          {tr.materials[m.id as keyof typeof tr.materials].name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          <section className="pyr-layer base">
            <h2 className="pyr-title">{tr.pyramid.base}</h2>
            <div className="pyr-row">
              {MATERIALS.filter((m) => m.layer === 0).map((m) => {
                const known = owned.has(m.id);
                return (
                  <div
                    key={m.id}
                    className={`pyr-cell${known ? ' known' : ''}`}
                    role="img"
                    aria-label={
                      known
                        ? tr.materials[m.id as keyof typeof tr.materials].name
                        : tr.pyramid.unknown
                    }
                  >
                    <MaterialIcon id={m.id} size={52} unknown={!known} />
                    {known && (
                      <span className="pyr-name">
                        {tr.materials[m.id as keyof typeof tr.materials].name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
