import { FileText } from 'lucide-react';
import logo from '../assets/figma/logo-lh-bank.svg';
import { photoFor } from '../data/photos';
import type { MediaItem } from '../types';

interface MediaThumbProps {
  item: Pick<MediaItem, 'kind'> & Partial<Pick<MediaItem, 'name' | 'src' | 'alt'>>;
  height?: number;
}

/* รูปใน Media Library — Prototype ใช้ภาพตัวอย่างจาก lhbank.co.th ตามชื่อไฟล์ (src/data/photos.ts) */
export default function MediaThumb({ item, height = 92 }: MediaThumbProps) {
  if (item.kind === 'pdf') {
    return <div className="media-thumb" style={{ height }}><FileText size={30} strokeWidth={1.4} /></div>;
  }
  if (item.kind === 'logo') {
    return <div className="media-thumb" style={{ height, background: '#fff' }}><img src={logo} alt="" width="95" height="24" /></div>;
  }
  return (
    <div className="media-thumb" style={{ height }}>
      <img className="media-photo" src={item.src ?? photoFor(item.name)} alt={item.alt ?? ''} loading="lazy" />
    </div>
  );
}
