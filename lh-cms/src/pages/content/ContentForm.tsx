import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Sparkles, Eye, Download, Send, Image as ImageIcon, Info, Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { Button, Card, Field, Input, Select, Textarea, Tabs, Status, Modal, PageHeader, IconButton, InfoBanner } from '../../components/ui';
import MediaPicker from '../../components/MediaPicker';
import MediaThumb from '../../components/MediaThumb';
import { useStore } from '../../store';
import type { Dispatch, SetStateAction } from 'react';
import type { TabItem } from '../../components/ui';
import type { MediaItem, VersionItem } from '../../types';
import '../pages.css';

type Lang = 'th' | 'en' | 'zh';
type FormTab = 'content' | 'seo' | 'display' | 'versions';

interface LangData {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDesc: string;
  slug: string;
  answer: string;
}
type FormData = Record<Lang, LangData>;

interface Meta {
  type: string;
  path: string;
}

interface Faq {
  q: string;
  a: string;
}

type RestorePart = 'content' | 'media' | 'schedule' | 'seo';
type Check = [label: string, ok: boolean];

interface LangProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  data: FormData;
  setField: (key: keyof LangData, value: string) => void;
  hero: MediaItem | null;
}

interface ContentTabProps extends LangProps {
  setHero: Dispatch<SetStateAction<MediaItem | null>>;
  meta: Meta;
  setMeta: Dispatch<SetStateAction<Meta>>;
}

const LANG_TABS: TabItem<Lang>[] = [
  { value: 'th', label: 'TH (Main)', dot: '#5ab4b8' },
  { value: 'en', label: 'EN', dot: '#5ab4b8' },
  { value: 'zh', label: '中文', dot: '#e8a557' },
];

const INITIAL: FormData = {
  th: { title: 'เงินฝากประจำพิเศษ 6 เดือน รับดอกเบี้ยสูง', excerpt: 'ฝากขั้นต่ำ 10,000 บาท รับดอกเบี้ย {rate:fd-6m} ต่อปี', metaTitle: 'เงินฝากประจำพิเศษ 6 เดือน ดอกเบี้ยสูง | LH Bank', metaDesc: 'ฝากขั้นต่ำ 10,000 บาท รับดอกเบี้ย {rate:fd-6m} ต่อปี เปิดบัญชีได้ถึง 31 ธ.ค. 2569', slug: '/th/personal/deposit/fixed-6m', answer: 'LH Bank เงินฝากประจำพิเศษ 6 เดือน ฝากขั้นต่ำ 10,000 บาท ดอกเบี้ย {rate:fd-6m} ต่อปี เปิดบัญชีได้ถึง 31 ธ.ค. 2569' },
  en: { title: '6-Month Special Fixed Deposit, High Interest', excerpt: 'Minimum deposit THB 10,000, earn {rate:fd-6m} p.a.', metaTitle: '6-Month Special Fixed Deposit | LH Bank', metaDesc: 'Minimum deposit THB 10,000 and earn {rate:fd-6m} p.a. Open by 31 Dec 2026.', slug: '/en/personal/deposit/fixed-6m', answer: 'LH Bank 6-month special fixed deposit: minimum THB 10,000, {rate:fd-6m} p.a., open by 31 Dec 2026.' },
  zh: { title: '6个月特别定期存款 · 高利率', excerpt: '', metaTitle: '6个月特别定期存款 · 高利率 | LH Bank', metaDesc: '', slug: '/zh/personal/deposit/fixed-6m', answer: 'LH Bank 6个月特别定期存款，最低存款10,000泰铢，年利率{rate:fd-6m}，2026年12月31日前开户有效。' },
};

const FAQS: Faq[] = [
  { q: '最低存款金额是多少？', a: '10,000泰铢' },
  { q: '可以提前支取吗？', a: '可以，但利息按活期计算' },
];

function completeness(d: LangData): { pct: number; missing: number } {
  const req: (keyof LangData)[] = ['title', 'excerpt', 'metaTitle', 'metaDesc', 'answer'];
  const missing = req.filter((k) => !d[k]?.trim()).length;
  return { pct: Math.round(((req.length - missing) / req.length) * 100), missing };
}

