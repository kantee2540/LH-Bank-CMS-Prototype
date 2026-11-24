import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button, Field, Input, Modal, Select } from '../components/ui';
import { useStore } from '../store';
import type { TopList } from '../types';
import { MONTHS, VISITOR_SERIES, TOP_LISTS } from '../data/mock';
import icUsers from '../assets/figma/stats/users.svg';
import icLayout from '../assets/figma/stats/layout.svg';
import icGift from '../assets/figma/stats/gift.svg';
import icLayers from '../assets/figma/stats/layers.svg';
import icFile from '../assets/figma/stats/file.svg';
import icTrending from '../assets/figma/stats/trending.svg';
import icHelp from '../assets/figma/stats/help.svg';
import icBuilding from '../assets/figma/stats/building.svg';
import icMegaphone from '../assets/figma/stats/megaphone.svg';
import icDownload from '../assets/figma/stats/download.svg';
import icChat from '../assets/figma/stats/chat.svg';
import icUsersGreen from '../assets/figma/stats/users-green.svg';
import icPercent from '../assets/figma/stats/percent.svg';
import icSearchBtn from '../assets/figma/ui/btn-search.svg';
import icExportBtn from '../assets/figma/ui/btn-export.svg';
import './dashboard.css';

/* Stats Card — colors from Figma "Row – Summary" */
const STATS = [
  { label: 'หน้าเพจ', value: 128, icon: icLayout, bg: 'rgba(59,130,196,0.14)' },
  { label: 'โปรโมชัน', value: 24, icon: icGift, bg: 'rgba(217,87,122,0.14)' },
  { label: 'ผลิตภัณฑ์', value: 46, icon: icLayers, bg: 'rgba(139,92,199,0.14)' },
  { label: 'ข่าวสาร', value: 132, icon: icFile, bg: 'rgba(224,123,57,0.14)' },
  { label: 'Advisory', value: 96, icon: icTrending, bg: 'rgba(46,158,106,0.14)' },
  { label: 'คำถามที่พบบ่อย', value: 58, icon: icHelp, bg: 'rgba(209,154,30,0.14)' },
  { label: 'ทรัพย์ NPA', value: 48, icon: icBuilding, bg: 'rgba(31,154,168,0.14)' },
  { label: 'Banner', value: 12, icon: icMegaphone, bg: 'rgba(224,98,90,0.14)' },
  { label: 'เอกสารดาวน์โหลด', value: 241, icon: icDownload, bg: 'rgba(91,108,214,0.14)' },
  { label: 'รายการติดต่อกลับ', value: 96, icon: icChat, bg: 'rgba(42,147,201,0.14)' },
  { label: 'ช่วงชีวิต', value: 5, icon: icUsersGreen, bg: 'rgba(106,158,46,0.14)' },
  { label: 'อัตราดอกเบี้ย', value: 7, icon: icPercent, bg: 'rgba(181,80,158,0.14)' },
];
const MINI_BARS = [30, 26, 34, 32, 40, 38, 46, 50, 42, 56];

type Range = 'month' | 'week' | 'day';

