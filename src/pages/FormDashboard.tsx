import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Inbox, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, Card, Field, Input, Select, PageHeader } from '../components/ui';
import { useStore } from '../store';
import { CHANNELS, LEAD_STATUSES, ST_CLASS, isoOf } from '../data/forms';
import type { Submission } from '../data/forms';
import './pages.css';

const COLORS = ['#1f6fa8', '#5ab4b8', '#e0a43a', '#8a6fc4', '#d9727a', '#6b9e5a', '#4d5b6b'];
const ST_COLOR: Record<string, string> = { ใหม่: '#2f86c1', กำลังติดต่อ: '#e0a43a', ติดต่อแล้ว: '#1a9a8a', ไม่สำเร็จ: '#d9534f' };
const TODAY = '2026-11-26';
/* บวก/ลบวันแบบปฏิทิน (ไม่ใช้ toISOString เพราะจะเลื่อนวันตาม Timezone) */
const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(y, m - 1, d + n);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
};
const fmt = (iso: string) => iso.split('-').reverse().join('/');
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

function Kpi({ icon: Icon, label, value, sub, tone }: { icon: LucideIcon; label: string; value: string; sub: string; tone: string }) {
  return (
    <section className="card fd-kpi">
      <div className="fd-kpi-icon" style={{ background: `${tone}1a`, color: tone }}><Icon size={22} /></div>
      <div><p className="t-secondary" style={{ margin: 0 }}>{label}</p><p className="t-h2" style={{ margin: '2px 0' }}>{value}</p><p className="t-sm t-tertiary" style={{ margin: 0 }}>{sub}</p></div>
    </section>
  );
}

function BarList({ rows, total, color, colors }: { rows: [string, number][]; total: number; color?: string; colors?: Record<string, string> }) {
  return (
    <div className="col" style={{ gap: 10 }}>
      {rows.map(([k, v], i) => (
        <div key={k}>
          <div className="row-between t-sm"><span>{k}</span><span><b style={{ fontWeight: 500 }}>{v.toLocaleString()}</b> <span className="t-tertiary">({pct(v, total)}%)</span></span></div>
          <div className="fd-track"><i style={{ width: `${pct(v, total)}%`, background: colors?.[k] ?? color ?? COLORS[i % COLORS.length] }} /></div>
        </div>
      ))}
      {!rows.length && <p className="t-tertiary t-sm">ไม่มีข้อมูลในช่วงนี้</p>}
    </div>
  );
}

