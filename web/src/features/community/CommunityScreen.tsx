import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n';
import { useToast } from '../../contexts/ToastContext';
import { Card, Avatar, Badge, EmptyState, Spinner } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/icons/Icon';
import { timeAgo } from '../../lib/format';
import type { PostFeedRow } from '../../types/db';
import './community.css';

export default function CommunityScreen() {
  const { t, lang } = useI18n();
  const { user, profile, isGuest } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<PostFeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('mmd_post_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setPosts((data ?? []) as PostFeedRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    const body = draft.trim();
    if (!body || !user) return;
    setPosting(true);
    const { error } = await supabase.from('mmd_posts').insert({ user_id: user.id, body });
    setPosting(false);
    if (error) {
      show(t('common.error'), 'error');
      return;
    }
    setDraft('');
    show(t('toast.posted'), 'success');
    load();
  };

  const toggleLike = async (post: PostFeedRow) => {
    if (!user) {
      show(t('toast.loginRequired'), 'info');
      return;
    }
    const liked = post.liked_by_me;
    // optimistic
    setPosts((cur) =>
      cur.map((p) =>
        p.id === post.id
          ? { ...p, liked_by_me: !liked, like_count: p.like_count + (liked ? -1 : 1) }
          : p
      )
    );
    if (liked) {
      await supabase.from('mmd_post_likes').delete().eq('post_id', post.id).eq('user_id', user.id);
    } else {
      await supabase.from('mmd_post_likes').insert({ post_id: post.id, user_id: user.id });
    }
  };

  return (
    <div className="community">
      <header className="screen-head">
        <h1>{t('community.title')}</h1>
        <p className="muted">{t('community.subtitle')}</p>
      </header>

      {isGuest || !user ? (
        <Card className="community__guest">
          <Icon name="users" size={22} color="var(--brand-500)" />
          <p>{t('community.guestNotice')}</p>
          <Button size="sm" onClick={() => navigate('/auth?mode=register')}>
            {t('auth.signUp')}
          </Button>
        </Card>
      ) : (
        <Card className="composer">
          <Avatar emoji={profile?.avatar_emoji ?? '🧭'} size={40} />
          <div className="composer__main">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t('community.placeholder')}
              rows={2}
              maxLength={500}
            />
            <div className="composer__foot">
              <span className="muted">{draft.length}/500</span>
              <Button
                size="sm"
                icon="share"
                disabled={!draft.trim()}
                loading={posting}
                onClick={submit}
              >
                {t('community.post')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="screen-center">
          <Spinner />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState icon="message" title={t('community.empty')} />
      ) : (
        <div className="feed">
          {posts.map((p) => (
            <Card key={p.id} className="post">
              <div className="post__head">
                <Avatar emoji={p.author_avatar} size={42} />
                <div className="post__author">
                  <strong>{p.author_name}</strong>
                  <span className="muted">{timeAgo(p.created_at, lang)}</span>
                </div>
                {p.author_level != null && p.author_level > 1 && (
                  <Badge color="var(--accent-500)">Lvl {p.author_level}</Badge>
                )}
              </div>
              <p className="post__body">{p.body}</p>
              {(p.activity_title || p.place_name) && (
                <div className="post__tag">
                  <Icon name="map-pin" size={14} />
                  {p.activity_title || p.place_name}
                </div>
              )}
              <div className="post__actions">
                <button
                  className={`post__act ${p.liked_by_me ? 'is-on' : ''}`}
                  onClick={() => toggleLike(p)}
                >
                  <Icon name="heart" size={18} /> {p.like_count}
                </button>
                <span className="post__act">
                  <Icon name="message" size={18} /> {p.comment_count}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
