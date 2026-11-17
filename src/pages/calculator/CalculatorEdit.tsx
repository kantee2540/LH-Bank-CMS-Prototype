import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Upload, Lock } from 'lucide-react';
import { Button, Card, Field, Input, Select, Tabs, Status, PageHeader, Modal } from '../../components/ui';
import { CALCULATORS, TEST_CASES } from '../../data/mock';
import { useStore } from '../../store';
import { pmt, fmt } from './calc';
import type { Rounding } from './calc';
import type { TestCase } from '../../types';

type VarRow = [code: string, label: string, source: string, range: string];
type CalcTab = 'general' | 'formula' | 'test' | 'history';

interface FormulaProps {
  buffer: number;
  setBuffer: (v: number) => void;
  rounding: Rounding;
  setRounding: (v: Rounding) => void;
}

interface TestRow extends TestCase {
  got: number | string;
  pass: boolean;
}
import '../pages.css';

const VARS: VarRow[] = [
  ['loan_amount', 'วงเงินที่ขอกู้', 'ผู้ใช้กรอก', '2,000,000 – 50,000,000 บาท'],
  ['rate', 'อัตราดอกเบี้ย (%)', 'Rates › สินเชื่อบ้านใหม่ (5.69)', '0.00 – 15.00 % ต่อปี'],
  ['years', 'ระยะเวลาขอกู้ (ปี)', 'ผู้ใช้กรอก', '3 – 30 ปี'],
];
const FORMULA = `r       = (rate + rate_buffer) ÷ 100 ÷ 12
n       = years × 12
payment = ROUNDUP( loan_amount × r × (1 + r)^n
                   ÷ ((1 + r)^n − 1), -2 )`;

