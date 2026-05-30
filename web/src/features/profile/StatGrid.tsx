import { useI18n } from '../../i18n';
import { Icon } from '../../components/icons/Icon';

interface Props {
  completed: number;
  streak: number;
  xp: number;
  level: number;
}

export function StatGrid({ completed, streak, xp, level }: Props) {
  const { t } = useI18n();
  const stats = [
    { icon: 'check-circle', value: completed, label: t('stats.completed'), color: 'var(--green-500)' },
    { icon: 'fire', value: streak, label: t('stats.streak'), color: 'var(--amber-500)' },
    { icon: 'bolt', value: xp, label: t('stats.xp'), color: 'var(--brand-500)' },
    { icon: 'trophy', value: level, label: t('stats.level'), color: 'var(--accent-500)' },
  ];
  return (
    <div className="stat-grid">
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <span className="stat__icon" style={{ color: s.color }}>
            <Icon name={s.icon} size={18} />
          </span>
          <span className="stat__value">{s.value}</span>
          <span className="stat__label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