const RANGES: Record<Range, { labels: string[]; factor: number }> = {
  month: { labels: MONTHS, factor: 1 },
  week: { labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'], factor: 0.24 },
  day: { labels: Array.from({ length: 12 }, (_, i) => `${i + 1}/11`), factor: 0.034 },
};

function VisitorChart() {
  const [range, setRange] = useState<Range>('month');
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [hover, setHover] = useState<number | null>(9);
  const { labels, factor } = RANGES[range];
  const W = 1060, H = 310, padL = 66, padB = 34, padT = 10;
  const max = 1500 * factor;
  const x = (i: number) => padL + (i * (W - padL - 20)) / (labels.length - 1);
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max);
  const ticks = [0, 500, 1000, 1500].map((t) => Math.round(t * factor));
  const series = VISITOR_SERIES.map((s) => ({ ...s, data: s.data.map((v) => Math.round(v * factor)) }));
  const all = series[0];

  return (
    <section className="card">
      <div className="row-between">
        <h3 className="card-title">ผู้เข้าเยี่ยมชมเว็บไซต์ราย{range === 'month' ? 'เดือน' : range === 'week' ? 'สัปดาห์' : 'วัน'}</h3>
        <div className="seg">
          {([['month', 'รายเดือน'], ['week', 'รายสัปดาห์'], ['day', 'รายวัน']] as [Range, string][]).map(([k, l]) => (
            <button key={k} className={range === k ? 'on' : ''} onClick={() => setRange(k)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="legend">
        {series.map((s) => (
          <button key={s.key} className={hidden[s.key] ? 'off' : ''} onClick={() => setHidden((h) => ({ ...h, [s.key]: !h[s.key] }))}>
            <i style={{ background: s.color }} />
            {s.label}
          </button>
        ))}
      </div>
      <div className="chart-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="chart" onMouseLeave={() => setHover(9)}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke="#eef0f2" />
              <text x={padL - 14} y={y(t) + 5} textAnchor="end" className="axis">{t.toLocaleString()}</text>
            </g>
          ))}
          {labels.map((l, i) => (
            <text key={l} x={x(i)} y={H - 6} textAnchor="middle" className="axis">{l}</text>
          ))}
          {series.filter((s) => !hidden[s.key]).map((s) => (
            <g key={s.key}>
              <polyline fill="none" stroke={s.color} strokeWidth={s.width || 1.6} points={s.data.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
              {s.data.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r={s.width ? 3.5 : 2} fill={s.color} stroke="#fff" strokeWidth="1" />
              ))}
            </g>
          ))}
          {all.data.map((_, i) => (
            <rect key={i} x={x(i) - 20} y={0} width={40} height={H - padB} fill="transparent" onMouseEnter={() => setHover(i)} />
          ))}
        </svg>
        {hover != null && (
          <div className="chart-tip" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(all.data[hover]) / H) * 100}%` }}>
            <b>{labels[hover]} {range === 'month' ? '2569' : ''}</b>
            <div>All Website Visitors: {all.data[hover].toLocaleString()}</div>
            <div>หน้าเพจ: {series[1].data[hover]} · ผลิตภัณฑ์: {series[2].data[hover]}</div>
          </div>
        )}
      </div>
      <p className="t-secondary" style={{ fontSize: 15, marginTop: 8 }}>* ข้อมูลตัวอย่างสำหรับงานออกแบบ — ข้อมูลจริงดึงจากระบบ Analytics</p>
    </section>
  );
}

/* NEW — Popup "ดูทั้งหมด" ของการ์ดอันดับบน Dashboard */
function TopListModal({ list, period, onClose }: { list: TopList | null; period: string; onClose: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const all = list ? [...list.rows, ...(list.more ?? [])] : [];
  const total = all.reduce((s, [, v]) => s + v, 0);
  const shown = all.map(([k, v], i) => ({ rank: i + 1, k, v })).filter((r) => r.k.toLowerCase().includes(q.trim().toLowerCase()));
  const close = () => { setQ(''); onClose(); };
  return (
    <Modal
      open={!!list}
      onClose={close}
      width={720}
      title={list ? `${list.title} — ทั้งหมด` : ''}
      footer={
        <>
          {list?.link && <Button icon={ArrowRight} onClick={() => { close(); navigate(list.link!.to); }}>ไปที่เมนู {list.link.label}</Button>}
          <Button variant="primary" onClick={close}>ปิด</Button>
        </>
      }
    >
      <div className="row-between" style={{ gap: 12, alignItems: 'flex-end' }}>
        <span className="t-secondary">{period} · ทั้งหมด {all.length} รายการ · รวม {total.toLocaleString()} {list?.unit ?? ''}</span>
        <Field label="ค้นหา" style={{ width: 240 }}><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="พิมพ์ชื่อรายการ" /></Field>
      </div>
      <div className="table-wrap" style={{ maxHeight: 420, overflow: 'auto' }}>
        <table className="table">
          <thead><tr><th className="col-no">ลำดับ</th><th>รายการ</th><th style={{ textAlign: 'right' }}>จำนวน{list?.unit ? ` (${list.unit})` : ''}</th><th style={{ width: 200 }}>สัดส่วน</th></tr></thead>
          <tbody>
            {shown.map((r) => {
              const pct = total ? (r.v / total) * 100 : 0;
              return (
                <tr key={r.k}>
                  <td className="col-no">{r.rank}</td>
                  <td>{r.k}</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>{r.v.toLocaleString()}</td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <div className="share-bar"><i style={{ width: `${pct}%` }} /></div>
                      <span className="t-sm t-secondary" style={{ minWidth: 44, textAlign: 'right' }}>{pct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!shown.length && <tr><td colSpan={4} className="t-tertiary" style={{ textAlign: 'center', padding: 32 }}>ไม่พบรายการที่ตรงกับคำค้นหา</td></tr>}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

export default function Dashboard() {
  const [mode, setMode] = useState('ข้อมูลปี');
  const [year, setYear] = useState('2569');
  const [openList, setOpenList] = useState<TopList | null>(null);
  const { toast } = useStore();
  return (
    <>
      <div className="row-between dash-head">
        <h1 className="t-h1">Dashboard</h1>
        <div className="row" style={{ alignItems: 'flex-end', gap: 10 }}>
          <Field label="ช่วงข้อมูล" style={{ width: 170 }}>
            <Select value={mode} onChange={(e) => setMode(e.target.value)} options={['ข้อมูลปี', 'ข้อมูลเดือน', 'ข้อมูลสัปดาห์']} />
          </Field>
          <Field label="ปี" style={{ width: 120 }}>
            <Select value={year} onChange={(e) => setYear(e.target.value)} options={['2569', '2568', '2567']} />
          </Field>
          <button className="btn btn-primary" onClick={() => toast('เรียกดูข้อมูลแล้ว', `${mode} · ปี ${year}`)}>
            <img src={icSearchBtn} alt="" width="18" height="18" /> เรียกดูข้อมูล
          </button>
          <button className="btn btn-secondary" style={{ height: 44 }} onClick={() => toast('ส่งออกข้อมูลแล้ว', `dashboard-${year}.xlsx`)}>
            <img src={icExportBtn} alt="" width="18" height="18" /> ส่งออกข้อมูล
          </button>
        </div>
      </div>

      <div className="dash-summary">
        <section className="card visitors">
          <div className="row" style={{ gap: 16 }}>
            <div className="circle-64">
              <img src={icUsers} alt="" width="32" height="32" />
            </div>
            <div>
              <p className="t-body-l t-secondary">ผู้เข้าเยี่ยมชมเว็บไซต์ (ปี {year})</p>
              <p className="big-num">10,117</p>
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className="trend-up">▲ 20.1%</span>
            <span className="t-tertiary">เทียบเดือนก่อน (ต.ค. 1,297 ราย)</span>
          </div>
          <div className="mini-bars">
            {MINI_BARS.map((h, i) => <span key={i} style={{ height: h }} />)}
          </div>
        </section>
        <section className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>สถิติเนื้อหา</h3>
          <div className="stats-grid">
            {STATS.map((s) => (
              <div className="stat" key={s.label}>
                <div className="circle-48" style={{ background: s.bg }}>
                  <img src={s.icon} alt="" width="22" height="22" />
                </div>
                <div>
                  <p className="t-secondary">{s.label}</p>
                  <p className="t-h3">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <VisitorChart />

      <div className="grid-2">
        {TOP_LISTS.map((l) => (
          <section className="card top-list" key={l.title}>
            <div className="row-between top-list-head">
              <h3 className="card-title">{l.title}</h3>
              <button type="button" className="t-link link-btn" onClick={() => setOpenList(l)}>ดูทั้งหมด</button>
            </div>
            {l.rows.map(([k, v]) => (
              <div className="row-between top-row" key={k}>
                <span className="t-secondary">{k}</span>
                <span style={{ fontWeight: 500 }}>{v.toLocaleString()}</span>
              </div>
            ))}
          </section>
        ))}
      </div>
      <TopListModal list={openList} period={`${mode} ${year}`} onClose={() => setOpenList(null)} />
    </>
  );
}
