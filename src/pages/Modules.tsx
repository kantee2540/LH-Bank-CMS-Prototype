import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Eye, Pencil, Info, FileText, Upload, Image as ImageIcon, Home, Building2, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, IconButton, Modal, Status, Tabs, Toggle } from '../components/ui';
import ListPage, { selectFilter, textFilter } from '../components/ListPage';
import ModuleForm from '../components/ModuleForm';
import { useStore } from '../store';
import type { ContentStatus } from '../types';
import { PHOTOS } from '../data/photos';
import './pages.css';

function Thumb({ src, icon: Icon = ImageIcon }: { src?: string; icon?: LucideIcon }) {
  return (
    <div className="thumb-cell" style={{ background: src ? undefined : '#eef1f4', color: '#4d4d4f', width: 70, height: 42 }}>
      {src ? <img src={src} alt="" loading="lazy" /> : <Icon size={16} />}
    </div>
  );
}

function useDelete<T extends { id: string; title: string }>(rows: T[], setRows: (r: T[]) => void, label: string) {
  const { toast } = useStore();
  const [del, setDel] = useState<T | null>(null);
  const modal = (
    <Modal open={!!del} onClose={() => setDel(null)} title={`ย้าย${label}ไป Recycle Bin?`} footer={<><Button onClick={() => setDel(null)}>ยกเลิก</Button><Button variant="danger" onClick={() => { setRows(rows.filter((r) => r.id !== del?.id)); toast('ย้ายไป Recycle Bin แล้ว', del?.title); setDel(null); }}>ย้ายไป Recycle Bin</Button></>}>
      <p className="t-secondary">“{del?.title}” จะถูกนำออกจากหน้าเว็บ และกู้คืนได้ภายใน 30 วัน</p>
    </Modal>
  );
  return { setDel, modal };
}

function rowActions(onView: () => void, onEdit: () => void, onDel: () => void) {
  return <div className="row" style={{ gap: 2 }}><IconButton icon={Eye} title="ดูตัวอย่าง" onClick={onView} /><IconButton icon={Pencil} title="แก้ไข" onClick={onEdit} /><IconButton icon={Trash2} danger title="ลบ" onClick={onDel} /></div>;
}

