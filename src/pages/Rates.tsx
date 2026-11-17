import { useState } from 'react';
import { Plus, Upload, Download, Pencil, Copy, RefreshCw, Clock, Info, FileSpreadsheet, UploadCloud } from 'lucide-react';
import { Button, Field, Input, Select, Tabs, Toggle, Status, IconButton, Modal, PageHeader, InfoBanner } from '../components/ui';
import { useStore } from '../store';
import type { ContentStatus } from '../types';
import './pages.css';

type RateTab = 'deposit' | 'loan' | 'fee' | 'history';
interface RateRow {
  id: string;
  product: string;
  term: string;
  rate: string;
  effective: string;
  status: ContentStatus;
}

const RATES: Record<Exclude<RateTab, 'history'>, RateRow[]> = {
  deposit: [
    { id: 'd1', product: 'ออมทรัพย์ดิจิทัล', term: 'ทุกยอดเงิน', rate: 'x.xx', effective: '01/10/2026', status: 'Published' },
    { id: 'd2', product: 'ออมทรัพย์', term: 'ทุกยอดเงิน', rate: 'x.xx', effective: '01/10/2026', status: 'Published' },
    { id: 'd3', product: 'เงินฝากประจำ', term: '3 เดือน', rate: 'x.xx', effective: '01/10/2026', status: 'Published' },
    { id: 'd4', product: 'เงินฝากประจำ', term: '6 เดือน', rate: 'x.xx', effective: '01/10/2026', status: 'Published' },
    { id: 'd5', product: 'เงินฝากประจำพิเศษ 6 เดือน', term: 'ตามเงื่อนไขโปรโมชัน', rate: 'x.xx', effective: '15/10/2026', status: 'Published' },
    { id: 'd6', product: 'เงินฝากประจำ', term: '12 เดือน', rate: 'x.xx', effective: '01/11/2026', status: 'Scheduled' },
    { id: 'd7', product: 'เงินฝากประจำ', term: '24 เดือน', rate: 'x.xx', effective: '—', status: 'Draft' },
  ],
  loan: [
    { id: 'l1', product: 'MRR', term: 'อัตราอ้างอิง', rate: 'x.xx', effective: '01/10/2026', status: 'Published' },
    { id: 'l2', product: 'MLR', term: 'อัตราอ้างอิง', rate: 'x.xx', effective: '01/10/2026', status: 'Published' },
    { id: 'l3', product: 'สินเชื่อบ้านใหม่', term: 'ปีที่ 1–3', rate: 'x.xx', effective: '01/10/2026', status: 'Published' },
    { id: 'l4', product: 'สินเชื่อรีไฟแนนซ์บ้าน', term: 'ปีที่ 1–3', rate: 'x.xx', effective: '01/10/2026', status: 'Published' },
    { id: 'l5', product: 'สินเชื่อส่วนบุคคล', term: 'ตลอดสัญญา', rate: 'x.xx', effective: '01/10/2026', status: 'Published' },
  ],
  fee: [
    { id: 'f1', product: 'ค่าธรรมเนียมโอนเงินต่างธนาคาร', term: 'ผ่านแอป', rate: '0', effective: '01/01/2026', status: 'Published' },
    { id: 'f2', product: 'ค่าธรรมเนียมรักษาบัญชี', term: 'ยอดต่ำกว่า 2,000 บาท', rate: '50', effective: '01/01/2026', status: 'Published' },
    { id: 'f3', product: 'ค่าประเมินหลักประกัน', term: 'สินเชื่อบ้าน', rate: '3,000', effective: '01/01/2026', status: 'Published' },
  ],
};
const HISTORY = [
  ['ประกาศอัตราดอกเบี้ยเงินฝาก ฉบับที่ 11/2569', '01/11/2026', 'Scheduled', 'Auditor – ฝ่ายเงินฝาก'],
  ['ประกาศอัตราดอกเบี้ยเงินฝาก ฉบับที่ 10/2569', '01/10/2026', 'Published', 'Auditor – ฝ่ายเงินฝาก'],
  ['ประกาศอัตราดอกเบี้ยสินเชื่อ ฉบับที่ 10/2569', '01/10/2026', 'Published', 'Auditor – ฝ่ายสินเชื่อ'],
  ['ประกาศอัตราดอกเบี้ยเงินฝาก ฉบับที่ 09/2569', '01/09/2026', 'Expired', 'Auditor – ฝ่ายเงินฝาก'],
] as const;