/* NEW — FD-01 Dashboard สรุปข้อมูลจากฟอร์ม (คำนวณจาก Submissions จริงตามฟอร์มและช่วงเวลาที่เลือก) */
export default function FormDashboard() {
  const { forms, submissions, toast } = useStore();
  const navigate = useNavigate();
  const [formId, setFormId] = useState('all');
  const [range, setRange] = useState('30 วันล่าสุด');
  const [start, setStart] = useState(addDays(TODAY, -13));
  const [end, setEnd] = useState(TODAY);
  const custom = range === 'กำหนดช่วงเวลา';
  const from = custom ? start : addDays(TODAY, range === '7 วันล่าสุด' ? -6 : range === '14 วันล่าสุด' ? -13 : -29);
  const to = custom ? end : TODAY;
  const badRange = custom && (!start || !end || start > end);

  const list = useMemo(() => submissions.filter((s) => (formId === 'all' || s.formId === formId) && isoOf(s.date) >= from && isoOf(s.date) <= to), [submissions, formId, from, to]);
  const days = useMemo(() => {
    const out: string[] = [];
    for (let d = from; d <= to && out.length < 62; d = addDays(d, 1)) out.push(d);
    return out;
  }, [from, to]);
  const shownForms = formId === 'all' ? forms : forms.filter((f) => f.id === formId);
  const colorOf = (id: string) => COLORS[forms.findIndex((f) => f.id === id) % COLORS.length];

  const by = <K extends string>(get: (s: Submission) => K) => list.reduce<Record<string, number>>((acc, s) => { const k = get(s); acc[k] = (acc[k] ?? 0) + 1; return acc; }, {});
  const status = by((s) => s.status);
  const closed = (status['ติดต่อแล้ว'] ?? 0) + (status['ไม่สำเร็จ'] ?? 0);
  const overdue = list.filter((s) => s.status === 'ใหม่' && isoOf(s.date) < addDays(TODAY, -1)).length;
  const channels = Object.entries(by((s) => s.channel)).sort((a, b) => b[1] - a[1]);
  const owners = Object.entries(list.filter((s) => s.owner && s.status === 'กำลังติดต่อ').reduce<Record<string, number>>((a, s) => { a[s.owner!] = (a[s.owner!] ?? 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]);

  // จำนวนต่อวัน แยกตามฟอร์ม (กราฟแท่งซ้อน)
  const daily = days.map((d) => ({ d, parts: shownForms.map((f) => ({ id: f.id, n: list.filter((s) => s.formId === f.id && isoOf(s.date) === d).length })) }));
  const maxDay = Math.max(1, ...daily.map((x) => x.parts.reduce((a, p) => a + p.n, 0)));

  // คำตอบยอดนิยมของช่องแบบตัวเลือก (ฟอร์มที่เลือก หรือ Drop-lead เมื่อดูทั้งหมด)
  const focus = forms.find((f) => f.id === (formId === 'all' ? 'drop' : formId));
  const choiceFields = (focus?.fields ?? []).filter((fl) => (fl.type === 'select' || fl.type === 'checkbox') && fl.key !== 'consent');
  const focusList = list.filter((s) => s.formId === focus?.id);
  const choices = choiceFields.map((fl) => {
    const counts: Record<string, number> = {};
    focusList.forEach((s) => (s.data[fl.key] ?? '').split(', ').filter(Boolean).forEach((v) => { counts[v] = (counts[v] ?? 0) + 1; }));
    return { fl, rows: Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6) };
  });

  const period = `${fmt(from)} – ${fmt(to)}`;
  return (
    <>
      <PageHeader title="Form Dashboard" sub={`สรุปข้อมูลที่ส่งเข้ามาจากฟอร์มบนเว็บไซต์ · ${period}`}
        actions={<><Button icon={Inbox} onClick={() => navigate('/form')}>ไปที่ Submissions</Button><Button icon={Download} onClick={() => toast('ส่งออกรายงานแล้ว', `form-dashboard-${from}_${to}.xlsx`)}>ส่งออกรายงาน</Button></>} />

      <section className="card row" style={{ gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', padding: '16px 20px' }}>
        <Field label="ฟอร์ม" style={{ width: 240 }}><Select value={formId} onChange={(e) => setFormId(e.target.value)} options={[{ value: 'all', label: 'ทุกฟอร์ม' }, ...forms.map((f) => ({ value: f.id, label: f.name }))]} /></Field>
        <Field label="ช่วงเวลา" style={{ width: 180 }}><Select value={range} onChange={(e) => setRange(e.target.value)} options={['7 วันล่าสุด', '14 วันล่าสุด', '30 วันล่าสุด', 'กำหนดช่วงเวลา']} /></Field>
        {custom && (
          <>
            <Field label="วันที่เริ่มต้น" style={{ width: 170 }}><Input type="date" value={start} max={end || undefined} onChange={(e) => setStart(e.target.value)} /></Field>
            <Field label="วันที่สิ้นสุด" style={{ width: 170 }}><Input type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} /></Field>
          </>
        )}
        {badRange && <span className="field-error" style={{ marginBottom: 10 }}>⚠️ ช่วงวันที่ไม่ถูกต้อง</span>}
        <span className="t-sm t-tertiary" style={{ marginLeft: 'auto', marginBottom: 10 }}>ข้อมูลตัวอย่างถึง 26/11/2026</span>
      </section>

      <div className="fd-kpis">
        <Kpi icon={Inbox} tone="#1f6fa8" label="ข้อมูลที่ส่งเข้ามา" value={list.length.toLocaleString()} sub={`เฉลี่ย ${(list.length / Math.max(1, days.length)).toFixed(1)} รายการ / วัน`} />
        <Kpi icon={Clock} tone="#e0a43a" label="รอติดต่อ (ใหม่)" value={(status['ใหม่'] ?? 0).toLocaleString()} sub={`กำลังติดต่อ ${(status['กำลังติดต่อ'] ?? 0).toLocaleString()} รายการ`} />
        <Kpi icon={CheckCircle2} tone="#1a9a8a" label="อัตราติดต่อสำเร็จ" value={`${pct(status['ติดต่อแล้ว'] ?? 0, closed)}%`} sub={`จาก ${closed.toLocaleString()} รายการที่ปิดงานแล้ว`} />
        <Kpi icon={AlertTriangle} tone="#d9534f" label="ค้างเกิน 24 ชม." value={overdue.toLocaleString()} sub="สถานะใหม่ ยังไม่มีผู้ติดต่อ" />
      </div>

      <Card title="จำนวนข้อมูลที่ส่งเข้ามารายวัน" sub={formId === 'all' ? 'แยกตามฟอร์ม' : shownForms[0]?.name}>
        <div className="fd-chart">
          {daily.map(({ d, parts }) => {
            const total = parts.reduce((a, p) => a + p.n, 0);
            return (
              <div key={d} className="fd-col" title={`${fmt(d)} · ${total} รายการ`}>
                <div className="fd-stack" style={{ height: `${(total / maxDay) * 100}%` }}>
                  {parts.filter((p) => p.n).map((p) => <i key={p.id} style={{ flexGrow: p.n, background: colorOf(p.id) }} />)}
                </div>
                <span className="fd-x">{days.length <= 14 || d.endsWith('01') || Number(d.slice(8)) % 5 === 0 ? d.slice(8) : ''}</span>
              </div>
            );
          })}
        </div>
        <div className="row t-sm" style={{ gap: 14, flexWrap: 'wrap', marginTop: 10 }}>
          {shownForms.map((f) => <span key={f.id} className="row" style={{ gap: 6 }}><i className="fd-dot" style={{ background: colorOf(f.id) }} />{f.name}</span>)}
        </div>
      </Card>

      <Card title="สรุปตามฟอร์ม">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>ฟอร์ม</th><th style={{ textAlign: 'right' }}>ทั้งหมด</th>{LEAD_STATUSES.map((s) => <th key={s} style={{ textAlign: 'right' }}>{s}</th>)}<th style={{ width: 200 }}>สัดส่วนสถานะ</th><th style={{ textAlign: 'right' }}>ติดต่อสำเร็จ</th></tr></thead>
            <tbody>
              {shownForms.map((f) => {
                const rows = list.filter((s) => s.formId === f.id);
                const c = (st: string) => rows.filter((s) => s.status === st).length;
                return (
                  <tr key={f.id} className="row-link" onClick={() => navigate(`/form?form=${f.id}`)} style={{ cursor: 'pointer' }}>
                    <td><span className="row" style={{ gap: 8 }}><i className="fd-dot" style={{ background: colorOf(f.id) }} /><b style={{ fontWeight: 500 }}>{f.name}</b></span></td>
                    <td style={{ textAlign: 'right' }}><b style={{ fontWeight: 500 }}>{rows.length.toLocaleString()}</b></td>
                    {LEAD_STATUSES.map((s) => <td key={s} style={{ textAlign: 'right' }}><span className={`lead-st ${ST_CLASS[s]}`} style={{ fontSize: 13 }}>{c(s)}</span></td>)}
                    <td><div className="fd-split">{LEAD_STATUSES.map((s) => <i key={s} style={{ flexGrow: c(s), background: ST_COLOR[s] }} />)}</div></td>
                    <td style={{ textAlign: 'right' }}>{pct(c('ติดต่อแล้ว'), c('ติดต่อแล้ว') + c('ไม่สำเร็จ'))}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="fd-grid">
        <Card title="ช่องทางที่มา" sub="จาก utm_source ของลิงก์แคมเปญ">
          <BarList rows={CHANNELS.map((c) => [c, channels.find(([k]) => k === c)?.[1] ?? 0] as [string, number]).filter(([, v]) => v).sort((a, b) => b[1] - a[1])} total={list.length} />
        </Card>
        <Card title="สถานะการติดต่อ">
          <BarList rows={LEAD_STATUSES.map((s) => [s, status[s] ?? 0] as [string, number])} total={list.length} colors={ST_COLOR} />
        </Card>
        {choices.map(({ fl, rows }) => (
          <Card key={fl.key} title={`${fl.label} — ยอดนิยม`} sub={focus?.name}>
            <BarList rows={rows} total={focusList.length} color={colorOf(focus?.id ?? '')} />
          </Card>
        ))}
        <Card title="งานที่กำลังติดต่อ ตามผู้รับผิดชอบ">
          <BarList rows={owners} total={status['กำลังติดต่อ'] ?? 0} color="#e0a43a" />
        </Card>
      </div>
    </>
  );
}