/* ================= Advisory (CMS-16) ================= */
interface AdvisoryRow { id: string; title: string; sub: string; file: string | null; date: string; status: ContentStatus; type: string }
/* ภาพปก Weekly Report / บทความ (ตัวอย่างจาก lhbank.co.th) */
const ADV_IMG: Record<string, string> = { a1: PHOTOS.weeklyCreditHorizon, a2: PHOTOS.weeklyAmericanRoulette, a3: PHOTOS.advisoryWinnerLoser, a4: PHOTOS.advisoryReits, a6: PHOTOS.advisoryEsg };
const ADVISORY: AdvisoryRow[] = [
  { id: 'a1', title: 'Weekly Report: สรุปภาวะตลาดประจำสัปดาห์', sub: '27 ต.ค. 2569 · TH', file: 'weekly-20261027.pdf', date: '27/10/2026', status: 'Published', type: 'Weekly Report' },
  { id: 'a2', title: 'Weekly Report: มุมมองการลงทุนไตรมาส 4', sub: '20 ต.ค. 2569 · TH', file: 'weekly-20261020.pdf', date: '20/10/2026', status: 'Published', type: 'Weekly Report' },
  { id: 'a3', title: 'Weekly Report: ตลาดตราสารหนี้', sub: '13 ต.ค. 2569 · TH', file: 'weekly-20261013.pdf', date: '13/10/2026', status: 'Published', type: 'Weekly Report' },
  { id: 'a4', title: 'Weekly Report: 3 พ.ย. 2569', sub: 'TH', file: 'weekly-20261103.pdf', date: '03/11/2026', status: 'Scheduled', type: 'Weekly Report' },
  { id: 'a5', title: 'Weekly Report: (ร่าง)', sub: 'TH', file: null, date: '—', status: 'Draft', type: 'Weekly Report' },
  { id: 'a6', title: 'Monthly Outlook: พฤศจิกายน 2569', sub: 'TH · EN', file: 'monthly-202611.pdf', date: '01/11/2026', status: 'Published', type: 'Monthly Outlook' },
];
export function AdvisoryList() {
  const navigate = useNavigate();
  const { toast, trash } = useStore();
  const [rows, setRows] = useState(ADVISORY);
  const { setDel, modal } = useDelete(rows, setRows, 'รายงาน');
  return (
    <ListPage<AdvisoryRow>
      title="Advisory"
      filters={[textFilter('t', 'ชื่อบทความ / รายงาน', (r) => r.title), selectFilter('type', 'ประเภท', ['Weekly Report', 'Monthly Outlook'], (r) => r.type), selectFilter('s', 'Status', ['Published', 'Scheduled', 'Draft'], (r) => r.status)]}
      rows={rows}
      rowKey={(r) => r.id}
      toolbar={<><Button variant="primary" icon={Plus} onClick={() => navigate('/advisory/new')}>Create</Button><Link to="/trash" className="btn btn-secondary"><Trash2 strokeWidth={1.6} /> Recycle Bin ({trash.filter((t) => t.module === 'Advisory').length})</Link></>}
      toolbarRight={<span className="row t-secondary" style={{ gap: 8 }}><Info size={18} color="#1f6fa8" /> ตามแผน IV-07 แสดงเฉพาะ Weekly Report (List + ดาวน์โหลด PDF)</span>}
      columns={[
        { key: 'img', label: 'ภาพปก', render: (r) => <Thumb src={r.file ? ADV_IMG[r.id] : undefined} /> },
        { key: 't', label: 'ชื่อรายงาน', render: (r) => <><Link className="t-link" style={{ fontWeight: 400 }} to={`/advisory/${r.id}`}>{r.title}</Link><div className="sub">{r.sub}</div></> },
        { key: 'f', label: 'ไฟล์ PDF', render: (r) => r.file ? <span className="row" style={{ gap: 6, alignItems: 'flex-start' }}><FileText size={16} color="#e0625a" style={{ marginTop: 4 }} />{r.file}</span> : <span className="row t-secondary" style={{ gap: 6 }}><Upload size={16} /> ยังไม่อัปโหลด</span> },
        { key: 'd', label: 'วันที่เผยแพร่', render: (r) => r.date },
        { key: 's', label: 'Status', render: (r) => <Status status={r.status} /> },
        { key: 'a', label: 'Action', render: (r) => rowActions(() => toast('Preview', r.title), () => navigate(`/advisory/${r.id}`), () => setDel(r)) },
      ]}
    >{modal}</ListPage>
  );
}
/* NEW — AD-01 สร้าง / แก้ไขรายงาน Advisory */
export function AdvisoryForm() {
  const { id } = useParams();
  const r = ADVISORY.find((x) => x.id === id);
  return (
    <ModuleForm
      key={id ?? 'new'}
      back="/advisory" title={r ? `แก้ไขรายงาน · ${r.title}` : 'สร้างรายงาน Advisory'} status={r?.status} module="Advisory" langs={['th', 'en']}
      fields={[
        { key: 'title', label: 'ชื่อรายงาน', type: 'text', required: true },
        { key: 'type', label: 'ประเภท', type: 'select', span: 1, shared: true, options: ['Weekly Report', 'Monthly Outlook', 'Special Report'] },
        { key: 'author', label: 'ผู้เขียน / ทีมวิเคราะห์', type: 'text', span: 1, shared: true },
        { key: 'summary', label: 'สรุปย่อ (แสดงบนการ์ด)', type: 'textarea', required: true, hint: '/ 200 ตัวอักษร' },
        { key: 'file', label: 'ไฟล์รายงาน PDF', type: 'file', required: true, shared: true },
      ]}
      initial={r ? { th: { title: r.title, type: r.type, author: 'ทีมวิเคราะห์การลงทุน LH Bank', summary: 'สรุปภาวะตลาดหุ้น ตราสารหนี้ และค่าเงินประจำสัปดาห์', file: r.file ?? '' } } : {}}
      publishFields={[{ key: 'date', label: 'วันที่เผยแพร่', type: 'datetime' }, { key: 'pin', label: 'แสดงบนหน้า Advisory เป็นรายการแรก', type: 'toggle' }]}
      image={{ label: 'ภาพปก', hint: 'ขนาด 800×450 px · JPG/PNG/WebP · ไม่เกิน 300 KB', initial: r?.file ? { name: `cover-${r.id}.jpg`, kind: 'image', src: ADV_IMG[r.id] } : null }}
    />
  );
}

