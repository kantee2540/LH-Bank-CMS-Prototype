import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Copy, Trash2, Eye, Pencil, Info, RefreshCw, Move, Settings, LayoutGrid, Download, Upload, Maximize2, Undo2, Redo2, Clock, X, FileText, Image as ImageIcon, Menu, Users, Gift, ArrowLeftRight, Calculator, TrendingUp, Smartphone, Percent, HelpCircle, MessageSquare, Layers, Lock, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, Card, Field, Input, Select, Tabs, Toggle, Status, IconButton, Modal, PageHeader, LangSwitch } from '../components/ui';
import ListPage, { selectFilter, textFilter } from '../components/ListPage';
import { useStore } from '../store';
import type { ContentStatus } from '../types';
import './pages.css';

/* ================= CMS-06A Layout — รายการ Layout ================= */
type Tpl = 'Landing' | 'Product Template' | 'Listing' | 'Content Page';
interface LayoutRow { id: string; name: string; path: string; tpl: Tpl; langs: string; sections: number; status: ContentStatus; updated: string }
const LAYOUTS: LayoutRow[] = [
  { id: 'home', name: 'หน้าแรก (Personal)', path: '/th/personal', tpl: 'Landing', langs: 'TH · EN', sections: 8, status: 'Published', updated: '30/10/2026' },
  { id: 'ln-00', name: 'สินเชื่อ (LN-00)', path: '/th/personal/loan', tpl: 'Landing', langs: 'TH · EN', sections: 9, status: 'Published', updated: '29/10/2026' },
  { id: 'hl-02', name: 'สินเชื่อรีไฟแนนซ์บ้าน (HL-02)', path: '/th/personal/loan/home-loan/refinance', tpl: 'Product Template', langs: 'TH · EN', sections: 10, status: 'Published', updated: '26/10/2026' },
  { id: 'iv-01', name: 'การลงทุน (IV-01)', path: '/th/personal/investment', tpl: 'Landing', langs: 'TH', sections: 6, status: 'Scheduled', updated: '02/11/2026' },
  { id: 'cc-01', name: 'บัตรเครดิต (CC-01)', path: '/th/personal/credit-card', tpl: 'Landing', langs: 'TH · EN', sections: 5, status: 'Published', updated: '28/10/2026' },
  { id: 'npa-01', name: 'ทรัพย์ธนาคารเสนอขาย (NPA-01)', path: '/th/npa', tpl: 'Listing', langs: 'TH', sections: 4, status: 'Published', updated: '27/10/2026' },
  { id: 'su-01', name: 'ความยั่งยืน (SU-01)', path: '/th/sustainability', tpl: 'Landing', langs: 'TH · EN', sections: 7, status: 'Draft', updated: '01/11/2026' },
  { id: 'co-01', name: 'ลูกค้าธุรกิจ (CO-01)', path: '/th/corporate', tpl: 'Landing', langs: 'TH', sections: 6, status: 'Draft', updated: '01/11/2026' },
  { id: 'privacy', name: 'ประกาศความเป็นส่วนตัว', path: '/th/privacy-notice', tpl: 'Content Page', langs: 'TH · EN', sections: 2, status: 'Published', updated: '01/10/2026' },
];
const TPLS: Tpl[] = ['Landing', 'Product Template', 'Listing', 'Content Page'];

function TplThumb({ tpl, size = 44 }: { tpl: Tpl; size?: number }) {
  const rows = tpl === 'Landing' ? [[1], [1, 1, 1], [1, 1]] : tpl === 'Product Template' ? [[1], [1, 1], [1]] : tpl === 'Listing' ? [[1], [1, 1, 1], [1, 1, 1]] : [[1], [1], [1]];
  return (
    <div className="tpl-thumb" style={{ width: size, height: size * 0.66 }}>
      {rows.map((r, i) => <div key={i} className="row" style={{ gap: 2 }}>{r.map((_, j) => <i key={j} style={{ background: i === 0 ? '#2f86c1' : i === 1 ? '#5ab4b8' : '#a9afa5' }} />)}</div>)}
    </div>
  );
}

