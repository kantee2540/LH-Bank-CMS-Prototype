import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, Pencil, Info, Layers, LayoutTemplate, Network, Folder, CircleHelp, Megaphone, Calendar, Image as ImageIcon, Check, Lock, Trash2, Plus, RefreshCw, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, Field, Input, Select, Textarea, Tabs, Toggle, Status, Modal, IconButton, LangSwitch, PageHeader, Pager } from '../../components/ui';
import { useStore } from '../../store';
import type { ContentStatus } from '../../types';
import '../pages.css';

interface SchemaRow {
  name: string;
  sub: string;
  type: string;
  applies: string;
  status: ContentStatus;
  updated: string;
}

const SCHEMAS: SchemaRow[] = [
  { name: 'Organization — LH Bank', sub: 'ทุกภาษา · TH · EN · 中文', type: 'BankOrCreditUnion', applies: 'ทุกหน้า (Global)', status: 'Published', updated: '20/10/2026 10:12' },
  { name: 'WebSite + Sitelinks Search', sub: 'ทุกภาษา · TH · EN · 中文', type: 'WebSite', applies: 'หน้าแรก /th · /en · /zh', status: 'Published', updated: '20/10/2026 10:20' },
  { name: 'Breadcrumb อัตโนมัติ', sub: 'สร้างจาก Path Structure', type: 'BreadcrumbList', applies: 'ทุกหน้า ยกเว้นหน้าแรก', status: 'Published', updated: '21/10/2026 09:05' },
  { name: 'สาขา LH Bank', sub: 'ดึงจากข้อมูลสาขา', type: 'BankOrCreditUnion (Branch)', applies: '/branch/*', status: 'Published', updated: '22/10/2026 14:30' },
  { name: 'ข่าวสารและกิจกรรม', sub: 'TH · EN', type: 'NewsArticle', applies: 'News · /news/*', status: 'Scheduled', updated: '28/10/2026 16:40' },
  { name: 'ผลิตภัณฑ์เงินฝาก (เดิม)', sub: 'TH', type: 'FinancialProduct', applies: '/deposit/*', status: 'Draft', updated: '30/10/2026 11:02' },
];

interface SchemaType {
  key: string;
  title: string;
  type: string;
  desc: string;
  tag: string;
  icon: LucideIcon;
  single?: boolean;
  recommended?: boolean;
}

const TYPES: SchemaType[] = [
  { key: 'org', title: 'Organization', type: 'BankOrCreditUnion', desc: 'ข้อมูลองค์กร โลโก้ ช่องทางติดต่อ และ sameAs', tag: 'มีแล้ว 1 รายการ', icon: Layers, single: true },
  { key: 'web', title: 'WebSite', type: 'WebSite', desc: 'ช่องค้นหาบน Google (Sitelinks Search Box)', tag: 'มีแล้ว 1 รายการ', icon: LayoutTemplate, single: true },
  { key: 'bc', title: 'Breadcrumb', type: 'BreadcrumbList', desc: 'เส้นทางหน้า สร้างจาก Path Structure อัตโนมัติ', tag: 'มีแล้ว 1 รายการ', icon: Network, single: true },
  { key: 'fp', title: 'ผลิตภัณฑ์ทางการเงิน', type: 'FinancialProduct', desc: 'เงินฝาก บัตร ประกัน · ชื่อ ค่าธรรมเนียม อัตราดอกเบี้ย', tag: 'แนะนำ · Products', icon: Folder, recommended: true },
  { key: 'loan', title: 'สินเชื่อ', type: 'LoanOrCredit', desc: 'สินเชื่อบ้าน / บุคคล · วงเงิน ระยะเวลา ดอกเบี้ย', tag: 'Products · สินเชื่อ', icon: Folder },
  { key: 'faq', title: 'คำถามที่พบบ่อย', type: 'FAQPage', desc: 'คำถาม–คำตอบ ช่วยให้ AI Search อ้างอิงได้', tag: 'FAQ', icon: CircleHelp },
  { key: 'news', title: 'ข่าว / บทความ', type: 'NewsArticle', desc: 'หัวข้อ ผู้เขียน วันที่เผยแพร่ รูปภาพ', tag: 'News · Advisory', icon: Megaphone },
  { key: 'event', title: 'กิจกรรม / สัมมนา', type: 'Event', desc: 'วัน เวลา สถานที่ ลิงก์ลงทะเบียน', tag: 'News', icon: Calendar },
  { key: 'offer', title: 'โปรโมชัน', type: 'Offer', desc: 'ราคา/สิทธิประโยชน์ ช่วงเวลาโปรโมชัน', tag: 'Promotion', icon: ImageIcon },
];