/* CMS-14 Rates — อัตราดอกเบี้ย (+ NEW: RT-01 แก้ไขอัตรา, RT-02 Import Excel) */
export function InterestRates() {
  const { toast, submitRequest } = useStore();
  const [tab, setTab] = useState<RateTab>('deposit');
  const [rows, setRows] = useState(RATES);
  const [edit, setEdit] = useState<RateRow | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const unit = tab === 'fee' ? 'บาท' : '% ต่อปี';
  const save = () => {
    if (!edit || tab === 'history') return;
    const list = rows[tab];
    const exists = list.some((r) => r.id === edit.id);
    setRows({ ...rows, [tab]: exists ? list.map((r) => (r.id === edit.id ? { ...edit, status: 'Scheduled' } : r)) : [...list, { ...edit, status: 'Draft' }] });
    submitRequest({ title: `อัตรา: ${edit.product} ${edit.term}`, module: 'Rates', sub: 'Rates · อัปเดตอัตรา', auditor: 'Auditor – ฝ่ายเงินฝาก', publish: edit.effective });
    toast('ส่งอนุมัติอัตราใหม่แล้ว', `${edit.product} · ${edit.rate} ${unit} · มีผล ${edit.effective}`);
    setEdit(null);
  };
  return (
    <>
      <PageHeader title="อัตราดอกเบี้ย" />
      <InfoBanner title="Single Source of Truth">ตารางบนเว็บและ Calculator ทุกตัวดึงค่าจากหน้านี้ แสดง “มีผลตั้งแต่ ...” อัตโนมัติ · การแก้ไขต้องผ่านผู้อนุมัติก่อนเผยแพร่</InfoBanner>
      <section className="card">
        <Tabs value={tab} onChange={setTab} style={{ marginBottom: 16 }} tabs={[{ value: 'deposit', label: 'เงินฝาก' }, { value: 'loan', label: 'สินเชื่อ' }, { value: 'fee', label: 'ค่าธรรมเนียม' }, { value: 'history', label: 'ประวัติการประกาศ' }]} />
        {tab !== 'history' ? (
          <>
            <div className="row-between" style={{ marginBottom: 16 }}>
              <div className="row" style={{ gap: 10 }}>
                <Button variant="primary" icon={Plus} onClick={() => setEdit({ id: `n${Date.now()}`, product: '', term: '', rate: '', effective: '', status: 'Draft' })}>Create</Button>
                <Button icon={Upload} onClick={() => { setImporting(null); setStep(1); setImporting(''); }}>Import Excel</Button>
                <Button icon={Download} onClick={() => toast('ดาวน์โหลด Template แล้ว', `rates-${tab}-template.xlsx`)}>Download Template</Button>
              </div>
              <span className="row t-secondary" style={{ gap: 8 }}><Info size={18} color="#1f6fa8" /> ประกาศล่าสุด มีผลตั้งแต่ 01/10/2026</span>
            </div>
            <table className="table">
              <thead><tr><th>{tab === 'fee' ? 'รายการค่าธรรมเนียม' : 'ผลิตภัณฑ์ / ประเภทบัญชี'}</th><th>{tab === 'fee' ? 'เงื่อนไข' : 'ระยะเวลา / เงื่อนไข'}</th><th style={{ textAlign: 'right' }}>{tab === 'fee' ? 'อัตรา (บาท)' : 'อัตรา (% ต่อปี)'}</th><th>มีผลตั้งแต่</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {rows[tab].map((r) => (
                  <tr key={r.id}>
                    <td><b style={{ fontWeight: 500 }}>{r.product}</b></td>
                    <td>{r.term}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{r.rate}</td>
                    <td>{r.effective}</td>
                    <td><Status status={r.status} /></td>
                    <td><div className="row" style={{ gap: 2 }}><IconButton icon={Pencil} title="แก้ไขอัตรา" onClick={() => setEdit({ ...r })} /><IconButton icon={Copy} title="ทำสำเนา" onClick={() => setEdit({ ...r, id: `n${Date.now()}`, term: `${r.term} (สำเนา)`, status: 'Draft' })} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <table className="table">
            <thead><tr><th>ประกาศ</th><th>มีผลตั้งแต่</th><th>สถานะ</th><th>อนุมัติโดย</th><th>ไฟล์</th></tr></thead>
            <tbody>{HISTORY.map(([n, d, s, a]) => <tr key={n}><td>{n}</td><td>{d}</td><td><Status status={s} /></td><td>{a}</td><td><a className="t-link" onClick={() => toast('ดาวน์โหลดประกาศ', `${n}.pdf`)}>PDF</a></td></tr>)}</tbody>
          </table>
        )}
      </section>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit && rows[tab as 'deposit']?.some((r) => r.id === edit.id) ? 'แก้ไขอัตรา' : 'เพิ่มอัตรา'}
        footer={<><Button onClick={() => setEdit(null)}>ยกเลิก</Button><Button variant="primary" disabled={!edit?.product || !edit?.rate || !edit?.effective} onClick={save}>ส่งอนุมัติ</Button></>}>
        {edit && (
          <>
            <div className="grid-2">
              <Field label="ผลิตภัณฑ์ / รายการ" required><Input value={edit.product} onChange={(e) => setEdit({ ...edit, product: e.target.value })} /></Field>
              <Field label="ระยะเวลา / เงื่อนไข"><Input value={edit.term} onChange={(e) => setEdit({ ...edit, term: e.target.value })} /></Field>
              <Field label={`อัตรา (${unit})`} required><Input type="number" step="0.01" value={edit.rate === 'x.xx' ? '' : edit.rate} placeholder="0.00" onChange={(e) => setEdit({ ...edit, rate: e.target.value })} /></Field>
              <Field label="มีผลตั้งแต่" required><Input type="date" onChange={(e) => setEdit({ ...edit, effective: e.target.value.split('-').reverse().join('/') })} /></Field>
            </div>
            <Field label="ผู้อนุมัติ"><Select options={['Auditor – ฝ่ายเงินฝาก', 'Auditor – ฝ่ายสินเชื่อ']} /></Field>
            <div className="info-soft t-sm">ค่าที่อ้างถึง {'{rate:...}'} ในเนื้อหา โปรโมชัน และ Calculator จะเปลี่ยนตามอัตโนมัติเมื่อถึงวันที่มีผล</div>
          </>
        )}
      </Modal>

      <Modal open={importing !== null} onClose={() => setImporting(null)} width={720} title="Import อัตราจาก Excel"
        footer={<><Button onClick={() => (step === 2 ? setStep(1) : setImporting(null))}>{step === 2 ? 'ย้อนกลับ' : 'ยกเลิก'}</Button>{step === 1 ? <Button variant="primary" disabled={!importing} onClick={() => setStep(2)}>ตรวจสอบไฟล์</Button> : <Button variant="primary" onClick={() => { submitRequest({ title: `Import อัตรา${tab === 'loan' ? 'สินเชื่อ' : 'เงินฝาก'} (${importing})`, module: 'Rates', sub: 'Rates · Import Excel' }); toast('ส่งอนุมัติแล้ว', `นำเข้า 7 แถวจาก ${importing}`); setImporting(null); }}>ส่งอนุมัติ 7 รายการ</Button>}</>}>
        {step === 1 ? (
          <label className="dropzone" style={{ cursor: 'pointer' }}>
            <UploadCloud size={36} strokeWidth={1.4} />
            <b>{importing || 'เลือกไฟล์ .xlsx ตาม Template'}</b>
            <span className="t-sm">ระบบตรวจรูปแบบตัวเลข วันที่มีผล และชื่อผลิตภัณฑ์ก่อนนำเข้า</span>
            <input type="file" accept=".xlsx,.xls" hidden onChange={(e) => setImporting(e.target.files?.[0]?.name ?? 'rates-deposit-11-2569.xlsx')} />
          </label>
        ) : (
          <>
            <div className="row" style={{ gap: 6 }}><FileSpreadsheet size={18} color="#1a9a8a" /> <b>{importing}</b><span className="status status-published">ถูกต้อง 7</span><span className="status status-expired">เปลี่ยนแปลง 2</span></div>
            <table className="table">
              <thead><tr><th>ผลิตภัณฑ์</th><th>ระยะเวลา</th><th>เดิม</th><th>ใหม่</th></tr></thead>
              <tbody>{[['เงินฝากประจำ', '12 เดือน', 'x.xx', 'y.yy'], ['เงินฝากประจำ', '24 เดือน', 'x.xx', 'y.yy'], ['ออมทรัพย์', 'ทุกยอดเงิน', 'x.xx', 'x.xx']].map((r) => <tr key={r[1]} className={r[2] !== r[3] ? 'highlight' : ''}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td><b>{r[3]}</b></td></tr>)}</tbody>
            </table>
            <p className="t-sm t-secondary">มีผลตั้งแต่ 01/12/2026 · แสดงเฉพาะแถวที่ค่าเปลี่ยน 2 รายการ + ตัวอย่าง</p>
          </>
        )}
      </Modal>
    </>
  );
}

interface FxRow {
  code: string;
  name: string;
  buy: string;
  sell: string;
  home: boolean;
}
const FX: FxRow[] = [
  { code: 'USD', name: 'ดอลลาร์สหรัฐ', buy: 'xx.xx', sell: 'xx.xx', home: true },
  { code: 'EUR', name: 'ยูโร', buy: 'xx.xx', sell: 'xx.xx', home: true },
  { code: 'JPY (100)', name: 'เยน', buy: 'xx.xx', sell: 'xx.xx', home: true },
  { code: 'CNY', name: 'หยวน', buy: 'xx.xx', sell: 'xx.xx', home: true },
  { code: 'GBP', name: 'ปอนด์', buy: 'xx.xx', sell: 'xx.xx', home: false },
  { code: 'SGD', name: 'ดอลลาร์สิงคโปร์', buy: 'xx.xx', sell: 'xx.xx', home: false },
  { code: 'TWD', name: 'ดอลลาร์ไต้หวัน', buy: 'xx.xx', sell: 'xx.xx', home: false },
];

/* CMS-15 Rates — อัตราแลกเปลี่ยน (+ NEW: FX-01 แก้ไขด้วยมือ, FX-02 ประวัติอัตรา) */
export function ExchangeRates() {
  const { toast } = useStore();
  const [rows, setRows] = useState(FX);
  const [synced, setSynced] = useState('30/10/2026 09:00');
  const [edit, setEdit] = useState<FxRow | null>(null);
  const [hist, setHist] = useState<FxRow | null>(null);
  const homeCount = rows.filter((r) => r.home).length;
  return (
    <>
      <PageHeader title="อัตราแลกเปลี่ยน" />
      <div className="banner-info" style={{ background: '#5ab4b8' }}><RefreshCw strokeWidth={1.6} /><div><b>ซิงก์อัตโนมัติจากระบบ Treasury ทุก 30 นาที</b><div>อัปเดตล่าสุด {synced} น. · แก้ไขด้วยมือได้เมื่อระบบขัดข้อง (บันทึกใน Audit Log)</div></div></div>
      <section className="card">
        <div className="row-between" style={{ marginBottom: 16 }}>
          <div className="row" style={{ gap: 10 }}>
            <Button variant="primary" icon={RefreshCw} onClick={() => { const d = new Date(); setSynced(`${d.toLocaleDateString('en-GB')} ${d.toTimeString().slice(0, 5)}`); toast('ดึงข้อมูลล่าสุดแล้ว', 'Treasury · 7 สกุลเงิน'); }}>ดึงข้อมูลล่าสุด</Button>
            <Button icon={Upload}>Import Excel</Button>
          </div>
          <span className="row t-secondary" style={{ gap: 8 }}><Info size={18} color="#1f6fa8" /> แสดงที่หน้าแรก (Tools) {homeCount} สกุล · หน้าอัตราแลกเปลี่ยนแสดงทั้งหมด</span>
        </div>
        <table className="table">
          <thead><tr><th>สกุลเงิน</th><th style={{ textAlign: 'right' }}>ราคาซื้อ (บาท)</th><th style={{ textAlign: 'right' }}>ราคาขาย (บาท)</th><th style={{ textAlign: 'center' }}>แสดงหน้าแรก</th><th>อัปเดตเมื่อ</th><th>Action</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code}>
                <td><b style={{ fontWeight: 500 }}>{r.code} · {r.name}</b></td>
                <td style={{ textAlign: 'right', fontWeight: 500 }}>{r.buy}</td>
                <td style={{ textAlign: 'right', fontWeight: 500 }}>{r.sell}</td>
                <td style={{ textAlign: 'center' }}><Toggle checked={r.home} onChange={(v) => { if (v && homeCount >= 4) { toast('แสดงหน้าแรกได้สูงสุด 4 สกุล', 'ปิดสกุลอื่นก่อน'); return; } setRows(rows.map((x) => (x.code === r.code ? { ...x, home: v } : x))); }} /></td>
                <td>{synced}</td>
                <td><div className="row" style={{ gap: 2 }}><IconButton icon={Pencil} title="แก้ไขด้วยมือ" onClick={() => setEdit({ ...r })} /><IconButton icon={Clock} title="ประวัติอัตรา" onClick={() => setHist(r)} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={`แก้ไขอัตราด้วยมือ · ${edit?.code}`} footer={<><Button onClick={() => setEdit(null)}>ยกเลิก</Button><Button variant="primary" onClick={() => { if (edit) setRows(rows.map((x) => (x.code === edit.code ? edit : x))); toast('บันทึกอัตราแล้ว', 'การแก้ด้วยมือบันทึกใน Audit Log'); setEdit(null); }}>บันทึก</Button></>}>
        {edit && (
          <>
            <div className="note-soft-warning">⚠️ ใช้เมื่อระบบ Treasury ขัดข้องเท่านั้น · ค่าจะถูกเขียนทับเมื่อซิงก์รอบถัดไปสำเร็จ</div>
            <div className="grid-2">
              <Field label="ราคาซื้อ (บาท)"><Input value={edit.buy} onChange={(e) => setEdit({ ...edit, buy: e.target.value })} /></Field>
              <Field label="ราคาขาย (บาท)"><Input value={edit.sell} onChange={(e) => setEdit({ ...edit, sell: e.target.value })} /></Field>
            </div>
            <Field label="เหตุผล" required><Input placeholder="เช่น ระบบ Treasury ไม่ตอบสนองตั้งแต่ 08:30" /></Field>
          </>
        )}
      </Modal>
      <Modal open={!!hist} onClose={() => setHist(null)} title={`ประวัติอัตรา · ${hist?.code}`}>
        <table className="table">
          <thead><tr><th>เวลา</th><th>ซื้อ</th><th>ขาย</th><th>ที่มา</th></tr></thead>
          <tbody>{['30/10/2026 09:00', '30/10/2026 08:30', '30/10/2026 08:00', '29/10/2026 17:30'].map((t, i) => <tr key={t}><td>{t}</td><td>xx.xx</td><td>xx.xx</td><td>{i === 2 ? <span className="status status-scheduled">แก้ด้วยมือ</span> : 'Treasury'}</td></tr>)}</tbody>
        </table>
      </Modal>
    </>
  );
}