export function LayoutList() {
  const navigate = useNavigate();
  const { toast, trash } = useStore();
  const [rows, setRows] = useState(LAYOUTS);
  const [tpl, setTpl] = useState<Tpl | 'all'>('all');
  const [del, setDel] = useState<LayoutRow | null>(null);
  const [fromTpl, setFromTpl] = useState(false);
  return (
    <ListPage<LayoutRow>
      crumbs={[{ label: 'Layout' }]} title="Layout"
      filters={[textFilter('n', 'ชื่อ Layout', (r) => r.name), selectFilter('t', 'Template', TPLS, (r) => r.tpl), { key: 'l', label: 'ภาษา', kind: 'select', options: ['All', 'TH', 'EN'], match: (r, v) => r.langs.includes(v) }, selectFilter('s', 'Status', ['Published', 'Scheduled', 'Draft'], (r) => r.status)]}
      rows={rows.filter((r) => tpl === 'all' || r.tpl === tpl)} rowKey={(r) => r.id}
      above={<Tabs value={tpl} onChange={setTpl} style={{ marginBottom: 16, marginTop: -8 }} tabs={[{ value: 'all', label: `ทั้งหมด (${rows.length})` }, ...TPLS.map((t) => ({ value: t, label: `${t} (${rows.filter((r) => r.tpl === t).length})` }))]} />}
      toolbar={<>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/layout/new')}>Create Layout</Button>
        <Button icon={Copy} onClick={() => setFromTpl(true)}>สร้างจาก Template</Button>
        <Link to="/trash" className="btn btn-secondary"><Trash2 strokeWidth={1.6} /> ถังขยะ ({trash.filter((t) => t.module === 'Layout').length})</Link>
      </>}
      toolbarRight={<span className="row t-secondary" style={{ gap: 8 }}><Info size={18} color="#1f6fa8" /> 1 Layout ผูกกับ 1 Path ใน Path Structure · เผยแพร่ต้องผ่านผู้อนุมัติ</span>}
      columns={[
        { key: 'n', label: 'Layout', render: (r) => <div className="row"><TplThumb tpl={r.tpl} /><div><Link className="t-link" style={{ fontWeight: 400 }} to={`/layout/${r.id}`}>{r.name}</Link><div className="sub" style={{ maxWidth: 180, overflowWrap: 'anywhere' }}>{r.path}</div></div></div> },
        { key: 't', label: 'Template', render: (r) => <span className="tag">{r.tpl}</span> },
        { key: 'l', label: 'ภาษา', render: (r) => r.langs },
        { key: 's', label: 'Sections', render: (r) => r.sections },
        { key: 'st', label: 'Status', render: (r) => <Status status={r.status} /> },
        { key: 'u', label: 'แก้ไขล่าสุด', render: (r) => r.updated },
        { key: 'a', label: 'Action', render: (r) => <div className="row" style={{ gap: 0 }}><IconButton icon={Eye} title="Preview" onClick={() => toast('Preview', r.path)} /><IconButton icon={Copy} title="ทำสำเนา" onClick={() => { setRows([...rows, { ...r, id: `${r.id}-copy`, name: `${r.name} (สำเนา)`, status: 'Draft' }]); toast('ทำสำเนาแล้ว', r.name); }} /><IconButton icon={Pencil} title="แก้ไข" onClick={() => navigate(`/layout/${r.id}`)} /><IconButton icon={Trash2} danger title="ลบ" onClick={() => setDel(r)} /></div> },
      ]}
    >
      <Modal open={!!del} onClose={() => setDel(null)} title="ย้าย Layout ไปถังขยะ?" footer={<><Button onClick={() => setDel(null)}>ยกเลิก</Button><Button variant="danger" onClick={() => { setRows(rows.filter((r) => r.id !== del?.id)); toast('ย้ายไปถังขยะแล้ว', del?.name); setDel(null); }}>ย้ายไปถังขยะ</Button></>}>
        <p className="t-secondary">Path {del?.path} จะแสดง 404 จนกว่าจะผูก Layout ใหม่หรือกู้คืน</p>
      </Modal>
      <Modal open={fromTpl} onClose={() => setFromTpl(false)} width={760} title="สร้าง Layout จาก Template" footer={<><Button onClick={() => setFromTpl(false)}>ยกเลิก</Button><Button variant="primary" onClick={() => navigate('/layout/new?tpl=Product Template')}>ถัดไป</Button></>}>
        <div className="tpl-grid">{TPLS.map((t, i) => <button key={t} className={`tpl-card ${i === 1 ? 'on' : ''}`}><TplThumb tpl={t} size={150} /><b>{t}</b></button>)}</div>
      </Modal>
    </ListPage>
  );
}

