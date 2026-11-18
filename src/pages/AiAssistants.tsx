import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Shield, Plus, Sparkles, Settings, RefreshCw, Send, Download, Lock, Check, Circle } from 'lucide-react';
import { Button, Card, Field, Input, Select, Textarea, Tabs, Toggle, IconButton, Modal, PageHeader } from '../components/ui';
import { useStore } from '../store';
import './pages.css';

type Cat = 'content' | 'seo' | 'compliance';
interface Assistant { id: string; name: string; uses: number; desc: string; tags: string[]; color: string; on: boolean; cat: Cat }
const ASSISTANTS: Assistant[] = [
  { id: 'writer', name: 'Content Writer', uses: 412, desc: 'ร่างข้อความ Hero, จุดเด่น และคำอธิบายผลิตภัณฑ์ตาม Tone of Voice ของ LH Bank', tags: ['Layout', 'Products', 'Promotion'], color: '#2f86c1', on: true, cat: 'content' },
  { id: 'translator', name: 'Translator TH ⇄ EN', uses: 356, desc: 'แปลเนื้อหาไทย–อังกฤษ โดยคงคำศัพท์ธนาคารตาม Glossary 320 คำ', tags: ['ทุกหมวดหมู่'], color: '#5ab4b8', on: true, cat: 'content' },
  { id: 'seo', name: 'SEO & AI Search Optimizer', uses: 238, desc: 'สร้าง SEO Title, Meta Description, Heading และ FAQ Schema ตาม Checklist SEO & AI Search 2027', tags: ['Layout', 'News', 'Advisory'], color: '#e8a557', on: true, cat: 'seo' },
  { id: 'faq', name: 'FAQ Generator', uses: 121, desc: 'สร้างคำถาม–คำตอบจากรายละเอียดผลิตภัณฑ์ ให้ AI Search อ่านได้บนหน้า', tags: ['FAQ', 'Products'], color: '#2f86c1', on: true, cat: 'seo' },
  { id: 'compliance', name: 'Compliance Checker', uses: 157, desc: 'ตรวจ Disclaimer คำต้องห้าม และตัวเลขที่ไม่ตรงกับ Rates ก่อนส่งอนุมัติ ช่วยงาน Auditor', tags: ['งานรออนุมัติ', 'Rates'], color: '#e3917f', on: true, cat: 'compliance' },
  { id: 'alt', name: 'Alt Text & Image Assistant', uses: 0, desc: 'สร้าง Alt text TH/EN และแนะนำการครอปรูปตามขนาด Banner', tags: ['Media', 'Banner'], color: '#5ab4b8', on: false, cat: 'content' },
];
const RECENT = [
  ['10:42', 'Content Editor 01', 'SEO & AI Search Optimizer · สินเชื่อรีไฟแนนซ์บ้าน', 'ใส่ลง Draft', 'ok'],
  ['10:15', 'Content Editor 02', 'Translator · FAQ หมวดบัตรเครดิต (TH→EN)', 'ใส่ลง Draft', 'ok'],
  ['09:58', 'Auditor', 'Compliance Checker · เงินฝากประจำพิเศษ 6 เดือน', 'พบ 2 ประเด็น', 'warn'],
  ['09:30', 'Content Editor 01', 'Content Writer · Hero แคมเปญ Q4', 'ถูกบล็อก: พิมพ์อัตราเอง', 'block'],
] as const;

