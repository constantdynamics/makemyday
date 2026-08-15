/** "Hoe wil je kiezen?" — the twelve mechanics, two to a row. */
import { useI18n } from '../../i18n';
import { Sheet } from '../../components/ui/Sheet';
import { Icon } from '../../components/icons/Icon';
import { MECHANICS, tint, type MechanicId } from '../../lib/mechanic';

interface Props {
  open: boolean;
  current: MechanicId;
  onClose: () => void;
  onPick: (id: MechanicId) => void;
}

export function MethodSheet({ open, current, onClose, onPick }: Props) {
  const { t } = useI18n();

  return (
    <Sheet open={open} onClose={onClose} title={t('method.title')}>
      <p className="muted method-sheet__sub">{t('method.subtitle')}</p>
      <div className="method-grid">
        {MECHANICS.map((m) => {
          const active = m.id === current;
          return (
            <button
              key={m.id}
              className="method-card"
              aria-pressed={active}
              onClick={() => onPick(m.id)}
              style={
                active
                  ? {
                      background: tint(m.accent, 14),
                      borderColor: tint(m.accent, 55),
                      boxShadow: `0 0 0 1px ${tint(m.accent, 30)}, 0 10px 26px rgba(0,0,0,.35)`,
                    }
                  : undefined
              }
            >
              <span
                className="method-card__icon"
                style={{ background: tint(m.accent, 18), color: m.accent }}
              >
                <Icon name={m.icon} size={20} />
              </span>
              <span className="method-card__name">{t(`mechanic.${m.id}.name`)}</span>
              <span className="method-card__desc">{t(`mechanic.${m.id}.desc`)}</span>
              {active && (
                <span className="method-card__check" style={{ background: m.accent }}>
                  <Icon name="check" size={12} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
