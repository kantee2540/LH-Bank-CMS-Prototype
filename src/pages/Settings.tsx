import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Lock, Download, Info, RefreshCw, Settings as Cog, Eye, Users, Minus, Star } from 'lucide-react';
import { Button, Card, Field, Input, Select, Tabs, Toggle, IconButton, Modal, PageHeader, InfoBanner } from '../components/ui';
import ListPage, { selectFilter, textFilter } from '../components/ListPage';
import { useStore } from '../store';
import './pages.css';

/* ================= CMS-22 User & Role (+ NEW: US-01 เพิ่ม/แก้ไขผู้ใช้, US-02 สิทธิ์ของ Role) ================= */
type Role = 'Content Editor' | 'Auditor';
interface User { id: string; name: string; email: string; role: Role; sites: string; last: string; active: boolean; code: string }
const USERS: User[] = [
  { id: 'u1', code: 'A1', name: 'Auditor – ฝ่ายเงินฝาก', email: 'auditor.deposit@...lhbank.co.th', role: 'Auditor', sites: 'ทุกเว็บไซต์', last: '30/10/2026 08:10', active: true },
  { id: 'u2', code: 'C1', name: 'Content Editor 01', email: 'editor01@...lhbank.co.th', role: 'Content Editor', sites: 'Personal, SME', last: '30/10/2026 09:02', active: true },
  { id: 'u3', code: 'C2', name: 'Content Editor 02', email: 'editor02@...lhbank.co.th', role: 'Content Editor', sites: 'Personal', last: '29/10/2026 17:45', active: true },
  { id: 'u4', code: 'A2', name: 'Auditor – Marketing', email: 'auditor.mkt@...lhbank.co.th', role: 'Auditor', sites: 'Personal, SME, Corporate', last: '30/10/2026 08:55', active: true },
  { id: 'u5', code: 'C3', name: 'Content Editor (ZH)', email: 'editor.zh@...lhbank.co.th', role: 'Content Editor', sites: 'Personal', last: '28/10/2026 13:20', active: true },
  { id: 'u6', code: 'A3', name: 'Auditor – Compliance', email: 'auditor.comp@...lhbank.co.th', role: 'Auditor', sites: 'ทุกเว็บไซต์', last: '20/10/2026 10:00', active: false },
];
const PERMS = ['ดู Dashboard', 'สร้าง / แก้ไขเนื้อหา', 'ส่งอนุมัติ', 'อนุมัติ / ส่งกลับ', 'เผยแพร่ / ตั้งเวลา', 'ลบไป Recycle Bin', 'ลบถาวร', 'ดูข้อมูล Lead เต็ม', 'จัดการ User & Role', 'ดู Audit Log'];
const ROLE_PERMS: Record<Role, boolean[]> = {
  'Content Editor': [true, true, true, false, false, true, false, false, false, false],
  Auditor: [true, false, false, true, true, true, true, true, true, true],
};