/* ================= Page Builder model ================= */
interface Widget { id: string; name: string; icon: LucideIcon; kind?: 'calc' }
interface Section { id: string; name: string; grid: string; widgets: Widget[]; anchor: string; bg: string; source?: string }
const HOME_SECTIONS: Section[] = [
  { id: 's1', name: 'Hero', grid: '6-6', anchor: 'hero', bg: 'white', widgets: [{ id: 'w1', name: 'Hero Copy + CTA', icon: FileText }, { id: 'w2', name: 'Banner Carousel · Hero Banner', icon: ImageIcon }] },
  { id: 's2', name: 'Quick Tasks', grid: '12', anchor: 'quick-tasks', bg: 'white', widgets: [{ id: 'w3', name: 'Menu · Quick Tasks (6)', icon: Menu }] },
  { id: 's3', name: 'Life Stage', grid: '4-8', anchor: 'life-stage', bg: 'subtle', widgets: [{ id: 'w4', name: 'Menu · Life Stage', icon: Users }, { id: 'w5', name: 'Product Picks ตามช่วงชีวิต', icon: Gift }] },
  { id: 's4', name: 'Promotions', grid: '12', anchor: 'promotions', bg: 'subtle', source: 'Promotion', widgets: [{ id: 'w6', name: 'Promotion Cards · 3 รายการล่าสุด', icon: Gift }] },
  { id: 's5', name: 'Tools', grid: '6-6', anchor: 'tools', bg: 'white', widgets: [{ id: 'w7', name: 'FX Rate Table', icon: ArrowLeftRight }, { id: 'w8', name: 'Home Loan Calculator', icon: Calculator, kind: 'calc' }] },
  { id: 's6', name: 'LH Bank Advisory', grid: '12', anchor: 'advisory', bg: 'white', widgets: [{ id: 'w9', name: 'Article Cards · Advisory (3)', icon: TrendingUp }] },
  { id: 's7', name: 'App Banner', grid: '12', anchor: 'app', bg: 'navy', widgets: [{ id: 'w10', name: 'Banner · LHB You', icon: Smartphone }] },
  { id: 's8', name: 'News & Activity', grid: '12', anchor: 'news', bg: 'white', widgets: [{ id: 'w11', name: 'News Cards (3) + Shortcuts', icon: FileText }] },
];
const PRODUCT_SECTIONS: Section[] = [
  { id: 'p1', name: 'Product Hero', grid: '6-6', anchor: 'hero', bg: 'white', widgets: [{ id: 'q1', name: 'Hero Copy + CTA', icon: FileText }, { id: 'q2', name: 'Image', icon: ImageIcon }] },
  { id: 'p2', name: 'จุดเด่น', grid: '12', anchor: 'highlights', bg: 'subtle', widgets: [{ id: 'q3', name: 'Highlights · 3 การ์ด', icon: Layers }] },
  { id: 'p3', name: 'Tools', grid: '6-6', anchor: 'tools', bg: 'white', widgets: [{ id: 'q4', name: 'Rate Table · สินเชื่อบ้าน', icon: Percent }, { id: 'q5', name: 'Calculator · รีไฟแนนซ์', icon: Calculator, kind: 'calc' }] },
  { id: 'p4', name: 'FAQ', grid: '12', anchor: 'faq', bg: 'white', widgets: [{ id: 'q6', name: 'FAQ · หมวดสินเชื่อบ้าน', icon: HelpCircle }] },
  { id: 'p5', name: 'Drop Lead', grid: '12', anchor: 'drop-lead', bg: 'subtle', widgets: [{ id: 'q7', name: 'Drop-lead Form', icon: MessageSquare }] },
];
const GRIDS = ['12', '6-6', '4-8', '8-4', '4-4-4', '3-3-6', '6-3-3', '3-3-3-3'];
const WIDGET_LIB: Widget[] = [
  { id: 'lib1', name: 'Rich Text', icon: FileText }, { id: 'lib2', name: 'Image', icon: ImageIcon }, { id: 'lib3', name: 'Banner Carousel', icon: ImageIcon },
  { id: 'lib4', name: 'Product Cards', icon: Gift }, { id: 'lib5', name: 'Promotion Cards', icon: Gift }, { id: 'lib6', name: 'Rate Table', icon: Percent },
  { id: 'lib7', name: 'Calculator', icon: Calculator, kind: 'calc' }, { id: 'lib8', name: 'FAQ', icon: HelpCircle }, { id: 'lib9', name: 'Article Cards', icon: TrendingUp },
  { id: 'lib10', name: 'Menu / Shortcuts', icon: Menu }, { id: 'lib11', name: 'Drop-lead Form', icon: MessageSquare }, { id: 'lib12', name: 'FX Rate Table', icon: ArrowLeftRight },
];
const VERSIONS = [
  ['v13', 'Draft', '02/11/2026', 'เพิ่ม Section ใหม่ 6-6 ต่อจาก Promotions', 'Content Editor 02 · 16:42 น.'],
  ['v12', 'Published', '30/10/2026', 'อนุมัติและเผยแพร่', 'Auditor – Marketing · 09:15 น.'],
  ['v11', 'Expired', '28/10/2026', 'ย้าย Section Tools ขึ้น 1 ลำดับ', 'Content Editor 01 · 14:20 น.'],
  ['v10', 'Expired', '20/10/2026', 'เปลี่ยน Hero Banner เป็น Carousel', 'Content Editor 02 · 11:05 น.'],
] as const;

type Device = 'desktop' | 'tablet' | 'mobile';
type Panel = 'section' | 'widget' | 'library' | 'history';

