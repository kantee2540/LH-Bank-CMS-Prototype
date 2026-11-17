import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, RefreshCw, Trash2, Eye, Pencil, Info, Percent, Lock, Calculator as CalcIcon, Upload, ArrowUp, ArrowDown } from 'lucide-react';
import { Button, Card, Field, Input, Select, Textarea, Tabs, Toggle, Status, IconButton, Modal, PageHeader, LangSwitch } from '../components/ui';
import ListPage, { selectFilter, textFilter } from '../components/ListPage';
import { useStore } from '../store';
import type { ContentStatus } from '../types';
import './pages.css';

export type ProductLine = 'loan' | 'deposit';

interface ProductRow {
  id: string;
  name: string;
  code: string;
  langs: string;
  group: string;
  calc: string;
  status: ContentStatus;
}

const PRODUCTS: Record<ProductLine, ProductRow[]> = {
  loan: [
    { id: 'hl-new', name: 'สินเชื่อบ้านใหม่', code: 'HL-04', langs: 'TH · EN', group: 'สินเชื่อบ้าน', calc: 'วงเงินกู้', status: 'Published' },
    { id: 'hl-2nd', name: 'สินเชื่อบ้านมือสอง', code: 'HL-05', langs: 'TH · EN', group: 'สินเชื่อบ้าน', calc: 'วงเงินกู้', status: 'Published' },
    { id: 'hl-refi', name: 'สินเชื่อรีไฟแนนซ์บ้าน', code: 'HL-02', langs: 'TH · EN', group: 'สินเชื่อบ้าน', calc: 'รีไฟแนนซ์ 4 โหมด', status: 'Published' },
    { id: 'hl-cash', name: 'สินเชื่อบ้านแลกเงิน', code: 'HL-03', langs: 'TH', group: 'สินเชื่อบ้าน', calc: 'ยอดผ่อนต่อเดือน', status: 'Draft' },
    { id: 'pl', name: 'สินเชื่อส่วนบุคคล', code: 'PL-02', langs: 'TH · EN', group: 'สินเชื่อส่วนบุคคล', calc: 'วงเงิน / ค่างวด', status: 'Published' },
    { id: 'pl-cons', name: 'สินเชื่อส่วนบุคคลรวมหนี้', code: 'PL-03', langs: 'TH · EN', group: 'สินเชื่อส่วนบุคคล', calc: 'ประหยัดดอกเบี้ย', status: 'Scheduled' },
  ],
  deposit: [
    { id: 'sv-digital', name: 'เงินฝากออมทรัพย์ดิจิทัล LHB You', code: 'SA-01', langs: 'TH · EN · 中文', group: 'ออมทรัพย์', calc: '—', status: 'Published' },
    { id: 'sv', name: 'เงินฝากออมทรัพย์', code: 'SA-02', langs: 'TH · EN', group: 'ออมทรัพย์', calc: '—', status: 'Published' },
    { id: 'fd', name: 'เงินฝากประจำ 3–24 เดือน', code: 'FD-01', langs: 'TH · EN', group: 'ฝากประจำ', calc: 'ดอกเบี้ยรับสุทธิ', status: 'Published' },
    { id: 'fd-6m', name: 'เงินฝากประจำพิเศษ 6 เดือน', code: 'FD-06', langs: 'TH · EN', group: 'ฝากประจำ', calc: 'ดอกเบี้ยรับสุทธิ', status: 'Published' },
    { id: 'tf', name: 'เงินฝากปลอดภาษี 24 เดือน', code: 'TF-24', langs: 'TH', group: 'ปลอดภาษี', calc: 'ดอกเบี้ยรับสุทธิ', status: 'Scheduled' },
    { id: 'fcd', name: 'บัญชีเงินฝากเงินตราต่างประเทศ (FCD)', code: 'FC-01', langs: 'TH · EN', group: 'เงินตราต่างประเทศ', calc: '—', status: 'Draft' },
  ],
};
const GROUPS: Record<ProductLine, string[]> = { loan: ['สินเชื่อบ้าน', 'สินเชื่อส่วนบุคคล'], deposit: ['ออมทรัพย์', 'ฝากประจำ', 'ปลอดภาษี', 'เงินตราต่างประเทศ'] };
const LINE_LABEL: Record<ProductLine, string> = { loan: 'สินเชื่อ', deposit: 'เงินฝาก' };

