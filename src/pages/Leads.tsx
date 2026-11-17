import { useState } from 'react';
import { Download, Settings, Eye, Pencil, ShieldCheck, Phone, Lock } from 'lucide-react';
import { Button, Field, Input, Select, Textarea, Tabs, Toggle, IconButton, Modal, Drawer } from '../components/ui';
import ListPage, { selectFilter, textFilter } from '../components/ListPage';
import { useStore } from '../store';
import './pages.css';

type LeadStatus = 'ใหม่' | 'กำลังติดต่อ' | 'ติดต่อแล้ว' | 'ไม่สำเร็จ';
type FormTab = 'drop' | 'npa' | 'rm' | 'news';
interface Lead { id: string; date: string; name: string; phone: string; product: string; status: LeadStatus; form: FormTab; note?: string }

const LEADS: Lead[] = [
  { id: 'l1', date: '30/10/2026 08:42', name: 'คุณ ก***** ส*****', phone: '08x-xxx-x123', product: 'สินเชื่อรีไฟแนนซ์บ้าน', status: 'ใหม่', form: 'drop' },
  { id: 'l2', date: '29/10/2026 19:10', name: 'คุณ ม***** ร*****', phone: '09x-xxx-x456', product: 'สินเชื่อส่วนบุคคล', status: 'กำลังติดต่อ', form: 'drop', note: 'โทรครั้งแรกไม่รับสาย นัดใหม่ 31/10' },
  { id: 'l3', date: '29/10/2026 11:25', name: 'คุณ ธ***** ว*****', phone: '06x-xxx-x789', product: 'กองทุนรวม', status: 'ติดต่อแล้ว', form: 'drop' },
  { id: 'l4', date: '28/10/2026 15:02', name: 'คุณ ป***** จ*****', phone: '08x-xxx-x012', product: 'หุ้นกู้ / Structured Notes', status: 'ติดต่อแล้ว', form: 'drop' },
  { id: 'l5', date: '27/10/2026 09:30', name: 'คุณ ศ***** ก*****', phone: '09x-xxx-x345', product: 'สินเชื่อบ้านใหม่', status: 'ไม่สำเร็จ', form: 'drop', note: 'รายได้ไม่ผ่านเกณฑ์' },
  { id: 'l6', date: '26/10/2026 13:10', name: 'คุณ น***** ท*****', phone: '08x-xxx-x678', product: 'NPA-0102 คอนโดใกล้รถไฟฟ้า', status: 'ใหม่', form: 'npa' },
  { id: 'l7', date: '25/10/2026 10:00', name: 'บริษัท ก***** จำกัด', phone: '02x-xxx-x900', product: 'Sustainability-linked Loan', status: 'กำลังติดต่อ', form: 'rm' },
  { id: 'l8', date: '24/10/2026 18:20', name: 'คุณ อ***** ส*****', phone: '—', product: 'จดหมายข่าวรายเดือน', status: 'ติดต่อแล้ว', form: 'news' },
];
const ST_CLASS: Record<LeadStatus, string> = { 'ใหม่': 'new', 'กำลังติดต่อ': 'doing', 'ติดต่อแล้ว': 'done', 'ไม่สำเร็จ': 'fail' };

