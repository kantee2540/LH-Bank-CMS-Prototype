import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, RefreshCw, Trash2, Eye, Pencil, Info, Move, ArrowUp, ArrowDown } from 'lucide-react';
import { Button, IconButton, Modal, Status } from '../components/ui';
import ListPage, { selectFilter, textFilter } from '../components/ListPage';
import ModuleForm from '../components/ModuleForm';
import { useStore } from '../store';
import { openPreview } from './Preview';
import type { ContentStatus } from '../types';
import { PHOTOS } from '../data/photos';
import './pages.css';

export type BannerKind = 'hero' | 'promotion';

interface BannerRow {
  id: string;
  name: string;
  langs: string;
  period: string;
  status: ContentStatus;
  by: string;
  img: string;
  position?: string;
}

const HERO: BannerRow[] = [
  { id: 'h1', name: 'ลูกค้าใหม่ เปิดบัญชีออมทรัพย์ รับ E-Voucher 200 บาท', langs: 'TH · EN', period: '01/10/2026 – 31/12/2026', status: 'Published', by: 'Content Editor 02', img: PHOTOS.heroLhbYou },
  { id: 'h2', name: 'เงินฝากประจำพิเศษ 6 เดือน', langs: 'TH · EN', period: '15/10/2026 – 15/01/2027', status: 'Published', by: 'Content Editor 02', img: PHOTOS.saving },
  { id: 'h3', name: 'อยู่ครบ 1 ปี ก็รีได้ (Retention)', langs: 'TH · EN', period: '01/11/2026 – 31/01/2027', status: 'Scheduled', by: 'Content Editor 02', img: PHOTOS.familyBanking },
  { id: 'h4', name: 'ทำธุรกรรมได้ทุกที่ ด้วยแอป LHB You', langs: 'TH · EN', period: '—', status: 'Draft', by: 'Content Editor 02', img: PHOTOS.cardlessWithdrawal },
  { id: 'h5', name: 'สินเชื่อบ้าน LH Bank', langs: 'TH · EN', period: '01/07/2026 – 30/09/2026', status: 'Expired', by: 'Content Editor 02', img: PHOTOS.familyAdvisor },
];
const PROMO: BannerRow[] = [
  { id: 'p1', name: 'เปิดบัญชีผ่านแอป LHB You', langs: 'TH · EN', position: 'หน้าเงินฝาก', period: '01/10/2026 – 31/12/2026', status: 'Published', by: 'Content Editor 01', img: PHOTOS.mobileBanking },
  { id: 'p2', name: 'สินเชื่อบ้าน ผ่อนสบาย', langs: 'TH', position: 'หน้าสินเชื่อบ้าน', period: '15/10/2026 – 15/01/2027', status: 'Published', by: 'Content Editor 01', img: PHOTOS.npaHouse },
  { id: 'p3', name: 'บัตรเครดิต Foreigner Signature', langs: 'TH · EN', position: 'หน้าบัตรเครดิต', period: '01/11/2026 – 31/01/2027', status: 'Scheduled', by: 'Content Editor 02', img: PHOTOS.creditCard },
  { id: 'p4', name: 'กองทุนแนะนำประจำเดือน', langs: 'TH', position: 'หน้าการลงทุน', period: '—', status: 'Draft', by: 'Content Editor 02', img: PHOTOS.bannerFundRmf },
  { id: 'p5', name: 'ทรัพย์ราคาพิเศษ NPA', langs: 'TH', position: 'หน้าสินทรัพย์รอการขาย', period: '01/07/2026 – 30/09/2026', status: 'Expired', by: 'Content Editor 02', img: PHOTOS.npaTownhome },
];