/* ================= News (CMS-17) ================= */
interface NewsRow { id: string; title: string; langs: string; cat: string; pinned: boolean; date: string; status: ContentStatus; img: string }
const NEWS: NewsRow[] = [
  { id: 'n1', title: 'LH Bank SMART Money ให้ความรู้การเงินแก่นักศึกษา ม.ธรรมศาสตร์ ศูนย์รังสิต', langs: 'TH · EN', cat: 'กิจกรรม', pinned: true, date: '20/10/2026', status: 'Published', img: PHOTOS.newsMouChula },
  { id: 'n2', title: 'หัวข้อข่าว — รอเนื้อหาจากธนาคาร', langs: 'TH', cat: 'ข่าวธนาคาร', pinned: true, date: '15/10/2026', status: 'Published', img: PHOTOS.bannerVision },
  { id: 'n3', title: 'หัวข้อข่าว — รอเนื้อหาจากธนาคาร', langs: 'TH', cat: 'ประกาศ', pinned: true, date: '28/09/2026', status: 'Published', img: PHOTOS.bannerIpo },
  { id: 'n4', title: 'ESG Day 2569', langs: 'TH · EN', cat: 'ESG / CSR', pinned: false, date: '05/11/2026', status: 'Scheduled', img: PHOTOS.advisoryEsg },
  { id: 'n5', title: '(ร่าง) ข่าวประชาสัมพันธ์', langs: 'TH', cat: 'ข่าวธนาคาร', pinned: false, date: '—', status: 'Draft', img: PHOTOS.branch },
];
const NEWS_CATS = ['ข่าวธนาคาร', 'กิจกรรม', 'ประกาศ', 'ESG / CSR'];
export function NewsList() {
  const navigate = useNavigate();
  const { toast, trash } = useStore();
  const [rows, setRows] = useState(NEWS);
  const [cat, setCat] = useState('all');
  const { setDel, modal } = useDelete(rows, setRows, 'ข่าว');
  const pinned = rows.filter((r) => r.pinned).length;
  return (
    <ListPage<NewsRow>
      title="News"
      filters={[textFilter('t', 'หัวข้อข่าว', (r) => r.title), selectFilter('c', 'หมวด', NEWS_CATS, (r) => r.cat), selectFilter('s', 'Status', ['Published', 'Scheduled', 'Draft'], (r) => r.status), { key: 'y', label: 'ปี', kind: 'select', options: ['2569', '2568'], match: () => true }]}
      rows={rows.filter((r) => cat === 'all' || r.cat === cat)}
      rowKey={(r) => r.id}
      above={<Tabs value={cat} onChange={setCat} style={{ marginBottom: 16, marginTop: -8 }} tabs={[{ value: 'all', label: 'ทั้งหมด' }, ...NEWS_CATS.map((c) => ({ value: c, label: c }))]} />}
      toolbar={<><Button variant="primary" icon={Plus} onClick={() => navigate('/news/new')}>Create</Button><Link to="/trash" className="btn btn-secondary"><Trash2 strokeWidth={1.6} /> Recycle Bin ({trash.filter((t) => t.module === 'News').length})</Link></>}
      toolbarRight={<span className="row t-secondary" style={{ gap: 8 }}><Info size={18} color="#1f6fa8" /> 3 ข่าวล่าสุดที่ปักหมุดจะแสดงบนหน้าแรก ({pinned}/3)</span>}
      columns={[
        { key: 'img', label: 'ภาพปก', render: (r) => <Thumb src={r.img} /> },
        { key: 't', label: 'หัวข้อข่าว', width: 260, render: (r) => <><Link className="t-link" style={{ fontWeight: 400 }} to={`/news/${r.id}`}>{r.title}</Link><div className="sub">{r.langs}</div></> },
        { key: 'c', label: 'หมวด', render: (r) => <span className="tag">{r.cat}</span> },
        { key: 'p', label: 'ปักหมุดหน้าแรก', align: 'center', render: (r) => <Toggle checked={r.pinned} onChange={(v) => { if (v && pinned >= 3) { toast('ปักหมุดได้สูงสุด 3 ข่าว', 'เลิกปักหมุดข่าวอื่นก่อน'); return; } setRows(rows.map((x) => (x.id === r.id ? { ...x, pinned: v } : x))); }} /> },
        { key: 'd', label: 'วันที่เผยแพร่', render: (r) => r.date },
        { key: 's', label: 'Status', render: (r) => <Status status={r.status} /> },
        { key: 'a', label: 'Action', render: (r) => rowActions(() => toast('Preview', r.title), () => navigate(`/news/${r.id}`), () => setDel(r)) },
      ]}
    >{modal}</ListPage>
  );
}
/* NEW — NW-01 สร้าง / แก้ไขข่าว */
export function NewsForm() {
  const { id } = useParams();
  const r = NEWS.find((x) => x.id === id);
  return (
    <ModuleForm
      key={id ?? 'new'}
      back="/news" title={r ? `แก้ไขข่าว · ${r.title}` : 'สร้างข่าวใหม่'} status={r?.status} module="News"
      fields={[
        { key: 'title', label: 'หัวข้อข่าว', type: 'text', required: true },
        { key: 'cat', label: 'หมวด', type: 'select', span: 1, shared: true, options: NEWS_CATS },
        { key: 'slug', label: 'Slug', type: 'text', span: 1, shared: true, placeholder: 'news-title' },
        { key: 'excerpt', label: 'คำโปรย', type: 'textarea', required: true, hint: '/ 160 ตัวอักษร' },
        { key: 'body', label: 'เนื้อหาข่าว', type: 'rich', required: true },
      ]}
      initial={r ? { th: { title: r.title, cat: r.cat, slug: `news-${r.id}`, excerpt: 'LH Bank จัดกิจกรรมให้ความรู้ด้านการเงินแก่นักศึกษา', body: 'รายละเอียดข่าว...' } } : {}}
      publishFields={[{ key: 'date', label: 'วันที่เผยแพร่', type: 'datetime' }, { key: 'pin', label: 'ปักหมุดหน้าแรก', type: 'toggle', desc: 'สูงสุด 3 ข่าว' }, { key: 'schema', label: 'Schema', type: 'select', options: ['NewsArticle (อัตโนมัติ)', 'Event'] }]}
      image={{ label: 'ภาพปก', hint: 'ขนาด 1200×630 px · ใช้เป็น OG Image ด้วย', initial: r ? { name: `news-${r.id}.jpg`, kind: 'image', src: r.img } : null }}
    />
  );
}

