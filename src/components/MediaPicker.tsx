import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Modal, Button, Tabs, Input, Field } from './ui';
import MediaThumb from './MediaThumb';
import { MEDIA } from '../data/mock';
import type { MediaItem } from '../types';

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onPick: (item: MediaItem) => void;
  title?: string;
}

type PickerTab = 'library' | 'upload';

/* CS-04A Popup Media — เลือกจาก Library / CS-04B อัปโหลดใหม่ */
export default function MediaPicker({ open, onClose, onPick, title = 'เลือกรูป Hero' }: MediaPickerProps) {
  const [tab, setTab] = useState<PickerTab>('library');
  const [sel, setSel] = useState<MediaItem | null>(null);
  const [q, setQ] = useState('');
  const [file, setFile] = useState<string | null>(null);
  const [alt, setAlt] = useState({ th: '', en: '', zh: '' });
  const images = MEDIA.filter((m) => m.kind === 'image' && m.name.includes(q));

  const confirm = () => {
    if (tab === 'library' && sel) onPick({ ...sel, alt: 'เงินฝากประจำพิเศษ 6 เดือน' });
    if (tab === 'upload' && file) onPick({ name: file, kind: 'image', hue: 200, alt: alt.th });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={1000}
      title={title}
      footer={
        <>
          <Button onClick={onClose}>ยกเลิก</Button>
          <Button variant="primary" disabled={tab === 'library' ? !sel : !file || !alt.th} onClick={confirm}>ใช้รูปนี้</Button>
        </>
      }
    >
      <Tabs tabs={[{ value: 'library', label: 'เลือกจาก Library' }, { value: 'upload', label: 'อัปโหลดใหม่' }]} value={tab} onChange={setTab} />
      {tab === 'library' ? (
        <>
          <Input placeholder="ค้นหาชื่อไฟล์..." value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="media-grid">
            {images.map((m) => (
              <button key={m.name} className={`media-tile ${sel?.name === m.name ? 'sel' : ''}`} onClick={() => setSel(m)}>
                <MediaThumb item={m} />
                <div className="media-name">{m.name}</div>
              </button>
            ))}
          </div>
          <p className="t-tertiary t-sm">แนะนำ 1920×800 px · JPG / PNG / WebP · ไม่เกิน 2 MB · ระบบสแกนไวรัสทุกไฟล์</p>
        </>
      ) : (
        <>
          <label className="dropzone" style={{ cursor: 'pointer' }}>
            <UploadCloud size={36} strokeWidth={1.4} />
            <b>{file || 'ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์'}</b>
            <span className="t-sm">JPG / PNG / WebP · ไม่เกิน 2 MB</span>
            <input type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files?.[0]?.name || null)} />
          </label>
          <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <Field label="Alt text (TH)" required><Input value={alt.th} onChange={(e) => setAlt({ ...alt, th: e.target.value })} /></Field>
            <Field label="Alt text (EN)"><Input value={alt.en} onChange={(e) => setAlt({ ...alt, en: e.target.value })} /></Field>
            <Field label="Alt text (中文)"><Input value={alt.zh} onChange={(e) => setAlt({ ...alt, zh: e.target.value })} /></Field>
          </div>
        </>
      )}
    </Modal>
  );
}
