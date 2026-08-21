/** Build or edit a custom wheel: a name, an emoji and the wedges. */
import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';
import { Sheet } from '../../components/ui/Sheet';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/icons/Icon';
import {
  MAX_NAME,
  MAX_OPTION,
  MAX_OPTIONS,
  cleanOptions,
  saveWheel,
  type CustomWheel,
} from '../../lib/customWheels';

const EMOJI = ['🎡', '🍽️', '🛒', '🎬', '🎲', '☕', '🍕', '🏃', '🎧', '🧹', '🎁', '🍻'];

interface Props {
  open: boolean;
  /** The wheel being edited, or null to build a new one. */
  wheel: CustomWheel | null;
  /** Options to start from — used by the starter templates. */
  seed?: { name: string; emoji: string; options: string[] } | null;
  onClose: () => void;
  onSaved: (wheel: CustomWheel) => void;
}

export function WheelEditor({ open, wheel, seed, onClose, onSaved }: Props) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎡');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [error, setError] = useState<string | null>(null);

  // Re-seed whenever the sheet opens, so it never shows the previous wheel.
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (wheel) {
      setName(wheel.name);
      setEmoji(wheel.emoji);
      setOptions([...wheel.options, '']);
    } else if (seed) {
      setName(seed.name);
      setEmoji(seed.emoji);
      setOptions([...seed.options, '']);
    } else {
      setName('');
      setEmoji('🎡');
      setOptions(['', '']);
    }
  }, [open, wheel, seed]);

  const setOption = (index: number, value: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      // Typing in the last box grows the list, so there is always a blank one.
      if (index === next.length - 1 && value.trim() && next.length < MAX_OPTIONS) next.push('');
      return next;
    });
  };

  const removeOption = (index: number) =>
    setOptions((prev) => (prev.length <= 1 ? [''] : prev.filter((_, i) => i !== index)));

  const save = () => {
    const cleaned = cleanOptions(options);
    if (!name.trim()) {
      setError(t('wheels.errNoName'));
      return;
    }
    if (cleaned.length < 2) {
      setError(t('wheels.errTwo'));
      return;
    }
    const saved = saveWheel({ id: wheel?.id, name, emoji, options: cleaned });
    if (!saved) {
      setError(t('wheels.errFull'));
      return;
    }
    onSaved(saved);
    onClose();
  };

  const filled = cleanOptions(options).length;

  return (
    <Sheet open={open} onClose={onClose} title={wheel ? t('wheels.edit') : t('wheels.new')}>
      <div className="wheel-editor">
        <label className="wheel-editor__field">
          <span>{t('wheels.name')}</span>
          <input
            value={name}
            maxLength={MAX_NAME}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('wheels.namePlaceholder')}
          />
        </label>

        <div className="wheel-editor__field">
          <span>{t('wheels.icon')}</span>
          <div className="wheel-editor__emoji">
            {EMOJI.map((e) => (
              <button
                key={e}
                type="button"
                className={`wheel-editor__emoji-item ${e === emoji ? 'is-active' : ''}`}
                onClick={() => setEmoji(e)}
                aria-pressed={e === emoji}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="wheel-editor__field">
          <span>
            {t('wheels.options')}{' '}
            <em className="muted">{t('wheels.optionsHint', { n: filled })}</em>
          </span>
          <div className="wheel-editor__options">
            {options.map((option, i) => (
              <div className="wheel-editor__option" key={i}>
                <input
                  value={option}
                  maxLength={MAX_OPTION}
                  onChange={(e) => setOption(i, e.target.value)}
                  placeholder={t('wheels.optionPlaceholder', { n: i + 1 })}
                />
                <button
                  type="button"
                  className="wheel-editor__remove"
                  onClick={() => removeOption(i)}
                  aria-label={t('common.close')}
                >
                  <Icon name="x" size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="wheel-editor__error">{error}</p>}

        <Button size="lg" block icon="check" onClick={save}>
          {t('common.save')}
        </Button>
      </div>
    </Sheet>
  );
}
