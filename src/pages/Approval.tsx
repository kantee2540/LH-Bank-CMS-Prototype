import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RefreshCw, Eye, ArrowLeft, Maximize2, Lock, Check, X, FileText, ExternalLink } from 'lucide-react';
import { Button, Card, Field, Input, Select, Textarea, Tabs, Toggle, Status, Modal, PageHeader } from '../components/ui';
import { useStore } from '../store';
import { openPreview } from './Preview';
import type { RequestItem, RequestTab } from '../types';
import './pages.css';
import { PHOTOS } from '../data/photos';

/* ภาพ Hero ตัวอย่าง (สินเชื่อรีไฟแนนซ์บ้าน) */
const PF_HERO = { backgroundImage: `linear-gradient(90deg, rgba(18,56,107,.9), rgba(18,56,107,.35)), url(${PHOTOS.familyAdvisor})`, backgroundSize: 'cover', backgroundPosition: 'center' };

const SLA: Record<string, [string, string]> = { r1: ['เหลือ 6 ชม.', 'sla-red'], r2: ['เหลือ 1 วัน', 'sla-amber'] };
const slaOf = (r: RequestItem): [string, string] => SLA[r.id] ?? (r.fresh ? ['เหลือ 3 วัน', 'sla-green'] : ['เหลือ 2 วัน', 'sla-green']);

/* AU-01 Approval Inbox — งานรออนุมัติ (Auditor)
   history = true → เมนู "ประวัติการอนุมัติ" (sidebar Auditor) แสดงเฉพาะคำขอที่ตัดสินใจแล้ว */
