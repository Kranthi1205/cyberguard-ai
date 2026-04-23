import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { path: '/threats', icon: '☣', label: 'Threats' },
  { path: '/siem', icon: '◈', label: 'SIEM Logs' },
  { path: '/ai-chat', icon: '◎', label: 'AI Analyst' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 90,
        }} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={sidebarStyles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span style={sidebarStyles.logoText}>CyberGuard</span>
        </div>

        {/* Nav */}
        <nav style={sidebarStyles.nav}>
          <div style={sidebarStyles.navSection}>Overview</div>
          {navItems.map(({ path, icon, label }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <NavLink key={path} to={path} onClick={() => setMobileOpen(false)}
                style={{
                  ...sidebarStyles.navItem,
                  ...(isActive ? sidebarStyles.navItemActive : {}),
                }}>
                <span style={{ ...sidebarStyles.navIcon, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>{icon}</span>
                <span>{label}</span>
                {path === '/threats' && (
                  <span style={sidebarStyles.alertBadge}>3</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div style={sidebarStyles.userSection}>
          <div style={sidebarStyles.userInfo}>
            <div style={sidebarStyles.avatar}>
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : <span>{user?.name?.[0]?.toUpperCase() || 'A'}</span>
              }
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={sidebarStyles.userName}>{user?.name || 'Analyst'}</div>
              <div style={sidebarStyles.userRole}>{user?.role || 'Admin'}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={sidebarStyles.logoutBtn} title="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header style={topbarStyles.header}>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu-btn" style={topbarStyles.menuBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          
          <div style={topbarStyles.breadcrumbs}>
             <span style={{ color: 'var(--text-muted)' }}>SOC / </span>
             <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
               {navItems.find(n => location.pathname.startsWith(n.path))?.label || 'Dashboard'}
             </span>
          </div>

          <div style={topbarStyles.right}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 20 }}>
              <div className="pulse-dot green" style={{ width: 6, height: 6 }}></div>
              <span className="hide-on-mobile" style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>System Active</span>
            </div>
          </div>
        </header>

        <div className="page-content animate-fade-in">{children}</div>
      </div>
    </div>
  );
}

const sidebarStyles = {
  logo: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '24px',
  },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' },
  nav: { flex: 1, padding: '0 16px', overflowY: 'auto', marginTop: 16 },
  navSection: {
    fontSize: 12, fontWeight: 500, color: 'var(--text-muted)',
    padding: '0 12px 12px',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '8px 12px', borderRadius: 6, marginBottom: 4,
    color: 'var(--text-secondary)', textDecoration: 'none',
    fontSize: 13, fontWeight: 500, transition: 'all 0.15s ease',
  },
  navItemActive: {
    background: 'var(--bg-secondary)', color: 'var(--text-primary)',
  },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  alertBadge: {
    marginLeft: 'auto', background: 'var(--red)', color: 'white',
    borderRadius: 10, padding: '0 6px', height: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 600,
  },
  userSection: {
    padding: '20px 16px', borderTop: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  userInfo: { flex: 1, display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0, overflow: 'hidden',
  },
  userName: { fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { fontSize: 11, color: 'var(--text-muted)' },
  logoutBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'color 0.2s',
  },
};

const topbarStyles = {
  header: {
    height: 'var(--topbar-height)', display: 'flex', alignItems: 'center',
    padding: '0 32px', gap: 16, 
    background: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50,
  },
  menuBtn: {
    background: 'none', border: 'none', color: 'var(--text-secondary)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  breadcrumbs: { flex: 1, fontSize: 14 },
  right: { display: 'flex', alignItems: 'center', gap: 16 },
};
