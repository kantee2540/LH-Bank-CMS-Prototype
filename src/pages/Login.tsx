import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, Compass } from 'lucide-react';
import { Button, Field, Select } from '../components/ui';
import { useStore } from '../store';
import type { Role } from '../types';
import logo from '../assets/figma/logo-lh-bank.svg';
import './pages.css';

/* NEW (ไม่มีใน Figma) — LG-00 เข้าสู่ระบบด้วย SSO ของธนาคาร
   ไม่มีช่องรหัสผ่านใน CMS: ยืนยันตัวตนผ่าน Identity Provider ของธนาคาร (ตาม CMS-22 "เข้าสู่ระบบผ่าน SSO") */
export default function Login() {
  const navigate = useNavigate();
  const { setRole, toast } = useStore();
  const [role, setR] = useState<Role>('Content Editor');
  const [site, setSite] = useState('Personal');
  return (
    <div className="login">
      <div className="login-card">
        <div className="row" style={{ gap: 10 }}><img src={logo} alt="LH Bank" width="141.75" height="36" /><span className="sb-cms">CMS</span></div>
        <div>
          <h1 className="t-h2">เข้าสู่ระบบ Back Office</h1>
          <p className="t-secondary">ระบบจัดการเนื้อหาเว็บไซต์ LH Bank · สำหรับพนักงานที่ได้รับสิทธิ์เท่านั้น</p>
        </div>
        <Button variant="primary" icon={KeyRound} style={{ height: 48, fontSize: 17 }} onClick={() => { setRole(role); toast(`เข้าสู่ระบบในบทบาท ${role}`, `เว็บไซต์ ${site} · บันทึกใน Audit Log`); navigate(role === 'Auditor' ? '/approval' : '/'); }}>
          เข้าสู่ระบบด้วยบัญชีพนักงาน (SSO)
        </Button>
        <div className="login-demo">
          <b className="t-sm">โหมด Prototype — เลือกบทบาทเพื่อทดลอง</b>
          <div className="grid-2">
            <Field label="บทบาท"><Select value={role} onChange={(e) => setR(e.target.value as Role)} options={['Content Editor', 'Auditor']} /></Field>
            <Field label="เว็บไซต์"><Select value={site} onChange={(e) => setSite(e.target.value)} options={['Personal', 'SME', 'Corporate']} /></Field>
          </div>
        </div>
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
