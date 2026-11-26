import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Download, Settings, Eye, ShieldCheck, Phone, Lock } from 'lucide-react';
import { Button, Field, Select, Textarea, Tabs, IconButton, Drawer } from '../components/ui';
import ListPage, { selectFilter, textFilter } from '../components/ListPage';
import type { Column } from '../components/ListPage';
import { useStore } from '../store';
import { CHANNELS, LEAD_STATUSES, OWNERS, ST_CLASS, mask } from '../data/forms';
import type { FormDef, FormField, LeadStatus, Submission } from '../data/forms';
import './pages.css';

/* ค่าที่แสดงของฟิลด์ — ปิดบังข้อมูลส่วนบุคคลถ้ายังไม่กดแสดงข้อมูลเต็ม */
const show = (fl: FormField, v: string | undefined, reveal = false) => (fl.pii && !reveal ? mask(fl.type, v ?? '') : v || '—');

/* คอลัมน์ตารางสร้างจากฟิลด์ที่ตั้งค่า "แสดงในตาราง" — ชื่อ + นามสกุลรวมเป็นคอลัมน์เดียว */
function fieldColumns(form: FormDef): Column<Submission>[] {
  const listed = form.fields.filter((fl) => fl.inList);
  const first = listed.find((fl) => fl.key === 'first');
  const last = listed.find((fl) => fl.key === 'last');
  return listed
    .filter((fl) => fl.key !== 'last' || !first)
    .map((fl): Column<Submission> => {
      if (fl.key === 'first' && last) {
        return { key: 'name', label: 'ชื่อ - นามสกุล', render: (r) => <b style={{ fontWeight: 500 }}>{show(fl, r.data.first)} {show(last, r.data.last)}</b> };
      }
      return {
        key: fl.key,
        label: fl.label,
        render: (r) => <span style={{ whiteSpace: fl.type === 'phone' || fl.type === 'date' ? 'nowrap' : undefined }}>{show(fl, r.data[fl.key])}</span>,
      };
    });
}