/* ---------- Tab: เนื้อหา (CS-04 / CS-04C) ---------- */
function ContentTab({ lang, setLang, data, setField, hero, setHero, meta, setMeta }: ContentTabProps) {
  const [picker, setPicker] = useState(false);
  const d = data[lang];
  return (
    <div className="split">
      <Card>
        <Tabs tabs={LANG_TABS} value={lang} onChange={setLang} style={{ marginBottom: 18 }} />
        <div className="col">
          <Field label="หัวข้อ" required><Input value={d.title} onChange={(e) => setField('title', e.target.value)} /></Field>
          <Field label="คำโปรย"><Input value={d.excerpt} onChange={(e) => setField('excerpt', e.target.value)} /></Field>
          <div className="field">
            <span className="field-label">รูป Hero <span className="req">*</span></span>
            <div className="hero-picker">
              <div className="hero-thumb">{hero ? <MediaThumb item={hero} height={100} /> : <ImageIcon size={28} strokeWidth={1.4} />}</div>
              <div className="col" style={{ gap: 6 }}>
                <span>{hero ? hero.name : 'ยังไม่ได้เลือกรูป'}</span>
                <span className="t-secondary">{hero ? `Alt: ${hero.alt || '-'}` : 'แนะนำ 1920×800 px · JPG / PNG / WebP'}</span>
                <div className="row" style={{ gap: 8 }}>
                  <Button icon={ImageIcon} onClick={() => setPicker(true)}>{hero ? 'เปลี่ยนรูป' : 'เลือกจาก Media Library'}</Button>
                  {hero && <Button variant="ghost" onClick={() => setHero(null)}>นำออก</Button>}
                </div>
              </div>
            </div>
          </div>
          <div className="field">
            <span className="field-label">เนื้อหา <span className="req">*</span></span>
            <div className="editor">
              <div className="editor-tools">
                {['B', 'I', 'U', 'H2', 'H3', '• List', '1. List', 'Link', 'รูป', 'ตาราง', '{ } ตัวแปรอัตรา'].map((t) => (
                  <button key={t} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                    const cmd = { B: 'bold', I: 'italic', U: 'underline', '• List': 'insertUnorderedList', '1. List': 'insertOrderedList' }[t];
                    if (cmd) document.execCommand(cmd);
                    if (t === '{ } ตัวแปรอัตรา') document.execCommand('insertText', false, '{rate:fd-6m}');
                  }}>{t}</button>
                ))}
              </div>
              <div className="editor-body" contentEditable suppressContentEditableWarning key={lang}>
                {lang === 'th' ? (
                  <>
                    <p>สิทธิพิเศษสำหรับลูกค้าที่เปิดบัญชีเงินฝากประจำ 6 เดือน ภายในวันที่ 31 ธันวาคม 2569</p>
                    <ul>
                      <li>ฝากขั้นต่ำ 10,000 บาท สูงสุด 5,000,000 บาท</li>
                      <li>อัตราดอกเบี้ย {'{rate:fd-6m}'} ต่อปี (ดึงจากโมดูล Rates)</li>
                      <li>ไม่ต้องเสียค่าธรรมเนียมเปิดบัญชี</li>
                    </ul>
                  </>
                ) : lang === 'en' ? (
                  <p>Exclusive for customers opening a 6-month fixed deposit account by 31 December 2026.</p>
                ) : (
                  <p>2026年12月31日前开立6个月定期存款账户的客户专享。</p>
                )}
              </div>
            </div>
            <div className="var-hint"><Info size={16} /> อัตราดอกเบี้ยใส่เป็นตัวแปร {'{rate:...}'} เท่านั้น ระบบดึงค่าล่าสุดจาก Rates (CMS-14)</div>
          </div>
          <div className="grid-2">
            <Field label="ปุ่ม CTA"><Input defaultValue="เปิดบัญชีเลย" /></Field>
            <Field label="ลิงก์"><Input defaultValue="/th/personal/deposit/open-account" /></Field>
          </div>
        </div>
      </Card>
      <div className="col">
        <Card title="ข้อมูลเนื้อหา">
          <div className="col">
            <Field label="Content Type"><Select value={meta.type} onChange={(e) => setMeta({ ...meta, type: e.target.value })} options={['Page', 'Promotion', 'Advisory']} /></Field>
            <Field label="Path"><Input value={meta.path} onChange={(e) => setMeta({ ...meta, path: e.target.value })} /></Field>
            <Field label="หมวดหมู่"><Select options={['เงินฝาก', 'สินเชื่อ', 'บัตร', 'ทั่วไป']} /></Field>
          </div>
        </Card>
        <LangCompleteness data={data} />
        <Card title="ช่วงเวลาแสดงผล">
          <div className="col">
            <Field label="เริ่มแสดง"><Input type="datetime-local" defaultValue="2026-11-05T09:00" /></Field>
            <Field label="สิ้นสุด"><Input type="datetime-local" defaultValue="2026-12-31T23:59" /></Field>
          </div>
        </Card>
      </div>
      <MediaPicker open={picker} onClose={() => setPicker(false)} onPick={setHero} />
    </div>
  );
}

