import { useState } from 'react';
import { Eye, Plus, Move, X, Briefcase, Users, Shield, TrendingUp, Sun, Heart, Home, PiggyBank, Wallet, Upload } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, Card, Field, Input, Textarea, Status, LangSwitch, PageHeader, Modal, Select } from '../components/ui';
import { useStore } from '../store';
import './pages.css';

type Lang = 'th' | 'en' | 'zh';
interface Product {
  name: string;
  cat: string;
  icon: LucideIcon;
}
interface Stage {
  id: string;
  name: string;
  slug: string;
  headline: string;
  desc: string;
  color: string;
  icon: LucideIcon;
  products: Product[];
}

const ICONS: LucideIcon[] = [Briefcase, Users, Shield, TrendingUp, Sun, Heart, Home, PiggyBank];
const COLORS = [['#7fb3b8', 'lifestage/teal'], ['#c9a2a7', 'lifestage/rose'], ['#8fa6c4', 'lifestage/blue'], ['#a3b07c', 'lifestage/olive'], ['#d8c48a', 'lifestage/sand']] as const;
const CATALOG: Product[] = [
  { name: 'เงินฝากออมทรัพย์ดิจิทัล', cat: 'เงินฝาก', icon: PiggyBank },
  { name: 'สินเชื่อบุคคล Happy Cash', cat: 'สินเชื่อ', icon: Wallet },
  { name: 'ประกันสุขภาพ', cat: 'ประกัน', icon: Shield },
  { name: 'สินเชื่อบ้าน Home 1st Class', cat: 'สินเชื่อ', icon: Home },
  { name: 'เงินฝากประจำ 6 เดือน', cat: 'เงินฝาก', icon: PiggyBank },
  { name: 'กองทุนรวม LH Fund', cat: 'การลงทุน', icon: TrendingUp },
  { name: 'ประกันชีวิตแบบออมทรัพย์', cat: 'ประกัน', icon: Heart },
];

const STAGES: Stage[] = [
  { id: 's1', name: 'เริ่มทำงาน', slug: 'first-jobber', headline: 'สร้างวินัยการออมตั้งแต่เงินเดือนแรก', desc: 'เริ่มต้นวางรากฐานการเงินที่มั่นคง ด้วยบัญชีเงินฝากที่ใช้ง่าย วงเงินสำรองยามจำเป็น และความคุ้มครองที่อุ่นใจ', color: COLORS[0][0], icon: Briefcase, products: CATALOG.slice(0, 3) },
  { id: 's2', name: 'สร้างครอบครัว', slug: 'family', headline: 'วางแผนการเงินเพื่อคนที่คุณรัก', desc: 'บ้านหลังแรก การศึกษาบุตร และความคุ้มครองครอบครัว', color: COLORS[1][0], icon: Users, products: [CATALOG[3], CATALOG[4], CATALOG[6]] },
  { id: 's3', name: 'เพิ่มความมั่นคง', slug: 'stability', headline: 'ต่อยอดเงินออมให้งอกเงย', desc: 'กระจายความเสี่ยงด้วยเงินฝากและการลงทุน', color: COLORS[2][0], icon: Shield, products: [CATALOG[4], CATALOG[5], CATALOG[2]] },
  { id: 's4', name: 'เสริมความมั่งคั่ง', slug: 'wealth', headline: 'บริหารความมั่งคั่งอย่างมืออาชีพ', desc: 'ที่ปรึกษาการลงทุนและผลิตภัณฑ์เฉพาะสำหรับคุณ', color: COLORS[3][0], icon: TrendingUp, products: [CATALOG[5], CATALOG[4], CATALOG[6], CATALOG[3]] },
  { id: 's5', name: 'วางแผนเกษียณ', slug: 'retirement', headline: 'เกษียณสุขใจ มีเงินใช้ตลอดชีวิต', desc: 'วางแผนรายได้หลังเกษียณและมรดก', color: COLORS[4][0], icon: Sun, products: [CATALOG[4], CATALOG[6], CATALOG[5]] },
];