/* CMS-24 AI Assistants — ภาพรวม (+ NEW: AI-01 สร้าง Assistant) */
export function AiList() {
  const navigate = useNavigate();
  const { toast } = useStore();
  const [items, setItems] = useState(ASSISTANTS);
  const [cat, setCat] = useState<Cat | 'all'>('all');
  const [creating, setCreating] = useState(false);
  const c = (k: Cat) => items.filter((a) => a.cat === k).length;
  return (
    <>
      <PageHeader title="AI Assistants" sub="ผู้ช่วย AI สำหรับทีมเนื้อหา · ผลลัพธ์ทุกชิ้นบันทึกเป็น Draft และต้องผ่าน Content Editor → Auditor ก่อนเผยแพร่"
        actions={<><Button icon={Shield} onClick={() => navigate('/ai/seo/settings')}>Guardrails & นโยบาย</Button><Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>สร้าง Assistant</Button></>} />
      <div className="kpis">
        {[['#2f86c1', 'คำขอเดือนนี้', '1,284', '+18% จากเดือนก่อน'], ['#5ab4b8', 'เวลาที่ประหยัดได้', '~46 ชม.', 'ประมาณการจากงานร่าง/แปล'], ['#e8a557', 'นำผลลัพธ์ไปใช้', '72%', 'ถูกใส่ลงใน Draft จริง'], ['#e3917f', 'ถูก Guardrail บล็อก', '9', 'เช่น พิมพ์อัตราดอกเบี้ยเอง']].map(([col, l, n, s]) => (
          <div className="kpi" key={l}><div className="lbl"><i style={{ background: col }} />{l}</div><div className="num">{n}</div><div className="t-sm t-secondary">{s}</div></div>
        ))}
      </div>
      <section className="card">
        <Tabs value={cat} onChange={setCat} style={{ marginBottom: 16 }} tabs={[{ value: 'all', label: `ทั้งหมด (${items.length})` }, { value: 'content', label: `เนื้อหา (${c('content')})` }, { value: 'seo', label: `SEO & AI Search (${c('seo')})` }, { value: 'compliance', label: `Compliance (${c('compliance')})` }]} />
        <div className="ai-grid">
          {items.filter((a) => cat === 'all' || a.cat === cat).map((a) => (
            <div key={a.id} className={`ai-card ${a.on ? '' : 'off'}`}>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <span className="ai-ic" style={{ background: a.color }} />
                <div className="grow"><b style={{ fontWeight: 500 }}>{a.name}</b><div className="t-sm t-secondary">{a.on ? `${a.uses} ครั้ง` : 'ยังไม่เปิดใช้'}</div></div>
                <Toggle checked={a.on} onChange={(v) => { setItems(items.map((x) => (x.id === a.id ? { ...x, on: v } : x))); toast(v ? 'เปิดใช้ Assistant' : 'ปิดใช้ Assistant', a.name); }} />
              </div>
              <p className="t-sm">{a.desc}</p>
              <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>{a.tags.map((t) => <span className="tag tag-dark" key={t}>{t}</span>)}</div>
              <div className="row" style={{ marginTop: 'auto' }}>
                {a.on ? <Button variant="primary" icon={Sparkles} className="grow" onClick={() => navigate(`/ai/${a.id}`)}>เริ่มใช้งาน</Button> : <Button icon={Settings} className="grow" onClick={() => navigate(`/ai/${a.id}/settings`)}>ตั้งค่าก่อนเปิดใช้</Button>}
                <IconButton icon={Settings} title="ตั้งค่า" onClick={() => navigate(`/ai/${a.id}/settings`)} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <Card title="การใช้งานล่าสุด" action={<Link className="t-link" to="/setting/audit">ดูทั้งหมดใน Audit Log →</Link>}>
        {RECENT.map(([t, u, d, r, k]) => (
          <div className="row" key={t} style={{ padding: '10px 0', borderTop: '1px solid var(--lh-border-default)' }}>
            <span style={{ width: 50 }}>{t}</span><b style={{ fontWeight: 500, width: 160 }}>{u}</b><span className="grow">{d}</span>
            <span className={`tag ${k === 'ok' ? 'tag-navy' : k === 'warn' ? 'tag-yellow' : 'tag-red'}`}>{r}</span>
          </div>
        ))}
      </Card>
      <Modal open={creating} onClose={() => setCreating(false)} width={680} title="สร้าง Assistant ใหม่" footer={<><Button onClick={() => setCreating(false)}>ยกเลิก</Button><Button variant="primary" onClick={() => { toast('สร้าง Assistant แล้ว (ปิดใช้งาน)', 'ต้องให้ Auditor ตรวจ Guardrails ก่อนเปิด'); setCreating(false); }}>สร้าง</Button></>}>
        <div className="grid-2">
          <Field label="ชื่อ Assistant" required><Input placeholder="เช่น Promotion Copy Checker" /></Field>
          <Field label="หมวด"><Select options={['เนื้อหา', 'SEO & AI Search', 'Compliance']} /></Field>
        </div>
        <Field label="ใช้กับหมวดหมู่"><Select options={['Page Builder', 'Products', 'Banner', 'FAQ', 'ทุกหมวดหมู่']} /></Field>
        <Field label="คำสั่งระบบ (System Instruction)" required><Textarea rows={4} placeholder="อธิบายหน้าที่ ข้อห้าม และรูปแบบผลลัพธ์" /></Field>
        <div className="info-soft t-sm"><Lock size={14} /> Guardrails บังคับ 3 ข้อ (ห้ามพิมพ์อัตราเอง · ห้าม PII · บันทึกเป็น Draft) ถูกใส่ให้อัตโนมัติ</div>
      </Modal>
    </>
  );
}

/* CMS-24A AI Assistant — Workspace */
interface Msg { role: 'user' | 'ai'; text: string }
export function AiWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useStore();
  const a = ASSISTANTS.find((x) => x.id === id) ?? ASSISTANTS[2];
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'user', text: 'สร้าง SEO Title, Meta Description และ FAQ 3 ข้อ สำหรับหน้านี้ ทั้งภาษาไทยและอังกฤษ' }]);
  const [input, setInput] = useState('');
  const [title, setTitle] = useState('รีไฟแนนซ์บ้าน ดอกเบี้ยคงที่ 3 ปีแรก | LH Bank');
  const [picked, setPicked] = useState<string[]>([]);
  const send = (t: string) => {
    if (!t.trim()) return;
    setMsgs([...msgs, { role: 'user', text: t }, { role: 'ai', text: t.includes('สั้น') ? 'ย่อ Title เหลือ 38 ตัวอักษร: “รีไฟแนนซ์บ้าน ดอกเบี้ยพิเศษ | LH Bank”' : t.includes('EN') ? 'Refinance your home with a fixed rate for the first 3 years | LH Bank' : 'ปรับตามคำสั่งแล้ว — ตรวจทานก่อนใส่ลงฟิลด์' }]);
    if (t.includes('สั้น')) setTitle('รีไฟแนนซ์บ้าน ดอกเบี้ยพิเศษ | LH Bank');
    setInput('');
  };
  const use = (k: string) => { if (!picked.includes(k)) setPicked([...picked, k]); toast('ใส่ลงฟิลด์แล้ว', k); };
  const Result = ({ k, badge, children }: { k: string; badge: string; children: React.ReactNode }) => (
    <div className="ai-result">
      <div className="row-between"><b style={{ fontWeight: 500 }}>{k}</b><span className="tag tag-green">{badge}</span></div>
      <div className="mt-8">{children}</div>
      <div className="row mt-8" style={{ gap: 14 }}><a className="t-link t-sm" onClick={() => use(k)}>{picked.includes(k) ? '✓ ใส่แล้ว' : 'ใส่ในฟิลด์'}</a><a className="t-link t-sm" onClick={() => toast('คัดลอกแล้ว')}>คัดลอก</a><a className="t-link t-sm" onClick={() => send('สร้างใหม่')}>สร้างใหม่</a></div>
    </div>
  );
  return (
    <>
      <PageHeader title={<span className="row"><span className="ai-ic" style={{ background: a.color }} />{a.name}</span>} sub="สร้าง SEO Fields และ FAQ ตาม Checklist SEO & AI Search 2027"
        actions={<><Button icon={RefreshCw} onClick={() => navigate('/ai')}>เปลี่ยน Assistant</Button><Button variant="primary" icon={Plus} onClick={() => { setMsgs([]); setPicked([]); }}>แชทใหม่</Button></>} />
      <div className="ai-ws">
        <Card title="ประวัติการใช้งาน" style={{ padding: 16 }}>
          {[['SEO · สินเชื่อรีไฟแนนซ์บ้าน', 'วันนี้ 10:42'], ['FAQ · บัตรเครดิต Cashback', 'วันนี้ 09:12'], ['Meta · เงินฝากประจำ 6 เดือน', 'เมื่อวาน'], ['Heading · บทความภาษีปลายปี', '28/10'], ['SEO · NPA ทาวน์โฮม', '27/10']].map(([t, d], i) => (
            <div key={t} className={`hist ${i === 0 ? 'on' : ''}`}><div>{t}</div><div className="t-sm t-secondary">{d}</div></div>
          ))}
        </Card>
        <section className="card ai-chat">
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}><span className="t-sm">บริบท:</span><span className="tag tag-blue">Layout · สินเชื่อรีไฟแนนซ์บ้าน (v13 Draft)</span></div>
          <div className="row mt-8" style={{ flexWrap: 'wrap', gap: 6 }}><span className="t-sm">แหล่งข้อมูล:</span>{['Products', 'Rates 🔒', 'FAQ', 'Glossary'].map((t) => <span className="tag tag-dark" key={t}>{t}</span>)}</div>
          <div className="ai-msgs">
            {msgs.map((m, i) => m.role === 'user' ? <div key={i} className="bubble-user">{m.text}</div> : <div key={i} className="row" style={{ alignItems: 'flex-start' }}><span className="ai-ic sm" style={{ background: a.color }} /><div className="ai-text">{m.text}</div></div>)}
            {msgs.length > 0 && msgs[0].role === 'user' && msgs.length === 1 && (
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <span className="ai-ic sm" style={{ background: a.color }} />
                <div className="col grow" style={{ gap: 10 }}>
                  <p>ร่างผลลัพธ์จากเนื้อหา v13 และข้อมูลผลิตภัณฑ์ (ตัวเลขอัตราดอกเบี้ยดึงจาก Rates อัตโนมัติ):</p>
                  <Result k="SEO Title (TH)" badge={`${title.length}/60`}>{title}</Result>
                  <Result k="Meta Description (TH)" badge="128/160">รีไฟแนนซ์บ้านกับ LH Bank ลดค่างวด ดอกเบี้ยเฉลี่ย 3 ปีแรก {'{rate:refinance_avg3y}'} คำนวณได้ทันทีด้วยเครื่องมือออนไลน์</Result>
                  <Result k="FAQ (3 ข้อ)" badge="TH/EN">1) รีไฟแนนซ์บ้านได้เมื่อไร? 2) ต้องใช้เอกสารอะไรบ้าง? 3) มีค่าใช้จ่ายอะไรบ้าง?</Result>
                  <div className="note-warning">ตัวเลขดอกเบี้ยแสดงเป็นตัวแปร {'{rate:...}'} และจะดึงค่าจริงจากหมวดหมู่ Rates ตอนแสดงผล · AI ไม่สามารถพิมพ์ตัวเลขเองได้</div>
                  <p className="t-sm t-secondary">อ้างอิง: Products › สินเชื่อรีไฟแนนซ์ · Rates (มีผล 01/11/2026) · FAQ หมวดสินเชื่อบ้าน</p>
                </div>
              </div>
            )}
          </div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>{['ย่อให้สั้นลง', 'ปรับโทนเป็นทางการ', 'แปลเป็น EN', 'เพิ่ม FAQ'].map((s) => <button key={s} className="chip-btn" onClick={() => send(s)}>{s}</button>)}</div>
          <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <input placeholder="พิมพ์คำสั่งเพิ่มเติม..." value={input} onChange={(e) => setInput(e.target.value)} />
            <button className="btn btn-primary btn-sm" type="submit" aria-label="ส่ง"><Send size={16} /></button>
          </form>
          <p className="t-sm t-secondary">AI อาจผิดพลาดได้ · ตรวจทานก่อนใช้ทุกครั้ง · การใช้งานถูกบันทึกใน Audit Log</p>
        </section>
        <div className="col">
          <Card title="ตัวอย่างบน Google"><div className="serp"><div className="t-sm t-secondary">lhbank.co.th › th › personal › loan</div><div className="title">{title}</div><div className="t-sm t-secondary">รีไฟแนนซ์บ้านกับ LH Bank ลดค่างวด ดอกเบี้ยเฉลี่ย 3 ปีแรก x.xx% คำนวณได้ทันที...</div></div></Card>
          <Card title="AI Search Readiness" action={<b className="t-link">{6 + Math.min(2, picked.length)}/10</b>}>
            {[['SEO Title & Meta', true], ['H1 / Heading ชัดเจน', true], ['Hreflang TH/EN', true], ['FAQ อ่านได้บนหน้า', true], ['ผู้เขียน & วันที่อัปเดต', picked.length > 1], ['แหล่งอ้างอิง/เงื่อนไข', picked.length > 2]].map(([l, ok]) => (
              <div className="check-item" key={l as string} style={{ padding: '4px 0' }}>{ok ? <Check size={15} className="check-ok" /> : <Circle size={13} className="t-tertiary" />}<span className="t-sm">{l}</span></div>
            ))}
          </Card>
          <Card title="นำไปใช้">
            <p className="t-sm t-secondary">ผลลัพธ์ที่เลือก {picked.length} รายการจะบันทึกลง Draft v13 · ต้องส่งอนุมัติก่อนเผยแพร่</p>
            <Button variant="primary" icon={Download} className="mt-8" style={{ width: '100%' }} disabled={!picked.length} onClick={() => toast('บันทึกลง Draft v13 แล้ว', `${picked.length} ฟิลด์ · ไปที่ Layout เพื่อส่งอนุมัติ`)}>บันทึกลง Draft</Button>
          </Card>
        </div>
      </div>
    </>
  );
}

