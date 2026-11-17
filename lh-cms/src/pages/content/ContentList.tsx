import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Info, Eye, Pencil, Search } from 'lucide-react';
import { Button, Field, Input, Select, Status, IconButton, Modal, PageHeader, Pager } from '../../components/ui';
import { useStore } from '../../store';
import type { ContentItem } from '../../types';
import '../pages.css';

const TYPES = ['All', 'Page', 'Promotion', 'Advisory', 'Product', 'News', 'NPA'];
const STATUSES = ['All', 'Published', 'Scheduled', 'Draft', 'Expired', 'Rejected'];

/* CS-03 — เลือกประเภทเนื้อหา */
function CreateTypeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [type, setType] = useState('Promotion');
  const cards = [
    ['Page', 'หน้าเนื้อหาทั่วไป'],
    ['Promotion', 'โปรโมชัน / แคมเปญ'],
    ['Advisory', 'บทความ / บทวิเคราะห์'],
  ];
  const modules = [['Products', '/products/loan'], ['News', '/news'], ['FAQ', '/faq'], ['NPA', '/npa'], ['Rates', '/rates/interest']];
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={640}
      title="สร้างเนื้อหาใหม่ — เลือกประเภท"
      footer={
        <>
          <Button onClick={onClose}>ยกเลิก</Button>
          <Button variant="primary" onClick={() => navigate(`/content/new?type=${type}`)}>ถัดไป</Button>
        </>
      }
    >
      <p className="t-secondary" style={{ marginTop: -6 }}>สร้างใน Manage Content</p>
      <div className="type-cards">
        {cards.map(([t, d]) => (
          <button key={t} className={`type-card ${type === t ? 'on' : ''}`} onClick={() => setType(t)}>
            <span className="t-body-l">{t}</span>
            <span className="t-secondary">{d}</span>
          </button>
        ))}
      </div>
      <p style={{ fontWeight: 500 }}>ข้อมูลเฉพาะโมดูล — ไปกรอกที่เมนูของโมดูล</p>
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        {modules.map(([m, to]) => (
          <Link key={m} to={to} className="tag tag-blue">{m} →</Link>
        ))}
      </div>
      <Field label="ภาษาที่จะกรอก">
        <Select options={['TH · EN · 中文 (ตามที่เปิดใช้ใน Setting)', 'TH · EN', 'TH']} />
      </Field>
    </Modal>
  );
}

export default function ContentList() {
  const { contents, trash, moveContentToTrash, toast } = useStore();
  const [draft, setDraft] = useState({ q: '', type: 'All', status: 'All', lang: 'All' });
  const [filter, setFilter] = useState(draft);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<ContentItem | null>(null);

  const list = useMemo(
    () =>
      contents.filter(
        (c) =>
          (!filter.q || c.title.toLowerCase().includes(filter.q.toLowerCase())) &&
          (filter.type === 'All' || c.type === filter.type) &&
          (filter.status === 'All' || c.status === filter.status) &&
          (filter.lang === 'All' || c.langs.includes(filter.lang)),
      ),
    [contents, filter],
  );
  const pages = Math.max(1, Math.ceil(list.length / rows));
  const shown = list.slice((page - 1) * rows, page * rows);
  const contentTrash = trash.filter((t) => t.group === 'Content').length;

  return (
    <>
      <PageHeader crumbs={[{ label: 'Manage Content' }]} title="Manage Content" />

      <form
        className="filter-bar"
        onSubmit={(e) => {
          e.preventDefault();
          setFilter(draft);
          setPage(1);
        }}
      >
        <Field label="ชื่อเนื้อหา"><Input value={draft.q} onChange={(e) => setDraft({ ...draft, q: e.target.value })} /></Field>
        <Field label="Content Type"><Select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} options={TYPES} /></Field>
        <Field label="Status"><Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} options={STATUSES} /></Field>
        <Field label="Language"><Select value={draft.lang} onChange={(e) => setDraft({ ...draft, lang: e.target.value })} options={['All', 'TH', 'EN', '中文']} /></Field>
        <Button variant="primary" icon={Search} type="submit">Search</Button>
      </form>

      <section className="card">
        <div className="row-between" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
          <div className="row" style={{ gap: 10 }}>
            <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>Create</Button>
            <Link to="/trash" className="btn btn-secondary"><Trash2 strokeWidth={1.6} /> ถังขยะ ({contentTrash})</Link>
          </div>
          <span className="row t-secondary" style={{ gap: 8 }}><Info size={18} color="#1f6fa8" /> เนื้อหาทุกประเภทที่นำไปแสดงผ่าน Layout / Page Builder</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>ชื่อเนื้อหา</th><th>Content Type</th><th>Path</th><th>Status</th><th>Last Update</th><th>Action</th></tr>
            </thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.id}>
                  <td style={{ maxWidth: 240 }}>
                    <Link to={`/content/${c.id}`} className="t-link" style={{ fontWeight: 400 }}>{c.title}</Link>
                    <div className={c.rejected ? 't-danger' : ''} style={{ color: c.rejected ? '#e0625a' : undefined }}>
                      {c.langs}{c.rejected && ' · ส่งกลับโดย Auditor'}{c.pending && ' · รออนุมัติ'}
                    </div>
                  </td>
                  <td><span className="tag">{c.type}</span></td>
                  <td style={{ maxWidth: 240, overflowWrap: 'anywhere' }}>{c.path}</td>
                  <td><Status status={c.status} /></td>
                  <td style={{ whiteSpace: 'nowrap' }}>{c.updated}</td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      <IconButton icon={Eye} title="ดูตัวอย่าง" onClick={() => toast('เปิด Preview', c.title)} />
                      <Link to={`/content/${c.id}`}><IconButton icon={Pencil} title="แก้ไข" /></Link>
                      <IconButton icon={Trash2} danger title="ลบ" onClick={() => setToDelete(c)} />
                    </div>
                  </td>
                </tr>
              ))}
              {!shown.length && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }} className="t-tertiary">ไม่พบเนื้อหาที่ตรงกับเงื่อนไข</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="row-between mt-16" style={{ flexWrap: 'wrap' }}>
          <div className="row">
            <span>Show rows</span>
            <select className="select" style={{ width: 70, padding: '6px 30px 6px 10px', backgroundPosition: 'right 8px center' }} value={rows} onChange={(e) => { setRows(+e.target.value); setPage(1); }}>
              {[5, 10, 20].map((n) => <option key={n}>{n}</option>)}
            </select>
            <span>Show {list.length ? (page - 1) * rows + 1 : 0} - {Math.min(page * rows, list.length)} of {list.length}</span>
          </div>
          <Pager page={page} pages={pages} onChange={setPage} />
        </div>
      </section>

      <CreateTypeModal open={creating} onClose={() => setCreating(false)} />

      {/* TR-02 — ยืนยันย้ายไปถังขยะ */}
      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="ย้ายไปถังขยะ?"
        footer={
          <>
            <Button onClick={() => setToDelete(null)}>ยกเลิก</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!toDelete) return;
                moveContentToTrash(toDelete.id);
                toast('ย้ายไปถังขยะแล้ว', `${toDelete.title} · กู้คืนได้ภายใน 30 วัน`);
                setToDelete(null);
              }}
            >
              ย้ายไปถังขยะ
            </Button>
          </>
        }
      >
        <p className="t-secondary">
          “{toDelete?.title}” จะถูกนำออกจากหน้าเว็บและเก็บในถังขยะ 30 วัน ก่อนระบบลบถาวรอัตโนมัติ · กู้คืนได้จากเมนูถังขยะ
        </p>
      </Modal>
    </>
  );
}
