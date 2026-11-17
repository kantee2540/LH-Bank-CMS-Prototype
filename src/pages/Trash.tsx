import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button, Field, Input, Select, Tabs, Modal, PageHeader, InfoBanner } from '../components/ui';
import { useStore } from '../store';
import type { TrashGroup } from '../types';
import './pages.css';

interface ConfirmState {
  kind: 'restore' | 'delete';
  ids: string[];
}

const GROUPS: TrashGroup[] = ['Content', 'Media', 'Banner', 'อื่นๆ'];

/* TR-01 ถังขยะ · TR-03 กู้คืน · TR-04 ลบถาวร */
export default function Trash() {
  const { trash, restoreFromTrash, deleteForever, toast } = useStore();
  const [tab, setTab] = useState<TrashGroup | 'all'>('all');
  const [q, setQ] = useState('');
  const [applied, setApplied] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [typed, setTyped] = useState('');

  const count = (g: TrashGroup) => trash.filter((t) => t.group === g).length;
  const list = useMemo(
    () => trash.filter((t) => (tab === 'all' || t.group === tab) && (!applied || t.title.includes(applied))).sort((a, b) => b.days - a.days),
    [trash, tab, applied],
  );
  const allSel = list.length > 0 && list.every((t) => sel.includes(t.id));
  const items = confirm ? trash.filter((t) => confirm.ids.includes(t.id)) : [];

  const run = () => {
    if (!confirm) return;
    if (confirm.kind === 'restore') {
      restoreFromTrash(confirm.ids);
      toast(`กู้คืน ${confirm.ids.length} รายการแล้ว`, 'กลับไปที่เมนูเดิมในสถานะ Draft');
    } else {
      deleteForever(confirm.ids);
      toast(`ลบถาวร ${confirm.ids.length} รายการแล้ว`, 'บันทึกใน Audit Log');
    }
    setSel((s) => s.filter((x) => !confirm.ids.includes(x)));
    setConfirm(null);
    setTyped('');
  };

  return (
    <>
      <PageHeader title="ถังขยะ (Trash)" />
      <InfoBanner title="รายการที่ลบจะอยู่ในถังขยะ 30 วัน ก่อนระบบลบถาวรอัตโนมัติ">
        กู้คืนแล้วรายการจะกลับไปที่เมนูเดิมในสถานะ Draft (ไม่เผยแพร่อัตโนมัติ) · การลบถาวรกู้คืนไม่ได้ และบันทึกใน Audit Log
      </InfoBanner>
      <form className="filter-bar filter-bar-3" onSubmit={(e) => { e.preventDefault(); setApplied(q); }}>
        <Field label="ค้นหาชื่อรายการ"><Input value={q} onChange={(e) => setQ(e.target.value)} /></Field>
        <Field label="โมดูล"><Select options={['ทั้งหมด', 'Manage Content', 'Media', 'Banner', 'FAQ', 'News', 'NPA', 'Layout']} /></Field>
        <Field label="ลบโดย"><Select options={['ทุกคน', 'Content Editor 01', 'Content Editor 02']} /></Field>
        <Button variant="primary" type="submit">Search</Button>
      </form>
      <section className="card">
        <Tabs
          value={tab}
          onChange={(v) => { setTab(v); setSel([]); }}
          tabs={[{ value: 'all', label: `ทั้งหมด (${trash.length})` }, ...GROUPS.map((g) => ({ value: g, label: `${g} (${count(g)})` }))]}
        />
        <div className="row-between" style={{ margin: '16px 0' }}>
          <div className="row" style={{ gap: 10 }}>
            <span>เลือกแล้ว {sel.length} รายการ</span>
            <Button icon={RotateCcw} disabled={!sel.length} onClick={() => setConfirm({ kind: 'restore', ids: sel })}>กู้คืนที่เลือก</Button>
            <Button variant="danger" disabled={!sel.length} onClick={() => setConfirm({ kind: 'delete', ids: sel })}>ลบถาวรที่เลือก</Button>
          </div>
          <span className="t-secondary">เรียงตาม: ใกล้ลบถาวร</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th><input type="checkbox" className="cb" checked={allSel} onChange={() => setSel(allSel ? [] : list.map((t) => t.id))} /></th>
                <th>รายการ</th><th>โมดูล</th><th>ลบโดย · เมื่อ</th><th>ลบถาวรอัตโนมัติ</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id} className={sel.includes(t.id) ? 'highlight' : ''}>
                  <td><input type="checkbox" className="cb" checked={sel.includes(t.id)} onChange={() => setSel((s) => (s.includes(t.id) ? s.filter((x) => x !== t.id) : [...s, t.id]))} /></td>
                  <td style={{ maxWidth: 280 }}><b style={{ fontWeight: 500 }}>{t.title}</b><div className="sub">{t.sub}</div></td>
                  <td><span className="tag-solid">{t.module}</span></td>
                  <td className="t-sm" style={{ maxWidth: 200 }}>{t.by}</td>
                  <td style={{ color: t.days <= 3 ? 'var(--lh-danger)' : undefined, fontWeight: t.days <= 3 ? 500 : 400 }}>อีก {t.days} วัน</td>
                  <td>
                    <div className="row" style={{ gap: 14 }}>
                      <button className="btn btn-ghost" onClick={() => setConfirm({ kind: 'restore', ids: [t.id] })}>กู้คืน</button>
                      <button className="btn btn-ghost" style={{ color: 'var(--lh-danger)' }} onClick={() => setConfirm({ kind: 'delete', ids: [t.id] })}>ลบถาวร</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={6} className="t-tertiary" style={{ textAlign: 'center', padding: 40 }}>ถังขยะว่าง</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="t-sm t-secondary mt-16">แสดง 1 - {list.length} จาก {trash.length} รายการ · การกู้คืนและลบถาวรทุกครั้งบันทึกใน Audit Log</p>
      </section>

      <Modal
        open={!!confirm}
        onClose={() => { setConfirm(null); setTyped(''); }}
        title={confirm?.kind === 'restore' ? `กู้คืน ${items.length} รายการ` : `ลบถาวร ${items.length} รายการ?`}
        footer={
          <>
            <Button onClick={() => { setConfirm(null); setTyped(''); }}>ยกเลิก</Button>
            {confirm?.kind === 'restore' ? (
              <Button variant="primary" onClick={run}>กู้คืน</Button>
            ) : (
              <Button variant="danger" disabled={typed !== 'ลบถาวร'} onClick={run}>ลบถาวร</Button>
            )}
          </>
        }
      >
        <div className="ready-box">
          {items.map((t) => (
            <div key={t.id}><b style={{ fontWeight: 500 }}>{t.title}</b> <span className="t-sm t-secondary">· {t.module}</span></div>
          ))}
        </div>
        {confirm?.kind === 'restore' ? (
          <p className="t-secondary">รายการจะกลับไปที่เมนูเดิมในสถานะ <b>Draft</b> · ต้องส่งอนุมัติใหม่ก่อนเผยแพร่</p>
        ) : (
          <>
            <div className="note-danger">การลบถาวรกู้คืนไม่ได้ · ไฟล์และทุกเวอร์ชันของรายการจะถูกลบออกจากระบบ</div>
            <Field label='พิมพ์ "ลบถาวร" เพื่อยืนยัน'><Input value={typed} onChange={(e) => setTyped(e.target.value)} /></Field>
          </>
        )}
      </Modal>
    </>
  );
}
