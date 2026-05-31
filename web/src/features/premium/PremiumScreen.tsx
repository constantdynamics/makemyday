import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Segmented } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/icons/Icon';
import './premium.css';

const FEATURES = ['unlimited', 'radius', 'themed', 'stats', 'noads', 'offline'] as const;

export default function PremiumScreen() {
  const { t } = useI18n();
  const { profile, isGuest, updateProfile } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [busy, setBusy] = useState(false);

  const subscribe = async () => {
    if (isGuest || !profile) {
      navigate('/auth?mode=register');
      return;
    }
    // Demo flow: no real payment processor wired up.
    setBusy(true);
    try {
      await updateProfile({ is_premium: true });
      show(t('premium.current'), 'success');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="premium">
      <button className="premium__close icon-btn" onClick={() => navigate(-1)} aria-label="close">
        <Icon name="x" size={22} />
      </button>

      <div className="premium__hero">
        <span className="premium__crown">
          <Icon name="crown" size={34} color="#fff" />
        </span>
        <h1>{t('premium.title')}</h1>
        <p>{t('premium.subtitle')}</p>
      </div>

      <div className="premium__plan">
        <Segmented
          value={plan}
          onChange={setPlan}
          options={[
            { value: 'monthly', label: t('premium.monthly') },
            { value: 'yearly', label: `${t('premium.yearly')} · ${t('premium.save')}` },
          ]}
        />
        <div className="premium__price">
          <span className="premium__amount">{plan === 'monthly' ? '€1,50' : '€12'}</span>
          <span className="muted">{plan === 'monthly' ? '/mnd' : '/jr'}</span>
        </div>
      </div>

      <ul className="premium__features">
        {FEATURES.map((f) => (
          <li key={f}>
            <span className="premium__check">
              <Icon name="check" size={16} />
            </span>
            {t(`premium.features.${f}`)}
          </li>
        ))}
      </ul>

      {profile?.is_premium ? (
        <Button block size="lg" disabled icon="crown">
          {t('premium.current')}
        </Button>
      ) : (
        <Button block size="lg" loading={busy} onClick={subscribe}>
          {t('premium.cta')}
        </Button>
      )}
      <p className="premium__guarantee muted">{t('premium.guarantee')}</p>
    </div>
  );
}