/* CMS-27A ตัวแปรและสูตร */
function FormulaTab({ buffer, setBuffer, rounding, setRounding }: FormulaProps) {
  const [amount, setAmount] = useState('3,000,000');
  const [rate, setRate] = useState('5.69');
  const [years, setYears] = useState('30');
  const [result, setResult] = useState(() => pmt({ amount: 3e6, rate: 5.69, years: 30, buffer, rounding }));
  const [editVar, setEditVar] = useState<VarRow | null>(null);
  const num = (s: string) => parseFloat(String(s).replace(/,/g, '')) || 0;
  const calc = () => setResult(pmt({ amount: num(amount), rate: num(rate), years: num(years), buffer, rounding }));
  const live = pmt({ amount: num(amount), rate: num(rate), years: num(years), buffer, rounding: 'integer' });

  return (
    <div className="split">
      <div className="col">
        <Card title="ตัวแปรนำเข้า (ช่องกรอกบนหน้าเว็บ)" sub="ระบบตรวจช่วงค่าที่รับได้ก่อนคำนวณ และแสดงข้อความแจ้งเตือนตามที่ตั้งไว้" action={<Button size="sm" icon={Plus}>เพิ่มตัวแปร</Button>}>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>รหัสตัวแปร</th><th>ชื่อที่แสดงบนเว็บ</th><th>ค่าเริ่มต้น / แหล่งข้อมูล</th><th>ช่วงที่รับได้</th></tr></thead>
              <tbody>
                {VARS.map((v) => (
                  <tr key={v[0]} className="clickable" onClick={() => setEditVar(v)}>
                    <td><span className="code-chip">{v[0]}</span></td>
                    <td>{v[1]}</td>
                    <td className={v[0] === 'rate' ? 't-link' : ''} style={{ fontWeight: 400 }}>{v[2]}</td>
                    <td>{v[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="t-sm t-secondary mt-8">คลิกแถวเพื่อแก้ชื่อ ช่วงค่า และข้อความแจ้งเตือน เช่น “กรุณากรอกวงเงินที่ขอกู้ไม่ต่ำกว่า 2 ล้านบาท”</p>
        </Card>
        <Card title="ค่าคงที่และการปัดเศษ" sub="ตรงกับหมายเหตุข้อ 1 บนหน้าเว็บ: อัตราดอกเบี้ยที่ใช้คำนวณจะถูกบวกเพิ่มเพื่อป้องกันผลกระทบต่อระยะเวลาผ่อนชำระ">
          <div className="grid-2">
            <Field label="ส่วนเพิ่มอัตราดอกเบี้ย (rate_buffer)"><Input type="number" step="0.25" value={buffer} onChange={(e) => setBuffer(parseFloat(e.target.value) || 0)} /></Field>
            <Field label="การปัดเศษค่างวด"><Select value={rounding} onChange={(e) => setRounding(e.target.value as Rounding)} options={[{ value: 'hundred', label: 'ปัดขึ้นเป็นหลักร้อย' }, { value: 'integer', label: 'จำนวนเต็ม' }]} /></Field>
          </div>
        </Card>
        <Card title="สูตรคำนวณ" sub="ใช้ตัวแปรด้านบนร่วมกับฟังก์ชันที่ระบบรองรับ ได้แก่ ROUNDUP, ROUND, MIN, MAX และ ^ (ยกกำลัง)">
          <div className="formula">{FORMULA}</div>
          <div className="row mt-16" style={{ flexWrap: 'wrap', gap: 8 }}>
            <span className="t-sm">ตัวแปรที่ใช้ได้</span>
            {['loan_amount', 'rate', 'years', 'rate_buffer', 'r', 'n'].map((v) => <span className="code-chip" key={v}>{v}</span>)}
            <span className="status status-published" style={{ marginLeft: 'auto' }}>ตรวจไวยากรณ์ผ่าน</span>
          </div>
        </Card>
        <Card title="ผลลัพธ์ที่แสดงบนหน้าเว็บ" sub="กำหนดค่าที่ส่งไปแสดงในกล่อง “ผลการคำนวณ” ของหน้าเว็บ">
          <table className="table">
            <thead><tr><th>ป้ายบนหน้าเว็บ</th><th>ค่าจากสูตร</th><th>รูปแบบการแสดงผล</th></tr></thead>
            <tbody>
              {[['วงเงินที่ต้องการ', 'loan_amount', '#,##0 บาท'], ['ค่างวดสำหรับอัตราดอกเบี้ยปกติ : เดือน', 'payment', '#,##0 บาท'], ['ระยะเวลาผ่อนชำระ', 'years', '0 ปี'], ['อัตราดอกเบี้ย', 'rate', '0.00 %']].map((r) => (
                <tr key={r[0]}><td>{r[0]}</td><td><span className="code-chip">{r[1]}</span></td><td>{r[2]}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <Card title="ทดลองคำนวณ" sub="ใช้สูตรฉบับร่าง v5 · ไม่มีผลกับหน้าเว็บ" style={{ position: 'sticky', top: 90 }}>
        <div className="col">
          <Field label="วงเงินที่ขอกู้ (บาท)"><Input value={amount} onChange={(e) => setAmount(e.target.value)} onBlur={() => setAmount(fmt(num(amount)))} /></Field>
          <Field label="อัตราดอกเบี้ย (%)"><Input value={rate} onChange={(e) => setRate(e.target.value)} /></Field>
          <Field label="ระยะเวลาขอกู้ (ปี)"><Input value={years} onChange={(e) => setYears(e.target.value)} /></Field>
          <Button variant="primary" onClick={calc}>คำนวณ</Button>
          <div className="result-box">
            {!result.ok ? (
              <p className="t-danger">{result.error}</p>
            ) : (
              <>
                <p className="t-secondary">ค่างวดต่อเดือน</p>
                <p className="val">{fmt(result.value)} บาท</p>
                <p className="t-sm t-secondary">อัตราที่ใช้คำนวณ {result.effRate.toFixed(2)}% ({num(rate).toFixed(2)} + {buffer.toFixed(2)})</p>
                <p className="t-sm t-secondary">จำนวนงวด {result.n} งวด</p>
                {live.ok && (
                  <div style={{ borderTop: '1px solid #d6dde4', marginTop: 8, paddingTop: 8 }} className="t-sm t-secondary">
                    เวอร์ชันที่เผยแพร่ (v4): {fmt(live.value)} บาท<br />
                    ต่างกัน {result.value - live.value >= 0 ? '+' : ''}{fmt(result.value - live.value)} บาท<br />จากการปัดขึ้นเป็นหลักร้อย
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
      <Modal open={!!editVar} onClose={() => setEditVar(null)} title={`แก้ไขตัวแปร ${editVar?.[0] || ''}`} footer={<><Button onClick={() => setEditVar(null)}>ยกเลิก</Button><Button variant="primary" onClick={() => setEditVar(null)}>บันทึก</Button></>}>
        {editVar && (
          <>
            <Field label="ชื่อที่แสดงบนเว็บ"><Input defaultValue={editVar[1]} /></Field>
            <Field label="ช่วงที่รับได้"><Input defaultValue={editVar[3]} /></Field>
            <Field label="ข้อความแจ้งเตือน"><Input defaultValue="กรุณากรอกวงเงินที่ขอกู้ไม่ต่ำกว่า 2 ล้านบาท" /></Field>
          </>
        )}
      </Modal>
    </div>
  );
}

/* CMS-27B ทดสอบสูตรและส่งอนุมัติ */
function TestTab({ buffer, rounding, onSubmit }: { buffer: number; rounding: Rounding; onSubmit: () => void }) {
  const [results, setResults] = useState<TestRow[] | null>(null);
  const [ranAt, setRanAt] = useState('10/11/2026 14:20');
  const run = () => {
    setResults(
      TEST_CASES.map((t): TestRow => {
        const r = pmt({ amount: t.amount, rate: t.rate, years: t.years, buffer, rounding });
        const got = r.ok ? r.value : r.error;
        return { ...t, got, pass: got === t.expected };
      }),
    );
    const d = new Date();
    setRanAt(`${d.toLocaleDateString('en-GB')} ${d.toTimeString().slice(0, 5)}`);
  };
  const rows: TestRow[] = results ?? TEST_CASES.map((t) => ({ ...t, got: t.expected, pass: true }));
  const sample = pmt({ amount: 3e6, rate: 5.69, years: 30, buffer, rounding });
  const passed = rows.filter((r) => r.pass).length;
  const allPass = passed === rows.length;
  return (
    <div className="split-wide">
      <Card
        title="ชุดทดสอบ (Test Cases)"
        sub="เทียบผลจากสูตรฉบับร่าง v5 กับค่าที่ฝ่ายสินเชื่อคำนวณไว้ · ต้องผ่านครบทุกกรณีจึงส่งอนุมัติได้"
        action={<div className="row" style={{ gap: 8 }}><Button size="sm" icon={Upload}>Import Excel</Button><Button size="sm" variant="primary" onClick={run}>รันทดสอบทั้งหมด</Button></div>}
      >
        <div className="row" style={{ marginBottom: 12 }}>
          <span className={`status ${allPass ? 'status-published' : 'status-rejected'}`}>ผ่าน {passed} / {rows.length} กรณี</span>
          <span className="t-sm t-secondary">รันล่าสุด {ranAt} · โดย Content Editor 01</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>#</th><th>วงเงิน (บาท)</th><th>อัตรา (%)</th><th>ปี</th><th>ค่าที่คาดหวัง (บาท)</th><th>ผลจากสูตร v5</th><th>ผล</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{fmt(r.amount)}</td>
                  <td>{r.rate.toFixed(2)}</td>
                  <td>{r.years}</td>
                  <td>{typeof r.expected === 'number' ? fmt(r.expected) : r.expected}</td>
                  <td><b>{typeof r.got === 'number' ? fmt(r.got) : r.got}</b></td>
                  <td>{r.pass ? <span className="status status-published">ผ่าน</span> : <span className="status status-rejected">ไม่ผ่าน</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="t-sm t-secondary mt-8">ค่าที่คาดหวังนำเข้าจากไฟล์ Excel ของฝ่ายสินเชื่อ · ยอมรับส่วนต่างได้ไม่เกิน 0 บาท · ลองเปลี่ยน rate_buffer ในแท็บ “ตัวแปรและสูตร” แล้วรันใหม่เพื่อดูกรณีไม่ผ่าน</p>
      </Card>
      <div className="col">
        <Card title="เปรียบเทียบกับเวอร์ชันที่เผยแพร่" sub="v4 เผยแพร่ 01/10/2026 → v5 ฉบับร่าง">
          <div className="diff-row"><b style={{ fontWeight: 500 }}>การปัดเศษค่างวด</b><div><s>จำนวนเต็ม</s> → {rounding === 'hundred' ? 'ปัดขึ้นเป็นหลักร้อย' : 'จำนวนเต็ม'}</div></div>
          <div className="diff-row"><b style={{ fontWeight: 500 }}>ค่างวด 3 ล้านบาท · 30 ปี</b><div><s>19,339 บาท</s> → {fmt(sample.ok ? sample.value : 0)} บาท</div></div>
          <div className="diff-row"><b style={{ fontWeight: 500 }}>ตัวแปร / สูตรหลัก</b><div className="t-secondary">{buffer === 1 ? 'ไม่เปลี่ยน' : `rate_buffer 1.00 → ${buffer.toFixed(2)}`}</div></div>
        </Card>
        <SubmitCard allPass={allPass} onSubmit={onSubmit} />
      </div>
    </div>
  );
}

function SubmitCard({ allPass, onSubmit }: { allPass: boolean; onSubmit: () => void }) {
  return (
    <Card title="ส่งอนุมัติ" sub="Auditor จะเห็นผลทดสอบและส่วนต่างจากเวอร์ชันเดิม">
      <div className="col">
        <Field label="Auditor ผู้ตรวจ"><Select options={['Auditor – ฝ่ายสินเชื่อ', 'Auditor – Marketing']} /></Field>
        <Field label="ต้องการเผยแพร่"><Input type="datetime-local" defaultValue="2026-11-15T09:00" /></Field>
        <Field label="หมายเหตุถึงผู้อนุมัติ"><textarea className="textarea" defaultValue="ปรับการปัดเศษค่างวดให้ตรงกับประกาศฝ่ายสินเชื่อ" /></Field>
        {!allPass && <div className="note-danger">ยังส่งไม่ได้ — ต้องผ่านชุดทดสอบครบทุกกรณี</div>}
        <p className="t-sm t-secondary row" style={{ alignItems: 'flex-start' }}><Lock size={16} style={{ flex: 'none', marginTop: 3 }} /> หลังส่งจะแก้สูตรไม่ได้จนกว่า Auditor อนุมัติหรือส่งกลับ · ทุกการเปลี่ยนแปลงบันทึกใน Audit Log</p>
        <Button variant="primary" disabled={!allPass} onClick={onSubmit}>ส่งอนุมัติ</Button>
      </div>
    </Card>
  );
}

export default function CalculatorEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useStore();
  const calc = CALCULATORS.find((c) => c.id === id) || CALCULATORS[0];
  const short = calc.name.replace(/^คำนวณ(สินเชื่อบ้านใหม่ )?/, '');
  const [tab, setTab] = useState<CalcTab>('formula');
  const [buffer, setBuffer] = useState(1);
  const [rounding, setRounding] = useState<Rounding>('hundred');
  const submit = () => {
    toast('ส่งอนุมัติสูตรแล้ว', `${short} v5 · รอ Auditor – ฝ่ายสินเชื่อ`);
    navigate('/requests');
  };

  return (
    <>
      <PageHeader
        back="/rates/calculator"
        title={`${tab === 'test' ? 'ทดสอบสูตร' : 'แก้ไขสูตร'} · ${short}`}
        badges={<><Status status="Draft" /><span className="tag-version">v5 (ร่าง) · แก้จาก {calc.v}</span></>}
        actions={
          <>
            <Button onClick={() => navigate('/rates/calculator')}>ยกเลิก</Button>
            <Button onClick={() => toast('บันทึก Draft แล้ว', `${short} v5`)}>บันทึก Draft</Button>
            {tab === 'test' ? <Button variant="primary" onClick={submit}>ส่งอนุมัติ</Button> : <Button variant="primary" onClick={() => setTab('test')}>ถัดไป: ทดสอบสูตร</Button>}
          </>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'general', label: 'ข้อมูลทั่วไป' },
          { value: 'formula', label: 'ตัวแปรและสูตร' },
          { value: 'test', label: 'ทดสอบสูตร' },
          { value: 'history', label: 'ประวัติเวอร์ชัน' },
        ]}
      />
      {tab === 'general' && (
        <Card title="ข้อมูลทั่วไป">
          <div className="grid-2">
            <Field label="ชื่อเครื่องมือ"><Input defaultValue={calc.name} /></Field>
            <Field label="Path"><Input defaultValue={calc.path} /></Field>
            <Field label="ประเภทสูตร"><Select options={['ค่างวดคงที่ (PMT)', 'วงเงินจากค่างวด (PV)', 'ดอกเบี้ยรับสุทธิ']} /></Field>
            <Field label="ปุ่มสมัครหลังคำนวณ (CTA)"><Input defaultValue="สมัครสินเชื่อออนไลน์" /></Field>
          </div>
        </Card>
      )}
      {tab === 'formula' && <FormulaTab {...{ buffer, setBuffer, rounding, setRounding }} />}
      {tab === 'test' && <TestTab buffer={buffer} rounding={rounding} onSubmit={submit} />}
      {tab === 'history' && (
        <Card title="ประวัติเวอร์ชัน">
          <table className="table">
            <thead><tr><th>เวอร์ชัน</th><th>สถานะ</th><th>สรุป</th><th>วันที่</th></tr></thead>
            <tbody>
              <tr className="highlight"><td><b>v5</b></td><td><Status status="Draft" /></td><td>ปัดเศษค่างวดขึ้นเป็นหลักร้อย</td><td>10/11/2026</td></tr>
              <tr><td><b>v4</b> <span className="tag-version">Live</span></td><td><Status status="Published" /></td><td>เพิ่ม rate_buffer 1.00%</td><td>01/10/2026</td></tr>
              <tr><td><b>v3</b></td><td><Status status="Expired" /></td><td>ดึงอัตราจาก Rates อัตโนมัติ</td><td>01/06/2026</td></tr>
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
