import { FileText, Image as ImageIcon } from 'lucide-react';
import logo from '../assets/figma/logo-lh-bank.svg';
import type { MediaItem } from '../types';

interface MediaThumbProps {
  item: Pick<MediaItem, 'kind' | 'hue'>;
  height?: number;
}

/* Media items are data-driven (uploaded by users), so the prototype renders tinted placeholders instead of real photos. */
export default function MediaThumb({ item, height = 92 }: MediaThumbProps) {
  if (item.kind === 'pdf') {
    return <div className="media-thumb" style={{ height }}><FileText size={30} strokeWidth={1.4} /></div>;
  }
  if (item.kind === 'logo') {
    return <div className="media-thumb" style={{ height, background: '#fff' }}><img src={logo} alt="" width="95" height="24" /></div>;
  }
  return (
    <div
      className="media-thumb"
      style={{ height, background: `linear-gradient(135deg, hsl(${item.hue ?? 210} 70% 82%), hsl(${(item.hue ?? 210) + 30} 60% 58%))`, color: 'rgba(255,255,255,.9)' }}
    >
      <ImageIcon size={28} strokeWidth={1.4} />
    </div>
  );
}
