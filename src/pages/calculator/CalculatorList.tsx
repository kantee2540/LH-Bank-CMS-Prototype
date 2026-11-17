import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Info, Eye, Pencil } from 'lucide-react';
import { Button, Status, Tabs, IconButton, PageHeader, InfoBanner } from '../../components/ui';
import { CALCULATORS } from '../../data/mock';
import { useStore } from '../../store';
import '../pages.css';

/* CMS-27 Calculator — รายการเครื่องมือคำนวณ */
export default function CalculatorList() {
  const { toast } = useStore();
  const [seg, setSeg] = useState('all');
  const list = CALCULATORS.filter((c) => seg === 'all' || c.seg === seg);
  return (
    <>
      <PageHeader title="เครื่องมือคำนวณ (Calculator)" />
      <InfoBanner title="สูตรคำนวณเชื่อมกับข้อมูลกลาง">
        ทุกเครื่องมือดึงอัตราดอกเบี้ยจากหน้า Rates อัตโนมัติ · การแก้ตัวแปร สูตร หรือเงื่อนไข ต้องทดสอบผ่านและได้รับอนุมัติจาก Auditor ก่อนเผยแพร่
      </InfoBanner>
      <section className="card">
        <Tabs
          value={seg}
          onChange={setSeg}
          tabs={[
            { value: 'all', label: `ทั้งหมด (${CALCULATORS.length})` },
            { value: 'personal', label: `ลูกค้าบุคคล (${CALCULATORS.filter((c) => c.seg === 'personal').length})` },
            { value: 'sme', label: `ลูกค้า SME (${CALCULATORS.filter((c) => c.seg === 'sme').length})` },
          ]}
        />
        <div className="row-between" style={{ margin: '16px 0' }}>
          <div className="row" style={{ gap: 10 }}>
            <Button variant="primary" icon={Plus} onClick={() => toast('เพิ่มเครื่องมือคำนวณ', 'เลือกแม่แบบสูตร PMT / PV / ดอกเบี้ยรับ')}>เพิ่มเครื่องมือคำนวณ</Button>
            <Button icon={RefreshCw} onClick={() => toast('ประวัติการแก้ไขสูตร', 'ดูได้ที่ Setting › Audit Log')}>ประวัติการแก้ไขสูตร</Button>
          </div>
          <span className="row t-secondary" style={{ gap: 8 }}><Info size={18} /> อัตราอ้างอิงล่าสุด มีผลตั้งแต่ 01/10/2026</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>เครื่องมือคำนวณ</th><th>ประเภทสูตร</th><th>อัตราอ้างอิงจาก Rates</th><th>เวอร์ชัน</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/rates/calculator/${c.id}`} className="t-link" style={{ fontWeight: 400 }}>{c.name}</Link>
                    <div className="sub">{c.path}</div>
                  </td>
                  <td>{c.formula}</td>
                  <td>{c.ref}</td>
                  <td>{c.v}</td>
                  <td><Status status={c.status} /></td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      <IconButton icon={Eye} title="ดูตัวอย่าง" onClick={() => toast('เปิด Preview', c.name)} />
                      <Link to={`/rates/calculator/${c.id}`}><IconButton icon={Pencil} title="แก้ไขสูตร" /></Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-16 t-secondary">แสดง 1 - {list.length} จาก {list.length} รายการ</p>
      </section>
    </>
  );
}