/* CMS-24B AI Assistant — ตั้งค่า & Guardrails */
export function AiSettings() {
  const { id } = useParams();
  const { toast } = useStore();
  const a = ASSISTANTS.find((x) => x.id === id) ?? ASSISTANTS[2];
  const [tab, setTab] = useState<'general' | 'source' | 'perm' | 'history'>('source');
  const [src, setSrc] = useState({ products: true, rates: true, faq: true, news: true, glossary: true, files: false, lead: false });
  const [guards, setGuards] = useState([true, true, true, true, true]);
  const SOURCES: [keyof typeof src, string, string, boolean?][] = [['products', 'Products', 'รายละเอียดผลิตภัณฑ์ทั้งหมด'], ['rates', 'Rates', 'อ้างอิงเป็นตัวแปรเท่านั้น', true], ['faq', 'FAQ', 'คำถามที่เผยแพร่แล้ว'], ['news', 'News & Advisory', 'บทความที่เผยแพร่แล้ว'], ['glossary', 'Glossary TH/EN', 'คำศัพท์ธนาคาร 320 คำ'], ['files', 'File Manager (PDF)', 'เอกสารผลิตภัณฑ์และเงื่อนไข'], ['lead', 'Form / Lead', 'ข้อมูลลูกค้า — ห้ามใช้', true]];
  const GUARDS = [['ห้ามสร้างตัวเลขอัตราดอกเบี้ย / ค่าธรรมเนียมเอง — ใช้ตัวแปรจาก Rates', true], ['แนบ Disclaimer อัตโนมัติเมื่อกล่าวถึงผลิตภัณฑ์สินเชื่อและเงินฝาก', false], ['ตรวจคำต้องห้าม / คำโฆษณาเกินจริง (เช่น "ดีที่สุด", "การันตี")', false], ['ห้ามรับหรือแสดงข้อมูลส่วนบุคคล (PII) ในคำสั่งและผลลัพธ์', true], ['ผลลัพธ์บันทึกเป็น Draft เท่านั้น — เผยแพร่ต้องผ่านผู้อนุมัติ', true]] as const;
  return (
    <>
      <PageHeader title={<span className="row"><span className="ai-ic" style={{ background: a.color }} />ตั้งค่า · {a.name}</span>}
        badges={<span className={`status ${a.on ? 'status-published' : 'status-draft'}`}>{a.on ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span>}
        actions={<><Button icon={Sparkles} onClick={() => toast('ทดสอบ Assistant', 'ผ่าน Guardrails 5/5')}>ทดสอบ Assistant</Button><Button variant="primary" onClick={() => toast('บันทึกการตั้งค่าแล้ว', 'บันทึกใน Audit Log')}>บันทึก</Button></>} />
      <section className="card">
        <Tabs value={tab} onChange={setTab} style={{ marginBottom: 18 }} tabs={[{ value: 'general', label: 'ทั่วไป' }, { value: 'source', label: 'แหล่งข้อมูล & Guardrails' }, { value: 'perm', label: 'สิทธิ์การใช้งาน' }, { value: 'history', label: 'ประวัติการใช้งาน' }]} />
        <div className="split">
          <div className="col">
            <h3 className="section-h" style={{ margin: 0 }}>ข้อมูลพื้นฐาน</h3>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <Field label="โมเดล"><Select options={['LLM ที่ธนาคารอนุมัติ (Private)']} /></Field>
              <Field label="ภาษาผลลัพธ์"><Select options={['ไทย + อังกฤษ', 'ไทย', 'ไทย + อังกฤษ + จีน']} /></Field>
              <Field label="Tone of Voice"><Select options={['LH Bank · เป็นมิตร กระชับ', 'ทางการ']} /></Field>
            </div>
            <Field label="คำสั่งระบบ (System Instruction)"><Textarea rows={3} defaultValue="คุณคือผู้ช่วย SEO ของ LH Bank สร้าง Title ≤ 60 ตัวอักษร, Meta ≤ 160 ตัวอักษร, FAQ ที่ตอบสั้นและอ้างอิงข้อมูลจากแหล่งที่กำหนดเท่านั้น ห้ามระบุตัวเลขอัตราดอกเบี้ยหรือค่าธรรมเนียมเอง ให้ใช้ตัวแปร {rate:...}" /></Field>
            <h3 className="section-h" style={{ margin: '8px 0 0' }}>แหล่งข้อมูลที่ Assistant อ่านได้</h3>
            <p className="t-sm t-secondary" style={{ marginTop: -10 }}>อ่านอย่างเดียว · ไม่ส่งข้อมูลลูกค้าออกนอกระบบ</p>
            <div className="src-grid">
              {SOURCES.map(([k, l, d, locked]) => (
                <div key={k} className={`src-card ${src[k] ? 'on' : ''}`}>
                  <div className="grow"><b style={{ fontWeight: 500 }}>{l}</b><div className="t-sm t-secondary">{d}</div></div>
                  {locked && <Lock size={14} className="t-tertiary" />}
                  <Toggle checked={src[k]} disabled={locked} onChange={(v) => setSrc({ ...src, [k]: v })} />
                </div>
              ))}
            </div>
            <h3 className="section-h" style={{ margin: '8px 0 0' }}>Guardrails</h3>
            <p className="t-sm t-secondary" style={{ marginTop: -10 }}>กฎที่บังคับใช้กับทุกคำตอบ · ตั้งโดย Auditor</p>
            {GUARDS.map(([g, forced], i) => (
              <div className="guard-row" key={g}><Toggle checked={guards[i]} disabled={forced} onChange={(v) => setGuards(guards.map((x, j) => (j === i ? v : x)))} /><span className="grow">{g}</span>{forced && <span className="tag tag-navy">บังคับ</span>}</div>
            ))}
          </div>
          <div className="col">
            <Card title="การใช้งานเดือนนี้"><b className="t-h3">1,284 / 5,000 คำขอ</b><div className="bar mt-8" style={{ height: 8 }}><i style={{ width: '26%', background: 'var(--lh-info)' }} /></div><p className="t-sm t-secondary mt-8">รีเซ็ต 01/12/2026 · แจ้งเตือนเมื่อใช้ถึง 80%</p></Card>
            <Card title="สิทธิ์การใช้งาน">
              <table className="table"><thead><tr><th>Role</th><th>ใช้งาน</th><th>ตั้งค่า</th></tr></thead><tbody>{[['Auditor', '✓', '✓'], ['Content Editor', '✓', '—'], ['Marketing', '✓', '—'], ['Viewer', '—', '—']].map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} style={{ color: c === '✓' ? '#1a9a8a' : undefined }}>{c}</td>)}</tr>)}</tbody></table>
            </Card>
            <div className="info-soft t-sm"><Lock size={14} /> การเปลี่ยนการตั้งค่าบันทึกใน Audit Log (CMS-23)</div>
          </div>
        </div>
      </section>
    </>
  );
}
