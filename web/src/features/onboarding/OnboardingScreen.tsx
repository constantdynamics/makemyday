import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useSession } from '../../contexts/SessionContext';
import { getCurrentPosition } from '../../lib/geo';
import { markOnboarded } from '../../lib/onboarding';
import { TIME_PRESETS, formatMinutes, type Transport, type GroupSize } from '../../lib/session';
import { Button } from '../../components/ui/Button';
import { Segmented } from '../../components/ui/primitives';
import { Icon } from '../../components/icons/Icon';
import './onboarding.css';

const STEPS = 3;

export default function OnboardingScreen() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { config, update } = useSession();

  const [step, setStep] = useState(0);
  const [locating, setLocating] = useState(false);
  const [located, setLocated] = useState(false);

  const finish = () => {
    markOnboarded();
    navigate('/app', { replace: true });
  };

  const next = () => (step < STEPS - 1 ? setStep(step + 1) : finish());

  const enableLocation = async () => {
    setLocating(true);
    try {
      await getCurrentPosition();
      setLocated(true);
    } catch {
      /* denied or unavailable — the app keeps working with curated ideas */
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="onb">
      <header className="onb__top">
        <div className="onb__dots" aria-hidden>
          {Array.from({ length: STEPS }, (_, i) => (
            <span key={i} className={`onb__dot ${i === step ? 'is-active' : ''}`} />
          ))}
        </div>
        <button className="onb__skip" onClick={finish}>
          {t('onboarding.skip')}
        </button>
      </header>

      {step === 0 && (
        <div className="onb__body" key="s1">
          <div className="onb__art onb__art--wheel">
            <span className="onb__art-glow" aria-hidden />
            <Icon name="dice" size={52} color="#fff" />
          </div>
          <h1>{t('onboarding.s1t')}</h1>
          <p>{t('onboarding.s1d')}</p>
        </div>
      )}

      {step === 1 && (
        <div className="onb__body" key="s2">
          <div className="onb__art">
            <span className="onb__art-glow" aria-hidden />
            <Icon name="sliders" size={46} color="#fff" />
          </div>
          <h1>{t('onboarding.s2t')}</h1>
          <p>{t('onboarding.s2d')}</p>

          <div className="onb__prefs">
            <span className="field__label">{t('session.transport')}</span>
            <Segmented<Transport>
              value={config.transport}
              onChange={(v) => update({ transport: v })}
              options={[
                { value: 'walk', label: t('session.walk'), icon: 'walk' },
                { value: 'bike', label: t('session.bike'), icon: 'bike' },
                { value: 'car', label: t('session.car'), icon: 'car' },
              ]}
            />
            <span className="field__label">{t('session.time')}</span>
            <div className="onb__times">
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
            <span className="field__label">{t('session.company')}</span>
            <Segmented<GroupSize>
              value={config.group}
              onChange={(v) => update({ group: v })}
              options={[
                { value: 'solo', label: t('session.solo'), icon: 'user' },
                { value: 'duo', label: t('session.duo'), icon: 'heart' },
                { value: 'group', label: t('session.group'), icon: 'users' },
              ]}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="onb__body" key="s3">
          <div className="onb__art">
            <span className="onb__art-glow" aria-hidden />
            <Icon name="map-pin" size={46} color="#fff" />
          </div>
          <h1>{t('onboarding.s3t')}</h1>
          <p>{t('onboarding.s3d')}</p>
          {located ? (
            <span className="onb__located">
              <Icon name="check-circle" size={18} /> {t('onboarding.locationOn')}
            </span>
          ) : (
            <Button
              size="lg"
              icon="navigation"
              loading={locating}
              onClick={enableLocation}
              className="onb__loc-btn"
            >
              {t('onboarding.enableLocation')}
            </Button>
          )}
        </div>
      )}

      <footer className="onb__cta">
        <Button
          size="lg"
          block
          onClick={next}
          iconRight={step < STEPS - 1 ? 'chevron-right' : undefined}
        >
          {step < STEPS - 1 ? t('onboarding.next') : t('onboarding.start')}
        </Button>
        {step === STEPS - 1 && !located && (
          <button className="onb__later" onClick={finish}>
            {t('onboarding.later')}
          </button>
        )}
      </footer>
    </div>
  );
}
