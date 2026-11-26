import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Pencil, Image as ImageIcon, Plus } from 'lucide-react';
import { SchemaList } from './Schema';
import SocialCampaign from './SocialCampaign';
import { Button, Card, Field, Input, Select, Textarea, Tabs, Toggle, TagInput, KV, LangSwitch } from '../../components/ui';
import { useStore } from '../../store';
import { PHOTOS } from '../../data/photos';
import logo from '../../assets/figma/logo-lh-bank.svg';
import '../pages.css';

type Lang = 'th' | 'en' | 'zh';
type SeoTab = 'general' | 'advanced' | 'aeo' | 'schema' | 'social';
const LANGS: { value: Lang; label: string }[] = [
  { value: 'th', label: 'TH (Main)' },
  { value: 'en', label: 'EN' },
  { value: 'zh', label: '中文' },
];

interface General {
  title: string;
  desc: string;
  keywords: string[];
}

const GENERAL: Record<Lang, General> = {
  th: { title: 'ธนาคารแลนด์ แอนด์ เฮ้าส์ | LH Bank — ธนาคารสำหรับทุกช่วงชีวิต', desc: 'ฝาก กู้ ลงทุน และวางแผนการเงินครบในที่เดียว พร้อมผู้เชี่ยวชาญดูแลคุณในทุกก้าวสำคัญของชีวิต', keywords: ['LH Bank', 'ธนาคาร', 'เงินฝาก', 'สินเชื่อบ้าน', 'สินเชื่อบุคคล', 'ประกัน', 'การลงทุน', 'LHB You'] },
  en: { title: 'Land and Houses Bank | LH Bank — Banking for every life stage', desc: 'Deposits, loans, investments and financial planning in one place, with experts beside you at every milestone.', keywords: ['LH Bank', 'Bank', 'Deposit', 'Home loan'] },
  zh: { title: 'LH Bank 土地与房屋银行 — 陪伴人生每个阶段', desc: '', keywords: ['LH Bank', '银行'] },
};

const FOOTER = [
  ['Copyright', '© สงวนลิขสิทธิ์ 2569 ธนาคารแลนด์ แอนด์ เฮ้าส์ จำกัด (มหาชน)'],
  ['Call Center', '1327'],
  ['Address', 'ที่อยู่สำนักงานใหญ่ (รอข้อมูลจากธนาคาร)'],
  ['Facebook URL', 'https://...'],
  ['LINE URL', 'https://...'],
  ['YouTube URL', 'https://...'],
  ['Instagram URL', 'https://...'],
  ['X URL', 'https://...'],
  ['Email', 'mailto:...@lhbank.co.th'],
] as const;

function Favicon() {
  return (
    <div className="thumb-box" style={{ width: 48, height: 48, background: '#fff' }}>
      <img src={logo} alt="" width="34" height="9" />
    </div>
  );
}
function OgImage() {
  return (
    <div className="thumb-box" style={{ width: 184, height: 100, overflow: 'hidden', position: 'relative' }}>
      <img src={PHOTOS.branch} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <img src={logo} alt="" width="72" height="18" style={{ position: 'absolute', left: 8, top: 8, background: '#fff', padding: '3px 5px', borderRadius: 4, boxSizing: 'content-box' }} />
    </div>
  );
}

