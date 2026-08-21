/**
 * "Jouw sessie" — transport, time, company, and how far the wheel may send you.
 *
 * Shared by the dashboard and the play screen, because the same settings drive
 * both: transport and time decide what gets searched, and the range decides
 * which rings the kilometre wheel offers.
 */
import { useI18n } from '../../i18n';
import { useSession } from '../../contexts/SessionContext';
import { Sheet } from '../../components/ui/Sheet';
import { Segmented } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/icons/Icon';
import {
  TIME_PRESETS,
  RANGE_LIMITS,
  clampRange,
  formatKm,
  formatMinutes,
  transportLabel,
  type GroupSize,
  type Transport,
} from '../../lib/session';

/** Slider steps, so short ranges stay adjustable and long ones stay quick. */
function stepFor(maxKm: number): number {
  if (maxKm <= 5) return 0.1;
  if (maxKm <= 25) return 0.5;
  return 1;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** The dashboard hands back its chicken-out budget when settings change. */
  onApply?: () => void;
}

export function SessionSheet({ open, onClose, onApply }: Props) {
  const { t, lang } = useI18n();
  const { config, update, ranges, setRange, resetRanges } = useSession();

  const cap = RANGE_LIMITS[config.transport];
  const range = clampRange(config.transport, ranges[config.transport]);
  const step = stepFor(cap.maxKm);

  return (
    <Sheet open={open} onClose={onClose} title={t('session.title')}>
      <p className="muted session-setup__sub">{t('session.subtitle')}</p>

      <p className="field__label">{t('session.transport')}</p>
      <Segmented<Transport>
        value={config.transport}
        onChange={(v) => update({ transport: v })}
        options={[
          { value: 'walk', label: t('session.walk'), icon: 'walk' },
          { value: 'bike', label: t('session.bike'), icon: 'bike' },
          { value: 'car', label: t('session.car'), icon: 'car' },
        ]}
      />

      {/* The range belongs to the transport mode: a walking wheel and a car
          wheel are different games, and each remembers its own setting. */}
      <p className="field__label">
        {t('session.range', { transport: transportLabel(config.transport, lang) })}
        <span className="session-range__value">
          {formatKm(range.minKm, lang)}–{formatKm(range.maxKm, lang)} km
        </span>
      </p>
      <label className="session-range">
        <span className="session-range__label">{t('session.rangeFrom')}</span>
        <input
          type="range"
          min={0}
          max={Math.max(0, range.maxKm - cap.minKm)}
          step={step}
          value={range.minKm}
          onChange={(e) => setRange(config.transport, { ...range, minKm: Number(e.target.value) })}
        />
        <output>{formatKm(range.minKm, lang)}</output>
      </label>
      <label className="session-range">
        <span className="session-range__label">{t('session.rangeTo')}</span>
        <input
          type="range"
          min={cap.minKm}
          max={cap.maxKm}
          step={step}
          value={range.maxKm}
          onChange={(e) => setRange(config.transport, { ...range, maxKm: Number(e.target.value) })}
        />
        <output>{formatKm(range.maxKm, lang)}</output>
      </label>
      <p className="session-range__note">{t('session.rangeNote')}</p>
      <button className="session-range__reset" onClick={resetRanges}>
        <Icon name="refresh" size={14} /> {t('session.rangeReset')}
      </button>

      <p className="field__label">{t('session.time')}</p>
      <div className="session-setup__times">
        {TIME_PRESETS.map((m) => (
          <button
            key={m}
            className={`chip ${config.minutes === m ? 'is-active' : ''}`}
            onClick={() => update({ minutes: m })}
          >
            {formatMinutes(m, lang)}
          </button>
        ))}
      </div>

      <p className="field__label">{t('session.company')}</p>
      <Segmented<GroupSize>
        value={config.group}
        onChange={(v) => update({ group: v })}
        options={[
          { value: 'solo', label: t('session.solo'), icon: 'user' },
          { value: 'duo', label: t('session.duo'), icon: 'heart' },
          { value: 'group', label: t('session.group'), icon: 'users' },
        ]}
      />

      <Button
        block
        size="lg"
        className="session-setup__apply"
        onClick={() => {
          onApply?.();
          onClose();
        }}
      >
        {t('session.apply')}
      </Button>
    </Sheet>
  );
}
