import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ModusWcNavbar,
  ModusWcSideNavigation,
  ModusWcMenu,
  ModusWcMenuItem,
  ModusWcIcon,
  ModusWcThemeSwitcher,
} from '@trimble-oss/moduswebcomponents-react';

interface NavRoute {
  path: string;
  label: string;
  icon: string;
}

const ROUTES: NavRoute[] = [
  { path: '/field', label: 'Field Employee', icon: 'person' },
  { path: '/foreman', label: 'Foreman Dashboard', icon: 'bar_graph' },
  { path: '/admin', label: 'Admin Exceptions', icon: 'settings' },
];

const USER_CARD = {
  avatarAlt: 'Site Supervisor',
  email: 'supervisor@traqspera.com',
  name: 'Site Supervisor',
};

const NAV_VISIBILITY = {
  ai: false,
  apps: false,
  help: true,
  logo: true,
  mainMenu: true,
  notifications: true,
  search: false,
  searchInput: false,
  user: true,
};

/**
 * Application shell: Modus navbar on top, collapsible Modus side navigation on
 * the left, routed page content on the right.
 */
export default function Layout() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const go = (path: string) => {
    navigate(path);
    setExpanded(false);
  };

  return (
    <div className="app-shell">
      <ModusWcNavbar
        userCard={USER_CARD}
        visibility={NAV_VISIBILITY}
        onMainMenuOpenChange={(e) => setExpanded(e.detail)}>
        <div slot="center" className="brand">
          <ModusWcIcon name="clock" size="sm" decorative />
          <span className="brand-name">Traqspera</span>
          <span className="brand-sub">Hour Rules</span>
        </div>
        <div slot="notifications" className="nav-drawer">
          <strong>Compliance alerts</strong>
          <p>2 crew members are approaching a meal-break violation.</p>
        </div>
      </ModusWcNavbar>

      <div className="app-body">
        <ModusWcSideNavigation
          className="app-side-nav"
          expanded={expanded}
          mode="overlay"
          maxWidth="260px"
          onExpandedChange={(e) => setExpanded(e.detail)}>
          <ModusWcMenu size="lg">
            {ROUTES.map((r) => (
              <ModusWcMenuItem
                key={r.path}
                label={r.label}
                selected={location.pathname === r.path}
                onClick={() => go(r.path)}>
                <ModusWcIcon slot="start-icon" name={r.icon} decorative />
              </ModusWcMenuItem>
            ))}
          </ModusWcMenu>
          <div className="side-nav-footer">
            <ModusWcThemeSwitcher aria-label="Toggle theme" />
          </div>
        </ModusWcSideNavigation>

        <main className={`app-content${expanded ? ' nav-expanded' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
