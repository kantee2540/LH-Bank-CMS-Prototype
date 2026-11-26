import { useState } from 'react';
import { Monitor, Smartphone, X } from 'lucide-react';
import logo from '../assets/figma/logo-lh-bank.svg';
import { PHOTOS, photoFor } from '../data/photos';
import './preview.css';

/* NEW — PV-01 Preview หน้าแยก (เปิดแท็บใหม่) · สลับ Desktop / Mobile */

export interface PreviewData {
  title: string;
  excerpt?: string;
  /** HTML จาก Rich text editor */
  body?: string;
  type?: string;
  path?: string;
  hero?: string;
  lang?: string;
}

const KEY = 'lh-cms-preview';

/** เก็บข้อมูลไว้ใน localStorage แล้วเปิดหน้า Preview ในแท็บใหม่ (ไม่ใส่เนื้อหาลง URL) */
export function openPreview(data: PreviewData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ไม่มี storage — หน้า Preview จะแสดงข้อมูลตัวอย่างแทน */
  }
  window.open(`${window.location.pathname}#/preview`, '_blank', 'noopener');
}

const FALLBACK: PreviewData = {
  title: 'ตัวอย่างหน้าเว็บไซต์',
  excerpt: 'ยังไม่มีข้อมูล Preview — กดปุ่ม Preview จากหน้าแก้ไขใน CMS อีกครั้ง',
  type: 'Page',
  path: '/th',
};

function readPreview(): PreviewData {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...FALLBACK, ...(JSON.parse(raw) as PreviewData) } : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

function SitePage({ d, mobile }: { d: PreviewData; mobile: boolean }) {
  return (
    <div className={`site ${mobile ? 'is-mobile' : ''}`}>
      <header className="site-head">
        <img src={logo} alt="LH Bank" height={mobile ? 24 : 30} />
        {mobile ? <span className="site-burger" aria-hidden>☰</span> : (
          <nav className="site-nav"><span>บุคคล</span><span>ธุรกิจ</span><span>ผลิตภัณฑ์</span><span>อัตราดอกเบี้ย</span><span>โปรโมชั่น</span><span className="site-lang">{(d.lang ?? 'th').toUpperCase()}</span></nav>
        )}
      </header>
      <div
        className="site-hero"
        style={{
          minHeight: mobile ? 180 : 320,
          backgroundImage: `linear-gradient(90deg, rgba(15,59,107,.88) 0%, rgba(15,59,107,.55) 55%, rgba(15,59,107,.1) 100%), url(${photoFor(d.hero || `${d.type} ${d.path}`)})`,
        }}
      >
        <div className="site-hero-text">
          {d.type && <span className="site-chip">{d.type}</span>}
          <h1>{d.title || 'ไม่มีหัวข้อ'}</h1>
          {d.excerpt && <p>{d.excerpt.replace(/\{rate:[^}]+\}/g, '1.95%')}</p>}
          <button>ดูรายละเอียด</button>
        </div>
        {d.hero && <span className="site-hero-file">{d.hero}</span>}
      </div>
      <main className="site-body">
        {d.body
          ? <div className="site-rich" dangerouslySetInnerHTML={{ __html: d.body.replace(/\{rate:[^}]+\}/g, '1.95%') }} />
          : <p className="site-muted">ไม่มีเนื้อหา</p>}
        <div className="site-cards">{[PHOTOS.saving, PHOTOS.creditCard, PHOTOS.familyAdvisor].map((src, i) => <div key={src} className="site-card"><img src={src} alt="" loading="lazy" /><b>ผลิตภัณฑ์แนะนำ {i + 1}</b><span>รายละเอียดสั้น ๆ</span></div>)}</div>
      </main>
      <footer className="site-foot">© 2026 LH Bank · ข้อมูลตัวอย่างสำหรับ Preview เท่านั้น</footer>
    </div>
  );
}

export default function Preview() {
  const [d] = useState(readPreview);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const url = `lhbank.co.th${d.path ?? ''}`;
  return (
    <div className="pv">
      <div className="pv-bar">
        <div className="pv-title"><b>Preview</b><span>{d.title}</span><span className="pv-draft">ฉบับร่าง · ยังไม่เผยแพร่</span></div>
        <div className="pv-seg" role="tablist">
          <button role="tab" aria-selected={device === 'desktop'} className={device === 'desktop' ? 'on' : ''} onClick={() => setDevice('desktop')}><Monitor size={16} /> Desktop</button>
          <button role="tab" aria-selected={device === 'mobile'} className={device === 'mobile' ? 'on' : ''} onClick={() => setDevice('mobile')}><Smartphone size={16} /> Mobile</button>
        </div>
        <button className="pv-close" onClick={() => window.close()}><X size={16} /> ปิด Preview</button>
      </div>
      <div className="pv-stage">
        {device === 'desktop' ? (
          <div className="pv-desktop">
            <div className="pv-chrome"><i /><i /><i /><span>{url}</span></div>
            <div className="pv-screen"><SitePage d={d} mobile={false} /></div>
          </div>
        ) : (
          <div className="pv-mobile">
            <div className="pv-notch" />
            <div className="pv-screen"><SitePage d={d} mobile /></div>
          </div>
        )}
        <p className="pv-note">{device === 'desktop' ? 'Desktop · 1280px' : 'Mobile · 390 × 844'} · ค่า {'{rate:…}'} แสดงเป็นอัตราล่าสุดจาก Rates</p>
      </div>
    </div>
  );
}
