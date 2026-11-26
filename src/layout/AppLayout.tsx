import { useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import { NAV, AUDITOR_NAV, AUDITOR_PATHS } from './nav';
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

/* เลือกเมนูที่ตรงที่สุด (เช่น /approval/history ต้องไม่ไฮไลต์ /approval) */
const bestMatch = (pathname: string, nav: NavItem[]): string | undefined =>
  nav.flatMap((n) => (n.children ? n.children.map((c) => c.to) : [n.to ?? '']))
    .filter((to) => isActivePath(pathname, to))
    .sort((a, b) => b.length - a.length)[0];

const navFor = (role: Role): NavItem[] => (role === 'Auditor' ? AUDITOR_NAV : NAV);

function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { pathname } = useLocation();
  const { role } = useStore();
  const [query, setQuery] = useState('');
  const nav = navFor(role);
  const active = bestMatch(pathname, nav);
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(nav.filter((n) => n.children?.some((c) => isActivePath(pathname, c.to))).map((n) => [n.label, true])),
  );

  const items = useMemo<NavItem[]>(() => {
    const q = query.trim().toLowerCase();
    const base = nav;
    if (!q) return base;
    return base.map((n) => {
      if (n.label.toLowerCase().includes(q)) return n;
      const kids = n.children?.filter((c) => c.label.toLowerCase().includes(q));
      return kids?.length ? { ...n, children: kids, forceOpen: true } : null;
    }).filter((n): n is NavItem => n !== null);
  }, [query, nav]);

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
              <NavLink key={item.label} to={item.to ?? '/'} end={item.to === '/'} className={() => `nav-item ${active === item.to ? 'active' : ''}`}>
                <img src={item.icon} alt="" width="22" height="22" />
                <span>{item.label}</span>
              </NavLink>
            );
          }
          const groupActive = item.children.some((c) => c.to === active);
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
                  <NavLink key={c.to} to={c.to} className={() => `nav-item sub ${active === c.to ? 'active' : ''}`}>
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
  const { site, setSite, role, setRole, requests, logout } = useStore();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const pending = requests.filter((r) => r.tab === 'pending').length;
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
        <button className="tb-icon bell" onClick={() => navigate(role === 'Auditor' ? '/approval' : '/requests')} aria-label="การแจ้งเตือน"><Bell size={22} strokeWidth={1.6} />{pending > 0 && <span className="badge">{pending}</span>}</button>
        <button className="tb-icon" onClick={() => navigate(role === 'Auditor' ? '/setting/audit' : '/setting/language')} aria-label="ตั้งค่า"><img src={settingsIcon} alt="" width="24" height="24" /></button>
        <button className={`role-chip ${role === 'Auditor' ? 'auditor' : ''}`} onClick={() => { const next: Role = role === 'Auditor' ? 'Content Editor' : 'Auditor'; setRole(next); navigate(next === 'Auditor' ? '/approval' : '/'); }} title="สลับบทบาท (สำหรับ prototype)">
          <img src={dotIcon} alt="" width="8" height="8" />
          {role}
        </button>
        <div style={{ position: 'relative' }}>
          <button className={`avatar ${role === 'Auditor' ? 'aud' : ''}`} onClick={() => setMenu(!menu)} aria-label="เมนูผู้ใช้">{role === 'Auditor' ? 'A' : 'E'}</button>
          {menu && (
            <div className="user-menu" onMouseLeave={() => setMenu(false)}>
              <b>{role === 'Auditor' ? 'Auditor – Marketing' : 'Content Editor 01'}</b>
              <span className="t-sm t-secondary">{role === 'Auditor' ? 'auditor.mkt@...lhbank.co.th' : 'editor01@...lhbank.co.th'}</span>
              <button onClick={() => { setMenu(false); logout(); navigate('/login'); }}><LogOut size={16} /> ออกจากระบบ</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { toasts, role, authed } = useStore();
  const { pathname } = useLocation();
  // Auditor เห็นเฉพาะเมนูตาม AUDITOR_NAV — ถ้าเข้า URL ของหน้าจัดการเนื้อหาตรง ๆ ให้กลับไปงานรออนุมัติ
  const blocked = role === 'Auditor' && !AUDITOR_PATHS.some((p) => isActivePath(pathname, p));
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  // ต้องเข้าสู่ระบบก่อนใช้งาน CMS — จำหน้าที่ตั้งใจจะเข้าไว้ แล้วพากลับมาหลัง Login
  if (!authed) return <Navigate to="/login" replace state={{ from: pathname }} />;
  return (
    <div className="app">
      <Sidebar collapsed={collapsed} />
      <div className="main">
        <TopBar onToggle={() => setCollapsed((c) => !c)} />
        <main className="content">
          {blocked ? <Navigate to="/approval" replace /> : <Outlet />}
        </main>
      </div>
      <ToastView toasts={toasts} />
    </div>
  );
}
