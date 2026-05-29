import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './layout.css';

export default function IconNav() {
  const { t } = useTranslation();

  const NAV_ITEMS = [
    { to: '/todos', label: t('nav.todos'), icon: '☑' },
    { to: '/categories', label: t('nav.categories'), icon: '🏷' },
    { to: '/profile', label: t('nav.profile'), icon: '👤' },
  ];

  return (
    <nav className="icon-nav" aria-label="주 메뉴">
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `icon-nav-item${isActive ? ' icon-nav-item--active' : ''}`
          }
          aria-label={label}
        >
          <span className="icon-nav-icon">{icon}</span>
          <span className="icon-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
