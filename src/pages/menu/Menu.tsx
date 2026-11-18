import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil, Plus, Trash2, Settings, GripVertical, ChevronRight, ChevronDown, Eye, ExternalLink } from 'lucide-react';
import { Button, Card, Field, Input, Select, Modal, IconButton, LangSwitch, PageHeader, Status } from '../../components/ui';
import ListPage, { selectFilter, textFilter } from '../../components/ListPage';
import { useStore } from '../../store';
import { openPreview } from '../Preview';
import '../pages.css';

type Lang = 'th' | 'en' | 'zh';
const LANGS: { value: Lang; label: string }[] = [{ value: 'th', label: 'TH' }, { value: 'en', label: 'EN' }, { value: 'zh', label: '中文' }];

interface SetMenu {
  id: string;
  name: string;
  lang: 'TH' | 'EN' | '中文';
  location: string;
  by: string;
  updated: string;
}

const SET_MENUS: SetMenu[] = [
  { id: 'header-personal', name: 'Header Menu – Personal (Mega menu)', lang: 'TH', location: 'Header Main Menu', by: 'Content Editor 01', updated: '28/10/2026 14:20' },
  { id: 'header-personal-en', name: 'Header Menu – Personal (EN)', lang: 'EN', location: 'Header Main Menu', by: 'Content Editor 01', updated: '28/10/2026 14:25' },
  { id: 'segment', name: 'Customer Segment', lang: 'TH', location: 'Customer Segment Tabs', by: 'Content Editor 02', updated: '27/10/2026 10:12' },
  { id: 'utility', name: 'Utility Links', lang: 'TH', location: 'Top Bar Links', by: 'Content Editor 02', updated: '27/10/2026 10:05' },
  { id: 'quick-tasks', name: 'ทำรายการอะไรวันนี้?', lang: 'TH', location: 'Quick Tasks', by: 'Content Editor 02', updated: '26/10/2026 16:40' },
  { id: 'life-stage', name: 'Life Stage 5 ช่วงชีวิต', lang: 'TH', location: 'Life Stage Menu', by: 'Content Editor 02', updated: '26/10/2026 16:02' },
  { id: 'shortcut', name: 'Shortcut ท้ายข่าว', lang: 'TH', location: 'More Shortcuts', by: 'Content Editor 02', updated: '25/10/2026 11:30' },
  { id: 'footer', name: 'Footer Sitemap', lang: 'TH', location: 'Footer Menu', by: 'Content Editor 02', updated: '24/10/2026 09:48' },
  { id: 'footer-en', name: 'Footer Sitemap (EN)', lang: 'EN', location: 'Footer Menu', by: 'Content Editor 02', updated: '24/10/2026 09:52' },
  { id: 'legal', name: 'Disclaimer and policy footer', lang: 'TH', location: 'Legal Footer', by: 'Auditor – Compliance', updated: '20/10/2026 15:15' },
  { id: 'social', name: 'Social Media', lang: 'TH', location: 'Social Links', by: 'Content Editor 01', updated: '18/10/2026 10:00' },
  { id: 'header-actions', name: 'ค้นหา / ค้นหาสาขา / Digital Banking', lang: 'TH', location: 'Header Actions', by: 'Content Editor 01', updated: '18/10/2026 09:40' },
];

const LOCATIONS = [
  ['Customer Segment Tabs', 'แถบบนสุด', 'Customer Segment (บุคคล / SME / ธุรกิจ)'],
  ['Top Bar Links', 'แถบบนสุด', 'Utility Links'],
  ['Header Main Menu', 'Header', 'Header Menu – Personal (Mega menu)'],
  ['Header Actions', 'Header', 'ค้นหา / ค้นหาสาขา / Digital Banking'],
  ['Quick Tasks', 'หน้าแรก · Hero', 'ทำรายการอะไรวันนี้? (6 รายการ)'],
  ['Life Stage Menu', 'หน้าแรก · ตามช่วงชีวิต', 'Life Stage 5 ช่วงชีวิต'],
  ['More Shortcuts', 'หน้าแรก · ข่าวสาร', 'Shortcut ท้ายข่าว (3 รายการ)'],
  ['Footer Menu', 'Footer', 'Footer Sitemap (4 คอลัมน์)'],
  ['Legal Footer', 'Footer', 'Disclaimer and policy footer'],
  ['Social Links', 'Footer', 'Social Media'],
] as const;

