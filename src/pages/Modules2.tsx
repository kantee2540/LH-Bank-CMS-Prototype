import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Eye, Pencil, Info, RefreshCw, Move, ArrowUp, ArrowDown, Upload, FolderPlus, Copy, FileText, UploadCloud } from 'lucide-react';
import { Button, Field, Input, Select, IconButton, Modal, Status, Tabs } from '../components/ui';
import ListPage, { selectFilter, textFilter } from '../components/ListPage';
import ModuleForm from '../components/ModuleForm';
import { useStore } from '../store';
import type { ContentStatus } from '../types';
import './pages.css';

/* ================= FAQ (CMS-20) ================= */
interface FaqRow { id: string; q: string; langs: string; cat: string; pages: string; status: ContentStatus }
const FAQ_CATS = ['สินเชื่อบ้าน', 'สินเชื่อส่วนบุคคล', 'บัตรเครดิต', 'การลงทุน', 'ดิจิทัลแบงก์กิ้ง'];
const FAQS: FaqRow[] = [
  { id: 'f1', q: 'รีไฟแนนซ์บ้านต้องใช้เอกสารอะไรบ้าง?', langs: 'TH · EN', cat: 'สินเชื่อบ้าน', pages: 'HL-02 รีไฟแนนซ์บ้าน', status: 'Published' },
  { id: 'f2', q: 'ผ่อนบ้านมาแล้วกี่ปีจึงรีไฟแนนซ์ได้?', langs: 'TH · EN', cat: 'สินเชื่อบ้าน', pages: 'HL-01, HL-02', status: 'Published' },
  { id: 'f3', q: 'สินเชื่อส่วนบุคคลอนุมัติภายในกี่วัน?', langs: 'TH', cat: 'สินเชื่อส่วนบุคคล', pages: 'PL-01, PL-02', status: 'Published' },
  { id: 'f4', q: 'ชาวต่างชาติสมัครบัตรเครดิตได้หรือไม่?', langs: 'TH · EN', cat: 'บัตรเครดิต', pages: 'CC-02 Foreigner Signature', status: 'Published' },
  { id: 'f5', q: 'แจ้งใช้สิทธิลดหย่อนภาษี SSF / RMF อย่างไร?', langs: 'TH', cat: 'การลงทุน', pages: 'IV-02 กองทุนรวม', status: 'Draft' },
  { id: 'f6', q: 'ลืมรหัสผ่านแอป LHB You ต้องทำอย่างไร?', langs: 'TH · EN · 中文', cat: 'ดิจิทัลแบงก์กิ้ง', pages: 'DG-01 LHB You', status: 'Published' },
];
export function FaqList() {
  const navigate = useNavigate();
  const { toast, trash } = useStore();
  const [rows, setRows] = useState(FAQS);
  const [cat, setCat] = useState('all');
  const [ordering, setOrdering] = useState(false);
  const [del, setDel] = useState<FaqRow | null>(null);
  const move = (r: FaqRow, d: -1 | 1) => { const i = rows.indexOf(r); const j = i + d; if (j < 0 || j >= rows.length) return; const c = [...rows]; [c[i], c[j]] = [c[j], c[i]]; setRows(c); };
  return (
    <ListPage<FaqRow>
      crumbs={[{ label: 'FAQ' }]} title="FAQ"
      filters={[textFilter('q', 'คำถาม', (r) => r.q), selectFilter('c', 'หมวด', FAQ_CATS, (r) => r.cat), selectFilter('s', 'Status', ['Published', 'Draft'], (r) => r.status)]}
      rows={rows.filter((r) => cat === 'all' || r.cat === cat)} rowKey={(r) => r.id}
      above={<Tabs value={cat} onChange={setCat} style={{ marginBottom: 16, marginTop: -8 }} tabs={[{ value: 'all', label: 'ทั้งหมด' }, ...FAQ_CATS.map((c) => ({ value: c, label: c }))]} />}
      toolbar={<>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/faq/new')}>Create</Button>
        <Button icon={RefreshCw} variant={ordering ? 'primary' : 'secondary'} onClick={() => { if (ordering) toast('บันทึกลำดับแล้ว'); setOrdering(!ordering); }}>{ordering ? 'บันทึกลำดับ' : 'Move Order'}</Button>
        <Link to="/trash" className="btn btn-secondary"><Trash2 strokeWidth={1.6} /> ถังขยะ ({trash.filter((t) => t.module === 'FAQ').length})</Link>
      </>}
      toolbarRight={<span className="row t-secondary" style={{ gap: 8 }}><Info size={18} color="#1f6fa8" /> FAQ ผูกกับหน้าผลิตภัณฑ์ และสร้าง FAQPage Schema ให้ SEO / AI Search อัตโนมัติ</span>}
      columns={[
        { key: 'o', label: 'ลำดับ', render: (r) => ordering ? <div className="row" style={{ gap: 0 }}><IconButton icon={ArrowUp} title="ขึ้น" onClick={() => move(r, -1)} /><IconButton icon={ArrowDown} title="ลง" onClick={() => move(r, 1)} /></div> : <span className="order-cell"><Move size={16} />{rows.indexOf(r) + 1}</span> },
        { key: 'q', label: 'คำถาม', render: (r) => <><Link className="t-link" style={{ fontWeight: 400 }} to={`/faq/${r.id}`}>{r.q}</Link><div className="sub">{r.langs}</div></> },
        { key: 'c', label: 'หมวด', render: (r) => <span className="tag">{r.cat}</span> },
        { key: 'p', label: 'แสดงในหน้า', render: (r) => r.pages },
        { key: 's', label: 'Status', render: (r) => <Status status={r.status} /> },
        { key: 'a', label: 'Action', render: (r) => <div className="row" style={{ gap: 2 }}><IconButton icon={Eye} title="ดูตัวอย่าง" onClick={() => toast('Preview', r.q)} /><IconButton icon={Pencil} title="แก้ไข" onClick={() => navigate(`/faq/${r.id}`)} /><IconButton icon={Trash2} danger title="ลบ" onClick={() => setDel(r)} /></div> },
      ]}
    >
      <Modal open={!!del} onClose={() => setDel(null)} title="ย้ายคำถามไปถังขยะ?" footer={<><Button onClick={() => setDel(null)}>ยกเลิก</Button><Button variant="danger" onClick={() => { setRows(rows.filter((r) => r.id !== del?.id)); toast('ย้ายไปถังขยะแล้ว', del?.q); setDel(null); }}>ย้ายไปถังขยะ</Button></>}>
        <p className="t-secondary">“{del?.q}” จะถูกนำออกจากหน้า {del?.pages} และ FAQ Schema</p>
      </Modal>
    </ListPage>
  );
}
/* NEW — FQ-01 สร้าง / แก้ไขคำถาม */
export function FaqForm() {
  const { id } = useParams();
  const r = FAQS.find((x) => x.id === id);
  return (
    <ModuleForm
      key={id ?? 'new'}
      crumbs={[{ label: 'FAQ', to: '/faq' }, { label: r ? 'แก้ไขคำถาม' : 'เพิ่มคำถาม' }]}
      back="/faq" title={r ? 'แก้ไขคำถาม' : 'เพิ่มคำถามใหม่'} status={r?.status} module="FAQ"
      fields={[
        { key: 'q', label: 'คำถาม', type: 'text', required: true },
        { key: 'cat', label: 'หมวด', type: 'select', span: 1, shared: true, options: FAQ_CATS },
        { key: 'pages', label: 'แสดงในหน้าผลิตภัณฑ์', type: 'select', span: 1, shared: true, options: ['HL-02 รีไฟแนนซ์บ้าน', 'HL-01, HL-02', 'PL-01, PL-02', 'CC-02 Foreigner Signature', 'IV-02 กองทุนรวม', 'DG-01 LHB You'] },
        { key: 'a', label: 'คำตอบ', type: 'rich', required: true },
        { key: 'short', label: 'คำตอบสั้นสำหรับ AI Search', type: 'textarea', hint: '/ 300 ตัวอักษร · ใช้ใน FAQPage Schema' },
      ]}
      initial={r ? { th: { q: r.q, cat: r.cat, pages: r.pages, a: 'บัตรประชาชน ทะเบียนบ้าน สลิปเงินเดือนย้อนหลัง 3 เดือน และสัญญาเงินกู้เดิม', short: 'ใช้บัตรประชาชน ทะเบียนบ้าน สลิปเงินเดือน 3 เดือน และสัญญาเงินกู้เดิม' } } : {}}
      publishFields={[{ key: 'show', label: 'แสดงในหน้า FAQ รวม', type: 'toggle' }]}
      image={null}
    />
  );
}

