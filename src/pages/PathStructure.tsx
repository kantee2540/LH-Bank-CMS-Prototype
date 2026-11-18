import { useState } from 'react';
import { Plus, RefreshCw, ChevronDown, ChevronRight, LayoutTemplate, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button, Field, Input, Select, Modal, IconButton, LangSwitch } from '../components/ui';
import { useStore } from '../store';
import './pages.css';

type Lang = 'th' | 'en' | 'zh';
type Kind = 'Landing' | 'Specific Path';

interface PathNode {
  id: string;
  name: string;
  path: string;
  kind: Kind;
  layout?: string;
  children?: PathNode[];
}

const TREE: PathNode[] = [
  { id: 'home', name: 'หน้าแรก', path: 'th', kind: 'Landing', layout: 'Homepage', children: [
    { id: 'personal', name: 'ลูกค้าบุคคล', path: 'th/personal', kind: 'Specific Path', children: [
      { id: 'deposit', name: 'เงินฝาก', path: 'th/personal/deposit', kind: 'Specific Path', children: [
        { id: 'savings', name: 'ออมทรัพย์', path: 'th/personal/deposit/savings', kind: 'Specific Path' },
        { id: 'fixed6m', name: 'เงินฝากประจำพิเศษ 6 เดือน', path: 'th/personal/deposit/fixed-6m', kind: 'Landing', layout: 'Promotion Detail' },
      ] },
      { id: 'loan', name: 'สินเชื่อ', path: 'th/personal/loan', kind: 'Specific Path', children: [
        { id: 'homeloan', name: 'สินเชื่อบ้าน', path: 'th/personal/loan/home-loan', kind: 'Specific Path', children: [
          { id: 'refi', name: 'สินเชื่อรีไฟแนนซ์บ้าน', path: 'th/personal/loan/home-loan/refinance', kind: 'Landing', layout: 'Product Detail' },
          { id: 'h4c', name: 'สินเชื่อบ้านแลกเงิน', path: 'th/personal/loan/home-loan/home-for-cash', kind: 'Landing', layout: 'Product Detail' },
        ] },
        { id: 'ploan', name: 'สินเชื่อส่วนบุคคล', path: 'th/personal/loan/personal-loan', kind: 'Specific Path' },
      ] },
      { id: 'invest', name: 'การลงทุน', path: 'th/personal/investment', kind: 'Specific Path' },
      { id: 'card', name: 'บัตรเครดิต', path: 'th/personal/credit-card', kind: 'Specific Path' },
    ] },
    { id: 'npa', name: 'สินทรัพย์รอการขาย', path: 'th/npa', kind: 'Specific Path' },
  ] },
];

const toLang = (nodes: PathNode[], lang: Lang): PathNode[] =>
  lang === 'th' ? nodes : nodes.map((n) => ({ ...n, path: n.path.replace(/^th/, lang), children: n.children && toLang(n.children, lang) }));

