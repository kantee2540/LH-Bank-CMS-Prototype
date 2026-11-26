import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Pencil, Copy, Inbox, ArrowUp, ArrowDown, Trash2, Lock, ShieldCheck } from 'lucide-react';
import { Button, Card, Field, Input, Select, Textarea, IconButton, Status, PageHeader, InfoBanner, Modal } from '../components/ui';
import { useStore } from '../store';
import { FIELD_TYPES } from '../data/forms';
import type { FieldType, FormDef, FormField } from '../data/forms';
import './pages.css';

const today = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
};
const hasOptions = (t: FieldType) => t === 'select' || t === 'checkbox';
const CONSENT: FormField = { key: 'consent', label: 'ยินยอมตามนโยบายความเป็นส่วนตัว (PDPA)', type: 'checkbox', required: true, inList: false, options: ['ยินยอม'] };
const newForm = (): FormDef => ({
  id: '', name: '', desc: '', status: 'Draft', path: '/th/', notify: '', retention: '1 ปี', updated: today(),
  fields: [
    { key: 'first', label: 'ชื่อ', type: 'text', required: true, inList: true, pii: true },
    { key: 'last', label: 'นามสกุล', type: 'text', required: true, inList: true, pii: true },
    { key: 'phone', label: 'เบอร์โทรศัพท์', type: 'phone', required: true, inList: true, pii: true },
    CONSENT,
  ],
});