/* CMS-02 Menu Location */
export function MenuLocation() {
  const { toast } = useStore();
  const [lang, setLang] = useState<Lang>('th');
  const [assign, setAssign] = useState<Record<string, string>>(Object.fromEntries(LOCATIONS.map(([k, , v]) => [k, v])));
  const [editing, setEditing] = useState<string | null>(null);
  const [choice, setChoice] = useState('');
  return (
    <>
      <section className="card">
        <h2 className="t-h3" style={{ fontSize: 18 }}>Menu Location</h2>
        <p className="t-secondary" style={{ marginBottom: 14 }}>กำหนดว่าแต่ละตำแหน่งบนหน้าเว็บ Front-end ใช้ Set Menu ชุดใด</p>
        <LangSwitch value={lang} onChange={setLang} options={LANGS} />
        <div className="col" style={{ gap: 10, maxWidth: 940, margin: '0 auto' }}>
          {LOCATIONS.map(([k, area]) => (
            <div className="loc-row" key={k}>
              <div style={{ width: 260 }}><b style={{ fontWeight: 500 }}>{k}</b><div className="t-sm t-secondary">{area}</div></div>
              <div className="grow" style={{ textAlign: 'center' }}>{lang === 'th' ? assign[k] : `${assign[k]} (${lang.toUpperCase()})`}</div>
              <Button icon={Pencil} onClick={() => { setEditing(k); setChoice(assign[k]); }}>Edit</Button>
            </div>
          ))}
        </div>
      </section>
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`เลือก Set Menu · ${editing ?? ''}`}
        footer={<><Button onClick={() => setEditing(null)}>ยกเลิก</Button><Button variant="primary" onClick={() => { if (editing) setAssign({ ...assign, [editing]: choice }); toast('อัปเดต Menu Location แล้ว', `${editing} → ${choice}`); setEditing(null); }}>บันทึก</Button></>}
      >
        <Field label="Set Menu ที่ใช้"><Select value={choice} onChange={(e) => setChoice(e.target.value)} options={[...new Set([choice, ...SET_MENUS.map((m) => m.name)])]} /></Field>
        <p className="t-sm t-secondary">การเปลี่ยน Set Menu ของตำแหน่งต้องส่งอนุมัติก่อนแสดงบนหน้าเว็บ · <Link className="t-link" to="/menu/set">จัดการ Set Menu</Link></p>
      </Modal>
    </>
  );
}