/* CMS-19 Form — รายการติดต่อกลับ (+ NEW: FM-01 รายละเอียด Lead (Drawer), FM-02 ตั้งค่าฟอร์ม) */
export default function Leads() {
  const { toast } = useStore();
  const [rows, setRows] = useState(LEADS);
  const [tab, setTab] = useState<FormTab>('drop');
  const [detail, setDetail] = useState<Lead | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [settings, setSettings] = useState(false);
  const [fields, setFields] = useState({ email: true, time: true, branch: false, consent: true });
  const count = (s: LeadStatus) => rows.filter((r) => r.status === s && r.form === tab).length;
  const update = (patch: Partial<Lead>) => {
    if (!detail) return;
    const next = { ...detail, ...patch };
    setRows(rows.map((r) => (r.id === detail.id ? next : r)));
    setDetail(next);
  };

  return (
    <ListPage<Lead>
      key={tab}
      title="Form"
      filters={[textFilter('n', 'ชื่อ / เบอร์โทร', (r) => `${r.name} ${r.phone}`), selectFilter('p', 'ผลิตภัณฑ์ที่สนใจ', [...new Set(LEADS.map((l) => l.product))], (r) => r.product), selectFilter('s', 'สถานะการติดต่อ', ['ใหม่', 'กำลังติดต่อ', 'ติดต่อแล้ว', 'ไม่สำเร็จ'], (r) => r.status), { key: 'd', label: 'ช่วงวันที่', kind: 'select', options: ['01/10/2026 – 30/10/2026', '7 วันล่าสุด', 'ทั้งหมด'], match: () => true }]}
      banner={
        <div className="kpis">
          {(['ใหม่', 'กำลังติดต่อ', 'ติดต่อแล้ว', 'ไม่สำเร็จ'] as LeadStatus[]).map((s) => (
            <div className={`kpi lead-kpi ${ST_CLASS[s]}`} key={s}><div className="t-secondary">{s === 'ใหม่' ? 'รายการใหม่' : s}</div><div className="num">{count(s) + (tab === 'drop' ? ({ 'ใหม่': 17, 'กำลังติดต่อ': 8, 'ติดต่อแล้ว': 62, 'ไม่สำเร็จ': 4 } as const)[s] : 0)}</div></div>
          ))}
        </div>
      }
      rows={rows.filter((r) => r.form === tab)}
      rowKey={(r) => r.id}
      above={<Tabs value={tab} onChange={setTab} style={{ marginBottom: 16, marginTop: -8 }} tabs={[{ value: 'drop', label: 'Drop-lead Form' }, { value: 'npa', label: 'จองซื้อทรัพย์ NPA' }, { value: 'rm', label: 'ติดต่อ RM (Sustainability)' }, { value: 'news', label: 'สมัครรับข่าวสาร' }]} />}
      toolbar={<><Button icon={Download} onClick={() => toast('Export Excel', 'ไฟล์ถูกเข้ารหัส · บันทึกใน Audit Log')}>Export Excel</Button><Button icon={Settings} onClick={() => setSettings(true)}>ตั้งค่าฟอร์ม</Button></>}
      toolbarRight={<span className="row t-secondary" style={{ gap: 8 }}><ShieldCheck size={18} color="#1f6fa8" /> ข้อมูลส่วนบุคคล · แสดงเฉพาะผู้มีสิทธิ์ และบันทึกการเข้าดูใน Audit Log</span>}
      columns={[
        { key: 'd', label: 'วันที่ส่ง', render: (r) => <span style={{ whiteSpace: 'pre-line' }}>{r.date.replace(' ', '\n')}</span> },
        { key: 'n', label: 'ชื่อ - นามสกุล', render: (r) => <b style={{ fontWeight: 500 }}>{r.name}</b> },
        { key: 'p', label: 'เบอร์โทร', render: (r) => r.phone },
        { key: 'pr', label: 'ผลิตภัณฑ์ที่สนใจ', render: (r) => r.product },
        { key: 'pd', label: 'PDPA', align: 'center', render: () => <ShieldCheck size={18} color="#5ab4b8" /> },
        { key: 's', label: 'สถานะ', render: (r) => <span className={`lead-st ${ST_CLASS[r.status]}`}>{r.status}</span> },
        { key: 'a', label: 'Action', render: (r) => <div className="row" style={{ gap: 2 }}><IconButton icon={Eye} title="ดูรายละเอียด" onClick={() => { setDetail(r); setRevealed(false); }} /><IconButton icon={Pencil} title="อัปเดตสถานะ" onClick={() => { setDetail(r); setRevealed(false); }} /></div> },
      ]}
    >
      <Drawer open={!!detail} onClose={() => setDetail(null)} title="รายละเอียดการติดต่อ" footer={<><Button onClick={() => setDetail(null)}>ปิด</Button><Button variant="primary" onClick={() => { toast('บันทึกแล้ว', `${detail?.name} · ${detail?.status}`); setDetail(null); }}>บันทึก</Button></>}>
        {detail && (
          <>
            <div className="ready-box">
              <div className="row-between"><span className="t-secondary">ชื่อ</span><b>{revealed ? 'คุณกมล สุขใจ' : detail.name}</b></div>
              <div className="row-between"><span className="t-secondary">เบอร์โทร</span><b>{revealed ? '081-234-5123' : detail.phone}</b></div>
              <div className="row-between"><span className="t-secondary">อีเมล</span><b>{revealed ? 'kamon.s@example.com' : 'k****@e******.com'}</b></div>
              <div className="row-between"><span className="t-secondary">ผลิตภัณฑ์</span><b>{detail.product}</b></div>
              <div className="row-between"><span className="t-secondary">เวลาที่สะดวก</span><b>18:00 – 20:00</b></div>
              <div className="row-between"><span className="t-secondary">ยินยอม PDPA</span><b className="row" style={{ gap: 4 }}><ShieldCheck size={16} color="#1a9a8a" /> {detail.date}</b></div>
            </div>
            {!revealed ? <Button icon={Lock} onClick={() => { setRevealed(true); toast('เปิดดูข้อมูลเต็ม', 'บันทึกการเข้าดูใน Audit Log แล้ว'); }}>แสดงข้อมูลเต็ม (บันทึกใน Audit Log)</Button> : <Button icon={Phone} variant="primary">โทร 081-234-5123</Button>}
            <Field label="สถานะการติดต่อ"><Select value={detail.status} onChange={(e) => update({ status: e.target.value as LeadStatus })} options={['ใหม่', 'กำลังติดต่อ', 'ติดต่อแล้ว', 'ไม่สำเร็จ']} /></Field>
            <Field label="ผู้รับผิดชอบ"><Select options={['ทีม Telesales', 'สาขาสยามพารากอน', 'RM ธุรกิจ']} /></Field>
            <Field label="บันทึกการติดต่อ"><Textarea rows={3} value={detail.note ?? ''} onChange={(e) => update({ note: e.target.value })} placeholder="เช่น นัดโทรกลับ 31/10 18:00" /></Field>
          </>
        )}
      </Drawer>
      <Modal open={settings} onClose={() => setSettings(false)} width={640} title="ตั้งค่าฟอร์ม · Drop-lead Form" footer={<><Button onClick={() => setSettings(false)}>ยกเลิก</Button><Button variant="primary" onClick={() => { toast('บันทึกการตั้งค่าแล้ว', 'มีผลกับฟอร์มบนเว็บทันที'); setSettings(false); }}>บันทึก</Button></>}>
        <p className="field-label">ช่องในฟอร์ม (ชื่อ เบอร์โทร ผลิตภัณฑ์ เป็นช่องบังคับเสมอ)</p>
        <Toggle label="อีเมล" checked={fields.email} onChange={(v) => setFields({ ...fields, email: v })} />
        <Toggle label="เวลาที่สะดวกให้ติดต่อ" checked={fields.time} onChange={(v) => setFields({ ...fields, time: v })} />
        <Toggle label="สาขาที่ใกล้" checked={fields.branch} onChange={(v) => setFields({ ...fields, branch: v })} />
        <Toggle label="ข้อความยินยอม PDPA" desc="บังคับตามนโยบาย Compliance" checked={fields.consent} disabled onChange={() => undefined} />
        <div className="grid-2">
          <Field label="ส่งแจ้งเตือนไปที่"><Input defaultValue="telesales@lhbank.co.th" /></Field>
          <Field label="ลบข้อมูลอัตโนมัติหลัง"><Select options={['180 วัน', '1 ปี', '2 ปี']} /></Field>
        </div>
      </Modal>
    </ListPage>
  );
}
