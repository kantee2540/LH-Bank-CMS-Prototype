import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { NAV } from './nav';
import type { NavItem } from './nav';
import type { Role } from '../types';
import { useStore } from '../store';
import { ToastView } from '../components/ui';
import logo from '../assets/figma/logo-lh-bank.svg';
import searchIcon from '../assets/figma/nav/search.svg';
import chevron from '../assets/figma/nav/chevron.svg';
import menuIcon from '../assets/figma/topbar/menu.svg';
import globeIcon from '../assets/figma/topbar/globe.svg';
import chevDown from '../assets/figma/topbar/chev-down.svg';
import settingsIcon from '../assets/figma/topbar/settings.svg';
import dotIcon from '../assets/figma/topbar/dot.svg';
import './layout.css';

const isActivePath = (pathname: string, to?: string): boolean =>
  !!to && (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/'));

function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { pathname } = useLocation();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV.filter((n) => n.children?.some((c) => isActivePath(pathname, c.to))).map((n) => [n.label, true])),
  );

  const items = useMemo<NavItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV;
    return NAV.map((n) => {
      if (n.label.toLowerCase().includes(q)) return n;
      const kids = n.children?.filter((c) => c.label.toLowerCase().includes(q));
      return kids?.length ? { ...n, children: kids, forceOpen: true } : null;
    }).filter((n): n is NavItem => n !== null);
  }, [query]);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sb-logo">
        <img src={logo} alt="LH Bank" width="141.75" height="36" />
        <span className="sb-cms">CMS</span>
      </div>
      <nav className="sb-nav">
        <div className="sb-search">
          <img src={searchIcon} alt="" width="18" height="18" />
          <input placeholder="ค้นหาเมนู..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {items.map((item) => {
          if (!item.children) {
            return (
              <NavLink key={item.label} to={item.to ?? '/'} end={item.to === '/'} className={({ isActive }) => `nav-item ${isActive || isActivePath(pathname, item.to) ? 'active' : ''}`}>
                <img src={item.icon} alt="" width="22" height="22" />
                <span>{item.label}</span>
              </NavLink>
            );
          }
          const groupActive = item.children.some((c) => isActivePath(pathname, c.to));
          const isOpen = item.forceOpen || open[item.label];
          return (
            <div key={item.label}>
              <button className={`nav-item ${groupActive && !isOpen ? 'active' : ''}`} onClick={() => setOpen((o) => ({ ...o, [item.label]: !o[item.label] }))} aria-expanded={!!isOpen}>
                <img src={item.icon} alt="" width="22" height="22" />
                <span>{item.label}</span>
                <img src={chevron} alt="" width="18" height="18" className={`chev ${isOpen ? 'up' : ''}`} />
              </button>
              {isOpen &&
                item.children.map((c) => (
                  <NavLink key={c.to} to={c.to} className={() => `nav-item sub ${isActivePath(pathname, c.to) ? 'active' : ''}`}>
                    <span>{c.label}</span>
                  </NavLink>
                ))}
            </div>
          );
        })}
      </nav>
      <div className="sb-spacer" />
      <p className="sb-version">v1.0.0 · Copyright © 2026 Clicknext Co.,Ltd.</p>
    </aside>
  );
}

function TopBar({ onToggle }: { onToggle: () => void }) {
  const { site, setSite, role, setRole } = useStore();
  return (
    <header className="topbar">
      <div className="row" style={{ gap: 16 }}>
        <button className="tb-icon" onClick={onToggle} aria-label="ย่อ/ขยายเมนู">
          <img src={menuIcon} alt="" width="26" height="26" />
        </button>
        <label className="site-switch">
          <img src={globeIcon} alt="" width="18" height="18" />
          <select value={site} onChange={(e) => setSite(e.target.value)}>
            <option>เว็บไซต์ LH Bank (Personal)</option>
            <option>เว็บไซต์ LH Bank (SME)</option>
            <option>เว็บไซต์ LH Bank (Corporate)</option>
          </select>
          <img src={chevDown} alt="" width="18" height="18" />
        </label>
      </div>
      <div className="row" style={{ gap: 16 }}>
        <img src={settingsIcon} alt="" width="24" height="24" />
        <button className={`role-chip ${role === 'Auditor' ? 'auditor' : ''}`} onClick={() => setRole((r: Role) => (r === 'Auditor' ? 'Content Editor' : 'Auditor'))} title="สลับบทบาท (สำหรับ prototype)">
          <img src={dotIcon} alt="" width="8" height="8" />
          {role}
        </button>
        <div className="avatar">{role === 'Auditor' ? 'A' : 'E'}</div>
      </div>
    </header>
  );
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { toasts } = useStore();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="app">
      <Sidebar collapsed={collapsed} />
      <div className="main">
        <TopBar onToggle={() => setCollapsed((c) => !c)} />
        <main className="content">
          <Outlet />
        </main>
      </div>
      <ToastView toasts={toasts} />
    </div>
  );
}
