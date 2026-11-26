import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Sparkles, Eye, History, RotateCw, Download, Send, Image as ImageIcon, Info, Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { Button, Card, Field, Input, Select, Textarea, Tabs, Status, Modal, PageHeader, IconButton } from '../../components/ui';
import MediaPicker from '../../components/MediaPicker';
import MediaThumb from '../../components/MediaThumb';
import RichEditor from '../../components/RichEditor';
import { openPreview } from '../Preview';
import { useStore } from '../../store';
import type { Dispatch, SetStateAction } from 'react';
import type { TabItem } from '../../components/ui';
import type { MediaItem, VersionItem } from '../../types';
import '../pages.css';

type Lang = 'th' | 'en' | 'zh';
type FormTab = 'content' | 'seo' | 'display';

interface LangData {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDesc: string;
  slug: string;
  answer: string;
  body: string;
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
  th: { title: 'เงินฝากประจำพิเศษ 6 เดือน รับดอกเบี้ยสูง', excerpt: 'ฝากขั้นต่ำ 10,000 บาท รับดอกเบี้ย {rate:fd-6m} ต่อปี', metaTitle: 'เงินฝากประจำพิเศษ 6 เดือน ดอกเบี้ยสูง | LH Bank', metaDesc: 'ฝากขั้นต่ำ 10,000 บาท รับดอกเบี้ย {rate:fd-6m} ต่อปี เปิดบัญชีได้ถึง 31 ธ.ค. 2569', slug: '/th/personal/deposit/fixed-6m', answer: 'LH Bank เงินฝากประจำพิเศษ 6 เดือน ฝากขั้นต่ำ 10,000 บาท ดอกเบี้ย {rate:fd-6m} ต่อปี เปิดบัญชีได้ถึง 31 ธ.ค. 2569', body: '<p>สิทธิพิเศษสำหรับลูกค้าที่เปิดบัญชีเงินฝากประจำ 6 เดือน ภายในวันที่ 31 ธันวาคม 2569</p><ul><li>ฝากขั้นต่ำ 10,000 บาท สูงสุด 5,000,000 บาท</li><li>อัตราดอกเบี้ย {rate:fd-6m} ต่อปี (ดึงจากหมวดหมู่ Rates)</li><li>ไม่ต้องเสียค่าธรรมเนียมเปิดบัญชี</li></ul>' },
  en: { title: '6-Month Special Fixed Deposit, High Interest', excerpt: 'Minimum deposit THB 10,000, earn {rate:fd-6m} p.a.', metaTitle: '6-Month Special Fixed Deposit | LH Bank', metaDesc: 'Minimum deposit THB 10,000 and earn {rate:fd-6m} p.a. Open by 31 Dec 2026.', slug: '/en/personal/deposit/fixed-6m', answer: 'LH Bank 6-month special fixed deposit: minimum THB 10,000, {rate:fd-6m} p.a., open by 31 Dec 2026.', body: '<p>Exclusive for customers opening a 6-month fixed deposit account by 31 December 2026.</p>' },
  zh: { title: '6个月特别定期存款 · 高利率', excerpt: '', metaTitle: '6个月特别定期存款 · 高利率 | LH Bank', metaDesc: '', slug: '/zh/personal/deposit/fixed-6m', answer: 'LH Bank 6个月特别定期存款，最低存款10,000泰铢，年利率{rate:fd-6m}，2026年12月31日前开户有效。', body: '<p>2026年12月31日前开立6个月定期存款账户的客户专享。</p>' },
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
            <RichEditor key={lang} value={d.body} onChange={(html) => setField('body', html)} langLabel={lang.toUpperCase()} />
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

/* ---------- Modal: ประวัติการแก้ไข (VR-01 / VR-03) — มีเฉพาะ Page Builder ---------- */
const ACTION_CLASS: Record<VersionItem['action'], string> = { INSERT: 'insert', UPDATE: 'update', RECOVER: 'recover' };

function VersionModal({ open, onClose, isNew }: { open: boolean; onClose: () => void; isNew: boolean }) {
  const { versions, restoreVersion, toast } = useStore();
  const [restore, setRestore] = useState<{ item: VersionItem; no: number } | null>(null);
  return (
    <>
      <Modal open={open} onClose={onClose} width={880} title="ประวัติการแก้ไข">
        {isNew ? (
          <p className="t-secondary" style={{ textAlign: 'center', padding: 24 }}>ยังไม่มีประวัติการแก้ไข — ระบบจะบันทึกทุกครั้งที่สร้างหรือแก้ไขเนื้อหา</p>
        ) : (
          <table className="table ver-table">
            <thead><tr><th className="col-no">ลำดับ</th><th>วันที่แก้ไข</th><th>ประเภท</th><th>การเปลี่ยนแปลง</th><th style={{ textAlign: 'right' }}>จัดการ</th></tr></thead>
            <tbody>
              {versions.map((v, i) => (
                <tr key={v.id} className={i === 0 ? 'current' : ''}>
                  <td className="col-no">{i + 1}</td>
                  <td>{v.date}</td>
                  <td><span className={`ver-action ${ACTION_CLASS[v.action]}`}>{v.action}</span></td>
                  <td>
                    {v.changes.length ? (
                      <span className="row" style={{ gap: 6, flexWrap: 'wrap' }}>{v.changes.map((c) => <span key={c} className="ver-chip">{c}</span>)}</span>
                    ) : (
                      <span className="t-secondary">{v.note}</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {i === 0 ? (
                      <span className="t-secondary" style={{ whiteSpace: 'nowrap' }}>เวอร์ชันปัจจุบัน</span>
                    ) : (
                      <span className="row" style={{ justifyContent: 'flex-end' }}><IconButton icon={RotateCw} title="กู้คืนเวอร์ชันนี้" onClick={() => setRestore({ item: v, no: i + 1 })} /></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>

      {/* VR-03 Popup ยืนยันกู้คืนเวอร์ชัน */}
      <Modal
        open={!!restore}
        onClose={() => setRestore(null)}
        width={480}
        title="กู้คืนเวอร์ชันนี้?"
        footer={
          <>
            <Button onClick={() => setRestore(null)}>ยกเลิก</Button>
            <Button variant="primary" onClick={() => {
              if (!restore) return;
              restoreVersion(restore.item);
              toast('กู้คืนเวอร์ชันแล้ว', `จากรายการลำดับที่ ${restore.no} · ${restore.item.date}`);
              setRestore(null);
            }}>กู้คืน</Button>
          </>
        }
      >
        <p className="t-secondary" style={{ margin: 0 }}>เนื้อหาจะถูกย้อนกลับเป็นเวอร์ชันวันที่ {restore?.item.date} และบันทึกเป็นรายการ RECOVER ใหม่ในประวัติการแก้ไข</p>
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
  const existing = contents.find((c) => String(c.id) === id);
  const isRework = !!existing?.rejected; // CS-08 ถูกส่งกลับแก้ไข
  const isNew = !id;
  const editable = isNew || isRework;
  const [tab, setTab] = useState<FormTab>('content');
  const [versionOpen, setVersionOpen] = useState(false);
  const [lang, setLang] = useState<Lang>('th');
  const [data, setData] = useState<FormData>(INITIAL);
  const [hero, setHero] = useState<MediaItem | null>(isNew ? null : isRework ? { name: 'hero-fixed-6m.webp', kind: 'image', hue: 200, alt: 'เงินฝากประจำพิเศษ 6 เดือน' } : { name: 'promo-fixed-6m.jpg', kind: 'image', hue: 195, alt: 'เงินฝากประจำพิเศษ 6 เดือน' });
  const [meta, setMeta] = useState<Meta>({ type: params.get('type') || existing?.type || 'Promotion', path: existing?.path?.replace(/^\/th/, '') || '/personal/deposit/fixed-6m' });
  const [submitOpen, setSubmitOpen] = useState(false);
  const [auditor, setAuditor] = useState('Auditor – ฝ่ายเงินฝาก (2 คน)');
  const [publishAt, setPublishAt] = useState('2026-11-05T09:00');
  const [note, setNote] = useState('แคมเปญเริ่ม 5 พ.ย. · อัตราอ้างอิงประกาศ 1 พ.ย. 2569');

  const setField = (k: keyof LangData, v: string) => setData((d) => ({ ...d, [lang]: { ...d[lang], [k]: v } }));
  const allComplete = (['th', 'en', 'zh'] as Lang[]).every((l) => completeness(data[l]).missing === 0) && !!hero;
  const title = isNew ? `สร้างเนื้อหาใหม่ · ${meta.type}` : isRework ? `แก้ไขเนื้อหา · ${meta.type} (รอบที่ 2)` : `แก้ไขเนื้อหา · ${existing?.title || data.th.title}`;

  return (
    <>
      {isRework && (
        <div className="note-danger" style={{ padding: '12px 18px', border: '1px solid #f0b8b0' }}>
          <b>ถูกส่งกลับแก้ไข · โดย Auditor – ฝ่ายเงินฝาก · {existing?.updated}</b>
          <div>เหตุผล: Meta description ภาษาจีนยังสั้นเกินไป และเงื่อนไขถอนก่อนกำหนดใน FAQ ไม่ตรงกับประกาศอัตรา</div>
        </div>
      )}
      <PageHeader
        back="/content"
        title={title}
        badges={
          isNew ? <Status status="Draft" /> : isRework ? <span className="status status-rejected">ต้องแก้ไข</span> : (
            <>
              <Status status={existing?.status || 'Published'} />
              <span className="tag-version">v5 · เผยแพร่อยู่</span>
            </>
          )
        }
        actions={
          <>
            {editable && <Button icon={Sparkles} onClick={() => toast('AI ช่วยร่าง', 'สร้างร่าง EN / 中文 จากภาษาไทยแล้ว — โปรดตรวจทานก่อนส่ง')}>AI ช่วยร่าง (ส่วนเสริม)</Button>}
            <Button icon={History} onClick={() => setVersionOpen(true)}>ประวัติการแก้ไข</Button>
            <Button icon={Eye} onClick={() => openPreview({ title: data[lang].title, excerpt: data[lang].excerpt, body: data[lang].body, type: meta.type, path: `/${lang}${meta.path}`, hero: hero?.name, lang })}>Preview</Button>
            {editable && <Button icon={Download} onClick={() => toast('บันทึก Draft แล้ว', data.th.title)}>บันทึก Draft</Button>}
            {editable && <Button variant="primary" icon={Send} onClick={() => setSubmitOpen(true)}>ส่งอนุมัติ</Button>}
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
        ]}
      />
      {tab === 'content' && <ContentTab {...{ lang, setLang, data, setField, hero, setHero, meta, setMeta }} />}
      {tab === 'seo' && <SeoTab {...{ lang, setLang, data, setField, hero }} />}
      {tab === 'display' && <DisplayTab />}
      <VersionModal open={versionOpen} onClose={() => setVersionOpen(false)} isNew={isNew} />

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
              toast('ส่งอนุมัติแล้ว — สถานะรออนุมัติ', 'ติดตามได้ที่เมนู “My Requests”');
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
