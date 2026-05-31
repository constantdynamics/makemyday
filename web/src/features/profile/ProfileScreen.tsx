import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n';
import { useToast } from '../../contexts/ToastContext';
import { useCompletions } from '../../hooks/useCompletions';
import { useCatalog, categoryName } from '../../hooks/useCatalog';
import { StatGrid } from './StatGrid';
import { Card, ProgressBar, EmptyState, Spinner, Avatar } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { Icon } from '../../components/icons/Icon';
import { timeAgo } from '../../lib/format';
import './profile.css';

const AVATARS = ['🧭', '🦊', '🐙', '🚀', '🌻', '🦄', '🐳', '🍀', '⭐', '🎒', '🏔️', '🎨'];
const LEVEL_XP = 250;

export default function ProfileScreen() {
  const { t, lang } = useI18n();
  const { profile, isGuest, user, updateProfile } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const { items, count, loading } = useCompletions();
  const { categories } = useCatalog();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.display_name ?? '');
  const [avatar, setAvatar] = useState(profile?.avatar_emoji ?? '🧭');
  const [saving, setSaving] = useState(false);

  if (isGuest || !user || !profile) {
    return (
      <div className="profile">
        <header className="screen-head">
          <h1>{t('profile.title')}</h1>
        </header>
        <EmptyState
          icon="user"
          title={t('profile.guest')}
          body={t('profile.guestSub')}
          action={
            <Button onClick={() => navigate('/auth?mode=register')}>{t('auth.signUp')}</Button>
          }
        />
      </div>
    );
  }

  const xpInLevel = profile.xp % LEVEL_XP;
  const toNext = LEVEL_XP - xpInLevel;
  const memberSince = new Date(profile.created_at).toLocaleDateString(
    lang === 'nl' ? 'nl-NL' : 'en-US',
    {
      month: 'long',
      year: 'numeric',
    }
  );

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ display_name: name.trim() || null, avatar_emoji: avatar });
      show(t('common.done'), 'success');
      setEditing(false);
    } catch {
      show(t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile">
      <header className="screen-head profile__head">
        <h1>{t('profile.title')}</h1>
        <button className="icon-btn" onClick={() => navigate('/settings')} aria-label="settings">
          <Icon name="settings" size={20} />
        </button>
      </header>

      <Card className="profile__card">
        <Avatar emoji={profile.avatar_emoji} size={72} />
        <h2>{profile.display_name || t('profile.guest')}</h2>
        <p className="muted">{t('profile.member', { date: memberSince })}</p>
        <div className="profile__level">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>Level {profile.level}</strong>
            <span className="muted">
              {t('profile.nextLevel', { n: toNext, level: profile.level + 1 })}
            </span>
          </div>
          <ProgressBar value={(xpInLevel / LEVEL_XP) * 100} />
        </div>
        <Button variant="secondary" size="sm" icon="edit" onClick={() => setEditing(true)}>
          {t('profile.edit')}
        </Button>
      </Card>

      <StatGrid
        completed={count}
        streak={profile.streak_count}
        xp={profile.xp}
        level={profile.level}
      />

      <section>
        <h2 className="section-title">{t('profile.history')}</h2>
        {loading ? (
          <div className="screen-center">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon="compass" title={t('profile.noHistory')} />
        ) : (
          <div className="history">
            {items.map((c) => {
              const cat = categories.find((x) => x.id === c.category_id);
              return (
                <Card key={c.id} className="history__row">
                  {c.photo_url ? (
                    <img className="history__photo" src={c.photo_url} alt="" loading="lazy" />
                  ) : (
                    <span
                      className="history__icon"
                      style={{ background: `${cat?.color ?? '#888'}22`, color: cat?.color }}
                    >
                      <Icon name={cat?.icon ?? 'check'} size={18} />
                    </span>
                  )}
                  <div className="history__body">
                    <strong>{c.title}</strong>
                    <span className="muted">
                      {cat ? categoryName(cat, lang) : c.source} · {timeAgo(c.completed_at, lang)}
                    </span>
                    {c.rating ? (
                      <span className="history__stars" aria-label={`${c.rating}/5`}>
                        {Array.from({ length: c.rating }, (_, i) => (
                          <Icon key={i} name="star" size={12} />
                        ))}
                      </span>
                    ) : null}
                  </div>
                  <span className="history__pts">+{c.points}</span>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Sheet open={editing} onClose={() => setEditing(false)} title={t('profile.edit')}>
        <label className="field">
          <span>{t('profile.displayName')}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
        </label>
        <p className="field__label">{t('profile.avatar')}</p>
        <div className="avatar-pick">
          {AVATARS.map((a) => (
            <button
              key={a}
              className={`avatar-pick__item ${avatar === a ? 'is-active' : ''}`}
              onClick={() => setAvatar(a)}
            >
              {a}
            </button>
          ))}
        </div>
        <Button block size="lg" loading={saving} onClick={save}>
          {t('common.save')}
        </Button>
      </Sheet>
    </div>
  );
}