export function UsersRoles() {
  const { toast } = useStore();
  const [rows, setRows] = useState(USERS);
  const [tab, setTab] = useState<'users' | 'roles'>('users');
  const [edit, setEdit] = useState<User | null>(null);
  const [perms, setPerms] = useState(ROLE_PERMS);
  const [roleEdit, setRoleEdit] = useState<Role | null>(null);
  const tabs = <Tabs value={tab} onChange={setTab} style={{ marginBottom: 16, marginTop: -8 }} tabs={[{ value: 'users', label: `Users (${rows.length})` }, { value: 'roles', label: 'Roles & Permissions (2)' }]} />;
  const chip = (r: Role) => <span className={`tag ${r === 'Auditor' ? 'tag-purple' : 'tag-green'}`} style={{ fontWeight: 400 }}>{r}</span>;

  return (
    <ListPage<User>
      title="User & Role"
      filters={tab === 'users' ? [textFilter('n', 'ชื่อ / อีเมล', (r) => `${r.name} ${r.email}`), selectFilter('r', 'Role', ['Content Editor', 'Auditor'], (r) => r.role), { key: 'a', label: 'สถานะ', kind: 'select', options: ['ทั้งหมด', 'Active', 'Inactive'], match: (r, v) => (v === 'Active' ? r.active : !r.active) }] : []}
      rows={tab === 'users' ? rows : []} rowKey={(r) => r.id} above={tabs}
      toolbar={tab === 'users' && <Button variant="primary" icon={Plus} onClick={() => setEdit({ id: `u${Date.now()}`, code: 'N', name: '', email: '', role: 'Content Editor', sites: 'Personal', last: '—', active: true })}>เพิ่มผู้ใช้</Button>}
      toolbarRight={<span className="row t-secondary" style={{ gap: 8 }}><Info size={18} color="#1f6fa8" /> แยก 2 Role: Content Editor สร้าง / แก้ไข / ส่งอนุมัติ → Auditor ตรวจสอบ / อนุมัติ / ส่งกลับ ก่อน Publish · ผู้ใช้ 1 คนถือได้ Role เดียว</span>}
      empty={
        <div className="table-wrap" style={{ textAlign: 'left' }}>
          <table className="table">
            <thead><tr><th>สิทธิ์</th><th style={{ textAlign: 'center' }}>Content Editor</th><th style={{ textAlign: 'center' }}>Auditor</th></tr></thead>
            <tbody>{PERMS.map((p, i) => <tr key={p}><td style={{ color: 'var(--lh-text-primary)' }}>{p}</td>{(['Content Editor', 'Auditor'] as Role[]).map((r) => <td key={r} style={{ textAlign: 'center', color: perms[r][i] ? '#1a9a8a' : '#c9cfd6', fontWeight: 600 }}>{perms[r][i] ? '✓' : '—'}</td>)}</tr>)}</tbody>
          </table>
          <div className="row mt-16" style={{ justifyContent: 'flex-end' }}><Button icon={Pencil} onClick={() => setRoleEdit('Content Editor')}>แก้ไขสิทธิ์ Content Editor</Button><Button icon={Pencil} onClick={() => setRoleEdit('Auditor')}>แก้ไขสิทธิ์ Auditor</Button></div>
        </div>
      }
      columns={tab === 'users' ? [
        { key: 'u', label: 'ผู้ใช้', render: (r) => <div className="row"><span className={`avatar-sm ${r.role === 'Auditor' ? 'aud' : ''}`}>{r.code}</span><div><b style={{ fontWeight: 500 }}>{r.name}</b><div className="sub">{r.email}</div></div></div> },
        { key: 'r', label: 'Role', render: (r) => chip(r.role) },
        { key: 's', label: 'เว็บไซต์ที่ดูแล', render: (r) => r.sites },
        { key: 'l', label: 'เข้าใช้ล่าสุด', render: (r) => r.last },
        { key: 'a', label: 'Active', align: 'center', render: (r) => <Toggle checked={r.active} onChange={(v) => { setRows(rows.map((x) => (x.id === r.id ? { ...x, active: v } : x))); toast(v ? 'เปิดใช้งานผู้ใช้' : 'ปิดใช้งานผู้ใช้', r.name); }} /> },
        { key: 'x', label: 'Action', render: (r) => <div className="row" style={{ gap: 2 }}><IconButton icon={Pencil} title="แก้ไข" onClick={() => setEdit({ ...r })} /><IconButton icon={Lock} title="รีเซ็ตรหัสผ่าน / บังคับ Logout" onClick={() => toast('ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว', r.email)} /></div> },
      ] : [{ key: 'x', label: '', render: () => null }]}
    >
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit && rows.some((r) => r.id === edit.id) ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้'}
        footer={<><Button onClick={() => setEdit(null)}>ยกเลิก</Button><Button variant="primary" disabled={!edit?.name || !edit?.email} onClick={() => { if (!edit) return; const exists = rows.some((r) => r.id === edit.id); setRows(exists ? rows.map((r) => (r.id === edit.id ? edit : r)) : [...rows, { ...edit, code: edit.role === 'Auditor' ? `A${rows.length + 1}` : `C${rows.length + 1}` }]); toast(exists ? 'บันทึกผู้ใช้แล้ว' : 'เพิ่มผู้ใช้แล้ว — ส่งคำเชิญทางอีเมล', edit.email); setEdit(null); }}>บันทึก</Button></>}>
        {edit && (
          <>
            <div className="grid-2">
              <Field label="ชื่อที่แสดง" required><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
              <Field label="อีเมล (SSO)" required><Input value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} placeholder="name@lhbank.co.th" /></Field>
              <Field label="Role"><Select value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value as Role })} options={['Content Editor', 'Auditor']} /></Field>
              <Field label="เว็บไซต์ที่ดูแล"><Select value={edit.sites} onChange={(e) => setEdit({ ...edit, sites: e.target.value })} options={['Personal', 'Personal, SME', 'Personal, SME, Corporate', 'ทุกเว็บไซต์']} /></Field>
            </div>
            {edit.role === 'Auditor' && <Field label="ฝ่ายที่รับผิดชอบอนุมัติ"><Select options={['Marketing', 'ฝ่ายเงินฝาก', 'ฝ่ายสินเชื่อ', 'Compliance']} /></Field>}
            <div className="info-soft t-sm">เข้าสู่ระบบผ่าน SSO ของธนาคาร · ไม่มีรหัสผ่านใน CMS · ทุกการเปลี่ยน Role บันทึกใน Audit Log</div>
          </>
        )}
      </Modal>
      <Modal open={!!roleEdit} onClose={() => setRoleEdit(null)} title={`สิทธิ์ของ ${roleEdit}`} footer={<><Button onClick={() => setRoleEdit(null)}>ยกเลิก</Button><Button variant="primary" onClick={() => { toast('บันทึกสิทธิ์แล้ว', roleEdit ?? ''); setRoleEdit(null); }}>บันทึก</Button></>}>
        {roleEdit && PERMS.map((p, i) => (
          <Toggle key={p} label={p} checked={perms[roleEdit][i]} disabled={roleEdit === 'Content Editor' && i === 3} desc={roleEdit === 'Content Editor' && i === 3 ? 'แยกหน้าที่ (Maker–Checker) — ผู้สร้างอนุมัติเองไม่ได้' : undefined}
            onChange={(v) => setPerms({ ...perms, [roleEdit]: perms[roleEdit].map((x, j) => (j === i ? v : x)) })} />
        ))}
      </Modal>
    </ListPage>
  );
}

