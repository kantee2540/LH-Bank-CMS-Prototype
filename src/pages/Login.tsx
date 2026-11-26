import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, Compass, User, Lock, Eye, EyeOff } from 'lucide-react';
import { Button, Field, Input } from '../components/ui';
import { useStore } from '../store';
import logo from '../assets/figma/logo-lh-bank.svg';
import './pages.css';

/* LG-00 หน้าเข้าสู่ระบบ — ต้องผ่านหน้านี้ก่อนเข้าใช้ CMS ทุกครั้ง
   เข้าด้วยชื่อผู้ใช้ / รหัสผ่าน หรือบัญชีพนักงาน (SSO) ของธนาคาร (ตาม CMS-22 "เข้าสู่ระบบผ่าน SSO")
   Prototype: กรอกค่าใดก็ได้ที่ไม่ว่างเพื่อเข้าสู่ระบบ · สลับบทบาท Auditor ได้ที่ปุ่มบทบาทบน Top bar */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authed, login, toast } = useStore();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const from = (location.state as { from?: string } | null)?.from;

  if (authed) return <Navigate to={from && from !== '/login' ? from : '/'} replace />;

  const enter = (how: string) => {
    login('Content Editor');
    toast('เข้าสู่ระบบแล้ว', `${how} · บันทึกใน Audit Log`);
    navigate(from && from !== '/login' ? from : '/', { replace: true });
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!user.trim() || !pass) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }
    enter(user.trim());
  };

  return (
    <div className="login">
      <div className="login-card">
        <div className="row" style={{ gap: 10 }}><img src={logo} alt="LH Bank" width="141.75" height="36" /><span className="sb-cms">CMS</span></div>
        <div>
          <h1 className="t-h2">เข้าสู่ระบบ Back Office</h1>
          <p className="t-secondary">ระบบจัดการเนื้อหาเว็บไซต์ LH Bank · สำหรับพนักงานที่ได้รับสิทธิ์เท่านั้น</p>
        </div>
        <form className="col" style={{ gap: 16 }} onSubmit={submit} noValidate>
          <Field label="ชื่อผู้ใช้" required>
            <div className="login-input"><User size={18} /><Input autoFocus autoComplete="username" placeholder="เช่น editor01" value={user} onChange={(e) => { setUser(e.target.value); setError(''); }} /></div>
          </Field>
          <Field label="รหัสผ่าน" required error={error || undefined}>
            <div className="login-input">
              <Lock size={18} />
              <Input type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="รหัสผ่าน" value={pass} onChange={(e) => { setPass(e.target.value); setError(''); }} />
              <button type="button" className="login-eye" aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </Field>
          <div className="row-between t-sm">
            <label className="row" style={{ gap: 6, cursor: 'pointer' }}><input type="checkbox" className="cb" /> จดจำชื่อผู้ใช้</label>
            <button type="button" className="t-link link-btn" onClick={() => toast('ลืมรหัสผ่าน', 'ติดต่อผู้ดูแลระบบ (IT Helpdesk) เพื่อรีเซ็ตรหัสผ่าน')}>ลืมรหัสผ่าน?</button>
          </div>
          <Button variant="primary" type="submit" style={{ height: 48, fontSize: 17 }}>เข้าสู่ระบบ</Button>
        </form>
        <div className="login-or"><span>หรือ</span></div>
        <Button icon={KeyRound} style={{ height: 48 }} onClick={() => enter('SSO')}>เข้าสู่ระบบด้วยบัญชีพนักงาน (SSO)</Button>
        <div className="row t-sm t-secondary" style={{ gap: 8, alignItems: 'flex-start' }}><ShieldCheck size={16} style={{ flex: 'none', marginTop: 3 }} /> ใช้การยืนยันตัวตน 2 ขั้นตอน (MFA) ของธนาคาร · หมดเวลาใช้งานอัตโนมัติหลังไม่มีการใช้งาน 30 นาที · ทุกการเข้าสู่ระบบบันทึกใน Audit Log</div>
      </div>
      <p className="t-sm" style={{ color: '#b8c7d6' }}>v1.0.0 · Copyright © 2026 Clicknext Co.,Ltd.</p>
    </div>
  );
}

/* NEW — ER-404 ไม่พบหน้า */
export function NotFound() {
  return (
    <section className="card ph">
      <div className="ph-icon"><Compass size={30} strokeWidth={1.5} /></div>
      <h3 className="t-h3">ไม่พบหน้าที่ต้องการ</h3>
      <p className="t-secondary">ลิงก์อาจถูกย้ายหรือคุณไม่มีสิทธิ์เข้าถึงหน้านี้ · ติดต่อผู้ดูแลระบบหากคิดว่าเป็นข้อผิดพลาด</p>
      <Link to="/" className="btn btn-primary">กลับไป Dashboard</Link>
    </section>
  );
}
