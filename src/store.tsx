import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { CONTENTS, TRASH, REQUESTS, VERSIONS } from './data/mock';
import type { ContentItem, RequestItem, Role, SubmitContentInput, Toast, TrashItem, VersionItem } from './types';

interface Store {
  contents: ContentItem[];
  trash: TrashItem[];
  requests: RequestItem[];
  versions: VersionItem[];
  toasts: Toast[];
  site: string;
  setSite: Dispatch<SetStateAction<string>>;
  role: Role;
  setRole: Dispatch<SetStateAction<Role>>;
  toast: (title: string, desc?: string) => void;
  moveContentToTrash: (id: number) => void;
  restoreFromTrash: (ids: string[]) => void;
  deleteForever: (ids: string[]) => void;
  submitContent: (data: SubmitContentInput) => void;
  restoreVersion: (from: string, parts: string[]) => void;
  submitRequest: (r: { title: string; module: string; sub: string; auditor?: string; publish?: string }) => void;
  decideRequest: (id: string, decision: 'approve-now' | 'approve-schedule' | 'reject', note?: string) => void;
}

const StoreCtx = createContext<Store | null>(null);

const now = (): string => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

/* Simple in-memory store so flows (create → submit → request status, delete → trash → restore) work end-to-end */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [contents, setContents] = useState<ContentItem[]>(CONTENTS);
  const [trash, setTrash] = useState<TrashItem[]>(TRASH);
  const [requests, setRequests] = useState<RequestItem[]>(REQUESTS);
  const [versions, setVersions] = useState<VersionItem[]>(VERSIONS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [site, setSite] = useState('เว็บไซต์ LH Bank (Personal)');
  const [role, setRole] = useState<Role>('Content Editor');

  const toast = useCallback((title: string, desc?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, title, desc }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const moveContentToTrash = useCallback((id: number) => {
    const item = contents.find((c) => c.id === id);
    if (!item) return;
    setContents((list) => list.filter((c) => c.id !== id));
    setTrash((t) => [
      { id: `c${id}`, title: item.title, sub: `${item.type} · ${item.path}`, module: 'Page Builder', group: 'Content', by: `${role} · ${now()}`, days: 30, origin: item },
      ...t,
    ]);
  }, [contents, role]);

  const restoreFromTrash = useCallback((ids: string[]) => {
    const back = trash
      .filter((x): x is TrashItem & { origin: ContentItem } => ids.includes(x.id) && !!x.origin)
      .map((x): ContentItem => ({ ...x.origin, status: 'Draft', updated: now() }));
    if (back.length) setContents((c) => [...back, ...c]);
    setTrash((t) => t.filter((x) => !ids.includes(x.id)));
  }, [trash]);

  const deleteForever = useCallback((ids: string[]) => setTrash((t) => t.filter((x) => !ids.includes(x.id))), []);

  const submitContent = useCallback((data: SubmitContentInput) => {
    const id = Date.now();
    const ts = now();
    setContents((c) => [{ id, title: data.title, langs: 'TH · EN · 中文', type: data.type, path: data.path, status: 'Draft', pending: true, updated: ts }, ...c]);
    setRequests((r) => [
      { id: `r${id}`, title: data.title, sub: `${data.type} · ส่งใหม่`, module: data.type, auditor: data.auditor, sent: `${ts.slice(0, 5)} ${ts.slice(11)}`, publish: data.publish, state: 'Queue', tab: 'pending', fresh: true },
      ...r,
    ]);
  }, []);

  const restoreVersion = useCallback((from: string, parts: string[]) => {
    setVersions((v) => [
      { v: `v${v.length + 1}`, status: 'Draft', summary: `กู้คืนจาก ${from} (${parts.join(', ')})`, by: role, date: now().slice(0, 10), draft: true },
      ...v,
    ]);
  }, [role]);

  const submitRequest = useCallback((r: { title: string; module: string; sub: string; auditor?: string; publish?: string }) => {
    const ts = now();
    setRequests((list) => [
      { id: `r${Date.now()}`, title: r.title, sub: r.sub, module: r.module, auditor: r.auditor ?? 'Auditor – Marketing', sent: `${ts.slice(0, 5)} ${ts.slice(11)}`, publish: r.publish ?? 'ทันที', state: 'Queue', tab: 'pending', fresh: true },
      ...list,
    ]);
  }, []);

  const decideRequest = useCallback((id: string, decision: 'approve-now' | 'approve-schedule' | 'reject', note?: string) => {
    setRequests((list) => list.map((r) => (r.id === id
      ? decision === 'reject'
        ? { ...r, state: 'Rejected', tab: 'rejected', sub: `${r.module} · ส่งกลับ: ${note ?? 'ต้องแก้ไข'}`, fresh: false }
        : { ...r, state: decision === 'approve-now' ? 'Published' : 'Scheduled', tab: 'approved', sub: `${r.module} · อนุมัติแล้ว`, fresh: false }
      : r)));
  }, []);

  const value = useMemo<Store>(
    () => ({ contents, trash, requests, versions, toasts, site, setSite, role, setRole, toast, moveContentToTrash, restoreFromTrash, deleteForever, submitContent, restoreVersion, submitRequest, decideRequest }),
    [contents, trash, requests, versions, toasts, site, role, toast, moveContentToTrash, restoreFromTrash, deleteForever, submitContent, restoreVersion, submitRequest, decideRequest],
  );
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): Store {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