/* SCH-01 Schema list (rendered as a tab inside SEO / AEO) */
export function SchemaList({ picking, onClosePicker }: { picking: boolean; onClosePicker: () => void }) {
  const { toast } = useStore();
  const [q, setQ] = useState('');
  const [type, setType] = useState('ทั้งหมด');
  const [status, setStatus] = useState('ทั้งหมด');
  const [applied, setApplied] = useState({ q: '', type: 'ทั้งหมด', status: 'ทั้งหมด' });
  const rows = SCHEMAS.filter((s) => (!applied.q || s.name.includes(applied.q)) && (applied.type === 'ทั้งหมด' || s.type.startsWith(applied.type)) && (applied.status === 'ทั้งหมด' || s.status === applied.status));
  return (
    <>
      <div className="info-soft"><Info size={16} /> Schema ระดับเว็บไซต์จะถูกแทรกเป็น JSON-LD อัตโนมัติในทุกหน้าที่ตรงเงื่อนไข · Schema ระดับเนื้อหา (เช่น FAQ) ตั้งค่าในแท็บ SEO / AEO ของฟอร์มเนื้อหา</div>
      <form className="filter-bar filter-bar-3 mt-16" onSubmit={(e) => { e.preventDefault(); setApplied({ q, type, status }); }}>
        <Field label="ค้นหา"><Input placeholder="ชื่อ Schema" value={q} onChange={(e) => setQ(e.target.value)} /></Field>
        <Field label="ประเภท Schema"><Select value={type} onChange={(e) => setType(e.target.value)} options={['ทั้งหมด', ...new Set(SCHEMAS.map((s) => s.type.split(' ')[0]))]} /></Field>
        <Field label="สถานะ"><Select value={status} onChange={(e) => setStatus(e.target.value)} options={['ทั้งหมด', 'Published', 'Scheduled', 'Draft']} /></Field>
        <Button type="submit">ค้นหา</Button>
      </form>
      <div className="table-wrap mt-16">
        <table className="table">
          <thead><tr><th>ชื่อ Schema</th><th>ประเภท (@type)</th><th>ใช้กับหน้า</th><th>สถานะ</th><th>Last Update</th><th>Action</th></tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.name}>
                <td><a className="t-link" style={{ fontWeight: 400 }}>{s.name}</a><div className="sub">{s.sub}</div></td>
                <td>{s.type}</td>
                <td>{s.applies}</td>
                <td><Status status={s.status} /></td>
                <td style={{ whiteSpace: 'nowrap' }}>{s.updated}</td>
                <td><div className="row" style={{ gap: 4 }}><IconButton icon={Eye} title="ดู JSON-LD" onClick={() => toast('ดู JSON-LD', s.name)} /><IconButton icon={Pencil} title="แก้ไข" onClick={() => toast('แก้ไข Schema', s.name)} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row-between mt-16"><span>Show 1 - {rows.length} of {rows.length}</span><Pager page={1} pages={1} onChange={() => undefined} /></div>
      <SchemaTypeModal open={picking} onClose={onClosePicker} />
    </>
  );
}

