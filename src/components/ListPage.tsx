import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Button, Field, Input, Select, Pager, PageHeader } from './ui';

export interface Column<T> {
  key: string;
  label: ReactNode;
  render: (row: T) => ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
}

export interface FilterDef<T> {
  key: string;
  label: string;
  /** text = substring search, select = exact match against options */
  kind: 'text' | 'select';
  options?: string[];
  placeholder?: string;
  match: (row: T, value: string) => boolean;
}

interface ListPageProps<T> {
  title: ReactNode;
  sub?: ReactNode;
  headerActions?: ReactNode;
  banner?: ReactNode;
  filters?: FilterDef<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  columns: Column<T>[];
  toolbar?: ReactNode;
  toolbarRight?: ReactNode;
  above?: ReactNode;
  empty?: ReactNode;
  pageSize?: number;
  rowClass?: (row: T) => string;
  footerNote?: ReactNode;
  children?: ReactNode;
}

/* Shared list template: filter bar → card (toolbar · table · pager). Matches CS-02 / CMS-17 / CMS-20 etc. */
export default function ListPage<T>({
  title, sub, headerActions, banner, filters = [], rows, rowKey, columns, toolbar, toolbarRight, above, empty = 'ไม่พบรายการ', pageSize = 10, rowClass, footerNote, children,
}: ListPageProps<T>) {
  const init = Object.fromEntries(filters.map((f) => [f.key, f.kind === 'select' ? (f.options?.[0] ?? '') : '']));
  const [draft, setDraft] = useState<Record<string, string>>(init);
  const [applied, setApplied] = useState<Record<string, string>>(init);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);

  const list = useMemo(
    () =>
      rows.filter((r) =>
        filters.every((f) => {
          const v = applied[f.key];
          if (!v || (f.kind === 'select' && v === f.options?.[0])) return true;
          return f.match(r, v);
        }),
      ),
    [rows, filters, applied],
  );
  const pages = Math.max(1, Math.ceil(list.length / size));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * size, cur * size);

  return (
    <>
      <PageHeader title={title} sub={sub} actions={headerActions} />
      {banner}
      {filters.length > 0 && (
        <form
          className="filter-bar"
          style={{ gridTemplateColumns: `repeat(${filters.length}, minmax(0, 1fr)) auto` }}
          onSubmit={(e) => {
            e.preventDefault();
            setApplied(draft);
            setPage(1);
          }}
        >
          {filters.map((f) => (
            <Field key={f.key} label={f.label}>
              {f.kind === 'text' ? (
                <Input placeholder={f.placeholder} value={draft[f.key]} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
              ) : (
                <Select value={draft[f.key]} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} options={f.options ?? []} />
              )}
            </Field>
          ))}
          <Button variant="primary" icon={Search} type="submit">Search</Button>
        </form>
      )}
      <section className="card">
        {(toolbar || toolbarRight) && (
          <div className="row-between" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>{toolbar}</div>
            {toolbarRight}
          </div>
        )}
        {above}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} style={{ width: c.width, textAlign: c.align }}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={rowKey(r)} className={rowClass?.(r)}>
                  {columns.map((c) => (
                    <td key={c.key} style={{ textAlign: c.align }}>{c.render(r)}</td>
                  ))}
                </tr>
              ))}
              {!shown.length && (
                <tr><td colSpan={columns.length} className="t-tertiary" style={{ textAlign: 'center', padding: 40 }}>{empty}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="row-between mt-16" style={{ flexWrap: 'wrap' }}>
          <div className="row">
            <span>Show rows</span>
            <select className="select" style={{ width: 70, padding: '6px 30px 6px 10px', backgroundPosition: 'right 8px center' }} value={size} onChange={(e) => { setSize(+e.target.value); setPage(1); }}>
              {[5, 10, 20].map((n) => <option key={n}>{n}</option>)}
            </select>
            <span>Show {list.length ? (cur - 1) * size + 1 : 0} - {Math.min(cur * size, list.length)} of {list.length}</span>
          </div>
          <Pager page={cur} pages={pages} onChange={setPage} />
        </div>
        {footerNote && <p className="t-sm t-secondary mt-8">{footerNote}</p>}
      </section>
      {children}
    </>
  );
}

/* Helpers for common filter shapes */
export const textFilter = <T,>(key: string, label: string, get: (r: T) => string, placeholder?: string): FilterDef<T> => ({
  key, label, kind: 'text', placeholder, match: (r, v) => get(r).toLowerCase().includes(v.toLowerCase()),
});
export const selectFilter = <T,>(key: string, label: string, options: string[], get: (r: T) => string): FilterDef<T> => ({
  key, label, kind: 'select', options: ['All', ...options], match: (r, v) => get(r) === v,
});