/* CMS-19 Form · Submissions — ตาราง / ตัวกรอง / รายละเอียด สร้างตามนิยามฟอร์ม (Dynamic) */
export default function Leads() {
  const { toast, forms, submissions, setSubmissions } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('form') ?? forms[0]?.id ?? '');
  const [detail, setDetail] = useState<Submission | null>(null);
  const [revealed, setRevealed] = useState(false);
  const form = forms.find((x) => x.id === tab) ?? forms[0];
  const rows = submissions.filter((s) => s.formId === form.id);
  const count = (st: LeadStatus) => rows.filter((r) => r.status === st).length;
  const selectField = form.fields.find((fl) => fl.type === 'select' && fl.inList);
  const update = (patch: Partial<Submission>) => {
    if (!detail) return;
    const next = { ...detail, ...patch };
    setSubmissions((list) => list.map((r) => (r.id === detail.id ? next : r)));
    setDetail(next);
  };
  const phoneField = form.fields.find((fl) => fl.type === 'phone');

  return (
    <ListPage<Submission>
      key={form.id}
      title="Submissions"
      headerActions={<Button onClick={() => navigate('/form/dashboard')}>ดู Dashboard สรุป</Button>}
      filters={[
        textFilter('q', 'ค้นหา (ชื่อ / เบอร์ / อีเมล)', (r) => Object.values(r.data).join(' ')),
        ...(selectField ? [selectFilter<Submission>('f', selectField.label, selectField.options ?? [], (r) => r.data[selectField.key] ?? '')] : []),
        selectFilter<Submission>('s', 'สถานะการติดต่อ', LEAD_STATUSES, (r) => r.status),
        selectFilter<Submission>('c', 'ช่องทาง', CHANNELS, (r) => r.channel),
      ]}
      above={<Tabs value={form.id} onChange={setTab} style={{ marginBottom: 16, marginTop: -8 }} tabs={forms.map((x) => ({ value: x.id, label: `${x.name}${x.status === 'Draft' ? ' (Draft)' : ''}` }))} />}
      banner={
        <div className="kpis">
          {LEAD_STATUSES.map((s) => (
            <div className={`kpi lead-kpi ${ST_CLASS[s]}`} key={s}>
              <div className="t-secondary">{s === 'ใหม่' ? 'รายการใหม่' : s}</div>
              <div className="num">{count(s)}</div>
            </div>
          ))}
        </div>
      }
      rows={rows}
      rowKey={(r) => r.id}
      toolbar={
        <>
          <Button icon={Download} onClick={() => toast('Export Excel', `${form.name} · ${rows.length} รายการ · ไฟล์ถูกเข้ารหัส · บันทึกใน Audit Log`)}>Export Excel</Button>
          <Button icon={Settings} onClick={() => navigate(`/form/builder/${form.id}`)}>ตั้งค่าฟอร์ม</Button>
        </>
      }
      toolbarRight={<span className="row t-secondary" style={{ gap: 8 }}><ShieldCheck size={18} color="#1f6fa8" /> ข้อมูลส่วนบุคคล · แสดงเฉพาะผู้มีสิทธิ์ และบันทึกการเข้าดูใน Audit Log</span>}
      empty="ยังไม่มีข้อมูลส่งเข้ามาจากฟอร์มนี้"
      columns={[
        { key: 'd', label: 'วันที่ส่ง', render: (r) => <span style={{ whiteSpace: 'pre-line' }}>{r.date.replace(' ', '\n')}</span> },
        ...fieldColumns(form),
        { key: 'ch', label: 'ช่องทาง', render: (r) => <span className="tag-soft">{r.channel}</span> },
        { key: 's', label: 'สถานะ', render: (r) => <span className={`lead-st ${ST_CLASS[r.status]}`}>{r.status}</span> },
        { key: 'a', label: 'Action', render: (r) => <IconButton icon={Eye} title="ดูรายละเอียด" onClick={() => { setDetail(r); setRevealed(false); }} /> },
      ]}
    >
      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title={`รายละเอียด · ${form.name}`}
        footer={<><Button onClick={() => setDetail(null)}>ปิด</Button><Button variant="primary" onClick={() => { toast('บันทึกแล้ว', `${detail?.status}`); setDetail(null); }}>บันทึก</Button></>}
      >
        {detail && (
          <>
            <div className="ready-box">
              <div className="row-between"><span className="t-secondary">วันที่ส่ง</span><b>{detail.date}</b></div>
              <div className="row-between"><span className="t-secondary">ช่องทาง</span><b>{detail.channel}</b></div>
              {form.fields.map((fl) => (
                <div className="row-between" key={fl.key} style={{ gap: 16, alignItems: 'flex-start' }}>
                  <span className="t-secondary">{fl.label}</span>
                  <b style={{ textAlign: 'right' }}>
                    {fl.key === 'consent' ? <span className="row" style={{ gap: 4 }}><ShieldCheck size={16} color="#1a9a8a" /> {detail.data.consent || '—'}</span> : show(fl, detail.data[fl.key], revealed)}
                  </b>
                </div>
              ))}
            </div>
            {form.fields.some((fl) => fl.pii) && (!revealed ? (
              <Button icon={Lock} onClick={() => { setRevealed(true); toast('เปิดดูข้อมูลเต็ม', 'บันทึกการเข้าดูใน Audit Log แล้ว'); }}>แสดงข้อมูลเต็ม (บันทึกใน Audit Log)</Button>
            ) : phoneField && detail.data[phoneField.key] ? (
              <Button icon={Phone} variant="primary">โทร {detail.data[phoneField.key]}</Button>
            ) : null)}
            <Field label="สถานะการติดต่อ"><Select value={detail.status} onChange={(e) => update({ status: e.target.value as LeadStatus })} options={LEAD_STATUSES} /></Field>
            <Field label="ผู้รับผิดชอบ"><Select value={detail.owner ?? ''} onChange={(e) => update({ owner: e.target.value || undefined })} options={[{ value: '', label: '— ยังไม่มอบหมาย —' }, ...OWNERS]} /></Field>
            <Field label="บันทึกการติดต่อ"><Textarea rows={3} value={detail.note ?? ''} onChange={(e) => update({ note: e.target.value })} placeholder="เช่น นัดโทรกลับ 31/10 18:00" /></Field>
          </>
        )}
      </Drawer>
    </ListPage>
  );
}
