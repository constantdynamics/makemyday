import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useChallenges } from '../../hooks/useChallenges';
import { Card, Badge, ProgressBar, Spinner } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/icons/Icon';
import type { Challenge } from '../../types/db';
import './challenges.css';

const DIFF_COLOR: Record<string, string> = {
  easy: 'var(--green-500)',
  medium: 'var(--amber-500)',
  hard: 'var(--red-500)',
};

export default function ChallengesScreen() {
  const { t, lang } = useI18n();
  const { isGuest, profile } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const { challenges, completed, loading, completeChallenge } = useChallenges();

  const title = (c: Challenge) => (lang === 'nl' ? c.title_nl : c.title_en);
  const desc = (c: Challenge) => (lang === 'nl' ? c.description_nl : c.description_en) ?? '';
  const doneCount = Object.keys(completed).length;

  const onComplete = async (c: Challenge) => {
    if (isGuest || !profile) {
      show(t('toast.loginRequired'), 'info');
      navigate('/auth?mode=register');
      return;
    }
    try {
      await completeChallenge(c.id);
      show(t('toast.challengeDone', { n: c.points }), 'success');
    } catch {
      show(t('common.error'), 'error');
    }
  };

  if (loading) return <div className="screen-center"><Spinner /></div>;

  return (
    <div className="challenges">
      <header className="screen-head">
        <h1>{t('challenges.title')}</h1>
        <p className="muted">{t('challenges.subtitle')}</p>
      </header>

      <Card className="challenges__progress">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <strong>{t('challenges.progress', { done: doneCount, total: challenges.length })}</strong>
          <Badge color="var(--brand-500)">{Math.round((doneCount / Math.max(1, challenges.length)) * 100)}%</Badge>
        </div>
        <ProgressBar value={(doneCount / Math.max(1, challenges.length)) * 100} />
      </Card>

      <div className="challenges__list">
        {challenges.map((c) => {
          const isDone = !!completed[c.id];
          return (
            <Card key={c.id} className={`challenge ${isDone ? 'is-done' : ''}`}>
              <span className="challenge__icon" style={{ background: `${DIFF_COLOR[c.difficulty]}1f`, color: DIFF_COLOR[c.difficulty] }}>
                <Icon name={isDone ? 'check-circle' : c.icon} size={22} />
              </span>
              <div className="challenge__body">
                <div className="challenge__head">
                  <strong>{title(c)}</strong>
                  <Badge color="var(--brand-500)">{t('challenges.points', { n: c.points })}</Badge>
                </div>
                <p className="muted">{desc(c)}</p>
                <div className="challenge__foot">
                  <Badge color={DIFF_COLOR[c.difficulty]} tone="soft">
                    {t(`challenges.difficulty.${c.difficulty}`)}
                  </Badge>
                  {isDone ? (
                    <span className="challenge__done">
                      <Icon name="check" size={15} /> {t('challenges.done')}
                    </span>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => onComplete(c)}>
                      {t('challenges.markDone')}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