function LangCompleteness({ data }: { data: FormData }) {
  return (
    <Card title="ความครบของภาษา">
      {([['TH', 'th'], ['EN', 'en'], ['中文', 'zh']] as [string, Lang][]).map(([l, k]) => {
        const c = completeness(data[k]);
        return (
          <div className="lang-meter" key={k}>
            <b>{l}</b>
            <div className="bar"><i style={{ width: `${c.pct}%`, background: c.missing ? '#e8a557' : '#5ab4b8' }} /></div>
            <span className="t-sm">{c.missing ? `ขาด ${c.missing} ฟิลด์` : 'ครบ'}</span>
          </div>
        );
      })}
    </Card>
  );
}

/* ---------- Tab: SEO / AEO (CS-05, SEO-06…09) ---------- */
function SeoTab({ lang, setLang, data, setField, hero }: LangProps) {
  const d = data[lang];
  const [faqs, setFaqs] = useState<Faq[]>(FAQS);
  const [faqModal, setFaqModal] = useState<(Faq & { i: number }) | null>(null);
  const checks: Check[] = [
    ['มี Answer summary ≤ 60 คำ', !!d.answer],
    ['มี FAQ Schema ≥ 2 ข้อ', faqs.length >= 2],
    [`Slug ภาษา${lang === 'zh' ? 'จีน' : lang === 'en' ? 'อังกฤษ' : 'ไทย'} /${lang}`, d.slug.startsWith(`/${lang}`)],
    [`Meta description ${lang === 'zh' ? 'ภาษาจีน' : ''}`, !!d.metaDesc],
    ['hreflang TH / EN / 中文', true],
    ['Meta title ≤ 60 ตัวอักษร', d.metaTitle.length <= 60 && !!d.metaTitle],
    ['Alt text รูป Hero', !!hero?.alt],
    ['H1 ดึงจากหัวข้ออัตโนมัติ', !!d.title],
    ['ไม่มีรูปที่ฝังข้อความแทน text', true],
    ['Schema type ถูกต้อง', true],
  ];
  const score = checks.filter((c) => c[1]).length;
  const host = 'lhbank.co.th';
  return (
    <div className="split">
      <Card>
        <Tabs tabs={LANG_TABS} value={lang} onChange={setLang} style={{ marginBottom: 18 }} />
        <div className="col">
          <h3 className="t-h3" style={{ fontSize: 18 }}>SEO</h3>
          <Field label="Meta title" required hint={`(${d.metaTitle.length} / 60)`}><Input value={d.metaTitle} maxLength={80} onChange={(e) => setField('metaTitle', e.target.value)} /></Field>
          <Field label="Meta description" required hint={`(${d.metaDesc.length} / 160)`} error={!d.metaDesc ? `ยังไม่ได้กรอก Meta description ${lang === 'zh' ? 'ภาษาจีน' : ''}` : null}>
            <Input value={d.metaDesc} onChange={(e) => setField('metaDesc', e.target.value)} />
          </Field>
          <div className="grid-2">
            <Field label="Slug"><Input value={d.slug} onChange={(e) => setField('slug', e.target.value)} /></Field>
            <Field label="OG Image"><Select options={['og-fixed-6m.jpg', 'ใช้รูป Hero']} /></Field>
          </div>
          <h3 className="t-h3" style={{ fontSize: 18 }}>AEO · สำหรับ AI Search / Answer Engine</h3>
          <Field label="สรุปคำตอบสั้น (Answer summary)" required><Textarea rows={2} value={d.answer} onChange={(e) => setField('answer', e.target.value)} /></Field>
          <div className="field">
            <span className="field-label">คำถามที่พบบ่อย (FAQ Schema)</span>
            {faqs.map((f, i) => (
              <div className="faq-item" key={i}>
                <div><b>Q: {f.q}</b><div className="t-sm">A: {f.a}</div></div>
                <div className="row" style={{ gap: 4 }}>
                  <IconButton icon={Pencil} title="แก้ไข" onClick={() => setFaqModal({ ...f, i })} />
                  <IconButton icon={Trash2} danger title="ลบ" onClick={() => setFaqs(faqs.filter((_, j) => j !== i))} />
                </div>
              </div>
            ))}
            <div><Button icon={Plus} onClick={() => setFaqModal({ q: '', a: '', i: -1 })}>เพิ่มคำถาม</Button></div>
          </div>
          <Field label="Schema type"><Select options={['FAQPage + FinancialProduct', 'Article', 'WebPage']} /></Field>
        </div>
      </Card>
      <div className="col">
        <Card title={`ตัวอย่างผลการค้นหา (${String(LANG_TABS.find((t) => t.value === lang)?.label ?? '').replace(' (Main)', '')})`}>
          <div className="serp">
            <div className="t-sm t-secondary">{host} › {d.slug.split('/').filter(Boolean).slice(0, 1).concat(d.slug.split('/').filter(Boolean).slice(-2, -1)).join(' › ')}</div>
            <div className="title">{d.metaTitle || '— ยังไม่มี Meta title —'}</div>
            <div className="t-sm t-secondary">{d.metaDesc || '— ยังไม่มี Meta description —'}</div>
          </div>
        </Card>
        <Card title="AEO Readiness" action={<span className={`score ${score === 10 ? 'ok' : ''}`}>{score} / 10</span>}>
          <div className="col" style={{ gap: 8 }}>
            {checks.map(([l, ok]) => (
              <div className="check-item" key={l}>
                {ok ? <Check size={16} className="check-ok" /> : <X size={16} className="check-no" />}
                <span className="t-sm">{l}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="note-danger">ส่งอนุมัติได้เมื่อฟิลด์บังคับครบทุกภาษาที่เปิดใช้</div>
      </div>
      <Modal
        open={!!faqModal}
        onClose={() => setFaqModal(null)}
        width={760}
        title={faqModal && faqModal.i >= 0 ? 'แก้ไขคำถาม — FAQ Schema' : 'เพิ่มคำถาม — FAQ Schema'}
        footer={
          <>
            <Button onClick={() => setFaqModal(null)}>ยกเลิก</Button>
            <Button variant="primary" disabled={!faqModal?.q || !faqModal?.a} onClick={() => {
              if (!faqModal) return;
              const next = [...faqs];
              if (faqModal.i >= 0) next[faqModal.i] = { q: faqModal.q, a: faqModal.a };
              else next.push({ q: faqModal.q, a: faqModal.a });
              setFaqs(next);
              setFaqModal(null);
            }}>บันทึก</Button>
          </>
        }
      >
        {faqModal && (
          <>
            <Field label="คำถาม" required><Input value={faqModal.q} onChange={(e) => setFaqModal({ ...faqModal, q: e.target.value })} /></Field>
            <Field label="คำตอบ" required><Textarea value={faqModal.a} onChange={(e) => setFaqModal({ ...faqModal, a: e.target.value })} /></Field>
          </>
        )}
      </Modal>
    </div>
  );
}

/* ---------- Tab: ตั้งค่าการแสดงผล ---------- */
function DisplayTab() {
  return (
    <div className="split">
      <Card title="ตั้งค่าการแสดงผล" sub="กำหนด Layout ที่ใช้แสดงเนื้อหานี้ — ตั้งค่า Layout ครั้งเดียว ใช้ซ้ำได้ทุกเนื้อหา">
        <div className="col">
          <Field label="Layout"><Select options={['Promotion Detail (มาตรฐาน)', 'Landing Campaign', 'Article']} /></Field>
          <Field label="แสดงในหน้า"><Select options={['โปรโมชันทั้งหมด + หน้าเงินฝาก', 'โปรโมชันทั้งหมด', 'ไม่แสดงในรายการ']} /></Field>
          <div className="grid-2">
            <Field label="ลำดับการแสดง"><Input type="number" defaultValue={3} /></Field>
            <Field label="กลุ่มลูกค้า"><Select options={['Personal', 'SME', 'ทุกกลุ่ม']} /></Field>
          </div>
        </div>
      </Card>
      <Card title="ช่องทาง">
        <div className="col" style={{ gap: 10 }}>
          {['Desktop', 'Mobile', 'แอป LHB You'].map((c) => (
            <label className="row" key={c}><input type="checkbox" className="cb" defaultChecked /> {c}</label>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------- Tab: ประวัติเวอร์ชัน (VR-01 / VR-02 / VR-03) ---------- */
function VersionTab({ isNew }: { isNew: boolean }) {
  const { versions, restoreVersion, toast } = useStore();
  const [restore, setRestore] = useState<VersionItem | null>(null);
  const [compare, setCompare] = useState<VersionItem | null>(null);
  const [parts, setParts] = useState<Record<RestorePart, boolean>>({ content: true, media: true, schedule: false, seo: false });
  const [reason, setReason] = useState('ฝ่ายการตลาดขอใช้คำโปรยและรูป Hero ชุดเดิม');
  if (isNew) {
    return <Card><p className="t-secondary" style={{ textAlign: 'center', padding: 40 }}>ยังไม่มีประวัติเวอร์ชัน — ระบบจะเก็บเวอร์ชันทุกครั้งที่บันทึก ส่งอนุมัติ และเผยแพร่</p></Card>;
  }
  const PARTS: [RestorePart, string, string][] = [
    ['content', 'เนื้อหาทุกภาษา', 'หัวข้อ คำโปรย และเนื้อหา · TH / EN / 中文'],
    ['media', 'รูปและไฟล์แนบ', 'รูป Hero และ Alt text'],
    ['schedule', 'ช่วงเวลาแสดงผล', 'ไม่เลือก = ใช้ค่าปัจจุบันของ v5'],
    ['seo', 'SEO / AEO', 'ไม่เลือก = ใช้ค่าปัจจุบันของ v5'],
  ];
  return (
    <>
      <InfoBanner title="ย้อนกลับไปแก้ไขหรือกู้คืนได้โดยไม่กระทบหน้าเว็บ">
        ระบบสร้างฉบับร่างใหม่จากเวอร์ชันที่เลือก · v5 ที่เผยแพร่อยู่ยังแสดงบนเว็บจนกว่าฉบับร่างจะได้รับอนุมัติ · ไม่มีเวอร์ชันใดถูกลบ
      </InfoBanner>
      <Card
        title={`ประวัติเวอร์ชัน (${versions.length})`}
        sub="เก็บทุกครั้งที่บันทึก ส่งอนุมัติ และเผยแพร่ · เลือกเวอร์ชันเพื่อดู เปรียบเทียบ แก้ไขต่อ หรือกู้คืน"
        action={
          <div className="row" style={{ gap: 10 }}>
            <Field label="สถานะ" style={{ width: 180 }}><Select options={['ทั้งหมด', 'Published', 'Expired', 'Rejected', 'Draft']} /></Field>
            <Field label="ช่วงเวลา" style={{ width: 180 }}><Select options={['90 วันล่าสุด', '30 วันล่าสุด', 'ทั้งหมด']} /></Field>
          </div>
        }
      >
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>เวอร์ชัน</th><th>สถานะ</th><th>สรุปการเปลี่ยนแปลง</th><th>ผู้แก้ไข · วันที่</th><th>Action</th></tr></thead>
            <tbody>
              {versions.map((v) => (
                <tr key={v.v} className={v.draft ? 'highlight' : ''}>
                  <td><b>{v.v}</b>{v.live && <div><span className="tag-version">Live</span></div>}</td>
                  <td><Status status={v.status} /></td>
                  <td style={{ maxWidth: 300 }}>{v.summary}</td>
                  <td className="t-sm t-secondary">{v.by}{v.approver && <><br />{v.approver}</>} · {v.date}</td>
                  <td>
                    <div className="row" style={{ gap: 14 }}>
                      <button className="btn-ghost btn" onClick={() => setCompare(v)}>{v.live ? 'ดู' : 'ดู / เทียบ'}</button>
                      {!v.live && <button className="btn-ghost btn" onClick={() => toast(`สร้างฉบับร่างจาก ${v.v}`, 'เปิดแท็บเนื้อหาเพื่อแก้ไขต่อ')}>แก้ไขต่อ</button>}
                      {!v.live && v.status !== 'Rejected' && !v.draft && <button className="btn-ghost btn" onClick={() => setRestore(v)}>กู้คืน</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="t-sm t-secondary mt-16">Rejected แก้ไขต่อได้แต่กู้คืนไม่ได้ · เวอร์ชันที่เผยแพร่อยู่ (Live) แก้ไขได้ผ่านปุ่ม “แก้ไขต่อ” ซึ่งจะสร้างฉบับร่างใหม่</p>
      </Card>

      {/* VR-02 ดูและเปรียบเทียบเวอร์ชัน */}
      <Modal open={!!compare} onClose={() => setCompare(null)} width={900} title={compare?.live ? `ดูเวอร์ชัน ${compare?.v}` : `เปรียบเทียบ ${compare?.v} กับ v5 (Live)`}>
        {compare && (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>ฟิลด์</th><th>{compare.v}</th>{!compare.live && <th>v5 (Live)</th>}</tr></thead>
              <tbody>
                {[
                  ['คำโปรย (TH)', compare.live ? 'ฝากขั้นต่ำ 10,000 บาท รับดอกเบี้ย {rate:fd-6m} ต่อปี' : 'ฝากขั้นต่ำ 10,000 บาท รับดอกเบี้ย 1.80% ต่อปี', 'ฝากขั้นต่ำ 10,000 บาท รับดอกเบี้ย {rate:fd-6m} ต่อปี'],
                  ['รูป Hero', compare.live ? 'promo-fixed-6m.jpg' : 'hero-fixed-6m-v1.jpg', 'promo-fixed-6m.jpg'],
                  ['ช่วงเวลาแสดงผล', '05/10/2026 – 31/12/2026', '05/11/2026 – 31/12/2026'],
                  ['FAQ', compare.v === 'v4' || compare.live ? '3 ข้อ' : '0 ข้อ', '3 ข้อ'],
                ].map(([f, a, b]) => (
                  <tr key={f}>
                    <td><b>{f}</b></td>
                    <td style={{ background: !compare.live && a !== b ? '#fdecea' : undefined }}>{a}</td>
                    {!compare.live && <td style={{ background: a !== b ? '#e6f5ef' : undefined }}>{b}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* VR-03 Popup ยืนยันกู้คืนเวอร์ชัน */}
      <Modal
        open={!!restore}
        onClose={() => setRestore(null)}
        width={680}
        title={`กู้คืน ${restore?.v} เป็นฉบับร่างใหม่`}
        footer={
          <>
            <Button onClick={() => setRestore(null)}>ยกเลิก</Button>
            <Button variant="primary" disabled={!reason.trim() || !Object.values(parts).some(Boolean)} onClick={() => {
              if (!restore) return;
              const chosen = PARTS.filter(([k]) => parts[k]).map(([, l]) => l);
              restoreVersion(restore.v, chosen);
              toast(`สร้างฉบับร่าง v${versions.length + 1} แล้ว`, `กู้คืนจาก ${restore.v} · v5 ยังแสดงบนเว็บ`);
              setRestore(null);
            }}>กู้คืนเป็นฉบับร่าง</Button>
          </>
        }
      >
        <p className="t-secondary" style={{ marginTop: -6 }}>ระบบจะสร้างฉบับร่าง v{versions.length + 1} จากเวอร์ชัน {restore?.v} · v5 ยังแสดงบนเว็บจนกว่า v{versions.length + 1} จะได้รับอนุมัติ · {restore?.v} และ v5 ไม่ถูกเปลี่ยนแปลง</p>
        <b>เลือกส่วนที่ต้องการกู้คืน</b>
        <div style={{ border: '1px solid var(--lh-border-default)', borderRadius: 10 }}>
          {PARTS.map(([k, l, s], i) => (
            <label key={k} className="row" style={{ alignItems: 'flex-start', padding: '12px 16px', borderTop: i ? '1px solid var(--lh-border-default)' : 0, cursor: 'pointer' }}>
              <input type="checkbox" className="cb" style={{ marginTop: 4 }} checked={parts[k]} onChange={(e) => setParts({ ...parts, [k]: e.target.checked })} />
              <div><b>{l}</b><div className="t-sm t-secondary">{s}</div></div>
            </label>
          ))}
        </div>
        <div className="note-soft-warning">⚠️ <span>{restore?.v} ใช้อัตราดอกเบี้ยแบบพิมพ์เอง (1.80%) ซึ่งไม่อัปเดตตามโมดูล Rates · แนะนำให้เปลี่ยนเป็นตัวแปร {'{rate:fd-6m}'} ในฉบับร่างก่อนส่งอนุมัติ</span></div>
        <Field label="เหตุผลการกู้คืน" required><Input value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      </Modal>
    </>
  );
}

/* ---------- Page ---------- */
export default function ContentForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { contents, submitContent, toast } = useStore();
  const isNew = !id;
  const existing = contents.find((c) => String(c.id) === id);
  const [tab, setTab] = useState<FormTab>(isNew ? 'content' : 'versions');
  const [lang, setLang] = useState<Lang>('th');
  const [data, setData] = useState<FormData>(INITIAL);
  const [hero, setHero] = useState<MediaItem | null>(isNew ? null : { name: 'promo-fixed-6m.jpg', kind: 'image', hue: 195, alt: 'เงินฝากประจำพิเศษ 6 เดือน' });
  const [meta, setMeta] = useState<Meta>({ type: params.get('type') || existing?.type || 'Promotion', path: existing?.path?.replace(/^\/th/, '') || '/personal/deposit/fixed-6m' });
  const [submitOpen, setSubmitOpen] = useState(false);
  const [auditor, setAuditor] = useState('Auditor – ฝ่ายเงินฝาก (2 คน)');
  const [publishAt, setPublishAt] = useState('2026-11-05T09:00');
  const [note, setNote] = useState('แคมเปญเริ่ม 5 พ.ย. · อัตราอ้างอิงประกาศ 1 พ.ย. 2569');

  const setField = (k: keyof LangData, v: string) => setData((d) => ({ ...d, [lang]: { ...d[lang], [k]: v } }));
  const allComplete = (['th', 'en', 'zh'] as Lang[]).every((l) => completeness(data[l]).missing === 0) && !!hero;
  const title = isNew ? `สร้างเนื้อหาใหม่ · ${meta.type}` : `แก้ไขเนื้อหา · ${existing?.title || data.th.title}`;

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Manage Content', to: '/content' }, { label: isNew ? 'สร้างเนื้อหา' : 'แก้ไขเนื้อหา' }]}
        back="/content"
        title={title}
        badges={
          isNew ? <Status status="Draft" /> : (
            <>
              <Status status={existing?.status || 'Published'} />
              <span className="tag-version">v5 · เผยแพร่อยู่</span>
            </>
          )
        }
        actions={
          <>
            {isNew && <Button icon={Sparkles} onClick={() => toast('AI ช่วยร่าง', 'สร้างร่าง EN / 中文 จากภาษาไทยแล้ว — โปรดตรวจทานก่อนส่ง')}>AI ช่วยร่าง (ส่วนเสริม)</Button>}
            <Button icon={Eye} onClick={() => toast('เปิด Preview', 'Desktop / Mobile')}>Preview</Button>
            {isNew && <Button icon={Download} onClick={() => toast('บันทึก Draft แล้ว', data.th.title)}>บันทึก Draft</Button>}
            {isNew && <Button variant="primary" icon={Send} onClick={() => setSubmitOpen(true)}>ส่งอนุมัติ</Button>}
          </>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'content', label: 'เนื้อหา' },
          { value: 'seo', label: 'SEO / AEO' },
          { value: 'display', label: 'ตั้งค่าการแสดงผล' },
          { value: 'versions', label: 'ประวัติเวอร์ชัน' },
        ]}
      />
      {tab === 'content' && <ContentTab {...{ lang, setLang, data, setField, hero, setHero, meta, setMeta }} />}
      {tab === 'seo' && <SeoTab {...{ lang, setLang, data, setField, hero }} />}
      {tab === 'display' && <DisplayTab />}
      {tab === 'versions' && <VersionTab isNew={isNew} />}

      {/* CS-06 ยืนยันส่งอนุมัติ */}
      <Modal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        width={640}
        title="ส่งอนุมัติเนื้อหา"
        footer={
          <>
            <Button onClick={() => setSubmitOpen(false)}>ยกเลิก</Button>
            <Button variant="primary" icon={Send} disabled={!allComplete} onClick={() => {
              submitContent({ title: data.th.title, type: meta.type, path: `/th${meta.path}`, auditor: auditor.replace(/ \(.*\)/, ''), publish: publishAt.replace('T', ' ') });
              toast('ส่งอนุมัติแล้ว — สถานะรออนุมัติ', 'ติดตามได้ที่เมนู “สถานะคำขอของฉัน”');
              navigate('/requests');
            }}>ส่งอนุมัติ</Button>
          </>
        }
      >
        <p className="t-secondary" style={{ marginTop: -6 }}>{data.th.title} · {meta.type} · v1</p>
        <div className="ready-box">
          <b>ตรวจความพร้อมก่อนส่ง</b>
          {([
            ['เนื้อหา TH ครบ', completeness(data.th).missing === 0],
            ['เนื้อหา EN ครบ', completeness(data.en).missing === 0],
            ['เนื้อหา 中文 ครบ (รวม SEO / AEO)', completeness(data.zh).missing === 0],
            ['เลือกรูป Hero แล้ว', !!hero],
            ['อัตราดอกเบี้ยใช้ตัวแปร {rate:...} ทั้งหมด', true],
          ] as Check[]).map(([l, ok]) => (
            <div className="check-item" key={l}>{ok ? <Check size={16} className="check-ok" /> : <X size={16} className="check-no" />} {l}</div>
          ))}
        </div>
        {!allComplete && <div className="note-danger">ยังส่งไม่ได้ — กรอกฟิลด์ที่ขาดให้ครบก่อน (ดูแท็บ SEO / AEO ภาษาจีน)</div>}
        <div className="grid-2">
          <Field label="ผู้อนุมัติ" required><Select value={auditor} onChange={(e) => setAuditor(e.target.value)} options={['Auditor – ฝ่ายเงินฝาก (2 คน)', 'Auditor – Marketing (3 คน)', 'Auditor – ฝ่ายสินเชื่อ (2 คน)']} /></Field>
          <Field label="ต้องการเผยแพร่"><Input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} /></Field>
        </div>
        <Field label="หมายเหตุถึงผู้อนุมัติ"><Input value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        <div className="note-warning">เมื่อส่งแล้วจะแก้ไขไม่ได้จนกว่า Auditor จะอนุมัติหรือส่งกลับ</div>
      </Modal>
    </>
  );
}