/* ================= CMS-23 Audit Log ================= */
type Action = 'Update' | 'Publish' | 'Sync' | 'Export' | 'Delete' | 'Login' | 'Approve' | 'Reject';
interface Log { t: string; code: string; user: string; module: string; action: Action; detail: string; ip: string }
const LOGS: Log[] = [
  { t: '30/10/2026 09:02', code: 'C1', user: 'Content Editor 01', module: 'Promotion', action: 'Update', detail: 'แก้ไข “เงินฝากประจำพิเศษ 6 เดือน” (TH) · คำอธิบายสั้น', ip: '10.x.x.21' },
  { t: '30/10/2026 08:58', code: 'A2', user: 'Auditor – Marketing', module: 'Hero Banner', action: 'Publish', detail: 'อนุมัติและเผยแพร่ Hero Banner ลำดับ 2', ip: '10.x.x.45' },
  { t: '30/10/2026 08:41', code: 'C1', user: 'Content Editor 01', module: 'Rates', action: 'Sync', detail: 'ดึงอัตราแลกเปลี่ยนจาก Treasury สำเร็จ 7 สกุล', ip: 'system' },
  { t: '29/10/2026 19:12', code: 'C2', user: 'Content Editor 02', module: 'Form', action: 'Export', detail: 'Export Drop-lead Form 01–29/10/2026 (96 รายการ)', ip: '10.x.x.33' },
  { t: '29/10/2026 17:45', code: 'C2', user: 'Content Editor 02', module: 'Layout', action: 'Update', detail: 'ย้าย Section “Tools” ในหน้าแรกขึ้น 1 ลำดับ', ip: '10.x.x.18' },
  { t: '29/10/2026 16:02', code: 'C2', user: 'Content Editor 02', module: 'Media', action: 'Delete', detail: 'ลบไฟล์ promo-old-2568.jpg', ip: '10.x.x.18' },
  { t: '29/10/2026 11:20', code: 'A1', user: 'Auditor – ฝ่ายเงินฝาก', module: 'Promotion', action: 'Reject', detail: 'ส่งกลับ “เงินฝากเพื่อการศึกษาบุตร” · ขาด Disclaimer', ip: '10.x.x.52' },
  { t: '29/10/2026 08:00', code: 'A3', user: 'Auditor – Compliance', module: 'Login', action: 'Login', detail: 'เข้าสู่ระบบสำเร็จ (SSO)', ip: '10.x.x.60' },
];
const ACTION_CLASS: Record<Action, string> = { Update: 'tag-blue', Publish: 'tag-green', Approve: 'tag-green', Sync: 'tag-yellow', Export: 'tag-purple', Delete: 'tag-red', Reject: 'tag-red', Login: '' };
export function AuditLog() {
  const { toast } = useStore();
  const [detail, setDetail] = useState<Log | null>(null);
  return (
    <ListPage<Log>
      title="Audit Log"
      filters={[selectFilter('u', 'ผู้ใช้', [...new Set(LOGS.map((l) => l.user))], (r) => r.user), selectFilter('m', 'หมวดหมู่', [...new Set(LOGS.map((l) => l.module))], (r) => r.module), selectFilter('a', 'Action', Object.keys(ACTION_CLASS), (r) => r.action), { key: 'd', label: 'ช่วงวันที่', kind: 'select', options: ['24/10/2026 – 30/10/2026', '30 วันล่าสุด'], match: () => true }]}
      rows={LOGS} rowKey={(r) => r.t + r.detail}
      toolbar={<Button icon={Download} onClick={() => toast('Export CSV', 'audit-log-24-30-10-2026.csv')}>Export CSV</Button>}
      toolbarRight={<span className="row t-secondary" style={{ gap: 8 }}><Lock size={16} /> เก็บประวัติ 2 ปี · แก้ไขหรือลบไม่ได้</span>}
      columns={[
        { key: 't', label: 'วันเวลา', render: (r) => r.t },
        { key: 'u', label: 'ผู้ใช้', render: (r) => <span className="row"><span className={`avatar-sm solid ${r.code.startsWith('A') ? 'aud' : ''}`}>{r.code}</span>{r.user}</span> },
        { key: 'm', label: 'หมวดหมู่', render: (r) => r.module },
        { key: 'a', label: 'Action', render: (r) => <span className={`tag ${ACTION_CLASS[r.action]}`} style={{ fontWeight: 500 }}>{r.action}</span> },
        { key: 'd', label: 'รายละเอียด', width: 260, render: (r) => <a style={{ cursor: 'pointer' }} onClick={() => setDetail(r)}>{r.detail}</a> },
        { key: 'ip', label: 'IP', render: (r) => r.ip },
      ]}
    >
      <Modal open={!!detail} onClose={() => setDetail(null)} width={680} title="รายละเอียด Log">
        {detail && (
          <>
            <div className="ready-box">
              {[['วันเวลา', detail.t], ['ผู้ใช้', detail.user], ['หมวดหมู่', detail.module], ['Action', detail.action], ['IP / อุปกรณ์', `${detail.ip} · Chrome 131 / macOS`]].map(([k, v]) => <div className="row-between" key={k}><span className="t-secondary">{k}</span><b style={{ fontWeight: 500 }}>{v}</b></div>)}
            </div>
            {detail.action === 'Update' && (
              <table className="table"><thead><tr><th>ฟิลด์</th><th>ก่อน</th><th>หลัง</th></tr></thead><tbody><tr><td>คำอธิบายสั้น (TH)</td><td style={{ background: '#fdecea' }}>ฝากระยะสั้น รับผลตอบแทนสูง</td><td style={{ background: '#e6f5ef' }}>ฝากระยะสั้น รับผลตอบแทนตามเงื่อนไขที่ธนาคารกำหนด</td></tr></tbody></table>
            )}
          </>
        )}
      </Modal>
    </ListPage>
  );
}

