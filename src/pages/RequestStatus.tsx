import { useMemo, useState } from 'react';
import { RefreshCw, Eye } from 'lucide-react';
import { Button, Field, Input, Select, Status, Tabs, Drawer, PageHeader } from '../components/ui';
import { useStore } from '../store';
import type { RequestItem, RequestState, RequestTab } from '../types';

type TabValue = RequestTab | 'all';
import './pages.css';

const STATE_MAP: Record<RequestState, RequestState> = { Review: 'Review', Queue: 'Queue', Rejected: 'Rejected', Published: 'Published', Scheduled: 'Scheduled' };

export default function RequestStatus() {
  const { requests, toast } = useStore();
  const [tab, setTab] = useState<TabValue>('pending');
  const [module, setModule] = useState('ทั้งหมด');
  const [q, setQ] = useState('');
  const [detail, setDetail] = useState<RequestItem | null>(null);

  const counts = {
    pending: requests.filter((r) => r.tab === 'pending').length,
    rejected: requests.filter((r) => r.tab === 'rejected').length,
    approved: requests.filter((r) => r.tab === 'approved').length,
  };
  const reviewing = requests.filter((r) => r.state === 'Review').length;
  const list = useMemo(
    () => requests.filter((r) => (tab === 'all' || r.tab === tab) && (module === 'ทั้งหมด' || r.module === module) && (!q || r.title.includes(q))),
    [requests, tab, module, q],
  );

  return (
    <>
      <PageHeader
        title="My Requests"
        sub="ติดตามเนื้อหาที่คุณส่งให้ Auditor ตรวจสอบ · ระหว่างรออนุมัติ เนื้อหาจะถูกล็อกการแก้ไข"
        actions={<Button icon={RefreshCw} onClick={() => toast('รีเฟรชสถานะแล้ว')}>รีเฟรชสถานะ</Button>}
      />
      <div className="kpis">
        {[
          ['#3a7bd5', 'รออนุมัติ', counts.pending, `กำลังรีวิว ${reviewing} · รอคิว ${counts.pending - reviewing}`],
          ['#8e64a8', 'Auditor กำลังรีวิว', reviewing, 'เปิดตรวจแล้ว · ล็อกการแก้ไข'],
          ['#e0625a', 'ถูกส่งกลับแก้ไข', counts.rejected, 'ต้องแก้ไขแล้วส่งใหม่'],
          ['#1a9a8a', 'อนุมัติแล้ว (เดือนนี้)', 12, 'เผยแพร่แล้ว 9 · ตั้งเวลา 3'],
        ].map(([c, l, n, s]) => (
          <div className="kpi" key={l}>
            <div className="lbl"><i style={{ background: c }} />{l}</div>
            <div className="num">{n}</div>
            <div className="t-secondary t-sm">{s}</div>
          </div>
        ))}
      </div>
      <section className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 18px 0' }}>
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'pending', label: `รออนุมัติ (${counts.pending})` },
              { value: 'rejected', label: `ถูกส่งกลับ (${counts.rejected})` },
              { value: 'approved', label: `อนุมัติแล้ว (${counts.approved})` },
              { value: 'all', label: 'ทั้งหมด' },
            ]}
          />
          <div className="filter-bar" style={{ gridTemplateColumns: 'repeat(5, minmax(0,1fr))', margin: '16px 0' }}>
            <Field label="หมวดหมู่"><Select value={module} onChange={(e) => setModule(e.target.value)} options={['ทั้งหมด', 'Layout', 'Promotion', 'Banner', 'Rates', 'FAQ', 'News', 'Advisory']} /></Field>
            <Field label="เว็บไซต์"><Select options={['Personal', 'SME', 'Corporate']} /></Field>
            <Field label="Auditor ผู้ตรวจ"><Select options={['ทั้งหมด', 'Auditor – Marketing', 'Auditor – ฝ่ายเงินฝาก']} /></Field>
            <Field label="สถานะ"><Select options={['ทั้งหมด', 'กำลังรีวิว', 'รอคิว']} /></Field>
            <Field label="ค้นหา"><Input placeholder="ชื่อรายการ..." value={q} onChange={(e) => setQ(e.target.value)} /></Field>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th className="col-no">ลำดับ</th><th>รายการ</th><th>หมวดหมู่</th><th>Auditor ผู้ตรวจ</th><th>ส่งเมื่อ</th><th>ต้องการเผยแพร่</th><th>สถานะ</th><th>Action</th></tr></thead>
            <tbody>
              {list.map((r, i) => (
                <tr key={r.id} className={r.fresh ? 'highlight' : ''}>
                  <td className="col-no" style={{ borderLeft: i === 0 && r.state === 'Review' ? '3px solid var(--lh-nav-active)' : undefined }}>{i + 1}</td>
                  <td>
                    <b>{r.title}</b>
                    <div className="t-sm" style={{ color: r.state === 'Review' ? '#8e64a8' : r.state === 'Rejected' ? '#e0625a' : 'var(--lh-text-secondary)' }}>{r.sub}</div>
                  </td>
                  <td><span className="tag tag-blue">{r.module}</span></td>
                  <td>{r.auditor}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{r.sent}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{r.publish}</td>
                  <td><Status status={STATE_MAP[r.state]} /></td>
                  <td><Button variant={i === 0 ? 'primary' : 'secondary'} size="sm" icon={Eye} onClick={() => setDetail(r)}>ดูรายละเอียด</Button></td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={8} className="t-tertiary" style={{ textAlign: "center", padding: 40 }}>ไม่มีรายการ</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="row-between" style={{ padding: '14px 18px' }}>
          <span>Show 1 - {list.length} of {list.length}</span>
        </div>
      </section>

      {/* CMS-26A รายละเอียดคำขอ (Drawer) */}
      <Drawer open={!!detail} onClose={() => setDetail(null)} title="รายละเอียดคำขอ" footer={<Button onClick={() => setDetail(null)}>ปิด</Button>}>
        {detail && (
          <>
            <div>
              <h3 className="t-h3">{detail.title}</h3>
              <div className="row mt-8"><span className="tag tag-blue">{detail.module}</span><Status status={STATE_MAP[detail.state]} /></div>
            </div>
            <div className="ready-box">
              <div className="row-between"><span className="t-secondary">Auditor ผู้ตรวจ</span><b>{detail.auditor}</b></div>
              <div className="row-between"><span className="t-secondary">ส่งเมื่อ</span><b>{detail.sent}</b></div>
              <div className="row-between"><span className="t-secondary">ต้องการเผยแพร่</span><b>{detail.publish}</b></div>
            </div>
            <b>ไทม์ไลน์</b>
            <div className="timeline">
              {[
                ['ส่งอนุมัติ', `${detail.sent} · Content Editor 01`, 'done'],
                ['Auditor เปิดตรวจ', detail.state === 'Queue' ? 'รอคิว' : detail.sub.split('·')[1] || '-', detail.state === 'Queue' ? '' : 'done'],
                [detail.state === 'Rejected' ? 'ส่งกลับแก้ไข' : 'อนุมัติ / ส่งกลับ', detail.state === 'Rejected' ? 'เหตุผล: ขาด Disclaimer' : detail.tab === 'approved' ? 'อนุมัติแล้ว' : 'รอผลการตรวจ', detail.tab !== 'pending' ? 'done' : detail.state === 'Review' ? 'now' : ''],
                ['เผยแพร่', detail.publish, detail.state === 'Published' ? 'done' : ''],
              ].map(([t, s, st]) => (
                <div className="tl-item" key={t}>
                  <span className={`tl-dot ${st}`} />
                  <div><b>{t}</b><div className="t-sm t-secondary">{s}</div></div>
                </div>
              ))}
            </div>
            {detail.tab === 'pending' && <div className="note-soft-warning">🔒 เนื้อหาถูกล็อกการแก้ไขระหว่างรออนุมัติ</div>}
          </>
        )}
      </Drawer>
    </>
  );
}
