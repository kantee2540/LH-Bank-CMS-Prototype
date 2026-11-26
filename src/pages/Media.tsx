import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Move, Trash2, Plus, Upload, Folder, Image as ImageIcon, MoreVertical, Lock, LayoutGrid, List, UploadCloud } from 'lucide-react';
import { Button, Field, Input, Select, Modal, PageHeader } from '../components/ui';
import MediaThumb from '../components/MediaThumb';
import { MEDIA, MEDIA_FOLDERS } from '../data/mock';
import { useStore } from '../store';
import type { MediaItem } from '../types';
import './pages.css';

interface UploadState {
  step: 1 | 2;
  file: string | null;
  alt: { th: string; en: string; zh: string };
  folder: string;
}

/* CMS-04 Media · MD-01…MD-04 upload flow */
export default function Media() {
  const { trash, toast } = useStore();
  const [items, setItems] = useState<MediaItem[]>(MEDIA);
  const [folder, setFolder] = useState('All files');
  const [nameQ, setNameQ] = useState('');
  const [typeQ, setTypeQ] = useState('All Type');
  const [applied, setApplied] = useState({ nameQ: '', typeQ: 'All Type' });
  const [folderQ, setFolderQ] = useState('');
  const [mine, setMine] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  const [upload, setUpload] = useState<UploadState | null>(null);

  const shown = items.filter(
    (m) =>
      (folder === 'All files' || (folder === 'Uncategorized' ? !m.folder : m.folder === folder)) &&
      (!applied.nameQ || m.name.includes(applied.nameQ)) &&
      (applied.typeQ === 'All Type' || (applied.typeQ === 'Image' ? m.kind !== 'pdf' : m.kind === 'pdf')) &&
      (!mine || m.mine),
  );
  const toggle = (n: string) => setSel((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  const mediaTrash = trash.filter((t) => t.group === 'Media').length;

  return (
    <>
      <PageHeader title="Media" />
      <form className="filter-bar filter-bar-3" style={{ gridTemplateColumns: '1fr 1fr auto 1fr' }} onSubmit={(e) => { e.preventDefault(); setApplied({ nameQ, typeQ }); }}>
        <Field label="File Name"><Input value={nameQ} onChange={(e) => setNameQ(e.target.value)} /></Field>
        <Field label="File Type"><Select value={typeQ} onChange={(e) => setTypeQ(e.target.value)} options={['All Type', 'Image', 'PDF']} /></Field>
        <Button variant="primary" icon={Search} type="submit">Search</Button>
      </form>
      <section className="card">
        <div className="row" style={{ justifyContent: 'flex-end', flexWrap: 'wrap', marginBottom: 16, gap: 10 }}>
          <Button icon={Move} disabled={!sel.length} onClick={() => toast(`ย้าย ${sel.length} ไฟล์แล้ว`)}>Move File</Button>
          <Button variant="danger" icon={Trash2} disabled={!sel.length} onClick={() => { setItems(items.filter((m) => !sel.includes(m.name))); toast(`ย้าย ${sel.length} ไฟล์ไป Recycle Bin`); setSel([]); }}>Delete File</Button>
          <Button icon={Plus} onClick={() => toast('สร้างโฟลเดอร์ใหม่', 'New Folder')}>New Folder</Button>
          <Button variant="primary" icon={Upload} onClick={() => setUpload({ step: 1, file: null, alt: { th: '', en: '', zh: '' }, folder: 'Promotion' })}>Upload</Button>
          <Link className="btn btn-secondary" to="/trash"><Trash2 strokeWidth={1.6} /> Recycle Bin ({mediaTrash})</Link>
        </div>
        <div className="media-layout">
          <aside className="folders">
            <b style={{ fontWeight: 500, padding: '0 0 6px' }}>Folders</b>
            <button className={`folder ${folder === 'All files' ? 'on' : ''}`} onClick={() => setFolder('All files')}><Folder size={18} /><span>All files</span></button>
            <button className={`folder ${folder === 'Uncategorized' ? 'on' : ''}`} onClick={() => setFolder('Uncategorized')}><ImageIcon size={18} /><span>Uncategorized</span></button>
            <input className="input" placeholder="Search Folder" value={folderQ} onChange={(e) => setFolderQ(e.target.value)} style={{ margin: '4px 0' }} />
            {MEDIA_FOLDERS.filter((f) => f.toLowerCase().includes(folderQ.toLowerCase())).map((f) => (
              <button key={f} className={`folder ${folder === f ? 'on' : ''}`} onClick={() => setFolder(f)}>
                <Folder size={18} color={folder === f ? '#fff' : '#e8b84a'} />
                <span>{f}</span>
                {f === 'Logo & Brand' ? <Lock size={14} /> : <MoreVertical size={16} />}
              </button>
            ))}
          </aside>
          <div>
            <div className="row-between" style={{ marginBottom: 10 }}>
              <div className="row" style={{ gap: 8 }}><b style={{ fontWeight: 500 }}>Files · {shown.length} ไฟล์</b><LayoutGrid size={16} color="#1f6fa8" /><List size={16} /></div>
              <label className="row" style={{ gap: 8, cursor: 'pointer' }}>
                <button type="button" className={`toggle ${mine ? 'on' : ''}`} onClick={() => setMine(!mine)} aria-pressed={mine} />
                My Files
              </label>
            </div>
            <div className="media-grid">
              {shown.map((m) => (
                <button key={m.name} className={`media-tile ${sel.includes(m.name) ? 'sel' : ''}`} onClick={() => toggle(m.name)}>
                  <MediaThumb item={m} />
                  <div className="media-name">
                    <span className="dot" style={{ background: m.error ? '#e0625a' : m.warn ? '#e8b84a' : '#5ab4b8' }} />
                    <span style={{ flex: 1 }}>{m.name}</span>
                    <MoreVertical size={16} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MD-02 / MD-03 Upload */}
      <Modal
        open={!!upload}
        onClose={() => setUpload(null)}
        width={upload?.step === 2 ? 1040 : 820}
        title={upload?.step === 1 ? 'อัปโหลดไฟล์ — ตรวจชนิดและขนาด' : 'ใส่รายละเอียดไฟล์ — Alt text 3 ภาษา'}
        footer={
          upload && <>
            <Button onClick={() => (upload.step === 2 ? setUpload({ ...upload, step: 1 }) : setUpload(null))}>{upload.step === 2 ? 'ย้อนกลับ' : 'ยกเลิก'}</Button>
            {upload.step === 1 ? (
              <Button variant="primary" disabled={!upload.file} onClick={() => setUpload({ ...upload, step: 2 })}>ถัดไป</Button>
            ) : (
              <Button variant="primary" disabled={!upload.alt.th} onClick={() => {
                const file = upload.file;
                if (!file) return;
                setItems([{ name: file, folder: upload.folder, kind: file.endsWith('.pdf') ? 'pdf' : 'image', hue: 210, mine: true }, ...items]);
                toast('อัปโหลดสำเร็จ — พร้อมเลือกใช้', `${file} · สแกนไวรัสผ่าน`);
                setUpload(null);
              }}>อัปโหลด</Button>
            )}
          </>
        }
      >
        {upload?.step === 1 && (
          <>
            <label className="dropzone" style={{ cursor: 'pointer' }}>
              <UploadCloud size={40} strokeWidth={1.4} />
              <b>{upload.file || 'ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์'}</b>
              <span className="t-sm">รองรับ JPG / PNG / WebP / SVG ไม่เกิน 2 MB · PDF ไม่เกิน 10 MB · ระบบสแกนไวรัสทุกไฟล์</span>
              <input type="file" hidden onChange={(e) => setUpload({ ...upload, file: e.target.files?.[0]?.name || null })} />
            </label>
            <Field label="เก็บในโฟลเดอร์"><Select value={upload.folder} onChange={(e) => setUpload({ ...upload, folder: e.target.value })} options={MEDIA_FOLDERS.filter((f) => f !== 'Logo & Brand')} /></Field>
          </>
        )}
        {upload?.step === 2 && (
          <div className="row" style={{ alignItems: 'flex-start', gap: 20 }}>
            <div style={{ width: 240, flex: 'none' }}>
              <MediaThumb item={{ kind: 'image', name: upload.file ?? '' }} height={150} />
              <p className="t-sm mt-8">{upload.file}</p>
            </div>
            <div className="col grow">
              <Field label="Alt text (TH)" required><Input value={upload.alt.th} onChange={(e) => setUpload({ ...upload, alt: { ...upload.alt, th: e.target.value } })} /></Field>
              <Field label="Alt text (EN)"><Input value={upload.alt.en} onChange={(e) => setUpload({ ...upload, alt: { ...upload.alt, en: e.target.value } })} /></Field>
              <Field label="Alt text (中文)"><Input value={upload.alt.zh} onChange={(e) => setUpload({ ...upload, alt: { ...upload.alt, zh: e.target.value } })} /></Field>
              <p className="t-sm t-tertiary">Alt text ช่วยให้ Search Engine และผู้พิการทางสายตาเข้าใจรูป — ห้ามใช้รูปที่ฝังข้อความแทนการพิมพ์</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
