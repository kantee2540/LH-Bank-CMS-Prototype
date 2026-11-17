import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { findNavLabel, PLACEHOLDER_INFO } from '../layout/nav';
import './pages.css';

/* Modules designed in Figma but not yet built in this prototype phase */
export default function Placeholder() {
  const { pathname } = useLocation();
  const label = findNavLabel(pathname) || 'ไม่พบหน้า';
  const frames = PLACEHOLDER_INFO[pathname] || [];
  return (
    <>
      <PageHeader crumbs={[{ label }]} title={label} />
      <section className="card ph">
        <div className="ph-icon"><Construction size={30} strokeWidth={1.5} /></div>
        <h3 className="t-h3">อยู่ในแผนพัฒนา Prototype เฟสถัดไป</h3>
        <p className="t-secondary">หน้าจอนี้มีดีไซน์ใน Figma แล้ว และจะทำเป็น React ในเฟสถัดไป (ดูไฟล์ TASKS.md)</p>
        {frames.length > 0 && (
          <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {frames.map((f) => <span className="tag tag-blue" key={f}>{f}</span>)}
          </div>
        )}
      </section>
    </>
  );
}