/* SCH-02 Popup เลือกประเภท Schema */
export function SchemaTypeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState('fp');
  const list = TYPES.filter((t) => !q || `${t.title} ${t.type}`.toLowerCase().includes(q.toLowerCase()));
  const chosen = TYPES.find((t) => t.key === sel);
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={980}
      title="เลือกประเภท Schema"
      footer={
        <div className="row-between" style={{ width: '100%' }}>
          <span className="t-sm t-secondary">เลือกแล้ว: {chosen?.type} · Organization / WebSite / Breadcrumb มีได้ 1 รายการต่อเว็บไซต์</span>
          <div className="row" style={{ gap: 10 }}>
            <Button onClick={onClose}>ยกเลิก</Button>
            <Button variant="primary" onClick={() => navigate(`/seo/schema/new?type=${chosen?.type}`)}>ถัดไป</Button>
          </div>
        </div>
      }
    >
      <p className="t-secondary" style={{ marginTop: -10 }}>เลือก Schema.org type ที่ตรงกับเนื้อหาของหน้า · ระบบมี Template property ตั้งต้นให้ตามประเภท</p>
      <Field label="ค้นหาประเภท"><Input placeholder="พิมพ์ชื่อ เช่น Product, Loan, Event" value={q} onChange={(e) => setQ(e.target.value)} /></Field>
      <div className="schema-grid">
        {list.map((t) => (
          <button key={t.key} type="button" disabled={t.single} className={`schema-card ${sel === t.key ? 'on' : ''}`} onClick={() => setSel(t.key)}>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <span className="sc-icon"><t.icon size={18} strokeWidth={1.6} /></span>
              <div className="grow"><b>{t.title}</b><div className="t-sm t-link" style={{ fontWeight: 400, color: sel === t.key ? undefined : 'var(--lh-text-secondary)' }}>{t.type}</div></div>
              {sel === t.key && <span className="sc-check"><Check size={13} /></span>}
            </div>
            <p className="t-sm t-secondary">{t.desc}</p>
            <span className={`tag ${t.recommended ? 'tag-green' : ''}`} style={{ fontSize: 13, fontWeight: 400 }}>{t.tag}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

/* ---------- SCH-03…05 สร้าง Schema (wizard) ---------- */
type Step = 'info' | 'map' | 'check';
type Lang = 'th' | 'en' | 'zh';
interface PropRow {
  prop: string;
  required?: boolean;
  source: string;
  value: string;
  locked?: boolean;
}
const PROPS: PropRow[] = [
  { prop: 'name', required: true, source: 'ฟิลด์เนื้อหา', value: 'Title (หัวข้อ)', locked: true },
  { prop: 'description', required: true, source: 'ฟิลด์เนื้อหา', value: 'Meta description', locked: true },
  { prop: 'url', required: true, source: 'ระบบ', value: 'Canonical URL', locked: true },
  { prop: 'provider', required: true, source: 'อ้างอิง Schema', value: 'Organization — LH Bank', locked: true },
  { prop: 'interestRate', source: 'ตัวแปร Rates', value: '{rate:product.code}' },
  { prop: 'feesAndCommissionsSpecification', source: 'ฟิลด์เนื้อหา', value: 'ลิงก์ตารางค่าธรรมเนียม' },
  { prop: 'areaServed', source: 'ค่าคงที่', value: 'TH' },
  { prop: 'image', source: 'ฟิลด์เนื้อหา', value: 'OG Image' },
];
const SOURCES = ['ฟิลด์เนื้อหา', 'ระบบ', 'อ้างอิง Schema', 'ตัวแปร Rates', 'ค่าคงที่'];
const VALUES = ['Title (หัวข้อ)', 'Meta description', 'Canonical URL', 'Organization — LH Bank', '{rate:product.code}', 'ลิงก์ตารางค่าธรรมเนียม', 'TH', 'OG Image', 'Hero image', 'Answer summary'];

export function SchemaWizard() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { submitRequest, toast } = useStore();
  const type = params.get('type') || 'FinancialProduct';
  const [step, setStep] = useState<Step>('info');
  const [name, setName] = useState('ผลิตภัณฑ์เงินฝาก — FinancialProduct');
  const [applyTo, setApplyTo] = useState<'global' | 'content' | 'path'>('content');
  const [langs, setLangs] = useState({ th: true, en: true, zh: false });
  const [lang, setLang] = useState<Lang>('th');
  const [props, setProps] = useState(PROPS);
  const [checked, setChecked] = useState(false);
  const jsonld = useMemo(() => {
    const has = (p: string) => props.some((r) => r.prop === p);
    const lines = [
      '{',
      '  "@context": "https://schema.org",',
      `  "@type": "${type}",`,
      has('name') && `  "name": "${lang === 'th' ? 'เงินฝากประจำพิเศษ 6 เดือน' : '6-Month Special Fixed Deposit'}",`,
      has('description') && `  "description": "${lang === 'th' ? 'ฝากประจำ 6 เดือน เริ่มต้น 10,000 บาท' : 'Minimum deposit THB 10,000'}",`,
      has('url') && `  "url": ".../${lang}/deposit/fixed-6m",`,
      has('provider') && '  "provider": {\n    "@type": "BankOrCreditUnion",\n    "@id": "https://www.lhbank.co.th/#org"\n  },',
      has('interestRate') && '  "interestRate": 1.85,',
      has('feesAndCommissionsSpecification') && '  "feesAndCommissionsSpecification":\n    ".../fee-schedule-2569.pdf",',
      has('areaServed') && '  "areaServed": "TH",',
      has('image') && '  "image": ".../promo-fixed-6m.jpg"',
      '}',
    ].filter(Boolean);
    return lines.join('\n');
  }, [props, type, lang]);

  const submit = () => {
    submitRequest({ title: name, module: 'Schema', sub: `Schema · ${type}` });
    toast('ส่งอนุมัติแล้ว — รอ Auditor', `${name} · มีผลเมื่อ Auditor อนุมัติ`);
    navigate('/requests');
  };

  return (
    <>
      <PageHeader crumbs={[{ label: 'SEO / AEO', to: '/seo' }, { label: 'Schema', to: '/seo?tab=schema' }, { label: 'สร้าง Schema' }]} title="" />
      <section className="card" style={{ marginTop: -20 }}>
        <div className="row-between" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
          <div className="row" style={{ gap: 14 }}>
            <button className="back-btn" onClick={() => navigate('/seo?tab=schema')} aria-label="ย้อนกลับ">‹</button>
            <h2 className="t-h3" style={{ fontSize: 18 }}>สร้าง Schema ใหม่ · {type}</h2>
            <Status status="Draft" />
          </div>
          <div className="row" style={{ gap: 10 }}>
            <Button onClick={() => navigate('/seo?tab=schema')}>ยกเลิก</Button>
            <Button onClick={() => toast('บันทึก Draft แล้ว', name)}>บันทึก Draft</Button>
            <Button variant="primary" disabled={!checked} onClick={submit}>ส่งอนุมัติ</Button>
          </div>
        </div>
        <Tabs value={step} onChange={setStep} tabs={[{ value: 'info', label: '1 · ข้อมูลทั่วไป & หน้าที่ใช้' }, { value: 'map', label: '2 · Map Property' }, { value: 'check', label: '3 · ตรวจสอบ & Preview' }]} style={{ marginBottom: 20 }} />

        {step === 'info' && (
          <div className="grid-2" style={{ gap: 32, alignItems: 'start' }}>
            <div className="col">
              <h3 className="section-h" style={{ margin: 0 }}>ข้อมูล Schema</h3>
              <Field label="ชื่อ Schema" required><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="ประเภท Schema (@type)" required><Select options={[`${type} · schema.org/${type}`]} /></Field>
              <Field label="Template ตั้งต้น"><Select options={[`${type} มาตรฐาน (8 property)`, 'เริ่มจากว่าง']} /></Field>
              <Field label="หมายเหตุภายใน"><Textarea rows={2} defaultValue="ใช้กับหน้าผลิตภัณฑ์เงินฝากทุกหน้า แทน Schema เดิม (ผลิตภัณฑ์เงินฝาก (เดิม))" /></Field>
              <h3 className="section-h" style={{ margin: '8px 0 0' }}>ภาษาที่สร้าง Schema</h3>
              <Toggle label="ภาษาไทย (TH)" desc="สร้าง JSON-LD จากเนื้อหาภาษาไทย · ภาษาหลัก" checked={langs.th} disabled onChange={() => undefined} />
              <Toggle label="English (EN)" desc="สร้างจากเนื้อหาภาษาอังกฤษ" checked={langs.en} onChange={(v) => setLangs({ ...langs, en: v })} />
              <Toggle label="中文 (ZH)" desc="สร้างจากเนื้อหาภาษาจีน · ใช้ค่าภาษาหลักถ้าว่าง" checked={langs.zh} onChange={(v) => setLangs({ ...langs, zh: v })} />
            </div>
            <div className="col">
              <h3 className="section-h" style={{ margin: 0 }}>ใช้กับหน้าไหน (Apply to)</h3>
              {([
                ['global', 'ทุกหน้า (Global)', 'แทรกในทุกหน้าของเว็บไซต์'],
                ['content', 'ตามประเภทเนื้อหา', 'เลือกจากเมนู Products / News / Advisory ฯลฯ'],
                ['path', 'ตาม Path', 'กำหนด URL pattern เอง เช่น /th/deposit/*'],
              ] as const).map(([k, l, d]) => (
                <label key={k} className={`radio-card ${applyTo === k ? 'on' : ''}`}>
                  <input type="radio" name="apply" checked={applyTo === k} onChange={() => setApplyTo(k)} />
                  <div><b style={{ fontWeight: 500 }}>{l}</b><div className="t-sm t-secondary">{d}</div></div>
                </label>
              ))}
              {applyTo === 'content' && (
                <>
                  <Field label="ประเภทเนื้อหา" required><Select options={['Products › เงินฝาก', 'Products › สินเชื่อ', 'News', 'Advisory']} /></Field>
                  <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>{['เงินฝากออมทรัพย์', 'เงินฝากประจำ', 'เงินฝากปลอดภาษี', 'บัญชีดิจิทัล'].map((k) => <span className="kw-static" key={k}>{k}</span>)}</div>
                </>
              )}
              {applyTo === 'path' && <Field label="URL pattern" required><Input defaultValue="/th/deposit/*" /></Field>}
              {applyTo !== 'global' && <Field label="ยกเว้นหน้า (ถ้ามี)"><Input defaultValue="/th/deposit/compare" /></Field>}
              <div className="info-soft row-between"><span className="row" style={{ gap: 8 }}><Info size={16} /> ตรงเงื่อนไข {applyTo === 'global' ? 'ทุกหน้า · 214 หน้า' : '14 หน้า · TH 14 / EN 14 / 中文 9'}</span><a className="t-link">ดูรายการหน้า</a></div>
              <div className="note-warning">หากหน้าใดมี Schema ประเภทเดียวกันระดับเนื้อหา ระบบจะใช้ค่าระดับเนื้อหาก่อน (Override)</div>
            </div>
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--lh-border-default)', paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" disabled={!name.trim()} onClick={() => setStep('map')}>ถัดไป: Map Property</Button>
            </div>
          </div>
        )}

        {step === 'map' && (
          <>
            <LangSwitch value={lang} onChange={setLang} options={[{ value: 'th', label: 'TH (Main)' }, { value: 'en', label: 'EN' }, ...(langs.zh ? [{ value: 'zh' as Lang, label: '中文' }] : [])]} />
            <div className="split" style={{ gridTemplateColumns: 'minmax(0,1.45fr) minmax(0,1fr)' }}>
              <div>
                <h3 className="section-h" style={{ marginBottom: 2 }}>จับคู่ Property กับข้อมูลในระบบ</h3>
                <p className="t-sm t-secondary" style={{ marginBottom: 12 }}>ภาษา{lang === 'th' ? 'ไทย' : lang === 'en' ? 'อังกฤษ' : 'จีน'} · Property ที่มี * เป็นค่าบังคับตาม Google Rich Results</p>
                <table className="table">
                  <thead><tr><th>Property</th><th>แหล่งข้อมูล</th><th>ค่า / ฟิลด์</th><th /></tr></thead>
                  <tbody>
                    {props.map((p, i) => (
                      <tr key={p.prop}>
                        <td className="mono t-sm" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.prop}{p.required && <span className="t-danger"> *</span>}</td>
                        <td><Select value={p.source} onChange={(e) => setProps(props.map((x, j) => (j === i ? { ...x, source: e.target.value } : x)))} options={SOURCES} /></td>
                        <td><Select value={p.value} onChange={(e) => setProps(props.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} options={VALUES} /></td>
                        <td>{p.locked ? <Lock size={16} className="t-tertiary" /> : <IconButton icon={Trash2} title="ลบ property" onClick={() => setProps(props.filter((_, j) => j !== i))} />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="row mt-16"><Button size="sm" icon={Plus} onClick={() => setProps([...props, { prop: `additionalProperty${props.length}`, source: 'ค่าคงที่', value: 'TH' }])}>เพิ่ม Property</Button><span className="t-sm t-secondary">{props.length} / 14 property ที่แนะนำสำหรับ {type}</span></div>
              </div>
              <div className="col" style={{ gap: 10 }}>
                <h3 className="section-h" style={{ margin: 0 }}>ตัวอย่าง JSON-LD</h3>
                <Field label="ดูตัวอย่างจากหน้า"><Select options={[`เงินฝากประจำพิเศษ 6 เดือน (${lang.toUpperCase()})`, 'บัญชีออมทรัพย์ดิจิทัล LHB You']} /></Field>
                <div className="code-dark">
                  <div className="row-between t-sm" style={{ marginBottom: 6 }}><span style={{ opacity: 0.7 }}>application/ld+json</span><button className="btn-ghost btn" style={{ color: '#7cc4f5' }} onClick={() => { navigator.clipboard?.writeText(jsonld); toast('คัดลอก JSON-LD แล้ว'); }}>คัดลอก</button></div>
                  <pre>{jsonld}</pre>
                </div>
                <div className="info-soft t-sm"><Info size={16} style={{ flex: 'none' }} /> {'{rate:...}'} ดึงค่าจริงจากเมนู Rates ทุกครั้งที่หน้าถูกเรียก ไม่ต้องแก้ Schema เมื่ออัตราเปลี่ยน</div>
              </div>
            </div>
            <div className="row mt-24" style={{ justifyContent: 'flex-end', borderTop: '1px solid var(--lh-border-default)', paddingTop: 16 }}>
              <Button onClick={() => setStep('info')}>ย้อนกลับ</Button>
              <Button variant="primary" onClick={() => { setStep('check'); setChecked(true); }}>ถัดไป: ตรวจสอบ</Button>
            </div>
          </>
        )}

        {step === 'check' && (
          <>
            <div className="split" style={{ gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)' }}>
              <div className="col" style={{ gap: 10 }}>
                <h3 className="section-h" style={{ margin: 0 }}>ผลการตรวจสอบ Schema</h3>
                <div className="row" style={{ alignItems: 'flex-end' }}>
                  <Field label="ทดสอบกับหน้า" className="grow"><Select options={['เงินฝากประจำพิเศษ 6 เดือน · /th/deposit/fixed-6m', 'บัญชีออมทรัพย์ดิจิทัล · /th/deposit/lhb-you']} /></Field>
                  <Button icon={RefreshCw} onClick={() => toast('ทดสอบใหม่แล้ว', 'ผ่าน 9 · คำเตือน 1 · Error 0')}>ทดสอบใหม่</Button>
                </div>
                <div className="row" style={{ gap: 6 }}><span className="status status-published">ผ่าน 9</span><span className="status status-expired">! คำเตือน 1</span><span className="status status-draft">Error 0</span></div>
                <div className="check-list">
                  {[
                    ['ok', 'JSON-LD syntax ถูกต้อง', 'parse ได้ทุกภาษา'],
                    ['ok', `@type ${type} ตรงกับ Schema.org`, ''],
                    ['ok', 'Property บังคับครบ', 'name · description · url · provider'],
                    ['ok', 'provider เชื่อมกับ Organization (@id)', '#org — Organization — LH Bank'],
                    ['ok', 'สร้างครบตามภาษาที่เปิด', `TH 14 / 14${langs.en ? ' · EN 14 / 14' : ''}${langs.zh ? ' · 中文 9 / 14' : ''}`],
                    ['warn', 'image — 2 หน้ายังไม่มี OG Image', 'ระบบใช้รูปตั้งต้นของเว็บไซต์แทน · แก้ได้ภายหลัง'],
                    ['ok', 'ไม่ซ้ำกับ Schema อื่นในหน้าเดียวกัน', 'ไม่ชนกับ Schema ระดับเนื้อหา'],
                    ['ok', 'ค่าตัวแปร {rate:...} ดึงได้จริง', 'อัตราล่าสุด 1.85% · เมนู Rates'],
                    ['ok', 'Google Rich Results Test', 'Eligible · ทดสอบเมื่อ 04/11/2026 21:10'],
                    ['ok', 'ไม่มีข้อมูลลูกค้า / หน้าที่ต้อง Login', ''],
                  ].map(([k, t, d]) => (
                    <div className="check-row" key={t}>
                      <span className={`ck ${k}`}>{k === 'ok' ? '✓' : '!'}</span>
                      <div className="grow"><div style={{ fontWeight: k === 'warn' ? 500 : 400 }}>{t}</div>{d && <div className="t-sm t-secondary">{d}</div>}</div>
                      {k === 'warn' && <a className="t-link t-sm" onClick={() => setStep('map')}>ไปแก้ไข</a>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col">
                <section className="card">
                  <h3 className="section-h">ตัวอย่างผลการค้นหา (TH)</h3>
                  <div className="serp">
                    <div className="t-sm t-secondary">lhbank.co.th › th › deposit › fixed-6m</div>
                    <div className="title">เงินฝากประจำพิเศษ 6 เดือน ดอกเบี้ยสูง | LH Bank</div>
                    <div className="t-sm t-secondary">ฝากประจำ 6 เดือน เริ่มต้น 10,000 บาท รับอัตราดอกเบี้ยพิเศษ เปิดบัญชีภายใน 31 ธ.ค. 2569</div>
                    <div className="row mt-8" style={{ gap: 24 }}><div className="t-sm"><span className="t-secondary">ดอกเบี้ย</span><br /><b>1.85% ต่อปี</b></div><div className="t-sm"><span className="t-secondary">ผู้ให้บริการ</span><br /><b>LH Bank</b></div></div>
                  </div>
                  <p className="t-sm t-tertiary mt-8">ภาพจำลองเท่านั้น · Google เป็นผู้ตัดสินการแสดง Rich Result</p>
                </section>
                <section className="card">
                  <h3 className="section-h">สรุปก่อนส่งอนุมัติ</h3>
                  {[['ประเภท', type], ['ใช้กับ', applyTo === 'global' ? 'ทุกหน้า (Global)' : 'Products › เงินฝาก (14 หน้า)'], ['ภาษา', ['TH', langs.en && 'EN', langs.zh && '中文'].filter(Boolean).join(' · ')], ['แทนที่', 'ผลิตภัณฑ์เงินฝาก (เดิม)'], ['มีผลเมื่อ', 'Auditor อนุมัติ']].map(([k, v]) => (
                    <div className="row" key={k} style={{ padding: '4px 0' }}><span className="t-secondary" style={{ width: 90 }}>{k}</span><span>{v}</span></div>
                  ))}
                </section>
                <div className="banner-teal">พร้อมส่งอนุมัติ · ไม่มี Error · คำเตือน 1 รายการไม่บล็อกการส่ง</div>
              </div>
            </div>
            <div className="row mt-24" style={{ justifyContent: 'flex-end', borderTop: '1px solid var(--lh-border-default)', paddingTop: 16 }}>
              <Button onClick={() => setStep('map')}>ย้อนกลับ</Button>
              <Button variant="primary" icon={Send} onClick={submit}>ส่งอนุมัติ</Button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