/* CMS-13 Life Stage */
export default function LifeStage() {
  const { toast, submitRequest } = useStore();
  const [stages, setStages] = useState(STAGES);
  const [selId, setSelId] = useState('s1');
  const [lang, setLang] = useState<Lang>('th');
  const [adding, setAdding] = useState(false);
  const [pick, setPick] = useState(CATALOG[0].name);
  const sel = stages.find((s) => s.id === selId) ?? stages[0];
  const patch = (p: Partial<Stage>) => setStages(stages.map((s) => (s.id === sel.id ? { ...s, ...p } : s)));
  const move = (i: number, d: -1 | 1) => { const c = [...stages]; const j = i + d; if (j < 0 || j >= c.length) return; [c[i], c[j]] = [c[j], c[i]]; setStages(c); };

  return (
    <div className="with-bottom-bar">
      <PageHeader
        title="Life Stage"
        sub="ข้อมูลแสดงที่ Section “ตามช่วงชีวิต” หน้าแรก และหน้า Life Stage"
        actions={<>
          <Button icon={Eye} onClick={() => toast('Preview', 'Section ตามช่วงชีวิต · หน้าแรก')}>Preview</Button>
          <Button variant="primary" icon={Plus} onClick={() => { const n: Stage = { id: `s${Date.now()}`, name: 'ช่วงชีวิตใหม่', slug: 'new-stage', headline: '', desc: '', color: COLORS[0][0], icon: Heart, products: [] }; setStages([...stages, n]); setSelId(n.id); }}>เพิ่มช่วงชีวิต</Button>
        </>}
      />
      <div className="split" style={{ gridTemplateColumns: '360px minmax(0,1fr)' }}>
        <Card title={`ช่วงชีวิต (${stages.length})`} action={<span className="t-sm t-secondary">กด ↑↓ เพื่อเรียงลำดับ</span>}>
          <div className="col" style={{ gap: 10 }}>
            {stages.map((s, i) => (
              <button key={s.id} className={`stage-item ${s.id === sel.id ? 'on' : ''}`} onClick={() => setSelId(s.id)}>
                <span className="col" style={{ gap: 0 }}>
                  <span onClick={(e) => { e.stopPropagation(); move(i, -1); }} className="t-sm" style={{ lineHeight: 1 }}>▲</span>
                  <span onClick={(e) => { e.stopPropagation(); move(i, 1); }} className="t-sm" style={{ lineHeight: 1 }}>▼</span>
                </span>
                <span className="stage-ic" style={{ background: s.color }}><s.icon size={16} /></span>
                <span className="grow" style={{ textAlign: 'left', whiteSpace: 'nowrap' }}><b style={{ fontWeight: 500 }}>{s.name}</b><br /><span className="t-sm" style={{ opacity: 0.85 }}>ผลิตภัณฑ์แนะนำ {s.products.length} รายการ</span></span>
                {!s.headline && <Status status="Draft" />}
              </button>
            ))}
          </div>
        </Card>
        <Card title={<span className="row"><span className="stage-ic lg" style={{ background: sel.color }}><sel.icon size={20} /></span>แก้ไข: {sel.name}</span>}>
          <LangSwitch value={lang} onChange={setLang} options={[{ value: 'th', label: 'TH (Main)' }, { value: 'en', label: 'EN' }, { value: 'zh', label: '中文' }]} />
          <div className="form-grid">
            <Field label="ชื่อช่วงชีวิต" required><Input value={lang === 'th' ? sel.name : ''} placeholder={lang !== 'th' ? `ชื่อภาษา${lang === 'en' ? 'อังกฤษ' : 'จีน'}` : ''} onChange={(e) => lang === 'th' && patch({ name: e.target.value })} /></Field>
            <Field label="Slug"><Input value={sel.slug} onChange={(e) => patch({ slug: e.target.value })} /></Field>
            <div style={{ gridColumn: '1/-1' }}><Field label="หัวข้อในแผงแนะนำ" required><Input value={lang === 'th' ? sel.headline : ''} onChange={(e) => lang === 'th' && patch({ headline: e.target.value })} /></Field></div>
            <div style={{ gridColumn: '1/-1' }}><Field label="คำอธิบาย"><Textarea rows={2} value={lang === 'th' ? sel.desc : ''} onChange={(e) => lang === 'th' && patch({ desc: e.target.value })} /></Field></div>
            <div className="field">
              <span className="field-label">สีประจำช่วงชีวิต</span>
              <div className="row">{COLORS.map(([c]) => <button key={c} className={`swatch ${sel.color === c ? 'on' : ''}`} style={{ background: c }} onClick={() => patch({ color: c })} aria-label={c} />)}</div>
              <span className="t-sm t-secondary">{COLORS.find(([c]) => c === sel.color)?.[1]}</span>
            </div>
            <div className="field">
              <span className="field-label">ไอคอน</span>
              <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>{ICONS.map((I, i) => <button key={i} className={`icon-pick ${sel.icon === I ? 'on' : ''}`} onClick={() => patch({ icon: I })}><I size={16} /></button>)}</div>
            </div>
          </div>
          <div className="row-between mt-24" style={{ marginBottom: 10 }}>
            <b style={{ fontWeight: 500 }}>ผลิตภัณฑ์แนะนำ (สูงสุด 3 บนหน้าแรก)</b>
            <Button size="sm" icon={Plus} onClick={() => setAdding(true)}>เพิ่มผลิตภัณฑ์</Button>
          </div>
          <div className="col" style={{ gap: 8 }}>
            {sel.products.map((p, i) => (
              <div className="prod-row" key={p.name}>
                <Move size={16} className="t-tertiary" />
                <span className="prod-ic"><p.icon size={15} /></span>
                <span className="grow">{p.name}{i >= 3 && <span className="t-sm t-tertiary"> · แสดงเฉพาะหน้า Life Stage</span>}</span>
                <span className="tag" style={{ background: '#fff', fontWeight: 400, fontSize: 14 }}>{p.cat}</span>
                <button className="icon-btn" onClick={() => patch({ products: sel.products.filter((x) => x !== p) })} aria-label="นำออก"><X size={16} /></button>
              </div>
            ))}
            {!sel.products.length && <p className="t-tertiary t-sm">ยังไม่มีผลิตภัณฑ์แนะนำ</p>}
          </div>
        </Card>
      </div>
      <div className="bottom-bar">
        <Button onClick={() => setStages(STAGES)}>Cancel</Button>
        <Button onClick={() => toast('บันทึก Draft แล้ว', sel.name)}>Save Draft</Button>
        <Button variant="primary" icon={Upload} onClick={() => { submitRequest({ title: `Life Stage · ${sel.name}`, module: 'Life Stage', sub: 'Life Stage · แก้ไข' }); toast('ส่งอนุมัติแล้ว', `Life Stage · ${sel.name}`); }}>Publish</Button>
      </div>
      <Modal open={adding} onClose={() => setAdding(false)} title="เพิ่มผลิตภัณฑ์แนะนำ" footer={<><Button onClick={() => setAdding(false)}>ยกเลิก</Button><Button variant="primary" onClick={() => { const p = CATALOG.find((c) => c.name === pick); if (p && !sel.products.includes(p)) patch({ products: [...sel.products, p] }); setAdding(false); }}>เพิ่ม</Button></>}>
        <Field label="ผลิตภัณฑ์"><Select value={pick} onChange={(e) => setPick(e.target.value)} options={CATALOG.filter((c) => !sel.products.includes(c)).map((c) => ({ value: c.name, label: `${c.name} · ${c.cat}` }))} /></Field>
      </Modal>
    </div>
  );
}