/* ================= NPA (CMS-18) ================= */
interface NpaRow { id: string; title: string; code: string; size: string; type: string; prov: string; price: string; special?: string; status: ContentStatus; img: string; icon: LucideIcon }
const NPA: NpaRow[] = [
  { id: 'npa-0101', title: 'บ้านเดี่ยว 2 ชั้น', code: 'NPA-0101', size: '52 ตร.วา', type: 'บ้านเดี่ยว', prov: 'กรุงเทพฯ', price: 'x,xxx,xxx', special: 'x,xxx,xxx', status: 'Published', img: PHOTOS.npaHouse, icon: Home },
  { id: 'npa-0102', title: 'คอนโดใกล้รถไฟฟ้า', code: 'NPA-0102', size: '32 ตร.ม.', type: 'คอนโด', prov: 'นนทบุรี', price: 'x,xxx,xxx', special: 'x,xxx,xxx', status: 'Published', img: PHOTOS.npaCondo, icon: Building2 },
  { id: 'npa-0103', title: 'ทาวน์โฮม 3 ชั้น', code: 'NPA-0103', size: '21 ตร.วา', type: 'ทาวน์โฮม', prov: 'ปทุมธานี', price: 'x,xxx,xxx', status: 'Published', img: PHOTOS.npaTownhome, icon: Home },
  { id: 'npa-0104', title: 'ที่ดินเปล่า', code: 'NPA-0104', size: '1-2-50 ไร่', type: 'ที่ดิน', prov: 'ชลบุรี', price: 'xx,xxx,xxx', special: 'x,xxx,xxx', status: 'Scheduled', img: PHOTOS.npaLand, icon: MapPin },
  { id: 'npa-0012', title: 'อาคารพาณิชย์', code: 'NPA-0012', size: 'ขายแล้ว', type: 'อาคารพาณิชย์', prov: 'เชียงใหม่', price: 'x,xxx,xxx', status: 'Expired', img: PHOTOS.npaShophouse, icon: Building2 },
];
const BOOKINGS = [
  ['30/10/2026 10:12', 'คุณ ส***** ม*****', '08x-xxx-x221', 'NPA-0102 คอนโดใกล้รถไฟฟ้า', 'ใหม่'],
  ['29/10/2026 15:40', 'คุณ ว***** ท*****', '09x-xxx-x118', 'NPA-0101 บ้านเดี่ยว 2 ชั้น', 'นัดชมทรัพย์'],
  ['28/10/2026 09:05', 'คุณ อ***** ร*****', '06x-xxx-x903', 'NPA-0104 ที่ดินเปล่า', 'ติดต่อแล้ว'],
];
export function NpaList() {
  const navigate = useNavigate();
  const { toast, trash } = useStore();
  const [rows, setRows] = useState(NPA);
  const [tab, setTab] = useState<'assets' | 'bookings'>('assets');
  const { setDel, modal } = useDelete(rows, setRows, 'ทรัพย์');
  const tabs = <Tabs value={tab} onChange={setTab} style={{ marginBottom: 16, marginTop: -8 }} tabs={[{ value: 'assets', label: `ทรัพย์ทั้งหมด (${rows.length})` }, { value: 'bookings', label: `รายการจองซื้อ (${BOOKINGS.length})` }]} />;
  if (tab === 'bookings') {
    return (
      <ListPage<(typeof BOOKINGS)[number]>
        title="NPA" rows={BOOKINGS} rowKey={(r) => r[0]} above={tabs}
        toolbarRight={<span className="row t-secondary" style={{ gap: 8 }}><Info size={18} color="#1f6fa8" /> ข้อมูลส่วนบุคคล · บันทึกการเข้าดูใน Audit Log</span>}
        toolbar={<Button icon={Upload}>Export Excel</Button>}
        columns={[{ key: 'd', label: 'วันที่จอง', render: (r) => r[0] }, { key: 'n', label: 'ชื่อ - นามสกุล', render: (r) => <b style={{ fontWeight: 500 }}>{r[1]}</b> }, { key: 'p', label: 'เบอร์โทร', render: (r) => r[2] }, { key: 'a', label: 'ทรัพย์', render: (r) => r[3] }, { key: 's', label: 'สถานะ', render: (r) => <span className={`lead-st ${r[4] === 'ใหม่' ? 'new' : r[4] === 'ติดต่อแล้ว' ? 'done' : 'doing'}`}>{r[4]}</span> }]}
      />
    );
  }
  return (
    <ListPage<NpaRow>
      title="NPA"
      filters={[textFilter('t', 'รหัสทรัพย์ / ชื่อโครงการ', (r) => `${r.code} ${r.title}`), selectFilter('type', 'ประเภททรัพย์', [...new Set(NPA.map((n) => n.type))], (r) => r.type), selectFilter('prov', 'จังหวัด', [...new Set(NPA.map((n) => n.prov))], (r) => r.prov), { key: 'sp', label: 'ราคาพิเศษ', kind: 'select', options: ['All', 'มีราคาพิเศษ', 'ราคาปกติ'], match: (r, v) => (v === 'มีราคาพิเศษ' ? !!r.special : !r.special) }]}
      rows={rows} rowKey={(r) => r.id} above={tabs}
      toolbar={<><Button variant="primary" icon={Plus} onClick={() => navigate('/npa/new')}>Create</Button><Button icon={Upload}>Import Excel</Button><Link to="/trash" className="btn btn-secondary"><Trash2 strokeWidth={1.6} /> Recycle Bin ({trash.filter((t) => t.module === 'NPA').length})</Link></>}
      toolbarRight={<span className="row t-secondary" style={{ gap: 8 }}><Info size={18} color="#1f6fa8" /> การ์ดบนเว็บแสดง 2 ราคา: ราคาปกติขีดฆ่า + ราคาพิเศษ</span>}
      columns={[
        { key: 'img', label: 'ภาพ', render: (r) => <Thumb src={r.img} icon={r.icon} /> },
        { key: 't', label: 'ทรัพย์', render: (r) => <><Link className="t-link" style={{ fontWeight: 400 }} to={`/npa/${r.id}`}>{r.title}</Link><div className="sub">{r.code} · {r.size}</div></> },
        { key: 'ty', label: 'ประเภท', render: (r) => <span className="tag">{r.type}</span> },
        { key: 'p', label: 'จังหวัด', render: (r) => r.prov },
        { key: 'pr', label: 'ราคา (บาท)', render: (r) => r.special ? <><s className="t-secondary">{r.price}</s><div style={{ color: '#e0625a' }}>{r.special}</div></> : r.price },
        { key: 's', label: 'Status', render: (r) => <Status status={r.status} /> },
        { key: 'a', label: 'Action', render: (r) => rowActions(() => toast('Preview', r.title), () => navigate(`/npa/${r.id}`), () => setDel(r)) },
      ]}
    >{modal}</ListPage>
  );
}
/* NEW — NP-01 สร้าง / แก้ไขทรัพย์ NPA */
export function NpaForm() {
  const { id } = useParams();
  const r = NPA.find((x) => x.id === id);
  return (
    <ModuleForm
      key={id ?? 'new'}
      back="/npa" title={r ? `แก้ไขทรัพย์ · ${r.code} ${r.title}` : 'เพิ่มทรัพย์ NPA'} status={r?.status} module="NPA" langs={['th', 'en']}
      fields={[
        { key: 'title', label: 'ชื่อทรัพย์ / โครงการ', type: 'text', required: true },
        { key: 'code', label: 'รหัสทรัพย์', type: 'text', span: 1, shared: true, required: true },
        { key: 'type', label: 'ประเภททรัพย์', type: 'select', span: 1, shared: true, options: ['บ้านเดี่ยว', 'คอนโด', 'ทาวน์โฮม', 'ที่ดิน', 'อาคารพาณิชย์'] },
        { key: 'size', label: 'ขนาด', type: 'text', span: 1, shared: true, placeholder: 'เช่น 52 ตร.วา' },
        { key: 'prov', label: 'จังหวัด', type: 'select', span: 1, shared: true, options: ['กรุงเทพฯ', 'นนทบุรี', 'ปทุมธานี', 'ชลบุรี', 'เชียงใหม่'] },
        { key: 'price', label: 'ราคาปกติ (บาท)', type: 'number', span: 1, shared: true, required: true },
        { key: 'special', label: 'ราคาพิเศษ (บาท)', type: 'number', span: 1, shared: true, hint: 'เว้นว่างถ้าไม่มี' },
        { key: 'map', label: 'พิกัด Google Maps', type: 'text', shared: true, placeholder: '13.7563, 100.5018' },
        { key: 'desc', label: 'รายละเอียดทรัพย์', type: 'rich' },
      ]}
      initial={r ? { th: { title: r.title, code: r.code, type: r.type, size: r.size, prov: r.prov, price: '3500000', special: r.special ? '2990000' : '', desc: 'รายละเอียดทรัพย์ สภาพ และสิ่งอำนวยความสะดวก' } } : {}}
      publishFields={[{ key: 'status', label: 'สถานะทรัพย์', type: 'select', options: ['พร้อมขาย', 'ติดจอง', 'ขายแล้ว'] }, { key: 'end', label: 'ราคาพิเศษถึงวันที่', type: 'date' }, { key: 'booking', label: 'เปิดรับจองซื้อออนไลน์', type: 'toggle' }]}
      image={{ label: 'ภาพทรัพย์ (ภาพหลัก)', hint: 'อัปโหลดได้สูงสุด 10 ภาพ · 1200×800 px · ภาพแรกใช้เป็นภาพปก', initial: r ? { name: `${r.code}.jpg`, kind: 'image', src: r.img } : null }}
    />
  );
}