/* ================= File Manager (CMS-21) ================= */
interface FileRow { id: string; name: string; cat: string; v: number; size: string; updated: string; status: ContentStatus; year: string }
const FILE_CATS = ['ประกาศอัตรา / ค่าธรรมเนียม', 'Fact Sheet กองทุน', 'รายงานความยั่งยืน', 'นโยบาย / ประกาศ', 'แบบฟอร์ม'];
const FILES: FileRow[] = [
  { id: 'd1', name: 'fee-schedule-2569.pdf', cat: 'ประกาศอัตรา / ค่าธรรมเนียม', v: 3, size: '1.2 MB', updated: '01/10/2026', status: 'Published', year: '2569' },
  { id: 'd2', name: 'fact-sheet-LHAI.pdf', cat: 'Fact Sheet กองทุน', v: 12, size: '860 KB', updated: '15/10/2026', status: 'Published', year: '2569' },
  { id: 'd3', name: 'fact-sheet-LHNUKZ.pdf', cat: 'Fact Sheet กองทุน', v: 8, size: '910 KB', updated: '15/10/2026', status: 'Published', year: '2569' },
  { id: 'd4', name: 'sustainability-report-2568.pdf', cat: 'รายงานความยั่งยืน', v: 1, size: '8.4 MB', updated: '30/04/2026', status: 'Published', year: '2568' },
  { id: 'd5', name: 'privacy-notice-th.pdf', cat: 'นโยบาย / ประกาศ', v: 5, size: '420 KB', updated: '01/09/2026', status: 'Published', year: '2569' },
  { id: 'd6', name: 'home-loan-application-form.pdf', cat: 'แบบฟอร์ม', v: 2, size: '300 KB', updated: '—', status: 'Draft', year: '2569' },
];
export function FileManager() {
  const { toast, trash } = useStore();
  const [rows, setRows] = useState(FILES);
  const [cat, setCat] = useState('all');
  const [upload, setUpload] = useState<{ row: FileRow | null; file: string | null; cat: string } | null>(null);
  const [del, setDel] = useState<FileRow | null>(null);
  const done = () => {
    if (!upload?.file) return;
    if (upload.row) {
      setRows(rows.map((r) => (r.id === upload.row?.id ? { ...r, v: r.v + 1, updated: 'วันนี้', status: 'Draft' } : r)));
      toast(`อัปโหลดเวอร์ชัน v${upload.row.v + 1} แล้ว`, `${upload.row.name} · URL เดิมไม่เปลี่ยน · รออนุมัติ`);
    } else {
      setRows([{ id: `d${Date.now()}`, name: upload.file, cat: upload.cat, v: 1, size: '—', updated: 'วันนี้', status: 'Draft', year: '2569' }, ...rows]);
      toast('อัปโหลดไฟล์แล้ว', upload.file);
    }
    setUpload(null);
  };
  return (
    <ListPage<FileRow>
      crumbs={[{ label: 'File Manager' }]} title="File Manager"
      filters={[textFilter('n', 'ชื่อไฟล์', (r) => r.name), selectFilter('c', 'หมวดเอกสาร', FILE_CATS, (r) => r.cat), selectFilter('y', 'ปี', ['2569', '2568'], (r) => r.year)]}
      rows={rows.filter((r) => cat === 'all' || r.cat === cat)} rowKey={(r) => r.id}
      above={<Tabs value={cat} onChange={setCat} style={{ marginBottom: 16, marginTop: -8 }} tabs={[{ value: 'all', label: 'ทั้งหมด' }, ...FILE_CATS.map((c) => ({ value: c, label: c }))]} />}
      toolbar={<>
        <Button variant="primary" icon={Upload} onClick={() => setUpload({ row: null, file: null, cat: FILE_CATS[0] })}>Upload</Button>
        <Button icon={FolderPlus} onClick={() => toast('สร้างโฟลเดอร์ใหม่')}>New Folder</Button>
        <Link to="/trash" className="btn btn-secondary"><Trash2 strokeWidth={1.6} /> ถังขยะ ({trash.filter((t) => t.module === 'File Manager').length})</Link>
      </>}
      toolbarRight={<span className="row t-secondary" style={{ gap: 8 }}><Info size={18} color="#1f6fa8" /> อัปโหลดเวอร์ชันใหม่ได้โดย URL เดิมไม่เปลี่ยน · เก็บประวัติทุกเวอร์ชัน</span>}
      columns={[
        { key: 'n', label: 'ไฟล์', render: (r) => <span className="row" style={{ gap: 8 }}><FileText size={16} color="#e0625a" /> {r.name}</span> },
        { key: 'c', label: 'หมวด', render: (r) => <span className="tag" style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.cat}</span> },
        { key: 'v', label: 'เวอร์ชัน', render: (r) => `v${r.v}` },
        { key: 's', label: 'ขนาด', render: (r) => r.size },
        { key: 'u', label: 'อัปเดต', render: (r) => r.updated },
        { key: 'st', label: 'Status', render: (r) => <Status status={r.status} /> },
        { key: 'a', label: 'Action', render: (r) => <div className="row" style={{ gap: 2 }}><IconButton icon={Copy} title="คัดลอก URL" onClick={() => { navigator.clipboard?.writeText(`https://media.lhbank.co.th/files/${r.name}`); toast('คัดลอก URL แล้ว', `…/files/${r.name}`); }} /><IconButton icon={Upload} title="อัปโหลดเวอร์ชันใหม่" onClick={() => setUpload({ row: r, file: null, cat: r.cat })} /><IconButton icon={Trash2} danger title="ลบ" onClick={() => setDel(r)} /></div> },
      ]}
    >
      <Modal open={!!upload} onClose={() => setUpload(null)} title={upload?.row ? `อัปโหลดเวอร์ชันใหม่ · ${upload.row.name}` : 'อัปโหลดเอกสาร'}
        footer={<><Button onClick={() => setUpload(null)}>ยกเลิก</Button><Button variant="primary" disabled={!upload?.file} onClick={done}>อัปโหลด</Button></>}>
        {upload && (
          <>
            <label className="dropzone" style={{ cursor: 'pointer' }}>
              <UploadCloud size={36} strokeWidth={1.4} />
              <b>{upload.file || 'เลือกไฟล์ PDF / DOCX / XLSX'}</b>
              <span className="t-sm">ไม่เกิน 20 MB · ระบบสแกนไวรัสทุกไฟล์</span>
              <input type="file" hidden onChange={(e) => setUpload({ ...upload, file: e.target.files?.[0]?.name ?? null })} />
            </label>
            {upload.row ? (
              <div className="info-soft t-sm">เวอร์ชันใหม่จะเป็น v{upload.row.v + 1} · URL https://media.lhbank.co.th/files/{upload.row.name} ไม่เปลี่ยน · v{upload.row.v} เก็บไว้ในประวัติ</div>
            ) : (
              <Field label="หมวดเอกสาร"><Select value={upload.cat} onChange={(e) => setUpload({ ...upload, cat: e.target.value })} options={FILE_CATS} /></Field>
            )}
            <Field label="หมายเหตุเวอร์ชัน"><Input placeholder="เช่น ปรับค่าธรรมเนียมโอนต่างธนาคาร" /></Field>
          </>
        )}
      </Modal>
      <Modal open={!!del} onClose={() => setDel(null)} title="ย้ายไฟล์ไปถังขยะ?" footer={<><Button onClick={() => setDel(null)}>ยกเลิก</Button><Button variant="danger" onClick={() => { setRows(rows.filter((r) => r.id !== del?.id)); toast('ย้ายไปถังขยะแล้ว', del?.name); setDel(null); }}>ย้ายไปถังขยะ</Button></>}>
        <p className="t-secondary">ลิงก์ดาวน์โหลด “{del?.name}” บนหน้าเว็บจะใช้งานไม่ได้จนกว่าจะกู้คืน</p>
      </Modal>
    </ListPage>
  );
}
