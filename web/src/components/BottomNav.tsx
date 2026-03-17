import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { HomeIcon, SearchIcon, UsersIcon, SettingsIcon } from './icons';
import './BottomNav.css';

export default function BottomNav() {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: t('dashboard.nav.home') },
    { path: '/explore', icon: SearchIcon, label: t('dashboard.nav.explore') },
    { path: '/community', icon: UsersIcon, label: t('dashboard.nav.community') },
    { path: '/settings', icon: SettingsIcon, label: t('settings.title') },
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="bottom-nav-icon">
              <Icon size={22} />
            </span>
            <span className="bottom-nav-label">{item.label}</span>
            {isActive && <span className="bottom-nav-indicator" />}
          </Link>
        );
      })}
    </nav>
  );
}