/* CMS-07 Path Structure (+ NEW: PS-01 เพิ่ม/แก้ไข Path popup, Move Order mode) */
export default function PathStructure() {
  const { toast } = useStore();
  const [lang, setLang] = useState<Lang>('th');
  const [tree, setTree] = useState(TREE);
  const [open, setOpen] = useState<Record<string, boolean>>({ home: true, personal: true, deposit: true, loan: true, homeloan: true });
  const [ordering, setOrdering] = useState(false);
  const [edit, setEdit] = useState<{ node: PathNode; parentId: string; isNew: boolean } | null>(null);
  const [del, setDel] = useState<PathNode | null>(null);

  const map = (nodes: PathNode[], fn: (n: PathNode) => PathNode | null): PathNode[] =>
    nodes.flatMap((n) => { const r = fn(n); return r ? [{ ...r, children: r.children && map(r.children, fn) }] : []; });
  const flat = (nodes: PathNode[]): PathNode[] => nodes.flatMap((n) => [n, ...flat(n.children ?? [])]);
  const move = (id: string, dir: -1 | 1) => {
    const swap = (list: PathNode[]): PathNode[] => {
      const i = list.findIndex((n) => n.id === id);
      if (i >= 0) { const j = i + dir; if (j < 0 || j >= list.length) return list; const c = [...list]; [c[i], c[j]] = [c[j], c[i]]; return c; }
      return list.map((n) => (n.children ? { ...n, children: swap(n.children) } : n));
    };
    setTree(swap(tree));
  };
  const save = () => {
    if (!edit) return;
    const { node, parentId, isNew } = edit;
    if (isNew) setTree(parentId ? map(tree, (n) => (n.id === parentId ? { ...n, children: [...(n.children ?? []), node] } : n)) : [...tree, node]);
    else setTree(map(tree, (n) => (n.id === node.id ? { ...node, children: n.children } : n)));
    if (parentId) setOpen({ ...open, [parentId]: true });
    toast(isNew ? 'เพิ่ม Path แล้ว' : 'บันทึก Path แล้ว', `/${node.path}`);
    setEdit(null);
  };

  const render = (n: PathNode, depth: number, idx: number, count: number) => (
    <div key={n.id}>
      <div className={`path-row ${n.children?.length ? 'has-kids' : ''}`} style={{ marginLeft: depth * 24 }}>
        {n.children?.length ? (
          <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => setOpen({ ...open, [n.id]: !open[n.id] })} aria-label="พับ/กาง">{open[n.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>
        ) : <span className="path-bar" />}
        <b style={{ fontWeight: n.children?.length ? 500 : 400 }}>{n.name}</b>
        <span className="t-secondary t-sm grow">({n.path})</span>
        <span className="t-sm" style={{ color: n.kind === 'Landing' ? '#e0625a' : 'var(--lh-text-secondary)' }}>({n.kind})</span>
        {ordering ? (
          <>
            <IconButton icon={ArrowUp} title="เลื่อนขึ้น" disabled={idx === 0} onClick={() => move(n.id, -1)} />
            <IconButton icon={ArrowDown} title="เลื่อนลง" disabled={idx === count - 1} onClick={() => move(n.id, 1)} />
          </>
        ) : (
          <>
            <a className="t-link t-sm row" style={{ gap: 6 }} onClick={() => toast('เปิดหน้าเว็บ', `https://www.lhbank.co.th/${n.path}`)}><span className="dot-teal" />View</a>
            <IconButton icon={LayoutTemplate} title="เลือก Layout" onClick={() => toast('Layout ของ Path', n.layout ?? 'ใช้ Layout ตั้งต้นของหมวด')} />
            <IconButton icon={Plus} title="เพิ่ม Path ย่อย" onClick={() => setEdit({ node: { id: `p${Date.now()}`, name: '', path: `${n.path}/`, kind: 'Specific Path' }, parentId: n.id, isNew: true })} />
            <IconButton icon={Pencil} title="แก้ไข" onClick={() => setEdit({ node: { ...n }, parentId: '', isNew: false })} />
            <IconButton icon={Trash2} danger title="ลบ" disabled={n.id === 'home'} onClick={() => setDel(n)} />
          </>
        )}
      </div>
      {open[n.id] && n.children?.map((c, i) => render(c, depth + 1, i, n.children!.length))}
    </div>
  );

  return (
    <>
      <section className="card">
        <h2 className="t-h3" style={{ fontSize: 18, marginBottom: 12 }}>Path Structure</h2>
        <LangSwitch value={lang} onChange={setLang} options={[{ value: 'th', label: 'TH' }, { value: 'en', label: 'EN' }, { value: 'zh', label: '中文' }]} />
        <div className="row" style={{ marginBottom: 16 }}>
          <Button variant="primary" icon={Plus} onClick={() => setEdit({ node: { id: `p${Date.now()}`, name: '', path: `${lang}/`, kind: 'Specific Path' }, parentId: 'home', isNew: true })}>Add Path</Button>
          <Button icon={RefreshCw} variant={ordering ? 'primary' : 'secondary'} onClick={() => { if (ordering) toast('บันทึกลำดับแล้ว'); setOrdering(!ordering); }}>{ordering ? 'บันทึกลำดับ' : 'Move Order'}</Button>
        </div>
        <div className="path-box">
          <div className="path-box-head">Path Structure · lhbank.co.th</div>
          <div className="col" style={{ gap: 8, padding: 12 }}>{toLang(tree, lang).map((n, i, a) => render(n, 0, i, a.length))}</div>
        </div>
      </section>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.isNew ? 'เพิ่ม Path' : 'แก้ไข Path'}
        footer={<><Button onClick={() => setEdit(null)}>ยกเลิก</Button><Button variant="primary" disabled={!edit?.node.name || !edit?.node.path} onClick={save}>บันทึก</Button></>}>
        {edit && (
          <>
            {edit.isNew && <Field label="Path แม่"><Select value={edit.parentId} onChange={(e) => setEdit({ ...edit, parentId: e.target.value })} options={flat(tree).map((n) => ({ value: n.id, label: `${n.name} (/${n.path})` }))} /></Field>}
            <Field label="ชื่อ Path (แสดงใน Breadcrumb)" required><Input value={edit.node.name} onChange={(e) => setEdit({ ...edit, node: { ...edit.node, name: e.target.value } })} /></Field>
            <Field label="Slug / Path" required hint="ใช้ a-z, 0-9 และ - เท่านั้น"><Input value={edit.node.path} onChange={(e) => setEdit({ ...edit, node: { ...edit.node, path: e.target.value.toLowerCase().replace(/[^a-z0-9/-]/g, '') } })} /></Field>
            <div className="grid-2">
              <Field label="ประเภท"><Select value={edit.node.kind} onChange={(e) => setEdit({ ...edit, node: { ...edit.node, kind: e.target.value as Kind } })} options={['Specific Path', 'Landing']} /></Field>
              <Field label="Layout"><Select value={edit.node.layout ?? 'ใช้ Layout ตั้งต้นของหมวด'} onChange={(e) => setEdit({ ...edit, node: { ...edit.node, layout: e.target.value } })} options={['ใช้ Layout ตั้งต้นของหมวด', 'Homepage', 'Product Detail', 'Promotion Detail', 'Landing Campaign', 'Article']} /></Field>
            </div>
            <div className="info-soft t-sm">ระบบสร้าง Redirect 301 จาก Path เดิมอัตโนมัติเมื่อเปลี่ยน Slug เพื่อไม่ให้เสียอันดับ SEO</div>
          </>
        )}
      </Modal>
      <Modal open={!!del} onClose={() => setDel(null)} title="ลบ Path?" footer={<><Button onClick={() => setDel(null)}>ยกเลิก</Button><Button variant="danger" onClick={() => { setTree(map(tree, (n) => (n.id === del?.id ? null : n))); toast('ย้าย Path ไป Recycle Bin แล้ว', del?.name); setDel(null); }}>ย้ายไป Recycle Bin</Button></>}>
        <p className="t-secondary">“{del?.name}” (/{del?.path}){del?.children?.length ? ` และ Path ย่อย ${flat(del.children).length} รายการ` : ''} จะถูกย้ายไป Recycle Bin · หน้าเว็บที่ใช้ Path นี้จะแสดง 404 จนกว่าจะกู้คืน</p>
      </Modal>
    </>
  );
}
