import { NavLink } from 'react-router-dom';
import { Icon } from '../icons/Icon';
import { useI18n } from '../../i18n';

const ITEMS = [
  { to: '/app', icon: 'home', key: 'nav.home', end: true },
  { to: '/app/explore', icon: 'search', key: 'nav.explore' },
  { to: '/app/play', icon: 'dice', key: 'nav.play' },
  { to: '/app/challenges', icon: 'target', key: 'nav.challenges' },
  { to: '/app/community', icon: 'users', key: 'nav.community' },
  { to: '/app/profile', icon: 'user', key: 'nav.profile' },
];

export function BottomNav() {
  const { t } = useI18n();
  return (
    <nav className="bottom-nav" aria-label="primary">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
        >
          <span className="bottom-nav__icon">
            <Icon name={item.icon} size={23} />
          </span>
          <span className="bottom-nav__label">{t(item.key)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