/* CMS-01 / SEO-01 ดูค่าปัจจุบัน · SEO-02 General · SEO-03 Advanced · SEO-04 AEO / AI Search · SEO-05 ส่งอนุมัติ · SEO-06/07 Social Campaign (NEW) */
export default function SeoSite() {
  const { submitRequest, toast } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [edit, setEdit] = useState(false);
  const [tab, setTab] = useState<SeoTab>((params.get('tab') as SeoTab) || 'general');
  const [picking, setPicking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [lang, setLang] = useState<Lang>('th');
  const [gen, setGen] = useState(GENERAL);
  const [adv, setAdv] = useState({ canonical: 'https://www.lhbank.co.th', robots: 'index, follow', sitemap: true, hreflang: true, xDefault: 'TH', gsc: 'google-site-verification=•••••••', robotsTxt: 'User-agent: *  ·  Allow: /  ·  Disallow: /login/  ·  Sitemap: /sitemap.xml' });
  const [ai, setAi] = useState({ search: true, training: false, llms: true, jsonld: true });
  const g = gen[lang];
  const setG = (patch: Partial<General>) => setGen((x) => ({ ...x, [lang]: { ...x[lang], ...patch } }));

  const submit = () => {
    submitRequest({ title: 'SEO / AEO — เว็บไซต์ LH Bank', module: 'SEO', sub: 'SEO · ตั้งค่าเว็บไซต์' });
    toast('ส่งอนุมัติแล้ว — รอ Auditor', 'SEO / AEO ระดับเว็บไซต์ · ค่าปัจจุบันยังใช้งานจนกว่าจะอนุมัติ');
    setEdit(false);
    navigate('/requests');
  };

  const head = (
    <div className="row-between" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
      <div className="row" style={{ gap: 14 }}>
        <button className="back-btn" onClick={() => (edit ? setEdit(false) : navigate('/'))} aria-label="ย้อนกลับ">‹</button>
        <h2 className="t-h3" style={{ fontSize: 18 }}>{edit ? 'แก้ไข ' : ''}SEO / AEO - เว็บไซต์ LH Bank</h2>
        <a className="t-link" href="#" onClick={(e) => e.preventDefault()}>https://www.lhbank.co.th</a>
      </div>
      {edit ? (
        <div className="row" style={{ gap: 10 }}>
          <Button onClick={() => setEdit(false)}>ยกเลิก</Button>
          <Button onClick={() => toast('บันทึก Draft แล้ว')}>บันทึก Draft</Button>
          <Button variant="primary" onClick={submit}>ส่งอนุมัติ</Button>
        </div>
      ) : tab === 'schema' ? (
        <Button variant="primary" icon={Plus} onClick={() => setPicking(true)}>สร้าง Schema</Button>
      ) : tab === 'social' ? (
        <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>สร้างแคมเปญ</Button>
      ) : (
        <Button icon={Pencil} onClick={() => setEdit(true)}>Edit</Button>
      )}
    </div>
  );

  return (
    <>
      <section className="card">
        {head}
        <Tabs value={tab} onChange={setTab} tabs={[{ value: 'general', label: 'General' }, { value: 'advanced', label: 'Advanced' }, { value: 'aeo', label: 'AEO / AI Search' }, ...(edit ? [] : [{ value: 'schema' as SeoTab, label: 'Schema' }, { value: 'social' as SeoTab, label: 'Social Campaign' }])]} style={{ marginBottom: 18 }} />
        {tab === 'schema' && <SchemaList picking={picking} onClosePicker={() => setPicking(false)} />}
        {tab === 'social' && <SocialCampaign creating={creating} onCloseCreate={() => setCreating(false)} />}
        {tab !== 'advanced' && tab !== 'schema' && tab !== 'social' && <LangSwitch value={lang} onChange={setLang} options={LANGS} />}

        {tab === 'general' && !edit && (
          <div className="grid-2" style={{ gap: 32 }}>
            <div>
              <h3 className="section-h">General</h3>
              <KV k="Title">{g.title}</KV>
              <KV k="Description">{g.desc || <span className="t-tertiary">— ยังไม่ได้กรอก —</span>}</KV>
              <KV k="Keywords"><div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>{g.keywords.map((k) => <span className="kw-static" key={k}>{k}</span>)}</div></KV>
              <KV k="Favicon"><Favicon /><div className="t-sm mt-8">favicon-lhbank.png</div><a className="t-link t-sm" style={{ fontWeight: 400 }}>https://media.lhbank.co.th/images/favicon-lhbank.png</a></KV>
              <KV k="Social Thumbnail"><OgImage /><div className="t-sm mt-8">og-lhbank-1200x630.jpg</div></KV>
            </div>
            <div>
              <h3 className="section-h">Setting Footer</h3>
              {FOOTER.map(([k, v]) => <KV key={k} k={k}>{v}</KV>)}
            </div>
          </div>
        )}

        {tab === 'general' && edit && (
          <div className="grid-2" style={{ gap: 32, alignItems: 'start' }}>
            <div className="col">
              <h3 className="section-h" style={{ margin: 0 }}>General</h3>
              <Field label="Title" required hint={`(${g.title.length} / 60)`} error={g.title.length > 60 ? 'Title ยาวเกิน 60 ตัวอักษร อาจถูกตัดในผลการค้นหา' : null}><Input value={g.title} onChange={(e) => setG({ title: e.target.value })} /></Field>
              <Field label="Description" required hint={`(${g.desc.length} / 160)`} error={!g.desc ? 'ยังไม่ได้กรอก Description' : null}><Textarea rows={2} value={g.desc} onChange={(e) => setG({ desc: e.target.value })} /></Field>
              <Field label="Keywords (กด Enter เพื่อเพิ่ม)"><TagInput value={g.keywords} onChange={(keywords) => setG({ keywords })} placeholder="พิมพ์คำค้น..." /></Field>
              <div className="field"><span className="field-label">Favicon <span className="req">*</span></span>
                <div className="row" style={{ gap: 12 }}><Favicon /><div className="col" style={{ gap: 6 }}><span className="t-sm">favicon-lhbank.png</span><Button size="sm">เลือกจาก Media Library</Button></div></div>
              </div>
              <div className="field"><span className="field-label">Social Thumbnail <span className="req">*</span> <span className="hint">(1200 × 630)</span></span>
                <div className="row" style={{ gap: 12 }}><OgImage /><div className="col" style={{ gap: 6 }}><span className="t-sm">og-lhbank-1200x630.jpg</span><Button size="sm" icon={ImageIcon}>เลือกจาก Media Library</Button></div></div>
              </div>
            </div>
            <div className="col">
              <Card title={`ตัวอย่างผลการค้นหา (${LANGS.find((l) => l.value === lang)?.label.replace(' (Main)', '')})`}>
                <div className="serp">
                  <div className="t-sm t-secondary">www.lhbank.co.th</div>
                  <div className="title">{g.title}</div>
                  <div className="t-sm t-secondary">{g.desc || '— ยังไม่มี Description —'}</div>
                </div>
              </Card>
              <h3 className="section-h" style={{ margin: 0 }}>Setting Footer</h3>
              <Field label="Copyright" required><Input defaultValue={FOOTER[0][1]} /></Field>
              <div className="grid-2">
                <Field label="Call Center" required><Input defaultValue="1327" /></Field>
                <Field label="Email" required><Input defaultValue="mailto:...@lhbank.co.th" /></Field>
              </div>
              <Field label="Address"><Input defaultValue={FOOTER[2][1]} /></Field>
              <div className="grid-2">
                {['Facebook URL', 'LINE URL', 'YouTube URL', 'Instagram URL', 'X URL'].map((k) => <Field key={k} label={k}><Input defaultValue="https://..." /></Field>)}
              </div>
            </div>
          </div>
        )}

        {tab === 'advanced' && (
          <div className="grid-2" style={{ gap: 32, alignItems: 'start' }}>
            <div className="col">
              <h3 className="section-h" style={{ margin: 0 }}>Indexing</h3>
              <Field label="Canonical domain" required><Input disabled={!edit} value={adv.canonical} onChange={(e) => setAdv({ ...adv, canonical: e.target.value })} /></Field>
              <Field label="Robots meta (ค่าเริ่มต้นทั้งเว็บไซต์)" required><Select disabled={!edit} value={adv.robots} onChange={(e) => setAdv({ ...adv, robots: e.target.value })} options={['index, follow', 'noindex, follow', 'noindex, nofollow']} /></Field>
              <Toggle label="สร้าง sitemap.xml อัตโนมัติ" desc="อัปเดตเมื่อมีหน้าใหม่เผยแพร่" checked={adv.sitemap} disabled={!edit} onChange={(v) => setAdv({ ...adv, sitemap: v })} />
              <Field label="Sitemap URL"><Input disabled value="https://www.lhbank.co.th/sitemap.xml" /></Field>
              <Field label={<b style={{ fontWeight: 500, color: 'var(--lh-text-primary)' }}>robots.txt</b>}><Textarea disabled={!edit} rows={2} value={adv.robotsTxt} onChange={(e) => setAdv({ ...adv, robotsTxt: e.target.value })} /></Field>
              <div className="note-warning" style={{ background: adv.robots.startsWith('noindex') ? '#e0625a' : undefined, color: adv.robots.startsWith('noindex') ? '#fff' : undefined }}>⚠️ หากตั้งเป็น noindex เว็บไซต์จะหายจากผลการค้นหาหลังเผยแพร่</div>
            </div>
            <div className="col">
              <h3 className="section-h" style={{ margin: 0 }}>ภาษาและการยืนยันเว็บไซต์</h3>
              <Field label="ภาษาเริ่มต้น (x-default)" required><Select disabled={!edit} value={adv.xDefault} onChange={(e) => setAdv({ ...adv, xDefault: e.target.value })} options={['TH', 'EN', '中文']} /></Field>
              <Toggle label="สร้าง hreflang TH / EN / 中文 อัตโนมัติ" desc="เชื่อมหน้าเดียวกันข้ามภาษาให้ Search Engine" checked={adv.hreflang} disabled={!edit} onChange={(v) => setAdv({ ...adv, hreflang: v })} />
              <Field label="Google Search Console verification"><Input disabled={!edit} value={adv.gsc} onChange={(e) => setAdv({ ...adv, gsc: e.target.value })} /></Field>
            </div>
          </div>
        )}

        {tab === 'aeo' && (
          <div className="grid-2" style={{ gap: 32, alignItems: 'start' }}>
            <div className="col">
              <h3 className="section-h" style={{ margin: 0 }}>Organization Schema</h3>
              <Field label="ชื่อองค์กร" required><Input disabled={!edit} defaultValue={lang === 'th' ? 'ธนาคารแลนด์ แอนด์ เฮ้าส์ จำกัด (มหาชน)' : 'Land and Houses Bank Public Company Limited'} /></Field>
              <Field label="ประเภทองค์กร" required><Select disabled={!edit} options={['BankOrCreditUnion', 'FinancialService', 'Organization']} /></Field>
              <Field label="คำอธิบายองค์กรสำหรับ AI Search" required><Textarea disabled={!edit} rows={2} defaultValue="LH Bank ให้บริการเงินฝาก สินเชื่อ และการลงทุน สำหรับบุคคลและธุรกิจในประเทศไทย" /></Field>
              <Field label="ช่องทางทางการ (sameAs)"><Textarea disabled rows={2} defaultValue="Facebook, LINE, YouTube, Instagram และ X ดึงจากแท็บ General อัตโนมัติ" /></Field>
            </div>
            <div className="col" style={{ gap: 8 }}>
              <h3 className="section-h" style={{ margin: 0 }}>การเข้าถึงของ AI</h3>
              <Toggle label="AI Search Crawler" desc="ให้ AI Search อ่านหน้าเว็บสาธารณะและอ้างอิงได้" checked={ai.search} disabled={!edit} onChange={(v) => setAi({ ...ai, search: v })} />
              <Toggle label="AI Training Crawler" desc="ไม่อนุญาตให้นำเนื้อหาไปใช้ฝึกโมเดล" checked={ai.training} disabled={!edit} onChange={(v) => setAi({ ...ai, training: v })} />
              <Toggle label="สร้าง llms.txt อัตโนมัติ" desc="สารบัญเนื้อหาหลักสำหรับ AI" checked={ai.llms} disabled={!edit} onChange={(v) => setAi({ ...ai, llms: v })} />
              <Toggle label="สร้าง Structured Data (JSON-LD)" desc="แปลงฟิลด์ที่กรอกเป็น Schema ทุกหน้า" checked={ai.jsonld} disabled={!edit} onChange={(v) => setAi({ ...ai, jsonld: v })} />
              <div className="note-warning mt-8">หน้าที่ต้อง Login และข้อมูลลูกค้าจะไม่เปิดให้ AI อ่านเสมอ</div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