/* ================= CMS-25 Setting — ภาษา (+ NEW: LG-01 เพิ่มภาษา) ================= */
interface LangRow { code: string; name: string; sub: string; url: string; on: boolean; main?: boolean; pct: number; count: string; isNew?: boolean }
export function LanguageSetting() {
  const { toast } = useStore();
  const [langs, setLangs] = useState<LangRow[]>([
    { code: 'th', name: 'ไทย', sub: 'Thai', url: 'th · /th', on: true, main: true, pct: 100, count: '1,284 / 1,284' },
    { code: 'en', name: 'English', sub: 'อังกฤษ', url: 'en · /en', on: true, pct: 92, count: '1,181 / 1,284' },
    { code: 'zh', name: '中文 (简体)', sub: 'จีนตัวย่อ · Simplified Chinese', url: 'zh-Hans · /zh', on: true, pct: 38, count: '488 / 1,284', isNew: true },
  ]);
  const [fallback, setFallback] = useState<'en' | 'th' | 'hide'>('en');
  const [cfg, setCfg] = useState({ switcher: true, index: true, redirect: false, ai: true, reviewer: true, required: true, notice: true });
  const [adding, setAdding] = useState(false);
  return (
    <>
      <PageHeader title="ภาษา (Language)" sub="กำหนดภาษาที่เปิดใช้บนเว็บไซต์ และแท็บภาษาที่แสดงในฟอร์มกรอกเนื้อหาทุกหมวดหมู่ของ CMS"
        actions={<><Button icon={RefreshCw} onClick={() => toast('ประวัติการเปลี่ยนแปลง', 'ดูได้ที่ Audit Log')}>ประวัติการเปลี่ยนแปลง</Button><Button variant="primary" onClick={() => toast('บันทึกการตั้งค่าแล้ว', 'ภาษา')}>บันทึกการตั้งค่า</Button></>} />
      <Card title="ภาษาที่เปิดใช้" sub="เมื่อเปิดภาษา ทุกฟอร์มกรอกเนื้อหาจะมีแท็บภาษานั้นเพิ่ม (TH · EN · 中文)" action={<Button icon={Plus} onClick={() => setAdding(true)}>เพิ่มภาษา</Button>}>
        <table className="table">
          <thead><tr><th className="col-no">ลำดับ</th><th>ภาษา</th><th>รหัส · URL</th><th>เปิดใช้งาน</th><th>ภาษาหลัก</th><th>ความครบของเนื้อหา</th><th>Action</th></tr></thead>
          <tbody>
            {langs.map((l, i) => (
              <tr key={l.code} style={{ background: l.isNew ? '#eef3d3' : undefined }}>
                <td className="col-no" style={{ background: 'inherit' }}>{i + 1}</td>
                <td style={{ background: 'inherit' }}><b style={{ fontWeight: 500 }}>{l.name}</b> {l.isNew && <span className="tag" style={{ background: '#fbe9df', color: '#8a3e1f', fontSize: 13 }}>ใหม่</span>}<div className="sub">{l.sub}</div></td>
                <td style={{ background: 'inherit' }}>{l.url}</td>
                <td style={{ background: 'inherit' }}><span className="row" style={{ gap: 6 }}><Toggle checked={l.on} disabled={l.main} onChange={(v) => setLangs(langs.map((x) => (x.code === l.code ? { ...x, on: v } : x)))} /> {l.on ? 'เปิด' : 'ปิด'}</span></td>
                <td style={{ background: 'inherit' }}>{l.main ? <span className="tag tag-blue"><Star size={12} style={{ marginRight: 4 }} />ภาษาหลัก</span> : '—'}</td>
                <td style={{ background: 'inherit' }}><div className="row"><div className="bar" style={{ width: 120 }}><i style={{ width: `${l.pct}%`, background: l.pct < 50 ? '#e8a557' : l.pct < 100 ? '#2f86c1' : '#5ab4b8' }} /></div><div><b>{l.pct}%</b><div className="t-sm t-secondary">{l.count}</div></div></div></td>
                <td style={{ background: 'inherit' }}><div className="row" style={{ gap: 2 }}><IconButton icon={Cog} title="ตั้งค่า" /><IconButton icon={Eye} title="ดูเว็บไซต์ภาษานี้" /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="col">
          <Card title={<span className="row"><span className="lang-badge">中</span><span>ตั้งค่าภาษาจีน (中文)<div className="card-sub" style={{ fontWeight: 400 }}>ใช้กับหน้าเว็บ /zh และแท็บ 中文 ในฟอร์มของ CMS</div></span></span>}>
            <div className="form-grid">
              <Field label="ชื่อที่แสดงในตัวเลือกภาษา"><Input defaultValue="中文" /></Field>
              <Field label="รูปแบบตัวอักษร"><Select options={['简体中文 · Simplified (zh-Hans)', '繁體中文 · Traditional (zh-Hant)']} /></Field>
              <Field label="URL prefix"><Input defaultValue="/zh" /></Field>
              <Field label="ฟอนต์บนหน้าเว็บ"><Select options={['Noto Sans SC', 'PingFang SC']} /></Field>
              <Field label="รูปแบบวันที่"><Select options={['2026年11月2日', '2026-11-02']} /></Field>
              <Field label="ตัวเลข / สกุลเงิน"><Select options={['฿1,234.56 · THB']} /></Field>
            </div>
            <div className="mt-16">
              <Toggle label="แสดง 中文 ในตัวเลือกภาษา (Language Switcher) บน Header" checked={cfg.switcher} onChange={(v) => setCfg({ ...cfg, switcher: v })} />
              <Toggle label='ให้ Search engine เก็บข้อมูล · ใส่ hreflang="zh-Hans" และ Sitemap /zh' checked={cfg.index} onChange={(v) => setCfg({ ...cfg, index: v })} />
              <Toggle label="Redirect ผู้ใช้ตามภาษาของเบราว์เซอร์อัตโนมัติ" checked={cfg.redirect} onChange={(v) => setCfg({ ...cfg, redirect: v })} />
            </div>
          </Card>
          <Card title="การแปล & การอนุมัติ">
            <Toggle label="ให้ AI Translator (CMS-24) ร่างคำแปล TH/EN → 中文 · บันทึกเป็น Draft เท่านั้น" checked={cfg.ai} onChange={(v) => setCfg({ ...cfg, ai: v })} />
            <Toggle label="ต้องผ่านผู้ตรวจภาษาจีนก่อนส่ง Auditor อนุมัติ" checked={cfg.reviewer} onChange={(v) => setCfg({ ...cfg, reviewer: v })} />
            <Toggle label="ฟิลด์บังคับเมื่อเปิดภาษาจีน: หัวข้อ · Meta title · Meta description" checked={cfg.required} onChange={(v) => setCfg({ ...cfg, required: v })} />
            <div className="info-soft row-between mt-8"><span className="row" style={{ gap: 8 }}><Users size={16} /> ผู้ตรวจภาษาจีน: Content Editor (ZH) · 2 คน — กำหนดที่ User & Role</span><Link className="t-link" to="/setting/users">จัดการ →</Link></div>
          </Card>
        </div>
        <div className="col">
          <Card title="เมื่อยังไม่มีคำแปลภาษาจีน" sub="หน้า หรือรายการที่ยังไม่มีเนื้อหา 中文 จะแสดงผลอย่างไรบน /zh">
            <div className="col" style={{ gap: 8 }}>
              {([['en', 'แสดงภาษาอังกฤษแทน (แนะนำ)', 'ผู้ใช้ชาวจีนส่วนใหญ่อ่านภาษาอังกฤษได้'], ['th', 'แสดงภาษาไทยแทน', ''], ['hide', 'ซ่อนหน้า / รายการนั้นในภาษาจีน', 'ไม่แสดงในเมนู ผลค้นหา และ Sitemap /zh']] as const).map(([k, l, d]) => (
                <label key={k} className={`radio-card ${fallback === k ? 'on solid' : ''}`}><input type="radio" checked={fallback === k} onChange={() => setFallback(k)} /><div><b style={{ fontWeight: 500 }}>{l}</b>{d && <div className="t-sm">{d}</div>}</div></label>
              ))}
              <Toggle label='แสดงแถบแจ้ง "此内容暂无中文版本" เมื่อแสดงภาษาอื่นแทน' checked={cfg.notice} onChange={(v) => setCfg({ ...cfg, notice: v })} />
            </div>
          </Card>
          <Card title="ความครบของเนื้อหาภาษาจีน ตามหมวดหมู่">
            {[['Menu & Path', 100, '86 / 86'], ['Products', 88, '46 / 52'], ['Rates', 100, 'ตัวเลขใช้ร่วมกัน'], ['Page Builder', 39, '120 / 310'], ['FAQ', 67, '64 / 96'], ['News', 8, '18 / 240']].map(([m, p, c]) => (
              <div className="lang-meter" key={m as string} style={{ gridTemplateColumns: '130px 1fr 50px 110px' }}><span>{m}</span><div className="bar"><i style={{ width: `${p}%`, background: (p as number) < 50 ? '#e8a557' : (p as number) < 100 ? '#2f86c1' : '#5ab4b8' }} /></div><b className="t-sm">{p}%</b><span className="t-sm t-secondary">{c}</span></div>
            ))}
          </Card>
        </div>
      </div>
      <InfoBanner>เนื้อหาภาษาจีนผ่าน Content Editor → Auditor เหมือนภาษาอื่น · ทุกการเปลี่ยนแปลงในหน้านี้บันทึกใน Audit Log (CMS-23) · ปิดภาษาจีนได้โดยไม่ลบเนื้อหาที่แปลไว้</InfoBanner>
      <Modal open={adding} onClose={() => setAdding(false)} title="เพิ่มภาษา" footer={<><Button onClick={() => setAdding(false)}>ยกเลิก</Button><Button variant="primary" onClick={() => { toast('เพิ่มภาษาแล้ว (ปิดใช้งานอยู่)', 'เปิดใช้เมื่อเนื้อหาพร้อม'); setAdding(false); }}>เพิ่มภาษา</Button></>}>
        <Field label="ภาษา"><Select options={['日本語 · Japanese (ja)', '한국어 · Korean (ko)', 'Tiếng Việt · Vietnamese (vi)', '繁體中文 · Traditional Chinese (zh-Hant)']} /></Field>
        <Field label="URL prefix"><Input defaultValue="/ja" /></Field>
        <div className="info-soft t-sm">ภาษาใหม่เริ่มต้นเป็น “ปิด” · ทุกฟอร์มจะมีแท็บภาษาใหม่ทันที เพื่อให้ทีมเตรียมเนื้อหาก่อนเปิดบนเว็บ</div>
      </Modal>
    </>
  );
}

/* ================= CMS-25A Setting — การเก็บเวอร์ชัน · CMS-25B ยืนยันลดจำนวน ================= */
interface Rev { mod: string; sub: string; n: number; usage: string; avg: number; max: number }
const REVS: Rev[] = [
  { mod: 'Page Builder', sub: 'เนื้อหาทุกประเภท · ประวัติเวอร์ชันมีเฉพาะ Page Builder', n: 10, usage: 'เฉลี่ย 6 · สูงสุด 10', avg: 6, max: 10 },
];
export function RevisionSetting() {
  const { toast } = useStore();
  const [def, setDef] = useState(10);
  const [rows, setRows] = useState(REVS);
  const [policy, setPolicy] = useState<'trash' | 'delete'>('trash');
  const [confirm, setConfirm] = useState(false);
  const reduced = rows.filter((r) => r.n < REVS.find((x) => x.mod === r.mod)!.n);
  const Stepper = ({ v, onChange }: { v: number; onChange: (n: number) => void }) => (
    <div className="stepper"><button disabled={v <= 1} onClick={() => onChange(v - 1)}><Minus size={14} /></button><span>{v}</span><button disabled={v >= 10} onClick={() => onChange(v + 1)}><Plus size={14} /></button><span className="t-secondary" style={{ marginLeft: 6 }}>เวอร์ชัน</span></div>
  );
  return (
    <>
      <PageHeader title="การเก็บเวอร์ชัน (Revision)" sub="กำหนดจำนวนเวอร์ชันย้อนหลังที่ระบบเก็บไว้ ให้ย้อนกลับไปแก้ไขหรือกู้คืนได้ · ปรับได้ 1–10 เวอร์ชันต่อรายการ"
        actions={<><Button icon={RefreshCw}>ประวัติการเปลี่ยนแปลง</Button><Button variant="primary" onClick={() => (reduced.length ? setConfirm(true) : toast('บันทึกการตั้งค่าแล้ว'))}>บันทึกการตั้งค่า</Button></>} />
      <Card title="ค่าเริ่มต้นของทุกหมวดหมู่" sub="ใช้กับหมวดหมู่ที่ไม่ได้ตั้งค่าแยก และหมวดหมู่ที่เพิ่มในอนาคต">
        <div className="row-between"><div><b style={{ fontWeight: 500 }}>จำนวนเวอร์ชันที่เก็บย้อนหลัง</b><div className="t-sm t-secondary">ต่ำสุด 1 · สูงสุด 10 เวอร์ชันต่อรายการ</div></div><div className="row"><Stepper v={def} onChange={setDef} />{def === 10 && <span className="tag-version">ตั้งค่าสูงสุดแล้ว</span>}</div></div>
        <div className="seg-bar mt-16">{Array.from({ length: 10 }, (_, i) => <i key={i} className={i < def ? 'on' : ''} />)}</div>
        <div className="row-between t-sm mt-8"><span>1</span><span>10 (สูงสุด)</span></div>
      </Card>
      <Card title="ตั้งค่าแยกตามหมวดหมู่" sub="กด − / + เพื่อเพิ่มหรือลดจำนวน · ลดจำนวนต้องยืนยันก่อนบันทึก" action={<Button size="sm" icon={RefreshCw} onClick={() => setRows(REVS.map((r) => ({ ...r, n: def })))}>รีเซ็ตเป็นค่าเริ่มต้น</Button>}>
        <table className="table">
          <thead><tr><th className="col-no">ลำดับ</th><th>หมวดหมู่</th><th>จำนวนเวอร์ชันที่เก็บ</th><th>ใช้อยู่ตอนนี้</th><th>หมายเหตุ</th></tr></thead>
          <tbody>
            {rows.map((r, i) => {
              const orig = REVS.find((x) => x.mod === r.mod)!;
              const lower = r.n < orig.n;
              return (
                <tr key={r.mod} className={lower ? 'highlight' : ''}>
                  <td className="col-no">{i + 1}</td>
                  <td><b style={{ fontWeight: 500 }}>{r.mod}</b><div className="sub">{r.sub}</div></td>
                  <td><Stepper v={r.n} onChange={(n) => setRows(rows.map((x) => (x.mod === r.mod ? { ...x, n } : x)))} /></td>
                  <td>{r.usage}</td>
                  <td>{lower ? <div className="note-soft-warning" style={{ padding: '6px 10px', fontSize: 14 }}>ลดจาก {orig.n} → {r.n} เวอร์ชัน{r.max > r.n ? ` · เกินอยู่ ${Math.max(0, (r.max - r.n) * 14)} เวอร์ชัน · ยืนยันตอนบันทึก` : ''}</div> : r.n === def ? <span className="t-secondary">ใช้ค่าเริ่มต้น</span> : <span className="tag-version">ตั้งค่าแยก</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <Card title="เมื่อจำนวนเวอร์ชันเกินที่กำหนด" sub="ระบบจัดการเวอร์ชันที่เก่าที่สุดอัตโนมัติทุกครั้งที่บันทึกเวอร์ชันใหม่">
        <div className="grid-2">
          <label className={`radio-card ${policy === 'trash' ? 'on' : ''}`}><input type="radio" checked={policy === 'trash'} onChange={() => setPolicy('trash')} /><div><b style={{ fontWeight: 500 }}>ย้ายเวอร์ชันที่เก่าที่สุดไป Recycle Bin (แนะนำ)</b><div className="t-sm t-secondary">กู้คืนได้ภายใน 30 วันจากเมนู Recycle Bin</div></div></label>
          <label className={`radio-card ${policy === 'delete' ? 'on' : ''}`}><input type="radio" checked={policy === 'delete'} onChange={() => setPolicy('delete')} /><div><b style={{ fontWeight: 500 }}>ลบเวอร์ชันที่เก่าที่สุดทันที</b><div className="t-sm t-secondary">ประหยัดพื้นที่ แต่กู้คืนไม่ได้</div></div></label>
        </div>
      </Card>
      <InfoBanner>เวอร์ชันที่เผยแพร่อยู่ (Live) ฉบับร่าง และเวอร์ชันที่รออนุมัติ ไม่นับรวมและไม่ถูกลบ · ทุกการเปลี่ยนแปลงในหน้านี้บันทึกใน Audit Log (CMS-23)</InfoBanner>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="ลดจำนวนเวอร์ชันที่เก็บ?" footer={<><Button onClick={() => setConfirm(false)}>ยกเลิก</Button><Button variant="primary" onClick={() => { toast('บันทึกการตั้งค่าแล้ว', `ย้ายเวอร์ชันเกินไป${policy === 'trash' ? 'Recycle Bin' : 'ลบ'} · บันทึกใน Audit Log`); setConfirm(false); }}>ยืนยันและบันทึก</Button></>}>
        {reduced.map((r) => {
          const orig = REVS.find((x) => x.mod === r.mod)!;
          return <div key={r.mod} className="ready-box row-between" style={{ flexDirection: 'row' }}><div><b>{r.mod}</b><div className="t-sm t-secondary">จำนวนเวอร์ชันที่เก็บ</div></div><b className="t-h3" style={{ fontSize: 18 }}>{orig.n} → {r.n} เวอร์ชัน</b></div>;
        })}
        <div className="note-soft-warning" style={{ flexDirection: 'column', gap: 2 }}><b>⚠️ มี 42 เวอร์ชันเก่าจาก 14 รายการที่เกินจำนวนใหม่</b><span>ระบบจะเก็บ {reduced[0]?.n} เวอร์ชันล่าสุดของแต่ละรายการ และ{policy === 'trash' ? 'ย้ายเวอร์ชันที่เก่ากว่าไป Recycle Bin' : 'ลบเวอร์ชันที่เก่ากว่าทันที'}</span></div>
        <div style={{ border: '1px solid var(--lh-border-default)', borderRadius: 10 }}>
          {[['สินเชื่อบ้าน Home 1st Class', 'เก็บ v6–v10 · ย้าย v3–v5', '3'], ['บัตรเดบิต LHB Rewards', 'เก็บ v4–v8 · ย้าย v2–v3', '2'], ['และอีก 12 รายการ', 'ดูรายการทั้งหมดก่อนยืนยัน', '37']].map(([t, s, n], i) => (
            <div key={t} className="row-between" style={{ padding: '10px 14px', borderTop: i ? '1px solid var(--lh-border-default)' : 0 }}><div><b style={{ fontWeight: 500, color: i === 2 ? 'var(--lh-text-link)' : undefined }}>{t}</b><div className="t-sm t-secondary">{s}</div></div><span>{n} เวอร์ชัน</span></div>
          ))}
        </div>
        <div className="row-between"><span>เวอร์ชันที่เกิน: {policy === 'trash' ? 'ย้ายไป Recycle Bin (กู้คืนได้ 30 วัน)' : 'ลบทันที (กู้คืนไม่ได้)'}</span><a className="t-link" onClick={() => setPolicy(policy === 'trash' ? 'delete' : 'trash')}>เปลี่ยน</a></div>
        <p className="t-sm t-secondary">ไม่กระทบเวอร์ชันที่เผยแพร่อยู่ ฉบับร่าง และเวอร์ชันที่รออนุมัติ · บันทึกใน Audit Log</p>
      </Modal>
    </>
  );
}