export function ApprovalInbox({ history = false }: { history?: boolean }) {
  const navigate = useNavigate();
  const { requests } = useStore();
  const [tab, setTab] = useState<RequestTab | 'all'>(history ? 'all' : 'pending');
  const [module, setModule] = useState('ทั้งหมด');
  const [q, setQ] = useState('');
  const list = useMemo(() => requests.filter((r) => (tab === 'all' ? !history || r.tab !== 'pending' : r.tab === tab) && (module === 'ทั้งหมด' || r.module === module) && (!q || r.title.includes(q))), [requests, tab, module, q, history]);
  const pending = requests.filter((r) => r.tab === 'pending').length;
  return (
    <>
      {history
        ? <PageHeader title="ประวัติการอนุมัติ" sub="คำขอที่คุณอนุมัติหรือส่งกลับแก้ไขแล้ว · แก้ไขหรือลบไม่ได้ เก็บ 2 ปีตาม Audit Log"
            actions={<Button icon={Eye} onClick={() => navigate('/approval')}>ไปที่งานรออนุมัติ</Button>} />
        : <PageHeader title="งานรออนุมัติ" sub="Auditor ตรวจสอบเนื้อหาจาก Content Editor ก่อนเผยแพร่ · ทุกการตัดสินใจถูกบันทึกใน Audit Log"
            actions={<Button icon={RefreshCw} onClick={() => navigate('/approval/history')}>ประวัติการอนุมัติ</Button>} />}
      <div className="kpis">
        {[['#e8a557', 'รออนุมัติ', pending, 'รายการทั้งหมดที่ส่งถึงคุณ'], ['#e0625a', 'ใกล้ครบ SLA', 2, 'ต้องตัดสินใจภายใน 24 ชม.'], ['#5ab4b8', 'อนุมัติแล้ววันนี้', 5 + requests.filter((r) => r.tab === 'approved' && r.sub.includes('อนุมัติแล้ว')).length, 'เผยแพร่ทันที 3 · ตั้งเวลา 2'], ['#2f86c1', 'ส่งกลับแก้ไข (เดือนนี้)', 3, 'เฉลี่ยแก้ไข 1.2 รอบ/รายการ']].map(([c, l, n, s]) => (
          <div className="kpi" key={l as string}><div className="lbl"><i style={{ background: c as string }} />{l}</div><div className="num">{n}</div><div className="t-sm t-secondary">{s}</div></div>
        ))}
      </div>
      <section className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 18px 0' }}>
          <Tabs value={tab} onChange={setTab} tabs={history ? [{ value: 'all', label: 'ทั้งหมด' }, { value: 'approved', label: 'อนุมัติแล้ว' }, { value: 'rejected', label: 'ส่งกลับแก้ไข' }] : [{ value: 'pending', label: `รออนุมัติ (${pending})` }, { value: 'rejected', label: `ส่งกลับแก้ไข (${requests.filter((r) => r.tab === 'rejected').length})` }, { value: 'approved', label: 'อนุมัติแล้ว' }, { value: 'all', label: 'ทั้งหมด' }]} />
          <div className="filter-bar" style={{ gridTemplateColumns: 'repeat(5, minmax(0,1fr))', margin: '16px 0' }}>
            <Field label="หมวดหมู่"><Select value={module} onChange={(e) => setModule(e.target.value)} options={['ทั้งหมด', ...new Set(requests.map((r) => r.module))]} /></Field>
            <Field label="เว็บไซต์"><Select options={['Personal', 'SME', 'Corporate']} /></Field>
            <Field label="ผู้ส่ง (Content Editor)"><Select options={['ทั้งหมด', 'Content Editor 01', 'Content Editor 02']} /></Field>
            <Field label="ประเภทคำขอ"><Select options={['สร้างใหม่ / แก้ไข', 'สร้างใหม่', 'แก้ไข', 'ลบ']} /></Field>
            <Field label="ค้นหา"><Input placeholder="ชื่อรายการ..." value={q} onChange={(e) => setQ(e.target.value)} /></Field>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th className="col-no">ลำดับ</th><th>รายการ</th><th>หมวดหมู่</th><th>ผู้ส่ง</th><th>ส่งเมื่อ</th><th>ต้องการเผยแพร่</th><th>{tab === 'pending' ? 'SLA' : 'สถานะ'}</th><th>Action</th></tr></thead>
            <tbody>
              {list.map((r, i) => {
                const [sla, cls] = slaOf(r);
                return (
                  <tr key={r.id} className={i === 0 && tab === 'pending' ? 'highlight' : ''}>
                    <td className="col-no" style={{ borderLeft: i === 0 && tab === 'pending' ? '3px solid var(--lh-nav-active)' : undefined }}>{i + 1}</td>
                    <td><b style={{ fontWeight: 500 }}>{r.title}</b><div className="sub">{r.sub.split(' · ')[0]} · {r.sub.split(' · ')[1] ?? ''}</div></td>
                    <td><span className={`tag ${i === 0 && tab === 'pending' ? 'tag-solid' : 'tag-blue'}`} style={{ borderRadius: 999, fontSize: 15 }}>{r.module}</span></td>
                    <td>{r.id === 'r3' || r.id === 'r5' || r.id === 'r6' ? 'Content Editor 02' : 'Content Editor 01'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{r.sent}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{r.publish}</td>
                    <td>{tab === 'pending' ? <span className={`sla ${cls}`}>{sla}</span> : <Status status={r.state} />}</td>
                    <td>{r.tab === 'pending' ? <Button size="sm" variant={i === 0 ? 'primary' : 'secondary'} icon={Eye} onClick={() => navigate(`/approval/${r.id}`)}>ตรวจสอบ</Button> : <Button size="sm" icon={FileText} onClick={() => navigate(`/approval/${r.id}/result`)}>ประวัติ</Button>}</td>
                  </tr>
                );
              })}
              {!list.length && <tr><td colSpan={8} className="t-tertiary" style={{ textAlign: 'center', padding: 40 }}>ไม่มีงานในแท็บนี้ 🎉</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="row-between" style={{ padding: '14px 18px' }}><span>Show 1 - {list.length} of {list.length}</span></div>
      </section>
    </>
  );
}

type Change = { kind: 'แก้ไข' | 'เพิ่ม' | 'ลบ'; section: string; before: string; after: string };
const CHANGES: Change[] = [
  { kind: 'แก้ไข', section: 'Section: Product Hero', before: 'ดอกเบี้ยเริ่มต้น 2.99% ปีแรก', after: 'ดอกเบี้ยเริ่มต้น 2.75% 3 ปีแรก*' },
  { kind: 'แก้ไข', section: 'Section: Product Hero · รูปภาพ', before: 'hero-refinance-v2.jpg', after: 'hero-refinance-v3.webp (1440×640)' },
  { kind: 'เพิ่ม', section: 'Section: Tools', before: '—', after: 'Calculator · รีไฟแนนซ์ช่วยประหยัดเท่าไร?' },
  { kind: 'แก้ไข', section: 'Section: Disclaimer', before: '*เงื่อนไขเป็นไปตามที่ธนาคารกำหนด', after: '*อัตราดอกเบี้ยเฉลี่ย 3 ปีแรก 2.75% ต่อปี (MRR-x.xx%) เงื่อนไขเป็นไปตามที่ธนาคารกำหนด' },
  { kind: 'ลบ', section: 'Section: FAQ', before: 'ค่าธรรมเนียมรีไฟแนนซ์มีอะไรบ้าง?', after: '—' },
];
const CHECKS = ['เนื้อหา TH / EN ครบและตรงกัน', 'อัตราดอกเบี้ยตรงกับหมวดหมู่ Rates', 'มี Disclaimer ตามเกณฑ์ Compliance', 'ลิงก์และปุ่ม CTA ใช้งานได้', 'รูปภาพมีสิทธิ์ใช้งาน / Alt text'];

/* AU-02 Review — ตรวจสอบ & เปรียบเทียบเวอร์ชัน · AU-03 Approve · AU-04 Reject */
export function ApprovalReview() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { requests, decideRequest, toast } = useStore();
  const r = requests.find((x) => x.id === id) ?? requests[0];
  const [tab, setTab] = useState<'diff' | 'desktop' | 'mobile' | 'seo'>('diff');
  const [onlyChanged, setOnlyChanged] = useState(true);
  const [checks, setChecks] = useState([true, true, true, false, false]);
  const [comments, setComments] = useState([{ by: 'Auditor · 28/10 15:20 (รอบที่ 1)', text: 'Disclaimer ยังไม่ระบุอัตรา MRR — แก้แล้วในรอบนี้' }]);
  const [comment, setComment] = useState('');
  const [approve, setApprove] = useState(false);
  const [reject, setReject] = useState(false);
  const [when, setWhen] = useState<'now' | 'schedule'>('schedule');
  const [confirmed, setConfirmed] = useState(false);
  const [reasons, setReasons] = useState(['เนื้อหาไม่ถูกต้อง', 'ไม่ตรงเกณฑ์ Compliance']);
  const [sections, setSections] = useState(['Product Hero', 'Disclaimer']);
  const [detail, setDetail] = useState('1) ปุ่ม "สมัครเลย" ใน Hero ยังลิงก์ไป Microsite แคมเปญเดิม\n2) Disclaimer ต้องระบุวันที่มีผลของค่าอัตรา (01/11/2026) ตามประกาศ');
  const allChecked = checks.every(Boolean);
  const toggle = (arr: string[], v: string, set: (a: string[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="with-bottom-bar">
      <PageHeader title={<span className="row"><Link to="/approval"><ArrowLeft size={18} /></Link>ตรวจสอบ · {r.title}</span>}
        badges={<><span className="status status-scheduled" style={{ background: '#fbe9df', color: '#8a3e1f' }}>รออนุมัติ</span><span className="sla sla-red">SLA {slaOf(r)[0]}</span></>}
        actions={<Button icon={Maximize2} onClick={() => openPreview({ title: r.title, type: r.module, excerpt: r.sub })}>เปิด Preview แท็บใหม่</Button>} />
      <div className="split" style={{ gridTemplateColumns: 'minmax(0,1fr) 320px' }}>
        <section className="card">
          <Tabs value={tab} onChange={setTab} style={{ marginBottom: 14 }} tabs={[{ value: 'diff', label: 'เปรียบเทียบเวอร์ชัน' }, { value: 'desktop', label: 'Preview Desktop' }, { value: 'mobile', label: 'Preview Mobile' }, { value: 'seo', label: 'SEO' }]} />
          {tab === 'diff' && (
            <>
              <div className="row-between" style={{ marginBottom: 10 }}>
                <div className="row" style={{ gap: 8 }}><span className="tag">v12 · เผยแพร่อยู่ (12/10/2026)</span>→<span className="tag tag-blue">v13 · ฉบับร่างที่ส่งอนุมัติ</span></div>
                <span className="row" style={{ gap: 8 }}><Toggle checked={onlyChanged} onChange={setOnlyChanged} />เฉพาะส่วนที่เปลี่ยน</span>
              </div>
              <div className="row" style={{ gap: 6, marginBottom: 12 }}><span className="tag tag-yellow">แก้ไข 3</span><span className="tag tag-green">เพิ่ม 1</span><span className="tag tag-red">ลบ 1</span></div>
              <div className="col" style={{ gap: 10 }}>
                {!onlyChanged && <div className="diff-card"><div className="row-between"><span className="row"><span className="tag">ไม่เปลี่ยน</span><b style={{ fontWeight: 500 }}>Section: Breadcrumb</b></span></div><p className="t-secondary mt-8">หน้าแรก › ลูกค้าบุคคล › สินเชื่อ › รีไฟแนนซ์บ้าน</p></div>}
                {CHANGES.map((c) => (
                  <div className="diff-card" key={c.section}>
                    <div className="row-between"><span className="row"><span className={`tag ${c.kind === 'แก้ไข' ? 'tag-yellow' : c.kind === 'เพิ่ม' ? 'tag-green' : 'tag-red'}`}>{c.kind}</span><b style={{ fontWeight: 500 }}>{c.section}</b></span><a className="t-link t-sm row" style={{ gap: 4 }}>ไปที่ตำแหน่ง <ExternalLink size={13} /></a></div>
                    <div className="grid-2 mt-8" style={{ gap: 10 }}>
                      <div className="diff-before"><div className="t-sm">ก่อน (v12)</div><s>{c.before}</s></div>
                      <div className="diff-after"><div className="t-sm">หลัง (v13)</div><b style={{ fontWeight: 500 }}>{c.after}</b></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === 'desktop' && <div className="preview-frame"><div className="pf-hero" style={PF_HERO}><b>สินเชื่อรีไฟแนนซ์บ้าน</b><span>ดอกเบี้ยเริ่มต้น 2.75% 3 ปีแรก*</span><button>สมัครเลย</button></div><div className="pf-row"><i /><i /><i /></div><p className="t-sm t-secondary" style={{ padding: 16 }}>*อัตราดอกเบี้ยเฉลี่ย 3 ปีแรก 2.75% ต่อปี (MRR-x.xx%)</p></div>}
          {tab === 'mobile' && <div className="preview-frame mobile"><div className="pf-hero" style={PF_HERO}><b>สินเชื่อรีไฟแนนซ์บ้าน</b><span>ดอกเบี้ยเริ่มต้น 2.75% 3 ปีแรก*</span><button>สมัครเลย</button></div><div className="pf-row col"><i /><i /></div></div>}
          {tab === 'seo' && <div className="serp"><div className="t-sm t-secondary">lhbank.co.th › th › personal › loan › refinance</div><div className="title">รีไฟแนนซ์บ้าน ดอกเบี้ยคงที่ 3 ปีแรก | LH Bank</div><div className="t-sm t-secondary">รีไฟแนนซ์บ้านกับ LH Bank ลดค่างวด ดอกเบี้ยเฉลี่ย 3 ปีแรก x.xx% คำนวณได้ทันที</div></div>}
        </section>
        <div className="col">
          <Card title="ข้อมูลคำขอ">
            {[['ผู้ส่ง (Content Editor)', 'Content Editor 01'], ['ส่งเมื่อ', r.sent], ['ประเภท', `แก้ไขหน้า · ${r.module}`], ['ต้องการเผยแพร่', r.publish], ['รอบการส่ง', 'ครั้งที่ 2']].map(([k, v]) => <div className="row-between" key={k} style={{ padding: '5px 0' }}><span className="t-secondary t-sm">{k}</span><b className="t-sm">{v}</b></div>)}
            <div className="ready-box mt-8"><b className="t-sm">หมายเหตุจาก Content Editor</b><span className="t-sm">ปรับอัตราตามแคมเปญ Q4 อ้างอิงประกาศ Rates 01/11/2026 และเพิ่ม Calculator</span></div>
          </Card>
          <Card title="Checklist การตรวจสอบ" action={<b className="t-link">{checks.filter(Boolean).length}/{checks.length}</b>}>
            {CHECKS.map((c, i) => <label key={c} className="row" style={{ padding: '5px 0', cursor: 'pointer' }}><input type="checkbox" className="cb" checked={checks[i]} onChange={() => setChecks(checks.map((x, j) => (j === i ? !x : x)))} /><span className="t-sm">{c}</span></label>)}
          </Card>
          <Card title={`ความคิดเห็น (${comments.length})`}>
            {comments.map((c, i) => <div className="ready-box" key={i} style={{ marginBottom: 8 }}><b className="t-sm">{c.by}</b><span className="t-sm">{c.text}</span></div>)}
            <Field label="เพิ่มความคิดเห็น"><Input placeholder="พิมพ์ความคิดเห็น..." value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && comment.trim()) { setComments([...comments, { by: 'Auditor · ตอนนี้ (รอบที่ 2)', text: comment }]); setComment(''); } }} /></Field>
          </Card>
        </div>
      </div>
      <div className="bottom-bar" style={{ justifyContent: 'space-between' }}>
        <span className="row t-secondary t-sm" style={{ gap: 6 }}><Lock size={14} /> การตัดสินใจจะถูกบันทึกใน Audit Log พร้อมเวลาและ IP · แก้ไขย้อนหลังไม่ได้</span>
        <div className="row"><Button variant="danger" icon={RefreshCw} onClick={() => setReject(true)}>ส่งกลับแก้ไข</Button><Button variant="primary" onClick={() => setApprove(true)}>อนุมัติ</Button></div>
      </div>

      <Modal open={approve} onClose={() => setApprove(false)} width={640} title={<span>ยืนยันการอนุมัติ<div className="t-sm t-secondary" style={{ fontWeight: 400 }}>{r.title} · v13 · แก้ไข 3 · เพิ่ม 1 · ลบ 1</div></span>}
        footer={<div className="row-between" style={{ width: '100%' }}><span className="t-sm t-secondary">บันทึกใน Audit Log อัตโนมัติ</span><div className="row"><Button onClick={() => setApprove(false)}>ยกเลิก</Button><Button variant="primary" disabled={!confirmed || !allChecked} onClick={() => { decideRequest(r.id, when === 'now' ? 'approve-now' : 'approve-schedule'); toast('อนุมัติเรียบร้อย', when === 'now' ? 'เผยแพร่ภายใน 1–2 นาที' : `ตั้งเวลาเผยแพร่ ${r.publish}`); navigate(`/approval/${r.id}/result`); }}>ยืนยันอนุมัติ</Button></div></div>}>
        {allChecked ? <div className="banner-teal"><Check size={16} /> Checklist ครบ {checks.length}/{checks.length} รายการ · ไม่มีความคิดเห็นค้าง</div> : <div className="note-danger">Checklist ยังไม่ครบ ({checks.filter(Boolean).length}/{checks.length}) — ติ๊กให้ครบก่อนอนุมัติ</div>}
        <b>การเผยแพร่ <span className="t-danger">*</span></b>
        <label className={`radio-card ${when === 'now' ? 'on' : ''}`}><input type="radio" checked={when === 'now'} onChange={() => setWhen('now')} /><div><b style={{ fontWeight: 500 }}>เผยแพร่ทันที</b><div className="t-sm t-secondary">หน้าเว็บจะอัปเดตภายใน 1–2 นาทีหลังยืนยัน</div></div></label>
        <label className={`radio-card ${when === 'schedule' ? 'on' : ''}`}><input type="radio" checked={when === 'schedule'} onChange={() => setWhen('schedule')} /><div><b style={{ fontWeight: 500 }}>ตั้งเวลาเผยแพร่</b><div className="t-sm t-secondary">ตามวันที่ Content Editor ขอ · เปลี่ยนได้ก่อนยืนยัน</div></div></label>
        {when === 'schedule' && <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}><Field label="วันที่เผยแพร่"><Input type="date" defaultValue="2026-11-05" /></Field><Field label="เวลา"><Input type="time" defaultValue="09:00" /></Field><Field label="วันหมดอายุ"><Select options={['ไม่กำหนด', '31/12/2026', '31/03/2027']} /></Field></div>}
        <Field label="หมายเหตุการอนุมัติ (ไม่บังคับ)"><Input defaultValue="อนุมัติตามประกาศอัตราดอกเบี้ย 01/11/2026" /></Field>
        <label className="row" style={{ cursor: 'pointer' }}><input type="checkbox" className="cb" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /> ข้าพเจ้าได้ตรวจสอบเนื้อหาครบถ้วนและรับรองความถูกต้องก่อนเผยแพร่</label>
      </Modal>

      <Modal open={reject} onClose={() => setReject(false)} width={640} title={<span>ส่งกลับแก้ไข<div className="t-sm t-secondary" style={{ fontWeight: 400 }}>{r.title} · v13 จะกลับเป็นสถานะ "ต้องแก้ไข" และปลดล็อกให้ Content Editor</div></span>}
        footer={<div className="row-between" style={{ width: '100%' }}><span className="t-sm t-secondary">ความเห็นจะแนบไว้กับเวอร์ชัน v13</span><div className="row"><Button onClick={() => setReject(false)}>ยกเลิก</Button><Button variant="danger" icon={RefreshCw} disabled={!reasons.length || !detail.trim()} onClick={() => { decideRequest(r.id, 'reject', reasons.join(', ')); toast('ส่งกลับแก้ไขแล้ว', 'แจ้งเตือน Content Editor 01 ทางอีเมลและในระบบ'); navigate('/approval'); }}>ยืนยันส่งกลับ</Button></div></div>}>
        <b>หมวดเหตุผล <span className="t-danger">*</span></b>
        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>{['เนื้อหาไม่ถูกต้อง', 'ไม่ตรงเกณฑ์ Compliance', 'รูปภาพ / ลิขสิทธิ์', 'ลิงก์ใช้งานไม่ได้', 'อื่น ๆ'].map((x) => <button key={x} className={`pill ${reasons.includes(x) ? 'pill-red' : ''}`} onClick={() => toggle(reasons, x, setReasons)}>{reasons.includes(x) && '✓ '}{x}</button>)}</div>
        <b>Section ที่ต้องแก้</b>
        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>{['Product Hero', 'Disclaimer', 'Tools', 'FAQ'].map((x) => <button key={x} className={`pill ${sections.includes(x) ? 'pill-blue' : ''}`} onClick={() => toggle(sections, x, setSections)}>{sections.includes(x) && '✓ '}{x}</button>)}</div>
        <Field label="รายละเอียดสิ่งที่ต้องแก้" required hint={`(${detail.length} / 1000)`}><Textarea rows={4} value={detail} onChange={(e) => setDetail(e.target.value)} /></Field>
        <Toggle label="แจ้งเตือน Content Editor 01 ทางอีเมลและในระบบ" checked onChange={() => undefined} />
      </Modal>
    </div>
  );
}

/* AU-05 Result — อนุมัติแล้ว & ประวัติคำขอ */
export function ApprovalResult() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { requests, toast } = useStore();
  const r = requests.find((x) => x.id === id) ?? requests[0];
  const [banner, setBanner] = useState(true);
  const scheduled = r.state === 'Scheduled';
  const trail = [
    ['ส่งอนุมัติ · รอบที่ 1', 'Content Editor 01', 'ed', 'v13 (ร่าง) · แก้ไข Hero, Tools, Disclaimer, FAQ', '28/10/2026 10:05'],
    ['ส่งกลับแก้ไข', 'Auditor', 'rej', 'เหตุผล: ไม่ตรงเกณฑ์ Compliance — Disclaimer ยังไม่ระบุอัตรา MRR', '28/10/2026 15:20'],
    ['แก้ไขและส่งใหม่ · รอบที่ 2', 'Content Editor 01', 'ed', 'แก้ Disclaimer ตามความเห็น · เพิ่มหมายเหตุอ้างอิงประกาศ Rates', r.sent],
    ...(r.tab === 'approved' ? [[scheduled ? 'อนุมัติ · ตั้งเวลาเผยแพร่' : 'อนุมัติ · เผยแพร่ทันที', 'Auditor', 'ok', `Checklist 5/5 · เผยแพร่ ${r.publish} · IP 10.x.x.45`, '30/10/2026 11:42']] : r.tab === 'rejected' ? [['ส่งกลับแก้ไข · รอบที่ 2', 'Auditor', 'rej', r.sub, '30/10/2026 11:42']] : []),
    ...(scheduled ? [['เผยแพร่อัตโนมัติ (รอดำเนินการ)', 'ระบบ', 'sys', 'v13 จะกลายเป็น Live version · v12 เก็บเป็นประวัติให้กู้คืนได้', r.publish]] : []),
  ];
  return (
    <>
      {banner && r.tab === 'approved' && <div className="banner-info" style={{ background: '#5ab4b8' }}><Check size={18} /><div className="grow"><b>อนุมัติเรียบร้อย</b><div>{scheduled ? `ระบบจะเผยแพร่อัตโนมัติวันที่ ${r.publish}` : 'เผยแพร่แล้ว'} และแจ้ง Content Editor 01 แล้ว</div></div><button className="icon-btn" style={{ color: '#fff' }} onClick={() => setBanner(false)}><X size={18} /></button></div>}
      <div className="row-between">
        <div className="row"><h1 className="page-title">ประวัติคำขอ · {r.title}</h1><Status status={r.state} /></div>
        <div className="row">{scheduled && <Button icon={X} onClick={() => toast('ยกเลิกการตั้งเวลาแล้ว', 'คำขอกลับเป็นรออนุมัติ')}>ยกเลิกการตั้งเวลา</Button>}<Button variant="primary" icon={FileText} onClick={() => navigate('/approval')}>กลับไปงานรออนุมัติ</Button></div>
      </div>
      <div className="split" style={{ gridTemplateColumns: 'minmax(0,1fr) 300px' }}>
        <Card title="ลำดับเหตุการณ์ของคำขอ (Approval Trail)">
          <div className="timeline">
            {trail.map(([t, who, k, d, at]) => (
              <div className="tl-item" key={t}>
                <span className={`tl-dot ${k === 'ok' ? 'done' : k === 'rej' ? 'rej' : k === 'sys' ? '' : 'blue'}`} />
                <div><div className="row"><b style={{ fontWeight: 500 }}>{t}</b><span className={`tag ${k === 'rej' ? 'tag-rej' : k === 'ok' ? 'tag-ok' : k === 'sys' ? '' : 'tag-solid'}`} style={{ borderRadius: 999, fontSize: 14 }}>{who}</span></div><div className="t-sm t-secondary">{d}</div><div className="t-sm t-secondary">{at}</div></div>
              </div>
            ))}
          </div>
        </Card>
        <div className="col">
          <Card title="สรุปการอนุมัติ">{[['ผู้อนุมัติ', r.auditor], ['เวลาอนุมัติ', '30/10/2026 11:42'], ['เวอร์ชัน', 'v13'], ['Checklist', '5/5'], ['จำนวนรอบ', '2 รอบ'], ['ใช้เวลาตรวจ', '2 ชม. 32 นาที']].map(([k, v]) => <div className="row-between" key={k} style={{ padding: '5px 0' }}><span className="t-secondary t-sm">{k}</span><b className="t-sm">{v}</b></div>)}</Card>
          <Card title="การแจ้งเตือนที่ส่งแล้ว">{['อีเมลถึง Content Editor 01', 'แจ้งเตือนใน Dashboard ของ Content Editor', `บันทึก Audit Log · Module: ${r.module} · Action: Approve`].map((x) => <div key={x} className="check-item t-sm" style={{ padding: '4px 0' }}><Check size={14} className="check-ok" /> {x}</div>)}</Card>
          <div className="info-soft t-sm"><Lock size={14} /> ประวัตินี้แก้ไขหรือลบไม่ได้ · เก็บ 2 ปี ตาม Audit Log (CMS-23)</div>
        </div>
      </div>
    </>
  );
}