/* CMS-11 Products — สินเชื่อ · NEW: PD-01 Products — เงินฝาก (template เดียวกัน) */
export function ProductList({ line }: { line: ProductLine }) {
  const navigate = useNavigate();
  const { toast, trash } = useStore();
  const [rows, setRows] = useState(PRODUCTS[line]);
  const [group, setGroup] = useState('all');
  const [ordering, setOrdering] = useState(false);
  const [del, setDel] = useState<ProductRow | null>(null);
  const shown = rows.filter((r) => group === 'all' || r.group === group);
  const move = (r: ProductRow, d: -1 | 1) => { const i = rows.indexOf(r); const j = i + d; if (j < 0 || j >= rows.length) return; const c = [...rows]; [c[i], c[j]] = [c[j], c[i]]; setRows(c); };
  return (
    <ListPage<ProductRow>
      key={line}
      crumbs={[{ label: 'Products' }, { label: LINE_LABEL[line] }]}
      title={LINE_LABEL[line]}
      filters={[textFilter('name', 'ชื่อผลิตภัณฑ์', (r) => r.name), selectFilter('group', 'กลุ่มผลิตภัณฑ์', GROUPS[line], (r) => r.group), selectFilter('status', 'Status', ['Published', 'Scheduled', 'Draft'], (r) => r.status)]}
      rows={shown}
      rowKey={(r) => r.id}
      above={<Tabs value={group} onChange={setGroup} style={{ marginBottom: 16, marginTop: -8 }} tabs={[{ value: 'all', label: `ทั้งหมด (${rows.length})` }, ...GROUPS[line].map((g) => ({ value: g, label: `${g} (${rows.filter((r) => r.group === g).length})` }))]} />}
      toolbar={<>
        <Button variant="primary" icon={Plus} onClick={() => navigate(`/products/${line}/new`)}>Create</Button>
        <Button icon={RefreshCw} variant={ordering ? 'primary' : 'secondary'} onClick={() => { if (ordering) toast('บันทึกลำดับแล้ว'); setOrdering(!ordering); }}>{ordering ? 'บันทึกลำดับ' : 'Move Order'}</Button>
        <Link to="/trash" className="btn btn-secondary"><Trash2 strokeWidth={1.6} /> ถังขยะ ({trash.filter((t) => t.module === 'Products').length})</Link>
      </>}
      toolbarRight={<span className="row t-secondary" style={{ gap: 8 }}><Info size={18} color="#1f6fa8" /> ใช้ Product Template เดียวกัน · ดอกเบี้ยดึงจากเมนู Rates</span>}
      columns={[
        ...(ordering ? [{ key: 'ord', label: '', render: (r: ProductRow) => <div className="row" style={{ gap: 0 }}><IconButton icon={ArrowUp} title="ขึ้น" onClick={() => move(r, -1)} /><IconButton icon={ArrowDown} title="ลง" onClick={() => move(r, 1)} /></div> }] : []),
        { key: 'name', label: 'ผลิตภัณฑ์', render: (r) => <><Link className="t-link" style={{ fontWeight: 400 }} to={`/products/${line}/${r.id}`}>{r.name}</Link><div className="sub">{r.code} · {r.langs}</div></> },
        { key: 'group', label: 'กลุ่ม', render: (r) => <span className="tag">{r.group}</span> },
        { key: 'rate', label: 'ดอกเบี้ยเริ่มต้น', render: () => <span className="row" style={{ gap: 6 }}><Percent size={16} color="#1f6fa8" /> x.xx% (Rates)</span> },
        { key: 'calc', label: 'Calculator', render: (r) => r.calc },
        { key: 'status', label: 'Status', render: (r) => <Status status={r.status} /> },
        { key: 'act', label: 'Action', render: (r) => <div className="row" style={{ gap: 2 }}><IconButton icon={Eye} title="ดูตัวอย่าง" onClick={() => toast('Preview', r.name)} /><IconButton icon={Pencil} title="แก้ไข" onClick={() => navigate(`/products/${line}/${r.id}`)} /><IconButton icon={Trash2} danger title="ลบ" onClick={() => setDel(r)} /></div> },
      ]}
    >
      <Modal open={!!del} onClose={() => setDel(null)} title="ย้ายผลิตภัณฑ์ไปถังขยะ?" footer={<><Button onClick={() => setDel(null)}>ยกเลิก</Button><Button variant="danger" onClick={() => { setRows(rows.filter((r) => r.id !== del?.id)); toast('ย้ายไปถังขยะแล้ว', del?.name); setDel(null); }}>ย้ายไปถังขยะ</Button></>}>
        <p className="t-secondary">“{del?.name}” จะถูกนำออกจากหน้าเว็บ รวมถึงเมนู Life Stage และ Calculator ที่อ้างถึง · กู้คืนได้ภายใน 30 วัน</p>
      </Modal>
    </ListPage>
  );
}