/* CMS-03 Set Menu */
export function SetMenuList() {
  const navigate = useNavigate();
  const { toast } = useStore();
  const [rows, setRows] = useState(SET_MENUS);
  const [del, setDel] = useState<SetMenu | null>(null);
  return (
    <ListPage<SetMenu>
      title="Set Menu"
      filters={[
        textFilter('name', 'Set Menu Name', (r) => r.name),
        selectFilter('lang', 'Language', ['TH', 'EN', '中文'], (r) => r.lang),
        selectFilter('loc', 'Menu Location', [...new Set(SET_MENUS.map((m) => m.location))], (r) => r.location),
        selectFilter('by', 'Update By', ['Content Editor 01', 'Content Editor 02', 'Auditor – Compliance'], (r) => r.by),
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      toolbar={<Button variant="primary" icon={Plus} onClick={() => navigate('/menu/set/new')}>Create</Button>}
      toolbarRight={<IconButton icon={Settings} title="ตั้งค่าคอลัมน์" />}
      columns={[
        { key: 'name', label: 'Set Menu Name', render: (r) => <Link className="t-link" style={{ fontWeight: 400 }} to={`/menu/set/${r.id}`}>{r.name}</Link> },
        { key: 'lang', label: 'Language', align: 'center', render: (r) => r.lang },
        { key: 'loc', label: 'Menu Location', render: (r) => r.location },
        { key: 'by', label: 'Update By', render: (r) => r.by },
        { key: 'up', label: 'Last Update', render: (r) => r.updated },
        { key: 'act', label: 'Action', align: 'center', render: (r) => <div className="row" style={{ gap: 4, justifyContent: 'center' }}><IconButton icon={Pencil} title="แก้ไข" onClick={() => navigate(`/menu/set/${r.id}`)} /><IconButton icon={Trash2} danger title="ลบ" onClick={() => setDel(r)} /></div> },
      ]}
    >
      <Modal open={!!del} onClose={() => setDel(null)} title="ย้าย Set Menu ไป Recycle Bin?" footer={<><Button onClick={() => setDel(null)}>ยกเลิก</Button><Button variant="danger" onClick={() => { setRows(rows.filter((r) => r.id !== del?.id)); toast('ย้ายไป Recycle Bin แล้ว', del?.name); setDel(null); }}>ย้ายไป Recycle Bin</Button></>}>
        <p className="t-secondary">“{del?.name}” ถูกใช้ที่ตำแหน่ง <b>{del?.location}</b> · หากลบ ตำแหน่งนี้จะไม่แสดงเมนูจนกว่าจะเลือก Set Menu ใหม่</p>
      </Modal>
    </ListPage>
  );
}

/* NEW (ไม่มีใน Figma) — SM-01 Set Menu Editor: แก้ไขรายการเมนูแบบลำดับชั้น */
interface MenuNode {
  id: string;
  label: string;
  url: string;
  target?: 'same' | 'new';
  children?: MenuNode[];
}
const SAMPLE_TREE: MenuNode[] = [
  { id: 'a', label: 'เงินฝาก', url: '/th/personal/deposit', children: [
    { id: 'a1', label: 'ออมทรัพย์', url: '/th/personal/deposit/savings' },
    { id: 'a2', label: 'ฝากประจำ', url: '/th/personal/deposit/fixed' },
    { id: 'a3', label: 'บัญชีดิจิทัล LHB You', url: '/th/personal/deposit/lhb-you' },
  ] },
  { id: 'b', label: 'สินเชื่อ', url: '/th/personal/loan', children: [
    { id: 'b1', label: 'สินเชื่อบ้าน', url: '/th/personal/loan/home-loan' },
    { id: 'b2', label: 'สินเชื่อรีไฟแนนซ์', url: '/th/personal/loan/home-loan/refinance' },
    { id: 'b3', label: 'สินเชื่อส่วนบุคคล', url: '/th/personal/loan/personal-loan' },
  ] },
  { id: 'c', label: 'การลงทุน', url: '/th/personal/investment' },
  { id: 'd', label: 'บัตร', url: '/th/personal/credit-card' },
  { id: 'e', label: 'โปรโมชัน', url: '/th/promotion' },
  { id: 'f', label: 'LHB You', url: 'https://lhbyou.lhbank.co.th', target: 'new' },
];

export function SetMenuEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, submitRequest } = useStore();
  const base = SET_MENUS.find((m) => m.id === id);
  const isNew = !base;
  const [name, setName] = useState(base?.name ?? '');
  const [lang, setLang] = useState(base?.lang ?? 'TH');
  const [location, setLocation] = useState(base?.location ?? 'Header Main Menu');
  const [tree, setTree] = useState<MenuNode[]>(isNew ? [] : SAMPLE_TREE);
  const [open, setOpen] = useState<Record<string, boolean>>({ a: true, b: true });
  const [sel, setSel] = useState<MenuNode | null>(null);
  const [form, setForm] = useState<MenuNode>({ id: '', label: '', url: '', target: 'same' });
  const [parent, setParent] = useState<string>('');

  const update = (nodes: MenuNode[], fn: (n: MenuNode) => MenuNode | null): MenuNode[] =>
    nodes.flatMap((n) => {
      const r = fn(n);
      if (!r) return [];
      return [{ ...r, children: r.children ? update(r.children, fn) : undefined }];
    });
  const move = (nodeId: string, dir: -1 | 1) => {
    const swap = (list: MenuNode[]): MenuNode[] => {
      const i = list.findIndex((n) => n.id === nodeId);
      if (i >= 0) {
        const j = i + dir;
        if (j < 0 || j >= list.length) return list;
        const copy = [...list];
        [copy[i], copy[j]] = [copy[j], copy[i]];
        return copy;
      }
      return list.map((n) => (n.children ? { ...n, children: swap(n.children) } : n));
    };
    setTree(swap(tree));
  };
  const openForm = (n?: MenuNode, parentId = '') => {
    setSel(n ?? { id: '', label: '', url: '' });
    setForm(n ? { ...n } : { id: `n${Date.now()}`, label: '', url: '', target: 'same' });
    setParent(parentId);
  };
  const saveForm = () => {
    if (!sel) return;
    if (sel.id) setTree(update(tree, (n) => (n.id === sel.id ? { ...n, label: form.label, url: form.url, target: form.target } : n)));
    else if (parent) setTree(update(tree, (n) => (n.id === parent ? { ...n, children: [...(n.children ?? []), form] } : n)));
    else setTree([...tree, form]);
    setSel(null);
  };
  const count = (ns: MenuNode[]): number => ns.reduce((a, n) => a + 1 + count(n.children ?? []), 0);

  const renderNode = (n: MenuNode, depth: number, idx: number, siblings: number) => (
    <div key={n.id}>
      <div className="menu-node" style={{ marginLeft: depth * 28 }}>
        <GripVertical size={16} className="t-tertiary" />
        {n.children?.length ? (
          <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => setOpen({ ...open, [n.id]: !open[n.id] })}>{open[n.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>
        ) : <span style={{ width: 24 }} />}
        <b style={{ fontWeight: depth ? 400 : 500 }}>{n.label}</b>
        <span className="t-sm t-secondary grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.url}</span>
        {n.target === 'new' && <ExternalLink size={14} className="t-tertiary" />}
        <button className="btn btn-ghost t-sm" disabled={idx === 0} onClick={() => move(n.id, -1)}>↑</button>
        <button className="btn btn-ghost t-sm" disabled={idx === siblings - 1} onClick={() => move(n.id, 1)}>↓</button>
        {depth === 0 && <IconButton icon={Plus} title="เพิ่มเมนูย่อย" onClick={() => { openForm(undefined, n.id); setOpen({ ...open, [n.id]: true }); }} />}
        <IconButton icon={Pencil} title="แก้ไข" onClick={() => openForm(n)} />
        <IconButton icon={Trash2} danger title="ลบ" onClick={() => setTree(update(tree, (x) => (x.id === n.id ? null : x)))} />
      </div>
      {open[n.id] && n.children?.map((c, i) => renderNode(c, depth + 1, i, n.children!.length))}
    </div>
  );

  return (
    <>
      <PageHeader
        back="/menu/set"
        title={isNew ? 'สร้าง Set Menu ใหม่' : `แก้ไข Set Menu · ${base?.name}`}
        badges={<Status status={isNew ? 'Draft' : 'Published'} />}
        actions={<>
          <Button icon={Eye} onClick={() => openPreview({ title: 'ตัวอย่างเมนูเว็บไซต์', type: 'Menu', path: '/th' })}>Preview</Button>
          <Button onClick={() => toast('บันทึก Draft แล้ว', name)}>บันทึก Draft</Button>
          <Button variant="primary" disabled={!name || !tree.length} onClick={() => { submitRequest({ title: name, module: 'Menu', sub: `Menu · ${location}` }); toast('ส่งอนุมัติแล้ว', name); navigate('/requests'); }}>ส่งอนุมัติ</Button>
        </>}
      />
      <div className="split">
        <Card title={`รายการเมนู (${count(tree)})`} sub="ลากหรือกด ↑ ↓ เพื่อจัดลำดับ · เมนูหลักมีเมนูย่อยได้ 1 ระดับ (Mega menu)" action={<Button size="sm" icon={Plus} onClick={() => openForm()}>เพิ่มเมนูหลัก</Button>}>
          <div className="col" style={{ gap: 6 }}>
            {tree.map((n, i) => renderNode(n, 0, i, tree.length))}
            {!tree.length && <p className="t-tertiary" style={{ textAlign: 'center', padding: 30 }}>ยังไม่มีเมนู — กด “เพิ่มเมนูหลัก”</p>}
          </div>
        </Card>
        <div className="col">
          <Card title="ข้อมูล Set Menu">
            <div className="col">
              <Field label="ชื่อ Set Menu" required><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="ภาษา"><Select value={lang} onChange={(e) => setLang(e.target.value as SetMenu['lang'])} options={['TH', 'EN', '中文']} /></Field>
              <Field label="ใช้ที่ Menu Location"><Select value={location} onChange={(e) => setLocation(e.target.value)} options={LOCATIONS.map(([k]) => k)} /></Field>
            </div>
          </Card>
          <div className="info-soft t-sm">เมนูที่ลิงก์ไปเว็บไซต์ภายนอกจะเปิดในแท็บใหม่ และแสดงไอคอน ↗ ให้ผู้ใช้เห็น</div>
        </div>
      </div>
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.id ? 'แก้ไขเมนู' : parent ? 'เพิ่มเมนูย่อย' : 'เพิ่มเมนูหลัก'}
        footer={<><Button onClick={() => setSel(null)}>ยกเลิก</Button><Button variant="primary" disabled={!form.label || !form.url} onClick={saveForm}>บันทึก</Button></>}>
        <Field label="ชื่อเมนู" required><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></Field>
        <Field label="ลิงก์ (Path หรือ URL)" required><Input placeholder="/th/personal/..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></Field>
        <Field label="การเปิดลิงก์"><Select value={form.target ?? 'same'} onChange={(e) => setForm({ ...form, target: e.target.value as MenuNode['target'] })} options={[{ value: 'same', label: 'หน้าเดิม' }, { value: 'new', label: 'แท็บใหม่ (เว็บภายนอก)' }]} /></Field>
      </Modal>
    </>
  );
}