/* ================= FB-01 รายการฟอร์ม ================= */
export function FormBuilderList() {
  const { forms, setForms, submissions, toast } = useStore();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title="Form Builder" sub="สร้างและจัดการฟอร์มบนเว็บไซต์ · กำหนดช่องข้อมูลได้เอง ตาราง Submissions และ Dashboard ปรับตามอัตโนมัติ"
        actions={<Button variant="primary" icon={Plus} onClick={() => navigate('/form/builder/new')}>สร้างฟอร์ม</Button>} />
      <section className="card">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th className="col-no">ลำดับ</th><th>ชื่อฟอร์ม</th><th>ตำแหน่งบนเว็บ</th><th style={{ textAlign: 'center' }}>จำนวนช่อง</th><th style={{ textAlign: 'right' }}>ข้อมูลที่ส่งเข้ามา</th><th>สถานะ</th><th>แก้ไขล่าสุด</th><th>Action</th></tr></thead>
            <tbody>
              {forms.map((f, i) => (
                <tr key={f.id}>
                  <td className="col-no">{i + 1}</td>
                  <td style={{ maxWidth: 280 }}><b style={{ fontWeight: 500 }}>{f.name}</b><div className="sub">{f.desc}</div></td>
                  <td className="t-sm">{f.path}</td>
                  <td style={{ textAlign: 'center' }}>{f.fields.length}</td>
                  <td style={{ textAlign: 'right' }}>{submissions.filter((s) => s.formId === f.id).length.toLocaleString()}</td>
                  <td><Status status={f.status} /></td>
                  <td className="t-sm">{f.updated}</td>
                  <td>
                    <div className="row" style={{ gap: 2 }}>
                      <IconButton icon={Pencil} title="แก้ไขฟอร์ม" onClick={() => navigate(`/form/builder/${f.id}`)} />
                      <IconButton icon={Inbox} title="ดู Submissions" onClick={() => navigate(`/form?form=${f.id}`)} />
                      <IconButton icon={Copy} title="ทำสำเนา" onClick={() => { const id = `${f.id}-copy-${Date.now() % 1000}`; setForms([...forms, { ...f, id, name: `${f.name} (สำเนา)`, status: 'Draft', updated: today() }]); toast('ทำสำเนาฟอร์มแล้ว', f.name); }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

/* ฟิลด์ตัวอย่างในพรีวิว */
function PreviewField({ fl }: { fl: FormField }) {
  const label = <>{fl.label || 'ไม่มีชื่อช่อง'}{fl.required && <span className="req">*</span>}</>;
  if (fl.type === 'checkbox') {
    return (
      <div className="field"><span className="field-label">{fl.key === 'consent' ? null : label}</span>
        {(fl.options?.length ? fl.options : ['ตัวเลือก']).map((o) => (
          <label key={o} className="row t-sm" style={{ gap: 6 }}><input type="checkbox" className="cb" disabled />{fl.key === 'consent' ? fl.label : o}{fl.key === 'consent' && fl.required && <span className="req">*</span>}</label>
        ))}
      </div>
    );
  }
  return (
    <Field label={label}>
      {fl.type === 'select' ? <Select disabled options={['เลือก…', ...(fl.options ?? [])]} />
        : fl.type === 'textarea' ? <Textarea disabled rows={2} placeholder={fl.placeholder} />
          : <Input disabled type={fl.type === 'date' ? 'date' : 'text'} placeholder={fl.placeholder ?? (fl.type === 'phone' ? '08x-xxx-xxxx' : fl.type === 'email' ? 'name@example.com' : '')} />}
    </Field>
  );
}

/* ================= FB-02 สร้าง / แก้ไขฟอร์ม ================= */
export function FormBuilderEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { forms, setForms, submissions, toast } = useStore();
  const isNew = id === 'new';
  const original = forms.find((f) => f.id === id);
  const [form, setForm] = useState<FormDef>(() => (original ? structuredClone(original) : newForm()));
  const [tried, setTried] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);
  const used = submissions.filter((s) => s.formId === form.id).length;

  if (!isNew && !original) {
    return <section className="card ph"><h3 className="t-h3">ไม่พบฟอร์ม</h3><Button onClick={() => navigate('/form/builder')}>กลับไปรายการฟอร์ม</Button></section>;
  }

  const setField = (i: number, patch: Partial<FormField>) => setForm({ ...form, fields: form.fields.map((fl, j) => (j === i ? { ...fl, ...patch } : fl)) });
  const move = (i: number, d: -1 | 1) => {
    const next = [...form.fields];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setForm({ ...form, fields: next });
  };
  const addField = () => {
    const fields = [...form.fields];
    const at = fields.findIndex((fl) => fl.key === 'consent');
    fields.splice(at < 0 ? fields.length : at, 0, { key: `f${Date.now()}`, label: '', type: 'text', required: false, inList: false });
    setForm({ ...form, fields });
  };
  const errs = {
    name: !form.name.trim() ? 'กรุณากรอกชื่อฟอร์ม' : '',
    notify: !/^\S+@\S+\.\S+$/.test(form.notify) ? 'กรุณากรอกอีเมลแจ้งเตือนให้ถูกต้อง' : '',
    fields: form.fields.some((fl) => !fl.label.trim()) ? 'มีช่องที่ยังไม่ได้ตั้งชื่อ' : form.fields.some((fl) => hasOptions(fl.type) && fl.key !== 'consent' && !fl.options?.length) ? 'ช่องแบบตัวเลือกต้องมีอย่างน้อย 1 ตัวเลือก' : '',
    list: !form.fields.some((fl) => fl.inList) ? 'เลือกอย่างน้อย 1 ช่องให้แสดงในตาราง' : '',
  };
  const invalid = Object.values(errs).some(Boolean);
  const save = (status: FormDef['status']) => {
    setTried(true);
    if (invalid) return;
    const item: FormDef = { ...form, id: form.id || `form-${Date.now() % 100000}`, status, updated: today() };
    setForms(isNew ? [...forms, item] : forms.map((f) => (f.id === item.id ? item : f)));
    toast(status === 'Published' ? 'เผยแพร่ฟอร์มแล้ว' : 'บันทึก Draft แล้ว', `${item.name} · ${item.fields.length} ช่อง · ตาราง Submissions อัปเดตตามช่องใหม่`);
    navigate('/form/builder');
  };

  return (
    <>
      <PageHeader
        back="/form/builder"
        title={isNew ? 'สร้างฟอร์ม' : `แก้ไขฟอร์ม · ${original?.name}`}
        badges={!isNew && original ? <Status status={original.status} /> : undefined}
        actions={<><Button onClick={() => navigate('/form/builder')}>ยกเลิก</Button><Button onClick={() => save('Draft')}>บันทึก Draft</Button><Button variant="primary" onClick={() => save('Published')}>เผยแพร่</Button></>}
      />
      {tried && invalid && <div className="note-soft-warning">⚠️ {Object.values(errs).filter(Boolean).join(' · ')}</div>}
      <div className="fb-layout">
        <div className="col" style={{ gap: 20, minWidth: 0 }}>
          <Card title="ข้อมูลฟอร์ม">
            <div className="col">
              <Field label="ชื่อฟอร์ม" required error={tried ? errs.name || null : null}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น สมัครสินเชื่อ SME" /></Field>
              <Field label="คำอธิบาย"><Input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></Field>
              <div className="grid-2">
                <Field label="ตำแหน่งบนเว็บ (Path)"><Input value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} /></Field>
                <Field label="ส่งแจ้งเตือนไปที่" required error={tried ? errs.notify || null : null}><Input value={form.notify} onChange={(e) => setForm({ ...form, notify: e.target.value })} placeholder="team@lhbank.co.th" /></Field>
              </div>
              <Field label="ลบข้อมูลอัตโนมัติหลัง" style={{ maxWidth: 260 }}><Select value={form.retention} onChange={(e) => setForm({ ...form, retention: e.target.value })} options={['180 วัน', '1 ปี', '2 ปี', 'จนกว่าจะยกเลิก']} /></Field>
            </div>
          </Card>

          <Card title={`ช่องข้อมูล (${form.fields.length})`} sub="กำหนดชื่อ ชนิด ช่องบังคับ และเลือกช่องที่จะแสดงเป็นคอลัมน์ในตาราง Submissions" action={<Button size="sm" icon={Plus} onClick={addField}>เพิ่มช่อง</Button>}>
            {used > 0 && <InfoBanner>ฟอร์มนี้มีข้อมูลส่งเข้ามาแล้ว {used.toLocaleString()} รายการ · การลบหรือเปลี่ยนช่องไม่กระทบข้อมูลเดิม (ข้อมูลเดิมยังเก็บไว้และ Export ได้)</InfoBanner>}
            {tried && (errs.fields || errs.list) && <p className="field-error">⚠️ {errs.fields || errs.list}</p>}
            <div className="col" style={{ gap: 10, marginTop: 8 }}>
              {form.fields.map((fl, i) => {
                const locked = fl.key === 'consent';
                return (
                  <div key={fl.key} className={`fb-field ${locked ? 'locked' : ''}`}>
                    <div className="fb-order">
                      <IconButton icon={ArrowUp} title="เลื่อนขึ้น" disabled={i === 0 || locked} onClick={() => move(i, -1)} />
                      <IconButton icon={ArrowDown} title="เลื่อนลง" disabled={locked || i >= form.fields.length - 1 || form.fields[i + 1]?.key === 'consent'} onClick={() => move(i, 1)} />
                    </div>
                    <div className="col grow" style={{ gap: 10, minWidth: 0 }}>
                      {locked ? (
                        <div className="row" style={{ gap: 8 }}><ShieldCheck size={18} color="#1a9a8a" /><b style={{ fontWeight: 500 }}>{fl.label}</b><span className="t-sm t-secondary">· บังคับทุกฟอร์มตามนโยบาย Compliance</span></div>
                      ) : (
                        <>
                          <div className="fb-row">
                            <Field label="ชื่อช่อง" error={tried && !fl.label.trim() ? 'กรุณาตั้งชื่อช่อง' : null}><Input value={fl.label} onChange={(e) => setField(i, { label: e.target.value })} placeholder="เช่น ชื่อบริษัท" /></Field>
                            <Field label="ชนิดข้อมูล"><Select value={fl.type} onChange={(e) => { const type = e.target.value as FieldType; setField(i, { type, options: hasOptions(type) ? fl.options ?? ['ตัวเลือก 1'] : undefined, pii: type === 'phone' || type === 'email' ? true : fl.pii }); }} options={FIELD_TYPES} /></Field>
                          </div>
                          {hasOptions(fl.type) && (
                            <Field label="ตัวเลือก (คั่นด้วยการขึ้นบรรทัดใหม่)" error={tried && !fl.options?.length ? 'เพิ่มอย่างน้อย 1 ตัวเลือก' : null}>
                              <Textarea rows={3} value={(fl.options ?? []).join('\n')} onChange={(e) => setField(i, { options: e.target.value.split('\n').map((x) => x.trimStart()).filter((x, k, a) => x || k === a.length - 1) })} />
                            </Field>
                          )}
                          <div className="row" style={{ gap: 18, flexWrap: 'wrap' }}>
                            <label className="row t-sm" style={{ gap: 6 }}><input type="checkbox" className="cb" checked={fl.required} onChange={(e) => setField(i, { required: e.target.checked })} /> ช่องบังคับ</label>
                            <label className="row t-sm" style={{ gap: 6 }}><input type="checkbox" className="cb" checked={fl.inList} onChange={(e) => setField(i, { inList: e.target.checked })} /> แสดงในตาราง</label>
                            <label className="row t-sm" style={{ gap: 6 }}><input type="checkbox" className="cb" checked={!!fl.pii} onChange={(e) => setField(i, { pii: e.target.checked })} /> <Lock size={13} /> ข้อมูลส่วนบุคคล (ปิดบัง)</label>
                          </div>
                        </>
                      )}
                    </div>
                    {!locked && <IconButton icon={Trash2} danger title="ลบช่อง" onClick={() => setRemoving(i)} />}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="fb-preview">
          <Card title="ตัวอย่างฟอร์มบนเว็บ" sub="อัปเดตทันทีเมื่อแก้ไขช่องข้อมูล">
            <div className="fb-web">
              <h3 className="t-h3" style={{ margin: 0 }}>{form.name || 'ชื่อฟอร์ม'}</h3>
              {form.desc && <p className="t-sm t-secondary" style={{ margin: 0 }}>{form.desc}</p>}
              {form.fields.map((fl) => <PreviewField key={fl.key} fl={fl} />)}
              <button type="button" className="btn btn-primary" disabled style={{ opacity: 1 }}>ส่งข้อมูล</button>
            </div>
          </Card>
          <Card title="คอลัมน์ในตาราง Submissions">
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              <span className="tag-soft">วันที่ส่ง</span>
              {form.fields.filter((fl) => fl.inList).map((fl) => <span key={fl.key} className="tag-soft on">{fl.label || '—'}</span>)}
              <span className="tag-soft">ช่องทาง</span><span className="tag-soft">สถานะ</span>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={removing !== null} onClose={() => setRemoving(null)} title="ลบช่องข้อมูลนี้?"
        footer={<><Button onClick={() => setRemoving(null)}>ยกเลิก</Button><Button variant="danger" onClick={() => { setForm({ ...form, fields: form.fields.filter((_, j) => j !== removing) }); setRemoving(null); }}>ลบช่อง</Button></>}>
        <p className="t-secondary" style={{ margin: 0 }}>“{removing !== null ? form.fields[removing]?.label || 'ช่องที่ไม่มีชื่อ' : ''}” จะไม่แสดงบนฟอร์มหลังบันทึก{used ? ' · ข้อมูลที่ส่งเข้ามาก่อนหน้ายังเก็บไว้' : ''}</p>
      </Modal>
    </>
  );
}