type ProductTab = 'general' | 'highlight' | 'rates' | 'calc' | 'docs' | 'faq' | 'seo';

/* CMS-12 Products — แก้ไขผลิตภัณฑ์ (แท็บ Calculator ตาม Figma · แท็บอื่นออกแบบเพิ่ม) */
export function ProductEdit({ line }: { line: ProductLine }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, submitRequest } = useStore();
  const p = PRODUCTS[line].find((r) => r.id === id);
  const isNew = !p;
  const [tab, setTab] = useState<ProductTab>(isNew ? 'general' : line === 'loan' ? 'calc' : 'general');
  const [lang, setLang] = useState<'th' | 'en' | 'zh'>('th');
  const [modes, setModes] = useState({ lower: true, faster: true, topup: true, interest: false });
  const [mode, setMode] = useState<'lower' | 'faster' | 'topup'>('lower');
  const [highlights, setHighlights] = useState(['ดอกเบี้ยพิเศษ 3 ปีแรก', 'ฟรีค่าประเมินหลักประกัน', 'อนุมัติไวภายใน 7 วันทำการ']);
  const [faqs, setFaqs] = useState([['รีไฟแนนซ์ได้เมื่อไร?', 'เมื่อผ่อนบ้านกับสถาบันการเงินเดิมครบ 3 ปี'], ['ใช้เอกสารอะไรบ้าง?', 'บัตรประชาชน ทะเบียนบ้าน สลิปเงินเดือน และสัญญาเงินกู้เดิม']]);
  const name = p?.name ?? `ผลิตภัณฑ์${LINE_LABEL[line]}ใหม่`;
  const submit = () => { submitRequest({ title: name, module: 'Products', sub: `Products · ${isNew ? 'สร้างใหม่' : 'แก้ไข'}` }); toast('ส่งอนุมัติแล้ว', name); navigate('/requests'); };

  return (
    <div className="with-bottom-bar">
      <PageHeader
        crumbs={[{ label: 'Products' }, { label: LINE_LABEL[line], to: `/products/${line}` }, { label: isNew ? 'สร้างผลิตภัณฑ์' : name }]}
        back={`/products/${line}`}
        title={isNew ? `สร้างผลิตภัณฑ์${LINE_LABEL[line]}` : `แก้ไขผลิตภัณฑ์: ${name}`}
        badges={<Status status={p?.status ?? 'Draft'} />}
        actions={<Button icon={Eye} onClick={() => toast('Preview', name)}>Preview</Button>}
      />
      <section className="card" style={{ padding: '4px 16px 0' }}>
        <Tabs value={tab} onChange={setTab} style={{ borderBottom: 0 }} tabs={[
          { value: 'general', label: 'ข้อมูลทั่วไป' }, { value: 'highlight', label: 'จุดเด่น / สิทธิประโยชน์' }, { value: 'rates', label: 'ดอกเบี้ย & ค่าธรรมเนียม' },
          { value: 'calc', label: 'Calculator' }, { value: 'docs', label: 'คุณสมบัติ & เอกสาร' }, { value: 'faq', label: 'FAQ' }, { value: 'seo', label: 'SEO' },
        ]} />
      </section>
      <div className="split">
        <div className="col">
          {tab === 'general' && (
            <Card title="ข้อมูลทั่วไป">
              <LangSwitch value={lang} onChange={setLang} options={[{ value: 'th', label: 'TH (Main)' }, { value: 'en', label: 'EN' }, { value: 'zh', label: '中文' }]} />
              <div className="form-grid">
                <Field label="ชื่อผลิตภัณฑ์" required><Input defaultValue={lang === 'th' ? p?.name : ''} /></Field>
                <Field label="รหัสผลิตภัณฑ์"><Input defaultValue={p?.code} /></Field>
                <Field label="กลุ่ม"><Select defaultValue={p?.group} options={GROUPS[line]} /></Field>
                <Field label="Path"><Input defaultValue={`/th/personal/${line === 'loan' ? 'loan/home-loan' : 'deposit'}/${p?.id ?? ''}`} /></Field>
                <div style={{ gridColumn: '1/-1' }}><Field label="คำอธิบายสั้น (แสดงบนการ์ด)" required><Textarea rows={2} defaultValue={lang === 'th' ? `${name} เงื่อนไขพิเศษสำหรับลูกค้า LH Bank` : ''} /></Field></div>
                <div style={{ gridColumn: '1/-1' }}><Field label="ภาพผลิตภัณฑ์"><Button icon={Upload}>เลือกจาก Media Library</Button></Field></div>
              </div>
            </Card>
          )}
          {tab === 'highlight' && (
            <Card title="จุดเด่น / สิทธิประโยชน์" sub="แสดงเป็นรายการ ✓ ใต้ชื่อผลิตภัณฑ์ · สูงสุด 5 ข้อ" action={<Button size="sm" icon={Plus} disabled={highlights.length >= 5} onClick={() => setHighlights([...highlights, ''])}>เพิ่ม</Button>}>
              <div className="col" style={{ gap: 8 }}>
                {highlights.map((h, i) => (
                  <div className="row" key={i}><span className="t-secondary" style={{ width: 20 }}>{i + 1}.</span><Input value={h} onChange={(e) => setHighlights(highlights.map((x, j) => (j === i ? e.target.value : x)))} /><IconButton icon={Trash2} danger title="ลบ" onClick={() => setHighlights(highlights.filter((_, j) => j !== i))} /></div>
                ))}
              </div>
            </Card>
          )}
          {tab === 'rates' && (
            <Card title="ดอกเบี้ย & ค่าธรรมเนียม" sub="ตารางดึงจากเมนู Rates อัตโนมัติ — แก้ไขค่าได้ที่เมนู Rates เท่านั้น">
              <table className="table">
                <thead><tr><th>รายการ</th><th>อัตรา</th><th>แหล่งข้อมูล</th></tr></thead>
                <tbody>
                  {(line === 'loan' ? [['ปีที่ 1', 'x.xx%'], ['ปีที่ 2–3', 'x.xx%'], ['ปีที่ 4 เป็นต้นไป', 'MRR - x.xx%'], ['ค่าธรรมเนียมประเมินหลักประกัน', 'ฟรี']] : [['ดอกเบี้ยต่อปี', 'x.xx%'], ['ยอดเงินฝากขั้นต่ำ', '10,000 บาท'], ['ค่าธรรมเนียมรักษาบัญชี', 'ไม่มี']]).map(([k, v]) => (
                    <tr key={k}><td>{k}</td><td><b>{v}</b></td><td className="t-sm"><span className="row" style={{ gap: 6 }}><Lock size={14} /> Rates · มีผล 01/10/2026</span></td></tr>
                  ))}
                </tbody>
              </table>
              <div className="row mt-16"><Link className="btn btn-secondary" to="/rates/interest"><Percent strokeWidth={1.6} /> ไปที่เมนู Rates</Link></div>
            </Card>
          )}
          {tab === 'calc' && (
            <>
              <Card title="ตั้งค่า Calculator">
                <div className="form-grid">
                  <Field label="ประเภท Calculator"><Select options={['รีไฟแนนซ์ช่วยประหยัดเท่าไร?', 'วงเงินกู้', 'ยอดผ่อนต่อเดือน', 'ดอกเบี้ยรับสุทธิ']} /></Field>
                  <Field label="อัตราดอกเบี้ยอ้างอิง (อ่านอย่างเดียว)"><div className="input row-between" style={{ background: 'var(--lh-gray-50)' }}><span>Rates › สินเชื่อรีไฟแนนซ์ · มีผล 01/10/2026</span><Lock size={14} /></div></Field>
                </div>
                <p className="field-label mt-16">โหมดการคำนวณ (แสดงเป็นแท็บบนหน้าเว็บ)</p>
                <div className="grid-2 mt-8" style={{ gap: 10 }}>
                  {([['lower', 'ลดค่างวด', 'เทียบค่างวดเดิมกับค่างวดใหม่'], ['faster', 'ปิดไวขึ้น', 'ผ่อนเท่าเดิม ปิดหนี้เร็วขึ้น'], ['topup', 'กู้เพิ่ม', 'วงเงินส่วนต่างที่กู้เพิ่มได้'], ['interest', 'ลดดอกเบี้ย', 'ดอกเบี้ยที่ประหยัดได้ทั้งสัญญา']] as const).map(([k, l, d]) => (
                    <div className="mode-card" key={k}><Toggle checked={modes[k]} onChange={(v) => setModes({ ...modes, [k]: v })} /><div><b style={{ fontWeight: 500 }}>{l}</b><div className="t-sm t-secondary">{d}</div></div></div>
                  ))}
                </div>
                <p className="field-label mt-16">ช่องกรอกข้อมูล</p>
                <table className="table mt-8">
                  <thead><tr><th>ช่องกรอก</th><th>ค่าเริ่มต้น</th><th>ต่ำสุด</th><th>สูงสุด</th></tr></thead>
                  <tbody>
                    {[['ยอดหนี้คงเหลือ (บาท)', '2,000,000', '100,000', '50,000,000'], ['ค่างวดปัจจุบัน (บาท/เดือน)', '15,000', '1,000', '500,000'], ['ดอกเบี้ยปัจจุบัน (% ต่อปี)', 'x.xx', '0.00', '15.00'], ['ระยะเวลาผ่อนคงเหลือ (ปี)', '20', '1', '40']].map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{i ? <Input defaultValue={c} style={{ padding: '4px 8px' }} /> : c}</td>)}</tr>)}
                  </tbody>
                </table>
              </Card>
              <Card title="ปุ่มสมัคร (CTA) และข้อความกำกับ">
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <div style={{ gridColumn: 'span 1' }}><Field label="ข้อความปุ่ม"><Input defaultValue="สมัครรีไฟแนนซ์" /></Field></div>
                  <div style={{ gridColumn: 'span 2' }}><Field label="URL Microsite"><Input defaultValue="https://.../apply/refinance" /></Field></div>
                  <Field label="utm_source"><Input defaultValue="lhbank_web" /></Field>
                  <Field label="utm_medium"><Input defaultValue="calculator" /></Field>
                  <Field label="utm_campaign"><Input defaultValue="refinance_2569" /></Field>
                  <div style={{ gridColumn: '1/-1' }}><Field label="ข้อความกำกับ (Disclaimer)"><Input defaultValue="ผลการคำนวณเป็นการประมาณการเบื้องต้น อัตราดอกเบี้ยและเงื่อนไขเป็นไปตามที่ธนาคารกำหนด" /></Field></div>
                </div>
              </Card>
            </>
          )}
          {tab === 'docs' && (
            <Card title="คุณสมบัติผู้สมัคร & เอกสารประกอบ">
              <div className="grid-2" style={{ gap: 24 }}>
                <Field label="คุณสมบัติผู้สมัคร"><Textarea rows={6} defaultValue={'• สัญชาติไทย อายุ 20–65 ปี\n• รายได้ขั้นต่ำ 15,000 บาท/เดือน\n• อายุงาน 1 ปีขึ้นไป'} /></Field>
                <Field label="เอกสารประกอบ"><Textarea rows={6} defaultValue={'• สำเนาบัตรประชาชน\n• สำเนาทะเบียนบ้าน\n• สลิปเงินเดือนย้อนหลัง 3 เดือน\n• Statement ย้อนหลัง 6 เดือน'} /></Field>
              </div>
              <Field label="ไฟล์แนบ (ดาวน์โหลดได้จากหน้าเว็บ)" className="mt-16"><div className="file-pick"><Upload size={16} /> fact-sheet-{p?.code ?? 'new'}.pdf · 420 KB</div></Field>
            </Card>
          )}
          {tab === 'faq' && (
            <Card title="FAQ ของผลิตภัณฑ์" sub="แสดงท้ายหน้าและสร้าง FAQ Schema อัตโนมัติ" action={<Button size="sm" icon={Plus} onClick={() => setFaqs([...faqs, ['', '']])}>เพิ่มคำถาม</Button>}>
              <div className="col" style={{ gap: 10 }}>
                {faqs.map(([q, a], i) => (
                  <div className="faq-item" key={i} style={{ alignItems: 'flex-start', gap: 12 }}>
                    <div className="col grow" style={{ gap: 6 }}><Input placeholder="คำถาม" value={q} onChange={(e) => setFaqs(faqs.map((x, j) => (j === i ? [e.target.value, x[1]] : x)))} /><Input placeholder="คำตอบ" value={a} onChange={(e) => setFaqs(faqs.map((x, j) => (j === i ? [x[0], e.target.value] : x)))} /></div>
                    <IconButton icon={Trash2} danger title="ลบ" onClick={() => setFaqs(faqs.filter((_, j) => j !== i))} />
                  </div>
                ))}
              </div>
            </Card>
          )}
          {tab === 'seo' && (
            <Card title="SEO / AEO">
              <div className="col">
                <Field label="Meta title" required hint="(ไม่เกิน 60)"><Input defaultValue={`${name} ดอกเบี้ยพิเศษ | LH Bank`} /></Field>
                <Field label="Meta description" required hint="(ไม่เกิน 160)"><Textarea rows={2} defaultValue={`${name} จาก LH Bank เงื่อนไขพิเศษ สมัครง่าย อนุมัติไว`} /></Field>
                <Field label="Schema"><Select options={line === 'loan' ? ['LoanOrCredit (ใช้ Schema ระดับเว็บไซต์)'] : ['FinancialProduct (ใช้ Schema ระดับเว็บไซต์)']} /></Field>
              </div>
            </Card>
          )}
        </div>
        <div className="col">
          {tab === 'calc' && (
            <Card title="Preview บนหน้าเว็บ">
              <div className="calc-preview">
                <div className="row" style={{ gap: 8, fontWeight: 500 }}><CalcIcon size={16} /> รีไฟแนนซ์ช่วยประหยัดเท่าไร?</div>
                <div className="row mt-8" style={{ gap: 6, flexWrap: 'wrap' }}>
                  {([['lower', 'ลดค่างวด'], ['faster', 'ปิดไวขึ้น'], ['topup', 'กู้เพิ่ม']] as const).filter(([k]) => modes[k]).map(([k, l]) => <button key={k} className={`cp-tab ${mode === k ? 'on' : ''}`} onClick={() => setMode(k)}>{l}</button>)}
                </div>
                <p className="t-sm mt-8">ยอดหนี้คงเหลือ</p><div className="cp-input">...</div>
                <p className="t-sm mt-8">{mode === 'topup' ? 'มูลค่าหลักประกัน' : 'ค่างวดปัจจุบัน'}</p><div className="cp-input">...</div>
                <div className="cp-result"><span className="t-sm">{mode === 'faster' ? 'ปิดหนี้เร็วขึ้นประมาณ' : mode === 'topup' ? 'กู้เพิ่มได้ประมาณ' : 'ประหยัดได้ประมาณ'}</span><b>{mode === 'faster' ? 'x ปี x เดือน' : mode === 'topup' ? 'x,xxx,xxx บาท' : 'x,xxx บาท/เดือน'}</b></div>
              </div>
              <p className="t-sm t-secondary mt-8">ดอกเบี้ยดึงจากเมนู Rates · แสดง “มีผลตั้งแต่ 01/10/2026” อัตโนมัติ</p>
            </Card>
          )}
          <Card title="การเผยแพร่">
            <div className="col">
              <Field label="สถานะ"><Select defaultValue={p?.status} options={['Published', 'Scheduled', 'Draft']} /></Field>
              <Field label="ผู้อนุมัติ"><Select options={['Auditor – Marketing', 'Auditor – ฝ่ายสินเชื่อ', 'Auditor – ฝ่ายเงินฝาก']} /></Field>
              <p className="t-sm t-secondary">{isNew ? 'ยังไม่เคยบันทึก' : 'แก้ไขล่าสุด 26/10/2026 16:40 โดย Content Editor 02'}</p>
            </div>
          </Card>
        </div>
      </div>
      <div className="bottom-bar">
        <Button onClick={() => navigate(`/products/${line}`)}>Cancel</Button>
        <Button onClick={() => toast('บันทึก Draft แล้ว', name)}>Save Draft</Button>
        <Button variant="primary" icon={Upload} onClick={submit}>ส่งอนุมัติ</Button>
      </div>
    </div>
  );
}
