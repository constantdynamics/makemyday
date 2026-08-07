/**
 * Fullscreen host for the take-over mechanics: an app bar with a way back and
 * a way to swap method, and the mechanic itself underneath.
 *
 * The phase and the drawn suggestion live one level up, in the dashboard, so
 * the wheel and the take-over mechanics share a single state machine.
 */
import { Suspense, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { Icon } from '../../components/icons/Icon';
import { Spinner } from '../../components/ui/primitives';
import { mechanicMeta, type MechanicId } from '../../lib/mechanic';
import { FULLSCREEN_MECHANICS, isFullscreen } from './mechanics';
import type { MechanicProps } from './types';

interface Props extends Omit<MechanicProps, 'reducedMotion'> {
  mechanic: MechanicId;
  reducedMotion: boolean;
  onClose: () => void;
  onSwap: () => void;
}

export function MechanicHost({ mechanic, onClose, onSwap, ...mech }: Props) {
  const { t } = useI18n();

  // The overlay owns Escape and the page scroll while it's up.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!isFullscreen(mechanic)) return null;
  const Mechanic = FULLSCREEN_MECHANICS[mechanic];
  const meta = mechanicMeta(mechanic);

  return (
    <div className="mech-host" role="dialog" aria-modal="true">
      <header className="mech-host__bar">
        <button className="mech-host__back" onClick={onClose} aria-label={t('common.back')}>
          <Icon name="chevron-left" size={22} />
        </button>
        <h2 className="mech-host__title">{t(`mechanic.${mechanic}.name`)}</h2>
        <button
          className="method-bar__swap"
          onClick={onSwap}
          style={{ marginLeft: 0, color: meta.accent }}
        >
          <Icon name="refresh" size={15} />
          {t('method.swap')}
        </button>
      </header>

      <div className="mech-host__body">
        <Suspense
          fallback={
            <div className="screen-center">
              <Spinner size={30} />
            </div>
          }
        >
          <Mechanic {...mech} />
        </Suspense>
      </div>
    </div>
  );
}