/* CMS-06 / 06B / 06C / 06D / 06E — Edit Layout */
export function LayoutEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, submitRequest } = useStore();
  const base = LAYOUTS.find((l) => l.id === id);
  const isNew = !base;
  const [tab, setTab] = useState<'general' | 'layout' | 'seo'>(isNew ? 'general' : 'layout');
  const [lang, setLang] = useState<'th' | 'en' | 'zh'>('th');
  const [tpl, setTpl] = useState<Tpl>(base?.tpl ?? 'Landing');
  const [history, setHistory] = useState<Section[][]>([base?.tpl === 'Product Template' ? PRODUCT_SECTIONS : isNew ? [] : HOME_SECTIONS]);
  const [hIdx, setHIdx] = useState(0);
  const sections = history[hIdx];
  const [selSec, setSelSec] = useState<string | null>(sections[3]?.id ?? sections[0]?.id ?? null);
  const [selW, setSelW] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>('section');
  const [device, setDevice] = useState<Device>('desktop');
  const [adding, setAdding] = useState(false);
  const [newGrid, setNewGrid] = useState('6-6');
  const [libTarget, setLibTarget] = useState<string | null>(null);
  const [globals, setGlobals] = useState({ header: true, footer: true, lead: true, cookie: true, float: false });
  const [modes, setModes] = useState({ lower: true, faster: true, topup: true, interest: false });
  const [theme, setTheme] = useState<'dark' | 'light' | 'mint'>('dark');

  const commit = (next: Section[]) => { const h = history.slice(0, hIdx + 1); setHistory([...h, next]); setHIdx(h.length); };
  const sec = sections.find((s) => s.id === selSec);
  const widget = sections.flatMap((s) => s.widgets).find((w) => w.id === selW);
  const patchSec = (p: Partial<Section>) => sec && commit(sections.map((s) => (s.id === sec.id ? { ...s, ...p } : s)));
  const moveSec = (sid: string, d: -1 | 1) => { const i = sections.findIndex((s) => s.id === sid); const j = i + d; if (j < 0 || j >= sections.length) return; const c = [...sections]; [c[i], c[j]] = [c[j], c[i]]; commit(c); };
  const title = isNew ? 'สร้าง Layout ใหม่' : `Edit Layout · ${base.name.replace(/ \(.*\)$/, '')}${base.id === 'home' ? ' (Personal)' : ''}`;
  const submit = () => { submitRequest({ title: base?.name ?? 'Layout ใหม่', module: 'Layout', sub: 'Layout · แก้ไขหน้า' }); toast('ส่งอนุมัติแล้ว', `${base?.name ?? 'Layout ใหม่'} · v13`); navigate('/requests'); };

  const sectionCard = (s: Section) => {
    const cols = s.grid.split('-').map(Number);
    return (
      <div key={s.id} className={`pb-section ${selSec === s.id && !selW ? 'on' : ''}`} onClick={() => { setSelSec(s.id); setSelW(null); setPanel('section'); }}>
        <div className="row-between">
          <span className="pb-label"><Move size={13} /> {s.name} · Section {s.grid}</span>
          {selSec === s.id && !selW && (
            <div className="row" style={{ gap: 0 }} onClick={(e) => e.stopPropagation()}>
              <button className="icon-btn" title="ขึ้น" onClick={() => moveSec(s.id, -1)}>↑</button>
              <button className="icon-btn" title="ลง" onClick={() => moveSec(s.id, 1)}>↓</button>
              <IconButton icon={Copy} title="ทำสำเนา" onClick={() => commit([...sections.slice(0, sections.indexOf(s) + 1), { ...s, id: `s${Date.now()}`, name: `${s.name} (สำเนา)` }, ...sections.slice(sections.indexOf(s) + 1)])} />
              <IconButton icon={Settings} title="ตั้งค่า" onClick={() => setPanel('section')} />
              <IconButton icon={Trash2} danger title="ลบ Section" onClick={() => { commit(sections.filter((x) => x.id !== s.id)); setSelSec(null); }} />
            </div>
          )}
        </div>
        <div className="pb-cols" style={{ gridTemplateColumns: device === 'mobile' ? '1fr' : cols.map((c) => `${c}fr`).join(' ') }}>
          {s.widgets.map((w) => (
            <div key={w.id} className={`pb-widget ${selW === w.id ? 'on' : ''} ${w.kind === 'calc' && selW === w.id ? 'calc' : ''}`} onClick={(e) => { e.stopPropagation(); setSelSec(s.id); setSelW(w.id); setPanel('widget'); }}>
              <div className="row-between"><span className="row" style={{ gap: 8 }}><w.icon size={15} /> {w.name}</span>
                {selW === w.id && <span className="row" style={{ gap: 0 }} onClick={(e) => e.stopPropagation()}><IconButton icon={Trash2} danger title="ลบ Widget" onClick={() => { commit(sections.map((x) => (x.id === s.id ? { ...x, widgets: x.widgets.filter((y) => y.id !== w.id) } : x))); setSelW(null); }} /></span>}
              </div>
              {w.kind === 'calc' && selW === w.id && (
                <div className={`calc-preview mini ${theme}`}>
                  <b className="t-sm">รีไฟแนนซ์ช่วยประหยัดเท่าไร?</b>
                  <div className="row mt-8" style={{ gap: 4, flexWrap: 'wrap' }}>{([['lower', 'ลดค่างวด'], ['faster', 'ปิดไวขึ้น'], ['topup', 'กู้เพิ่ม'], ['interest', 'ลดดอกเบี้ย']] as const).filter(([k]) => modes[k]).map(([k, l], i) => <span key={k} className={`cp-tab ${i === 0 ? 'on' : ''}`}>{l}</span>)}</div>
                  <div className="cp-result t-sm">ประหยัดได้ประมาณ x,xxx บาท/เดือน</div>
                </div>
              )}
            </div>
          ))}
          {s.widgets.length < cols.length && device !== 'mobile' && Array.from({ length: cols.length - s.widgets.length }, (_, i) => (
            <button key={i} className="pb-empty" onClick={(e) => { e.stopPropagation(); setLibTarget(s.id); setPanel('library'); }}>+ เพิ่ม Widget</button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="with-bottom-bar">
      <PageHeader crumbs={[{ label: 'Layout', to: '/layout' }, { label: base?.name ?? 'สร้าง Layout' }, { label: 'Edit' }]} title={title}
        badges={<Status status={hIdx > 0 ? 'Draft' : base?.status ?? 'Draft'} />}
        actions={<><Button icon={RefreshCw} onClick={() => { setTab('layout'); setPanel('history'); }}>ประวัติการแก้ไข</Button><Button icon={Eye} onClick={() => { setTab('layout'); setDevice('mobile'); setPanel('history'); }}>Preview</Button></>} />
      <section className="card" style={{ padding: '4px 16px 0' }}>
        <Tabs value={tab} onChange={setTab} style={{ borderBottom: 0 }} tabs={[{ value: 'general', label: 'General' }, { value: 'layout', label: 'Layout' }, { value: 'seo', label: 'SEO' }]} />
      </section>

      {tab === 'general' && (
        <div className="split">
          <div className="col">
            <Card title="ข้อมูลทั่วไป">
              <LangSwitch value={lang} onChange={setLang} options={[{ value: 'th', label: 'TH (Main)' }, { value: 'en', label: 'EN' }, { value: 'zh', label: '中文' }]} />
              <div className="form-grid">
                <Field label="ชื่อ Layout" required><Input defaultValue={lang === 'th' ? base?.name.replace(/ \(.*\)$/, '') : ''} /></Field>
                <Field label="Layout Code"><Input defaultValue={base?.id.toUpperCase()} /></Field>
                <div style={{ gridColumn: '1/-1' }}><Field label="Path (จาก Path Structure)" required><Select defaultValue={base?.path.slice(1)} options={LAYOUTS.map((l) => l.path.slice(1))} /></Field></div>
                <Field label="รูปแบบ Header"><Select options={['Default (พื้นขาว)', 'Transparent (บน Hero)']} /></Field>
                <Field label="ความกว้างเนื้อหา"><Select options={['1200 px (Container)', 'Full width']} /></Field>
              </div>
              <div className="grid-2 mt-8"><Toggle label="แสดง Breadcrumb" checked onChange={() => undefined} /><Toggle label="แสดงเมนู Anchor (Sticky)" checked onChange={() => undefined} /><Toggle label="ซ่อนจากผลการค้นหาในเว็บ" checked={false} onChange={() => undefined} /></div>
            </Card>
            <Card title="Template" action={<span className="t-sm t-secondary">เปลี่ยน Template จะเก็บ Section เดิมไว้ใน Draft</span>}>
              <div className="tpl-grid">{TPLS.map((t) => <button key={t} className={`tpl-card ${tpl === t ? 'on' : ''}`} onClick={() => setTpl(t)}><TplThumb tpl={t} size={140} /><b>{t}</b><span className="t-sm t-secondary">{{ Landing: 'หน้าหลักของหมวด', 'Product Template': 'หน้ารายละเอียดผลิตภัณฑ์', Listing: 'รายการ + ตัวกรอง', 'Content Page': 'บทความ / ประกาศ' }[t]}</span></button>)}</div>
            </Card>
            <Card title="ส่วนประกอบที่ใช้ร่วมกันทั้งเว็บ (Global)">
              <div className="grid-2">
                <Toggle label="Header + Main Nav" checked={globals.header} onChange={(v) => setGlobals({ ...globals, header: v })} />
                <Toggle label="Footer" checked={globals.footer} onChange={(v) => setGlobals({ ...globals, footer: v })} />
                <Toggle label="Drop-lead Form (ติดต่อกลับ)" checked={globals.lead} onChange={(v) => setGlobals({ ...globals, lead: v })} />
                <Toggle label="Cookie Consent Banner" checked={globals.cookie} onChange={(v) => setGlobals({ ...globals, cookie: v })} />
                <Toggle label="ปุ่มลอย ติดต่อเรา 1327" checked={globals.float} onChange={(v) => setGlobals({ ...globals, float: v })} />
              </div>
            </Card>
          </div>
          <div className="col">
            <Card title="การเผยแพร่"><div className="col"><Field label="สถานะ"><Select defaultValue={base?.status} options={['Published', 'Scheduled', 'Draft']} /></Field><Field label="วันที่เริ่มแสดง"><Input type="datetime-local" defaultValue="2026-10-15T00:00" /></Field><Field label="วันที่สิ้นสุด"><Select options={['ไม่กำหนด', '31/12/2026']} /></Field><Field label="ผู้อนุมัติ"><Select options={['Auditor – Marketing', 'Auditor – ฝ่ายสินเชื่อ']} /></Field></div></Card>
            <Card title="ข้อมูลระบบ">{[['สร้างโดย', 'Content Editor 01 · 01/09/2026'], ['แก้ไขล่าสุด', 'Content Editor 02 · 26/10/2026 16:40'], ['เวอร์ชัน', 'v12 (Published) · v13 (Draft)'], ['URL', `lhbank.co.th${base?.path ?? '/'}`]].map(([k, v]) => <div key={k} style={{ marginBottom: 10 }}><div className="t-sm t-secondary">{k}</div><b className="t-sm" style={{ overflowWrap: 'anywhere' }}>{v}</b></div>)}</Card>
          </div>
        </div>
      )}

      {tab === 'seo' && (
        <Card title="SEO ของหน้า">
          <div className="grid-2" style={{ gap: 24 }}>
            <div className="col">
              <Field label="Meta title" required hint="(≤ 60)"><Input defaultValue={`${base?.name ?? 'หน้าใหม่'} | LH Bank`} /></Field>
              <Field label="Meta description" required hint="(≤ 160)"><Input defaultValue="ธนาคารที่เข้าใจทุกช่วงชีวิตของคุณ ฝาก กู้ ลงทุน และวางแผนการเงินครบในที่เดียว" /></Field>
              <Field label="H1 ของหน้า"><Input defaultValue="ธนาคารที่เข้าใจทุกช่วงชีวิตของคุณ" /></Field>
              <Field label="Canonical"><Input defaultValue={`https://www.lhbank.co.th${base?.path ?? ''}`} /></Field>
            </div>
            <div className="serp" style={{ alignSelf: 'start' }}><div className="t-sm t-secondary">lhbank.co.th{base?.path.replace(/\//g, ' › ')}</div><div className="title">{base?.name ?? 'หน้าใหม่'} | LH Bank</div><div className="t-sm t-secondary">ธนาคารที่เข้าใจทุกช่วงชีวิตของคุณ ฝาก กู้ ลงทุน และวางแผนการเงินครบในที่เดียว</div></div>
          </div>
        </Card>
      )}

      {tab === 'layout' && (
        <section className="pb">
          <div className="pb-bar">
            <b>Page Builder</b>
            <div className="pb-seg">{(['desktop', 'tablet', 'mobile'] as Device[]).map((d) => <button key={d} className={device === d ? 'on' : ''} onClick={() => setDevice(d)}>{d[0].toUpperCase() + d.slice(1)}</button>)}</div>
            <span className="grow" />
            <button className="pb-tool" disabled={hIdx === 0} onClick={() => setHIdx(hIdx - 1)}><Undo2 size={15} /> Undo</button>
            <button className="pb-tool" disabled={hIdx >= history.length - 1} onClick={() => setHIdx(hIdx + 1)}><Redo2 size={15} /> Redo</button>
            <span className="t-sm">{device === 'mobile' ? '390 × 844 · ' : ''}100%</span>
            <button className="pb-tool" title="Export JSON" onClick={() => toast('Export Layout', 'layout-home.json')}><Download size={15} /></button>
            <button className="pb-tool" title="Import JSON"><Upload size={15} /></button>
            <button className="pb-tool" title="เต็มจอ"><Maximize2 size={15} /></button>
            <button className={`pb-tool ${panel !== 'library' && panel !== 'history' ? 'on' : ''}`} title="ตั้งค่า" onClick={() => setPanel(selW ? 'widget' : 'section')}><Settings size={15} /></button>
            <button className={`pb-tool ${panel === 'library' ? 'on' : ''}`} title="Widget Library" onClick={() => { setLibTarget(selSec); setPanel('library'); }}><LayoutGrid size={15} /></button>
            <button className={`pb-tool ${panel === 'history' ? 'on' : ''}`} title="ประวัติเวอร์ชัน" onClick={() => setPanel('history')}><Clock size={15} /></button>
          </div>
          <div className="pb-body">
            <div className="pb-canvas">
              {device === 'mobile' ? (
                <div className="phone">
                  <div className="phone-top"><b>LH <span style={{ fontWeight: 300 }}>BANK</span></b><span className="row" style={{ gap: 10 }}><Search size={16} /><Menu size={16} /></span></div>
                  <div className="phone-hero"><b>ธนาคารที่เข้าใจ<br />ทุกช่วงชีวิตของคุณ</b><p className="t-sm">ฝาก กู้ ลงทุน และวางแผนการเงินครบในที่เดียว</p><div className="phone-promo"><span className="t-sm">ลูกค้าใหม่ รับ E-Voucher</span><b>200 บาท</b></div></div>
                  <div style={{ padding: 14 }}><b className="t-sm">ทำรายการอะไรวันนี้?</b><div className="phone-grid">{[['โปรโมชัน', Gift], ['ดอกเบี้ย', Percent], ['แลกเปลี่ยน', ArrowLeftRight], ['สาขา/ATM', Info], ['คำนวณ', Calculator], ['บทวิเคราะห์', TrendingUp]].map(([l, I]) => { const Ic = I as LucideIcon; return <div key={l as string}><Ic size={16} /><span>{l as string}</span></div>; })}</div></div>
                  <div className="phone-life"><b className="t-sm">ตามช่วงชีวิต</b>{['เริ่มทำงาน', 'สร้างครอบครัว'].map((x) => <div key={x} className="row"><span className="stage-ic" style={{ background: '#7fb3b8', width: 26, height: 26 }} />{x}</div>)}</div>
                  {sections.length > HOME_SECTIONS.length && <div className="phone-new t-sm">+ Section ใหม่ ({sections.length - HOME_SECTIONS.length})</div>}
                </div>
              ) : (
                <div className="col" style={{ gap: 10, maxWidth: device === 'tablet' ? 640 : undefined, margin: '0 auto', width: '100%' }}>
                  {sections.map(sectionCard)}
                  <button className="pb-add" onClick={() => setAdding(true)}><Plus size={16} /> เพิ่ม Section</button>
                </div>
              )}
              {device === 'mobile' && <p className="t-sm t-secondary row" style={{ justifyContent: 'center', gap: 6, marginTop: 10 }}><Eye size={14} /> Section “Life Stage” บน Mobile แสดงเป็นรายการแนวตั้ง (ซ่อนแผงแนะนำ)</p>}
            </div>
            <aside className="pb-panel">
              {panel === 'section' && sec && (
                <>
                  <div className="pb-ph">Info</div>
                  <div className="pb-pc"><Field label="Name"><Input value={sec.name} onChange={(e) => patchSec({ name: e.target.value })} /></Field><Field label="Anchor ID"><Input value={sec.anchor} onChange={(e) => patchSec({ anchor: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} /></Field><p className="t-sm t-secondary">ใช้ a–z, 0–9 และ - เท่านั้น ห้ามขึ้นต้นด้วยตัวเลข</p><Field label="รูปแบบคอลัมน์"><Select value={sec.grid} onChange={(e) => patchSec({ grid: e.target.value })} options={GRIDS.map((g) => ({ value: g, label: `Section ${g}` }))} /></Field></div>
                  <div className="pb-ph">Data Source</div>
                  <div className="pb-pc"><Field label="Content Type"><Select value={sec.source ?? 'ไม่ใช้'} onChange={(e) => patchSec({ source: e.target.value })} options={['ไม่ใช้', 'Promotion', 'Product', 'News', 'Advisory', 'FAQ']} /></Field><Field label="จำนวนที่แสดง"><Select options={['3 รายการ', '4 รายการ', '6 รายการ']} /></Field><Field label="เรียงลำดับ"><Select options={['ล่าสุดก่อน', 'ตามลำดับที่ตั้ง', 'ยอดนิยม']} /></Field></div>
                  <div className="pb-ph">Background</div>
                  <div className="pb-pc"><span className="field-label">Color</span><div className="row">{[['white', '#fff'], ['subtle', '#eef5fb'], ['gray', '#eef1f4'], ['navy', '#2f4f66']].map(([k, c]) => <button key={k} className={`swatch sq ${sec.bg === k ? 'on' : ''}`} style={{ background: c }} onClick={() => patchSec({ bg: k })} />)}</div><span className="t-sm t-secondary">color/bg/{sec.bg}</span></div>
                </>
              )}
              {panel === 'section' && !sec && <p className="t-secondary" style={{ padding: 20 }}>เลือก Section บน Canvas เพื่อตั้งค่า</p>}
              {panel === 'widget' && widget && (
                <>
                  <div className="row-between" style={{ padding: '12px 14px' }}><span className="row"><span className="lang-badge" style={{ width: 30, height: 30 }}><widget.icon size={15} /></span><div><b style={{ fontWeight: 500 }}>{widget.kind === 'calc' ? 'Calculator' : widget.name.split(' · ')[0]}</b><div className="t-sm t-secondary">Section {sec?.name} · คอลัมน์ {(sec?.widgets.indexOf(widget) ?? 0) + 1}</div></div></span><IconButton icon={X} title="ปิด" onClick={() => { setSelW(null); setPanel('section'); }} /></div>
                  <div className="pb-ph">ข้อมูล Widget</div>
                  <div className="pb-pc"><Field label="ชื่อ Widget (ภายใน)"><Input defaultValue={widget.name} /></Field>{widget.kind === 'calc' && <Field label="ประเภท Calculator"><Select options={['รีไฟแนนซ์ช่วยประหยัดเท่าไร?', 'วงเงินกู้', 'ยอดผ่อนต่อเดือน']} /></Field>}</div>
                  {widget.kind === 'calc' ? (
                    <>
                      <div className="pb-ph">แหล่งข้อมูล</div>
                      <div className="pb-pc"><Field label="อัตราดอกเบี้ยอ้างอิง"><div className="input row-between" style={{ background: 'var(--lh-gray-50)' }}><span>Rates › สินเชื่อรีไฟแนนซ์</span><Lock size={14} /></div></Field><p className="t-sm t-secondary">ดึงค่าอัตโนมัติ · แสดง “มีผลตั้งแต่ 01/10/2026”</p><Field label="ปุ่มสมัคร (ลิงก์ Microsite)"><Input defaultValue="https://.../apply/refinance" /></Field></div>
                      <div className="pb-ph">โหมดการคำนวณ</div>
                      <div className="pb-pc">{([['lower', 'ลดค่างวด'], ['faster', 'ปิดไวขึ้น'], ['topup', 'กู้เพิ่ม'], ['interest', 'ลดดอกเบี้ย']] as const).map(([k, l]) => <span key={k} className="row" style={{ gap: 8 }}><Toggle checked={modes[k]} onChange={(v) => setModes({ ...modes, [k]: v })} />{l}</span>)}</div>
                      <div className="pb-ph">การแสดงผล</div>
                      <div className="pb-pc"><span className="field-label">ธีม</span><div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>{([['dark', 'เข้ม', '#2f4f66'], ['light', 'สว่าง', '#fff'], ['mint', 'มิ้นต์', '#eef5f3']] as const).map(([k, l, c]) => <button key={k} className={`theme-pick ${theme === k ? 'on' : ''}`} onClick={() => setTheme(k)}><i style={{ background: c }} />{l}</button>)}</div><span className="field-label">แสดงบนอุปกรณ์</span><div className="row" style={{ gap: 6 }}>{['Desktop', 'Tablet', 'Mobile'].map((d) => <span key={d} className="tag tag-blue">✓ {d}</span>)}</div><div className="grid-2"><Field label="Padding บน"><Select options={['24 px', '32 px', '48 px']} /></Field><Field label="Padding ล่าง"><Select options={['24 px', '32 px', '48 px']} /></Field></div></div>
                    </>
                  ) : (
                    <><div className="pb-ph">การแสดงผล</div><div className="pb-pc"><Field label="จำนวนรายการ"><Select options={['3', '4', '6']} /></Field><Toggle label="แสดงบน Mobile" checked onChange={() => undefined} /></div></>
                  )}
                  <div className="row" style={{ padding: 14, gap: 8 }}><Button icon={RefreshCw} className="grow" onClick={() => toast('รีเซ็ตค่า Widget')}>รีเซ็ต</Button><Button variant="primary" className="grow" onClick={() => toast('ใช้การตั้งค่าแล้ว', widget.name)}>ใช้การตั้งค่า</Button></div>
                </>
              )}
              {panel === 'library' && (
                <>
                  <div className="row-between" style={{ padding: '12px 14px' }}><b>Widget Library</b><IconButton icon={X} title="ปิด" onClick={() => setPanel('section')} /></div>
                  <p className="t-sm t-secondary" style={{ padding: '0 14px 8px' }}>{libTarget ? `คลิกเพื่อเพิ่มใน Section “${sections.find((s) => s.id === libTarget)?.name}”` : 'เลือก Section ก่อนเพิ่ม Widget'}</p>
                  <div className="lib-grid">{WIDGET_LIB.map((w) => <button key={w.id} className="lib-item" disabled={!libTarget} onClick={() => { if (!libTarget) return; commit(sections.map((s) => (s.id === libTarget ? { ...s, widgets: [...s.widgets, { ...w, id: `w${Date.now()}` }] } : s))); toast('เพิ่ม Widget แล้ว', w.name); }}><w.icon size={18} /><span className="t-sm">{w.name}</span></button>)}</div>
                </>
              )}
              {panel === 'history' && (
                <>
                  <div className="row-between" style={{ padding: '12px 14px' }}><b className="row" style={{ gap: 8 }}><Clock size={16} /> ประวัติเวอร์ชัน</b><IconButton icon={X} title="ปิด" onClick={() => setPanel('section')} /></div>
                  <div className="col" style={{ gap: 10, padding: '0 14px 14px' }}>
                    {VERSIONS.map(([v, st, d, sum, by], i) => (
                      <div key={v} className={`ver-card ${i === 0 ? 'on' : ''}`}>
                        <div className="row-between"><span className="row" style={{ gap: 8 }}><b>{v}</b><Status status={st} /></span><span className="t-sm">{d}</span></div>
                        <div className="t-sm mt-8">{sum}</div><div className="t-sm t-secondary">{by}</div>
                        {i > 0 && <div className="row t-sm mt-8" style={{ gap: 12 }}><a className="t-link">ดูเวอร์ชันนี้</a><a className="t-link">เปรียบเทียบ</a><a style={{ color: '#e0625a', cursor: 'pointer' }} onClick={() => toast(`กู้คืน ${v} เป็น Draft ใหม่`, 'ต้องผ่านการอนุมัติ')}>กู้คืน</a></div>}
                      </div>
                    ))}
                    <p className="t-sm t-secondary">เก็บประวัติทุกเวอร์ชัน · การกู้คืนจะสร้าง Draft ใหม่และต้องผ่านการอนุมัติ</p>
                  </div>
                </>
              )}
            </aside>
          </div>
        </section>
      )}

      <div className="bottom-bar">
        <Button onClick={() => navigate('/layout')}>Cancel</Button>
        <Button onClick={() => toast('บันทึก Draft แล้ว', `${base?.name ?? 'Layout ใหม่'} · v13`)}>Save Draft</Button>
        <Button variant="primary" icon={Upload} onClick={submit}>ส่งอนุมัติ</Button>
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} width={820} title={<span>เพิ่ม Section<div className="t-sm t-secondary" style={{ fontWeight: 400 }}>เลือกรูปแบบคอลัมน์ (ระบบกริด 12 คอลัมน์)</div></span>}
        footer={<><Button onClick={() => setAdding(false)}>Cancel</Button><Button variant="primary" icon={Plus} onClick={() => { const ns: Section = { id: `s${Date.now()}`, name: 'Section ใหม่', grid: newGrid, anchor: 'new-section', bg: 'subtle', widgets: [] }; const i = sec ? sections.indexOf(sec) + 1 : sections.length; commit([...sections.slice(0, i), ns, ...sections.slice(i)]); setSelSec(ns.id); setSelW(null); setAdding(false); setLibTarget(ns.id); setPanel('library'); }}>เพิ่ม Section</Button></>}>
        <div className="grid-pick">{GRIDS.map((g) => <button key={g} className={`grid-card ${newGrid === g ? 'on' : ''}`} onClick={() => setNewGrid(g)}><div className="grid-viz" style={{ gridTemplateColumns: g.split('-').map((c) => `${c}fr`).join(' ') }}>{g.split('-').map((_, i) => <i key={i} />)}</div><span>Section {g}</span></button>)}</div>
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <Field label="ตำแหน่ง"><Select options={[`ต่อจาก Section “${sec?.name ?? sections[sections.length - 1]?.name ?? '-'}”`, 'บนสุด', 'ล่างสุด']} /></Field>
          <Field label="พื้นหลัง"><Select options={['color/bg/subtle', 'color/bg/white', 'color/bg/navy']} /></Field>
          <Field label="Anchor ID"><Input defaultValue="new-section" /></Field>
        </div>
      </Modal>
    </div>
  );
}