/* CMS-05 Hero Banner · CMS-10 Promotion Banner */
export function BannerList({ kind }: { kind: BannerKind }) {
  const navigate = useNavigate();
  const { toast, trash } = useStore();
  const [rows, setRows] = useState(kind === 'hero' ? HERO : PROMO);
  const [ordering, setOrdering] = useState(false);
  const [del, setDel] = useState<BannerRow | null>(null);
  const isHero = kind === 'hero';
  const label = isHero ? 'Hero Banner' : 'Promotion Banner';
  const move = (i: number, d: -1 | 1) => { const c = [...rows]; const j = i + d; if (j < 0 || j >= c.length) return; [c[i], c[j]] = [c[j], c[i]]; setRows(c); };

  return (
    <ListPage<BannerRow>
      key={kind}
      title={label}
      filters={[
        textFilter('name', 'Banner Name', (r) => r.name),
        ...(isHero ? [] : [selectFilter<BannerRow>('pos', 'ตำแหน่งแสดง', [...new Set(PROMO.map((p) => p.position ?? ''))], (r) => r.position ?? '')]),
        selectFilter('status', 'Status', ['Published', 'Scheduled', 'Draft', 'Expired'], (r) => r.status),
        ...(isHero ? [{ key: 'period', label: 'Display Period', kind: 'select' as const, options: ['ทั้งหมด', 'กำลังแสดง', 'ยังไม่เริ่ม', 'หมดอายุ'], match: (r: BannerRow, v: string) => (v === 'กำลังแสดง' ? r.status === 'Published' : v === 'ยังไม่เริ่ม' ? r.status === 'Scheduled' : r.status === 'Expired') }] : []),
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      toolbar={<>
        <Button variant="primary" icon={Plus} onClick={() => navigate(`/banner/${kind}/new`)}>Create</Button>
        <Button icon={RefreshCw} variant={ordering ? 'primary' : 'secondary'} onClick={() => { if (ordering) toast('บันทึกลำดับแล้ว', 'ลำดับใหม่ต้องส่งอนุมัติก่อนแสดงบนเว็บ'); setOrdering(!ordering); }}>{ordering ? 'บันทึกลำดับ' : 'Move Order'}</Button>
        <Link to="/trash" className="btn btn-secondary"><Trash2 strokeWidth={1.6} /> Recycle Bin ({trash.filter((t) => t.group === 'Banner').length})</Link>
      </>}
      toolbarRight={<span className="row t-secondary" style={{ gap: 8 }}><Info size={18} color="#1f6fa8" /> {isHero ? 'แสดงที่ Hero หน้าแรก · สูงสุด 5 สไลด์ · ภาพ 1120×640 px' : 'แบนเนอร์ขนาดกลางในหน้าผลิตภัณฑ์ / หน้าโปรโมชัน · 1200×300 px'}</span>}
      columns={[
        { key: 'order', label: 'Order', render: (r) => { const i = rows.indexOf(r); return ordering ? <div className="row" style={{ gap: 0 }}><IconButton icon={ArrowUp} title="ขึ้น" disabled={i === 0} onClick={() => move(i, -1)} /><IconButton icon={ArrowDown} title="ลง" disabled={i === rows.length - 1} onClick={() => move(i, 1)} /></div> : <span className="order-cell">{isHero && <Move size={16} />}{i + 1}</span>; } },
        { key: 'thumb', label: 'Thumbnail', render: (r) => <div className="thumb-cell" style={{ width: isHero ? 86 : 114, height: isHero ? 48 : 30 }}><img src={r.img} alt="" loading="lazy" /></div> },
        { key: 'name', label: 'Banner Name', render: (r) => <><Link className="t-link" style={{ fontWeight: 400 }} to={`/banner/${kind}/${r.id}`}>{r.name}</Link><div className="sub">{r.langs}</div></> },
        ...(isHero ? [] : [{ key: 'pos', label: 'ตำแหน่งแสดง', render: (r: BannerRow) => r.position }]),
        { key: 'period', label: 'Display Period', render: (r) => r.period },
        { key: 'status', label: 'Status', render: (r) => <Status status={r.status} /> },
        ...(isHero ? [{ key: 'by', label: 'Update By', render: (r: BannerRow) => r.by }] : []),
        { key: 'act', label: 'Action', render: (r) => <div className="row" style={{ gap: 2 }}><IconButton icon={Eye} title="ดูตัวอย่าง" onClick={() => openPreview({ title: r.name, type: 'Banner', path: '/th' })} /><IconButton icon={Pencil} title="แก้ไข" onClick={() => navigate(`/banner/${kind}/${r.id}`)} /><IconButton icon={Trash2} danger title="ลบ" onClick={() => setDel(r)} /></div> },
      ]}
    >
      <Modal open={!!del} onClose={() => setDel(null)} title="ย้ายแบนเนอร์ไป Recycle Bin?" footer={<><Button onClick={() => setDel(null)}>ยกเลิก</Button><Button variant="danger" onClick={() => { setRows(rows.filter((r) => r.id !== del?.id)); toast('ย้ายไป Recycle Bin แล้ว', del?.name); setDel(null); }}>ย้ายไป Recycle Bin</Button></>}>
        <p className="t-secondary">“{del?.name}” จะหยุดแสดงบนเว็บทันที และกู้คืนได้ภายใน 30 วัน</p>
      </Modal>
    </ListPage>
  );
}

/* NEW (ไม่มีใน Figma) — BN-01 สร้าง / แก้ไขแบนเนอร์ (ใช้ pattern เดียวกับ CMS-08) */
export function BannerForm({ kind }: { kind: BannerKind }) {
  const { id } = useParams();
  const row = [...HERO, ...PROMO].find((r) => r.id === id);
  const isHero = kind === 'hero';
  const label = isHero ? 'Hero Banner' : 'Promotion Banner';
  return (
    <ModuleForm
      key={`${kind}-${id ?? 'new'}`}
      back={`/banner/${kind}`}
      title={row ? `แก้ไขแบนเนอร์ · ${row.name}` : `สร้าง ${label}`}
      status={row?.status ?? 'Draft'}
      module="Banner"
      fields={[
        { key: 'name', label: 'ชื่อแบนเนอร์ (ภายใน)', type: 'text', required: true, shared: true },
        { key: 'headline', label: 'หัวข้อบนแบนเนอร์', type: 'text', required: true, hint: 'แสดงเป็นข้อความจริง ไม่ฝังในรูป (ดีต่อ SEO)' },
        { key: 'sub', label: 'ข้อความรอง', type: 'textarea', hint: '/ 120 ตัวอักษร' },
        { key: 'cta', label: 'ข้อความปุ่ม', type: 'text', span: 1 },
        { key: 'link', label: 'ลิงก์ปลายทาง (Path)', type: 'select', span: 1, shared: true, options: ['/th/personal/deposit/savings', '/th/personal/deposit/fixed-6m', '/th/promotion/retention', '/th/personal/loan/home-loan'] },
        ...(isHero ? [] : [{ key: 'pos', label: 'ตำแหน่งแสดง', type: 'select' as const, shared: true, options: [...new Set(PROMO.map((p) => p.position ?? ''))] }]),
      ]}
      initial={row ? { th: { name: row.name, headline: row.name, sub: 'เงื่อนไขเป็นไปตามที่ธนาคารกำหนด', cta: 'ดูรายละเอียด', pos: row.position ?? '' }, en: { headline: '', cta: 'Learn more' } } : {}}
      publishFields={[
        { key: 'start', label: 'วันที่เริ่มแสดง', type: 'datetime' },
        { key: 'end', label: 'วันที่สิ้นสุด', type: 'datetime' },
        { key: 'order', label: 'ลำดับการแสดงผล', type: 'select', options: ['1', '2', '3', '4', '5'] },
        { key: 'mobile', label: 'ใช้ภาพแยกสำหรับ Mobile', type: 'toggle', desc: 'แนะนำ 750×900 px' },
      ]}
      image={{ label: 'ภาพแบนเนอร์', hint: isHero ? 'ขนาด 1120×640 px · JPG/PNG/WebP · ไม่เกิน 500 KB · ห้ามฝังข้อความโปรโมชันในรูป' : 'ขนาด 1200×300 px · JPG/PNG/WebP · ไม่เกิน 300 KB', initial: row ? { name: `banner-${row.id}.jpg`, kind: 'image', src: row.img, alt: row.name } : null }}
    />
  );
}
